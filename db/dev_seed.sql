-- Test data for today's queries. Run AFTER seed-books.ts has loaded books.
-- Replace the ISBNs below with ones you actually seeded.
-- The password hash is a placeholder; this account can't log in yet.

INSERT INTO users (username, password_hash) VALUES ('victoria', 'placeholder');

-- Something on the TBR, one in progress, two finished (one read twice)
INSERT INTO shelf_items (user_id, isbn13, status, shortlisted, add_reason)
SELECT u.user_id, v.isbn13, v.status::shelf_status, v.shortlisted, v.reason
FROM users u,
  (VALUES
    ('9780000000001', 'tbr',      true,  'Saw it recommended and wanted the vibe'),
    ('9780000000002', 'tbr',      false, NULL),
    ('9780000000003', 'reading',  false, NULL),
    ('9780000000004', 'finished', false, 'An all-time favorite'),
    ('9780000000005', 'finished', false, NULL)
  ) AS v(isbn13, status, shortlisted, reason)
WHERE u.username = 'victoria';

INSERT INTO reads (user_id, isbn13, read_number, started_on, finished_on, rating, comment)
SELECT u.user_id, v.isbn13, v.n, v.s::date, v.f::date, v.r, v.c
FROM users u,
  (VALUES
    ('9780000000003', 1, '2026-10-25', NULL,         NULL, NULL),
    ('9780000000004', 1, '2025-06-01', '2025-06-12', 5.0,  'First read'),
    ('9780000000004', 2, '2026-09-01', '2026-09-08', 4.5,  'Reread, still great'),
    ('9780000000005', 1, '2026-10-01', '2026-10-20', 3.5,  NULL)
  ) AS v(isbn13, n, s, f, r, c)
WHERE u.username = 'victoria';
