
-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text not null,
  email text not null,
  role text not null,
  points integer default 0,
  avatar text,
  bio text,
  location text,
  phone text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create security policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Function to handle new user sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    name,
    email,
    role,
    avatar
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'volunteer'),
    'https://i.pravatar.cc/150?img=' || floor(random() * 70 + 1)::text
  );
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Set up Row-Level Security for profiles
create policy "Allow users to read their own profile"
  on profiles
  for select
  using (auth.uid() = id);
