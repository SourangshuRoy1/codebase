var Paths = require('./paths');
var HomeController = require('../controllers/home');
var AuthController = require('../controllers/auth');
var AuthenticationController = require('../controllers/authentication');
var CoursesController = require('../controllers/courses');
var MaterialsController = require('../controllers/materials');
var MarketingController = require('../controllers/marketing');
var DepartmentsController = require('../controllers/departments');
var AdoptionReportController = require('../controllers/adoption_report');
var SettingsController = require('../controllers/settings');
var MessageCenterController = require('../controllers/message_center');
var BryteWaveController = require('./../controllers/brytewave');
var AuthDataAccess = require('../data_access/auth');
var SubjectsByDiscipline = require('../data_access/disciplines.json');
var CtStatusMessageMap = require('../data_access/ctStatusMessageMap.json');
var digitalMaterialCode = require('../data_access/digitalMaterialCode.json');
var Cookies = require('./../utilities/cookies');
var OnboardTutorial = require('../data_access/onboard.json');


var pathHandlers = [ // array because order matters when adding handlers
	{
		pathId: 'logIn',
		methods: {
			get: {
				handler: AuthController.logIn,
				pageTitle: 'Login'
			},
			post: AuthController.processLogIn,
			put: AuthController.processLoginWithSpecificRole
		}
	},
	{
		pathId: 'showForgotPassword',
		methods: {
			post: {
				handler: AuthenticationController.forgotPassword,
				pageTitle: 'Forgot Password'
			}
		}
	},
	{
        pathId: 'forgotPassword',
        methods: {
            post: AuthenticationController.processForgotPassword
        }
    },
    {
        pathId: 'resetPassword',
        methods: {
            get: {
                handler: AuthenticationController.validatePasswordResetLink,
                pageTitle: 'Reset Password'
            },
            post: AuthenticationController.savePassword
        }
    },
    {
        pathId: 'activateUser',
        methods: {
            get: {
                handler: AuthenticationController.validateActivationLinkAndActivateUser,
                pageTitle: 'Activate User'
            },
            post: AuthenticationController.savePassword
        }
    },
    {
        pathId: 'showResetPassword',
        methods: {
            post: AuthenticationController.showResetPassword
        }
    },
	{
		pathId: 'accountSettings',
		methods: {
			get: {
				handler: AuthenticationController.showAccountSettingsPage,
				includeUserData: true,
				pageTitle: 'Account Settings',
				allowedRoles: ['administrator','concierge']
			},
			post: {
				handler: AuthenticationController.updateUserAccountSettings,
				includeUserData: true,
				pageTitle: 'Account Settings',
				allowedRoles: ['administrator','concierge']
			}
		}
	},
	{
		pathId: 'analyticTxt',
		methods: {
			get: {
				handler: AuthController.renderAnalytic,
				pageTitle: 'renderAnalytic'
			}
		}
	},
	{
		pathId: 'unsetLoginCookie',
		methods: {
			delete: {
				handler: AuthController.unsetLoginCookie
			}
		}
	},
	{
		pathId: 'logOut',
		methods: {
			get: {
				handler: AuthController.processLogOut,
				includeUserData: true
			}
		}
	},
	{
		pathId: 'roleSelection',
		methods: {
			get: {
				handler: AuthController.roleSelection,
				pageTitle: 'Role Selection'
			}
		}
	},
    {
    pathId: 'fdCaslogOut',
        methods: {
            get: {
                handler: AuthController.fdCasLogout,
                pageTitle: 'Fd CAS Logout'
            }
        }
    },
 	{
        pathId: 'changeRole',
        methods: {
        get: {
            handler: AuthController.changeRole,
            }
        }
    },
	{
		pathId: 'ssoError',
		methods: {
			get: {
				handler: AuthController.ssoError,
				pageTitle: 'SSO error'
			}
		}
	},
	{
		pathId: 'campusStoreDashboardAccess',
		methods: {
			get: {
				handler: AuthController.campusStoreDashboard
			}
		}
	},
	{
		pathId: 'dashboard',
		methods: {
			get: {
				handler: HomeController.index,
				includeUserData: true,
				pageTitle: 'Instructor Dashboard'
			}
		}
	},
	{
		pathId: 'help',
		methods: {
			get: {
				handler: HomeController.help,
				includeUserData: true,
				pageTitle: 'Faculty Discovery Help'
			}
		}
	},

	{
		pathId: 'coursesJson',
		methods: {
			get: {
				handler: CoursesController.coursesJson
			}
		}
	},
	{
		pathId: 'conciergeCourses',
		methods: {
			get: {
				handler: CoursesController.getConciergeCourses
			}
		}
	},
	{
		pathId: 'specificCourse',
		methods: {
			get: {
				handler: CoursesController.specificCourse,
				includeUserData: true,
				pageTitle: 'Course Materials'
			}
		}
	},
	{
		pathId: 'courseDisciplineAndSubject',
		methods: {put: CoursesController.setCourseDisciplineAndSubject}
	},
	{
		pathId: 'courseNoMaterialsRequired',
		methods: {post: CoursesController.setNoMaterialsRequired}
	},
	{
		pathId: 'discoverCourse',
		methods: {
			get: {
				handler: CoursesController.discoverCourse,
				includeUserData: true,
				pageTitle: 'Discover Course Materials'
			}
		}
	},
	{
		pathId: 'manageCourseBySection',
		methods: {post: CoursesController.manageCourseBySection}
	},

	{
		pathId: 'unsplitCourse',
		methods: {post: CoursesController.unsplitCourse}
	},
	{
		pathId: 'getCourseEduAccessUrl',
		methods: {get: CoursesController.getCourseEduAccessUrl}
	},

	{
		pathId: 'departmentsDiscover',
		methods: {
			get: {
				handler: MaterialsController.discoverDepartment,
				includeUserData: true
			}
		}
	},
	{
		pathId: 'departments',
		methods: {
			get: {
				handler: DepartmentsController.departments,
				includeUserData: true,
				allowedRoles: ['administrator']
			}
		}
	},
	{
		pathId: 'departmentsApprovalType',
		methods: {
			put: {
				handler: DepartmentsController.approvalType,
				includeUserData: true,
				allowedRoles: ['administrator']
			}
		}
	},
	{
		pathId: 'myDepartments',
		methods: {
			get: {
				handler: DepartmentsController.myDepartments,
				includeUserData: true,
				pageTitle: 'My Departments',
				allowedRoles: ['administrator']
			}
		}
	},
	{
		pathId: 'myDepartmentsJson',
		methods: {
			get: {
				handler: DepartmentsController.myDepartmentsJson,
				includeUserData: true,
				allowedRoles: ['administrator']
			}
		}
	},
	{
		pathId: 'departmentsMaterialsDetails',
		methods: {
			get: {
				handler: DepartmentsController.departmentsMaterialsDetails,
				includeUserData: true,
				allowedRoles: ['administrator']
			},
			post: {
				handler: DepartmentsController.postPreApprovedDepartmentsMaterials,
				includeUserData: true,
				allowedRoles: ['administrator']
			},
			delete: {
				handler: DepartmentsController.deletePreApprovedDepartmentsMaterials,
				includeUserData: true,
				allowedRoles: ['administrator']
			}
		}
	},
	{
		pathId: 'departmentsCoursesJson',
		methods: {
			get: DepartmentsController.departmentsCoursesJson
		}
	},

	{
		pathId: 'myCourses',
		methods: {
			get: {
				handler: CoursesController.myCourses,
				includeUserData: true,
				pageTitle: 'My Courses'
			}
		}
	},

	{
    		pathId: 'approveAdoption',
    		methods: {
    			get: {
    				handler: CoursesController.myCourses,
    				includeUserData: true,
    				pageTitle: 'Approve Adoption'
    			}
    		}
    	},

	{
		pathId: 'myCoursesJson',
		methods: {
			get: {
				handler: CoursesController.myCoursesJson
			}
		}
	},
	{
		pathId: 'disciplinesJson',
		methods: {get: CoursesController.disciplinesJson}
	},
	{
		pathId: 'adoptedCourseMaterialsJson',
		methods: {get: MaterialsController.adoptedCourseMaterialsJson}
	},
	{
		pathId: 'courseStudentInstructions',
		methods: {post: CoursesController.editSpecialInstructions}
	},
	{
		pathId: 'myLibrary',
		methods: {
			get: {
				handler: MaterialsController.myLibrary,
				allowedRoles: ['instructor', 'concierge', 'administrator'],
				pageTitle: 'My Library',
				includeUserData: true
			},
			post: {
				handler: MaterialsController.addMaterialToLibrary
			}
		}
	},
	{
        pathId: 'myLibraryImportMaterials',
        methods: {
            post: {
                handler: MaterialsController.myLibraryImportMaterials,
                includeUserData: true,
                allowedRoles: ['concierge']
            }
        }
    },
	{
		pathId: 'removeMaterialFromLibrary',
		methods: {
			delete: {
				handler: MaterialsController.removeMaterialFromLibrary
			}
		}
	},
	{
		pathId: 'addMaterial',
		methods: {
			get: {
				handler: MaterialsController.addMaterial,
				includeUserData: true,
				pageTitle: 'Add My Content',
				allowedRoles: ['instructor', 'concierge']
			}
		}
	},
	{
		pathId: 'addCourseMaterial',
		methods: {
			get: {
				handler: MaterialsController.addMaterial,
				includeUserData: true,
				pageTitle: 'Add My Content',
				allowedRoles: ['instructor', 'concierge']
			}
		}
	},
	{
		pathId: 'createMaterial',
		methods: {
			get: {
				handler: MaterialsController.createMaterial,
				includeUserData: true,
				pageTitle: 'Add My Content',
				allowedRoles: ['instructor', 'concierge']
			}
		}
	},
	{
		pathId: 'adoptMaterial',
		methods: {
			get: {
				handler: MaterialsController.adoptMaterial,
				includeUserData: true,
				pageTitle: 'Adopt Course Material',
				allowedRoles: ['instructor', 'concierge']
			}
		}
	},
	{
        pathId: 'manageMultipleCourseAdoption',
        methods: {
            get: {
                handler: MaterialsController.manageMultipleCourseAdoption,
                includeUserData: true,
                pageTitle: 'Manage Adoption for Multiple Courses',
                allowedRoles: ['instructor', 'concierge']
            }
        }
    },
	{
		pathId: 'adoptCourseMaterial',
		methods: {
			get: {
				handler: MaterialsController.adoptMaterial,
				includeUserData: true,
				pageTitle: 'Adopt Course Material',
				allowedRoles: ['instructor', 'concierge']
			}
		}
	},

	{
		pathId: 'renderAddTitle',
		methods: {
			get: {
				handler: MaterialsController.renderAddTitle,
				includeUserData: true,
				pageTitle: 'Add Title',
				allowedRoles: ['administrator', 'instructor', 'concierge']
			}
		}
	},

	{
		pathId: 'renderAddTitleToCourse',
		methods: {
			get: {
				handler: MaterialsController.renderAddTitleToCourse,
				includeUserData: true,
				pageTitle: 'Add Title',
				allowedRoles: ['administrator', 'instructor', 'concierge']
			}
		}
	},

	{
		pathId: 'addTitle',
		methods: {
			post: MaterialsController.addTitle
		}
	},

	{
		pathId: 'adoptionReport',
		methods: {
			get: {
				handler: AdoptionReportController.adoptionReport,
				includeUserData: true,
				pageTitle: 'My Adoption Dashboard',
				allowedRoles: ['administrator', 'concierge']
			}
		}
	},
	{
		pathId: 'adoptionReportJson',
		methods: {
			get: {
				handler: AdoptionReportController.adoptionReportJson,
				includeUserData: true,
				allowedRoles: ['administrator', 'concierge']
			}
		}
	},
	{
		pathId: 'adoptionReportCsv',
		methods: {
			get: {
				handler: AdoptionReportController.adoptionReportCsv,
				includeUserData: true,
				allowedRoles: ['administrator', 'concierge']
			}
		}
	},
	{
		pathId: 'adoptionReportPdf',
		methods: {
			get: {
				handler: AdoptionReportController.adoptionReportPdf,
				includeUserData: true,
				allowedRoles: ['administrator', 'concierge']
			}
		}
	},
	{
		pathId: 'adoptionReportSpecificCourse',
		methods: {
			get: {
				handler: AdoptionReportController.adoptionReportSpecificCourse,
				includeUserData: true,
				allowedRoles: ['administrator', 'concierge']
			}
		}
	},
	//Added by Mangal

    {
        pathId: 'adoptionReportDeleteQuickReport',
        methods: {
            delete: {
                handler: AdoptionReportController.adoptionReportDeleteQuickReport,
                includeUserData: true,
                allowedRoles: ['administrator', 'concierge']
            }
        }
    },
    {
        pathId: 'adoptionReportSaveQuickReport',
        methods: {
            post: {
                handler: AdoptionReportController.adoptionReportSaveQuickReport,
                includeUserData: true,
                allowedRoles: ['administrator', 'concierge']
            }
        }
    },
    {
        pathId: 'adoptionReportGetQuickReport',
        methods: {
            get: {
                handler: AdoptionReportController.getQuickReportsDetailList,
                includeUserData: true,
                allowedRoles: ['administrator', 'concierge']
            }
        }
    },
    {
        pathId: 'adoptionReportExportCsvOrPdf',
        methods: {
            post: {
                handler: AdoptionReportController.exportPdfOrCsv,
                includeUserData: true,
                allowedRoles: ['administrator', 'concierge']
            }
        }
    },
    //End
	{
		pathId: 'adoptionReportEmail',
		methods: {
			post: {
				handler: AdoptionReportController.sendMailWithPdf,
				includeUserData: true,
				allowedRoles: ['administrator', 'concierge']
			}
		}
	},
	{
        pathId: 'adoptionReportGridData',
        methods: {
            post: {
                handler: AdoptionReportController.getComplianceGridList,
                includeUserData: true,
                allowedRoles: ['administrator', 'concierge']
            }
        }
    },
	{
		pathId: 'courseMaterialDetails',
		methods: {
			get: {
				handler: MaterialsController.getMaterialDetails,
				includeUserData: true,
				pageTitle: 'Material Details',
				allowedRoles: ['instructor', 'administrator', 'concierge']
			}
		}
	},

	{
        pathId: 'manageAdoptionForNoCourse',
        methods: {
            get: {
                handler: MaterialsController.manageCourses,
                includeUserData: true,
                pageTitle: 'Manage Adoption',
                allowedRoles: ['instructor', 'administrator', 'concierge']
            }
        }
    },
	{
    		pathId: 'manageCourses',
    		methods: {
    			get: {
    				handler: MaterialsController.manageCourses,
    				includeUserData: true,
    				pageTitle: 'Material Details',
    				allowedRoles: ['instructor', 'administrator', 'concierge']
    			}
    		}
    	},
	{
		pathId: 'getMaterialAccessUrl',
		methods: {
			get: {
				handler: MaterialsController.getMaterialAccessUrl
			}
		}
	},
	{
		pathId: 'postMaterialAccessCode',
		methods: {
			post: {
				handler: MaterialsController.postMaterialAccessCode
			}
		}
	},
	{
		pathId: 'materialEspAccess',
		methods: {
			get: {
				handler: MaterialsController.espAccess,
				includeUserData: true
			}
		}
	},
	{
		pathId: 'courseMaterialRatingsAndReviewsJson',
		methods: {
			get: MaterialsController.getMaterialRatingsAndReviewsJson,
			post: MaterialsController.setMaterialRatingsAndReviews
		}
	},
	{
		pathId: 'materialDetails',
		methods: {
			get: {
				handler: MaterialsController.getMaterialDetails,
				includeUserData: true,
				allowedRoles: ['instructor', 'administrator', 'concierge']
			}
		}
	},
	{
		pathId: 'materialsPreApprove',
		methods: {
			get: {
				handler: MaterialsController.getMaterialsPreApprove,
				includeUserData: true,
				pageTitle: 'Pre-approve Material',
				allowedRoles: ['administrator']
			},
			post: {
				handler: MaterialsController.postMaterialsPreApprove,
				includeUserData: true,
				allowedRoles: ['administrator']
			}
		}
	},
	{ pathId: 'courseMaterialAssociatedMaterials', methods: {get: MaterialsController.getMaterialAssociatedMaterialsJson} },
	{ pathId: 'materialAssociatedMaterials', methods: {get: MaterialsController.getMaterialAssociatedMaterialsJson} },
	{
		pathId: 'materialsSearch',
		methods: {
			get: {
				handler: MaterialsController.materialSearch,
				includeUserData: true
			}
		}
	},
	{ pathId: 'materials', methods: {post: MaterialsController.processMaterialAdd} },
	{ pathId: 'materialsSearchJson', methods: {get: MaterialsController.materialsSearchJson} },
	{
		pathId: 'materialAdoptionStatus',
		methods: {
			put: {
				handler: MaterialsController.setMaterialAdoptionStatus
			}
		}
	},
	{ pathId: 'termDivisionDepartmentMaterialAdoptionStatus', methods: {get:MaterialsController.materialAdoptionStatus}},
	{ pathId: 'materialIsExist', methods: {get: MaterialsController.isMaterialExists}},
	{ pathId: 'courseMaterialAdoptionStatus', methods: {put: MaterialsController.setCourseMaterialAdoptionStatus} },
	{ pathId: 'removeAdoptedMaterial', methods: {delete: CoursesController.removeAdoptedMaterial} },

	{
		pathId: 'courseMaterialStudentPurchases',
		methods: {
			get:{
				handler: MaterialsController.courseMaterialStudentPurchases,
				includeUserData: true,
				pageTitle: 'Student Purchases'
			}
		}
	},
	{pathId: 'courseMaterialStudentPurchasesJson', methods: {get: MaterialsController.courseMaterialStudentPurchasesJson}},
	{pathId: 'purchaseMaterial',
		methods: {
			get: {
				handler: MaterialsController.purchase,
				includeUserData: true,
				pageTitle: 'e Account Login'
			},
			post : {
				handler: MaterialsController.getStudentsMaterialPurchaseUrl,
				pageTitle: 'e Account Login'
			}
		}
	},
	{pathId: 'getRegistrationUrl',   methods: {post: MaterialsController.getRegistrationUrl}},
	{pathId: 'getGuestUrl',          methods: {post: MaterialsController.getGuestUrl}},
	{pathId: 'getForgotPasswordUrl', methods: {post: MaterialsController.getForgotPasswordUrl}},

	{pathId: 'marketingDashboard',
		methods: {
			get: {
				handler: MarketingController.marketingDashboard,
				includeUserData: true
			}
		}
	},
	{
		pathId: 'marketingPublisherWeights',
		methods: {
			get: {
				handler: MarketingController.publisherWeights,
				includeUserData: true
			}
		}
	},
	{
		pathId: 'marketingFeaturedItems',
		methods: {
			get: {
				handler: MarketingController.featuredItems,
				includeUserData: true
			}
		}
	},
	{
		pathId: 'marketingAdCampaigns',
		methods: {
			get: {
				handler: MarketingController.adCampaigns,
				includeUserData: true
			}
		}
	},
	{
		pathId: 'marketingManageSpecificCampaign',
		methods: {
			get: {
				handler: MarketingController.manageSpecificCampaign,
				includeUserData: true
			}
		}
	}, {
		pathId: 'marketingAddCampaign',
		methods: {
			get: {
				handler: MarketingController.manageSpecificCampaign,
				includeUserData: true
			}
		}
	},

	{
		pathId: 'courseMaterialsApproveReject',
		methods: {
			put: {
				handler: CoursesController.materialsApproveReject
			}
		}
	},

	{
		pathId: 'settings',
		methods: {
			get: {
				handler: SettingsController.getSettings,
				includeUserData: true,
				allowedRoles: ['instructor', 'concierge']
			}
		}
	},
	{
		pathId: 'resetCourse',
		methods: {
			get: {
				handler: SettingsController.resetCourse,
				allowedRoles: ['instructor', 'concierge']
			}
		}
	},

	{
		pathId: 'getCopyMaterials',
		methods: {
			get: {
				handler: MaterialsController.getCopyMaterials,
				includeUserData: true
			}
		}
	},
	{
		pathId: 'postCopyMaterials',
		methods: {
			post: {
				handler: MaterialsController.postCopyMaterials
			}
		}
	},

	{
		pathId: 'messageCenter',
		methods: {
			get: {
				handler: MessageCenterController.messageCenter,
				includeUserData: true,
				allowedRoles: ['instructor', 'concierge','administrator']
			}
		}
	},
	{
		pathId: 'inboxMessages',
		methods: {
			get: {
				handler: MessageCenterController.inboxMessages,
				includeUserData: true,
				allowedRoles: ['instructor', 'concierge', 'administrator']
			}
		}
	},
	{
		pathId: 'newMessage',
		methods: {
			get: {
				handler: MessageCenterController.newMessage,
				includeUserData: true,
				allowedRoles: ['instructor', 'concierge', 'administrator']
			}
		}
	},
	{
		pathId: 'sendNewMessage',
		methods: {
			post: {
				handler: MessageCenterController.sendNewMessage,
				includeUserData: true,
				allowedRoles: ['instructor', 'concierge', 'administrator']
			}
		}
	},
	{
		pathId: 'messageCenterSettings',
		methods: {
			get: {
				handler: MessageCenterController.settings,
				includeUserData: true,
				allowedRoles: ['instructor', 'concierge', 'administrator']
			},
			post: {
				handler: MessageCenterController.setMessageCenterSettings,
				includeUserData: true,
				allowedRoles: ['instructor', 'concierge', 'administrator']
			}
		}
	},
	{
		pathId: 'specificMessage',
		methods: {
			get: {
				handler: MessageCenterController.specificMessage,
				includeUserData: true,
				allowedRoles: ['instructor', 'concierge', 'administrator']
			},
			delete: {
				handler: MessageCenterController.removeSpecificMessage,
				includeUserData: true,
				allowedRoles: ['instructor', 'concierge', 'administrator']
			}
		}
	},
	{
		pathId: 'replyOnSpecificMessage',
		methods: {
			post: {
				handler: MessageCenterController.replyOnSpecificMessage,
				includeUserData: true,
				allowedRoles: ['instructor', 'concierge', 'administrator']
			}
		}
	},

	{pathId: 'rawEAuthFail', methods: { get: {handler: HomeController.eAuthFail} }},
	{pathId: 'eAuthFail', methods: { get: {handler: HomeController.eAuthFail} }},
	{pathId: 'termEAuthFail', methods: {get: {handler: HomeController.eAuthFail}}},

	{pathId: 'backEnd', methods: {get: HomeController.backEnd}},
	{pathId: 'version', methods: {get: HomeController.version}},
	{pathId: 'defaultTerm', methods: {get: DepartmentsController.getDefaultTerm}},

	{
		pathId: 'brytewaveLaunchProduct', methods: {
		get: {
			handler: BryteWaveController.launchProduct,
			includeUserData: true,
			allowedRoles: ['instructor', 'concierge']
		}
	}
	},
	{pathId: 'brytewaveGetLaunchProductFormData', methods: {
		get:{
			handler: BryteWaveController.getLaunchProductFormData,
			includeUserData: true,
			allowedRoles: ['instructor', 'concierge']
		}
	}},

	{
		pathId: 'setCookie',
		methods: {
			post: {
				handler: Cookies.setCookie,
				allowedRoles: ['instructor', 'student', 'concierge', 'administrator']
			}
		}
	},

	{
		pathId: 'realmLogIn',
		methods: {
			get: {
				handler: AuthController.logIn
			}
		}
	},

	{
        pathId: 'fdLoginFromAdminTool',
        methods: {
            post: {
                handler: AuthController.fdLoginFromAdminTool
            }
        }
    },
    {
        pathId: 'processLogInAfterPasswordReset',
        methods: {
            post: {
                handler: AuthController.processLogInAfterPasswordReset
            }
        }
    },



    {
        pathId: 'storeTermsAndConditionsValue',

        methods: {
            post: {
                handler: AuthController.storeTermsAndConditionsValue,
                includeUserData: true,
                allowedRoles: ['instructor', 'concierge']
            }
        }
    },


    {
        pathId: 'sendCourseMail',

        methods: {
            post: {
                handler: AuthController.sendCourseMail,
                includeUserData: true,
                allowedRoles: ['instructor', 'concierge']
            }
        }
    },


//getInstructorData

    {
        pathId: 'getInstructorData',

        methods: {
            post: {
                handler: AuthController.getInstructorData,
                allowedRoles: ['concierge']
            }
        }
    },


      {
      		pathId: 'adoptedMaterial',
      		methods: {
      			get: {
      				handler: CoursesController.getAdoptedMaterialInfo,
      				includeUserData: true,
      				pageTitle: 'Course Materials'
      			}
      		}
      	}



];


