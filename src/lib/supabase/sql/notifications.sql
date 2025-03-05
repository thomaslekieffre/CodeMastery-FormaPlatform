-- Création de la table notifications
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('new_course', 'forum_mention')),
  content text not null,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reference_id uuid
);

-- Activation de RLS
alter table notifications enable row level security;

-- Politique pour lire ses propres notifications
create policy "Users can read their own notifications"
  on notifications for select
  using (auth.uid() = user_id);

-- Politique pour marquer ses notifications comme lues
create policy "Users can update their own notifications"
  on notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Politique pour insérer des notifications
create policy "System can insert notifications"
  on notifications for insert
  with check (true);

-- Fonction pour notifier tous les utilisateurs d'un nouveau cours
create or replace function notify_new_course()
returns trigger as $$
begin
  insert into notifications (user_id, type, content, link, reference_id)
  select 
    id as user_id,
    'new_course' as type,
    'Un nouveau cours est disponible : ' || NEW.title as content,
    '/dashboard/courses/' || NEW.id as link,
    NEW.id as reference_id
  from auth.users;
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger pour les nouveaux cours
drop trigger if exists on_new_course on courses;
create trigger on_new_course
  after insert on courses
  for each row
  execute function notify_new_course();

-- Fonction pour notifier les mentions dans les commentaires
create or replace function notify_forum_mention()
returns trigger as $$
declare
  mentioned_user_id uuid;
  post_title text;
begin
  -- Extraire les mentions (@username et **@username**) du contenu
  for mentioned_user_id in
    select u.id
    from auth.users u
    where position('@' || u.raw_user_meta_data->>'username' in NEW.content) > 0
    or position('**@' || u.raw_user_meta_data->>'username' || '**' in NEW.content) > 0
  loop
    -- Récupérer le titre du post
    select title into post_title
    from posts
    where id = NEW.post_id;

    -- Créer une notification pour chaque utilisateur mentionné
    insert into notifications (
      user_id,
      type,
      content,
      link,
      reference_id
    ) values (
      mentioned_user_id,
      'forum_mention',
      'Vous avez été mentionné dans un commentaire sur : ' || post_title,
      '/dashboard/forum/' || NEW.post_id,
      NEW.id
    );
  end loop;

  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger pour les mentions dans les commentaires
drop trigger if exists on_forum_mention on comments;
create trigger on_forum_mention
  after insert on comments
  for each row
  execute function notify_forum_mention(); 