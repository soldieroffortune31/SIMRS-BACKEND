const { Op } = require('sequelize');
const {
  Menu,
  RoleMenu,
  MenuInstalasi,
  Permission,
  RolePermission,
  Role,
  Instalasi,
} = require('../models');

class MenuService {
  /**
   * Menyusun daftar menu datar menjadi struktur pohon (Tree) secara rekursif
   * @param {Array} items - Array menu objek datar
   * @param {number|null} parentId - ID parent untuk level saat ini
   * @returns {Array} Array pohon menu hierarkis
   */
  buildTree(items, parentId = null) {
    const branch = [];
    const filtered = items.filter(item => {
      const itemParentId = item.parent_id === undefined ? null : item.parent_id;
      return itemParentId === parentId;
    });

    filtered.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    for (const item of filtered) {
      const itemJson = typeof item.toJSON === 'function' ? item.toJSON() : { ...item };
      const children = this.buildTree(items, itemJson.id);
      if (children.length > 0) {
        itemJson.children = children;
      } else {
        itemJson.children = [];
      }
      branch.push(itemJson);
    }

    return branch;
  }

  /**
   * Mengambil pohon menu yang berhak diakses berdasarkan Role dan Instalasi aktif
   * @param {number} roleId - ID Role pengguna di ruangan aktif
   * @param {number} instalasiId - ID Instalasi yang sedang aktif
   * @returns {Promise<{ menuTree: Array, permissions: Array<string> }>}
   */
  async getMenuAndPermissionsForContext(roleId, instalasiId) {
    // 1. Ambil menu ID yang terdaftar untuk role ini
    const roleMenus = await RoleMenu.findAll({
      where: { role_id: roleId },
      attributes: ['menu_id'],
    });
    const allowedMenuIdsForRole = roleMenus.map(rm => rm.menu_id);

    if (allowedMenuIdsForRole.length === 0) {
      return { menuTree: [], permissions: [] };
    }

    // 2. Ambil mapping Menu - Instalasi untuk instalasiId ini
    // Serta cari menu mana saja yang tidak memiliki batasan instalasi sama sekali (menu global/umum)
    const allMenuInstalasi = await MenuInstalasi.findAll({
      attributes: ['menu_id', 'instalasi_id'],
    });

    // Kumpulan menu_id yang memiliki pembatasan instalasi
    const restrictedMenuIds = new Set(allMenuInstalasi.map(mi => mi.menu_id));
    
    // Kumpulan menu_id yang diizinkan untuk instalasi yang sedang aktif
    const allowedForThisInstalasi = new Set(
      allMenuInstalasi
        .filter(mi => mi.instalasi_id === instalasiId)
        .map(mi => mi.menu_id)
    );

    // Menu lolos filter jika:
    // a. Terdaftar untuk role user
    // b. DAN (tidak dibatasi instalasi ATAU dibatasi tapi instalasi aktif termasuk di dalamnya)
    const validMenuIds = allowedMenuIdsForRole.filter(menuId => {
      const isRestricted = restrictedMenuIds.has(menuId);
      if (!isRestricted) return true; // Global menu (misal Dashboard, Pengaturan Umum)
      return allowedForThisInstalasi.has(menuId); // Khusus instalasi ini
    });

    if (validMenuIds.length === 0) {
      return { menuTree: [], permissions: [] };
    }

    // 3. Ambil data Menu aktif beserta parent-nya agar struktur hierarki tidak patah
    const rawMenus = await Menu.findAll({
      where: {
        id: { [Op.in]: validMenuIds },
        is_active: true,
      },
      order: [['order_index', 'ASC']],
    });

    // Pastikan jika sebuah child lolos, parent-nya juga diambil meskipun parent mungkin tidak punya URL langsung
    const menuMap = new Map();
    rawMenus.forEach(m => menuMap.set(m.id, m));

    const parentIdsToFetch = [];
    rawMenus.forEach(m => {
      if (m.parent_id && !menuMap.has(m.parent_id)) {
        parentIdsToFetch.push(m.parent_id);
      }
    });

    if (parentIdsToFetch.length > 0) {
      const parentMenus = await Menu.findAll({
        where: {
          id: { [Op.in]: [...new Set(parentIdsToFetch)] },
          is_active: true,
        },
      });
      parentMenus.forEach(p => menuMap.set(p.id, p));
    }

    const fullList = Array.from(menuMap.values());
    const menuTree = this.buildTree(fullList, null);

    // 4. Ambil list kode permissions untuk role ini
    const rolePermissions = await RolePermission.findAll({
      where: { role_id: roleId },
      include: [
        {
          model: Permission,
          as: 'permission',
          attributes: ['kode_permission', 'nama_permission', 'action'],
        },
      ],
    });

    const permissions = rolePermissions
      .filter(rp => rp.permission)
      .map(rp => rp.permission.kode_permission);

    return {
      menuTree,
      permissions,
    };
  }

  /**
   * Mengambil semua daftar menu (flat atau tree) untuk keperluan administrasi/konfigurasi
   */
  async getAllMenus(asTree = false) {
    const menus = await Menu.findAll({
      order: [['order_index', 'ASC']],
      include: [
        {
          model: Instalasi,
          as: 'instalasi_list',
          attributes: ['id', 'kode_instalasi', 'nama_instalasi'],
          through: { attributes: [] },
        },
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'kode_role', 'nama_role'],
          through: { attributes: [] },
        },
      ],
    });

    if (asTree) {
      return this.buildTree(menus, null);
    }
    return menus;
  }
}

module.exports = new MenuService();
