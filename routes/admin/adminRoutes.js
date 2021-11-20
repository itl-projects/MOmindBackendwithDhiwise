const express = require('express');
const router = express.Router();
const adminController = require('../../controller/admin/admin');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.post('/admin/admin/create',auth(...[ 'createByAdminInAdminPlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  adminController.addAdmin({
    data: req.body,
    loggedInUser:req.user
  }).then((result)=>{
    sendResponse(res, result);
  })
    .catch((error) => {
      sendResponse(res,error);
    });
});

router.post('/admin/admin/list',auth(...[ 'getAllByAdminInAdminPlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);    
  adminController.findAllAdmin({
    data: req.body,
    loggedInUser:req.user
  }).then((result)=>{
    sendResponse(res,result);
  })
    .catch((error) => {
      sendResponse(res,error);
    });
});

router.route('/admin/admin/count').post(auth(...[ 'getCountByAdminInAdminPlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  adminController.getAdminCount(req.body).then((result)=>{
    sendResponse(res,result);
  })
    .catch((error) => {
      sendResponse(res,error);
    });
});

router.route('/admin/admin/aggregate').post(auth(...[ 'aggregateByAdminInAdminPlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  adminController.getAdminByAggregate({ data:req.body }).then((result)=>{
    sendResponse(res,result);
  })
    .catch((error) => {
      sendResponse(res,error);
    });
});

router.put('/admin/admin/softDeleteMany',auth(...[ 'softDeleteManyByAdminInAdminPlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  adminController.softDeleteManyAdmin(req.body.ids,req.user
  ).then((result)=>{
    sendResponse(res,result);
  })
    .catch((error) => {
      sendResponse(res,error);
    });
});

router.post('/admin/admin/addBulk',auth(...[ 'addBulkByAdminInAdminPlatform' ]),checkRolePermission,(req,res,next)=>{
  adminController.bulkInsertAdmin({
    body: req.body,
    loggedInUser: req.user
  }).then((result)=>{
    sendResponse(res,result);
  })
    .catch((error) => {
      sendResponse(res,error);
    });
});

router.put('/admin/admin/updateBulk',auth(...[ 'updateBulkByAdminInAdminPlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  adminController.bulkUpdateAdmin(req.body,req.user
  ).then((result)=>{
    sendResponse(res,result);
  })
    .catch((error) => {
      sendResponse(res,error);
    });
}); 

router.delete('/admin/admin/deleteMany',auth(...[ 'deleteManyByAdminInAdminPlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  adminController.deleteManyAdmin(req.body,req.user).then((result)=>{
    sendResponse(res,result);
  })
    .catch((error) => {
      sendResponse(res,error);
    });
});

router.put('/admin/admin/softDelete/:id',auth(...[ 'softDeleteByAdminInAdminPlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  adminController.softDeleteAdmin(req.pathParams.id,req.user
  ).then((result)=>{
    sendResponse(res,result);
  })
    .catch((error) => {
      sendResponse(res,error);
    });
});

router.put('/admin/admin/partial-update/:id',auth(...[ 'partialUpdateByAdminInAdminPlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  adminController.partialUpdateAdmin(req.body,req.pathParams.id,req.user).then((result)=>{
    sendResponse(res,result);
  })
    .catch((error) => {
      sendResponse(res,error);
    });
});   

router.put('/admin/admin/update/:id',auth(...[ 'updateByAdminInAdminPlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  adminController.updateAdmin(req.body,req.pathParams.id,req.user
  ).then((result)=>{
    sendResponse(res,result);
  })
    .catch((error) => {
      sendResponse(res,error);
    });
});   

router.get('/admin/admin/:id',auth(...[ 'getByAdminInAdminPlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  adminController.getAdminById({ _id: req.pathParams.id }).then((result)=>{
    sendResponse(res,result);
  })
    .catch((error) => {
      sendResponse(res,error);
    });
});
router.post('/admin/admin/:id',auth(...[ 'getByAdminInAdminPlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  adminController.getAdminById({ _id: req.pathParams.id }, req.body).then((result)=>{
    sendResponse(res,result);
  })
    .catch((error) => {
      sendResponse(res,error);
    });
});

router.delete('/admin/admin/delete/:id',auth(...[ 'deleteByAdminInAdminPlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  adminController.deleteAdmin(req.body,req.pathParams.id,req.user).then((result)=>{
    sendResponse(res,result);
  })
    .catch((error) => {
      sendResponse(res,error);
    });
});

router.route('/admin/admin/change-password').put(auth(...[ 'changePasswordByAdminInAdminPlatform' ]),(req,res,next)=>{
  req = adaptRequest(req);
  let params = {
    ...req.body,
    userId:req.user.id
  };
  adminController.changePassword(params).then((result)=>{
    sendResponse(res,result);
  })
    .catch((error) => {
      sendResponse(res,error);
    });
});
router.route('/admin/admin/update-profile').put(auth(...[ 'updateProfileByAdminInAdminPlatform' ]),(req,res,next)=>{
  req = adaptRequest(req);
  adminController.updateProfile(req.body,req.user.id).then((result)=>{
    sendResponse(res,result);
  })
    .catch((error) => {
      sendResponse(res,error);
    });
});

module.exports = router;