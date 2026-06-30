import prisma from '../config/prisma.js';

export const checkoutTicket = async (req, res) => {
  try {
    const { event_id } = req.body;
    const user_id = req.user.id;

    if (!event_id) {
      return res.status(400).json({
        status: 'error',
        message: 'event_id wajib disertakan!',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: event_id },
      });

      if (!event) {
        throw new Error('EVENT_NOT_FOUND');
      }

      if (event.quota < 1) {
        throw new Error('QUOTA_FULL');
      }

      await tx.event.update({
        where: { id: event_id },
        data: {
          quota: {
            decrement: 1,
          },
        },
      });

      const newTransaction = await tx.transaction.create({
        data: {
          user_id,
          event_id,
          amount: event.price,
          payment_status: 'PENDING',
        },
      });

      return newTransaction;
    });

    return res.status(201).json({
      status: 'success',
      message: 'Checkout berhasil! Silakan lanjutkan ke pembayaran.',
      data: result,
    });

  } catch (error) {
    if (error.message === 'EVENT_NOT_FOUND') {
      return res.status(404).json({ status: 'error', message: 'Event tidak ditemukan.' });
    }
    if (error.message === 'QUOTA_FULL') {
      return res.status(400).json({ status: 'error', message: 'Mohon maaf, kuota tiket sudah habis!' });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Gagal melakukan checkout',
      error: error.message,
    });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({
        status: 'error',
        message: 'transaction_id wajib disertakan!',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transaction_id },
      });

      if (!transaction) {
        throw new Error('TRX_NOT_FOUND');
      }

      if (transaction.payment_status === 'PAID') {
        throw new Error('ALREADY_PAID');
      }

      await tx.transaction.update({
        where: { id: transaction_id },
        data: { payment_status: 'PAID' },
      });

      const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
      const ticketCode = `TIX-${randomString}`;

      const newTicket = await tx.ticket.create({
        data: {
          user_id: transaction.user_id,
          event_id: transaction.event_id,
          transaction_id: transaction.id,
          ticket_code: ticketCode,
        },
      });

      return newTicket;
    });

    return res.status(200).json({
      status: 'success',
      message: 'Pembayaran berhasil dikonfirmasi dan Tiket telah diterbitkan! 🎉',
      data: result,
    });

  } catch (error) {
    if (error.message === 'TRX_NOT_FOUND') {
      return res.status(404).json({ status: 'error', message: 'Transaksi tidak ditemukan.' });
    }
    if (error.message === 'ALREADY_PAID') {
      return res.status(400).json({ status: 'error', message: 'Transaksi ini sudah lunas sebelumnya.' });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Gagal mengonfirmasi pembayaran',
      error: error.message,
    });
  }
};

export const cancelTransaction = async (req, res) => {
  try {
    const { transaction_id } = req.body;
    const user_id = req.user.id; 

    if (!transaction_id) {
      return res.status(400).json({
        status: 'error',
        message: 'transaction_id wajib disertakan!',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transaction_id },
      });

      if (!transaction) {
        throw new Error('TRX_NOT_FOUND');
      }

      if (transaction.user_id !== user_id) {
        throw new Error('UNAUTHORIZED');
      }

      if (transaction.payment_status !== 'PENDING') {
        throw new Error('CANNOT_CANCEL');
      }

      const cancelledTrx = await tx.transaction.update({
        where: { id: transaction_id },
        data: { payment_status: 'CANCELLED' },
      });

      await tx.event.update({
        where: { id: transaction.event_id },
        data: {
          quota: {
            increment: 1, 
          },
        },
      });

      return cancelledTrx;
    });

    return res.status(200).json({
      status: 'success',
      message: 'Transaksi dibatalkan. Kuota tiket telah dikembalikan!',
      data: result,
    });

  } catch (error) {
    if (error.message === 'TRX_NOT_FOUND') {
      return res.status(404).json({ status: 'error', message: 'Transaksi tidak ditemukan.' });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ status: 'error', message: 'Anda tidak berhak membatalkan transaksi ini.' });
    }
    if (error.message === 'CANNOT_CANCEL') {
      return res.status(400).json({ status: 'error', message: 'Hanya transaksi PENDING yang dapat dibatalkan.' });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Gagal membatalkan transaksi',
      error: error.message,
    });
  }
};

export const refundTransaction = async (req, res) => {
  try {
    const { transaction_id } = req.body;
    
    if (!transaction_id) {
      return res.status(400).json({
        status: 'error',
        message: 'transaction_id wajib disertakan!',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transaction_id },
        include: { ticket: true }, 
      });

      if (!transaction) {
        throw new Error('TRX_NOT_FOUND');
      }

      if (transaction.payment_status !== 'PAID') {
        throw new Error('NOT_PAID_YET');
      }

      if (transaction.ticket) {
        await tx.ticket.delete({
          where: { transaction_id: transaction_id },
        });
      }

      const refundedTrx = await tx.transaction.update({
        where: { id: transaction_id },
        data: { payment_status: 'CANCELLED' },
      });

      await tx.event.update({
        where: { id: transaction.event_id },
        data: {
          quota: {
            increment: 1, 
          },
        },
      });

      return refundedTrx;
    });

    return res.status(200).json({
      status: 'success',
      message: 'Refund berhasil diproses. Tiket hangus dan kuota dikembalikan!',
      data: result,
    });

  } catch (error) {
    if (error.message === 'TRX_NOT_FOUND') {
      return res.status(404).json({ status: 'error', message: 'Transaksi tidak ditemukan.' });
    }
    if (error.message === 'NOT_PAID_YET') {
      return res.status(400).json({ status: 'error', message: 'Hanya transaksi yang sudah lunas (PAID) yang dapat di-refund.' });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Gagal memproses refund',
      error: error.message,
    });
  }
};