import type { Book } from "@/types/api";

// Fallback only. Needs GOOGLE_BOOKS_KEY; default quota is ~1,000 requests/day.

export async function fetchFromGoogleBooks(isbn13: string): Promise<Book | null> {
  const key = process.env.GOOGLE_BOOKS_KEY;
  if (!key) return null; // fallback quietly off until the key is set

  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}&key=${key}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const v = data.items?.[0]?.volumeInfo;
  if (!v) return null;

  const year = String(v.publishedDate ?? "").match(/\d{4}/)?.[0];
  const cover = v.imageLinks?.thumbnail?.replace("http://", "https://") ?? null;

  return {
    isbn13,
    workId: null,
    title: v.title,
    subtitle: v.subtitle ?? null,
    authors: v.authors ?? [],
    subjects: v.categories ?? [],
    pageCount: v.pageCount ?? null,
    pubYear: year ? Number(year) : null,
    publisher: v.publisher ?? null,
    coverUrl: cover,
    description: v.description ?? null,
    source: "google",
  };
}
