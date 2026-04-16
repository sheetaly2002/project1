-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 16, 2026 at 05:44 AM
-- Server version: 11.8.6-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u826331191_jewel_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `cash_book`
--

CREATE TABLE `cash_book` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `type` enum('IN','OUT') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `cash_book`
--

INSERT INTO `cash_book` (`id`, `date`, `category`, `description`, `type`, `amount`, `created_at`) VALUES
(2, '2026-01-04', 'Tea', 'oks', 'OUT', 100.00, '2026-01-04 11:33:36');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `subcategory_name` varchar(150) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `category_name`, `subcategory_name`, `created_at`) VALUES
(46, 'Gold', 'Bridal Necklace', '2026-01-28 15:39:21'),
(50, 'Silver', 'Rings', '2026-03-04 13:36:08'),
(51, 'Silver', 'Bangles', '2026-03-04 13:36:21'),
(52, 'Gold', 'Rings', '2026-03-04 13:36:30');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customer_id` int(11) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `id_proof_type` varchar(50) DEFAULT NULL,
  `id_proof_number` varchar(50) DEFAULT NULL,
  `id_proof_file` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_id`, `customer_name`, `mobile`, `address`, `dob`, `id_proof_type`, `id_proof_number`, `id_proof_file`, `created_at`) VALUES
(8, 'ok', '1234567890', '785', NULL, NULL, NULL, NULL, '2025-12-01 02:21:33'),
(9, 'okiofdjgiofji', '8964943476', '785', NULL, NULL, NULL, NULL, '2025-12-01 02:24:02'),
(10, 'ok', '8964943476', '785', NULL, NULL, NULL, NULL, '2025-12-04 03:08:59'),
(11, 'ok', '8964943476', '785', NULL, NULL, '56599vd4cs56v4', NULL, '2025-12-04 03:10:01'),
(12, 'name', 'wc89649437476', 'uujjain', '2025-04-04', 'aadhar', 'dtfdyftukf', '1764994145_Screenshot_12-6-2025_18106_.jpeg', '2025-12-06 04:09:05'),
(13, 'yash', '8964943478', 'ujjain', '2025-12-10', 'aadhar', 'dcdjibdchei888', '1765462324_download.pdf', '2025-12-11 14:12:04'),
(14, 'piyush sharma', '9009185553', 'Ujjain', '2002-02-12', 'Aadhar Card', 'dcdjibdchei888', '1767293751_WhatsApp Image 2025-12-30 at 23.44.03 (1).jpeg', '2026-01-01 18:55:51'),
(15, 'Nikita Joshi', '7894561236', 'Bhopal', '2026-01-29', 'Aadhar Card', '90000090', NULL, '2026-01-04 14:02:18');

-- --------------------------------------------------------

--
-- Table structure for table `main_categories`
--

