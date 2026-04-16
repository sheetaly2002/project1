<?php
include 'config.php';

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"), true);
$action = isset($_GET['action']) ? $_GET['action'] : '';

// 1. Fetch All Sub Categories (Table View ke liye)
if ($action == 'get_all_sub') {
    $sql = "SELECT s.*, m.name as main_cat_name 
            FROM sub_categories s 
            LEFT JOIN main_categories m ON s.main_cat_id = m.id 
            ORDER BY s.id DESC";
    $result = $conn->query($sql);
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
}

// 2. Fetch Main Categories (Dropdown ke liye)
if ($action == 'get_main') {
    $result = $conn->query("SELECT * FROM main_categories ORDER BY name ASC");
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
}

// 3. Add or Update Sub Category (Dono handle karega)
if ($action == 'save_sub') {
    $main_id = mysqli_real_escape_string($conn, $data['main_cat_id']);
    $sub_name = mysqli_real_escape_string($conn, $data['sub_name']);
    
    if (isset($data['id']) && !empty($data['id'])) {
        // UPDATE Logic
        $id = $data['id'];
        $sql = "UPDATE sub_categories SET main_cat_id = '$main_id', sub_name = '$sub_name' WHERE id = '$id'";
    } else {
        // INSERT Logic
        $sql = "INSERT INTO sub_categories (main_cat_id, sub_name) VALUES ('$main_id', '$sub_name')";
    }

    if ($conn->query($sql)) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
}

// 4. Add Main Category (Gold/Silver)
if ($action == 'add_main') {
    $name = mysqli_real_escape_string($conn, $data['name']);
    $sql = "INSERT INTO main_categories (name) VALUES ('$name')";
    if ($conn->query($sql)) {
        echo json_encode(["status" => "success"]);
    }
}

// 5. Delete Sub Category
if ($action == 'delete_sub') {
    $id = $_GET['id'];
    $sql = "DELETE FROM sub_categories WHERE id = '$id'";
    if ($conn->query($sql)) {
        echo json_encode(["status" => "success"]);
    }
}

$conn->close();