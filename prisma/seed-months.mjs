import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sipsync_pos'
});

console.log('Connected. Adding Jan-March data...');

// Sessions for each month
const sessions = [
  ['ses-jan-1', 'Jan Session 1', '2026-01-05 09:00:00', '2026-01-05 18:00:00', 0, 8500, 'user-1', false],
  ['ses-jan-2', 'Jan Session 2', '2026-01-12 09:00:00', '2026-01-12 17:00:00', 0, 7200, 'user-2', false],
  ['ses-jan-3', 'Jan Session 3', '2026-01-20 09:00:00', '2026-01-20 19:00:00', 0, 9100, 'user-1', false],
  ['ses-jan-4', 'Jan Session 4', '2026-01-28 09:00:00', '2026-01-28 18:00:00', 0, 6800, 'user-3', false],
  ['ses-feb-1', 'Feb Session 1', '2026-02-03 09:00:00', '2026-02-03 18:00:00', 0, 11200, 'user-1', false],
  ['ses-feb-2', 'Feb Session 2', '2026-02-10 09:00:00', '2026-02-10 17:00:00', 0, 9500, 'user-2', false],
  ['ses-feb-3', 'Feb Session 3', '2026-02-18 09:00:00', '2026-02-18 19:00:00', 0, 10800, 'user-1', false],
  ['ses-feb-4', 'Feb Session 4', '2026-02-25 09:00:00', '2026-02-25 18:00:00', 0, 8900, 'user-4', false],
  ['ses-mar-1', 'Mar Session 1', '2026-03-02 09:00:00', '2026-03-02 18:00:00', 0, 12500, 'user-1', false],
  ['ses-mar-2', 'Mar Session 2', '2026-03-10 09:00:00', '2026-03-10 17:00:00', 0, 14200, 'user-2', false],
  ['ses-mar-3', 'Mar Session 3', '2026-03-18 09:00:00', '2026-03-18 19:00:00', 0, 11800, 'user-3', false],
  ['ses-mar-4', 'Mar Session 4', '2026-03-26 09:00:00', '2026-03-26 18:00:00', 0, 13500, 'user-1', false],
];
for (const s of sessions) {
  await connection.execute(
    'INSERT IGNORE INTO POSSession (id, name, openedAt, closedAt, openingAmount, closingAmount, responsibleId, isOpen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', s
  );
}
console.log('Added 12 monthly sessions');

// Products pool for variety
const productPool = [
  { id: 'p1', name: 'Burger', price: 15 },
  { id: 'p2', name: 'Pizza', price: 250 },
  { id: 'p3', name: 'Maggie', price: 70 },
  { id: 'p4', name: 'Fries', price: 120 },
  { id: 'p5', name: 'Sandwich', price: 150 },
  { id: 'p6', name: 'Coffee', price: 50 },
  { id: 'p7', name: 'Tea', price: 35 },
  { id: 'p8', name: 'Diet Coke', price: 70 },
  { id: 'p9', name: 'Fanta', price: 60 },
  { id: 'p10', name: 'Milkshake', price: 140 },
  { id: 'p11', name: 'Pasta', price: 200 },
  { id: 'p14', name: 'Mocha', price: 90 },
  { id: 'p15', name: 'Paneer Tikka', price: 180 },
  { id: 'p16', name: 'Cold Coffee', price: 80 },
  { id: 'p17', name: 'Garlic Bread', price: 95 },
  { id: 'p18', name: 'Brownie', price: 110 },
  { id: 'p19', name: 'Nachos', price: 130 },
  { id: 'p20', name: 'Lemonade', price: 45 },
];

const customerPool = [
  { id: 'cust-1', name: 'Eric' },
  { id: 'cust-2', name: 'Smith' },
  { id: 'cust-3', name: 'Rahul Verma' },
  { id: 'cust-4', name: 'Anita Desai' },
  { id: 'cust-5', name: 'Vikram Joshi' },
  { id: 'cust-6', name: 'Sneha Patel' },
  { id: 'cust-7', name: 'Arjun Mehta' },
  { id: 'cust-8', name: 'Kavita Sharma' },
  { id: 'cust-9', name: 'Deepak Kumar' },
  { id: 'cust-10', name: 'Meera Nair' },
  { id: 'cust-11', name: 'Sanjay Gupta' },
  { id: 'cust-12', name: 'Pooja Reddy' },
];

const paymentMethods = ['cash', 'digital', 'upi'];