CREATE TABLE `main_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `main_categories`
--

INSERT INTO `main_categories` (`id`, `name`) VALUES
(1, 'Gold'),
(2, 'Silver');

-- --------------------------------------------------------

--
-- Table structure for table `opening_stock`
--

CREATE TABLE `opening_stock` (
  `opening_stock_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `net_weight` decimal(10,3) NOT NULL,
  `quantity` int(11) NOT NULL,
  `rate_per_gram` decimal(10,2) NOT NULL,
  `making_charge` decimal(10,2) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `entry_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `opening_stock`
--

INSERT INTO `opening_stock` (`opening_stock_id`, `product_id`, `net_weight`, `quantity`, `rate_per_gram`, `making_charge`, `total_amount`, `entry_date`) VALUES
(35, 12, 119.999, 1, 10000.00, 700.00, 1200690.00, '2026-01-30 00:00:00'),
(36, 12, 1.000, 1, 100.00, 8.00, 108.00, '2026-02-18 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `sub_category_id` int(11) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `barcode_no` varchar(100) NOT NULL,
  `purity` varchar(20) DEFAULT NULL,
  `default_weight` decimal(10,3) DEFAULT 0.000,
  `default_quantity` int(11) DEFAULT 1,
  `hsn_code` varchar(50) DEFAULT NULL,
  `status` tinyint(4) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `sub_category_id`, `product_name`, `barcode_no`, `purity`, `default_weight`, `default_quantity`, `hsn_code`, `status`, `created_at`) VALUES
(12, 46, 'Bridal Necklaces', 'JW2026335849', '22K', 0.000, 1, '7113', 1, '2026-01-28 15:49:09'),
(13, 46, 'Okk', 'JW2026758434', '22', 0.000, 1, '7116', 1, '2026-01-28 15:58:12');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `purchase_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `bill_no` varchar(50) DEFAULT NULL,
  `purchase_date` date NOT NULL,
  `tax_type` varchar(20) DEFAULT NULL,
  `tax_percent` decimal(5,2) DEFAULT NULL,
  `tax_amount` decimal(10,2) DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `bill_copy` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`purchase_id`, `supplier_id`, `bill_no`, `purchase_date`, `tax_type`, `tax_percent`, `tax_amount`, `total_amount`, `bill_copy`, `created_at`) VALUES
(81, 6, '1', '2026-01-30', NULL, 3.00, 660.00, 22660.00, '', '2026-01-30 04:58:17');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_items`
--

CREATE TABLE `purchase_items` (
  `purchase_item_id` int(11) NOT NULL,
  `purchase_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `net_weight` decimal(10,3) NOT NULL,
  `quantity` int(11) NOT NULL,
  `rate_per_gram` decimal(10,2) NOT NULL,
  `making_charge` decimal(10,2) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `purchase_items`
--

INSERT INTO `purchase_items` (`purchase_item_id`, `purchase_id`, `product_id`, `net_weight`, `quantity`, `rate_per_gram`, `making_charge`, `total_amount`) VALUES
(95, 81, 13, 1.000, 20, 1000.00, 100.00, 22000.00);

-- --------------------------------------------------------

--
-- Table structure for table `repairing`
--

CREATE TABLE `repairing` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `problem_details` text DEFAULT NULL,
  `estimated_cost` decimal(10,2) DEFAULT 0.00,
  `advance_taken` decimal(10,2) DEFAULT 0.00,
  `receive_date` date NOT NULL,
  `delivery_date` date DEFAULT NULL,
  `status` enum('Pending','In Progress','Completed','Delivered','Cancelled') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `sale_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `bill_no` varchar(50) DEFAULT NULL,
  `sale_date` date DEFAULT NULL,
  `tax_type` varchar(20) DEFAULT NULL,
  `tax_percent` decimal(5,2) DEFAULT NULL,
  `tax_amount` decimal(10,2) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `sale_item_id` int(11) NOT NULL,
  `sale_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `stock_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `net_weight` decimal(10,2) DEFAULT NULL,
  `rate_per_gram` decimal(10,2) DEFAULT NULL,
  `making_charge_type` enum('percent','amount') DEFAULT 'amount',
  `making_charge` decimal(10,2) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock`
--

