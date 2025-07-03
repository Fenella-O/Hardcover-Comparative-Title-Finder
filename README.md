# Hardcover Comparative Title Finder 📚

A full-stack web app to help authors and publishers find comparable book titles using the Hardcover API. Built to merge storytelling with data-driven decision-making, this tool supports book professionals in crafting stronger pitches through comp-title research.

All API requests are handled through a secure backend, so your API key is never exposed in the frontend code.

---

## 🔍 Features

- Search for comp titles based on genre, topic, or keyword
- Secure backend proxy to keep your Hardcover API key private
- Clean, responsive frontend using HTML, CSS, and JavaScript
- Separation of public UI and backend server logic

---

## 🛠️ Tech Stack

| Layer       | Tools / Languages       |
|-------------|--------------------------|
| Frontend    | HTML, CSS, JavaScript    |
| Backend     | Node.js, Express         |
| Integration | Hardcover API, dotenv    |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Fenella-O/Hardcover-Comparative-Title-Finder.git
cd Hardcover-Comparative-Title-Finder

### 2. Set Up the Backend
bash
Copy
Edit
cd secure-backend
npm install

### 3. Create a .env File (Use Your Own API Key)
Inside the secure-backend/ folder, create a file called .env:

ini
Copy
Edit
API_KEY=your-hardcover-api-key-here
⚠️ This file is not committed to GitHub because it is listed in .gitignore.
✅ Your API key will remain private and is only used by the backend server.

###4. Start the Backend Server
bash
Copy
Edit
node server.js
This launches the local backend server, which securely proxies your requests to the Hardcover API.

###5. Open the Frontend
Open the following file in your browser:

arduino
Copy
Edit
public/main.html
You can now enter a keyword or genre and receive comparable book titles — powered by your backend server.

###📁 Folder Structure
bash
Copy
Edit
Hardcover-Comparative-Title-Finder/
├── .vscode/              # VS Code config
├── public/               # Frontend: HTML, JS, and CSS
│   ├── main.html         # Entry point
│   ├── comps.html, js    # Comp titles UI
├── secure-backend/       # Backend server (Node + Express)
│   ├── .env              # Contains your private API key (NOT committed)
│   ├── .env.example      # Setup reference (safe to share)
│   ├── server.js         # Backend logic and API proxy
│   ├── package.json
├── .gitignore
└── README.md
📦 .env.example
To help others get started, this project includes a .env.example file that shows what environment variables are required:

ini
Copy
Edit
# .env.example
API_KEY=your-hardcover-api-key-here
They can rename this to .env and insert their own API key.

###🧠 About the Project
As a computer science graduate with a creative writing background, I built this tool to combine technical execution with publishing insight. It’s designed to assist editors, agents, and authors in finding comp titles — helping bring strong books to the right audiences with smarter positioning.

This project also demonstrates:

End-to-end API integration

Secure backend patterns for key management

A clean user-facing experience built with lightweight frontend tech

###📄 License
This project is licensed under the MIT License — free to use, modify, and share.
