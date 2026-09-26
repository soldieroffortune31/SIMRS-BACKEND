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
      const currentMenuId = itemJson.menu_id !== undefined ? itemJson.menu_id : itemJson.id;
      const children = this.buildTree(items, currentMenuId);
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
   * Mengambil pohon menu yang berhak diakses berdasarkan Role, Instalasi aktif, dan Modul yang diizinkan
   * @param {number} roleId - ID Role pengguna di ruangan aktif
   * @param {number} instalasiId - ID Instalasi yang sedang aktif
   * @param {Array<number>|null} allowedModuleIds - Array ID modul yang diizinkan untuk akun di ruangan ini (opsional)
   * @returns {Promise<{ menuTree: Array, permissions: Array<string> }>}
   */
  async getMenuAndPermissionsForContext(roleId, instalasiId, allowedModuleIds = null) {
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

    let validMenuIds = allowedMenuIdsForRole.filter(menuId => {
      const isRestricted = restrictedMenuIds.has(menuId);
      if (!isRestricted) return true;
      return allowedForThisInstalasi.has(menuId);
    });

    if (validMenuIds.length === 0) {
      return { menuTree: [], permissions: [] };
    }

    // 3. Ambil data Menu aktif beserta relasi Modul-nya
    const { Modul } = require('../models');
    const rawMenus = await Menu.findAll({
      where: {
        menu_id: { [Op.in]: validMenuIds },
        is_active: true,
      },
      include: [
        {
          model: Modul,
          as: 'modul',
          attributes: ['modul_id', 'kode_modul', 'nama_modul', 'icon'],
          required: false,
        },
      ],
      order: [['order_index', 'ASC']],
    });

    // 4. Filter berdasarkan Modul jika allowedModuleIds diberikan
    let filteredMenus = rawMenus;
    if (Array.isArray(allowedModuleIds)) {
      const allowedModSet = new Set(allowedModuleIds);
      filteredMenus = rawMenus.filter(m => {
        if (!m.modul_id) return true;
        return allowedModSet.has(m.modul_id);
      });
    }

    // Pastikan jika sebuah child lolos, parent-nya juga diambil meskipun parent mungkin tidak punya URL langsung
    const menuMap = new Map();
    filteredMenus.forEach(m => menuMap.set(m.menu_id || m.id, m));

    const parentIdsToFetch = [];
    filteredMenus.forEach(m => {
      if (m.parent_id && !menuMap.has(m.parent_id)) {
        parentIdsToFetch.push(m.parent_id);
      }
    });

    if (parentIdsToFetch.length > 0) {
      const parentMenus = await Menu.findAll({
        where: {
          menu_id: { [Op.in]: [...new Set(parentIdsToFetch)] },
          is_active: true,
        },
        include: [
          {
            model: Modul,
            as: 'modul',
            attributes: ['modul_id', 'kode_modul', 'nama_modul', 'icon'],
            required: false,
          },
        ],
      });
      parentMenus.forEach(p => menuMap.set(p.menu_id || p.id, p));
    }

    const fullList = Array.from(menuMap.values());
    const menuTree = this.buildTree(fullList, null);

    // 5. Ambil list kode permissions untuk role ini
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
          attributes: ['instalasi_id', 'kode_instalasi', 'nama_instalasi'],
          through: { attributes: [] },
        },
        {
          model: Role,
          as: 'roles',
          attributes: ['role_id', 'kode_role', 'nama_role'],
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
