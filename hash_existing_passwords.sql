-- ============================================
-- PASSWORD HASHING SCRIPT FOR EXISTING USERS
-- Run this ONCE to secure all existing passwords
-- ============================================

-- This script will update all plain-text passwords to bcrypt hashed passwords
-- IMPORTANT: After running this, all passwords will be hashed and secure!

-- Step 1: Check current passwords (for verification)
SELECT id, username, password, full_name, role FROM users;

-- Step 2: Update passwords to hashed versions
-- NOTE: You need to run a PHP script to properly hash passwords
-- Here's the PHP script you need to execute:

/*
<?php
// Save this as hash_passwords.php and run it ONCE from browser
include 'config.php';

// Get all users
$result = $conn->query("SELECT id, username, password FROM users");

while($user = $result->fetch_assoc()) {
    // Check if password is already hashed
    if (strpos($user['password'], '$2y$') !== 0) {
        // Hash the plain text password
        $hashed = password_hash($user['password'], PASSWORD_DEFAULT);
        
        // Update in database
        $updateSql = "UPDATE users SET password = ? WHERE id = ?";
        $stmt = $conn->prepare($updateSql);
        $stmt->bind_param("si", $hashed, $user['id']);
        
        if ($stmt->execute()) {
            echo "✓ Password hashed for user: " . $user['username'] . "<br>";
        } else {
            echo "✗ Failed to hash password for user: " . $user['username'] . "<br>";
        }
    } else {
        echo "○ Already hashed: " . $user['username'] . "<br>";
    }
}

echo "<br><strong>All passwords have been secured!</strong>";
$conn->close();
?>
*/

-- Step 3: Create a PHP file called "hash_passwords.php" in Database folder
-- with the code above and visit: https://shreejifamily.com/jewellery/Database/hash_passwords.php

-- Step 4: After running the PHP script, verify passwords are hashed
SELECT id, username, password, full_name, role FROM users;
-- All passwords should now start with "$2y$"

-- Step 5: DELETE the hash_passwords.php file after running it for security!

-- ============================================
-- ALTERNATIVE: Manual Update (if PHP script doesn't work)
-- You can manually set hashed passwords using this:
-- ============================================

-- Example: Hash password for admin (password: admin123)
-- You need to generate the hash using PHP: password_hash('admin123', PASSWORD_DEFAULT)
-- Then update like this:
-- UPDATE users SET password = '$2y$10$...generated_hash...' WHERE username = 'admin';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check how many passwords are hashed
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN password LIKE '$2y$%' THEN 1 ELSE 0 END) as hashed,
    SUM(CASE WHEN password NOT LIKE '$2y$%' THEN 1 ELSE 0 END) as plain_text
FROM users;

-- List users with plain text passwords (should be 0 after hashing)
SELECT id, username, full_name, role 
FROM users 
WHERE password NOT LIKE '$2y$%';

-- ============================================
-- IMPORTANT SECURITY NOTES:
-- ============================================
-- 1. Never share password hashes
-- 2. Delete hash_passwords.php after use
-- 3. Use strong passwords (min 8 characters)
-- 4. Regularly backup your database
-- 5. Consider implementing password reset feature
-- ============================================
