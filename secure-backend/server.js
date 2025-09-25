require("dotenv").config();
const express = require("express");
const { GraphQLClient, gql } = require("graphql-request");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(
  cors({ origin: process.env.CORS_ORIGIN || "https://compfinder.netlify.app" })
);
s;

// Set main HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "main.html"));
});

// Find comparable books endpoint
app.post("/find-comps", async (req, res) => {
  const { subgenre, category, themes, authors } = req.body;

  const endpoint = "https://api.hardcover.app/v1/graphql";

  // Get Netlify API Token, fall back on local if needed
  const apiToken = process.env.HARDCOVER_TOKEN || process.env.HARDCOVER_API_KEY;
  if (!apiToken) {
    console.error(
      "Missing Hardcover API token. Set HARDCOVER_TOKEN (Netlify) or HARDCOVER_API_KEY (.env)."
    );
    return res.status(500).json({
      error:
        "Missing Hardcover API token. Set HARDCOVER_TOKEN (Netlify) or HARDCOVER_API_KEY (.env).",
    });
  }

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
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
    subgenre,
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
