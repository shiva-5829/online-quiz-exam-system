import { useState } from "react";
import "./App.css";
import AdminPanel from "./AdminPanel";

const API = "https://online-quiz-exam-system.onrender.com";

export default function App() {
  const [page, setPage] = useState("home");
  const [studentName, setStudentName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [score, setScore] = useState(null);

  async function startQuiz(event) {
    event.preventDefault();

    const name = studentName.trim();

    if (!name) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/api/questions`);

      if (!response.ok) {
        throw new Error("Unable to load quiz questions.");
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No quiz questions are available yet.");
      }

      setStudentName(name);
      setQuestions(data);
      setAnswers({});
      setCurrentQuestion(0);
      setScore(null);
      setPage("quiz");
    } catch (err) {
      setError(
        err.message || "Could not connect to the quiz server."
      );
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(option) {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion]: option,
    }));
  }

  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
    }
  }

  function previousQuestion() {
    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);
    }
  }

  function submitQuiz() {
    const totalScore = questions.reduce((total, question, index) => {
      return total +
        (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    setScore(totalScore);
    setPage("result");
  }

  function backToHome() {
    setPage("home");
    setError("");
    setAnswers({});
    setQuestions([]);
    setCurrentQuestion(0);
    setScore(null);
  }

  if (page === "admin") {
    return <AdminPanel onBack={backToHome} />;
  }

  if (page === "quiz") {
    const question = questions[currentQuestion];

    const options = [
      ["A", question.optionA],
      ["B", question.optionB],
      ["C", question.optionC],
      ["D", question.optionD],
    ];

    return (
      <main className="app-container">
        <section className="quiz-card">
          <h1>Online Quiz</h1>
          <p>Student: {studentName}</p>
          <p>
            Question {currentQuestion + 1} of {questions.length}
          </p>

          <h2>{question.questionText}</h2>

          <div className="quiz-options">
            {options.map(([key, value]) => (
              <label key={key} className="quiz-option">
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={key}
                  checked={answers[currentQuestion] === key}
                  onChange={() => selectAnswer(key)}
                />
                <span>
                  {key}. {value}
                </span>
              </label>
            ))}
          </div>

          <div className="quiz-actions">
            <button
              type="button"
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>

            {currentQuestion < questions.length - 1 ? (
              <button type="button" onClick={nextQuestion}>
                Next
              </button>
            ) : (
              <button type="button" onClick={submitQuiz}>
                Submit Quiz
              </button>
            )}
          </div>

          <p>
            Answered: {Object.keys(answers).length} / {questions.length}
          </p>
        </section>
      </main>
    );
  }

  if (page === "result") {
    return (
      <main className="app-container">
        <section className="quiz-card">
          <h1>Quiz Result</h1>
          <h2>Well done, {studentName}!</h2>
          <p>
            Your score: {score} out of {questions.length}
          </p>
          <p>
            Percentage:{" "}
            {questions.length
              ? ((score / questions.length) * 100).toFixed(2)
              : 0}%
          </p>

          <button type="button" onClick={backToHome}>
            Back to Home
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-container">
      <section className="login-card">
        <h1>Online Quiz Exam System</h1>
        <p>Welcome! Enter your name to start the quiz.</p>

        {error && <p className="error-message" role="alert">{error}</p>}

        <form onSubmit={startQuiz}>
          <label htmlFor="studentName">Student Name</label>
          <input
            id="studentName"
            type="text"
            placeholder="Enter your name"
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
            autoComplete="name"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Loading Questions..." : "Start Quiz"}
          </button>
        </form>

        <hr />

        <button
          type="button"
          className="admin-button"
          onClick={() => {
            setError("");
            setPage("admin");
          }}
        >
          Admin Login
        </button>
      </section>
    </main>
  );
}
