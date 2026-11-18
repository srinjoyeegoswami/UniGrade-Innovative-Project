<?php
/**
 * UniGrade Backend — Front Controller / Router
 * All requests are funnelled here by .htaccess
 */

// ----------------------------------------------------------------
// Bootstrap
// ----------------------------------------------------------------
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/Response.php';
require_once __DIR__ . '/helpers/Auth.php';
require_once __DIR__ . '/helpers/Validator.php';
require_once __DIR__ . '/helpers/AuditLog.php';
require_once __DIR__ . '/config/foundation.php';

try {
    ensureFoundationData(Database::getInstance());
} catch (\Throwable $e) {}

Auth::startSession();

// ----------------------------------------------------------------
// Parse the request URI
// ----------------------------------------------------------------
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path       = parse_url($requestUri, PHP_URL_PATH) ?? '/';

// If path contains /api/, normalize to begin with /api
$apiPos = strpos($path, '/api');
if ($apiPos !== false) {
    $path = substr($path, $apiPos);
}
$path = rtrim($path, '/') ?: '/';

// Expect /api/{resource}[/{sub}[/{id}...]]
if (!preg_match('#^/api/([a-zA-Z0-9_-]+)(/.*)?$#', $path, $matches)) {
    Response::notFound('Invalid API path. All requests must begin with /api/{resource}.');
}

$resource  = strtolower($matches[1]);      // primary resource segment
$remainder = $matches[2] ?? '';            // everything after the resource

$method    = strtoupper($_SERVER['REQUEST_METHOD']);

// ----------------------------------------------------------------
// Route map  resource → controller file (relative to controllers/)
// ----------------------------------------------------------------
$routes = [
    'auth'          => 'AuthController.php',
    'students'      => 'StudentsController.php',
    'faculty'       => 'FacultyController.php',
    'departments'   => 'DepartmentsController.php',
    'programs'      => 'ProgramsController.php',
    'sessions'      => 'SessionsController.php',
    'courses'       => 'CoursesController.php',
    'offerings'     => 'OfferingsController.php',
    'enrollments'   => 'EnrollmentsController.php',
    'assessments'   => 'AssessmentsController.php',
    'marks'         => 'MarksController.php',
    'submissions'   => 'SubmissionsController.php',
    'grading'       => 'GradingController.php',
    'results'       => 'ResultsController.php',
    'dashboard'     => 'DashboardController.php',
    'reports'       => 'ReportsController.php',
    'announcements' => 'AnnouncementsController.php',
    'audit-logs'    => 'AuditLogsController.php',
];

if (!array_key_exists($resource, $routes)) {
    Response::notFound("Unknown resource: '{$resource}'.");
}

$controllerFile = __DIR__ . '/controllers/' . $routes[$resource];

if (!file_exists($controllerFile)) {
    Response::serverError("Controller for '{$resource}' is not yet implemented.");
}

// ----------------------------------------------------------------
// Pass context into the controller and dispatch
// ----------------------------------------------------------------
// Controllers may read these globals to know what was requested:
//   $GLOBALS['_RESOURCE']  = resource name
//   $GLOBALS['_REMAINDER'] = sub-path after resource
//   $GLOBALS['_METHOD']    = HTTP method

$GLOBALS['_RESOURCE']  = $resource;
$GLOBALS['_REMAINDER'] = $remainder;
$GLOBALS['_METHOD']    = $method;

try {
    require $controllerFile;
} catch (Throwable $e) {
    Response::serverError($e->getMessage());
}
