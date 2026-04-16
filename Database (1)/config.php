<?php
// CORS Headers - React/Mobile App se connection ke liye zaroori hain
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Preflight request handle karne ke liye
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Errors dikhane ke liye (Development phase mein kaam aata hai)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// --- HOSTINGER SETTINGS START ---
$host = "localhost"; // Hostinger par ye 'localhost' hi rahega
$user = "u826331191_jewel_admin"; // <-- Apne Hostinger Panel se copy karein
$pass = "ShreejiJewellers@6268";    // <-- Jo aapne Database banate waqt rakha
$dbname = "u826331191_jewel_db"; // <-- Hostinger Panel wala pura naam
// --- HOSTINGER SETTINGS END ---

$conn = new mysqli($host, $user, $pass, $dbname);

// Connection check
if ($conn->connect_error) {
    header('Content-Type: application/json');
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

// Default response type JSON set kar dete hain
header('Content-Type: application/json');
?>