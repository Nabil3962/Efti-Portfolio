# Video editor portfolio with admin CMS

React, TypeScript, Vite, Tailwind, Supabase (Auth, Postgres, Storage), deployable to Netlify.

## 1. Create the Supabase project
1. Create a project at supabase.com.
2. Open SQL Editor, paste the contents of `supabase/schema.sql`, and run it. This creates the tables, Row Level Security policies, the `portfolio-videos` and `portfolio-images` buckets with their policies, and sample content.
3. Open Authentication, Providers, and keep Email enabled. Then open Authentication, Sign In / Providers settings and turn off "Allow new users to sign up". The policies treat every signed-in user as an admin, so sign-ups must stay closed.
4. Open Authentication, Users, click Add user, and create your admin email and password.
5. Open Project Settings, API, and copy the Project URL and the anon public key. Never use the service role key in this project.

## 2. Run locally
```
cp .env.example .env
npm install
npm run dev
```
Fill `.env` with the URL and anon key. Visit `/admin/login` and sign in.

## 3. Deploy to Netlify
1. Push the project to a GitHub repository.
2. In Netlify choose Add new site, Import from Git, and pick the repository.
3. Build command `npm run build`, publish directory `dist` (already set in `netlify.toml`, which also handles SPA redirects).
4. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then deploy.
5. In Supabase, Authentication, URL Configuration, set Site URL to your Netlify URL.

## Notes
- Upload limits: the Supabase free plan caps each file at 50 MB. Raise it under Storage settings on a paid plan. The form allows up to 500 MB, the project limit applies first.
- Videos are mp4, webm or mov. Browsers play H.264 mp4 most reliably. Export to mp4 before uploading.
- Delete the sample projects, testimonial and services from the admin when you are ready.
- Removing a project does not delete its files from Storage. Clear unused files from the Supabase Storage page occasionally.

## Troubleshooting
- Blank page with a configuration message: environment variables are missing, restart `npm run dev` after editing `.env`.
- "new row violates row-level security policy": you are signed out, or `schema.sql` did not finish. Sign in again and rerun the SQL.
- Upload fails on a large file: check the Supabase file size limit.
- 404 on refresh in production: confirm `netlify.toml` is in the repository root.
