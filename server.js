var Express = require('express');
var Engine = require('ejs-locals');
var Http = require('http');
var Path = require('path');
var Router = require('./utilities/router');
var Paths = require('./utilities/paths');
var Services = require('./configuration/services');
var googgleCaptcha = Services.googleCaptcha;
var msgCntrFileServer = Services.msgCntrFileServer;
var realmListForStudentOrFacultyLogin = Services.realmListForStudentOrFacultyLogin;

require("console-stamp")(console, "isoDateTime");

var app = Express();
app.engine('ejs', Engine);

function buildPathsEscapeMiddleware(firstCheckRegexp, secondCheckRegexp) {
	return function(request, response, next) {
		var url = request.url;
		var regExp = firstCheckRegexp;
		var match = regExp.exec(url);
		if(!match) {
			regExp = secondCheckRegexp;
			match = regExp.exec(url);
		}
		if(match && match[0] && match[1]) {
			request.url = url.replace(match[1], encodeURIComponent(match[1]));
		}
		next();
	}
}

var coursesFirstRegexp = /^\/courses\/(.*?)\/(discipline_and_subject|no_materials_required|discover|adopted_materials\.json|student_instructions|materials|split|unsplit|reset|e_auth_fail|edu|add_title)/;
var coursesSecondRegexp = /^\/courses\/(.*)$/;

var termsFirstRegexp = /^\/terms\/(.*?)\/(courses.json|departments_courses.json|e_auth_fail)/;
var termsSecondRegexp = /^\/terms\/(.*)$/;

app.set('port', process.env.PORT || 3000);
app.set('views', Path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(Express.favicon(Path.join(__dirname, 'public/favicon.ico')));
app.use(Express.logger(':remote-addr - - [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms'));
app.use(Express.bodyParser());
app.use(Express.cookieParser());
app.use(Express.methodOverride());
app.use(Express.static(Path.join(__dirname, 'public')));

app.use(function(request, response, next) {
	var url = request.url;
	var lastUrlChar = url[url.length - 1];
	if (lastUrlChar === '/' && url !== '/') {
		return response.redirect(url.replace(/\/+$/, ''));
	};
	return next();
});

app.use(buildPathsEscapeMiddleware(coursesFirstRegexp, coursesSecondRegexp));
app.use(buildPathsEscapeMiddleware(termsFirstRegexp, termsSecondRegexp));


var globalSetUp = function(request, response, next) {
	var locals = response.locals;
	locals.paths = Paths;
	var version = require('./package.json').version;
	locals.version = version;
	locals.staticUrlPostfix = '?v=' + version.replace(/\./g, '_');
	locals.googleCaptchaPublicKey = googgleCaptcha.publicKey;
	locals.msgCntrFileServerUrl = msgCntrFileServer.url;
	locals.realmListForStudentOrFacultyLogin = realmListForStudentOrFacultyLogin.value;
	locals.isStudent = locals.isInstructor = locals.isConcierge = locals.isAdministrator = false;
	locals.userRole = '';
	next();
};
app.use(globalSetUp);

app.use(app.router);

app.use(function(error, request, response, next) {
	if(!error) {
		return next();
	}
	console.log(error);
	response.render('errors/500');
});


Router.setUp(app);

Http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