CREATE TABLE `stock` (
  `stock_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `batch_type` enum('opening','purchase','sales') NOT NULL,
  `source_id` int(11) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `hsn_code` varchar(20) DEFAULT NULL,
  `barcode_no` varchar(50) DEFAULT NULL,
  `batch_date` datetime NOT NULL,
  `purchase_rate` decimal(10,2) DEFAULT NULL,
  `purchase_making` decimal(10,2) DEFAULT NULL,
  `net_weight` decimal(10,3) NOT NULL,
  `sold_weight` double DEFAULT 0,
  `remaining_weight` decimal(10,3) NOT NULL,
  `quantity` int(11) NOT NULL,
  `sold_qty` int(11) DEFAULT 0,
  `remaining_qty` int(11) NOT NULL,
  `rate_per_gram` decimal(10,2) NOT NULL,
  `making_charge` decimal(10,2) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `stock`
--

INSERT INTO `stock` (`stock_id`, `product_id`, `batch_type`, `source_id`, `supplier_id`, `hsn_code`, `barcode_no`, `batch_date`, `purchase_rate`, `purchase_making`, `net_weight`, `sold_weight`, `remaining_weight`, `quantity`, `sold_qty`, `remaining_qty`, `rate_per_gram`, `making_charge`, `total_amount`, `updated_at`) VALUES
(53, 12, 'opening', 35, NULL, NULL, NULL, '2026-01-30 00:00:00', NULL, NULL, 119.999, 0, 119.999, 1, 0, 1, 10000.00, 700.00, 1200690.00, '2026-01-30 04:28:26'),
(58, 12, 'opening', 36, NULL, NULL, NULL, '2026-02-18 00:00:00', NULL, NULL, 1.000, 0, 1.000, 1, 0, 1, 100.00, 8.00, 108.00, '2026-02-18 02:21:20'),
(59, 13, 'purchase', 81, 6, NULL, NULL, '2026-01-30 00:00:00', 1000.00, 100.00, 1.000, 0, 1.000, 20, 0, 20, 1000.00, 100.00, 22000.00, '2026-02-18 02:31:42');

-- --------------------------------------------------------

--
-- Table structure for table `stock_backup`
--

CREATE TABLE `stock_backup` (
  `stock_id` int(11) NOT NULL DEFAULT 0,
  `product_id` int(11) NOT NULL,
  `batch_type` enum('opening','purchase') NOT NULL DEFAULT 'purchase',
  `batch_date` datetime NOT NULL DEFAULT current_timestamp(),
  `net_weight` decimal(10,3) NOT NULL DEFAULT 0.000,
  `remaining_weight` decimal(10,3) NOT NULL DEFAULT 0.000,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `remaining_qty` int(11) NOT NULL DEFAULT 0,
  `rate_per_gram` decimal(10,2) NOT NULL DEFAULT 0.00,
  `making_charge` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `stock_backup`
--

INSERT INTO `stock_backup` (`stock_id`, `product_id`, `batch_type`, `batch_date`, `net_weight`, `remaining_weight`, `quantity`, `remaining_qty`, `rate_per_gram`, `making_charge`, `total_amount`, `updated_at`) VALUES
(24, 3, 'opening', '2025-12-16 00:00:00', 5.000, 5.000, 2, 2, 100.00, 10.00, 510.00, '2025-12-16 10:12:56');

-- --------------------------------------------------------

--
-- Table structure for table `sub_categories`
--

CREATE TABLE `sub_categories` (
  `id` int(11) NOT NULL,
  `main_cat_id` int(11) NOT NULL,
  `sub_name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `sub_categories`
--

INSERT INTO `sub_categories` (`id`, `main_cat_id`, `sub_name`) VALUES
(1, 1, 'Bridal Necklace'),
(2, 1, 'Ring'),
(3, 1, 'Bangles'),
(4, 2, 'Payal'),
(5, 2, 'Silver Coins'),
(7, 1, 'payal '),
(8, 1, 'TOPS'),
(9, 1, 'EAR RINGS ');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `supplier_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `firm_name` varchar(150) DEFAULT NULL,
  `account_name` varchar(150) DEFAULT NULL,
  `account_no` varchar(50) DEFAULT NULL,
  `bank_name` varchar(150) DEFAULT NULL,
  `ifsc` varchar(50) DEFAULT NULL,
  `bank_address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`supplier_id`, `name`, `mobile`, `address`, `firm_name`, `account_name`, `account_no`, `bank_name`, `ifsc`, `bank_address`, `created_at`) VALUES
(1, 'Piyush', '8964943478,,90091567', 'Ujjain', 'Shrreji', 'Rakseh', '852963741258', 'SBI', 'TBH8502l78', 'Ujjain', '2025-11-20 03:07:24'),
(6, 'rakesh malhotra', '896494348', 'Ujjain', 'Shrreji', 'Rakseh', '852963741258', 'HDFC', 'TBH8502l78', 'Ujjain', '2026-01-01 06:18:05');

