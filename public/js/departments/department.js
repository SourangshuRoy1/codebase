(function() {
	var isStudentsPage = false,
		departmentId,
		divisionId,
		$pageHeader,
		$materialItemTemplate,
		$noMaterialTemplate,
		$materialsContainerThrobber,
		$topAdoptedMaterialsContainer,
		$selectApprovalType,
		$unapproveMaterialLink,
		$unapproveMaterialLinkThrobber,
		$discoverBtn,
		$btnApprovalType;

	var onDomReady = function() {
		//$discoverBtn = $('.cta.discover');
		$discoverBtn = $('.prompt-row__action.btn.btn-secondary');
		//$materialItemTemplate = $('.material-list').find('li.col-lg-4').detach();
		$materialItemTemplate = $('.layout-cards-grid.responsive-compress-inner-cards').find('.card.card--book.card--grouped-sections').detach();
		//$noMaterialTemplate = $('.dashed-box').detach();
		$noMaterialTemplate = $('.card__inner__dot').detach();
		//$topAdoptedMaterialsContainer = $('.materials-container');
		$topAdoptedMaterialsContainer = $('#materialContainer');
		//$btnApprovalType = $('#btn-approval-type');
		$btnApprovalType = $('.btn.btn-secondary.btn-with-icon.btn-smaller');
		//$selectApprovalType = $('.select-approval-type');
		$selectApprovalType = $('#filter-subject');

		$('body').addClass('course');
		//$pageHeader = $('.page-title').find('h2');
		$pageHeader = $('.subject-header__title');

		if (ffd.pageData && ffd.pageData.department) {
        	$pageHeader.text(ffd.pageData.department.name);
        }

		$materialsContainerThrobber = ffd.showThrobber($topAdoptedMaterialsContainer, 'insertAfter');

		$('select').removeAttr('style');

		//if (ffd.pageData && ffd.pageData.department) {
		//	$pageHeader.text(ffd.pageData.department.name);
		//	$('<span/>', {'class': 'small-course-title', text: ffd.pageData.department.id || '', title: ffd.pageData.department.id || ''}).appendTo($pageHeader);
		//}

		renderPage(ffd.pageData);

		window.setTimeout(function() {
			ffd.adjustMaterialTitles($('.materials-container').find('ul.material-list'), isStudentsPage);
			$('.generic-info').ellipsis({row: 2});
		}, 100);

		$btnApprovalType.on('click', function(e){
			var approvalType = $selectApprovalType.val(),
				$btnApprovalTypeThrobber, $this = $(this);
			$this.text('');
			$btnApprovalTypeThrobber = ffd.showThrobber($(this), 'appendTo');
			e.preventDefault();
			ffd.ajax({
				url: ffd.paths.departmentsApprovalType.replace(':divisionId', divisionId).replace(':departmentId', departmentId),
				type: 'PUT',
				data: {
					approvalType: approvalType
				},
				success: function(data) {
					if (data < 200 || data > 201) {
						errorApprovalType();
					}
				},
				error: function() {
					errorApprovalType();
				},
				complete: function() {
					$btnApprovalTypeThrobber.remove();
					$this.text('Save');
				}
			});
			return false;
		});
		/*$unapproveMaterialLink = $('.edit-adoption').find('.caret-link');
		$unapproveMaterialLink.on('click', function(e){
			e.preventDefault();
			$unapproveMaterialLinkThrobber = ffd.showThrobber($(this), 'insertAfter');
			unapproveMaterial($(this).attr('data-material-id'));
		});*/

		$unapproveMaterialLink = $('.card__remove');
		var $modal = $('#removeMaterial');
        		$unapproveMaterialLink.on('click', function(e){
        		var $btnRow = $modal.find('.material-remove-options');
        		var $materialId = $(this).attr('data-material-id');
        		$btnRow.find('#materialRemoveYes').attr('data-material-id',$materialId);
        		$modal.removeClass('_display_none').addClass('in');
                $modal.css("display","block");

					setTimeout(function(){
						console.log("within func");
						$('#materialRemoveYes').focus();
					}, 500);
					$("#materialRemoveNo").blur(function() {
						$('#materialRemoveYes').focus();
					});

                 $('#materialRemoveYes').on('click', function() {
                         e.preventDefault();
                         $('.material-remove-options').addClass('_display_none');
                         $unapproveMaterialLinkThrobber = ffd.showThrobber($('.material-remove-options'), 'insertAfter');
                         unapproveMaterial($(this).attr('data-material-id'));
                                });
       		});

        		initializeEscModalClick();

            $('#materialRemoveNo').on('click', function() {
                             $modal.removeClass('in').addClass('_display_none');
                             $modal.css("display","none");
                                    });

	};




	$(onDomReady);



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


	function errorApprovalType() {
		$('.error-msg-top').remove();
		ffd.showMessage('Unable to update approval type', 'error-msg-top', $('.store-status-wrap'));
	}

	function renderPage(data) {
		if (data.error) {
			$materialsContainerThrobber.remove();
			$('.section-header').hide();
			$('.error-msg-top').remove();
			ffd.showMessage('Unable to get departments', 'error-msg-top', $('#materialContainer'));
			return false;
		}
		if(data && data.department) {
			var departmentData = data.department;
			var adoptedMaterials = data.department.preApprovedMaterials;

			departmentId = departmentData.id;
			divisionId = departmentData.divisionId;

			var departmentsDiscoverLink = $discoverBtn.attr('href').replace(':divisionId', divisionId).replace(':departmentId', departmentId);
			$discoverBtn.attr('href', departmentsDiscoverLink);
			$selectApprovalType.val(departmentData.approvalType || '');
			//var $adoptedMaterialsContainer = $topAdoptedMaterialsContainer.find('ul.material-list');
			var $adoptedMaterialsContainer = $topAdoptedMaterialsContainer.find('.layout-cards-grid.responsive-compress-inner-cards');
			if (adoptedMaterials && adoptedMaterials.length > 0) {
				for (var i = 0; i < adoptedMaterials.length; i++) {
					var adoptedMaterial = adoptedMaterials[i], $materialItem, $itemInfo, $accessLink, $materialAdoptLink,
						renderParameters = {divisionId: divisionId, departmentId: departmentId};

                    $materialItem = ffd.createMaterialTile($materialItemTemplate.clone(), adoptedMaterial, renderParameters);

					//$itemInfo = $materialItem.find('ul.item-info');
					$itemInfo = $materialItem.find('book__text-col');
					$accessLink = $materialItem.find('a.edit');

					/*$materialAdoptLink = $('<li/>', {'class': 'edit-adoption'}).appendTo($itemInfo);
					$('<span/>', {'class': 'caret-link', text: 'Remove', 'data-material-id': adoptedMaterial.isbn13}).appendTo($materialAdoptLink);*/

					$materialItem.attr('data-id', adoptedMaterial.isbn13).attr('data-type', adoptedMaterial.type);
				/*	$itemInfo.find('li.checked').not('.included, .rental').hide();*/

					var $controls = $materialItem.find('ul.controls.row-fluid');
					if (adoptedMaterial.url) {
						$accessLink.attr('href', adoptedMaterial.url).attr('target', '_blank');
						$materialItem.find('.controls li:last-child').remove();
					} else if (isStudentsPage) {
						$accessLink.parent('li').remove();
					} else {
						$controls.css('border-top', 'none');
						$controls.empty();
					}
					$materialItem.find('.item-status').remove();
					$materialItem.appendTo($adoptedMaterialsContainer);
				}
				$adoptedMaterialsContainer.removeClass('_display_none');
			} else {
				var $noMaterialMessage = $noMaterialTemplate.clone();
				$('.section-header').remove();
				//$noMaterialMessage.find('.cta.blue').attr('href', ffd.paths.departmentsDiscover.replace(':divisionId', divisionId).replace(':departmentId', departmentId));
				$noMaterialMessage.find('.btn.btn-block.btn-primary').attr('href', ffd.paths.departmentsDiscover.replace(':divisionId', divisionId).replace(':departmentId', departmentId));
				$noMaterialMessage.removeClass('_display_none');
                $('<div/>', {'class': 'card card--book card--grouped-sections'}).append($noMaterialMessage).appendTo($adoptedMaterialsContainer);
				//$adoptedMaterialsContainer.append($noMaterialMessage);
				$topAdoptedMaterialsContainer.parent('section').addClass('no-materials');
			}
			$('.material-header').ellipsis({row: 3});
		}
		$materialsContainerThrobber.remove();
	}

	var unapproveMaterial = function(isbn13){
		var url = ffd.paths.departmentsMaterialsDetails.replace(':divisionId', divisionId).replace(':departmentId', departmentId).replace(':materialId', isbn13);
		$unapproveMaterialLink.addClass('inactive');
		ffd.ajax({
			url: url,
			type: 'DELETE',
			data: {
				isbn13: isbn13
			},
			success: function(data) {
				if (data === 200 || data === 201) {
					window.location = window.location.href;
				} else {
					ffd.showMessage('Unable to remove material', 'error-msg-top', $('.store-status-wrap'));
				}
			},
			error: function() {
				ffd.showMessage('Unable to remove material', 'error-msg-top', $('.store-status-wrap'));
			},
			complete: function(){
				$unapproveMaterialLinkThrobber.remove();
				$unapproveMaterialLink.removeClass('inactive');
			}
		});
		return false;
	};
})();
