var Core = require('../data_access/core');
var Configuration = require('../configuration/services').booknow;
var _ = require('underscore');

exports.getCoursesByAuthToken = function(request, response, callback) {
	var termId = request.query.termId;
	var uri = null;

	if (termId) {
		uri = Configuration.uri + '/terms/' + termId + '/courses';
	} else {
		uri = Configuration.uri + '/courses/list.json';
	}

	Core.sendRequest(request, {
		uri: uri,
		method: 'GET',
		response: response
	}, function (error, response, body) {
	        sortCourseDDCSCallback(error, response, body, callback);

		//callback(error, body);
	});
};

function sortCourseDDCSCallback(error, response, body, callback) {
	if (error) {
		return callback(error, null);
	}

	var libraryCopyCourse = body.instructor_courses;
    var courses = {};
    for(var i=0; i< libraryCopyCourse.length; i++)
    {
        courses[libraryCopyCourse[i].id] = libraryCopyCourse[i];
    }

	var keys = _.sortBy(_.keys(courses), function(key) {
		var course = courses[key];
		course.id = key;
        return course.id;
	});
	var sortCourses = [];
	_.each(keys, function(k) {
		sortCourses.push(courses[k]);
	});

	body.instructor_courses = sortCourses;

	return callback(error, body);
}


exports.getMyCoursesByAuthToken = function(request, callback) {
	var uri = Configuration.uri + '/terms/' + request.params.termId + '/courses';
	Core.sendRequest(request, {
		uri: uri,
		method: 'GET'
	}, function (error, response, body) {
		callback(error, body);
	});
};

exports.getConciergeCourses = function(request, divisionId, departmentId, termId, callback) {
	var uri = Configuration.uri + '/divisions/' + divisionId + '/departments/' + departmentId + '/terms/' + termId + '/courses';
	return Core.sendRequest(request, {
		uri: uri,
		method: 'GET',
		body: {
            courseNumber: request.query.courseNumber,
            courseNumberSearch: request.query.courseNumberSearch ,
        },
	}, function(error, response, body) {
		return callback(error, body);
	});
}

exports.setCourseDisciplineAndSubject = function(request, courseId, idsToSet, callback) {
	var uri = Configuration.uri + '/courses/' + courseId + '/discipline';
	Core.sendRequest(request, {
		uri: uri,
		method: 'PUT',
		body: idsToSet
	}, function (error, response, body) {
		callback(error, body);
	});
};

exports.editCourseSpecialInstructions = function(request, courseId, instructions, callback) {
	var uri = Configuration.uri + '/courses/' + courseId + '/specialinstructions.json';
	Core.sendRequest(request, {
		uri: uri,
		method: 'POST',
		body: instructions
	}, function (error, response, body) {
		callback(error, body);
	});
};

exports.setNoMaterialsRequired = function(request, courseId, callback) {
	var uri = Configuration.uri + '/courses/' + courseId + '/materials';
	var body = {
		noMaterialsRequired: true
	};
	Core.sendRequest(request, {
		uri: uri,
		method: 'POST',
		body: body
	}, function (error, response, body) {
		callback(error, body);
	});
};

exports.getDefaultTerm = function(request, response, callback) {
	getCoursesTerms(request, response, function (error, terms) {
		var defaultTerm = terms.filter(function(e){ return e.default})[0] || (terms.length ? terms[0] : null);
		callback(defaultTerm ? undefined : new Error("No terms found for customer"), defaultTerm);
	});
};

var getCoursesTerms = exports.getCoursesTerms = function(request, response, callback) {
	var uri = Configuration.uri + '/terms';
	Core.sendRequest(request, {
		uri: uri,
		method: 'GET',
		response: response
	}, function (error, response, body) {
		if (error) {
			return callback(error, body);
		}
		var terms = body;
		var defaultTerm = null;
		for (var i = 0; i < terms.length; i++) {
			var term = terms[i];
			if (term.default) {
				defaultTerm = terms.splice(i, 1)[0];
				break;
			}
		}
		if (defaultTerm) {
			terms.unshift(defaultTerm);
		}
		return callback(error, terms);
	});
};

exports.removeAdoptedMaterial = function(request, callback) {
	var uri = Configuration.uri + '/courses/' + request.params.courseId + '/materials/' + request.params.materialId;
	Core.sendRequest(request, {
		uri: uri,
		method: 'DELETE'
	}, function (error, response, body) {
		callback(error, body);
	});
};

exports.putMaterialsApproveReject = function(request, courseId, callback) {
	var uri = Configuration.uri + '/courses/' + courseId + '/materials',
		body = request.body.approveReject;
	Core.sendRequest(request, {
		uri: uri,
		body: body,
		method: 'PUT'
	}, function (error, response, body) {
		callback(error, body);
	});
};

exports.materialsToReview = function(request, courseId, callback) {
	var uri = Configuration.uri + '/courses/' + courseId + '/materials_to_review';
	Core.sendRequest(request, {
		uri: uri,
		method: 'GET'
	}, function (error, response, body) {
		callback(error, body);
	});
};

exports.splitCourseIntoSection = function(request, callback) {
	var uri = Configuration.uri + '/courses/' + request.params.courseId + '/split';
	Core.sendRequest(request, {
		uri: uri,
		body: {},
		method: 'POST'
	}, function (error, response, body) {
		callback(error, body);
	});
};

exports.postUnsplitCourse = function(request, callback) {
	var uri = Configuration.uri + '/courses/' + request.params.courseTermSectionId + '/unsplit';
	Core.sendRequest(request, {
		uri: uri,
		method: 'POST',
		body: {}
	}, function(error, response, body) {
		callback(error, body);
	});
};

exports.getCourseXanEduAccessUrl = function(request, callback) {
	var uri;
	if (request.params.courseId) {
		uri = Configuration.uri + '/edu/access_url?course_id=' + request.params.courseId;
	} else {
		uri = Configuration.uri + '/edu/access_url';
	}
	Core.sendRequest(request, {
		uri: uri,
		method: 'GET'
	}, function(error, response, body) {
		callback(error, body);
	});
};



