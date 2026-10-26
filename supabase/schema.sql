create extension if not exists "pgcrypto";

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text default '',
  category text default 'Other',
  client text default '',
  year text default '',
  video_url text,
  thumbnail_url text,
  featured boolean default false,
  published boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists site_content (
  id uuid primary key default gen_random_uuid(),
  section text not null unique,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  icon text default 'Film',
  sort_order int default 0,
  published boolean default true
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text default '',
  company text default '',
  testimonial text not null,
  avatar_url text,
  sort_order int default 0,
  published boolean default true
);

create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text default '',
  sort_order int default 0
);

alter table projects enable row level security;
alter table site_content enable row level security;
alter table services enable row level security;
alter table testimonials enable row level security;
alter table social_links enable row level security;

create policy "public reads published projects" on projects for select using (published = true);
create policy "admin manages projects" on projects for all to authenticated using (true) with check (true);
create policy "public reads content" on site_content for select using (true);
create policy "admin manages content" on site_content for all to authenticated using (true) with check (true);
create policy "public reads services" on services for select using (published = true);
create policy "admin manages services" on services for all to authenticated using (true) with check (true);
create policy "public reads testimonials" on testimonials for select using (published = true);
create policy "admin manages testimonials" on testimonials for all to authenticated using (true) with check (true);
create policy "public reads social" on social_links for select using (true);
create policy "admin manages social" on social_links for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public) values ('portfolio-videos', 'portfolio-videos', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('portfolio-images', 'portfolio-images', true) on conflict (id) do nothing;

create policy "public reads portfolio files" on storage.objects for select using (bucket_id in ('portfolio-videos', 'portfolio-images'));
create policy "admin uploads portfolio files" on storage.objects for insert to authenticated with check (bucket_id in ('portfolio-videos', 'portfolio-images'));
create policy "admin updates portfolio files" on storage.objects for update to authenticated using (bucket_id in ('portfolio-videos', 'portfolio-images'));
create policy "admin deletes portfolio files" on storage.objects for delete to authenticated using (bucket_id in ('portfolio-videos', 'portfolio-images'));

insert into site_content (section, content) values
('hero', '{"eyebrow":"Professional Video Editor","heading":"Crafting stories that move.","description":"I turn raw footage into engaging visual stories built for brands, creators, businesses and social media.","primaryCta":"View my work","secondaryCta":"Let''s work together","availability":"Available for freelance projects"}'),
('about', '{"heading":"The edit is where the story is found.","description":"Editor focused on pacing, sound and color.","biography":"Write your biography here. Describe your experience, the kinds of projects you take on and how you work with clients.","experience":"5+ years editing for brands and creators","skills":"Adobe Premiere Pro, Adobe After Effects, DaVinci Resolve, Adobe Photoshop, Adobe Audition, Motion Graphics, Color Grading, Sound Design, Storytelling","profileImage":""}'),
('contact', '{"heading":"Have a project in mind?","description":"Let''s create something people remember.","email":"your@email.com","phone":"","whatsapp":"","location":"Your Location","cta":"Send an email"}'),
('settings', '{"siteName":"YOUR NAME","title":"Professional Video Editor","description":"Video editing for brands, creators and businesses.","accent":"#8b7cff"}')
on conflict (section) do nothing;

insert into services (title, description, icon, sort_order) values
('Video editing', 'Turning raw footage into polished, engaging stories.', 'Film', 1),
('Motion graphics', 'Clean and dynamic motion graphics that strengthen your message.', 'Sparkles', 2),
('Color grading', 'Cinematic color treatment that gives every frame the right mood.', 'Palette', 3),
('Social media', 'Short-form edits made for TikTok, Reels, Shorts and other platforms.', 'Smartphone', 4);

insert into social_links (platform, url, sort_order) values
('Instagram', '', 1), ('YouTube', '', 2), ('Facebook', '', 3), ('LinkedIn', '', 4), ('Vimeo', '', 5), ('TikTok', '', 6);

insert into testimonials (name, role, company, testimonial, sort_order) values
('Sample client', 'Founder', 'Sample Co', 'Sample testimonial. Delete or replace it from the admin dashboard.', 1);

insert into projects (title, slug, description, category, client, year, featured, sort_order) values
('Sample commercial', 'sample-commercial', 'Sample project. Delete it from the admin dashboard and add your own.', 'Commercial', 'Sample Co', '2026', true, 1),
('Sample YouTube edit', 'sample-youtube-edit', 'Sample project.', 'YouTube', '', '2026', false, 2),
('Sample social cut', 'sample-social-cut', 'Sample project.', 'Social Media', '', '2026', false, 3);
