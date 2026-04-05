import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sipsync_pos'
});

console.log('Connected to MySQL. Adding bulk data...');

// ===== 1. USERS (5) =====
const users = [
  ['user-1', 'Mehul Koshti', 'mehul@sipsync.com', 'admin123', 'admin'],
  ['user-2', 'Krish Patel', 'krish@sipsync.com', 'staff123', 'staff'],
  ['user-3', 'Jalp Patel', 'jalp@sipsync.com', 'staff123', 'staff'],
  ['user-4', 'Ravi Sharma', 'ravi@sipsync.com', 'staff123', 'staff'],
  ['user-5', 'Priya Singh', 'priya@sipsync.com', 'staff123', 'staff'],
];
for (const u of users) {
  await connection.execute(
    'INSERT IGNORE INTO User (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', u
  );
}
console.log('Added 5 users');

// ===== 2. MORE CUSTOMERS (10 more) =====
const customers = [
  ['cust-3', 'Rahul Verma', 'rahul@gmail.com', '+91 9876543210', 3500],
  ['cust-4', 'Anita Desai', 'anita@gmail.com', '+91 8765432109', 2800],
  ['cust-5', 'Vikram Joshi', 'vikram@yahoo.com', '+91 7654321098', 4200],
  ['cust-6', 'Sneha Patel', 'sneha@gmail.com', '+91 6543210987', 1800],
  ['cust-7', 'Arjun Mehta', 'arjun@outlook.com', '+91 9988776655', 5100],
  ['cust-8', 'Kavita Sharma', 'kavita@gmail.com', '+91 8877665544', 950],
  ['cust-9', 'Deepak Kumar', 'deepak@gmail.com', '+91 7766554433', 3200],
  ['cust-10', 'Meera Nair', 'meera@gmail.com', '+91 6655443322', 2100],
  ['cust-11', 'Sanjay Gupta', 'sanjay@gmail.com', '+91 9911223344', 4700],
  ['cust-12', 'Pooja Reddy', 'pooja@gmail.com', '+91 8822334455', 1600],
];
for (const c of customers) {
  await connection.execute(
    'INSERT IGNORE INTO Customer (id, name, email, phone, street1, street2, city, state, country, totalSales) VALUES (?, ?, ?, ?, "", "", "", "", "", ?)', c
  );
}
console.log('Added 10 more customers');

// ===== 3. MORE PRODUCTS (7 more) =====
const products = [
  ['p14', 'Mocha', 'cat-2', 90, 'Unit', 5, 'Rich chocolate mocha'],
  ['p15', 'Paneer Tikka', 'cat-4', 180, 'Unit', 5, 'Grilled cottage cheese'],
  ['p16', 'Cold Coffee', 'cat-2', 80, 'Unit', 5, 'Chilled coffee with ice cream'],
  ['p17', 'Garlic Bread', 'cat-1', 95, 'Unit', 5, 'Toasted with garlic butter'],
  ['p18', 'Brownie', 'cat-3', 110, 'Unit', 5, 'Chocolate fudge brownie'],
  ['p19', 'Nachos', 'cat-1', 130, 'Unit', 5, 'Loaded nachos with salsa'],
  ['p20', 'Lemonade', 'cat-2', 45, 'Unit', 5, 'Fresh squeezed lemonade'],
];
for (const p of products) {
  await connection.execute(
    'INSERT IGNORE INTO Product (id, name, categoryId, price, unit, tax, description) VALUES (?, ?, ?, ?, ?, ?, ?)', p
  );
}
console.log('Added 7 more products');

// ===== 4. MORE FLOORS & TABLES =====
await connection.execute("INSERT IGNORE INTO Floor (id, name, posTerminal) VALUES ('floor-2', 'First Floor', 'SipSync')");
await connection.execute("INSERT IGNORE INTO Floor (id, name, posTerminal) VALUES ('floor-3', 'Rooftop', 'SipSync')");

const tables2 = [
  ['t6', 6, 4, true, 'floor-2'],
  ['t7', 7, 6, true, 'floor-2'],
  ['t8', 8, 2, true, 'floor-2'],
  ['t9', 9, 8, true, 'floor-2'],
];
const tables3 = [
  ['t10', 10, 4, true, 'floor-3'],
  ['t11', 11, 6, true, 'floor-3'],
  ['t12', 12, 2, true, 'floor-3'],
];
for (const t of [...tables2, ...tables3]) {
  await connection.execute(
    'INSERT IGNORE INTO floor_table (id, number, seats, active, floorId) VALUES (?, ?, ?, ?, ?)', t
  );
}
console.log('Added 2 floors + 7 tables');

