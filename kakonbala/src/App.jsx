import { useState, useEffect } from "react";
import {
  collection, onSnapshot, doc, updateDoc, addDoc,
  increment, serverTimestamp, query, orderBy
} from "firebase/firestore";
import { db } from "./firebase.js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from "recharts";

/* ── Colour palette ─────────────────────────────────────────────────────── */
const C = {
  bg: "#FBF7F2", card: "#FFFFFF", primary: "#C17B5C",
  gold: "#C9933A", dark: "#3D2B1F", med: "#7A5C4E",
  light: "#A89080", border: "#E8DDD8",
  success: "#2D7A2D", successBg: "#EAF5EA",
  warn: "#D4800A",   warnBg: "#FFF3E0",
  danger: "#C0392B", dangerBg: "#FDECEA",
  info:   "#1A5BAB", infoBg:   "#E8F0FA",
};

/* ── Static chart data (replace with real Firestore aggregations later) ── */
const monthlyData = [
  { month: "Nov", revenue: 28400, orders: 18 },
  { month: "Dec", revenue: 45200, orders: 31 },
  { month: "Jan", revenue: 32100, orders: 22 },
  { month: "Feb", revenue: 38700, orders: 26 },
  { month: "Mar", revenue: 41300, orders: 29 },
  { month: "Apr", revenue: 52800, orders: 37 },
];
const catRevData = [
  { name: "Jewelry",  value: 68000 },
  { name: "Crafts",   value: 54000 },
  { name: "Clothing", value: 62000 },
];
const PIE_COLORS = ["#C17B5C", "#C9933A", "#5D8A5E"];

