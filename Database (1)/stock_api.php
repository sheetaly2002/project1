<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? '';

// --- 1. READ & SEARCH (GET) ---
if ($method === 'GET') {
    $barcode = $_GET['barcode'] ?? ''; // Postman se barcode lene ke liye

    $sql = "SELECT s.*, p.product_name, b.bill_no 
            FROM s_stock s
            LEFT JOIN s_products p ON s.product_id = p.id
            LEFT JOIN s_purchase_bills b ON s.purchase_bill_id = b.id";

    // AGAR BARCODE DIYA HAI TOH SEARCH KARO, NAHI TOH SAB DIKHAO
    if (!empty($barcode)) {
        $sql .= " WHERE s.barcode = '$barcode'";
    } else {
        $sql .= " ORDER BY s.id DESC";
    }
    
    $result = $conn->query($sql);
    $stocks = [];
    while($row = $result->fetch_assoc()) {
        $stocks[] = $row;
    }
    echo json_encode($stocks);
    exit;
}

// --- 2. CREATE & UPDATE (POST) ---
if ($method === 'POST') {
    if (empty($data)) {
        echo json_encode(["status" => "error", "message" => "No data"]);
        exit;
    }

    $id           = isset($data['id']) ? $conn->real_escape_string($data['id']) : null;
    $product_id   = $conn->real_escape_string($data['product_id']);
    $net_weight   = $conn->real_escape_string($data['net_weight']);
    $rate         = $conn->real_escape_string($data['rate']);
    $making_type  = $conn->real_escape_string($data['making_type']);
    $making_value = $conn->real_escape_string($data['making_value']);
    $total_cost   = $conn->real_escape_string($data['total_cost']);
    $status       = $conn->real_escape_string($data['status'] ?? 'Available');

    if ($id) {
        // Update Logic (Wahi jo pehle tha)
        $sql = "UPDATE `s_stock` SET product_id='$product_id', net_weight='$net_weight', rate='$rate', status='$status' WHERE id='$id'";
        $msg = "Updated";
    } else {
        // Create Logic (Auto Barcode)
        $res = $conn->query("SELECT id FROM s_stock ORDER BY id DESC LIMIT 1");
        $last_id = ($res->num_rows > 0) ? $res->fetch_assoc()['id'] : 0;
        $barcode_new = "SJ-" . str_pad($last_id + 1, 4, '0', STR_PAD_LEFT);

        $sql = "INSERT INTO `s_stock` (product_id, barcode, net_weight, rate, total_cost, status, making_type, making_value) 
                VALUES ('$product_id', '$barcode_new', '$net_weight', '$rate', '$total_cost', '$status', '$making_type', '$making_value')";
        $msg = "Added";
    }

    if ($conn->query($sql)) {
        echo json_encode(["status" => "success", "message" => $msg, "barcode" => $barcode_new ?? null]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
    exit;
}
?>