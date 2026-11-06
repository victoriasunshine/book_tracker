-- Test data for the 3 test queries. Run AFTER seed-books.ts has loaded books.
-- The password hash is a placeholder; this account can't log in yet.
-- To start over: DELETE FROM users WHERE username = 'victoria';
--   (shelf_items and reads are removed with it)

INSERT INTO users (username, password_hash) VALUES ('victoria', 'placeholder');

-- Two on the TBR (one shortlisted), one in progress, two finished
INSERT INTO shelf_items (user_id, isbn13, status, shortlisted)
SELECT u.user_id, v.isbn13, v.status::shelf_status, v.shortlisted
FROM users u,
  (VALUES
    ('9781400030903', 'tbr',      true ),   -- Bridge of Sighs
    ('9780971359765', 'tbr',      false),   -- Clumsy
    ('9781594483851', 'reading',  false),   -- A Thousand Splendid Suns
    ('9781594631931', 'finished', false),   -- The Kite Runner
    ('9780547928227', 'finished', false)    -- The Hobbit
  ) AS v(isbn13, status, shortlisted)
WHERE u.username = 'victoria';

-- One read in progress, The Kite Runner read twice, The Hobbit once.
-- Dates, ratings, and comments are made up; change them to your real ones if you like.
INSERT INTO reads (user_id, isbn13, read_number, started_on, finished_on, rating, comment)
SELECT u.user_id, v.isbn13, v.n, v.s::date, v.f::date, v.r, v.c
FROM users u,
  (VALUES
    ('9781594483851', 1, '2026-10-28', NULL,         NULL, NULL),
    ('9781594631931', 1, '2024-03-02', '2024-03-15', 5.0,  'First read'),
    ('9781594631931', 2, '2026-08-10', '2026-08-18', 4.5,  'Reread, still hits'),
    ('9780547928227', 1, '2025-12-20', '2026-01-04', 4.0,  NULL)
  ) AS v(isbn13, n, s, f, r, c)
WHERE u.username = 'victoria';
