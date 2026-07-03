const {
  Warden, Student, User, Room, Block, RoomAllocation,
  Attendance, LeaveRequest, Complaint, Visitor, Notice, Notification
} = require('../models');
const { logActivity } = require('../middleware/logger');

// 1. Get Assigned Block details
exports.getAssignedBlockDetails = async (req, res) => {
  try {
    const warden = await Warden.findOne({
      where: { userId: req.user.id },
      include: [{ model: Block, as: 'AssignedBlock' }]
    });

    if (!warden || !warden.assignedBlockId) {
      return res.status(200).json({
        success: true,
        message: 'No block assigned to this warden',
        block: null,
        rooms: [],
        students: []
      });
    }

    const rooms = await Room.findAll({
      where: { blockId: warden.assignedBlockId },
      include: [
        {
          model: RoomAllocation,
          where: { status: 'active' },
          required: false,
          include: [{ model: Student, include: [User] }]
        }
      ]
    });

    // Get all students residing in this block
    const roomIds = rooms.map(r => r.id);
    const allocations = await RoomAllocation.findAll({
      where: { roomId: roomIds, status: 'active' },
      include: [{ model: Student, include: [User] }]
    });
    const students = allocations.map(a => a.Student);

    res.status(200).json({
      success: true,
      block: warden.AssignedBlock,
      rooms,
      students
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching assigned block details' });
  }
};

// 2. Mark Daily Attendance
exports.markAttendance = async (req, res) => {
  const { date, attendanceRecords } = req.body; // Array: [{ studentId, status }]
  try {
    const warden = await Warden.findOne({ where: { userId: req.user.id } });
    if (!warden) return res.status(403).json({ success: false, message: 'Warden record not found' });

    for (const record of attendanceRecords) {
      const { studentId, status } = record;
      // Upsert (update or insert) attendance record
      const existing = await Attendance.findOne({ where: { date, studentId } });
      if (existing) {
        existing.status = status;
        existing.markedByWardenId = warden.id;
        await existing.save();
      } else {
        await Attendance.create({
          date,
          studentId,
          status,
          markedByWardenId: warden.id
        });
      }
    }

    await logActivity(req.user.id, 'ATTENDANCE_MARKED', `Warden marked attendance for date: ${date}`);
    res.status(200).json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error marking attendance' });
  }
};

// 3. Handle leave requests
exports.reviewLeaveRequest = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'
  try {
    const warden = await Warden.findOne({ where: { userId: req.user.id } });
    const leave = await LeaveRequest.findByPk(id, { include: [{ model: Student, include: [User] }] });
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });

    leave.status = status;
    leave.approvedByWardenId = warden ? warden.id : null;
    await leave.save();

    await logActivity(req.user.id, 'LEAVE_REVIEWED', `Leave request ID ${id} set to ${status}`);

    // Create student notification
    await Notification.create({
      userId: leave.Student.userId,
      title: `Leave ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your leave request from ${leave.startDate} to ${leave.endDate} has been ${status}.`
    });

    res.status(200).json({ success: true, message: `Leave request ${status} successfully`, leave });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error reviewing leave request' });
  }
};

// 4. Update complaint status
exports.updateComplaint = async (req, res) => {
  const { id } = req.params;
  const { status, assignedStaff, resolutionNotes } = req.body;
  try {
    const complaint = await Complaint.findByPk(id, { include: [{ model: Student, include: [User] }] });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (status) complaint.status = status;
    if (assignedStaff) complaint.assignedStaff = assignedStaff;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    await complaint.save();

    await logActivity(req.user.id, 'COMPLAINT_UPDATED', `Complaint ID ${id} status updated to ${status}`);

    // Notify student
    await Notification.create({
      userId: complaint.Student.userId,
      title: 'Complaint Update',
      message: `Your complaint regarding ${complaint.type} has been updated to "${status}".`
    });

    res.status(200).json({ success: true, message: 'Complaint updated successfully', complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating complaint' });
  }
};

// 5. Manage Visitors
exports.addVisitorLog = async (req, res) => {
  const { visitorName, relationship, mobileNumber, studentId } = req.body;
  try {
    const visitor = await Visitor.create({
      visitorName,
      relationship,
      mobileNumber,
      studentId,
      entryTime: new Date()
    });

    await logActivity(req.user.id, 'VISITOR_CHECKIN', `Logged visitor entry: ${visitorName}`);
    res.status(201).json({ success: true, message: 'Visitor entry logged successfully', visitor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging visitor entry' });
  }
};

exports.checkoutVisitor = async (req, res) => {
  const { id } = req.params;
  try {
    const visitor = await Visitor.findByPk(id);
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor log not found' });

    visitor.exitTime = new Date();
    await visitor.save();

    await logActivity(req.user.id, 'VISITOR_CHECKOUT', `Logged visitor checkout: ${visitor.visitorName}`);
    res.status(200).json({ success: true, message: 'Visitor checkout logged successfully', visitor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging visitor checkout' });
  }
};
