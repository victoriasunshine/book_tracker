// Seed the books table from a list of ISBNs.
// Run from the web/ folder:
//   npx tsx --env-file=.env.local scripts/seed-books.ts
//
// Swap these for books off your own shelves (ISBN-10 or -13, hyphens fine).
const ISBNS = [
    "9780547928227", "9781594483851",
    "9781400030903","9780060527983",
    "9781594631931","9788461648375",
    "9780743253970",
    "9781603094221","9781603094252",
    "9780971359765"
    // add 10–20 more here
  ];
  
  import { lookupBook } from "../src/lib/books/lookup";
  
  async function main() {
    let found = 0;
    for (const isbn of ISBNS) {
      const book = await lookupBook(isbn);
      if (book) {
        found++;
        console.log(`✓ ${isbn}  ${book.title}  (${book.source})`);
      } else {
        console.log(`✗ ${isbn}  not found or invalid`);
      }
      await new Promise((r) => setTimeout(r, 500)); // be polite to Open Library
    }
    console.log(`\n${found}/${ISBNS.length} books in the database`);
  }
  
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
  