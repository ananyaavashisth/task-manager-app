const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const projectController = require('../controllers/projectController');

const router = express.Router();

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.use(authenticate);

// GET /api/projects
router.get('/', projectController.getProjects);

// POST /api/projects
router.post(
  '/',
  requireRole('ADMIN'),
  [
    body('name')
      .notEmpty().withMessage('Name is required')
      .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
    validate
  ],
  projectController.createProject
);

// GET /api/projects/:id
router.get('/:id', projectController.getProjectById);

// PUT /api/projects/:id
router.put(
  '/:id',
  [
    body('name')
      .optional()
      .notEmpty().withMessage('Name cannot be empty')
      .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
    validate
  ],
  projectController.updateProject
);

// DELETE /api/projects/:id
router.delete('/:id', projectController.deleteProject);

// POST /api/projects/:id/members
router.post(
  '/:id/members',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').optional().isIn(['ADMIN', 'MEMBER']).withMessage('Role must be ADMIN or MEMBER'),
    validate
  ],
  projectController.addMember
);

// DELETE /api/projects/:id/members/:userId
router.delete('/:id/members/:userId', projectController.removeMember);

module.exports = router;
