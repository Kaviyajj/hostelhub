const {
  Student, RoomAllocation, Room, Block, Attendance,
  Complaint, LeaveRequest, Fee, Payment, Notification, User
} = require('../models');
const { logActivity } = require('../middleware/logger');

// 1. Get Student Dashboard details
exports.getStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { userId: req.user.id }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student details not found' });
    }

    // Room Details and Roommates
    const activeAllocation = await RoomAllocation.findOne({
      where: { studentId: student.id, status: 'active' },
      include: [{ model: Room, include: [Block] }]
    });

    let roomDetails = null;
    let roommates = [];

    if (activeAllocation) {
      roomDetails = activeAllocation.Room;
      
      // Fetch roommates in the same room (excluding self)
      const allocations = await RoomAllocation.findAll({
        where: { roomId: activeAllocation.roomId, status: 'active' },
        include: [{ model: Student, include: [User] }]
      });
      
      roommates = allocations
        .filter(a => a.studentId !== student.id)
        .map(a => ({
          name: a.Student.User.name,
          email: a.Student.User.email,
          phone: a.Student.phone,
          department: a.Student.department,
          year: a.Student.year
        }));
    }

    // Attendance stats
    const totalDays = await Attendance.count({ where: { studentId: student.id } });
    const presentDays = await Attendance.count({ where: { studentId: student.id, status: 'present' } });
    const leaveDays = await Attendance.count({ where: { studentId: student.id, status: 'leave' } });
    const attendancePercentage = totalDays > 0 
      ? Math.round(((presentDays + leaveDays) / totalDays) * 100) 
      : 100;

    // Complaints counts
    const pendingComplaints = await Complaint.count({ where: { studentId: student.id, status: 'pending' } });
    const totalComplaints = await Complaint.count({ where: { studentId: student.id } });

    res.status(200).json({
      success: true,
      student,
      roomDetails,
      roommates,
      attendance: {
        totalDays,
        presentDays,
        leaveDays,
        attendancePercentage
      },
      complaints: {
        pendingComplaints,
        totalComplaints
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching student dashboard' });
  }
};

// 2. Leave requests
exports.applyForLeave = async (req, res) => {
  const { startDate, endDate, reason } = req.body;
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student record not found' });

    const leave = await LeaveRequest.create({
      studentId: student.id,
      startDate,
      endDate,
      reason,
      status: 'pending'
    });

    await logActivity(req.user.id, 'LEAVE_APPLIED', `Student applied leave from ${startDate} to ${endDate}`);
    res.status(201).json({ success: true, message: 'Leave request submitted successfully', leave });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting leave request' });
  }
};

exports.getMyLeaveRequests = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student record not found' });

    const leaves = await LeaveRequest.findAll({
      where: { studentId: student.id },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching leave requests' });
  }
};

// 3. Complaints
exports.fileComplaint = async (req, res) => {
  const { type, description } = req.body;
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student record not found' });

    const complaint = await Complaint.create({
      studentId: student.id,
      type,
      description,
      status: 'pending'
    });

    await logActivity(req.user.id, 'COMPLAINT_FILED', `Student filed complaint category: ${type}`);
    res.status(201).json({ success: true, message: 'Complaint submitted successfully', complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error filing complaint' });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student record not found' });

    const complaints = await Complaint.findAll({
      where: { studentId: student.id },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching complaints' });
  }
};

// 4. Fees & Payments
exports.getMyFees = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student record not found' });

    const fees = await Fee.findAll({
      where: { studentId: student.id },
      include: [Payment],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, fees });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching fees info' });
  }
};

// Process mock payment
exports.payFees = async (req, res) => {
  const { feeId, amountPaid, paymentMethod } = req.body;
  try {
    const fee = await Fee.findByPk(feeId);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });

    const transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
    const payment = await Payment.create({
      feeId,
      amountPaid,
      paymentMethod,
      transactionId,
      receiptPdfUrl: `receipt_${transactionId}.pdf`
    });

    // Update Fee status
    const totalDues = parseFloat(fee.hostelFee) + parseFloat(fee.messFee);
    const payments = await Payment.findAll({ where: { feeId } });
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amountPaid), 0);

    if (totalPaid >= totalDues) {
      fee.status = 'paid';
    } else if (totalPaid > 0) {
      fee.status = 'partially_paid';
    } else {
      fee.status = 'pending';
    }
    await fee.save();

    await logActivity(req.user.id, 'FEE_PAID', `Paid amount ${amountPaid} for fee ID ${feeId}. TransID: ${transactionId}`);
    res.status(200).json({ success: true, message: 'Payment processed successfully (DEMO)', payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error processing fee payment' });
  }
};

// 5. Get Notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
};

exports.markNotificationRead = async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await Notification.findOne({ where: { id, userId: req.user.id } });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    notification.isRead = true;
    await notification.save();
    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error marking notification read' });
  }
};
