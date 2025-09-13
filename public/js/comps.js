document.addEventListener('DOMContentLoaded', function () {
  // Get the container where results will be displayed
  const resultContainer = document.getElementById('resultContainer');
  // Retrieve comparative titles data from localStorage
  const data = localStorage.getItem('compsResults');

  // If no data is found, display a message and exit
  if (!data) {
    resultContainer.innerHTML = '<p>No comparative titles found.</p>';
    return;
  }

  // Parse the JSON data into an array of book objects
  const books = JSON.parse(data);

  // If the array is empty, display a message and exit
  if (books.length === 0) {
    resultContainer.innerHTML =
      '<p>No comparative titles matched your criteria.</p>';
    return;
  }

  // For each book, create and append a card to the result container
  books.forEach((book) => {
    // Get the image URL if available
    const imageUrl = book.image?.url || '';
    // Create a new div for the book card
    const card = document.createElement('div');
    // Prepare search terms for the Bookshop.org link
    const searchTerms =
      book.title.replace(/ /g, '+') +
      '+' +
      (book.author_names?.join('+') || 'Unknown+Author');
    card.className = 'book-card';
    // Set the inner HTML for the book card, including cover, info, and order link
    card.innerHTML = `
    <div class="book-cover-and-info">
    <div class = "book-cover">
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
      <p>Order Here: <a href="https://bookshop.org/beta-search?keywords=${searchTerms}" target="_blank">Bookshop.org</a></p>
    </div>
  </div>
`;
    // Append the card to the result container
    resultContainer.appendChild(card);
  });

  // Clean up: remove the results from localStorage after displaying
  localStorage.removeItem('compsResults');
});
