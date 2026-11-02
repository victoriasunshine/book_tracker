// Normalize anything a user might type or paste into a valid ISBN-13, or null.
// "0-547-92822-7", "978-0547928227", " 9780547928227 " -> "9780547928227"

export function toIsbn13(input: string): string | null {
    const raw = input.replace(/[\s-]/g, "").toUpperCase();
  
    if (/^\d{13}$/.test(raw)) return isValidIsbn13(raw) ? raw : null;
  
    if (/^\d{9}[\dX]$/.test(raw)) {
      if (!isValidIsbn10(raw)) return null;
      const core = "978" + raw.slice(0, 9);
      return core + isbn13CheckDigit(core);
    }
  
    return null;
  }
  
  function isbn13CheckDigit(first12: string): string {
    const sum = first12
      .split("")
      .reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
    return String((10 - (sum % 10)) % 10);
  }
  
  function isValidIsbn13(isbn: string): boolean {
    return isbn13CheckDigit(isbn.slice(0, 12)) === isbn[12];
  }
  
  function isValidIsbn10(isbn: string): boolean {
    const sum = isbn
      .split("")
      .reduce((acc, c, i) => acc + (c === "X" ? 10 : Number(c)) * (10 - i), 0);
    return sum % 11 === 0;
  }
  