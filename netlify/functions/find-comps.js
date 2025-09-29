const { json } = require("express");
const { GraphQLClient, gql } = require("graphql-request");
const fetchFN = globalThis.fetch;

// Reusable selection set for book fields (string interpolation safe)
const bookSelection = `
  title
  id
  description
  release_year
  cached_tags
  featured_book_series {
    featured
    position
  }
  default_physical_edition {
    isbn_13
  }
  contributions {
    author {
      name
    }
  }
    image{
      url
    }
`;

// Helper to fetch books for an author
async function fetchBooksByAuthor(author, client, category, genre, subgenre) {
  const query = gql`
    query SimilarAuthorQuery($name: String!) {
      books(
        distinct_on: title
        where: {
          contributions: { author: { name: { _eq: $name } } }
          description: { _neq: "null" }
          editions: { language: { language: { _eq: "English" } } }
        }
      ) {
        ${bookSelection}
      }
    }
  `;

  try {
    const data = await client.request(query, { name: author });
    const books = data.books || [];
    return filterBooks(books, category, genre, subgenre);
  } catch (err) {
    console.error(`Error fetching books for ${author}:`, err.message || err);
    return [];
  }
}

// Helper to fetch book lists then sort through books
async function fetchBookLists(term, client) {
  const query = gql`
    query ListSearch($term: String!) {
      search(
        query: $term
        query_type: "List"
        fields: "description, name, slug"
        weights: "3, 7, 2"
        per_page: 2
        page: 1
      ) {
        ids
      }
    }
  `;
  try {
    const data = await client.request(query, { term: term });
    const lists = data.search || [];
    return lists;
  } catch (err) {
    console.error(`Error fetching books list for ${term}:`, err.message || err);
    return [];
  }
}

async function fetchBooksInList(id, client, category, genre, subgenre) {
  const query = gql`
    query GetListBooks($id: Int!) {
      lists(where: { id: { _eq: $id } }) {
        list_books(limit: 5) {
          book {
            ${bookSelection}
          }
        }
      }
    }
  `;
  try {
    const data = await client.request(query, { id: id });
    const lists = data.lists || [];
    const booksArray = lists[0].list_books;
    const booksPropertyArray = booksArray.map((item) => item.book);
    const filteredBooks = filterBooks(
      booksPropertyArray,
      category,
      genre,
      subgenre
    );
    return filteredBooks;
  } catch (err) {
    console.error(`Error fetching books for list ${id}:`, err.message || err);
    return [];
  }
}

async function pageStatusCheck(url, authors, title) {
  try {
    const response = await fetchFN(url, { method: "HEAD" });
    if (response.status === 404) {
      let keywords = authors + " " + title;
      keywords = keywords.replace(/ /g, "+");
      return `https://bookshop.org/beta-search?keywords=${keywords}`;
    } else {
      return url;
    }
  } catch (error) {
    console.error("Error retrieving Bookshop Link Status: ", error);
  }
}

function filterBooks(books, category, genre, subgenre) {
  let filtered = books.filter((book) => {
    return (
      // Check if books are first in series or not in a series
      !book.featured_book_series ||
      (book.featured_book_series.featured === true &&
        book.featured_book_series.position === 1)
    );
  });

  return filtered.filter((book, _, arr) => {
    //Remove duplicates and collections
    const containsOtherTitle = arr.some(
      (other) =>
        other !== book &&
        book.title.includes(other.title) &&
        book.title !== other.title
    );
    if (containsOtherTitle) {
      return false;
    }

    //Check that category matches
    if (
      category === "Adult" &&
      book.cached_tags &&
      ((book.cached_tags["Category"] &&
        book.cached_tags["Category"].some(
          (tagObj) => tagObj.tag === "Young Adult"
        )) ||
        (book.cached_tags["Genre"] &&
          book.cached_tags["Genre"].some(
            (tagObj) => tagObj.tag === "Young Adult"
          )))
    ) {
      return false;
    }

    //Make sure genre or subgenre matches
    if (
      book.cached_tags &&
      book.cached_tags["Genre"] &&
      book.cached_tags["Genre"].length > 0
    ) {
      return book.cached_tags["Genre"].some(
        (tagObj) => tagObj.tag === genre || tagObj.tag === subgenre
      );
    }
    //Also removes books with no listed genre
    return false;
  });
}

//schema for possibleComps
const compsSchema = {
  title: "string",
  author_names: "array",
  description: "string",
  release_year: "number",
  genres: "array",
  tags: "array",
  bookshop_link: "string",
  points: "number",
  bookCover: "string",
};

