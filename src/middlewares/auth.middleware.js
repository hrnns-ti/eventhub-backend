import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Akses ditolak. Token tidak ditemukan!',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded; 
    
    next(); 
  } catch (error) {
    return res.status(403).json({
      status: 'error',
      message: 'Token tidak valid atau sudah kedaluwarsa!',
    });
  }
};

export const isOrganizer = (req, res, next) => {
  if (req.user.role !== 'ORGANIZER' && req.user.role !== 'SUPERADMIN') {
    return res.status(403).json({
      status: 'error',
      message: 'Akses ditolak. Hanya Organizer yang bisa melakukan aksi ini!',
    });
  }
  next();
};