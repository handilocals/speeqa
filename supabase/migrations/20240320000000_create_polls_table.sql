-- Create polls table
create table polls (
  id uuid default uuid_generate_v4() primary key,
  question text not null,
  user_id uuid references auth.users(id) not null,
  options jsonb not null,
  is_multiple_choice boolean default false,
  max_selections integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create poll_images bucket
insert into storage.buckets (id, name, public)
values ('poll-images', 'poll-images', true);

-- Set up storage policies for poll_images
create policy "Poll images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'poll-images' );

create policy "Users can upload their own poll images"
  on storage.objects for insert
  with check (
    bucket_id = 'poll-images'
    and auth.uid() = (storage.foldername(name))[1]::uuid
  );

create policy "Users can update their own poll images"
  on storage.objects for update
  using (
    bucket_id = 'poll-images'
    and auth.uid() = (storage.foldername(name))[1]::uuid
  );

create policy "Users can delete their own poll images"
  on storage.objects for delete
  using (
    bucket_id = 'poll-images'
    and auth.uid() = (storage.foldername(name))[1]::uuid
  );

-- Set up RLS policies for polls
alter table polls enable row level security;

create policy "Polls are viewable by everyone"
  on polls for select
  using ( true );

create policy "Users can create their own polls"
  on polls for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own polls"
  on polls for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own polls"
  on polls for delete
  using ( auth.uid() = user_id );

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_polls_updated_at
  before update on polls
  for each row
  execute function update_updated_at_column(); 