// Generate orders for Jan, Feb, March
const months = [
  { month: 1, year: 2026, prefix: 'jan', sessions: ['ses-jan-1','ses-jan-2','ses-jan-3','ses-jan-4'], ordersPerDay: [2,3,2,3,2,1,3,2,3,2,1,2,3,2,1] },
  { month: 2, year: 2026, prefix: 'feb', sessions: ['ses-feb-1','ses-feb-2','ses-feb-3','ses-feb-4'], ordersPerDay: [3,2,3,2,3,2,3,2,3,3,2,3,2,3,2] },
  { month: 3, year: 2026, prefix: 'mar', sessions: ['ses-mar-1','ses-mar-2','ses-mar-3','ses-mar-4'], ordersPerDay: [3,3,2,3,3,2,3,3,2,3,3,2,3,3,3] },
];

let orderCount = 0;
let lineCount = 0;
let payCount = 0;

for (const m of months) {
  const daysInMonth = new Date(m.year, m.month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    // Skip some days randomly for realistic data
    if (day % 4 === 0 && day > 20) continue;

    const numOrders = m.ordersPerDay[day % m.ordersPerDay.length];

    for (let o = 0; o < numOrders; o++) {
      orderCount++;
      const orderId = `${m.prefix}-ord-${day}-${o}`;
      const orderNo = `${m.month}${String(day).padStart(2,'0')}${o+1}`;
      const session = m.sessions[Math.floor(day / 8) % m.sessions.length];
      const hour = 9 + Math.floor(Math.random() * 9); // 9 AM to 6 PM
      const minute = Math.floor(Math.random() * 60);
      const date = `${m.year}-${String(m.month).padStart(2,'0')}-${String(day).padStart(2,'0')} ${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00`;
      const table = Math.floor(Math.random() * 12) + 1;
      const cust = customerPool[Math.floor(Math.random() * customerPool.length)];

      // Pick 2-4 random products
      const numItems = 2 + Math.floor(Math.random() * 3);
      const shuffled = [...productPool].sort(() => Math.random() - 0.5);
      const items = shuffled.slice(0, numItems);

      let total = 0;
      const lines = [];

      for (let li = 0; li < items.length; li++) {
        const qty = 1 + Math.floor(Math.random() * 3);
        const subtotal = items[li].price * qty;
        total += subtotal;
        lineCount++;
        lines.push({
          id: `${m.prefix}-ol-${day}-${o}-${li}`,
          productId: items[li].id,
          productName: items[li].name,
          quantity: qty,
          price: items[li].price,
          subtotal: subtotal,
        });
      }

      const tax = total * 0.05;
      const finalTotal = total + tax;
      const payMethod = paymentMethods[Math.floor(Math.random() * 3)];

      // Insert order
      await connection.execute(
        'INSERT IGNORE INTO `Order` (id, orderNo, sessionId, date, tableId, tableNumber, total, tax, finalTotal, status, customerId, customerName, kitchenStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "paid", ?, ?, "completed")',
        [orderId, orderNo, session, date, `t${table}`, table, total, tax, finalTotal, cust.id, cust.name]
      );

      // Insert order lines
      for (const l of lines) {
        await connection.execute(
          'INSERT IGNORE INTO OrderLine (id, orderId, productId, productName, quantity, price, tax, unit, subtotal, notes) VALUES (?, ?, ?, ?, ?, ?, 5, "Unit", ?, "")',
          [l.id, orderId, l.productId, l.productName, l.quantity, l.price, l.subtotal]
        );
      }

      // Insert payment
      payCount++;
      await connection.execute(
        'INSERT IGNORE INTO OrderPayment (id, orderId, method, amount, date) VALUES (?, ?, ?, ?, ?)',
        [`${m.prefix}-pay-${day}-${o}`, orderId, payMethod, finalTotal, date]
      );
    }
  }
  console.log(`${m.prefix.toUpperCase()}: Added orders for month ${m.month}`);
}

console.log(`\nTotal added: ${orderCount} orders, ${lineCount} lines, ${payCount} payments`);

// Final counts
const [ordRows] = await connection.execute('SELECT COUNT(*) as c FROM `Order`');
const [lineRows] = await connection.execute('SELECT COUNT(*) as c FROM OrderLine');
const [payRows] = await connection.execute('SELECT COUNT(*) as c FROM OrderPayment');
const [sesRows] = await connection.execute('SELECT COUNT(*) as c FROM POSSession');

console.log(`\n===== TOTAL IN DB =====`);
console.log(`  Sessions: ${sesRows[0].c}`);
console.log(`  Orders: ${ordRows[0].c}`);
console.log(`  Order Lines: ${lineRows[0].c}`);
console.log(`  Payments: ${payRows[0].c}`);
console.log(`========================\n`);

await connection.end();
console.log('Done!');