/* ── Shared micro-styles ─────────────────────────────────────────────────── */
const catBadge = (cat) => ({
  display: "inline-block", fontSize: 10, padding: "2px 8px", borderRadius: 10,
  fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4,
  background: cat === "jewelry" ? "#FAE8E0" : cat === "crafts" ? "#E8F0E0" : "#EAE0FA",
  color:      cat === "jewelry" ? "#9B4F2F" : cat === "crafts" ? "#4F7B2F" : "#5F4F9B",
});
const statusBadge = (s) => ({
  display: "inline-block", fontSize: 11, padding: "3px 10px", borderRadius: 10, fontWeight: 600,
  background: s === "paid" || s === "delivered" ? C.successBg : s === "shipped" ? C.infoBg : s === "pending_payment" ? C.dangerBg : C.warnBg,
  color:      s === "paid" || s === "delivered" ? C.success   : s === "shipped" ? C.info   : s === "pending_payment" ? C.danger   : C.warn,
});
const stockTag = (n) => ({
  fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600,
  background: n <= 5 ? C.dangerBg : C.successBg,
  color:      n <= 5 ? C.danger   : C.success,
});
const btn  = { background: C.primary, color: "#FBF7F2", border: "none", padding: "9px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" };
const inp  = { width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, fontFamily: "inherit", background: "#FFF", color: C.dark, boxSizing: "border-box", marginTop: 2 };
const TH   = { textAlign: "left", padding: "10px 14px", background: "#F5EFE8", color: C.med, fontWeight: 600, borderBottom: `1px solid ${C.border}`, fontSize: 12 };
const TD   = { padding: "10px 14px", borderBottom: `1px solid #F5EDE5`, verticalAlign: "middle" };
const qBtn = { width: 28, height: 28, background: "#F5EFE8", border: `1px solid ${C.border}`, borderRadius: 4, cursor: "pointer", fontSize: 14, color: C.med, display: "inline-flex", alignItems: "center", justifyContent: "center" };
const metCard = (c) => ({ background: "#FFF", borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 20px", borderLeft: `3px solid ${c || C.primary}` });

/* ──────────────────────────────────────────────────────────────────────────
   MAIN APP
   ────────────────────────────────────────────────────────────────────────── */
export default function App() {
  /* ── State ── */
  const [tab,        setTab]        = useState("shop");
  const [products,   setProducts]   = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [cart,       setCart]       = useState([]);
  const [catFilter,  setCatFilter]  = useState("all");
  const [cartOpen,   setCartOpen]   = useState(false);
  const [showForm,   setShowForm]   = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [notif,      setNotif]      = useState(null);
  const [newP, setNewP] = useState({ name: "", category: "jewelry", price: "", stock: "", desc: "" });
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", address: "" });

  /* ── Firebase: real-time products listener ── */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  /* ── Firebase: real-time orders listener (newest first) ── */
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  /* ── Derived values ── */
  const cartCount  = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal  = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const lowStock   = products.filter((p) => p.stock <= 5);
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const totalRev   = monthlyData.reduce((s, m) => s + m.revenue, 0);
  const visibleProducts = catFilter === "all" ? products : products.filter((p) => p.category === catFilter);

  /* ── Helpers ── */
  function notify(msg) { setNotif(msg); setTimeout(() => setNotif(null), 3000); }

  function addToCart(product) {
    if (product.stock === 0) return;
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === product.id);
      if (ex) return prev.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
    notify(`✓ ${product.name} added to cart`);
  }

  function adjustCart(id, delta) {
    setCart((prev) => prev.map((i) => i.product.id === id ? { ...i, qty: i.qty + delta } : i).filter((i) => i.qty > 0));
  }

  /* ── SSLCommerz checkout ── */
  async function handleCheckout() {
    if (!customer.name || !customer.phone) {
      notify("⚠ Please enter your name and phone number");
      return;
    }
    setPayLoading(true);
    try {
      // 1. Create a pending order in Firestore
      const orderRef = await addDoc(collection(db, "orders"), {
        customer,
        items: cart.map((i) => ({ id: i.product.id, name: i.product.name, qty: i.qty, price: i.product.price })),
        total: cartTotal,
        status: "pending_payment",
        createdAt: serverTimestamp(),
      });

      // 2. Call your Vercel serverless function to get the SSLCommerz payment URL
      const res = await fetch("/api/initiate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId:       orderRef.id,
          amount:        cartTotal,
          customerName:  customer.name,
          customerEmail: customer.email || "noemail@hastkala.com",
          customerPhone: customer.phone,
          customerAddress: customer.address || "Dhaka, Bangladesh",
        }),
      });
      const data = await res.json();

      if (data.url) {
        // 3. Redirect to SSLCommerz payment page
        window.location.href = data.url;
      } else {
        notify("⚠ Payment initiation failed: " + (data.error || "unknown error"));
        setPayLoading(false);
      }
    } catch (err) {
      notify("⚠ Error: " + err.message);
      setPayLoading(false);
    }
  }

  /* ── Add new product to Firestore ── */
  async function addProduct() {
    if (!newP.name || !newP.price || !newP.stock) return notify("⚠ Fill all required fields");
    const catEmoji = { jewelry: "💍", crafts: "🏺", clothing: "👗" };
    await addDoc(collection(db, "products"), {
      name: newP.name, category: newP.category,
      price: Number(newP.price), stock: Number(newP.stock),
      desc: newP.desc, emoji: catEmoji[newP.category],
    });
    setNewP({ name: "", category: "jewelry", price: "", stock: "", desc: "" });
    setShowForm(false);
    notify("✓ Product added and saved to database!");
  }

  /* ── Adjust stock directly in Firestore ── */
  async function adjustStock(productId, delta) {
    await updateDoc(doc(db, "products", productId), { stock: increment(delta) });
  }

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", background: C.bg, minHeight: "100vh", color: C.dark }}>

      {/* ── HEADER ── */}
      <header style={{ background: "#3D2B1F", color: "#FBF7F2", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 66, position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 21, fontWeight: 700, color: C.gold, letterSpacing: 1 }}>✦ Hastkala</div>
          <div style={{ fontSize: 10, color: "#A89080", letterSpacing: 3, textTransform: "uppercase" }}>Handcrafted with love</div>
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {[["shop","🛍 Shop"],["dashboard","📊 Dashboard"],["inventory","📦 Inventory"],["orders","📋 Orders"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ background: tab === key ? C.primary : "transparent", color: tab === key ? "#FBF7F2" : "#A89080", border: "none", padding: "7px 15px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: tab === key ? 600 : 400 }}>{label}</button>
          ))}
        </nav>
        <button onClick={() => setCartOpen(true)} style={{ ...btn, display: "flex", alignItems: "center", gap: 8 }}>
          🛒 Cart {cartCount > 0 && <span style={{ background: C.gold, color: "#3D2B1F", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{cartCount}</span>}
        </button>
      </header>

      {/* ── NOTIFICATION TOAST ── */}
      {notif && (
        <div style={{ position: "fixed", top: 78, right: 24, background: "#3D2B1F", color: "#FBF7F2", padding: "11px 20px", borderRadius: 8, zIndex: 300, fontSize: 13, boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>{notif}</div>
      )}

      <main style={{ padding: "28px 32px", maxWidth: 1120, margin: "0 auto" }}>

        {/* ══════════════ SHOP ══════════════ */}
        {tab === "shop" && (
          <div>
            <div style={{ marginBottom: 22 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Our Collection</h1>
              <p style={{ color: C.light, fontSize: 13, margin: "4px 0 0" }}>Every piece handcrafted with tradition and care · {products.length} items</p>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
              {[["all","All Items"],["jewelry","💍 Jewelry"],["crafts","🏺 Crafts"],["clothing","👗 Clothing"]].map(([key, label]) => (
                <button key={key} onClick={() => setCatFilter(key)} style={{ background: catFilter === key ? C.primary : "#FFF", color: catFilter === key ? "#FBF7F2" : C.med, border: `1px solid ${catFilter === key ? C.primary : C.border}`, padding: "6px 18px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>{label}</button>
              ))}
            </div>
            {products.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: C.light }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                <div>Loading products from database…</div>
                <div style={{ fontSize: 12, marginTop: 8 }}>If this is your first run, see <b>src/seed.js</b> to populate your Firestore.</div>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 18 }}>
              {visibleProducts.map((p) => (
                <div key={p.id} style={{ background: "#FFF", borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                  <div style={{ height: 110, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, background: "#FBF7F2" }}>{p.emoji}</div>
                  <div style={{ padding: "13px 15px" }}>
                    <span style={catBadge(p.category)}>{p.category}</span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, margin: "3px 0 2px" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: C.light, lineHeight: 1.4, marginBottom: 8 }}>{p.desc}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: C.primary }}>৳{p.price.toLocaleString()}</span>
                      <span style={stockTag(p.stock)}>{p.stock <= 5 ? `⚠ ${p.stock} left` : `${p.stock} in stock`}</span>
                    </div>
                    <button onClick={() => addToCart(p)} disabled={p.stock === 0} style={{ ...btn, width: "100%", marginTop: 10, opacity: p.stock === 0 ? 0.45 : 1, cursor: p.stock === 0 ? "not-allowed" : "pointer" }}>
                      {p.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════ DASHBOARD ══════════════ */}
        {tab === "dashboard" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 22px" }}>Business Dashboard</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
              {[
                { label: "Total Revenue",    value: `৳${(totalRev/1000).toFixed(0)}K`, sub: "↑ 12% vs last month", c: C.primary },
                { label: "All Orders",       value: orders.length,                      sub: "Live from database",  c: C.gold },
                { label: "Products Listed",  value: products.length,                    sub: `${lowStock.length} low stock`, c: "#5D8A5E" },
                { label: "Total Stock",      value: totalStock,                         sub: "Units available",     c: "#7A5C4E" },
              ].map((m, i) => (
                <div key={i} style={metCard(m.c)}>
                  <div style={{ fontSize: 11, color: C.light, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.dark }}>{m.value}</div>
                  <div style={{ fontSize: 11, color: "#5D8A5E", marginTop: 3 }}>{m.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 18 }}>
              <div style={{ background: "#FFF", borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Monthly Revenue (৳)</div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0E8E0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.light }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: C.light }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v) => [`৳${v.toLocaleString()}`, "Revenue"]} contentStyle={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="revenue" fill={C.primary} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: "#FFF", borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Revenue by Category</div>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={catRevData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={3}>
                      {catRevData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`৳${v.toLocaleString()}`, ""]} contentStyle={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                  {catRevData.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i], flexShrink: 0 }} />
                      <span style={{ color: C.med }}>{item.name}</span>
                      <span style={{ marginLeft: "auto", fontWeight: 600 }}>৳{(item.value/1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ background: "#FFF", borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Monthly Order Trend</div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E8E0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.light }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.light }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="orders" stroke={C.gold} strokeWidth={2.5} dot={{ fill: C.gold, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {lowStock.length > 0 && (
              <div style={{ background: C.warnBg, borderRadius: 10, border: "1px solid #FFE0A0", padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.warn, marginBottom: 8 }}>⚠ Low Stock — restock soon</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {lowStock.map((p) => (
                    <span key={p.id} style={{ background: "#FFF", border: "1px solid #FFD580", borderRadius: 6, padding: "4px 12px", fontSize: 12, color: C.warn }}>
                      {p.emoji} {p.name} — <b>{p.stock}</b> left
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ INVENTORY ══════════════ */}
        {tab === "inventory" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Stock Inventory</h1>
                <p style={{ color: C.light, fontSize: 13, margin: "3px 0 0" }}>All changes sync live to Firestore</p>
              </div>
              <button onClick={() => setShowForm((f) => !f)} style={{ ...btn, background: showForm ? "#7A5C4E" : C.primary }}>
                {showForm ? "✕ Cancel" : "+ Add Product"}
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
              {[
                ["Total Products", products.length, C.primary],
                ["Total Stock Units", totalStock, "#5D8A5E"],
                ["Low Stock Items",   lowStock.length, C.danger],
              ].map(([l, v, c]) => (
                <div key={l} style={metCard(c)}>
                  <div style={{ fontSize: 11, color: C.light, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>{v}</div>
                </div>
              ))}
            </div>

            {showForm && (
              <div style={{ background: "#FFF", borderRadius: 12, border: `1px solid ${C.border}`, padding: 22, marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>New Product Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["Product Name *","name","text","e.g. Silver Anklet"],["Price in ৳ *","price","number","e.g. 1200"],["Initial Stock *","stock","number","e.g. 10"]].map(([l,k,t,ph]) => (
                    <div key={k}>
                      <label style={{ fontSize: 11, color: C.med, fontWeight: 600 }}>{l}</label>
                      <input style={inp} type={t} placeholder={ph} value={newP[k]} onChange={(e) => setNewP((p) => ({ ...p, [k]: e.target.value }))} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 11, color: C.med, fontWeight: 600 }}>Category *</label>
                    <select style={inp} value={newP.category} onChange={(e) => setNewP((p) => ({ ...p, category: e.target.value }))}>
                      <option value="jewelry">💍 Jewelry</option>
                      <option value="crafts">🏺 Crafts</option>
                      <option value="clothing">👗 Clothing</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: 11, color: C.med, fontWeight: 600 }}>Description</label>
                    <input style={inp} placeholder="Brief product description" value={newP.desc} onChange={(e) => setNewP((p) => ({ ...p, desc: e.target.value }))} />
                  </div>
                </div>
                <button style={{ ...btn, marginTop: 14 }} onClick={addProduct}>Save to Database</button>
              </div>
            )}

            <div style={{ background: "#FFF", borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>{["Product","Category","Price","Stock","Status","Adjust"].map((h) => <th key={h} style={TH}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td style={TD}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 22 }}>{p.emoji}</span>
                          <div>
                            <div style={{ fontWeight: 600, color: C.dark }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: C.light }}>{(p.desc || "").slice(0,44)}{(p.desc||"").length > 44 ? "…" : ""}</div>
                          </div>
                        </div>
                      </td>
                      <td style={TD}><span style={catBadge(p.category)}>{p.category}</span></td>
                      <td style={{ ...TD, fontWeight: 600, color: C.primary }}>৳{p.price.toLocaleString()}</td>
                      <td style={{ ...TD, fontWeight: 700, fontSize: 15, color: p.stock <= 5 ? C.danger : C.dark }}>{p.stock}</td>
                      <td style={TD}>
                        <span style={{ display: "inline-block", fontSize: 11, padding: "3px 9px", borderRadius: 8, fontWeight: 600, background: p.stock === 0 ? C.dangerBg : p.stock <= 5 ? C.warnBg : C.successBg, color: p.stock === 0 ? C.danger : p.stock <= 5 ? C.warn : C.success }}>
                          {p.stock === 0 ? "Out of Stock" : p.stock <= 5 ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td style={TD}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={qBtn} onClick={() => adjustStock(p.id, -1)}>−</button>
                          <button style={qBtn} onClick={() => adjustStock(p.id, 5)}>+5</button>
                          <button style={qBtn} onClick={() => adjustStock(p.id, 10)}>+10</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════ ORDERS ══════════════ */}
        {tab === "orders" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Order History</h1>
            <p style={{ color: C.light, fontSize: 13, marginBottom: 22 }}>{orders.length} orders · Live from Firestore</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
              {[["paid","Paid",C.success,C.successBg],["processing","Processing",C.warn,C.warnBg],["shipped","Shipped",C.info,C.infoBg],["pending_payment","Pending Pay",C.danger,C.dangerBg]].map(([s,l,c,bg]) => (
                <div key={s} style={{ background: bg, borderRadius: 10, padding: "14px 18px", textAlign: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: c }}>{orders.filter((o) => o.status === s).length}</div>
                  <div style={{ fontSize: 12, color: c, marginTop: 3, fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#FFF", borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 18 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>{["Order ID","Date","Customer","Phone","Items","Total","Status"].map((h) => <th key={h} style={TH}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {orders.length === 0 && (
                    <tr><td colSpan={7} style={{ ...TD, textAlign: "center", color: C.light, padding: 30 }}>No orders yet. Orders appear here as customers buy.</td></tr>
                  )}
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ ...TD, fontWeight: 600, color: C.primary, fontFamily: "monospace", fontSize: 11 }}>{o.id?.slice(0,8)}…</td>
                      <td style={{ ...TD, color: C.med, fontSize: 12 }}>{o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleDateString("en-BD") : "—"}</td>
                      <td style={{ ...TD, fontWeight: 500 }}>{o.customer?.name || "—"}</td>
                      <td style={{ ...TD, fontSize: 12, color: C.med }}>{o.customer?.phone || "—"}</td>
                      <td style={{ ...TD, color: C.med, fontSize: 12 }}>
                        {(o.items || []).slice(0,2).map((i) => i.name).join(", ")}{(o.items||[]).length > 2 ? ` +${o.items.length-2} more` : ""}
                      </td>
                      <td style={{ ...TD, fontWeight: 700 }}>৳{(o.total || 0).toLocaleString()}</td>
                      <td style={TD}><span style={statusBadge(o.status)}>{o.status?.replace("_"," ")}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ background: "#FFF", borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: C.med, fontSize: 14 }}>Total revenue (all orders)</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: C.primary }}>৳{orders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString()}</span>
            </div>
          </div>
        )}
      </main>

      {/* ══════════════ CART DRAWER ══════════════ */}
      {cartOpen && (
        <>
          <div onClick={() => setCartOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(61,43,31,0.45)", zIndex: 100 }} />
          <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 380, background: C.bg, zIndex: 101, padding: 24, overflowY: "auto", borderLeft: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>Shopping Cart</div>
              <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.med }}>✕</button>
            </div>
            {cart.length === 0 ? (
              <div style={{ textAlign: "center", color: C.light, padding: "50px 0" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🛒</div>
                <div>Your cart is empty</div>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.product.id} style={{ display: "flex", gap: 12, paddingBottom: 16, marginBottom: 16, borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ width: 52, height: 52, background: "#FBF7F2", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{item.product.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{item.product.name}</div>
                      <div style={{ fontSize: 13, color: C.primary, fontWeight: 700, marginTop: 2 }}>৳{item.product.price.toLocaleString()}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
                        <button style={qBtn} onClick={() => adjustCart(item.product.id, -1)}>−</button>
                        <span style={{ fontSize: 13, fontWeight: 600, minWidth: 18, textAlign: "center" }}>{item.qty}</span>
                        <button style={qBtn} onClick={() => adjustCart(item.product.id, 1)}>+</button>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>৳{(item.product.price * item.qty).toLocaleString()}</div>
                  </div>
                ))}
                <div style={{ paddingTop: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: `1px solid ${C.border}`, margin: "8px 0 16px" }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
                    <span style={{ fontWeight: 700, fontSize: 18, color: C.primary }}>৳{cartTotal.toLocaleString()}</span>
                  </div>
                  <button onClick={() => { setCartOpen(false); setCheckoutModal(true); }} style={{ ...btn, width: "100%", padding: "13px", fontSize: 15 }}>
                    Proceed to Checkout →
                  </button>
                  <div style={{ fontSize: 11, color: C.light, textAlign: "center", marginTop: 10 }}>Secure payment via SSLCommerz · bKash · Visa · MasterCard</div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ══════════════ CHECKOUT MODAL ══════════════ */}
      {checkoutModal && (
        <>
          <div onClick={() => setCheckoutModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(61,43,31,0.55)", zIndex: 200 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 420, background: "#FFF", borderRadius: 16, padding: 30, zIndex: 201, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Complete Your Order</div>
            <div style={{ fontSize: 12, color: C.light, marginBottom: 20 }}>You'll be redirected to SSLCommerz to pay securely</div>
            {[["Full Name *","name","text","Maliha Rahman"],["Phone Number *","phone","tel","01711-000000"],["Email (optional)","email","email","you@email.com"],["Delivery Address","address","text","House, Road, Dhaka"]].map(([l,k,t,ph]) => (
              <div key={k} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: C.med, fontWeight: 600 }}>{l}</label>
                <input style={inp} type={t} placeholder={ph} value={customer[k]} onChange={(e) => setCustomer((c) => ({ ...c, [k]: e.target.value }))} />
              </div>
            ))}
            <div style={{ background: C.bg, borderRadius: 8, padding: "12px 14px", marginBottom: 18, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: C.med }}>{cartCount} item(s)</span>
                <span style={{ fontWeight: 600 }}>৳{cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: C.med }}>Delivery</span>
                <span style={{ color: "#5D8A5E", fontWeight: 600 }}>Free</span>
              </div>
            </div>
            <button onClick={handleCheckout} disabled={payLoading} style={{ ...btn, width: "100%", padding: "13px", fontSize: 15, opacity: payLoading ? 0.7 : 1 }}>
              {payLoading ? "Redirecting to payment…" : `Pay ৳${cartTotal.toLocaleString()} via SSLCommerz`}
            </button>
            <div style={{ fontSize: 11, color: C.light, textAlign: "center", marginTop: 10 }}>
              Accepts bKash · Nagad · Visa · MasterCard · DBBL Nexus
            </div>
          </div>
        </>
      )}
    </div>
  );
}
