const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected — any authenticated user
router.get('/profile', authMiddleware, authController.getProfile);

// Admin only
router.get('/users', authMiddleware, roleMiddleware('admin'), authController.getAllUsers);
router.put('/users/:id', authMiddleware, roleMiddleware('admin'), authController.updateUser);
router.delete('/users/:id', authMiddleware, roleMiddleware('admin'), authController.deleteUser);

module.exports = router;
