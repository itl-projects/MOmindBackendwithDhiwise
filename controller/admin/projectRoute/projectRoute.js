const message = require('../../../utils/messages');

function makeProjectRouteController ({
  projectRouteService,makeProjectRoute
})
{
  const addProjectRoute = async ({
    data, loggedInUser
  }) => {
    try {
      let originalData = data;
      originalData.addedBy = loggedInUser.id.toString();
      const projectRoute = makeProjectRoute(originalData,'insertProjectRouteValidator');
      let createdProjectRoute = await projectRouteService.createDocument(projectRoute);
            
      return message.successResponse(
        { data :  createdProjectRoute }
      );

    } catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message : error.message });
      }
      return message.failureResponse();
    }
  };

  const bulkInsertProjectRoute = async ({
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
      const projectRouteEntities = data.map((item)=>makeProjectRoute(item,'insertProjectRouteValidator'));
      const results = await projectRouteService.bulkInsert(projectRouteEntities);
      return message.successResponse({ data:results });
    } catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message : error.message });
      }
      return message.failureResponse();
    }
  };

  const findAllProjectRoute = async ({
    data, loggedInUser
  }) => {
    try {
      let options = {};
      let query = {};
      let result;
      if (data.query !== undefined) {
        query = { ...data.query };
      }
      if (data.isCountOnly){
        result = await projectRouteService.countDocument(query);
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
        result = await projectRouteService.getAllDocuments(query,options);
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

  const getProjectRouteCount = async (data) => {
    try {
      let where = {};
      if (data && data.where){
        where = data.where;
      }
      let result = await projectRouteService.countDocument(where);
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

  const upsertProjectRoute = async (data, loggedInUser)=>{
    try {
      if (data){
        let result;
        if (data && data.id) {
          let where = data.id; 
          delete data['addedBy'];
          delete data['updatedBy'];
          data.updatedBy = loggedInUser.id;
          const projectRoute = makeProjectRoute(data,'updateProjectRouteValidator');
          const filterData = removeEmpty(projectRoute);
          result = await projectRouteService.updateDocument(where,filterData);
        }
        else {
          delete data['addedBy'];
          delete data['updatedBy'];
          data.addedBy = loggedInUser.id;
          const projectRoute = makeProjectRoute(data,'insertProjectRouteValidator');

          result = await projectRouteService.createDocument(projectRoute); 
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

  const bulkUpdateProjectRoute = async (data, loggedInUser) => {
    try {
      if (data.filter && data.data){
        delete data.data['addedBy'];
        delete data.data['updatedBy'];
        data.data.updatedBy = loggedInUser.id;
        const projectRoute = makeProjectRoute(data.data,'updateProjectRouteValidator');
        const filterData = removeEmpty(projectRoute);
        let query = data.filter;
        const updatedProjectRoutes = await projectRouteService.bulkUpdate(query,filterData);
        return message.successResponse({ data:updatedProjectRoutes });
      }
      return message.badRequest();
    } catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message :error.message });
      }
      return message.failureResponse();
    }
  };

  const softDeleteManyProjectRoute = async (ids, loggedInUser) => {
    try {
      if (ids){
        const deleteDependentService = require('../../../utils/deleteDependent');
        const query = { _id:{ $in:ids } };
        const updateBody = { isDeleted: true, };
        let result = await deleteDependentService.softDeleteProjectRoute(query, updateBody);
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

  const deleteManyProjectRoute = async (data, loggedInUser) => {
    try {
      if (data && data.ids){
        const deleteDependentService = require('../../../utils/deleteDependent');
        let ids = data.ids;
        const query = { '_id':{ '$in':ids } };
        let result;
        if (data.isWarning){
          result = await deleteDependentService.countProjectRoute(query);
        } else {
          result = await deleteDependentService.deleteProjectRoute(query);
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

  const getProjectRouteByAggregate = async ({ data }) =>{
    try {
      if (data){
        let result = await projectRouteService.getDocumentByAggregation(data);
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

  const softDeleteProjectRoute = async (id,loggedInUser) => {
    try {
      const deleteDependentService = require('../../../utils/deleteDependent');
      const query = { _id:id };
      const updateBody = { isDeleted: true, };
      let result = await deleteDependentService.softDeleteProjectRoute(query, updateBody);
      return message.successResponse({ data:result });
            
    } catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam({ message: error.message });
      }
      return message.failureResponse();
    }
  };

  const partialUpdateProjectRoute = async (data,id, loggedInUser) => {
    try {
      if (id && data){
        delete data['addedBy'];
        delete data['updatedBy'];
        projectRoute.updatedBy = loggedInUser.id;
        const projectRoute = makeProjectRoute(data,'updateProjectRouteValidator');            
        const filterData = removeEmpty(projectRoute);
        const query = { _id:id };
        let updatedProjectRoute = await projectRouteService.findOneAndUpdateDocument(query,filterData,{ new:true });
        if (updatedProjectRoute){
          return message.successResponse({ data : updatedProjectRoute });
        }
        else {
          return message.badRequest();
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

  const updateProjectRoute = async (data,id, loggedInUser) =>{
    try {
      delete data['addedBy'];
      delete data['updatedBy'];
      data.updatedBy = loggedInUser.id;
      if (id && data){
        const projectRoute = makeProjectRoute(data,'updateProjectRouteValidator');
        const filterData = removeEmpty(projectRoute);
        let query = { _id:id };
        let updatedProjectRoute = await projectRouteService.findOneAndUpdateDocument(query,filterData,{ new:true });
        if (updatedProjectRoute){
          return message.successResponse({ data : updatedProjectRoute });
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

  const getProjectRouteById = async (query, body = {}) =>{
    try {
      if (query){
        let options = {};
        if (body && body.populate && body.populate.length) options.populate = body.populate;
        if (body && body.select && body.select.length) options.select = body.select;
        let result = await projectRouteService.getSingleDocument(query, options);
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

  const deleteProjectRoute = async (data,id,loggedInUser) => {
    try {
      const deleteDependentService = require('../../../utils/deleteDependent');
      let query = { _id:id };
      if (data.isWarning) {
        let all = await deleteDependentService.countProjectRoute(query);
        return message.successResponse({ data:all });
      } else {
        let result = await deleteDependentService.deleteProjectRoute(query);
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

  return Object.freeze({
    addProjectRoute,
    bulkInsertProjectRoute,
    findAllProjectRoute,
    getProjectRouteCount,
    upsertProjectRoute,
    bulkUpdateProjectRoute,
    softDeleteManyProjectRoute,
    deleteManyProjectRoute,
    getProjectRouteByAggregate,
    softDeleteProjectRoute,
    partialUpdateProjectRoute,
    updateProjectRoute,
    getProjectRouteById,
    deleteProjectRoute,
    removeEmpty,
  });
}

module.exports = makeProjectRouteController;
