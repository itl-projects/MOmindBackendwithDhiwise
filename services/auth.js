const {
  JWT,LOGIN_ACCESS,
  PLATFORM,MAX_LOGIN_RETRY_LIMIT,LOGIN_REACTIVE_TIME,FORGOT_PASSWORD_WITH
} = require('../constants/authConstant');
const jwt = require('jsonwebtoken');
const common = require('../utils/common');
const dayjs = require('dayjs');
const emailService = require('./email/emailService');
const sendSMS = require('./sms/smsService');
const uuid = require('uuid').v4;
const bcrypt = require('bcrypt');

async function generateToken (user,secret){
  return jwt.sign( {
    id:user.id,
    'email':user.email
  }, secret, { expiresIn: JWT.EXPIRES_IN });
}

function makeAuthService ({
  model,adminService,userTokenService,userRoleService,routeRoleService
}) {
  const loginUser = async (username,password,url,roleAccess) => {
    try {
      let where = { 'email':username };
      let user = await model.findOne(where);
      if (user) {
        if (user.loginRetryLimit >= MAX_LOGIN_RETRY_LIMIT){
          let now = dayjs();
          if (user.loginReactiveTime){
            let limitTime = dayjs(user.loginReactiveTime);
            if (limitTime > now){
              let expireTime = dayjs().add(LOGIN_REACTIVE_TIME,'minute');
              if (!(limitTime > expireTime)){
                return {
                  flag:true,
                  data:`you have exceed the number of limit.you can login after ${common.getDifferenceOfTwoDatesInTime(now,limitTime)}.`
                }; 
              }   
              await adminService.updateDocument(user.id,{
                loginReactiveTime:expireTime.toISOString(),
                loginRetryLimit:user.loginRetryLimit + 1  
              });
              return {
                flag:true,
                data:`you have exceed the number of limit.you can login after ${common.getDifferenceOfTwoDatesInTime(now,expireTime)}.`
              }; 
            } else {
              user = await adminService.findOneAndUpdateDocument({ _id:user.id },{
                loginReactiveTime:'',
                loginRetryLimit:0
              },{ new:true });
            }
          } else {
            // send error
            let expireTime = dayjs().add(LOGIN_REACTIVE_TIME,'minute');
            await adminService.updateDocument(user.id,{
              loginReactiveTime:expireTime.toISOString(),
              loginRetryLimit:user.loginRetryLimit + 1 
            });
            return {
              flag:true,
              data:`you have exceed the number of limit.you can login after ${common.getDifferenceOfTwoDatesInTime(now,expireTime)}.`
            }; 
          } 
        }
        const isPasswordMatched = await user.isPasswordMatch(password);
        if (isPasswordMatched) {
          const userData = user.toJSON();
          let token;
          if (!user.role) {
            return {
              flag:true,
              data:'You have not been assigned role.'
            };
          }
          if (url.includes('admin')){
            if (!LOGIN_ACCESS[user.role].includes(PLATFORM.ADMIN)){
              return {
                flag:true,
                data:'you are unable to access this platform'
              };
            }
            token = await generateToken(userData,JWT.ADMIN_SECRET);
          }
          else if (url.includes('device')){
            if (!LOGIN_ACCESS[user.role].includes(PLATFORM.DEVICE)){
              return {
                flag:true,
                data:'you are unable to access this platform'
              };
            }
            token = await generateToken(userData,JWT.DEVICE_SECRET);
          }
          if (user.loginRetryLimit){
            await adminService.updateDocument(user.id,{
              loginRetryLimit:0,
              loginReactiveTime:''
            });
          }
          let expire = dayjs().add(JWT.EXPIRES_IN, 'second').toISOString();
          await userTokenService.createDocument({
            userId: user.id,
            token: token,
            tokenExpiredTime: expire 
          });                  
          let userToReturn = {
            ...userData,
            ...{ token } 
          };
          let roleAccessData = {};
          if (roleAccess){
            roleAccessData = await common.getRoleAccessData(userRoleService,routeRoleService,user.id);
            userToReturn = {
              ...userToReturn,
              roleAccess: roleAccessData
            };
          }
          return {
            flag:false,
            data:userToReturn
          };
        } else {
          await adminService.updateDocument(user.id,{ loginRetryLimit:user.loginRetryLimit + 1 });
          return {
            flag:true,
            data:'incorrect password'
          };
        }
      } else {
        return {
          flag:true,
          data:'User not exists'
        };
      }
    } catch (error) {
      throw new Error(error);
    }
  };
  const changePassword = async (params) => {
    try {
      let password = params.newPassword;
      let oldPassword = params.oldPassword;
      let user = await adminService.getSingleDocumentById(params.userId);
      if (user && user.id) {
        let isPasswordMatch = await user.isPasswordMatch(oldPassword);
        if (!isPasswordMatch){
          return {
            flag:true,
            data:'Incorrect old password'
          };
        }
        password = await bcrypt.hash(password, 8);
        let updatedUser = adminService.updateDocument(user.id, { password:password });
        if (updatedUser) {
          return {
            flag:false,
            data:'Password changed successfully.'
          };
        }
        return {
          flag:true,
          data:'Password not updated'
        };
      }
      return {
        flag:true,
        data:'User not found'
      };
    } catch (error) {
      throw new Error(error);
    }
  };

  const sendResetPasswordNotification = async (user) => {
    let resultOfEmail = false;
    let resultOfSMS = false;
    try {
      let token = uuid();
      let expires = dayjs();
      expires = expires.add(FORGOT_PASSWORD_WITH.EXPIRETIME, 'minute').toISOString();
      await adminService.updateDocument(user.id,
        {
          resetPasswordLink: {
            code: token,
            expireTime: expires 
          } 
        });
      if (FORGOT_PASSWORD_WITH.LINK.email){
        let viewType = '/reset-password/';
        let msg = 'Click on the link below to reset your password.';
        let mailObj = {
          subject: 'Reset Password',
          to: user.email,
          template: '/views/resetPassword',
          data: {
            link: `http://localhost:${process.env.PORT}` + viewType + token,
            linkText: 'Reset Password',
            message:msg
          }
        };
        try {
          await emailService.sendMail(mailObj);
          resultOfEmail  = true;
        } catch (error){
          console.log(error);
        }
      }
      if (FORGOT_PASSWORD_WITH.LINK.sms){
        let viewType = '/reset-password/';
        let msg = `Click on the link to reset your password.
                http://localhost:${process.env.PORT}${viewType + token}`;
        let smsObj = {
          to:user.mobileNo,
          message:msg
        };
        try {
          await sendSMS(smsObj);
          resultOfSMS = true;
        } catch (error){
          console.log(error);
        }
      }
      return {
        resultOfEmail,
        resultOfSMS 
      };
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
    
  const resetPassword = async (user, newPassword) => {
    try {
      let where = { _id: user.id };
      const dbUser = await adminService.getSingleDocumentByQuery(where);
      if (!dbUser) {
        return {
          flag: true,
          data: 'user not found',
        };
      }
      newPassword = await bcrypt.hash(newPassword, 8);
      await adminService.updateDocument(user.id, {
        password: newPassword,
        resetPasswordLink: null,
        loginRetryLimit:0
      });
      let mailObj = {
        subject: 'Reset Password',
        to: user.email,
        template: '/views/successfullyResetPassword',
        data: {
          isWidth: true,
          email: user.email || '-',
          message: 'Password Successfully Reset'
        }
      };
      await emailService.sendMail(mailObj);
      return {
        flag: false,
        data: 'Password reset successfully',
      };
    } catch (error) {
      throw new Error(error);
    }
  };

  const sendPasswordBySMS = async (user) => {
    try {
      let message = `Password for login as`;
      let msg = `${message} : ${user.password}`;
      let smsObj = {
        to: user.mobileNo,
        message: msg
      };
      await sendSMS(smsObj);
      return true;
    } catch (error) {
      return false;
    }    
  };

  const sendPasswordByEmail = async (user) => {
    try {
      let msg = `Your Password for login : ${user.password}`;
      let mailObj = {
        subject: 'Your Password!',
        to: user.email,
        template: '/views/passwordTemplate',
        data: { message:msg }
      };
      try {
        await emailService.sendMail(mailObj);
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  return Object.freeze({
    loginUser,
    changePassword,
    resetPassword,
    sendResetPasswordNotification,
    sendPasswordByEmail,
    sendPasswordBySMS,
  });
}

module.exports = makeAuthService;