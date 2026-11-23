const service = require('../services/authService');
const { asyncHandler, sendSuccess } = require('./response');

module.exports = {
  register: asyncHandler(async (req, res) => sendSuccess(res, await service.registerUser(req.body), 201, 'Usuario registrado con éxito.')),
  login: asyncHandler(async (req, res) => sendSuccess(res, await service.loginUser(req.body), 200, 'Inicio de sesión exitoso.')),
  listUsers: asyncHandler(async (req, res) => sendSuccess(res, await service.listUsers()))
};
