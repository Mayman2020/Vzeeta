package com.vzeeta.shared.mail;

import com.vzeeta.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Delivers password-reset links via SMTP when configured; logs token in dev when mail is off.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetDeliveryService {

    private final EmailService emailService;

    @Value("${vzeeta.password-reset.base-url:}")
    private String resetBaseUrl;

    public void deliver(User user, String token) {
        if (user == null || token == null || token.isBlank()) {
            return;
        }
        String resetLink = buildResetLink(token);
        String subject = "Password reset request";
        String body = """
                You requested a password reset.

                Open this link within 24 hours:
                %s

                If you did not request this, ignore this email.
                """.formatted(resetLink);

        boolean sent = emailService.sendOptional(user.getEmail(), subject, body);
        if (!sent) {
            log.info("Password reset for {} (mail disabled) - token logged for dev: {}", user.getEmail(), token);
            log.debug("Password reset link: {}", resetLink);
        }
    }

    private String buildResetLink(String token) {
        String base = resetBaseUrl != null ? resetBaseUrl.trim() : "";
        if (base.isEmpty()) {
            return token;
        }
        String separator = base.contains("?") ? "&" : "?";
        return base + separator + "token=" + token;
    }
}
