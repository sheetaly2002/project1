<?php
include 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"), true);
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action == 'get_all') {
    $sql = "SELECT p.*, s.sub_name as category_name, m.name as metal_name 
            FROM s_products p
            LEFT JOIN sub_categories s ON p.sub_cat_id = s.id
            LEFT JOIN main_categories m ON s.main_cat_id = m.id
            ORDER BY p.id DESC";
    $result = $conn->query($sql);
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
}

if ($action == 'save') {
    $sub_cat_id = $data['sub_cat_id'];
    $name = mysqli_real_escape_string($conn, $data['product_name']);
    $hsn = !empty($data['hsn_code']) ? mysqli_real_escape_string($conn, $data['hsn_code']) : '7113';
    
    if (!empty($data['id'])) {
        // UPDATE
        $id = $data['id'];
        $sql = "UPDATE s_products SET sub_cat_id='$sub_cat_id', product_name='$name', hsn_code='$hsn' WHERE id=$id";
    } else {
        // SMART SERIAL GENERATION (PRD-001, PRD-002...)
        $res = $conn->query("SELECT id FROM s_products ORDER BY id DESC LIMIT 1");
        $last_id = ($res->num_rows > 0) ? $res->fetch_assoc()['id'] : 0;
        $new_code = "PRD-" . str_pad($last_id + 1, 3, '0', STR_PAD_LEFT);

        // INSERT
        $sql = "INSERT INTO s_products (product_code, sub_cat_id, product_name, hsn_code) 
                VALUES ('$new_code', '$sub_cat_id', '$name', '$hsn')";
    }
    
    if ($conn->query($sql)) echo json_encode(["status" => "success"]);
    else echo json_encode(["status" => "error", "msg" => $conn->error]);
}

if ($action == 'delete') {
    $id = $_GET['id'];
    if ($conn->query("DELETE FROM s_products WHERE id=$id")) echo json_encode(["status" => "success"]);
}
?>