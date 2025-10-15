-- Add avatar customization columns to characters table
ALTER TABLE public.characters 
ADD COLUMN IF NOT EXISTS avatar_gender TEXT NOT NULL DEFAULT 'male' CHECK (avatar_gender IN ('male', 'female', 'neutral')),
ADD COLUMN IF NOT EXISTS avatar_skin_tone TEXT NOT NULL DEFAULT 'medium' CHECK (avatar_skin_tone IN ('verylight', 'light', 'medium', 'tan', 'dark', 'verydark'));