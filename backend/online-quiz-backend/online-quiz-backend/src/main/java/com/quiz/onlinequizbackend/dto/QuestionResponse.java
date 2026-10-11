
package com.quiz.onlinequizbackend.dto;

public record QuestionResponse(
        Long id,
        String questionText,
        String optionA,
        String optionB,
        String optionC,
        String optionD
) {
}
