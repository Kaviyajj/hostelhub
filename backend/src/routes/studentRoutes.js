const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes under /student to STUDENTS
router.use(protect);
router.use(authorize('student'));

router.get('/dashboard', studentController.getStudentDashboard);

// Leaves management
router.post('/leave', studentController.applyForLeave);
router.get('/leave', studentController.getMyLeaveRequests);

// Complaints management
router.post('/complaint', studentController.fileComplaint);
router.get('/complaint', studentController.getMyComplaints);

// Fees & Payments
router.get('/fees', studentController.getMyFees);
router.post('/fees/pay', studentController.payFees);

// Notifications
router.get('/notifications', studentController.getMyNotifications);
router.put('/notifications/:id/read', studentController.markNotificationRead);

module.exports = router;
