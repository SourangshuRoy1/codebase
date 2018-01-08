var Core = require('./core');
var Configuration = require('../configuration/services').booknow;
var FDJavaServices = require('../configuration/keys/ffd-java-service');             
var ServiceKeys = require('../utilities/service_keys');                             
var FdJavaServiceConfiguration = require('../configuration/services').fdJavaService;

exports.login = function (realm, login, password, hostname,
                recaptchaResponseField, recaptchaChallengeField,
                studentOrFacultyLoginFlag, remoteAddress, callback) {
	var uri = Configuration.uri + '/login';
	Core.sendRequest({
		uri: uri,
		method: 'POST',
		body: {
			realm: realm,
			login: login,
			password: password,
			hostname: hostname,
			recaptchaResponseField: recaptchaResponseField,
			recaptchaChallengeField: recaptchaChallengeField,
			studentOrFacultyLoginFlag: studentOrFacultyLoginFlag,
			remoteAddress: remoteAddress
		}
	}, function (error, response, body) {
		if(error || !response) {
			return callback(error || {});
		}
		switch (response.statusCode) {
			case 400:
			case 401:
			case 500:
				return callback(response.statusCode);
		}
		var result = body;
		if(!result || !result.sid) {
			var forcedPasswordResetRequiredFlag = (result.forcedPasswordResetRequiredFlag == 1) ? true: false;
            var passwordExpiredFlag = (result.passwordExpiredFlag == 1) ? true: false;
            var passwordValidationStatusFlag = (result.passwordValidationStatusFlag == 1) ? true: false;


            //console.dir("login:: 1:: forcedPasswordResetRequiredFlag::");
            //console.dir(forcedPasswordResetRequiredFlag);
            if (!forcedPasswordResetRequiredFlag && !passwordExpiredFlag && (passwordValidationStatusFlag)) {
                callback({description: 'Invalid "sid" in response'});
            }
		}
		callback(null, result);
	});
};

exports.getUserData = function(request, callback) {
	var uri = Configuration.uri + '/user.json';
	Core.sendRequest(request, {
		uri: uri,
		method: 'GET'
	}, function (error, response, body) {
		callback(error, body);
	});
};

exports.loginWithSpecificRole = function(request, callback) {
	var uri = Configuration.uri + '/role';
	Core.sendRequest(request, {
		uri: uri,
		body: {'role': request.body.role},
		method: 'PUT'
	}, function (error, response, body) {
		callback(error, body);
	});
};

exports.goToCampusStoreDashboard = function(request, callback) {
	var uri = Configuration.uri + '/campus_store/access_url';
	Core.sendRequest(request, {
		uri: uri,
		qs: {'failURL': request.query.failURL},
		method: 'GET'
	}, function (error, response, body) {
		callback(error, body);
	});
};

exports.processLogOut = function(request, callback) {
	var uri = Configuration.uri + '/logout';
    Core.sendRequest(request, {
        uri: uri,
        method: 'GET'
    }, function (error, response, body) {
        callback(error, body);
    });
};

exports.fdLoginFromAdminTool = function(request, callback) {
    var body = request.body;
    var realm = body.realm;
    var login = body.login;
    var hostname = "";

	var uri = Configuration.uri + '/fdLoginFromAdminTool';
    Core.sendRequest(request, {
        uri: uri,
        method: 'POST',
        body: {
            realm: realm,
            login: login,
            hostname: hostname,
        }
    }, function (error, response, body) {
        callback(error, body);
    });
};

//-254 Start


exports.storeTermsAndConditionsValue = function(sid,termsAndConditionsValue, callback) {

	var uri = Configuration.uri + '/storeTermsAndConditionsValue';
	Core.sendRequest({
		uri: uri,
		method: 'POST',
        body: {
			sid: sid,
			termsAndConditionsValue: termsAndConditionsValue,
		},
		dataType: 'json',
	    json: true,
	}, function (error, response, body) {
		callback(error, body);
	});
};

//-254 End

// -479 Changes Start

exports.sendCourseMail = function(request, response, callback) {
	var uri = FdJavaServiceConfiguration.uri + '/sendCourseMail';
    var body = request.body;
	Core.sendRequest(request, {
		uri: uri,
		method: 'POST',
		qs: {
			auth: ServiceKeys.generate(FDJavaServices.ApiKey, FDJavaServices.Secret)
		},
		body: body,
		json: true,
		response: response
	}, function (error, response, sendMailStatus) {
		if (error) {
			console.log("..........error[ "+error+" ]");
			return callback(error, sendMailStatus);
		}
		return callback(error, sendMailStatus);
	});
};
// -479 Changes End

exports.getInstructorData = function(store, campus, divisionId, departmentId, termId,courseId, realm, sectionId, callback) {
	var uri = Configuration.uri + '/getInstructorData';
	Core.sendRequest({
		uri: uri,
		method: 'POST',
        body: {
            store : store,
            campus : campus,
			divisionId: divisionId,
			departmentId: departmentId,
			termId: termId,
            courseId: courseId,
            realm: realm,
            sectionId: sectionId,
		},
		dataType: 'json',
	    json: true,
	}, function (error, response, body) {
		callback(error, body);
	});
};
