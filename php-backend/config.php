<?php
/**
 * SOKA Predictions - Standalone PHP Backend Configuration
 * Hosted at cheerplex.co.ke/soka_king
 */

// Enable error logging for debugging (disable display_errors in production)
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

// Database Configuration
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'cheerple_soka_king'); // update with your cPanel database name
define('DB_USER', getenv('DB_USER') ?: 'cheerple_soka_user'); // update with your cPanel DB user
define('DB_PASS', getenv('DB_PASS') ?: 'SokaKingSecret2026!'); // update with your cPanel DB password
define('DB_PORT', getenv('DB_PORT') ?: '3306');

// M-Pesa Safaricom Daraja API Credentials
define('MPESA_ENV', getenv('MPESA_ENV') ?: 'sandbox'); // 'sandbox' or 'live'
define('MPESA_CONSUMER_KEY', getenv('MPESA_CONSUMER_KEY') ?: 'YOUR_CONSUMER_KEY');
define('MPESA_CONSUMER_SECRET', getenv('MPESA_CONSUMER_SECRET') ?: 'YOUR_CONSUMER_SECRET');
define('MPESA_SHORTCODE', getenv('MPESA_SHORTCODE') ?: '174379');
define('MPESA_PASSKEY', getenv('MPESA_PASSKEY') ?: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919');
define('MPESA_CALLBACK_URL', getenv('MPESA_CALLBACK_URL') ?: 'https://cheerplex.co.ke/soka_king/api/mpesa/callback');

/**
 * Send CORS Headers allowing Next.js local & remote frontend access
 */
function sendCorsHeaders() {
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

/**
 * Output JSON Response
 */
function jsonResponse($data, $statusCode = 200) {
    sendCorsHeaders();
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit;
}
