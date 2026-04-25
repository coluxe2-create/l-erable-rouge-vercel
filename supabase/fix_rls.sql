-- Vérifier et corriger les policies RLS
-- Ce script doit être exécuté dans le SQL Editor de Supabase

-- Activer RLS sur les tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
DROP POLICY IF EXISTS "Public can view active ads" ON public.advertisements;

-- Créer les nouvelles policies pour la lecture publique
CREATE POLICY "Public can view products" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Public can view categories" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Public can view active ads"
ON public.advertisements FOR SELECT 
USING (is_active = true);

-- Note: Pour les opérations d'écriture (INSERT, UPDATE, DELETE), 
-- elles sont généralement réservées aux administrateurs authentifiés.

-- Politiques de suppression pour l'admin
DROP POLICY IF EXISTS "Admin can delete orders" ON public.orders;
CREATE POLICY "Admin can delete orders"
ON public.orders FOR DELETE
USING (true);

DROP POLICY IF EXISTS "Admin can delete order_items" ON public.order_items;
CREATE POLICY "Admin can delete order_items"
ON public.order_items FOR DELETE
USING (true);
