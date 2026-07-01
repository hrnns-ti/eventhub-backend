import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

export const registerUser = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama, email, dan password wajib diisi!',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'Email sudah terdaftar. Silakan gunakan email lain.',
      });
    }

    const saltRounds = 19;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        full_name,
        email,
        password_hash: hashedPassword,
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil!',
      data: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email dan password wajib diisi :|'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Email atau password salah :('
      });
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Email atau password salah :('
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Login berhasil!',
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        token: token,
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
      error: error.message,
    });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        phone_number: true,
        institution: true,
        bio: true,
        github_link: true,
        linkedin_link: true,
        skills: true,
        avatar_url: true,
      }
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User tidak ditemukan' });
    }

    return res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil profil',
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone_number, institution, bio, github_link, linkedin_link, skills } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        phone_number,
        institution,
        bio,
        github_link,
        linkedin_link,
        skills,
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone_number: true,
        institution: true,
        bio: true,
        skills: true,
      }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Profil berhasil diperbarui!',
      data: updatedUser,
    });
  } catch (error) {
    // Prisma Error P2002 = Unique Constraint Violation
    if (error.code === 'P2002' && error.meta?.target?.includes('phone_number')) {
      return res.status(409).json({
        status: 'error',
        message: 'Nomor telepon ini sudah digunakan oleh akun lain.',
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Gagal memperbarui profil',
      error: error.message,
    });
  }
};

export const getUserProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        full_name: true,
        institution: true,
        bio: true,
        github_link: true,
        linkedin_link: true,
        skills: true,
        avatar_url: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil profil user',
      error: error.message,
    });
  }
};