// ===== 5. POS SESSIONS (4) =====
const sessions = [
  ['ses-1', 'Session 1', '2026-04-01 09:00:00', '2026-04-01 18:00:00', 0, 12500, 'user-1', false],
  ['ses-2', 'Session 2', '2026-04-02 09:00:00', '2026-04-02 17:30:00', 0, 18200, 'user-2', false],
  ['ses-3', 'Session 3', '2026-04-03 10:00:00', '2026-04-03 19:00:00', 0, 9800, 'user-3', false],
  ['ses-4', 'Session 4', '2026-04-04 09:00:00', null, 0, 0, 'user-1', true],
];
for (const s of sessions) {
  await connection.execute(
    'INSERT IGNORE INTO POSSession (id, name, openedAt, closedAt, openingAmount, closingAmount, responsibleId, isOpen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', s
  );
}
console.log('Added 4 sessions');

// ===== 6. ORDERS (20) =====
const orderData = [
  { id: 'ord-1', no: '1001', ses: 'ses-1', date: '2026-04-01 09:30:00', table: 1, total: 315, tax: 15.75, final: 330.75, status: 'paid', cust: 'cust-1', custName: 'Eric', kitchen: 'completed' },
  { id: 'ord-2', no: '1002', ses: 'ses-1', date: '2026-04-01 10:15:00', table: 2, total: 520, tax: 26, final: 546, status: 'paid', cust: 'cust-3', custName: 'Rahul Verma', kitchen: 'completed' },
  { id: 'ord-3', no: '1003', ses: 'ses-1', date: '2026-04-01 11:00:00', table: 3, total: 185, tax: 9.25, final: 194.25, status: 'paid', cust: 'cust-4', custName: 'Anita Desai', kitchen: 'completed' },
  { id: 'ord-4', no: '1004', ses: 'ses-1', date: '2026-04-01 12:30:00', table: 4, total: 750, tax: 37.5, final: 787.5, status: 'paid', cust: 'cust-5', custName: 'Vikram Joshi', kitchen: 'completed' },
  { id: 'ord-5', no: '1005', ses: 'ses-1', date: '2026-04-01 14:00:00', table: 1, total: 420, tax: 21, final: 441, status: 'paid', cust: 'cust-6', custName: 'Sneha Patel', kitchen: 'completed' },
  { id: 'ord-6', no: '1006', ses: 'ses-2', date: '2026-04-02 09:45:00', table: 5, total: 280, tax: 14, final: 294, status: 'paid', cust: 'cust-7', custName: 'Arjun Mehta', kitchen: 'completed' },
  { id: 'ord-7', no: '1007', ses: 'ses-2', date: '2026-04-02 10:30:00', table: 2, total: 650, tax: 32.5, final: 682.5, status: 'paid', cust: 'cust-8', custName: 'Kavita Sharma', kitchen: 'completed' },
  { id: 'ord-8', no: '1008', ses: 'ses-2', date: '2026-04-02 11:45:00', table: 3, total: 390, tax: 19.5, final: 409.5, status: 'paid', cust: 'cust-9', custName: 'Deepak Kumar', kitchen: 'completed' },
  { id: 'ord-9', no: '1009', ses: 'ses-2', date: '2026-04-02 13:00:00', table: 1, total: 880, tax: 44, final: 924, status: 'paid', cust: 'cust-10', custName: 'Meera Nair', kitchen: 'completed' },
  { id: 'ord-10', no: '1010', ses: 'ses-2', date: '2026-04-02 15:00:00', table: 4, total: 155, tax: 7.75, final: 162.75, status: 'paid', cust: 'cust-2', custName: 'Smith', kitchen: 'completed' },
  { id: 'ord-11', no: '1011', ses: 'ses-3', date: '2026-04-03 10:30:00', table: 6, total: 470, tax: 23.5, final: 493.5, status: 'paid', cust: 'cust-11', custName: 'Sanjay Gupta', kitchen: 'completed' },
  { id: 'ord-12', no: '1012', ses: 'ses-3', date: '2026-04-03 11:15:00', table: 7, total: 340, tax: 17, final: 357, status: 'paid', cust: 'cust-12', custName: 'Pooja Reddy', kitchen: 'completed' },
  { id: 'ord-13', no: '1013', ses: 'ses-3', date: '2026-04-03 12:45:00', table: 8, total: 560, tax: 28, final: 588, status: 'paid', cust: 'cust-1', custName: 'Eric', kitchen: 'completed' },
  { id: 'ord-14', no: '1014', ses: 'ses-3', date: '2026-04-03 14:30:00', table: 9, total: 215, tax: 10.75, final: 225.75, status: 'paid', cust: 'cust-3', custName: 'Rahul Verma', kitchen: 'completed' },
  { id: 'ord-15', no: '1015', ses: 'ses-3', date: '2026-04-03 16:00:00', table: 10, total: 690, tax: 34.5, final: 724.5, status: 'paid', cust: 'cust-5', custName: 'Vikram Joshi', kitchen: 'completed' },
  { id: 'ord-16', no: '1016', ses: 'ses-4', date: '2026-04-04 09:30:00', table: 1, total: 350, tax: 17.5, final: 367.5, status: 'paid', cust: 'cust-7', custName: 'Arjun Mehta', kitchen: 'completed' },
  { id: 'ord-17', no: '1017', ses: 'ses-4', date: '2026-04-04 10:45:00', table: 3, total: 480, tax: 24, final: 504, status: 'paid', cust: 'cust-9', custName: 'Deepak Kumar', kitchen: 'completed' },
  { id: 'ord-18', no: '1018', ses: 'ses-4', date: '2026-04-04 12:00:00', table: 5, total: 270, tax: 13.5, final: 283.5, status: 'draft', cust: 'cust-4', custName: 'Anita Desai', kitchen: 'preparing' },
  { id: 'ord-19', no: '1019', ses: 'ses-4', date: '2026-04-04 12:30:00', table: 7, total: 610, tax: 30.5, final: 640.5, status: 'draft', cust: 'cust-6', custName: 'Sneha Patel', kitchen: 'to_cook' },
  { id: 'ord-20', no: '1020', ses: 'ses-4', date: '2026-04-04 13:00:00', table: 10, total: 195, tax: 9.75, final: 204.75, status: 'draft', cust: 'cust-8', custName: 'Kavita Sharma', kitchen: 'to_cook' },
];

