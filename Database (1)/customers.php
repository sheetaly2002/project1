<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");

include "config.php";

error_reporting(E_ALL);
ini_set('display_errors', 1);

$method = $_SERVER["REQUEST_METHOD"];

/* ----------- DEBUG LOG FUNCTION (Fixed for Hostinger) ----------- */
function debug_log($data) {
    // __DIR__ use karne se ye automatically server ka sahi path le lega
    $logFile = __DIR__ . "/debug.txt"; 
    $content = "\n\n==== LOG " . date('Y-m-d H:i:s') . " ====\n" . print_r($data, true);
    file_put_contents($logFile, $content, FILE_APPEND);
}

/* ----------- ALWAYS LOG RAW INPUT ----------- */
debug_log([
    "METHOD" => $method,
    "FILES" => $_FILES,
    "INPUT" => file_get_contents("php://input")
]);

/* -------------------- GET (Fetch All) -------------------- */
if ($method == "GET") {
    $sql = "SELECT * FROM customers ORDER BY customer_id DESC";
    $result = $conn->query($sql);
    $customers = [];
    while ($row = $result->fetch_assoc()) {
        $customers[] = $row;
    }
    echo json_encode(["status" => "success", "customers" => $customers]);
    exit;
}

/* -------------------- CREATE (POST) -------------------- */
if ($method == "POST") {
    $customer_name = $_POST["customer_name"] ?? "";
    $mobile = $_POST["mobile"] ?? "";
    $address = $_POST["address"] ?? "";

    if ($customer_name == "" || $mobile == "" || $address == "") {
        echo json_encode(["status" => "error", "message" => "Name, Mobile and Address are required"]);
        exit;
    }

    $dob = !empty($_POST["dob"]) ? $_POST["dob"] : NULL;
    $id_proof_type = !empty($_POST["id_proof_type"]) ? $_POST["id_proof_type"] : NULL;
    $id_proof_number = !empty($_POST["id_proof_number"]) ? $_POST["id_proof_number"] : NULL;

    /* ------------ FILE UPLOAD FIXED ------------- */
    $uploadDir = __DIR__ . "/customers/"; 

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $filename = NULL;
    if (isset($_FILES["id_proof_file"]) && $_FILES["id_proof_file"]["error"] === 0) {
        $filename = time() . "_" . basename($_FILES["id_proof_file"]["name"]);
        $targetPath = $uploadDir . $filename;
        if (!move_uploaded_file($_FILES["id_proof_file"]["tmp_name"], $targetPath)) {
            echo json_encode(["status" => "error", "message" => "FAILED TO MOVE FILE"]);
            exit;
        }
    }

    // Secure Insert using Prepared Statements
    $stmt = $conn->prepare("INSERT INTO customers (customer_name, mobile, address, dob, id_proof_type, id_proof_number, id_proof_file, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("sssssss", $customer_name, $mobile, $address, $dob, $id_proof_type, $id_proof_number, $filename);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Customer added successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    $stmt->close();
    exit;
}

/* -------------------- UPDATE (PUT) -------------------- */
if ($method == "PUT") {
    $input = json_decode(file_get_contents("php://input"), true);
    $id = $input["customer_id"] ?? "";

    if (!$id) {
        echo json_encode(["status" => "error", "message" => "Customer ID missing"]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE customers SET customer_name=?, mobile=?, address=?, dob=?, id_proof_type=?, id_proof_number=? WHERE customer_id=?");
    $stmt->bind_param("ssssssi", $input['customer_name'], $input['mobile'], $input['address'], $input['dob'], $input['id_proof_type'], $input['id_proof_number'], $id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Customer updated"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    $stmt->close();
    exit;
}

/* -------------------- DELETE -------------------- */
if ($method == "DELETE") {
    $input = json_decode(file_get_contents("php://input"), true);
    $id = $input["customer_id"] ?? "";

    if (!$id) {
        echo json_encode(["status" => "error", "message" => "ID missing"]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM customers WHERE customer_id=?");
    $stmt->bind_param("i", $id);
    
    if($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Customer deleted"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Delete failed"]);
    }
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid Method"]);
?>