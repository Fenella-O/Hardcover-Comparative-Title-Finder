require('dotenv').config();
const { GraphQLClient, gql } = require('graphql-request');

const endpoint = 'https://api.hardcover.app/v1/graphql';

const client = new GraphQLClient(endpoint, {
  headers: {
    Authorization: `Bearer ${process.env.HARDCOVER_API_KEY}`,
  },
});

const query = gql`
  query FindGenres {
    search(
      query: "fiction"
      query_type: "Book"
      per_page: 100
      page: 1
      fields: "genres"
      weights: "3,2"
    ) {
      results
    }
  }
`;

async function fetchGenres() {
  try {
    const genreSet = new Set();

    hits.forEach((hit) => {
      const genres = hit?.document?.genres;
      if (Array.isArray(genres)) {
        genres.forEach((g) => genreSet.add(g.trim()));
      }
    });

    const sortedGenres = Array.from(genreSet).sort();

    console.log('✅ Unique Genres Found:\n');
    sortedGenres.forEach((g) => console.log(`- ${g}`));
  } catch (error) {
    console.error('❌ Error fetching genres:', error);
  }
}

fetchGenres();