for (const o of orderData) {
  await connection.execute(
    'INSERT IGNORE INTO `Order` (id, orderNo, sessionId, date, tableId, tableNumber, total, tax, finalTotal, status, customerId, customerName, kitchenStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [o.id, o.no, o.ses, o.date, `t${o.table}`, o.table, o.total, o.tax, o.final, o.status, o.cust, o.custName, o.kitchen]
  );
}
console.log('Added 20 orders');

// ===== 7. ORDER LINES (60+) =====
const allLines = [
  // Order 1
  ['ol-1', 'ord-1', 'p2', 'Pizza', 1, 250, 5, 'Unit', 250],
  ['ol-2', 'ord-1', 'p7', 'Tea', 2, 35, 5, 'Unit', 65],
  // Order 2
  ['ol-3', 'ord-2', 'p1', 'Burger', 3, 15, 5, 'Unit', 45],
  ['ol-4', 'ord-2', 'p11', 'Pasta', 2, 200, 5, 'Unit', 400],
  ['ol-5', 'ord-2', 'p6', 'Coffee', 1, 50, 5, 'Unit', 50],
  ['ol-6', 'ord-2', 'p13', 'Water', 1, 30, 5, 'Unit', 25],
  // Order 3
  ['ol-7', 'ord-3', 'p3', 'Maggie', 2, 70, 5, 'Unit', 140],
  ['ol-8', 'ord-3', 'p20', 'Lemonade', 1, 45, 5, 'Unit', 45],
  // Order 4
  ['ol-9', 'ord-4', 'p2', 'Pizza', 2, 250, 5, 'Unit', 500],
  ['ol-10', 'ord-4', 'p5', 'Sandwich', 1, 150, 5, 'Unit', 150],
  ['ol-11', 'ord-4', 'p10', 'Milkshake', 1, 140, 5, 'Unit', 100],
  // Order 5
  ['ol-12', 'ord-5', 'p15', 'Paneer Tikka', 2, 180, 5, 'Unit', 360],
  ['ol-13', 'ord-5', 'p9', 'Fanta', 1, 60, 5, 'Unit', 60],
  // Order 6
  ['ol-14', 'ord-6', 'p4', 'Fries', 2, 120, 5, 'Unit', 240],
  ['ol-15', 'ord-6', 'p8', 'Diet Coke', 1, 70, 5, 'Unit', 40],
  // Order 7
  ['ol-16', 'ord-7', 'p11', 'Pasta', 2, 200, 5, 'Unit', 400],
  ['ol-17', 'ord-7', 'p14', 'Mocha', 2, 90, 5, 'Unit', 180],
  ['ol-18', 'ord-7', 'p18', 'Brownie', 1, 110, 5, 'Unit', 70],
  // Order 8
  ['ol-19', 'ord-8', 'p1', 'Burger', 2, 15, 5, 'Unit', 30],
  ['ol-20', 'ord-8', 'p19', 'Nachos', 2, 130, 5, 'Unit', 260],
  ['ol-21', 'ord-8', 'p6', 'Coffee', 2, 50, 5, 'Unit', 100],
  // Order 9
  ['ol-22', 'ord-9', 'p2', 'Pizza', 3, 250, 5, 'Unit', 750],
  ['ol-23', 'ord-9', 'p19', 'Nachos', 1, 130, 5, 'Unit', 130],
  // Order 10
  ['ol-24', 'ord-10', 'p6', 'Coffee', 2, 50, 5, 'Unit', 100],
  ['ol-25', 'ord-10', 'p17', 'Garlic Bread', 1, 95, 5, 'Unit', 55],
  // Order 11
  ['ol-26', 'ord-11', 'p15', 'Paneer Tikka', 2, 180, 5, 'Unit', 360],
  ['ol-27', 'ord-11', 'p16', 'Cold Coffee', 1, 80, 5, 'Unit', 80],
  ['ol-28', 'ord-11', 'p13', 'Water', 1, 30, 5, 'Unit', 30],
  // Order 12
  ['ol-29', 'ord-12', 'p5', 'Sandwich', 2, 150, 5, 'Unit', 300],
  ['ol-30', 'ord-12', 'p7', 'Tea', 1, 35, 5, 'Unit', 40],
  // Order 13
  ['ol-31', 'ord-13', 'p2', 'Pizza', 1, 250, 5, 'Unit', 250],
  ['ol-32', 'ord-13', 'p11', 'Pasta', 1, 200, 5, 'Unit', 200],
  ['ol-33', 'ord-13', 'p18', 'Brownie', 1, 110, 5, 'Unit', 110],
  // Order 14
  ['ol-34', 'ord-14', 'p3', 'Maggie', 1, 70, 5, 'Unit', 70],
  ['ol-35', 'ord-14', 'p12', 'Green Tea', 2, 65, 5, 'Unit', 130],
  ['ol-36', 'ord-14', 'p1', 'Burger', 1, 15, 5, 'Unit', 15],
  // Order 15
  ['ol-37', 'ord-15', 'p2', 'Pizza', 2, 250, 5, 'Unit', 500],
  ['ol-38', 'ord-15', 'p14', 'Mocha', 1, 90, 5, 'Unit', 90],
  ['ol-39', 'ord-15', 'p4', 'Fries', 1, 120, 5, 'Unit', 100],
  // Order 16
  ['ol-40', 'ord-16', 'p11', 'Pasta', 1, 200, 5, 'Unit', 200],
  ['ol-41', 'ord-16', 'p5', 'Sandwich', 1, 150, 5, 'Unit', 150],
  // Order 17
  ['ol-42', 'ord-17', 'p15', 'Paneer Tikka', 2, 180, 5, 'Unit', 360],
  ['ol-43', 'ord-17', 'p16', 'Cold Coffee', 2, 80, 5, 'Unit', 120],
  // Order 18 (draft - preparing)
  ['ol-44', 'ord-18', 'p1', 'Burger', 3, 15, 5, 'Unit', 45],
  ['ol-45', 'ord-18', 'p6', 'Coffee', 3, 50, 5, 'Unit', 150],
  ['ol-46', 'ord-18', 'p17', 'Garlic Bread', 1, 95, 5, 'Unit', 75],
  // Order 19 (draft - to_cook)
  ['ol-47', 'ord-19', 'p2', 'Pizza', 2, 250, 5, 'Unit', 500],
  ['ol-48', 'ord-19', 'p18', 'Brownie', 1, 110, 5, 'Unit', 110],
  // Order 20 (draft - to_cook)
  ['ol-49', 'ord-20', 'p3', 'Maggie', 2, 70, 5, 'Unit', 140],
  ['ol-50', 'ord-20', 'p20', 'Lemonade', 1, 45, 5, 'Unit', 55],
];

