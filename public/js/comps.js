document.addEventListener("DOMContentLoaded", function () {
  const resultContainer = document.getElementById("resultContainer");
  const loading = document.getElementById("loading"); // loading animation
  const books = localStorage.getItem("compsResults");
  console.log("Books from localStorage:", books);
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
  // will store <a> elements to update later

  Object.values(books).forEach((book) => {
    const imageUrl = book.image;
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <div class="book-cover-and-info">
        <div class="book-cover">
          ${
            imageUrl
              ? `<img class="book-cover" src="${imageUrl}" alt="Book Cover" />`
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
          <p>
            Order Here: <span class="bookshop-link">Loading...</span>
          </p>
        </div>
      </div>
    `;
    const linkSpan = card.querySelector(".bookshop-link");
    linkSpan.innerHTML = book.bookshop_link; // store for later update
    resultContainer.appendChild(card);
  });

  loading.style.display = "none";

  // Clean up localStorage
  localStorage.removeItem("compsResults");
});
