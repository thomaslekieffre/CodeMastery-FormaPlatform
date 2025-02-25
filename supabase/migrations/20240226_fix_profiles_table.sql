-- Vérifier et corriger la structure de la table profiles

-- Vérifier si la colonne updated_at existe, sinon l'ajouter
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- Mettre à jour la colonne updated_at pour tous les profils existants
UPDATE public.profiles 
SET updated_at = now() 
WHERE updated_at IS NULL;

-- Vérifier si la colonne created_at existe, sinon l'ajouter
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- Mettre à jour la colonne created_at pour tous les profils existants
UPDATE public.profiles 
SET created_at = now() 
WHERE created_at IS NULL;

-- Rafraîchir le cache du schéma
NOTIFY pgrst, 'reload schema'; 