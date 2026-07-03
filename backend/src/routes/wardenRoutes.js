const express = require('express');
const router = express.Router();
const wardenController = require('../controllers/wardenController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes under /warden to WARDENS (and admins, in case admins want to perform warden actions)
router.use(protect);
router.use(authorize('warden', 'admin'));

router.get('/block', wardenController.getAssignedBlockDetails);
router.post('/attendance', wardenController.markAttendance);
router.put('/leave/:id', wardenController.reviewLeaveRequest);
router.put('/complaint/:id', wardenController.updateComplaint);

// Visitor logging routes
router.post('/visitor', wardenController.addVisitorLog);
router.put('/visitor/:id/checkout', wardenController.checkoutVisitor);

module.exports = router;
