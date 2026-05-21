const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile, 
  updateUserProfile,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin
} = require('../controllers/authController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin-only user management routes
router.route('/users')
  .get(protect, admin, getAllUsers);

router.route('/users/:id')
  .put(protect, admin, updateUserByAdmin)
  .delete(protect, admin, deleteUserByAdmin);

module.exports = router;
