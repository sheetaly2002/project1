<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");

include "config.php";

$method = $_SERVER['REQUEST_METHOD'];

// Helper function for response
function sendResponse($status, $message, $data = null) {
    echo json_encode(["status" => $status, "message" => $message, "data" => $data]);
    exit;
}

/* ------------------ HANDLE REQUESTS ------------------ */

switch($method) {
    
    // 1. READ (Sari entries ya kisi ek date ki entries lana)
    case 'GET':
        $sql = "SELECT * FROM cash_book ORDER BY date DESC, id DESC";
        $result = $conn->query($sql);
        $entries = [];
        while($row = $result->fetch_assoc()) {
            $entries[] = $row;
        }
        sendResponse("success", "Data fetched", $entries);
        break;

    // 2. CREATE (Nayi entry dalna - Chai, Bijli Bill, ya Advance)
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if(!isset($data['amount']) || !isset($data['type'])) {
            sendResponse("error", "Missing fields");
        }

        $stmt = $conn->prepare("INSERT INTO cash_book (date, category, description, type, amount) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssd", $data['date'], $data['category'], $data['description'], $data['type'], $data['amount']);
        
        if($stmt->execute()) {
            sendResponse("success", "Entry added successfully", ["id" => $stmt->insert_id]);
        } else {
            sendResponse("error", "Failed to add entry");
        }
        break;

    // 3. UPDATE (Purani entry sudharna)
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if(!isset($data['id'])) sendResponse("error", "ID missing");

        $stmt = $conn->prepare("UPDATE cash_book SET date=?, category=?, description=?, type=?, amount=? WHERE id=?");
        $stmt->bind_param("ssssdi", $data['date'], $data['category'], $data['description'], $data['type'], $data['amount'], $data['id']);
        
        if($stmt->execute()) {
            sendResponse("success", "Entry updated successfully");
        } else {
            sendResponse("error", "Update failed");
        }
        break;

    // 4. DELETE (Galti se hui entry hatana)
    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'];
        
        $stmt = $conn->prepare("DELETE FROM cash_book WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if($stmt->execute()) {
            sendResponse("success", "Entry deleted");
        } else {
            sendResponse("error", "Delete failed");
        }
        break;

    default:
        sendResponse("error", "Invalid request method");
        break;
}
?>