-- --------------------------------------------------------

--
-- Table structure for table `s_daily_rates`
--

CREATE TABLE `s_daily_rates` (
  `id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `purity` varchar(20) DEFAULT NULL,
  `today_rate` decimal(15,2) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `s_metal_inventory`
--

CREATE TABLE `s_metal_inventory` (
  `id` int(11) NOT NULL,
  `purchase_bill_id` int(11) DEFAULT NULL,
  `metal_type` enum('Gold','Silver','Platinum') DEFAULT NULL,
  `purity` varchar(10) DEFAULT NULL,
  `weight` decimal(15,3) DEFAULT NULL,
  `transaction_type` enum('In','Out') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `s_products`
--

CREATE TABLE `s_products` (
  `id` int(11) NOT NULL,
  `product_code` varchar(50) DEFAULT NULL,
  `sub_cat_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `hsn_code` varchar(50) DEFAULT '7113',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `s_products`
--

INSERT INTO `s_products` (`id`, `product_code`, `sub_cat_id`, `product_name`, `hsn_code`, `created_at`) VALUES
(1, 'PRD-001', 3, 'HANDMADE BANGKES', '7114', '2026-03-04 14:23:38'),
(2, 'PRD-002', 4, 'paysls round', '7113', '2026-03-05 05:30:12'),
(3, 'PRD-003', 7, 'payal plain', '7113', '2026-03-13 14:18:18'),
(4, 'PRD-004', 7, 'fancy payal', '7113', '2026-03-13 14:19:31'),
(5, 'PRD-005', 8, 'PLAN TOPS', '7113', '2026-03-14 11:44:18'),
(6, 'PRD-006', 9, 'JHUMKI ', '7113', '2026-03-17 14:48:32');

-- --------------------------------------------------------

--
-- Table structure for table `s_purchase_bills`
--

CREATE TABLE `s_purchase_bills` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `bill_no` varchar(100) DEFAULT NULL,
  `bill_date` date DEFAULT NULL,
  `purchase_type` enum('Ready-made','Raw-Material','Mixed') DEFAULT 'Ready-made',
  `total_making_amount` decimal(15,2) DEFAULT 0.00,
  `other_charges` decimal(15,2) DEFAULT 0.00,
  `total_net_weight` decimal(15,3) DEFAULT 0.000,
  `total_quantity` int(11) DEFAULT 1,
  `making_charge_type` enum('Fixed','Percent') DEFAULT 'Fixed',
  `making_charge_value` decimal(15,2) DEFAULT 0.00,
  `tax_type` enum('GST','IGST','VAT','NONE') DEFAULT NULL,
  `tax_percent` decimal(5,2) DEFAULT NULL,
  `tax_amount` decimal(15,2) DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT NULL,
  `paid_amount` decimal(15,2) DEFAULT 0.00,
  `due_amount` decimal(15,2) DEFAULT 0.00,
  `payment_status` enum('Paid','Partial','Unpaid') DEFAULT 'Unpaid',
  `note` text DEFAULT NULL,
  `bill_copy` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `s_purchase_bills`
--

INSERT INTO `s_purchase_bills` (`id`, `supplier_id`, `bill_no`, `bill_date`, `purchase_type`, `total_making_amount`, `other_charges`, `total_net_weight`, `total_quantity`, `making_charge_type`, `making_charge_value`, `tax_type`, `tax_percent`, `tax_amount`, `total_amount`, `paid_amount`, `due_amount`, `payment_status`, `note`, `bill_copy`, `created_at`) VALUES
(1, 1, '1', '2026-03-05', 'Ready-made', 30000.00, 10.00, 100.000, 10, 'Percent', 4.00, 'GST', 3.00, 23400.30, 803410.30, 100000.00, 703410.30, 'Partial', 'ok', 'uploads/bills/BILL_1772692057_3847.png', '2026-03-05 06:27:37'),
(2, 2, '1', '2026-03-14', 'Ready-made', 0.00, 0.00, 0.000, 1, 'Fixed', 0.00, NULL, NULL, NULL, 4635003.09, 0.00, 0.00, 'Unpaid', NULL, 'uploads/bills/BILL_1773489161_5502.pdf', '2026-03-14 11:52:41');

-- --------------------------------------------------------

--
-- Table structure for table `s_sales`
--

CREATE TABLE `s_sales` (
  `id` int(11) NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `total_weight` decimal(15,3) DEFAULT 0.000,
  `sub_total` decimal(15,2) NOT NULL,
  `tax_amount` decimal(15,2) DEFAULT 0.00,
  `discount` decimal(15,2) DEFAULT 0.00,
  `final_amount` decimal(15,2) NOT NULL,
  `total_profit` decimal(15,2) DEFAULT 0.00,
  `payment_mode` varchar(50) DEFAULT 'Cash',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `s_sales`
--

INSERT INTO `s_sales` (`id`, `invoice_no`, `customer_id`, `total_weight`, `sub_total`, `tax_amount`, `discount`, `final_amount`, `total_profit`, `payment_mode`, `created_at`) VALUES
(57, 'INV-1775375436', 15, 9.980, 151107.18, 4533.22, 0.00, 155640.40, 0.00, 'Cash', '2026-04-05 07:50:36'),
(58, 'INV-1776318140', 14, 10.000, 2499.00, 74.97, 0.00, 2573.97, 0.00, 'Cash', '2026-04-16 05:42:20');

-- --------------------------------------------------------

--
-- Table structure for table `s_sales_items`
--

CREATE TABLE `s_sales_items` (
  `id` int(11) NOT NULL,
  `sale_id` int(11) NOT NULL,
  `stock_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `sale_rate` decimal(15,2) NOT NULL,
  `making_type` enum('Fixed','Per_Gram','Percentage') NOT NULL,
  `making_value` decimal(15,2) NOT NULL,
  `making_total` decimal(15,2) NOT NULL,
  `item_total` decimal(15,2) NOT NULL,
  `purchase_cost` decimal(15,2) NOT NULL,
  `item_profit` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `s_sales_items`
--

INSERT INTO `s_sales_items` (`id`, `sale_id`, `stock_id`, `quantity`, `sale_rate`, `making_type`, `making_value`, `making_total`, `item_total`, `purchase_cost`, `item_profit`) VALUES
(57, 57, 25, 1, 14700.00, '', 3.00, 4401.18, 151107.18, 164310.72, -13203.54),
(58, 58, 24, 1, 100.00, 'Fixed', 1499.00, 1499.00, 2499.00, 1100.00, 1399.00);

-- --------------------------------------------------------

--
-- Table structure for table `s_stock`
--

CREATE TABLE `s_stock` (
  `id` int(11) NOT NULL,
  `purchase_bill_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `stock_type` enum('PURCHASE','OPENING') DEFAULT NULL,
  `barcode` varchar(50) NOT NULL,
  `net_weight` decimal(15,3) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `rate` decimal(15,2) DEFAULT NULL,
  `making` decimal(15,2) DEFAULT NULL,
  `total_cost` decimal(15,2) DEFAULT NULL,
  `purity` varchar(20) DEFAULT NULL,
  `status` enum('AVAILABLE','SOLD') DEFAULT 'AVAILABLE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `making_type` enum('fixed','per_gram','percent') DEFAULT 'per_gram',
  `making_value` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `s_stock`
--

INSERT INTO `s_stock` (`id`, `purchase_bill_id`, `product_id`, `stock_type`, `barcode`, `net_weight`, `quantity`, `rate`, `making`, `total_cost`, `purity`, `status`, `created_at`, `making_type`, `making_value`) VALUES
(21, NULL, 2, 'OPENING', 'SJ-0001', 20.000, 1, 100.00, 100.00, 1100.00, '22K', 'AVAILABLE', '2026-03-05 05:57:24', 'per_gram', 10.00),
(22, 1, 2, 'PURCHASE', 'SJ-0002', 120.000, 1, 100.00, 0.00, 12000.00, '22K', 'AVAILABLE', '2026-03-05 07:10:48', 'fixed', 0.00),
(24, NULL, 1, NULL, 'SJ-0023', 10.000, 1, 100.00, NULL, 1100.00, NULL, 'SOLD', '2026-03-13 04:27:04', 'per_gram', 10.00),
(25, NULL, 6, NULL, 'SJ-0025', 9.980, 1, 14700.00, NULL, 164310.72, NULL, 'SOLD', '2026-03-17 14:53:15', 'percent', 12.00);

-- --------------------------------------------------------

--
-- Table structure for table `s_suppliers`
--

CREATE TABLE `s_suppliers` (
  `id` int(11) NOT NULL,
  `firm_name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `gst_no` varchar(20) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `account_no` varchar(50) DEFAULT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `s_suppliers`
--

INSERT INTO `s_suppliers` (`id`, `firm_name`, `contact_person`, `phone`, `gst_no`, `bank_name`, `account_no`, `ifsc_code`, `address`, `created_at`) VALUES
(1, 'sHREEJI', 'sHEETAL', '8964943476', '', 'icicI', '8596741236', '859LL', '', '2026-03-04 14:44:25'),
(2, 'DN JEWELLERS', 'DIXIT', '9090789898', '', 'ICICI', '290290290909', 'SHGKKK', '', '2026-03-14 11:49:50');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `role` enum('admin','staff') DEFAULT 'staff',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `role`, `created_at`) VALUES
(1, 'admin', 'admin123', 'Owner Name', 'admin', '2026-01-04 12:25:17'),
(2, '1234', '1234', 'Sheetal Yadav', 'admin', '2026-01-04 12:33:31'),
(3, 'Ok', 'Ok', 'Ok', 'admin', '2026-03-14 09:54:28'),
(4, 'Yashshreeji', '123', 'Yash', 'admin', '2026-03-25 13:56:53');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cash_book`
--
ALTER TABLE `cash_book`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`);

--
-- Indexes for table `main_categories`
--
ALTER TABLE `main_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `opening_stock`
--
ALTER TABLE `opening_stock`
  ADD PRIMARY KEY (`opening_stock_id`),
  ADD KEY `fk_opening_product` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD UNIQUE KEY `barcode_no` (`barcode_no`),
  ADD KEY `category_id` (`sub_category_id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`purchase_id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD PRIMARY KEY (`purchase_item_id`),
  ADD KEY `purchase_id` (`purchase_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `repairing`
--
ALTER TABLE `repairing`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_repairing_customer` (`customer_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`sale_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`sale_item_id`),
  ADD KEY `sale_id` (`sale_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `stock_id` (`stock_id`);

--
-- Indexes for table `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`stock_id`),
  ADD UNIQUE KEY `barcode_no` (`barcode_no`),
  ADD KEY `idx_fifo` (`product_id`,`stock_id`),
  ADD KEY `idx_source` (`batch_type`,`source_id`);

--
-- Indexes for table `sub_categories`
--
ALTER TABLE `sub_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `main_cat_id` (`main_cat_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`supplier_id`);

--
-- Indexes for table `s_daily_rates`
--
ALTER TABLE `s_daily_rates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `s_metal_inventory`
--
ALTER TABLE `s_metal_inventory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_bill_id` (`purchase_bill_id`);

--
-- Indexes for table `s_products`
--
ALTER TABLE `s_products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_code` (`product_code`);

--
-- Indexes for table `s_purchase_bills`
--
ALTER TABLE `s_purchase_bills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `s_sales`
--
ALTER TABLE `s_sales`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `s_sales_items`
--
ALTER TABLE `s_sales_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `s_stock`
--
ALTER TABLE `s_stock`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `barcode` (`barcode`),
  ADD KEY `purchase_bill_id` (`purchase_bill_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `s_suppliers`
--
ALTER TABLE `s_suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cash_book`
--
ALTER TABLE `cash_book`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `main_categories`
--
ALTER TABLE `main_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `opening_stock`
--
ALTER TABLE `opening_stock`
  MODIFY `opening_stock_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `purchase_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `purchase_items`
--
ALTER TABLE `purchase_items`
  MODIFY `purchase_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT for table `repairing`
--
ALTER TABLE `repairing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `sale_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `sale_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `stock`
--
ALTER TABLE `stock`
  MODIFY `stock_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `sub_categories`
--
ALTER TABLE `sub_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `supplier_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `s_daily_rates`
--
ALTER TABLE `s_daily_rates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `s_metal_inventory`
--
ALTER TABLE `s_metal_inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `s_products`
--
ALTER TABLE `s_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `s_purchase_bills`
--
ALTER TABLE `s_purchase_bills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `s_sales`
--
ALTER TABLE `s_sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `s_sales_items`
--
ALTER TABLE `s_sales_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `s_stock`
--
ALTER TABLE `s_stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `s_suppliers`
--
ALTER TABLE `s_suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `opening_stock`
--
ALTER TABLE `opening_stock`
  ADD CONSTRAINT `fk_opening_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`sub_category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`) ON DELETE CASCADE;

--
-- Constraints for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD CONSTRAINT `purchase_items_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`purchase_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `repairing`
--
ALTER TABLE `repairing`
  ADD CONSTRAINT `fk_repairing_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`);

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `sale_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`sale_id`),
  ADD CONSTRAINT `sale_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `sale_items_ibfk_3` FOREIGN KEY (`stock_id`) REFERENCES `stock` (`stock_id`);

--
-- Constraints for table `stock`
--
ALTER TABLE `stock`
  ADD CONSTRAINT `fk_stock_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON UPDATE CASCADE;

--
-- Constraints for table `sub_categories`
--
ALTER TABLE `sub_categories`
  ADD CONSTRAINT `sub_categories_ibfk_1` FOREIGN KEY (`main_cat_id`) REFERENCES `main_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `s_daily_rates`
--
ALTER TABLE `s_daily_rates`
  ADD CONSTRAINT `s_daily_rates_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `main_categories` (`id`);

--
-- Constraints for table `s_metal_inventory`
--
ALTER TABLE `s_metal_inventory`
  ADD CONSTRAINT `s_metal_inventory_ibfk_1` FOREIGN KEY (`purchase_bill_id`) REFERENCES `s_purchase_bills` (`id`);

--
-- Constraints for table `s_purchase_bills`
--
ALTER TABLE `s_purchase_bills`
  ADD CONSTRAINT `s_purchase_bills_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `s_suppliers` (`id`);

--
-- Constraints for table `s_stock`
--
ALTER TABLE `s_stock`
  ADD CONSTRAINT `s_stock_ibfk_1` FOREIGN KEY (`purchase_bill_id`) REFERENCES `s_purchase_bills` (`id`),
  ADD CONSTRAINT `s_stock_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `s_products` (`id`);

-- ============================================
-- PASSWORD SECURITY UPGRADE SCRIPT
-- Run hash_passwords.php to secure all passwords
-- ============================================

-- Check current password status
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN password LIKE '$2y$%' THEN 1 ELSE 0 END) as hashed,
    SUM(CASE WHEN password NOT LIKE '$2y$%' THEN 1 ELSE 0 END) as plain_text
FROM users;

-- List all users (for verification)
SELECT id, username, full_name, role, created_at FROM users;

-- IMPORTANT: After running hash_passwords.php, verify with:
-- SELECT id, username, password, full_name, role FROM users;
-- All passwords should start with "$2y$"

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
