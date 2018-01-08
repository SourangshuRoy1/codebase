var Core = require('../data_access/core');
var Configuration = require('../configuration/services').booknow;


exports.getDepartmentPreApprovedMaterials = function(request, divisionId, departmentsId, callback) {
	var uri = Configuration.uri + '/divisions/' + divisionId + '/departments/' + departmentsId + '/pre-approved_materials';
	Core.sendRequest(request, {
		uri: uri,
		method: 'GET'
	}, function(error, response, body) {
		callback(error, body);
	});
};

exports.getMyDepartments = function(request, callback){
	var uri = Configuration.uri + '/departments';
	Core.sendRequest(request, {
		uri: uri,
		method: 'GET'
	}, function(error, response, body) {
		callback(error, body);
	});
};

exports.getMaterialDetails = function(request, divisionId, departmentId, materialId, response, callback) {
	var uri = Configuration.uri + '/divisions/' + divisionId + '/departments/' + departmentId + '/materials/' + materialId + '.json';
	Core.sendRequest(request, {
		uri: uri,
		method: 'GET',
		response: response
	}, function(error, response, body) {
		callback(error, body);
	});
};

exports.preApproveMaterial = function(request, divisionId, departmentId, isbn13, method, response, callback){
	var uri = Configuration.uri + '/divisions/' + divisionId + '/departments/' + departmentId + '/pre-approved_materials';
	var body = {'isbn13' : isbn13};
	Core.sendRequest(request, {
		uri: uri,
		method: method,
		response: response,
		body: body
	}, function(error, response, body){
		callback(error, body);
	});
};

exports.setApprovalType = function(request, divisionId, departmentId, approvalType, response, callback) {
	var uri = Configuration.uri + '/divisions/' + divisionId + '/departments/' + departmentId + '/approval_type',
		body = {'approvalType': approvalType};
	Core.sendRequest(request, {
		uri: uri,
		method: 'PUT',
		response: response,
		body: body
	}, function(error, response, body){
		callback(error, body);
	});
};

exports.materialsToReview = function(request, callback) {
	var termId = request.params.termId;
	var uri = Configuration.uri + '/terms/' + termId + '/materials_to_review';
	Core.sendRequest(request, {
		uri: uri,
		method: 'GET'
	}, function(error, response, body){
		callback(error, body);
	});
};
