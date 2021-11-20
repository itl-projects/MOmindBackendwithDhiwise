const db = require('mongoose');
const adminModel = require('../../../model/admin')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/adminValidation');
const insertAdminValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateAdminValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeAdmin = require('../../../entity/admin')({
  insertAdminValidator,
  updateAdminValidator
});
const adminService = require('../../../services/mongoDbService')({
  model:adminModel,
  makeAdmin
});
const makeAdminController = require('./admin');

const authService = require('../../../services/auth')({
  model:adminModel,
  adminService
});
const adminController = makeAdminController({
  adminService,
  makeAdmin,
  authService
});
module.exports = adminController;
