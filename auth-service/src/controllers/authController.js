const authModel = require('../models/authModel');
const { hashPassword, comparePassword } = require('../services/passwordService');
const { generateToken } = require('../services/jwtService');

const VALID_ROLES = ['admin', 'analyst', 'employee'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /auth/register
 */
async function register(req, res) {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'username, email and password are required',
        errors: null
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        errors: null
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
        errors: null
      });
    }

    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `role must be one of: ${VALID_ROLES.join(', ')}`,
        errors: null
      });
    }

    const existing = await authModel.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists',
        errors: null
      });
    }

    const hashed = await hashPassword(password);
    const user = await authModel.createUser({
      username,
      email,
      password: hashed,
      role
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to register user',
      errors: err.message
    });
  }
}

/**
 * POST /auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required',
        errors: null
      });
    }

    const user = await authModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errors: null
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errors: null
      });
    }

    const payload = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    const token = generateToken(payload);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: payload
      }
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to log in',
      errors: err.message
    });
  }
}

/**
 * GET /auth/profile
 * Protected — requires a valid JWT (authMiddleware).
 */
async function getProfile(req, res) {
  try {
    const user = await authModel.findUserById(req.user.user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      errors: err.message
    });
  }
}

/**
 * GET /auth/users
 * Admin only.
 */
async function getAllUsers(req, res) {
  try {
    const users = await authModel.findAllUsers();
    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      errors: err.message
    });
  }
}

/**
 * PUT /auth/users/:id
 * Admin only.
 */
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    if (email && !EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        errors: null
      });
    }

    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `role must be one of: ${VALID_ROLES.join(', ')}`,
        errors: null
      });
    }

    const existingUser = await authModel.findUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: null
      });
    }

    if (email) {
      const emailOwner = await authModel.findUserByEmail(email);
      if (emailOwner && String(emailOwner.user_id) !== String(id)) {
        return res.status(409).json({
          success: false,
          message: 'Email is already in use by another user',
          errors: null
        });
      }
    }

    const updated = await authModel.updateUser(id, { username, email, role });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updated
    });
  } catch (err) {
    console.error('updateUser error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
      errors: err.message
    });
  }
}

/**
 * DELETE /auth/users/:id
 * Admin only.
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const existingUser = await authModel.findUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: null
      });
    }

    if (String(req.user.user_id) === String(id)) {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot delete their own account through this endpoint',
        errors: null
      });
    }

    await authModel.deleteUser(id);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: null
    });
  } catch (err) {
    console.error('deleteUser error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      errors: err.message
    });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  getAllUsers,
  updateUser,
  deleteUser
};