for (const l of allLines) {
  await connection.execute(
    'INSERT IGNORE INTO OrderLine (id, orderId, productId, productName, quantity, price, tax, unit, subtotal, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "")', l
  );
}
console.log('Added 50 order lines');

// ===== 8. ORDER PAYMENTS (17 - for paid orders) =====
const payments = [
  ['pay-1', 'ord-1', 'cash', 330.75, '2026-04-01 09:35:00'],
  ['pay-2', 'ord-2', 'digital', 546, '2026-04-01 10:30:00'],
  ['pay-3', 'ord-3', 'cash', 194.25, '2026-04-01 11:10:00'],
  ['pay-4', 'ord-4', 'upi', 787.5, '2026-04-01 12:50:00'],
  ['pay-5', 'ord-5', 'digital', 441, '2026-04-01 14:20:00'],
  ['pay-6', 'ord-6', 'cash', 294, '2026-04-02 10:00:00'],
  ['pay-7', 'ord-7', 'upi', 682.5, '2026-04-02 10:50:00'],
  ['pay-8', 'ord-8', 'cash', 409.5, '2026-04-02 12:00:00'],
  ['pay-9', 'ord-9', 'digital', 924, '2026-04-02 13:20:00'],
  ['pay-10', 'ord-10', 'cash', 162.75, '2026-04-02 15:15:00'],
  ['pay-11', 'ord-11', 'upi', 493.5, '2026-04-03 10:50:00'],
  ['pay-12', 'ord-12', 'cash', 357, '2026-04-03 11:30:00'],
  ['pay-13', 'ord-13', 'digital', 588, '2026-04-03 13:00:00'],
  ['pay-14', 'ord-14', 'cash', 225.75, '2026-04-03 14:45:00'],
  ['pay-15', 'ord-15', 'upi', 724.5, '2026-04-03 16:20:00'],
  ['pay-16', 'ord-16', 'cash', 367.5, '2026-04-04 09:45:00'],
  ['pay-17', 'ord-17', 'digital', 504, '2026-04-04 11:00:00'],
];

