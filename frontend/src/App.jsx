import { useEffect, useState } from "react";
import "./App.css";
import AdminPanel from "./AdminPanel";

const API = "https://online-quiz-exam-system.onrender.com";

function App() {
  const [student, setStudent] = useState(null);
  const [mode, setMode] = useState("login");
  const [showAdmin, setShowAdmin] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Load quiz questions after login.
  useEffect(() => {
    if (!student || showAdmin) return;

    fetch(`${API}/api/questions`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to load questions");
          }
          return response.json();
        })
        .then((data) => {
          setQuestions(data);
          setMessage("");
        })
        .catch(() => {
          setMessage("Could not load quiz questions.");
        });
  }, [student, showAdmin]);

  function updateField(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  // Student registration and login.
  async function handleAuth(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const endpoint = mode === "register" ? "register" : "login";

      const payload =
          mode === "register"
              ? form
              : {
                email: form.email,
                password: form.password,
              };

      const response = await fetch(`${API}/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      if (mode === "register") {
        setMessage("Registration successful! Please log in.");
        setMode("login");
        setForm({
          name: "",
          email: form.email,
          password: "",
        });
      } else {
        setStudent(data);
        setAnswers({});
        setResult(null);
        setMessage("");
      }
    } catch (error) {
      setMessage(error.message || "Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  // Submit quiz answers.
  async function submitQuiz() {
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/api/questions/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Submission failed");
      }

      setResult(data);
    } catch (error) {
      setMessage(error.message || "Could not submit quiz.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setStudent(null);
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setForm({
      name: "",
      email: "",
      password: "",
    });
    setMode("login");
    setShowAdmin(false);
    setMessage("");
  }

  const inputStyle = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "1px solid #bbb",
    fontSize: "16px",
  };

  const buttonStyle = {
    padding: "12px 20px",
    border: "none",
    borderRadius: "6px",
    background: "#2457d6",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    margin: "5px",
  };

  if (showAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} />;
  }

  return (
      <main
          style={{
            maxWidth: "750px",
            margin: "40px auto",
            padding: "24px",
            fontFamily: "Arial, sans-serif",
            color: "#222",
          }}
      >
        {!student ? (
            <section
                style={{
                  maxWidth: "420px",
                  margin: "auto",
                  padding: "24px",
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  boxShadow: "0 4px 16px #0001",
                }}
            >
              <h1>Online Quiz Exam System</h1>

              <h2>
                {mode === "register"
                    ? "Student Registration"
                    : "Student Login"}
              </h2>

              <form onSubmit={handleAuth}>
                {mode === "register" && (
                    <input
                        style={inputStyle}
                        name="name"
                        placeholder="Full name"
                        value={form.name}
                        onChange={updateField}
                        required
                    />
                )}

                <input
                    style={inputStyle}
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={updateField}
                    required
                />

                <input
                    style={inputStyle}
                    type="password"
                    name="password"
                    placeholder="Password (at least 8 characters)"
                    value={form.password}
                    onChange={updateField}
                    minLength={mode === "register" ? 8 : undefined}
                    required
                />

                <button
                    style={buttonStyle}
                    type="submit"
                    disabled={loading}
                >
                  {loading
                      ? "Please wait..."
                      : mode === "register"
                          ? "Register"
                          : "Login"}
                </button>
              </form>

              <p>
                {mode === "register"
                    ? "Already registered?"
                    : "New student?"}{" "}
                <button
                    type="button"
                    onClick={() => {
                      setMode(mode === "register" ? "login" : "register");
                      setMessage("");
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#2457d6",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                >
                  {mode === "register" ? "Login here" : "Register here"}
                </button>
              </p>

              {message && (
                  <p role="status" style={{ color: "#b42318" }}>
                    {message}
                  </p>
              )}
            </section>
        ) : (
            <>
              <header
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
              >
                <div>
                  <h1>Online Quiz Exam System</h1>
                  <p>Welcome, {student.name}!</p>
                </div>

                <div>
                  <button
                      style={buttonStyle}
                      onClick={() => setShowAdmin(true)}
                  >
                    Admin Panel
                  </button>

                  <button style={buttonStyle} onClick={logout}>
                    Logout
                  </button>
                </div>
              </header>

              {message && <p role="status">{message}</p>}

              {questions.map((q, index) => (
                  <section
                      key={q.id}
                      style={{
                        padding: "18px",
                        margin: "18px 0",
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                      }}
                  >
                    <h3>
                      {index + 1}. {q.questionText}
                    </h3>

                    {["A", "B", "C", "D"].map((letter) => (
                        <label
                            key={letter}
                            style={{
                              display: "block",
                              padding: "8px",
                              cursor: "pointer",
                            }}
                        >
                          <input
                              type="radio"
                              name={`question-${q.id}`}
                              checked={answers[q.id] === letter}
                              disabled={result !== null}
                              onChange={() =>
                                  setAnswers({
                                    ...answers,
                                    [q.id]: letter,
                                  })
                              }
                          />{" "}
                          {letter}. {q[`option${letter}`]}
                        </label>
                    ))}
                  </section>
              ))}

              {questions.length === 0 && !message && (
                  <p>Loading questions...</p>
              )}

              {questions.length > 0 && !result && (
                  <button
                      style={buttonStyle}
                      onClick={submitQuiz}
                      disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Quiz"}
                  </button>
              )}

              {result && (
                  <section
                      style={{
                        padding: "20px",
                        marginTop: "20px",
                        borderRadius: "10px",
                        background: "#eef5ff",
                      }}
                  >
                    <h2>Quiz Result</h2>
                    <p>Total Questions: {result.totalQuestions}</p>
                    <p>Correct Answers: {result.correctAnswers}</p>
                    <p>Wrong Answers: {result.wrongAnswers}</p>
                    <p>
                      Percentage: {Number(result.percentage).toFixed(2)}%
                    </p>
                  </section>
              )}
            </>
        )}
      </main>
  );
}

export default App;