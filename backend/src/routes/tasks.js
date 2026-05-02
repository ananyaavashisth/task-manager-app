const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const taskController = require('../controllers/taskController');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.use(authenticate);

// We mount this router at /api so we define full paths
router.get('/projects/:projectId/tasks', taskController.getProjectTasks);

router.post(
  '/projects/:projectId/tasks',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']).withMessage('Invalid status'),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority'),
    validate
  ],
  taskController.createTask
);

router.get('/tasks/:id', taskController.getTaskById);

router.put(
  '/tasks/:id',
  [
    body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']).withMessage('Invalid status'),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority'),
    validate
  ],
  taskController.updateTask
);

router.delete('/tasks/:id', taskController.deleteTask);

module.exports = router;
