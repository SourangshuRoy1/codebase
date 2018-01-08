(function() {
	'use strict';

	var MIN_MATERIALS_AMOUNT_TO_SHOW_ALL_MATERIALS_LINK = 1;

	var courseCardsLoaded = 0;
	var count = 0;
    var isbnList = [];                  // -479
    var materialCourseList = [];        // -479
	var defaultcourseCardValue =10;
	var cachedCourses;
	var isError = false,
		isDisciplineSelected = false,
		isSubjectSelected = false,
		$discoverCourseSloganTemplate,
		$manageCourseLinkTemplate,
		$conciergeBottomContainerTemplate,
		$courseItemTemplate,
		$materialsListTemplate,
		$isbnInputTemplate,
		$quickAdoptButtonTemplate,
		$conciergeNoMaterialsTemplate,
		$materialItemTemplate,
		$caretLinkTemplate,
		$disciplineSelectTemplate,
		$subjectSelectTemplate,
		$selectTitleTemplate,
		$courseItemThrobber = {},
		$headerLink,
		coursesData,
		disciplinesData = ffd.subjectsByDiscipline,
		$createContentBtn,
		$courseCtaTemplate,
		$courseGroupingContainerThrobber,
		$shareAdoptionCourseInfo,

		cookieHelper,
		termSelectBuilder;


	$(function() {
	    $('#myCourses').addClass('active');
		$createContentBtn = $('.create-course-material');
		$discoverCourseSloganTemplate = $('.jumbo').detach();
		$courseItemTemplate = $('.card-list').find('li.col-md-4').detach();
		$materialsListTemplate = $courseItemTemplate.find('.mat-list').detach();
		$conciergeBottomContainerTemplate = $courseItemTemplate.find('.concierge-bottom-container').detach();
		$isbnInputTemplate = $courseItemTemplate.find('.isbn-input').detach();
		$quickAdoptButtonTemplate = $courseItemTemplate.find('.quick-adopt-button').detach();
		$conciergeNoMaterialsTemplate = $courseItemTemplate.find('.no-materials-block').detach();
		$manageCourseLinkTemplate = $courseItemTemplate.find('.top-link').detach();
		$caretLinkTemplate = $courseItemTemplate.find('.caret-link').detach();
		$materialItemTemplate = $materialsListTemplate.find('li').detach();
		$disciplineSelectTemplate = $courseItemTemplate.find('.discipline-select').detach();
		$subjectSelectTemplate = $courseItemTemplate.find('.subject-select').detach();
		$selectTitleTemplate = $courseItemTemplate.find('select-title').detach();
		$courseCtaTemplate = $courseItemTemplate.find('.course-cta').clone();
		$courseItemTemplate.detach();

		$headerLink = $('.header-link');

		cookieHelper = new ffd.Cookie();
		termSelectBuilder = new ffd.TermSelectBuilder();

		initializeUpdateButton();
		initializeTermDepartmentChange();
		initializeSCrollEvent();
		sendRecipient();
		clearAllCourse();
		selectAllCourse();
        initializeShareAdoptionCheck();

		/*	$(window).endlessScroll({

		 fireOnce: false,
		 insertAfter: "ul.card-list div:last",
		 data: function(i) {

		 return getCourses()
		 }
		 });*/


		/*	$(".card-list").on("mousedown",function () {
		 //alert(4);

		 getCourses();
		 if ($("#content-box").scrollTop() >= ($("#content-wrapper").height() - $("#content-box").height()) && $contentLoadTriggered == false) {
		 $contentLoadTriggered = true;
		 $.get("infinitContentServlet", function (data) {
		 $("#content-wrapper").append(data);
		 $contentLoadTriggered = false;
		 });
		 }

		 });*/

		var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
		//alert(is_chrome);
		if (is_chrome){
			window.onload = function () {
				setTimeout(function () {
					scrollTo(0, -1);
				}, 0);
			}
		}
		termSelectBuilder.buildTermsSelect($('.term-select'), ffd.terms, ffd.user.termId);
		switch (ffd.user.role) {
			case 'administrator': {
				$headerLink.hide();
				hideDepartmentSelect();
				$('.course-grouping').find('.container').first().find('h2').text('');
				getDepartmentsCourses();
				break;
			}
			case 'concierge': {
			    if(ffd.customer.adoptionTermsAndConditions === 'true' && ffd.userData.adoptionTermsAndConditions != 'true' ) {
				getTermsAndConditionsWindow();
			    }

				if (ffd.user.departments.length < 2) {
					hideDepartmentSelect();
				}
				return getConciergeCourses();
				break;
			}
			default: {
			    if(ffd.customer.adoptionTermsAndConditions === 'true' && ffd.userData.adoptionTermsAndConditions !== 'true' ) {
            	    getTermsAndConditionsWindow();
            	}
				hideDepartmentSelect();
				getCourses();
				break;
			}
		}


		$(".share-adoption-course-list").scroll(function () {
        //".course-grouping"
            var lio;
            if(lio == $(".course-grouping-div").children('h3').children('a').attr('id')) return false;
            lio == $(".course-grouping-div").children('h3').children('a').attr('id');
            var wintop = $(".share-adoption-course-list").scrollTop(), docheight = $(document).height(), winheight = $(".share-adoption-course-list").height();
            var scrolltrigger = 0.35;
            //	alert("div height"+docheight+"win height"+winheight);
            //alert((wintop / (docheight - winheight)));
            if ((wintop / (docheight - winheight)) > scrolltrigger) {

                $(".share-adoption-course-list").scrollTop();
                //console.log('scroll bottom');
                switch (ffd.user.role) {
                    case 'administrator': {
                        /*$headerLink.hide();
                         hideDepartmentSelect();
                         $('.course-grouping').find('.container').first().find('h2').text('');
                         getDepartmentsCoursesOnScroll();*/
                        break;
                    }
                    case 'concierge': {
                        if (ffd.user.departments.length < 2) {
                            hideDepartmentSelect();
                        }
                        return getConciergeCoursesOnScroll();
                        break;
                    }
                    default: {

                        hideDepartmentSelect();
                        getCourses();
                        break;
                    }
                }

            }
        });
	});

	function initializeSCrollEvent() {
        var lio;
		//lastAddedLiveFunc();
		$(window).scroll(function () {
		//".course-grouping"
            if(lio == $(".course-grouping-div").children('h3').children('a').attr('id')) return false;
            lio == $(".course-grouping-div").children('h3').children('a').attr('id');
			var wintop = $(window).scrollTop(), docheight = $(document).height(), winheight = $(window).height();
			var scrolltrigger = 0.35;
			//	alert("div height"+docheight+"win height"+winheight);
			//alert((wintop / (docheight - winheight)));
			if ((wintop / (docheight - winheight)) > scrolltrigger) {

				$(window).scrollTop();
				//console.log('scroll bottom');
				switch (ffd.user.role) {
					case 'administrator': {
						/*$headerLink.hide();
						 hideDepartmentSelect();
						 $('.course-grouping').find('.container').first().find('h2').text('');
						 getDepartmentsCoursesOnScroll();*/
						break;
					}
					case 'concierge': {
						if (ffd.user.departments.length < 2) {
							hideDepartmentSelect();
						}
						return getConciergeCoursesOnScroll();
						break;
					}
					default: {

						hideDepartmentSelect();
						getCourses();
						break;
					}
				}

			}
		});
	}

	function hideDepartmentSelect() {
		var $form = $('.term-department-select-form');
		$form.find('.department-select-label').css('display', 'none');
		$form.find('.department-select').css('display', 'none');
		if('concierge' === ffd.user.role) {
           $('.concierge-course-number-search-or').css('display', 'none');
           $('label[for=term-select]').css('padding-left','0px');
           $('.share-adoption-external-div').css('padding-top','0px');
           //$('.concierge-course-number-search-input-text').css('display', 'none');
           //$('#concierge-course-number-search-input').css('display', 'none');
        }
	}

	function initializeUpdateButton() {
		$('.term-department-select-form').find('button').on('click', function() {
			$('.card-list').empty();
			courseCardsLoaded= 0;
			cachedCourses = '';
			coursesData= undefined;
			hideNoCoursesMessage();
			clearGeneralErrorMessages();

			switch (ffd.user.role) {
				case 'administrator': {
					getDepartmentsCourses();
					break;
				}
				case 'concierge': {
                    isbnList = [];
					return getConciergeCourses();
					break;
				}
				default: {
                    isbnList = [];
                    getCourses();
					break;
				}
			}
		});
	}

	function initializeTermDepartmentChange() {
		$('.term-select').on('change', function() {
			cookieHelper.setTerm($(this).val());
		});

		$('.department-select').on('change', function() {
			var index = $(this).val();
			var department = ffd.user.departments[index];
			cookieHelper.setDepartment(department.id);
		});
	}
// -479
	function initializeShareAdoptionCheck() {
        $('.share-adoption-check').on('click', function() {
            if ($(this).is(':checked')) {
               	if (isCourseCardLoading()) {
               		$('.share-adoption-check').prop('checked', false);
            	} else if (courseCardsLoaded === 0) {
                    bootbox.alert({
                      title: 'No courses found.',
                      message: "No course found to share adopted materials.",
                      buttons: {
                          'ok': {
                              label: 'OK',
                              className: 'btn-default pull-right button-background'
                          }
                      }
                    }).find("div.modal-dialog").addClass("own-modal-dialog");
                    $('.share-adoption-check').prop('checked', false);
                    return false;
            	} else {
            		$('#card-list-container').addClass('share-adoptions-view');
                    $('.mat-list').css('display', 'none');
                    $('.materials-quantity-link').css('display', 'none');
                    $('.share-adoptions-component').css('display', 'block');
                    $('.non-share-adoptions-component').css('display', 'none');
                    $('.course-grouping-div').removeClass('dropdown-card');
                    $('.share-adoptions-check').prop('checked', true);
            	}
            } else {
                $('#card-list-container').removeClass('share-adoptions-view');
                $('.mat-list').css('display', 'block');
                $('.materials-quantity-link').css('display', 'block');
                $('.share-adoptions-component').css('display', 'none');
                $('.non-share-adoptions-component').css('display', 'block');
                $('.course-grouping-div').addClass('dropdown-card');
                $('.share-adoptions-check').prop('checked', false);
            }
        });
    }

    function toggleDepartmentTermSelects(isEnabled) {
		$('.term-department-select-form').find(':input').attr('disabled', !isEnabled);
	}

	function notifyNothingToBrowse() {
		var message = null;
		var selectedTerm = '';
		if($('.term-select')) {
			selectedTerm = $('.term-select').find('option:selected').text();
		}
		if (ffd.user.role === 'administrator') {
			message = 'No materials to review.'
		} else {
			if(selectedTerm != ''){
				message = 'No courses found for '+selectedTerm ;
			}else{
				message = 'No Courses Found';
			}
			$('#card-list-container').removeClass('share-adoptions-view');
            $('.share-adoptions-component').css('display', 'none');
		}
		$('<p/>', {
			'class': 'alert-message',
			text: message
		}).insertAfter('.term-department-select-form').show();
	}

	function hideNoCoursesMessage() {
		$('p.alert-message').remove();
	}



	/*function getDepartmentsCoursesOnScroll(){

	 if(coursesData != undefined && coursesData.courses.length > 0 && courseCardsLoaded> 0 && coursesData.courses.length > courseCardsLoaded) {
	 var $coursesContainer = $('.card-list');
	 var $courseGroupingContainer = $('.course-grouping').find('.container').first();
	 var $courseGroupingContainerThrobber = ffd.showThrobber($courseGroupingContainer, 'appendTo');

	 toggleDepartmentTermSelects(false);
	 var oldCourseCardsLoaded = courseCardsLoaded;

	 if(coursesData.courses.length > courseCardsLoaded + defaultcourseCardValue){
	 courseCardsLoaded = courseCardsLoaded + defaultcourseCardValue;
	 }else {
	 courseCardsLoaded = coursesData.courses.length;
	 }
	 if (coursesData && coursesData.courses) {
	 //	$.each(coursesData.courses, function (index, value) {
	 for (var index = oldCourseCardsLoaded; index < courseCardsLoaded; index++) {
	 coursesCount++;
	 var course = coursesData.courses[index];
	 if (typeof(course) !== 'object') {
	 return showGeneralErrorMessage('Unable to get courses');
	 }

	 var $courseItem = $courseItemTemplate.clone();
	 var courseItemHeader = $courseItem.find('h3');
	 var $courseItemHeaderLink = $('<a/>', {'class':'course-header-link', href: ffd.paths.specificCourse.replace(':courseId', course.id)});
	 courseItemHeader.text('').append($courseItemHeaderLink);
	 $('<span/>', {'class': 'large-course-header', title: course.description, text: course.description}).appendTo($courseItemHeaderLink);
	 $('<span/>', {'class': 'small-course-title', title: course.shortName, text: course.shortName}).appendTo($courseItemHeaderLink);
	 $courseItemThrobber[index] = ffd.showThrobber(courseItemHeader, 'insertAfter');
	 $courseItem.find('a.cta').attr('href', ffd.paths.discoverCourse.replace(':courseId', index));
	 $coursesContainer.append($courseItem);
	 $coursesContainer.removeClass('_display_none');
	 $courseItem.find('.course-card-data-holder').attr('data-course-id', index);
	 materialsByCourseId(course, index, 3);
	 }
	 //);
	 }
	 $coursesContainer.removeClass('_display_none');
	 $courseGroupingContainerThrobber.remove();
	 toggleDepartmentTermSelects(true);

	 }
	 } */

	function getDepartmentsCourses() {
		var $courseGroupingContainer = $('.course-grouping').find('.container').first();
		$courseGroupingContainerThrobber = ffd.showThrobber($courseGroupingContainer, 'appendTo');
		toggleDepartmentTermSelects(false);
		var termId = $('.term-select').val();

		ffd.ajax({
            type: 'GET',
            url:ffd.paths.departmentsCoursesJson.replace(':termId', termId),
            dataType: 'json',
            success: function(data) {
                var $coursesContainer = $('.card-list');
                if(data.error && data.error.length > 0) {
                    return showGeneralErrorMessage('Unable to get courses');
                }
                coursesData = data;
                var coursesCount = 0;
                if (coursesData && coursesData.courses) {
                    /*	if (coursesData.courses.length > defaultcourseCardValue) {
                     courseCardsLoaded = defaultcourseCardValue;
                     }else{
                     courseCardsLoaded = coursesData.courses.length;
                     }

                     for (var index = 0; index < courseCardsLoaded; index++) {*/
                     $.each(coursesData.courseId, function (index, id) {
                         $.each(coursesData.courses, function (index, value) {
                            coursesCount++;
                            var course = value;//coursesData.courses[index];
                            if (typeof(course) !== 'object') {
                                return showGeneralErrorMessage('Unable to get courses');
                            }
                            if (id === course.shortName){
                                var $courseItem = $courseItemTemplate.clone();
                                var courseItemHeader = $courseItem.find('h3');
                                var $courseItemHeaderLink = $('<a/>', {'class':'course-header-link', href: ffd.paths.specificCourse.replace(':courseId', course.id)});
                                courseItemHeader.text('').append($courseItemHeaderLink);
                                $('<span/>', {'class': 'large-course-header', title: course.description, text: course.description}).appendTo($courseItemHeaderLink);
                                $('<span/>', {'class': 'small-course-title', title: course.shortName, text: course.shortName}).appendTo($courseItemHeaderLink);
                                $courseItemThrobber[index] = ffd.showThrobber(courseItemHeader, 'insertAfter');
                                $courseItem.find('a.cta').attr('href', ffd.paths.discoverCourse.replace(':courseId', index));
                                $coursesContainer.append($courseItem);
                                $coursesContainer.removeClass('_display_none');
                                $courseItem.find('.course-grouping-div').attr('data-course-id', index);
                                materialsByCourseId(course, index, 3);
                            }
                        });
                    });
                }
                if (coursesCount === 0) {
                    return notifyNothingToBrowse();
                }
            },
            error: function(error) {
                if(error.status === 0) {
                    return false;
                }
                showGeneralErrorMessage('Unable to get courses');
            },
            complete: function() {
                $courseGroupingContainerThrobber.remove();
                toggleDepartmentTermSelects(true);
            }
        });
	}

	function showImgAfterLoad($img){
		$img.load(function(){
			$(this).show();
		});
	}

	function materialsByCourseId(data, index, maxAmountOfMaterialsToRender) {
		var $currentCourseBlock,
			courseId = ffd.user.role === 'administrator' ? index : coursesIdArray[index];
		$('.course-grouping-div').each(function(){
			$currentCourseBlock = $(this);
			if ($currentCourseBlock.attr('data-course-id') === courseId) {
				var $selectHolder = $currentCourseBlock.find('.course-cta'),
					disciplineId = $currentCourseBlock.data('discipline-id'),
					$discoverLink = $currentCourseBlock.find('.cta');

				maxAmountOfMaterialsToRender = maxAmountOfMaterialsToRender || (disciplineId && disciplineId !== '' ? 3 : 1);

				renderCourseMaterials(data, maxAmountOfMaterialsToRender, courseId, $currentCourseBlock);
				var itemCount = data.materials.length + data.supplies.length;                                           //-269 Changes
				if (itemCount > MIN_MATERIALS_AMOUNT_TO_SHOW_ALL_MATERIALS_LINK) {                                      //-269 Changes
					buildViewAllMaterialsLink(data, courseId).insertBefore($selectHolder);
				}

				if ((!disciplineId || disciplineId === '') && (ffd.user.role !== 'administrator')) {
					//buildDisciplineSelectBlock($selectHolder);
					$currentCourseBlock.addClass('dropdown-card');
					var $disciplineSelect = $disciplineSelectTemplate.clone(),
						$subjectSelect = $subjectSelectTemplate.clone();
					var disciplinesDataArray = [];
                    for (var disciplineName in disciplinesData.disciplines) {
                        var disciplinesDataJson = {};
                        if(disciplinesData.disciplines.hasOwnProperty(disciplineName)) {
                            disciplinesDataJson._id = disciplinesData.disciplines[disciplineName]._id;
                            disciplinesDataJson.name = disciplinesData.disciplines[disciplineName].name;
                            disciplinesDataArray.push(disciplinesDataJson);
                        }
                    }

                    disciplinesDataArray.sort(GetSortOrder("name"));

					for (var item in disciplinesDataArray) {
						if(disciplinesData.disciplines.hasOwnProperty(disciplineName)) {
							$('<option/>', {
								value: disciplinesDataArray[item]._id,
								text: disciplinesDataArray[item].name
							}).appendTo($disciplineSelect);
						}
					}
					$disciplineSelect.insertBefore($discoverLink);
					$subjectSelect.insertBefore($discoverLink);
					$disciplineSelect.on('change', function () {
						var $disciplineId = $(this).val();
						if ($(this).find('option:selected').index() === 0) {
							isDisciplineSelected = false;
							isSubjectSelected = false;
							$subjectSelect.addClass('inactive').prop('disabled', true);
							$discoverLink.addClass('inactive');
						} else {
							isDisciplineSelected = true;
							$subjectSelect.removeClass('inactive').prop('disabled', false);
							$subjectSelect.empty();
							$subjectSelect.append($('<option/>', {
								text: 'Select Subject'
							}));
							for (var subject in disciplinesData.disciplines[$disciplineId].subjects) {
								if(disciplinesData.disciplines[$disciplineId].subjects.hasOwnProperty(subject)) {
									$('<option/>', {
										value: disciplinesData.disciplines[$disciplineId].subjects[subject].id,
										text: disciplinesData.disciplines[$disciplineId].subjects[subject].name
									}).appendTo($subjectSelect);
								}
							}
							if ($subjectSelect.find('option:selected').index() !== 0) {
								$discoverLink.removeClass('inactive').removeAttr('disabled');
							}
						}
					});
					$subjectSelect.on('change', function () {
						if ($(this).find('option:selected').index() === 0) {
							isSubjectSelected = false;
							$discoverLink.addClass('inactive');
						} else {
							isSubjectSelected = true;
							$discoverLink.removeClass('inactive').removeAttr('disabled');
						}
					});
					$currentCourseBlock.find('.cta').on('click', function (e) {
						e.preventDefault();
						var $courseContainer = $(this).parents('.course-grouping-div');
						if (isDisciplineSelected && isSubjectSelected) {
							var courseData = {courseId: $courseContainer.attr('data-course-id'), subjectId: $subjectSelect.val(), disciplineId: $disciplineSelect.val()};
							$(this).addClass('inactive').attr('disabled', 'disabled');
							ffd.setCourseDisciplineAndSubject($selectHolder, courseData, $(this).attr('href'));
						}
					});
				} else {
					$currentCourseBlock.find('.select-title').remove();
					$discoverLink.removeClass('inactive').removeAttr('disabled');
					if (ffd.user.role === 'administrator') {
						$discoverLink.text('Review this course').attr('href', ffd.paths.specificCourse.replace(':courseId', courseId));
					}
					$currentCourseBlock.find('.cta').prependTo($currentCourseBlock.find('.course-card-content-holder'));
				}
				if ((disciplineId && disciplineId !== '') || (ffd.user.role === 'administrator')) {
					$currentCourseBlock.find('.course-cta').append(buildManageCourseLink(courseId));
				}
				$currentCourseBlock.find('.course-card-content-holder').removeClass('_display_none');
				ffd.cutMaterialTitles($currentCourseBlock);
			}
		});
		$courseItemThrobber[courseId].remove();
	}

	function getCourses() {

		var $coursesContainer = $('.card-list');
		var termId = $('.term-select').val();
        var $courseGroupingContainer = $('.share-adoption-course-list');
		if (coursesData != undefined && coursesData.instructor_courses.length > 0 && courseCardsLoaded > 0
			&& coursesData.instructor_courses.length > courseCardsLoaded) {
			//var $courseGroupingContainer = $('.course-grouping').find('.container').first(),
				$courseGroupingContainerThrobber = ffd.showThrobber($courseGroupingContainer, 'appendTo');

			toggleDepartmentTermSelects(false);
			var oldCourseCardsLoaded = courseCardsLoaded;

			if(coursesData.instructor_courses.length > courseCardsLoaded + defaultcourseCardValue){
				courseCardsLoaded = courseCardsLoaded + defaultcourseCardValue;
			}else {
				courseCardsLoaded = coursesData.instructor_courses.length;
			}

			for (var i = oldCourseCardsLoaded; i < courseCardsLoaded; i++) {
				var instructorCourse = coursesData.instructor_courses[i];
				var $courseTile = $courseItemTemplate.clone();

				renderInstructorCourseHeader(instructorCourse, $courseTile, count);
                renderShareAdoptionsCheckbox(instructorCourse, $courseTile, count);
                getInstructorCourseMaterials(instructorCourse, $courseTile);
				count++;

				$coursesContainer.append($courseTile);

				if (instructorCourse.disciplineId) {
					$courseTile.find('.course-grouping-div').attr('data-discipline-id', instructorCourse.disciplineId);
				}
			}

			$courseGroupingContainerThrobber.remove();
			toggleDepartmentTermSelects(true);
            toggleShareAdoptionView();


		}else if(courseCardsLoaded == 0 && coursesData == undefined){
			//var $courseGroupingContainer = $('.share-adoption-course-list');
				$courseGroupingContainerThrobber = ffd.showThrobber($courseGroupingContainer, 'appendTo');

			toggleDepartmentTermSelects(false);
			ffd.ajax({
				type: 'GET',
				url: ffd.paths.myCoursesJson.replace(':termId', termId),
				dataType: 'json',
				success: function (data) {
					if (data.error && data.error.length > 0) {
						return showGeneralErrorMessage('Unable to get courses');
					}
					coursesData = data;

					if (coursesData.instructor_courses) {

					    if(coursesData.instructor_courses.length === 0 ){
                            $('#checkboxField').addClass('_display_none_checkbox');
                            $('.share-adoption-check').prop('checked', false);
                        } else {
                            $('#checkboxField').removeClass('_display_none_checkbox');
                            //$('#checkboxField').addClass('_remove_float_left_dashboard');
                        }
						if (!coursesData.instructor_courses.length) {
						    $('.share-adoptions-component').css('display', 'none');
							return notifyNothingToBrowse();
						}

						if (coursesData.instructor_courses.length > defaultcourseCardValue) {
							courseCardsLoaded = defaultcourseCardValue;
						}else{
							courseCardsLoaded = coursesData.instructor_courses.length;
						}

						for (var i = 0; i < courseCardsLoaded; i++) {
							var instructorCourse = coursesData.instructor_courses[i];
							var $courseTile = $courseItemTemplate.clone();
							renderInstructorCourseHeader(instructorCourse, $courseTile, count);
                            renderShareAdoptionsCheckbox(instructorCourse, $courseTile, count);
                            getInstructorCourseMaterials(instructorCourse, $courseTile);

							count++;


							$coursesContainer.append($courseTile);

							if (instructorCourse.disciplineId) {
								$courseTile.find('.course-grouping-div').attr('data-discipline-id', instructorCourse.disciplineId);
							}
						}
						$coursesContainer.removeClass('_display_none');
					} else {
						return showGeneralErrorMessage(coursesData);
					}

				},
				error: function (error) {
					showGeneralErrorMessage('Unable to get courses');
				},
				complete: function () {
					$courseGroupingContainerThrobber.remove();
					toggleDepartmentTermSelects(true);
                    //sendRecipient(data.instructor_courses.length);
                    toggleShareAdoptionView();
				}
			});
		}
	}

// -254 new function Start
    function getCoursesOnScroll() {

		var $coursesContainer = $('.card-list');
		var termId = $('.term-select').val();

		if (coursesData != undefined && coursesData.instructor_courses.length > 0 && courseCardsLoaded > 0
			&& coursesData.instructor_courses.length > courseCardsLoaded) {
			var $courseGroupingContainer = $('.course-grouping').find('.container').first(),
				$courseGroupingContainerThrobber = ffd.showThrobber($courseGroupingContainer, 'appendTo');

			toggleDepartmentTermSelects(false);
			var oldCourseCardsLoaded = courseCardsLoaded;

			if(coursesData.instructor_courses.length > courseCardsLoaded + defaultcourseCardValue){
				courseCardsLoaded = courseCardsLoaded + defaultcourseCardValue;
			}else {
				courseCardsLoaded = coursesData.instructor_courses.length;
			}

			for (var i = oldCourseCardsLoaded; i < courseCardsLoaded; i++) {
				var instructorCourse = coursesData.instructor_courses[i];
				var $courseTile = $courseItemTemplate.clone();
				getInstructorCourseMaterials(instructorCourse, $courseTile);

				renderInstructorCourseHeader(instructorCourse, $courseTile, count);
				count++;

				$coursesContainer.append($courseTile);

				if (instructorCourse.disciplineId) {
					$courseTile.find('.course-grouping-div').attr('data-discipline-id', instructorCourse.disciplineId);
				}
			}

			$courseGroupingContainerThrobber.remove();
			toggleDepartmentTermSelects(true);

		}else if(courseCardsLoaded == 0 && coursesData == undefined){
			var $courseGroupingContainer = $('.course-grouping').find('.container').first(),
				$courseGroupingContainerThrobber = ffd.showThrobber($courseGroupingContainer, 'appendTo');

			toggleDepartmentTermSelects(false);
			ffd.ajax({
				type: 'GET',
				url: ffd.paths.myCoursesJson.replace(':termId', termId),
				dataType: 'json',
				success: function (data) {
					if (data.error && data.error.length > 0) {
						return showGeneralErrorMessage('Unable to get courses');
					}
					coursesData = data;

					if (coursesData.instructor_courses) {
						if (!coursesData.instructor_courses.length) {
							return notifyNothingToBrowse();
						}

						if (coursesData.instructor_courses.length > defaultcourseCardValue) {
							courseCardsLoaded = defaultcourseCardValue;
						}else{
							courseCardsLoaded = coursesData.instructor_courses.length;
						}

						for (var i = 0; i < courseCardsLoaded; i++) {
							var instructorCourse = coursesData.instructor_courses[i];
							var $courseTile = $courseItemTemplate.clone();

							renderInstructorCourseHeader(instructorCourse, $courseTile, count);
							count++;
							getInstructorCourseMaterials(instructorCourse, $courseTile);

							$coursesContainer.append($courseTile);

							if (instructorCourse.disciplineId) {
								$courseTile.find('.course-grouping-div').attr('data-discipline-id', instructorCourse.disciplineId);
							}
						}
						$coursesContainer.removeClass('_display_none');
					} else {
						return showGeneralErrorMessage(coursesData);
					}
				},
				error: function (error) {
					showGeneralErrorMessage('Unable to get courses');
				},
				complete: function () {
					$courseGroupingContainerThrobber.remove();
					toggleDepartmentTermSelects(true);
					toggleShareAdoptionView();
				}
			});
		}


	}

// -254 new function End


	function renderInstructorCourseHeader(course, $courseTile, count) {
		var courseItemHeader = $courseTile.find('h3');
		var $courseItemHeaderLink = $('<a/>', {'class':'course-header-link', href: ffd.paths.specificCourse.replace(':courseId', course.id), 'id' : 'coursecard-counter-' + count});
		courseItemHeader.text('').append($courseItemHeaderLink);
		$courseItemHeaderLink.append($('<span/>', {'class': 'large-course-header', title: course.description, text: course.description}));
		$('<span/>', {'class': 'small-course-title', title: course.shortName, text: course.shortName}).appendTo($courseItemHeaderLink);
		$courseTile.find('a.cta').attr('href', ffd.paths.discoverCourse.replace(':courseId', course.id));
	}

	function getInstructorCourseMaterials(course, $tile) {

		var $header = $tile.find('h3');
		var $throbber = ffd.showThrobber($header, 'insertAfter');

		ffd.ajax({
			type: 'GET',
			url: ffd.paths.adoptedCourseMaterialsJson.replace(':courseId', course.id),
			dataType: 'json',
			success: function(data) {
				if(data.error) {
					$throbber.remove();
					if(data.error.type === "CourseTrack") {
						ffd.showCourseMaterialError($tile, 'We are unable to load your course materials at this time. If this error persists, please contact your campus store.');
						return;
					}
					return ffd.showCourseMaterialError($tile);
				}
				renderInstructorCourseMaterials(course, data, $tile);
				getCourseISBNList(data, course);

			},
			error: function(error) {
				if(error.status === 0) {
					return false;
				}
				ffd.showCourseMaterialError($tile);
				$throbber.remove();
			},
			complete: function() {
				$throbber.remove();
				toggleShareAdoptionView();
			}
		});
	}

	function renderInstructorCourseMaterials(course, materialData, $tile) {
		var $selectHolder = $tile.find('.course-cta'),
			disciplineId = course.disciplineId,
			$discoverLink = $tile.find('.cta');

		var $tileContentHolder = $tile.find('.course-card-content-holder');

		renderCourseMaterials(materialData, calculateMaterialsToRenderAmount(materialData, disciplineId), course.id, $tileContentHolder);
		var itemCount = materialData.materials.length + materialData.supplies.length;                                   //-269 Changes
		if (itemCount > MIN_MATERIALS_AMOUNT_TO_SHOW_ALL_MATERIALS_LINK) {                                              //-269 Changes
			buildViewAllMaterialsLink(materialData, course.id).insertAfter($tileContentHolder.find('.mat-list'));
		}
		$shareAdoptionCourseInfo = $('<span/>', {'class': 'share-adoptions-component share-adoption-course-info', text: '(' + itemCount  + ' adopted materials)'});
		$shareAdoptionCourseInfo.insertBefore($tileContentHolder.find('.course-cta'));

		if ((!disciplineId || disciplineId === '') && (ffd.user.role !== 'administrator')) {
			$tile.addClass('dropdown-card');
			buildDisciplineSelectBlock($selectHolder, course.id);
		} else {
			$tile.find('.select-title').remove();
			$tile.find('.subject-select').remove();
			$discoverLink.removeClass('inactive').removeAttr('disabled');
			if (ffd.user.role === 'administrator') {
				$discoverLink.text('Review this course').attr('href', ffd.paths.specificCourse.replace(':courseId', course.id));
			}
			$tile.find('.cta').prependTo($tile.find('.course-card-content-holder'));
		}
		if ((disciplineId && disciplineId !== '') || (ffd.user.role === 'administrator')) {
			$tile.find('.course-cta').append(buildManageCourseLink(course.id));
		}
		$tile.find('.course-card-content-holder').removeClass('_display_none');
		ffd.cutMaterialTitles($tile);
	}

	function getConciergeCoursesOnScroll(isUsingDefaultDepartment){

		if(cachedCourses != undefined && cachedCourses.length > 0 && courseCardsLoaded> 0 && cachedCourses.length > courseCardsLoaded) {
			var $coursesContainer = $('.card-list');
		    var $courseGroupingContainer = $('.share-adoption-course-list');

			//var $courseGroupingContainer = $('.course-grouping').find('.container').first();
			var $courseGroupingContainerThrobber = ffd.showThrobber($courseGroupingContainer, 'appendTo');

			toggleDepartmentTermSelects(false);
			var oldCourseCardsLoaded = courseCardsLoaded;

			if(cachedCourses.length > courseCardsLoaded + defaultcourseCardValue){
				courseCardsLoaded = courseCardsLoaded + defaultcourseCardValue;
			}else {
				courseCardsLoaded = cachedCourses.length;
			}
			for (var i = oldCourseCardsLoaded; i < courseCardsLoaded; i++) {
				(function (course) {
	                var $tile = $courseItemTemplate.clone();
					var $article = $tile.find('course-grouping-div');
					$article.addClass('concierge-card-data-holder');
                    renderShareAdoptionsCheckbox(course, $tile, count);
					var $tileHeader = $tile.find('h3');
					showConciergeCourseHeader(course, $tileHeader, count);
                    loadAndShowConciergeMaterials(course, $tile);
                    count++;
					var $contentHolder = $tile.find('.course-card-content-holder');
					$contentHolder.find('.course-cta').detach();


					$contentHolder.removeClass('_display_none');
					$coursesContainer.append($tile);
				})(cachedCourses[i]);
			}
			$coursesContainer.removeClass('_display_none');
			$courseGroupingContainerThrobber.remove();
			toggleDepartmentTermSelects(true);
            toggleShareAdoptionView();
		}
	}

	function getConciergeCourses(isUsingDefaultDepartment) {
		//var $courseGroupingContainer = $('.course-grouping').find('.container').first();
		var $courseGroupingContainer = $('.share-adoption-course-list');
		var $courseGroupingContainerThrobber = ffd.showThrobber($courseGroupingContainer, 'appendTo');
		toggleDepartmentTermSelects(false);
		var departmentIndex = $('.department-select').val();
		var department = ffd.user.departments[departmentIndex];
		var term = $('.term-select').val();
		var courseNumberSearch = 'false';
        var	courseNumber = $('#concierge-course-number-search-input').val();
        var trimmedCourseNumber = courseNumber.trim();
        if((trimmedCourseNumber).length <= 0)  {
            courseNumberSearch = 'false';
        } else {
            courseNumberSearch = 'true';
        }


		ffd.ajax({
			type: 'GET',
			url: ffd.paths.conciergeCourses,
			data: {
				divisionId: department.divisionId,
				departmentId: department.id,
				termId: term,
				courseNumber: trimmedCourseNumber,
				courseNumberSearch : courseNumberSearch
			},
			dataType: 'json',
			success: function(data) {
				if (data.error && data.error.length > 0) {
					return showGeneralErrorMessage('Unable to get courses');
				}
                if(data.courses.length === 0 ){
                    $('#checkboxField').addClass('_display_none_checkbox');
                    $('.share-adoption-check').prop('checked', false);
                } else {
                    $('#checkboxField').removeClass('_display_none_checkbox');
                    //$('#checkboxField').addClass('_remove_float_left_dashboard');
                }
				return renderConciergeCourses(data.courses);
			},
			error: function(error) {
				if(error.status === 0) {
					return false;
				}
				isError = true;
				showGeneralErrorMessage('Unable to get courses');
			},
			complete: function(){
				$courseGroupingContainerThrobber.remove();
				toggleDepartmentTermSelects(true);
                toggleShareAdoptionView();
			}
		});
	}

	function renderConciergeCourses(courses) {
		if (!courses.length) {
			return notifyNothingToBrowse();
		}
		courses.sort(function(first, second) {
		    var firstCourse = first.courseId.toLowerCase();
			var secondCourse = second.courseId.toLowerCase();

            	if (firstCourse > secondCourse) {
            		return 1;
            		}  else if (firstCourse < secondCourse) {
            			return -1;
            		}else {
            		if(first.sectionId && second.sectionId){
            		var firstSection = first.sectionId.toLowerCase();
            		var secondSection = second.sectionId.toLowerCase();
            			if (firstSection > secondSection) {
            				return 1;
            		}   if (firstSection < secondSection) {
            				return -1;
            		}
            		} else {
            				return 0;
            			}
            		}
		});
		cachedCourses = courses;
		var $coursesContainer = $('.card-list');

		if (courses.length > defaultcourseCardValue) {
			courseCardsLoaded = defaultcourseCardValue;
		}else{
			courseCardsLoaded = courses.length;
		}

		for (var i = 0; i < courseCardsLoaded; i++) {
			(function(course) {
				var $tile = $courseItemTemplate.clone();
				var $article = $tile.find('course-grouping-div');
				$article.addClass('concierge-card-data-holder');
                renderShareAdoptionsCheckbox(course, $tile, count);
				var $tileHeader = $tile.find('h3');
				showConciergeCourseHeader(course, $tileHeader, count);
                loadAndShowConciergeMaterials(course, $tile);
                count++;
				var $contentHolder = $tile.find('.course-card-content-holder');
				$contentHolder.find('.course-cta').detach();


				$contentHolder.removeClass('_display_none');
				$coursesContainer.append($tile);
			})(courses[i]);
		}
		$coursesContainer.removeClass('_display_none');
	}

	function showConciergeCourseHeader(course, $headerContainer, count) {
		var $courseItemHeaderLink = $('<a/>', {'class':'course-header-link', href: ffd.paths.specificCourse.replace(':courseId',course.id), 'id' : 'coursecard-counter-' + count});
		$headerContainer.text('').append($courseItemHeaderLink);
		//$courseItemHeaderLink.append($('<span/>', {'class': 'large-course-header', title: course.description, text: course.description}));
		//$('<span/>', {'class': 'small-course-title', title: course.shortName, text: course.shortName}).appendTo($courseItemHeaderLink);
		if(course.isSection === true) {
            $courseItemHeaderLink.append($('<span/>', {'class': 'large-course-header-1', title: course.description, text: course.description}));
            $('<span/>', {'class': 'small-course-title-1', title: course.shortName, text: course.shortName}).appendTo($courseItemHeaderLink);

		    $courseItemHeaderLink.append($('<span/>', {'class': 'small-course-title-2', text: "INSTRUCTOR : "}));
            var $throbber = $('<div/>', {class: 'throbber-instructor'});

            $throbber.insertAfter($courseItemHeaderLink);
            ffd.ajax({
                type: 'POST',
                url: ffd.paths.getInstructorData,
                data: {
                    store: course.store,
                    campus: course.campus,
                    courseId: course.courseId,
                    departmentId: course.departmentId,
                    divisionId: course.divisionId,
                    realm: course.realm,
                    sectionId: course.sectionId,
                    termId: course.termId,
                },
                dataType: 'json',
                success: function(data) {
                    $throbber.remove();
                    var instructors_lastname = data.instructors_lastname.trim();
                    if( 'TBD' !== instructors_lastname && instructors_lastname.length <= 0) {
                        instructors_lastname = "TBD";
                    }

                    $courseItemHeaderLink.append($('<span/>', {'class': 'small-course-title-3',  text: instructors_lastname,  title: instructors_lastname}));

                    if(data.error) {
                        if(data.error.type === "CourseTrack") {
                            return ffd.showCourseMaterialError($tile, 'We are unable to fetch instructor name at this time. If this error persists, please contact your campus store.');
                        }
                        return ffd.showCourseMaterialError($tile);
                    }
                },
                error: function(error) {
                    if(error.status === 0) {
                        return false;
                    }
                   // ffd.showCourseMaterialError($tile);
                    $throbber.remove();
                }
            });

		} else {
            $courseItemHeaderLink.append($('<span/>', {'class': 'large-course-header', title: course.description, text: course.description}));
            $('<span/>', {'class': 'small-course-title', title: course.shortName, text: course.shortName}).appendTo($courseItemHeaderLink);
		}



	}

	function loadAndShowConciergeMaterials(course, $tile) {
		clearTileContent($tile);
		var $container = $tile.find('.course-card-content-holder');
		var $throbber = ffd.showThrobber($container, 'appendTo');
		ffd.ajax({
			type: 'GET',
			url: ffd.paths.adoptedCourseMaterialsJson.replace(':courseId', course.id),
			dataType: 'json',
			success: function(data) {
				$throbber.remove();
				if(data.error) {
					if(data.error.type === "CourseTrack") {
						return ffd.showCourseMaterialError($tile, 'We are unable to load your course materials at this time. If this error persists, please contact your campus store.');
					}
					return ffd.showCourseMaterialError($tile);
				}
				displayCourseMaterial(data, course, $tile);
                getCourseISBNList(data, course);
                toggleShareAdoptionView();
			},
			error: function(error) {
				if(error.status === 0) {
					return false;
				}
				ffd.showCourseMaterialError($tile);
				$throbber.remove();
			}
		});
	}

	function clearTileContent($tile) {
		return $tile.find('.course-card-content-holder').empty();
	}

	function displayCourseMaterial(materialData, course, $tile) {

		var courseId = course.id;
		var $container = $tile.find('.course-card-content-holder');
		showConciergeQuickAdoptBlock($container, $tile, course);

		renderCourseMaterials(materialData, calculateMaterialsToRenderAmount(materialData, course.disciplineId), courseId, $container);

		renderConciergeBottomBlock(materialData, course, $container);
		ffd.cutMaterialTitles($tile);
	}

	function showConciergeQuickAdoptBlock($container, $tile, course) {
		var $isbnInput = $isbnInputTemplate.clone();
		var $quickAdoptButton = $quickAdoptButtonTemplate.clone();
		$quickAdoptButton.on('click', function() {

			$tile.find('.error-msg-top').remove();
			var $materialsList = $container.find('.mat-list').addClass('_display_none');
			var $slogan = $container.find('.jumbo').addClass('_display_none');

			var isbn = $isbnInput.val();
			if (!isbn) {
				return showQuickAdoptError({
					materialsList: $materialsList,
					slogan: $slogan,
					errorMessage: 'No ISBN entered',
					container: $container
				});
			}
            if (isbn.length<13) {
            	return showQuickAdoptError({
            		materialsList: $materialsList,
            		slogan: $slogan,
            		errorMessage: 'Invalid ISBN format. Please check ISBN.',
            		container: $container
            	});
            }
			var $throbber = ffd.showThrobber($container, 'appendTo');
			$isbnInput.attr('disabled', true);
			$quickAdoptButton.attr('disabled', true);

			ffd.ajax({
				type: 'PUT',
				dataType: 'json',
				data: {status: 'required'},
				url: ffd.paths.courseMaterialAdoptionStatus.replace(':courseId', course.id).replace(':materialId', isbn),
				success: function(data) {
					return showQuickAdoptSuccess(course, $tile);
				},
				error: function(xhr, error) {
					return showQuickAdoptError({
						materialsList: $materialsList,
						slogan: $slogan,
						errorMessage: 'To adopt this material, please contact your department administrator.',
						container: $container
					});
				}, complete: function() {
					$isbnInput.attr('disabled', false);
					$quickAdoptButton.attr('disabled', false);
					$throbber.remove();
				}
			})
		});

		$container.prepend($quickAdoptButton);
		$container.prepend($isbnInput);
	}

	function showQuickAdoptError(params) {
		var $materialsList = params.materialsList;
		var $slogan = params.slogan;
		var $container = params.container;
		var errorMessage = params.errorMessage;

		var $error = ffd.showError($container, errorMessage, 'insertBefore');
		$error.on('click', function() {
			$materialsList.removeClass('_display_none');
			$slogan.removeClass('_display_none');
			$error.remove();
		});
	}

	function showQuickAdoptSuccess(course, $tile) {
		loadAndShowConciergeMaterials(course, $tile);
	}

	function renderCourseMaterials(materialData, materialsToRenderAmount, courseId, $container) {

        var ctResponseDetails = ffd.getCtResponseDetails(materialData.sectionAdoptionStatus,false);

        //-269 Start
        if(materialData.supplies.length === 0 && materialData.materials && materialData.materials.length > 0) {
            return renderMaterialsListOnly(materialData, materialsToRenderAmount, courseId, $container);
        } else if(materialData.supplies && materialData.materials && materialData.materials.length > 0 && materialData.supplies.length > 0) {
            if (materialData.materials.length >= materialsToRenderAmount){
                return renderMaterialsListOnly(materialData, materialsToRenderAmount, courseId, $container);
            } else {
                return renderMaterialAndSupply(materialData, materialsToRenderAmount, courseId, $container);
            }
        } else if(materialData.materials.length === 0 && materialData.supplies && materialData.supplies.length > 0) {
            return renderSuppliesListOnly(materialData, materialsToRenderAmount, courseId, $container);
        } else if(typeof ctResponseDetails.messageInCourseCard !== 'undefined' && ctResponseDetails.messageInCourseCard.length>0){
            renderCtMessageBlock(ctResponseDetails.messageInCourseCard,$container);
        } else {
            renderNoMaterialsBlock(materialData, $container);
        }
        //-269 End
    }

    //-269 Start
    function renderMaterialsListOnly(materialData, materialsToRenderAmount, courseId, $container) {
        var $materialsList = $materialsListTemplate.clone();
        var $all_materials = renderMaterialsList(materialData.materials, materialsToRenderAmount, courseId, $materialsList);
        $container.append($all_materials);
    }

    function renderSuppliesListOnly(materialData, materialsToRenderAmount, courseId, $container) {
        var $materialsList = $materialsListTemplate.clone();
        var $all_supplies = renderSuppliesList(materialData.supplies, materialsToRenderAmount, courseId, $materialsList);
        $container.append($all_supplies);
    }

    function renderMaterialAndSupply(materialData, materialsToRenderAmount, courseId, $container) {
        var supplyCount = materialsToRenderAmount - materialData.materials.length;
        var $materialsList = $materialsListTemplate.clone();
        var $all_materials = renderMaterialsList(materialData.materials, materialData.materials.length, courseId, $materialsList);
        $container.append($all_materials);
        var $all_supplies = renderSuppliesList(materialData.supplies, supplyCount, courseId, $materialsList);
        $container.append($all_supplies);
    }
    //-269 End

	function renderMaterialsList(materials, amount, courseId, $materialsList) {
		for(var i = 0; i < materials.length && i < amount; i++) {
			var $materialItem = $materialItemTemplate.clone();
			var material = materials[i];
			var $img = $materialItem.find('img');
			$img.removeAttr('src');
			$img.attr('src', (material.image || '/img/no-cover.png'));
			$img.attr('alt', (''));
			showImgAfterLoad($img);
			$materialItem.find('h4').text(material.title || ffd.defaultMaterialTitle);
			$materialItem.find('a').attr('href', ffd.paths.courseMaterialDetails.replace(':courseId', courseId).replace(':materialId', material.isbn13)).attr('title', material.title);
			if (ffd.user.role === 'concierge') {
				$materialItem.addClass('small-material-cell');
			}
			$materialsList.append($materialItem);
		}
		return $materialsList;
	}

    //-269 Start
	function renderSuppliesList(supplies, amount, courseId, $materialsList) {
        for(var i = 0; i < amount; i++) {
            var $materialItem = $materialItemTemplate.clone();
            var supply = supplies[i];
            var $img = $materialItem.find('img');
            $img.removeAttr('src');
            $img.attr('src', (supply.image || '/img/no-cover.png'));
            $img.attr('alt', (''));
            showImgAfterLoad($img);
            $materialItem.find('h4').text(supply.name || ffd.defaultMaterialTitle);
            $materialItem.find('a').attr('href', ffd.paths.courseMaterialDetails.replace(':courseId', courseId).replace(':materialId', supply.supplyId)).attr('title', supply.name);
            if (ffd.user.role === 'concierge') {
                $materialItem.addClass('small-material-cell');
            }
            $materialsList.append($materialItem);
        }
        return $materialsList;
    }
    //-269 End

	function renderNoMaterialsBlock(materialData, $container) {
		var $discoverSlogan = $discoverCourseSloganTemplate.clone();
		$container.find('.course-card-content-holder').addClass('bordered');
		if (materialData.noMaterialsRequired === 'true') {
			$discoverSlogan.html('Nothing <br> required').appendTo($container);
			$shareAdoptionCourseInfo = $('<span/>', {'class': 'share-adoptions-component share-adoption-course-info', text: 'No materials required'});
	        $shareAdoptionCourseInfo.insertBefore($discoverSlogan);
		} else {
			$discoverSlogan.appendTo($container);
		}
	}
    function renderCtMessageBlock(message, $container) {
        var $discoverSlogan = $discoverCourseSloganTemplate.clone();
        $container.find('.course-card-content-holder').addClass('bordered');
        $discoverSlogan.html(message).appendTo($container);
    }
	function renderConciergeBottomBlock(materialData, course, $container) {
		var $materialsLink = null;
		var itemCount = materialData.materials.length + materialData.supplies.length;                                   //-269 Changes

		if (itemCount > MIN_MATERIALS_AMOUNT_TO_SHOW_ALL_MATERIALS_LINK) {                                              //-269 Changes
			$materialsLink = buildViewAllMaterialsLink(materialData, course.id);
		} else if (materialData.noMaterialsRequired === 'true' && !materialData.materials.length && !materialData.supplies.length) {    //-269 Changes
			$materialsLink = buildNoMaterialsRequiredLink();
		}

		var disciplineId = course.disciplineId;
		if ((!disciplineId || disciplineId === '') && (ffd.user.role !== 'administrator')) {
			var $courseCta = $courseCtaTemplate.clone();
			buildDisciplineSelectBlock($courseCta, course.id);
			$container.append($courseCta);
			if(materialData.noMaterialsRequired != 'true') {
				$shareAdoptionCourseInfo = $('<span/>', {'class': 'share-adoptions-component share-adoption-course-info', text: '(' + itemCount + ' adopted materials)'});
				$shareAdoptionCourseInfo.insertBefore($courseCta);
			}
			if(materialData.noMaterialsRequired === 'true' && itemCount >= 0) {
                $shareAdoptionCourseInfo = $('<span/>', {'class': 'share-adoptions-component share-adoption-course-info', text: '(' + itemCount + ' adopted materials)'});
                $shareAdoptionCourseInfo.insertBefore($courseCta);
            }
		} else {
			var $conciergeBottomContainer = $conciergeBottomContainerTemplate.clone();
			if ($materialsLink) {
				$conciergeBottomContainer.append($materialsLink);
			}

			if(itemCount>=0) {
			    var $conciergeBottomContainerInner = $conciergeBottomContainerTemplate.clone();
                $shareAdoptionCourseInfo = $('<span/>', {'class': 'share-adoptions-component share-adoption-course-info-congierge', text: '(' + itemCount + ' adopted materials)'});
                if(!(materialData.noMaterialsRequired === 'true' && itemCount === 0)) {
                    $conciergeBottomContainerInner.append($shareAdoptionCourseInfo);
                }
                $container.append($conciergeBottomContainerInner);
           }
			$conciergeBottomContainer.append(buildManageCourseLink(course.id));
			$container.append($conciergeBottomContainer);
		}
	}

	function buildViewAllMaterialsLink(materialData, courseId) {
		var $viewAllMaterialsLink = $caretLinkTemplate.clone();
		var count = materialData.materials.length + materialData.supplies.length;                                       //-269 Changes
		$viewAllMaterialsLink.attr('href', ffd.paths.specificCourse.replace(':courseId', courseId)).removeClass('caret-link').addClass('materials-quantity-link');
		$viewAllMaterialsLink.find('span').text('View all ' + count + ' materials');                                    //-269 Changes
		return $viewAllMaterialsLink;
	}

	function buildNoMaterialsRequiredLink() {
		var $noMaterialsRequiredLink = $caretLinkTemplate.clone();
		$noMaterialsRequiredLink.removeClass('caret-link').addClass('materials-quantity-link');
		$noMaterialsRequiredLink.removeAttr('href');
		$noMaterialsRequiredLink.find('span').text('No materials required');
		return $noMaterialsRequiredLink;
	}

	function buildManageCourseLink(courseId) {
		var $manageLink = $manageCourseLinkTemplate.clone();
		var courseHref = $manageLink.attr('href').replace(':courseId', courseId);
		$manageLink.attr('href', courseHref);
		return $manageLink;
	}

	function buildDisciplineSelectBlock($courseCtaBlock, courseId) {
		var $discoverLink = $courseCtaBlock.find('.cta');
		$discoverLink.attr('href', ffd.paths.discoverCourse.replace(':courseId', courseId));

		var $disciplineSelect = $disciplineSelectTemplate.clone(),
			$subjectSelect = $subjectSelectTemplate.clone();

	    var disciplinesDataArray = [];
        for (var disciplineName in disciplinesData.disciplines) {
            var disciplinesDataJson = {};
            if(disciplinesData.disciplines.hasOwnProperty(disciplineName)) {
                disciplinesDataJson._id = disciplinesData.disciplines[disciplineName]._id;
                disciplinesDataJson.name = disciplinesData.disciplines[disciplineName].name;
                disciplinesDataArray.push(disciplinesDataJson);
            }
        }
        /*function GetSortOrder(prop) {
            return function(a, b) {
                if (a[prop] > b[prop]) {
                    return 1;
                } else if (a[prop] < b[prop]) {
                    return -1;
                }
                return 0;
            }
        }*/

        disciplinesDataArray.sort(GetSortOrder("name"));

		for (var item in disciplinesDataArray) {
			//if(disciplinesData.disciplines.hasOwnProperty(disciplineName)) {
				$('<option/>', {
					value: disciplinesDataArray[item]._id,
					text: disciplinesDataArray[item].name
				}).appendTo($disciplineSelect);
			//}
		}
		$('<label/>', {'for': 'select-discipline', text: 'Select Discipline'}).insertBefore($discoverLink);
		$disciplineSelect.insertBefore($discoverLink);
		$('<label/>', {'for': 'select-subject', text: 'Select Subject'}).insertBefore($discoverLink);
		$subjectSelect.insertBefore($discoverLink);
		$disciplineSelect.on('change', function () {
			var $disciplineId = $(this).val();
			if ($(this).find('option:selected').index() === 0) {
				isDisciplineSelected = false;
				isSubjectSelected = false;
				$subjectSelect.addClass('inactive').prop('disabled', true);
				$discoverLink.addClass('inactive');
			} else {
				isDisciplineSelected = true;
				$subjectSelect.removeClass('inactive').prop('disabled', false);
				$subjectSelect.empty();
				$subjectSelect.append($('<option/>', {
					text: 'Select Subject'
				}));
				for (var subject in disciplinesData.disciplines[$disciplineId].subjects) {
					if(disciplinesData.disciplines[$disciplineId].subjects.hasOwnProperty(subject)) {
						$('<option/>', {
							value: disciplinesData.disciplines[$disciplineId].subjects[subject].id,
							text: disciplinesData.disciplines[$disciplineId].subjects[subject].name
						}).appendTo($subjectSelect);
					}
				}
				if ($subjectSelect.find('option:selected').index() !== 0) {
					$discoverLink.removeClass('inactive').removeAttr('disabled');
				}
			}
		});
		$subjectSelect.on('change', function () {
			if ($(this).find('option:selected').index() === 0) {
				isSubjectSelected = false;
				$discoverLink.addClass('inactive');
			} else {
				isSubjectSelected = true;
				$discoverLink.removeClass('inactive').removeAttr('disabled');
			}
		});
		$discoverLink.on('click', function (e) {
			e.preventDefault();
			var $courseContainer = $(this).parents('.course-grouping-div');
			if (isDisciplineSelected && isSubjectSelected) {
				var courseData = {courseId: courseId, subjectId: $subjectSelect.val(), disciplineId: $disciplineSelect.val()};
				$(this).addClass('inactive').attr('disabled', 'disabled');
				ffd.setCourseDisciplineAndSubject($courseCtaBlock, courseData, $(this).attr('href'));
			}
		});
	}

	function showGeneralErrorMessage(errorText) {
		$('<p/>', {
			'class': 'error-msg-top',
			text: errorText
		}).insertAfter('.header-link').show();
	}

	function clearGeneralErrorMessages() {
		$('.error-msg-top').remove();
	}

	function calculateMaterialsToRenderAmount(materialData, disciplineId) {
		var count = materialData.materials.length + materialData.supplies.length;                                       //-269 Changes
		if (disciplineId && disciplineId !== '') {
			return Math.min(count, 3);                                                                                  //-269 Changes
		}
		return Math.min(count, 1);                                                                                      //-269 Changes
	}
	// -254




    function storeTermsAndConditionsValue(termsAndConditionsValue) {
    var sid = ffd.userData.sid;
        ffd.ajax({
				type: 'POST',
				url: ffd.paths.storeTermsAndConditionsValue,
                data: {
				    sid: sid,
				    termsAndConditionsValue: termsAndConditionsValue
			    },
	            dataType: 'json'
			});


	}
    		/*- 254 Start */
	function getTermsAndConditionsWindow() {
        var termsAndConditionsValue;

        $('#attestation-modal').modal({
            backdrop: 'static',
            keyboard: false,
            show: true
        });
        $('#attestation_header').css({'display':'block'});

        $("#closeButton").on("click",function() {
            window.location.href = ffd.paths.logOut;
        })
        $("#cancelButton").on("click",function() {
            window.location.href = ffd.paths.logOut;
        })
        $("#submit_adoption_request").prop('disabled', true);
        $('#termCheck').click(function() {
             if ($(this).is(':checked')) {
               $("#submit_adoption_request").prop('disabled', false);
             } else {
                $("#submit_adoption_request").prop('disabled', true);
             }
        });
        $("#submit_adoption_request").on("click",function() {

            termsAndConditionsValue = "true";
            $('#attestation-modal').modal('hide');
			$("#home_btn").focus();
            storeTermsAndConditionsValue(termsAndConditionsValue);
        });

			setTimeout(function(){
				$('#termCheck').focus();
			}, 500);
		$("#cancelButton").blur(function() {
			$('#closeButton').focus();
		});
		$("#closeButton").blur(function() {
			$('#termCheck').focus();
		});
    }
    	              /*- 254 End */

// -479
    function toggleShareAdoptionView() {
          if ($('.share-adoption-check').is(':checked')) {
              $('#card-list-container').addClass('share-adoptions-view');
              $('.mat-list').css('display', 'none');
              $('.materials-quantity-link').css('display', 'none');
              $('.share-adoptions-component').css('display', 'block');
              $('.non-share-adoptions-component').css('display', 'none');
              $('.course-grouping-div').removeClass('dropdown-card');
              $('.share-adoptions-check').prop('checked', true);
          } else {
              $('#card-list-container').removeClass('share-adoptions-view');
              $('.mat-list').css('display', 'block');
              $('.materials-quantity-link').css('display', 'block');
              $('.share-adoptions-component').css('display', 'none');
              $('.non-share-adoptions-component').css('display', 'block');
              $('.course-grouping-div').addClass('dropdown-card');
              $('.share-adoptions-check').prop('checked', false);
          }
      }

    function renderShareAdoptionsCheckbox(course, $courseTile, count) {
          var $courseItemHeader = $courseTile.find('.course-grouping-div');
          var $courseItemHeaderLink = $('<input/>', {'class':'share-adoptions-check share-adoptions-component', type: 'checkbox', value : course.sectionId + '/' + course.description,'id' : 'share-adoptions-check-' + count});
          //$courseItemHeader.append($courseItemHeaderLink);
          $courseItemHeaderLink.insertBefore($courseItemHeader.find('.course-card-content-holder'));
          if ($('.share-adoption-check').is(':checked')) {
               $('.mat-list').css('display', 'none');
               $('.materials-quantity-link').css('display', 'none');
               $('.share-adoptions-component').css('display', 'block');
               $('.share-adoptions-check').prop('checked', true);
          } else {
                $('.mat-list').css('display', 'block');
                $('.materials-quantity-link').css('display', 'block');
                $('.share-adoptions-component').css('display', 'none');
                $('.share-adoptions-check').prop('checked', false);
          }


    }

     function sendRecipient() {
         $('#email-list').on('keyup',function() {
             var emailList = $('#email-list').val();
             if(emailList !='') {
                $('.send').prop('disabled', false);
             } else {
                $('.send').prop('disabled', true);
             }
         });
         $('.send').on('click', function() {
              if(isCourseCardLoading()) {
                  return;
              }
              var $emailList = $('#email-list');
              var emailTo = $emailList.val();
              var isCourseShareChecked = 0;
              var inputElements = document.getElementsByClassName('share-adoptions-check share-adoptions-component');
              for(var i=0; i<inputElements.length; ++i) {
                  if(inputElements[i].checked) {
                      isCourseShareChecked =1;
                      break;
                  }
              }
              if(isCourseShareChecked === 0){
            	  bootbox.alert({
                      title: 'No course selected.',
                      message: "Please select atleast one course in order to send adoption notification.",
                      buttons: {
                          'ok': {
                              label: 'OK',
                              className: 'btn-default pull-right button-background'
                          }
                      }
                    }).find("div.modal-dialog").addClass("own-modal-dialog");
                    return false;
              }
              var status = validateEmails(emailTo);
              if(!status){
            	  bootbox.alert({
                      title: 'Email validation failed.',
                      message: "Please provide valid email id(s).",
                      buttons: {
                          'ok': {
                              label: 'OK',
                              className: 'btn-default pull-right'
                          }
                      }
                  }).find("div.modal-dialog").addClass("own-modal-dialog");
                  return false;
              }

              materialCourseList = [];
              var checkedValue = null;
              var courseConfirmationList = [];
              var inputElements = document.getElementsByClassName('share-adoptions-check');
              for(var i=0; inputElements[i]; ++i) {
                if(inputElements[i].checked){
                     checkedValue = inputElements[i].value;
                     courseConfirmationList.push(checkedValue);
                }
              }
              var termName;
              var emailFrom = ffd.userData.email;
              var termId = $('.term-select').val();
              var terms = ffd.terms;
              for(var j = 0; j < terms.length; j++) {
                if (termId ===  terms[j].id) {
                   termName = terms[j].description;
                 }
              }
              for(var i = 0; i < courseConfirmationList.length; i++) {
                for(var j = 0; j < isbnList.length; j++) {
                    if(courseConfirmationList[i] === (isbnList[j].courseSectionId + '/' + isbnList[j].courseDescription)) {
                        materialCourseList.push(isbnList[j]);
                    }
                }
              }
              var givenName = ffd.userData.given_name;
              var familyName = ffd.userData.family_name;
              var initializeText = "Sending Mail ...";
              $('#status_header button').attr("data-dismiss", '');
              $('#status_header').css({'display':'none'});
              $('.statusModalText').text(initializeText);
              var statusDOM = $('#status_body').html();
              $('#statusModal').modal({
                  backdrop: 'static',
                  keyboard: false,
                  show: true
              });

              ffd.ajax({
                 type: 'POST',
                 url: ffd.paths.sendCourseMail,
                 data: {
                    materialList: materialCourseList,
                    emailToList: emailTo,
                    emailFrom: emailFrom,
                    givenName: givenName,
                    familyName: familyName,
                    termName:termName,
                    termId: termId,
                    courseChecked: courseConfirmationList
                 },
                 dataType: 'json',
                 success: function(){

                     var wait = '<div class="statusModalText" style="padding: 0px 0px 40px 0px">Mail has been sent successfully.</div>';
                     $('#status_header button').attr("data-dismiss", 'modal');
                     $('#status_header').css({'display':'block'});
                     $('#status_body').html(wait);

                     var intervalClose = setInterval(function(){

                             $('#statusModal').modal('hide');
                             $('#status_body').html(statusDOM);

                             clearInterval(intervalClose);

                     },3000);
                  },
                 error: function(error) {

                   var wait = '<div class="statusModalText" style="padding: 0px 0px 40px 0px">Failed to send an email.</div>';
                   $('#status_header button').attr("data-dismiss", 'modal');
                   $('#status_header').css({'display':'block'});
                   $('#status_body').html(wait);

                   var intervalClose = setInterval(function(){

                           $('#statusModal').modal('hide');
                           $('#status_body').html(statusDOM);

                           clearInterval(intervalClose);

                   },3000);
                }

              });

         });

         $('#cancelSendRecipientId').on('click', function() {
                $('#card-list-container').removeClass('share-adoptions-view');
                $('.share-adoptions-component').css('display', 'none');
                $('.mat-list').css('display', 'block');
                $('.course-grouping-div').addClass('dropdown-card');
                $('.share-adoption-check').attr('checked', false);
                $('.materials-quantity-link').css('display', 'block');
                $('.non-share-adoptions-component').css('display', 'block');
                $('.my-course-grouping-div').addClass('dropdown-card');
         });
     }

      function validateEmails(emails){
          var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
          var status = false;
          $.each(emails.split(','), function (rowIndex, email) {
              status = pattern.test(email.trim());
              if(!status){
                  return status;
              }
          });
          return status;
      }

      function getCourseISBNList(materialData, course) {
          var materialList = materialData.materials;
          var supplyList = materialData.supplies;
          if(materialData.materials.length > 0) {
              materialList.forEach(function(material)
              {
                  var isbn = {};
                  isbn['isbn13'] = material.isbn13;
                  isbn['usage'] = material.status;
                  isbn['author'] = material.author;
                  isbn['title'] = material.title;
                  isbn['courseSectionId'] = course.sectionId;
                  isbn['courseDescription'] = course.description;

                  isbnList.push(isbn);
              });
          }
          if (supplyList.length > 0) {
              supplyList.forEach(function(supply)
              {
                  var isbn = {};
                  isbn['supplyId'] = supply.supplyId;
                  isbn['status'] = supply.status;
                  isbn['manufacturer'] = supply.manufacturer;
                  isbn['name'] = supply.name;
                  isbn['upc'] = supply.upc;
                  isbn['type'] = supply.type;
                  isbn['courseSectionId'] = course.sectionId;
                  isbn['courseDescription'] = course.description;

                  isbnList.push(isbn);
              });
          }
          if((materialData.materials.length === 0) && (supplyList.length === 0)){
                var isbn = {};
                if(materialData.noMaterialsRequired === 'true') {
                    isbn['noMaterialsRequired'] = 'true';
                }
                isbn['courseSectionId'] = course.sectionId;
                isbn['courseDescription'] = course.description;
                isbnList.push(isbn);
          }
      }

    function selectAllCourse() {
        $('.selectAll').on('click', function() {
            $('.share-adoptions-check').prop('checked', true);
        });
    }
    function clearAllCourse() {
        $('.clearAll').on('click', function() {
            $('.share-adoptions-check').prop('checked', false);
        });
    }

    function isCourseCardLoading() {
        if ($('.card-list .throbber-container .throbber').length > 0) {
            bootbox.alert({
                title: 'Course cards loading.',
                message: "Please wait till all course cards load properly.",
                buttons: {
                    'ok': {
                    label: 'OK',
                    className: 'btn-default pull-right button-background'
                    }
                }
            }).find("div.modal-dialog").addClass("own-modal-dialog");
            return true;
        }
        return false;
    }

    function GetSortOrder(prop) {
        return function(a, b) {
            if (a[prop] > b[prop]) {
                return 1;
            } else if (a[prop] < b[prop]) {
                return -1;
            }
            return 0;
        }
    }



})();


/*	$( document.body).mousedown(function() {
 alert( "Handler for .mousedown() called." );
 });

 $( "#main-content-container" ).mouseup(function() {
 alert( "Handler for .mouseup() called." );
 });*/