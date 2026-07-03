const {
  User, Student, Warden, Block, Room, RoomAllocation,
  Attendance, Complaint, LeaveRequest, Visitor, Fee, Payment,
  Notice, Notification, ActivityLog
} = require('../models');
const { Op } = require('sequelize');
const { logActivity } = require('../middleware/logger');

// 1. Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.count({ where: { admissionStatus: 'approved' } });
    const totalRooms = await Room.count();
    
    // Calculate Occupied and Available Beds
    const rooms = await Room.findAll();
    let occupiedBeds = 0;
    let totalCapacity = 0;
    rooms.forEach(r => {
      occupiedBeds += r.occupancy;
      totalCapacity += r.capacity;
    });
    const availableBeds = totalCapacity - occupiedBeds;

    const pendingComplaints = await Complaint.count({ where: { status: 'pending' } });
    const pendingLeaves = await LeaveRequest.count({ where: { status: 'pending' } });
    
    // Monthly Fee Collection (Sum amount paid in current month)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const payments = await Payment.findAll({
      include: [{
        model: Fee,
        required: true
      }]
    });
    
    let totalFeeCollected = 0;
    payments.forEach(p => {
      totalFeeCollected += parseFloat(p.amountPaid);
    });

    // Attendance percentage of today
    const today = new Date().toISOString().split('T')[0];
    const totalAttendanceCount = await Attendance.count({ where: { date: today } });
    const presentCount = await Attendance.count({ where: { date: today, status: 'present' } });
    const attendancePercentage = totalAttendanceCount > 0 
      ? Math.round((presentCount / totalAttendanceCount) * 100) 
      : 100; // Default to 100 if not marked yet

    // Recent activities (last 10 logs)
    const recentActivities = await ActivityLog.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['name', 'email'], required: false }]
    });

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalRooms,
        occupiedBeds,
        availableBeds,
        totalCapacity,
        pendingComplaints,
        pendingLeaves,
        totalFeeCollected,
        attendancePercentage
      },
      recentActivities
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
};

// 2. Manage Students
exports.getAllStudents = async (req, res) => {
  try {
    const { search, dept, year, status } = req.query;
    const whereClause = {};
    const userWhereClause = {};

    if (status) {
      whereClause.admissionStatus = status;
    }
    if (dept) {
      whereClause.department = dept;
    }
    if (year) {
      whereClause.year = parseInt(year);
    }
    if (search) {
      userWhereClause.name = { [Op.like]: `%${search}%` };
    }

    const students = await Student.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined,
          attributes: ['name', 'email']
        },
        {
          model: RoomAllocation,
          required: false,
          where: { status: 'active' },
          include: [{ model: Room, include: [Block] }]
        }
      ]
    });

    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Server error fetching students' });
  }
};

exports.addStudent = async (req, res) => {
  const {
    name, email, password, registerNumber, gender, department, year,
    phone, parentName, parentPhone, address
  } = req.body;

  try {
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const regExists = await Student.findOne({ where: { registerNumber } });
    if (regExists) {
      return res.status(400).json({ success: false, message: 'Register number already exists' });
    }

    const user = await User.create({ name, email, password, role: 'student' });
    const student = await Student.create({
      userId: user.id,
      registerNumber,
      gender,
      department,
      year,
      phone,
      parentName,
      parentPhone,
      address,
      qrCodeData: `${registerNumber}:${name}:${department}`,
      admissionStatus: 'approved' // Created by admin, auto-approved
    });

    await logActivity(req.user.id, 'STUDENT_ADDED', `Admin added student: ${email}`);
    res.status(201).json({ success: true, message: 'Student added successfully', student });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ success: false, message: 'Server error adding student' });
  }
};

exports.updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, email, department, year, phone, parentName, parentPhone, address, admissionStatus } = req.body;

  try {
    const student = await Student.findByPk(id, { include: [User] });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (email && email !== student.User.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) return res.status(400).json({ success: false, message: 'Email already exists' });
      student.User.email = email;
    }
    if (name) student.User.name = name;
    await student.User.save();

    if (department) student.department = department;
    if (year) student.year = parseInt(year);
    if (phone) student.phone = phone;
    if (parentName) student.parentName = parentName;
    if (parentPhone) student.parentPhone = parentPhone;
    if (address) student.address = address;
    if (admissionStatus) student.admissionStatus = admissionStatus;

    await student.save();
    await logActivity(req.user.id, 'STUDENT_UPDATED', `Updated student details: ${student.User.email}`);

    res.status(200).json({ success: true, message: 'Student updated successfully', student });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ success: false, message: 'Server error updating student' });
  }
};

exports.deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Decrement room occupancy if allocated
    const activeAllocation = await RoomAllocation.findOne({ where: { studentId: id, status: 'active' } });
    if (activeAllocation) {
      const room = await Room.findByPk(activeAllocation.roomId);
      if (room && room.occupancy > 0) {
        room.occupancy -= 1;
        await room.save();
      }
      activeAllocation.status = 'vacated';
      activeAllocation.vacateDate = new Date().toISOString().split('T')[0];
      await activeAllocation.save();
    }

    // Delete User (cascades to Student in DB relations)
    const user = await User.findByPk(student.userId);
    if (user) {
      await user.destroy();
    }

    await logActivity(req.user.id, 'STUDENT_DELETED', `Deleted student with ID: ${id}`);
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, message: 'Server error deleting student' });
  }
};

