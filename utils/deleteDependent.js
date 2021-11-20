const db = require('mongoose');
let Admin = require('../model/admin')(db);
let User = require('../model/user')(db);
let UserTokens = require('../model/userTokens')(db);
let Role = require('../model/role')(db);
let ProjectRoute = require('../model/projectRoute')(db);
let RouteRole = require('../model/routeRole')(db);
let UserRole = require('../model/userRole')(db);

const deleteAdmin = async (filter) =>{
  try {
    let admin = await Admin.find(filter, { _id:1 });
    if (admin.length){
      admin = admin.map((obj) => obj._id);
      const adminFilter8793 = { 'addedBy': { '$in': admin } };
      const admin7352 = await deleteAdmin(adminFilter8793);
      const adminFilter6662 = { 'updatedBy': { '$in': admin } };
      const admin4364 = await deleteAdmin(adminFilter6662);
      const userFilter9151 = { 'addedBy': { '$in': admin } };
      const user4378 = await deleteUser(userFilter9151);
      const userFilter6822 = { 'updatedBy': { '$in': admin } };
      const user2806 = await deleteUser(userFilter6822);
      const userTokensFilter9462 = { 'userId': { '$in': admin } };
      const userTokens1452 = await deleteUserTokens(userTokensFilter9462);
      const userRoleFilter9413 = { 'userId': { '$in': admin } };
      const userRole6464 = await deleteUserRole(userRoleFilter9413);
      return await Admin.deleteMany(filter);
    } else {
      return 'No admin found.';
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteUser = async (filter) =>{
  try {
    return await User.deleteMany(filter);
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteUserTokens = async (filter) =>{
  try {
    return await UserTokens.deleteMany(filter);
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteRole = async (filter) =>{
  try {
    let role = await Role.find(filter, { _id:1 });
    if (role.length){
      role = role.map((obj) => obj._id);
      const routeRoleFilter5771 = { 'roleId': { '$in': role } };
      const routeRole1696 = await deleteRouteRole(routeRoleFilter5771);
      const userRoleFilter8680 = { 'roleId': { '$in': role } };
      const userRole4164 = await deleteUserRole(userRoleFilter8680);
      return await Role.deleteMany(filter);
    } else {
      return 'No role found.';
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteProjectRoute = async (filter) =>{
  try {
    let projectroute = await ProjectRoute.find(filter, { _id:1 });
    if (projectroute.length){
      projectroute = projectroute.map((obj) => obj._id);
      const routeRoleFilter2370 = { 'routeId': { '$in': projectroute } };
      const routeRole9031 = await deleteRouteRole(routeRoleFilter2370);
      return await ProjectRoute.deleteMany(filter);
    } else {
      return 'No projectRoute found.';
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteRouteRole = async (filter) =>{
  try {
    return await RouteRole.deleteMany(filter);
  } catch (error){
    throw new Error(error.message);
  }
};

const deleteUserRole = async (filter) =>{
  try {
    return await UserRole.deleteMany(filter);
  } catch (error){
    throw new Error(error.message);
  }
};

const countAdmin = async (filter) =>{
  try {
    let admin = await Admin.find(filter, { _id:1 });
    if (admin.length){
      admin = admin.map((obj) => obj._id);

      const adminFilter = { '$or': [{                    addedBy : { '$in' : admin } },{                    updatedBy : { '$in' : admin } }] };
      const adminCnt =  await Admin.countDocuments(adminFilter);

      const userFilter = { '$or': [{                    addedBy : { '$in' : admin } },{                    updatedBy : { '$in' : admin } }] };
      const userCnt =  await User.countDocuments(userFilter);

      const userTokensFilter = { '$or': [{                    userId : { '$in' : admin } }] };
      const userTokensCnt =  await UserTokens.countDocuments(userTokensFilter);

      const userRoleFilter = { '$or': [{                    userId : { '$in' : admin } }] };
      const userRoleCnt =  await UserRole.countDocuments(userRoleFilter);
           
      let response = {
        admin : adminCnt,
        user : userCnt,
        userTokens : userTokensCnt,
        userRole : userRoleCnt,
      };
            
      return response;
    } else {
      return {  admin : 0 };
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countUser = async (filter) =>{
  try {
    const userCnt =  await User.countDocuments(filter);
    return { user : userCnt };
  } catch (error){
    throw new Error(error.message);
  }
};

const countUserTokens = async (filter) =>{
  try {
    const userTokensCnt =  await UserTokens.countDocuments(filter);
    return { userTokens : userTokensCnt };
  } catch (error){
    throw new Error(error.message);
  }
};

const countRole = async (filter) =>{
  try {
    let role = await Role.find(filter, { _id:1 });
    if (role.length){
      role = role.map((obj) => obj._id);

      const routeRoleFilter = { '$or': [{                    roleId : { '$in' : role } }] };
      const routeRoleCnt =  await RouteRole.countDocuments(routeRoleFilter);

      const userRoleFilter = { '$or': [{                    roleId : { '$in' : role } }] };
      const userRoleCnt =  await UserRole.countDocuments(userRoleFilter);
           
      let response = {
        routeRole : routeRoleCnt,
        userRole : userRoleCnt,
      };
            
      return response;
    } else {
      return {  role : 0 };
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countProjectRoute = async (filter) =>{
  try {
    let projectroute = await ProjectRoute.find(filter, { _id:1 });
    if (projectroute.length){
      projectroute = projectroute.map((obj) => obj._id);

      const routeRoleFilter = { '$or': [{                    routeId : { '$in' : projectroute } }] };
      const routeRoleCnt =  await RouteRole.countDocuments(routeRoleFilter);
           
      let response = { routeRole : routeRoleCnt, };
            
      return response;
    } else {
      return {  projectroute : 0 };
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const countRouteRole = async (filter) =>{
  try {
    const routeRoleCnt =  await RouteRole.countDocuments(filter);
    return { routeRole : routeRoleCnt };
  } catch (error){
    throw new Error(error.message);
  }
};

const countUserRole = async (filter) =>{
  try {
    const userRoleCnt =  await UserRole.countDocuments(filter);
    return { userRole : userRoleCnt };
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteAdmin = async (filter,updateBody, defaultValues = {}) =>{
  try {
    let admin = await Admin.find(filter, { _id:1 });
    if (admin.length){
      admin = admin.map((obj) => obj._id);
      const adminFilter5632 = { 'addedBy': { '$in': admin } };
      const admin6145 = await softDeleteAdmin(adminFilter5632, updateBody);
      const adminFilter5105 = { 'updatedBy': { '$in': admin } };
      const admin3321 = await softDeleteAdmin(adminFilter5105, updateBody);
      const userFilter6094 = { 'addedBy': { '$in': admin } };
      const user5277 = await softDeleteUser(userFilter6094, updateBody);
      const userFilter4912 = { 'updatedBy': { '$in': admin } };
      const user2727 = await softDeleteUser(userFilter4912, updateBody);
      const userTokensFilter7869 = { 'userId': { '$in': admin } };
      const userTokens2343 = await softDeleteUserTokens(userTokensFilter7869, updateBody);
      const userRoleFilter4238 = { 'userId': { '$in': admin } };
      const userRole4692 = await softDeleteUserRole(userRoleFilter4238, updateBody);
      return await Admin.updateMany(filter, {
        ...defaultValues,
        ...updateBody
      });
    } else {
      return 'No admin found.';
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteUser = async (filter,updateBody, defaultValues = {}) =>{
  try {
    return await User.updateMany(filter, {
      ...defaultValues,
      ...updateBody
    });
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteUserTokens = async (filter,updateBody, defaultValues = {}) =>{
  try {
    return await UserTokens.updateMany(filter, {
      ...defaultValues,
      ...updateBody
    });
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteRole = async (filter,updateBody, defaultValues = {}) =>{
  try {
    let role = await Role.find(filter, { _id:1 });
    if (role.length){
      role = role.map((obj) => obj._id);
      const routeRoleFilter9907 = { 'roleId': { '$in': role } };
      const routeRole9307 = await softDeleteRouteRole(routeRoleFilter9907, updateBody);
      const userRoleFilter3239 = { 'roleId': { '$in': role } };
      const userRole2900 = await softDeleteUserRole(userRoleFilter3239, updateBody);
      return await Role.updateMany(filter, {
        ...defaultValues,
        ...updateBody
      });
    } else {
      return 'No role found.';
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteProjectRoute = async (filter,updateBody, defaultValues = {}) =>{
  try {
    let projectroute = await ProjectRoute.find(filter, { _id:1 });
    if (projectroute.length){
      projectroute = projectroute.map((obj) => obj._id);
      const routeRoleFilter8997 = { 'routeId': { '$in': projectroute } };
      const routeRole8483 = await softDeleteRouteRole(routeRoleFilter8997, updateBody);
      return await ProjectRoute.updateMany(filter, {
        ...defaultValues,
        ...updateBody
      });
    } else {
      return 'No projectRoute found.';
    }
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteRouteRole = async (filter,updateBody, defaultValues = {}) =>{
  try {
    return await RouteRole.updateMany(filter, {
      ...defaultValues,
      ...updateBody
    });
  } catch (error){
    throw new Error(error.message);
  }
};

const softDeleteUserRole = async (filter,updateBody, defaultValues = {}) =>{
  try {
    return await UserRole.updateMany(filter, {
      ...defaultValues,
      ...updateBody
    });
  } catch (error){
    throw new Error(error.message);
  }
};

module.exports = {
  deleteAdmin,
  deleteUser,
  deleteUserTokens,
  deleteRole,
  deleteProjectRoute,
  deleteRouteRole,
  deleteUserRole,
  countAdmin,
  countUser,
  countUserTokens,
  countRole,
  countProjectRoute,
  countRouteRole,
  countUserRole,
  softDeleteAdmin,
  softDeleteUser,
  softDeleteUserTokens,
  softDeleteRole,
  softDeleteProjectRoute,
  softDeleteRouteRole,
  softDeleteUserRole,
};
