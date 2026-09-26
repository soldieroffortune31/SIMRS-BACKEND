const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/app.config');
const { User, Role, Instalasi, Ruangan, UserRuanganRole } = require('../models');
const modulService = require('./modul.service');
const menuService = require('./menu.service');

class AuthService {
  /**
   * Mengambil semua konteks ruangan, instalasi, dan role yang ditugaskan ke user
   */
  async getUserAssignments(userId) {
    const assignments = await UserRuanganRole.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['role_id', 'kode_role', 'nama_role'],
        },
        {
          model: Ruangan,
          as: 'ruangan',
          attributes: ['ruangan_id', 'kode_ruangan', 'nama_ruangan', 'instalasi_id'],
          include: [
            {
              model: Instalasi,
              as: 'instalasi',
              attributes: ['instalasi_id', 'kode_instalasi', 'nama_instalasi'],
            },
          ],
        },
      ],
      order: [['is_default', 'DESC']],
    });

    const contextList = [];
    const instalasiMap = new Map();

    for (const item of assignments) {
      if (!item.ruangan || !item.ruangan.instalasi) continue;

      const inst = item.ruangan.instalasi;
      const instId = inst.instalasi_id;
      if (!instalasiMap.has(instId)) {
        instalasiMap.set(instId, {
          instalasi_id: instId,
          kode_instalasi: inst.kode_instalasi,
          nama_instalasi: inst.nama_instalasi,
          daftar_ruangan: [],
        });
      }

      instalasiMap.get(instId).daftar_ruangan.push({
        ruangan_id: item.ruangan.ruangan_id,
        kode_ruangan: item.ruangan.kode_ruangan,
        nama_ruangan: item.ruangan.nama_ruangan,
        role_id: item.role.role_id,
        kode_role: item.role.kode_role,
        nama_role: item.role.nama_role,
        is_default: item.is_default,
      });

      contextList.push({
        assignment_id: item.userruanganrole_id || item.user_ruangan_role_id,
        instalasi_id: instId,
        kode_instalasi: inst.kode_instalasi,
        nama_instalasi: inst.nama_instalasi,
        ruangan_id: item.ruangan.ruangan_id,
        kode_ruangan: item.ruangan.kode_ruangan,
        nama_ruangan: item.ruangan.nama_ruangan,
        role_id: item.role.role_id,
        kode_role: item.role.kode_role,
        nama_role: item.role.nama_role,
        is_default: item.is_default,
      });
    }

    return contextList;
  }

  /**
   * Login Tahap 1: Validasi Kredensial Pengguna
   */
  async login(username, password, explicitContext = null) {
    // 1. Cari user berdasarkan username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      const error = new Error('Username atau kata sandi tidak valid.');
      error.statusCode = 401;
      throw error;
    }

    // 2. Verifikasi status keaktifan user
    if (!user.is_active) {
      const error = new Error('Akun Anda dinonaktifkan. Silakan hubungi Administrator.');
      error.statusCode = 403;
      throw error;
    }

    // 3. Verifikasi kata sandi bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      const error = new Error('Username atau kata sandi tidak valid.');
      error.statusCode = 401;
      throw error;
    }

    // 4. Ambil daftar penugasan instalasi & ruangan
    const availableContexts = await this.getUserAssignments(user.user_id);
    if (!availableContexts || availableContexts.length === 0) {
      const error = new Error('Pengguna belum diberikan hak akses ke Instalasi / Ruangan manapun.');
      error.statusCode = 403;
      throw error;
    }

    const userProfile = {
      user_id: user.user_id,
      id: user.user_id,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      nip_nik: user.nip_nik,
      email: user.email,
    };

    // 5. Jika client langsung menyertakan ruangan_id & instalasi_id (Direct 1-step Login)
    if (explicitContext && explicitContext.instalasi_id && explicitContext.ruangan_id) {
      const contextResult = await this.selectContext(
        user.user_id,
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

    // 6. Jika 2-Step Login: Terbitkan token sementara untuk memilih konteks
    const tempToken = this.generateTempToken({
      userId: user.user_id,
      user_id: user.user_id,
      id: user.user_id,
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
   * Login Tahap 2: Memilih Ruangan & Instalasi Kerja
   */
  async selectContext(userId, instalasiId, ruanganId) {
    // 1. Verifikasi apakah user memang memiliki akses ke ruangan & instalasi ini
    const assignment = await UserRuanganRole.findOne({
      where: {
        user_id: userId,
        ruangan_id: ruanganId,
      },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['role_id', 'kode_role', 'nama_role'],
        },
        {
          model: Ruangan,
          as: 'ruangan',
          attributes: ['ruangan_id', 'kode_ruangan', 'nama_ruangan', 'instalasi_id'],
          include: [
            {
              model: Instalasi,
              as: 'instalasi',
              attributes: ['instalasi_id', 'kode_instalasi', 'nama_instalasi'],
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'username', 'nama_lengkap', 'nip_nik', 'email', 'is_active'],
        },
      ],
    });

    if (!assignment || !assignment.ruangan || !assignment.ruangan.instalasi) {
      const error = new Error('Anda tidak memiliki izin penugasan di Ruangan atau Instalasi yang dipilih.');
      error.statusCode = 403;
      throw error;
    }

    if (assignment.ruangan.instalasi.instalasi_id !== instalasiId) {
      const error = new Error('Ruangan tidak sesuai dengan Instalasi yang dipilih.');
      error.statusCode = 400;
      throw error;
    }

    const user = assignment.user;
    const role = assignment.role;
    const ruangan = assignment.ruangan;
    const instalasi = ruangan.instalasi;

    // 2. Siapkan payload JWT terikat konteks
    const tokenPayload = {
      userId: user.user_id,
      user_id: user.user_id,
      id: user.user_id,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      roleId: role.role_id,
      role_id: role.role_id,
      roleCode: role.kode_role,
      instalasiId: instalasi.instalasi_id,
      instalasi_id: instalasi.instalasi_id,
      instalasiCode: instalasi.kode_instalasi,
      ruanganId: ruangan.ruangan_id,
      ruangan_id: ruangan.ruangan_id,
      ruanganCode: ruangan.kode_ruangan,
    };

    const token = this.generateContextToken(tokenPayload);

    // 3. Dapatkan modul yang diizinkan untuk Akun Pengguna pada Ruangan & Instalasi ini
    const accessibleModules = await modulService.getUserAccessibleModules(
      user.user_id,
      ruangan.ruangan_id,
      instalasi.instalasi_id,
      role.kode_role
    );
    const allowedModuleIds = accessibleModules.map(m => m.modul_id || m.id);

    // 4. Panggil Menu Service untuk mendapatkan menu tree yang terfilter modul dan permissions
    const { menuTree, permissions } = await menuService.getMenuAndPermissionsForContext(
      role.role_id,
      instalasi.instalasi_id,
      allowedModuleIds
    );

    return {
      status: 'AUTHENTICATED',
      token,
      user: {
        user_id: user.user_id,
        id: user.user_id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        nip_nik: user.nip_nik,
        email: user.email,
      },
      active_context: {
        instalasi: {
          instalasi_id: instalasi.instalasi_id,
          id: instalasi.instalasi_id,
          kode: instalasi.kode_instalasi,
          nama: instalasi.nama_instalasi,
        },
        ruangan: {
          ruangan_id: ruangan.ruangan_id,
          id: ruangan.ruangan_id,
          kode: ruangan.kode_ruangan,
          nama: ruangan.nama_ruangan,
        },
        role: {
          role_id: role.role_id,
          id: role.role_id,
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
    const userId = tokenPayload.userId || tokenPayload.user_id || tokenPayload.id;
    const user = await User.findByPk(userId, {
      attributes: ['user_id', 'username', 'nama_lengkap', 'nip_nik', 'email', 'is_active'],
    });

    if (!user || !user.is_active) {
      const error = new Error('Pengguna tidak ditemukan atau tidak aktif.');
      error.statusCode = 401;
      throw error;
    }

    const availableContexts = await this.getUserAssignments(user.user_id);

    let activeContext = null;
    let modules = [];
    let menus = [];
    let permissions = [];

    const ruanganId = tokenPayload.ruanganId || tokenPayload.ruangan_id;
    const instalasiId = tokenPayload.instalasiId || tokenPayload.instalasi_id;
    const roleId = tokenPayload.roleId || tokenPayload.role_id;

    if (ruanganId && instalasiId && roleId) {
      activeContext = {
        instalasi: {
          instalasi_id: instalasiId,
          id: instalasiId,
          kode: tokenPayload.instalasiCode,
        },
        ruangan: {
          ruangan_id: ruanganId,
          id: ruanganId,
          kode: tokenPayload.ruanganCode,
        },
        role: {
          role_id: roleId,
          id: roleId,
          kode: tokenPayload.roleCode,
        },
      };

      modules = await modulService.getUserAccessibleModules(
        user.user_id,
        ruanganId,
        instalasiId,
        tokenPayload.roleCode
      );
      const allowedModuleIds = modules.map(m => m.modul_id || m.id);

      const menuData = await menuService.getMenuAndPermissionsForContext(
        roleId,
        instalasiId,
        allowedModuleIds
      );
      menus = menuData.menuTree;
      permissions = menuData.permissions;
    }

    return {
      user: {
        user_id: user.user_id,
        id: user.user_id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        nip_nik: user.nip_nik,
        email: user.email,
      },
      active_context: activeContext,
      available_contexts: availableContexts,
      modules,
      menus,
      permissions,
    };
  }

  /**
   * Helper pembuatan token sementara
   */
  generateTempToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: '15m',
    });
  }

  /**
   * Helper pembuatan token kontekstual final
   */
  generateContextToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.contextExpiresIn || '8h',
    });
  }
}

module.exports = new AuthService();
