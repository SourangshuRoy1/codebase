var Async = require('async');
var MaterialsDataAccess = require('../data_access/materials');
var DepartmentsAccess = require('../data_access/departments');
var CourseDataAccess = require('../data_access/courses');
var FS = require('fs');
var Paths = require('../utilities/paths');
var Logging = require('../utilities/logging');
var globalMaterialId;

exports.getCopyMaterials = function(request, response) {
    var referrer = request.headers.referer;
    var referrerType, referrerForCourseId, referrerForSpecificCourse, urlForCourseMaterialDetails, referrerForMaterialDetails, hasCourse;
    var referrerType_myCourses = /my_courses/;
    var referrerType_specificCourse = /courses/;
    var referrerType_manageCourses = /manageCourses/;
    var referrerType_manageAdoptionForNoCourse = /manageAdoptionForNoCourse/;
    var referrerType_materialDetails = /details/;
    var referrerType_search = /search/;
    var referrerType_discover = /\/discover/;
    var referrerType_myLibrary = /my_library/;

    if(referrerType_discover.test(referrer)){
            referrerType = 'discover';
    } else if(referrerType_search.test(referrer)){
            referrerType = 'search';
    } else if(referrerType_manageCourses.test(referrer)){
            referrerType = 'manageCourses';
            referrerForCourseId = referrer.replace('/manageCourses','');
            referrerForSpecificCourse = referrerForCourseId.substring(0, referrerForCourseId.indexOf("materials"));
            urlForCourseMaterialDetails = referrerForCourseId+'/details';
    } else if(referrerType_myCourses.test(referrer)){   //need to keep this checking on top to avoid conflict of "my_courses" and "courses" regex match
            referrerType = 'my_courses';
    } else if(referrerType_materialDetails.test(referrer)){
            referrerType = 'details';
            if (referrerType_specificCourse.test(referrer)){
                hasCourse = true;
            }
    } else if(referrerType_manageAdoptionForNoCourse.test(referrer)){
            referrerType = 'manageAdoptionForNoCourse';
            referrerForManageAdoption = referrer;
            referrerForMaterialDetails = referrerForManageAdoption.replace('/manageAdoptionForNoCourse','');
    } else if(referrerType_specificCourse.test(referrer)){
            referrerType = 'specificCourse';
    } else if(referrerType_myLibrary.test(referrer)){
            referrerType = 'my_library';
    }


	if (request.query.from === 'library') {
		var tasks = [
			function(cb) {
				MaterialsDataAccess.getMyLibraryByAuthToken(request, response, function(error, result) {
					return cb(error, result);
				});
			},
			function(cb) {
				CourseDataAccess.getCoursesTerms(request, response, function(error, terms) {
					return cb(error, terms);
				});
			}
		];

		Async.parallel(tasks, function(errors, results) {
			if (errors && errors.length) {
				response.status(500);
				return response.render('errors/500');
			}
			var pageData = results[0];
			pageData.terms = results[1];
			response.locals.pageTitle = 'Copy Materials';
			response.render('materials/copy', {pageData: pageData, referrerTypeVal: referrerType, referrerUrl: referrer, materialDetailsWithCourse: urlForCourseMaterialDetails, courseLink: referrerForSpecificCourse, materialDetailsLink: referrerForMaterialDetails+'/details', courseMaterial: hasCourse});
		});
	} else {
		return response.render('errors/404');
	}
};

exports.postCopyMaterials = function(request, response) {
	MaterialsDataAccess.postCopyMaterials(request, function(error, result){
		if(error) {
			response.status(500);
			return response.json(error);
		}
		var copyRes = {};
		copyRes.statusCode = response.statusCode;
		if(result && result.message){
			copyRes.message = result.message;
		}
		response.json(copyRes);
	});
};

