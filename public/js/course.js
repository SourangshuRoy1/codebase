(function() {
	var isDisciplineSelected  = false,
		isSubjectSelected = false,
		disciplinesData = ffd.subjectsByDiscipline,
		isStudentsPage = false,
		$setDisciplineAndSubjectBtn,
		$materialItemTemplate,
		$noMaterialTemplate,
		$disciplineSelect,
		$subjectSelect,
		$otherMaterialTemplate,
		$otherMaterialsContainer,
		$studentInstructions,
		defaultStudentInstructionsText,
		$pageTitle,
		$editDisciplineLink,
		$introContainer,
		$specialInstructionsTextArea,
		$currentDiscipline,
		$currentSubject,
		$salesContainer,
		$removeMaterialBtn,
		$noMaterialsLink,
		$pageHeader,
		$otherItemsContainer,
		$body,
		$loadingThrobber,
		$removeMaterialBtnThrobber,
		$instructionsSaveButtonThrobber,
		$manageBySectionContainer,
		$addContentBlock,
		$createContentBlock,
		$discoverMaterialsBlock,
		$materialsHolder,
		$noMaterialsLinkThrobber;

	$(function(){
		$setDisciplineAndSubjectBtn = $('.set-discipline-and-subject');
		$disciplineSelect = $('#discipline-dropdown');
		$subjectSelect = $('#subject-dropdown');
		$otherItemsContainer = $('.material-grouping.history');
		$materialsHolder = $('.materials-holder');
		$otherMaterialsContainer = $otherItemsContainer.find('.material-list');
		$studentInstructions = $('#special-instructions-body');
		$pageTitle = $('.page-title');
		$editDisciplineLink = $pageTitle.find('.edit-discipline-link');
		$updateButton = $('#updateBtn');
		$introContainer = $('p.intro');
		$specialInstructionsTextArea = $('#special-instructions-text');
		$currentDiscipline = $('#dd_discipline');
        $currentSubject = $('#dd_subject');
		$body = $('body');
		$manageBySectionContainer = $('.manage-course-holder');
		$addContentBlock = $('.add-content');
		$createContentBlock = $('#create-course-packs');
		$discoverMaterialsBlock = $('.discover-materials');

		$materialItemTemplate = $('.layout-cards-grid.responsive-compress-inner-cards').find('.card.card--book.card--grouped-sections').detach();
	/*	$noMaterialTemplate = $('.dashed-box').detach();*/
		$noMaterialTemplate = $('.card__inner__dot').detach();
		$otherMaterialTemplate = $otherMaterialsContainer.find('.col-xs-4.col-sm-3').first().detach();
		$otherMaterialsContainer.empty();
		defaultStudentInstructionsText = $studentInstructions.text();

		if (ffd.user.role === 'administrator') {
			$('.store-status-wrap').hide();
		}

		if(ffd.customer && ffd.customer.EduEnabled) {
			addCreateContentHandler();
		} else {
			hideCreateContentBlock();
		}

		$('.general-page-loading').remove();
		$('.banner-alert.is-success').addClass('_display_none');

		var fromNoCourseMatDetails = JSON.parse(localStorage.getItem("matAdopted"));
		//alert(fromNoCourseMatDetails);
		var materialTitle = localStorage.getItem('removedMaterial');
		//alert(materialTitle);
		if(fromNoCourseMatDetails == "1"){
			$('.banner-alert.is-success').removeClass('_display_none');
			var $statusMessage = $('.banner-alert.is-success').find('.banner-alert__text-col.prose.contained-block').find('p');
			$statusMessage.find('strong').text("Your Request to adopt "+materialTitle+" was successfully submitted.");
			localStorage.setItem('matAdopted', '0');
		}

		$body.addClass('course');
		$pageHeader = $pageTitle.find('h2');
		if (ffd.pageData && ffd.pageData.course && ffd.pageData.course.id) {
			var addMaterialHref = ffd.paths.addCourseMaterial.replace(':courseId', ffd.pageData.course.id);
			//$('.add-course-material').attr('href', addMaterialHref);
			$('<span/>', {'class': 'small-course-title', text: ffd.pageData.course.shortName || '', title: ffd.pageData.course.shortName || ''}).appendTo($pageHeader);

			var $manageBySection = $('#manageBySectionStyle');
			$manageBySection.addClass('_display_none');
			if(!ffd.pageData.course.isSection && (ffd.user.role === "instructor" || ffd.user.role === "concierge")) {
				$manageBySection.removeClass('_display_none');
				$manageBySection.on('click', function(){
					initializeManageBySectionClick('Are you sure you want to manage this course by individual section?');
				});
			}
		}
		if (ffd.isStudent) {
			$body.addClass('student');
			$pageTitle.removeClass('filter');
			$pageTitle.css('padding-bottom', '40px');
			$('#special-instructions-toggle').remove();
			$('h2.section-header').text('Course Materials');
			isStudentsPage = true;
		}
		$loadingThrobber = ffd.showThrobber($('.section-header'), 'insertAfter');
		if (!isStudentsPage) {
			handleDisciplinesData(disciplinesData);
			initializeDisciplineAndSelectChangeHandler();
		}
		$('#subjectHeader').removeClass('_display_none');
		renderPage(ffd.pageData);
		$setDisciplineAndSubjectBtn.off('click');
		$setDisciplineAndSubjectBtn.on('click', function(e){
			e.preventDefault();
			var selectedDisciplineName = $disciplineSelect.find('option:selected').text();
			var selectedSubjectName = $subjectSelect.find('option:selected').text();
			setCourseDisciplineAndSubject(ffd.pageData.course.id, $subjectSelect.val(), $disciplineSelect.val(), selectedDisciplineName, selectedSubjectName);
		});
		initializeOpenRedeemAccessBtnClick();
		initializeFasrAccessBtnClick(ffd.pageData.course);
		$('#updateBtn').click(function() {
//discipline-dropdown
			$('#discipline-dropdown').focus();
		});
		$("#discipline-dropdown").blur(function() {
			$('#subject-dropdown').focus();
		});
		$('.send-redeem-access-code-btn').on('click', function(e){
			e.preventDefault();
			initializeSendRedeemAccessCodeBtnClick($(this).parent('li'), $(this).closest('.controls'));
		});
		$('.cancel-redeem').on('click', function(e){
			e.preventDefault();
			initializeRedeemCancelClick($(this).closest('.redeem-container'));
		});
		$('input.access-code').on('keyup', function (e) {
			if (e.keyCode === 13) {
				initializeSendRedeemAccessCodeBtnClick($(this).next('li'), $(this).parent('.controls'));
			} else if (e.keyCode === 27) {
				initializeRedeemCancelClick($(this).parent('.redeem-container'));
			}
		});
		if (isStudentsPage) {
			adjustButtons();
			getStudentsMaterialPurchaseUrl();
		}
		if(ffd.pageData && ffd.pageData.course) {
			initializeNoMaterialsBtnCLick(ffd.pageData.course.id);
		}
		if (ffd.areAdoptionsEnabledForTerm(ffd.pageData.term)) {
			var $removeAdoptionHolder = $('.edit-adoption');
			$removeMaterialBtn = $removeAdoptionHolder.find('.remove-adoption-btn');
			$removeMaterialBtn.on('click', function(e){
				e.preventDefault();
				$removeMaterialBtnThrobber = ffd.showThrobber($(this), 'insertAfter');
				removeAdoptedMaterial($(this).data('id'));
			});
		}

		$('#disciplineAndSubject').addClass('_display_none');

		window.setTimeout(function() {
			$('.material-item h3 a').ellipsis({row: 3});
			$('.material-header').ellipsis({row: 3});
			ffd.adjustMaterialTitles($('.materials-container').find('ul.material-list'), isStudentsPage);
			setMaterialItemEqualHeight($('.materials-container').find('ul.material-list > li'));
			setManageCourseBtnPosition($manageBySectionContainer);
		}, 100);
		$(window).on('load', function(){
			$('.generic-info').ellipsis({row: 2});
		});
		$(window).on('resize', function(){
			$('.other-material-title').each(function(){
				var fullTitle = $(this).attr('title');
				$(this).text(fullTitle);
				$(this).ellipsis({row: 2});
			});
			$('.generic-info').ellipsis({row: 2});
			if(!ffd.pageData.course.isSection && ffd.user.role === "instructor") {
				setManageCourseBtnPosition($manageBySectionContainer);
			}
		});
		$('.tooltip').tooltipster({
			theme: 'tooltipster-shadow'
		});
		$('.tooltip').tooltipster({
        	trigger: 'custom',
        	theme: 'tooltipster-shadow'
        }).on( 'focus', function() {
          $( this ).tooltipster( 'show' );
        }).on( 'blur', function() {
          $( this ).tooltipster( 'hide' );
        });


        $unapproveMaterialLink = $('.card__remove');
        		var $modal = $('#removeMaterial');
                		$unapproveMaterialLink.on('click', function(e){
                		var $btnRow = $modal.find('.material-remove-options');
                		var $materialId = $(this).attr('data-material-id');
						var $materialTitle = $(this).attr('data-title');
                		$btnRow.find('#materialRemoveYes').attr('data-material-id',$materialId);
						$btnRow.find('#materialRemoveYes').attr('data-title',$materialTitle);
                		$modal.removeClass('_display_none').addClass('in');
                        $modal.css("display","block");

        					setTimeout(function(){
        						$('#materialRemoveYes').focus();
        					}, 500);
        					$("#materialRemoveNo").blur(function() {
        						$('#materialRemoveYes').focus();
        					});

                         $('#materialRemoveYes').on('click', function() {
                                 e.preventDefault();
                                 $('.material-remove-options').addClass('_display_none');
                                 $unapproveMaterialLinkThrobber = ffd.showThrobber($('.material-remove-options'), 'insertAfter');
                                 $mid = $(this).attr('data-material-id');
							     var removeMaterialTitle = $(this).attr('data-title');
							 	 console.log('$removeMaterialTitle : ' + removeMaterialTitle);
							     localStorage.setItem('deleteMaterialTitle',removeMaterialTitle);
                                 removeAdoptedMaterial($(this).attr('data-material-id'));

                          });
               		});

                		initializeEscModalClick();

                    $('#materialRemoveNo').on('click', function() {
                                     $modal.removeClass('in').addClass('_display_none');
                                     $modal.css("display","none");
                                            });



	});


	 function initializeEscModalClick() {

         var $modal = $('#removeMaterial');
            $('.esc').on('click', function(){
                $modal.removeClass('in').addClass('_display_none');
                $modal.css("display","none");
            });
            $(document).keydown(function(e) {
                // ESCAPE key pressed
                if (e.keyCode == 27) {
                    $modal.removeClass('in').addClass('_display_none');
                    $modal.css("display","none");
                }
            });
        }

	function renderStudentInstructions(text) {
		$studentInstructions.text(text || defaultStudentInstructionsText);
		$specialInstructionsTextArea.val(text);
		if ($studentInstructions.text() === text) {$('#special-instructions-toggle').text('Edit');}
		if (isStudentsPage && $studentInstructions.text() === defaultStudentInstructionsText) {
			$('section.special-instructions').remove();
		}
	}

	function addCreateContentHandler() {
		//var $createContentButton = $createContentBlock.find('span');
		$createContentBlock.on('click', function(){
			//$createContentButton.addClass('inactive');
			//$createContentBlock.addClass('inactive');
			//var $throbber = ffd.displayThrobberOverlayOverElement($(this));
			ffd.ajax({
				type: 'GET',
				contentType: 'application/json; charset=utf-8',
				url: ffd.paths.getCourseEduAccessUrl.replace(':courseId', ffd.pageData.course.id),
				dataType: 'json',
				success: function(data) {
					if (data.error || !data.launchData.form) {
						ffd.showError($materialsHolder, 'Unable to launch Edu');
						return;
					}
					ffd.createAndPostForm(data.launchData.form);
				},
				error: function(error){
					ffd.showError($materialsHolder, 'Unable to launch Edu');
				}
			});
		});
	}

	function hideCreateContentBlock() {
		$createContentBlock.css('display', 'none');
		$discoverMaterialsBlock.removeClass('col-md-offset-4');
	}

	function setManageCourseBtnPosition($manageCourseBtn) {
		var $btnContainer = $manageCourseBtn.parent('.container');
		if($btnContainer.outerHeight() > 65) {
			$manageCourseBtn.removeClass('right').addClass('none');
		} else {
			$manageCourseBtn.addClass('right').removeClass('none');
		}
	}


	function handleDisciplinesData(data) {
		disciplinesData = data;
		if (disciplinesData) {
			if(ffd.pageData.course && ffd.pageData.course.disciplineId && ffd.pageData.course.subjectId) {
				$currentDiscipline.text(disciplinesData.disciplines[ffd.pageData.course.disciplineId].name);
				$currentSubject.text(disciplinesData.disciplines[ffd.pageData.course.disciplineId].subjects[ffd.pageData.course.subjectId].name);
			} else {
				$currentDiscipline.text('Not Selected');
				$currentSubject.text('Not Selected');
			}
			$disciplineSelect.empty();
			$('<option/>', {
				value: '0',
				text: 'None Selected'
			}).appendTo($disciplineSelect);
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
			if (ffd.pageData.course && ffd.pageData.course.disciplineId && ffd.pageData.course.disciplineId > 0) {
				$disciplineSelect.val(ffd.pageData.course.disciplineId);
				parseSubjectSelectOptions();
				if (ffd.pageData.course.subjectId) {
					$subjectSelect.val(ffd.pageData.course.subjectId);
					isSubjectSelected = true;
					//$updateButton.removeClass('inactive').prop('disabled', false);
				}
			} else {
				$disciplineSelect.val('0');
			}
			//$editDisciplineLink.off('click');
			$updateButton.on('click', function(e) {
                if($updateButton.text() === 'Save'){
                    var selectedDisciplineName = $disciplineSelect.find('option:selected').text();
                    var selectedSubjectName = $subjectSelect.find('option:selected').text();
                    //if(selectedDisciplineName != 'None Selected' && selectedSubjectName != 'None Selected'){
                        setCourseDisciplineAndSubject(ffd.pageData.course.id, $subjectSelect.val(), $disciplineSelect.val(), selectedDisciplineName, selectedSubjectName);
                        $('#disciplineAndSubject').addClass('_display_none');
                        $('.content-header__inner').find('#discipline_subject_noDropDown').removeClass('_display_none');
                        $('.content-header__inner').find('#discipline_subject_noDropDown').find('#dd_discipline').text(selectedDisciplineName);
                        $('.content-header__inner').find('#discipline_subject_noDropDown').find('#dd_subject').text(selectedSubjectName);
                        $updateButton.text('Update');
                        $('.banner-alert.is-success').addClass('_display_none');
                        return;
                    //}
                }
			    $updateButton.text('Save');
                e.preventDefault();
                $('.content-header__inner').find('#discipline_subject_noDropDown').addClass('_display_none');
                var $disciplineDropdown =  $('.page-content').find('#disciplineAndSubject');
                $('.page-content').find('.subject-header').append($disciplineDropdown);
                $('#disciplineAndSubject').removeClass('_display_none');

           });

           $disciplineSelect.on('change', function(e){
                var selectedDisciplineName = $disciplineSelect.find('option:selected').text();
                var selectedSubjectName = $subjectSelect.find('option:selected').text();

                if($(this).val() !== '0' && selectedSubjectName !== 'None Selected'){

                    if($subjectSelect.val()!=='0'){
                        $updateButton.prop('disabled', true);
                    }else{
                        $updateButton.prop('disabled', false);
                    }

                } else {
                    $subjectSelect.empty();
                    $subjectSelect.append($('<option/>', {
                        text: 'None Selected',
                        value: '0'
                    }));
                    $updateButton.prop('disabled', true);
                }
           })

           $subjectSelect.on('change', function(e){
               var selectedDisciplineName = $disciplineSelect.find('option:selected').text();
               var selectedSubjectName = $subjectSelect.find('option:selected').text();
               if(selectedDisciplineName !== 'None Selected' && $(this).val() !== '0'){
                    $updateButton.prop('disabled', false);
               } else {
                    $updateButton.prop('disabled', true);
               }
          })

			/*$editDisciplineLink.on('click', function(e) {
				e.preventDefault();
				if($pageTitle.hasClass('active')) {
				    $pageTitle.removeClass('active');
				    $('.edit-discipline-link').attr('aria-expanded','false');
                    $('#discipline-dropdown').attr('tabindex','-1');
                    $('#subject-dropdown').attr('tabindex','-1');
                    $('.set-discipline-and-subject').attr('tabindex','-1');
				}
				else {
					$pageTitle
						.addClass('active')
						.find('label').eq(0).focus();
					$('.edit-discipline-link').attr('aria-expanded','true');
                    $('#discipline-dropdown').attr('tabindex','0');
                    if(!$('#subject-dropdown').hasClass('inactive')) {
                        $('#subject-dropdown').attr('tabindex','0');
                        if(!$('.set-discipline-and-subject').hasClass('inactive')) {
                            $('.set-discipline-and-subject').attr('tabindex','0');
                        }
                    }
                     setTimeout(function(){
                         $('#discipline-dropdown').focus();
                     }, 500);
				}
				$('.form-holder').removeClass('_display_none');
			});
			$introContainer.removeClass('_display_none');*/
		}
		/*var $discipline = $currentDiscipline.detach();
		var $subject = $currentSubject.detach();
		var $caretLink = $introContainer.find('.edit-discipline-link').detach();
		$introContainer.empty();
		$('<div/>', {'class': 'course-info-holder'}).append($('<span/>', {text: 'Discipline'})).append($discipline).appendTo($introContainer);
		$('<div/>', {'class': 'course-info-holder'}).append($('<span/>', {text: 'Subject'})).append($subject).appendTo($introContainer);
		$caretLink.appendTo($introContainer);*/
	}

	function renderPage(data) {
		var courseData = data.course;
		var courseId = courseData.id;
		var adoptedMaterials = courseData.adopted;
		var $storeStatus = $('.store-status');
		if(courseData.status) {
			var $storeStatusValue = $storeStatus.find('span');
			switch (courseData.status) {
				case 'rejected':
					$storeStatusValue.addClass('danger');
					break;
				case 'pending':
					$storeStatusValue.addClass('warning');
					break;
				case 'approved':
					$storeStatusValue.addClass('success');
					break;
			}
			$storeStatusValue.text(courseData.status);
			$storeStatus.removeClass('_display_none');
		} else {
			$storeStatus.remove();
		}
		var $topAdoptedMaterialsContainer = $('.container');
		var $adoptedMaterialsContainer = $topAdoptedMaterialsContainer.find('.layout-cards-grid.responsive-compress-inner-cards');
		var ctResponseDetails = ffd.getCtResponseDetails(ffd.pageData.sectionAdoptionStatus,isStudentsPage);
		if ((ctResponseDetails.showMaterials === 'true') || !isStudentsPage || (typeof ffd.pageData.sectionAdoptionStatus === 'undefined')) {
		//no materials check
		/*while(adoptedMaterials.length > 0) {
            adoptedMaterials.pop();
        }*/
       /* if(adoptedMaterials.length == 0){
        $('<p/>', {text: 'No Materials Added',style:'margin-left:40%;font-size:20px;'}).appendTo($adoptedMaterialsContainer);
        }*/
		//end

			var materialTitle = localStorage.getItem('deleteMaterial');
			var title = localStorage.getItem('deleteMaterialTitle');
			if(materialTitle === 'r')
			{
				localStorage.setItem('deleteMaterial', '');
				$('.banner-alert.is-success').addClass('_display_none');
				var $statusMessage = $('.banner-alert.is-error').find('.banner-alert__text-col.prose.contained-block').find('p');
				$statusMessage.find('strong').text("You have removed " + title + " from your adopted materials.");
				$('.banner-alert.is-error').removeClass('_display_none');
			}
        	if(ffd.statusVal === 'remove'){
                $('.banner-alert.is-success').addClass('_display_none');
                var materialTitle = localStorage.getItem('removedMaterial');

                var $statusMessage = $('.banner-alert.is-error').find('.banner-alert__text-col.prose.contained-block').find('p');
                $statusMessage.find('strong').text("You have removed " + materialTitle + " from your adopted materials.");
                //$('.banner-alert').removeClass('is-success');
                $('.banner-alert.is-error').removeClass('_display_none');
        	}

			if (adoptedMaterials && adoptedMaterials.length > 0) {
				for(var i =0; i < adoptedMaterials.length; i++) {
					var adoptedMaterial = adoptedMaterials[i], $itemInfo, $matImg, $materialItem,
						renderParameters = {courseId: courseId, itemStatus: true, showChecked: true, mustRenderEbookLink: false};

					$materialItem = ffd.createMaterialTile($materialItemTemplate.clone(), adoptedMaterial, renderParameters);


					//var status$ = $('<div/>', {'class': 'card__lozenge card__lozenge--visible lozenge is-adopted',text:''})
					//$materialItem.find('.card.card--book.card--grouped-sections');
					$itemInfo = $materialItem.find('.book__text-col');
					$matImg = $materialItem.find('.book__image').clone();
					//alert('ffd.matStatusVal : ' + ffd.statusVal);
					if(ffd.adoptedMaterial != '' && adoptedMaterial.isbn13 == ffd.adoptedMaterial){
					    $('.banner-alert.is-error').addClass('_display_none');
					    var $statusMessage = $('.banner-alert.is-success').find('.banner-alert__text-col.prose.contained-block').find('p');
					    $statusMessage.find('strong').text("Your Request to adopt "+adoptedMaterial.title+" was successfully submitted.");
					    $('.banner-alert.is-success').removeClass('_display_none');
					}

					if (!isStudentsPage) {
					    /*if (adoptedMaterial.type !== 'supply') {     // -269
                            var $materialAdoptBtn = $('<li/>', {'class': 'edit-adoption'}).html($('<span/>', {text: 'edit adoption'})).appendTo($itemInfo);
                            if (ffd.areAdoptionsEnabledForTerm(ffd.pageData.term)) {
                                $materialAdoptBtn.find('span').addClass('remove-adoption-btn caret-link').text('Remove').attr('data-id', adoptedMaterial.isbn13);
                            } else {
                                $materialAdoptBtn.remove();
                            }
						}*/
					} else {
						/*$materialItem.find('.edit-adoption').remove();*/
						$materialItem.find('.card__lozenge.card__lozenge--visible.lozenge.is-adopted').remove();
						/*$materialItem.find('.rule-top').remove();*/
						if (adoptedMaterial.type !== 'supply') {
						    $materialItem.find('h1').html($('<span/>').addClass('material-header').text(adoptedMaterial.title || ffd.defaultMaterialTitle).attr('title', adoptedMaterial.title));
						} else {
                            $materialItem.find('h1').html($('<span/>').addClass('material-header').text(adoptedMaterial.name || ffd.defaultMaterialTitle).attr('title', adoptedMaterial.name));
						}
					}
					if(isStudentsPage) {
						$materialItem.find('.item-image').remove();
						///*$('<span/>', {'class': 'col-xs-6 item-image'}).append($matImg).insertBefore($itemInfo);*/
						 $materialItem.find('.card__footer').remove();
					}

					/*var $controls = $materialItem.find('ul.controls.row-fluid');*/
					var $controls = $materialItem.find('.card__inner');
					var $controlsBtnRow = $('<div/>', {'class': 'card__footer'});
					if (isStudentsPage && adoptedMaterial.inFasr) {
						if (adoptedMaterial.fasrAuthorized) {
							addAccessOrPurchaseBtn(adoptedMaterial.isbn13,$controlsBtnRow, $controls, '#', '_blank', 'Access', 'btn btn-block btn-primary fasr-access');
						} else {
							if (adoptedMaterial.espId !== ffd.digitalMaterialCode.brytewave) {
							//	addAccessOrPurchaseBtn(adoptedMaterial.isbn13,$controlsBtnRow, $controls, '#', null, 'Redeem access code', 'edit open-redeem-form-btn first-btn');
							}
							addAccessOrPurchaseBtn(adoptedMaterial.isbn13,$controlsBtnRow, $controls, adoptedMaterial.actionButton.url, adoptedMaterial.actionButton.target, adoptedMaterial.actionButton.label, 'btn btn-block btn-primary', adoptedMaterial.actionButton.type);

                            //redeem access code not required as per logic prior to revamp
							//var $redeemContainer = $('<ul/>', {'class':'row-fluid controls redeem-container'});
							//var $redeemContainer = $('<div/>', {'class':'card__inner card__footer redeem-container'});

							//$('<input/>', {'class':'access-code', type: 'text', placeholder: 'Enter access code'}).appendTo($redeemContainer);
							//addAccessOrPurchaseBtn(adoptedMaterial.isbn13,$controlsBtnRow, $redeemContainer, '#', null, 'Redeem access code', 'cta first-btn send-redeem-access-code-btn');
							//addAccessOrPurchaseBtn(adoptedMaterial.isbn13,$controlsBtnRow, $redeemContainer, '#', null, 'cancel', 'edit cancel-redeem');
							//$redeemContainer.insertBefore($controlsBtnRow);
							//$redeemContainer.hide();
						}
					} else if (isStudentsPage && adoptedMaterial.actionButton){
						addAccessOrPurchaseBtn(adoptedMaterial.isbn13,$controlsBtnRow, $controls,adoptedMaterial.actionButton.url, adoptedMaterial.actionButton.target, adoptedMaterial.actionButton.label, 'btn btn-block btn-primary', adoptedMaterial.actionButton.type);
					} else if(adoptedMaterial.url) {
					    $materialItem.find('.card__footer').remove();
						addAccessOrPurchaseBtn(adoptedMaterial.isbn13,$controlsBtnRow, $controls,adoptedMaterial.url, '_blank', 'Access');
					} else if ((ffd.user.role === 'instructor') && adoptedMaterial.espId == 'brytewave') {
						var $viewEbook = $('<a/>', {
							'class': 'btn btn-block btn-primary',
							text: 'ACCESS DESK COPY',
							href: ffd.paths.brytewaveLaunchProduct.replace(':productId', adoptedMaterial.isbn13),
							target: '_blank'
						});
						$controlsBtnRow.append($viewEbook);
						$controls.append($controlsBtnRow);

					} else {
						/*$controls.css('border-top', 'none');
						$controls.empty();*/
						if(isStudentsPage) {
						//need to check - temporary fix for showing purchase button where adoption material url,label and target are null (response : 500)

						addAccessOrPurchaseBtn(adoptedMaterial.isbn13,$controlsBtnRow, $controls,'#Purchase', '', '', 'btn btn-block btn-primary', '');
                        }
					}
					$materialItem.appendTo($adoptedMaterialsContainer);
				}
				$adoptedMaterialsContainer.removeClass('_display_none');
			} else {
				var $noMaterialMessage = $noMaterialTemplate.clone();
				$('.section-header').remove();
				if(!isStudentsPage) {
					/*$noMaterialMessage.find('h2').text('No materials added');
					$noMaterialMessage.find('div').remove();*/
					$noMaterialMessage.removeClass('_display_none');
                    $noMaterialMessage.find('.btn.btn-block.btn-primary.blue').attr('href', ffd.paths.discoverCourse.replace(':courseId', courseId));
                    $adoptedMaterialsContainer.append($noMaterialMessage);
                    $adoptedMaterialsContainer.parent('section').addClass('no-materials');
				}else{
				$('<p/>', {text: 'No Materials Added',style:'margin-left:40%;font-size:20px;'}).appendTo($adoptedMaterialsContainer);
				}

			}
		} else if(isStudentsPage){
			var $ctResponseMessage = $noMaterialTemplate.clone();
			$('.section-header').remove();
			$ctResponseMessage.find('h2').text(ctResponseDetails.messageInCourseCard);
			$ctResponseMessage.find('div').remove();
			$ctResponseMessage.removeClass('_display_none');
			$ctResponseMessage.find('.btn.btn-block.btn-primary.blue').attr('href', ffd.paths.discoverCourse.replace(':courseId', courseId));
			$adoptedMaterialsContainer.append($ctResponseMessage);
			$adoptedMaterialsContainer.parent('section').addClass('no-materials');
		}
		if (data && data.other) {
			var otherMaterials = data.other;
			renderOtherMaterials(otherMaterials, courseId);
			$('.other-material-title').ellipsis({row: 2});
		}
		if (data && data.course && data.course.specialInstructions) {
			renderStudentInstructions(data.course.specialInstructions && data.course.specialInstructions.text);
		} else if(isStudentsPage) {
			$studentInstructions.text('There are no instructions for this course.');
		}
		var $instructionsSaveButton = $('#special-instructions-form').find('input[type=submit]');
		$specialInstructionsTextArea.on('input', function(){
			$('#special-instructions-form').find('p.info').remove();
			var maxInstructionLength = 250,
			instruction = $(this).val();
			if (instruction.length > maxInstructionLength) {
				$(this).val(instruction.substring(0, (maxInstructionLength)));
				$('<p/>', {'class': 'info', text: 'A maximum of 250 characters are allowed'}).insertAfter($instructionsSaveButton);
			}
		});
		$instructionsSaveButton.on('click', function() {
			var dataToPost = {
				text: $specialInstructionsTextArea.val()
			};
			var $specialInstructionsContent = $('#special-instructions-content');
			var $instructionsContainer = $specialInstructionsContent.parent('.container');
			$instructionsSaveButtonThrobber = ffd.showThrobber($specialInstructionsContent, 'prependTo');
			ffd.ajax({
				url: ffd.paths.courseStudentInstructions.replace(':courseId', courseId),
				type: 'POST',
				dataType: 'json',
				data: dataToPost,
				success: function(data) {
				/*	if ($('.centered.success-header').length) {
						$('.centered.success-header').remove();
					}
					$('<h3/>', {text: 'Instructions saved', 'class': 'centered success-header'}).appendTo('#special-instructions-content').delay(2000).fadeOut('slow');*/
				},
				error: function() {
					$('.error-msg-top').remove();
					if(ffd.pageData && ffd.pageData.course && ffd.pageData.course.specialInstructions && ffd.pageData.course.specialInstructions.text) {
						$studentInstructions.text(ffd.pageData.course.specialInstructions.text);
						$specialInstructionsTextArea.val(ffd.pageData.course.specialInstructions.text);
					} else {
						$studentInstructions.text(defaultStudentInstructionsText);
						$specialInstructionsTextArea.val(defaultStudentInstructionsText);
					}
					$('<p/>', {
						'class': 'error-msg-top',
						text: 'Unable to save Student Instructions'
					}).prependTo($instructionsContainer).show();
				},
				complete: function() {
					$instructionsSaveButtonThrobber.remove();
				}
			});
		});

		$loadingThrobber.remove();
	}

	function addAccessOrPurchaseBtn(isbn, $btnRow, $btnContainer ,btnHref, btnTarget, btnLabel, btnClass, btnType) {

		if (!btnClass) {
//			btnClass = 'cta';
            btnClass = 'btn btn-block btn-primary';
		}
		if (btnType && btnType === 'purchase') {
			btnClass = btnClass + ' purchase-btn';
		}
		//var $btnHolder  = $btnRow;
		if (btnLabel && btnLabel === 'Access') {
			$('<a/>', {
				'class': btnClass,
				href: btnHref,
				text: btnLabel,
				target: btnTarget,
				id:isbn
			}).appendTo($btnRow);
		} else {
			$('<a/>', {
				'class': btnClass,
				href: btnHref,
				text: btnLabel || 'Purchase',
				target: btnTarget
			}).appendTo($btnRow);
		}
		$btnRow.appendTo($btnContainer);
	}
    function setThrober($container, method){
           var height = $container.outerHeight();
    	   var width = $container.outerWidth();
    	   $thContainer = $('<div/>', {class: 'throbber-container'});
    	   $thContainer.css({width:width, height: 20, margin: '5px 0'});
           var $throbber = $thContainer.html($('<div/>', {class: 'throbber',style:'margin-top:-30px'}));
           //$throbber.css({width:width, height: -20, margin: '10px 0'});
           return $throbber.insertAfter($container);
    }
	function getStudentsMaterialPurchaseUrl() {
		$('.purchase-btn').on('click', function(e){
			e.preventDefault();
			//var $purchaseAllThrobber;
			$purchaseBtn = $(this).closest('.purchase-btn');
			$purchaseBtn.css({'font-size': 0,height:34});
			$loginThrobber = setThrober($purchaseBtn, 'insertAfter');
			//$purchaseBtn.hide();
            //$purchaseAllThrobber = ffd.displayThrobberOverlayOverElement($(this));
			//var $loadingThrobber = ffd.showThrobber($(this).closest('.card.card--book.card--grouped-sections'), 'appendTo');
			//var $btnHolder = $('.card__body');
			//var $buttons = $('.controls').find('a');
			//var $loadingThrobber = ffd.showThrobber($(this).closest($btnHolder), 'appendTo');
			ffd.ajax({
				type: 'POST',
				contentType: 'application/json; charset=utf-8',
				url: ffd.paths.purchaseMaterial,
				data: {
					courseId: ffd.pageData.course.id,
					failReturnUrl: ffd.createFailReturnUrl(ffd.pageData.course.id)
				},
				dataType: 'json',
				success: function(data) {
					if (data.error || !data.form) {
						window.location.href = ffd.paths.purchaseMaterial + '?courseId=' + ffd.pageData.course.id;
						return;
					}
					ffd.createAndPostForm(data.form);
				},
				error: function(error){
					window.location.href = ffd.paths.purchaseMaterial + '?courseId=' + ffd.pageData.course.id;
				},
				complete: function() {
					$loginThrobber.remove();
					$purchaseBtn.css({'font-size': 15});
					//$purchaseBtn.show();

				}
			});
		});
	}

	function initializeOpenRedeemAccessBtnClick() {
		$('.open-redeem-form-btn').on('click', function(e){
			e.preventDefault();
			var $btnContainer = $(this).closest('.row-fluid.controls');
			$btnContainer.hide();
			$btnContainer.siblings('.redeem-container').show();
		});
	}

	function initializeRedeemCancelClick($btnContainer) {
		$btnContainer.find('.redeem-error').remove();
		$btnContainer.find('input').val('').attr('placeholder', 'Enter access code');
		$btnContainer.siblings('.row-fluid.controls').show();
		$btnContainer.hide();
	}

	function showCodeRedeemError($btnBlock, text) {
		$('<p/>', {'class': 'redeem-error', text: text}).prependTo($btnBlock);
	}

	function initializeSendRedeemAccessCodeBtnClick($btnHolder, $btnBlock) {
		var $loadingThrobber = ffd.showThrobber($btnHolder, 'appendTo');
		var $buttons = $('.controls').find('a');
		$buttons.addClass('inactive');
		var materialId = $btnHolder.closest('.col-lg-4').data('id');
		var accessCode = $btnHolder.siblings('.access-code').val();
		$btnHolder.siblings('.redeem-error').remove();
		ffd.ajax({
			type: 'POST',
			contentType: 'application/json; charset=utf-8',
			url: ffd.paths.postMaterialAccessCode.replace(':materialId', materialId),
			data: {courseId: ffd.pageData.course.id, accessCode: accessCode},
			dataType: 'json',
			success: function(data) {
				if (data.error) {
					return showCodeRedeemError($btnBlock, 'Oops! There was a problem redeeming this code. Please contact  support at 1-800-555-5555 for assistance.');
				}
				var $primaryBtnHolder = $btnBlock.siblings('.controls');
				$primaryBtnHolder.find('.open-redeem-form-btn').parent('li').remove();
				$primaryBtnHolder.find('.btn.btn-block.btn-primary').addClass('fasr-access').text('Access');
				initializeFasrAccessBtnClick(ffd.pageData.course);
				$('<p/>', {'class': 'redeem-success', text: 'Code successfully redeemed'}).prependTo($primaryBtnHolder).delay(3500).fadeOut('slow');
				$btnBlock.remove();
				adjustButtons();
				$primaryBtnHolder.show();
			},
			error: function(error) {
				if(error.responseJSON && error.responseJSON.error) {
					var errorData = error.responseJSON.error;
					if(errorData.description === 'Code not found') {
						return showCodeRedeemError($btnBlock, 'This code is not valid for this material.');
					}
					if(errorData.description === 'Code is already activated') {
						return showCodeRedeemError($btnBlock, 'This code was already redeemed.');
					}
				}

				return showCodeRedeemError($btnBlock, 'Oops! There was a problem redeeming this code. Please contact  support at 1-800-555-5555 for assistance.');
			},
			complete: function() {
				$loadingThrobber.remove();
				$buttons.removeClass('inactive');
			}
		});
	}

	function adjustButtons() {
		$('ul.controls').each(function(){
			var btnQuantity = $(this).find('li.col-xs-6').length;
			if (btnQuantity === 1) {
				$(this).css('height', '75px');
			} else if (btnQuantity === 2) {
				$(this).css('height', '125px');
			}
		});
		$('.redeem-container').css('height', '');
	}

	function renderOtherMaterials(otherMaterials, courseId) {
		if(otherMaterials && otherMaterials.length > 0) {
				for(var i = 0; i < otherMaterials.length && i < 4; i++) {
				var otherMaterial = otherMaterials[i];
				// -269 Start
				if (otherMaterial.type === 'supply'){
				    var detailsLinkAddress = ffd.paths.courseMaterialDetails.replace(':courseId', courseId).replace(':materialId', otherMaterial.supplyId);
				} else {
				    var detailsLinkAddress = ffd.paths.courseMaterialDetails.replace(':courseId', courseId).replace(':materialId', otherMaterial.isbn13);
				}
				// -269 End
				var $otherMaterial = $otherMaterialTemplate.clone();
				var $otherMaterialArticle = $otherMaterial.find('div');
				$otherMaterial.parent('ul.material-list').removeClass('material-list').addClass('associated-material-list');
				$otherMaterialArticle.removeClass('material-item').addClass('associated-material-item');
				$otherMaterial.find('h3').addClass('other-material-header');
				$otherMaterial.find('h3 a').addClass('other-material-title').attr('href', detailsLinkAddress).attr('title',otherMaterial.title).text(otherMaterial.title || ffd.defaultMaterialTitle);
				$otherMaterial.find('.material-image').parent('a').addClass('material-image-holder');
				var $imageAnchor = $otherMaterial.find('.col-xs-12 a');
				$imageAnchor.attr('href', detailsLinkAddress);
				$imageAnchor.find('img').attr('src', otherMaterial.image || '/img/no-cover.png');
				$salesContainer = $('<div/>', {'class': 'sales-container'}).appendTo($otherMaterialArticle);
				if(ffd.pageData.diagnosticsInfo) {
					ffd.renderMaterialDiagnosticsInfo($salesContainer, otherMaterial, ffd.pageData.diagnosticsInfo);
				}
				if (ffd.isDiagnosticMode) {
					$salesContainer.show();
				} else {
					$salesContainer.hide();
				}

				$otherMaterial.appendTo($otherMaterialsContainer);
			}
			$otherItemsContainer.removeClass('_display_none');
			ffd.initializeDiagnosticsMode($otherMaterialsContainer);
		}
	}

	function initializeManageBySectionClick(dialogText) {
		var $includedDialog, $btnRow, $close, $sendRequest;
		$includedDialog = ffd.modalDialogForManageBySection();
		$includedDialog.find('h3').text(dialogText);
		$includedDialog.find('.modal-dialog').attr('id','manage_by_sec_modal');
		$btnRow = $includedDialog.find('.button-row');
		$btnRow.addClass('split-row');
		$sendRequest = $('<button/>', {'class': 'btn btn-primary', 'style': 'margin:30px 40px; background:white', 'type': 'button', tabIndex: 0, text: 'Separate'});
		$sendRequest.appendTo($btnRow);
		$close = $('<button/>', {'class': 'btn btn-primary', 'type': 'button', tabIndex: 0, text: 'Cancel'});
		$close.appendTo($btnRow);
		$close.on('click', function(){
			$includedDialog.remove();
		});
		$sendRequest.on('click', function(){
			initializeCourseSplitRequest($includedDialog, $(this).parent('.button-row'));
		});
		$includedDialog.show();
		setTimeout(function(){
            $('.modal-dialog').find('.btn.btn-primary').focus();
        }, 500);
	}

	function initializeCourseSplitRequest($includedDialog, $requestBtn) {
		var $throber = ffd.showThrobber($requestBtn, 'insertBefore');
		var $btns =  $('.modal').find('.btn.btn-block.btn-primary');
		$btns.addClass('inactive');
		var $materialsContainer = $('.materials-container');
		ffd.ajax({
			url: ffd.paths.manageCourseBySection.replace(':courseId', ffd.pageData.course.id),
			type: 'POST',
			dataType: 'json',
			success: function(data){
				if(data.error) {
					if ($('.error-msg-top').length) {
						$('.error-msg-top').remove();
					}
					ffd.showMessage('Unable to send request', 'error-msg-top', $materialsContainer);
				}
				window.location = ffd.paths.dashboard;
			},
			error: function(){
				if ($('.error-msg-top').length) {
					$('.error-msg-top').remove();
				}
				ffd.showMessage('Unable to send request', 'error-msg-top', $materialsContainer);
			},
			complete: function() {
				$includedDialog.remove();
				$throber.remove();
				$btns.removeClass('inactive');
			}
		});
	}

	function parseSubjectSelectOptions() {
		var $disciplineId = $disciplineSelect.val();
		if($disciplineSelect.find('option:selected').index() === 0) {
			$setDisciplineAndSubjectBtn.addClass('inactive');
			isDisciplineSelected = false;
			$('#subject-dropdown').attr('tabindex','-1');
		} else {
			isDisciplineSelected = true;
			$subjectSelect.empty();
			$subjectSelect.append($('<option/>', {
				text: 'None Selected',
				value: '0'
			}));
			for(var subject in disciplinesData.disciplines[$disciplineId].subjects){
				if(disciplinesData.disciplines[$disciplineId].subjects.hasOwnProperty(subject)) {
					$('<option/>', {
						value: disciplinesData.disciplines[$disciplineId].subjects[subject].id,
						text: disciplinesData.disciplines[$disciplineId].subjects[subject].name
					}).appendTo($subjectSelect);
				}
			}
			$setDisciplineAndSubjectBtn.addClass('inactive');
			$subjectSelect.val('0');
			if($pageTitle.hasClass('active')) {
			    $('#subject-dropdown').attr('tabindex','0');
		    } else {
	    		$('#subject-dropdown').attr('tabindex','-1');
    		}
		}
	}

	function initializeDisciplineAndSelectChangeHandler() {
		$disciplineSelect.on('change', function(){
			parseSubjectSelectOptions();
		});
		$subjectSelect.on('change', function(){
			if($(this).find('option:selected').index() === 0) {
				$setDisciplineAndSubjectBtn.addClass('inactive');
				$('.set-discipline-and-subject').attr('tabindex','-1');
				isSubjectSelected = false;
			} else {
				$setDisciplineAndSubjectBtn.removeClass('inactive');
				$('.set-discipline-and-subject').attr('tabindex','0');
				isSubjectSelected = true;
			}
		});
	}
	function setCourseDisciplineAndSubject(courseId, subjectId, disciplineId, disciplineName, subjectName) {
		if (isDisciplineSelected && isSubjectSelected) {
			$loadingThrobber = ffd.displayThrobberOverlayOverElement($setDisciplineAndSubjectBtn);
			$disciplineSelect.prop('disabled', true);
			$subjectSelect.prop('disabled', true);
			ffd.ajax({
				type: 'PUT',
				contentType: 'application/json; charset=utf-8',
				url: ffd.paths.courseDisciplineAndSubject.replace(':courseId', courseId),
				data: {subjectId: subjectId, disciplineId: disciplineId},
				dataType: 'json',
				success: function(data) {
					$introContainer.find($currentDiscipline).text(disciplineName);
					$introContainer.find($currentSubject).text(subjectName);
					$pageTitle.removeClass('active');
					$('.edit-discipline-link').attr('aria-expanded','false');
                    $('#discipline-dropdown').attr('tabindex','-1');
                    $('#subject-dropdown').attr('tabindex','-1');
                    $('.set-discipline-and-subject').attr('tabindex','-1');
				},
				error: function(error){},
				complete: function() {
					$setDisciplineAndSubjectBtn.find('.throbber').remove();
					$setDisciplineAndSubjectBtn.text('Save');
					$disciplineSelect.prop('disabled', false);
					$subjectSelect.prop('disabled', false);
				}
			});
		}
	}

	function initializeFasrAccessBtnClick(courseData) {

	    var adoptedMaterials = courseData.adopted;
	    //var $fasrAccessBtn = $('.fasr-access');
	    //var dataID = $fasrAccessBtn.attr('id');

	   if (adoptedMaterials && adoptedMaterials.length > 0) {
       			for(var i =0; i < adoptedMaterials.length; i++) {
       				var adoptedMaterial = adoptedMaterials[i];
       				var $fasrAccessBtn = $('#'+adoptedMaterial.isbn13);
                    $fasrAccessBtn.off('click');

       				if(adoptedMaterial.espId == 'elsevier')
       				{
       				    $fasrAccessBtn.addClass('inactive');
       				    $fasrAccessBtn.on('click', function(e){
       				    return false;
       				    });

       				}
       				else
       				{
                        $fasrAccessBtn.on('click', function(e){
                        e.preventDefault();
                        var $this = $(this);
                        //var $accessContainer = $fasrAccessBtn.closest('.controls');
                        //$accessContainer.addClass('access-container');
                        //$accessContainer.find('.redeem-error').remove();
                        //var $buttons = $('.controls').find('a');
                        var materialId = $(this).closest('li.col-lg-4').data('id');
                        var win = window.open(ffd.paths.materialEspAccess.replace(':materialId', materialId), '_blank');
                        //win.focus();
                        //ffd.getFasrAccessUrl($this.parent('li'), materialId, $accessContainer.closest('.controls'), $buttons, 'redeem-error short');
                    });
                    }

       			}
       		}

	}

	function initializeNoMaterialsBtnCLick(courseId) {
		$noMaterialsLink = $('.no-materials-link');
		$noMaterialsLink.on('click', function() {
			var $this = $(this);
			$noMaterialsLinkThrobber = ffd.showThrobber($noMaterialsLink, 'insertBefore');
			$this.addClass('inactive');
			ffd.ajax({
				url: ffd.paths.courseNoMaterialsRequired.replace(':courseId', courseId),
				type: 'POST',
				dataType: 'json',
				success: function() {
					window.location.href = ffd.paths.dashboard;
				},
				error: function() {
					$('<p/>', {
						'class': 'error-msg-top',
						text: 'Unable to change course'
					}).insertAfter($pageTitle).show();
					$this.removeClass('inactive');
					$noMaterialsLinkThrobber.remove();
				}
			});
		});
	}

	function removeAdoptedMaterial(materialId) {
		$removeMaterialBtn.addClass('inactive');
		ffd.ajax({
			url: ffd.paths.removeAdoptedMaterial.replace(':courseId', ffd.pageData.course.id).replace(':materialId', materialId),
			type: 'DELETE',
			success: function(data) {
				if(data.error) {
					ffd.showMessage('Unable to remove adoption', 'error-msg-top', $('.store-status-wrap'));
					return;
				}
				//window.location = window.location.href;
				localStorage.setItem('deleteMaterial', 'r');

				window.location = ffd.paths.specificCourse.replace(':courseId', ffd.pageData.course.id);

			},
			error: function() {
				ffd.showMessage('Unable to remove adoption', 'error-msg-top', $('.store-status-wrap'));
			},
			complete: function() {
				//$removeMaterialBtnThrobber.remove();
				$removeMaterialBtn.removeClass('inactive');
			}
		});
		return false;
	}

	var setMaterialItemEqualHeight = function($columns){
		var tallestColumn = 0;
		$columns.each(function(){
			var currentHeight = $(this).find('div .row-fluid.item-top').height();
			tallestColumn = currentHeight > tallestColumn ? currentHeight : tallestColumn;
		});
		$columns.find('div .row-fluid.item-top').height(tallestColumn);

		tallestColumn = 0;
		$columns.each(function(){
			var currentHeight = $(this).find('div').height();
			tallestColumn = currentHeight > tallestColumn ? currentHeight : tallestColumn;
		});
		$columns.height(tallestColumn);
		$columns.find('div.material-item.enhanced-mat').height(tallestColumn);
	};

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

function addMaterialWithParameters() {
    var addMaterialTestvar = ffd.paths.addCourseMaterial.replace(':courseId', ffd.pageData.course.id)+"?departmentId="+ffd.pageData.course.departmentId+"&divisionId="+ffd.pageData.course.divisionId+"&termId="+ffd.pageData.course.termId;
/*    console.log("addMaterialWithParameters TEST");
    console.log(addMaterialTestvar);*/
    window.location = addMaterialTestvar;
}

function showTCULibraryPage() {
    var redirectionLink = "";
    console.log("");
    ga('send', 'event', 'TCU Browse', 'Click', 'TCU Browse');
    window.open(redirectionLink,'_blank');
}
