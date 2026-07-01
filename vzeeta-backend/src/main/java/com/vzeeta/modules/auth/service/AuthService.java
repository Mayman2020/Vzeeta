package com.vzeeta.modules.auth.service;

import com.vzeeta.modules.auth.dto.*;
import com.vzeeta.modules.auth.entity.PasswordResetToken;
import com.vzeeta.modules.auth.repository.PasswordResetTokenRepository;
import com.vzeeta.modules.clinic.entity.ClinicAdmin;
import com.vzeeta.modules.clinic.repository.ClinicAdminRepository;
import com.vzeeta.modules.doctor.entity.Doctor;
import com.vzeeta.modules.doctor.repository.DoctorRepository;
import com.vzeeta.modules.patient.entity.Patient;
import com.vzeeta.modules.patient.repository.PatientRepository;
import com.vzeeta.modules.user.dto.ChangePasswordRequest;
import com.vzeeta.modules.user.dto.UserProfileUpdateRequest;
import com.vzeeta.modules.user.entity.User;
import com.vzeeta.modules.user.repository.UserRepository;
import com.vzeeta.shared.enums.UserRole;
import com.vzeeta.shared.exception.AppException;
import com.vzeeta.shared.mail.PasswordResetDeliveryService;
import com.vzeeta.shared.security.JwtUtil;
import com.vzeeta.shared.security.TokenBlacklistService;
import com.vzeeta.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final ClinicAdminRepository clinicAdminRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final TokenBlacklistService tokenBlacklist;
    private final PasswordEncoder passwordEncoder;
    private final MessageSource messageSource;
    private final PasswordResetDeliveryService passwordResetDeliveryService;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${user.default.password}")
    private String defaultPassword;

    private String msg(String code) {
        return messageSource.getMessage(code, null, code, LocaleContextHolder.getLocale());
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User resolved = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> AppException.badRequest(msg("auth.error.invalid_credentials")));
        if (!resolved.isActive()) {
            throw AppException.badRequest(msg("auth.error.account_inactive"));
        }
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(resolved.getEmail(), request.getPassword()));
            User user = (User) auth.getPrincipal();
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
            return buildResponse(user);
        } catch (DisabledException e) {
            throw AppException.badRequest(msg("auth.error.account_inactive"));
        } catch (BadCredentialsException e) {
            throw AppException.badRequest(msg("auth.error.invalid_credentials"));
        }
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw AppException.conflict(msg("error.email_conflict"), "EMAIL_ALREADY_USED");
        }
        UserRole role = request.getRole() != null ? request.getRole() : UserRole.PATIENT;
        if (role != UserRole.PATIENT && role != UserRole.DOCTOR) {
            throw AppException.badRequest(msg("auth.error.invalid_role"));
        }
        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullNameAr(request.getFullNameAr())
                .fullNameEn(request.getFullNameEn())
                .phone(request.getPhone())
                .role(role)
                .active(true)
                .emailVerified(false)
                .build();
        user = userRepository.save(user);
        if (role == UserRole.PATIENT) {
            patientRepository.save(Patient.builder().user(user).build());
        } else if (role == UserRole.DOCTOR) {
            doctorRepository.save(Doctor.builder().user(user).build());
        }
        return buildResponse(user);
    }

    public LoginResponse refresh(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        if (!jwtUtil.isValid(token) || !jwtUtil.isRefreshToken(token)) {
            throw AppException.badRequest(msg("auth.refresh.invalid"));
        }
        User user = userRepository.findByEmail(jwtUtil.extractSubject(token))
                .orElseThrow(() -> AppException.notFound(msg("auth.refresh.user_not_found")));
        if (!user.isActive()) {
            throw AppException.badRequest(msg("auth.error.account_inactive"));
        }
        return buildResponse(user);
    }

    public void logout(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            if (jwtUtil.isValid(token)) {
                tokenBlacklist.revoke(token, jwtUtil.extractExpiration(token).toInstant());
            }
        }
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmailIgnoreCase(request.getEmail()).ifPresent(user -> {
            String token = UUID.randomUUID().toString().replace("-", "");
            passwordResetTokenRepository.save(PasswordResetToken.builder()
                    .user(user)
                    .token(token)
                    .expiresAt(LocalDateTime.now().plusHours(24))
                    .used(false)
                    .build());
            passwordResetDeliveryService.deliver(user, token);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenAndUsedFalse(request.getToken())
                .orElseThrow(() -> AppException.badRequest(msg("auth.reset.invalid_token")));
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw AppException.badRequest(msg("auth.reset.expired_token"));
        }
        User user = resetToken.getUser();
        if (!user.isActive()) {
            throw AppException.badRequest(msg("auth.error.account_inactive"));
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    @Transactional(readOnly = true)
    public LoginResponse.UserDto currentUser() {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> AppException.notFound(msg("auth.refresh.user_not_found")));
        LoginResponse.UserDto.UserDtoBuilder dto = LoginResponse.UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullNameAr(user.getFullNameAr())
                .fullNameEn(user.getFullNameEn())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .profileImage(user.getProfileImage())
                .mustChangePassword(user.isMustChangePassword());
        patientRepository.findByUserId(user.getId()).ifPresent(p -> dto.patientId(p.getId()));
        doctorRepository.findByUserId(user.getId()).ifPresent(d -> dto.doctorId(d.getId()));
        clinicAdminRepository.findByUserId(user.getId()).ifPresent(ca -> dto.clinicId(ca.getClinicId()));
        return dto.build();
    }

    @Transactional
    public LoginResponse.UserDto updateProfileForCurrentUser(UserProfileUpdateRequest request) {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> AppException.notFound(msg("auth.refresh.user_not_found")));
        user.setFullNameAr(request.getFullNameAr().trim());
        user.setFullNameEn(request.getFullNameEn() != null ? request.getFullNameEn().trim() : null);
        user.setPhone(request.getPhone() != null && !request.getPhone().isBlank() ? request.getPhone().trim() : null);
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage().isBlank() ? null : request.getProfileImage().trim());
        }
        userRepository.save(user);
        return currentUser();
    }

    @Transactional
    public void changePasswordForCurrentUser(ChangePasswordRequest request) {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> AppException.notFound(msg("auth.refresh.user_not_found")));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw AppException.badRequest(msg("auth.error.invalid_credentials"));
        }
        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw AppException.badRequest("New password must be different from current password");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public LoginResponse issueTokensForCurrentUser() {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> AppException.notFound(msg("auth.refresh.user_not_found")));
        return buildResponse(user);
    }

    private LoginResponse buildResponse(User user) {
        Map<String, Object> claims = Map.of(
                "role", user.getRole().name(),
                "userId", user.getId(),
                "mustChangePassword", user.isMustChangePassword()
        );
        LoginResponse.UserDto.UserDtoBuilder dto = LoginResponse.UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullNameAr(user.getFullNameAr())
                .fullNameEn(user.getFullNameEn())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .profileImage(user.getProfileImage())
                .mustChangePassword(user.isMustChangePassword());

        patientRepository.findByUserId(user.getId()).ifPresent(p -> dto.patientId(p.getId()));
        doctorRepository.findByUserId(user.getId()).ifPresent(d -> dto.doctorId(d.getId()));
        clinicAdminRepository.findByUserId(user.getId()).ifPresent(ca -> dto.clinicId(ca.getClinicId()));

        return LoginResponse.builder()
                .accessToken(jwtUtil.generateToken(user.getEmail(), claims))
                .refreshToken(jwtUtil.generateRefreshToken(user.getEmail()))
                .tokenType("Bearer")
                .expiresIn(jwtExpiration / 1000)
                .user(dto.build())
                .build();
    }
}
