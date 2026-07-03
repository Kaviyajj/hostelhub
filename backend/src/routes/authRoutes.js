const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.registerStudent);

// Private/Protected routes
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.put('/password', protect, authController.resetPassword);
router.post('/avatar', protect, upload.single('avatar'), authController.uploadProfilePicture);

module.exports = router;
