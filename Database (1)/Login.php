<?php
include 'config.php'; // Aapki di hui config file jisme connection hai

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    
    // ================= 1. LOGIN & FETCH (POST/GET) =================
    case 'POST':
        // LOGIN LOGIC
        if (isset($data['action']) && $data['action'] == 'login') {
            $username = $data['username'];
            $password = $data['password'];

            // First, try to find user
            $sql = "SELECT id, username, password, full_name, role FROM users WHERE username = '$username'";
            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                
                // Check if password is hashed (starts with $2y$)
                if (strpos($user['password'], '$2y$') === 0) {
                    // Password is hashed, use password_verify
                    if (password_verify($password, $user['password'])) {
                        // Login success - remove password from response
                        unset($user['password']);
                        echo json_encode(["status" => "success", "message" => "Login Successful", "user" => $user]);
                    } else {
                        echo json_encode(["status" => "error", "message" => "Invalid Username or Password"]);
                    }
                } else {
                    // Plain text password (legacy) - check directly
                    if ($password === $user['password']) {
                        // Upgrade to hashed password
                        $hashed = password_hash($password, PASSWORD_DEFAULT);
                        $updateSql = "UPDATE users SET password = '$hashed' WHERE id = {$user['id']}";
                        $conn->query($updateSql);
                        
                        // Login success - remove password from response
                        unset($user['password']);
                        echo json_encode(["status" => "success", "message" => "Login Successful", "user" => $user]);
                    } else {
                        echo json_encode(["status" => "error", "message" => "Invalid Username or Password"]);
                    }
                }
            } else {
                echo json_encode(["status" => "error", "message" => "Invalid Username or Password"]);
            }
        } 
        // ADD USER LOGIC (Admin only)
        else {
            $username = $data['username'];
            $password = $data['password'];
            $full_name = $data['full_name'];
            $role = $data['role']; // 'admin' or 'staff'
            
            // Hash the password before storing
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);

            $sql = "INSERT INTO users (username, password, full_name, role) VALUES ('$username', '$hashed_password', '$full_name', '$role')";
            
            if ($conn->query($sql)) {
                echo json_encode(["status" => "success", "message" => "User added successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => $conn->error]);
            }
        }
        break;

    // ================= 2. READ ALL USERS (GET) =================
    case 'GET':
        $sql = "SELECT id, username, full_name, role, created_at FROM users";
        $result = $conn->query($sql);
        $users = [];
        
        while($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        echo json_encode(["status" => "success", "data" => $users]);
        break;

    // ================= 3. UPDATE USER (PUT) =================
    case 'PUT':
        $id = $data['id'];
        $full_name = $data['full_name'];
        $role = $data['role'];
        $password = $data['password'];
        
        // Only update password if it's provided and not empty
        if (!empty($password)) {
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $sql = "UPDATE users SET full_name='$full_name', role='$role', password='$hashed_password' WHERE id=$id";
        } else {
            $sql = "UPDATE users SET full_name='$full_name', role='$role' WHERE id=$id";
        }
        
        if ($conn->query($sql)) {
            echo json_encode(["status" => "success", "message" => "User updated successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => $conn->error]);
        }
        break;

    // ================= 4. DELETE USER (DELETE) =================
    case 'DELETE':
        $id = $data['id'];
        
        // Admin user khud ko delete na kar sake iska dhyan rakhein (Optional)
        $sql = "DELETE FROM users WHERE id=$id";
        
        if ($conn->query($sql)) {
            echo json_encode(["status" => "success", "message" => "User deleted successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => $conn->error]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid Request"]);
        break;
}

$conn->close();
?>