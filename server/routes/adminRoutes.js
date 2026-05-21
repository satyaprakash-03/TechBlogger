const express = require('express');
const router = express.Router();
const {
  getDbStats,
  getDbBackup,
  restoreDb,
  getCollectionDocuments,
  createDocument,
  updateDocument,
  deleteDocument
} = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

// All routes here are admin protected
router.use(protect);
router.use(admin);

router.get('/db/stats', getDbStats);
router.get('/db/backup', getDbBackup);
router.post('/db/restore', restoreDb);

router.route('/db/collections/:collectionName')
  .get(getCollectionDocuments)
  .post(createDocument);

router.route('/db/collections/:collectionName/:id')
  .put(updateDocument)
  .delete(deleteDocument);

module.exports = router;
