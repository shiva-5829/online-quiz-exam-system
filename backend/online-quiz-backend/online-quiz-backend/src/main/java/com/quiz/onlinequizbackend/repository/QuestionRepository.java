package com.quiz.onlinequizbackend.repository;

import com.quiz.onlinequizbackend.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository
        extends JpaRepository<Question, Long> {
}
