package com.homestay.backend.config;

import com.homestay.backend.entity.Admin;
import com.homestay.backend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates a default admin user on first startup if none exists.
 * Override the default credentials via ADMIN_USERNAME / ADMIN_PASSWORD env vars before going to production.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-username:admin}")
    private String defaultUsername;

    @Value("${app.admin.default-password:admin123}")
    private String defaultPassword;

    public DataSeeder(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminRepository.findByUsername(defaultUsername).isEmpty()) {
            Admin admin = Admin.builder()
                    .username(defaultUsername)
                    .password(passwordEncoder.encode(defaultPassword))
                    .role("ADMIN")
                    .build();
            adminRepository.save(admin);
            System.out.println("==> Default admin created. Username: " + defaultUsername
                    + " | Password: " + defaultPassword + " (CHANGE THIS IN PRODUCTION)");
        }
    }
}
