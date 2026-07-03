const PDFDocument = require('pdfkit');
const {
  Notice, Payment, Fee, Student, User, Room, Block, Attendance,
  Complaint, LeaveRequest, Visitor
} = require('../models');

// 1. Notice Board Controllers
exports.getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.findAll({
      order: [['publishDate', 'DESC']],
      include: [{ model: User, as: 'Author', attributes: ['name', 'role'] }]
    });
    res.status(200).json({ success: true, notices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching notices' });
  }
};

exports.createNotice = async (req, res) => {
  const { title, description, category } = req.body;
  try {
    let pdfUrl = '';
    if (req.file) {
      pdfUrl = `/uploads/pdfs/${req.file.filename}`;
    }

    const notice = await Notice.create({
      title,
      description,
      category,
      pdfUrl,
      publishDate: new Date(),
      authorId: req.user.id
    });

    res.status(201).json({ success: true, message: 'Notice published successfully', notice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error creating notice' });
  }
};

exports.deleteNotice = async (req, res) => {
  const { id } = req.params;
  try {
    const notice = await Notice.findByPk(id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });

    // Restrict deletion to author or admin
    if (notice.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this notice' });
    }

    await notice.destroy();
    res.status(200).json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting notice' });
  }
};

// 2. PDF Fee Receipt Generator
exports.downloadReceipt = async (req, res) => {
  const { paymentId } = req.params;
  try {
    const payment = await Payment.findByPk(paymentId, {
      include: [{
        model: Fee,
        include: [{
          model: Student,
          include: [User]
        }]
      }]
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-disposition', `attachment; filename=receipt_${payment.transactionId}.pdf`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    // Decorative colors & fonts
    doc.fillColor('#2563EB').fontSize(24).text('HOSTELHUB', 50, 50);
    doc.fillColor('#0D9488').fontSize(9).text('Smart Hostel Management System', 50, 78);
    doc.fillColor('#64748B').fontSize(9).text('Invoice Generated on: ' + new Date().toLocaleString(), 50, 90);

    // Invoice Meta Right-aligned
    doc.fillColor('#1E293B').fontSize(14).text('OFFICIAL RECEIPT', 350, 50, { align: 'right' });
    doc.fillColor('#64748B').fontSize(9).text('Txn Ref ID: ' + payment.transactionId, 350, 70, { align: 'right' });
    doc.text('Method: ' + payment.paymentMethod, 350, 82, { align: 'right' });
    doc.text('Status: Success', 350, 94, { align: 'right' });

    // Divider Line
    doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(50, 115).lineTo(550, 115).stroke();

    // Billed Student Information
    const student = payment.Fee.Student;
    doc.fillColor('#1E293B').fontSize(10).text('BILLED TO:', 50, 135, { underline: true });
    doc.fontSize(10).text(`Student Name: ${student.User.name}`, 50, 150);
    doc.text(`Register Number: ${student.registerNumber}`, 50, 165);
    doc.text(`Department: ${student.department} (${student.year} Year)`, 50, 180);
    doc.text(`Email: ${student.User.email} | Phone: ${student.phone}`, 50, 195);

    // Draw Table Header
    doc.fillColor('#F8FAFC').rect(50, 230, 500, 20).fill();
    doc.fillColor('#475569').fontSize(9).text('Fee Description', 60, 236);
    doc.text('Academic Year', 250, 236);
    doc.text('Amount Paid', 450, 236, { align: 'right' });

    // Draw Table Rows
    doc.fillColor('#1E293B').fontSize(9);
    
    // Hostel Fees Component
    doc.text('Hostel & Accomodation Installment', 60, 260);
    doc.text(payment.Fee.academicYear, 250, 260);
    doc.text(`INR ${parseFloat(payment.amountPaid).toLocaleString()}`, 450, 260, { align: 'right' });
    
    doc.strokeColor('#F1F5F9').lineWidth(1).moveTo(50, 280).lineTo(550, 280).stroke();

    // Summary calculations
    doc.fontSize(11).text('Net Total Paid: ', 300, 310, { align: 'right' });
    doc.fontSize(12).fillColor('#14B8A6').text(`INR ${parseFloat(payment.amountPaid).toLocaleString()}`, 450, 310, { align: 'right', bold: true });

    // Reset Color
    doc.fillColor('#64748B').fontSize(9);

    // Terms
    doc.text('Terms & Conditions:', 50, 360, { underline: true });
    doc.text('1. All payments made are subject to hostel terms and conditions.', 50, 375);
    doc.text('2. This is an electronically generated document. No signature is required.', 50, 388);
    
    // Footer
    doc.fontSize(8).text('© 2026 HostelHub College Campus Services Inc. All Rights Reserved.', 50, 600, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    res.status(500).json({ success: false, message: 'Error generating PDF receipt file' });
  }
};

// 3. Export Reports to CSV (Excel compatible)
exports.exportReportCSV = async (req, res) => {
  const { type } = req.query;
  try {
    let csvContent = '';
    let filename = `report_${type}_${Date.now()}.csv`;

    switch (type) {
      case 'students': {
        const students = await Student.findAll({ include: [{ model: User, attributes: ['name', 'email'] }] });
        csvContent = 'Student ID,Name,Email,Register Number,Gender,Department,Year,Phone,Parent Name,Parent Phone,Address,Admission Status\n';
        students.forEach(s => {
          csvContent += `"${s.id}","${s.User.name}","${s.User.email}","${s.registerNumber}","${s.gender}","${s.department}","${s.year}","${s.phone}","${s.parentName}","${s.parentPhone}","${s.address.replace(/"/g, '""')}","${s.admissionStatus}"\n`;
        });
        break;
      }
      case 'rooms': {
        const rooms = await Room.findAll({ include: [Block] });
        csvContent = 'Room ID,Room Number,Block Name,Floor,Capacity,Occupancy,Available Beds,Status\n';
        rooms.forEach(r => {
          csvContent += `"${r.id}","${r.roomNumber}","${r.Block.name}","${r.floor}","${r.capacity}","${r.occupancy}","${r.capacity - r.occupancy}","${r.status}"\n`;
        });
        break;
      }
      case 'fees': {
        const fees = await Fee.findAll({ include: [{ model: Student, include: [User] }] });
        csvContent = 'Fee ID,Student Name,Register Number,Academic Year,Hostel Fee,Mess Fee,Total Fee,Status\n';
        fees.forEach(f => {
          const total = parseFloat(f.hostelFee) + parseFloat(f.messFee);
          csvContent += `"${f.id}","${f.Student.User.name}","${f.Student.registerNumber}","${f.academicYear}","${f.hostelFee}","${f.messFee}","${total}","${f.status}"\n`;
        });
        break;
      }
      case 'attendance': {
        const attendance = await Attendance.findAll({ include: [{ model: Student, include: [User] }] });
        csvContent = 'Attendance ID,Date,Student Name,Register Number,Status\n';
        attendance.forEach(a => {
          csvContent += `"${a.id}","${a.date}","${a.Student.User.name}","${a.Student.registerNumber}","${a.status}"\n`;
        });
        break;
      }
      case 'complaints': {
        const complaints = await Complaint.findAll({ include: [{ model: Student, include: [User] }] });
        csvContent = 'Complaint ID,Student Name,Category,Description,Status,Assigned Staff,Resolution Notes\n';
        complaints.forEach(c => {
          csvContent += `"${c.id}","${c.Student.User.name}","${c.type}","${c.description.replace(/"/g, '""')}","${c.status}","${c.assignedStaff || ''}","${(c.resolutionNotes || '').replace(/"/g, '""')}"\n`;
        });
        break;
      }
      case 'leaves': {
        const leaves = await LeaveRequest.findAll({ include: [{ model: Student, include: [User] }] });
        csvContent = 'Leave ID,Student Name,Register Number,Start Date,End Date,Reason,Status\n';
        leaves.forEach(l => {
          csvContent += `"${l.id}","${l.Student.User.name}","${l.Student.registerNumber}","${l.startDate}","${l.endDate}","${l.reason.replace(/"/g, '""')}","${l.status}"\n`;
        });
        break;
      }
      default:
        return res.status(400).json({ success: false, message: 'Invalid report type requested' });
    }

    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-type', 'text/csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('CSV Export error:', error);
    res.status(500).json({ success: false, message: 'Error generating CSV report file' });
  }
};
