
package com.quiz.onlinequizbackend;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin-auth")
@CrossOrigin(
        origins = "http://localhost:5174",
        allowCredentials = "true"
)
public class AdminAuthController {

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request,
            HttpSession session) {

        String username = request.get("username");
        String password = request.get("password");

        if (username == null || password == null
                || !adminUsername.equals(username.trim())
                || !adminPassword.equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message",
                            "Invalid admin username or password."));
        }

        session.setAttribute("isAdmin", true);

        return ResponseEntity.ok(
                Map.of("message", "Admin login successful."));
    }

    @GetMapping("/check")
    public ResponseEntity<?> check(HttpSession session) {
        if (!Boolean.TRUE.equals(session.getAttribute("isAdmin"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Admin login required."));
        }

        return ResponseEntity.ok(
                Map.of("message", "Admin session is active."));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();

        return ResponseEntity.ok(
                Map.of("message", "Admin logged out."));
    }
}
