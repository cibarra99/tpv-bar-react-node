import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';

const socket = io(window.location.origin.replace(':3000', ':5000'));

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    axios.get('/api/products').then(res => setProducts(res.data));
    socket.on('order', (o) => console.log('Nueva orden', o));
    return () => socket.off('order');
  }, []);

  useEffect(() => {
    setTotal(cart.reduce((t, i) => t + i.qty * parseFloat(i.price), 0).toFixed(2));
  }, [cart]);

  const addToCart = (p, variant = '') => {
    const key = p.id + '|' + variant;
    const found = cart.find(x => x.key === key);
    if (found) {
      setCart(cart.map(x => x.key === key ? { ...x, qty: x.qty + 1 } : x));
    } else {
      setCart([...cart, { key, id: p.id, name: p.name, variant, price: p.price, qty: 1 }]);
    }
  };

  const sendOrder = async () => {
    if (!cart.length) return alert('Carrito vacío');
    await axios.post('/api/orders', { items: cart, total, paymentMethod: 'cash' });
    setCart([]);
  };

  return (
    <div className="grid">
      <section className="menu">
        <h2>Menú</h2>
        {products.map(p => (
          <div key={p.id} className="card">
            <h3>{p.name} - {p.price} €</h3>
            {p.variants.map(v => (
              <button key={v} onClick={() => addToCart(p, v)}>{v}</button>
            ))}
            {!p.variants.length && <button onClick={() => addToCart(p)}>Añadir</button>}
          </div>
        ))}
      </section>

      <aside className="ticket">
        <h2>Ticket</h2>
        {cart.map(i => (
          <div key={i.key}>{i.qty} x {i.name} {i.variant} {(i.qty * parseFloat(i.price)).toFixed(2)} €</div>
        ))}
        <hr />
        <h3>Total: {total} €</h3>
        <button onClick={sendOrder}>Cobrar (efectivo)</button>
        <button onClick={() => setCart([])}>Cancelar</button>
      </aside>
    </div>
  );
}

export default App;