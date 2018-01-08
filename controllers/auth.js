var DataAccess = require('../data_access/auth');
var Paths = require('../utilities/paths');
var ServiceKeys = require('../utilities/service_keys');
var FdUIAuth = require('../configuration/keys/ffd-ui');
var RequestIp = require('request-ip');

exports.logIn = function(request, response) {
	var realm = request.params.realm;
	var pageData = {};
    pageData.realm = realm;

	if(realm) {
		return DataAccess.getUserData(request, function(error, result) {
			var userData = result;
			if(userData && userData.customer.id === realm) {
				return response.redirect(Paths.dashboard);
			}
			response.render('log_in', {pageData: pageData});
		});
	}
	response.render('log_in', {pageData: pageData});
};

exports.renderAnalytic = function(request, response) {

	response.render('analytics');
};

var errorMsg = {
	400: 'All fields are required.',
	401: 'Authorization failed, please check you login and password.',
	500: 'We are unable to verify your courses. Please try again in a minute or two.',
	unsuccessfulLogin: 'Unsuccessful login. Please try again.'
};

exports.processLogIn = function(request, response) {
	var body = request.body;
	var realm = body.realm;
    var recaptchaResponseField = body.recaptcha_response_field;
    var recaptchaChallengeField = body.recaptcha_challenge_field;
    var studentOrFacultyLoginFlag = body.studentOrFacultyLoginFlag;
    if (studentOrFacultyLoginFlag && (studentOrFacultyLoginFlag == 'true'|| studentOrFacultyLoginFlag == true) ) {
        studentOrFacultyLoginFlag = true;
    } else {
        studentOrFacultyLoginFlag = false;
    }

    //var remoteAddress = request.connection.remoteAddress;
    var remoteAddress = RequestIp.getClientIp(request);
	DataAccess.login(realm ? realm : undefined, body.login, body.password, body.hostname,
	                recaptchaResponseField,
	                recaptchaChallengeField,
	                studentOrFacultyLoginFlag,
	                remoteAddress,
	                function(errorObj, result) {

		if(errorObj) {

            var errorDescription;
            if (errorObj.error && errorObj.error.description) {
              errorDescription  = errorObj.error.description;
            } else {
                errorDescription  = errorObj.description;
            }


			if (errorDescription && errorObj.error && errorObj.error.type &&
			    (errorObj.error.type === 'AuthenticationServiceError' ||
			    errorObj.error.type === 'InvalidURLError'
			    )
			    ) {
			    errorDescription = errorDescription;
			    return response.json({errorMsg: errorDescription});
			} else {
			    return response.json({errorMsg: errorMsg.unsuccessfulLogin});
			}

		}
		var sid = result.sid;
		var maxAge = 24 * 60 * 60 * 1000;
		response.cookie('sid', sid, {httpOnly: true, maxAge: maxAge});


        if(result.isStudent) {
            response.cookie('isStudent', 'true', {httpOnly: true, maxAge: maxAge});
        } else {
            response.clearCookie('isStudent');
        }
        response.json({redirect: result.redirect || Paths.dashboard, userData: result});

	});
};

function unsetLoginCookie(response) {
	response.clearCookie('sid');
	response.clearCookie('termId');
	response.clearCookie('departmentId');
}

exports.processLogOut = function(request, response) {
	var customerId = '';
	var authType = '';
	var userData = response.locals.userData;
	if(userData && userData.customer) {
		customerId = userData.customer.id || '';
	}
	if(userData && userData.user && userData.user.authType) {
        authType = userData.user.authType || '';
    }

	unsetLoginCookie(response);
	if ((authType === 'cas') || (authType === 'shibboleth')) {
        DataAccess.processLogOut(request, function(error, result) {
            if (error) {
                return response.json({errorMsg: errorMsg[error]});
            } else {
                var url  = result.url;
                response.redirect(url);
            }
        });
    } else if ((authType === 'fdLoginFromAdminTool')) {
        response.render('logout');
    }else {
        response.redirect(Paths.realmLogIn.replace(':realm', customerId));
    }
};

exports.unsetLoginCookie = function(request, response) {
	unsetLoginCookie(response);
	return response.json({status: 'OK'});
};

exports.processLoginWithSpecificRole = function(request, response) {
	DataAccess.loginWithSpecificRole(request, function(error) {
		if (error) {
			return response.json({errorMsg: errorMsg[error]});
		}
		response.json({});
	});
};

exports.roleSelection = function(request, response) {
	DataAccess.getUserData(request, function(error, result) {
		if (error || !result || !result.user) {
			response.redirect(Paths.logIn);
		}
		var userData  = result.user;
		var userRoles = userData['available_roles'] || [];
		var pageData = {};
        pageData.userRoles = userRoles;
		response.render('role_selection', { pageData : pageData });
	});
};

exports.ssoError= function(request, response) {
	response.render('sso_error', { params: request.query });
};

exports.campusStoreDashboard = function(request, response) {
	DataAccess.goToCampusStoreDashboard(request, function(error, result) {
		if (error) {
			response.status(500);
			return response.json({error: error, result: result});
		}
		response.json({result: result});
	});
};

