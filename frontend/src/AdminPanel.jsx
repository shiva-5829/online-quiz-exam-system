import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:8080/api";

function AdminPanel({ onBack }) {
    const [loggedIn, setLoggedIn] = useState(false);
    const [checking, setChecking] = useState(true);
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("");
    const [questions, setQuestions] = useState([]);
    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
    });

    useEffect(() => {
        fetch(`${API}/admin-auth/check`, {
            credentials: "include",
        })
            .then((response) => {
                setLoggedIn(response.ok);
            })
            .catch(() => {
                setMessage("Backend is not running.");
            })
            .finally(() => {
                setChecking(false);
            });
    }, []);

    useEffect(() => {
        if (loggedIn) {
            loadQuestions();
        }
    }, [loggedIn]);

    async function loadQuestions() {
        try {
            const response = await fetch(`${API}/admin/questions`, {
                credentials: "include",
            });

            if (response.status === 401) {
                setLoggedIn(false);
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load questions.");
            }

            setQuestions(data);
        } catch (error) {
            setMessage(error.message || "Unable to load questions.");
        }
    }

    async function handleLogin(event) {
        event.preventDefault();
        setMessage("");

        try {
            const response = await fetch(`${API}/admin-auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Invalid username or password.");
                return;
            }

            setPassword("");
            setLoggedIn(true);
            setMessage("Admin login successful.");
        } catch {
            setMessage("Cannot connect to the backend.");
        }
    }

    async function handleLogout() {
        try {
            await fetch(`${API}/admin-auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch {
            // Continue clearing the admin screen.
        }

        setLoggedIn(false);
        setQuestions([]);
        setMessage("Admin logged out.");
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
        setMessage("");

        try {
            const response = await fetch(`${API}/admin/questions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Unable to add question.");

                if (response.status === 401) {
                    setLoggedIn(false);
                }

                return;
            }

            setForm({
                questionText: "",
                optionA: "",
                optionB: "",
                optionC: "",
                optionD: "",
                correctAnswer: "A",
            });

            setMessage("Question added successfully.");
            await loadQuestions();
        } catch {
            setMessage("Cannot connect to the backend.");
        }
    }

    async function deleteQuestion(id) {
        if (!window.confirm("Delete this question?")) {
            return;
        }

        try {
            const response = await fetch(
                `${API}/admin/questions/${id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Unable to delete question.");

                if (response.status === 401) {
                    setLoggedIn(false);
                }

                return;
            }

            setMessage("Question deleted successfully.");
            await loadQuestions();
        } catch {
            setMessage("Cannot connect to the backend.");
        }
    }

    if (checking) {
        return <div className="admin-container">Checking login...</div>;
    }

    if (!loggedIn) {
        return (
            <div className="admin-container">
                <h1>Admin Login</h1>

                <form className="admin-form" onSubmit={handleLogin}>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />

                    <button type="submit">Login</button>
                    <button type="button" onClick={onBack}>Back</button>
                </form>

                {message && <p>{message}</p>}
            </div>
        );
    }

    return (
        <div className="admin-container">
            <h1>Admin Panel</h1>

            <button type="button" onClick={handleLogout}>
                Logout Admin
            </button>

            <button type="button" onClick={onBack}>
                Back to Dashboard
            </button>

            <h2>Add Question</h2>

            <form className="admin-form" onSubmit={addQuestion}>
                <label>Question</label>
                <textarea
                    name="questionText"
                    value={form.questionText}
                    onChange={handleChange}
                    required
                />

                <label>Option A</label>
                <input name="optionA" value={form.optionA}
                       onChange={handleChange} required />

                <label>Option B</label>
                <input name="optionB" value={form.optionB}
                       onChange={handleChange} required />

                <label>Option C</label>
                <input name="optionC" value={form.optionC}
                       onChange={handleChange} required />

                <label>Option D</label>
                <input name="optionD" value={form.optionD}
                       onChange={handleChange} required />

                <label>Correct Answer</label>
                <select
                    name="correctAnswer"
                    value={form.correctAnswer}
                    onChange={handleChange}
                >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>

                <button type="submit">Add Question</button>
            </form>

            {message && <p>{message}</p>}

            <h2>Existing Questions ({questions.length})</h2>

            {questions.map((question) => (
                <div className="admin-question" key={question.id}>
                    <p><strong>{question.questionText}</strong></p>
                    <p>A. {question.optionA}</p>
                    <p>B. {question.optionB}</p>
                    <p>C. {question.optionC}</p>
                    <p>D. {question.optionD}</p>

                    <button
                        type="button"
                        onClick={() => deleteQuestion(question.id)}
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
}

export default AdminPanel;