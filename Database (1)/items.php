<?php
// 1. config.php फ़ाइल को शामिल करें
// यह ज़रूरी है कि आपकी 'config.php' फाइल में $conn नाम का सक्रिय MySQL कनेक्शन हो।
include 'config.php'; 

// 2. CORS Headers aur Method Handling
header("Content-Type: application/json");

// Ensure only allowed methods are processed after preflight
$allowed_methods = ['GET', 'POST', 'PUT', 'DELETE'];
if (!in_array($_SERVER['REQUEST_METHOD'], $allowed_methods) && $_SERVER['REQUEST_METHOD'] !== 'OPTIONS') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Preflight request response
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    http_response_code(200);
    exit();
}

// Ensure CORS headers are set for actual requests
header("Access-Control-Allow-Origin: *");


// यदि config.php में कनेक्शन विफल हो जाता है, तो script वहीं रुक जाएगा।
// हम मान रहे हैं कि $conn वेरिएबल यहाँ उपलब्ध है।

// Input data handle karna
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleRead($conn);
        break;
    case 'POST':
        handleCreate($conn);
        break;
    case 'PUT':
        handleUpdate($conn);
        break;
    case 'DELETE':
        handleDelete($conn);
        break;
}

// ------------------------------------------------------------------
// CRUD FUNCTIONS
// ------------------------------------------------------------------

// R: Read (GET method)
function handleRead($conn) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($id > 0) {
        $sql = "SELECT i.*, c.category_name 
                FROM items i 
                LEFT JOIN categories c ON i.category_id = c.id 
                WHERE i.id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $item = $result->fetch_assoc();
        
        if ($item) {
            echo json_encode(["status" => "success", "data" => $item]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Item not found"]);
        }
        $stmt->close();
    } else {
        $sql = "SELECT i.*, c.category_name 
                FROM items i 
                LEFT JOIN categories c ON i.category_id = c.id 
                ORDER BY i.id DESC";
        $result = $conn->query($sql);
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        echo json_encode(["status" => "success", "data" => $items]);
    }
}

// C: Create (POST method)
function handleCreate($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $category_id = $data['category_id'] ?? null;
    $item_name = $data['item_name'] ?? null;
    $purity_karat = $data['purity_karat'] ?? null;
    $base_unit = $data['base_unit'] ?? 'Grams';
    
    if (!$category_id || !$item_name) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing required fields: category_id, item_name"]);
        return;
    }

    $sql = "INSERT INTO items (category_id, item_name, purity_karat, base_unit) 
            VALUES (?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isis", $category_id, $item_name, $purity_karat, $base_unit);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["status" => "success", "message" => "Item created successfully", "id" => $conn->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to create item: " . $stmt->error]);
    }
    $stmt->close();
}

// U: Update (PUT method)
function handleUpdate($conn) {
    $data = json_decode(file_get_contents("php://input"), true);

    $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($data['id']) ? intval($data['id']) : 0);

    if ($id === 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing item ID for update."]);
        return;
    }

    $category_id = $data['category_id'] ?? null;
    $item_name = $data['item_name'] ?? null;
    $purity_karat = $data['purity_karat'] ?? null;
    $base_unit = $data['base_unit'] ?? null;
    
    if (!$category_id || !$item_name) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing required fields for update."]);
        return;
    }

    $sql = "UPDATE items 
            SET category_id = ?, item_name = ?, purity_karat = ?, base_unit = ? 
            WHERE id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isisi", $category_id, $item_name, $purity_karat, $base_unit, $id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["status" => "success", "message" => "Item updated successfully"]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Item not found or no changes made."]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to update item: " . $stmt->error]);
    }
    $stmt->close();
}

// D: Delete (DELETE method)
function handleDelete($conn) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($id === 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing item ID for deletion."]);
        return;
    }
    
    // Note: Foreign Key constraints ensure ki agar item kisi purchase ya sale mein use hua hai, 
    // to yahan delete nahi hoga. Behtar hai ki uske liye soft delete (is_active) use karein.

    $sql = "DELETE FROM items WHERE id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["status" => "success", "message" => "Item deleted successfully"]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Item not found."]);
        }
    } else {
        // Agar foreign key constraint fail hota hai to yahan error aayega
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to delete item: May be linked to transactions. " . $stmt->error]);
    }
    $stmt->close();
}

// Connection close karne ki zimmedari 'config.php' ki ho sakti hai, 
// lekin agar nahi hai to yahan close karna safe hai.
// $conn->close(); // Agar $conn ko include file mein hi close nahi kiya gaya hai

?>