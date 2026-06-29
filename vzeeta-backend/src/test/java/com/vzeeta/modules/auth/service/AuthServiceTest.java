package com.vzeeta.modules.auth.service;

import com.vzeeta.modules.auth.dto.LoginRequest;
import com.vzeeta.modules.auth.dto.RegisterRequest;
import com.vzeeta.modules.patient.repository.PatientRepository;
import com.vzeeta.modules.user.entity.User;
import com.vzeeta.modules.user.repository.UserRepository;
import com.vzeeta.shared.enums.UserRole;
import com.vzeeta.shared.exception.AppException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthServiceTest {

    @Autowired private AuthService authService;
    @Autowired private UserRepository userRepository;
    @Autowired private PatientRepository patientRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Test
    void registerAndLogin_patient_success() {
        RegisterRequest register = new RegisterRequest();
        register.setEmail("testpatient@tabeebi.com");
        register.setPassword("password123");
        register.setFullNameAr("مريض تجريبي");
        register.setFullNameEn("Test Patient");
        register.setRole(UserRole.PATIENT);

        var response = authService.register(register);
        assertNotNull(response.getAccessToken());
        assertEquals("PATIENT", response.getUser().getRole());

        LoginRequest login = new LoginRequest();
        login.setEmail("testpatient@tabeebi.com");
        login.setPassword("password123");
        var loginResponse = authService.login(login);
        assertNotNull(loginResponse.getAccessToken());
        assertEquals("testpatient@tabeebi.com", loginResponse.getUser().getEmail());
    }

    @Test
    void login_invalidPassword_throws() {
        User user = User.builder()
                .email("fail@tabeebi.com")
                .passwordHash(passwordEncoder.encode("secret"))
                .fullNameAr("Test")
                .role(UserRole.PATIENT)
                .active(true)
                .build();
        userRepository.save(user);

        LoginRequest login = new LoginRequest();
        login.setEmail("fail@tabeebi.com");
        login.setPassword("wrong");
        assertThrows(AppException.class, () -> authService.login(login));
    }
}
