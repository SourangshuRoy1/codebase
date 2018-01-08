(function(){
	var isError = false,
	     isbnList = [],                 // -479
         materialCourseList = [],       // -479
		isCurrentTerm = false,
		isDisciplineSelected = false,
		isSubjectSelected = false,
		isStudentsPage = false,
		ajaxProcess,
		$courseCardContentHolder,
		$materialLink,
		coursesData,
		$cardList,
		$viewAllMaterialsLink,
		$shareAdoptionCourseInfo,
		disciplinesData = ffd.subjectsByDiscipline,
		ctStatusMessageMap = ffd.ctStatusMessageMap,
		coursesIdArray,
		termId,
		path,
		userCourses,
		$courseGroupingContainerThrobber,
		courseItemHeaderThrobbers = {},
		onboardTutorialData = ffd.onboardTutorial,
		$onboardModalInstructor = $('#modal-welcome-instructor'),
        $onboardSlideModalInstructor = $('#onboardSlidesInstructor'),
        $onboardWelcomeModalInstructor = $('#welcomeSlideInstructor'),
		isCourseCardLoaded=false;

	$(function(){

		$('body').addClass('my-courses');
		$('.term').find('h2').remove();
		$cardList = $('.layout-cards-grid');
		$cardList.find('li.col-md-4.col-sm-6.col-xs-12').remove();

		var materialTitle = localStorage.getItem('manageAdoptionMatAdopted');
		if(materialTitle){
			$('.banner-alert.is-success').removeClass('_display_none');
			var $statusMessage = $('.banner-alert.is-success').find('.banner-alert__text-col.prose.contained-block').find('p');
			$statusMessage.find('strong').text("Your Request to adopt "+materialTitle+" was successfully submitted.");
			//localStorage.setItem('manageAdoptionMatAdopted', '');
			localStorage.removeItem('manageAdoptionMatAdopted');
		}

        if (ffd.user.role !== 'administrator') {
		  if(ffd.customer.adoptionTermsAndConditions === 'true' && ffd.userData.adoptionTermsAndConditions !== 'true' ) {
               getTermsAndConditionsWindow();
              }
		}

		if (!ffd.isStudent) {
		    $('#myCourses').addClass('active');
		}

		if (ffd.user.role !== 'concierge') {
			$('#deptDiv').remove();
			$('#department-dropdown').remove();
		}

		new ffd.TermSelectBuilder().buildTermsSelect($('#term-dropdown'), ffd.terms, ffd.user.termId);
		termId = $('#term-dropdown').val();

		initializeTermDepartmentChange();
		// -479
		if(!ffd.isStudent) {
            sendRecipient();
            clearAllCourse();
            selectAllCourse();
            initializeShareAdoptionCheck();
       }

		var loadCourseParams = null;

		if (ffd.user.role === 'concierge') {
			var departmentIndex = $('#department-dropdown').val();
			var department = ffd.user.departments[departmentIndex];
			var path = ffd.paths.conciergeCourses;
			loadCourseParams = {
				divisionId: department.divisionId,
				departmentId: department.id,
				termId: termId
			}
		} else {
			path = ffd.paths.myCoursesJson.replace(':termId', termId);
		}

		if(ffd.isStudent) {
		    $('#studentMyCourse').addClass('active');
			$('body').addClass('student-courses');
			$('.shopping-list-button').hide();
			isStudentsPage = true;
			$('.purchase-all-button').on('click', onPurchaseAllButtonClick);
			if(ffd.realm === 'yuba')
			{
			$('.purchase-all-button-az').on('click', onPurchaseAllButtonClick);
			$('.shopping-list-button').show();
			$('.shopping-list-button').on('click', onShoppingListButtonClick);
			}

		}
		var $courseGroupingContainer = $('#card-list-container');
		$courseGroupingContainerThrobber = ffd.showThrobber($courseGroupingContainer, 'appendTo');

		getCourses(path, loadCourseParams);
		$('form.intro').on('submit', function(e){
			e.preventDefault();
			if (ajaxProcess && ajaxProcess.readystate !== 4) {
				ajaxProcess.abort();
			}
			$cardList = $('.layout-cards-grid');
			$cardList.empty();
			// -479
			if(!ffd.isStudent){
			    $courseGroupingContainer = $('#card-list-container');
				$('#card-list-container').removeClass('share-adoptions-view');
				$('.share-adoptions-component').css('display', 'none');
			}
			$courseGroupingContainerThrobber = ffd.showThrobber($courseGroupingContainer, 'appendTo');
			if (ffd.user.role === 'concierge') {
				var path = ffd.paths.conciergeCourses;
				var departmentIndex = $('#department-dropdown').val();
				var department = ffd.user.departments[departmentIndex];
				var termId = $('#term-dropdown').val();
				var loadCourseParams = {
					divisionId: department.divisionId,
					departmentId: department.id,
					termId: termId
				};

				getCourses(path, loadCourseParams);
			} else {
				return getCourses(ffd.paths.myCoursesJson.replace(':termId', $('#term-dropdown').val()));
			}
		});
	});

	function initializeTermDepartmentChange() {
		var cookieHelper = new ffd.Cookie();

		$('#term-dropdown').on('change', function() {
			cookieHelper.setTerm($(this).val());
		});

		$('#department-dropdown').on('change', function() {
			var index = $(this).val();
			var department = ffd.user.departments[index];
			cookieHelper.setDepartment(department.id);
		});
	}
// -479
	function initializeShareAdoptionCheck() {
        $('#shareBtn').on('click', function(e) {
			e.preventDefault();
			isCourseCardLoading();
               	if (userCourses.length === 0) {
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
                }  else {
					$('.card__footer').css('display', 'none');
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
// -479
    function toggleShareAdoptionView() {
        if ($('#shareBtn').is(':checked')) {
            $('#card-list-container').addClass('share-adoptions-view');
            $('.share-adoptions-component').css('display', 'block');
            $('.non-share-adoptions-component').css('display', 'none');
            $('.card__body').css('display', 'none');
            $('.materials-quantity-link').css('display', 'none');
            $('.layout-cards-grid').find('h3').css('background', '#e4c873');
            $('.card__inner').removeClass('dropdown-card');
            $('.share-adoptions-check').prop('checked', true);
        } else {
            $('#card-list-container').removeClass('share-adoptions-view');
            $('.share-adoptions-component').css('display', 'none');
            $('.non-share-adoptions-component').css('display', 'block');
            $('.card__body').css('display', 'block');
            $('.materials-quantity-link').css('display', 'block');
            $('.layout-cards-grid').find('h3').css('background', '#fff0d4');
            $('.card__inner').addClass('dropdown-card');
            $('.share-adoptions-check').prop('checked', false);
        }
    }

    function displayThrobberOverlay($element) {
	    var height = $element.outerHeight();
	    var width = $element.outerWidth();
	    $element.css({'font-size': 0,height:34});
	    //var $throbber = $('<div/>', {class: 'throbber-container'}).html($('<div/>', {class: 'throbber'}));

	     $thContainer = $('<div/>', {class: 'throbber-container'});
         $thContainer.css({width:width, height: 20, margin: '5px 0'});
         var $throbber = $thContainer.html($('<div/>', {class: 'throbber',id:'throbber_purchase'}));

	    return $throbber.appendTo($element);
    }

	function onPurchaseAllButtonClick() {
		var $purchaseAllThrobber;
		//var $setElement = $(this).innerHTML;
		//$purchaseAllThrobber = ffd.displayThrobberOverlayOverElement($(this));
		$purchaseAllThrobber = displayThrobberOverlay($(this));
		var termId = $('#term-dropdown').val();
		var purchaseButton = $('#purchaseAllBtn');
		ffd.ajax({
			type: 'POST',
			contentType: 'application/json; charset=utf-8',
			url: ffd.paths.purchaseMaterial,
			data: {
				failReturnUrl: ffd.createFailReturnUrl(null, termId),
				termId: termId
			},
			dataType: 'json',
			success: function(data) {
				if (data.error || !data.form) {
					window.location.href = ffd.paths.purchaseMaterial + '?termId=' + termId;
					return;
				}
				ffd.createAndPostForm(data.form);
			},
			error: function(error){
				window.location.href = ffd.paths.purchaseMaterial + '?termId=' + termId;
			},
			complete: function() {
				$purchaseAllThrobber.remove();
                purchaseButton.css({'font-size': 15});

			}
		});
	}

	function getCourses(path, params) {
		coursesIdArray = [];
		isCourseCardLoaded=false;
		ajaxProcess = ffd.ajax({
			type: 'GET',
			url: path,
			dataType: 'json',
			data: (params ? params : null),
			success: function(data) {
				if(data.error) {$cardList.empty(); return ffd.showMessage('Unable to get courses', 'error-msg-top', $cardList);}
				coursesData = data;
				if (isStudentsPage) {
					userCourses = coursesData.student_courses;
				} else {
					if (coursesData.instructor_courses) {
						userCourses = coursesData.instructor_courses;
					} else {
						userCourses = coursesData.courses;
					}
                    // -479
					if(userCourses.length === 0 ){
						isCourseCardLoaded=true;
                        $('#checkboxField').addClass('_display_none_checkbox');
                        if ($('.share-adoption-check').is(':checked')) {
                            $('.share-adoption-check').prop('checked', false);
                        }
                    } else {
                        $('#checkboxField').removeClass('_display_none_checkbox');
                        //$('#checkboxField').addClass('_remove_float_left');
                    }

				}
				if ($('#term-dropdown').find('option:selected').hasClass('current-terms')) {
					isCurrentTerm = true;
				} else {
					isCurrentTerm = false;
				}
				if(userCourses.length <= 0) {
					$cardList.empty();
					var selectedTermName = $('#term-dropdown').find('option:selected').text();
					$cardList.append($('<p/>', {'class': 'alert-message', text: 'No courses found for '+selectedTermName}));
					$('#card-list-container').removeClass('share-adoptions-view');
                    $('.share-adoptions-component').css('display', 'none');
				}
				for(var i = 0; i < userCourses.length; i++) {
					var instructorCourse = userCourses[i];
					if(typeof(instructorCourse) !== 'object') {$cardList.empty(); return ffd.showMessage('Unable to get courses', 'error-msg-top', $cardList);}
					var $courseItemContainer = $('<div/>');
					var $courseItem = $('<div/>', {'class':'card card--subject', 'id':'card-subject'+i});
					var $courseCardDataHolder  = $('<div/>', {'class': 'card__inner', 'data-course-id': instructorCourse.id}).appendTo($courseItem);
					var $courseCardTitle = $('<h1/>',{'class':'card__title','style':'word-wrap: break-word; white-space: normal;',title: instructorCourse.description, text: instructorCourse.description});
					var $courseCardSubTitle = $('<div/>',{'class':'card__subtitle',title: instructorCourse.shortName, text: instructorCourse.shortName});
					var courseItemHeader = $('<div/>',{'class':'card__header'}).appendTo($courseCardDataHolder);
					var $courseItemHeaderLink = $('<a/>', {'class':'course-header-link', href: ffd.paths.specificCourse.replace(':courseId', instructorCourse.id)});
					courseItemHeader.text('').append($courseItemHeaderLink);
					$courseItemHeaderLink.append($courseCardTitle);
					$courseCardSubTitle.appendTo($courseItemHeaderLink);
					if (!isStudentsPage || !ffd.isStudent) {
                        var $courseItemShareAdoptionsLink = $('<input/>', {'class':'share-adoptions-check share-adoptions-component', type: 'checkbox', value : instructorCourse.sectionId + '/' + instructorCourse.description});
                        $courseItemShareAdoptionsLink.appendTo($courseCardDataHolder);
                        if ($('.share-adoption-check').is(':checked')) {
                               $('.card__body').css('display', 'none');
                               $('.share-adoptions-component').css('display', 'block');
                              //$('.share-adoptions-check').attr('checked', 'true');
                               $('.share-adoptions-check').prop('checked', true);
                        } else {
                               $('.card__body').css('display', 'block');
                               $('.share-adoptions-component').css('display', 'none');
                               //$('.share-adoptions-check').attr('checked', 'false');
                               $('.share-adoptions-check').prop('checked', false);
                         }

                    }
					$courseCardContentHolder = $('<div/>', {'class':'course-card-content-holder _display_none'}).appendTo($courseCardDataHolder);
					courseItemHeaderThrobbers[i] = ffd.showThrobber(courseItemHeader, 'insertAfter');
					$courseCardContentHolder.append($('<div/>', {'class': 'card__body'}));

					if (!isStudentsPage) {
						//$('<div/>', {'class': 'course-cta'}).append($('<a/>', {'class':'cta', href: ffd.paths.discoverCourse.replace(':courseId', instructorCourse.id), text:'Discover for this course'})).appendTo($courseCardContentHolder);
					}
					$courseItemContainer.append($courseItem);
					$cardList.append($courseItemContainer);
					$cardList.find('.course-card-content-holder').addClass('_display_none');
					$cardList.removeClass('_display_none');
					coursesIdArray.push(instructorCourse.id);
					if(instructorCourse.disciplineId) {
						$courseCardDataHolder.attr('data-discipline-id', instructorCourse.disciplineId);
					}
				}
			},
			error: function(error) {
				if(error.status === 0) {
					return false;
				}
				isError = true;
				$cardList.empty();
				ffd.showMessage('Unable to get courses', 'error-msg-top', $cardList);
			},
			complete: function() {
				$courseGroupingContainerThrobber.remove();
				courseItemHeaderThrobbers = {};
				if (!isError) {
                    isbnList = [];
					getMaterialsByCourseId(userCourses);
				}

			}
		});
	}

	function getMaterialsByCourseId(userCourses) {
		$.each(coursesIdArray, function(index){
			var $currentCourseBlock;
			ffd.ajax({
				type: 'GET',
				url: ffd.paths.adoptedCourseMaterialsJson.replace(':courseId', coursesIdArray[index]),
				dataType: 'json',
				success: function(data) {
				    var currentCourseIdData;
					if(data.error) {
						if(data.error.type === "CourseTrack") {
							ffd.showCourseMaterialError($('.layout-cards-grid').find('[data-course-id="' + coursesIdArray[index] + '"]'), 'We are unable to load your course Materials at this time. If this error Persists, please contact your Campus store.');
							return;
						}
						ffd.showCourseMaterialError($('.layout-cards-grid').find('[data-course-id="' + coursesIdArray[index] + '"]'));
						return;
					}
					$('.card__inner').each(function(){
						$currentCourseBlock = $(this);
						$courseCardContentHolder = $currentCourseBlock.find('.course-card-content-holder');
						if ($currentCourseBlock.attr('data-course-id') === coursesIdArray[index]) {
							var disciplineId = $currentCourseBlock.data('discipline-id');
							var $matList = $currentCourseBlock.find('.card__body');
							var $discoverLink;
							if (!isStudentsPage) {
								var $selectHolder = $currentCourseBlock.find('.course-cta');
								$discoverLink = $currentCourseBlock.find('.cta');
								//if (!isCurrentTerm) {
								//	$discoverLink.remove();
								//}
							}
							var currentCourseId = $currentCourseBlock.attr('data-course-id');
							currentCourseIdData = currentCourseId;
							var ctResponseDetails = ffd.getCtResponseDetails(data.sectionAdoptionStatus,isStudentsPage);
							if ((ctResponseDetails.showMaterials === 'true') || !isStudentsPage || (typeof data.sectionAdoptionStatus === 'undefined')) {
								if(data.materials && data.materials.length > 0 && data.supplies.length === 0) {         // -269 Change
									var $materialItem;
									var $materialSummary;
									var $materialImageSection;
									var $materialTextSection;
									var maxAmountOfMaterialsToRender = 3;
										//disciplineId && disciplineId !== '' ? 3 : 1;
									for(var i = 0; i < data.materials.length && i < maxAmountOfMaterialsToRender; i++) {
										$materialItem = $('<div/>',{'class':'card__body__content'});
										$materialSummary = $('<div/>',{'class':'book book--summary'});
										var materialData = data.materials[i];
										if(isStudentsPage) {
											maxAmountOfMaterialsToRender = 3;
											if (materialData.fasrAuthorized) {
												$materialLink = $('<a/>', {href : '#', title: materialData.title, 'class': 'fasr-access', 'data-id': materialData.isbn13});
												$materialLink.parent('<div/>').addClass('access-container');
											} else if (materialData.actionButton && materialData.actionButton.label && materialData.actionButton.label === 'Access') {
												$materialLink = $('<a/>', {href : materialData.actionButton.url, title: materialData.title});
											} else if (materialData.url) {
												$materialLink = $('<a/>', {href : materialData.url, title: materialData.title});
											} else {
												$materialLink = $('<a/>', {href : ffd.paths.specificCourse.replace(':courseId', currentCourseId), title: materialData.title});
											}
										} else {
											$materialLink = $('<a/>', {href : ffd.paths.courseMaterialDetails.replace(':courseId', currentCourseId).replace(':materialId', materialData.isbn13), title: materialData.title});
										}
										$materialImageSection = $('<div/>',{'class':'book__image-col'});
										$materialImageSection.append($('<img/>', {src: materialData.image || '/img/no-cover.png', alt: materialData.title,class:'book__image', style:'max-height: 80px'})).appendTo($materialLink);
										$materialSummary.append($materialImageSection);
										$materialTextSection = $('<div/>',{'class':'book__text-col'});
										$materialTextSection.append($('<h4/>', {class:'book__title', style:'word-wrap: break-word;',text: materialData.title || ffd.defaultMaterialTitle})).appendTo($materialLink);
										if(!isStudentsPage) {
											ffd.materialPromotedStatus(materialData.promotedStatus, $materialTextSection);
										}
										$materialSummary.append($materialTextSection);
										$materialLink.append($materialSummary);
										$materialItem.append($materialLink);
										$matList.append($materialItem);
									}
									if (isStudentsPage) {
										$currentCourseBlock.find('.fasr-access').on('click', function(e){
											e.preventDefault();
											initializeFasrAccessClick($(this));
										});
									}

									if(!isStudentsPage) {
										$shareAdoptionCourseInfo = $('<span/>', {'class': 'share-adoptions-component share-adoption-course-info', text: '(' + (data.materials.length + data.supplies.length) + ' adopted materials)'});
										$shareAdoptionCourseInfo.insertAfter($matList);
									}

									if (data.materials.length === 1) {
										var $courseItemFooter = $('<div/>',{'class':'card__footer'});
										var $courseItemFooterInner = $('<div/>',{'class':'inner'});
										if(!isStudentsPage) {
											var $discoverMaterial = $('<a/>', {
												'class': 'btn btn-block btn-primary',
												href: ffd.paths.discoverCourse.replace(':courseId', coursesIdArray[index]),
												text: 'Discover for this course'
											});
											$courseItemFooterInner.append($discoverMaterial);
											$discoverMaterial.on('click', function(e){
												addThrobber($discoverMaterial);
											});
										}
										$courseItemFooter.append($courseItemFooterInner);
										$courseItemFooter.insertAfter($matList);
									}
									if (data.materials.length > 1) {
										var $courseItemFooter = $('<div/>',{'class':'card__footer'});
										var $courseItemFooterInner = $('<div/>',{'class':'inner'});
										var $courseItemFooterLink = $('<div/>',{'class':'stacked-items--link-btn'});
										var $viewAllMaterial = $('<a/>',{'class':'text-link',href: ffd.paths.specificCourse.replace(':courseId', currentCourseId)}).append($('<span/>', {text: 'View all ' + data.materials.length + ' materials'}));
										$courseItemFooterLink.append($viewAllMaterial);
										if(!isStudentsPage) {
											var $discoverMaterial = $('<a/>', {
												'class': 'btn btn-block btn-primary',
												href: ffd.paths.discoverCourse.replace(':courseId', coursesIdArray[index]),
												text: 'Discover for this course'
											});
											$courseItemFooterLink.append($discoverMaterial);
											$discoverMaterial.on('click', function(e){
												addThrobber($discoverMaterial);
											});
										}
										$courseItemFooterInner.append($courseItemFooterLink);
										$courseItemFooter.append($courseItemFooterInner);
										$courseItemFooter.insertAfter($matList);
                                    }
								//------------------ -269 Start -----------------------
								} else if (data.materials && data.materials.length > 0 && data.supplies && data.supplies.length > 0) {var $materialItem;
									var $materialSummary;
									var $materialImageSection;
									var $materialTextSection;
									var matCount = 0;
									var maxAmountOfMaterialsToRender = 3;
										//disciplineId && disciplineId !== '' ? 3 : 1;
									for(var i = 0; i < data.materials.length && i < maxAmountOfMaterialsToRender; i++) {
										$materialItem = $('<div/>',{'class':'card__body__content'});
										$materialSummary = $('<div/>',{'class':'book book--summary'});
										var materialData = data.materials[i];
										if(isStudentsPage) {
											maxAmountOfMaterialsToRender = 3;
											if (materialData.fasrAuthorized) {
												$materialLink = $('<a/>', {href : '#', title: materialData.title, 'class': 'fasr-access', 'data-id': materialData.isbn13});
												$materialLink.parent('<div/>').addClass('access-container');
											} else if (materialData.actionButton && materialData.actionButton.label && materialData.actionButton.label === 'Access') {
												$materialLink = $('<a/>', {href : materialData.actionButton.url, title: materialData.title});
											} else if (materialData.url) {
												$materialLink = $('<a/>', {href : materialData.url, title: materialData.title});
											} else {
												$materialLink = $('<a/>', {href : ffd.paths.specificCourse.replace(':courseId', currentCourseId), title: materialData.title});
											}
										} else {
											$materialLink = $('<a/>', {href : ffd.paths.courseMaterialDetails.replace(':courseId', currentCourseId).replace(':materialId', materialData.isbn13), title: materialData.title});
										}
										$materialImageSection = $('<div/>',{'class':'book__image-col'});
										$materialImageSection.append($('<img/>', {src: materialData.image || '/img/no-cover.png', alt: materialData.title,class:'book__image', style:'max-height: 80px'})).appendTo($materialLink);
										$materialSummary.append($materialImageSection);
										$materialTextSection = $('<div/>',{'class':'book__text-col'});
										$materialTextSection.append($('<h4/>', {class:'book__title', style:'word-wrap: break-word;',text: materialData.title || ffd.defaultMaterialTitle})).appendTo($materialLink);
										if(!isStudentsPage) {
											ffd.materialPromotedStatus(materialData.promotedStatus, $materialTextSection);
										}
										$materialSummary.append($materialTextSection);
										$materialLink.append($materialSummary);
										$materialItem.append($materialLink);
										$matList.append($materialItem);
										matCount++;
									}

									if (matCount < 3) {
										var maxAmountOfSuppliesToRender = 3 - matCount;
										var $supplyItem;
										for(var i = 0; i < data.supplies.length && i < maxAmountOfSuppliesToRender; i++) {
											$supplyItem = $('<div/>',{'class':'card__body__content'});
											$materialSummary = $('<div/>',{'class':'book book--summary'});
											var supplyData = data.supplies[i];
											if(isStudentsPage) {
												$materialLink = $('<a/>', {href : ffd.paths.specificCourse.replace(':courseId', currentCourseId), title: supplyData.name});
											} else if (disciplineId && disciplineId !== ''){    //-269
												$materialLink = $('<a/>', {href : ffd.paths.courseMaterialDetails.replace(':courseId', currentCourseId).replace(':materialId', supplyData.supplyId), title: supplyData.name});
											}
											if(isStudentsPage || (!isStudentsPage  && disciplineId && disciplineId !== '')) {    //-269
												$materialImageSection = $('<div/>',{'class':'book__image-col'});
												$materialImageSection.append($('<img/>', {src: supplyData.image || '/img/no-cover.png', alt: supplyData.name,class:'book__image', style:'max-height: 80px'})).appendTo($materialLink);
												$materialSummary.append($materialImageSection);
												$materialTextSection = $('<div/>',{'class':'book__text-col'});
												$materialTextSection.append($('<h4/>', {class:'book__title', style:'word-wrap: break-word;',text: supplyData.name || ffd.defaultMaterialTitle})).appendTo($materialLink);
												if(!isStudentsPage){
													ffd.materialPromotedStatus(supplyData.promotedStatus, $materialTextSection);
												}
												$materialSummary.append($materialTextSection);
												$materialLink.append($materialSummary);
												$supplyItem.append($materialLink);
												$matList.append($supplyItem);
											}
										}
									}
									if (isStudentsPage) {
										$currentCourseBlock.find('.fasr-access').on('click', function(e){
											e.preventDefault();
											initializeFasrAccessClick($(this));
										});
									}
									var noOfItems = data.materials.length + data.supplies.length;
									if(!isStudentsPage) {
										$shareAdoptionCourseInfo = $('<span/>', {'class': 'share-adoptions-component share-adoption-course-info', text: '(' + noOfItems + ' adopted materials)'});
										$shareAdoptionCourseInfo.insertAfter($matList);
									}
									if (noOfItems === 1) {
										var $courseItemFooter = $('<div/>',{'class':'card__footer'});
										var $courseItemFooterInner = $('<div/>',{'class':'inner'});
										if(!isStudentsPage) {
											var $discoverMaterial = $('<a/>', {
												'class': 'btn btn-block btn-primary',
												href: ffd.paths.discoverCourse.replace(':courseId', coursesIdArray[index]),
												text: 'Discover for this course'
											});
											$courseItemFooterInner.append($discoverMaterial);
											$discoverMaterial.on('click', function(e){
												addThrobber($discoverMaterial);
											});
										}
										$courseItemFooter.append($courseItemFooterInner);
										$courseItemFooter.insertAfter($matList);
									}
									if (noOfItems > 1) {
										var $courseItemFooter = $('<div/>',{'class':'card__footer'});
										var $courseItemFooterInner = $('<div/>',{'class':'inner'});
										var $courseItemFooterLink = $('<div/>',{'class':'stacked-items--link-btn'});
										var $viewAllMaterial = $('<a/>',{'class':'text-link',href: ffd.paths.specificCourse.replace(':courseId', currentCourseId)}).append($('<span/>', {text: 'View all ' + noOfItems + ' materials'}));
										$courseItemFooterLink.append($viewAllMaterial);
										if(!isStudentsPage) {
											var $discoverMaterial = $('<a/>', {
												'class': 'btn btn-block btn-primary',
												href: ffd.paths.discoverCourse.replace(':courseId', coursesIdArray[index]),
												text: 'Discover for this course'
											});
											$courseItemFooterLink.append($discoverMaterial);
											$discoverMaterial.on('click', function(e){
												addThrobber($discoverMaterial);
											});
										}
										$courseItemFooterInner.append($courseItemFooterLink);
										$courseItemFooter.append($courseItemFooterInner);
										$courseItemFooter.insertAfter($matList);
									}
                                } else if (data.supplies && data.supplies.length > 0 && data.materials.length === 0) {
									var $supplyItem;
									var $materialSummary;
									var $materialImageSection;
									var $materialTextSection;
									var maxAmountOfMaterialsToRender = 3;
										//disciplineId && disciplineId !== '' ? 3 : 1;
									for(var i = 0; i < data.supplies.length && i < maxAmountOfMaterialsToRender; i++) {
										$supplyItem = $('<div/>',{'class':'card__body__content'});
										$materialSummary = $('<div/>',{'class':'book book--summary'});
										var supplyData = data.supplies[i];
										if(isStudentsPage) {
											maxAmountOfMaterialsToRender = 3;
											$materialLink = $('<a/>', {href : ffd.paths.specificCourse.replace(':courseId', currentCourseId), title: supplyData.name});
										} else {
											$materialLink = $('<a/>', {href : ffd.paths.courseMaterialDetails.replace(':courseId', currentCourseId).replace(':materialId', supplyData.supplyId), title: supplyData.name});
										}
										$materialImageSection = $('<div/>',{'class':'book__image-col'});
										$materialImageSection.append($('<img/>', {src: supplyData.image || '/img/no-cover.png', alt: supplyData.name,class:'book__image', style:'max-height: 80px'})).appendTo($materialLink);
										$materialSummary.append($materialImageSection);
										$materialTextSection = $('<div/>',{'class':'book__text-col'});
										$materialTextSection.append($('<h4/>', {class:'book__title', style:'word-wrap: break-word;',text: supplyData.name || ffd.defaultMaterialTitle})).appendTo($materialLink);
										if(!isStudentsPage){
											ffd.materialPromotedStatus(supplyData.promotedStatus, $materialTextSection);
										}
										$materialSummary.append($materialTextSection);
										$materialLink.append($materialSummary);
										$supplyItem.append($materialLink);
										$matList.append($supplyItem);
									}
									if(!isStudentsPage) {
										$shareAdoptionCourseInfo = $('<span/>', {'class': 'share-adoptions-component share-adoption-course-info', text: '(' + (data.supplies.length) + ' adopted materials)'});
										$shareAdoptionCourseInfo.insertAfter($matList);
									}
									if (data.supplies.length === 1) {
										var $courseItemFooter = $('<div/>',{'class':'card__footer'});
										var $courseItemFooterInner = $('<div/>',{'class':'inner'});
										if(!isStudentsPage) {
											var $discoverMaterial = $('<a/>', {
												'class': 'btn btn-block btn-primary',
												href: ffd.paths.discoverCourse.replace(':courseId', coursesIdArray[index]),
												text: 'Discover for this course'
											});
											$courseItemFooterInner.append($discoverMaterial);
											$discoverMaterial.on('click', function(e){
												addThrobber($discoverMaterial);
											});
										}
										$courseItemFooter.append($courseItemFooterInner);
										$courseItemFooter.insertAfter($matList);
									}
									if (data.supplies.length > 1) {
										var $courseItemFooter = $('<div/>',{'class':'card__footer'});
										var $courseItemFooterInner = $('<div/>',{'class':'inner'});
										var $courseItemFooterLink = $('<div/>',{'class':'stacked-items--link-btn'});
										var $viewAllMaterial = $('<a/>',{'class':'text-link',href: ffd.paths.specificCourse.replace(':courseId', currentCourseId)}).append($('<span/>', {text: 'View all ' + data.supplies.length + ' materials'}));
										$courseItemFooterLink.append($viewAllMaterial);
										if(!isStudentsPage) {
											var $discoverMaterial = $('<a/>', {
												'class': 'btn btn-block btn-primary',
												href: ffd.paths.discoverCourse.replace(':courseId', coursesIdArray[index]),
												text: 'Discover for this course'
											});
											$courseItemFooterLink.append($discoverMaterial);
											$discoverMaterial.on('click', function(e){
												addThrobber($discoverMaterial);
											});
										}
										$courseItemFooterInner.append($courseItemFooterLink);
										$courseItemFooter.append($courseItemFooterInner);
										$courseItemFooter.insertAfter($matList);
									}
                                //------------------- -269 End ---------------------

                                } else {
                                    if (data.noMaterialsRequired != 'true' && ((data.materials.length + data.supplies.length) >= 0)) {

                                        $shareAdoptionCourseInfo = $('<span/>', {'class': 'share-adoptions-component share-adoption-course-info', text: '(' + (data.materials.length + data.supplies.length) + ' adopted materials)'});
                                        $shareAdoptionCourseInfo.insertAfter($matList);
                                    }
                                    //$matList.remove();
                                    $courseCardContentHolder.addClass('bordered');
                                    if (data.noMaterialsRequired && data.noMaterialsRequired === 'true') {
                                        if (!isStudentsPage) {
                                            $shareAdoptionCourseInfo = $('<span/>', {'class': 'share-adoptions-component share-adoption-course-info', text: 'No materials required'});
                                            $shareAdoptionCourseInfo.appendTo($currentCourseBlock);
                                        }
										var $cardPrompt = $('<div/>',{'class':'card__prompt'});
										var $prompt = $('<div/>',{'class':'prompt'});
										var $promptHeader = $('<div/>', {'class': 'prompt__header'});
										$promptHeader.append($('<span/>', {style:'font-size:25px; padding-left:15px', text: 'Nothing required'}));
										$prompt.append($promptHeader);
										$cardPrompt.append($prompt);
										$matList.append($cardPrompt);
										var $courseItemFooter = $('<div/>',{'class':'card__footer'});
										var $courseItemFooterInner = $('<div/>',{'class':'inner'});
										$courseItemFooter.append($courseItemFooterInner);
										$courseItemFooter.insertAfter($matList);
                                    } else if (isStudentsPage){
										var $cardPrompt = $('<div/>',{'class':'card__prompt'});
										var $prompt = $('<div/>',{'class':'prompt'});
										var $promptHeader = $('<div/>', {'class': 'prompt__header'});
										$('#card-subject'+index).addClass('card--standout');
                                        $('#card-subject'+index).addClass('card--subject--empty');
										$promptHeader.append($('<span/>', {style:'font-size:25px;padding-left:15px', text: 'No Materials Added'}));
										$prompt.append($promptHeader);
										$cardPrompt.append($prompt);
										$matList.append($cardPrompt);
										var $courseItemFooter = $('<div/>',{'class':'card__footer'});
										var $courseItemFooterInner = $('<div/>',{'class':'inner'});
										$courseItemFooter.append($courseItemFooterInner);
										$courseItemFooter.insertAfter($matList);
                                    } else {
										var $courseItemFooter = $('<div/>',{'class':'card__footer'});
										var $courseItemFooterInner = $('<div/>',{'class':'inner'});
										var $discoverMaterial = $('<a/>',{'class':'btn btn-block btn-primary',href: ffd.paths.discoverCourse.replace(':courseId', coursesIdArray[index]), text:'Discover for this course'});
										$courseItemFooterInner.append($discoverMaterial);
										$courseItemFooter.append($courseItemFooterInner);
										$courseItemFooter.insertAfter($matList);
                                        //$courseCardContentHolder.prepend($('<p/>', {class : 'non-share-adoptions-component jumbo', text: 'Start adopting your course materials today.'}));
                                    }
								}
							} else if(isStudentsPage){
								$matList.remove();
								$courseCardContentHolder.addClass('bordered');
								$('<p/>', {class : 'jumbo'}).html(ctResponseDetails.messageInCourseCard).appendTo($currentCourseBlock);
							}
							var isMaterialAvailable = true;

							if ((data.materials && data.materials.length === 0 && data.supplies.length === 0) && (!disciplineId || disciplineId === '') && !isStudentsPage && !(data.noMaterialsRequired && data.noMaterialsRequired === 'true')) {
								$currentCourseBlock.addClass('dropdown-card');
								var $cardPrompt = $('<div/>',{'class':'card__prompt'});
								var $prompt = $('<div/>',{'class':'prompt'});
								if(data.materials && data.materials.length === 0 && data.supplies.length === 0) {
									isMaterialAvailable = false;
									$('#card-subject'+index).addClass('card--standout');
									$('#card-subject'+index).addClass('card--subject--empty');
									var $promptHeader = $('<div/>', {'class': 'prompt__header'});
									$promptHeader.append($('<h2/>', {text: 'You haven’t adopted learning materials for this course yet'}));
									$promptHeader.append($('<p/>', {text: 'Click “Discover for this course” to find learning materials for this course.'}));
									$prompt.append($promptHeader);
								}

								var $promptBody = $('<div/>',{'class':'prompt__body'});
								var $subjectGroup = $('<div/>',{'class':'form-group'});
								var $disciplineGroup = $('<div/>',{'class':'form-group'});
								var $disciplineStyle = $('<div/>',{'class':'styled-select'});
								var $subjectStyle = $('<div/>',{'class':'styled-select'});
							    var $disciplineSelect = $('<select/>', {id: 'select-discipline',class:'form-control enableSubmit__input'});
								var $subjectSelect = $('<select/>', {'class': 'inactive form-control enableSubmit__input', disabled: true, id: 'select-subject'});
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

                                disciplinesDataArray.sort(GetSortOrder("name"));
								for(var item in disciplinesDataArray) {
									//if(disciplinesData.disciplines.hasOwnProperty(disciplineName)) {
										$('<option/>', {
											value: disciplinesDataArray[item]._id,
											text: disciplinesDataArray[item].name
										}).appendTo($disciplineSelect);
									//}
								}
								$('<label/>', {'for': 'select-discipline', text: 'Discipline'}).appendTo($disciplineGroup);
								$disciplineSelect.appendTo($disciplineStyle);
								$disciplineStyle.appendTo($disciplineGroup);
								$('<label/>', {'for': 'select-subject', text: 'Subject'}).appendTo($subjectGroup);
								$subjectSelect.appendTo($subjectStyle);
								$subjectStyle.appendTo($subjectGroup);
								$promptBody.append($disciplineGroup);
								$promptBody.append($subjectGroup);
								$prompt.append($promptBody);
								$cardPrompt.append($prompt);
								$matList.append($cardPrompt);
								// Remove footer.
								$courseItemFooter.remove();
								// Build new footer.
								var $courseItemFooter = $('<div/>',{'class':'card__footer'});
								var $courseItemFooterInner = $('<div/>',{'class':'inner'});
								if(!isMaterialAvailable){
									var $courseItemFooterLink = $('<div/>',{'class':'stacked-items--link-btn no-materials'});
									var $noMaterialLink = $('<a/>',{'class':'text-link no-materials-link',text:'I have no materials to adopt for this course',tabindex:0});
									$noMaterialLink.on('click',function(){
										setNothingRequired(coursesIdArray[index],$('#card-subject'+index));
									});
									$courseItemFooterLink.append($noMaterialLink);
									$courseItemFooterInner.append($courseItemFooterLink);
								}
								var $discoverMaterial = $('<a/>',{'class':'btn btn-block btn-primary',href: ffd.paths.discoverCourse.replace(':courseId', coursesIdArray[index]), text:'Discover for this course'});
								$courseItemFooterInner.append($discoverMaterial);
								$courseItemFooter.append($courseItemFooterInner);
								$courseItemFooter.insertAfter($matList);

								$currentCourseBlock.find('.course-cta').appendTo($currentCourseBlock);
								$disciplineSelect.on('change', function(){
									var $disciplineId = $(this).val();
									if($(this).find('option:selected').index() === 0) {
										isDisciplineSelected = false;
										isSubjectSelected = false;
										$subjectSelect.addClass('inactive').prop('disabled', true);
										$discoverMaterial.addClass('inactive').prop('disabled', true);
										$discoverMaterial.css('opacity','0.3');
									} else {
										isDisciplineSelected = true;
										$subjectSelect.removeClass('inactive').prop('disabled', false);
										$subjectSelect.empty();
										$subjectSelect.append($('<option/>', {
											text: 'Select Subject'
										}));
										for(var subject in disciplinesData.disciplines[$disciplineId].subjects){
											if (disciplinesData.disciplines[$disciplineId].subjects.hasOwnProperty(subject)) {
												$('<option/>', {
													value: disciplinesData.disciplines[$disciplineId].subjects[subject].id,
													text: disciplinesData.disciplines[$disciplineId].subjects[subject].name
												}).appendTo($subjectSelect);
											}
										}
										if($subjectSelect.find('option:selected').index() !== 0) {
											$discoverMaterial.removeClass('inactive').removeAttr('disabled');
											$discoverMaterial.css('opacity','1');
										}
									}
								});
								$subjectSelect.on('change', function(){
									if($(this).find('option:selected').index() === 0) {
										isSubjectSelected = false;
										$discoverMaterial.addClass('inactive').prop('disabled', true);
										$discoverMaterial.css('opacity','0.3');
									} else {
										isSubjectSelected = true;
										$discoverMaterial.removeClass('inactive').removeAttr('disabled');
										$discoverMaterial.css('opacity','1');
									}
								});
								$discoverMaterial.on('click', function(e){
									e.preventDefault();
									addThrobber($discoverMaterial);
									var $courseContainer = $(this).parents('.card__inner');
									if (isDisciplineSelected && isSubjectSelected) {
										var courseData = {courseId :  $courseContainer.attr('data-course-id'), subjectId : $subjectSelect.val(), disciplineId: $disciplineSelect.val()};
										ffd.setCourseDisciplineAndSubject($selectHolder, courseData, $(this).attr('href'));
									}
								});
								$disciplineSelect.trigger('change');
							} else if (!isStudentsPage) {
								if ($cardPrompt) {
									$cardPrompt.remove();
								}
								var $cardPrompt = $('<div/>', {'class': 'card__prompt'});
								var $prompt = $('<div/>', {'class': 'prompt'});
								if (data.materials && data.materials.length === 0 && data.supplies.length === 0) {
									isMaterialAvailable = false;
									if (data.noMaterialsRequired && data.noMaterialsRequired === 'true') {
										/*if (!isStudentsPage) {
											$shareAdoptionCourseInfo = $('<span/>', {
												'class': 'share-adoptions-component share-adoption-course-info',
												text: 'No materials required'
											});
											$shareAdoptionCourseInfo.appendTo($currentCourseBlock);
										}*/
										var $cardPrompt = $('<div/>', {'class': 'card__prompt'});
										var $promptHeader = $('<div/>', {'class': 'prompt__header'});
										$promptHeader.append($('<span/>', {
											style: 'font-size:25px; padding-left:15px',
											text: 'Nothing required'
										}));

									}else {
										$('#card-subject' + index).addClass('card--standout');
										$('#card-subject' + index).addClass('card--subject--empty');
										var $promptHeader = $('<div/>', {'class': 'prompt__header'});
										$promptHeader.append($('<h2/>', {text: 'You haven’t adopted learning materials for this course yet'}));
										$promptHeader.append($('<p/>', {text: 'Click “Discover Materials” to find learning materials for this course.'}));
									}
									$prompt.append($promptHeader);
								}
								$cardPrompt.append($prompt);
								$matList.append($cardPrompt);
								if (!isMaterialAvailable) {
									$courseItemFooter.remove();
									// Build new footer.
									var $courseItemFooter = $('<div/>', {'class': 'card__footer'});
									var $courseItemFooterInner = $('<div/>', {'class': 'inner'});

									var $courseItemFooterLink = $('<div/>', {'class': 'stacked-items--link-btn no-materials'});
									var $noMaterialLink = $('<a/>', {
										'class': 'text-link',
										text: 'I have no materials to adopt for this course',
										tabindex:0
									});
									$noMaterialLink.on('click',function(){
										setNothingRequired(coursesIdArray[index],$('#card-subject'+index));
									});
									$courseItemFooterLink.append($noMaterialLink);
									$courseItemFooterInner.append($courseItemFooterLink);
									var $discoverMaterial = $('<a/>', {
																'class': 'btn btn-block btn-primary',
																href: ffd.paths.discoverCourse.replace(':courseId', coursesIdArray[index]),
																text: 'Discover for this course'
															});
								$courseItemFooterInner.append($discoverMaterial);
								$courseItemFooter.append($courseItemFooterInner);
								$courseItemFooter.insertAfter($matList);
									if (data.noMaterialsRequired && data.noMaterialsRequired === 'true') {
										if (!isStudentsPage) {
											$('#card-subject'+index).find('a.text-link').hide();
											$('#card-subject'+index).find('a.btn-block').hide();
										}
									}
							}
								$discoverMaterial.removeClass('inactive').removeAttr('disabled');
								$discoverMaterial.css('opacity','1');
								$currentCourseBlock.find('.cta').prependTo($courseCardContentHolder);
							}
							if(disciplineId && disciplineId !== '' && !isStudentsPage) {
								var $manageLink = $('<a/>', {href:'/courses/' + currentCourseId, 'class': 'caret-link top-link'}).append($('<span/>', {text: 'Manage Course'}));
								$currentCourseBlock.find('.course-cta').append($manageLink);
							}
							$courseCardContentHolder.removeClass('_display_none');
							ffd.cutMaterialTitles($currentCourseBlock);
						}
					});
                    if (!isStudentsPage) {
                        getCourseISBNList(data, currentCourseIdData,userCourses);
                    }
				},
				error: function(error) {
					if(error.status === 0) {
						return false;
					}
					ffd.showCourseMaterialError($('.layout-cards-grid').find('[data-course-id="' + coursesIdArray[index] + '"]'));
					$currentCourseBlock.find('.throbber').remove();
				},
				complete: function() {
					if(!isStudentsPage) {
                        toggleShareAdoptionView();
						isCourseCardLoaded=true;
                    }
					$('.card__inner').each(function(){
						$currentCourseBlock = $(this);
						if ($currentCourseBlock.attr('data-course-id') === coursesIdArray[index]) {
							$currentCourseBlock.find('.throbber').remove();
						}
					});
				}
			});
		});
	}

	function initializeFasrAccessClick($fasrMaterial) {
		//var $accessContainer = $fasrMaterial.parent('li.access-container');
		//$accessContainer.find('.redeem-error').remove();
		var win = window.open(ffd.paths.materialEspAccess.replace(':materialId', $fasrMaterial.data('id')), '_blank');
		win.focus();
		//ffd.getFasrAccessUrl($accessContainer, $fasrMaterial.data('id'), $accessContainer, null, 'redeem-error short');
	}

// -479
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
               if(isCourseShareChecked === 0) {
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
            for(var i=0; inputElements[i]; ++i){
                if(inputElements[i].checked){
                    checkedValue = inputElements[i].value;
                    courseConfirmationList.push(checkedValue);
                }
            }

            var termName;
            var emailFrom = ffd.userData.email;
            var termId = $('#term-dropdown').val();
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
                       termId : termId,
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
			   $('.card__footer').css('display', 'table');
               $('#card-list-container').removeClass('share-adoptions-view');
               $('.share-adoptions-component').css('display', 'none');
               $('.card__body').css('display', 'block');
               $('.course-grouping-div').addClass('dropdown-card');
               $('.non-share-adoptions-component').css('display', 'block');
               $('.materials-quantity-link').css('display', 'block');
               $('.layout-cards-grid').find('h3').css('background', '#fff0d4');
               $('.card__inner').addClass('dropdown-card');
			   $('#shareBtn').focus();

         });
		 $('#closeModalId').on('click', function() {
			 $('.card__footer').css('display', 'table');
			 $('#card-list-container').removeClass('share-adoptions-view');
			 $('.share-adoptions-component').css('display', 'none');
			 $('.card__body').css('display', 'block');
			 $('.course-grouping-div').addClass('dropdown-card');
			 $('.non-share-adoptions-component').css('display', 'block');
			 $('.materials-quantity-link').css('display', 'block');
			 $('.layout-cards-grid').find('h3').css('background', '#fff0d4');
			 $('.card__inner').addClass('dropdown-card');


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

     function getCourseISBNList(materialData, currentCourseId,userCourses) {
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
                   userCourses.forEach(function(course)
                   {
                       if (currentCourseId === course.id) {
                           isbn['courseSectionId'] = course.sectionId;
                           isbn['courseDescription'] = course.description;
                       }
                   });
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
                     userCourses.forEach(function(course)
                     {
                        if (currentCourseId === course.id) {
                            isbn['courseSectionId'] = course.sectionId;
                            isbn['courseDescription'] = course.description;
                        }
                     });
                     isbnList.push(isbn);
               });
           }
           if((materialData.materials.length === 0) && (supplyList.length === 0)) {
                var isbn = {};
                if(materialData.noMaterialsRequired === 'true') {
                    isbn['noMaterialsRequired'] = 'true';
                }
                userCourses.forEach(function(course)
                {
                    if (currentCourseId === course.id) {
                        isbn['courseSectionId'] = course.sectionId;
                        isbn['courseDescription'] = course.description;
                    }
               });
               isbnList.push(isbn);
           }

     }
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

     function getTermsAndConditionsWindow() {
             var termsAndConditionsValue;

             $('#attestation-modal').modal({
                 backdrop: 'static',
                 keyboard: false,
                 show: true
             });
             $('#attestation_header').css({'display':'block'});

             $("#closeButton1").on("click",function() {
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
				 $('#modal-welcome-instructor').modal({
                         backdrop: 'static',
                         keyboard: false,
                         show: true
                     });
                     createTutorialWindowInstructor();
                     setTimeout(function(){
                          $('#hiddenBtn').click();
                     }, 500);
				 }
             });

     			setTimeout(function(){
     				$('#closeButton1').focus();
     			}, 500);
     		$("#cancelButton").blur(function() {
     			$('#closeButton1').focus();
     		});
     		$("#closeButton1").blur(function() {
     			$('#termCheck').focus();
     		});
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
    	if (!isCourseCardLoaded) {
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

	function addThrobber(obj){
			//e.preventDefault();
			obj.addClass('inactive').prop('disabled', true);
			obj.css('opacity','0.3');
			ffd.displayThrobberOverlayOverElement(obj);
			$('.throbber').css('margin-top','8px');
	}

	function setNothingRequired(courseId,$container) {
		var $this = $(this);
		var $noMaterialsLinkThrobber = ffd.showThrobber($container.find('.card__body'), 'appendTo');
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
				$container.removeClass('card--standout');
				$container.removeClass('card--subject--empty');
				$container.find('a.text-link').hide();
				$container.find('a.btn-block').hide();
				$container.find('.course-card-content-holder').find('span.share-adoptions-component.share-adoption-course-info').text('No materials required');
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

    function createTutorialWindowInstructor() {
        var role = ffd.user.role;

        // welcome slide population

        var welcomeContent = onboardTutorialData.role[role].welcome_page;
        $onboardWelcomeModalInstructor.find('.slide__title').text(welcomeContent.title);
        var $welcomeImage = $onboardWelcomeModalInstructor.find('.slide__bannerImage');
        $welcomeImage.attr('src',welcomeContent.src);
        $welcomeImage.on("load",function(){
            $(this).css('border', "solid 2px black");
        })
        var $text = $.parseHTML(welcomeContent.content);
        $onboardWelcomeModalInstructor.find('.slide__content.prose.prose-large.contained-block').text('');
        $onboardWelcomeModalInstructor.find('.slide__content.prose.prose-large.contained-block').append($text);
//        $('#modal-welcome-footer').css('height' , "700px");

        var pageContent = onboardTutorialData.role[role].tutorial_slide;
        var $slide = $onboardModalInstructor.find('#onboardSlidesInstructor').detach();
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
            $onboardModalInstructor.find('.slider.with-dots.welcome-slider').append($cloneSlide);
        }
        $('#begin_tour_instructor').on("click",function(){
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
				$('.slick-track').find('.slick-active').find('.slide__footer').find('.btn-primary.btn-wide.slick-next').attr('id','close2');
            }/*else{
                $('.slick-track').find('.slick-active').find('.slide__footer').removeClass('_display_none');
            }*/


			$('#close2').on("click",function(){
				$onboardModalInstructor.modal('hide');
			})
        })
    }

})();