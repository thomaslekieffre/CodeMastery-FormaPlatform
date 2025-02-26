-- Désactiver temporairement RLS pour les modifications
ALTER TABLE exercises DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les exercices publiés" ON exercises;
DROP POLICY IF EXISTS "Seuls les admins peuvent créer des exercices" ON exercises;
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier des exercices" ON exercises;
DROP POLICY IF EXISTS "Seuls les admins peuvent supprimer des exercices" ON exercises;

-- Ajouter la colonne is_published si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'exercises' AND column_name = 'is_published') THEN
        ALTER TABLE exercises ADD COLUMN is_published BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Mettre à jour les exercices existants
UPDATE exercises SET is_published = true WHERE is_published IS NULL;

-- Activer RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Créer une politique de lecture simple
CREATE POLICY "exercises_select_policy" ON exercises
    FOR SELECT
    TO authenticated
    USING (
        is_published = true 
        OR (
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE auth.users.id = auth.uid() 
                AND auth.users.raw_user_meta_data->>'role' = 'admin'
            )
        )
    );

-- Créer une politique d'écriture pour les admins
CREATE POLICY "exercises_insert_policy" ON exercises
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "exercises_update_policy" ON exercises
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "exercises_delete_policy" ON exercises
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    ); 