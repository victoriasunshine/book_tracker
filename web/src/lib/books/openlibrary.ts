import type { Book } from "@/types/api";

// Open Library: free, no key. Two calls in parallel:
//   /api/books?jscmd=data  -> title, authors, pages, publisher, subjects, cover
//   /isbn/{isbn}.json      -> the work ID (groups editions of the same book)

const HEADERS = {
  // Open Library asks clients to identify themselves
  "User-Agent": "BookTracker/0.1 (personal project)",
};

export async function fetchFromOpenLibrary(isbn13: string): Promise<Book | null> {
  const dataUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn13}&format=json&jscmd=data`;
  const editionUrl = `https://openlibrary.org/isbn/${isbn13}.json`;

  const [dataRes, editionRes] = await Promise.all([
    fetch(dataUrl, { headers: HEADERS }),
    fetch(editionUrl, { headers: HEADERS }),
  ]);
  if (!dataRes.ok) return null;

  const data = await dataRes.json();
  const b = data[`ISBN:${isbn13}`];
  if (!b) return null;

  let workId: string | null = null;
  if (editionRes.ok) {
    const edition = await editionRes.json();
    workId = edition.works?.[0]?.key?.replace("/works/", "") ?? null;
  }

  const year = String(b.publish_date ?? "").match(/\d{4}/)?.[0];

  return {
    isbn13,
    workId,
    title: b.title,
    subtitle: b.subtitle ?? null,
    authors: (b.authors ?? []).map((a: { name: string }) => a.name),
    subjects: (b.subjects ?? []).slice(0, 10).map((s: { name: string }) => s.name),
    pageCount: b.number_of_pages ?? null,
    pubYear: year ? Number(year) : null,
    publisher: b.publishers?.[0]?.name ?? null,
    coverUrl: b.cover?.large ?? b.cover?.medium ?? null,
    description: typeof b.notes === "string" ? b.notes : null,
    source: "openlibrary",
  };
}
