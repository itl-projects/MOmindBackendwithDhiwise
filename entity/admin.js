
function buildMakeAdmin ({
  insertAdminValidator,updateAdminValidator
}){
  return function makeAdmin (data,validatorName){
    let isValid = '';
    switch (validatorName){
    case 'insertAdminValidator':
      isValid = insertAdminValidator(data);
      break;

    case 'updateAdminValidator':
      isValid = updateAdminValidator(data);  
      break; 
    }
    if (isValid.error){
      throw ({
        name:'ValidationError',
        message:`Invalid data in Admin entity. ${isValid.error}`
      });
    }
      
    return {
      fullName:data.fullName,
      email:data.email,
      password:data.password,
      isActive:data.isActive,
      createdAt:data.createdAt,
      updatedAt:data.updatedAt,
      addedBy:data.addedBy,
      updatedBy:data.updatedBy,
      mobileNo:data.mobileNo,
      isDeleted:data.isDeleted,
      role:data.role,
      resetPasswordLink:data.resetPasswordLink,
      loginRetryLimit:data.loginRetryLimit,
      loginReactiveTime:data.loginReactiveTime,
    };
  };
}
module.exports =  buildMakeAdmin;
