exports.handler = async function (event) {
  try {
    // Basic runtime validations so CLI/dev errors are easier to diagnose.
    if (!event || !event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing request body" }),
      };
    }

    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON in request body" }),
      };
    }

    const { author } = payload;
    if (!author) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required field: author" }),
      };
    }

    if (!process.env.GRAPHQL_API_URL || !process.env.HARDCOVER_TOKEN) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error:
            "Missing server configuration: GRAPHQL_API_URL and/or HARDCOVER_TOKEN",
        }),
      };
    }

    const graphql = await import("graphql-request");
    const { GraphQLClient, gql } = graphql;
    // connect to Hardcover API
    const client = new GraphQLClient(process.env.GRAPHQL_API_URL, {
      headers: {
        Authorization: `${process.env.HARDCOVER_TOKEN}`,
      },
    });
    //define query
    const safeAuthor = author.replace(/"/g, '\\"'); // escape quotes

    const query = gql`
  query BooksByAuthor {
    search(
      query: "${safeAuthor}",
      query_type: "Author",
      per_page: 5,
      page: 1
    ) {
      results
    }
  }
`;

    const results = await client.request(query);
    const books = results?.search?.results || [];

    return { statusCode: 200, body: JSON.stringify(books) };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
        details: err.message,
      }),
    };
  }
};
