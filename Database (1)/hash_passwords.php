<?php
// ============================================
// ONE-TIME PASSWORD HASHING SCRIPT
// RUN THIS ONCE AND THEN DELETE THIS FILE!
// ============================================

include 'config.php';

echo "<!DOCTYPE html>
<html>
<head>
    <title>Hash Passwords - Security Update</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #ffd700;
            padding-bottom: 10px;
        }
        .success {
            color: #2e7d32;
            background: #e8f5e9;
            padding: 10px;
            margin: 5px 0;
            border-left: 4px solid #2e7d32;
        }
        .info {
            color: #0277bd;
            background: #e1f5fe;
            padding: 10px;
            margin: 5px 0;
            border-left: 4px solid #0277bd;
        }
        .error {
            color: #c62828;
            background: #ffebee;
            padding: 10px;
            margin: 5px 0;
            border-left: 4px solid #c62828;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin: 20px 0;
        }
        .stat-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-box h3 {
            margin: 0;
            font-size: 32px;
            color: #333;
        }
        .stat-box p {
            margin: 5px 0 0;
            color: #666;
        }
        button {
            background: #c62828;
            color: white;
            border: none;
            padding: 12px 30px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
        }
        button:hover {
            background: #b71c1c;
        }
    </style>
</head>
<body>
    <div class='container'>
        <h1>🔒 Password Security Upgrade</h1>
        
        <div class='warning'>
            <strong>⚠️ IMPORTANT:</strong> This is a ONE-TIME script. After running it, DELETE this file for security!
        </div>";

try {
    // Check if already hashed
    $checkResult = $conn->query("SELECT COUNT(*) as count FROM users WHERE password LIKE '\$2y\$%'");
    $checkRow = $checkResult->fetch_assoc();
    $alreadyHashed = $checkRow['count'];
    
    // Get total users
    $totalResult = $conn->query("SELECT COUNT(*) as count FROM users");
    $totalRow = $totalResult->fetch_assoc();
    $totalUsers = $totalRow['count'];
    
    echo "<div class='stats'>
            <div class='stat-box'>
                <h3>$totalUsers</h3>
                <p>Total Users</p>
            </div>
            <div class='stat-box'>
                <h3>$alreadyHashed</h3>
                <p>Already Hashed</p>
            </div>
            <div class='stat-box'>
                <h3>" . ($totalUsers - $alreadyHashed) . "</h3>
                <p>Need Hashing</p>
            </div>
          </div>";
    
    if ($alreadyHashed == $totalUsers) {
        echo "<div class='info'>
                ✅ <strong>All passwords are already hashed!</strong> No action needed.
              </div>";
    } else {
        echo "<h2>Starting Password Hashing...</h2>";
        
        // Get all users
        $result = $conn->query("SELECT id, username, password FROM users");
        $hashed = 0;
        $failed = 0;
        $skipped = 0;
        
        while($user = $result->fetch_assoc()) {
            // Check if password is already hashed
            if (strpos($user['password'], '$2y$') === 0) {
                echo "<div class='info'>○ Skipped (already hashed): <strong>{$user['username']}</strong></div>";
                $skipped++;
            } else {
                // Hash the plain text password
                $hashedPassword = password_hash($user['password'], PASSWORD_DEFAULT);
                
                // Update in database using prepared statement
                $updateSql = "UPDATE users SET password = ? WHERE id = ?";
                $stmt = $conn->prepare($updateSql);
                $stmt->bind_param("si", $hashedPassword, $user['id']);
                
                if ($stmt->execute()) {
                    echo "<div class='success'>✓ Successfully hashed: <strong>{$user['username']}</strong></div>";
                    $hashed++;
                } else {
                    echo "<div class='error'>✗ Failed to hash: <strong>{$user['username']}</strong></div>";
                    $failed++;
                }
            }
        }
        
        echo "<hr>
              <h2>Summary</h2>
              <div class='stats'>
                  <div class='stat-box' style='background: #e8f5e9;'>
                      <h3 style='color: #2e7d32;'>$hashed</h3>
                      <p>Hashed Successfully</p>
                  </div>
                  <div class='stat-box' style='background: #e1f5fe;'>
                      <h3 style='color: #0277bd;'>$skipped</h3>
                      <p>Skipped (Already Done)</p>
                  </div>
                  <div class='stat-box' style='background: #ffebee;'>
                      <h3 style='color: #c62828;'>$failed</h3>
                      <p>Failed</p>
                  </div>
              </div>";
        
        if ($failed == 0) {
            echo "<div class='success' style='margin-top: 20px; font-size: 18px;'>
                    🎉 <strong>All passwords have been secured successfully!</strong>
                  </div>";
        }
    }
    
    // Show final verification
    echo "<hr><h2>Final Verification</h2>";
    $verifyResult = $conn->query("SELECT id, username, full_name, role, 
                                  CASE 
                                      WHEN password LIKE '\$2y\$%' THEN '✅ Hashed'
                                      ELSE '❌ Plain Text'
                                  END as status 
                                  FROM users");
    
    echo "<table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>
            <tr style='background: #f8f9fa;'>
                <th style='padding: 10px; text-align: left; border-bottom: 2px solid #ddd;'>ID</th>
                <th style='padding: 10px; text-align: left; border-bottom: 2px solid #ddd;'>Username</th>
                <th style='padding: 10px; text-align: left; border-bottom: 2px solid #ddd;'>Full Name</th>
                <th style='padding: 10px; text-align: left; border-bottom: 2px solid #ddd;'>Role</th>
                <th style='padding: 10px; text-align: left; border-bottom: 2px solid #ddd;'>Status</th>
            </tr>";
    
    while($row = $verifyResult->fetch_assoc()) {
        echo "<tr>
                <td style='padding: 10px; border-bottom: 1px solid #eee;'>{$row['id']}</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee;'>{$row['username']}</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee;'>{$row['full_name']}</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee;'>{$row['role']}</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee;'>{$row['status']}</td>
              </tr>";
    }
    echo "</table>";
    
    echo "<hr>
          <div class='warning'>
              <h3>🔒 Next Steps:</h3>
              <ol>
                  <li><strong>Test login</strong> with your existing credentials to ensure it works</li>
                  <li><strong>DELETE this file</strong> (hash_passwords.php) from the server immediately!</li>
                  <li>Keep your database backup safe</li>
              </ol>
          </div>";
    
} catch (Exception $e) {
    echo "<div class='error'>
            ❌ Error: " . $e->getMessage() . "
          </div>";
}

echo "    </div>
</body>
</html>";

$conn->close();
?>
