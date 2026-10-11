
package com.quiz.onlinequizbackend.dto;

import java.util.Map;

public record QuizSubmission(
        Map<Long, String> answers
) {
}
