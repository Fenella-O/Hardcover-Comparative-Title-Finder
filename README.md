# Comparative Title Finder Using the Hardcover API

A full-stack web app that helps authors and publishing professionals generate comparative book titles ("comps") using a secure connection to the Hardcover API.

---

### Background

In traditional publishing, authors are expected to provide **comparative titles** when querying agents or editors. These comps help situate the book in the market and show how it aligns with current trends or audience expectations. For many writers, especially those without access to industry tools, this research is time-consuming or unclear.

I built this app as both a software developer and a writer. It streamlines the comp title discovery process by connecting directly to a curated books database and applying filters based on your manuscript’s synopsis, themes, and genre. It’s meant to assist not just authors, but also agents, editors, and marketers making data-driven decisions in publishing.

---

### How it Works

1. You enter details about your manuscript, including:

   - Genre and subgenre
   - Target category (fiction or nonfiction)
   - Themes and keywords
   - A full synopsis (500–1000 words)

2. The backend sends a secure request to the Hardcover API with that data.

3. Results are filtered to show recent, relevant titles that match your book’s subject matter and tone — excluding any keywords you explicitly want to avoid.

---

### Tech Stack

**Frontend**

- HTML
- CSS
- JavaScript

**Backend**

- Node.js
- Express
- dotenv

**Integration**

- Hardcover API

---

### Use the Live Demo

- Frontend: [https://compfinder.netlify.app](https://compfinder.netlify.app)

---

### Getting Started

If you'd like to run the app locally:

1. **Clone the repository**

   ```bash
   git clone https://github.com/Fenella-O/Hardcover-Comparative-Title-Finder.git
   cd Hardcover-Comparative-Title-Finder
   ```

2. **Install backend dependencies**

   ```bash
   cd secure-backend
   npm install
   ```

3. **Start the backend**

   ```bash
   node server.js
   ```

4. **Open the frontend**
   Open `public/index.html` in your browser. You can now use the app locally.

Note: The live deployment does **not** require you to provide your own API key. That’s handled securely through the backend.

---

### Input Example (for Tech Users)

**If you're unsure what a "synopsis" should look like, here’s a safe example using _The Hitchhiker’s Guide to the Galaxy_:**

> Arthur Dent is an ordinary man having a very bad day—his house is about to be demolished, and then, so is the planet. He’s rescued at the last minute by Ford Prefect, a friend who turns out to be an alien. The two hitch a ride on a passing spaceship just before Earth is destroyed to make way for an interstellar bypass. As they travel the galaxy, they meet strange characters: Zaphod Beeblebrox, a two-headed ex-President; Trillian, the only other surviving human; and Marvin, a deeply depressed robot. Along the way, Arthur discovers that the universe is far more bizarre and bureaucratic than he imagined, and that the meaning of life might just be the number 42. Blending humor, satire, and science fiction, the story explores absurdity in both cosmic and human systems.

This would be appropriate as a full synopsis (500–1000 words) for the tool.
