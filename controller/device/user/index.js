const db = require('mongoose');
const userModel = require('../../../model/user')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/userValidation');
const insertUserValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateUserValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeUser = require('../../../entity/user')({
  insertUserValidator,
  updateUserValidator
});
const userService = require('../../../services/mongoDbService')({
  model:userModel,
  makeUser
});
const makeUserController = require('./user');

const userController = makeUserController({
  userService,
  makeUser
});
module.exports = userController;
