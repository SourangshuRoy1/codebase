(function() {
	var $departmentsGroup,
		$departmentsGroupThrobber,
		onboardTutorialData = ffd.onboardTutorial,
        $onboardModalAdministrator = $('#modal-welcome-administrator'),
        $onboardSlideModalAdministrator = $('#onboardSlidesAdministrator'),
        $onboardWelcomeModalAdministrator = $('#welcomeSlideAdministrator'),
		$errorMsgTop;
	var onDomReady = function() {
		$('body').addClass('my-departments');
		$('#myDepartment').addClass('active');

		$departmentsGroup = $('#departments-group');
		$errorMsgTop = $('<p/>', {'class': 'error-msg-top'});

		$departmentsGroup.empty();

		getDepartmentsGroupAJAX();

        var isNewLoginSession = sessionStorage.getItem(ffd.userData.bk_person_id);
        if(ffd.userData.isNewLogin && ffd.userData.isNewLogin === 'Y' && !isNewLoginSession){
            sessionStorage.setItem(ffd.userData.bk_person_id,'Y');
        $('#modal-welcome-administrator').modal({
             backdrop: 'static',
             keyboard: false,
             show: true
         });
         createTutorialWindowAdmin();
         setTimeout(function(){
              $('#hiddenBtn').click();
         }, 500);
    }

	};

	$(onDomReady);

	function createTutorialWindowAdmin() {
        var role = ffd.user.role;

        // welcome slide population

        var welcomeContent = onboardTutorialData.role[role].welcome_page;
        $onboardWelcomeModalAdministrator.find('.slide__title').text(welcomeContent.title);
        var $welcomeImage = $onboardWelcomeModalAdministrator.find('.slide__bannerImage');
        $welcomeImage.attr('src',welcomeContent.src);
        $welcomeImage.on("load",function(){
            $(this).css('border', "solid 2px black");
        })
        var $text = $.parseHTML(welcomeContent.content);
        $onboardWelcomeModalAdministrator.find('.slide__content.prose.prose-large.contained-block').text('');
        $onboardWelcomeModalAdministrator.find('.slide__content.prose.prose-large.contained-block').append($text);
//        $('#modal-welcome-footer').css('height' , "700px");

        var pageContent = onboardTutorialData.role[role].tutorial_slide;
        var $slide = $onboardModalAdministrator.find('#onboardSlidesAdministrator').detach();
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
            $onboardModalAdministrator.find('.slider.with-dots.welcome-slider').append($cloneSlide);
        }
        $('#begin_tour_admin').on("click",function(){
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
                $('.slick-track').find('.slick-active').find('.slide__footer').find('.btn-primary.btn-wide.slick-next').attr('id','close4');
            }/*else{
                $('.slick-track').find('.slick-active').find('.slide__footer').removeClass('_display_none');
            }*/
            $('#close4').on("click",function(){
                $onboardModalAdministrator.modal('hide');
            })
        })
    }

	function getDepartmentsGroupAJAX() {
		var url = ffd.paths.myDepartmentsJson;
		$departmentsGroupThrobber = ffd.showThrobber($departmentsGroup, 'insertAfter');
		ffd.ajax({
			url: url,
			type: 'GET',
			success: function(data) {
				if (data && data.departments) {
					renderDepartments(data.departments);
				} else {
					var $p = $('<p/>', {'class': 'alert-message', text: 'There are no departments'});
					$departmentsGroup.after($p);
				}
			},
			error: function() {
				$departmentsGroup.after($errorMsgTop.text('Unable to get departments.').show());
			},
			complete: function() {
				$departmentsGroupThrobber.remove();
			}
		});
	}

	function renderDepartments(data) {
		$.each(data, function(index, value){
		var adoptPermissionLink =  $('<a/>', {'class': 'btn btn-block btn-primary', href: '/divisions/' + value.divisionId + '/departments/' + value.id, text: 'Set Adoption Permissions'});
		var preApprovedMaterials = $('<a/>', {'class': 'btn btn-block btn-primary', href: '/divisions/' + value.divisionId + '/departments/' + value.id + '/discover', text: 'Pre-Approve Materials'});
		var approveAdoption =      $('<a/>', {'class': 'btn btn-block btn-primary', href: '/approve_adoption/'+ 'department/' + value.id, text: 'Approve Adoptions'});

       /* var subject = $('<h1 class="card__title" >'+ value.name);*/

        var cardsubject =$('<div>')
                                .append($('<div class="card card--subject">')
                                .append($('<div class="card__inner">')
                                .append($('<div class="card__header" style="height: 66px;">')
                                .append($('<h1/>', {'class': 'card__title', text: value.name})))
                                .append($('<div class="card__body" style= "height:280px;">')
                                .append($('<div class="card__body__content"  style=" padding-top: 30px; border-bottom: 0px;height: 80px;">')
                                .append($('<div class="stacked-items--link-btn">').append(adoptPermissionLink)))
                                .append($('<div class="card__body__content"  style=" padding-top: 30px; border-bottom: 0px;height: 80px;">')
                                .append($('<div class="stacked-items--link-btn">').append(preApprovedMaterials)))
                                .append($('<div class="card__body__content"  style=" padding-top: 30px; border-bottom: 0px;height: 80px;">')
                                .append($('<div class="stacked-items--link-btn">').append(approveAdoption))))));

                         $departmentsGroup.append(cardsubject);


			/*var $li = $('<li/>', {'class': 'col-xs-12 col-md-6'}),
				$aLink = $('<a/>', {'class': 'ffd-departments_name-url', href: '/divisions/' + value.divisionId + '/departments/' + value.id, text: value.name});
			$departmentsGroup.append($li.html($aLink));*/
		});
		$departmentsGroup.show();
	}


})();

function loadReport()
{
   var term = $('#defaultTermId').val();
   var uri = location.origin;
	if (!uri) {
		uri = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
	}
   var path = "/adoption_report/terms/";
   var res = encodeURIComponent(term);
   var completeUrl = uri + path + res;
   window.open(completeUrl,'_self');
}
