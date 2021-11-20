const joi = require('joi');

const { USER_ROLE } = require('../constants/authConstant');
const { convertObjectToEnum } = require('../utils/common');   
exports.schemaKeys = joi.object({
  fullName: joi.string().allow(null).allow(''),
  email: joi.string().allow(null).allow(''),
  password: joi.string().allow(null).allow(''),
  isActive: joi.boolean(),
  mobileNo: joi.string().allow(null).allow(''),
  role: joi.number().integer().valid(...convertObjectToEnum(USER_ROLE)).allow(0),
  resetPasswordLink: joi.object({
    code:joi.string(),
    expireTime:joi.date()
  }),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  fullName: joi.string().allow(null).allow(''),
  email: joi.string().allow(null).allow(''),
  password: joi.string().allow(null).allow(''),
  isActive: joi.boolean(),
  mobileNo: joi.string().allow(null).allow(''),
  role: joi.number().integer().valid(...convertObjectToEnum(USER_ROLE)).allow(0),
  resetPasswordLink: joi.object({
    code:joi.string(),
    expireTime:joi.date()
  }),
  isDeleted: joi.boolean(),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);
