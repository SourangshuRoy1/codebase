$.ajaxSetup({ cache: false });

$(document).ajaxError(function(event, jqxhr) {
	var httpStatusCode = jqxhr.status;
	if(httpStatusCode === 0) {
		jqxhr.handled = true;
		return false;
	}
});

jQuery.fn.forceNumericOnly = function() {
	return this.each(function() {
		$(this).on('keydown', function(e)
		{
			var key = e.charCode || e.keyCode || 0;
			// allow backspace, tab, delete, enter, arrows, numbers and keypad numbers ONLY
			// home, end, period, and numpad decimal
			return (
				key === 8 ||
				key === 9 ||
				key === 13 ||
				key === 46 ||
				key === 110 ||
				key === 190 ||
				(key >= 35 && key <= 40) ||
				(key >= 48 && key <= 57) ||
				(key >= 96 && key <= 105));
		});
	});
};

jQuery.fn.exists = function () {
	return this.length !== 0;
};

window.ffd = {};
ffd.defaultMaterialTitle = 'No Title';
ffd.isDiagnosticMode = false;

ffd.isInIFrame = function() {
	var self = window.self;
	return (self.parent && self.parent !== self) && (self.parent.frames.length !== 0);
};

ffd.isInFrame = function() {
	return window.top !== window.self;
};

var onDomReady = function() {
    ffd.setNavigationTab();
	if(ffd.isInFrame() || ffd.isInIFrame()) {
		ffd.stopRender = true;
		window.open(document.location, '_blank');
		$('body').html('<p style="text-align: center;"> Discover has been opened in a new window. Please turn off pop-up blocking in your browser for this page to see it.</p>');
	}
};

$(onDomReady);

ffd.ajax = function(parametersObject) {
	parametersObject.contentType = parametersObject.contentType || 'application/json';
	parametersObject.dataType = parametersObject.dataType || 'json';
	if (parametersObject.data && typeof parametersObject.type !== 'undefined' && parametersObject.type !== 'GET') {
		parametersObject.data = JSON.stringify(parametersObject.data);
	}
	var originalErrorHandler = parametersObject.error;
	parametersObject.error = function(jqXHR, textStatus, errorThrown) {
		if(jqXHR.status === 0) {
			return;
		}
		if(typeof originalErrorHandler === 'function') {
			originalErrorHandler(jqXHR, textStatus, errorThrown);
		}
	};
	return $.ajax(parametersObject);
};

var courseDisciplineAndSubjectThrobbers = {};

ffd.setCourseDisciplineAndSubject = function (selectHolder, courseData, redirectLink) {
	selectHolder.find('p.error-msg-top').remove();
	courseDisciplineAndSubjectThrobbers[courseData.courseId] = ffd.showThrobber(selectHolder, 'appendTo');
	ffd.ajax({
		type: 'PUT',
		contentType: 'application/json; charset=utf-8',
		url: ffd.paths.courseDisciplineAndSubject.replace(':courseId', courseData.courseId),
		data:{subjectId: courseData.subjectId, disciplineId: courseData.disciplineId},
		dataType: 'json',
		success: function() {
			window.location.replace(redirectLink);
		},
		error: function(error){
			$('<p/>', {
				'class': 'error-msg-top',
				text: 'Unable to set discipline and subject'
			}).insertBefore(selectHolder);
		},
		complete: function() {
			courseDisciplineAndSubjectThrobbers[courseData.courseId].remove();
		}
	});
};

function sortSubjectsByName(subjectsArray){
	subjectsArray.sort(function(a, b){
		if(a.name < b.name) {
			return -1;
		}
		if(a.name > b.name) {
			return 1;
		}
		return a.name;
	});
}

ffd.parseDisciplinesAndSubjects = function (subjectsByDiscipline) {
	if (typeof subjectsByDiscipline === 'undefined') {
		return {};
	}

	for (var disciplines in subjectsByDiscipline.disciplines) {
		if(subjectsByDiscipline.disciplines.hasOwnProperty(disciplines)) {
			var subjectsArray = subjectsByDiscipline.disciplines[disciplines].subjects;
			sortSubjectsByName(subjectsArray);
			delete subjectsByDiscipline.disciplines[disciplines].subjects;
			var currentDisciplineSubjects = {};
			for (var j = 0; j < subjectsArray.length; j++) {
				currentDisciplineSubjects[subjectsArray[j].id] = subjectsArray[j];
			}
			subjectsByDiscipline.disciplines[disciplines].subjects = currentDisciplineSubjects;
		}
	}
	return subjectsByDiscipline;
};


ffd.adjustMaterialTitles = function($parent, isStudentsPage) {
	var $materialContainer;
	if (isStudentsPage) {
		$materialContainer = $parent.find('.material-item').find('h3').find('span');
	} else {
		$materialContainer = $parent.find('.material-item').find('h3').find('a');
	}
	$materialContainer.each(function() {
		var $titleLink = $(this);
		var initialHeight = $titleLink.height();
		var oneRowHeight = 30;
		var twoRowsHeight = 41;
		var threeRowsHeight = 61;
		var oneRowOffset = 22;
		var twoRowsOffset = 11;
		var threeRowsOffset = $(window).width() < 785 ? 4 : 11;
		if(initialHeight < oneRowHeight) {
			$titleLink.css('top', oneRowOffset + 'px');
		} else {
			if(initialHeight < twoRowsHeight) {
				$titleLink.css('top', twoRowsOffset + 'px');
			} else {
				if (initialHeight < threeRowsHeight) {
					$titleLink.css('top', threeRowsOffset + 'px');
				}
			}
		}
		$titleLink.css('height', '65px');
		$titleLink.css('overflow', 'hidden');
		$titleLink.css('position', 'relative');
		$titleLink.css('display', 'block');
	});
};

