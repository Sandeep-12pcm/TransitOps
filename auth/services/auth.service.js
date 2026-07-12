const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../src/config/prisma");
const AppError = require("../../src/utils/AppError");

exports.register = async (data) => {
  const { name, email, password } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const SALT_ROUNDS = 12;
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "DRIVER",
    },
  });

  const { password: _, ...safeUser } = user;

  return {
    success: true,
    message: "User registered successfully",
    user: safeUser,
  };
};

exports.login = async (data) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );

  return {
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

exports.getProfile = async (user) => {
  if (!user) {
    throw new AppError("User not authenticated", 401);
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!currentUser) {
    throw new AppError("User not found", 404);
  }

  const { password: _, ...safeUser } = currentUser;

  return {
    success: true,
    user: safeUser,
  };
};

exports.logout = async () => {
  return {
    success: true,
    message: "Logout successful",
  };
};
