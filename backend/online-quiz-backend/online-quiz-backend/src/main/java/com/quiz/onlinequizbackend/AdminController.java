
package com.quiz.onlinequizbackend;

import com.quiz.onlinequizbackend.entity.Question;
import com.quiz.onlinequizbackend.repository.QuestionRepository;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://localhost:5174",
                "https://online-quiz-exam-system.vercel.app"
        },
        allowCredentials = "true"
)
public class AdminController {

    private final QuestionRepository questionRepository;

    public AdminController(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    private boolean isAdmin(HttpSession session) {
        return Boolean.TRUE.equals(session.getAttribute("isAdmin"));
    }

    @GetMapping("/questions")
    public ResponseEntity<?> getQuestions(HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Admin login required."));
        }

        return ResponseEntity.ok(questionRepository.findAll());
    }

    @PostMapping("/questions")
    public ResponseEntity<?> addQuestion(
            @RequestBody Question question,
            HttpSession session) {

        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Admin login required."));
        }

        if (question.getQuestionText() == null
                || question.getQuestionText().isBlank()
                || question.getOptionA() == null
                || question.getOptionB() == null
                || question.getOptionC() == null
                || question.getOptionD() == null
                || question.getCorrectAnswer() == null
                || !List.of("A", "B", "C", "D").contains(
                question.getCorrectAnswer().trim().toUpperCase())) {

            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Enter the question, all four options, and a correct answer of A, B, C, or D."));
        }

        question.setCorrectAnswer(
                question.getCorrectAnswer().trim().toUpperCase());

        Question saved = questionRepository.save(question);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<?> deleteQuestion(
            @PathVariable Long id,
            HttpSession session) {

        if (!isAdmin(session)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Admin login required."));
        }

        if (!questionRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Question not found."));
        }

        questionRepository.deleteById(id);

        return ResponseEntity.ok(
                Map.of("message", "Question deleted successfully."));
    }
}
