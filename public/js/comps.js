document.addEventListener("DOMContentLoaded", function () {
  const resultContainer = document.getElementById("resultContainer");
  const loading = document.getElementById("loading"); // loading animation
  const books = JSON.parse(localStorage.getItem("compsResults") || "{}");

  if (!books) {
    resultContainer.innerHTML = "<p>No comparative titles found.</p>";
    return;
  }

  if (books.length === 0) {
    resultContainer.innerHTML =
      "<p>No comparative titles matched your criteria.</p>";
    return;
  }

  // Show loading animation
  loading.style.display = "block";
  loading.style.width = "50%";
  loading.style.margin = "20px auto";

  // Create all book cards immediately

  Object.values(books).forEach((book) => {
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
