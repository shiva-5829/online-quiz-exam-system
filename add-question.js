
const API = "https://online-quiz-exam-system.onrender.com";

const questions = [
  {
    questionText: "Which language is used to build Android apps?",
    optionA: "Java",
    optionB: "HTML",
    optionC: "CSS",
    optionD: "SQL",
    correctAnswer: "Java"
  },
  {
    questionText: "Which keyword creates a class in Java?",
    optionA: "function",
    optionB: "class",
    optionC: "define",
    optionD: "struct",
    correctAnswer: "class"
  },
  {
    questionText: "Which method is the entry point of a Java program?",
    optionA: "start()",
    optionB: "run()",
    optionC: "main()",
    optionD: "init()",
    correctAnswer: "main()"
  },
  {
    questionText: "Which data type stores true or false?",
    optionA: "int",
    optionB: "char",
    optionC: "String",
    optionD: "boolean",
    correctAnswer: "boolean"
  },
  {
    questionText: "Which language is mainly used to query MySQL databases?",
    optionA: "SQL",
    optionB: "CSS",
    optionC: "HTML",
    optionD: "XML",
    correctAnswer: "SQL"
  },
  {
    questionText: "Which HTML tag creates a hyperlink?",
    optionA: "<p>",
    optionB: "<a>",
    optionC: "<h1>",
    optionD: "<img>",
    correctAnswer: "<a>"
  },
  {
    questionText: "Which CSS property changes text color?",
    optionA: "font-style",
    optionB: "background",
    optionC: "color",
    optionD: "padding",
    correctAnswer: "color"
  },
  {
    questionText: "Which data structure follows FIFO?",
    optionA: "Stack",
    optionB: "Queue",
    optionC: "Tree",
    optionD: "Graph",
    correctAnswer: "Queue"
  },
  {
    questionText: "Which keyword is used to inherit a class in Java?",
    optionA: "implements",
    optionB: "extends",
    optionC: "inherits",
    optionD: "import",
    correctAnswer: "extends"
  },
  {
    questionText: "Which protocol is commonly used to load websites?",
    optionA: "FTP",
    optionB: "SMTP",
    optionC: "HTTP",
    optionD: "SSH",
    correctAnswer: "HTTP"
  }
];

async function addQuestions() {
  for (const question of questions) {
    try {
      const response = await fetch(`${API}/api/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(question)
      });

      const result = await response.text();
      console.log(response.status, result);
    } catch (error) {
      console.log("Request failed:", error.message);
      return;
    }
  }
}

addQuestions();
