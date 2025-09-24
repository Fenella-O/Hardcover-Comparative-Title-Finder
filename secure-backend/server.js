require("dotenv").config(); // Load environment variables from .env
const express = require("express");
const { GraphQLClient, gql } = require("graphql-request");
const cors = require("cors");

const app = express();
app.use(express.json());

// Serve static files from the public directory
app.use(
  cors({
    origin: [
      "https://compfinder.netlify.app",
      "http://localhost:8080",
      "http://localhost:3000",
    ],
  })
); // Enable CORS for allowed origins

// Simple route to proxy a Bookshop.org search for a title+author and return a direct URL
app.get("/bookshop-link", async (req, res) => {
  const { title = "", authors = "" } = req.query;

  // Minimal implementation: construct a Bookshop search URL. A real implementation
  // could call a Bookshop API or scrape search results (be mindful of TOS).
  if (!title) {
    return res.status(400).json({ error: "Missing title parameter" });
  }

  const query = encodeURIComponent(`${title} ${authors}`.trim());
  const url = `https://bookshop.org/search/results?keyword=${query}`;
  return res.json({ url });
});

// Endpoint to find comparable books
app.post("/find-comps", async (req, res) => {
  const { genre, subgenre, category, themes, authors } = req.body;

  const endpoint = "https://api.hardcover.app/v1/graphql";
  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      Authorization: `Bearer ${process.env.HARDCOVER_API_KEY}`,
    },
  });

  // Query here
  const query = gql`
    query BookQuery($subgenre: String!) {
      search(query: $subgenre, query_type: "Book", per_page: 5, page: 1) {
        results
      }
    }
  `;

  const variables = {
    genre,
    subgenre,
    category,
    themes,
    authors,
  };

  try {
    const { search } = await graphQLClient.request(query, variables);
    const results = search.results;

    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: "No results found after relaxing all filters." });
    }

    res.json(results);
  } catch (error) {
    console.error("Error fetching comparable books:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
