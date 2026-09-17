const bcrypt = require('bcrypt');
const {
  sequelize,
  User,
  Role,
  Instalasi,
  Ruangan,
  UserRuanganRole,
} = require('../models');

class UserService {
  async createUser(userData, assignments = []) {
    const transaction = await sequelize.transaction();
    try {
      const existingUser = await User.findOne({
        where: { username: userData.username },
        transaction,
      });

      if (existingUser) {
        const error = new Error(`Username '${userData.username}' sudah digunakan.`);
        error.statusCode = 400;
        throw error;
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(userData.password, salt);

      const user = await User.create(
        {
          username: userData.username,
          password_hash,
          nama_lengkap: userData.nama_lengkap,
          nip_nik: userData.nip_nik,
          email: userData.email,
          is_active: userData.is_active !== undefined ? userData.is_active : true,
        },
        { transaction }
      );

      if (Array.isArray(assignments) && assignments.length > 0) {
        const assignmentRows = assignments.map(a => ({
          user_id: user.id,
          ruangan_id: a.ruangan_id,
          role_id: a.role_id,
          is_default: a.is_default || false,
        }));
        await UserRuanganRole.bulkCreate(assignmentRows, { transaction });
      }

      await transaction.commit();
      return this.getUserById(user.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async assignRuanganRole(userId, ruanganId, roleId, isDefault = false) {
    // Pastikan user, ruangan, role valid
    const [user, ruangan, role] = await Promise.all([
      User.findByPk(userId),
      Ruangan.findByPk(ruanganId),
      Role.findByPk(roleId),
    ]);

    if (!user) {
      const error = new Error('Pengguna tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    if (!ruangan) {
      const error = new Error('Ruangan tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    if (!role) {
      const error = new Error('Role tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    const [assignment, created] = await UserRuanganRole.findOrCreate({
      where: {
        user_id: userId,
        ruangan_id: ruanganId,
        role_id: roleId,
      },
      defaults: {
        is_default: isDefault,
      },
    });

    if (!created && isDefault !== assignment.is_default) {
      assignment.is_default = isDefault;
      await assignment.save();
    }

    return assignment;
  }

  async getAllUsers() {
    return User.findAll({
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: UserRuanganRole,
          as: 'assignments',
          include: [
            {
              model: Role,
              as: 'role',
              attributes: ['id', 'kode_role', 'nama_role'],
            },
            {
              model: Ruangan,
              as: 'ruangan',
              attributes: ['id', 'kode_ruangan', 'nama_ruangan'],
              include: [
                {
                  model: Instalasi,
                  as: 'instalasi',
                  attributes: ['id', 'kode_instalasi', 'nama_instalasi'],
                },
              ],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: UserRuanganRole,
          as: 'assignments',
          include: [
            {
              model: Role,
              as: 'role',
              attributes: ['id', 'kode_role', 'nama_role'],
            },
            {
              model: Ruangan,
              as: 'ruangan',
              attributes: ['id', 'kode_ruangan', 'nama_ruangan'],
              include: [
                {
                  model: Instalasi,
                  as: 'instalasi',
                  attributes: ['id', 'kode_instalasi', 'nama_instalasi'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!user) {
      const error = new Error('Pengguna tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }
}

module.exports = new UserService();
