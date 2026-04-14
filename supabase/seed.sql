-- Supprimer les anciennes données
DELETE FROM public.order_items;
DELETE FROM public.orders;
DELETE FROM public.menu_items;
DELETE FROM public.categories;

-- Insérer les vraies catégories
INSERT INTO public.categories 
(id, name, name_ar, image_url, order_index) VALUES
('cat-1', 'Antipasti', 'مقبلات', '', 1),
('cat-2', 'Pasticcios', 'باستيتشيوس', '', 2),
('cat-3', 'Pizzas Feu de Bois', 'بيتزا بالحطب', '', 3),
('cat-4', 'Burgers', 'برغر', '', 4),
('cat-5', 'Pasta au Choix', 'معكرونة', '', 5),
('cat-6', 'Boissons Divers', 'مشروبات', '', 6);

-- Insérer les vrais produits
INSERT INTO public.menu_items
(name, name_ar, description, price, category_id, is_available, photo_url) VALUES

-- ANTIPASTI
('Croquette de poulet', 'كروكيت الدجاج', 'Croquettes de poulet croustillantes', 30, 'cat-1', true, ''),
('Crevette Pilpil', 'روبيان بيلبيل', 'Crevettes en sauce pilpil', 45, 'cat-1', true, ''),
('Croquettes pomme de terre à la truffe', 'كروكيت البطاطس بالكمأة', 'Croquettes de pomme de terre à la truffe', 55, 'cat-1', true, ''),
('Gambas popcorn', 'جامباس بوبكورن', 'Gambas façon popcorn', 55, 'cat-1', true, ''),

-- PASTICCIOS
('Pasticcio Viande Hachée', 'باستيتشيو باللحم', 'Pasticcio à la viande hachée', 45, 'cat-2', true, ''),
('Pasticcio Alfredo', 'باستيتشيو ألفريدو', 'Pasticcio sauce Alfredo', 45, 'cat-2', true, ''),
('Pasticcio Carbonara', 'باستيتشيو كاربونارا', 'Pasticcio sauce Carbonara', 45, 'cat-2', true, ''),

-- PIZZAS FEU DE BOIS
('Margarita Classica', 'مارغريتا كلاسيكية', 'Sauce tomate maison et mozzarella', 25, 'cat-3', true, ''),
('Végétarienne', 'نباتية', 'Sauce tomate, mozzarella, courgette, aubergine, champignons, tomates cerises, parmesan, brocoli', 55, 'cat-3', true, ''),
('Quattro Fromaggi Pizza', 'أربعة أجبان', 'Mozzarella, crème parmesan, gorgonzola, ricotta, parmesan, roquette', 55, 'cat-3', true, ''),
('Cannibale', 'كانيبال', 'Pepperoni, viande hachée, poivron, oignon, tomate marinée, huile d olive, sauce tomate, mozzarella', 55, 'cat-3', true, ''),
('Pepperoni', 'بيبيروني', 'Pepperoni, poivron, piment vert, oignon rouge, sauce tomate, mozzarella', 55, 'cat-3', true, ''),
('BBQ Chicken', 'دجاج باربيكيو', 'Poulet, sauce tomate barbecue maison, oignon rouge', 55, 'cat-3', true, ''),
('Tonno', 'تونة', 'Thon, oignon rouge, sauce tomate maison et mozzarella', 55, 'cat-3', true, ''),
('Carbonara Pizza', 'كاربونارا بيتزا', 'Crème parmesan, mozzarella, champignons, jambon fumé', 55, 'cat-3', true, ''),
('Viande Hachée Portofino', 'لحم مفروم بورتوفينو', 'Sauce tomate, mozzarella, poivrons, viande hachée, oignons, origan', 55, 'cat-3', true, ''),
('Alfredo Pizza', 'بيتزا ألفريدو', 'Crème parmesan, poulet, champignons, mozzarella, parmesan', 55, 'cat-3', true, ''),
('Duo Saumon Avocat', 'سلمون وأفوكادو', 'Crème parmesan, mozzarella, saumon fumé, avocat, tomate cerise', 75, 'cat-3', true, ''),
('Frutta Di Mare Pizza', 'ثمار البحر بيتزا', 'Crevette, moules, calamar, sauce tomate, fromage italien', 75, 'cat-3', true, ''),
('Truffy Pizza', 'بيتزا تروفي', 'Crème parmesan, crème de truffe, champignons, parmesan', 75, 'cat-3', true, ''),

-- BURGERS
('New York Burger', 'نيويورك برغر', 'Pain bun sauce maison, steak viande hachée 150g, cheddar fromage, cornichon, oignon, iceberg', 45, 'cat-4', true, ''),
('Chicken Mythic', 'تشيكن ميثيك', 'Pain bun sauce maison, poulet panné, laitue, tomate, oignon, cornichon, fromage cheddar', 45, 'cat-4', true, ''),
('Country Burger', 'كانتري برغر', 'Pain bun sauce maison, galette de pomme de terre, steak 150g, iceberg, tomate, oignon, cornichon, fromage cheddar', 55, 'cat-4', true, ''),
('Menu Enfants', 'قائمة الأطفال', 'Hamburger servi avec des frites', 35, 'cat-4', true, ''),

-- PASTA AU CHOIX
('Arabbiata', 'أرابياتا', 'Pâtes, sauce arrabiata et oignons', 35, 'cat-5', true, ''),
('Quattro Fromaggi Pasta', 'أربعة أجبان معكرونة', 'Crème parmesan, gorgonzola, ricotta, mozzarella', 50, 'cat-5', true, ''),
('Al Tonno', 'آل تونو', 'Crème parmesan, mozzarella, gorgonzola, parmesan, ricotta', 55, 'cat-5', true, ''),
('Pesto Basilico', 'بيستو بازيليكو', 'Pesto et basilic, parmesan', 55, 'cat-5', true, ''),
('Bolognaise', 'بولونيز', 'Viande hachée, oignon, céleri, carotte, sauce tomate maison', 55, 'cat-5', true, ''),
('Chicken Alfredo', 'دجاج ألفريدو', 'Poulet, champignon, oignon balsamique, muscade, fromage italien en sauce crémeuse', 55, 'cat-5', true, ''),
('Carbonara Pasta', 'كاربونارا معكرونة', 'Jambon, oignon, sauce crémeuse, fromage italien, persil', 55, 'cat-5', true, ''),
('Truffy Pasta', 'تروفي معكرونة', 'Crème de truffe, champignons, parmesan', 65, 'cat-5', true, ''),
('Duo Crevette et Saumon', 'روبيان وسلمون', 'Saumon, crevette, sauce fromage italien, ail, oignon, tomate cerise, persil', 70, 'cat-5', true, ''),
('Frutta Di Mare Pasta', 'ثمار البحر معكرونة', 'Moules, gambas, calamars, tomates cerises, ail, huile d olive', 75, 'cat-5', true, ''),

-- BOISSONS DIVERS
('Soda', 'صودا', 'Boisson gazeuse', 15, 'cat-6', true, ''),
('Eau Minérale 50ml', 'ماء معدني', 'Eau minérale 50ml', 10, 'cat-6', true, '');
