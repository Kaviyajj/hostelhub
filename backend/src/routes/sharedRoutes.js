const express = require('express');
const router = express.Router();
const sharedController = require('../controllers/sharedController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Notices routes (All authenticated users can view, only Admin/Warden can create/delete)
router.get('/notices', protect, sharedController.getAllNotices);
router.post('/notices', protect, authorize('admin', 'warden'), upload.single('pdf'), sharedController.createNotice);
router.delete('/notices/:id', protect, sharedController.deleteNotice);

// Receipts - public/student viewable
router.get('/receipts/:paymentId', protect, sharedController.downloadReceipt);

// Reports export - restricted to Admins and Wardens
router.get('/reports', protect, authorize('admin', 'warden'), sharedController.exportReportCSV);

module.exports = router;
