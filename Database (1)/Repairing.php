<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include "config.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'OPTIONS') exit;

switch($method) {
    
    // 1. READ (JOIN ke saath - Taki customer ka naam-phone mile)
    case 'GET':
        $sql = "SELECT r.*, c.customer_name, c.mobile 
                FROM repairing r 
                JOIN customers c ON r.customer_id = c.customer_id 
                ORDER BY r.id DESC";
        $result = $conn->query($sql);
        $data = [];
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode(["status" => "success", "data" => $data]);
        break;

    // 2. CREATE (Sirf customer_id bhejni hogi)
    case 'POST':
        $d = json_decode(file_get_contents("php://input"), true);
        
        $stmt = $conn->prepare("INSERT INTO repairing (customer_id, item_name, problem_details, estimated_cost, advance_taken, receive_date, delivery_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->bind_param("isssddss", 
            $d['customer_id'], 
            $d['item_name'], 
            $d['problem_details'], 
            $d['estimated_cost'], 
            $d['advance_taken'], 
            $d['receive_date'], 
            $d['delivery_date'], 
            $d['status']
        );
        
        if($stmt->execute()) {
            echo json_encode(["status" => "success", "id" => $stmt->insert_id]);
        } else {
            echo json_encode(["status" => "error", "message" => $conn->error]);
        }
        break;

    // 3. UPDATE
    case 'PUT':
        $d = json_decode(file_get_contents("php://input"), true);
        $stmt = $conn->prepare("UPDATE repairing SET item_name=?, problem_details=?, estimated_cost=?, advance_taken=?, delivery_date=?, status=? WHERE id=?");
        $stmt->bind_param("ssddssi", $d['item_name'], $d['problem_details'], $d['estimated_cost'], $d['advance_taken'], $d['delivery_date'], $d['status'], $d['id']);
        
        if($stmt->execute()) echo json_encode(["status" => "success"]);
        else echo json_encode(["status" => "error"]);
        break;

    // 4. DELETE
    case 'DELETE':
        $d = json_decode(file_get_contents("php://input"), true);
        $id = $d['id'];
        $conn->query("DELETE FROM repairing WHERE id = $id");
        echo json_encode(["status" => "success"]);
        break;
}
?>