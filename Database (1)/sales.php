<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");

include "config.php";

function respond($status, $message, $data = null, $items = null){
    echo json_encode(["status" => $status, "message" => $message, "data" => $data, "items" => $items]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

/* ---------------- FETCH SALES ---------------- */
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    if (isset($_GET['sale_id'])) {
        $sale_id = intval($_GET['sale_id']);
        
        // Header with Customer Info
        $saleQuery = "SELECT s.*, c.customer_name, c.mobile, c.address 
                      FROM sales s 
                      LEFT JOIN customers c ON s.customer_id = c.customer_id 
                      WHERE s.sale_id = $sale_id";
        $sale = $conn->query($saleQuery)->fetch_assoc();
        
        // Items with Category & Product Names (Most Important for Printing)
        $items = [];
        $query = "SELECT si.*, p.product_name, cat.category_name, cat.subcategory_name 
                  FROM sale_items si 
                  LEFT JOIN products p ON si.product_id = p.product_id
                  LEFT JOIN categories cat ON p.category_id = cat.id
                  WHERE si.sale_id = $sale_id";
        $res = $conn->query($query);
        while($row = $res->fetch_assoc()) $items[] = $row;
        
        respond("success", "Fetched", $sale, $items);
    } else {
        $query = "SELECT s.*, c.customer_name FROM sales s 
                  LEFT JOIN customers c ON s.customer_id = c.customer_id 
                  ORDER BY s.sale_id DESC";
        $res = $conn->query($query);
        $sales = [];
        while($row = $res->fetch_assoc()) $sales[] = $row;
        respond("success", "Fetched All", $sales);
    }
}

/* ---------------- SAVE SALE ---------------- */
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $conn->begin_transaction();
    try {
        $stmt = $conn->prepare("INSERT INTO sales (customer_id, bill_no, sale_date, tax_type, tax_percent, tax_amount, total_amount) VALUES (?,?,?,?,?,?,?)");
        $stmt->bind_param("isssddd", $data['customer_id'], $data['bill_no'], $data['sale_date'], $data['tax_type'], $data['tax_percent'], $data['tax_amount'], $data['total_amount']);
        $stmt->execute();
        $sale_id = $stmt->insert_id;

        foreach ($data['sale_items'] as $item) {
            $sid = intval($item['stock_id']);
            $pid = intval($item['product_id']);
            
            $stmtItem = $conn->prepare("INSERT INTO sale_items (sale_id, product_id, stock_id, quantity, net_weight, rate_per_gram, making_charge_type, making_charge, total_amount) VALUES (?,?,?,?,?,?,?,?,?)");
            $stmtItem->bind_param("iiidddsid", $sale_id, $pid, $sid, $item['quantity'], $item['net_weight'], $item['rate_per_gram'], $item['making_charge_type'], $item['making_charge'], $item['total_amount']);
            $stmtItem->execute();

            $conn->query("UPDATE stock SET remaining_qty = remaining_qty - {$item['quantity']}, remaining_weight = remaining_weight - {$item['net_weight']}, sold_qty = sold_qty + {$item['quantity']} WHERE stock_id = $sid");
        }
        $conn->commit();
        respond("success", "Sale Saved");
    } catch (Exception $e) { $conn->rollback(); respond("error", $e->getMessage()); }
}

/* ---------------- DELETE SALE (With Stock Restore) ---------------- */
if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    $data = json_decode(file_get_contents("php://input"), true);
    $sid = intval($data['sale_id']);
    $conn->begin_transaction();
    try {
        $items = $conn->query("SELECT * FROM sale_items WHERE sale_id=$sid");
        while($it = $items->fetch_assoc()) {
            $conn->query("UPDATE stock SET remaining_qty = remaining_qty + {$it['quantity']}, remaining_weight = remaining_weight + {$it['net_weight']}, sold_qty = sold_qty - {$it['quantity']} WHERE stock_id = {$it['stock_id']}");
        }
        $conn->query("DELETE FROM sale_items WHERE sale_id=$sid");
        $conn->query("DELETE FROM sales WHERE sale_id=$sid");
        $conn->commit();
        respond("success", "Deleted");
    } catch(Exception $e) { $conn->rollback(); respond("error", $e->getMessage()); }
}
?>