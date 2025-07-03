require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const path = require('path');
const { GraphQLClient, gql } = require('graphql-request');

const app = express();
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'main.html'));
});

// Endpoint to find comparable books
app.post('/find-comps', async (req, res) => {
  const { themes, excludes, targetType } = req.body;

  const endpoint = 'https://api.hardcover.app/v1/graphql';
  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      Authorization: `Bearer ${process.env.HARDCOVER_API_KEY}`,
    },
  });

  const query = gql`
    query FindComps($themes: String!) {
      search(
        query: $themes
        query_type: "Book"
        per_page: 3
        page: 1
        fields: "genres,description"
        weights: "3,2"
      ) {
        results
      }
    }
  `;

  const currentYear = new Date().getFullYear();

  const isFictionBook = (genres) =>
    genres?.map((g) => g.toLowerCase()).includes('fiction');
  const isNonfictionBook = (genres) => {
    const nonfictionGenres = [
      'biography',
      'biography & autobiography',
      'deception',
      'history',
      'literary collections',
      'nonfiction',
      'politics',
      'political science',
      'social science',
      'women',
    ];
    return genres?.some((g) => nonfictionGenres.includes(g.toLowerCase()));
  };

  const matchesGenre = (genres) => {
    if (!genres) return false;
    return targetType === 'fiction'
      ? isFictionBook(genres)
      : targetType === 'nonfiction'
      ? isNonfictionBook(genres)
      : true;
  };

  const filterBooks = (rawBooks, recentOnly = true) => {
    return rawBooks.filter((book) => {
      // Filter out if genres missing or empty
      if (!book.genres || book.genres.length === 0) return false;

      const year = parseInt(book.release_year, 10);
      const isRecent = !recentOnly || (year && year >= currentYear - 3);
      const genreMatch = matchesGenre(book.genres);
      const desc = (book.description || '').toLowerCase();
      const excludesMatch = !excludes?.some((ex) =>
        desc.includes(ex.toLowerCase())
      );

      return isRecent && genreMatch && excludesMatch;
    });
  };

  let results = [];
  let themesCopy = [...themes];

  for (let relaxStep = 0; relaxStep < 3 && results.length < 3; relaxStep++) {
    let themeSubset = [...themesCopy];

    while (themeSubset.length > 0) {
      const themeQuery = themeSubset.join(' ');

      try {
        const data = await graphQLClient.request(query, {
          themes: themeQuery,
        });

        const rawBooks =
          data?.search?.results?.hits.map((hit) => hit.document) || [];
        results = filterBooks(rawBooks, relaxStep === 0);

        if (results.length >= 3) break;
      } catch (err) {
        console.error('GraphQL error:', err.message);
        return res.status(500).json({ error: 'Hardcover API request failed.' });
      }

      themeSubset.pop();
    }
  }

  if (results.length === 0) {
    return res
      .status(404)
      .json({ error: 'No results found after relaxing all filters.' });
  }

  res.json(results);
});

// Start the server
app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
