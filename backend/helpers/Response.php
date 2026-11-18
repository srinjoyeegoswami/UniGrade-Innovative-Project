<?php
class Response {

    /**
     * Send a successful JSON response.
     */
    public static function success($data = null, string $message = 'Success', int $code = 200): void {
        http_response_code($code);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Send an error JSON response.
     */
    public static function error(string $message = 'An error occurred', int $code = 400, $errors = null): void {
        http_response_code($code);
        $body = [
            'success' => false,
            'message' => $message,
        ];
        if ($errors !== null) {
            $body['errors'] = $errors;
        }
        echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Send a 404 Not Found response.
     */
    public static function notFound(string $message = 'Resource not found'): void {
        self::error($message, 404);
    }

    /**
     * Send a 401 Unauthorized response.
     */
    public static function unauthorized(string $message = 'Unauthorized'): void {
        self::error($message, 401);
    }

    /**
     * Send a 403 Forbidden response.
     */
    public static function forbidden(string $message = 'Forbidden'): void {
        self::error($message, 403);
    }

    /**
     * Send a 422 Unprocessable Entity (validation failure) response.
     */
    public static function validationError(array $errors, string $message = 'Validation failed'): void {
        self::error($message, 422, $errors);
    }

    /**
     * Send a 500 Internal Server Error response.
     */
    public static function serverError(string $message = 'Internal server error'): void {
        self::error($message, 500);
    }

    /**
     * Send a 201 Created response.
     */
    public static function created($data = null, string $message = 'Created successfully'): void {
        self::success($data, $message, 201);
    }

    /**
     * Send paginated JSON response.
     */
    public static function paginated(array $items, int $total, int $page, int $perPage, string $message = 'Success'): void {
        http_response_code(200);
        echo json_encode([
            'success'    => true,
            'message'    => $message,
            'data'       => $items,
            'pagination' => [
                'total'       => $total,
                'page'        => $page,
                'per_page'    => $perPage,
                'total_pages' => (int) ceil($total / max(1, $perPage)),
            ],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}
