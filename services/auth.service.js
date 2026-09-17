const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/app.config');
const {
  User,
  Role,
  Instalasi,
  Ruangan,
  UserRuanganRole,
} = require('../models');
const menuService = require('./menu.service');
const modulService = require('./modul.service');

class AuthService {
  /**
   * Mengambil seluruh daftar Instalasi & Ruangan yang diizinkan untuk User
   */
  async getUserAssignments(userId) {
    const assignments = await UserRuanganRole.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'kode_role', 'nama_role'],
        },
        {
          model: Ruangan,
          as: 'ruangan',
          where: { is_active: true },
          attributes: ['id', 'kode_ruangan', 'nama_ruangan', 'instalasi_id'],
          include: [
            {
              model: Instalasi,
              as: 'instalasi',
              where: { is_active: true },
              attributes: ['id', 'kode_instalasi', 'nama_instalasi'],
            },
          ],
        },
      ],
    });

    // Kelompokkan per Instalasi agar mudah ditampilkan di dropdown / modal front-end
    const instalasiMap = new Map();

    for (const item of assignments) {
      if (!item.ruangan || !item.ruangan.instalasi) continue;

      const inst = item.ruangan.instalasi;
      if (!instalasiMap.has(inst.id)) {
        instalasiMap.set(inst.id, {
          instalasi_id: inst.id,
          kode_instalasi: inst.kode_instalasi,
          nama_instalasi: inst.nama_instalasi,
          daftar_ruangan: [],
        });
      }

      instalasiMap.get(inst.id).daftar_ruangan.push({
        ruangan_id: item.ruangan.id,
        kode_ruangan: item.ruangan.kode_ruangan,
        nama_ruangan: item.ruangan.nama_ruangan,
        role_id: item.role.id,
        kode_role: item.role.kode_role,
        nama_role: item.role.nama_role,
        is_default: item.is_default,
      });
    }

    return Array.from(instalasiMap.values());
  }

  /**
   * Membuat JSON Web Token berkonteks penuh
   */
  generateContextToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.contextExpiresIn,
    });
  }

  /**
   * Membuat token sementara untuk proses pemilihan konteks
   */
  generateTempToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: '1h',
    });
  }

  /**
   * Logika Bisnis Login Kredensial (Username & Password)
   * Mendukung login 2 tahap (pilih ruangan terpisah) maupun 1 tahap (langsung sertakan ruangan)
   */
  async login(username, password, explicitContext = null) {
    // 1. Cari user berdasarkan username
    const user = await User.findOne({
      where: { username },
    });

    if (!user) {
      const error = new Error('Username atau kata sandi tidak valid.');
      error.statusCode = 401;
      throw error;
    }

    if (!user.is_active) {
      const error = new Error('Akun pengguna dinonaktifkan. Hubungi administrator SIMRS.');
      error.statusCode = 403;
      throw error;
    }

    // 2. Verifikasi kata sandi
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      const error = new Error('Username atau kata sandi tidak valid.');
      error.statusCode = 401;
      throw error;
    }

    // 3. Ambil daftar penugasan instalasi & ruangan
    const availableContexts = await this.getUserAssignments(user.id);
    if (!availableContexts || availableContexts.length === 0) {
      const error = new Error('Pengguna belum diberikan hak akses ke Instalasi / Ruangan manapun.');
      error.statusCode = 403;
      throw error;
    }

    const userProfile = {
      id: user.id,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      nip_nik: user.nip_nik,
      email: user.email,
    };

    // 4. Jika client langsung menyertakan ruangan_id & instalasi_id (Direct 1-step Login)
    if (explicitContext && explicitContext.instalasi_id && explicitContext.ruangan_id) {
      const contextResult = await this.selectContext(
        user.id,
        parseInt(explicitContext.instalasi_id, 10),
        parseInt(explicitContext.ruangan_id, 10)
      );

      return {
        status: 'AUTHENTICATED',
        user: userProfile,
        token: contextResult.token,
        active_context: contextResult.active_context,
        modules: contextResult.modules,
        menus: contextResult.menus,
        permissions: contextResult.permissions,
        available_contexts: availableContexts,
      };
    }

    // 5. Jika 2-Step Login: Terbitkan token sementara untuk memilih konteks
    const tempToken = this.generateTempToken({
      userId: user.id,
      username: user.username,
      is_temp: true,
    });

    return {
      status: 'REQUIRE_CONTEXT_SELECTION',
      message: 'Kredensial valid. Silakan pilih Instalasi dan Ruangan kerja untuk melanjutkan.',
      user: userProfile,
      temp_token: tempToken,
      available_contexts: availableContexts,
    };
  }

  /**
   * Logika Bisnis Pemilihan / Penetapan Konteks (Instalasi & Ruangan)
   */
  async selectContext(userId, instalasiId, ruanganId) {
    // 1. Cari penugasan user pada ruangan yang dipilih
    const assignment = await UserRuanganRole.findOne({
      where: {
        user_id: userId,
        ruangan_id: ruanganId,
      },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'kode_role', 'nama_role'],
        },
        {
          model: Ruangan,
          as: 'ruangan',
          attributes: ['id', 'kode_ruangan', 'nama_ruangan', 'instalasi_id'],
          include: [
            {
              model: Instalasi,
              as: 'instalasi',
              attributes: ['id', 'kode_instalasi', 'nama_instalasi'],
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'nama_lengkap', 'nip_nik', 'email', 'is_active'],
        },
      ],
    });

    if (!assignment || !assignment.ruangan || !assignment.ruangan.instalasi) {
      const error = new Error('Anda tidak memiliki izin akses untuk Ruangan ini.');
      error.statusCode = 403;
      throw error;
    }

    if (assignment.ruangan.instalasi.id !== instalasiId) {
      const error = new Error('Ruangan yang dipilih tidak sesuai dengan Instalasi yang dituju.');
      error.statusCode = 400;
      throw error;
    }

    const user = assignment.user;
    const role = assignment.role;
    const ruangan = assignment.ruangan;
    const instalasi = ruangan.instalasi;

    // 2. Siapkan payload JWT terikat konteks
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      roleId: role.id,
      roleCode: role.kode_role,
      instalasiId: instalasi.id,
      instalasiCode: instalasi.kode_instalasi,
      ruanganId: ruangan.id,
      ruanganCode: ruangan.kode_ruangan,
    };

    const token = this.generateContextToken(tokenPayload);

    // 3. Dapatkan modul yang diizinkan untuk Akun Pengguna pada Ruangan & Instalasi ini
    const accessibleModules = await modulService.getUserAccessibleModules(
      user.id,
      ruangan.id,
      instalasi.id,
      role.kode_role
    );
    const allowedModuleIds = accessibleModules.map(m => m.id);

    // 4. Panggil Menu Service untuk mendapatkan menu tree yang terfilter modul dan permissions
    const { menuTree, permissions } = await menuService.getMenuAndPermissionsForContext(
      role.id,
      instalasi.id,
      allowedModuleIds
    );

    return {
      status: 'AUTHENTICATED',
      token,
      user: {
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        nip_nik: user.nip_nik,
        email: user.email,
      },
      active_context: {
        instalasi: {
          id: instalasi.id,
          kode: instalasi.kode_instalasi,
          nama: instalasi.nama_instalasi,
        },
        ruangan: {
          id: ruangan.id,
          kode: ruangan.kode_ruangan,
          nama: ruangan.nama_ruangan,
        },
        role: {
          id: role.id,
          kode: role.kode_role,
          nama: role.nama_role,
        },
      },
      modules: accessibleModules,
      menus: menuTree,
      permissions,
    };
  }

  /**
   * Logika Bisnis Berganti Konteks (Switch Room / Installation)
   */
  async switchContext(userId, instalasiId, ruanganId) {
    return this.selectContext(userId, instalasiId, ruanganId);
  }

  /**
   * Ambil profil & status konteks aktif saat ini
   */
  async getCurrentSession(tokenPayload) {
    const user = await User.findByPk(tokenPayload.userId, {
      attributes: ['id', 'username', 'nama_lengkap', 'nip_nik', 'email', 'is_active'],
    });

    if (!user || !user.is_active) {
      const error = new Error('Pengguna tidak ditemukan atau tidak aktif.');
      error.statusCode = 401;
      throw error;
    }

    const availableContexts = await this.getUserAssignments(user.id);

    let activeContext = null;
    let modules = [];
    let menus = [];
    let permissions = [];

    if (tokenPayload.ruanganId && tokenPayload.instalasiId && tokenPayload.roleId) {
      activeContext = {
        instalasi: {
          id: tokenPayload.instalasiId,
          kode: tokenPayload.instalasiCode,
        },
        ruangan: {
          id: tokenPayload.ruanganId,
          kode: tokenPayload.ruanganCode,
        },
        role: {
          id: tokenPayload.roleId,
          kode: tokenPayload.roleCode,
        },
      };

      modules = await modulService.getUserAccessibleModules(
        tokenPayload.userId,
        tokenPayload.ruanganId,
        tokenPayload.instalasiId,
        tokenPayload.roleCode
      );
      const allowedModuleIds = modules.map(m => m.id);

      const menuData = await menuService.getMenuAndPermissionsForContext(
        tokenPayload.roleId,
        tokenPayload.instalasiId,
        allowedModuleIds
      );
      menus = menuData.menuTree;
      permissions = menuData.permissions;
    }

    return {
      user,
      active_context: activeContext,
      available_contexts: availableContexts,
      modules,
      menus,
      permissions,
    };
  }
}

module.exports = new AuthService();
