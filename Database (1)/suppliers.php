<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

include "config.php";

$method = $_SERVER["REQUEST_METHOD"];
$input = json_decode(file_get_contents("php://input"), true);

/* =========================================
   GET: Fetch All Suppliers
   ========================================= */
if ($method == "GET") {
    $sql = "SELECT * FROM suppliers ORDER BY supplier_id DESC";
    $result = $conn->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode(["status" => "success", "suppliers" => $data]);
    exit;
}

/* =========================================
   POST: Add New Supplier
   ========================================= */
if ($method == "POST") {
    $stmt = $conn->prepare("INSERT INTO suppliers (name, mobile, address, firm_name, account_name, account_no, bank_name, ifsc, bank_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssss", 
        $input["name"], $input["mobile"], $input["address"], 
        $input["firm_name"], $input["account_name"], $input["account_no"], 
        $input["bank_name"], $input["ifsc"], $input["bank_address"]
    );

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Supplier Registered"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
    exit;
}

/* =========================================
   PUT: Update Supplier
   ========================================= */
if ($method == "PUT") {
    $stmt = $conn->prepare("UPDATE suppliers SET name=?, mobile=?, address=?, firm_name=?, account_name=?, account_no=?, bank_name=?, ifsc=?, bank_address=? WHERE supplier_id=?");
    $stmt->bind_param("sssssssssi", 
        $input["name"], $input["mobile"], $input["address"], 
        $input["firm_name"], $input["account_name"], $input["account_no"], 
        $input["bank_name"], $input["ifsc"], $input["bank_address"],
        $input["supplier_id"]
    );

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Profile Updated"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
    exit;
}

/* =========================================
   DELETE: Safe Delete with Integrity Check
   ========================================= */
if ($method == "DELETE") {
    $id = (int)$input["supplier_id"];

    // 1. Check if supplier has any Purchases or Payments
    // Hum subqueries use karke total count nikal rahe hain
    $check_sql = "SELECT 
        (SELECT COUNT(*) FROM purchases WHERE supplier_id = ?) as purchase_count,
        (SELECT COUNT(*) FROM supplier_payments WHERE supplier_id = ?) as payment_count";
    
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("ii", $id, $id);
    $check_stmt->execute();
    $usage = $check_stmt->get_result()->fetch_assoc();

    if ($usage['purchase_count'] > 0 || $usage['payment_count'] > 0) {
        // Message mein detail bhi bata rahe hain ki kahan data fasa hai
        $msg = "Strict Protection: This supplier cannot be deleted because they have ";
        if($usage['purchase_count'] > 0) $msg .= $usage['purchase_count'] . " Purchase Bills ";
        if($usage['payment_count'] > 0) $msg .= "and " . $usage['payment_count'] . " Payment Entries ";
        $msg .= "linked to them.";

        echo json_encode([
            "status" => "error", 
            "message" => $msg
        ]);
        exit;
    }

    // 2. If no usage, proceed to delete
    $del_stmt = $conn->prepare("DELETE FROM suppliers WHERE supplier_id = ?");
    $del_stmt->bind_param("i", $id);

    if ($del_stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Supplier removed from records"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed: " . $conn->error]);
    }
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid Access"]);
?>