exports.fdLoginFromAdminTool = function(request, response) {
    var body = request.body;
    var authToken = body.auth;

    //var authToken = request.query.auth;

    if(!ServiceKeys.validate(authToken, FdUIAuth.ApiKey, FdUIAuth.Secret)) {
        response.status(401);
        //return response.json({errorMessage: 'Invalid authentication token'});
        response.render('errors/student_faculty_login_error', { errorText : 'Invalid authentication token.' });
    }
	DataAccess.fdLoginFromAdminTool(request, function(errorObj, result) {
			if(errorObj) {
                response.render('errors/student_faculty_login_error', { errorText : errorMsg.unsuccessfulLogin });

            } else {
                var sid = result.sid;
                var maxAge = 24 * 60 * 60 * 1000;
                response.cookie('sid', sid, {httpOnly: true, maxAge: maxAge});


                if(result.isStudent) {
                    response.cookie('isStudent', 'true', {httpOnly: true, maxAge: maxAge});
                } else {
                    response.clearCookie('isStudent');
                }
                //response.json({redirect: result.redirect || Paths.dashboard, userData: result});
                var userRoles = result.roles || [];
                var pageData = {};
                pageData.userRoles = userRoles;
                response.render('role_selection', { pageData : pageData });
            }


	});
};


exports.processLogInAfterPasswordReset = function(request, response) {
    var body = request.body;
    var realm = body.realm;
    var recaptchaResponseField = body.recaptcha_response_field;
    var recaptchaChallengeField = body.recaptcha_challenge_field;
    var studentOrFacultyLoginFlag = body.studentOrFacultyLoginFlag;
    if (studentOrFacultyLoginFlag && (studentOrFacultyLoginFlag == 'true'|| studentOrFacultyLoginFlag == true) ) {
        studentOrFacultyLoginFlag = true;
    } else {
        studentOrFacultyLoginFlag = false;
    }

    //var remoteAddress = request.connection.remoteAddress;
    var remoteAddress = RequestIp.getClientIp(request);
	DataAccess.login(realm ? realm : undefined, body.login, body.password, body.hostname,
    	                recaptchaResponseField,
    	                recaptchaChallengeField,
    	                studentOrFacultyLoginFlag,
    	                remoteAddress,
    	                function(errorObj, result) {

			if(errorObj) {

                var errorDescription;
                if (errorObj.error && errorObj.error.description) {
                  errorDescription  = errorObj.error.description;
                } else {
                    errorDescription  = errorObj.description;
                }


                if (errorDescription && errorObj.error && errorObj.error.type &&
                    (errorObj.error.type === 'AuthenticationServiceError' ||
                    errorObj.error.type === 'InvalidURLError'
                    )
                    ) {
                    errorDescription = errorDescription;
                    //return response.json({errorMsg: errorDescription});
                    var pageData = {};
                    pageData.errorMsgAfterPasswordReset = errorDescription;
                    response.render('log_in', {pageData: pageData});
                } else {
                    //return response.json({errorMsg: errorMsg.unsuccessfulLogin});
                    var pageData = {};
                    pageData.errorMsgAfterPasswordReset = errorMsg.unsuccessfulLogin;
                    response.render('log_in', {pageData: pageData});
                }

            } else {
                var sid = result.sid;
                var maxAge = 24 * 60 * 60 * 1000;
                response.cookie('sid', sid, {httpOnly: true, maxAge: maxAge});


                if(result.isStudent) {
                    response.cookie('isStudent', 'true', {httpOnly: true, maxAge: maxAge});
                } else {
                    response.clearCookie('isStudent');
                }
                //response.json({redirect: result.redirect || Paths.dashboard, userData: result});
                var userRoles = result.roles || [];
                var pageData = {};
                pageData.userRoles = userRoles;
                response.render('role_selection', { pageData : pageData });
            }


	});
};



exports.storeTermsAndConditionsValue = function(request, response) {
    var body = request.body;
	var sid = body.sid;
	var termsAndConditionsValue = body.termsAndConditionsValue;
    DataAccess.storeTermsAndConditionsValue(sid,termsAndConditionsValue, function(error, result) {
        if (error) {
        			response.status(500);
        			return response.json(error);
        		}
        response.json(response.statusCode);
   });
};




exports.sendCourseMail = function(request, response) {
  DataAccess.sendCourseMail(request, response, function(error, sendMailStatus) {
    response.json(sendMailStatus);
    return sendMailStatus;
  });
};



exports.changeRole = function(request, response) {
	DataAccess.getUserData(request, function(error, result) {
		if (error || !result || !result.user) {
			response.redirect(Paths.logIn);
		}
		var userData  = result.user;
		var userRoles = userData['available_roles'] || [];
		response.json({ userRoles : userRoles });
	});
};


exports.fdCasLogout = function(request, response) {
    response.render('logout');
};


exports.getInstructorData = function(request, response) {

    var body = request.body;
    var store = body.store;
    var campus = body.campus;
    var divisionId = body.divisionId;
	var departmentId = body.departmentId;
	var termId = body.termId;
	var courseId = body.courseId;
    var realm = body.realm;
    var sectionId = body.sectionId;
    DataAccess.getInstructorData(store, campus, divisionId, departmentId, termId,courseId, realm, sectionId,function(error, instructorData) {
        response.json(instructorData);
    });
};
