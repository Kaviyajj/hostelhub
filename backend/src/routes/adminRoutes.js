const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes under /admin to ADMINS only
router.use(protect);
router.use(authorize('admin'));

// Analytics
router.get('/stats', adminController.getDashboardStats);

// Student Management CRUD
router.get('/students', adminController.getAllStudents);
router.post('/students', adminController.addStudent);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// Warden Management CRUD
router.get('/wardens', adminController.getAllWardens);
router.post('/wardens', adminController.addWarden);
router.put('/wardens/:id', adminController.updateWarden);
router.delete('/wardens/:id', adminController.deleteWarden);

// Block & Room Management
router.get('/blocks', adminController.getAllBlocks);
router.post('/blocks', adminController.addBlock);

router.get('/rooms', adminController.getAllRooms);
router.post('/rooms', adminController.addRoom);
router.put('/rooms/:id', adminController.updateRoom);
router.delete('/rooms/:id', adminController.deleteRoom);

// Room Allocation Workflows
router.post('/allocate', adminController.allocateRoom);
router.post('/vacate', adminController.vacateRoom);

// Database Utilities
router.get('/backup', adminController.backupDatabase);
router.post('/restore', adminController.restoreDatabase);

module.exports = router;