exports.setUp = function(app) {
	for(var index in pathHandlers) {
		var pathData = pathHandlers[index];
		var pathId = pathData.pathId;
		var methodHandlers = pathData.methods;
		for(var method in methodHandlers) {
			(function(method, methodHandler) {
				var path = Paths[pathId];
				if(path === null) {
					return;
				}
				app[method].call(app, path, function(request, response) {
					var handler;
					var finalCallback = function() {
						handler(request, response);
					};
					if(typeof methodHandler === 'function') {
						handler = methodHandler;
						return finalCallback();
					}
					handler = methodHandler.handler;
					var locals = response.locals;
					locals.pageTitle = methodHandler.pageTitle;

					var environment = process.env.ENVIRONMENT === 'chef' ? process.env.CHEF_ENVIRONMENT : process.env.ENVIRONMENT;
					environment = environment || 'dev';
					locals.environment = environment.toLowerCase();

					if(methodHandler.includeUserData) {
						return AuthDataAccess.getUserData(request, function(error, result) {
							if (error) {
								return response.redirect(Paths.logIn);
							}
							var user = result.user;
							var role = (user && user.role) ? user.role : undefined;
							var roles = (user && user.available_roles) ? user.available_roles : undefined;

							if (role === 'guest') {
								return response.redirect(Paths.logIn);
							}
							if (!role && roles) {
								return response.redirect(Paths.roleSelection);
							}

							if(methodHandler.allowedRoles) {
								if(methodHandler.allowedRoles.indexOf(role) < 0) {
									return response.redirect(Paths.dashboard);
								}
							}
							if(user) {
								result.user.nameToShow = user.given_name + ' ' + (user.family_name || '')[0] + '.';
								result.user.nameToLog  = user.given_name + ' ' + (user.family_name || '') + ' (' + user.id + ')';
							}
							switch(role) {
								case 'instructor':
									locals.isInstructor = true;
									break;
								case 'student':
									locals.isStudent = true;
									break;
								case 'administrator':
									locals.isAdministrator = true;
									break;
								case 'concierge':
									locals.isConcierge = true;
									break;
							}

							locals.selectedTerm = request.cookies.termId || undefined;
							locals.selectedDepartment = request.cookies.departmentId || undefined;
							locals.userRole = role;
							locals.userData = result;
							locals.customer = result.customer || {};
							locals.subjectsByDiscipline = SubjectsByDiscipline;
							locals.onboardTutorial = OnboardTutorial;
							locals.ctStatusMessageMap = CtStatusMessageMap;
							locals.digitalMaterialCode = digitalMaterialCode;

							response.header("Cache-Control", "no-cache, no-store, must-revalidate");
							response.header("Pragma", "no-cache");

							finalCallback();
						});
					}
					finalCallback();
				});
			})(method, methodHandlers[method]);
		}
	}
	app.get('*', function(request, response) {
		response.status(404);
		if(request.xhr) {
			return response.json({description: "Page not found!", type: "404"});
		}
		response.render('errors/404');
	});

};
