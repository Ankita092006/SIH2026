const authService = require("../services/auth.service");

/**
 * Handle user registration
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.registerUser({ name, email, password, role });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: result.token,
      user: result.user
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
}

/**
 * Handle user login
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: result.token,
      user: result.user
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
}

/**
 * Get current authenticated user session
 * GET /api/auth/me
 */
async function getMe(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
}

/**
 * Logout current user
 * POST /api/auth/logout
 */
async function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: "Logout successful. Remove the token from the client."
  });
}

module.exports = {
  register,
  login,
  getMe,
  logout
};