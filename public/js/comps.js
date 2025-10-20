document.addEventListener("DOMContentLoaded", function () {
  const resultContainer = document.getElementById("resultContainer");
  const loading = document.getElementById("loading"); // loading animation

  // Read stored results (may be an object keyed map or an array)
  const raw = localStorage.getItem("compsResults");
  let books = null;
  try {
    books = raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Error parsing stored compsResults:", e);
    books = null;
  }

  // Normalize empty and show helpful message
  const isEmptyObject =
    books &&
    typeof books === "object" &&
    !Array.isArray(books) &&
    Object.keys(books).length === 0;
  const isEmptyArray = Array.isArray(books) && books.length === 0;
  if (!books || isEmptyObject || isEmptyArray) {
    resultContainer.innerHTML = "<p>No comparative titles found.</p>";
    // Ensure we clean up stale storage
    localStorage.removeItem("compsResults");
    return;
  }

  // Show loading animation
  if (loading) {
    loading.style.display = "block";
    loading.style.width = "50%";
    loading.style.margin = "20px auto";
  }

  // Create all book cards immediately
  const iterable = Array.isArray(books) ? books : Object.values(books);
  iterable.forEach((book) => {
    const card = document.createElement("div");
    card.className = "book-card";

    card.innerHTML = `
    <div class="book-cover-and-info">
      <div class="book-cover">
        ${
          book.bookCover
            ? `<img class="book-cover" src="${book.bookCover}" alt="Book Cover" />`
            : ""
        }
      </div>
      <div class="book-info">
        <h3>${book.title}</h3>
        <p><strong>Author:</strong> ${
          book.author_names?.join(", ") || "Unknown Author"
        }</p>
        <p><strong>Genres:</strong> ${book.genres?.join(", ") || "N/A"}</p>
        <p><strong>Description:</strong> ${
          book.description || "No description available."
        }</p>

        <a href = "${
          book.bookshop_link
        }" target = "_blank">Click Here to Purchase Book</a>
    </div>
  `;

    resultContainer.appendChild(card);
  });

  if (
    window.BookshopWidgets &&
    typeof window.BookshopWidgets.reload === "function"
  ) {
    window.BookshopWidgets.reload();
  }

  loading.style.display = "none";

  // Clean up localStorage
  localStorage.removeItem("compsResults");
});
