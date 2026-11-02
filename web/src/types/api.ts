// Shapes shared by the web app and (later) the iOS app.
// Keep the Swift Codable structs in sync with these.

export type BookSource = "openlibrary" | "google" | "manual";
export type ShelfStatus = "tbr" | "reading" | "finished";

export interface Book {
  isbn13: string;
  workId: string | null;
  title: string;
  subtitle: string | null;
  authors: string[];
  subjects: string[];
  pageCount: number | null;
  pubYear: number | null;
  publisher: string | null;
  coverUrl: string | null;
  description: string | null;
  source: BookSource;
}

export interface ApiError {
  error: string;
}

export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
}