const db = require('mongoose');
const userModel  = require('../../../model/admin')(db);
const userToken = require('../../../model/userTokens')(db);
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
  model:userModel,
  makeAdmin
});
const userTokenService = require('../../../services/mongoDbService')({ model:userToken });
const userRoleModel  = require('../../../model/userRole')(db);
const userRoleService = require('../../../services/mongoDbService')({ model:userRoleModel });
const routeRoleModel  = require('../../../model/routeRole')(db);
const routeRoleService = require('../../../services/mongoDbService')({ model:routeRoleModel });
const roleModel = require('../../../model/role')(db);
const roleService = require('../../../services/mongoDbService')({ model:roleModel });
const authService = require('../../../services/auth')({
  model:userModel,
  adminService,
  userTokenService,
  userRoleService,
  routeRoleService
});
const makeUniqueValidation = require('../../../utils/common.js').makeUniqueValidation(adminService);
const makeAuthController = require('./authController');
const authController = makeAuthController({
  authService,
  makeUniqueValidation,
  adminService,
  makeAdmin,
  userTokenService,
  roleService,
  userRoleService
});
module.exports = authController;