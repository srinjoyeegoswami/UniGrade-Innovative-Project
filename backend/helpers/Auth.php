<?php
require_once __DIR__ . '/../config/database.php';

class Auth {

    /**
     * Start or resume the session with secure cookie settings.
     */
    public static function startSession(): void {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        $lifetime = 7200;

        session_set_cookie_params([
            'lifetime' => $lifetime,
            'path'     => '/',
            'domain'   => '',
            'secure'   => false,       // set true in production over HTTPS
            'httponly' => true,
            'samesite' => 'Strict',
        ]);

        $sessionName = getenv('SESSION_NAME') ?: 'unigrade_session';
        session_name($sessionName);
        session_start();

        // Regenerate ID periodically to prevent fixation
        if (!isset($_SESSION['_last_regen'])) {
            session_regenerate_id(true);
            $_SESSION['_last_regen'] = time();
        } elseif (time() - $_SESSION['_last_regen'] > 1800) {
            session_regenerate_id(true);
            $_SESSION['_last_regen'] = time();
        }
    }

    /**
     * Log a user in and persist their data to the session.
     */
    public static function login(array $user): void {
        session_regenerate_id(true);
        $_SESSION['user_id']   = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_email']= $user['email'];
        $_SESSION['user_name'] = $user['full_name'];
        $_SESSION['logged_in'] = true;
        $_SESSION['login_time']= time();
        $_SESSION['_last_regen'] = time();
    }

    /**
     * Destroy the current session and log the user out.
     */
    public static function logout(): void {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params['path'], $params['domain'],
                $params['secure'], $params['httponly']
            );
        }
        session_destroy();
    }

    /**
     * Check whether a user is currently authenticated.
     */
    public static function isAuthenticated(): bool {
        return !empty($_SESSION['logged_in']) && !empty($_SESSION['user_id']);
    }

    /**
     * Return the current user's session data or null.
     */
    public static function getCurrentUser(): ?array {
        if (!self::isAuthenticated()) {
            return null;
        }
        return [
            'id'    => $_SESSION['user_id'],
            'role'  => $_SESSION['user_role'],
            'email' => $_SESSION['user_email'],
            'name'  => $_SESSION['user_name'],
        ];
    }

    public static function userId(): ?int {
        return $_SESSION['user_id'] ?? null;
    }

    public static function role(): ?string {
        return $_SESSION['user_role'] ?? null;
    }

    /**
     * Abort with 401 if the user is not authenticated.
     */
    public static function requireAuth(): void {
        if (!self::isAuthenticated()) {
            require_once __DIR__ . '/Response.php';
            Response::unauthorized('You must be logged in to access this resource.');
        }
    }

    /**
     * Abort with 403 if the user does not have one of the required roles.
     *
     * @param string|array $roles  A single role string or array of allowed roles.
     */
    public static function requireRole($roles): void {
        self::requireAuth();
        $roles = (array) $roles;
        if (!in_array($_SESSION['user_role'], $roles, true)) {
            require_once __DIR__ . '/Response.php';
            Response::forbidden('You do not have permission to perform this action.');
        }
    }

    /**
     * Generate and store a CSRF token in the session.
     */
    public static function generateCSRFToken(): string {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    /**
     * Validate a submitted CSRF token against the session token.
     */
    public static function validateCSRFToken(string $token): bool {
        if (empty($_SESSION['csrf_token'])) {
            return false;
        }
        return hash_equals($_SESSION['csrf_token'], $token);
    }

    /**
     * Convenience: check CSRF from request header or body, abort on failure.
     */
    public static function requireCSRF(): void {
        $token = $_SERVER['HTTP_X_CSRF_TOKEN']
              ?? $_POST['csrf_token']
              ?? '';
        if (!self::validateCSRFToken($token)) {
            require_once __DIR__ . '/Response.php';
            Response::error('Invalid or missing CSRF token.', 403);
        }
    }
}
