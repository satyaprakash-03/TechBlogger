const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getNotifications)
  .delete(protect, clearNotifications);

router.put('/read-all', protect, markAllAsRead);

router.route('/:id/read')
  .put(protect, markAsRead);

router.route('/:id')
  .delete(protect, deleteNotification);

module.exports = router;
