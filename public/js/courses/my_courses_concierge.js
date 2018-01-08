(function() {
	'use strict';

	var MIN_MATERIALS_AMOUNT_TO_SHOW_ALL_MATERIALS_LINK = 1;

	var courseCardsLoaded = 0;
	var count = 0;
    var isbnList = [];                  // -479
    var materialCourseList = [];        // -479
	var defaultcourseCardValue = 9;
	var cachedCourses;
	var isError = false,
		isDisciplineSelected = false,
		isSubjectSelected = false,
		$discoverCourseSloganTemplate,
		$manageCourseLinkTemplate,
		$conciergeBottomContainerTemplate,
		$conciergeBottomContainerTemplateinner,
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
		onboardTutorialData = ffd.onboardTutorial,
        $onboardModalConcierge = $('#modal-welcome-concierge'),
        $onboardSlideModalConcierge = $('#onboardSlidesConcierge'),
        $onboardWelcomeModalConcierge = $('#welcomeSlideConcierge'),
		$createContentBtn,
		$courseCtaTemplate,
		$courseGroupingContainerThrobber,
		$shareAdoptionCourseInfo,
		ajaxProcess,

		cookieHelper,
		termSelectBuilder,
		isCourseCardLoaded=false;


	$(function() {
	    $('#myCourses').addClass('active');
		$createContentBtn = $('.create-course-material');
		$discoverCourseSloganTemplate = $('.jumbo').detach();
		$courseItemTemplate = $('.layout-cards-grid').find('div.card--subject').detach();
		$materialsListTemplate = $courseItemTemplate.find('.card__body').detach();
		$conciergeBottomContainerTemplate = $courseItemTemplate.find('.card__footer').detach();
		$conciergeBottomContainerTemplateinner = $conciergeBottomContainerTemplate.find('.inner').detach();
		$isbnInputTemplate = $courseItemTemplate.find('.isbn-input').detach();
		$quickAdoptButtonTemplate = $courseItemTemplate.find('.quick-adopt-button').detach();
		$conciergeNoMaterialsTemplate = $courseItemTemplate.find('.no-materials-block').detach();
		$manageCourseLinkTemplate = $courseItemTemplate.find('.top-link').detach();
		$caretLinkTemplate = $courseItemTemplate.find('.caret-link').detach();
		$materialItemTemplate = $materialsListTemplate.find('.card__body__content').detach();
		$disciplineSelectTemplate = $courseItemTemplate.find('.select-discipline').detach();
		$subjectSelectTemplate = $courseItemTemplate.find('.select-subject').detach();
		$selectTitleTemplate = $courseItemTemplate.find('select-title').detach();
		$courseCtaTemplate = $courseItemTemplate.find('.card__prompt').detach();
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

		$('form.intro').on('submit', function(e) {
			e.preventDefault();
			if (ajaxProcess && ajaxProcess.readystate !== 4) {
				ajaxProcess.abort();
			}
		});

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
            if(lio == $(".card__inner").children('h3').children('a').attr('id')) return false;
            lio == $(".card__inner").children('h3').children('a').attr('id');
            var wintop = $(".share-adoption-course-list").scrollTop(), docheight = $(document).height(), winheight = $(".share-adoption-course-list").height();
            var scrolltrigger = 0.35;
            if ((wintop / (docheight - winheight)) > scrolltrigger) {

                $(".share-adoption-course-list").scrollTop();
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
		$(window).scroll(function () {
		//".course-grouping"
            if(lio == $('.card__inner').find('.card__header').children('a').attr('id')) return false;
            lio == $('.card__inner').find('.card__header').children('a').attr('id');
			var wintop = $(window).scrollTop(), docheight = $(document).height(), winheight = $(window).height();
			var scrolltrigger = 0.35;
			if ((wintop / (docheight - winheight)) > scrolltrigger) {

				$(window).scrollTop();
				switch (ffd.user.role) {
					case 'administrator': {
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
		var $form = $('.intro');
		$form.find('.department-select-label').css('display', 'none');
		$form.find('.department-select').css('display', 'none');
		if('concierge' === ffd.user.role) {
           $('.concierge-course-number-search-or').css('display', 'none');
           $('label[for=term-select]').css('padding-left','0px');
           $('.share-adoption-external-div').css('padding-top','0px');
        }
	}

	function initializeUpdateButton() {
		$('form.intro').on('submit', function(e){
			//e.preventDefault();
			$('#card-list-container').removeClass('share-adoptions-view');
			$('.share-adoptions-component').css('display', 'none');
			$('.layout-cards-grid').empty();
			courseCardsLoaded= 0;
			cachedCourses = '';
			coursesData= undefined;
			hideNoCoursesMessage();
			clearGeneralErrorMessages();
			getConciergeCourses();
		});
		$("#concierge-course-number-search-input").keypress(function() {
			if (event.which == 13) {
				$('#card-list-container').removeClass('share-adoptions-view');
				$('.share-adoptions-component').css('display', 'none');
				$('.layout-cards-grid').empty();
				courseCardsLoaded= 0;
				cachedCourses = '';
				coursesData= undefined;
				hideNoCoursesMessage();
				clearGeneralErrorMessages();
				getConciergeCourses();
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
	function initializeShareAdoptionCheck_old() {
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
                    $('.card__body').css('display', 'none');
                    $('.materials-quantity-link').css('display', 'none');
                    $('.share-adoptions-component').css('display', 'block');
                    $('.non-share-adoptions-component').css('display', 'none');
                    $('.card__inner').removeClass('dropdown-card');
                    $('.share-adoptions-check').prop('checked', true);
            	}
            } else {
                $('#card-list-container').removeClass('share-adoptions-view');
                $('.card__body').css('display', 'block');
                $('.materials-quantity-link').css('display', 'block');
                $('.share-adoptions-component').css('display', 'none');
                $('.non-share-adoptions-component').css('display', 'block');
                $('.card__inner').addClass('dropdown-card');
                $('.share-adoptions-check').prop('checked', false);
            }
        });
    }

	function initializeShareAdoptionCheck() {
		$('#shareBtn').on('click', function (e) {
			e.preventDefault();
			if (isCourseCardLoading()) {

			}
			else if (courseCardsLoaded === 0) {
				bootbox.alert({
					title: 'No courses found.',
					message: "No course found to share adopted materials.",
					buttons: {
						'ok': {
							label: 'OK',
							className: 'btn-default pull-right button-background'
						}
					}
				}).find("div.modal-dialog").addClass("share-adoption-own-modal-dialog");
				return false;
			} else {
				$('.card__footer').css('display', 'none');
				$('.text-link').css('display', 'none');
				$('.layout-cards-grid').addClass('layout-card-grid-in-modal');
				$('.isbn-input').css('display', 'none');
				$('.quick-adopt-button').css('display', 'none');
				$('#card-list-container').addClass('share-adoptions-view');
				$('.share-adoptions-component').css('display', 'block');
				$('.non-share-adoptions-component').css('display', 'none');
				$('.card__body').css('display', 'none');
				$('.materials-quantity-link').css('display', 'none');
				$('.layout-cards-grid').find('h3').css('background', '#e4c873');
				$('.card__inner').removeClass('dropdown-card');
				$('.share-adoptions-check').prop('checked', true);
			}
		});
	}

    function toggleDepartmentTermSelects(isEnabled) {
		$('.intro').find(':input').attr('disabled', !isEnabled);
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
		}).insertAfter('.intro').show();
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
                var $coursesContainer = $('.layout-cards-grid');
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
                                $courseItem.find('.card__inner').attr('data-course-id', index);
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
		$('.card__inner').each(function(){
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
						var $courseContainer = $(this).parents('.card__inner');
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

		var $coursesContainer = $('.layout-cards-grid');
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
					$courseTile.find('.card__inner').attr('data-discipline-id', instructorCourse.disciplineId);
				}
			}

			$courseGroupingContainerThrobber.remove();
			toggleDepartmentTermSelects(true);
            toggleShareAdoptionView();


		}else if(courseCardsLoaded == 0 && coursesData == undefined){
			//var $courseGroupingContainer = $('.share-adoption-course-list');
				$courseGroupingContainerThrobber = ffd.showThrobber($courseGroupingContainer, 'appendTo');

			toggleDepartmentTermSelects(false);
			ajaxProcess = ffd.ajax({
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
                            $('#shareBtn').prop('checked', false);
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
								$courseTile.find('.card__inner').attr('data-discipline-id', instructorCourse.disciplineId);
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

		var $coursesContainer = $('.layout-cards-grid');
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
					$courseTile.find('.card__inner').attr('data-discipline-id', instructorCourse.disciplineId);
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
								$courseTile.find('.card__inner').attr('data-discipline-id', instructorCourse.disciplineId);
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


	function getConciergeCoursesOnScroll(isUsingDefaultDepartment){
		if(cachedCourses != undefined && cachedCourses.length > 0 && courseCardsLoaded> 0 && cachedCourses.length > courseCardsLoaded) {
			var $coursesContainer = $('.layout-cards-grid');
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
					var $article = $tile.find('card__inner');
					$article.addClass('concierge-card-data-holder');
                    renderShareAdoptionsCheckbox(course, $tile, count);
					var $tileHeader = $tile.find('.card__header');
					showConciergeCourseHeader(course, $tileHeader, count);
                    loadAndShowConciergeMaterials(course, $tile);
                    count++;
					var $contentHolder = $tile.find('.course-card-content-holder');
					$contentHolder.find('.card__prompt').detach();


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
		isCourseCardLoaded = false;
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
                    $('#shareBtn').prop('checked', false);
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
		var $coursesContainer = $('.layout-cards-grid');

		if (courses.length > defaultcourseCardValue) {
			courseCardsLoaded = defaultcourseCardValue;
		}else{
			courseCardsLoaded = courses.length;
		}

		for (var i = 0; i < courseCardsLoaded; i++) {
			(function(course) {
				var $tile = $courseItemTemplate.clone();
				var $article = $tile.find('.card__inner');
				//$article.addClass('concierge-card-data-holder');
                renderShareAdoptionsCheckbox(course, $tile, count);
				var $tileHeader = $tile.find('.card__header');
				showConciergeCourseHeader(course, $tileHeader, count);
                loadAndShowConciergeMaterials(course, $tile);
                count++;
				var $contentHolder = $tile.find('.course-card-content-holder');
				$contentHolder.find('.course-cta').detach();


				$contentHolder.removeClass('_display_none');
				$coursesContainer.append($tile);
			})(courses[i]);
		}
		isCourseCardLoaded = true;
		$coursesContainer.removeClass('_display_none');
	}

	function showConciergeCourseHeader(course, $headerContainer, count) {
		var $courseItemHeaderLink = $('<a/>', {'class':'course-header-link', href: ffd.paths.specificCourse.replace(':courseId',course.id), 'id' : 'coursecard-counter-' + count});
		$headerContainer.text('').append($courseItemHeaderLink);
		if(course.isSection === true) {
            $courseItemHeaderLink.append($('<h1/>', {'class': 'card__title', title: course.description, text: course.description}));
            $('<div/>', {'class': 'card__subtitle', title: course.shortName, text: course.shortName}).appendTo($courseItemHeaderLink);

		    $courseItemHeaderLink.append($('<span/>', {'class': 'card__subtitle', text: "INSTRUCTOR : "}));
            var $throbber = $('<div/>', {class: 'throbber-instructor'});

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
                    termId: course.termId
                },
                dataType: 'json',
                success: function(data) {
                    $throbber.remove();
                    var instructors_lastname = data.instructors_lastname.trim();
                    if( 'TBD' !== instructors_lastname && instructors_lastname.length <= 0) {
                        instructors_lastname = "TBD";
                    }

                    $courseItemHeaderLink.append($('<span/>', {'class': 'card__subtitle',  text: instructors_lastname,  title: instructors_lastname}));

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
            $courseItemHeaderLink.append($('<h1/>', {'class': 'card__title', title: course.description, text: course.description}));
            $('<div/>', {'class': 'card__subtitle', title: course.shortName, text: course.shortName}).appendTo($courseItemHeaderLink);
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
					if(data.error.type === "CourseTracks") {
						return showCourseMaterialError($tile, 'We are unable to load your course materials at this time. If this error persists, please contact your campus store.');
					}
					return showCourseMaterialError($tile);
				}
				$tile.removeClass('card--standout');
				$tile.removeClass('card--subject--empty');
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
			var $materialsList = $container.find('.card__body').addClass('_display_none');
			var $slogan = $container.find('.jumbo').addClass('_display_none');

			var isbn = $isbnInput.val()? $isbnInput.val().trim():'';
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
			if(isbn.length===13){
				var pattern = /^\d+$/;
				var isValid = pattern.test(isbn);
				if(!isValid) {
					return showQuickAdoptError({
						materialsList: $materialsList,
						slogan: $slogan,
						errorMessage: 'Invalid ISBN format. Please check ISBN.',
						container: $container
					});
				}
			}
            var $throbber = ffd.displayThrobberOverlayOverElement($(this));
			//var $throbber = ffd.showThrobber(this, 'appendTo');
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
					$quickAdoptButton.html('Adopt');
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
		$error.attr('style','display: block;padding-left: 60px;');
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
			var $lozengeContainer = $materialItem.find('.book__text-col');
			if (ffd.user.role === 'concierge') {
				$materialItem.addClass('small-material-cell');
				ffd.materialPromotedStatus(material.promotedStatus, $lozengeContainer);
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
			$shareAdoptionCourseInfo = $('<span/>', {'class': 'share-adoptions-component share-adoption-course-info', text: 'Nothing Required'});
	        //$shareAdoptionCourseInfo.insertBefore($container.find('.card__footer'));
			var $cardBody = $('<div/>',{'class':'card__body'});
			var $cardPrompt = $('<div/>',{'class':'card__prompt'});
			var $prompt = $('<div/>',{'class':'prompt'});
			var $promptHeader = $('<div/>', {'class': 'prompt__header'});
			$promptHeader.append($('<span/>', {style:'font-size:25px; padding-left:38px;', text: "Nothing Required"}));
			$prompt.append($promptHeader);
			$cardPrompt.append($prompt);
			$cardBody.append($cardPrompt);
			$container.append($cardBody);
			$container.find('.card__footer').insertAfter($cardPrompt);
			//$container.find('prompt__body').remove();
		} else {
			var $cardBody = $('<div/>',{'class':'card__body'});
			var $cardPrompt = $('<div/>',{'class':'card__prompt'});
			var $prompt = $('<div/>',{'class':'prompt'});
			var $promptHeader = $('<div/>', {'class': 'prompt__header'});
			var $tile = $container.parents('.card--subject');
			$tile.addClass('card--standout');
			$tile.addClass('card--subject--empty');
			$promptHeader.append($('<h2/>', {text: 'You haven’t adopted learning materials for this course yet'}));
			$promptHeader.append($('<p/>', {text: 'Click “Discover for this course” to find learning materials for this course.'}));
			$prompt.append($promptHeader);
			$cardPrompt.append($prompt);
			$cardBody.append($cardPrompt);
			$container.append($cardBody);
			$container.find('.card__footer').insertAfter($cardPrompt);
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
		if ((!disciplineId || disciplineId === '') && (itemCount===0)) {
			$courseItemTemplate.clone().addClass('card--standout');
			$courseItemTemplate.clone().addClass('card--subject--empty');

			var $cardPrompt = $container.find('.card__prompt');
			var $prompt = $container.find('.prompt');

			var $conciergeBottomContainer = $conciergeBottomContainerTemplate.clone();
			var $conciergeBottomContainerInner = $conciergeBottomContainerTemplateinner.clone();
			var $courseItemFooterLink = $conciergeBottomContainerInner.find('.stacked-items--link-btn');
			var $noMaterialLink = $('<a/>',{'class':'text-link',text:'I have no materials to adopt for this course',style:'margin-left:20px;',tabindex:0});
			$noMaterialLink.on('click',function(){
				setNothingRequired(course.id,$container );
			});
			var $promptBody = $('<div/>',{'class':'prompt__body'});
			var $subjectGroup = $('<div/>',{'class':'form-group'});
			var $disciplineGroup = $('<div/>',{'class':'form-group'});
			var $disciplineStyle = $('<div/>',{'class':'styled-select',id:'disciplineDiv_id'});
			var $subjectStyle = $('<div/>',{'class':'styled-select',id:'subjectDiv_id'});
			var $disciplineSelect = $('<select/>', {id: 'select-discipline',class:'form-control enableSubmit__input'});
			var $subjectSelect = $('<select/>', {'class': 'inactive form-control enableSubmit__input', disabled: true, id: 'select-subject'});



			$disciplineStyle.append($disciplineSelect);
			$disciplineGroup.append($disciplineStyle);
			$subjectStyle.append($subjectSelect);
			$subjectGroup.append($subjectStyle);
			$promptBody.append($disciplineGroup);
			$promptBody.append($subjectGroup);
			$prompt.append($promptBody);
			$cardPrompt.append($prompt);
			if(!(materialData.noMaterialsRequired === 'true' && itemCount === 0)) {
				$noMaterialLink.insertBefore($courseItemFooterLink.find('.cta'));
			}
			$conciergeBottomContainerInner.append($courseItemFooterLink);
			$conciergeBottomContainer.append($conciergeBottomContainerInner);

			buildDisciplineSelectBlock($conciergeBottomContainer,$promptBody, course.id);

			$cardPrompt.find('.prompt').append($promptBody);
			$container.append($conciergeBottomContainer);
			if(materialData.noMaterialsRequired != 'true') {
				$shareAdoptionCourseInfo = $('<span/>', {'class': 'share-adoptions-component share-adoption-course-info', text: '(' + itemCount + ' adopted materials)'});
				$container.append($shareAdoptionCourseInfo);
			}
			if(materialData.noMaterialsRequired === 'true' && itemCount >= 0) {
                $shareAdoptionCourseInfo = $('<span/>', {'class': 'share-adoptions-component share-adoption-course-info', text: '(' + itemCount + ' adopted materials)'});
				$container.append($shareAdoptionCourseInfo);
            }
			if((materialData.noMaterialsRequired === 'true' && itemCount === 0)){
				$container.find('.prompt__body').hide();
				$conciergeBottomContainerInner.find('a.cta').hide();
				$conciergeBottomContainerInner.find('a.materials-quantity-link').hide();
			}

		} else {
			$container.find('.prompt__body').detach();
			var isDiscoverRequired = true;
			if(materialData.materials && materialData.materials.length > 0){
				isDiscoverRequired = false;
			}
			var $conciergeBottomContainer = $conciergeBottomContainerTemplate.clone();
			var $conciergeBottomContainerInner = $conciergeBottomContainerTemplateinner.clone();
			if(isDiscoverRequired){
				var $discoverLink = $conciergeBottomContainerInner.find('a.cta');
				$discoverLink.attr('href', ffd.paths.discoverCourse.replace(':courseId', course.id));
				$discoverLink.removeClass('inactive').removeAttr('disabled');
				if ($materialsLink) {
					$materialsLink.insertBefore($discoverLink);
				}
				var $noMaterialLink = $('<a/>',{'class':'text-link',text:'I have no materials to adopt for this course',style:'margin-left:20px;',tabindex:0});
				$noMaterialLink.on('click',function(){
					setNothingRequired(course.id,$container );
				});

				$noMaterialLink.insertBefore($discoverLink);
			}
			var $courseItemFooterLink = $conciergeBottomContainerInner.find('.stacked-items--link-btn');
			if(!isDiscoverRequired){
				$conciergeBottomContainerInner.find('a.cta').hide();
				if ($materialsLink) {
					$courseItemFooterLink.append($materialsLink);
				}
			}

			if((materialData.noMaterialsRequired === 'true' && itemCount === 0)){
				$shareAdoptionCourseInfo = $('<span/>', {'class': 'share-adoptions-component share-adoption-course-info', text: 'No materials required'});
				$container.append($shareAdoptionCourseInfo);
				$conciergeBottomContainerInner.find('a.cta').hide();
				$conciergeBottomContainerInner.find('a.materials-quantity-link').hide();
				$conciergeBottomContainerInner.find('a.text-link').remove();
			}
				$conciergeBottomContainerInner.append($courseItemFooterLink);

			if(itemCount>=0) {
                $shareAdoptionCourseInfo = $('<span/>', {'class': 'share-adoptions-component share-adoption-course-info-congierge', text: '(' + itemCount + ' adopted materials)'});
                if(!(materialData.noMaterialsRequired === 'true' && itemCount === 0)) {
					$container.append($shareAdoptionCourseInfo);
                }
				$conciergeBottomContainer.append($conciergeBottomContainerInner);
                $container.append($conciergeBottomContainer);
            }
		}
	}

	function buildViewAllMaterialsLink(materialData, courseId) {
		var $viewAllMaterialsLink = $caretLinkTemplate.clone();
		var count = materialData.materials.length + materialData.supplies.length;                                       //-269 Changes
		$viewAllMaterialsLink.attr('href', ffd.paths.specificCourse.replace(':courseId', courseId)).removeClass('caret-link').addClass('text-link');
		$viewAllMaterialsLink.find('span').text('View all ' + count + ' materials');                                    //-269 Changes
		return $viewAllMaterialsLink;
	}

	function buildNoMaterialsRequiredLink() {
		var $noMaterialsRequiredLink = $caretLinkTemplate.clone();
		$noMaterialsRequiredLink.removeClass('caret-link');
		$noMaterialsRequiredLink.removeAttr('href');
		$noMaterialsRequiredLink.find('span').text('');
		return $noMaterialsRequiredLink;
	}

	function buildManageCourseLink(courseId) {
		var $manageLink = $manageCourseLinkTemplate.clone();
		var courseHref = $manageLink.attr('href').replace(':courseId', courseId);
		$manageLink.attr('href', courseHref);
		return $manageLink;
	}

	function buildDisciplineSelectBlock($cardFooter,$courseCtaBlock, courseId) {
		var $discoverLink = $cardFooter.find('.cta');
		$discoverLink.attr('href', ffd.paths.discoverCourse.replace(':courseId', courseId));

		var $disciplineSelect = $courseCtaBlock.find('#select-discipline');
		var	$subjectSelect = $courseCtaBlock.find('#select-subject');
		var $disciplineStyle = $courseCtaBlock.find('#disciplineDiv_id');
		var $subjectStyle = $courseCtaBlock.find('#subjectDiv_id');

		$('<label/>', {'for': 'select-discipline', text: 'Discipline'}).insertBefore($disciplineStyle);
		$('<label/>', {'for': 'select-subject', text: 'Subject'}).insertBefore($subjectStyle);
		$('<option/>', {value: 0, text: 'Select Discipline', selected: true}).appendTo($disciplineSelect);
		$('<option/>', {value: 0, text: 'Select Subject', selected: true}).appendTo($subjectSelect);

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
			var $courseContainer = $(this).parents('.card__inner');
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
		return Math.min(count, 3);                                                                                      //-269 Changes
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

        $("#attestationCloseButton").on("click",function() {
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
			var isNewLoginSession = sessionStorage.getItem(ffd.userData.bk_person_id);
			if(ffd.userData.isNewLogin && ffd.userData.isNewLogin === 'Y' && !isNewLoginSession){
				sessionStorage.setItem(ffd.userData.bk_person_id,'Y');
				//ffd.userData.isNewLogin = 'N';
             $('#modal-welcome-concierge').modal({
                  backdrop: 'static',
                  keyboard: false,
                  show: true
              });
              createTutorialWindowConcierge();
              setTimeout(function(){
                   $('#hiddenBtn').click();
              }, 500);
            }
        });

			setTimeout(function(){
				$('#attestationCloseButton').focus();
			}, 500);
		$("#cancelButton").blur(function() {
			$('#attestationCloseButton').focus();
		});
		$("#attestationCloseButton").blur(function() {
			$('#termCheck').focus();
		});
    }
    	              /*- 254 End */

// -479
    function toggleShareAdoptionView() {
          if ($('.shareBtn').is(':checked')) {
              $('#card-list-container').addClass('share-adoptions-view');
              $('.card__body').css('display', 'none');
			  $('.text-link').css('display', 'none');
              $('.materials-quantity-link').css('display', 'none');
              $('.share-adoptions-component').css('display', 'block');
              $('.non-share-adoptions-component').css('display', 'none');
              $('.card__inner').removeClass('dropdown-card');
              $('.share-adoptions-check').prop('checked', true);
          } else {
              $('#card-list-container').removeClass('share-adoptions-view');
              $('.card__body').css('display', 'block');
              $('.materials-quantity-link').css('display', 'block');
              $('.share-adoptions-component').css('display', 'none');
              $('.non-share-adoptions-component').css('display', 'block');
              $('.card__inner').addClass('dropdown-card');
              $('.share-adoptions-check').prop('checked', false);
          }
      }

    function renderShareAdoptionsCheckbox(course, $courseTile, count) {
          var $courseItemHeader = $courseTile.find('.card__inner');
          var $courseItemHeaderLink = $('<input/>', {'class':'share-adoptions-check share-adoptions-component', type: 'checkbox', value : course.sectionId + '/' + course.description,'id' : 'share-adoptions-check-' + count});
          //$courseItemHeader.append($courseItemHeaderLink);
          $courseItemHeaderLink.insertBefore($courseItemHeader.find('.course-card-content-holder'));
          if ($('.shareBtn').is(':checked')) {
               $('.card__body').css('display', 'none');
               $('.materials-quantity-link').css('display', 'none');
               $('.share-adoptions-component').css('display', 'block');
               $('.share-adoptions-check').prop('checked', true);
          } else {
                $('.card__body').css('display', 'block');
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
                  }).find("div.modal-dialog").addClass("share-adoption-own-modal-dialog");
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
			 	$("#email-list").val('');
			 	$('.layout-cards-grid').removeClass('layout-card-grid-in-modal');
                $('#card-list-container').removeClass('share-adoptions-view');
                $('.share-adoptions-component').css('display', 'none');
                $('.card__body').css('display', 'block');
			 	$('.text-link').css('display', 'block');
                $('.card__inner').addClass('dropdown-card');
			    $('.card__footer').css('display', '');
                $('#shareBtn').attr('checked', false);
                $('.materials-quantity-link').css('display', 'block');
                $('.non-share-adoptions-component').css('display', 'block');
			 	$('.isbn-input').css('display', 'block');
				$('.quick-adopt-button').css('display', 'block');
				 $('#updateBtn').focus();


		 });

		 $('#closeModalId').on('click', function() {
			 $("#email-list").val('');
			 $('.layout-cards-grid').removeClass('layout-card-grid-in-modal');
			 $('#card-list-container').removeClass('share-adoptions-view');
			 $('.share-adoptions-component').css('display', 'none');
			 $('.card__body').css('display', 'block');
			 $('.text-link').css('display', 'block');
			 $('.card__inner').addClass('dropdown-card');
			 $('.card__footer').css('display', '');
			 $('#shareBtn').attr('checked', false);
			 $('.materials-quantity-link').css('display', 'block');
			 $('.non-share-adoptions-component').css('display', 'block');
			 $('.isbn-input').css('display', 'block');
			 $('.quick-adopt-button').css('display', 'block');
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
        if  ($('.layout-cards-grid .throbber-container .throbber').length > 0)  {
            bootbox.alert({
                title: 'Course cards loading.',
                message: "Please wait till all course cards load properly.",
                buttons: {
                    'ok': {
                    label: 'OK',
                    className: 'btn-default pull-right button-background'
                    }
                }
            }).find("div.modal-dialog").addClass("share-adoption-own-modal-dialog");
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


	function setNothingRequired(courseId,$container) {
			var $this = $(this);
			var $noMaterialsLinkThrobber = ffd.showThrobber($container.find('.card__prompt'), 'appendTo');
			$this.addClass('inactive');
			ffd.ajax({
				url: ffd.paths.courseNoMaterialsRequired.replace(':courseId', courseId),
				type: 'POST',
				dataType: 'json',
				success: function() {
					var $cardBody = $('<div/>',{'class':'card__body'});
					var $cardPrompt = $('<div/>',{'class':'card__prompt'});
					var $prompt = $('<div/>',{'class':'prompt'});
					var $promptHeader = $('<div/>', {'class': 'prompt__header'});
					$promptHeader.append($('<span/>', {style:'font-size:25px; padding-left:38px;', text: "Nothing Required"}));
					$container.find('.card__body').remove();
					$container.parents('.card--subject').removeClass('card--standout');
					$container.parents('.card--subject').removeClass('card--subject--empty');
					$container.find('.text-link').remove();
					$container.find('a.cta').hide();
					$container.find('span.share-adoptions-component.share-adoption-course-info-congierge').text('No materials required');
					$prompt.append($promptHeader);
					$cardPrompt.append($prompt);
					$cardBody.append($cardPrompt);
					$cardBody.insertBefore($container.find('.card__footer'));
				},
				error: function() {
					$('<p/>', {
						'class': 'error-msg-top',
						text: 'Unable to change course'
					}).insertAfter($pageTitle).show();
					$this.removeClass('inactive');
					$noMaterialsLinkThrobber.remove();
				},
				complete: function() {
					$noMaterialsLinkThrobber.remove();
				}
			});
	}

	function showCourseMaterialError(currentCourseBlock, errorText) {
		var currentCourseBlockHeader = currentCourseBlock.find('.course-card-content-holder');
		if (!errorText) {
			errorText = 'Unable to get materials';
		}

		var $cardBody = $('<div/>',{'class':'card__body'});
		currentCourseBlockHeader.append($('<p/>', {
			'class': 'error-msg-no-material-found',
			text: errorText,
			'style' :'display: block'
		}));
		var $courseItemFooter = $('<div/>',{'class':'card__footer'});
		var $courseItemFooterInner = $('<div/>',{'class':'inner'});
		var $courseItemFooterLink = $('<div/>',{'class':'stacked-items--link-btn'});
		$courseItemFooterInner.append($courseItemFooterLink);
		$courseItemFooter.append($courseItemFooterInner);
		currentCourseBlockHeader.append($cardBody);
		currentCourseBlockHeader.append($courseItemFooter);
	}

    function createTutorialWindowConcierge() {
        var role = ffd.user.role;

        // welcome slide population

        var welcomeContent = onboardTutorialData.role[role].welcome_page;
        $onboardWelcomeModalConcierge.find('.slide__title').text(welcomeContent.title);
        var $welcomeImage = $onboardWelcomeModalConcierge.find('.slide__bannerImage');
        $welcomeImage.attr('src',welcomeContent.src);
        $welcomeImage.on("load",function(){
            $(this).css('border', "solid 2px black");
        })
        var $text = $.parseHTML(welcomeContent.content);
        $onboardWelcomeModalConcierge.find('.slide__content.prose.prose-large.contained-block').text('');
        $onboardWelcomeModalConcierge.find('.slide__content.prose.prose-large.contained-block').append($text);
//        $('#modal-welcome-footer').css('height' , "700px");

        var pageContent = onboardTutorialData.role[role].tutorial_slide;
        var $slide = $onboardModalConcierge.find('#onboardSlidesConcierge').detach();
        for(var i=0;i<pageContent.length;i++){
            var $cloneSlide = $slide.clone();
            $cloneSlide.attr('id',i+1);
            $cloneSlide.find('.slide__title').text(pageContent[i].title);
            var $image = $cloneSlide.find('.img-col.col-stack-xs').find('img');
            $image.attr('src',pageContent[i].src);
            $image.on("load",function(){
            $(this).css({
                    border: "solid 2px black",
                    width: "600px"
                    });
            })
            var $text = $.parseHTML(pageContent[i].content);
            $cloneSlide.find('.prose.contained-block').text('');
            $cloneSlide.find('.prose.contained-block').append($text);
//            $('.text-col.col-stack-xs').css('width' , "200px");
            $onboardModalConcierge.find('.slider.with-dots.welcome-slider').append($cloneSlide);
        }
        $('#begin_tour_concierge').on("click",function(){
            $('.slick-dots').show();
            $('.slick-dots').find('.slick-active').prev().hide();
        })

        $('#hiddenBtn').on("click",function(){
                $('.slick-dots').hide();
        })

        $('.btn.btn-primary.btn-wide.slick-next').on("click",function(){
            $('.slick-dots').find('.slick-active').next().find('button').click();
            if(JSON.parse($('.slick-track').find('.slick-active').attr('id')) === pageContent.length){
				$('.slick-track').find('.slick-active').find('.slide__footer').find('.btn-primary.btn-wide.slick-next').text('Close');
				$('.slick-track').find('.slick-active').find('.slide__footer').find('.text-link').addClass('_display_none');
				$('.slick-track').find('.slick-active').find('.slide__footer').find('.btn-primary.btn-wide.slick-next').attr('id','close3');
            }/*else{
                $('.slick-track').find('.slick-active').find('.slide__footer').removeClass('_display_none');
            }*/
			$('#close3').on("click",function(){
				$onboardModalConcierge.modal('hide');
			})
        })
    }


})();


/*	$( document.body).mousedown(function() {
 alert( "Handler for .mousedown() called." );
 });

 $( "#main-content-container" ).mouseup(function() {
 alert( "Handler for .mouseup() called." );
 });*/