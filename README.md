# YTHWKND 2025/2026

A Next.js event registration app for a youth high school weekend event by YMFGAKL. Users register by choosing a hero class (Warrior, Archer, Scout, Guardian, Scholar) and joining one of 20 color-named teams (5 slots each). Registration syncs to Google Sheets.

## Tech Stack

- **Framework**: Next.js 16 with App Router (Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom parchment theme
- **UI Components**: Radix UI (Dialog, Label, RadioGroup, Select, Tooltip)
- **Animation**: Framer Motion
- **Cards**: 3D holographic class cards (react-parallax-tilt)
- **Form Handling**: React Hook Form with Zod validation
- **Database**: Neon Serverless Postgres (primary), Supabase (legacy)
- **Integrations**: Google Sheets sync, Google Analytics
- **Deployment**: Vercel

## Features

- 3D holographic class selection cards with tilt, sparkle, and team-color overlay effects
- Team registration with 20 color-named parties (5 hero slots each)
- Hero class system: Warrior, Archer, Scout, Guardian, Scholar
- Team invite links with shareable codes
- Real-time hero availability tracking
- Instagram handle display for claimed classes
- Parchment-themed UI with custom fonts (Jeju Hallasan, Jetsy Trial)
- Responsive design: compact holo badges on mobile, full portrait cards on desktop
- Google Sheets sync for registration data

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd ythwknd25
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
DATABASE_URL=your_neon_postgres_connection_string
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_SERVICE_ACCOUNT_KEY=your_google_service_account_json_or_base64
GOOGLE_SHEET_ID=your_google_sheet_id
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/
│   ├── (landing)/              # Marketing/landing page at /
│   ├── (everywhere-else)/      # Registration flows (/register, /invite/[code])
│   ├── api/                    # API routes (register, hero-availability, team-invite, sheets-sync)
│   └── design-lab/             # Design lab for iterating on UI components
├── components/
│   ├── ui/                     # UI primitives (button, dialog, holo-card, etc.)
│   └── ...                     # Feature components (registration, navbar, etc.)
├── lib/                        # Utilities, constants, DB clients
└── styles/                     # Custom fonts (Jeju Hallasan, Jetsy Trial)
```

## Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run lint` - ESLint
- `npx tsc --noEmit` - Type check without emitting

## Deployment

The application is configured for deployment on Vercel. Connect your repository for automatic deployments.

## License

This project is private and confidential.
