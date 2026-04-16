<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Aapki existing config file
include 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$response = [
    "totalSales" => 0,
    "totalProfit" => 0,
    "totalStockWeight" => 0,
    "stockValue" => 0,
    "totalProducts" => 0,
    "totalCustomers" => 0,
    "todaySales" => 0,
    "todayProfit" => 0,
    "pendingOrders" => 0,
    "categoryWise" => []
];

try {
    // 1. Total Sales & Profit (Table: s_sales)
    $salesQuery = "SELECT 
                    COALESCE(SUM(final_amount), 0) as total_rev, 
                    COALESCE(SUM(total_profit), 0) as net_profit 
                   FROM s_sales"; 
    $salesRes = $conn->query($salesQuery);
    if($salesRes && $row = $salesRes->fetch_assoc()){
        $response['totalSales'] = round((float)$row['total_rev'], 2);
        $response['totalProfit'] = round((float)$row['net_profit'], 2);
    }

    // 2. Today's Sales & Profit
    $today = date('Y-m-d');
    $todayQuery = "SELECT 
                    COALESCE(SUM(final_amount), 0) as today_rev, 
                    COALESCE(SUM(total_profit), 0) as today_profit 
                   FROM s_sales 
                   WHERE DATE(created_at) = '$today'";
    $todayRes = $conn->query($todayQuery);
    if($todayRes && $row = $todayRes->fetch_assoc()){
        $response['todaySales'] = round((float)$row['today_rev'], 2);
        $response['todayProfit'] = round((float)$row['today_profit'], 2);
    }

    // 3. Current Stock (Table: s_stock)
    $stockQuery = "SELECT 
                    COALESCE(SUM(net_weight), 0) as total_wt, 
                    COALESCE(SUM(total_cost), 0) as total_val 
                   FROM s_stock 
                   WHERE status = 'AVAILABLE'";
    $stockRes = $conn->query($stockQuery);
    if($stockRes && $row = $stockRes->fetch_assoc()){
        $response['totalStockWeight'] = round((float)$row['total_wt'], 3);
        $response['stockValue'] = round((float)$row['total_val'], 2);
    }

    // 4. Total Products
    $prodQuery = "SELECT COUNT(*) as total FROM s_products";
    $prodRes = $conn->query($prodQuery);
    if($prodRes && $row = $prodRes->fetch_assoc()){
        $response['totalProducts'] = (int)$row['total'];
    }

    // 5. Total Customers
    $custQuery = "SELECT COUNT(*) as total FROM customers";
    $custRes = $conn->query($custQuery);
    if($custRes && $row = $custRes->fetch_assoc()){
        $response['totalCustomers'] = (int)$row['total'];
    }

    // 6. Pending Repair Orders
    $repairQuery = "SELECT COUNT(*) as pending FROM repairing WHERE status IN ('Pending', 'In Progress')";
    $repairRes = $conn->query($repairQuery);
    if($repairRes && $row = $repairRes->fetch_assoc()){
        $response['pendingOrders'] = (int)$row['pending'];
    }

    // 7. Category wise Performance
    $catQuery = "SELECT 
                    mc.name as category, 
                    COUNT(DISTINCT s.product_id) as qty, 
                    COALESCE(SUM(s.net_weight), 0) as wt 
                 FROM s_stock s
                 JOIN s_products p ON s.product_id = p.id
                 JOIN sub_categories sc ON p.sub_cat_id = sc.id
                 JOIN main_categories mc ON sc.main_cat_id = mc.id
                 WHERE s.status = 'AVAILABLE'
                 GROUP BY mc.name";
    $catRes = $conn->query($catQuery);
    if($catRes){
        while($row = $catRes->fetch_assoc()){
            $response['categoryWise'][] = [
                "category" => $row['category'],
                "qty" => (int)$row['qty'],
                "wt" => round((float)$row['wt'], 3)
            ];
        }
    }

    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
?>