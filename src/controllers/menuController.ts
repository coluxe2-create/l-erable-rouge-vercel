import { Request, Response } from 'express';
import pool from '../db.ts';

// Categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY order_index ASC');
    res.json(result?.rows || []);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des catégories.',
      details: error.message 
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, name_ar, description, order_index } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categories (name, name_ar, description, order_index) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, name_ar, description, order_index]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la catégorie.' });
  }
};

// Menu Items
export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT m.*, c.name as category_name 
      FROM products m 
      LEFT JOIN categories c ON m.category_id = c.id 
      ORDER BY c.order_index, m.name
    `);
    res.json(result?.rows || []);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du menu.' });
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  const { category_id, name, name_ar, description, price, is_available } = req.body;
  const image_url = req.file ? (req.file as any).path : null;

  try {
    const result = await pool.query(
      'INSERT INTO products (category_id, name, name_ar, description, price, image_url, is_available) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [category_id, name, name_ar, description, price, image_url, is_available !== undefined ? is_available : true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de l\'article.' });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { category_id, name, name_ar, description, price, is_available } = req.body;
  const image_url = req.file ? (req.file as any).path : undefined;

  try {
    let query = 'UPDATE products SET category_id = $1, name = $2, name_ar = $3, description = $4, price = $5, is_available = $6';
    let params = [category_id, name, name_ar, description, price, is_available];
    
    if (image_url) {
      query += ', image_url = $7 WHERE id = $8 RETURNING *';
      params.push(image_url, id);
    } else {
      query += ' WHERE id = $7 RETURNING *';
      params.push(id);
    }

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'article.' });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Article supprimé.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
};
