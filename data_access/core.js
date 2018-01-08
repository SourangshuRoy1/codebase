var Request = require('request');
var NodeUuid = require('node-uuid');
var Logging = require('../utilities/logging');

var getAuthTokenFromRequest = function(request) {
	return request.cookies.sid;
};

function handleDataAccessError(response, error){
	if (error.error && error.error.type && error.error.type === 'Access') {
		return response.redirect(response.locals.paths.logIn);
	}
	if(error.statusCode === 404) {
		return response.render('errors/404');
	}
	return response.render('errors/500');
}

function sendRequest(request, parameters, callback) {
	if(typeof parameters === 'function') {
		callback = parameters;
		parameters = request;
	} else {
		parameters.qs = parameters.qs || {};
		parameters.qs.sid = getAuthTokenFromRequest(request);
	}
	//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	var requestParams = {
		uri: parameters.uri,
		qs: parameters.qs,
		body: parameters.body,
		form: parameters.form,
		method: parameters.method,
		headers: parameters.headers,
		json: true,
		logErrorToLoggingService: parameters.logErrorToLoggingService
	};
	var requestUuid = NodeUuid.v4();
	console.log(requestUuid + ' Sending ' + (request.method || 'GET') + ' request to ' + requestParams.uri);
	Request(requestParams, function (error, response, body) {
		console.log(requestUuid + ' Executing callback for ' + (request.method || 'GET') + ' request to ' + requestParams.uri);
		if (error) {
			logDataAccessError(error, requestParams);
			if(!request.xhr && parameters.response) {
				return handleDataAccessError(parameters.response, error);
			}
			return callback(error);
		}
		var statusCode = response.statusCode;
		if (!(statusCode >= 200 && statusCode < 300)) {
			if(typeof body !== "object") {
				try {
					body = JSON.parse(body);
				} catch (e) {
					body = {
						description: 'Error ' + response.statusCode + ': unknown error',
						type: 'Unknown'
					};
				}
			}
			body.statusCode = body.statusCode || statusCode;
			logDataAccessError(body, requestParams);
			if(!request.xhr && parameters.response) {
				return handleDataAccessError(parameters.response, body);
			}
			return callback(body, response);
		}
		callback(null, response, body || {});
	});
}

function logDataAccessError(error, parameters) {

	var message = 'External API error (' + (parameters.method || 'GET') + ' ' + parameters.uri +  ')';

	if(parameters.logErrorToLoggingService === false) {
		return;
	}

	console.error('fdapi_error', error);

	Logging.error(message, { request: parameters, error: error }, 'fdapi_error', error.eventId);
}

exports.sendRequest = sendRequest;
