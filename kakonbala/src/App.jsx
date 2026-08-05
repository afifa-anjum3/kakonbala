import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, increment, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db, auth } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";

/* ── Constants ─────────────────────────────────────────────────── */
const PRIMARY   = "#AD1457";
const PURPLE    = "#6A1B9A";
const GOLD      = "#F9A825";
const DARK      = "#2D0A3F";
const MED       = "#7B3F9E";
const LIGHT     = "#B39DCA";
const SUCCESS   = "#2E7D32";
const WARN      = "#E65100";
const DANGER    = "#C62828";
const INFO      = "#1565C0";
const GRAD      = `linear-gradient(135deg,${PRIMARY} 0%,${PURPLE} 60%,#4A148C 100%)`;
const GLASS     = "rgba(255,255,255,0.75)";
const BLUR      = "blur(12px)";
const ADMIN_EMAIL = "afifa.anjum3@gmail.com";

const CATS = {
  jewelry:{ emoji:"💍", subs:["Bangles","Earrings","Finger Ring","Payel","Necklace","Nosepin","Waist Band","Hair Accessories"] },
  crafts:{  emoji:"🏺", subs:["Mandala","Canvas Paint","Painted Glass Jar","Wall Hanging","Candle","Clay Art","Other"] },
  clothing:{ emoji:"👗", groups:{ "Women":["Saree","Tops","Skirt","Salwar Kameez","Kurti","Lehenga","Other"], "Men":["Panjabi","T-Shirt","Shirt","Pant","Fotua","Other"], "Child":["Baby Boy","Baby Girl"] } }
};

const COLOR_MAP = { red:"#E53935",blue:"#1E88E5",green:"#43A047",pink:"#E91E63",purple:"#8E24AA",yellow:"#FDD835",orange:"#FB8C00",black:"#212121",white:"#F5F5F5",gold:"#F9A825",silver:"#9E9E9E",grey:"#757575",gray:"#757575",brown:"#795548",cream:"#FFF8E1",maroon:"#880E4F",navy:"#1A237E",teal:"#00796B",mint:"#B2EBF2",lavender:"#EDE7F6",peach:"#FFCCBC",rose:"#FCE4EC",beige:"#F5F5DC" };

const monthlyData = [
  {month:"Nov",revenue:28400,orders:18},{month:"Dec",revenue:45200,orders:31},
  {month:"Jan",revenue:32100,orders:22},{month:"Feb",revenue:38700,orders:26},
  {month:"Mar",revenue:41300,orders:29},{month:"Apr",revenue:52800,orders:37},
];
const catRevData = [{name:"Jewelry",value:68000},{name:"Crafts",value:54000},{name:"Clothing",value:62000}];
const PIE_COLORS = [PRIMARY, PURPLE, GOLD];

const T = {
  en:{ shopName:"Kakonbala",tagline:"Handmade Jewelry, Crafts & Clothing",welcome:"Welcome to Kakonbala!",welcomeSub:"Every piece handcrafted with tradition and love 🌸",allItems:"✨ All Items",jewelry:"💍 Jewelry",crafts:"🏺 Crafts",clothing:"👗 Clothing",addCart:"🛒 Add to Cart",outOfStock:"Out of Stock",inStock:"in stock",left:"left",shop:"🛍 Shop",dashboard:"📊 Dashboard",inventory:"📦 Inventory",orders:"📋 Orders",cart:"🛒 Cart",cartEmpty:"Your cart is empty",proceedCheckout:"Proceed to Checkout →",total:"Total",delivery:"Delivery",free:"Free 💝",yourCart:"Your Cart",dashTitle:"Business Dashboard",totalRevenue:"Total Revenue",allOrders:"All Orders",products:"Products",totalStock:"Total Stock",lowStockAlert:"⚠ Low Stock — restock soon",monthlyRev:"Monthly Revenue (৳)",catRevenue:"Revenue by Category",orderTrend:"Monthly Order Trend",invTitle:"Stock Inventory",invSub:"All changes sync live to Firestore",addProduct:"+ Add Product",cancel:"✕ Cancel",saveDb:"✓ Save to Database",productName:"Product Name *",price:"Price (৳) *",stockQty:"Stock Qty *",category:"Category *",description:"Description",photo:"📸 Photos (up to 5)",totalProducts:"Total Products",totalStockUnits:"Total Stock Units",lowStockItems:"Low Stock Items",ordersTitle:"Order History",ordersLive:"orders · Live",paid:"Paid",processing:"Processing",shipped:"Shipped",pendingPay:"Pending Payment",orderId:"Order ID",date:"Date",customer:"Customer",phone:"Phone",items:"Items",totalRevAll:"Total revenue (all orders)",noOrders:"No orders yet",completeOrder:"Complete Your Order",fullName:"Full Name *",phoneNum:"Phone *",email:"Email",address:"Delivery Address",payNow:"Pay via SSLCommerz",redirecting:"Redirecting...",securePayment:"🔒 bKash · Nagad · Visa · MasterCard",adjust:"Adjust",status:"Status",lowStock:"Low Stock",noStock:"Out of Stock",inStockLabel:"In Stock",addedToCart:"added to cart!" },
  bn:{ shopName:"কাঁকনবালা",tagline:"হাতে তৈরি গহনা, ক্রাফট ও পোশাক",welcome:"কাঁকনবালায় স্বাগতম!",welcomeSub:"প্রতিটি পণ্য হাতে তৈরি, ভালোবাসায় মোড়ানো 🌸",allItems:"✨ সব পণ্য",jewelry:"💍 গহনা",crafts:"🏺 ক্রাফট",clothing:"👗 পোশাক",addCart:"🛒 কার্টে যোগ করুন",outOfStock:"স্টক নেই",inStock:"স্টকে",left:"বাকি",shop:"🛍 শপ",dashboard:"📊 ড্যাশবোর্ড",inventory:"📦 ইনভেন্টরি",orders:"📋 অর্ডার",cart:"🛒 কার্ট",cartEmpty:"কার্ট খালি আছে",proceedCheckout:"অর্ডার করুন →",total:"মোট",delivery:"ডেলিভারি",free:"বিনামূল্যে 💝",yourCart:"আপনার কার্ট",dashTitle:"ব্যবসার সারসংক্ষেপ",totalRevenue:"মোট আয়",allOrders:"অর্ডার",products:"পণ্য",totalStock:"মোট স্টক",lowStockAlert:"⚠ কম স্টক — দ্রুত রিস্টক করুন",monthlyRev:"মাসিক আয় (৳)",catRevenue:"ক্যাটাগরি অনুযায়ী আয়",orderTrend:"মাসিক অর্ডার ট্রেন্ড",invTitle:"স্টক ম্যানেজমেন্ট",invSub:"সব পরিবর্তন Firestore-এ সাথে সাথে সেভ হয়",addProduct:"+ নতুন পণ্য যোগ করুন",cancel:"✕ বাতিল",saveDb:"✓ ডেটাবেসে সেভ করুন",productName:"পণ্যের নাম *",price:"মূল্য (৳) *",stockQty:"স্টক পরিমাণ *",category:"ক্যাটাগরি *",description:"বিবরণ",photo:"📸 ছবি (সর্বোচ্চ ৫টি)",totalProducts:"মোট পণ্য",totalStockUnits:"মোট স্টক ইউনিট",lowStockItems:"কম স্টক পণ্য",ordersTitle:"অর্ডার হিস্ট্রি",ordersLive:"টি অর্ডার · লাইভ",paid:"পেইড",processing:"প্রক্রিয়াধীন",shipped:"পাঠানো হয়েছে",pendingPay:"পেমেন্ট বাকি",orderId:"অর্ডার ID",date:"তারিখ",customer:"কাস্টমার",phone:"ফোন",items:"পণ্য",totalRevAll:"মোট আয় (সব অর্ডার)",noOrders:"এখনো কোনো অর্ডার নেই",completeOrder:"অর্ডার সম্পন্ন করুন",fullName:"পুরো নাম *",phoneNum:"ফোন নম্বর *",email:"ইমেইল",address:"ডেলিভারি ঠিকানা",payNow:"SSLCommerz-এ পেমেন্ট করুন",redirecting:"পেমেন্ট পেজে যাচ্ছে...",securePayment:"🔒 bKash · Nagad · Visa · MasterCard",adjust:"স্টক পরিবর্তন",status:"অবস্থা",lowStock:"কম স্টক",noStock:"স্টক নেই",inStockLabel:"স্টকে আছে",addedToCart:"কার্টে যোগ হয়েছে!" }
};