ffd.showMessage = function(text, msgClass, $contentWrapper, autoHide) {
	var $msg, msgTimer;
	$msg = $('<p/>', {
		'class': msgClass,
		text: text
	}).prependTo($contentWrapper).show();
	$('html, body').animate({scrollTop: 0}, 500);
	if (autoHide) {
		if (msgTimer) {
			clearTimeout(msgTimer);
		}
		msgTimer = setTimeout(function () {
			$msg.fadeOut();
		}, 3000);
	}
};

ffd.initializeDiagnosticsMode = function(diagnosticsContainer) {
	$('.diagnostics-mode-notification').remove();
	$('<p/>', {'class':'diagnostics-mode-notification', text: 'Diagnostics mode turned OFF'}).hide().appendTo('body');

	var keyPressed = [];
	$(document).off('keydown');
	$(document).off('keyup');

	$(document).on('keydown', function(e) {
		keyPressed[e.keyCode] = true;
	});

	$(document).on('keyup', function(e) {
		if(diagnosticsContainer.length > 0) {
			if (keyPressed[17] && keyPressed[18] && keyPressed[68]) {
				ffd.isDiagnosticMode = !ffd.isDiagnosticMode;
				if (ffd.isDiagnosticMode) {
					$('.diagnostics-mode-notification').text('Diagnostics mode turned ON');
					$('.sales-container').show();
				} else {
					$('.diagnostics-mode-notification').text('Diagnostics mode turned OFF');
					$('.sales-container').hide();
				}
				$('.diagnostics-mode-notification').toggle().delay(1000).fadeOut('slow');
			}
			keyPressed[e.keyCode] = false;
		}
	});
};

