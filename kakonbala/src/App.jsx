import { useState, useEffect, useRef } from "react";
import {
  collection, onSnapshot, doc, updateDoc, addDoc,
  increment, serverTimestamp, query, orderBy
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase.js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from "recharts";

/* ── Brand colours (from logo: pink + purple + gold + white) ── */
const C = {
  bg:         "#FDF5FF",
  card:       "#FFFFFF",
  primary:    "#C2185B",   // deep pink
  primaryL:   "#F8BBD9",
  purple:     "#7B1FA2",
  purpleL:    "#E1BEE7",
  gold:       "#F9A825",
  dark:       "#311B3F",
  med:        "#7B5EA7",
  light:      "#B39DCA",
  border:     "#E8C8F0",
  success:    "#2E7D32", successBg: "#E8F5E9",
  warn:       "#E65100", warnBg:    "#FFF3E0",
  danger:     "#C62828", dangerBg:  "#FFEBEE",
  info:       "#1565C0", infoBg:    "#E3F2FD",
};

const GRAD = `linear-gradient(135deg, #D81B60 0%, #7B1FA2 50%, #4A148C 100%)`;
const GRAD2 = `linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 100%)`;

/* ── Static chart data ── */
const monthlyData = [
  { month: "নভে", revenue: 28400, orders: 18 },
  { month: "ডিসে", revenue: 45200, orders: 31 },
  { month: "জানু", revenue: 32100, orders: 22 },
  { month: "ফেব্রু", revenue: 38700, orders: 26 },
  { month: "মার্চ", revenue: 41300, orders: 29 },
  { month: "এপ্রি", revenue: 52800, orders: 37 },
];
const catRevData = [
  { name: "গহনা",  value: 68000 },
  { name: "ক্রাফট", value: 54000 },
  { name: "পোশাক", value: 62000 },
];
const PIE_COLORS = ["#C2185B", "#7B1FA2", "#F9A825"];

/* ── Micro styles ── */
const catBadge = (cat) => ({
  display: "inline-block", fontSize: 10, padding: "2px 8px",
  borderRadius: 10, fontWeight: 700, textTransform: "uppercase",
  letterSpacing: 0.5, marginBottom: 4,
  background: cat === "jewelry" ? "#FCE4EC" : cat === "crafts" ? "#F3E5F5" : "#EDE7F6",
  color:      cat === "jewelry" ? "#C2185B" : cat === "crafts" ? "#7B1FA2" : "#4527A0",
});
const statusBadge = (s) => ({
  display: "inline-block", fontSize: 11, padding: "3px 10px",
  borderRadius: 10, fontWeight: 600,
  background: s==="paid"||s==="delivered" ? C.successBg : s==="shipped" ? C.infoBg : s==="pending_payment" ? C.dangerBg : C.warnBg,
  color:      s==="paid"||s==="delivered" ? C.success   : s==="shipped" ? C.info   : s==="pending_payment" ? C.danger   : C.warn,
});
const stockTag = (n) => ({
  fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600,
  background: n<=5 ? C.dangerBg : C.successBg,
  color:      n<=5 ? C.danger   : C.success,
});
const btn  = { background: GRAD, color: "#FFF", border: "none", padding: "10px 22px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", boxShadow: "0 2px 8px rgba(194,24,91,0.3)" };
const inp  = { width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 13, fontFamily: "inherit", background: "#FFF", color: C.dark, boxSizing: "border-box", marginTop: 2 };
const TH   = { textAlign: "left", padding: "10px 14px", background: "#F8EAF6", color: C.purple, fontWeight: 700, borderBottom: `1px solid ${C.border}`, fontSize: 12 };
const TD   = { padding: "10px 14px", borderBottom: `1px solid #F8EAF6`, verticalAlign: "middle" };
const qBtn = { width: 30, height: 30, background: "#F8EAF6", border: `1px solid ${C.border}`, borderRadius: 6, cursor: "pointer", fontSize: 14, color: C.purple, display:"inline-flex", alignItems:"center", justifyContent:"center" };
const metCard = (c) => ({ background:"#FFF", borderRadius:14, border:`1px solid ${C.border}`, padding:"16px 20px", borderLeft:`4px solid ${c||C.primary}`, boxShadow:"0 2px 12px rgba(123,31,162,0.07)" });

/* ══════════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════════ */
export default function App() {
  const [tab,       setTab]       = useState("shop");
  const [products,  setProducts]  = useState([]);
  const [orders,    setOrders]    = useState([]);
  const [cart,      setCart]      = useState([]);
  const [catFilter, setCatFilter] = useState("all");
  const [cartOpen,  setCartOpen]  = useState(false);
  const [showForm,  setShowForm]  = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [notif,     setNotif]     = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileRef = useRef();
  const [newP, setNewP] = useState({ name:"", category:"jewelry", price:"", stock:"", desc:"", imageUrl:"" });
  const [customer, setCustomer]   = useState({ name:"", email:"", phone:"", address:"" });

  /* ── Firebase listeners ── */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) =>
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, []);

  /* ── Derived ── */
  const cartCount  = cart.reduce((s,i) => s+i.qty, 0);
  const cartTotal  = cart.reduce((s,i) => s+i.product.price*i.qty, 0);
  const lowStock   = products.filter(p => p.stock <= 5);
  const totalStock = products.reduce((s,p) => s+p.stock, 0);
  const totalRev   = monthlyData.reduce((s,m) => s+m.revenue, 0);
  const visible    = catFilter==="all" ? products : products.filter(p=>p.category===catFilter);

  function notify(msg){ setNotif(msg); setTimeout(()=>setNotif(null),3000); }

  function addToCart(product){
    if(product.stock===0) return;
    setCart(prev=>{
      const ex=prev.find(i=>i.product.id===product.id);
      if(ex) return prev.map(i=>i.product.id===product.id?{...i,qty:i.qty+1}:i);
      return [...prev,{product,qty:1}];
    });
    notify(`✓ ${product.name} কার্টে যোগ হয়েছে!`);
  }
  function adjustCart(id,delta){
    setCart(prev=>prev.map(i=>i.product.id===id?{...i,qty:i.qty+delta}:i).filter(i=>i.qty>0));
  }

  /* ── Photo upload to Firebase Storage ── */
  async function handlePhotoChange(e){
    const file = e.target.files[0];
    if(!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setNewP(p=>({...p, imageUrl: url}));
      notify("✓ ছবি আপলোড হয়েছে!");
    } catch(err){
      notify("⚠ ছবি আপলোড ব্যর্থ: "+err.message);
    }
    setUploading(false);
  }

  /* ── Add product ── */
  async function addProduct(){
    if(!newP.name||!newP.price||!newP.stock) return notify("⚠ সব তারকা চিহ্নিত তথ্য দিন");
    const catEmoji = { jewelry:"💍", crafts:"🏺", clothing:"👗" };
    await addDoc(collection(db,"products"),{
      name:newP.name, category:newP.category,
      price:Number(newP.price), stock:Number(newP.stock),
      desc:newP.desc, emoji:catEmoji[newP.category],
      imageUrl: newP.imageUrl || "",
    });
    setNewP({name:"",category:"jewelry",price:"",stock:"",desc:"",imageUrl:""});
    setPreviewUrl(null);
    setShowForm(false);
    notify("✓ পণ্য যোগ হয়েছে!");
  }

  async function adjustStock(id,delta){
    await updateDoc(doc(db,"products",id),{stock:increment(delta)});
  }

  /* ── SSLCommerz checkout ── */
  async function handleCheckout(){
    if(!customer.name||!customer.phone){ notify("⚠ নাম ও ফোন নম্বর দিন"); return; }
    setPayLoading(true);
    try{
      const orderRef = await addDoc(collection(db,"orders"),{
        customer, items:cart.map(i=>({id:i.product.id,name:i.product.name,qty:i.qty,price:i.product.price})),
        total:cartTotal, status:"pending_payment", createdAt:serverTimestamp(),
      });
      const res = await fetch("/api/initiate-payment",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ orderId:orderRef.id, amount:cartTotal,
          customerName:customer.name, customerEmail:customer.email||"noemail@kakonbala.com",
          customerPhone:customer.phone, customerAddress:customer.address||"Dhaka, Bangladesh" }),
      });
      const data = await res.json();
      if(data.url){ window.location.href=data.url; }
      else{ notify("⚠ পেমেন্ট শুরু হয়নি: "+(data.error||"unknown")); setPayLoading(false); }
    }catch(err){ notify("⚠ "+err.message); setPayLoading(false); }
  }

  /* ── NAV TABS ── */
  const tabs = [["shop","🛍 Shop"],["dashboard","📊 Dashboard"],["inventory","📦 Inventory"],["orders","📋 Orders"]];

  return (
    <div style={{fontFamily:"'Segoe UI', Arial, sans-serif", background:C.bg, minHeight:"100vh", color:C.dark}}>

      {/* ══ HEADER ══ */}
      <header style={{background:GRAD, color:"#FFF", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:72, position:"sticky", top:0, zIndex:50, boxShadow:"0 4px 20px rgba(123,31,162,0.4)"}}>
        {/* Logo + name */}
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <img src="/logo.jpg" alt="কাঁকনবালা" style={{width:52, height:52, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.6)", objectFit:"cover"}} />
          <div>
            <div style={{fontSize:22, fontWeight:800, letterSpacing:1, textShadow:"0 1px 4px rgba(0,0,0,0.3)"}}>কাঁকনবালা</div>
            <div style={{fontSize:10, opacity:0.85, letterSpacing:2, textTransform:"uppercase"}}>Handmade Jewelry, Crafts & Clothing</div>
          </div>
        </div>
        {/* Nav */}
        <nav style={{display:"flex", gap:4}}>
          {tabs.map(([key,label])=>(
            <button key={key} onClick={()=>setTab(key)} style={{
              background: tab===key ? "rgba(255,255,255,0.25)" : "transparent",
              color:"#FFF", border: tab===key ? "1px solid rgba(255,255,255,0.5)" : "1px solid transparent",
              padding:"7px 16px", borderRadius:20, cursor:"pointer", fontSize:13,
              fontFamily:"inherit", fontWeight: tab===key ? 700 : 400, transition:"all 0.2s"
            }}>{label}</button>
          ))}
        </nav>
        {/* Cart */}
        <button onClick={()=>setCartOpen(true)} style={{...btn, background:"rgba(255,255,255,0.2)", border:"1.5px solid rgba(255,255,255,0.5)", boxShadow:"none", display:"flex", alignItems:"center", gap:8}}>
          🛒 Cart {cartCount>0 && <span style={{background:C.gold, color:C.dark, borderRadius:10, padding:"1px 7px", fontSize:11, fontWeight:800}}>{cartCount}</span>}
        </button>
      </header>

      {/* ══ TOAST ══ */}
      {notif && (
        <div style={{position:"fixed", top:82, right:24, background:GRAD, color:"#FFF", padding:"12px 22px", borderRadius:12, zIndex:300, fontSize:13, boxShadow:"0 4px 20px rgba(123,31,162,0.4)", fontWeight:600}}>
          {notif}
        </div>
      )}

      <main style={{padding:"28px 32px", maxWidth:1140, margin:"0 auto"}}>

        {/* ══════════ SHOP ══════════ */}
        {tab==="shop" && (
          <div>
            {/* Hero banner */}
            <div style={{background:GRAD2, borderRadius:20, padding:"28px 32px", marginBottom:28, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:24}}>
              <img src="/logo.jpg" alt="logo" style={{width:90, height:90, borderRadius:"50%", border:`3px solid ${C.primary}`, objectFit:"cover", flexShrink:0}} />
              <div>
                <h1 style={{fontSize:28, fontWeight:800, margin:0, background:GRAD, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>স্বাগতম কাঁকনবালায়!</h1>
                <p style={{color:C.med, fontSize:14, margin:"6px 0 0"}}>প্রতিটি পণ্য হাতে তৈরি, ভালোবাসায় মোড়ানো 🌸 · {products.length}টি পণ্য</p>
              </div>
            </div>

            {/* Category filter */}
            <div style={{display:"flex", gap:8, marginBottom:22, flexWrap:"wrap"}}>
              {[["all","✨ সব পণ্য"],["jewelry","💍 গহনা"],["crafts","🏺 ক্রাফট"],["clothing","👗 পোশাক"]].map(([key,label])=>(
                <button key={key} onClick={()=>setCatFilter(key)} style={{
                  background: catFilter===key ? GRAD : "#FFF",
                  color: catFilter===key ? "#FFF" : C.purple,
                  border:`1.5px solid ${catFilter===key ? "transparent" : C.border}`,
                  padding:"7px 20px", borderRadius:20, cursor:"pointer", fontSize:13,
                  fontFamily:"inherit", fontWeight:600, transition:"all 0.2s",
                  boxShadow: catFilter===key ? "0 2px 10px rgba(194,24,91,0.3)" : "none"
                }}>{label}</button>
              ))}
            </div>

            {products.length===0 && (
              <div style={{textAlign:"center", padding:"60px 0", color:C.light}}>
                <div style={{fontSize:50, marginBottom:12}}>🌸</div>
                <div style={{fontSize:15}}>পণ্য লোড হচ্ছে...</div>
              </div>
            )}

            {/* Product grid */}
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", gap:20}}>
              {visible.map(p=>(
                <div key={p.id} style={{background:"#FFF", borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden", boxShadow:"0 4px 16px rgba(123,31,162,0.08)", transition:"transform 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  {/* Product image */}
                  <div style={{height:160, background:GRAD2, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative"}}>
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} style={{width:"100%", height:"100%", objectFit:"cover"}} />
                      : <span style={{fontSize:60}}>{p.emoji}</span>
                    }
                    <span style={{position:"absolute", top:8, left:8, ...catBadge(p.category)}}>{p.category}</span>
                  </div>
                  <div style={{padding:"14px 16px"}}>
                    <div style={{fontSize:14, fontWeight:700, color:C.dark, marginBottom:4}}>{p.name}</div>
                    <div style={{fontSize:11, color:C.light, lineHeight:1.5, marginBottom:10, minHeight:32}}>{p.desc}</div>
                    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10}}>
                      <span style={{fontSize:18, fontWeight:800, background:GRAD, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>৳{p.price.toLocaleString()}</span>
                      <span style={stockTag(p.stock)}>{p.stock<=5?`⚠ ${p.stock} বাকি`:`${p.stock} স্টকে`}</span>
                    </div>
                    <button onClick={()=>addToCart(p)} disabled={p.stock===0}
                      style={{...btn, width:"100%", padding:"10px", opacity:p.stock===0?0.45:1, cursor:p.stock===0?"not-allowed":"pointer"}}>
                      {p.stock===0?"স্টক নেই":"🛒 কার্টে যোগ করুন"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ DASHBOARD ══════════ */}
        {tab==="dashboard" && (
          <div>
            <h1 style={{fontSize:24, fontWeight:800, margin:"0 0 22px", background:GRAD, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>📊 ব্যবসার সারসংক্ষেপ</h1>
            <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22}}>
              {[
                {label:"মোট আয়",       value:`৳${(totalRev/1000).toFixed(0)}K`, sub:"↑ গত মাসের চেয়ে ১২%", c:C.primary},
                {label:"অর্ডার",        value:orders.length,                     sub:"ডেটাবেস থেকে লাইভ",  c:C.purple},
                {label:"পণ্যের সংখ্যা", value:products.length,                   sub:`${lowStock.length}টি কম স্টকে`, c:C.gold},
                {label:"মোট স্টক",      value:totalStock,                        sub:"সব পণ্যের মোট",      c:"#2E7D32"},
              ].map((m,i)=>(
                <div key={i} style={metCard(m.c)}>
                  <div style={{fontSize:11, color:C.light, textTransform:"uppercase", letterSpacing:1, marginBottom:4}}>{m.label}</div>
                  <div style={{fontSize:24, fontWeight:800, color:C.dark}}>{m.value}</div>
                  <div style={{fontSize:11, color:C.success, marginTop:3}}>{m.sub}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:18, marginBottom:18}}>
              <div style={{background:"#FFF", borderRadius:14, border:`1px solid ${C.border}`, padding:20}}>
                <div style={{fontSize:14, fontWeight:700, marginBottom:14, color:C.purple}}>মাসিক আয় (৳)</div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={monthlyData} margin={{top:4,right:4,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F8EAF6" vertical={false} />
                    <XAxis dataKey="month" tick={{fontSize:12,fill:C.light}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize:11,fill:C.light}} axisLine={false} tickLine={false} tickFormatter={v=>`৳${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={v=>[`৳${v.toLocaleString()}`,"আয়"]} contentStyle={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}} />
                    <Bar dataKey="revenue" fill="url(#grad)" radius={[6,6,0,0]} />
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D81B60"/>
                        <stop offset="100%" stopColor="#7B1FA2"/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{background:"#FFF", borderRadius:14, border:`1px solid ${C.border}`, padding:20}}>
                <div style={{fontSize:14, fontWeight:700, marginBottom:10, color:C.purple}}>ক্যাটাগরি অনুযায়ী আয়</div>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={catRevData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={3}>
                      {catRevData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}
                    </Pie>
                    <Tooltip formatter={v=>[`৳${v.toLocaleString()}`,""]} contentStyle={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}} />
                  </PieChart>
                </ResponsiveContainer>
                {catRevData.map((item,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,marginTop:6}}>
                    <span style={{width:10,height:10,borderRadius:2,background:PIE_COLORS[i],flexShrink:0}}/>
                    <span style={{color:C.med}}>{item.name}</span>
                    <span style={{marginLeft:"auto",fontWeight:700}}>৳{(item.value/1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"#FFF", borderRadius:14, border:`1px solid ${C.border}`, padding:20, marginBottom:18}}>
              <div style={{fontSize:14, fontWeight:700, marginBottom:14, color:C.purple}}>মাসিক অর্ডার ট্রেন্ড</div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={monthlyData} margin={{top:4,right:4,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F8EAF6" vertical={false}/>
                  <XAxis dataKey="month" tick={{fontSize:12,fill:C.light}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:C.light}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}}/>
                  <Line type="monotone" dataKey="orders" stroke={C.primary} strokeWidth={3} dot={{fill:C.primary,r:5}} activeDot={{r:7}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
            {lowStock.length>0 && (
              <div style={{background:C.warnBg, borderRadius:12, border:"1px solid #FFCC80", padding:16}}>
                <div style={{fontSize:13,fontWeight:700,color:C.warn,marginBottom:8}}>⚠ কম স্টক — দ্রুত রিস্টক করুন</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {lowStock.map(p=>(
                    <span key={p.id} style={{background:"#FFF",border:"1px solid #FFCC80",borderRadius:8,padding:"4px 12px",fontSize:12,color:C.warn}}>
                      {p.emoji} {p.name} — <b>{p.stock}</b>টি বাকি
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════ INVENTORY ══════════ */}
        {tab==="inventory" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <h1 style={{fontSize:24,fontWeight:800,margin:0,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>📦 স্টক ম্যানেজমেন্ট</h1>
                <p style={{color:C.light,fontSize:13,margin:"3px 0 0"}}>সব পরিবর্তন Firestore-এ সাথে সাথে সেভ হয়</p>
              </div>
              <button onClick={()=>setShowForm(f=>!f)} style={{...btn}}>
                {showForm?"✕ বাতিল":"+ নতুন পণ্য যোগ করুন"}
              </button>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
              {[["মোট পণ্য",products.length,C.primary],["মোট স্টক ইউনিট",totalStock,C.purple],["কম স্টক পণ্য",lowStock.length,C.danger]].map(([l,v,c])=>(
                <div key={l} style={metCard(c)}>
                  <div style={{fontSize:11,color:C.light,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{l}</div>
                  <div style={{fontSize:26,fontWeight:800,color:C.dark}}>{v}</div>
                </div>
              ))}
            </div>

            {/* Add product form */}
            {showForm && (
              <div style={{background:"#FFF",borderRadius:16,border:`1.5px solid ${C.border}`,padding:24,marginBottom:20,boxShadow:"0 4px 20px rgba(123,31,162,0.1)"}}>
                <div style={{fontSize:16,fontWeight:800,marginBottom:16,color:C.purple}}>🌸 নতুন পণ্যের তথ্য</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  {[["পণ্যের নাম *","name","text","যেমন: সিল্ক চুড়ি"],["মূল্য (৳) *","price","number","যেমন: 400"],["স্টক পরিমাণ *","stock","number","যেমন: 10"]].map(([l,k,t,ph])=>(
                    <div key={k}>
                      <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:2}}>{l}</label>
                      <input style={inp} type={t} placeholder={ph} value={newP[k]} onChange={e=>setNewP(p=>({...p,[k]:e.target.value}))}/>
                    </div>
                  ))}
                  <div>
                    <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:2}}>ক্যাটাগরি *</label>
                    <select style={inp} value={newP.category} onChange={e=>setNewP(p=>({...p,category:e.target.value}))}>
                      <option value="jewelry">💍 গহনা (Jewelry)</option>
                      <option value="crafts">🏺 ক্রাফট (Crafts)</option>
                      <option value="clothing">👗 পোশাক (Clothing)</option>
                    </select>
                  </div>
                  <div style={{gridColumn:"span 2"}}>
                    <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:2}}>বিবরণ</label>
                    <input style={inp} placeholder="পণ্যের ছোট বিবরণ লিখুন" value={newP.desc} onChange={e=>setNewP(p=>({...p,desc:e.target.value}))}/>
                  </div>
                  {/* Photo upload */}
                  <div style={{gridColumn:"span 2"}}>
                    <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:6}}>📸 পণ্যের ছবি</label>
                    <div style={{display:"flex",alignItems:"center",gap:16}}>
                      <input type="file" accept="image/*" ref={fileRef} style={{display:"none"}} onChange={handlePhotoChange}/>
                      <button type="button" onClick={()=>fileRef.current.click()} style={{...btn,padding:"8px 20px",fontSize:12}}>
                        {uploading?"আপলোড হচ্ছে...":"📁 ছবি বেছে নিন"}
                      </button>
                      {previewUrl && <img src={previewUrl} alt="preview" style={{width:60,height:60,objectFit:"cover",borderRadius:10,border:`2px solid ${C.border}`}}/>}
                      {newP.imageUrl && !uploading && <span style={{fontSize:11,color:C.success,fontWeight:600}}>✓ ছবি প্রস্তুত</span>}
                    </div>
                    <div style={{fontSize:11,color:C.light,marginTop:4}}>JPG, PNG — সর্বোচ্চ ৫MB</div>
                  </div>
                </div>
                <button style={{...btn,marginTop:16}} onClick={addProduct} disabled={uploading}>
                  {uploading?"অপেক্ষা করুন...":"✓ ডেটাবেসে সেভ করুন"}
                </button>
              </div>
            )}

            <div style={{background:"#FFF",borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr>{["পণ্য","ক্যাটাগরি","মূল্য","স্টক","অবস্থা","স্টক পরিবর্তন"].map(h=><th key={h} style={TH}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {products.map(p=>(
                    <tr key={p.id} style={{background:p.stock===0?"#FFF5F5":"#FFF"}}>
                      <td style={TD}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          {p.imageUrl
                            ? <img src={p.imageUrl} alt={p.name} style={{width:44,height:44,borderRadius:8,objectFit:"cover",border:`1px solid ${C.border}`}}/>
                            : <span style={{fontSize:28,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",background:GRAD2,borderRadius:8}}>{p.emoji}</span>
                          }
                          <div>
                            <div style={{fontWeight:700,color:C.dark}}>{p.name}</div>
                            <div style={{fontSize:11,color:C.light}}>{(p.desc||"").slice(0,40)}{(p.desc||"").length>40?"…":""}</div>
                          </div>
                        </div>
                      </td>
                      <td style={TD}><span style={catBadge(p.category)}>{p.category}</span></td>
                      <td style={{...TD,fontWeight:700,color:C.primary}}>৳{p.price.toLocaleString()}</td>
                      <td style={{...TD,fontWeight:800,fontSize:16,color:p.stock<=5?C.danger:C.dark}}>{p.stock}</td>
                      <td style={TD}>
                        <span style={{display:"inline-block",fontSize:11,padding:"3px 10px",borderRadius:8,fontWeight:700,
                          background:p.stock===0?C.dangerBg:p.stock<=5?C.warnBg:C.successBg,
                          color:p.stock===0?C.danger:p.stock<=5?C.warn:C.success}}>
                          {p.stock===0?"স্টক নেই":p.stock<=5?"কম স্টক":"স্টকে আছে"}
                        </span>
                      </td>
                      <td style={TD}>
                        <div style={{display:"flex",gap:6}}>
                          <button style={qBtn} onClick={()=>adjustStock(p.id,-1)}>−</button>
                          <button style={qBtn} onClick={()=>adjustStock(p.id,5)}>+5</button>
                          <button style={qBtn} onClick={()=>adjustStock(p.id,10)}>+10</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════ ORDERS ══════════ */}
        {tab==="orders" && (
          <div>
            <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 8px",background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>📋 অর্ডার হিস্ট্রি</h1>
            <p style={{color:C.light,fontSize:13,marginBottom:22}}>{orders.length}টি অর্ডার · Firestore থেকে লাইভ</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
              {[["paid","পেইড",C.success,C.successBg],["processing","প্রক্রিয়াধীন",C.warn,C.warnBg],["shipped","পাঠানো হয়েছে",C.info,C.infoBg],["pending_payment","পেমেন্ট বাকি",C.danger,C.dangerBg]].map(([s,l,c,bg])=>(
                <div key={s} style={{background:bg,borderRadius:12,padding:"14px 18px",textAlign:"center",border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:26,fontWeight:800,color:c}}>{orders.filter(o=>o.status===s).length}</div>
                  <div style={{fontSize:12,color:c,marginTop:3,fontWeight:600}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{background:"#FFF",borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",marginBottom:18}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr>{["অর্ডার ID","তারিখ","কাস্টমার","ফোন","পণ্য","মোট","অবস্থা"].map(h=><th key={h} style={TH}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {orders.length===0 && <tr><td colSpan={7} style={{...TD,textAlign:"center",color:C.light,padding:40}}>এখনো কোনো অর্ডার নেই</td></tr>}
                  {orders.map(o=>(
                    <tr key={o.id}>
                      <td style={{...TD,fontWeight:600,color:C.primary,fontFamily:"monospace",fontSize:11}}>{o.id?.slice(0,8)}…</td>
                      <td style={{...TD,color:C.med,fontSize:12}}>{o.createdAt?.seconds?new Date(o.createdAt.seconds*1000).toLocaleDateString("bn-BD"):"—"}</td>
                      <td style={{...TD,fontWeight:600}}>{o.customer?.name||"—"}</td>
                      <td style={{...TD,fontSize:12,color:C.med}}>{o.customer?.phone||"—"}</td>
                      <td style={{...TD,color:C.med,fontSize:12}}>{(o.items||[]).slice(0,2).map(i=>i.name).join(", ")}{(o.items||[]).length>2?` +${o.items.length-2}`:""}</td>
                      <td style={{...TD,fontWeight:800,color:C.primary}}>৳{(o.total||0).toLocaleString()}</td>
                      <td style={TD}><span style={statusBadge(o.status)}>{o.status?.replace("_"," ")}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{background:"#FFF",borderRadius:12,border:`1px solid ${C.border}`,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:C.med,fontSize:14}}>মোট আয় (সব অর্ডার)</span>
              <span style={{fontSize:22,fontWeight:800,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>৳{orders.reduce((s,o)=>s+(o.total||0),0).toLocaleString()}</span>
            </div>
          </div>
        )}
      </main>

      {/* ══ CART DRAWER ══ */}
      {cartOpen && (
        <>
          <div onClick={()=>setCartOpen(false)} style={{position:"fixed",inset:0,background:"rgba(49,27,63,0.5)",zIndex:100}}/>
          <div style={{position:"fixed",right:0,top:0,bottom:0,width:390,background:"#FFF",zIndex:101,overflowY:"auto",borderLeft:`2px solid ${C.border}`,boxShadow:"-8px 0 40px rgba(123,31,162,0.2)"}}>
            <div style={{background:GRAD,padding:"18px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{color:"#FFF",fontSize:16,fontWeight:800}}>🛒 আপনার কার্ট</div>
              <button onClick={()=>setCartOpen(false)} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#FFF",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div style={{padding:20}}>
              {cart.length===0?(
                <div style={{textAlign:"center",color:C.light,padding:"50px 0"}}>
                  <div style={{fontSize:50,marginBottom:12}}>🌸</div>
                  <div style={{fontSize:14}}>কার্ট খালি আছে</div>
                </div>
              ):(
                <>
                  {cart.map(item=>(
                    <div key={item.product.id} style={{display:"flex",gap:12,paddingBottom:16,marginBottom:16,borderBottom:`1px solid ${C.border}`}}>
                      <div style={{width:56,height:56,borderRadius:10,overflow:"hidden",flexShrink:0,border:`1px solid ${C.border}`}}>
                        {item.product.imageUrl
                          ?<img src={item.product.imageUrl} alt={item.product.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          :<div style={{width:"100%",height:"100%",background:GRAD2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{item.product.emoji}</div>
                        }
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.dark}}>{item.product.name}</div>
                        <div style={{fontSize:13,fontWeight:800,color:C.primary,marginTop:2}}>৳{item.product.price.toLocaleString()}</div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:7}}>
                          <button style={qBtn} onClick={()=>adjustCart(item.product.id,-1)}>−</button>
                          <span style={{fontSize:14,fontWeight:800,minWidth:20,textAlign:"center"}}>{item.qty}</span>
                          <button style={qBtn} onClick={()=>adjustCart(item.product.id,1)}>+</button>
                        </div>
                      </div>
                      <div style={{fontSize:13,fontWeight:800,color:C.dark}}>৳{(item.product.price*item.qty).toLocaleString()}</div>
                    </div>
                  ))}
                  <div style={{paddingTop:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0",borderTop:`2px solid ${C.border}`,margin:"8px 0 16px"}}>
                      <span style={{fontWeight:800,fontSize:16}}>মোট</span>
                      <span style={{fontWeight:800,fontSize:20,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>৳{cartTotal.toLocaleString()}</span>
                    </div>
                    <button onClick={()=>{setCartOpen(false);setCheckoutModal(true);}} style={{...btn,width:"100%",padding:"13px",fontSize:15}}>
                      অর্ডার করুন →
                    </button>
                    <div style={{fontSize:11,color:C.light,textAlign:"center",marginTop:10}}>
                      🔒 SSLCommerz · bKash · Nagad · Visa · MasterCard
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ══ CHECKOUT MODAL ══ */}
      {checkoutModal && (
        <>
          <div onClick={()=>setCheckoutModal(false)} style={{position:"fixed",inset:0,background:"rgba(49,27,63,0.6)",zIndex:200}}/>
          <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:430,background:"#FFF",borderRadius:20,overflow:"hidden",zIndex:201,boxShadow:"0 20px 60px rgba(123,31,162,0.3)"}}>
            <div style={{background:GRAD,padding:"20px 28px"}}>
              <div style={{color:"#FFF",fontSize:17,fontWeight:800}}>🌸 অর্ডার সম্পন্ন করুন</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",marginTop:4}}>SSLCommerz-এ নিরাপদ পেমেন্ট করুন</div>
            </div>
            <div style={{padding:24}}>
              {[["পুরো নাম *","name","text","আপনার নাম"],["ফোন নম্বর *","phone","tel","01711-000000"],["ইমেইল","email","email","আপনার ইমেইল"],["ডেলিভারি ঠিকানা","address","text","বাড়ি, রাস্তা, শহর"]].map(([l,k,t,ph])=>(
                <div key={k} style={{marginBottom:12}}>
                  <label style={{fontSize:12,color:C.med,fontWeight:700}}>{l}</label>
                  <input style={inp} type={t} placeholder={ph} value={customer[k]} onChange={e=>setCustomer(c=>({...c,[k]:e.target.value}))}/>
                </div>
              ))}
              <div style={{background:GRAD2,borderRadius:10,padding:"12px 16px",marginBottom:18,fontSize:13}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{color:C.med}}>{cartCount}টি পণ্য</span>
                  <span style={{fontWeight:700}}>৳{cartTotal.toLocaleString()}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:C.med}}>ডেলিভারি</span>
                  <span style={{color:C.success,fontWeight:700}}>বিনামূল্যে 💝</span>
                </div>
              </div>
              <button onClick={handleCheckout} disabled={payLoading} style={{...btn,width:"100%",padding:"13px",fontSize:15,opacity:payLoading?0.7:1}}>
                {payLoading?"পেমেন্ট পেজে যাচ্ছে...":`৳${cartTotal.toLocaleString()} পেমেন্ট করুন`}
              </button>
              <div style={{fontSize:11,color:C.light,textAlign:"center",marginTop:10}}>
                bKash · Nagad · Visa · MasterCard · DBBL Nexus
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
