<?php
require_once __DIR__ . '/../config/database.php';

class AuditLog {

    /**
     * Write an audit log entry to the database.
     * Supports both:
     *   AuditLog::log($db, $userId, $action, $entityType, $entityId, $oldValues, $newValues)
     *   AuditLog::log($userId, $action, $entityType, $entityId, $oldValues, $newValues, $ip)
     */
    public static function log(
        mixed $arg1,
        mixed $arg2 = null,
        mixed $arg3 = null,
        mixed $arg4 = null,
        mixed $arg5 = null,
        mixed $arg6 = null,
        mixed $arg7 = null
    ): void {
        try {
            if ($arg1 instanceof PDO) {
                $db         = $arg1;
                $userId     = (int)$arg2;
                $action     = (string)$arg3;
                $entityType = (string)$arg4;
                $entityId   = $arg5 !== null ? (int)$arg5 : null;
                $oldValues  = $arg6;
                $newValues  = $arg7;
            } else {
                $db         = Database::getInstance();
                $userId     = (int)$arg1;
                $action     = (string)$arg2;
                $entityType = (string)$arg3;
                $entityId   = $arg4 !== null ? (int)$arg4 : null;
                $oldValues  = $arg5;
                $newValues  = $arg6;
            }

            $ipAddress = self::resolveIp();

            $stmt = $db->prepare(
                'INSERT INTO audit_logs
                    (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, created_at)
                 VALUES
                    (:user_id, :action, :entity_type, :entity_id, :old_values, :new_values, :ip_address, NOW())'
            );

            $stmt->execute([
                ':user_id'     => $userId > 0 ? $userId : null,
                ':action'      => strtoupper(substr($action, 0, 100)),
                ':entity_type' => substr($entityType, 0, 50),
                ':entity_id'   => $entityId,
                ':old_values'  => $oldValues !== null ? json_encode($oldValues, JSON_UNESCAPED_UNICODE) : null,
                ':new_values'  => $newValues !== null ? json_encode($newValues, JSON_UNESCAPED_UNICODE) : null,
                ':ip_address'  => substr($ipAddress, 0, 45),
            ]);
        } catch (\Throwable $e) {
            // Audit failures must never break the main request; swallow silently.
            error_log('[AuditLog] Failed to write audit entry: ' . $e->getMessage());
        }
    }

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------

    private static function resolveIp(): string {
        foreach (['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'] as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = trim(explode(',', $_SERVER[$key])[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        return '0.0.0.0';
    }
}
