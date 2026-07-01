import prisma from '../config/prisma.js';

export const createEvent = async (req, res) => {
  try {
    const { title, description, quota, price, registration_deadline } = req.body;
    
    const organizer_id = req.user.id; 

    if (!title || !description || !quota || price === undefined || !registration_deadline) {
      return res.status(400).json({
        status: 'error',
        message: 'Semua field (title, description, quota, price, registration_deadline) wajib diisi!',
      });
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        organizer_id,
        quota: parseInt(quota),
        price: parseFloat(price),
        registration_deadline: new Date(registration_deadline), 
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Event berhasil dibuat!',
      data: newEvent,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat membuat event',
      error: error.message,
    });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const { search, status, sortBy, type, page = 1, limit = 10 } = req.query;

    let whereClause = {};
    let orderByClause = { registration_deadline: 'asc' };

    if (search) {
      whereClause.title = { contains: search, mode: 'insensitive' };
    }

    if (status === 'active') {
      whereClause.registration_deadline = { gte: new Date() };
    }

    if (type) {
      whereClause.event_type = type.toUpperCase();
    }

    if (sortBy === 'newest') {
      orderByClause = { id: 'desc' };
    } else if (sortBy === 'price_low') {
      orderByClause = { price: 'asc' };
    }

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const totalData = await prisma.event.count({ where: whereClause });
    const totalPages = Math.ceil(totalData / limitNumber);

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: orderByClause,
      skip: skip,
      take: limitNumber,
      select: {
        id: true,
        title: true,
        quota: true,
        price: true,
        registration_deadline: true,
        event_type: true, 
        organizer: {
          select: {
            full_name: true,
            institution: true
          }
        }
      }
    });

    return res.status(200).json({
      status: 'success',
      meta: {
        current_page: pageNumber,
        limit: limitNumber,
        total_data: totalData,
        total_pages: totalPages,
      },
      data: events,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data event',
      error: error.message,
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { full_name: true, email: true }
        },
        // Nanti bisa include jumlah tiket yang sudah terjual di sini
      }
    });

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: event,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil detail event',
      error: error.message,
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, quota, price, registration_deadline } = req.body;
    const organizerId = req.user.id; // Dari Token JWT

    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return res.status(404).json({ status: 'error', message: 'Event tidak ditemukan' });
    }

    if (existingEvent.organizer_id !== organizerId) {
      return res.status(403).json({ status: 'error', message: 'Akses ditolak. Ini bukan event Anda!' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        quota: quota ? parseInt(quota) : undefined,
        price: price ? parseFloat(price) : undefined,
        registration_deadline: registration_deadline ? new Date(registration_deadline) : undefined,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Event berhasil diperbarui! 📝',
      data: updatedEvent,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Gagal memperbarui event',
      error: error.message,
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const organizerId = req.user.id;

    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: { transactions: true }
        }
      }
    });

    if (!existingEvent) {
      return res.status(404).json({ status: 'error', message: 'Event tidak ditemukan' });
    }

    if (existingEvent.organizer_id !== organizerId) {
      return res.status(403).json({ status: 'error', message: 'Akses ditolak. Ini bukan event Anda!' });
    }

    if (existingEvent._count.transactions > 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Event tidak bisa dihapus karena sudah ada transaksi/pendaftar masuk. Silakan hubungi Superadmin.' 
      });
    }

    await prisma.event.delete({
      where: { id },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Event berhasil dihapus secara permanen! 🗑️',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus event',
      error: error.message,
    });
  }
};