function validateAndSet(map, key, value) {
  // Check that all required properties exist and have the correct type
  for (const prop in compsSchema) {
    if (!value.hasOwnProperty(prop)) {
      throw new Error(
        `Invalid schema for key '${key}': Missing property '${prop}'.`
      );
    }
    const expectedType = compsSchema[prop];
    const actualValue = value[prop];
    if (
      (expectedType === "array" && !Array.isArray(actualValue)) ||
      (expectedType !== "array" && typeof actualValue !== expectedType)
    ) {
      throw new Error(
        `Invalid schema for key '${key}': Incorrect type for property '${prop}'. Expected '${expectedType}', got '${typeof actualValue}'.`
      );
    }
  }
  // If validation passes, set the value in the map
  map.set(key, value);
}
function translateBookObject(book, points) {
  const bookData = {
    title: book.title || "No title",
    author_names: book.contributions
      ? book.contributions.map((contrib) => contrib.author.name)
      : [],
    description: book.description || "No description",
    release_year: book.release_year || 0,
    genres: book.cached_tags["Genre"]
      ? book.cached_tags["Genre"].map((tagObj) => tagObj.tag)
      : [],
    tags:
      book.cached_tags && book.cached_tags["Tag"]
        ? book.cached_tags["Tag"].map((tagObj) => tagObj.tag)
        : [],
    bookshop_link:
      book.default_physical_edition.isbn_13 != null
        ? `https://bookshop.org/book/${book.default_physical_edition.isbn_13}`
        : `https://bookshop.org/beta-search?keywords=`,
    points: points || 0,
    bookCover: book.image.url || "",
  };
  return bookData;
}

function addPointsToBook(bookData, themesArr) {
  if (!(bookData instanceof Map)) return bookData;

  const currentYear = new Date().getFullYear();

  for (const [key, book] of bookData.entries()) {
    // Ensure book and points exist
    if (!book || typeof book !== "object") continue;
    if (typeof book.points !== "number") book.points = 0;

    // Year-based points
    if (
      typeof book.release_year === "number" &&
      book.release_year >= currentYear - 1
    ) {
      book.points += 5;
    } else if (
      typeof book.release_year === "number" &&
      book.release_year >= currentYear - 5
    ) {
      book.points += 3;
    }

    // Theme-based points: +2 per matched theme in description
    const desc = typeof book.description === "string" ? book.description : "";
    const themeMatches = themesArr.reduce(
      (acc, theme) => acc + (desc.includes(theme) ? 1 : 0),
      0
    );
    book.points += themeMatches * 2;

    // update the map entry (objects are mutated in-place, but keep explicit set for clarity)
    bookData.set(key, book);
  }

  return bookData;
}
const possibleComps = new Map();

exports.handler = async (event, context) => {
  try {
    if (!event || !event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing request body" }),
      };
    }
    let payload;
    try {
      // Parse JSON body from POST
      payload = JSON.parse(event.body);
    } catch (error) {
      console.error("Error parsing input:", error);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request body" }),
      };
    }
    const {
      genre = "",
      subgenre = "",
      category = "",
      themes = [],
      author = [],
    } = payload;
    const genreStr = String(genre);
    const subgenreStr = String(subgenre);
    const categoryStr = String(category);
    const themesArr = Array.isArray(themes) ? themes : [];
    const authorsArr = Array.isArray(author) ? author : [];
    if (!process.env.GRAPHQL_API_URL || !process.env.HARDCOVER_TOKEN) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error:
            "Missing server configuration: GRAPHQL_API_URL and/or HARDCOVER_TOKEN",
        }),
      };
    }

    const client = new GraphQLClient(process.env.GRAPHQL_API_URL, {
      headers: {
        Authorization: `Bearer ${process.env.HARDCOVER_TOKEN}`,
      },
    });

    for (const author of authorsArr) {
      const details = await fetchBooksByAuthor(
        author,
        client,
        categoryStr,
        genreStr,
        subgenreStr
      );
      for (const book of details) {
        const bookData = translateBookObject(book, 10);
        validateAndSet(possibleComps, book.id, bookData);
      }
    }
    const reducedTheme =
      themesArr.length > 5 ? themesArr.slice(0, 4) : themesArr;
    const updatedThemeList = reducedTheme.map(
      (element) => element + ` ${genreStr}`
    );
    const listTerms = [subgenreStr, ...updatedThemeList];
    let listIds = [];
    for (const term of listTerms) {
      let li = await fetchBookLists(term, client);
      if (li != "null") {
        listIds = listIds.concat(li.ids);
      }
    }
    const booksFromList = [];
    for (const id of listIds) {
      const listOfBooks = await fetchBooksInList(
        id,
        client,
        categoryStr,
        genreStr,
        subgenreStr
      );
      booksFromList.push(...listOfBooks);
    }
    for (const books of booksFromList) {
      const bookData = translateBookObject(books, 2);
      validateAndSet(possibleComps, books.id, bookData);
    }

    addPointsToBook(possibleComps, themesArr);
    for (const [key, book] of possibleComps.entries()) {
      book.bookshop_link = await pageStatusCheck(
        book.bookshop_link,
        book.author_names,
        book.title
      );
    }

    const sortedComps = new Map(
      Array.from(possibleComps.entries()).sort(
        (a, b) => b[1].points - a[1].points
      )
    );
    const sortedCompsObj = {};
    let index = 0;
    for (const [key, value] of sortedComps.entries()) {
      const prefixedKey = `${String(index).padStart(4, "0")}_${key}`;
      sortedCompsObj[prefixedKey] = value;
      index++;
    }
    const sortedCompsJSON = JSON.stringify(sortedCompsObj);

    return { statusCode: 200, body: sortedCompsJSON };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
        details: error.message,
      }),
    };
  }
};