for (const p of payments) {
  await connection.execute(
    'INSERT IGNORE INTO OrderPayment (id, orderId, method, amount, date) VALUES (?, ?, ?, ?, ?)', p
  );
}
console.log('Added 17 payments');

// ===== 9. PRODUCT VARIANTS (6) =====
const variants = [
  ['var-1', 'p2', 'Size', 'Regular', 'Unit', 0],
  ['var-2', 'p2', 'Size', 'Large', 'Unit', 50],
  ['var-3', 'p6', 'Type', 'Hot', 'Unit', 0],
  ['var-4', 'p6', 'Type', 'Cold', 'Unit', 10],
  ['var-5', 'p1', 'Pack', '1 Piece', 'Unit', 0],
  ['var-6', 'p1', 'Pack', '2 Pieces', 'Unit', 10],
];

for (const v of variants) {
  await connection.execute(
    'INSERT IGNORE INTO ProductVariant (id, productId, attribute, value, unit, extraPrice) VALUES (?, ?, ?, ?, ?, ?)', v
  );
}
console.log('Added 6 product variants');

// ===== SUMMARY =====
const counts = await Promise.all([
  connection.execute('SELECT COUNT(*) as c FROM User'),
  connection.execute('SELECT COUNT(*) as c FROM Customer'),
  connection.execute('SELECT COUNT(*) as c FROM Product'),
  connection.execute('SELECT COUNT(*) as c FROM ProductCategory'),
  connection.execute('SELECT COUNT(*) as c FROM ProductVariant'),
  connection.execute('SELECT COUNT(*) as c FROM Floor'),
  connection.execute('SELECT COUNT(*) as c FROM floor_table'),
  connection.execute('SELECT COUNT(*) as c FROM POSSession'),
  connection.execute('SELECT COUNT(*) as c FROM `Order`'),
  connection.execute('SELECT COUNT(*) as c FROM OrderLine'),
  connection.execute('SELECT COUNT(*) as c FROM OrderPayment'),
  connection.execute('SELECT COUNT(*) as c FROM PaymentMethodConfig'),
]);

const labels = ['Users', 'Customers', 'Products', 'Categories', 'Variants', 'Floors', 'Tables', 'Sessions', 'Orders', 'Order Lines', 'Payments', 'Config'];
console.log('\n===== DATABASE SUMMARY =====');
counts.forEach(([rows], i) => {
  console.log(`  ${labels[i]}: ${rows[0].c}`);
});

const total = counts.reduce((s, [rows]) => s + rows[0].c, 0);
console.log(`\n  TOTAL RECORDS: ${total}`);
console.log('============================\n');

await connection.end();
console.log('Seeding complete!');
