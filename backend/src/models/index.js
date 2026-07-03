const sequelize = require('../config/database');

const User = require('./User');
const Student = require('./Student');
const Warden = require('./Warden');
const Block = require('./Block');
const Room = require('./Room');
const RoomAllocation = require('./RoomAllocation');
const Attendance = require('./Attendance');
const Complaint = require('./Complaint');
const LeaveRequest = require('./LeaveRequest');
const Visitor = require('./Visitor');
const Fee = require('./Fee');
const Payment = require('./Payment');
const Notice = require('./Notice');
const Notification = require('./Notification');
const ActivityLog = require('./ActivityLog');

// 1. User <-> Student (One-to-One)
User.hasOne(Student, { foreignKey: 'userId', onDelete: 'CASCADE' });
Student.belongsTo(User, { foreignKey: 'userId' });

// 2. User <-> Warden (One-to-One)
User.hasOne(Warden, { foreignKey: 'userId', onDelete: 'CASCADE' });
Warden.belongsTo(User, { foreignKey: 'userId' });

// 3. Block <-> Warden (One-to-Many - Warden manages a Block)
Block.hasMany(Warden, { foreignKey: 'assignedBlockId', onDelete: 'SET NULL' });
Warden.belongsTo(Block, { foreignKey: 'assignedBlockId', as: 'AssignedBlock' });

// 4. Block <-> Room (One-to-Many)
Block.hasMany(Room, { foreignKey: 'blockId', onDelete: 'CASCADE' });
Room.belongsTo(Block, { foreignKey: 'blockId' });

// 5. Student <-> RoomAllocation (One-to-Many)
Student.hasMany(RoomAllocation, { foreignKey: 'studentId', onDelete: 'CASCADE' });
RoomAllocation.belongsTo(Student, { foreignKey: 'studentId' });

// 6. Room <-> RoomAllocation (One-to-Many)
Room.hasMany(RoomAllocation, { foreignKey: 'roomId', onDelete: 'CASCADE' });
RoomAllocation.belongsTo(Room, { foreignKey: 'roomId' });

// 7. Student <-> Attendance (One-to-Many)
Student.hasMany(Attendance, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Attendance.belongsTo(Student, { foreignKey: 'studentId' });

// 8. Warden <-> Attendance (One-to-Many)
Warden.hasMany(Attendance, { foreignKey: 'markedByWardenId', onDelete: 'SET NULL' });
Attendance.belongsTo(Warden, { foreignKey: 'markedByWardenId', as: 'MarkedByWarden' });

// 9. Student <-> Complaint (One-to-Many)
Student.hasMany(Complaint, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Complaint.belongsTo(Student, { foreignKey: 'studentId' });

// 10. Student <-> LeaveRequest (One-to-Many)
Student.hasMany(LeaveRequest, { foreignKey: 'studentId', onDelete: 'CASCADE' });
LeaveRequest.belongsTo(Student, { foreignKey: 'studentId' });

// 11. Warden <-> LeaveRequest (One-to-Many)
Warden.hasMany(LeaveRequest, { foreignKey: 'approvedByWardenId', onDelete: 'SET NULL' });
LeaveRequest.belongsTo(Warden, { foreignKey: 'approvedByWardenId', as: 'ApprovedByWarden' });

// 12. Student <-> Visitor (One-to-Many)
Student.hasMany(Visitor, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Visitor.belongsTo(Student, { foreignKey: 'studentId' });

// 13. Student <-> Fee (One-to-Many)
Student.hasMany(Fee, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Fee.belongsTo(Student, { foreignKey: 'studentId' });

// 14. Fee <-> Payment (One-to-Many)
Fee.hasMany(Payment, { foreignKey: 'feeId', onDelete: 'CASCADE' });
Payment.belongsTo(Payment, { foreignKey: 'feeId' }); // Correct: Payment belongs to Fee
// Let's correct this line: Payment belongsTo Fee
Payment.belongsTo(Fee, { foreignKey: 'feeId' });

// 15. User <-> Notice (One-to-Many)
User.hasMany(Notice, { foreignKey: 'authorId', onDelete: 'CASCADE' });
Notice.belongsTo(User, { foreignKey: 'authorId', as: 'Author' });

// 16. User <-> Notification (One-to-Many)
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// 17. User <-> ActivityLog (One-to-Many)
User.hasMany(ActivityLog, { foreignKey: 'userId', onDelete: 'SET NULL' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Student,
  Warden,
  Block,
  Room,
  RoomAllocation,
  Attendance,
  Complaint,
  LeaveRequest,
  Visitor,
  Fee,
  Payment,
  Notice,
  Notification,
  ActivityLog
};