/* ── Styles ─────────────────────────────────────────────────────── */
const btn = { background:GRAD,color:"#FFF",border:"none",padding:"10px 22px",borderRadius:20,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit",boxShadow:`0 4px 15px rgba(173,20,87,0.35)` };
const inp = { width:"100%",padding:"9px 12px",border:`1.5px solid rgba(173,20,87,0.25)`,borderRadius:10,fontSize:13,fontFamily:"inherit",background:"rgba(255,255,255,0.85)",color:DARK,boxSizing:"border-box",marginTop:2 };
const glass = { background:GLASS,backdropFilter:BLUR,WebkitBackdropFilter:BLUR,border:"1px solid rgba(255,255,255,0.5)",borderRadius:16,boxShadow:"0 8px 32px rgba(106,27,154,0.12)" };
const TH = { textAlign:"left",padding:"10px 14px",background:"rgba(248,234,246,0.8)",color:PURPLE,fontWeight:700,borderBottom:"1px solid rgba(255,255,255,0.4)",fontSize:12 };
const TD = { padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,0.3)",verticalAlign:"middle" };
const qBtnS = { width:30,height:30,background:"rgba(248,234,246,0.8)",border:`1px solid rgba(173,20,87,0.2)`,borderRadius:6,cursor:"pointer",fontSize:14,color:PURPLE,display:"inline-flex",alignItems:"center",justifyContent:"center" };

function catBadge(cat) {
  const bg = cat==="jewelry"?"rgba(252,228,236,0.9)":cat==="crafts"?"rgba(243,229,245,0.9)":"rgba(237,231,246,0.9)";
  const color = cat==="jewelry"?PRIMARY:cat==="crafts"?PURPLE:"#4527A0";
  return { display:"inline-block",fontSize:10,padding:"2px 8px",borderRadius:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4,background:bg,color };
}
function stockTag(n) {
  return { fontSize:11,padding:"2px 8px",borderRadius:10,fontWeight:700,background:n<=5?"rgba(255,235,238,0.9)":"rgba(232,245,233,0.9)",color:n<=5?DANGER:SUCCESS };
}
function statusBadge(s) {
  const isPaid = s==="paid"||s==="delivered";
  const isShipped = s==="shipped";
  const isPending = s==="pending_payment";
  return { display:"inline-block",fontSize:11,padding:"3px 10px",borderRadius:10,fontWeight:600,
    background:isPaid?"rgba(232,245,233,0.85)":isShipped?"rgba(227,242,253,0.85)":isPending?"rgba(255,235,238,0.85)":"rgba(255,243,224,0.85)",
    color:isPaid?SUCCESS:isShipped?INFO:isPending?DANGER:WARN };
}
function metCard(c) {
  return { ...glass,padding:"16px 20px",borderLeft:`4px solid ${c||PRIMARY}` };
}

/* ── TagInput Component ─────────────────────────────────────────── */
function TagInput({ values, onChange, placeholder }) {
  const vals = values || [];
  const ph = placeholder || "Type & press Enter";
  const [inp2, setInp2] = useState("");
  function addTag() {
    const v = inp2.trim().replace(/,$/, "");
    if (v && !vals.includes(v)) onChange([...vals, v]);
    setInp2("");
  }
  return (
    <div style={{ display:"flex",flexWrap:"wrap",gap:6,padding:"6px 8px",border:"1.5px solid rgba(173,20,87,0.25)",borderRadius:10,background:"rgba(255,255,255,0.85)",minHeight:38,alignItems:"center" }}>
      {vals.map(v => (
        <span key={v} style={{ background:"rgba(173,20,87,0.1)",color:"#AD1457",borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}>
          {v}
          <button onClick={() => onChange(vals.filter(x => x !== v))} style={{ background:"none",border:"none",cursor:"pointer",color:"#AD1457",fontSize:14,lineHeight:1,padding:0,fontWeight:700 }}>×</button>
        </span>
      ))}
      <input value={inp2} onChange={e => setInp2(e.target.value)}
        onKeyDown={e => { if (e.key==="Enter"||e.key===",") { e.preventDefault(); addTag(); } }}
        onBlur={addTag}
        placeholder={vals.length===0 ? ph : ""}
        style={{ border:"none",outline:"none",background:"transparent",fontSize:12,minWidth:80,flex:1 }} />
    </div>
  );
}

/* ── Carousel Component ─────────────────────────────────────────── */
function Carousel({ images, emoji, height }) {
  const imgs = images || [];
  const em = emoji || "💍";
  const h = height || 180;
  const [idx, setIdx] = useState(0);
  const valid = imgs.filter(Boolean);

  useEffect(() => {
    if (valid.length <= 1) return;
    const timer = setInterval(() => setIdx(i => (i + 1) % valid.length), 2800);
    return () => clearInterval(timer);
  }, [valid.length]);

  if (!valid.length) {
    return (
      <div style={{ width:"100%",height:h,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.3)" }}>
        <span style={{ fontSize:60 }}>{em}</span>
      </div>
    );
  }

  return (
    <div style={{ position:"relative",width:"100%",height:h,overflow:"hidden",background:"rgba(255,255,255,0.3)" }}>
      <img src={valid[idx]} alt="product"
        style={{ width:"100%",height:"100%",objectFit:"contain",padding:4,transition:"opacity 0.4s" }}
        onError={e => { e.target.style.display = "none"; }} />
      {valid.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + valid.length) % valid.length); }}
            style={{ position:"absolute",left:4,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.8)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",fontSize:16,fontWeight:700,color:"#AD1457",display:"flex",alignItems:"center",justifyContent:"center" }}>‹</button>
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % valid.length); }}
            style={{ position:"absolute",right:4,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.8)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",fontSize:16,fontWeight:700,color:"#AD1457",display:"flex",alignItems:"center",justifyContent:"center" }}>›</button>
          <div style={{ position:"absolute",bottom:6,left:"50%",transform:"translateX(-50%)",display:"flex",gap:5 }}>
            {valid.map((_, i) => (
              <div key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
                style={{ width:i===idx?16:7,height:7,borderRadius:4,cursor:"pointer",background:i===idx?"#AD1457":"rgba(255,255,255,0.7)",transition:"all 0.3s" }} />
            ))}
          </div>
          <div style={{ position:"absolute",top:6,right:6,background:"rgba(173,20,87,0.75)",color:"#FFF",borderRadius:10,padding:"1px 8px",fontSize:10,fontWeight:700 }}>
            {idx+1}/{valid.length}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main App ───────────────────────────────────────────────────── */
export default function App() {
  const [lang, setLang]     = useState("bn");
  const [tab, setTab]       = useState("shop");
  const [products, setProducts]   = useState([]);
  const [orders, setOrders]       = useState([]);
  const [cart, setCart]           = useState([]);
  const [catFilter, setCatFilter] = useState("all");
  const [subFilter, setSubFilter] = useState("all");
  const [clothingGroup, setClothingGroup] = useState("all");
  const [cartOpen, setCartOpen]   = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [notif, setNotif]   = useState(null);
  const [selSize, setSelSize]   = useState("");
  const [selColor, setSelColor] = useState("");
  const [selPiece, setSelPiece] = useState("");
  const [zoom, setZoom] = useState(1);
  const [user, setUser]   = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab]   = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authWorking, setAuthWorking] = useState(false);
  const [newP, setNewP] = useState({ name:"",category:"jewelry",price:"",stock:"",desc:"",imageUrls:[""],subcategory:"",clothingGroup:"",sizes:[],colors:[],pieceCounts:[] });
  const [customer, setCustomer] = useState({ name:"",email:"",phone:"",address:"" });

  const t = T[lang];
  const isAdmin = user && user.email === ADMIN_EMAIL;

  /* ── Firebase listeners ── */
  useEffect(() => {
    try {
      const unsub = onAuthStateChanged(auth, u => setUser(u));
      return () => { try { unsub(); } catch(e) {} };
    } catch(e) { console.warn("Auth:", e.message); }
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), snap =>
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap =>
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setSelSize(selectedProduct.sizes?.[0] || "");
      setSelColor(selectedProduct.colors?.[0] || "");
      setSelPiece(selectedProduct.pieceCounts?.[0] || "");
      setZoom(1);
    }
  }, [selectedProduct]);

  /* ── Derived ── */
  const cartCount  = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal  = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const lowStock   = products.filter(p => p.stock <= 5);
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const totalRev   = monthlyData.reduce((s, m) => s + m.revenue, 0);

  const visible = products.filter(p => {
    if (catFilter !== "all" && p.category !== catFilter) return false;
    if (catFilter === "clothing" && clothingGroup !== "all" && p.clothingGroup !== clothingGroup) return false;
    if (subFilter !== "all" && p.subcategory !== subFilter) return false;
    return true;
  });

  function notify(msg) { setNotif(msg); setTimeout(() => setNotif(null), 3000); }

  /* ── Auth functions ── */
  async function handleSignup() {
    if (!authName || !authEmail || !authPassword) return setAuthError("Please fill all fields");
    if (authPassword.length < 6) return setAuthError("Password must be at least 6 characters");
    setAuthWorking(true); setAuthError("");
    try {
      await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      setShowAuth(false); setAuthEmail(""); setAuthPassword(""); setAuthName("");
      notify("✓ Account created! Welcome!");
    } catch(e) { setAuthError(e.message.replace("Firebase: ", "").replace(/\(auth.*\)/, "")); }
    setAuthWorking(false);
  }

  async function handleLogin() {
    if (!authEmail || !authPassword) return setAuthError("Please fill all fields");
    setAuthWorking(true); setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
      setShowAuth(false); setAuthEmail(""); setAuthPassword("");
      notify("✓ Logged in!");
    } catch(e) { setAuthError(e.message.replace("Firebase: ", "").replace(/\(auth.*\)/, "")); }
    setAuthWorking(false);
  }

  async function handleLogout() {
    await signOut(auth);
    setTab("shop");
    notify("✓ Logged out");
  }

  /* ── Cart functions ── */
  function addToCart(product, opts) {
    const o = opts || {};
    if (product.stock === 0) return;
    const cKey = `${product.id}_${o.size||""}_${o.color||""}_${o.piece||""}`;
    setCart(prev => {
      const ex = prev.find(i => i.cKey === cKey);
      if (ex) return prev.map(i => i.cKey === cKey ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty:1, cKey, size:o.size||"", color:o.color||"", piece:o.piece||"" }];
    });
    const optStr = [o.size, o.color, o.piece].filter(Boolean).join(" · ");
    notify(`✓ ${product.name}${optStr ? " (" + optStr + ")" : ""} ${t.addedToCart}`);
  }

  function adjustCart(cKey, delta) {
    setCart(prev => prev.map(i => i.cKey === cKey ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));
  }

  /* ── Product CRUD ── */
  async function addProduct() {
    if (!newP.name || !newP.price || !newP.stock) return notify("⚠ Fill all required fields");
    const catEmoji = { jewelry:"💍", crafts:"🏺", clothing:"👗" };
    const validUrls = (newP.imageUrls || []).filter(Boolean);
    await addDoc(collection(db, "products"), {
      name:newP.name, category:newP.category, subcategory:newP.subcategory||"",
      clothingGroup:newP.clothingGroup||"", price:Number(newP.price), stock:Number(newP.stock),
      desc:newP.desc, emoji:catEmoji[newP.category], imageUrl:validUrls[0]||"",
      imageUrls:validUrls, sizes:newP.sizes||[], colors:newP.colors||[], pieceCounts:newP.pieceCounts||[]
    });
    setNewP({ name:"",category:"jewelry",price:"",stock:"",desc:"",imageUrls:[""],subcategory:"",clothingGroup:"",sizes:[],colors:[],pieceCounts:[] });
    setShowForm(false);
    notify("✓ Product added!");
  }

  async function saveEdit() {
    if (!editProduct.name || !editProduct.price || !editProduct.stock) return notify("⚠ Fill all required fields");
    const base = editProduct.imageUrls && editProduct.imageUrls.length ? [...editProduct.imageUrls] : [editProduct.imageUrl || ""];
    const validUrls = base.filter(Boolean);
    await updateDoc(doc(db, "products", editProduct.id), {
      name:editProduct.name, category:editProduct.category, subcategory:editProduct.subcategory||"",
      clothingGroup:editProduct.clothingGroup||"", price:Number(editProduct.price), stock:Number(editProduct.stock),
      desc:editProduct.desc, imageUrl:validUrls[0]||"", imageUrls:validUrls,
      sizes:editProduct.sizes||[], colors:editProduct.colors||[], pieceCounts:editProduct.pieceCounts||[]
    });
    setEditProduct(null);
    notify("✓ Product updated!");
  }

  async function deleteProduct(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await deleteDoc(doc(db, "products", id));
    notify("✓ Deleted!");
  }

  async function adjustStock(id, delta) {
    await updateDoc(doc(db, "products", id), { stock: increment(delta) });
  }

  async function handleCheckout() {
    if (!customer.name || !customer.phone) { notify("⚠ Enter name and phone"); return; }
    setPayLoading(true);
    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        customer, items:cart.map(i => ({ id:i.product.id, name:i.product.name, qty:i.qty, price:i.product.price })),
        total:cartTotal, status:"pending_payment", createdAt:serverTimestamp()
      });
      const res = await fetch("/api/initiate-payment", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ orderId:orderRef.id, amount:cartTotal, customerName:customer.name, customerEmail:customer.email||"noemail@kakonbala.com", customerPhone:customer.phone, customerAddress:customer.address||"Dhaka" })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else { notify("⚠ " + (data.error || "Payment error")); setPayLoading(false); }
    } catch(e) { notify("⚠ " + e.message); setPayLoading(false); }
  }

  /* ── Sub-category helpers ── */
  function getSubOptions(cat, cg) {
    if (cat === "jewelry") return CATS.jewelry.subs;
    if (cat === "crafts") return CATS.crafts.subs;
    if (cat === "clothing" && cg) return CATS.clothing.groups[cg] || [];
    return [];
  }

  /* ── Photo URL helpers ── */
  function updatePhotoUrl(arr, i, val, setter) {
    const next = [...arr]; next[i] = val;
    setter(p => ({ ...p, imageUrls: next, imageUrl: next[0] || "" }));
  }
  function removePhoto(arr, i, setter) {
    const next = arr.filter((_, idx) => idx !== i);
    setter(p => ({ ...p, imageUrls: next, imageUrl: next[0] || "" }));
  }
  function addPhotoSlot(arr, setter) {
    setter(p => ({ ...p, imageUrls: [...arr, ""] }));
  }

  function PhotoFields({ urlArr, setter }) {
    return (
      <div style={{ gridColumn:"span 2" }}>
        <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:4 }}>{t.photo}</label>
        <div style={{ fontSize:11,color:LIGHT,marginBottom:8 }}>
          Upload to <a href="https://imgbb.com" target="_blank" rel="noreferrer" style={{ color:PRIMARY,fontWeight:700 }}>imgbb.com</a> → BBCode → copy URL between [img]...[/img]
        </div>
        {urlArr.map((url, i) => (
          <div key={i} style={{ display:"flex",gap:8,marginBottom:8,alignItems:"center" }}>
            <span style={{ fontSize:11,color:MED,fontWeight:700,minWidth:20 }}>#{i+1}</span>
            <input style={{ ...inp,marginTop:0,flex:1 }} type="text" placeholder={`Photo ${i+1} URL`} value={url}
              onChange={e => updatePhotoUrl(urlArr, i, e.target.value, setter)} />
            {url && <img src={url} alt="" onError={e => { e.target.style.display="none"; }} style={{ width:40,height:40,objectFit:"cover",borderRadius:6,border:"1px solid rgba(255,255,255,0.6)",flexShrink:0 }} />}
            {urlArr.length > 1 && (
              <button type="button" onClick={() => removePhoto(urlArr, i, setter)}
                style={{ background:"rgba(255,235,238,0.9)",border:`1px solid rgba(198,40,40,0.3)`,color:DANGER,borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:14,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
            )}
          </div>
        ))}
        {urlArr.length < 5 && (
          <button type="button" onClick={() => addPhotoSlot(urlArr, setter)}
            style={{ fontSize:12,color:PRIMARY,background:"rgba(173,20,87,0.08)",border:"1px dashed rgba(173,20,87,0.4)",borderRadius:8,padding:"5px 14px",cursor:"pointer",fontWeight:600,fontFamily:"inherit" }}>
            + Add another photo
          </button>
        )}
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily:"'Hind Siliguri','Segoe UI',Arial,sans-serif",background:"linear-gradient(160deg,#FFE4F0 0%,#F8D7F8 20%,#EDD6FF 40%,#F5D0FF 60%,#FFD6EC 80%,#FFE8F5 100%)",minHeight:"100vh",color:DARK }}>

      {/* HEADER */}
      <header style={{ background:"rgba(255,255,255,0.22)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.4)",color:DARK,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:70,position:"sticky",top:0,zIndex:50,boxShadow:"0 4px 20px rgba(173,20,87,0.1)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <img src="/logo.jpg" alt="logo" style={{ width:50,height:50,borderRadius:"50%",border:`2px solid rgba(173,20,87,0.4)`,objectFit:"cover" }} />
          <div>
            <div style={{ fontSize:22,fontWeight:800,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>{t.shopName}</div>
            <div style={{ fontSize:10,color:MED,letterSpacing:1.5,textTransform:"uppercase" }}>{t.tagline}</div>
          </div>
        </div>
        <nav style={{ display:"flex",gap:4 }}>
          {(isAdmin ? [["shop",t.shop],["dashboard",t.dashboard],["inventory",t.inventory],["orders",t.orders]] : [["shop",t.shop]]).map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ background:tab===key?GRAD:"rgba(255,255,255,0.3)",color:tab===key?"#FFF":DARK,border:tab===key?"none":"1px solid rgba(255,255,255,0.5)",padding:"7px 14px",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:tab===key?700:500,transition:"all 0.2s" }}>{label}</button>
          ))}
        </nav>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <button onClick={() => setLang(l => l==="en"?"bn":"en")} style={{ background:"rgba(255,255,255,0.4)",backdropFilter:BLUR,border:`1.5px solid rgba(173,20,87,0.3)`,color:DARK,padding:"5px 14px",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit" }}>{lang==="en"?"বাংলা":"English"}</button>
          {user ? (
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ fontSize:11,color:MED }}>{isAdmin?"👑 Admin":"👤 "+user.email.split("@")[0]}</span>
              <button onClick={handleLogout} style={{ background:"rgba(255,255,255,0.3)",border:`1.5px solid rgba(173,20,87,0.3)`,color:DARK,padding:"5px 12px",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit" }}>Logout</button>
            </div>
          ) : (
            <button onClick={() => { setShowAuth(true); setAuthError(""); }} style={{ background:"rgba(255,255,255,0.3)",border:`1.5px solid rgba(173,20,87,0.3)`,color:DARK,padding:"5px 14px",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit" }}>Login / Sign Up</button>
          )}
          <button onClick={() => setCartOpen(true)} style={{ ...btn,display:"flex",alignItems:"center",gap:8,padding:"8px 16px" }}>
            {t.cart} {cartCount>0 && <span style={{ background:GOLD,color:DARK,borderRadius:10,padding:"1px 7px",fontSize:11,fontWeight:800 }}>{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* TOAST */}
      {notif && <div style={{ position:"fixed",top:80,right:24,background:GRAD,color:"#FFF",padding:"12px 22px",borderRadius:12,zIndex:300,fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(173,20,87,0.4)" }}>{notif}</div>}

      <main style={{ padding:"28px 32px",maxWidth:1140,margin:"0 auto",position:"relative",zIndex:1 }}>

        {/* SHOP TAB */}
        {tab==="shop" && (
          <div>
            {/* Banner */}
            <div style={{ borderRadius:20,marginBottom:28,overflow:"hidden",position:"relative",minHeight:180,backgroundImage:"url('/banner.png')",backgroundSize:"cover",backgroundPosition:"center",boxShadow:"0 8px 32px rgba(173,20,87,0.25)" }}>
              <div style={{ position:"absolute",inset:0,background:"rgba(255,240,252,0.45)" }} />
              <div style={{ position:"relative",zIndex:2,padding:"32px 40px",minHeight:180,display:"flex",flexDirection:"column",justifyContent:"center" }}>
                <div style={{ fontSize:11,color:"#7B1FA2",letterSpacing:3,textTransform:"uppercase",marginBottom:8,fontWeight:700 }}>হাতে তৈরি &nbsp;·&nbsp; HANDMADE &nbsp;✦</div>
                <h1 style={{ fontSize:34,fontWeight:900,color:"#4A0030",margin:0,textShadow:"0 1px 6px rgba(255,255,255,0.9)" }}>{t.welcome}</h1>
                <p style={{ color:"#6A1B4D",fontSize:14,margin:"8px 0 0",fontWeight:600,textShadow:"0 1px 4px rgba(255,255,255,0.8)" }}>{t.welcomeSub}</p>
                <div style={{ marginTop:16,display:"flex",alignItems:"center",gap:8 }}>
                  <div style={{ height:1.5,width:45,background:"rgba(180,120,30,0.7)" }} />
                  <span style={{ color:"#B8860B",fontSize:14 }}>✦</span>
                  <div style={{ height:1.5,width:45,background:"rgba(180,120,30,0.7)" }} />
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div style={{ marginBottom:18 }}>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:10 }}>
                {[["all",t.allItems],["jewelry",t.jewelry],["crafts",t.crafts],["clothing",t.clothing]].map(([key,label]) => (
                  <button key={key} onClick={() => { setCatFilter(key); setSubFilter("all"); setClothingGroup("all"); }}
                    style={{ background:catFilter===key?GRAD:GLASS,color:catFilter===key?"#FFF":DARK,border:catFilter===key?"none":`1.5px solid rgba(255,255,255,0.5)`,padding:"7px 20px",borderRadius:20,cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:600,backdropFilter:BLUR,boxShadow:catFilter===key?`0 2px 10px rgba(173,20,87,0.4)`:"none" }}>{label}</button>
                ))}
              </div>
              {catFilter==="jewelry" && (
                <div style={{ display:"flex",gap:6,flexWrap:"wrap",paddingLeft:8 }}>
                  <button onClick={() => setSubFilter("all")} style={{ background:subFilter==="all"?"rgba(173,20,87,0.15)":GLASS,color:subFilter==="all"?PRIMARY:MED,border:subFilter==="all"?`1px solid rgba(173,20,87,0.4)`:`1px solid rgba(255,255,255,0.5)`,padding:"4px 14px",borderRadius:15,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600 }}>All</button>
                  {CATS.jewelry.subs.map(s => (
                    <button key={s} onClick={() => setSubFilter(s)} style={{ background:subFilter===s?"rgba(173,20,87,0.15)":GLASS,color:subFilter===s?PRIMARY:MED,border:subFilter===s?`1px solid rgba(173,20,87,0.4)`:`1px solid rgba(255,255,255,0.5)`,padding:"4px 14px",borderRadius:15,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600 }}>{s}</button>
                  ))}
                </div>
              )}
              {catFilter==="crafts" && (
                <div style={{ display:"flex",gap:6,flexWrap:"wrap",paddingLeft:8 }}>
                  <button onClick={() => setSubFilter("all")} style={{ background:subFilter==="all"?"rgba(106,27,154,0.15)":GLASS,color:subFilter==="all"?PURPLE:MED,border:subFilter==="all"?`1px solid rgba(106,27,154,0.4)`:`1px solid rgba(255,255,255,0.5)`,padding:"4px 14px",borderRadius:15,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600 }}>All</button>
                  {CATS.crafts.subs.map(s => (
                    <button key={s} onClick={() => setSubFilter(s)} style={{ background:subFilter===s?"rgba(106,27,154,0.15)":GLASS,color:subFilter===s?PURPLE:MED,border:subFilter===s?`1px solid rgba(106,27,154,0.4)`:`1px solid rgba(255,255,255,0.5)`,padding:"4px 14px",borderRadius:15,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600 }}>{s}</button>
                  ))}
                </div>
              )}
              {catFilter==="clothing" && (
                <div style={{ display:"flex",flexDirection:"column",gap:8,paddingLeft:8 }}>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                    <button onClick={() => { setClothingGroup("all"); setSubFilter("all"); }} style={{ background:clothingGroup==="all"?"rgba(249,168,37,0.2)":GLASS,color:clothingGroup==="all"?"#B8860B":MED,border:clothingGroup==="all"?`1px solid rgba(249,168,37,0.5)`:`1px solid rgba(255,255,255,0.5)`,padding:"4px 14px",borderRadius:15,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:700 }}>All</button>
                    {Object.keys(CATS.clothing.groups).map(g => (
                      <button key={g} onClick={() => { setClothingGroup(g); setSubFilter("all"); }} style={{ background:clothingGroup===g?"rgba(249,168,37,0.2)":GLASS,color:clothingGroup===g?"#B8860B":MED,border:clothingGroup===g?`1px solid rgba(249,168,37,0.5)`:`1px solid rgba(255,255,255,0.5)`,padding:"4px 14px",borderRadius:15,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:700 }}>
                        {g==="Women"?"👩 Women":g==="Men"?"👨 Men":"👶 Child"}
                      </button>
                    ))}
                  </div>
                  {clothingGroup!=="all" && (
                    <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                      <button onClick={() => setSubFilter("all")} style={{ background:subFilter==="all"?"rgba(249,168,37,0.15)":GLASS,color:subFilter==="all"?"#B8860B":MED,border:subFilter==="all"?`1px solid rgba(249,168,37,0.4)`:`1px solid rgba(255,255,255,0.4)`,padding:"3px 12px",borderRadius:12,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:600 }}>All {clothingGroup}</button>
                      {(CATS.clothing.groups[clothingGroup]||[]).map(s => (
                        <button key={s} onClick={() => setSubFilter(s)} style={{ background:subFilter===s?"rgba(249,168,37,0.15)":GLASS,color:subFilter===s?"#B8860B":MED,border:subFilter===s?`1px solid rgba(249,168,37,0.4)`:`1px solid rgba(255,255,255,0.4)`,padding:"3px 12px",borderRadius:12,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:600 }}>{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {products.length===0 && <div style={{ ...glass,textAlign:"center",padding:"60px 0",color:MED }}><div style={{ fontSize:50,marginBottom:12 }}>🌸</div><div>Loading products...</div></div>}

            {/* Product Grid */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:20 }}>
              {visible.map(p => (
                <div key={p.id} style={{ ...glass,overflow:"hidden",transition:"transform 0.2s",cursor:"pointer" }}
                  onMouseEnter={e => e.currentTarget.style.transform="translateY(-6px)"}
                  onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
                  <div onClick={() => setSelectedProduct(p)} style={{ position:"relative" }}>
                    <Carousel images={p.imageUrls&&p.imageUrls.length?p.imageUrls:[p.imageUrl]} emoji={p.emoji} height={180} />
                    <span style={{ ...catBadge(p.category),position:"absolute",top:8,left:8,zIndex:3 }}>{p.subcategory||p.category}</span>
                    <span style={{ position:"absolute",bottom:8,right:8,background:"rgba(255,255,255,0.7)",borderRadius:8,padding:"2px 8px",fontSize:10,color:MED,zIndex:3 }}>🔍 View</span>
                  </div>
                  <div style={{ padding:"14px 16px" }}>
                    <div onClick={() => setSelectedProduct(p)} style={{ fontSize:14,fontWeight:700,color:DARK,marginBottom:4 }}>{p.name}</div>
                    <div style={{ fontSize:11,color:MED,lineHeight:1.5,marginBottom:10,minHeight:32 }}>{p.desc}</div>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
                      <span style={{ fontSize:18,fontWeight:800,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>৳{p.price.toLocaleString()}</span>
                      <span style={stockTag(p.stock)}>{p.stock<=5?`⚠ ${p.stock} ${t.left}`:`${p.stock} ${t.inStock}`}</span>
                    </div>
                    <button onClick={() => addToCart(p)} disabled={p.stock===0}
                      style={{ ...btn,width:"100%",padding:"10px",opacity:p.stock===0?0.45:1,cursor:p.stock===0?"not-allowed":"pointer" }}>
                      {p.stock===0?t.outOfStock:t.addCart}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {tab==="dashboard" && isAdmin && (
          <div>
            <h1 style={{ fontSize:24,fontWeight:800,margin:"0 0 22px",background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>📊 {t.dashTitle}</h1>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22 }}>
              {[{label:t.totalRevenue,value:`৳${(totalRev/1000).toFixed(0)}K`,c:PRIMARY},{label:t.allOrders,value:orders.length,c:PURPLE},{label:t.products,value:products.length,c:GOLD},{label:t.totalStock,value:totalStock,c:SUCCESS}].map((m,i) => (
                <div key={i} style={metCard(m.c)}>
                  <div style={{ fontSize:11,color:LIGHT,textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>{m.label}</div>
                  <div style={{ fontSize:24,fontWeight:800,color:DARK }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:18,marginBottom:18 }}>
              <div style={{ ...glass,padding:20 }}>
                <div style={{ fontSize:14,fontWeight:700,marginBottom:14,color:PURPLE }}>{t.monthlyRev}</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.4)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize:12,fill:LIGHT }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:11,fill:LIGHT }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={v => [`৳${v.toLocaleString()}`, "Revenue"]} />
                    <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={PRIMARY}/><stop offset="100%" stopColor={PURPLE}/></linearGradient></defs>
                    <Bar dataKey="revenue" fill="url(#bg)" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ ...glass,padding:20 }}>
                <div style={{ fontSize:14,fontWeight:700,marginBottom:10,color:PURPLE }}>{t.catRevenue}</div>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={catRevData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={3}>
                      {catRevData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={v => [`৳${v.toLocaleString()}`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                {catRevData.map((item,i) => (
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:8,fontSize:12,marginTop:6 }}>
                    <span style={{ width:10,height:10,borderRadius:2,background:PIE_COLORS[i],flexShrink:0 }} />
                    <span style={{ color:MED }}>{item.name}</span>
                    <span style={{ marginLeft:"auto",fontWeight:700 }}>৳{(item.value/1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...glass,padding:20,marginBottom:18 }}>
              <div style={{ fontSize:14,fontWeight:700,marginBottom:14,color:PURPLE }}>{t.orderTrend}</div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.4)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize:12,fill:LIGHT }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:11,fill:LIGHT }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke={PRIMARY} strokeWidth={3} dot={{ fill:PRIMARY,r:5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {lowStock.length>0 && (
              <div style={{ ...glass,background:"rgba(255,243,224,0.75)",padding:16 }}>
                <div style={{ fontSize:13,fontWeight:700,color:WARN,marginBottom:8 }}>{t.lowStockAlert}</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                  {lowStock.map(p => <span key={p.id} style={{ background:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,204,128,0.6)",borderRadius:8,padding:"4px 12px",fontSize:12,color:WARN }}>{p.emoji} {p.name} — <b>{p.stock}</b></span>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* INVENTORY TAB */}
        {tab==="inventory" && isAdmin && (
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <div>
                <h1 style={{ fontSize:24,fontWeight:800,margin:0,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>📦 {t.invTitle}</h1>
                <p style={{ color:LIGHT,fontSize:13,margin:"3px 0 0" }}>{t.invSub}</p>
              </div>
              <button onClick={() => setShowForm(f => !f)} style={{ ...btn }}>{showForm?t.cancel:t.addProduct}</button>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20 }}>
              {[[t.totalProducts,products.length,PRIMARY],[t.totalStockUnits,totalStock,PURPLE],[t.lowStockItems,lowStock.length,DANGER]].map(([l,v,c]) => (
                <div key={l} style={metCard(c)}>
                  <div style={{ fontSize:11,color:LIGHT,textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>{l}</div>
                  <div style={{ fontSize:26,fontWeight:800,color:DARK }}>{v}</div>
                </div>
              ))}
            </div>
            {showForm && (
              <div style={{ ...glass,padding:24,marginBottom:20 }}>
                <div style={{ fontSize:16,fontWeight:800,marginBottom:16,color:PURPLE }}>🌸 New Product</div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                  {[[t.productName,"name","text","Product name"],[t.price,"price","number","e.g. 400"],[t.stockQty,"stock","number","e.g. 10"]].map(([l,k,tp,ph]) => (
                    <div key={k}>
                      <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:2 }}>{l}</label>
                      <input style={inp} type={tp} placeholder={ph} value={newP[k]} onChange={e => setNewP(p => ({ ...p,[k]:e.target.value }))} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:2 }}>{t.category}</label>
                    <select style={inp} value={newP.category} onChange={e => setNewP(p => ({ ...p,category:e.target.value,subcategory:"",clothingGroup:"" }))}>
                      <option value="jewelry">💍 Jewelry</option>
                      <option value="crafts">🏺 Crafts</option>
                      <option value="clothing">👗 Clothing</option>
                    </select>
                  </div>
                  {newP.category==="clothing" && (
                    <div>
                      <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:2 }}>Group *</label>
                      <select style={inp} value={newP.clothingGroup||""} onChange={e => setNewP(p => ({ ...p,clothingGroup:e.target.value,subcategory:"" }))}>
                        <option value="">-- Select --</option>
                        {Object.keys(CATS.clothing.groups).map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  )}
                  {(newP.category==="jewelry"||newP.category==="crafts"||(newP.category==="clothing"&&newP.clothingGroup)) && (
                    <div>
                      <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:2 }}>Subcategory</label>
                      <select style={inp} value={newP.subcategory||""} onChange={e => setNewP(p => ({ ...p,subcategory:e.target.value }))}>
                        <option value="">-- Select --</option>
                        {getSubOptions(newP.category, newP.clothingGroup).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                  <div style={{ gridColumn:"span 2" }}>
                    <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:2 }}>{t.description}</label>
                    <input style={inp} placeholder="Brief description" value={newP.desc} onChange={e => setNewP(p => ({ ...p,desc:e.target.value }))} />
                  </div>
                  <div style={{ gridColumn:"span 2" }}>
                    <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:4 }}>📏 Sizes <span style={{ fontSize:10,fontWeight:400 }}>(Enter to add)</span></label>
                    <TagInput values={newP.sizes} onChange={v => setNewP(p => ({ ...p,sizes:v }))} placeholder="S, M, L, XL, Free Size..." />
                  </div>
                  <div style={{ gridColumn:"span 2" }}>
                    <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:4 }}>🎨 Colors <span style={{ fontSize:10,fontWeight:400 }}>(Enter to add)</span></label>
                    <TagInput values={newP.colors} onChange={v => setNewP(p => ({ ...p,colors:v }))} placeholder="Red, Blue, Gold..." />
                  </div>
                  <div style={{ gridColumn:"span 2" }}>
                    <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:4 }}>📦 Pack Size <span style={{ fontSize:10,fontWeight:400 }}>(Enter to add)</span></label>
                    <TagInput values={newP.pieceCounts} onChange={v => setNewP(p => ({ ...p,pieceCounts:v }))} placeholder="1pc, 2pc, Set of 3..." />
                  </div>
                  <PhotoFields urlArr={newP.imageUrls||[""]} setter={setNewP} />
                </div>
                <button style={{ ...btn,marginTop:16 }} onClick={addProduct}>{t.saveDb}</button>
              </div>
            )}
            <div style={{ ...glass,overflow:"hidden" }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                <thead><tr>{["Product","Category","Price","Stock",t.status,t.adjust].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={{ background:p.stock===0?"rgba(255,235,238,0.4)":"transparent" }}>
                      <td style={TD}>
                        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width:44,height:44,borderRadius:8,objectFit:"cover",border:"1px solid rgba(255,255,255,0.6)" }} /> : <span style={{ fontSize:28,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.5)",borderRadius:8 }}>{p.emoji}</span>}
                          <div>
                            <div style={{ fontWeight:700,color:DARK }}>{p.name}</div>
                            <div style={{ fontSize:11,color:LIGHT }}>{(p.desc||"").slice(0,40)}{(p.desc||"").length>40?"…":""}</div>
                          </div>
                        </div>
                      </td>
                      <td style={TD}><div style={{ display:"flex",flexDirection:"column",gap:2 }}><span style={catBadge(p.category)}>{p.category}</span>{p.subcategory&&<span style={{ fontSize:10,color:MED }}>{p.clothingGroup?`${p.clothingGroup} › `:""}{p.subcategory}</span>}</div></td>
                      <td style={{ ...TD,fontWeight:700,color:PRIMARY }}>৳{p.price.toLocaleString()}</td>
                      <td style={{ ...TD,fontWeight:800,fontSize:16,color:p.stock<=5?DANGER:DARK }}>{p.stock}</td>
                      <td style={TD}><span style={{ display:"inline-block",fontSize:11,padding:"3px 10px",borderRadius:8,fontWeight:700,background:p.stock===0?"rgba(255,235,238,0.85)":p.stock<=5?"rgba(255,243,224,0.85)":"rgba(232,245,233,0.85)",color:p.stock===0?DANGER:p.stock<=5?WARN:SUCCESS }}>{p.stock===0?t.noStock:p.stock<=5?t.lowStock:t.inStockLabel}</span></td>
                      <td style={TD}>
                        <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                          <button style={qBtnS} onClick={() => adjustStock(p.id,-1)}>−</button>
                          <button style={qBtnS} onClick={() => adjustStock(p.id,5)}>+5</button>
                          <button style={qBtnS} onClick={() => adjustStock(p.id,10)}>+10</button>
                          <button onClick={() => setEditProduct({...p,imageUrls:p.imageUrls&&p.imageUrls.length?p.imageUrls:[p.imageUrl||""],sizes:p.sizes||[],colors:p.colors||[],pieceCounts:p.pieceCounts||[]})} style={{ ...qBtnS,width:"auto",padding:"0 10px",background:"rgba(227,242,253,0.9)",color:INFO,border:`1px solid rgba(21,101,192,0.3)`,fontSize:12,fontWeight:700 }}>✏️</button>
                          <button onClick={() => deleteProduct(p.id,p.name)} style={{ ...qBtnS,width:"auto",padding:"0 10px",background:"rgba(255,235,238,0.9)",color:DANGER,border:`1px solid rgba(198,40,40,0.3)`,fontSize:12,fontWeight:700 }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {tab==="orders" && isAdmin && (
          <div>
            <h1 style={{ fontSize:24,fontWeight:800,margin:"0 0 8px",background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>📋 {t.ordersTitle}</h1>
            <p style={{ color:LIGHT,fontSize:13,marginBottom:22 }}>{orders.length} {t.ordersLive}</p>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22 }}>
              {[["paid",t.paid,SUCCESS,"rgba(232,245,233,0.75)"],["processing",t.processing,WARN,"rgba(255,243,224,0.75)"],["shipped",t.shipped,INFO,"rgba(227,242,253,0.75)"],["pending_payment",t.pendingPay,DANGER,"rgba(255,235,238,0.75)"]].map(([s,l,c,bg]) => (
                <div key={s} style={{ ...glass,background:bg,padding:"14px 18px",textAlign:"center" }}>
                  <div style={{ fontSize:26,fontWeight:800,color:c }}>{orders.filter(o => o.status===s).length}</div>
                  <div style={{ fontSize:12,color:c,marginTop:3,fontWeight:600 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ ...glass,overflow:"hidden",marginBottom:18 }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                <thead><tr>{[t.orderId,t.date,t.customer,t.phone,t.items,"Total",t.status].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {orders.length===0 && <tr><td colSpan={7} style={{ ...TD,textAlign:"center",color:LIGHT,padding:40 }}>{t.noOrders}</td></tr>}
                  {orders.map(o => (
                    <tr key={o.id} style={{ background:"rgba(255,255,255,0.15)" }}>
                      <td style={{ ...TD,fontWeight:600,color:PRIMARY,fontFamily:"monospace",fontSize:11 }}>{(o.id||"").slice(0,8)}…</td>
                      <td style={{ ...TD,color:MED,fontSize:12 }}>{o.createdAt?.seconds?new Date(o.createdAt.seconds*1000).toLocaleDateString():"—"}</td>
                      <td style={{ ...TD,fontWeight:600 }}>{o.customer?.name||"—"}</td>
                      <td style={{ ...TD,fontSize:12,color:MED }}>{o.customer?.phone||"—"}</td>
                      <td style={{ ...TD,color:MED,fontSize:12 }}>{(o.items||[]).slice(0,2).map(i => i.name).join(", ")}{(o.items||[]).length>2?` +${o.items.length-2}`:""}</td>
                      <td style={{ ...TD,fontWeight:800,color:PRIMARY }}>৳{(o.total||0).toLocaleString()}</td>
                      <td style={TD}><span style={statusBadge(o.status)}>{(o.status||"").replace("_"," ")}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ ...glass,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ color:MED,fontSize:14 }}>{t.totalRevAll}</span>
              <span style={{ fontSize:22,fontWeight:800,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>৳{orders.reduce((s,o) => s+(o.total||0),0).toLocaleString()}</span>
            </div>
          </div>
        )}
      </main>

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <>
          <div onClick={() => setSelectedProduct(null)} style={{ position:"fixed",inset:0,background:"rgba(45,10,63,0.65)",zIndex:200,backdropFilter:"blur(4px)" }} />
          <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"min(600px,95vw)",maxHeight:"90vh",overflowY:"auto",background:"rgba(255,255,255,0.95)",backdropFilter:"blur(20px)",borderRadius:24,zIndex:201,boxShadow:"0 24px 80px rgba(173,20,87,0.35)" }}>
            <button onClick={() => setSelectedProduct(null)} style={{ position:"absolute",top:14,right:14,zIndex:10,background:"rgba(255,255,255,0.8)",border:"none",width:34,height:34,borderRadius:"50%",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
            <div style={{ height:280,position:"relative",overflow:"hidden" }}>
              <Carousel images={selectedProduct.imageUrls&&selectedProduct.imageUrls.length?selectedProduct.imageUrls:[selectedProduct.imageUrl]} emoji={selectedProduct.emoji} height={280} />
            </div>
            <div style={{ padding:"22px 28px 28px" }}>
              <span style={catBadge(selectedProduct.category)}>{selectedProduct.subcategory||selectedProduct.category}</span>
              <h2 style={{ fontSize:24,fontWeight:900,color:DARK,margin:"6px 0 8px" }}>{selectedProduct.name}</h2>
              <p style={{ color:MED,fontSize:14,lineHeight:1.7,marginBottom:16 }}>{selectedProduct.desc||"No description."}</p>
              {selectedProduct.pieceCounts?.length>0 && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:12,fontWeight:700,color:DARK,marginBottom:6 }}>📦 Pack Size</div>
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    {selectedProduct.pieceCounts.map(pc => (
                      <button key={pc} onClick={() => setSelPiece(pc)} style={{ padding:"5px 16px",borderRadius:20,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",border:`1.5px solid ${selPiece===pc?PRIMARY:"rgba(173,20,87,0.25)"}`,background:selPiece===pc?"rgba(173,20,87,0.1)":"rgba(255,255,255,0.6)",color:selPiece===pc?PRIMARY:MED }}>{pc}</button>
                    ))}
                  </div>
                </div>
              )}
              {selectedProduct.sizes?.length>0 && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:12,fontWeight:700,color:DARK,marginBottom:6 }}>📏 Size</div>
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    {selectedProduct.sizes.map(sz => (
                      <button key={sz} onClick={() => setSelSize(sz)} style={{ padding:"5px 18px",borderRadius:20,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",border:`1.5px solid ${selSize===sz?PRIMARY:"rgba(173,20,87,0.25)"}`,background:selSize===sz?"rgba(173,20,87,0.1)":"rgba(255,255,255,0.6)",color:selSize===sz?PRIMARY:MED }}>{sz}</button>
                    ))}
                  </div>
                </div>
              )}
              {selectedProduct.colors?.length>0 && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12,fontWeight:700,color:DARK,marginBottom:6 }}>🎨 Color {selColor&&<span style={{ fontWeight:400,color:MED }}>— {selColor}</span>}</div>
                  <div style={{ display:"flex",gap:10,flexWrap:"wrap",alignItems:"center" }}>
                    {selectedProduct.colors.map(cl => {
                      const hex = COLOR_MAP[cl.toLowerCase()];
                      return hex ? (
                        <button key={cl} onClick={() => setSelColor(cl)} title={cl} style={{ width:32,height:32,borderRadius:"50%",cursor:"pointer",background:hex,border:selColor===cl?`3px solid ${PRIMARY}`:`2px solid rgba(255,255,255,0.8)`,boxShadow:selColor===cl?`0 0 0 2px ${PRIMARY},0 2px 8px rgba(0,0,0,0.2)`:"0 2px 6px rgba(0,0,0,0.15)",transition:"all 0.2s" }} />
                      ) : (
                        <button key={cl} onClick={() => setSelColor(cl)} style={{ padding:"5px 16px",borderRadius:20,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",border:`1.5px solid ${selColor===cl?PRIMARY:"rgba(173,20,87,0.25)"}`,background:selColor===cl?"rgba(173,20,87,0.1)":"rgba(255,255,255,0.6)",color:selColor===cl?PRIMARY:MED }}>{cl}</button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(255,240,252,0.6)",borderRadius:12,padding:"14px 18px",marginBottom:20 }}>
                <div>
                  <div style={{ fontSize:11,color:LIGHT,marginBottom:2 }}>মূল্য / Price</div>
                  <div style={{ fontSize:28,fontWeight:900,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>৳{selectedProduct.price.toLocaleString()}</div>
                </div>
                <span style={stockTag(selectedProduct.stock)}>{selectedProduct.stock<=5?`⚠ ${selectedProduct.stock} ${t.left}`:`${selectedProduct.stock} ${t.inStock}`}</span>
              </div>
              <button onClick={() => { addToCart(selectedProduct,{size:selSize,color:selColor,piece:selPiece}); setSelectedProduct(null); }}
                disabled={selectedProduct.stock===0}
                style={{ ...btn,width:"100%",padding:"14px",fontSize:16,opacity:selectedProduct.stock===0?0.45:1,cursor:selectedProduct.stock===0?"not-allowed":"pointer" }}>
                {selectedProduct.stock===0?t.outOfStock:t.addCart}
              </button>
            </div>
          </div>
        </>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editProduct && (
        <>
          <div onClick={() => setEditProduct(null)} style={{ position:"fixed",inset:0,background:"rgba(45,10,63,0.55)",zIndex:200 }} />
          <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:460,maxHeight:"90vh",overflowY:"auto",background:"rgba(255,255,255,0.92)",backdropFilter:"blur(20px)",borderRadius:20,zIndex:201,boxShadow:"0 20px 60px rgba(173,20,87,0.3)" }}>
            <div style={{ background:GRAD,padding:"18px 26px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div style={{ color:"#FFF",fontSize:16,fontWeight:800 }}>✏️ Edit Product</div>
              <button onClick={() => setEditProduct(null)} style={{ background:"rgba(255,255,255,0.2)",border:"none",color:"#FFF",width:30,height:30,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
            </div>
            <div style={{ padding:24 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                {[["Product Name *","name","text","Product name"],["Price (৳) *","price","number","e.g. 400"],["Stock *","stock","number","e.g. 10"]].map(([l,k,tp,ph]) => (
                  <div key={k}>
                    <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:2 }}>{l}</label>
                    <input style={inp} type={tp} placeholder={ph} value={editProduct[k]||""} onChange={e => setEditProduct(p => ({ ...p,[k]:e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:2 }}>Category *</label>
                  <select style={inp} value={editProduct.category||"jewelry"} onChange={e => setEditProduct(p => ({ ...p,category:e.target.value,subcategory:"",clothingGroup:"" }))}>
                    <option value="jewelry">💍 Jewelry</option>
                    <option value="crafts">🏺 Crafts</option>
                    <option value="clothing">👗 Clothing</option>
                  </select>
                </div>
                {(editProduct.category==="jewelry"||editProduct.category==="crafts") && (
                  <div>
                    <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:2 }}>Subcategory</label>
                    <select style={inp} value={editProduct.subcategory||""} onChange={e => setEditProduct(p => ({ ...p,subcategory:e.target.value }))}>
                      <option value="">-- Select --</option>
                      {getSubOptions(editProduct.category, "").map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                {editProduct.category==="clothing" && (
                  <>
                    <div>
                      <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:2 }}>Group *</label>
                      <select style={inp} value={editProduct.clothingGroup||""} onChange={e => setEditProduct(p => ({ ...p,clothingGroup:e.target.value,subcategory:"" }))}>
                        <option value="">-- Select --</option>
                        {Object.keys(CATS.clothing.groups).map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:2 }}>Subcategory</label>
                      <select style={inp} value={editProduct.subcategory||""} onChange={e => setEditProduct(p => ({ ...p,subcategory:e.target.value }))} disabled={!editProduct.clothingGroup}>
                        <option value="">{editProduct.clothingGroup?"-- Select --":"Pick group first"}</option>
                        {getSubOptions("clothing", editProduct.clothingGroup).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </>
                )}
                <div style={{ gridColumn:"span 2" }}>
                  <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:2 }}>Description</label>
                  <input style={inp} placeholder="Product description" value={editProduct.desc||""} onChange={e => setEditProduct(p => ({ ...p,desc:e.target.value }))} />
                </div>
                <div style={{ gridColumn:"span 2" }}>
                  <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:4 }}>📏 Sizes</label>
                  <TagInput values={editProduct.sizes||[]} onChange={v => setEditProduct(p => ({ ...p,sizes:v }))} placeholder="S, M, L, XL..." />
                </div>
                <div style={{ gridColumn:"span 2" }}>
                  <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:4 }}>🎨 Colors</label>
                  <TagInput values={editProduct.colors||[]} onChange={v => setEditProduct(p => ({ ...p,colors:v }))} placeholder="Red, Blue, Gold..." />
                </div>
                <div style={{ gridColumn:"span 2" }}>
                  <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:4 }}>📦 Pack Size</label>
                  <TagInput values={editProduct.pieceCounts||[]} onChange={v => setEditProduct(p => ({ ...p,pieceCounts:v }))} placeholder="1pc, 2pc, Set of 3..." />
                </div>
                <PhotoFields urlArr={editProduct.imageUrls&&editProduct.imageUrls.length?editProduct.imageUrls:[editProduct.imageUrl||""]} setter={setEditProduct} />
              </div>
              <div style={{ display:"flex",gap:10,marginTop:18 }}>
                <button onClick={saveEdit} style={{ ...btn,flex:1,padding:"11px",fontSize:14 }}>✓ Save Changes</button>
                <button onClick={() => setEditProduct(null)} style={{ flex:1,padding:"11px",fontSize:14,background:"rgba(255,255,255,0.6)",border:`1px solid rgba(173,20,87,0.3)`,borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600,color:MED }}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* AUTH MODAL */}
      {showAuth && (
        <>
          <div onClick={() => setShowAuth(false)} style={{ position:"fixed",inset:0,background:"rgba(45,10,63,0.6)",zIndex:200,backdropFilter:"blur(4px)" }} />
          <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:380,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(20px)",borderRadius:24,overflow:"hidden",zIndex:201,boxShadow:"0 24px 80px rgba(173,20,87,0.35)" }}>
            <div style={{ background:GRAD,padding:"20px 28px" }}>
              <div style={{ color:"#FFF",fontSize:18,fontWeight:900 }}>🌸 কাঁকনবালা</div>
              <div style={{ color:"rgba(255,255,255,0.85)",fontSize:12,marginTop:2 }}>Your Handmade Shop</div>
            </div>
            <div style={{ display:"flex",borderBottom:`1px solid rgba(173,20,87,0.15)` }}>
              {[["login","Login"],["signup","Sign Up"]].map(([k,l]) => (
                <button key={k} onClick={() => { setAuthTab(k); setAuthError(""); }} style={{ flex:1,padding:"12px",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,background:authTab===k?"rgba(173,20,87,0.07)":"transparent",color:authTab===k?PRIMARY:MED,borderBottom:authTab===k?`2px solid ${PRIMARY}`:"2px solid transparent" }}>{l}</button>
              ))}
            </div>
            <div style={{ padding:"24px 28px" }}>
              {authTab==="signup" && (
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:4 }}>Full Name</label>
                  <input style={inp} type="text" placeholder="Your name" value={authName} onChange={e => setAuthName(e.target.value)} />
                </div>
              )}
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:4 }}>Email</label>
                <input style={inp} type="email" placeholder="your@email.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} onKeyDown={e => e.key==="Enter"&&(authTab==="login"?handleLogin():handleSignup())} />
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:4 }}>Password</label>
                <input style={inp} type="password" placeholder="Min. 6 characters" value={authPassword} onChange={e => setAuthPassword(e.target.value)} onKeyDown={e => e.key==="Enter"&&(authTab==="login"?handleLogin():handleSignup())} />
              </div>
              {authError && <div style={{ background:"rgba(255,235,238,0.85)",color:DANGER,padding:"8px 12px",borderRadius:8,fontSize:12,fontWeight:600,marginBottom:14 }}>⚠ {authError}</div>}
              <button onClick={authTab==="login"?handleLogin:handleSignup} disabled={authWorking} style={{ ...btn,width:"100%",padding:"13px",fontSize:15,opacity:authWorking?0.7:1 }}>
                {authWorking?"Please wait...":(authTab==="login"?"Login →":"Create Account →")}
              </button>
              <div style={{ fontSize:11,color:LIGHT,textAlign:"center",marginTop:12 }}>
                {authTab==="login"?"Don't have an account? ":"Already have an account? "}
                <span onClick={() => { setAuthTab(authTab==="login"?"signup":"login"); setAuthError(""); }} style={{ color:PRIMARY,fontWeight:700,cursor:"pointer" }}>{authTab==="login"?"Sign Up":"Login"}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CART DRAWER */}
      {cartOpen && (
        <>
          <div onClick={() => setCartOpen(false)} style={{ position:"fixed",inset:0,background:"rgba(45,10,63,0.5)",zIndex:100 }} />
          <div style={{ position:"fixed",right:0,top:0,bottom:0,width:390,background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",zIndex:101,overflowY:"auto",borderLeft:"1px solid rgba(255,255,255,0.5)" }}>
            <div style={{ background:GRAD,padding:"18px 24px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div style={{ color:"#FFF",fontSize:16,fontWeight:800 }}>🛒 {t.yourCart}</div>
              <button onClick={() => setCartOpen(false)} style={{ background:"rgba(255,255,255,0.2)",border:"none",color:"#FFF",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
            </div>
            <div style={{ padding:20 }}>
              {cart.length===0 ? (
                <div style={{ textAlign:"center",color:LIGHT,padding:"50px 0" }}>
                  <div style={{ fontSize:50,marginBottom:12 }}>🌸</div>
                  <div>{t.cartEmpty}</div>
                </div>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.cKey} style={{ display:"flex",gap:12,paddingBottom:16,marginBottom:16,borderBottom:"1px solid rgba(255,255,255,0.4)" }}>
                      <div style={{ width:56,height:56,borderRadius:10,overflow:"hidden",flexShrink:0,border:"1px solid rgba(255,255,255,0.5)",background:"rgba(255,255,255,0.5)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                        {item.product.imageUrl ? <img src={item.product.imageUrl} alt={item.product.name} style={{ width:"100%",height:"100%",objectFit:"cover" }} /> : <span style={{ fontSize:26 }}>{item.product.emoji}</span>}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13,fontWeight:700,color:DARK }}>{item.product.name}</div>
                        {(item.size||item.color||item.piece) && <div style={{ fontSize:10,color:LIGHT,marginTop:1 }}>{[item.size,item.color,item.piece].filter(Boolean).join(" · ")}</div>}
                        <div style={{ fontSize:13,fontWeight:800,color:PRIMARY,marginTop:2 }}>৳{item.product.price.toLocaleString()}</div>
                        <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:7 }}>
                          <button style={qBtnS} onClick={() => adjustCart(item.cKey,-1)}>−</button>
                          <span style={{ fontSize:14,fontWeight:800,minWidth:20,textAlign:"center" }}>{item.qty}</span>
                          <button style={qBtnS} onClick={() => adjustCart(item.cKey,1)}>+</button>
                        </div>
                      </div>
                      <div style={{ fontSize:13,fontWeight:800,color:DARK }}>৳{(item.product.price*item.qty).toLocaleString()}</div>
                    </div>
                  ))}
                  <div style={{ paddingTop:8 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",padding:"14px 0",borderTop:"2px solid rgba(255,255,255,0.4)",margin:"8px 0 16px" }}>
                      <span style={{ fontWeight:800,fontSize:16 }}>{t.total}</span>
                      <span style={{ fontWeight:800,fontSize:20,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>৳{cartTotal.toLocaleString()}</span>
                    </div>
                    <button onClick={() => { setCartOpen(false); setCheckoutModal(true); }} style={{ ...btn,width:"100%",padding:"13px",fontSize:15 }}>{t.proceedCheckout}</button>
                    <div style={{ fontSize:11,color:LIGHT,textAlign:"center",marginTop:10 }}>{t.securePayment}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutModal && (
        <>
          <div onClick={() => setCheckoutModal(false)} style={{ position:"fixed",inset:0,background:"rgba(45,10,63,0.6)",zIndex:200 }} />
          <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:430,background:"rgba(255,255,255,0.92)",backdropFilter:"blur(20px)",borderRadius:20,overflow:"hidden",zIndex:201,boxShadow:"0 20px 60px rgba(173,20,87,0.3)" }}>
            <div style={{ background:GRAD,padding:"20px 28px" }}>
              <div style={{ color:"#FFF",fontSize:17,fontWeight:800 }}>🌸 {t.completeOrder}</div>
            </div>
            <div style={{ padding:24 }}>
              {[[t.fullName,"name","text","Your name"],[t.phoneNum,"phone","tel","01711-000000"],[t.email,"email","email","your@email.com"],[t.address,"address","text","House, Road, City"]].map(([l,k,tp,ph]) => (
                <div key={k} style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12,color:MED,fontWeight:700 }}>{l}</label>
                  <input style={inp} type={tp} placeholder={ph} value={customer[k]} onChange={e => setCustomer(c => ({ ...c,[k]:e.target.value }))} />
                </div>
              ))}
              <div style={{ background:"rgba(255,240,252,0.6)",borderRadius:10,padding:"12px 16px",marginBottom:18,fontSize:13 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                  <span style={{ color:MED }}>{cartCount} items</span>
                  <span style={{ fontWeight:700 }}>৳{cartTotal.toLocaleString()}</span>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between" }}>
                  <span style={{ color:MED }}>{t.delivery}</span>
                  <span style={{ color:SUCCESS,fontWeight:700 }}>{t.free}</span>
                </div>
              </div>
              <button onClick={handleCheckout} disabled={payLoading} style={{ ...btn,width:"100%",padding:"13px",fontSize:15,opacity:payLoading?0.7:1 }}>
                {payLoading?t.redirecting:`৳${cartTotal.toLocaleString()} — ${t.payNow}`}
              </button>
              <div style={{ fontSize:11,color:LIGHT,textAlign:"center",marginTop:10 }}>{t.securePayment}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
