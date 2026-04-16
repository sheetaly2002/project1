# 🧪 TESTING GUIDE - Quick Verification

## Test 1: Dashboard Real Data ⏱️ 2 minutes

### Steps:
```
1. Start React app: npm start
2. Login with any user (e.g., admin/admin123)
3. Look at Dashboard home screen
```

### Expected Result:
✅ You should see:
- Today's Sales: ₹XXXX.XX (or ₹0.00 if no sales today)
- Total Products: Actual number (e.g., 6)
- Active Customers: Actual number (e.g., 8)
- Pending Orders: Number or 0

❌ If you see "Loading..." stuck:
- Check browser console (F12)
- Verify BASE_URL in apiConfig.js
- Check network tab for API errors

---

## Test 2: Password Hashing - New User ⏱️ 2 minutes

### Steps:
```
1. Login as admin
2. Go to "Manage Users"
3. Create a new user with password "test123"
4. Check database users table
```

### Expected Result:
✅ Password column should show: `$2y$10$...` (long string starting with $2y$)

❌ If you see "test123" in plain text:
- Login.php not uploaded correctly
- PHP version might be old (need 5.5+)

---

## Test 3: Password Hashing - Existing User ⏱️ 3 minutes

### Steps:
```
1. Check database: SELECT password FROM users WHERE username='admin'
2. Note if password is plain text or hashed
3. Login with admin credentials
4. Check database again
```

### Expected Result:

**BEFORE Login:**
- Password: `admin123` (plain text)

**AFTER Login:**
- Password: `$2y$10$abc123...` (hashed automatically)

✅ Password should auto-convert on first login!

---

## Test 4: Run Mass Password Hashing ⏱️ 5 minutes

### Steps:
```
1. Upload hash_passwords.php to server
2. Visit: https://shreejifamily.com/jewellery/Database/hash_passwords.php
3. Wait for completion
4. Check summary stats
5. DELETE hash_passwords.php from server
```

### Expected Result:
✅ You should see:
- "All passwords have been secured successfully!"
- Green checkmarks for each user
- Summary showing X hashed, 0 failed

✅ Final verification table should show all "✅ Hashed"

---

## Test 5: Login After Hashing ⏱️ 2 minutes

### Steps:
```
1. After running hash_passwords.php
2. Try logging in with ANY user
3. Use their ORIGINAL password (unchanged)
```

### Expected Result:
✅ Login should work perfectly with old passwords
✅ No need to change any passwords

---

## Quick Database Checks

### Check Dashboard Data:
```sql
-- Should return sales data
SELECT COUNT(*) FROM s_sales;
SELECT SUM(final_amount) FROM s_sales;

-- Should return products
SELECT COUNT(*) FROM s_products;

-- Should return customers
SELECT COUNT(*) FROM customers;
```

### Check Password Status:
```sql
-- See how many passwords are hashed
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN password LIKE '$2y$%' THEN 1 ELSE 0 END) as hashed,
    SUM(CASE WHEN password NOT LIKE '$2y$%' THEN 1 ELSE 0 END) as plain_text
FROM users;

-- Result should be: hashed = total, plain_text = 0
```

---

## Common Issues & Solutions

### ❌ Dashboard API Error
**Problem:** Console shows "404 Not Found"  
**Solution:** 
- Check `apiConfig.js` has correct URL
- Verify `dashboard_api.php` exists on server
- Test API directly: `https://shreejifamily.com/jewellery/Database/dashboard_api.php`

### ❌ Password Not Hashing
**Problem:** New users still have plain text passwords  
**Solution:**
- Check PHP version (need 5.5+)
- Verify Login.php uploaded correctly
- Check file permissions

### ❌ Login Fails After Hashing
**Problem:** Can't login with old password  
**Solution:**
- Run hash_passwords.php again
- Check if hashing completed successfully
- Verify passwords in database start with `$2y$`

### ❌ Dashboard Shows Zeros
**Problem:** All stats show 0  
**Solution:**
- Check if database has data
- Verify table names match API queries
- Check API response in browser network tab

---

## Success Criteria ✅

You can consider the update successful if:

1. ✅ Dashboard shows real numbers (not all zeros)
2. ✅ New user passwords are hashed in database
3. ✅ Login works with existing credentials
4. ✅ hash_passwords.php runs without errors
5. ✅ All passwords show as hashed after running script

---

## Performance Check

### Expected Load Times:
- Dashboard load: < 2 seconds
- Login: < 1 second
- Password hashing (per user): < 0.5 seconds

### API Response Time:
Test: `https://shreejifamily.com/jewellery/Database/dashboard_api.php`

Should return JSON in < 1 second with structure:
```json
{
  "totalSales": 155640.40,
  "totalProfit": 0.00,
  "todaySales": 2573.97,
  "todayProfit": 0.00,
  "totalProducts": 6,
  "totalCustomers": 8,
  "pendingOrders": 0,
  "totalStockWeight": 151.000,
  "stockValue": 12131.00,
  "categoryWise": [...]
}
```

---

**Testing completed? Move to production! 🚀**
