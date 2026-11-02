import { sql } from "@/lib/db";
import type { Book } from "@/types/api";
import { toIsbn13 } from "./isbn";
import { fetchFromOpenLibrary } from "./openlibrary";
import { fetchFromGoogleBooks } from "./googlebooks";

// The one place books come from:
//   1. your own books table
//   2. Open Library
//   3. Google Books (only if 2 missed, or had no cover / page count)
//   4. null -> caller shows "add manually"
// Anything found outside is saved, so each ISBN is fetched from outside at most once.

export async function lookupBook(input: string): Promise<Book | null> {
  const isbn13 = toIsbn13(input);
  if (!isbn13) return null;

  const cached = await getBookFromDb(isbn13);
  if (cached) return cached;

  let book = await fetchFromOpenLibrary(isbn13);

  if (!book || !book.coverUrl || !book.pageCount) {
    const google = await fetchFromGoogleBooks(isbn13);
    book = book ? fillGaps(book, google) : google;
  }

  if (book) await saveBook(book);
  return book;
}

// Keep Open Library's data, borrow only the fields it was missing
function fillGaps(primary: Book, backup: Book | null): Book {
  if (!backup) return primary;
  return {
    ...primary,
    coverUrl: primary.coverUrl ?? backup.coverUrl,
    pageCount: primary.pageCount ?? backup.pageCount,
    description: primary.description ?? backup.description,
    publisher: primary.publisher ?? backup.publisher,
  };
}

async function getBookFromDb(isbn13: string): Promise<Book | null> {
  const rows = await sql`
    SELECT b.*,
      COALESCE((SELECT array_agg(a.name ORDER BY ba.position)
                FROM book_authors ba JOIN authors a USING (author_id)
                WHERE ba.isbn13 = b.isbn13), '{}') AS authors,
      COALESCE((SELECT array_agg(s.name)
                FROM book_subjects bs JOIN subjects s USING (subject_id)
                WHERE bs.isbn13 = b.isbn13), '{}') AS subjects
    FROM books b WHERE b.isbn13 = ${isbn13}`;
  const r = rows[0];
  if (!r) return null;
  return {
    isbn13: r.isbn13,
    workId: r.work_id,
    title: r.title,
    subtitle: r.subtitle,
    authors: r.authors,
    subjects: r.subjects,
    pageCount: r.page_count,
    pubYear: r.pub_year,
    publisher: r.publisher,
    coverUrl: r.cover_url,
    description: r.description,
    source: r.source,
  };
}

async function saveBook(b: Book): Promise<void> {
  await sql`
    INSERT INTO books (isbn13, work_id, title, subtitle, page_count, pub_year,
                       publisher, cover_url, description, source)
    VALUES (${b.isbn13}, ${b.workId}, ${b.title}, ${b.subtitle}, ${b.pageCount},
            ${b.pubYear}, ${b.publisher}, ${b.coverUrl}, ${b.description}, ${b.source})
    ON CONFLICT (isbn13) DO NOTHING`;

  for (const [i, name] of b.authors.entries()) {
    await sql`
      WITH a AS (
        INSERT INTO authors (name) VALUES (${name})
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING author_id
      )
      INSERT INTO book_authors (isbn13, author_id, position)
      SELECT ${b.isbn13}, author_id, ${i} FROM a
      ON CONFLICT DO NOTHING`;
  }

  for (const name of b.subjects) {
    await sql`
      WITH s AS (
        INSERT INTO subjects (name) VALUES (${name})
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING subject_id
      )
      INSERT INTO book_subjects (isbn13, subject_id)
      SELECT ${b.isbn13}, subject_id FROM s
      ON CONFLICT DO NOTHING`;
  }
}