// 3. Manage Wardens
exports.getAllWardens = async (req, res) => {
  try {
    const wardens = await Warden.findAll({
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Block, as: 'AssignedBlock', attributes: ['id', 'name'] }
      ]
    });
    res.status(200).json({ success: true, wardens });
  } catch (error) {
    console.error('Error fetching wardens:', error);
    res.status(500).json({ success: false, message: 'Server error fetching wardens' });
  }
};

exports.addWarden = async (req, res) => {
  const { name, email, password, phone, assignedBlockId } = req.body;
  try {
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const user = await User.create({ name, email, password, role: 'warden' });
    const warden = await Warden.create({
      userId: user.id,
      phone,
      assignedBlockId: assignedBlockId || null
    });

    await logActivity(req.user.id, 'WARDEN_ADDED', `Admin added warden: ${email}`);
    res.status(201).json({ success: true, message: 'Warden added successfully', warden });
  } catch (error) {
    console.error('Error adding warden:', error);
    res.status(500).json({ success: false, message: 'Server error adding warden' });
  }
};

exports.updateWarden = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, assignedBlockId } = req.body;
  try {
    const warden = await Warden.findByPk(id, { include: [User] });
    if (!warden) {
      return res.status(404).json({ success: false, message: 'Warden not found' });
    }

    if (email && email !== warden.User.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) return res.status(400).json({ success: false, message: 'Email already exists' });
      warden.User.email = email;
    }
    if (name) warden.User.name = name;
    await warden.User.save();

    if (phone) warden.phone = phone;
    if (assignedBlockId !== undefined) {
      warden.assignedBlockId = assignedBlockId || null;
    }

    await warden.save();
    await logActivity(req.user.id, 'WARDEN_UPDATED', `Updated warden details: ${warden.User.email}`);

    res.status(200).json({ success: true, message: 'Warden updated successfully', warden });
  } catch (error) {
    console.error('Error updating warden:', error);
    res.status(500).json({ success: false, message: 'Server error updating warden' });
  }
};

exports.deleteWarden = async (req, res) => {
  const { id } = req.params;
  try {
    const warden = await Warden.findByPk(id);
    if (!warden) return res.status(404).json({ success: false, message: 'Warden not found' });

    const user = await User.findByPk(warden.userId);
    if (user) await user.destroy(); // Cascades delete

    await logActivity(req.user.id, 'WARDEN_DELETED', `Deleted warden with ID: ${id}`);
    res.status(200).json({ success: true, message: 'Warden deleted successfully' });
  } catch (error) {
    console.error('Error deleting warden:', error);
    res.status(500).json({ success: false, message: 'Server error deleting warden' });
  }
};

