-- A user's TBR, shortlist first, newest additions next
SELECT b.isbn13, b.title,
       string_agg(a.name, ', ' ORDER BY ba.position) AS authors,
       s.shortlisted, s.added_at
FROM users u
JOIN shelf_items s  ON s.user_id = u.user_id AND s.status = 'tbr'
JOIN books b        ON b.isbn13 = s.isbn13
LEFT JOIN book_authors ba ON ba.isbn13 = b.isbn13
LEFT JOIN authors a       ON a.author_id = ba.author_id
WHERE lower(u.username) = lower('victoria')
GROUP BY b.isbn13, b.title, s.shortlisted, s.added_at
ORDER BY s.shortlisted DESC, s.added_at DESC;
