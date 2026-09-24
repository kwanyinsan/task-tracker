const express = require('express');
const pool = require('../db');

const router = express.Router();

const allowedCategories = ['Work', 'Personal'];
const taskColumns = 'id, title, category, completed, created_at';

function isJsonObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

function parseTaskId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);

  if (!Number.isSafeInteger(id) || id > 2147483647) {
    return null;
  }

  return id;
}

// Implement GET: retrieve and filter tasks
router.get('/', async (req, res, next) => {
  try {
    const category = req.query.category;

    if (
      category !== undefined &&
      (
        typeof category !== 'string' ||
        !allowedCategories.includes(category)
      )
    ) {
      return res.status(400).json({
        error: 'Category must be Work or Personal.',
      });
    }

    let result;

    if (category === undefined) {
      result = await pool.query(
        `SELECT ${taskColumns}
         FROM tasks
         ORDER BY created_at DESC, id DESC`
      );
    } else {
      result = await pool.query(
        `SELECT ${taskColumns}
         FROM tasks
         WHERE category = $1
         ORDER BY created_at DESC, id DESC`,
        [category]
      );
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    return next(error);
  }
});

// Implement POST: create a new task
router.post('/', async (req, res, next) => {
  try {
    if (!isJsonObject(req.body)) {
      return res.status(400).json({
        error: 'Request body must be a JSON object.',
      });
    }

    const { title, category } = req.body;

    if (typeof title !== 'string') {
      return res.status(400).json({
        error: 'Title must be a string.',
      });
    }

    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0 || trimmedTitle.length > 200) {
      return res.status(400).json({
        error: 'Title must contain between 1 and 200 characters.',
      });
    }

    if (
      typeof category !== 'string' ||
      !allowedCategories.includes(category)
    ) {
      return res.status(400).json({
        error: 'Category must be Work or Personal.',
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, category)
       VALUES ($1, $2)
       RETURNING ${taskColumns}`,
      [trimmedTitle, category]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

// Implement PATCH: change completion status
router.patch('/:id', async (req, res, next) => {
  try {
    const id = parseTaskId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: 'Task ID must be a valid positive integer.',
      });
    }

    if (!isJsonObject(req.body)) {
      return res.status(400).json({
        error: 'Request body must be a JSON object.',
      });
    }

    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
      return res.status(400).json({
        error: 'Completed must be a boolean.',
      });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET completed = $1
       WHERE id = $2
       RETURNING ${taskColumns}`,
      [completed, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Task not found.',
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

// Implement DELETE: remove a task
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseTaskId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: 'Task ID must be a valid positive integer.',
      });
    }

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Task not found.',
      });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;