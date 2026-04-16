<?php
include "config.php";

/* =========================
   FUNCTIONS
========================= */

// 🔹 AUTO BARCODE GENERATE
function generateBarcode() {
    return "JW" . date("Y") . rand(100000, 999999);
}

// 🔹 AUTO HSN GENERATE
function generateHSN($purity) {
    if (strpos($purity, '22K') !== false || strpos($purity, '18K') !== false) {
        return "7113"; // Gold Jewellery
    } elseif (stripos($purity, 'Silver') !== false) {
        return "7114"; // Silver Jewellery
    } else {
        return "7116"; // Diamond / Others
    }
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    /* =========================
       CREATE PRODUCT
    ========================= */
    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['category_id']) || empty($data['product_name']) || empty($data['purity'])) {
            echo json_encode([
                "status" => "error",
                "message" => "Required fields missing"
            ]);
            exit;
        }

        $category_id       = $data['category_id'];
        $product_name      = $data['product_name'];
        $purity            = $data['purity'];
        $default_weight    = $data['default_weight'] ?? 0;
        $default_quantity  = $data['default_quantity'] ?? 1;

        // AUTO GENERATE
        $barcode_no = generateBarcode();
        $hsn_code   = generateHSN($purity);

        $sql = "INSERT INTO products
                (category_id, product_name, barcode_no, purity, default_weight, default_quantity, hsn_code)
                VALUES (?,?,?,?,?,?,?)";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "isssdis",
            $category_id,
            $product_name,
            $barcode_no,
            $purity,
            $default_weight,
            $default_quantity,
            $hsn_code
        );

        if ($stmt->execute()) {
            echo json_encode([
                "status" => "success",
                "message" => "Product added successfully",
                "barcode_no" => $barcode_no,
                "hsn_code" => $hsn_code
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => $stmt->error
            ]);
        }
        break;

    /* =========================
       READ ALL PRODUCTS
    ========================= */
    case "GET":
        $sql = "SELECT p.*, c.category_name, c.subcategory_name
                FROM products p
                JOIN categories c ON p.category_id = c.id
                ORDER BY p.product_id DESC";

        $result = $conn->query($sql);
        $products = [];

        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }

        echo json_encode([
            "status" => "success",
            "data" => $products
        ]);
        break;

    /* =========================
       UPDATE PRODUCT
    ========================= */
    case "PUT":
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['product_id'])) {
            echo json_encode([
                "status" => "error",
                "message" => "Product ID required"
            ]);
            exit;
        }

        $product_id        = $data['product_id'];
        $category_id       = $data['category_id'];
        $product_name      = $data['product_name'];
        $purity            = $data['purity'];
        $default_weight    = $data['default_weight'] ?? 0;
        $default_quantity  = $data['default_quantity'] ?? 1;

        $hsn_code = generateHSN($purity);

        $sql = "UPDATE products SET
                category_id = ?,
                product_name = ?,
                purity = ?,
                default_weight = ?,
                default_quantity = ?,
                hsn_code = ?
                WHERE product_id = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "issdisi",
            $category_id,
            $product_name,
            $purity,
            $default_weight,
            $default_quantity,
            $hsn_code,
            $product_id
        );

        if ($stmt->execute()) {
            echo json_encode([
                "status" => "success",
                "message" => "Product updated successfully"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => $stmt->error
            ]);
        }
        break;

    /* =========================
       DELETE PRODUCT
    ========================= */
    case "DELETE":
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['product_id'])) {
            echo json_encode([
                "status" => "error",
                "message" => "Product ID required"
            ]);
            exit;
        }

        $product_id = $data['product_id'];

        $sql = "DELETE FROM products WHERE product_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $product_id);

        if ($stmt->execute()) {
            echo json_encode([
                "status" => "success",
                "message" => "Product deleted successfully"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => $stmt->error
            ]);
        }
        break;

    default:
        echo json_encode([
            "status" => "error",
            "message" => "Invalid Request Method"
        ]);
}
?>
