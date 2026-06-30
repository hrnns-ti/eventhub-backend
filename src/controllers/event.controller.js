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
    const events = await prisma.event.findMany({
      orderBy: {
        registration_deadline: 'asc', 
      },
      select: {
        id: true,
        title: true,
        quota: true,
        price: true,
        registration_deadline: true,
        organizer: {
          select: {
            full_name: true, 
          }
        }
      }
    });

    return res.status(200).json({
      status: 'success',
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
        // Nanti kita bisa include jumlah tiket yang sudah terjual di sini
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