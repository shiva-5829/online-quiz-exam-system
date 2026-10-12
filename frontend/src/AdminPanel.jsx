
import { useEffect, useState } from "react";
import "./App.css";

const API = "https://online-quiz-exam-system.onrender.com";

const EMPTY_FORM = {
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
            ...(options.body ? { "Content-Type": "application/json" } : {}),
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
        const error = new Error(
            typeof data === "string"
                ? data
                : data?.message || `Request failed with status ${response.status}`
        );
        error.status = response.status;
        throw error;
    }

    return data;
}

export default function AdminPanel({ onBack }) {
    const [loggedIn, setLoggedIn] = useState(false);
    const [checking, setChecking] = useState(true);
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("");
    const [questions, setQuestions] = useState([]);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let active = true;

        apiRequest("/api/admin-auth/check")
            .then(() => {
                if (active) setLoggedIn(true);
            })
            .catch((err) => {
                if (!active) return;

                setLoggedIn(false);

                if (err.status !== 401 && err.status !== 403) {
                    setError(
                        err.status === 404
                            ? "Admin endpoint not found. Check the backend API routes."
                            : "Could not check the admin session. Please try again."
                    );
                }
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
        // Load questions when the login state changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loggedIn]);

    async function loadQuestions() {
        setError("");
        setBusy(true);

        try {
            const data = await apiRequest("/api/admin/questions");
            setQuestions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err.status === 401 || err.status === 403
                    ? "Your admin session has expired. Please log in again."
                    : err.message || "Unable to load questions."
            );

            if (err.status === 401 || err.status === 403) {
                setLoggedIn(false);
            }
        } finally {
            setBusy(false);
        }
    }

    async function handleLogin(event) {
        event.preventDefault();
        setError("");
        setMessage("");
        setBusy(true);

        try {
            await apiRequest("/api/admin-auth/login", {
                method: "POST",
                body: JSON.stringify({
                    username: username.trim(),
                    password,
                }),
            });

            setPassword("");
            setLoggedIn(true);
            setMessage("Admin login successful.");
        } catch (err) {
            setError(
                err.status === 404
                    ? "Admin login endpoint not found. Check the backend deployment."
                    : err.status === 401 || err.status === 403
                        ? "Invalid admin username or password."
                        : err.message || "Unable to log in."
            );
        } finally {
            setBusy(false);
        }
    }

    async function handleLogout() {
        setError("");
        setMessage("");
        setBusy(true);

        try {
            await apiRequest("/api/admin-auth/logout", {
                method: "POST",
            });

            setMessage("Logged out successfully.");
        } catch (err) {
            setError(err.message || "Could not contact the logout endpoint.");
        } finally {
            setLoggedIn(false);
            setQuestions([]);
            setPassword("");
            setBusy(false);
        }
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function addQuestion(event) {
        event.preventDefault();
        setError("");
        setMessage("");
        setBusy(true);

        const payload = {
            questionText: form.questionText.trim(),
            optionA: form.optionA.trim(),
            optionB: form.optionB.trim(),
            optionC: form.optionC.trim(),
            optionD: form.optionD.trim(),
            correctAnswer: form.correctAnswer,
        };

        try {
            await apiRequest("/api/admin/questions", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            setForm({ ...EMPTY_FORM });
            setMessage("Question added successfully.");

            const data = await apiRequest("/api/admin/questions");
            setQuestions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Unable to add question.");

            if (err.status === 401 || err.status === 403) {
                setLoggedIn(false);
            }
        } finally {
            setBusy(false);
        }
    }

    async function deleteQuestion(id) {
        if (!window.confirm("Are you sure you want to delete this question?")) {
            return;
        }

        setError("");
        setMessage("");
        setBusy(true);

        try {
            await apiRequest(`/api/admin/questions/${id}`, {
                method: "DELETE",
            });

            setQuestions((previous) =>
                previous.filter((question) => question.id !== id)
            );
            setMessage("Question deleted successfully.");
        } catch (err) {
            setError(err.message || "Unable to delete question.");

            if (err.status === 401 || err.status === 403) {
                setLoggedIn(false);
            }
        } finally {
            setBusy(false);
        }
    }

    if (checking) {
        return (
            <div className="admin-container">
                <p>Checking admin session...</p>
            </div>
        );
    }

    if (!loggedIn) {
        return (
            <div className="admin-container">
                <h1>Admin Login</h1>
                <p>Log in to manage quiz questions.</p>

                <form className="admin-form" onSubmit={handleLogin}>
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

                    <button type="submit" disabled={busy}>
                        {busy ? "Please wait..." : "Login"}
                    </button>

                    <button type="button" onClick={onBack} disabled={busy}>
                        Back
                    </button>
                </form>

                {message && <p role="status">{message}</p>}
                {error && <p role="alert">{error}</p>}
            </div>
        );
    }

    return (
        <div className="admin-container">
            <h1>Admin Panel</h1>

            <button type="button" onClick={handleLogout} disabled={busy}>
                Logout Admin
            </button>

            <button type="button" onClick={onBack}>
                Back to Dashboard
            </button>

            <h2>Add Question</h2>

            <form className="admin-form" onSubmit={addQuestion}>
                <label htmlFor="questionText">Question</label>
                <textarea
                    id="questionText"
                    name="questionText"
                    value={form.questionText}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="optionA">Option A</label>
                <input id="optionA" name="optionA" value={form.optionA}
                       onChange={handleChange} required />

                <label htmlFor="optionB">Option B</label>
                <input id="optionB" name="optionB" value={form.optionB}
                       onChange={handleChange} required />

                <label htmlFor="optionC">Option C</label>
                <input id="optionC" name="optionC" value={form.optionC}
                       onChange={handleChange} required />

                <label htmlFor="optionD">Option D</label>
                <input id="optionD" name="optionD" value={form.optionD}
                       onChange={handleChange} required />

                <label htmlFor="correctAnswer">Correct Answer</label>
                <select
                    id="correctAnswer"
                    name="correctAnswer"
                    value={form.correctAnswer}
                    onChange={handleChange}
                >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                </select>

                <button type="submit" disabled={busy}>
                    {busy ? "Please wait..." : "Add Question"}
                </button>
            </form>

            {message && <p role="status">{message}</p>}
            {error && <p role="alert">{error}</p>}

            <h2>Existing Questions ({questions.length})</h2>

            <button type="button" onClick={loadQuestions} disabled={busy}>
                Refresh Questions
            </button>

            {questions.length === 0 && <p>No questions found.</p>}

            {questions.map((question) => (
                <div className="admin-question" key={question.id}>
                    <p>
                        <strong>{question.questionText}</strong>
                    </p>
                    <p>A. {question.optionA}</p>
                    <p>B. {question.optionB}</p>
                    <p>C. {question.optionC}</p>
                    <p>D. {question.optionD}</p>
                    <p>Correct answer: {question.correctAnswer}</p>

                    <button
                        type="button"
                        onClick={() => deleteQuestion(question.id)}
                        disabled={busy}
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
}