// 4. Manage Blocks & Rooms
exports.getAllBlocks = async (req, res) => {
  try {
    const blocks = await Block.findAll({
      include: [Room]
    });
    res.status(200).json({ success: true, blocks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching blocks' });
  }
};

exports.addBlock = async (req, res) => {
  const { name, floors } = req.body;
  try {
    const block = await Block.create({ name, floors });
    await logActivity(req.user.id, 'BLOCK_ADDED', `Created Block: ${name}`);
    res.status(201).json({ success: true, block });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding block' });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      include: [
        { model: Block },
        {
          model: RoomAllocation,
          where: { status: 'active' },
          required: false,
          include: [{ model: Student, include: [User] }]
        }
      ]
    });
    res.status(200).json({ success: true, rooms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching rooms' });
  }
};

exports.addRoom = async (req, res) => {
  const { roomNumber, blockId, floor, capacity } = req.body;
  try {
    const block = await Block.findByPk(blockId);
    if (!block) return res.status(400).json({ success: false, message: 'Invalid Block ID' });

    const roomExists = await Room.findOne({ where: { roomNumber, blockId } });
    if (roomExists) return res.status(400).json({ success: false, message: 'Room number already exists in this block' });

    const room = await Room.create({ roomNumber, blockId, floor, capacity });
    await logActivity(req.user.id, 'ROOM_ADDED', `Created Room ${roomNumber} in Block ${block.name}`);
    res.status(201).json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding room' });
  }
};

exports.updateRoom = async (req, res) => {
  const { id } = req.params;
  const { roomNumber, capacity, status } = req.body;
  try {
    const room = await Room.findByPk(id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    if (roomNumber) room.roomNumber = roomNumber;
    if (capacity) room.capacity = capacity;
    if (status) room.status = status;
    await room.save();

    res.status(200).json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating room' });
  }
};

exports.deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    const room = await Room.findByPk(id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    if (room.occupancy > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete an occupied room. Vacate students first.' });
    }

    await room.destroy();
    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting room' });
  }
};

// 5. Room Allocation workflow
exports.allocateRoom = async (req, res) => {
  const { studentId, roomId } = req.body;
  try {
    const student = await Student.findByPk(studentId, { include: [User] });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    if (room.occupancy >= room.capacity) {
      return res.status(400).json({ success: false, message: 'Room is fully occupied' });
    }

    // Vacate active room allocation if any
    const activeAllocation = await RoomAllocation.findOne({ where: { studentId, status: 'active' } });
    if (activeAllocation) {
      const oldRoom = await Room.findByPk(activeAllocation.roomId);
      if (oldRoom && oldRoom.occupancy > 0) {
        oldRoom.occupancy -= 1;
        await oldRoom.save();
      }
      activeAllocation.status = 'vacated';
      activeAllocation.vacateDate = new Date().toISOString().split('T')[0];
      await activeAllocation.save();
    }

    // Create new allocation
    const allocation = await RoomAllocation.create({
      studentId,
      roomId,
      allocationDate: new Date().toISOString().split('T')[0],
      status: 'active'
    });

    // Update room occupancy
    room.occupancy += 1;
    await room.save();

    await logActivity(req.user.id, 'ROOM_ALLOCATED', `Allocated Student ${student.User.name} to Room ${room.roomNumber}`);
    
    // Send Notification
    await Notification.create({
      userId: student.userId,
      title: 'Room Allocated',
      message: `You have been allocated Room ${room.roomNumber} on Floor ${room.floor}.`
    });

    res.status(200).json({ success: true, message: 'Room allocated successfully', allocation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error allocating room' });
  }
};

exports.vacateRoom = async (req, res) => {
  const { studentId } = req.body;
  try {
    const allocation = await RoomAllocation.findOne({ where: { studentId, status: 'active' } });
    if (!allocation) return res.status(404).json({ success: false, message: 'No active room allocation found' });

    const room = await Room.findByPk(allocation.roomId);
    if (room && room.occupancy > 0) {
      room.occupancy -= 1;
      await room.save();
    }

    allocation.status = 'vacated';
    allocation.vacateDate = new Date().toISOString().split('T')[0];
    await allocation.save();

    const student = await Student.findByPk(studentId, { include: [User] });
    await logActivity(req.user.id, 'ROOM_VACATED', `Vacated Student ${student.User.name} from Room`);

    await Notification.create({
      userId: student.userId,
      title: 'Room Vacated',
      message: 'You have checked out/vacated your hostel room.'
    });

    res.status(200).json({ success: true, message: 'Room vacated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error vacating room' });
  }
};

// 6. DB Backup and Restore (JSON dump style)
exports.backupDatabase = async (req, res) => {
  try {
    const backup = {
      users: await User.findAll(),
      students: await Student.findAll(),
      wardens: await Warden.findAll(),
      blocks: await Block.findAll(),
      rooms: await Room.findAll(),
      roomAllocations: await RoomAllocation.findAll(),
      attendance: await Attendance.findAll(),
      complaints: await Complaint.findAll(),
      leaveRequests: await LeaveRequest.findAll(),
      visitors: await Visitor.findAll(),
      fees: await Fee.findAll(),
      payments: await Payment.findAll(),
      notices: await Notice.findAll(),
      notifications: await Notification.findAll()
    };

    res.setHeader('Content-disposition', 'attachment; filename=hostelhub_backup.json');
    res.setHeader('Content-type', 'application/json');
    res.write(JSON.stringify(backup, null, 2));
    res.end();
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate backup file' });
  }
};

exports.restoreDatabase = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid backup file structure' });
    }

    const backup = req.body;
    console.log('Restoring data tables...');

    // Destroy and restore in dependency order
    await sequelize.sync({ force: true }); // Wipe clean

    if (backup.users) await User.bulkCreate(backup.users, { validate: true });
    if (backup.blocks) await Block.bulkCreate(backup.blocks);
    if (backup.wardens) await Warden.bulkCreate(backup.wardens);
    if (backup.rooms) await Room.bulkCreate(backup.rooms);
    if (backup.students) await Student.bulkCreate(backup.students);
    if (backup.roomAllocations) await RoomAllocation.bulkCreate(backup.roomAllocations);
    if (backup.attendance) await Attendance.bulkCreate(backup.attendance);
    if (backup.complaints) await Complaint.bulkCreate(backup.complaints);
    if (backup.leaveRequests) await LeaveRequest.bulkCreate(backup.leaveRequests);
    if (backup.visitors) await Visitor.bulkCreate(backup.visitors);
    if (backup.fees) await Fee.bulkCreate(backup.fees);
    if (backup.payments) await Payment.bulkCreate(backup.payments);
    if (backup.notices) await Notice.bulkCreate(backup.notices);
    if (backup.notifications) await Notification.bulkCreate(backup.notifications);

    await logActivity(req.user.id, 'DB_RESTORE', 'Database restored from backup file');
    res.status(200).json({ success: true, message: 'Database restored successfully' });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ success: false, message: 'Failed to restore database from backup' });
  }
};
