<?php
/**
 * SOKA Predictions - Database PDO Manager
 */

require_once __DIR__ . '/config.php';

class Database {
    private static $pdo = null;

    public static function getConnection() {
        if (self::$pdo === null) {
            try {
                $dsn = sprintf(
                    "mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4",
                    DB_HOST,
                    DB_PORT,
                    DB_NAME
                );
                
                $options = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ];

                self::$pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                // In production, return clean JSON error
                jsonResponse([
                    'error' => 'Database connection failed',
                    'message' => $e->getMessage(),
                    'hint' => 'Please import schema.sql into MySQL database ' . DB_NAME . ' on cheerplex.com'
                ], 500);
            }
        }
        return self::$pdo;
    }
}
