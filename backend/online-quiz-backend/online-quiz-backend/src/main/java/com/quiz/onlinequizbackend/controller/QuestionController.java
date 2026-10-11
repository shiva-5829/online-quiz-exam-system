
package com.quiz.onlinequizbackend.controller;

import com.quiz.onlinequizbackend.dto.QuestionResponse;
import com.quiz.onlinequizbackend.dto.QuizResult;
import com.quiz.onlinequizbackend.dto.QuizSubmission;
import com.quiz.onlinequizbackend.entity.Question;
import com.quiz.onlinequizbackend.repository.QuestionRepository;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:5174")
public class QuestionController {

    private final QuestionRepository questionRepository;

    public QuestionController(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    // Add a question
    @PostMapping
    public Question addQuestion(@RequestBody Question question) {
        return questionRepository.save(question);
    }

    // Get all questions without exposing correct answers
    @GetMapping
    public List<QuestionResponse> getAllQuestions() {
        return questionRepository.findAll()
                .stream()
                .map(question -> new QuestionResponse(
                        question.getId(),
                        question.getQuestionText(),
                        question.getOptionA(),
                        question.getOptionB(),
                        question.getOptionC(),
                        question.getOptionD()
                ))
                .toList();
    }

    // Submit quiz and calculate the result
    @PostMapping("/submit")
    public QuizResult submitQuiz(
            @RequestBody QuizSubmission submission) {

        List<Question> questions = questionRepository.findAll();

        Map<Long, String> answers =
                submission == null ? null : submission.answers();

        int totalQuestions = questions.size();
        int correctAnswers = 0;

        for (Question question : questions) {

            String submittedAnswer = (answers == null)
                    ? null
                    : answers.get(question.getId());

            String correctAnswer = question.getCorrectAnswer();

            if (submittedAnswer != null
                    && correctAnswer != null
                    && submittedAnswer.trim()
                    .equalsIgnoreCase(correctAnswer.trim())) {
                correctAnswers++;
            }
        }

        int wrongAnswers = totalQuestions - correctAnswers;

        double percentage = totalQuestions == 0
                ? 0.0
                : (correctAnswers * 100.0) / totalQuestions;

        return new QuizResult(
                totalQuestions,
                correctAnswers,
                wrongAnswers,
                percentage
        );
    }
}
