const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const jwtConfig = require("../config/jwt.js");

const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Access denied. No token provided.");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtConfig.secret);

    const user = await User.findById(decoded.id);

    if (!user) {
      const error = new Error("User not found. Token is invalid.");
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      err.message = "Invalid token.";
      err.statusCode = 401;
    }
    if (err.name === "TokenExpiredError") {
      err.message = "Token has expired.";
      err.statusCode = 401;
    }
    next(err);
  }
};

module.exports = authenticate;
