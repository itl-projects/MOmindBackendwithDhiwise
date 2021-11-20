const message = require('../../../utils/messages');

function makeAdminController ({
  adminService,makeAdmin,authService
})
{
  const addAdmin = async ({
    data, loggedInUser
  }) => {
    try {
      let originalData = data;
      originalData.addedBy = loggedInUser.id.toString();
      const admin = makeAdmin(originalData,'insertAdminValidator');
      let createdAdmin = await adminService.createDocument(admin);
            
      return message.successResponse(
        { data :  createdAdmin }
      );

    } catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message : error.message });
      }
      return message.failureResponse();
    }
  };

  const findAllAdmin = async ({
    data, loggedInUser
  }) => {
    try {
      let options = {};
      let query = {};
      let result;
      if (data.query !== undefined) {
        query = { ...data.query };
      }
      if (loggedInUser){
        query = {
          ...query,
          ...{ '_id': { $ne: loggedInUser.id } } 
        };
        if (data.query && data.query._id) {
          Object.assign(query._id, { $in: [data.query._id] });
        }
      } else {
        return message.badRequest();
      }
      if (data.isCountOnly){
        result = await adminService.countDocument(query);
        if (result) {
          result = { totalRecords: result };  
          return message.successResponse(result);
        } else {
          return message.recordNotFound();
        }
      } else { 
        if (data.options !== undefined) {
          options = { ...data.options };
        }
        result = await adminService.getAllDocuments(query,options);
      }
      if (result.data){
        return message.successResponse({ data: result });
      } else {
        return message.recordNotFound();
      }
            
    }
    catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message :error.message });
      }
      return message.failureResponse();
    }
  };

  const getAdminCount = async (data) => {
    try {
      let where = {};
      if (data && data.where){
        where = data.where;
      }
      let result = await adminService.countDocument(where);
      if (result){
        result = { totalRecords:result };
        return message.successResponse({ data: result });
                
      }
      else {
        return message.recordNotFound();
      }
      return message.badRequest();
    }
    catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message :error.message });
      }
      return message.failureResponse();
    }
  };

  const getAdminByAggregate = async ({ data }) =>{
    try {
      if (data){
        let result = await adminService.getDocumentByAggregation(data);
        if (result && result.length){
          return message.successResponse({ data: result });
        }
      }
      return message.badRequest();
    } catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message :error.message });
      }
      return message.failureResponse(); 
    }
  };

  const softDeleteManyAdmin = async (ids, loggedInUser) => {
    try {
      if (ids){
        const deleteDependentService = require('../../../utils/deleteDependent');
        let query = {};
        if (loggedInUser){
          query = {
            '_id': {
              '$in': ids,
              '$ne': loggedInUser.id
            }
          };
        } 
        const updateBody = {
          isDeleted: true,
          updatedBy: loggedInUser.id
        };
        let result = await deleteDependentService.softDeleteAdmin(query, updateBody);
        return message.successResponse({ data:result });
      }
      return message.badRequest();
    } catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message :error.message });
      }
      return message.failureResponse();
    }
  };

  const bulkInsertAdmin = async ({
    body, loggedInUser
  }) => {
    try {
      let data = body.data;
      for (let i = 0;i < data.length;i++){
        data[i] = {
          ...{ addedBy:loggedInUser.id.toString() },
          ...data[i]
        };
      }
      const adminEntities = data.map((item)=>makeAdmin(item,'insertAdminValidator'));
      const results = await adminService.bulkInsert(adminEntities);
      return message.successResponse({ data:results });
    } catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message : error.message });
      }
      return message.failureResponse();
    }
  };

  const bulkUpdateAdmin = async (data, loggedInUser) => {
    try {
      if (data.filter && data.data){
        delete data.data['addedBy'];
        delete data.data['updatedBy'];
        data.data.updatedBy = loggedInUser.id;
        const admin = makeAdmin(data.data,'updateAdminValidator');
        const filterData = removeEmpty(admin);
        let query = {};
        if (loggedInUser){
          query = {
            '_id': { '$ne': loggedInUser.id },
            ...data.filter                        
          };
          if (data.filter && data.filter._id){ 
            Object.assign(query._id, { $in: [data.query._id] });
          }
        } else {
          return message.badRequest();
        }
        const updatedAdmins = await adminService.bulkUpdate(query,filterData);
        return message.successResponse({ data:updatedAdmins });
      }
      return message.badRequest();
    } catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message :error.message });
      }
      return message.failureResponse();
    }
  };

  const deleteManyAdmin = async (data, loggedInUser) => {
    try {
      if (data && data.ids){
        const deleteDependentService = require('../../../utils/deleteDependent');
        let ids = data.ids;
        let query = {};
        if (loggedInUser){
          query = {
            '_id': {
              '$in': ids,
              '$ne': loggedInUser.id
            }
          };
        } 
        let result;
        if (data.isWarning){
          result = await deleteDependentService.countAdmin(query);
        } else {
          result = await deleteDependentService.deleteAdmin(query);
        }
        return message.successResponse({ data:result });
      }
      return message.badRequest();
    }
    catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message :error.message });
      }
      return message.failureResponse();
    }
  };

  const softDeleteAdmin = async (id,loggedInUser) => {
    try {
      const deleteDependentService = require('../../../utils/deleteDependent');
      let query = {};
      if (loggedInUser){
        query = {
          '_id': {
            '$eq': id,
            '$ne': loggedInUser.id
          }
        };
      } else {
        return message.badRequest();
      }
      const updateBody = {
        isDeleted: true,
        updatedBy: loggedInUser.id
      };
      let result = await deleteDependentService.softDeleteAdmin(query, updateBody);
      return message.successResponse({ data:result });
            
    } catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message: error.message });
      }
      return message.failureResponse();
    }
  };

  const partialUpdateAdmin = async (data,id, loggedInUser) => {
    try {
      if (id && data){
        delete data['addedBy'];
        delete data['updatedBy'];
        admin.updatedBy = loggedInUser.id;
        const admin = makeAdmin(data,'updateAdminValidator');            
        const filterData = removeEmpty(admin);
        let query = {};
        if (loggedInUser){
          query = {
            '_id': {
              '$eq': id,
              '$ne': loggedInUser.id
            }
          }; 
          let updatedAdmin = await adminService.findOneAndUpdateDocument(query,filterData,{ new:true });
          if (updatedAdmin){
            return message.successResponse({ data: updatedAdmin });
          }
          else {
            return message.badRequest();
          }
        }
      }
      else {
        return message.badRequest();
      }
    }
    catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message :error.message });
      }
      return message.failureResponse();
    }
  };

  const updateAdmin = async (data,id, loggedInUser) =>{
    try {
      delete data['addedBy'];
      delete data['updatedBy'];
      data.updatedBy = loggedInUser.id;
      if (id && data){
        const admin = makeAdmin(data,'updateAdminValidator');
        const filterData = removeEmpty(admin);
        let query = {};
        if (loggedInUser){
          query = {
            '_id': {
              '$eq': id,
              '$ne': loggedInUser.id
            }
          };
        } else {
          return message.badRequest();
        }
        let updatedAdmin = await adminService.findOneAndUpdateDocument(query,filterData,{ new:true });
        if (updatedAdmin){
          return message.successResponse({ data : updatedAdmin });
        }
      }
      return message.badRequest();
    }
    catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message : error.message });
      }
      return message.failureResponse();
    }
  };

  const getAdminById = async (query, body = {}) =>{
    try {
      if (query){
        let options = {};
        if (body && body.populate && body.populate.length) options.populate = body.populate;
        if (body && body.select && body.select.length) options.select = body.select;
        let result = await adminService.getSingleDocument(query, options);
        if (result){
          return message.successResponse({ data: result });
        }
        return message.recordNotFound();
                 
      }
      return message.badRequest();
    }
    catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message :error.message });
      }
      return message.failureResponse();
    }
  };

  const deleteAdmin = async (data,id,loggedInUser) => {
    try {
      const deleteDependentService = require('../../../utils/deleteDependent');
      let query = {};
      if (loggedInUser){
        query = {
          '_id': {
            '$eq': id,
            '$ne': loggedInUser.id
          }
        };
      } else {
        return message.badRequest();
      }
      if (data.isWarning) {
        let all = await deleteDependentService.countAdmin(query);
        return message.successResponse({ data:all });
      } else {
        let result = await deleteDependentService.deleteAdmin(query);
        if (result){
          return message.successResponse({ data:result });
                    
        }
      }
      return message.badRequest();
    }
    catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message:error.message });
      }
      return message.failureResponse();
    }
  };

  const removeEmpty = (obj) => {
    Object.entries(obj).forEach(([key,value])=>{
      if (value === undefined){
        delete obj[key];
      }
    });
    return obj;
  };

  const changePassword = async (params) => {
    try {
      if (!params.newPassword || !params.userId || !params.oldPassword) {
        return message.inValidParam({ message:'Please Provide userId and new Password and Old password' });
      }
      let result = await authService.changePassword(params);
      if (result.flag) {
        return message.invalidRequest({ message :result.data });
      }
      return message.requestValidated({ message :result.data });
            
    } catch (error) {
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message :error.message });
      }
      return message.failureResponse();
    }
  };  
    
  const updateProfile = async (data,id) =>{
    try {
      if (id && data){
        if (data.password) delete data.password;
        if (data.createdAt) delete data.createdAt;
        if (data.updatedAt) delete data.updatedAt;
        if (data.id) delete data.id;
        const user = makeAdmin(data,'updateAdminValidator');
        const filterData = removeEmpty(user);
        let updatedAdmin = await adminService.findOneAndUpdateDocument({ _id:id },filterData,{ new:true });
        return message.successResponse({ data:updatedAdmin });
      }
      return message.badRequest();
    }
    catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message :error.message });
      }
      return message.failureResponse();
    }
  };

  return Object.freeze({
    addAdmin,
    findAllAdmin,
    getAdminCount,
    getAdminByAggregate,
    softDeleteManyAdmin,
    bulkInsertAdmin,
    bulkUpdateAdmin,
    deleteManyAdmin,
    softDeleteAdmin,
    partialUpdateAdmin,
    updateAdmin,
    getAdminById,
    deleteAdmin,
    removeEmpty,
    changePassword,
    updateProfile,
  });
}

module.exports = makeAdminController;
