<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include "config.php";
$method = $_SERVER['REQUEST_METHOD'];

/**
 * HELPER: UPSERT STOCK
 * Yeh function 'stock' table mein quantity aur weight ko 
 * biki hui (sold) entries ke hisab se sahi set karta hai.
 */
function upsertStock($conn, $product_id, $opening_stock_id, $net_weight, $quantity, $rate, $making, $total_amount, $batch_date = null) {
    $batch_date = $batch_date ?? date("Y-m-d H:i:s");

    // 1. Check karo ki purana stock record hai ya nahi aur kitna bika hua hai
    $stmt = $conn->prepare("SELECT stock_id, sold_qty, sold_weight FROM stock WHERE batch_type='opening' AND source_id=?");
    $stmt->bind_param("i", $opening_stock_id);
    $stmt->execute();
    $stock = $stmt->get_result()->fetch_assoc();

    if ($stock) {
        // 2. Bika hua maal hamesha fixed rahega (Sales table se control hota hai)
        $sold_qty = (float)$stock['sold_qty'];
        $sold_weight = (float)$stock['sold_weight'];

        // 3. Naya Bacha hua maal = Naya Total - Purana Bika Hua
        // Example: Pehle 20g tha (10g sold). Ab 60g kiya, toh 60-10 = 50g remaining.
        $new_remaining_qty = $quantity - $sold_qty;
        $new_remaining_weight = $net_weight - $sold_weight;

        $u = $conn->prepare("
            UPDATE stock SET
                net_weight = ?,
                remaining_weight = ?,
                quantity = ?,
                remaining_qty = ?,
                rate_per_gram = ?,
                making_charge = ?,
                total_amount = ?,
                batch_date = ?
            WHERE stock_id = ?
        ");
        $u->bind_param("dddddddsi", $net_weight, $new_remaining_weight, $quantity, $new_remaining_qty, $rate, $making, $total_amount, $batch_date, $stock['stock_id']);
        $u->execute();
    } else {
        // Nayi entry: Pehli baar sold_qty aur sold_weight 0 hi rahenge
        $batch_type = 'opening';
        $i = $conn->prepare("
            INSERT INTO stock 
            (product_id, batch_type, source_id, batch_date, net_weight, remaining_weight, quantity, remaining_qty, sold_qty, sold_weight, rate_per_gram, making_charge, total_amount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)
        ");
        $i->bind_param("isissddiddd", $product_id, $batch_type, $opening_stock_id, $batch_date, $net_weight, $net_weight, $quantity, $quantity, $rate, $making, $total_amount);
        $i->execute();
    }
}

/* =================== MAIN LOGIC: POST / GET / DELETE =================== */

if ($method === "POST") {
    $d = json_decode(file_get_contents("php://input"), true);
    $product_id   = (int)($d['product_id'] ?? 0);
    $net_weight   = (float)($d['net_weight'] ?? 0);
    $quantity     = (float)($d['quantity'] ?? 0);
    $rate         = (float)($d['rate_per_gram'] ?? 0);
    $making       = (float)($d['making_charge'] ?? 0);
    $total_amount = (float)($d['total_amount'] ?? 0);
    $entry_date   = $d['entry_date'] ?? date("Y-m-d H:i:s");
    $os_id        = (int)($d['opening_stock_id'] ?? 0);

    $conn->begin_transaction();
    try {
        if ($os_id > 0) {
            // --- UPDATE CASE ---
            // Pehle check karo ki kitna maal bik chuka hai
            $stCheck = $conn->prepare("SELECT sold_qty, sold_weight FROM stock WHERE batch_type='opening' AND source_id=?");
            $stCheck->bind_param("i", $os_id);
            $stCheck->execute();
            $res = $stCheck->get_result()->fetch_assoc();
            
            if ($res) {
                if ($quantity < $res['sold_qty']) {
                    throw new Exception("Error: " . $res['sold_qty'] . " pieces pehle hi bik chuke hain. Quantity isse kam nahi ho sakti.");
                }
                if ($net_weight < $res['sold_weight']) {
                    throw new Exception("Error: " . $res['sold_weight'] . "g weight pehle hi bik chuka hai. Weight isse kam nahi ho sakta.");
                }
            }

            $u = $conn->prepare("UPDATE opening_stock SET product_id=?, net_weight=?, quantity=?, rate_per_gram=?, making_charge=?, total_amount=?, entry_date=? WHERE opening_stock_id=?");
            $u->bind_param("ididdisi", $product_id, $net_weight, $quantity, $rate, $making, $total_amount, $entry_date, $os_id);
            $u->execute();
            $current_id = $os_id;
        } else {
            // --- INSERT CASE ---
            $i = $conn->prepare("INSERT INTO opening_stock (product_id, net_weight, quantity, rate_per_gram, making_charge, total_amount, entry_date) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $i->bind_param("ididdis", $product_id, $net_weight, $quantity, $rate, $making, $total_amount, $entry_date);
            $i->execute();
            $current_id = $conn->insert_id;
        }

        // Stock table sync
        upsertStock($conn, $product_id, $current_id, $net_weight, $quantity, $rate, $making, $total_amount, $entry_date);
        
        $conn->commit();
        echo json_encode(["status" => "success", "message" => "Stock and Vault updated successfully"]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

if ($method === "GET") {
    $q = $conn->query("SELECT os.*, p.product_name, p.purity, s.sold_qty, s.sold_weight 
                       FROM opening_stock os 
                       JOIN products p ON p.product_id=os.product_id 
                       LEFT JOIN stock s ON s.source_id = os.opening_stock_id AND s.batch_type='opening'
                       ORDER BY os.opening_stock_id DESC");
    $data = [];
    while ($r = $q->fetch_assoc()) $data[] = $r;
    echo json_encode(["status" => "success", "data" => $data]);
    exit;
}

if ($method === "DELETE") {
    $d = json_decode(file_get_contents("php://input"), true);
    $id = (int)($d['opening_stock_id'] ?? 0);
    $conn->begin_transaction();
    try {
        $check = $conn->prepare("SELECT sold_qty FROM stock WHERE batch_type='opening' AND source_id=?");
        $check->bind_param("i", $id);
        $check->execute();
        $res = $check->get_result()->fetch_assoc();
        
        if ($res && $res['sold_qty'] > 0) {
            throw new Exception("Security: Bika hua maal delete nahi kiya ja sakta!");
        }
        
        $conn->query("DELETE FROM stock WHERE batch_type='opening' AND source_id = $id");
        $conn->query("DELETE FROM opening_stock WHERE opening_stock_id = $id");
        $conn->commit();
        echo json_encode(["status" => "success", "message" => "Deleted successfully"]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}
?>