(function(){
	var $pageTitle,
		$materialsContainer,
		$materialListContainer,
		$materialList,
		$body,
		$pageHeader,
		$materialsContainerThrobber;
	$(function(){
		//courseId = ffd.pageData.courseId;

		$pageTitle = $('.page-title');
		$materialsContainer = $('.materials-container');
		$pageTitle.removeClass('filter');
		$materialListContainer = $materialsContainer.find('.material-list');
		$materialList = $materialListContainer.find('li.col-lg-4').detach();
		$body = $('body');

		$body.addClass('course administrator');

		$('.loading-animation').remove();
		$materialsContainerThrobber = ffd.showThrobber($materialsContainer, 'appendTo');
		var addMaterialHref = ffd.paths.addCourseMaterial.replace(':courseId', ffd.pageData.courseId);
		$('.add-course-material').attr('href', addMaterialHref);

		renderPage();

		window.setTimeout(function() {
			$('.generic-info').ellipsis({row: 2});
			$('.material-item h3 a').ellipsis({row: 3});
			ffd.adjustMaterialTitles($('.materials-container').find('ul.material-list'));

		}, 100);

		$materialsContainerThrobber.remove();

		$('.cta.approve').on('click', function(e){
			e.preventDefault();
			var isbn13 = $(this).closest('li.col-lg-4').data('id'),
				buttons = $(this).closest('.row-fluid.controls').find('li.col-xs-6').not('li.access'),
				courseId = ffd.pageData.courseId,
				$buttonsThrobber = ffd.showThrobber($(this).closest('.material-item'), 'appendTo');
			removeErrorMsg();
			buttons.hide();
			ffd.ajax({
				url: ffd.paths.courseMaterialsApproveReject.replace(':courseId', courseId),
				type: 'PUT',
				dataType: 'json',
				data: {
					approveReject: {
						"approve": [{"isbn13": isbn13.toString()}]
					}
				},
				success: function(data) {
					if (data.error) {
						ffd.showMessage('Unable to approve material', 'error-msg-top', $('.container.materials-container h2.section-header'));
						return false;
					}
					location.reload();
				},
				error: function() {
					ffd.showMessage('Unable to approve material', 'error-msg-top', $('.container.materials-container h2.section-header'));
				},
				complete: function(){
					buttons.show();
					$buttonsThrobber.remove();
				}
			});
		});

		$('.edit.reject').on('click', function(e){
			e.preventDefault();
			var isbn13 = $(this).closest('li.col-lg-4').data('id'),
				buttons = $(this).closest('.row-fluid.controls').find('li.col-xs-6').not('li.access'),
				courseId = ffd.pageData.courseId,
				$buttonsThrobber = ffd.showThrobber($(this).closest('.material-item'), 'appendTo');
			removeErrorMsg();
			buttons.hide();
			ffd.ajax({
				url: ffd.paths.courseMaterialsApproveReject.replace(':courseId', courseId),
				type: 'PUT',
				dataType: 'json',
				data: {
					approveReject: {
						reject: [{isbn13: isbn13}]
					}
				},
				success: function(data) {
					if (data.error) {
						ffd.showMessage('Unable to reject material', 'error-msg-top', $('.container.materials-container h2.section-header'));
						return false;
					}
					location.reload();
				},
				error: function() {
					ffd.showMessage('Unable to reject material', 'error-msg-top', $('.container.materials-container h2.section-header'));
				},
				complete: function() {
					buttons.show();
					$buttonsThrobber.remove();
				}
			});
		});

		$('.tooltip').tooltipster({
			theme: 'tooltipster-shadow'
		});
	});

	function removeErrorMsg() {
		if ($('.error-msg-top').length) {
			$('.error-msg-top').remove();
		}
	}

	function renderPage(){
		if (ffd.pageData.course) {
			var materials = ffd.pageData.course.materials,
				courseId = ffd.pageData.courseId;
			$pageTitle.find('h2').text(ffd.pageData.course.description);
			$pageHeader = $pageTitle.find('h2');
			$('<span/>', {'class': 'small-course-title', text: ffd.pageData.shortName || '', title: ffd.pageData.shortName || ''}).appendTo($pageHeader);

			if (materials && materials.length) {
				$.each(materials, function(i, material){
					if (typeof material === 'object') {
						var $materialListItem, $controls, $controlsBtnRow,
							renderParameters = {courseId: courseId, itemStatus: true, showChecked: true};

						$materialListItem = ffd.renderMaterialTile($materialListContainer, material, renderParameters);
						$controls = $materialListItem.find('ul.controls.row-fluid');
						$controlsBtnRow = $('<li/>', {'class': 'col-xs-6'});
						$materialListItem.find('.edit-adoption').hide();

						$controls.empty();
						if (material.url) {
							addAccessOrPurchaseBtn($controlsBtnRow, 'access', $controls, material.url, '_blank', 'Access', 'edit');
						}
						addAccessOrPurchaseBtn($controlsBtnRow, null, $controls, null, null, 'Approve', 'cta approve');
						addAccessOrPurchaseBtn($controlsBtnRow, null, $controls, null, null, 'Reject', 'edit reject');

						$materialListContainer.append($materialListItem);
					} else {
						$materialsContainer.find('h2.section-header').text('No materials.');
						return false;
					}
				});
				$materialListContainer.removeClass('_display_none');
			} else {
				$materialsContainer.find('h2.section-header').text('No materials.');
			}
		} else {
			ffd.showMessage('Unable to get course', 'error-msg-top', $('.container.materials-container h2.section-header'));
		}
	}

	function addAccessOrPurchaseBtn($btnRow, btnRowClass, $btnContainer, btnHref, btnTarget, btnLabel, btnClass) {
		if (!btnClass) {
			btnClass = 'cta';
		}
		var $btnHolder  = $btnRow.clone();
		if (btnRowClass) {
			$btnHolder.addClass(btnRowClass);
		}
		if (btnHref) {
			$('<a/>', {'class':btnClass, href: btnHref, text: btnLabel, target: btnTarget}).appendTo($btnHolder);
		} else {
			$('<button/>', {'class':btnClass, text: btnLabel}).appendTo($btnHolder);
		}
		$btnHolder.appendTo($btnContainer);
	}
})();
