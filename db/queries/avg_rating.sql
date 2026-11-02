-- Average rating overall, and per year finished
SELECT COALESCE(EXTRACT(YEAR FROM r.finished_on)::text, 'all time') AS year,
       COUNT(*)                   AS books_rated,
       ROUND(AVG(r.rating), 2)    AS avg_rating
FROM users u
JOIN reads r ON r.user_id = u.user_id
WHERE lower(u.username) = lower('victoria')
  AND r.rating IS NOT NULL
GROUP BY ROLLUP (EXTRACT(YEAR FROM r.finished_on))
ORDER BY year;
