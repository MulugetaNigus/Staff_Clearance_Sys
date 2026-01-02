const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Create new user by admin
exports.createUser = async (req, res) => {
  const { name, email, password, role, department, contactInfo } = req.body;

  try {
    if (!name || !email || !password || !role || !department || !contactInfo) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required (name, email, password, role, department, contactInfo)'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const username = User.generateUsername(name);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      role,
      department,
      contactInfo,
      username,
      password, // Password will be hashed by the pre-save middleware
      createdBy: req.user._id,
      isActive: true,
      isEmailVerified: false,
      mustChangePassword: true // Force password change on first login
    });

    await newUser.save();

    // Send email with credentials
    try {
      const emailOptions = {
        email: newUser.email,
        subject: 'Welcome to Woldia University - Your Account Credentials',
        message: `
          <h1>Welcome, ${newUser.name}!</h1>
          <p>An administrator has created an account for you in the Teacher Clearance System.</p>
          <p>Your login credentials are:</p>
          <ul>
            <li><strong>Email:</strong> ${newUser.email}</li>
            <li><strong>Username:</strong> ${username}</li>
            <li><strong>Password:</strong> ${password}</li>
          </ul>
          <p>You can log in here: <a href="${process.env.FRONTEND_URL}/login">${process.env.FRONTEND_URL}/login</a></p>
          <p>Please log in and change your password as soon as possible for security reasons.</p>
          <p>Best regards,<br>System Administrator<br>Woldia University</p>
        `,
      };
      await sendEmail(emailOptions);
      console.log(`Credentials email sent to: ${newUser.email}`);
    } catch (emailError) {
      console.error('Error sending credentials email:', emailError);
      // We don't return an error here because the user was created successfully
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department,
          contactInfo: newUser.contactInfo,
          username: newUser.username,
          isActive: newUser.isActive
        },
        credentials: {
          username,
          password
        }
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Login function
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Exclude the requesting user (admin) from the list
    const users = await User.find({ _id: { $ne: req.user.id } });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// ... (existing createUser, login, getAllUsers, etc.)

// Update user
// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// ... (existing createUser, login, getAllUsers, etc.)

// Update user - handles both admin updates and user self-updates
exports.updateUser = async (req, res) => {
  // If admin is updating, use ID from params. Otherwise, user updates self via token ID.
  const idToUpdate = req.params.id || req.user.id;
  const updates = req.body;

  if (req.file) {
    // This assumes you have a field in your User model named 'profilePicture'
    // The path to the uploaded file will be saved.
    updates.profilePicture = req.file.path;
  }

  try {
    const user = await User.findByIdAndUpdate(idToUpdate, updates, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error while updating user', error: error.message });
  }
};

// Change password - secure version using user ID from token
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; // Use user ID from the authenticated token

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
  }

  try {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword; // The pre-save hook in the model will hash this
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ... (existing deleteUser, getUsersByRole, etc.)

// Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
  const { role } = req.params;
  try {
    const users = await User.find({ role });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Reset user password
exports.resetUserPassword = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newPassword = User.generatePassword();
    user.password = newPassword;
    user.mustChangePassword = true; // Force password change after reset
    await user.save();

    // Send email with new password
    try {
      const emailOptions = {
        email: user.email,
        subject: 'Your Password Has Been Reset',
        message: `
          <h1>Password Reset</h1>
          <p>Hello ${user.name},</p>
          <p>Your password for the Teacher Clearance System has been reset by an administrator.</p>
          <p>Your new credentials are:</p>
          <ul>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>New Password:</strong> ${newPassword}</li>
          </ul>
          <p>You can log in here: <a href="${process.env.FRONTEND_URL}/login">${process.env.FRONTEND_URL}/login</a></p>
          <p>Please log in and change your password immediately.</p>
          <p>Best regards,<br>System Administrator<br>Woldia University</p>
        `,
      };
      await sendEmail(emailOptions);
      console.log(`Password reset email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Toggle user active status
exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Bulk create users
exports.bulkCreateUsers = async (req, res) => {
  // Placeholder for bulk user creation
  res.status(200).json({ message: 'Bulk user creation feature to be implemented' });
};

// Export users
exports.exportUsers = async (req, res) => {
  // Placeholder for exporting users to CSV/Excel
  res.status(200).json({ message: 'User export feature to be implemented' });
};