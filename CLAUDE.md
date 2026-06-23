# EA Calendar

School notice calendar app for parents. Upload a photo of a school notice (or manually create events) and the app organises everything into a shareable calendar.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Image Recognition**: OpenAI Vision API (gpt-4o) — extracts event details from school notice photos
- **Calendar UI**: FullCalendar (React)
- **i18n**: next-intl — English + HK Traditional Chinese (zh-HK)
- **Export**: ICS file generation for sharing

## Commands

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Architecture

```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── page.tsx          # Landing page — calendar view
│   └── api/
│       ├── recognize/    # POST: image → OpenAI Vision → parsed events
│       └── events/       # CRUD for calendar events via Supabase
├── components/           # React components
│   ├── NavMenu.tsx       # Top nav: "Upload Notice" + "Add Event" buttons
│   ├── Calendar.tsx      # Main responsive calendar
│   ├── PhotoUpload.tsx   # Photo upload / camera capture modal
│   ├── EventForm.tsx     # Manual event creation (with recurrence)
│   ├── EventPreview.tsx  # Review parsed event before saving
│   └── LanguageSwitcher.tsx
├── lib/                  # Shared utilities
│   ├── supabase.ts       # Supabase client
│   ├── openai.ts         # OpenAI client
│   ├── ics.ts            # ICS export
│   └── i18n.ts           # i18n config
├── messages/             # Translation files (en.json, zh-HK.json)
└── types/
    └── event.ts          # CalendarEvent, RecurrenceRule types
```

## Key Conventions

- API keys go in `.env.local` (never committed)
- Server-only code (OpenAI, Supabase writes) lives in `api/` route handlers
- Components are client components (`"use client"`) when they need interactivity
- All user-facing strings should use i18n translation keys
- HK Traditional Chinese (zh-HK), not Simplified Chinese

## Environment Variables

```
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