exports.adoptedCourseMaterialsJson = function(request, response) {
	MaterialsDataAccess.getAdoptedCourseMaterials(request, request.params.courseId, function(error, result) {
		if(error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.adoptMaterial = function(request, response) {
	if (response.locals.isConcierge) {
		var finalCallback = function(errors, results) {
			if (errors && errors.length) {
				response.status(500);
				return response.render('errors/500');
			}
			return response.render('materials/adopt', {
				pageData: {
					material: results[0].material,
					terms: results[1]
				}
			});
		};
		Async.parallel(
			[
				function(cb) {
					MaterialsDataAccess.getMaterialDetails(request, null, request.params.materialId, response, function(error, details) {
						return cb(error, details);
					});
			},
				function(cb) {
					CourseDataAccess.getCoursesTerms(request, response, function(error, terms) {
						return cb(error, terms);
					});
			}], finalCallback);

	} else {
	var finalInsCallback = function(errors, results) {
    			if (errors && errors.length) {
    				response.status(500);
    				return response.render('errors/500');
    			}
    			return response.render('materials/adopt', {
    				pageData: {
    				    terms: results[0],
    					material: results[1].material,
    					courses : results[1].courses
    				}
    			});
    		};
    		Async.parallel(
    			[
    				function(cb) {
    					CourseDataAccess.getCoursesTerms(request, response, function(error, terms) {
    						return cb(error, terms);
    					});
    			    },
    			    function (cb){
                        MaterialsDataAccess.getMaterialAdoptionStatus(request, request.params.materialId, response, function(error, result) {
                                return cb(error, result);
                                });
    			    }
    			 ], finalInsCallback);
	}
};

exports.manageMultipleCourseAdoption = function(request, response) {    // FDUI Revamp Ph-5 -- start
	MaterialsDataAccess.getMaterialAdoptionStatus(request, request.params.materialId, response, function(error, result) {
		if (error) {
			response.status(500);
			return response.json({error: 'Failed to get associated courses'});
		}
		return response.json(result);
	});
};            // FDUI Revamp Ph-5 -- end

exports.materialAdoptionStatus = function(request, response) {
	var params = {
		divisionId: request.query.divisionId,
		departmentId: request.query.departmentId,
		termId: request.query.termId,
		materialId: request.query.materialId
	};
	MaterialsDataAccess.getMaterialAdoptionStatusForTermDivisionDepartment(request, params, function(error, result) {
		if (error) {
			response.status(500);
			return response.json({error: 'Failed to get material adoption status'});
		}
		return response.json(result);
	});
};

exports.getMaterialDetails = function(request, response) {
    globalMaterialId = request.params.materialId;
    var referrer = request.headers.referer;
    var isAssociatedWithCourse = false;
    var referrerType, courseReferrer;
    var referrerType_myCourses = /my_courses/;
    var referrerType_discover = /\/discover/;
    var referrerType_specificCourse = /courses/;
    var referrerType_search = /search/;
    var referrerType_myLibrary = /my_library/;
    var referrerType_manageCourses = /manageCourses/;
    var referrerType_create = /create/;
    var referrerType_manageAdoptionForNoCourse = /manageAdoptionForNoCourse/;
    var referrerType_courseMaterialDetails = /details/;
    var referrerType_copy = /copy/;
    var referrerType_pre_approve = /pre-approve/;

    if(referrerType_courseMaterialDetails.test(referrer)){
        referrerType = 'details';
        if(request.params.courseId){
            isAssociatedWithCourse = true;
            courseReferrer = referrer.substring(0, referrer.indexOf("materials"));
        }
    } else if(referrerType_myCourses.test(referrer)){   //need to keep this checking on top to avoid conflict of "my_courses" and "courses" regex match
        referrerType = 'my_courses';
    } else if(referrerType_discover.test(referrer)){
        referrerType = 'discover';
    } else if(referrerType_specificCourse.test(referrer)){
        referrerType = 'specificCourse';
    } else if(referrerType_search.test(referrer)){
        referrerType = 'search';
        if(request.params.courseId){
            isAssociatedWithCourse = true;
        }
    } else if(referrerType_myLibrary.test(referrer)){
        referrerType = 'my_library';
    } else if(referrerType_manageCourses.test(referrer)){
        referrerType = 'manageCourses';
    } else if(referrerType_create.test(referrer)){
        referrerType = 'create';
    } else if(referrerType_manageAdoptionForNoCourse.test(referrer)){
        referrerType = 'manageAdoptionForNoCourse';
    } else if(referrerType_copy.test(referrer)){
        referrerType = 'copy';
    } else if(referrerType_pre_approve.test(referrer)){
        referrerType = 'pre_approve';
    }

	/*MaterialsDataAccess.getMaterialDetails(request, request.params.courseId, request.params.materialId, response, function(error, result) {
	// 269 Start
        if (result.material.type === 'supply'){
            response.render('supply/supply_details', {pageData: result, courseId: request.params.courseId, materialId: request.params.materialId, referrerTypeVal: referrerType, referrerUrl: referrer});
        } else {
            response.render('materials/material_details', {pageData: result, courseId: request.params.courseId, materialId: request.params.materialId, referrerTypeVal: referrerType, referrerUrl: referrer});
        }
    // 269 End
	});*/

	//without course association
	if(referrerType === 'search' || referrerType === 'my_library' || referrerType === 'details' || referrerType === 'manageAdoptionForNoCourse' || referrerType === 'pre_approve'){
	// admin page don't require related materials
	if(request.res.locals.userRole === 'administrator') {

    			MaterialsDataAccess.getMaterialDetails(request, request.params.courseId, request.params.materialId, response, function (error, result) {

    				if (result.material.type === 'supply') {
    					response.render('supply/supply_details', {
    						pageData: result,
    						courseId: request.params.courseId,
    						materialId: request.params.materialId,
    						referrerTypeVal: referrerType,
    						referrerUrl: referrer
    					});
    				} else {
    					response.render('materials/material_details', {
    						pageData: result,
    						courseId: request.params.courseId,
    						materialId: request.params.materialId,
    						referrerTypeVal: referrerType,
    						referrerUrl: referrer,
    						relatedMaterialList: '',
    						terms:'',
                            courses:'',
                            courseAssoc: isAssociatedWithCourse,
                            courseLink: courseReferrer
    					});
    				}

    			});

    		}

		else if(request.res.locals.userRole !== 'concierge'){
			var tasks = [

				function (cb) {
					MaterialsDataAccess.getMaterialDetails(request, null, request.params.materialId, response, function (error, result) {
						return cb(error, result);
					});
				},
				function (cb) {
					MaterialsDataAccess.getAssociatedMaterials(request, null, request.params.materialId, function (error, materialList) {
						return cb(error, materialList);
					});
				},
				function(cb) {
					CourseDataAccess.getCoursesTerms(request, response, function (error, terms) {
						return cb(error, terms);
					});
				},
				function (cb){
					MaterialsDataAccess.getMaterialAdoptionStatus(request, request.params.materialId, response, function(error, result) {
						return cb(error, result);
					});
				}
			];

			Async.parallel(tasks, function (errors, results) {
				if (errors && errors.length) {
					materialList = 'Unable to get associated materials';
					response.render('materials/material_details', {
						pageData: materialList,
						courseId: request.params.courseId,
						materialId: request.params.materialId,
						referrerTypeVal: referrerType,
						referrerUrl: referrer,
						relatedMaterialList: materialList,
						terms:'',
						courses:'',
						courseAssoc: isAssociatedWithCourse,
						courseLink: courseReferrer
					});
				}
				result = results[0];
				materialList = results[1];
				terms = results[2];
				courses=results[3];
				if (result.material.type === 'supply') {
					MaterialsDataAccess.getMaterialDetails(request, request.params.courseId, request.params.materialId, response, function (error, result) {
						response.render('supply/supply_details', {
							pageData: result,
							courseId: request.params.courseId,
							materialId: request.params.materialId,
							referrerTypeVal: referrerType,
							referrerUrl: referrer,
							terms:terms,
							courses:courses
						});
					});
				} else {
					response.render('materials/material_details', {
						pageData: result,
						courseId: request.params.courseId,
						materialId: request.params.materialId,
						referrerTypeVal: referrerType,
						referrerUrl: referrer,
						relatedMaterialList: materialList,
						terms:terms,
						courses:courses,
						courseAssoc: isAssociatedWithCourse,
						courseLink: courseReferrer
					});
				}
			});
		}
		else{
			var tasks = [
				function (cb) {
					MaterialsDataAccess.getMaterialDetails(request, request.params.courseId, request.params.materialId, response, function (error, result) {
						return cb(error, result);
					});
				},

				function (cb) {
					MaterialsDataAccess.getAssociatedMaterials(request, request.params.courseId, request.params.materialId, function (error, materialList) {
						return cb(error, materialList);
					});
				},
				function(cb) {
					CourseDataAccess.getCoursesTerms(request, response, function (error, terms) {
						return cb(error, terms);
					});
				}
			];

			Async.parallel(tasks, function (errors, results) {
				if (errors && errors.length) {
					materialList = 'Unable to get associated materials';
					response.render('materials/material_details', {
						pageData: materialList,
						courseId: request.params.courseId,
						materialId: request.params.materialId,
						referrerTypeVal: referrerType,
						referrerUrl: referrer,
						relatedMaterialList: materialList,
						terms:'',
                        courses:'',
                        courseAssoc: isAssociatedWithCourse,
                        courseLink: courseReferrer
					});
				}
				result = results[0];
				materialList = results[1];
				terms = results[2];
				if (result.material.type === 'supply') {
					MaterialsDataAccess.getMaterialDetails(request, request.params.courseId, request.params.materialId, response, function (error, result) {
						response.render('supply/supply_details', {
							pageData: result,
							courseId: request.params.courseId,
							materialId: request.params.materialId,
							referrerTypeVal: referrerType,
							referrerUrl: referrer
						});
					});
				} else {
					response.render('materials/material_details', {
						pageData: result,
						courseId: request.params.courseId,
						materialId: request.params.materialId,
						referrerTypeVal: referrerType,
						referrerUrl: referrer,
						relatedMaterialList: materialList,
						terms:terms,
                        courses:'',
                        courseAssoc: isAssociatedWithCourse,
                        courseLink: courseReferrer
					});
				}
			});
		}
	}
	else {
		if (request.res.locals.userRole !== 'administrator') {
			var tasks = [
				function (cb) {
					MaterialsDataAccess.getMaterialDetails(request, request.params.courseId, request.params.materialId, response, function (error, result) {
						return cb(error, result);
					});
				},

				function (cb) {
					MaterialsDataAccess.getAssociatedMaterials(request, request.params.courseId, request.params.materialId, function (error, materialList) {
						return cb(error, materialList);
					});
				},


			];

			Async.parallel(tasks, function (errors, results) {
				if (errors && errors.length) {
					materialList = 'Unable to get associated materials';
					response.render('materials/material_details', {
						pageData: materialList,
						courseId: request.params.courseId,
						materialId: request.params.materialId,
						referrerTypeVal: referrerType,
						referrerUrl: referrer,
						relatedMaterialList: materialList,
						terms:'',
                        courses:'',
                        courseAssoc: isAssociatedWithCourse,
                        courseLink: courseReferrer
					});
				}
				result = results[0];
				materialList = results[1];
				if (result.material.type === 'supply') {
					MaterialsDataAccess.getMaterialDetails(request, request.params.courseId, request.params.materialId, response, function (error, result) {
						response.render('supply/supply_details', {
							pageData: result,
							courseId: request.params.courseId,
							materialId: request.params.materialId,
							referrerTypeVal: referrerType,
							referrerUrl: referrer
						});
					});
				} else {
					response.render('materials/material_details', {
						pageData: result,
						courseId: request.params.courseId,
						materialId: request.params.materialId,
						referrerTypeVal: referrerType,
						referrerUrl: referrer,
						relatedMaterialList: materialList,
						terms:'',
                        courses:'',
                        courseAssoc: isAssociatedWithCourse,
                        courseLink: courseReferrer
					});
				}
			});
		}
	}

};

exports.getMaterialAssociatedMaterialsJson = function(request, response) {
	MaterialsDataAccess.getAssociatedMaterials(request, request.params.courseId, request.params.materialId, function(error, result) {
		if(error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.setMaterialRatingsAndReviews = function(request, response) {
	var params = request.body;
	MaterialsDataAccess.setMaterialRatingsAndReviews(request, request.params.materialId, params, function(error, result) {
		if (error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.getMaterialRatingsAndReviewsJson = function(request, response) {
	MaterialsDataAccess.getMaterialRatingsAndReviews(request, request.params.materialId, function(error, result) {
		if (error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.setMaterialAdoptionStatus = function(request, response) {
	MaterialsDataAccess.setMaterialAdoptionStatus(request, request.params.materialId, request.body, function(error, result) {
		if(error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.setCourseMaterialAdoptionStatus = function(request, response) {
	MaterialsDataAccess.setCourseMaterialAdoptionStatus(request, function(error, result) {
		if(error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.materialSearch = function(request, response) {
    response.locals.pageTitle = 'Search Results';
    var referrer = request.headers.referer;
    var referrerForCourseId, referrerForAddTitle, referrerForManageAdoption, referrerForMaterialDetails, referrerForSpecificCourse, courseReferrer;
    var searchPage;
    searchPage = "search";
    var referrerType;
    var referrerType_myCourses = /my_courses/;
    var referrerType_discover = /\/discover/;
    var referrerType_specificCourse = /courses/;
    var referrerType_myLibrary = /my_library/;
    var referrerType_manageCourses = /manageCourses/;
    var referrerType_create = /create/;
    var referrerType_manageAdoptionForNoCourse = /manageAdoptionForNoCourse/;
    var referrerType_addTitle = /add_title/;
    var referrerType_MaterialDetails = /details/;
    var referrerType_approveAdoption = /approve_adoption/;
    var referrerType_setAdoptionPermissions = /divisions/;

    if(referrerType_addTitle.test(referrer)){  //need to keep this checking on top to avoid conflict of "my_courses" and "courses" regex match with add_title
        referrerType = 'addTitle';
        referrerForAddTitle = referrer;
        referrerForCourseId = referrerForAddTitle.replace('/add_title','');
    } else if(referrerType_manageCourses.test(referrer)){
        referrerType = 'manageCourses';
    } else if(referrerType_create.test(referrer)){
        referrerType = 'create';
    } else if(referrerType_manageAdoptionForNoCourse.test(referrer)){
        referrerType = 'manageAdoptionForNoCourse';
        referrerForManageAdoption = referrer;
        referrerForMaterialDetails = referrerForManageAdoption.replace('/manageAdoptionForNoCourse','');
    } else if(referrerType_MaterialDetails.test(referrer)){
        referrerType = 'materialDetails';
        referrerForSpecificCourse = referrer;
        matcher = /courses/;
        if (matcher.test(referrerForSpecificCourse)){
            courseReferrer = referrerForSpecificCourse.substring(0, referrerForSpecificCourse.indexOf("materials"));
        }

    } else if(referrerType_myCourses.test(referrer)){
        referrerType = 'my_courses';
    } else if(referrerType_myLibrary.test(referrer)){
                referrerType = 'my_library';
    } else if(referrerType_specificCourse.test(referrer)){
        referrerType = 'specificCourse';
    } else if(referrerType_approveAdoption.test(referrer)){
        referrerType = 'approveAdoption';
    } else if(referrerType_setAdoptionPermissions.test(referrer)){
        referrerType = 'setAdoptionPermissions';
    }
	response.render('materials/discover', {searchQuery:request.query.query, referrerTypeVal: referrerType, referrerUrl: referrer, pageType: searchPage, specificCourseLink: referrerForCourseId, courseLink: courseReferrer, materialDetailsLink: referrerForMaterialDetails+'/details'});
};

exports.materialsSearchJson = function(request, response) {
	MaterialsDataAccess.search(request, request.query, function(error, result) {
		if(error) {
			return response.json(error);
		}
		response.json(result);
	});
};


var maxMaterialSizeInMb = 5;
exports.addMaterial = function(request, response) {
	var referrer = request.headers.referer;
	CourseDataAccess.getCoursesByAuthToken(request, response, function(error, result) {
		result = result || {};
		result.maxMaterialSizeInMb = maxMaterialSizeInMb;
		if (request.params.courseId) {
			result.courseId = request.params.courseId;
		}
		if (request.query.departmentId) {
            result.departmentId = request.query.departmentId;
        }
        if (request.query.divisionId) {
            result.divisionId = request.query.divisionId;
        }
        if (request.query.termId) {
            result.termId = request.query.termId;
        }
		response.render('materials/add', {pageData: result, pageReferrer: referrer});
	});
};

exports.createMaterial = function(request, response) {
    var referrer = request.headers.referer;
    var referrerType;
    var referrerForCourseId, referrerForSpecificCourse, urlForCourseMaterialDetails;
    var referrerType_manageCourses = /manageCourses/;
    var referrerType_myCourses = /my_courses/;
    var referrerType_manageAdoptionForNoCourse = /manageAdoptionForNoCourse/;
    var referrerType_specificCourse = /courses/;

    if(referrerType_manageCourses.test(referrer)){
        referrerType = 'manageCourses';
        referrerForCourseId = referrer.replace('/manageCourses','');
        referrerForSpecificCourse = referrerForCourseId.substring(0, referrerForCourseId.indexOf("materials"));
        urlForCourseMaterialDetails = referrerForCourseId+'/details';
    } else if(referrerType_myCourses.test(referrer)){   //need to keep this checking  before specific course to avoid conflict of "my_courses" and "courses" regex match
        referrerType = 'my_courses';
    } else if(referrerType_manageAdoptionForNoCourse.test(referrer)){
        referrerType = 'manageAdoptionForNoCourse';
    } else if(referrerType_specificCourse.test(referrer)){
        referrerType = 'specificCourse';
    }

	CourseDataAccess.getCoursesTerms(request, response, function(error, terms) {
        response.render('materials/create', {terms: terms, referrerTypeVal: referrerType, referrerUrl: referrer, materialId: request.params.materialId, globalMatId: globalMaterialId, materialDetailsWithCourse: urlForCourseMaterialDetails, courseLink: referrerForSpecificCourse});
    });
};

exports.espAccess = function(request, response) {
	response.render('materials/esp_access', {isbn13: request.params.materialId});
};

exports.processMaterialAdd = function(request, response) {
	var titleFromRequest = request.body['create-material-title'];
	var parameters = {
		url: request.body['create-material-info'],
		title: titleFromRequest ? titleFromRequest : 'Custom Material',
		description: request.body['create-material-description'],
		access: request.body['create-material-access']
	};
    if(request.body['departmentId']){
        parameters.departmentId = request.body['departmentId'];
    }
    if(request.body['divisionId']){
        parameters.divisionId = request.body['divisionId'];
    }
    if(request.body['termId']){
        parameters.termId = request.body['termId'];
    }
	if(parameters.description.length > 500 || parameters.title.length > 500) {
		return response.render('errors/500');
	}

	var rawCourses = request.body['create-material-courses'];
	var coursesArray = [];
	for(var courseId in rawCourses) {
		if(rawCourses.hasOwnProperty(courseId)) {
			coursesArray.push(rawCourses[courseId]);
		}
	}
	if(coursesArray.length < 1 ) {
		return response.redirect(response.locals.paths.addMaterial);
	}
	var courses = coursesArray.join(',');
	parameters.courses = courses;

	var file = request.files && request.files['create-material-file'] ? request.files['create-material-file'] : false;
	var maxMaterialSizeInBytes = maxMaterialSizeInMb * 1024 * 1024;
	if(file && file.size > maxMaterialSizeInBytes) {
		return response.render('errors/500');
	}
	if(file && file.name) {
		parameters.file = FS.createReadStream(file.path);
		parameters.title = titleFromRequest || file.name;
	}

	parameters.sid = request.cookies.sid;
	MaterialsDataAccess.addMaterial(request, parameters, function(error, result) {
		if(error) {
			return response.render('errors/500');
		}
		if(coursesArray.length > 1) {
			return response.redirect(Paths.dashboard);
		}
		response.redirect(Paths.specificCourse.replace(':courseId', courses));
	});
};

exports.courseMaterialStudentPurchases = function(request, response) {
	response.render('materials/student_purchases', {courseId: request.params.courseId, materialId: request.params.materialId});
};

exports.courseMaterialStudentPurchasesJson = function(request, response) {
	MaterialsDataAccess.getCourseMaterialStudentPurchases(request, request.params.courseId, request.params.materialId, function(error, result) {
		result = {
			"material":{
				"author":["yourteachermathhelp"],
				"description":"YourTeacher.com - www.yourteacher.com - is great for teaching mathematics with over 1000 online math lessons featuring a personal math teacher inside every lesson!",
				"detailUrl":"https://www.youtube.com/watch?v=-Ab3Dlq4vqo",
				"image":"https://img.youtube.com/vi/-Ab3Dlq4vqo/0.jpg",
				"isbn13":"YT:-Ab3Dlq4vqo",
				"owner":[""],
				"rating":0,
				"source":"YouTube",
				"title":"Teaching Mathematics - YourTeacher.com - 1000+ Online Math Lessons",
				"type":"video",
				"url":"https://www.youtube.com/watch?v=-Ab3Dlq4vqo",
				"metadata":{
					"item":{}
				}
			},
			"havePurchased": ['Zack Morris', 'Alex Shnur'],
			"haveNotPurchased": ['Dmitry Mizin']
		};
		response.json(result);
	});
};

exports.myLibrary = function(request, response) {
    if (response.locals.isConcierge) {
        var tasks = [
            function(cb) {
                MaterialsDataAccess.getMyLibraryByAuthToken(request, response, function(error, result) {
                    return cb(error, result);
                });
            },
            function(cb) {
                CourseDataAccess.getCoursesTerms(request, response, function(error, terms) {
                    return cb(error, terms);
                });
            }
        ];
        Async.parallel(tasks, function(errors, results) {
            if (errors && errors.length) {
                response.status(500);
                return response.render('errors/500');
            }
            var pageData = results[0];
            var terms = results[1];
             for (var i = terms.length - 1; i >= 0; i--) {
                if (terms[i] !== undefined &&  (terms[i].status === 'unknown' || terms[i].status === 'future')) {
                    terms.splice(i, 1);
                }
             }
            pageData.terms = terms;
			var selectedTerm = request.query.selectedTerm;
			var departmentIndex = request.query.departmentIndex;
			if(selectedTerm && selectedTerm.length) {
				pageData.selectedTerm = selectedTerm;
			}
			if(departmentIndex && departmentIndex.length) {
                pageData.departmentIndex = departmentIndex;
            }
            response.locals.pageTitle = 'My Library';
            response.render('my_library', {pageData: pageData});
        });
    } else {
        MaterialsDataAccess.getMyLibraryByAuthToken(request, response, function(error, result){
            response.locals.pageTitle = 'My Library';
            response.render('my_library', {pageData: result});
        });
	}
};

exports.myLibraryImportMaterials = function(request, response) {
    var body = request.body;
    var term = body.term;
    var department_id = body.department_id;
    var division_id = body.division_id;
    MaterialsDataAccess.myLibraryImportMaterials(request, function(error, result){
        return response.json(result);
    });
};

exports.addMaterialToLibrary = function(request, response) {
	MaterialsDataAccess.addMaterialToMyLibrary(request, function(error, result) {
		if(error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.removeMaterialFromLibrary = function(request, response) {
	MaterialsDataAccess.removeMaterialFromLibrary (request, function(error, result) {
		if(error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.getMaterialsPreApprove = function(request, response) {
    var referrer = request.headers.referer;
    var referrerType;
    var referrerType_materialDetails = /details/;

    if(referrerType_materialDetails.test(referrer)){
            referrerType = 'materialDetails';
    }
	MaterialsDataAccess.materialsPreApprove(request, request.params.materialId, 'GET', function(error, result) {
		if (error) {
			response.status(500);
			return response.render('materials/materials_pre-approve', {pageData: '', referrerTypeVal: referrerType, referrerUrl: referrer});
		}
		response.render('materials/materials_pre-approve', {pageData: result, referrerTypeVal: referrerType, referrerUrl: referrer});
	});
};

exports.postMaterialsPreApprove = function(request, response) {
	MaterialsDataAccess.materialsPreApprove(request, request.params.materialId, 'POST', function(error, result) {
		if (error) {
			response.status(500);
			return response.json(error);
		}
		response.json(response.statusCode);
	});
};

exports.discoverDepartment = function(request, response) {
    var referrer = request.headers.referer;
    var referrerType, search_type;
    var referrerType_myDepartments = /my_departments/;

    if(referrerType_myDepartments.test(referrer)){
            referrerType = 'myDepartments';
    }
    if(request.res.locals.userRole === 'administrator') {
            search_type = 'discover';
    } else {
            search_type = 'search';
    }
	var pageData = {
		divisionId: request.params.divisionId,
		departmentId: request.params.departmentId
	};
	DepartmentsAccess.getDepartmentPreApprovedMaterials(request, request.params.divisionId, request.params.departmentId, function(error, result){
		if (error) {
			response.status(500);
			return response.render('materials/discover', {pageData: '', referrerTypeVal: referrerType, referrerUrl: referrer, searchPageType: search_type});
		}
		pageData.departmentName = result.department.name;
		response.render('materials/discover', {pageData: pageData, referrerTypeVal: referrerType, referrerUrl: referrer, searchPageType: search_type});
	});
};

exports.getMaterialAccessUrl = function(request, response) {
	MaterialsDataAccess.getAccessUrlByMaterialId(request, function(error, result) {
		if (error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.postMaterialAccessCode = function(request, response) {
	MaterialsDataAccess.postSpecificMaterialAccessCode(request, function(error, result) {
		if (error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.getStudentsMaterialPurchaseUrl = function(request, response) {
	MaterialsDataAccess.getMaterialPurchaseUrlByAuthToken(request, function(error, result) {
		eLogging(error, 'Student pressed purchase button', request);
		if (error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.purchase = function(request, response) {
	response.render('materials/purchase', {
		environment: require('../configuration/services').environment,
		courseId: request.query.courseId,
		termId: request.query.termId
	});
};

function eLogging (error, message, request) {
	var context = {};

	Object.keys(request.body).forEach(function(key) {
		if (request.body[key]) {
			context[key] = (key !== 'password') ? request.body[key] : '***';
		}
	});

	if (error) {
		context.error = error;
		Logging.error(message, context, 'e', (typeof error === 'Object' ? error.error.eventId : ''));
	} else {
		Logging.info(message, context, 'e');
	}
}

exports.getRegistrationUrl = function(request, response) {
	MaterialsDataAccess.getRegistrationUrlByAuthToken(request, function(error, result) {
		eLogging(error, 'Student got redirect to e registration form', request);
		if (error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.getGuestUrl = function(request, response) {
	MaterialsDataAccess.getGuestUrlByAuthToken(request, function(error, result) {
		eLogging(error, 'Student got redirect to e store us guest', request);
		if (error) {
			response.status(500);
			return response.json(error);
		}
		response.json(result);
	});
};

exports.getForgotPasswordUrl = function(request, response) {
    MaterialsDataAccess.getForgotPasswordUrlByAuthToken(request, function(error, result) {
		eLogging(error, 'Student got redirect to e "forgot password" form', request);
        if (error) {
            response.status(500);
            return response.json(error);
        }
        response.json(result);
    });
};

exports.renderAddTitle = function(request, response) {
    console.log("REFERRER ----------------------------------"+request.headers.referer);
    var referrer = request.headers.referer;
    var referrerType;
    var referrerType_search = /search/;

    if(referrerType_search.test(referrer)){
        referrerType = 'search';
    }
	return response.render('materials/add_title', {referrerTypeVal: referrerType, referrerUrl: referrer});
};

exports.renderAddTitleToCourse = function(request, response) {
    var referrer = request.headers.referer;
	return response.render('materials/add_title',{pageReferrer: referrer});
};

exports.addTitle = function(request, response) {
	var materialId = request.params.materialId;
	if (materialId === 'no_material_id') {
		materialId = '0';
	}
	MaterialsDataAccess.addTitle(request, materialId, function(error, result) {
		if (error) {
			response.status(500);
			return response.json({error: 'Failed to add title! Please try again.'});
		}
		return response.json(result);
	});
};

exports.isMaterialExists = function(request, response) {
	var isbn = request.params.isbn;
	return MaterialsDataAccess.isMaterialExists(request, isbn, function(error, isExist) {
		if (error) {
			response.status(500);
			return response.json(error);
		}
		return response.json({isExist: isExist});
	});
};

exports.manageCourses = function(request, response) {
 var referrer = request.headers.referer;
    var referrerType, referrerForSpecificCourse, urlForCourseMaterialDetails;
    var referrerType_myCourses = /my_courses/;
    var referrerType_discover = /\/discover/;
    var referrerType_specificCourse = /courses/;
    var referrerType_search = /search/;
    var referrerType_myLibrary = /my_library/;
    var referrerType_courseMaterialDetails = /details/;
    var referrerType_create = /create/;
    var referrerType_copy = /copy/;

    if(referrerType_courseMaterialDetails.test(referrer)){
        referrerType = 'details';
    } else if(referrerType_myCourses.test(referrer)){   //need to keep this checking on top to avoid conflict of "my_courses" and "courses" regex match
        referrerType = 'my_courses';
    } else if(referrerType_discover.test(referrer)){
        referrerType = 'discover';
    } else if(referrerType_specificCourse.test(referrer)){
        referrerType = 'specificCourse';
    } else if(referrerType_search.test(referrer)){
        referrerType = 'search';
    } else if(referrerType_myLibrary.test(referrer)){
        referrerType = 'my_library';
    } else if(referrerType_create.test(referrer)){
        referrerType = 'create';
    } else if(referrerType_copy.test(referrer)){
        referrerType = 'copy';
    }

   if(!request.params.hasOwnProperty('courseId')){
    		var finalCallback = function(errors, results) {
    			if (errors && errors.length) {
    				response.status(500);
    				return response.render('errors/500');
    			}
    			return response.render('manage_courses', {
    				pageData: {
    					material: results[0].material,
    					terms: results[1]
    				},
    				courseId: '',
    				materialId: request.params.materialId,
    				referrerTypeVal: referrerType,
    				referrerUrl: referrer
    			});
    		};
    		Async.parallel(
    			[
    				function(cb) {
    					MaterialsDataAccess.getMaterialDetails(request, null, request.params.materialId, response, function(error, details) {
    						return cb(error, details);
    					});
    			},
    				function(cb) {
    					CourseDataAccess.getCoursesTerms(request, response, function(error, terms) {
    						return cb(error, terms);
    					});
    			}], finalCallback);

    	}else{
    	     MaterialsDataAccess.getMaterialDetails(request, request.params.courseId, request.params.materialId, response, function(error, result) {

                    response.render('manage_courses', {pageData: result, courseId: request.params.courseId, materialId: request.params.materialId, referrerTypeVal: referrerType, referrerUrl: referrer, materialDetailsWithCourse: urlForCourseMaterialDetails, courseLink: referrerForSpecificCourse});
             });
    	}


};
