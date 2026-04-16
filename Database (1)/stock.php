<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
include "config.php";

$method = $_SERVER['REQUEST_METHOD'];

// --- 1. STOCK SYNC LOGIC (To be called from Purchase/Opening Stock) ---
function syncStockWithBarcode($conn, $p_id, $src_id, $type, $supp_id, $date, $rate, $making, $weight, $qty, $total) {
    
    // a. Product table se HSN code uthana
    $p_res = $conn->query("SELECT hsn_code FROM products WHERE product_id = $p_id");
    $p_row = $p_res->fetch_assoc();
    $hsn = $p_row['hsn_code'] ?? '7113'; // Default HSN for Jewellery

    // b. Unique Barcode Generate karna (e.g., JWL24X89)
    // JWL + Year + Random 5 digits
    $barcode = "JWL" . date("y") . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 5));

    // c. Check if record exists
    $check = $conn->prepare("SELECT stock_id FROM stock WHERE batch_type=? AND source_id=? AND product_id=?");
    $check->bind_param("sii", $type, $src_id, $p_id);
    $check->execute();
    $res = $check->get_result()->fetch_assoc();

    if($res) {
        // Update existing stock
        $stmt = $conn->prepare("UPDATE stock SET supplier_id=?, batch_date=?, purchase_rate=?, purchase_making=?, net_weight=?, remaining_weight=?, quantity=?, remaining_qty=?, rate_per_gram=?, making_charge=?, total_amount=? WHERE stock_id=?");
        $stmt->bind_param("isdddddddddi", $supp_id, $date, $rate, $making, $weight, $weight, $qty, $qty, $rate, $making, $total, $res['stock_id']);
    } else {
        // Insert NEW stock with Barcode and HSN
        $stmt = $conn->prepare("INSERT INTO stock (product_id, batch_type, source_id, supplier_id, hsn_code, barcode_no, batch_date, purchase_rate, purchase_making, net_weight, remaining_weight, quantity, remaining_qty, rate_per_gram, making_charge, total_amount) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->bind_param("ississsddddddddd", $p_id, $type, $src_id, $supp_id, $hsn, $barcode, $date, $rate, $making, $weight, $weight, $qty, $qty, $rate, $making, $total);
    }
    return $stmt->execute();
}

// --- 2. GET STOCK DATA (For Dashboard) ---
if($method === "GET") {
    $sql = "SELECT s.*, p.product_name, p.purity, c.category_name 
            FROM stock s 
            JOIN products p ON s.product_id = p.product_id 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE s.remaining_qty > 0 
            ORDER BY s.stock_id DESC";
    
    $res = $conn->query($sql);
    echo json_encode(["status" => "success", "data" => $res->fetch_all(MYSQLI_ASSOC)]);
}
?>