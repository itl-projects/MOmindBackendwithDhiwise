const joi = require('joi');

exports.schemaKeys = joi.object({
  name: joi.string().required(),
  code: joi.string().required(),
  weight: joi.number().integer().required(),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  name: joi.string().when({
    is:joi.exist(),
    then:joi.required(),
    otherwise:joi.optional()
  }),
  code: joi.string().when({
    is:joi.exist(),
    then:joi.required(),
    otherwise:joi.optional()
  }),
  weight: joi.number().integer().when({
    is:joi.exist(),
    then:joi.required(),
    otherwise:joi.optional()
  }),
  isActive: joi.boolean(),
  isDeleted: joi.boolean(),
  _id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
}).unknown(true);
