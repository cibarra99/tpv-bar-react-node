const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { Sequelize } = require('sequelize');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

// ===== BASE DE DATOS LOCAL (SQLite) ===== //
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'db.sqlite'),
  logging: false
});

// ===== MODELS ===== //
const Product = sequelize.define('product', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name: Sequelize.STRING,
  price: Sequelize.DECIMAL(10, 2),
  category: Sequelize.STRING,
  variants: Sequelize.TEXT // JSON
});

const Order = sequelize.define('order', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  items: Sequelize.TEXT, // JSON
  total: Sequelize.DECIMAL(10, 2),
  paymentMethod: Sequelize.STRING,
  status: { type: Sequelize.STRING, defaultValue: 'open' }
});

// ===== MIDDLEWARES ===== //
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ===== ROUTES ===== //
app.get('/api/products', async (_req, res) => {
  const prods = await Product.findAll({ order: [['category', 'ASC']] });
  res.json(prods.map(p => ({ ...p.toJSON(), variants: JSON.parse(p.variants || '[]') })));
});

app.post('/api/orders', async (req, res) => {
  const { items, total, paymentMethod } = req.body;
  const order = await Order.create({ items: JSON.stringify(items), total, paymentMethod });
  io.emit('order', order);
  res.json(order);
});

app.get('/api/orders', async (_req, res) => {
  const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
  res.json(orders.map(o => ({ ...o.toJSON(), items: JSON.parse(o.items) })));
});

app.use('/api', (req, res) => res.status(404).json({ message: 'Not found' }));

// ===== INIT ===== //
(async () => {
  await sequelize.sync({ force: false });
  // productos de ejemplo
  const count = await Product.count();
  if (count === 0) {
    await Product.bulkCreate([
      { name: 'Cerveza', price: 2.50, category: 'Bebidas', variants: '["caña","doble","sin alcohol"]' },
      { name: 'Tortilla', price: 8.00, category: 'Tapas', variants: '["con cebolla","sin cebolla"]' },
      { name: 'Hamburguesa', price: 10.00, category: 'Platos', variants: '["al punto","hecha","sin gluten"]' }
    ]);
  }
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Servidor en :${PORT}`));
})();