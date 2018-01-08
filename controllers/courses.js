var DataAccess = require('../data_access/courses');
var LoginDataAccess = require('../data_access/auth');
var Disciplines = require('../data_access/disciplines');
var MaterialsDataAccess = require('../data_access/materials');

var realmsList_without_create_content = JSON.stringify(customerIds_without_create_content);

exports.coursesJson = function(request, response) {
	DataAccess.getCoursesByAuthToken(request, response, function(error, result) {
		if(error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.getConciergeCourses = function(request, response) {
	var divisionId = request.query.divisionId;
	var departmentId = request.query.departmentId;
	var termId = request.query.termId;

	DataAccess.getConciergeCourses(request, divisionId, departmentId, termId, function(error, result) {
		if (error) {
			response.status(500);
			return response.json(error);
		}
		if (result.error) {
			response.status(500);
			return response.json(result.error);
		}
		result.courses.sort(function(first, second) {
			if (first.courseId > second.courseId) {
				return 1;
			} else if (first.courseId < second.courseId) {
				return -1;
			} else {
				return 0;
			}
		});
		return response.json(result);
	});
};

exports.setCourseDisciplineAndSubject = function(request, response) {
	var idsToSet = request.body;
	var courseId = request.params.courseId;
	DataAccess.setCourseDisciplineAndSubject(request, courseId, idsToSet, function(error, result) {
		if(error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.editSpecialInstructions = function(request, response) {
	var instructions = request.body;
	var courseId = request.params.courseId;

	if(instructions.length > 250) {
		response.status(500);
		return response.json({errorMessage: 'Student Instructions are limited to 250 characters'});
	}
	DataAccess.editCourseSpecialInstructions(request, courseId, instructions, function(error, result) {
		if(error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.specificCourse = function(request, response) {
	var courseId = request.params.courseId;
	if (response.locals.isAdministrator) {
		DataAccess.materialsToReview(request, courseId, function(error, result){
			response.locals.pageTitle = 'Administrator Course Materials';
			if(error) {
				response.status(500);
				error.courseId = courseId;
				return response.render('departments/course', {pageData: error});
			}
			result.courseId = courseId;
			response.render('departments/course', {pageData: result, courseId: courseId});
		});
	} else {
		MaterialsDataAccess.getAdoptedAndOtherCourseMaterials(request, courseId, response, function (error, result) {
			response.locals.pageTitle = response.locals.isStudent ? 'Course Materials' : 'Course Materials';
			response.render('courses/course', {pageData: result, courseId: courseId, realms: realmsList_without_create_content, adoptedMaterial: '', statusVal: ''});
		});
	}
};

exports.materialsApproveReject = function(request, response){
	DataAccess.putMaterialsApproveReject(request, request.params.courseId, function(error, result){
		if(error) {
			response.status(500);
			return response.json(error);
		}
		return response.json(result);
	});
};

exports.discoverCourse = function(request, response) {
    var referrer = request.headers.referer;
    var referrerType;
    var referrerType_specificCourse = /courses/;
    var referrerType_myCourses = /my_courses/;

    if(referrerType_myCourses.test(referrer)){
            referrerType = 'my_courses';
    } else if(referrerType_specificCourse.test(referrer)){
            referrerType = 'specificCourse';
    }
	MaterialsDataAccess.getAdoptedAndOtherCourseMaterials(request, request.params.courseId, response, function(error, result) {
		response.render('materials/discover', {pageData: result, courseId: request.params.courseId, referrerUrl: referrer, referrerTypeVal: referrerType});
	});
};

exports.disciplinesJson = function(request, response) {
	response.json(Disciplines);
};

exports.setNoMaterialsRequired = function(request, response){
	var courseId = request.params.courseId;
	DataAccess.setNoMaterialsRequired(request, courseId, function(error, result) {
		if(error) {
			response.status(500);
			return response.json(error);
		}
		return response.json(result);
	});
};

exports.myCourses = function(request, response) {

	var	departmentId = request.params.departmentId;
    var shoppingListUri = Configuration.shoppingList.uri;
	DataAccess.getCoursesTerms(request, response, function(error, result) {
		if (response.locals.isAdministrator) {
			response.render('approve_adoption', {terms: result,departmentId: departmentId});
		}if(response.locals.isConcierge){
			response.render('courses/my_courses_concierge', {terms: result, realms: realmsList_without_create_content});
		}
		else {
			response.render('courses/my_courses', {terms: result,shoppingList:shoppingListUri});
		}
	});
};

exports.myCoursesJson = function(request, response) {
	DataAccess.getMyCoursesByAuthToken(request, function(error, result) {
		if(error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};


exports.removeAdoptedMaterial = function(request, response) {
	DataAccess.removeAdoptedMaterial(request, function(error, result) {
		if(error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.manageCourseBySection = function(request, response) {
	DataAccess.splitCourseIntoSection(request, function(error, result) {
		if(error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};


exports.unsplitCourse = function(request, response) {
	DataAccess.postUnsplitCourse(request, function(error, result) {
		if (error) {
			response.status(500);
			return response.json(error);
		}
		response.json(response.statusCode);
	});
};

exports.getCourseXEduAccessUrl = function(request, response) {
	DataAccess.getCourseXEduAccessUrl(request, function(error, result) {
		if (error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.getAdoptedMaterialInfo = function(request, response) {
	var courseId = request.params.courseId;
	if (response.locals.isAdministrator) {
		DataAccess.materialsToReview(request, courseId, function(error, result){
			response.locals.pageTitle = 'Administrator Course Materials';
			if(error) {
				response.status(500);
				error.courseId = courseId;
				return response.render('departments/course', {pageData: error});
			}
			result.courseId = courseId;
			response.render('departments/course', {pageData: result, courseId: courseId});
		});
	} else {
		MaterialsDataAccess.getAdoptedAndOtherCourseMaterials(request, courseId, response, function (error, result) {
			response.locals.pageTitle = response.locals.isStudent ? 'Course Materials' : 'Course Materials';
			response.render('courses/course', {pageData: result, courseId: courseId, realms: realmsList_without_create_content, adoptedMaterial:request.params.materialId, statusVal:request.params.statusVal});
		});
	}
};
