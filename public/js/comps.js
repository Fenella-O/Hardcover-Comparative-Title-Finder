document.addEventListener('DOMContentLoaded', function () {
  const resultContainer = document.getElementById('resultContainer');
  const loading = document.getElementById('loading'); // loading animation
  const data = localStorage.getItem('compsResults');

  if (!data) {
    resultContainer.innerHTML = '<p>No comparative titles found.</p>';
    return;
  }

  const books = JSON.parse(data);

  if (books.length === 0) {
    resultContainer.innerHTML =
      '<p>No comparative titles matched your criteria.</p>';
    return;
  }

  // Show loading animation
  loading.style.display = 'block';

  // Create all book cards immediately
  const linkElements = []; // will store <a> elements to update later

  books.forEach((book) => {
    const imageUrl = book.image?.url || '';
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <div class="book-cover-and-info">
        <div class="book-cover">
          ${
            imageUrl
              ? `<img class="book-cover" src="${imageUrl}" alt="Book Cover" />`
              : ''
          }
        </div>
        <div class="book-info">
          <h3>${book.title}</h3>
          <p><strong>Author:</strong> ${
            book.author_names?.join(', ') || 'Unknown Author'
          }</p>
          <p><strong>Genres:</strong> ${book.genres?.join(', ') || 'N/A'}</p>
          <p><strong>Description:</strong> ${
            book.description || 'No description available.'
          }</p>
          <p>
            Order Here: <span class="bookshop-link">Loading...</span>
          </p>
        </div>
      </div>
    `;
    const linkSpan = card.querySelector('.bookshop-link');
    linkElements.push({ book, linkSpan }); // store for later update
    resultContainer.appendChild(card);
  });

  // Function to fetch the direct Bookshop.org link via backend
  async function getBookshopLink(book) {
    try {
      const response = await fetch(
        `/bookshop-link?title=${encodeURIComponent(
          book.title
        )}&authors=${encodeURIComponent(book.author_names?.join(' ') || '')}`
      );
      const data = await response.json();
      return data.url || 'Not found on Bookshop.org.';
    } catch (err) {
      console.error(err);
      return 'Not found on Bookshop.org.';
    }
  }

  // Fetch links asynchronously and update each card
  linkElements.forEach(async ({ book, linkSpan }) => {
    const url = await getBookshopLink(book);
    if (url.startsWith('http')) {
      linkSpan.innerHTML = `<a href="${url}" target="_blank">Bookshop.org</a>`;
    } else {
      linkSpan.textContent = url; // shows "Not found on Bookshop.org."
    }
  });

  loading.style.display = 'none';

  // Clean up localStorage
  localStorage.removeItem('compsResults');
});
