-- Every finished read with dates and days taken; rereads show up as separate rows
SELECT b.title, r.read_number, r.started_on, r.finished_on,
       r.finished_on - r.started_on AS days_taken,
       r.rating, r.comment
FROM users u
JOIN reads r ON r.user_id = u.user_id AND r.finished_on IS NOT NULL
JOIN books b ON b.isbn13 = r.isbn13
WHERE lower(u.username) = lower('victoria')
ORDER BY r.finished_on DESC;
