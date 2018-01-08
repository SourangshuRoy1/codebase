var Paths = require('../utilities/paths');
var CourseDataAccess = require('../data_access/courses');
var customerIds_without_create_content = require('../configuration/universities_without_create_content.json');
var realmsList_without_create_content = JSON.stringify(customerIds_without_create_content);

exports.index = function(request, response) {
	if(response.locals.isAdministrator) {
		return response.redirect(Paths.myDepartments);
	}
	if(response.locals.isConcierge){
		return CourseDataAccess.getCoursesTerms(request, response, function(error, terms) {
			response.render('courses/my_courses_concierge', {terms: terms, realms: realmsList_without_create_content});
		});
	}
	return response.redirect(Paths.myCourses);
};

exports.help = function(request, response) {
	if(response.locals.isStudent) {
        response.render('help/student_help');
    }else if(response.locals.isAdministrator) {
        response.render('help/admin_help');
    }else if(response.locals.isInstructor) {
        response.render('help/instructor_help');
    }else if(response.locals.isConcierge) {
        response.render('help/concierge_help');
    }else {
        response.render('errors/500');
    }
};

/*exports.onboard = function(request, response) {
	if(response.locals.isStudent) {
        response.render('help/student_help');
    }else if(response.locals.isAdministrator) {
        response.render('onboard/admin_onboard');
    }else if(response.locals.isInstructor) {
        response.render('onboard/instructor_onboard');
    }else if(response.locals.isConcierge) {
        response.render('onboard/concierge_onboard');
    }
};*/

exports.eAuthFail = function(request, response) {
	var dynamicParameter = request.params.dynamicParameter;
	var dynamicParameterString = dynamicParameter ? '&' + dynamicParameter + '=true' : '';
	var courseId = request.params.courseId || '-';
    var courseIdString = courseId === '-' ? '' : '&courseId=' + courseId;
	var termIdString = request.params.termId ? '&termId=' + request.params.termId : '';
	response.redirect(Paths.purchaseMaterial + '?auth=fail' + courseIdString + dynamicParameterString + termIdString);
};

exports.backEnd = function(request, response)  {
	var backEndUri = require('../configuration/services').booknow.uri;
	response.redirect(backEndUri);
};

exports.version = function(request, response) {
	var version = require('../package.json').version;
	response.send(version);
};