# book_tracker
file architecture
```
book-tracker/                         
├── README.md
├── .gitignore
│
├── api/                              # allows for possible app development later
│   └── openapi.yaml                  # endpoints + response shapes (start small, grow it)
│
├── db/                               # shared, owned by neither app
│   ├── schema.sql                    # users, sessions, books, authors, shelf_items, reads, follows
│   ├── migrations/
│   │   └── 001_initial.sql
│   └── queries/                      # hand-run test queries
│       ├── user_tbr.sql
│       ├── finished_with_dates.sql
│       └── avg_rating.sql
│
├── web/                              # Next.js app, deployed to Vercel
│   ├── package.json
│   ├── .env.local                    # DATABASE_URL, GOOGLE_BOOKS_KEY (not committed)
│   ├── .env.example
│   ├── scripts/
│   │   └── seed-books.ts             # ISBN list → lookup → insert
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── login/page.tsx
│       │   ├── signup/page.tsx
│       │   ├── search/page.tsx
│       │   ├── book/[isbn]/page.tsx
│       │   ├── shelf/[status]/page.tsx
│       │   ├── stats/page.tsx
│       │   ├── u/[username]/page.tsx
│       │   └── api/
│       │       └── v1/               # ← everything here is callable from iOS too
│       │           ├── auth/
│       │           │   ├── signup/route.ts
│       │           │   ├── login/route.ts      # sets cookie AND returns { token, user }
│       │           │   └── logout/route.ts
│       │           ├── account/route.ts        # GET me, DELETE account
│       │           ├── search/route.ts
│       │           ├── books/[isbn]/route.ts
│       │           ├── shelf/route.ts          # ?status=&limit=&cursor=
│       │           ├── reads/route.ts
│       │           └── stats/route.ts          # analytics as JSON, so iOS can chart it too
│       ├── lib/
│       │   ├── db.ts
│       │   ├── http.ts               # json(), error(), requireSession() helpers
│       │   ├── books/
│       │   │   ├── isbn.ts
│       │   │   ├── openlibrary.ts
│       │   │   ├── googlebooks.ts
│       │   │   └── lookup.ts
│       │   ├── auth/
│       │   │   ├── password.ts
│       │   │   └── session.ts        # reads Bearer header OR cookie
│       │   └── stats/
│       │       └── reading.ts        # analytics queries
│       ├── components/
│       │   ├── SearchBar.tsx
│       │   ├── BookCard.tsx
│       │   ├── ShelfTabs.tsx
│       │   ├── FinishDialog.tsx
│       │   └── RatingInput.tsx
│       └── types/
│           └── api.ts                # Book, ShelfItem, Read, Paginated<T>, ApiError
│
└── ios/                              # later; empty for now
    └── BookTracker/
        ├── Models/                   # Codable structs mirroring types/api.ts
        ├── API/APIClient.swift
        ├── Auth/KeychainStore.swift
        └── Views/
```