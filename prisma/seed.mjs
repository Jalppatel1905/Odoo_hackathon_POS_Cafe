import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sipsync_pos'
});

console.log('Connected to MySQL. Seeding...');

// Clear tables (in order due to FK constraints)
const tables = ['OrderPayment', 'OrderLine', 'Order', 'POSSession', 'ProductVariant', 'Product', 'ProductCategory', 'floor_table', 'Floor', 'Customer', 'PaymentMethodConfig', 'User'];
for (const t of tables) {
  await connection.execute(`DELETE FROM \`${t}\``);
}

// Categories
await connection.execute(`INSERT INTO ProductCategory (id, name, color, sequence) VALUES
  ('cat-1', 'Quick Bites', '#ffd43b', 1),
  ('cat-2', 'Drinks', '#74c0fc', 2),
  ('cat-3', 'Desert', '#f783ac', 3),
  ('cat-4', 'Food', '#69db7c', 4)`);
console.log('Created 4 categories');

// Products
await connection.execute(`INSERT INTO Product (id, name, categoryId, price, unit, tax, description) VALUES
  ('p1', 'Burger', 'cat-1', 15, 'Unit', 5, 'Classic beef burger'),
  ('p2', 'Pizza', 'cat-4', 250, 'Unit', 5, 'Cheese pizza'),
  ('p3', 'Maggie', 'cat-1', 70, 'Unit', 5, 'Instant noodles'),
  ('p4', 'Fries', 'cat-1', 120, 'Unit', 5, 'French fries'),
  ('p5', 'Sandwich', 'cat-1', 150, 'Unit', 5, 'Club sandwich'),
  ('p6', 'Coffee', 'cat-2', 50, 'Unit', 5, 'Hot coffee'),
  ('p7', 'Tea', 'cat-2', 35, 'Unit', 5, 'Masala tea'),
  ('p8', 'Diet Coke', 'cat-2', 70, 'Unit', 5, 'Diet coke can'),
  ('p9', 'Fanta', 'cat-2', 60, 'Unit', 5, 'Fanta orange'),
  ('p10', 'Milkshake', 'cat-2', 140, 'Unit', 5, 'Chocolate milkshake'),
  ('p11', 'Pasta', 'cat-4', 200, 'Unit', 5, 'Penne pasta'),
  ('p12', 'Green Tea', 'cat-2', 65, 'Unit', 5, 'Japanese green tea'),
  ('p13', 'Water', 'cat-2', 30, 'Unit', 5, 'Mineral water')`);
console.log('Created 13 products');

// Payment config
await connection.execute(`INSERT INTO PaymentMethodConfig (id, cash, digital, upi, upiId) VALUES ('pmc-1', true, true, false, '')`);
console.log('Created payment config');

// Floor
await connection.execute(`INSERT INTO Floor (id, name, posTerminal) VALUES ('floor-1', 'Ground Floor', 'SipSync')`);
await connection.execute(`INSERT INTO floor_table (id, number, seats, active, floorId) VALUES
  ('t1', 1, 4, true, 'floor-1'),
  ('t2', 2, 2, true, 'floor-1'),
  ('t3', 3, 6, true, 'floor-1'),
  ('t4', 4, 4, true, 'floor-1'),
  ('t5', 5, 8, true, 'floor-1')`);
console.log('Created floor with 5 tables');

// Customers
await connection.execute(`INSERT INTO Customer (id, name, email, phone, street1, street2, city, state, country, totalSales) VALUES
  ('cust-1', 'Eric', 'eric@odoo.com', '+91 9898989898', '', '', '', '', '', 2000),
  ('cust-2', 'Smith', 'smith@odoo.com', '+91 8787878787', '', '', '', '', '', 1500)`);
console.log('Created 2 customers');

await connection.end();
console.log('Seeding complete!');
