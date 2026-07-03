const {
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
} = require('../models');

const seedDatabase = async () => {
  try {
    console.log('Starting Database Synchronization and Seeding...');
    
    // Sync DB (drops existing tables and recreates them)
    await sequelize.sync({ force: true });
    console.log('Database synced. Recreated all tables.');

    // 1. Create Users
    const users = await User.bulkCreate([
      { email: 'admin@hostelhub.com', password: 'adminpassword', role: 'admin', name: 'Super Admin' },
      { email: 'sarah.warden@hostelhub.com', password: 'wardenpassword', role: 'warden', name: 'Sarah Jenkins' },
      { email: 'robert.warden@hostelhub.com', password: 'wardenpassword', role: 'warden', name: 'Robert Vance' },
      { email: 'alice@hostelhub.com', password: 'studentpassword', role: 'student', name: 'Alice Cooper' },
      { email: 'charlie@hostelhub.com', password: 'studentpassword', role: 'student', name: 'Charlie Brown' },
      { email: 'emma@hostelhub.com', password: 'studentpassword', role: 'student', name: 'Emma Watson' },
      { email: 'david@hostelhub.com', password: 'studentpassword', role: 'student', name: 'David Beckham' }
    ], { individualHooks: true }); // Enable individual hooks for password hashing
    
    console.log('Seeded Users.');

    // 2. Create Blocks
    const blocks = await Block.bulkCreate([
      { name: 'Girls Block A', floors: 3 },
      { name: 'Boys Block B', floors: 3 }
    ]);
    console.log('Seeded Blocks.');

    // 3. Create Wardens
    const wardenSarah = await Warden.create({
      userId: users[1].id,
      phone: '9876543201',
      assignedBlockId: blocks[0].id // Girls Block A
    });
    
    const wardenRobert = await Warden.create({
      userId: users[2].id,
      phone: '9876543202',
      assignedBlockId: blocks[1].id // Boys Block B
    });
    console.log('Seeded Wardens.');

    // 4. Create Rooms
    const rooms = await Room.bulkCreate([
      // Girls Block Rooms
      { roomNumber: '101', blockId: blocks[0].id, floor: 1, capacity: 2, occupancy: 0, status: 'active' },
      { roomNumber: '102', blockId: blocks[0].id, floor: 1, capacity: 4, occupancy: 0, status: 'active' },
      { roomNumber: '201', blockId: blocks[0].id, floor: 2, capacity: 2, occupancy: 0, status: 'active' },
      { roomNumber: '202', blockId: blocks[0].id, floor: 2, capacity: 4, occupancy: 0, status: 'maintenance' },
      
      // Boys Block Rooms
      { roomNumber: '101', blockId: blocks[1].id, floor: 1, capacity: 2, occupancy: 0, status: 'active' },
      { roomNumber: '102', blockId: blocks[1].id, floor: 1, capacity: 4, occupancy: 0, status: 'active' },
      { roomNumber: '201', blockId: blocks[1].id, floor: 2, capacity: 2, occupancy: 0, status: 'active' },
      { roomNumber: '202', blockId: blocks[1].id, floor: 2, capacity: 4, occupancy: 0, status: 'active' }
    ]);
    console.log('Seeded Rooms.');

    // 5. Create Students
    const studentAlice = await Student.create({
      userId: users[3].id,
      registerNumber: 'REG2026001',
      gender: 'female',
      department: 'Computer Science',
      year: 2,
      phone: '9876543210',
      parentName: 'John Cooper',
      parentPhone: '9876543211',
      address: '123 Baker Street, London',
      photoUrl: '',
      qrCodeData: 'REG2026001:Alice Cooper:CS',
      admissionStatus: 'approved'
    });

    const studentCharlie = await Student.create({
      userId: users[4].id,
      registerNumber: 'REG2026002',
      gender: 'male',
      department: 'Mechanical Eng',
      year: 3,
      phone: '9876543220',
      parentName: 'Sally Brown',
      parentPhone: '9876543221',
      address: '456 Elm Street, California',
      photoUrl: '',
      qrCodeData: 'REG2026002:Charlie Brown:ME',
      admissionStatus: 'approved'
    });

    const studentEmma = await Student.create({
      userId: users[5].id,
      registerNumber: 'REG2026003',
      gender: 'female',
      department: 'Literature',
      year: 1,
      phone: '9876543230',
      parentName: 'Chris Watson',
      parentPhone: '9876543231',
      address: '789 Oak Lane, Paris',
      photoUrl: '',
      qrCodeData: 'REG2026003:Emma Watson:Lit',
      admissionStatus: 'approved'
    });

    const studentDavid = await Student.create({
      userId: users[6].id,
      registerNumber: 'REG2026004',
      gender: 'male',
      department: 'Sports Science',
      year: 4,
      phone: '9876543240',
      parentName: 'Ted Beckham',
      parentPhone: '9876543241',
      address: '321 Pine Avenue, Madrid',
      photoUrl: '',
      qrCodeData: 'REG2026004:David Beckham:SS',
      admissionStatus: 'approved'
    });

    console.log('Seeded Students.');

    // 6. Allocate Rooms and Update Occupancies
    // Alice in Girls Room 101 (Room index 0)
    await RoomAllocation.create({ studentId: studentAlice.id, roomId: rooms[0].id, allocationDate: '2026-06-01', status: 'active' });
    await rooms[0].increment('occupancy');

    // Charlie in Boys Room 101 (Room index 4)
    await RoomAllocation.create({ studentId: studentCharlie.id, roomId: rooms[4].id, allocationDate: '2026-06-01', status: 'active' });
    await rooms[4].increment('occupancy');

    // Emma in Girls Room 102 (Room index 1)
    await RoomAllocation.create({ studentId: studentEmma.id, roomId: rooms[1].id, allocationDate: '2026-06-15', status: 'active' });
    await rooms[1].increment('occupancy');

    // David in Boys Room 101 (Room index 4 - shared room)
    await RoomAllocation.create({ studentId: studentDavid.id, roomId: rooms[4].id, allocationDate: '2026-06-20', status: 'active' });
    await rooms[4].increment('occupancy');

    console.log('Seeded Room Allocations.');

    // 7. Seed Attendance
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    await Attendance.bulkCreate([
      { date: yesterday, studentId: studentAlice.id, status: 'present', markedByWardenId: wardenSarah.id },
      { date: yesterday, studentId: studentCharlie.id, status: 'present', markedByWardenId: wardenRobert.id },
      { date: yesterday, studentId: studentEmma.id, status: 'present', markedByWardenId: wardenSarah.id },
      { date: yesterday, studentId: studentDavid.id, status: 'absent', markedByWardenId: wardenRobert.id },
      
      { date: today, studentId: studentAlice.id, status: 'present', markedByWardenId: wardenSarah.id },
      { date: today, studentId: studentCharlie.id, status: 'present', markedByWardenId: wardenRobert.id },
      { date: today, studentId: studentEmma.id, status: 'leave', markedByWardenId: wardenSarah.id },
      { date: today, studentId: studentDavid.id, status: 'present', markedByWardenId: wardenRobert.id }
    ]);
    console.log('Seeded Attendance.');

    // 8. Seed Complaints
    await Complaint.bulkCreate([
      {
        studentId: studentCharlie.id,
        type: 'internet',
        description: 'Wi-Fi keeps disconnecting in room 101. Signal strength is too weak.',
        status: 'pending'
      },
      {
        studentId: studentAlice.id,
        type: 'furniture',
        description: 'The study chair has a broken leg.',
        status: 'resolved',
        assignedStaff: 'Carpenter Mark',
        resolutionNotes: 'Replaced with a new wooden study chair.'
      },
      {
        studentId: studentEmma.id,
        type: 'water',
        description: 'Leakage in the common bathroom faucet.',
        status: 'in_progress',
        assignedStaff: 'Plumber Mario',
        resolutionNotes: ''
      }
    ]);
    console.log('Seeded Complaints.');

    // 9. Seed Leave Requests
    await LeaveRequest.bulkCreate([
      {
        studentId: studentAlice.id,
        startDate: '2026-07-10',
        endDate: '2026-07-12',
        reason: "Attending my sister's wedding in home town.",
        status: 'approved',
        approvedByWardenId: wardenSarah.id
      },
      {
        studentId: studentCharlie.id,
        startDate: '2026-07-15',
        endDate: '2026-07-20',
        reason: 'Family medical emergency.',
        status: 'pending'
      },
      {
        studentId: studentDavid.id,
        startDate: '2026-06-25',
        endDate: '2026-06-28',
        reason: 'Attending external sports event.',
        status: 'rejected',
        approvedByWardenId: wardenRobert.id
      }
    ]);
    console.log('Seeded Leave Requests.');

    // 10. Seed Visitors
    await Visitor.bulkCreate([
      {
        visitorName: 'John Cooper',
        relationship: 'Father',
        mobileNumber: '9876543211',
        studentId: studentAlice.id,
        entryTime: new Date(Date.now() - 172800000), // 2 days ago
        exitTime: new Date(Date.now() - 165600000)
      },
      {
        visitorName: 'Lucy Brown',
        relationship: 'Sister',
        mobileNumber: '9876543222',
        studentId: studentCharlie.id,
        entryTime: new Date(Date.now() - 86400000), // yesterday
        exitTime: new Date(Date.now() - 82800000)
      },
      {
        visitorName: 'Alex Mercer',
        relationship: 'Friend',
        mobileNumber: '9876543299',
        studentId: studentDavid.id,
        entryTime: new Date(),
        exitTime: null // currently in hostel
      }
    ]);
    console.log('Seeded Visitors.');

    // 11. Seed Fees & Payments
    const feeAlice = await Fee.create({
      studentId: studentAlice.id,
      academicYear: '2025-2026',
      hostelFee: 50000.00,
      messFee: 30000.00,
      status: 'paid'
    });
    await Payment.create({
      feeId: feeAlice.id,
      amountPaid: 80000.00,
      paymentMethod: 'UPI',
      transactionId: 'TXN100018742',
      receiptPdfUrl: 'receipt_TXN100018742.pdf'
    });

    const feeCharlie = await Fee.create({
      studentId: studentCharlie.id,
      academicYear: '2025-2026',
      hostelFee: 50000.00,
      messFee: 30000.00,
      status: 'pending'
    });

    const feeEmma = await Fee.create({
      studentId: studentEmma.id,
      academicYear: '2025-2026',
      hostelFee: 50000.00,
      messFee: 30000.00,
      status: 'partially_paid'
    });
    await Payment.create({
      feeId: feeEmma.id,
      amountPaid: 40000.00,
      paymentMethod: 'NetBanking',
      transactionId: 'TXN100018745',
      receiptPdfUrl: 'receipt_TXN100018745.pdf'
    });

    const feeDavid = await Fee.create({
      studentId: studentDavid.id,
      academicYear: '2025-2026',
      hostelFee: 50000.00,
      messFee: 30000.00,
      status: 'paid'
    });
    await Payment.create({
      feeId: feeDavid.id,
      amountPaid: 80000.00,
      paymentMethod: 'CreditCard',
      transactionId: 'TXN100018749',
      receiptPdfUrl: 'receipt_TXN100018749.pdf'
    });
    console.log('Seeded Fees & Payments.');

    // 12. Seed Notices
    await Notice.bulkCreate([
      {
        title: 'Annual Hostel Fee Payment Deadline',
        description: 'All hostel residents are required to complete fee payments for the 2026 academic year by July 31, 2026. Late fees will apply thereafter. Please download and print your receipt after successful transactions.',
        category: 'general',
        publishDate: new Date(),
        authorId: users[0].id // Admin
      },
      {
        title: 'Mess Menu Committee Meeting',
        description: 'There will be an open feedback session this Friday at 5:00 PM in Block B Cafeteria. A new weekly menu will be finalized. Students are welcome to suggest healthy options.',
        category: 'mess',
        publishDate: new Date(),
        authorId: users[1].id // Warden Sarah
      },
      {
        title: 'Water Supply Maintenance Shutdown',
        description: 'Block A water supply will be shut down for routine pipeline maintenance this Saturday from 9:00 AM to 1:00 PM. Please store sufficient water.',
        category: 'maintenance',
        publishDate: new Date(),
        authorId: users[2].id // Warden Robert
      }
    ]);
    console.log('Seeded Notices.');

    // 13. Seed notifications
    await Notification.bulkCreate([
      { userId: users[3].id, title: 'Leave Approved', message: "Your leave application for 2026-07-10 has been approved by Warden Sarah.", isRead: false },
      { userId: users[4].id, title: 'Fee Overdue Notice', message: "Your fees for the academic year 2025-2026 are still pending.", isRead: false },
      { userId: users[5].id, title: 'Complaint Assigned', message: "Your complaint regarding bathroom faucet leakage has been assigned to Plumber Mario.", isRead: true }
    ]);
    console.log('Seeded Notifications.');

    // 14. Seed Activity Logs
    await ActivityLog.bulkCreate([
      { userId: users[0].id, action: 'USER_LOGIN', details: 'Admin logged in from IP 127.0.0.1' },
      { userId: users[0].id, action: 'ROOM_ALLOCATED', details: 'Student David Beckham assigned to Room B-101' },
      { userId: users[1].id, action: 'ATTENDANCE_MARKED', details: 'Sarah marked attendance for Girls Block A' },
      { userId: users[3].id, action: 'COMPLAINT_FILED', details: 'Alice Cooper filed complaint for broken study chair' }
    ]);
    console.log('Seeded Activity Logs.');

    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
};

// Execute if run directly
if (require.main === module) {
  seedDatabase();
}
