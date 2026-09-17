const userService = require('../services/user.service');

class UserController {
  async createUser(req, res, next) {
    try {
      const { assignments, ...userData } = req.body;
      const newUser = await userService.createUser(userData, assignments);

      return res.status(201).json({
        success: true,
        message: 'Pengguna berhasil ditambahkan.',
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async assignRuangan(req, res, next) {
    try {
      const userId = req.params.id;
      const { ruangan_id, role_id, is_default } = req.body;

      const assignment = await userService.assignRuanganRole(
        userId,
        ruangan_id,
        role_id,
        is_default
      );

      return res.status(200).json({
        success: true,
        message: 'Penugasan ruangan berhasil diperbarui.',
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
