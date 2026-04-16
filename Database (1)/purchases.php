<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include "config.php";
$method = $_SERVER['REQUEST_METHOD'];

// 1. Stock Sync Logic (Purana Wala)
function syncStock($conn, $p_id, $src_id, $supp_id, $date, $rate, $making, $weight, $qty, $total) {
    $check = $conn->prepare("SELECT stock_id FROM stock WHERE batch_type='purchase' AND source_id=? AND product_id=?");
    $check->bind_param("ii", $src_id, $p_id);
    $check->execute();
    $res = $check->get_result()->fetch_assoc();

    if($res) {
        $stmt = $conn->prepare("UPDATE stock SET supplier_id=?, batch_date=?, purchase_rate=?, purchase_making=?, net_weight=?, remaining_weight=?, quantity=?, remaining_qty=?, rate_per_gram=?, making_charge=?, total_amount=? WHERE stock_id=?");
        $stmt->bind_param("isdddddddddi", $supp_id, $date, $rate, $making, $weight, $weight, $qty, $qty, $rate, $making, $total, $res['stock_id']);
    } else {
        $stmt = $conn->prepare("INSERT INTO stock (product_id, batch_type, source_id, supplier_id, batch_date, purchase_rate, purchase_making, net_weight, remaining_weight, quantity, remaining_qty, rate_per_gram, making_charge, total_amount) VALUES (?,'purchase',?,?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->bind_param("iiisddddddddd", $p_id, $src_id, $supp_id, $date, $rate, $making, $weight, $weight, $qty, $qty, $rate, $making, $total);
    }
    $stmt->execute();
}

// 2. GET Request (Fixed Fatal Error)
if($method === "GET") {
    if (isset($_GET['id'])) {
        $p_id = (int)$_GET['id'];
        $sql = "SELECT pi.*, c.category_name, c.subcategory_name 
                FROM purchase_items pi 
                JOIN products p ON pi.product_id = p.product_id 
                JOIN categories c ON p.category_id = c.id 
                WHERE pi.purchase_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $p_id);
        $stmt->execute();
        $items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        $mappedItems = array_map(function($it) {
            return [
                'cat' => $it['category_name'],
                'sub' => $it['subcategory_name'],
                'product_id' => $it['product_id'],
                'weight' => $it['net_weight'],
                'quantity' => $it['quantity'],
                'total_weight' => (float)$it['net_weight'] * (int)$it['quantity'],
                'rate' => $it['rate_per_gram'],
                'making_type' => 'fixed', 
                'making_val' => $it['making_charge'],
                'total_amount' => $it['total_amount']
            ];
        }, $items);
        echo json_encode(["status" => "success", "items" => $mappedItems]);
    } else {
        // FIXED: Using s.* to prevent 'Unknown Column' errors
        $sql = "SELECT p.*, s.* FROM purchases p 
                LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id 
                ORDER BY p.purchase_id DESC";
        $res = $conn->query($sql);
        if(!$res) {
            echo json_encode(["status" => "error", "message" => $conn->error]);
            exit;
        }
        echo json_encode(["status" => "success", "data" => $res->fetch_all(MYSQLI_ASSOC)]);
    }
    exit;
}

// 3. POST Request (Save/Update)
if($method === "POST") {
    $conn->begin_transaction();
    try {
        $id = isset($_POST['purchase_id']) && $_POST['purchase_id'] != '' ? (int)$_POST['purchase_id'] : null;
        $supp_id = (int)$_POST['supplier_id'];
        $bill_no = $_POST['bill_no'];
        $p_date = $_POST['purchase_date']; 
        $tax_per = floatval($_POST['tax_percent'] ?? 0);
        $items = json_decode($_POST['items'], true);

        $bill_copy = $_POST['old_bill'] ?? "";
        if(isset($_FILES['bill_image'])) {
            $bill_copy = "uploads/bills/" . time() . "_" . $_FILES['bill_image']['name'];
            move_uploaded_file($_FILES['bill_image']['tmp_name'], $bill_copy);
        }

        $sub = 0; 
        foreach($items as $it) { $sub += floatval($it['total_amount']); }
        $tax_amt = ($sub * $tax_per) / 100;
        $grand = $sub + $tax_amt;

        if($id) {
            $stmt = $conn->prepare("UPDATE purchases SET supplier_id=?, bill_no=?, purchase_date=?, tax_percent=?, tax_amount=?, total_amount=?, bill_copy=? WHERE purchase_id=?");
            $stmt->bind_param("isssddsi", $supp_id, $bill_no, $p_date, $tax_per, $tax_amt, $grand, $bill_copy, $id);
            $stmt->execute();
            $conn->query("DELETE FROM purchase_items WHERE purchase_id=$id");
            $conn->query("DELETE FROM stock WHERE batch_type='purchase' AND source_id=$id");
        } else {
            $stmt = $conn->prepare("INSERT INTO purchases (supplier_id, bill_no, purchase_date, tax_percent, tax_amount, total_amount, bill_copy) VALUES (?,?,?,?,?,?,?)");
            $stmt->bind_param("isssdds", $supp_id, $bill_no, $p_date, $tax_per, $tax_amt, $grand, $bill_copy);
            $stmt->execute();
            $id = $conn->insert_id;
        }

        foreach($items as $it) {
            syncStock($conn, $it['product_id'], $id, $supp_id, $p_date, $it['rate'], $it['making_val'], $it['weight'], $it['quantity'], $it['total_amount']);
            $stmt_item = $conn->prepare("INSERT INTO purchase_items (purchase_id, product_id, net_weight, quantity, rate_per_gram, making_charge, total_amount) VALUES (?,?,?,?,?,?,?)");
            $stmt_item->bind_param("iiidddd", $id, $it['product_id'], $it['weight'], $it['quantity'], $it['rate'], $it['making_val'], $it['total_amount']);
            $stmt_item->execute();
        }
        $conn->commit();
        echo json_encode(["status" => "success"]);
    } catch(Exception $e) { 
        $conn->rollback(); 
        echo json_encode(["status" => "error", "message" => $e->getMessage()]); 
    }
    exit;
}

// 4. DELETE Request
if($method === "DELETE") {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = (int)$data['purchase_id'];
    $conn->query("DELETE FROM stock WHERE batch_type='purchase' AND source_id=$id");
    $conn->query("DELETE FROM purchase_items WHERE purchase_id=$id");
    $conn->query("DELETE FROM purchases WHERE purchase_id=$id");
    echo json_encode(["status" => "success"]);
    exit;
}
?>