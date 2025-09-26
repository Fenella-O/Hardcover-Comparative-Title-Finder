const { GraphQLClient, gql } = require("graphql-request");
exports.handler = async function (event) {
  try {
    const { author } = JSON.parse(event.body);
    //connect to Hardcover API
    const client = new GraphQLClient(process.env.GRAPHQL_API_URL, {
      headers: {
        Authorization: `Bearer ${process.env.HARDCOVER_TOKEN}`,
      },
    });
    //define query
    const query = gql`
      query GetBooksByAuthor($author: String!) {
        books(author: $author) {
          id
          title
          author
          publishedDate
        }
      }
    `;
    const results = await client.request(query, { author });
    return { statusCode: 200, body: JSON.stringify(results.books) };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
