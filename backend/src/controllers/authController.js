const jwt = require('jsonwebtoken');
const { User, Student, Warden } = require('../models');
const { logActivity } = require('../middleware/logger');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'hostelhub_secret_key_987654321', {
    expiresIn: '30d',
  });
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      await logActivity(null, 'LOGIN_FAILED', `Attempted email: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    
    // Fetch associated roles for the payload
    let studentDetails = null;
    let wardenDetails = null;

    if (user.role === 'student') {
      studentDetails = await Student.findOne({ where: { userId: user.id } });
    } else if (user.role === 'warden') {
      wardenDetails = await Warden.findOne({ where: { userId: user.id } });
    }

    await logActivity(user.id, 'LOGIN_SUCCESS', `User logged in: ${user.email}`);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        student: studentDetails,
        warden: wardenDetails
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// Register a Student (Self-registration/Admission application)
exports.registerStudent = async (req, res) => {
  const {
    name, email, password, registerNumber, gender, department, year,
    phone, parentName, parentPhone, address
  } = req.body;

  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const regExists = await Student.findOne({ where: { registerNumber } });
    if (regExists) {
      return res.status(400).json({ success: false, message: 'Register number already exists' });
    }

    // Create auth user
    const user = await User.create({
      name,
      email,
      password,
      role: 'student'
    });

    // Create student details (defaults to pending admission status)
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
      admissionStatus: 'pending' // Student must be approved by admin
    });

    await logActivity(user.id, 'STUDENT_REGISTERED', `Student registered: ${email} (Pending approval)`);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Application pending admin approval.',
      student
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// Get current logged in user details
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Student, required: false },
        { model: Warden, required: false }
      ]
    });
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user details' });
  }
};

// Update profile details
exports.updateProfile = async (req, res) => {
  const { name, phone, parentName, parentPhone, address } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update name
    if (name) {
      user.name = name;
      await user.save();
    }

    if (user.role === 'student') {
      const student = await Student.findOne({ where: { userId: user.id } });
      if (student) {
        if (phone) student.phone = phone;
        if (parentName) student.parentName = parentName;
        if (parentPhone) student.parentPhone = parentPhone;
        if (address) student.address = address;
        await student.save();
      }
    } else if (user.role === 'warden') {
      const warden = await Warden.findOne({ where: { userId: user.id } });
      if (warden) {
        if (phone) warden.phone = phone;
        await warden.save();
      }
    }

    await logActivity(user.id, 'PROFILE_UPDATED', `User updated profile info`);

    // Fetch updated user
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Student, required: false },
        { model: Warden, required: false }
      ]
    });

    res.status(200).json({ success: true, message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const imageUrl = `/uploads/images/${req.file.filename}`;

    if (req.user.role === 'student') {
      const student = await Student.findOne({ where: { userId: req.user.id } });
      if (student) {
        student.photoUrl = imageUrl;
        await student.save();
      }
    }

    await logActivity(req.user.id, 'AVATAR_UPLOADED', `Uploaded profile photo`);

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ success: false, message: 'Server error uploading profile picture' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save(); // Save hook will hash the new password

    await logActivity(user.id, 'PASSWORD_RESET', 'User reset password');

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: 'Server error resetting password' });
  }
};
