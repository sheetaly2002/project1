<?php
header("Content-Type: application/json");
include "config.php";

$method = $_SERVER["REQUEST_METHOD"];

// Convert JSON to array
$input = json_decode(file_get_contents("php://input"), true);


// -------------------------------------------------------------------
// CREATE CATEGORY  (POST)
// -------------------------------------------------------------------
if ($method == "POST") {

    $category = $input["category_name"];
    $subcategory = $input["subcategory_name"];

    $sql = "INSERT INTO categories (category_name, subcategory_name)
            VALUES ('$category', '$subcategory')";

    if ($conn->query($sql)) {
        echo json_encode(["status" => "success", "message" => "Category added"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
    exit;
}


// -------------------------------------------------------------------
// READ ALL CATEGORIES (GET)
// -------------------------------------------------------------------
if ($method == "GET") {

    $sql = "SELECT * FROM categories ORDER BY id DESC";
    $result = $conn->query($sql);

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode(["status" => "success", "categories" => $data]);
    exit;
}



// -------------------------------------------------------------------
// UPDATE CATEGORY (PUT)
// -------------------------------------------------------------------
if ($method == "PUT") {

    $id = $input["id"];
    $category = $input["category_name"];
    $subcategory = $input["subcategory_name"];

    $sql = "UPDATE categories SET 
                category_name='$category',
                subcategory_name='$subcategory'
            WHERE id=$id";

    if ($conn->query($sql)) {
        echo json_encode(["status" => "success", "message" => "Category updated"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
    exit;
}



// -------------------------------------------------------------------
// DELETE CATEGORY (DELETE)
// -------------------------------------------------------------------
if ($method == "DELETE") {

    $id = $input["id"];

    $sql = "DELETE FROM categories WHERE id=$id";

    if ($conn->query($sql)) {
        echo json_encode(["status" => "success", "message" => "Category deleted"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
    exit;
}



// -------------------------------------------------------------------
// If method is not allowed
// -------------------------------------------------------------------
echo json_encode(["status" => "error", "message" => "Invalid Request Method"]);
?>
