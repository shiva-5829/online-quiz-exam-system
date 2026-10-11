
package com.quiz.onlinequizbackend.dto;

public record QuizResult(
        int totalQuestions,
        int correctAnswers,
        int wrongAnswers,
        double percentage
) {
}
