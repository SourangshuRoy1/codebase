(function(){
	var $fileInput,
		isError = false,
		isTermChecked = false,
		isCourseChecked = false,
		isMaterialAdded = false,
		$materialAccessEveryone,
		$materialAccessMyStudents,
		$courseCheckboxTemplate,
		$courseCheckboxHolder,
		fileSize,
		materialUrlValue,
		$materialUrl,
		$cancelBtn,
		$materialFile,
		$requiredCheckboxGroup,
		$errorMessage,
		$courseList,
		$materialTitle,
		$form;
		//$('.banner-alert.is-error').addClass('_display_none');
    $('[data-toggle="tooltip"]').tooltip();
	var maxFileSizeInMb = ffd.pageData.maxMaterialSizeInMb;
	var maxFileSizeInBytes = maxFileSizeInMb * 1024 * 1024;

	var initializeForm = function() {
		$materialUrl = $('#material-link-url');
		materialUrlValue = $materialUrl.val();
		$form = $('form#create-materials-form');
		$cancelBtn = $('.cancel');
		$materialFile = $('#material-link-file');
		$errorMessage = $('.error-msg-top');
		$courseList = $form.find('.course-list');
		$materialTitle = $('#material-file-title');


		$form.attr('method', 'POST').attr('action', ffd.paths.materials).attr('enctype', 'multipart/form-data');
		$form.find('.cta-button').remove();
		$('<input/>', {type: 'submit', 'class': 'add-material-form-submit-btn inactive', value : 'Add'}).appendTo($form);

		$fileInput = $form.find('input[type=file]').attr('name', 'create-material-file');
		$materialAccessEveryone = $('#material-access-everyone').val('everyone');
		$materialAccessMyStudents = $('#material-access-students').val('myStudents');
		$courseCheckboxTemplate = $form.find('.course-list').find('label').first().empty().detach();
		$courseList.find('label').remove();
		$form.find($cancelBtn).find('a').attr('href', document.referrer);
		$form.find($cancelBtn).addClass('_display_none').detach().insertAfter($('.add-material-form-submit-btn'));
		if (ffd.pageData && ffd.pageData.instructor_courses && !ffd.pageData.courseId) {
			for (var j=0; j<ffd.pageData.instructor_courses.length; j++) {
				var specificCourse = ffd.pageData.instructor_courses[j];
				$courseCheckboxHolder = $courseCheckboxTemplate.clone();
				$courseCheckboxHolder.attr('for', specificCourse.id);
				$('<input/>', {
					id: specificCourse.id,
					value: specificCourse.id,
					name: 'create-material-courses[' + specificCourse.id + ']',
					type: 'checkbox'
				}).appendTo($courseCheckboxHolder);
				$courseCheckboxHolder.append(specificCourse.description);
				$courseCheckboxHolder.append($('<span/>', {'class': 'small-course-title', text: specificCourse.shortName || '', title: specificCourse.shortName || ''}));
				$form.find('.course-list').append($courseCheckboxHolder);
			}
		} else {
			$courseList.remove();
		}
		$cancelBtn.on('click', function() {
			if(document.referrer && document.referrer !== window.location) {
				window.location = document.referrer;
			} else {
				window.location = ffd.paths.dashboard;
			}
			return false;
		});
		$('<input/>', {
			type: 'hidden',
			name: 'referrer',
			value: ffd.pageReferrer || ffd.paths.dashboard
		}).appendTo($form);
        $('<input/>', {
            type: 'hidden',
            'class': 'departmentId',
            name: 'departmentId',
            value: ffd.pageData.departmentId || ''
        }).appendTo($form);
        $('<input/>', {
            type: 'hidden',
            'class': 'divisionId',
            name: 'divisionId',
            value: ffd.pageData.divisionId || ''
        }).appendTo($form);
        $('<input/>', {
            type: 'hidden',
            'class': 'termId',
            name: 'termId',
            value: ffd.pageData.termId || ''
        }).appendTo($form);
		$('<input/>', {
			type: 'hidden',
			'class': 'create-material-info',
			name: 'create-material-info'
		}).appendTo($form);
		$materialUrl.removeAttr('name');

		$materialFile.on('change', function() {
			var file = this.files[0];
			if(!file) {
				return;
			}
			$materialUrl.removeClass('required');
			fileSize = file.size;
			if (fileSize > maxFileSizeInBytes) {
				$errorMessage.text('File size exceeds ' + maxFileSizeInMb + 'MB');
				$errorMessage.parent().addClass('error-active');
			} else {
				//if ($errorMessage.text().match('File size exceeds ')) {
					$errorMessage.parent().removeClass('error-active');
				//}
			}
			checkRequiredFields();
		});

		$requiredCheckboxGroup = $('.checkbox-group.required');
		$requiredCheckboxGroup.each(function(){
			$(this).on('change', function(){
				if($(this).find('input:checked').length > 0) {
					$(this).find('.error-msg').hide();
				}
				checkRequiredFields();
			});
		});

		$materialUrl.on('input', function(){
			materialUrlValue = ensureUrlStartsWithHttp($(this).val());
			initializeUrlSuccessValidation(materialUrlValue);
			checkRequiredFields();
		});
		$('#material-file-description').on('input', function(){
			$('.form-box').find('p.info').remove();
			var maxDescriptionLength = 500,
				materialDescription = $(this).val();
			if (materialDescription.length > maxDescriptionLength) {
				$(this).val(materialDescription.substring(0, (maxDescriptionLength)));
				$('<p/>', {'class': 'info', text: 'Only maximum 250 characters are allowed'}).insertAfter(this);
			}
		});

		preventEnterKeyPress($materialUrl);
		preventEnterKeyPress($materialTitle);

		$form.show();
		$cancelBtn.removeClass('_display_none');
	};

	function preventEnterKeyPress($input) {
		$input.on('keypress', function(e) {
			if (e.keyCode === 13) {
				return false;
			}
		});
	}

	function initializeUrlSuccessValidation(url) {
		if (url !== '' && isUrlValid(url)) {
			$materialUrl.prev('.error-msg').hide();
		}
	}

	function ensureUrlStartsWithHttp(url) {
		if (url !== '') {
			if (!/^(f|ht)tps?:\/\//i.test(url)) {
				url = "http://" + url;
			}
			return url;
		}
		return '';
	}

	function isUrlValid(url) {
		url = ensureUrlStartsWithHttp(url);
		return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
	}

	function checkRequiredFields() {
		if($('#material-terms-agree-label').find('input:checked').length > 0) {
			isTermChecked = true;
		} else {
			isTermChecked = false;
		}
		if (ffd.pageData.courseId) {
			isCourseChecked = true;
		} else {
			if ($courseList && $courseList.hasClass('required') && $courseList.find('input:checked').length > 0) {
				isCourseChecked = true;
			} else {
				isCourseChecked = false;
			}
		}
		if (($materialUrl.hasClass('required') && $materialUrl.val().length > 0) || $materialFile.val().length > 0) {
			isMaterialAdded = true;
		} else {
			isMaterialAdded = false;
		}
		if (isTermChecked && isCourseChecked && isMaterialAdded) {
			$('.form-submit-btn').removeClass('inactive');
			$('.add-material-form-submit-btn').removeClass('inactive');
			setTimeout(function(){
				$('.add-material-form-submit-btn').focus();
			}, 100);
			$(".add-material-form-submit-btn").blur(function() {
				$('.cancel').focus();
			});
			$(".cancel").blur(function() {
				$('#crs_footer').focus();});
		} else {
			$('.form-submit-btn').addClass('inactive');
			$('.add-material-form-submit-btn').addClass('inactive');
			$(".cancel").blur(function() {
				$('#crs_footer').focus();
			});
		}

	}

	function initializeSubmitFormHandle() {
		$('.add-material-form-submit-btn').on('click', function(){
			isError = false;
			$(this).addClass('inactive');
			$errorMessage.parent().removeClass('error-active');
			$form.removeClass('_display_none');
			if (!navigator.userAgent.match(/iPad/i)) {
				if ($materialFile && $materialFile.val() && $materialFile.val().length > 0) {
					$materialUrl.removeClass('required');
				} else {
					$materialUrl.addClass('required');
				}
				if (fileSize > maxFileSizeInBytes) {
                    $errorMessage.text('File size exceeds ' + maxFileSizeInMb + 'MB');
                    $errorMessage.parent().addClass('error-active');
                    isError = true;
                }
			} else {
				$materialUrl.addClass('required');
			}
			materialUrlValue = $materialUrl.val();
			if (materialUrlValue !== '' && !isUrlValid(materialUrlValue)) {
				//$materialUrl.prev('.error-msg').text('Link to Existing Material is not valid').show();
				$errorMessage.text('Invalid URL entered');
                $errorMessage.parent().addClass('error-active');
                $(window).scrollTop(100);
				isError = true;
			} else {
			    if ($errorMessage.text().match('Invalid URL entered.')) {
                		$errorMessage.parent().removeClass('error-active');
                }
			}
			if ($materialUrl.hasClass('required') && materialUrlValue === '') {
				//$materialUrl.prev('.error-msg').text('This required field needs to be filled ').show();
				$errorMessage.text('URL field needs to be filled.');
                $errorMessage.parent().addClass('error-active');
				isError = true;
			}
			$requiredCheckboxGroup.each(function(){
				if($(this).find('input:checked').length === 0) {
					$(this).find('.error-msg').show();
					isError = true;
				}
			});
			if (isError) {
				$errorMessage.parent().addClass('error-active');
				$(this).removeClass('inactive');
				 $('.error-msg-top').focus();
				return false;
			}
			if (ffd.pageData.courseId) {
				$form.append($('<input/>', {type: 'hidden', id: ffd.pageData.courseId, value: ffd.pageData.courseId, name:'create-material-courses[' + ffd.pageData.courseId + ']'}));
			}
			$('input.create-material-info').val(ensureUrlStartsWithHttp(materialUrlValue));
		});
	}

	var onDomReady = function() {
		$('body').addClass('add');
		initializeForm();
		initializeSubmitFormHandle();
	};

	$(onDomReady);
})();