ffd.getParameterByName = function(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

ffd.showNoMaterialsNotification = function ($contentWrapper, notificationText, mustShowAddTitlePrompt) {
	$contentWrapper.empty();
	if(!notificationText) {
		notificationText = 'No search results';
	}
	var $p = $('<p />', {
		class: 'alert-message'
	});
	$p.append($('<span />', {
		text: notificationText
	}));

	if (mustShowAddTitlePrompt) {
		$p.append($('<br />'));
		$p.append($('<span />', {
			"class": 'add-title-prompt'
		}).html('Would you like to <a href="' + ffd.paths.renderAddTitle + '">request materials</a> not found?'));
	}

	$contentWrapper.append($p);
};

ffd.createFailReturnUrl = function(courseId, termId, dynamicParameter) {
    dynamicParameter = dynamicParameter || '';
	courseId = courseId || '-';
	termId = termId || '';
	var path = termId ? ffd.paths.termEAuthFail : ffd.paths.eAuthFail;
	return (window.location.protocol + '//' + window.location.host) + path.replace(':courseId', courseId).replace(':dynamicParameter', dynamicParameter).replace(':termId', termId);

};

ffd.renderMaterialSection = function (material, $material) {
	$material.find('img').attr('src', material.image || '/img/no-cover.png');
	$material.find('img').attr('alt', '');
	$material.find('h3').text(material.title || 'No Title');
	var $author = $material.find('h4');
	if(material.author && material.author.length > 0) {
		$author.text(material.author.join(','));
	} else {
		$author.hide();
	}
	var $edition = $material.find('.edition');
	if(material.edition) {
		$edition.text(material.edition + ' Edition');
	} else {
		$edition.hide();
	}
	$material.show();
};

var preloadImage = function(url){
	var image = new Image();
	image.src = url;
};

preloadImage('/img/throbber.gif');
preloadImage('/img/throbber2x.gif');

ffd.showThrobber = function($container, method) {
	var $throbber = $('<div/>', {class: 'throbber-container'}).html($('<div/>', {class: 'throbber'}));
	switch (method) {
		case 'appendTo':
			return $throbber.appendTo($container);
		case 'prependTo':
			return $throbber.prependTo($container);
		case 'insertAfter':
			return $throbber.insertAfter($container);
		case 'insertBefore':
			return $throbber.insertBefore($container);
		case 'append':
			return $container.append($throbber);
		case 'before':
			return $container.before($throbber);
		default:
			return $throbber.appendTo($container);
	}
};

ffd.displayThrobberOverlayOverElement = function($element) {
	var height = $element.outerHeight();
	var width = $element.outerWidth();
	$element.css({width:width, height: height, padding: '2px 0'}).text('');
	return ffd.showThrobber($element, 'appendTo');
};

ffd.renderMaterialDiagnosticsInfo = function($container, materialData, fieldsDefinition){
	for(var i = 0; i < fieldsDefinition.length; i++) {
		var diagnosticKeyValue = fieldsDefinition[i].key;
		var diagnosticKeyLabel = fieldsDefinition[i].label;
		switch (diagnosticKeyValue) {
			case 'discipline_id':
				if(materialData[diagnosticKeyValue]) {
					var disciplineText = ffd.subjectsByDiscipline.disciplines[materialData[diagnosticKeyValue]].name + '(' + ffd.subjectsByDiscipline.disciplines[materialData[diagnosticKeyValue]]._id;
					$('<span/>', {'class': 'diagnostic-info', text: diagnosticKeyLabel + ': ' + disciplineText + ')'}).appendTo($container);
				}
				break;
			case 'subject_id':
				if(materialData[diagnosticKeyValue] && ffd.subjectsByDiscipline.disciplines[materialData.discipline_id].subjects[materialData[diagnosticKeyValue]]) {
					var subjectText = ffd.subjectsByDiscipline.disciplines[materialData.discipline_id].subjects[materialData[diagnosticKeyValue]].name + '(' + ffd.subjectsByDiscipline.disciplines[materialData.discipline_id].subjects[materialData[diagnosticKeyValue]].id + ')';
					$('<span/>', {'class': 'diagnostic-info', text: diagnosticKeyLabel + ': ' + subjectText}).appendTo($container);
				}
				break;
			default:
				if(materialData[diagnosticKeyValue]) {
					$('<span/>', {'class': 'diagnostic-info', text: diagnosticKeyLabel + ': ' + materialData[diagnosticKeyValue]}).appendTo($container);
				}
				break;
		}
	}
};

ffd.getFasrAccessUrl = function($throbberContainer, materialId, $errorHolder, $buttons, errorClass) {
	var showError = function() {
		var $error = $('<p/>', {'class': errorClass, text: 'Unable to get access url'});
		$error.prependTo($errorHolder);
		$error.show();
		return $error;
	};

	if($buttons) {
		$buttons.addClass('inactive');
	}
	var $loadingThrobber = ffd.showThrobber($throbberContainer, 'appendTo');
	ffd.ajax({
		url: ffd.paths.getMaterialAccessUrl.replace(':materialId', materialId),
		type: 'GET',
		dataType: 'json',
		success: function(data) {
			var launchData = data.launchData;
			var type = data.type;
			if(!launchData || !type) {
				return showError();
			}
			if (type === "post" && launchData.form) {
				ffd.createAndPostForm(launchData.form);
				return;
			}
			if (type === "redirect" && launchData.url) {
				window.location = launchData.url;
				return;
			}
			return showError();
		},
		error: function() {
			return showError();
		},
		complete: function() {
			$loadingThrobber.remove();
			if($buttons) {
				$buttons.removeClass('inactive');
			}
		}
	});
};

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

ffd.createAndPostForm = function(formData) {
	var $form = $('<form></form>');
	$form.attr('method', 'POST');
	$form.attr('action', formData.url);
	var parameters = formData.parameters;
	for (var index in parameters) {
		if(parameters.hasOwnProperty(index)) {
			var parameter = parameters[index];
			var key = parameter.key;
			var value = parameter.value;
			var $input = $('<input/>');
			$input.attr('type', 'hidden');
			$input.attr('name', key);
			$input.val(value);
			$input.appendTo($form);
		}
	}
	$form.appendTo($('body'));
	$form.submit();
};

ffd.areAdoptionsEnabledForTerm = function(term) {
	if (typeof term !== 'undefined') {
		return (typeof term.adoptionsEnabled === 'boolean') ? term.adoptionsEnabled : true;
	} else {
		return true;
	}
};

ffd.modalDialog = function() {
	var $modal, $modalDialog, $closeDialog;

	$modal = $('<div/>', {'class': 'modal fade in'}).hide();
	$modalDialog = $('<div/>', {'class': 'modal-dialog'}).appendTo($modal);
    $closeDialog = $('<a/>', {'class': 'esc', text: 'x', title: 'Close'}).appendTo($modalDialog);
	$('<h3/>').appendTo($modalDialog);
	$('<div/>', {'class': 'button-row'}).appendTo($modalDialog);

	$closeDialog.on('click', function(){
		$modal.remove();
	});
	$(document).keydown(function(e) {
        // ESCAPE key pressed
        if (e.keyCode == 27) {
            $modal.remove();
        }
    });

	$('body').append($modal);

	return $modal;
};

ffd.modalDialogForManageBySection = function() {
	var $modal, $modalDialog, $closeDialog;

	$modal = $('<div/>', {'class': 'modal fade in'}).hide();
	$modalDialog = $('<div/>', {'class': 'modal-dialog', 'style': 'width:600px'}).appendTo($modal);
    $closeDialog = $('<a/>', {'class': 'esc', text: 'x', title: 'Close'}).appendTo($modalDialog);
	$('<h3/>', {'style': 'margin-top:30px'}).appendTo($modalDialog);
	$('<div/>', {'class': 'button-row'}).appendTo($modalDialog);

	$closeDialog.on('click', function(){
		$modal.remove();
	});
	$(document).keydown(function(e) {
        // ESCAPE key pressed
        if (e.keyCode == 27) {
            $modal.remove();
        }
    });

	$('body').append($modal);

	return $modal;
};

ffd.showCourseMaterialError = function(currentCourseBlock, errorText) {
	var currentCourseBlockHeader = currentCourseBlock.find('h3');
	if (!errorText) {
		errorText = 'Unable to get materials';
	}
	$('<p/>', {
		'class': 'error-msg-top',
		text: errorText
	}).insertAfter(currentCourseBlockHeader);
};

ffd.showError = function(currentCourseBlock, errorText, method) {
	if (!errorText) {
		errorText = 'Unknown Error';
	}
	if ($('.error-msg-top').length) {
		$('.error-msg-top').remove();
	}
	var $errorMessage =  $('<p/>', {'class': 'container error-msg-top',text: errorText});
	switch (method) {
		case 'appendTo':
			return $errorMessage.appendTo(currentCourseBlock).show();
		case 'prependTo':
			return $errorMessage.prependTo(currentCourseBlock).show();
		case 'insertAfter':
			return $errorMessage.insertAfter(currentCourseBlock).show();
		case 'insertBefore':
			return $errorMessage.insertBefore(currentCourseBlock).show();
		case 'append':
			return $errorMessage.append(currentCourseBlock).show();
		case 'before':
			return $errorMessage.before(currentCourseBlock).show();
		default:
			return $errorMessage.appendTo(currentCourseBlock).show();
	}
};



ffd.cutMaterialTitles = function ($courseBlock) {
	$courseBlock.find('h4').ellipsis({row: 2});
};

ffd.renderMaterialPromotedStatus = function(status, $container) {
	var statusText = status;
	var statusTooltip = status;
	var additionalClass;
	switch (status) {
		case 'admin_pending':
			statusText = 'pending';
			statusTooltip = 'Pending institution review';
			additionalClass = 'warning';
			break;
		case 'admin_approved':
			statusText = 'Adopted';
			statusTooltip = 'Approved by institution and no campus store review required';
			additionalClass = 'success';
			break;
		case 'admin_rejected':
			statusText = 'Rejected by institution';
			statusTooltip = 'Rejected by institution';
			additionalClass = 'danger';
			break;
		case 'admin_approved_campus_pending':
			statusText = 'pending';
			statusTooltip = 'Approved by institution and pending campus store review';
			additionalClass = 'warning';
			break;
		case 'campus_pending':
			statusText = 'pending';
			statusTooltip = 'Pending campus store review';
			additionalClass = 'warning';
			break;
		case 'admin_approved_campus_approved':
			statusText = 'Adopted';
			statusTooltip = 'Approved by institution and campus store';
			additionalClass = 'success';
			break;
		case 'campus_approved':
			statusText = 'Adopted';
			statusTooltip = 'Approved by campus store';
			additionalClass = 'success';
			break;
		case 'campus_rejected':
			statusText = 'rejected';
			statusTooltip = 'Rejected by campus store';
			additionalClass = 'danger';
			break;
			                        // -269 Start
	    case 'approved':
            statusText = 'Adopted';
            statusTooltip = 'Approved by campus store';
        	additionalClass = 'success';
        	break;
	    case 'declined':
            statusText = 'Declined';
            statusTooltip = 'Declined by campus store';
        	additionalClass = 'danger';
        	break;
	    case 'completed':
            statusText = 'Adopted';
            statusTooltip = 'Approved by campus store';
        	additionalClass = 'success';
        	break;
        				            // -269 End

		default:
			additionalClass = 'warning';
			statusText = status || 'n/a';
			statusTooltip = statusText;
	}
	$container.append($('<span/>', {'class': 'status tooltip ' + additionalClass, text: statusText, title: statusTooltip, tabindex: '0'}));
};

ffd.renderMaterialTile = function($container, material, renderParameters) {
	var $listItem, $article, $itemContentBlock, $itemButtonBlock, $rule, $itemChecked, $itemInfo, materialDetailsLink;

	if (renderParameters.divisionId && renderParameters.departmentId) {
	// -269 Start
	    if (material.type === 'supply') {
	        materialDetailsLink = ffd.paths.departmentsMaterialsDetails.replace(':divisionId', renderParameters.divisionId).replace(':departmentId', renderParameters.departmentId).replace(':materialId', material.supplyId);
	    } else {
		    materialDetailsLink = ffd.paths.departmentsMaterialsDetails.replace(':divisionId', renderParameters.divisionId).replace(':departmentId', renderParameters.departmentId).replace(':materialId', material.isbn13);
		}
	} else {
	    if (material.type === 'supply') {
	        materialDetailsLink = renderParameters.courseId ? ffd.paths.courseMaterialDetails.replace(':courseId', renderParameters.courseId).replace(':materialId', material.supplyId) : ffd.paths.materialDetails.replace(':materialId', material.supplyId);
	    } else {
	        materialDetailsLink = renderParameters.courseId ? ffd.paths.courseMaterialDetails.replace(':courseId', renderParameters.courseId).replace(':materialId', material.isbn13) : ffd.paths.materialDetails.replace(':materialId', material.isbn13);
	    }
	}
	// -269 End

	$listItem = $('<li/>', {'class': 'col-xs-12 col-sm-6 col-lg-4', 'data-id': material.isbn13, 'data-type': material.type});
	$article = $('<div/>', {'class': 'material-item enhanced-mat'}).appendTo($listItem);
	$itemContentBlock = $('<div/>', {'class': 'row-fluid item-top'}).appendTo($article);

	if (material.type === 'supply'){
        $('<h3/>').append($('<a/>', {'class': 'specific-material-title', text: material.name, title: material.name, href: materialDetailsLink})).appendTo($itemContentBlock);
    } else {
        $('<h3/>').append($('<a/>', {'class': 'specific-material-title', text: material.title, title: material.title, href: materialDetailsLink})).appendTo($itemContentBlock);
    }

	$rule = $('<div/>', {'class': 'h-rule'}).appendTo($itemContentBlock);

	if (renderParameters.itemStatus) {
		$rule.addClass('rule-top');
		var $statusHolder = $('<div/>', {'class': 'item-status', text: 'Status: '}).appendTo($itemContentBlock);
		ffd.renderMaterialPromotedStatus(material.promotedStatus, $statusHolder);
		$('<div/>', {'class': 'h-rule'}).appendTo($itemContentBlock);
	}

	$('<a/>', {'class': 'col-xs-6 item-image', href: materialDetailsLink}).append($('<img/>', {'class': 'material-image', src: material.image || '/img/no-cover.png', alt: ''})).appendTo($itemContentBlock);

	$itemInfo = $('<ul/>', {'class': 'col-xs-6 item-info'}).appendTo($itemContentBlock);

	if (material.status && renderParameters.showChecked) {
		$itemChecked = $('<li/>', {'class': 'checked' + (renderParameters.isSearchPage ? ' adopted' : '')}).appendTo($itemInfo);
		var materialStatus;
        switch (material.status) {
            case 'CRQ':
                materialStatus = 'Choice Component Required';
                break;
            case 'CRM':
                materialStatus = 'Choice Component Recommended';
                break;
            case 'BR':
                materialStatus = 'Bookstore Suggested';
                break;
            case 'suggested':
                materialStatus = 'Bookstore Suggested';
                break;
            case 'choice':
                materialStatus = 'Choice';
                break;
            case 'recommended':
                materialStatus = 'Recommended';
                break;
            case 'required':
                materialStatus = 'Required';
                break;
            default:
                materialStatus = material.status;
        }
		if (ffd.user.role === 'student' || renderParameters.isSearchPage) {
			$itemChecked.text(renderParameters.isSearchPage ? 'adopted' : materialStatus);
		} else {
			$itemChecked.html($('<a/>', {href: materialDetailsLink, text: materialStatus}));
		}
	}

	if (material.rentable && material.rentable === 'available') {
		$('<li/>', {class: 'checked rental', text: 'rental available'}).appendTo($itemInfo);
	}
	if (!ffd.isStudent && material.included && material.included === 'available') {
		$('<li/>', {class: 'checked included', text: 'includED'}).appendTo($itemInfo);
	}
	if (material.espId === ffd.digitalMaterialCode.brytewave) {
		var $li = $('<li/>', {class: 'checked'});
		$li.append($('<img />', {
			'class': 'brytewave-logo-material-tile',
			src: 'https://reader.brytewave.com/app/media/images/bwlogo.png'
		}));
		$li.appendTo($itemInfo);
	}



	if (material.preApproved) {
		if (ffd.user.role === 'instructor' || ffd.user.role === 'administrator' || ffd.user.role === 'concierge') {
			$('<li/>', {'class': 'checked pre-approved', text: 'pre-approved'}).prependTo($itemInfo);
		}
	}
	// -269 Start
    if (material.type === 'supply'){
        $('<li/>', {'class': 'generic-info', text: material.manufacturer , 'data-type': 'manufacturer'}).appendTo($itemInfo);
    }
    if (material.type === 'supply'){
        $('<li/>', {'class': 'generic-info', text: material.vendorName , 'data-type': 'vendorName'}).appendTo($itemInfo);
    }
    // -269 End
	if (material.author) {
		$('<li/>', {'class': 'generic-info', text: material.author.join(', '), 'data-type': 'author'}).appendTo($itemInfo);
	}
	if (ffd.user.role === 'administrator' && material.isbn13) {
        var myRe = /^(YT)|(OER)|(ML)/; //regex checking for isbn13 starting with YT or OER
        if(myRe.test(material.isbn13)){
            $itemInfo.append($('<li>').append(
                $('<span>').attr('class', 'generic-isbn13').text("ID: ")).append(
                    $('<span>').attr('class', 'generic-isbn13-value').append(material.isbn13)
                ));
        } else {
            $itemInfo.append($('<li>').append(
                $('<span>').attr('class', 'generic-isbn13').text("ISBN-13: ")).append(
                    $('<span>').attr('class', 'generic-isbn13-value').append(material.isbn13)
                ));
        }
    }
	if (material.edition) {
		$('<li/>', {'class': 'generic-info', text: material.edition + ' Edition', 'data-type': 'edition'}).appendTo($itemInfo);
	}
	if (material.type !== 'supply'){                // -269
	    $('<li/>', {'class': 'generic-info', text: material.impn || material.source || '', 'data-type': 'publisher'}).appendTo($itemInfo);
	}
	if(material.priceStartingAt && material.priceStartingAt.length > 0) {
		$('<li/>', {'class': 'generic-info', text: 'Starting at $' + material.priceStartingAt, 'data-type': 'price'}).appendTo($itemInfo);
	}

	if (renderParameters.mustRenderEbookLink) {
		if ((ffd.user.role === 'instructor') && material.espId == 'brytewave') {
			var $a = $('<a />', {
				'class': 'access-desk-copy caret-link',
				href: ffd.paths.brytewaveLaunchProduct.replace(':productId', material.isbn13),
				text: 'ACCESS DESK COPY',
				target: '_blank'
			});
			$a.css('color', '#e17000');
			$('<li/>', {class: 'edit-adoption'}).html($a).appendTo($itemInfo);
		}
	}

	$itemButtonBlock = $('<ul/>', {'class': 'row-fluid controls'}).appendTo($article);
	$('<li/>', {'class': 'col-xs-6'}).appendTo($itemButtonBlock);

	if ($container) {
		$container.append($listItem);
	}

	return $listItem;
};

ffd.createMaterialTile = function($container, material, renderParameters) {

	var $listItem, $article, $itemContentBlock, $itemButtonBlock, $rule, $itemChecked, $itemInfo, materialDetailsLink;

	if (renderParameters.divisionId && renderParameters.departmentId) {
	// -269 Start
	    if (material.type === 'supply') {
	        materialDetailsLink = ffd.paths.departmentsMaterialsDetails.replace(':divisionId', renderParameters.divisionId).replace(':departmentId', renderParameters.departmentId).replace(':materialId', material.supplyId);
	    } else {
		    materialDetailsLink = ffd.paths.departmentsMaterialsDetails.replace(':divisionId', renderParameters.divisionId).replace(':departmentId', renderParameters.departmentId).replace(':materialId', material.isbn13);
		}
	} else {
	    if (material.type === 'supply') {
	        materialDetailsLink = renderParameters.courseId ? ffd.paths.courseMaterialDetails.replace(':courseId', renderParameters.courseId).replace(':materialId', material.supplyId) : ffd.paths.materialDetails.replace(':materialId', material.supplyId);
	    } else {
	        materialDetailsLink = renderParameters.courseId ? ffd.paths.courseMaterialDetails.replace(':courseId', renderParameters.courseId).replace(':materialId', material.isbn13) : ffd.paths.materialDetails.replace(':materialId', material.isbn13);
	    }
	}
	// -269 End

	$listItem = $('<div/>', {'class': 'card card--book card--grouped-sections', 'data-id': material.isbn13, 'data-type': material.type});
	if (renderParameters.itemStatus && !(ffd.user.role === 'student')) {
	ffd.materialPromotedStatus(material.promotedStatus, $listItem);
	}
	$itemContentBlock = $('<div/>', {'class': 'card__inner'}).appendTo($listItem);
	/*$itemContentBlock = $('<div/>', {'class': 'row-fluid item-top'}).appendTo($article);*/
	var $cardRemove = $container.find('.card__remove');
	$cardRemove.attr('data-material-id',material.isbn13);
	$cardRemove.attr('data-title',material.title);
	$itemContentBlock.append($cardRemove);
	//$itemContentBlock.append($container.find('.card__remove').attr('data-name',material.title));
	//console.log(material.title);
    var $header = $('<div/>', {'class': 'card__header'});
    if (ffd.user.role === 'student'){
    $itemContentBlock.find('.card__remove').remove();
        }
	if (material.type === 'supply'){
        $('<h1/>').append($('<div/>', {'class': 'card__header', text: material.name, title: material.name, href: materialDetailsLink})).appendTo($itemContentBlock);
    } else {
        $($header).append($('<h1/>', {'class': 'card__title is-truncated', text: material.title}));
    }


    if (/*ffd.user.role === 'administrator' && */material.isbn13) {
            var myRe = /^(YT)|(OER)|(ML)|(CM)/; //regex checking for isbn13 starting with YT or OER
            if(myRe.test(material.isbn13)){
                $header.append($('<div>').attr('class', 'card__subtitle').text("ID: ").append(material.isbn13));
            } else {
             $header.append($('<div>').append('<strong>').attr('class', 'card__subtitle').text("ISBN: ").append(material.isbn13));
            }
        }

    /*if (ffd.user.role === 'instructor' || ffd.user.role === 'student'){
        $header.append($('<div>').append('<strong>').attr('class', 'card__subtitle').text("ISBN: ").append(material.isbn13));
    }*/

/*	$rule = $('<div/>', {'class': 'h-rule'}).appendTo($itemContentBlock);*/
    $($itemContentBlock).append($header);
	/*if (renderParameters.itemStatus) {
		$rule.addClass('rule-top');
		var $statusHolder = $('<div/>', {'class': 'item-status', text: 'Status: '}).appendTo($itemContentBlock);
		ffd.renderMaterialPromotedStatus(material.promotedStatus, $statusHolder);
		$('<div/>', {'class': 'h-rule'}).appendTo($itemContentBlock);
	}*/


    var $bookDetail =$('<div/>', {'class': 'book book--detailed',style:'min-height:75%;'});
    var $bookImage = $('<div/>', {'class': 'book__image-col'});

    $bookImage.append($('<img/>', {'class': 'book__image', src: material.image || '/img/no-cover.png', alt: '','style':'max-height:45%;min-height:45%;'}));
/*
     if (material && material.format) {

        $bookImage.append($('<div/>',{'class': 'book__format',text:material.format}));

    }
*/
    $bookImage.appendTo($bookDetail);
	/*$('<a/>', {'class': 'col-xs-6 item-image', href: materialDetailsLink}).append($('<img/>', {'class': 'material-image', src: material.image || '/img/no-cover.png', alt: ''})).appendTo($itemContentBlock);*/
    /*var $bookText = $('<div class="book__text-col">');*/
     var $cardBody =$('<div class="card__body">');

	$itemInfo = $('<div/>', {'class': 'book__text-col'}).appendTo($bookDetail);
   /* $bookDetail.append($bookText);*/
    $cardBody.append($bookDetail).appendTo($itemContentBlock);


	if (material && material.format) {
		var $book_text = $('<div/>',{'class': 'book__format',text:material.format,style:'float:left;padding-left:40px;'});
		$book_text.insertAfter($bookDetail);

	}

	if (material.status && renderParameters.showChecked) {
	$itemContentBlock.find('.card__header').attr('style','height:93px;');
		$itemChecked = $('<div/>', {'class': 'card__title' + (renderParameters.isSearchPage ? ' adopted' : ''),'style':'font-size:13px;'}).appendTo($header);
		var materialStatus;
        switch (material.status) {
            case 'CRQ':
                materialStatus = 'Choice Component Required';
                break;
            case 'CRM':
                materialStatus = 'Choice Component Recommended';
                break;
            case 'BR':
                materialStatus = 'Bookstore Suggested';
                break;
            case 'suggested':
                materialStatus = 'Bookstore Suggested';
                break;
            case 'choice':
                materialStatus = 'Choice';
                break;
            case 'recommended':
                materialStatus = 'Recommended';
                break;
            case 'required':
                materialStatus = 'Required';
                break;
            default:
                materialStatus = material.status;
        }
		if (ffd.user.role === 'student' || renderParameters.isSearchPage) {
			$itemChecked.text(renderParameters.isSearchPage ? 'adopted' : materialStatus);
			$('<div/>', {'class': 'book__edition', 'style':'word-wrap: break-word'}).appendTo($itemInfo);
		} else {
			$itemChecked.html($('<a/>', {href: materialDetailsLink, text: materialStatus}));
		}
	}

	// -269 Start
    if (material.type === 'supply'){
        $('<div/>', {'class': 'book__edition', 'style':'word-wrap: break-word', text: material.manufacturer , 'data-type': 'manufacturer'}).appendTo($itemInfo);
    }
    if (material.type === 'supply'){
        $('<div/>', {'class': 'book__edition', 'style':'word-wrap: break-word', text: material.vendorName , 'data-type': 'vendorName'}).appendTo($itemInfo);
    }
    // -269 End

    if (material.edition) {
    		$('<div/>', {'class': 'book__edition', 'style':'word-wrap: break-word',  text: material.edition + ' Edition', 'data-type': 'edition'}).appendTo($itemInfo);
    	}

	if (material.author) {
		var $author = $('<div/>', {'class': 'book__source', 'style':'word-wrap: break-word','data-type': 'author'});
		$author.append('<strong>Author(s): </strong>');
		$author.append(material.author.join(', ')).appendTo($itemInfo);
	}

	if (material.type !== 'supply'){    // -269
	    var $publisher = $('<div/>', {'class': 'book__source', 'style':'word-wrap: break-word','data-type': 'Publisher:'});
	    $publisher.append('<strong>Publisher: </strong>');
        $publisher.append(material.impn || material.source || '').appendTo($itemInfo);

	}
	if(material.priceStartingAt && material.priceStartingAt.length > 0) {
		var $price = $('<div/>', {'class': 'book__source','style':'word-wrap: break-word', 'data-type': 'price'}).appendTo($itemInfo);
		$price.append('<strong>Starting Price: $</strong>');
		$price.append(material.priceStartingAt).appendTo($itemInfo);;
	}

    //var $badgeList =$('<ul class="badge-list">');



   /* var courseMaterialRatingsAndReviewsJson = ffd.paths.courseMaterialRatingsAndReviewsJson.replace(':materialId', material.isbn13);

    ffd.ajax({
        url: courseMaterialRatingsAndReviewsJson,
        type: 'GET',
        success: function(data) {
            if (data) {
                avgRating = data.averageRating;
                var $rating = $container.find('.book__rating');
                var $ratingWrapper = $rating.find('#ratingwrapper');
                var $ratingContainer = $('<div/>', {'class': 'star-rating read-only md jq-ry-container', 'data-value':'4', 'style':'width: '+avgRating*20+'%','readonly' : 'readonly'}).append($ratingWrapper);
                $('<div/>', {'class': 'book__rating'}).append($ratingContainer).insertBefore($badgeList);
            }
        }
    });*/
	if (renderParameters.mustRenderEbookLink) {
		if ((ffd.user.role === 'instructor') && material.espId == 'brytewave') {
			var $a = $('<a />', {
				'class': 'access-desk-copy caret-link',
				href: ffd.paths.brytewaveLaunchProduct.replace(':productId', material.isbn13),
				text: 'ACCESS DESK COPY',
				target: '_blank'
			});
			$a.css('color', '#e17000');
			$('<li/>', {class: 'edit-adoption'}).html($a).appendTo($itemInfo);
		}
	}


	 var $badgeList =$('<ul class="badge-list">');
    	if (material.rentable && material.rentable === 'available') {
    		$('<li/>', {class: 'book-badge book-badge--rental', text: 'Rental'}).appendTo($badgeList);
    	}
    	/*if (!ffd.isStudent && material.included && material.included === 'available') {
    		$('<li/>', {class: 'checked included', text: 'includED'}).appendTo($itemInfo);
    	}*/
    	if (material.espId === ffd.digitalMaterialCode.brytewave) {
    		$('<li/>', {class: 'book-badge book-badge--brytewave', text: 'Brytewave'}).appendTo($badgeList);
    	}

    	if (material.preApproved) {
    		if (ffd.user.role === 'instructor' || ffd.user.role === 'administrator' || ffd.user.role === 'concierge') {
    			$('<li/>', {'class': 'book-badge book-badge--pre-approved', text: 'Pre Approved'}).appendTo($badgeList);
    		}
    	}
    	$('<div/>', {class: 'book__badges'}).append($badgeList).appendTo($itemInfo);
    	
            var avgRating = material.averageRating;
            var $rating = $container.find('.book__rating');
            var $ratingWrapper = $rating.find('#ratingwrapper');
            var $ratingContainer = $('<div/>', {'class': 'star-rating read-only md jq-ry-container', 'data-value':'4', 'style':'width: '+avgRating*20+'%','readonly' : 'readonly'}).append($ratingWrapper);
        $('<div/>', {'class': 'book__rating'}).append($ratingContainer).insertBefore($badgeList);

        var $cardFooter =  $('<div class="card__footer">');

			$cardFooter.append($('<a/>', {
				'class': 'btn btn-block btn-primary',
				text: 'View Details',
				href: materialDetailsLink
			})).appendTo($itemContentBlock);

	if ($container) {
		$container.append($listItem);
	}
	return $listItem;
};



ffd.updateQueryStringParameter = function(uri, parameterElementToCheck, key, value) {
	var separator = uri.match(/=1$/) ? "&" : "";
	if (parameterElementToCheck.match(key)) {
		return uri + separator + value + '=1';
	}
	return uri;
};

ffd.initMaterialDetailsDrawer = function(){
	var
		drawer = $('.material-details-expanded .description-drawer'),
		wrap = drawer.find('drawer-wrap'),
		content = drawer.find('p'),
		toggle = drawer.find('a');

	drawer.removeClass('small active');

	if(content.height() > drawer.height()) {
		toggle.off('click');
		toggle.click(function(e){
			e.preventDefault();
			$(this).parent().toggleClass('active');
		});
	}
	else {
		toggle.off('click');
		drawer.addClass('small');
	}
};

ffd.getCurrentTimestamp = function() {
	return (new Date()).valueOf();
};

ffd.getCurrentTimeHumanReadable = function() {
	var now = new Date();
	var currentDate =
		now.getFullYear() + '-' +
		(parseInt(now.getMonth(), 10) + 1) + '-' +
		(now.getDate() < 10 ? '0' : '') + now.getDate();
	var timePeriod = 'AM';
	var hours = now.getHours();
	if (hours == 12) {
		timePeriod = 'PM';
	} else if (hours > 12) {
		timePeriod = 'PM';
		hours -= 12;
	}
	else if (hours == 0) {
		hours += 12;
	}
	var minutes = (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
	var currentTime = hours + ':' + minutes + ' ' + timePeriod;
	return currentDate + ' ' + currentTime;
};

ffd.getCurrentTimeWithSecHumanReadable = function() {
	var now = new Date();
	var currentDate =
		now.getFullYear() + '-' +
		(parseInt(now.getMonth(), 10) + 1) + '-' +
		(now.getDate() < 10 ? '0' : '') + now.getDate();
	var timePeriod = 'AM';
	var hours = now.getHours();
	if (hours == 12) {
		timePeriod = 'PM';
	} else if (hours > 12) {
		timePeriod = 'PM';
		hours -= 12;
	}
	else if (hours == 0) {
		hours += 12;
	}
	var minutes = (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
	var seconds = (now.getSeconds() < 10 ? '0' : '') + now.getSeconds();
	var currentTime = hours + ':' + minutes + ':' + seconds + ' ' + timePeriod;
	return currentDate + ' ' + currentTime;
};

ffd.exportTableToCsv = function(filename, $overrideContent){
	var $content = $overrideContent || $('.csv-export-content ');
	$content.tableExport({
		separator: ',',
		type:'csv',
		escape:'false',
		htmlContent:'false',
		consoleLog:'false',
		onCreateEventHandler: function(data){
			var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
			saveAs(blob, filename);
		}
	});
};

ffd.exportTableToPdf = function(filename, headerText, $overrideContent){
	var marginLeft = 40 , marginTop = 40;
	var $content = $overrideContent || $('.pdf-export-content');
	var doc = new jsPDF('l','pt', 'a3');
	var merginTopModificatorToCreateSpaceForHeader = headerText.split("\n").length;
	var additionalMarginTopForHeader = merginTopModificatorToCreateSpaceForHeader * 20;
	doc.text(marginLeft, marginTop, headerText);
	doc.htmlTable(marginLeft,marginTop + additionalMarginTopForHeader,$content);
	doc.save(filename);
};

ffd.getCtResponseDetails = function(ctSectionCodeReq, isStudent){
    if (typeof ctSectionCodeReq === 'undefined' || typeof isStudent === 'undefined') {
    		return {};
    }
    var ctStatusMessageMapJson = ffd.ctStatusMessageMap;
    var ctResponseDetails = {};

    for (var ctStatus in ctStatusMessageMapJson.ctStatusMessageMap) {
    		if(ctStatusMessageMapJson.ctStatusMessageMap.hasOwnProperty(ctStatus)) {
    			var ctSectionCode = ctStatusMessageMapJson.ctStatusMessageMap[ctStatus].ctSectionCode;
    			if(ctSectionCode === ctSectionCodeReq) {
                    var applicableForStudent = ctStatusMessageMapJson.ctStatusMessageMap[ctStatus].applicableForStudent;
                    var applicableForInstructor = ctStatusMessageMapJson.ctStatusMessageMap[ctStatus].applicableForInstructor;
                    if((isStudent && applicableForStudent === 'true') || (!isStudent && applicableForInstructor === 'true')) {
                        ctResponseDetails.messageInCourseCard = ctStatusMessageMapJson.ctStatusMessageMap[ctStatus].messageInCourseCard;
                        ctResponseDetails.showMaterials = ctStatusMessageMapJson.ctStatusMessageMap[ctStatus].showMaterials;
                    }
                break;
    			}
    		}
    	}
    return ctResponseDetails;
};

ffd.materialPromotedStatus = function(status, $container) {
	var statusText = status;
	var statusTooltip = status;
	var additionalClass;
	switch (status) {
		case 'admin_pending':
			statusText = 'Pending';
			statusTooltip = 'Pending institution review';
			additionalClass = 'is-pending';
			break;
		case 'admin_approved':
			statusText = 'Adopted';
			statusTooltip = 'Approved by institution and no campus store review required';
			additionalClass = 'is-adopted';
			break;
		case 'admin_rejected':
			statusText = 'Rejected';
			statusTooltip = 'Rejected by institution';
			additionalClass = 'is-rejected';
			break;
		case 'admin_approved_campus_pending':
			statusText = 'Pending';
			statusTooltip = 'Approved by institution and pending campus store review';
			additionalClass = 'is-pending';
			break;
		case 'campus_pending':
			statusText = 'Pending';
			statusTooltip = 'Pending campus store review';
			additionalClass = 'is-pending';
			break;
		case 'admin_approved_campus_approved':
			statusText = 'Adopted';
			statusTooltip = 'Approved by institution and campus store';
			additionalClass = 'is-adopted';
			break;
		case 'campus_approved':
			statusText = 'Adopted';
			statusTooltip = 'Approved by campus store';
			additionalClass = 'is-adopted';
			break;
		case 'campus_rejected':
			statusText = 'Rejected';
			statusTooltip = 'Rejected by campus store';
			additionalClass = 'is-rejected';
			break;
		// -269 Start
		case 'approved':
			statusText = 'Adopted';
			statusTooltip = 'Approved by campus store';
			additionalClass = 'is-adopted';
			break;
		case 'declined':
			statusText = 'Declined';
			statusTooltip = 'Declined by campus store';
			additionalClass = 'is-rejected';
			break;
		case 'completed':
			statusText = 'Adopted';
			statusTooltip = 'Approved by campus store';
			additionalClass = 'is-adopted';
			break;
		// -269 End

		default:
			additionalClass = 'warning';
			statusText = status || 'n/a';
			statusTooltip = statusText;
	}
	$container.append($('<span/>', {'class': 'lozenge ' + additionalClass, text: statusText,title: statusTooltip}));
};

ffd.setNavigationTab = function(){
    $("li").removeClass("active");
}

$('.loading-animation').remove();