var Paths = {
	logIn: '/log_in',
	analyticTxt: '/analytics.txt',
	realmLogIn: '/:realm',
	unsetLoginCookie: '/unset_login_cookie',
	logOut: '/log_out',
	dashboard: '/',
	help: '/help',
	roleSelection: '/role_selection',
	changeRole: '/changeRole',
	ssoError: '/sso_error',
	campusStoreDashboardAccess: '/campusStoreDashboard',

	departments: '/divisions/:divisionId/departments/:departmentId',
	departmentsApprovalType: '/divisions/:divisionId/departments/:departmentId/approval_type',
	myDepartments: '/my_departments',
	myDepartmentsJson: '/my_departments.json',
	departmentsMaterialsDetails: '/divisions/:divisionId/departments/:departmentId/materials/:materialId/details',
	departmentsDiscover: '/divisions/:divisionId/departments/:departmentId/discover',
	departmentsCoursesJson: '/terms/:termId/departments_courses.json',

	coursesJson: '/courses.json',
	conciergeCourses: '/concierge/courses.json',
	specificCourse: '/courses/:courseId',
    adoptedMaterial: '/courses/:courseId/materials/:materialId/status/:statusVal',
	courseDisciplineAndSubject: '/courses/:courseId/discipline_and_subject',
	courseNoMaterialequired: '/courses/:courseId/no_materials_required',
	discoverCourse: '/courses/:courseId/discover',
	disciplinesJson: '/subjects_by_discipline.json',
	adoptedCourseMaterialsJson: '/courses/:courseId/adopted_materials.json',
	myCourses: '/my_courses',
	approveAdoption: '/approve_adoption/department/:departmentId',
	myCoursesJson: '/terms/:termId/courses.json',
	addMaterial: '/materials/add',
	addCourseMaterial: '/courses/:courseId/materials/add',
	createMaterial: '/materials/create',
	materials: '/materials',
	courseStudentInstructions: '/courses/:courseId/student_instructions',
	adoptMaterial: '/materials/:materialId/adopt',
	manageMultipleCourseAdoption: '/courses/:courseId/materials/:materialId/manageMultipleCourseAdoption',
	adoptCourseMaterial: '/courses/:courseId/materials/:materialId/adopt',

	renderAddTitle: '/add_title',
	renderAddTitleToCourse: '/courses/:courseId/add_title',
	addTitle: '/materials/add_title/:materialId',

	adoptionReport: '/adoption_report/terms/:termId',
	adoptionReportJson: '/adoption_report.json',
	adoptionReportCsv: '/adoption_report.csv',
	adoptionReportPdf: '/adoption_report.pdf',
	adoptionReportSpecificCourse: '/adoption_report/terms/:termId/courses/:courseId',
	//Added by Mangal
	adoptionReportDeleteQuickReport: '/adoption_report_quick_report_delete/id/:id',
	adoptionReportSaveQuickReport: '/adoption_report_quick_report_save',
	adoptionReportGetQuickReport: '/adoption_report_quick_report_get',
	adoptionReportExportCsvOrPdf: '/adoption_report_export_csv_pdf/:type',
    //End
	adoptionReportEmail: '/adoption_report_email',
	adoptionReportGridData: '/adoption_report_grid_data',

	courseMaterialsApproveReject: '/courses/:courseId/materials',
	courseMaterialDetails: '/courses/:courseId/materials/:materialId/details',
	courseMaterialStudentPurchases: '/courses/:courseId/materials/:materialId/student_purchases',
	courseMaterialStudentPurchasesJson: '/courses/:courseId/materials/:materialId/student_purchases.json',
	courseMaterialRatingsAndReviewsJson: '/materials/:materialId/ratings_reviews.json',
	courseMaterialAssociatedMaterials: '/courses/:courseId/materials/:materialId/associated_materials.json',
	myLibrary: '/my_library',
	manageCourseBySection: '/courses/:courseId/split',
	unsplitCourse: '/courses/:courseTermSectionId/unsplit',
	getCourseEduAccessUrl: '/courses/:courseId/edu',

	materialsPreApprove: '/materials/:materialId/pre-approve',
	materialDetails: '/materials/:materialId/details',
	materialEspAccess: '/materials/:materialId/esp_access',
	getMaterialAccessUrl: '/materials/:materialId/esp_access_url',
	postMaterialAccessCode: '/materials/:materialId/esp_access_code',
	materialAssociatedMaterials: '/materials/:materialId/associated_materials.json',
	materialsSearch: '/materials/search',
	materialsSearchJson: '/materials/search.json',
	materialAdoptionStatus: '/materials/:materialId/adoption_status.json',
	courseMaterialAdoptionStatus: '/courses/:courseId/materials/:materialId/adoption_status',
	removeAdoptedMaterial: '/courses/:courseId/materials/:materialId/remove',
	removeMaterialFromLibrary: '/materials/:materialId/remove_from_library',
	purchaseMaterial: '/materials/purchase',
	getRegistrationUrl: '/materials/purchase/registration',
	getGuestUrl: '/materials/purchase/guest',
	getForgotPasswordUrl: '/materials/purchase/forgot_password',
	termDivisionDepartmentMaterialAdoptionStatus: '/materials/termDivisionDepartmentMaterialAdoptionStatus',
	materialIsExist: '/materials/is_exists/:isbn',

	marketingDashboard: '/marketing',
	marketingPublisherWeights : '/marketing/publisher_weights',
	marketingFeaturedItems: '/marketing/featured_items',
	marketingAdCampaigns: '/marketing/ad_campaigns',
	marketingManageSpecificCampaign: '/marketing/:campaignId/manage',
	marketingAddCampaign: '/marketing/add_campaign',

	messageCenter: '/message_center',
	inboxMessages: '/message_center/inbox',
	newMessage: '/message_center/new/:to',
	sendNewMessage: '/message_center/new/:to/send',
	messageCenterSettings: '/message_center/settings',
	specificMessage: '/message_center/:messageId',
	replyOnSpecificMessage: '/message_center/:messageId/reply',

	getCopyMaterials: '/copy',
	postCopyMaterials: '/materials/copy',

	settings: '/settings',
	resetCourse: '/settings/reset_course',

	rawEAuthFail: '/courses/:courseId/e_auth_fail',
	eAuthFail: '/courses/:courseId/e_auth_fail',
	termEAuthFail: '/terms/:termId/e_auth_fail',

	backEnd: '/back_end',
	version: '/version',

	brytewaveLaunchProduct: '/brytewave/launch_product/:productId',
	brytewaveGetLaunchProductFormData: '/brytewave/launch_product/form_data/:productId',

	setCookie: '/set_cookie',
	showForgotPassword: '/showForgetPassword',
	forgotPassword: '/forgotPassword',
	resetPassword: '/resetPassword',
	showResetPassword: '/showResetPassword',
	activateUser: '/activateUser',
	fdLoginFromAdminTool: '/fdLoginFromAdminTool',
	processLogInAfterPasswordReset: '/processLogInAfterPasswordReset',
	accountSettings: '/accountSettings',
	storeTermsAndConditionsValue:'/storeTermsAndConditionsValue',
    sendCourseMail:'/sendCourseMail',
    defaultTerm:'/defaultTerm',
    myLibraryImportMaterials:'/myLibraryImportMaterials',
    fdCaslogOut: '/fdCaslogOut',
    getInstructorData:'/getInstructorData',
    manageAdoptionForNoCourse: '/materials/:materialId/manageAdoptionForNoCourse',
    manageCourses: '/courses/:courseId/materials/:materialId/manageCourses'

};

module.exports = Paths;
