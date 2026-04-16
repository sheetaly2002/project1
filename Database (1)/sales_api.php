<?php
// Errors ko screen par dikhane se rokein taaki JSON clean rahe
error_reporting(E_ALL);
ini_set('display_errors', 0); 
ini_set('log_errors', 1);

include 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? '';

// --- 1. GET (Read All or Single Sale) ---
if ($method === 'GET') {
    if (isset($_GET['sale_id'])) {
        $sale_id = $conn->real_escape_string($_GET['sale_id']);
        
        $sql = "SELECT si.*, s.barcode, p.product_name, s.purity, s.net_weight 
                FROM s_sales_items si
                JOIN s_stock s ON si.stock_id = s.id
                JOIN s_products p ON s.product_id = p.id
                WHERE si.sale_id = '$sale_id'";
                
        $result = $conn->query($sql);
        $items = [];
        while($row = $result->fetch_assoc()) { 
            $items[] = $row; 
        }
        echo json_encode(["status" => "success", "items" => $items]);
    } else {
        $sql = "SELECT s.*, c.customer_name, c.mobile 
                FROM s_sales s
                LEFT JOIN customers c ON s.customer_id = c.customer_id
                ORDER BY s.id DESC";
        $result = $conn->query($sql);
        $sales = [];
        while($row = $result->fetch_assoc()) { $sales[] = $row; }
        echo json_encode($sales);
    }
    exit;
}

// --- 2. POST (Create Sale) ---
if ($method === 'POST' && $action === 'create') {
    $conn->begin_transaction();
    try {
        $invoice_no   = "INV-" . time();
        $customer_id  = $data['customer_id'];
        $total_weight = $data['total_weight'];
        $sub_total    = $data['sub_total'];
        $tax_amount   = $data['tax_amount'];
        $discount     = $data['discount'] ?? 0;
        $final_amount = $data['final_amount'];
        $total_profit = $data['total_profit'] ?? 0; 
        $payment_mode = $data['payment_mode'] ?? 'Cash';

        // Main Sales Entry
        $sql = "INSERT INTO `s_sales` (`invoice_no`, `customer_id`, `total_weight`, `sub_total`, `tax_amount`, `discount`, `final_amount`, `total_profit`, `payment_mode`, `created_at`) 
                VALUES ('$invoice_no', '$customer_id', '$total_weight', '$sub_total', '$tax_amount', '$discount', '$final_amount', '$total_profit', '$payment_mode', NOW())";
        
        if ($conn->query($sql)) {
            $sale_id = $conn->insert_id;
            
            foreach ($data['items'] as $item) {
                $stock_id  = $item['id'];
                $sale_rate = $item['sale_rate'];
                
                // Yahan ensure karein ki React se 'making_type' aur 'making_value' aa raha hai
                // Agar React mein 'm_type' bhej rahe hain toh wahi use karein
                $m_type    = $item['m_type'] ?? 'Fixed'; 
                $m_value   = $item['m_value'] ?? 0;
                
                $m_total   = $item['making_total'] ?? 0;
                $i_total   = $item['sub_total'] ?? 0;
                $p_cost    = $item['total_cost'] ?? 0; 
                $i_profit  = $i_total - $p_cost;

                // Items Entry with Percentage/Fixed Type
                $item_sql = "INSERT INTO `s_sales_items` 
                    (`sale_id`, `stock_id`, `quantity`, `sale_rate`, `making_type`, `making_value`, `making_total`, `item_total`, `purchase_cost`, `item_profit`) 
                    VALUES 
                    ('$sale_id', '$stock_id', 1, '$sale_rate', '$m_type', '$m_value', '$m_total', '$i_total', '$p_cost', '$i_profit')";
                
                if (!$conn->query($item_sql)) {
                    throw new Exception("Item insert fail: " . $conn->error);
                }
                
                // Stock update
                $conn->query("UPDATE s_stock SET status = 'Sold' WHERE id = '$stock_id'");
            }
            
            $conn->commit();
            echo json_encode(["status" => "success", "sale_id" => $sale_id, "invoice_no" => $invoice_no]);
        } else {
            throw new Exception("Sale insert fail: " . $conn->error);
        }
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}
// --- 3. DELETE (Delete Sale & Restore Stock) ---
if ($method === 'DELETE' || ($method === 'GET' && $action === 'delete')) {
    $id = $_GET['id'] ?? ($data['id'] ?? null);
    if (!$id) {
        echo json_encode(["status" => "error", "message" => "ID missing"]);
        exit;
    }
    
    $conn->begin_transaction();
    try {
        $res = $conn->query("SELECT stock_id FROM s_sales_items WHERE sale_id = '$id'");
        while($row = $res->fetch_assoc()) {
            $sid = $row['stock_id'];
            $conn->query("UPDATE s_stock SET status = 'Available' WHERE id = '$sid'");
        }
        $conn->query("DELETE FROM s_sales_items WHERE sale_id = '$id'");
        $conn->query("DELETE FROM s_sales WHERE id = '$id'");
        
        $conn->commit();
        echo json_encode(["status" => "success", "message" => "Sale deleted and stock restored"]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

// --- 4. UPDATE ---
if ($method === 'PUT') {
    $id = $data['id'];
    $pmode = $data['payment_mode'];
    $sql = "UPDATE s_sales SET payment_mode = '$pmode' WHERE id = '$id'";
    if ($conn->query($sql)) {
        echo json_encode(["status" => "success", "message" => "Updated"]);
    }
    exit;
}
?>