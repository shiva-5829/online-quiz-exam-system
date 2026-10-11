
package com.quiz.onlinequizbackend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://localhost:5174",
        "https://online-quiz-exam-system-41kdmti76-shiva-abf2.vercel.app"
})
public class AuthController {

    private final StudentRepository repository;

    private final BCryptPasswordEncoder encoder =
            new BCryptPasswordEncoder();

    public AuthController(StudentRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody Map<String, String> request) {

        String name = request.get("name");
        String email = request.get("email");
        String password = request.get("password");

        if (name == null || name.isBlank()
                || email == null || email.isBlank()
                || password == null || password.length() < 8) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Enter your name and email, and a password of at least 8 characters."
                    )
            );
        }

        email = email.trim().toLowerCase();

        if (repository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    Map.of(
                            "message",
                            "This email is already registered."
                    )
            );
        }

        Student student = new Student();
        student.setName(name.trim());
        student.setEmail(email);
        student.setPasswordHash(encoder.encode(password));

        Student saved = repository.save(student);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(studentResponse(saved));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String password = request.get("password");

        if (email == null || email.isBlank()
                || password == null || password.isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Email and password are required."
                    )
            );
        }

        Student student = repository
                .findByEmail(email.trim().toLowerCase())
                .orElse(null);

        if (student == null
                || !encoder.matches(
                password,
                student.getPasswordHash())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    "Invalid email or password."
                            )
                    );
        }

        return ResponseEntity.ok(studentResponse(student));
    }

    private Map<String, Object> studentResponse(Student student) {
        Map<String, Object> response = new LinkedHashMap<>();

        response.put("id", student.getId());
        response.put("name", student.getName());
        response.put("email", student.getEmail());

        return response;
    }
}
