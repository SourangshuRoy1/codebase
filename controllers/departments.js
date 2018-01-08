var DataAccess = require('../data_access/departments');
var CourseDataAccess = require('../data_access/courses');

exports.departments = function(request, response){
	DataAccess.getDepartmentPreApprovedMaterials(request, request.params.divisionId, request.params.departmentId, function(error, result){
		if (error) {
			response.status(500);
			return response.render('departments/department', {pageData: {error: error}});
		}
		result.divisionId = request.params.divisionId;
		response.render('departments/department', {pageData: result});
	});

};

exports.myDepartments = function(request, response){
	CourseDataAccess.getDefaultTerm(request,response, function(error, defaultTerm){
		response.render('departments/my_departments', {pageData: {defaultTerm: defaultTerm}});
	});
};

exports.myDepartmentsJson = function(request, response){
	DataAccess.getMyDepartments(request, function(error, result){
		if (error) {
			response.status(500);
			return response.json(error);
		}
		response.json({departments: result});
	});
};

exports.departmentsMaterialsDetails = function(request, response){
    console.log("REFERRER ----------------------------------"+request.headers.referer);
    var referrer = request.headers.referer;
    var referrerType;
    var referrerType_discover = /\/discover/;
    var referrerType_search = /search/;
    var referrerType_myLibrary = /my_library/;
    var referrerType_departments = /departments/;
    var referrerType_approveAdoption = /approve_adoption/;

    if(referrerType_approveAdoption.test(referrer)){
        referrerType = 'approve_adoption';
    } else if(referrerType_discover.test(referrer)){
        referrerType = 'discover';
    } else if(referrerType_search.test(referrer)){
        referrerType = 'search';
    } else if(referrerType_myLibrary.test(referrer)){
        referrerType = 'my_library';
    } else if(referrerType_departments.test(referrer)){
        referrerType = 'departments';
    }
	DataAccess.getMaterialDetails(request, request.params.divisionId, request.params.departmentId, request.params.materialId, response, function(error, result) {
		if (error) {
			response.status(500);
			return response.render('departments/material_details', {pageData: {error: error}, referrerTypeVal: referrerType, referrerUrl: referrer, divisionId: request.params.divisionId, departmentId: request.params.departmentId});
		}
		result.departmentId = request.params.departmentId;
		result.divisionId = request.params.divisionId;
		result.materialId = request.params.materialId;
		response.render('departments/material_details', {pageData: result, referrerTypeVal: referrerType, referrerUrl: referrer, divisionId: request.params.divisionId, departmentId: request.params.departmentId});
	});
};

exports.postPreApprovedDepartmentsMaterials = function(request, response){
	DataAccess.preApproveMaterial(request, request.params.divisionId, request.params.departmentId, request.body.isbn13, 'POST', response, function(error, result) {
		if (error) {
			response.status(500);
			return response.json(error);
		}
		response.json(response.statusCode);
	});
};

exports.deletePreApprovedDepartmentsMaterials = function(request, response){
	DataAccess.preApproveMaterial(request, request.params.divisionId, request.params.departmentId, request.body.isbn13, 'DELETE', response, function(error, result) {
		if (error) {
			response.status(500);
			return response.json(error);
		}
		response.json(response.statusCode);
	});
};

exports.approvalType = function(request, response) {
	DataAccess.setApprovalType(request, request.params.divisionId, request.params.departmentId, request.body.approvalType, response, function(error, result){
		if (error) {
			response.status(500);
			return response.json(error);
		}
		response.json(response.statusCode);
	});
};

exports.departmentsCoursesJson = function(request, response) {
	DataAccess.materialsToReview(request, function(error, result){
		if (error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.departmentsMaterialsDetailsJson = function(request, response){
	//response.json();
};

exports.getDefaultTerm = function(request, response){
	CourseDataAccess.getDefaultTerm(request,response, function(error, defaultTerm){
		response.json({defaultTerm: defaultTerm});
	});
};