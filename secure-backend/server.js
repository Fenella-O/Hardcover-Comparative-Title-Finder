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

// Set main HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "main.html"));
});

// Find comparable books endpoint
app.post("/find-comps", async (req, res) => {
  // Proxy this request to the Netlify Function which has access to HARDCOVER_TOKEN
  // (Netlify injects environment variables into functions at runtime).
  // The Netlify Function URL is constructed from NETLIFY_SITE_URL (if set) or defaults to
  // the production site. Adjust NETLIFY_SITE_URL in your env when testing against a branch preview.
  try {
    const site =
      process.env.NETLIFY_SITE_URL || "https://compfinder.netlify.app";
    const fnUrl = `${site}/.netlify/functions/find-comps`;

    const resp = await fetch(fnUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await resp.text();
    // Mirror status and headers (keep it simple)
    res
      .status(resp.status)
      .set({
        "Content-Type": resp.headers.get("content-type") || "application/json",
      })
      .send(text);
  } catch (err) {
    console.error("Error proxying to Netlify function:", err);
    res.status(502).json({ error: "Failed to reach Netlify function" });
  }
});

// Start the server
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
