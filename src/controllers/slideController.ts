import { Request, Response } from 'express';
import pool from '../db.ts';

export const getSlides = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM slides ORDER BY order_index ASC');
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching slides:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des slides.',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const createSlide = async (req: Request, res: Response) => {
  const { titre, description, order_index, actif } = req.body;
  const photo_url = req.file ? (req.file as any).path : null;

  if (!photo_url) {
    return res.status(400).json({ error: 'La photo est obligatoire.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO slides (photo_url, titre, description, order_index, actif) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [photo_url, titre, description, order_index || 0, actif !== undefined ? actif : true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la slide.' });
  }
};

export const updateSlide = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { titre, description, order_index, actif } = req.body;
  const photo_url = req.file ? (req.file as any).path : undefined;

  try {
    let query = 'UPDATE slides SET titre = $1, description = $2, order_index = $3, actif = $4';
    let params = [titre, description, order_index, actif];
    
    if (photo_url) {
      query += ', photo_url = $5 WHERE id = $6 RETURNING *';
      params.push(photo_url, id);
    } else {
      query += ' WHERE id = $5 RETURNING *';
      params.push(id);
    }

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la slide.' });
  }
};

export const deleteSlide = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM slides WHERE id = $1', [id]);
    res.json({ message: 'Slide supprimée.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
};

export const reorderSlides = async (req: Request, res: Response) => {
  const { slides } = req.body; // Array of { id, order_index }
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const slide of slides) {
        await client.query('UPDATE slides SET order_index = $1 WHERE id = $2', [slide.order_index, slide.id]);
      }
      await client.query('COMMIT');
      res.json({ message: 'Ordre mis à jour.' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'ordre.' });
  }
};
