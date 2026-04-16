<?php
include 'config.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"), true);
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action == 'get_all') {
    $sql = "SELECT * FROM s_suppliers ORDER BY id DESC";
    $result = $conn->query($sql);
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
}

if ($action == 'save') {
    $firm = mysqli_real_escape_string($conn, $data['firm_name']);
    $person = mysqli_real_escape_string($conn, $data['contact_person']);
    $phone = mysqli_real_escape_string($conn, $data['phone']);
    $gst = mysqli_real_escape_string($conn, $data['gst_no']);
    $bank = mysqli_real_escape_string($conn, $data['bank_name']);
    $acc = mysqli_real_escape_string($conn, $data['account_no']);
    $ifsc = mysqli_real_escape_string($conn, $data['ifsc_code']);
    $address = mysqli_real_escape_string($conn, $data['address']);

    if (!empty($data['id'])) {
        $id = $data['id'];
        $sql = "UPDATE s_suppliers SET firm_name='$firm', contact_person='$person', phone='$phone', gst_no='$gst', bank_name='$bank', account_no='$acc', ifsc_code='$ifsc', address='$address' WHERE id=$id";
    } else {
        $sql = "INSERT INTO s_suppliers (firm_name, contact_person, phone, gst_no, bank_name, account_no, ifsc_code, address) VALUES ('$firm', '$person', '$phone', '$gst', '$bank', '$acc', '$ifsc', '$address')";
    }

    if ($conn->query($sql)) echo json_encode(["status" => "success"]);
    else echo json_encode(["status" => "error", "msg" => $conn->error]);
}

if ($action == 'delete') {
    $id = $_GET['id'];
    if ($conn->query("DELETE FROM s_suppliers WHERE id=$id")) echo json_encode(["status" => "success"]);
}
?>