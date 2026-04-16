<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET");

include_once 'db_connect.php'; // Aapki DB connection file

$action = isset($_GET['action']) ? $_GET['action'] : '';

// 1. Get All Metal History (With Bill Info)
if ($action == 'get_all') {
    $sql = "SELECT m.*, b.bill_no, s.firm_name 
            FROM s_metal_inventory m 
            LEFT JOIN s_purchase_bills b ON m.purchase_bill_id = b.id
            LEFT JOIN s_suppliers s ON b.supplier_id = s.id
            ORDER BY m.id DESC";
    
    $result = $conn->query($sql);
    $data = [];
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
}

// 2. Save New Metal Entry
if ($action == 'save') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $pb_id = !empty($data['purchase_bill_id']) ? $data['purchase_bill_id'] : "NULL";
    $m_type = $data['metal_type'];
    $purity = $data['purity'];
    $weight = $data['weight'];
    $t_type = $data['transaction_type']; // IN or OUT
    
    $sql = "INSERT INTO s_metal_inventory (purchase_bill_id, metal_type, purity, weight, transaction_type, created_at) 
            VALUES ($pb_id, '$m_type', '$purity', '$weight', '$t_type', NOW())";
            
    if ($conn->query($sql)) {
        echo json_encode(["status" => "success", "message" => "Inventory Updated"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
}
?>