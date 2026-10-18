# Dream Jobs (Smart Career Planner)

An AI career explorer for kids in Grades 4 to 6. Kids tap through a short "About me" and 5-question quiz, get career matches with simple explanations and what to study, see a grade-by-grade adventure map, compare jobs, chat with Ollie the owl, and save or share a one-page plan.

## Run it

```bash
npm install
cp .env.example .env.local   # optional, see below
npm run dev
```

It works with no keys: matching uses a built-in career catalog and Ollie gives simple canned replies.

- `AI_GATEWAY_API_KEY` turns on AI-generated careers and the full Ollie chat (Vercel AI Gateway, default model `anthropic/claude-haiku-5-5`).
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (after running `supabase/schema.sql`) save answers and enable parent/teacher share links at `/plan/<id>`. The tables are locked by RLS and only reachable through three id-based functions, so the public key cannot list anyone's data.

## Kid safety

No logins or personal data: just a first name or nickname and an anonymous session id. Ollie's prompt keeps answers simple, on topic, and free of salary numbers or "you can't" language.

## Accounts

- **Parents and teachers** sign up at `/signup` (Supabase Auth, email + password) and manage kids at `/dashboard`: add a child with a nickname and a 4-number PIN, see their interests, job ideas and mission progress, play as them, change their PIN, or remove them.
- **Students** never need an email. They sign in at `/login` with the join code (like `OWL-7K3Q2`) and their PIN. Five wrong PINs lock that profile for 15 minutes.
- Progress follows each child across devices. Anyone can still try the app with no account.
- Setup: run `supabase/schema.sql`, then in Supabase go to Authentication > URL Configuration and add your site URL (for local development `http://localhost:3000`) and `http://localhost:3000/dashboard` as a redirect URL. Email confirmation is on by default; you can turn it off under Authentication > Sign In / Providers > Email for quicker testing.
