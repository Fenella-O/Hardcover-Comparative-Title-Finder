// Main application script for WritingCompsApp
// Handles form logic, dynamic dropdowns, tag input, loading animation, and keyword extraction

document.addEventListener('DOMContentLoaded', function () {
  // Get references to key DOM elements
  const form = document.getElementById('searchForm');
  const scanButton = document.getElementById('scanButton');
  const genreSelect = document.getElementById('genre');
  const subgenreSelect = document.getElementById('subgenre');
  const loadingDiv = document.getElementById('loading');

  // Mapping of genres to their subgenres for dynamic dropdown population
  const subgenresByGenre = {
    'Non-Fiction': [
      'Memoir',
      'Biography',
      'Historical Nonfiction',
      'Self-Help',
      'True Crime',
    ],
    Dystopian: ['Action Dystopian', 'Literary Dystopian'],
    Romance: [
      'Historical Romance',
      'Contemporary Romance',
      'Dark Romance',
      'Romantic Suspense',
    ],
    'Contemporary Fiction': [
      'Literary Fiction',
      'Coming of Age',
      'Domestic Fiction',
    ],
    Travel: ['Adventure Travel', 'Cultural Travel', 'Travel Memoir'],
    Fantasy: [
      'Literary Fantasy',
      'High Fantasy',
      'Urban Fantasy',
      'Dark Fantasy',
    ],
    'Science Fiction': [
      'Space Opera',
      'Cyberpunk',
      'Time Travel',
      'Apocalyptic Sci-Fi',
    ],
    Horror: [
      'Psychological Horror',
      'Supernatural Horror',
      'Gothic Horror',
      'Body Horror',
    ],
    Thriller: [
      'Psychological Thriller',
      'Political Thriller',
      'Techno Thriller',
      'Crime Thriller',
    ],
  };

  // Update subgenre dropdown based on selected genre
  genreSelect.addEventListener('change', function () {
    const selectedGenre = genreSelect.value;
    subgenreSelect.innerHTML =
      '<option value="">-- Select Subgenre --</option>';

    if (subgenresByGenre[selectedGenre]) {
      subgenresByGenre[selectedGenre].forEach((sub) => {
        const option = document.createElement('option');
        option.value = sub;
        option.textContent = sub;
        subgenreSelect.appendChild(option);
      });
    }
  });

  // Utility function to handle tag input for themes and exclusions
  function handleTagInput(inputId, listId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && input.value.trim() !== '') {
        e.preventDefault();
        const tagText = input.value.trim();

        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `${tagText} <span class="remove">&times;</span>`;

        tag
          .querySelector('.remove')
          .addEventListener('click', () => tag.remove());
        list.appendChild(tag);
        input.value = '';
      }
    });
  }

  // Initialize tag input handlers for theme and exclusion lists
  handleTagInput('themeInput', 'themeList');
  handleTagInput('excludeInput', 'excludeList');

  // Attach scan button event if present
  if (scanButton) {
    scanButton.addEventListener('click', scanSynopsis);
  }

  // Handle form submission: validate, show loading, and trigger comps generation
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const type = document.getElementById('type').value;
    const genre = genreSelect.value;
    const subgenre = subgenreSelect.value;
    const category = document.getElementById('category').value;
    const synopsis = document.getElementById('synopsis').value;

    // Gather tags from theme and exclusion lists
    const themeTags = Array.from(
      document.querySelectorAll('#themeList .tag')
    ).map((tag) => tag.textContent.replace('×', '').trim());
    const doesNotIncludeTags = Array.from(
      document.querySelectorAll('#excludeList .tag')
    ).map((tag) => tag.textContent.replace('×', '').trim());

    // Basic validation for required fields
    if (
      !genre ||
      !subgenre ||
      !category ||
      !synopsis ||
      themeTags.length === 0
    ) {
      alert('Please complete all required fields and add at least one theme.');
      return;
    }

    // Show loading animation
    if (loadingDiv) {
      loadingDiv.style.display = 'flex';
    }

    // Call function to generate comparative titles
    generateComps(
      type,
      genre,
      subgenre,
      category,
      synopsis,
      themeTags,
      doesNotIncludeTags
    );
  });

  /**
   * Sends a POST request to the server to generate comparative titles.
   * Stores results in localStorage and redirects to results page.
   */
  async function generateComps(
    type,
    genre,
    subgenre,
    category,
    synopsis,
    themeTags,
    doesNotIncludeTags
  ) {
    try {
      const response = await fetch('/find-comps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          genre,
          subgenre,
          category,
          synopsis,
          themes: themeTags,
          excludes: doesNotIncludeTags,
          targetType: type,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem('compsResults', JSON.stringify(data));

      // Hide loading animation before redirect
      if (loadingDiv) {
        loadingDiv.style.display = 'none';
      }

      window.location.href = 'comps.html';
    } catch (error) {
      console.error('Error generating comps:', error);
      alert('An error occurred while generating comparative titles.');

      if (loadingDiv) {
        loadingDiv.classList.remove('animate');
      }
    }
  }

  /**
   * Extracts keywords from the synopsis and displays them in a popup for user review.
   * Allows user to confirm and add keywords as theme tags.
   */
  function scanSynopsis() {
    const synopsis = document.getElementById('synopsis').value;

    // Common stop words to exclude from keyword extraction
    const stopWords = new Set([
      'the',
      'and',
      'but',
      'with',
      'from',
      'that',
      'this',
      'what',
      'where',
      'when',
      'how',
      'about',
      'a',
      'an',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'has',
      'had',
      'have',
      'it',
      'as',
      'by',
      'story',
      'means',
      'place',
      'against',
    ]);

    // Process synopsis: lowercase, remove punctuation, split, filter, and count
    const synopsisWords = synopsis
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word));

    const keywordCounts = synopsisWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    // Get top 10 keywords by frequency
    const extractedKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map((entry) => entry[0]);

    // Create popup for keyword review
    const popup = document.createElement('div');
    popup.id = 'keywordPopup';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = '#5D200E';
    popup.style.padding = '20px';
    popup.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.3)';
    popup.style.zIndex = '1000';
    popup.style.borderRadius = '10px';
    popup.style.maxWidth = '400px';
    popup.style.textAlign = 'center';
    popup.style.color = '#fff';

    // Popup title
    const popupTitle = document.createElement('h3');
    popupTitle.textContent = 'Review Extracted Keywords';
    popupTitle.style.color = '#fff';
    popup.appendChild(popupTitle);

    // Container for keyword tags
    const keywordContainer = document.createElement('div');
    keywordContainer.style.display = 'flex';
    keywordContainer.style.flexWrap = 'wrap';
    keywordContainer.style.justifyContent = 'center';
    keywordContainer.style.margin = '10px 0';

    // Add each keyword as a removable tag
    extractedKeywords.forEach((keyword) => {
      const tag = document.createElement('div');
      tag.style.margin = '5px';
      tag.style.padding = '5px 10px';
      tag.style.backgroundColor = '#5D200E';
      tag.style.borderRadius = '15px';
      tag.style.display = 'inline-flex';
      tag.style.alignItems = 'center';
      tag.style.color = '#fff';

      const text = document.createElement('span');
      text.textContent = keyword;
      tag.appendChild(text);

      const remove = document.createElement('span');
      remove.textContent = ' ×';
      remove.style.cursor = 'pointer';
      remove.style.marginLeft = '8px';
      remove.style.color = '#fff';
      remove.addEventListener('click', () => {
        keywordContainer.removeChild(tag);
      });

      tag.appendChild(remove);
      keywordContainer.appendChild(tag);
    });

    popup.appendChild(keywordContainer);

    // Confirm button to add selected keywords as theme tags
    const confirmButton = document.createElement('button');
    confirmButton.textContent = '✓ Confirm';
    confirmButton.style.marginTop = '15px';
    confirmButton.style.padding = '8px 16px';
    confirmButton.style.fontSize = '16px';
    confirmButton.addEventListener('click', () => {
      document.body.removeChild(popup);

      const finalKeywords = Array.from(
        keywordContainer.querySelectorAll('div')
      ).map((tag) => tag.firstChild.textContent.trim());

      const themeList = document.getElementById('themeList');
      finalKeywords.forEach((keyword) => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `${keyword} <span class="remove">&times;</span>`;
        tag
          .querySelector('.remove')
          .addEventListener('click', () => tag.remove());
        themeList.appendChild(tag);
      });
    });

    popup.appendChild(confirmButton);
    document.body.appendChild(popup);
  }
});
