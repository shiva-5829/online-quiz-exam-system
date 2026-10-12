
import { useEffect, useState } from "react";

const API = "https://online-quiz-exam-system.onrender.com";

const emptyQuestion = {
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
};

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
        data?.message ||
        (typeof data === "string" && data) ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

export default function AdminPanel({ onBack }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(emptyQuestion);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    apiRequest("/api/admin-auth/check")
        .then(() => {
          if (active) setLoggedIn(true);
        })
        .catch(() => {
          if (active) setLoggedIn(false);
        })
        .finally(() => {
          if (active) setChecking(false);
        });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loggedIn) {
      loadQuestions();
    }
    // loadQuestions is intentionally triggered when login status changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  async function loadQuestions() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/api/admin/questions");
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load questions.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await apiRequest("/api/admin-auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      setPassword("");
      setLoggedIn(true);
      setMessage("Admin login successful.");
    } catch (err) {
      setError(err.message || "Admin login failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleAddQuestion(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const payload = {
      ...form,
      questionText: form.questionText.trim(),
      optionA: form.optionA.trim(),
      optionB: form.optionB.trim(),
      optionC: form.optionC.trim(),
      optionD: form.optionD.trim(),
      correctAnswer: form.correctAnswer.toUpperCase(),
    };

    try {
      await apiRequest("/api/admin/questions", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setForm({ ...emptyQuestion });
      setMessage("Question added successfully.");
      await loadQuestions();
    } catch (err) {
      setError(err.message || "Could not add question.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteQuestion(id) {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await apiRequest(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });

      setQuestions((previous) =>
          previous.filter((question) => question.id !== id)
      );
      setMessage("Question deleted successfully.");
    } catch (err) {
      setError(err.message || "Could not delete question.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await apiRequest("/api/admin-auth/logout", {
        method: "POST",
      });

      setLoggedIn(false);
      setQuestions([]);
      setMessage("Logged out successfully.");
    } catch (err) {
      setError(err.message || "Logout failed.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
        <main className="admin-panel">
          <p>Checking admin session...</p>
        </main>
    );
  }

  if (!loggedIn) {
    return (
        <main className="admin-panel">
          <h2>Admin Login</h2>
          <p>Sign in to manage quiz questions.</p>

          {message && <p role="status">{message}</p>}
          {error && <p role="alert" className="error-message">{error}</p>}

          <form onSubmit={handleLogin}>
            <label htmlFor="admin-username">Username</label>
            <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
            />

            <label htmlFor="admin-password">Password</label>
            <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Please wait..." : "Login"}
            </button>
          </form>

          <button type="button" onClick={onBack}>
            Back to Quiz
          </button>
        </main>
    );
  }

  return (
      <main className="admin-panel">
        <header className="admin-header">
          <h2>Admin Dashboard</h2>

          <div>
            <button type="button" onClick={loadQuestions} disabled={loading}>
              Refresh
            </button>
            <button type="button" onClick={handleLogout} disabled={loading}>
              Logout
            </button>
            <button type="button" onClick={onBack}>
              Back to Quiz
            </button>
          </div>
        </header>

        {message && <p role="status">{message}</p>}
        {error && <p role="alert" className="error-message">{error}</p>}

        <section>
          <h3>Add a Question</h3>

          <form onSubmit={handleAddQuestion}>
            <label htmlFor="questionText">Question</label>
            <textarea
                id="questionText"
                name="questionText"
                value={form.questionText}
                onChange={handleFormChange}
                required
            />

            <label htmlFor="optionA">Option A</label>
            <input
                id="optionA"
                name="optionA"
                value={form.optionA}
                onChange={handleFormChange}
                required
            />

            <label htmlFor="optionB">Option B</label>
            <input
                id="optionB"
                name="optionB"
                value={form.optionB}
                onChange={handleFormChange}
                required
            />

            <label htmlFor="optionC">Option C</label>
            <input
                id="optionC"
                name="optionC"
                value={form.optionC}
                onChange={handleFormChange}
                required
            />

            <label htmlFor="optionD">Option D</label>
            <input
                id="optionD"
                name="optionD"
                value={form.optionD}
                onChange={handleFormChange}
                required
            />

            <label htmlFor="correctAnswer">Correct Answer</label>
            <select
                id="correctAnswer"
                name="correctAnswer"
                value={form.correctAnswer}
                onChange={handleFormChange}
                required
            >
              <option value="A">Option A</option>
              <option value="B">Option B</option>
              <option value="C">Option C</option>
              <option value="D">Option D</option>
            </select>

            <button type="submit" disabled={loading}>
              {loading ? "Please wait..." : "Add Question"}
            </button>
          </form>
        </section>

        <section>
          <h3>Existing Questions ({questions.length})</h3>

          {loading && <p>Loading...</p>}

          {!loading && questions.length === 0 && (
              <p>No questions found.</p>
          )}

          <ol>
            {questions.map((question) => (
                <li key={question.id}>
                  <p>
                    <strong>{question.questionText}</strong>
                  </p>

                  <ul>
                    <li>A. {question.optionA}</li>
                    <li>B. {question.optionB}</li>
                    <li>C. {question.optionC}</li>
                    <li>D. {question.optionD}</li>
                  </ul>

                  <p>Correct answer: {question.correctAnswer}</p>

                  <button
                      type="button"
                      onClick={() => handleDeleteQuestion(question.id)}
                      disabled={loading}
                  >
                    Delete
                  </button>
                </li>
            ))}
          </ol>
        </section>
      </main>
  );
}
