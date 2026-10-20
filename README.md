# Smart Career Planner

An AI career explorer for kids in Grades 4 to 6. Kids tap through a short "About me" and 5-question quiz, get career matches with simple explanations and what to study, see a grade-by-grade adventure map, compare jobs, chat with Ollie the owl, and save or share a one-page plan.

## Run it

```bash
npm install
cp .env.example .env.local   # optional, see below
npm run dev
```

It works with no keys: matching uses a built-in career catalog and Ollie gives simple canned replies.

- `AI_GATEWAY_API_KEY` turns on AI-generated careers and the full Ollie chat (Vercel AI Gateway, default model `anthropic/claude-haiku-5-5`).
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (after running `supabase/schema.sql`) save answers and enable accounts, saved progress and private share links at `/plan/<id>`. Tables are locked by Row Level Security, so the public key cannot read anyone else's data.

## Kid safety

No logins or personal data: just a first name or nickname and an anonymous session id. Ollie's prompt keeps answers simple, on topic, and free of salary numbers or "you can't" language.

## Accounts

One simple login for everyone: sign up at `/signup` and sign in at `/login` with an email and password (Supabase Auth). There are no separate student, parent or teacher accounts.

- **Everyone must sign in to use the app.** Signed-out visitors are sent to `/login`, and the AI and plan API routes return 401 without a valid login.
- Each person's answers, job ideas and plan are saved to their own account and follow them across devices. Row Level Security means nobody can read anyone else's progress.
- The only public page is a read-only shared plan (`/plan/<id>`), opened from a private link the person chooses to send.
- Younger children should sign up with a grown-up's help.
- Setup: run `supabase/schema.sql`, then in Supabase go to Authentication > URL Configuration and add your site URL (for local development `http://localhost:3000`) as a redirect URL. Email confirmation is on by default; you can turn it off under Authentication > Sign In / Providers > Email for quicker testing.
