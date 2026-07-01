import prisma from '../config/prisma.js';

export const createTeam = async (req, res) => {
  try {
    const { event_id, team_name } = req.body;
    const leader_id = req.user.id;

    if (!event_id || !team_name) {
      return res.status(400).json({
        status: 'error',
        message: 'event_id dan team_name wajib diisi!',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const hasTicket = await tx.ticket.findFirst({
        where: {
          user_id: leader_id,
          event_id: event_id,
        },
      });

      if (!hasTicket) {
        throw new Error('NO_TICKET');
      }

      const alreadyLeading = await tx.team.findFirst({
        where: {
          event_id,
          leader_id,
        },
      });

      if (alreadyLeading) {
        throw new Error('ALREADY_LEADER');
      }

      const newTeam = await tx.team.create({
        data: {
          event_id,
          team_name,
          leader_id,
          is_looking_for_members: true,
        },
      });

      await tx.teamMember.create({
        data: {
          team_id: newTeam.id,
          user_id: leader_id,
        },
      });

      return newTeam;
    });

    return res.status(201).json({
      status: 'success',
      message: `Tim "${team_name}" berhasil dibentuk! Anda otomatis menjadi Leader.`,
      data: result,
    });

  } catch (error) {
    if (error.message === 'NO_TICKET') {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Akses ditolak. Anda harus memiliki tiket lunas untuk event ini sebelum membuat tim.' 
      });
    }
    if (error.message === 'ALREADY_LEADER') {
      return res.status(409).json({ 
        status: 'error', 
        message: 'Anda sudah memimpin tim lain di event ini.' 
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Gagal membentuk tim',
      error: error.message,
    });
  }
};

export const joinTeam = async (req, res) => {
  try {
    const { team_id } = req.body;
    const user_id = req.user.id;

    if (!team_id) {
      return res.status(400).json({
        status: 'error',
        message: 'team_id wajib diisi!',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const team = await tx.team.findUnique({
        where: { id: team_id },
      });

      if (!team) {
        throw new Error('TEAM_NOT_FOUND');
      }

      if (!team.is_looking_for_members) {
        throw new Error('TEAM_CLOSED');
      }

      const hasTicket = await tx.ticket.findFirst({
        where: {
          user_id: user_id,
          event_id: team.event_id,
        },
      });

      if (!hasTicket) {
        throw new Error('NO_TICKET');
      }

      const alreadyInATeam = await tx.teamMember.findFirst({
        where: {
          user_id: user_id,
          team: {
            event_id: team.event_id,
          },
        },
      });

      if (alreadyInATeam) {
        throw new Error('ALREADY_HAVE_TEAM');
      }

      const newMembership = await tx.teamMember.create({
        data: {
          team_id: team.id,
          user_id: user_id,
        },
      });

      return newMembership;
    });

    return res.status(201).json({
      status: 'success',
      message: 'Selamat! Anda berhasil bergabung ke dalam tim.',
      data: result,
    });

  } catch (error) {
    if (error.message === 'TEAM_NOT_FOUND') {
      return res.status(404).json({ status: 'error', message: 'Tim tidak ditemukan.' });
    }
    if (error.message === 'TEAM_CLOSED') {
      return res.status(400).json({ status: 'error', message: 'Tim ini sudah penuh atau sudah menutup pendaftaran.' });
    }
    if (error.message === 'NO_TICKET') {
      return res.status(403).json({ status: 'error', message: 'Anda tidak bisa join karena belum memiliki tiket untuk event ini.' });
    }
    if (error.message === 'ALREADY_HAVE_TEAM') {
      return res.status(409).json({ status: 'error', message: 'Anda sudah terdaftar di salah satu tim pada event ini.' });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Gagal bergabung ke dalam tim',
      error: error.message,
    });
  }
};