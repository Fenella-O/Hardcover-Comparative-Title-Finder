// Netlify Function: find-comps
// Proxies requests to the Hardcover GraphQL API using HARDCOVER_TOKEN from Netlify environment

exports.handler = async function (event, context) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { subgenre } = body;

    const token = process.env.HARDCOVER_TOKEN || process.env.HARDCOVER_API_KEY;
    if (!token) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Missing Hardcover token in Netlify env (HARDCOVER_TOKEN)",
        }),
      };
    }

    // Minimal GraphQL query (mirrors the query used by the app)
    const query = `query BookQuery($subgenre: String!) {\n      search(query: $subgenre, query_type: \"Book\", per_page: 5, page: 1) {\n        results\n      }\n    }`;

    const variables = { subgenre };

    const resp = await fetch("https://api.hardcover.app/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await resp.json();

    // If the API used a data wrapper, extract results where appropriate
    const results =
      json?.data?.search?.results ?? json?.search?.results ?? json;

    return {
      statusCode: resp.ok ? 200 : resp.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(results),
    };
  } catch (err) {
    console.error("find-comps error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
