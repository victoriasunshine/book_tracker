-- Book tracker schema (Postgres / Neon)
-- Run once in Neon's SQL editor. Re-running fails on existing tables;
-- later changes go in db/migrations/.

CREATE TYPE shelf_status AS ENUM ('tbr', 'reading', 'finished');

-- ---------- Accounts ----------

CREATE TABLE users (
  user_id        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username       TEXT NOT NULL CHECK (username ~ '^[A-Za-z0-9_.]{3,30}$'),
  password_hash  TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- "Victoria" and "victoria" count as the same username
CREATE UNIQUE INDEX users_username_lower ON users (lower(username));

CREATE TABLE sessions (
  session_id  TEXT PRIMARY KEY,          -- random token; cookie on web, Bearer on iOS
  user_id     INT NOT NULL REFERENCES users ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL
);
CREATE INDEX sessions_user ON sessions (user_id);

-- ---------- Catalog ----------

CREATE TABLE books (
  isbn13       CHAR(13) PRIMARY KEY CHECK (isbn13 ~ '^[0-9]{13}$'),
  work_id      TEXT,                     -- Open Library work, groups editions
  title        TEXT NOT NULL,
  subtitle     TEXT,
  page_count   INT CHECK (page_count > 0),
  pub_year     SMALLINT,
  publisher    TEXT,
  cover_url    TEXT,
  description  TEXT,
  source       TEXT NOT NULL CHECK (source IN ('openlibrary', 'google', 'manual')),
  fetched_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX books_work ON books (work_id);

CREATE TABLE authors (
  author_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE
);

CREATE TABLE book_authors (
  isbn13     CHAR(13) REFERENCES books ON DELETE CASCADE,
  author_id  INT REFERENCES authors ON DELETE CASCADE,
  position   SMALLINT NOT NULL DEFAULT 0,   -- author order on the cover
  PRIMARY KEY (isbn13, author_id)
);

CREATE TABLE subjects (
  subject_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE
);

CREATE TABLE book_subjects (
  isbn13      CHAR(13) REFERENCES books ON DELETE CASCADE,
  subject_id  INT REFERENCES subjects ON DELETE CASCADE,
  PRIMARY KEY (isbn13, subject_id)
);

-- ---------- Reading ----------

-- Where a book currently sits for a user
CREATE TABLE shelf_items (
  user_id      INT REFERENCES users ON DELETE CASCADE,
  isbn13       CHAR(13) REFERENCES books,
  status       shelf_status NOT NULL,
  added_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  shortlisted  BOOLEAN NOT NULL DEFAULT FALSE,   -- TBR shortlist (M3)
  add_reason   TEXT,                             -- bookshelf pop-out (M7)
  PRIMARY KEY (user_id, isbn13)
);
CREATE INDEX shelf_items_user_status ON shelf_items (user_id, status);

-- One row per time through a book, so rereads are just read_number 2, 3, ...
CREATE TABLE reads (
  read_id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users ON DELETE CASCADE,
  isbn13       CHAR(13) NOT NULL REFERENCES books,
  read_number  SMALLINT NOT NULL DEFAULT 1 CHECK (read_number >= 1),
  started_on   DATE,
  finished_on  DATE,
  rating       NUMERIC(2,1) CHECK (rating BETWEEN 0 AND 5),
  comment      TEXT,
  UNIQUE (user_id, isbn13, read_number),
  CHECK (finished_on IS NULL OR started_on IS NULL OR finished_on >= started_on)
);
CREATE INDEX reads_user_finished ON reads (user_id, finished_on);

-- ---------- Social (M6) ----------

CREATE TABLE follows (
  follower_id  INT REFERENCES users ON DELETE CASCADE,
  followee_id  INT REFERENCES users ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);
