package com.vzeeta.modules.auth.service;

import com.vzeeta.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        String resolvedEmail = "admin".equalsIgnoreCase(email) ? "superadmin@tabeebi.com" : email;
        return userRepository.findByEmail(resolvedEmail)
                .or(() -> userRepository.findByEmailIgnoreCase(resolvedEmail))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + resolvedEmail));
    }
}
