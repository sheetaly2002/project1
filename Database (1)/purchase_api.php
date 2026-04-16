<?php
include 'config.php';

// Headers for React/CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$action = $_GET['action'] ?? '';

// --- 1. CREATE: SAVE NEW BILL ---
if ($action == 'save_full_bill') {
    $bill_copy_path = "";
    if (isset($_FILES['bill_copy']) && $_FILES['bill_copy']['error'] == 0) {
        $target_dir = "uploads/bills/";
        if (!file_exists($target_dir)) mkdir($target_dir, 0777, true);
        
        $file_name = "BILL_" . time() . "_" . rand(1000, 9999) . "." . pathinfo($_FILES["bill_copy"]["name"], PATHINFO_EXTENSION);
        $target_file = $target_dir . $file_name;
        if (move_uploaded_file($_FILES["bill_copy"]["tmp_name"], $target_file)) {
            $bill_copy_path = $target_file;
        }
    }

    $s_id = mysqli_real_escape_string($conn, $_POST['supplier_id']);
    $b_no = mysqli_real_escape_string($conn, $_POST['bill_no']);
    $b_dt = mysqli_real_escape_string($conn, $_POST['bill_date']);
    $total = mysqli_real_escape_string($conn, $_POST['total_amount']);
    // ... baki fields bhi aap isi tarah sanitize kar sakte hain ...

    $sql = "INSERT INTO `s_purchase_bills` (supplier_id, bill_no, bill_date, total_amount, bill_copy) 
            VALUES ('$s_id', '$b_no', '$b_dt', '$total', '$bill_copy_path')";

    if ($conn->query($sql)) {
        echo json_encode(["status" => "success", "bill_id" => $conn->insert_id]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
}

// --- 2. READ: GET ALL BILLS OR SINGLE BILL ---
else if ($action == 'get_all_bills') {
    $id = isset($_GET['id']) ? mysqli_real_escape_string($conn, $_GET['id']) : null;
    
    $sql = "SELECT b.*, s.firm_name FROM s_purchase_bills b 
            LEFT JOIN s_suppliers s ON b.supplier_id = s.id";
    
    if ($id) $sql .= " WHERE b.id = '$id'";
    $sql .= " ORDER BY b.id DESC";

    $result = $conn->query($sql);
    $bills = [];
    while($row = $result->fetch_assoc()) { $bills[] = $row; }
    echo json_encode($id ? ($bills[0] ?? null) : $bills);
}

// --- 3. UPDATE: EDIT EXISTING BILL ---
else if ($action == 'update_bill') {
    $id = mysqli_real_escape_string($conn, $_POST['id']);
    $s_id = mysqli_real_escape_string($conn, $_POST['supplier_id']);
    $b_no = mysqli_real_escape_string($conn, $_POST['bill_no']);
    $b_dt = mysqli_real_escape_string($conn, $_POST['bill_date']);
    $total = mysqli_real_escape_string($conn, $_POST['total_amount']);

    // Agar nayi file aayi hai toh purani delete karke nayi update karo
    $file_update_sql = "";
    if (isset($_FILES['bill_copy']) && $_FILES['bill_copy']['error'] == 0) {
        $res = $conn->query("SELECT bill_copy FROM s_purchase_bills WHERE id='$id'");
        $old = $res->fetch_assoc();
        if(!empty($old['bill_copy']) && file_exists($old['bill_copy'])) unlink($old['bill_copy']);

        $target_file = "uploads/bills/BILL_" . time() . "_" . rand(1000, 9999) . "." . pathinfo($_FILES["bill_copy"]["name"], PATHINFO_EXTENSION);
        if(move_uploaded_file($_FILES["bill_copy"]["tmp_name"], $target_file)) {
            $file_update_sql = ", bill_copy='$target_file'";
        }
    }

    $sql = "UPDATE `s_purchase_bills` SET 
            supplier_id='$s_id', bill_no='$b_no', bill_date='$b_dt', 
            total_amount='$total' $file_update_sql 
            WHERE id='$id'";

    if ($conn->query($sql)) {
        echo json_encode(["status" => "success", "message" => "Bill Updated"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
}

// --- 4. DELETE: REMOVE BILL ---
else if ($action == 'delete_bill') {
    $id = mysqli_real_escape_string($conn, $_GET['id']);
    
    // Pehle file path nikalo taaki server se image delete kar sakein
    $res = $conn->query("SELECT bill_copy FROM s_purchase_bills WHERE id='$id'");
    if($row = $res->fetch_assoc()) {
        if(!empty($row['bill_copy']) && file_exists($row['bill_copy'])) {
            unlink($row['bill_copy']); // Delete file from server
        }
    }

    if ($conn->query("DELETE FROM s_purchase_bills WHERE id = '$id'")) {
        echo json_encode(["status" => "success", "message" => "Bill Deleted"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
}

// Get Suppliers for dropdown
else if ($action == 'get_suppliers') {
    $result = $conn->query("SELECT id, firm_name FROM s_suppliers ORDER BY firm_name ASC");
    $suppliers = [];
    while($row = $result->fetch_assoc()) { $suppliers[] = $row; }
    echo json_encode($suppliers);
}
?>