import { useState, useEffect } from "react";
import {
  collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc,
  increment, serverTimestamp, query, orderBy
} from "firebase/firestore";
import { db } from "./firebase.js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from "recharts";

const C = {
  primary:"#AD1457", purple:"#6A1B9A", gold:"#F9A825",
  dark:"#2D0A3F", med:"#7B3F9E", light:"#C39BCE",
  border:"rgba(255,255,255,0.35)",
  success:"#2E7D32", successBg:"rgba(232,245,233,0.85)",
  warn:"#E65100",   warnBg:"rgba(255,243,224,0.85)",
  danger:"#C62828", dangerBg:"rgba(255,235,238,0.85)",
  info:"#1565C0",   infoBg:"rgba(227,242,253,0.85)",
};

const GRAD  = "linear-gradient(135deg,#AD1457 0%,#6A1B9A 60%,#4A148C 100%)";
const GLASS = "rgba(255,255,255,0.55)";
const GLASS2= "rgba(255,255,255,0.75)";
const BLUR  = "blur(12px)";

/* ── Translations ── */
const T = {
  en:{
    shopName:"Kakonbala", tagline:"Handmade Jewelry, Crafts & Clothing",
    welcome:"Welcome to Kakonbala!", welcomeSub:"Every piece handcrafted with tradition and love 🌸",
    allItems:"✨ All Items", jewelry:"💍 Jewelry", crafts:"🏺 Crafts", clothing:"👗 Clothing",
    addCart:"🛒 Add to Cart", outOfStock:"Out of Stock", inStock:"in stock", left:"left",
    shop:"🛍 Shop", dashboard:"📊 Dashboard", inventory:"📦 Inventory", orders:"📋 Orders",
    cart:"🛒 Cart", cartEmpty:"Your cart is empty", proceedCheckout:"Proceed to Checkout →",
    total:"Total", delivery:"Delivery", free:"Free 💝", yourCart:"Your Cart",
    dashTitle:"Business Dashboard", totalRevenue:"Total Revenue", allOrders:"All Orders",
    products:"Products", totalStock:"Total Stock", lowStockAlert:"⚠ Low Stock — restock soon",
    monthlyRev:"Monthly Revenue (৳)", catRevenue:"Revenue by Category", orderTrend:"Monthly Order Trend",
    invTitle:"Stock Inventory", invSub:"All changes sync live to Firestore",
    addProduct:"+ Add Product", cancel:"✕ Cancel", saveDb:"✓ Save to Database",
    productName:"Product Name *", price:"Price (৳) *", stockQty:"Stock Qty *", category:"Category *",
    description:"Description", photo:"📸 Product Photo", choosePhoto:"📁 Choose Photo",
    uploading:"Uploading...", photoReady:"✓ Photo ready", photoHint:"JPG, PNG — max 5MB",
    newProductTitle:"🌸 New Product Details",
    totalProducts:"Total Products", totalStockUnits:"Total Stock Units", lowStockItems:"Low Stock Items",
    ordersTitle:"Order History", ordersLive:"orders · Live",
    paid:"Paid", processing:"Processing", shipped:"Shipped", pendingPay:"Pending Payment",
    orderId:"Order ID", date:"Date", customer:"Customer", phone:"Phone", items:"Items",
    totalRevAll:"Total revenue (all orders)", noOrders:"No orders yet",
    completeOrder:"Complete Your Order", fullName:"Full Name *", phoneNum:"Phone *",
    email:"Email", address:"Delivery Address", payNow:"Pay via SSLCommerz",
    redirecting:"Redirecting...", securePayment:"🔒 bKash · Nagad · Visa · MasterCard",
    adjust:"Adjust", status:"Status", lowStock:"Low Stock", noStock:"Out of Stock", inStockLabel:"In Stock",
    addedToCart:"added to cart!",
  },
  bn:{
    shopName:"কাঁকনবালা", tagline:"হাতে তৈরি গহনা, ক্রাফট ও পোশাক",
    welcome:"কাঁকনবালায় স্বাগতম!", welcomeSub:"প্রতিটি পণ্য হাতে তৈরি, ভালোবাসায় মোড়ানো 🌸",
    allItems:"✨ সব পণ্য", jewelry:"💍 গহনা", crafts:"🏺 ক্রাফট", clothing:"👗 পোশাক",
    addCart:"🛒 কার্টে যোগ করুন", outOfStock:"স্টক নেই", inStock:"স্টকে", left:"বাকি",
    shop:"🛍 শপ", dashboard:"📊 ড্যাশবোর্ড", inventory:"📦 ইনভেন্টরি", orders:"📋 অর্ডার",
    cart:"🛒 কার্ট", cartEmpty:"কার্ট খালি আছে", proceedCheckout:"অর্ডার করুন →",
    total:"মোট", delivery:"ডেলিভারি", free:"বিনামূল্যে 💝", yourCart:"আপনার কার্ট",
    dashTitle:"ব্যবসার সারসংক্ষেপ", totalRevenue:"মোট আয়", allOrders:"অর্ডার",
    products:"পণ্য", totalStock:"মোট স্টক", lowStockAlert:"⚠ কম স্টক — দ্রুত রিস্টক করুন",
    monthlyRev:"মাসিক আয় (৳)", catRevenue:"ক্যাটাগরি অনুযায়ী আয়", orderTrend:"মাসিক অর্ডার ট্রেন্ড",
    invTitle:"স্টক ম্যানেজমেন্ট", invSub:"সব পরিবর্তন Firestore-এ সাথে সাথে সেভ হয়",
    addProduct:"+ নতুন পণ্য যোগ করুন", cancel:"✕ বাতিল", saveDb:"✓ ডেটাবেসে সেভ করুন",
    productName:"পণ্যের নাম *", price:"মূল্য (৳) *", stockQty:"স্টক পরিমাণ *", category:"ক্যাটাগরি *",
    description:"বিবরণ", photo:"📸 পণ্যের ছবি", choosePhoto:"📁 ছবি বেছে নিন",
    uploading:"আপলোড হচ্ছে...", photoReady:"✓ ছবি প্রস্তুত", photoHint:"JPG, PNG — সর্বোচ্চ ৫MB",
    newProductTitle:"🌸 নতুন পণ্যের তথ্য",
    totalProducts:"মোট পণ্য", totalStockUnits:"মোট স্টক ইউনিট", lowStockItems:"কম স্টক পণ্য",
    ordersTitle:"অর্ডার হিস্ট্রি", ordersLive:"টি অর্ডার · লাইভ",
    paid:"পেইড", processing:"প্রক্রিয়াধীন", shipped:"পাঠানো হয়েছে", pendingPay:"পেমেন্ট বাকি",
    orderId:"অর্ডার ID", date:"তারিখ", customer:"কাস্টমার", phone:"ফোন", items:"পণ্য",
    totalRevAll:"মোট আয় (সব অর্ডার)", noOrders:"এখনো কোনো অর্ডার নেই",
    completeOrder:"অর্ডার সম্পন্ন করুন", fullName:"পুরো নাম *", phoneNum:"ফোন নম্বর *",
    email:"ইমেইল", address:"ডেলিভারি ঠিকানা", payNow:"SSLCommerz-এ পেমেন্ট করুন",
    redirecting:"পেমেন্ট পেজে যাচ্ছে...", securePayment:"🔒 bKash · Nagad · Visa · MasterCard",
    adjust:"স্টক পরিবর্তন", status:"অবস্থা", lowStock:"কম স্টক", noStock:"স্টক নেই", inStockLabel:"স্টকে আছে",
    addedToCart:"কার্টে যোগ হয়েছে!",
  }
};

const monthlyData=[
  {month:"Nov",revenue:28400,orders:18},{month:"Dec",revenue:45200,orders:31},
  {month:"Jan",revenue:32100,orders:22},{month:"Feb",revenue:38700,orders:26},
  {month:"Mar",revenue:41300,orders:29},{month:"Apr",revenue:52800,orders:37},
];
const catRevData=[{name:"Jewelry",value:68000},{name:"Crafts",value:54000},{name:"Clothing",value:62000}];
const PIE_COLORS=["#AD1457","#6A1B9A","#F9A825"];

const CATS = {
  jewelry:{
    emoji:"💍", label:"Jewelry / গহনা",
    subs:["Bangles","Earrings","Finger Ring","Payel","Necklace","Nosepin","Waist Band","Hair Accessories"]
  },
  crafts:{
    emoji:"🏺", label:"Crafts / ক্রাফট",
    subs:["Mandala","Canvas Paint","Painted Glass Jar","Wall Hanging","Candle","Clay Art","Other"]
  },
  clothing:{
    emoji:"👗", label:"Clothing / পোশাক",
    groups:{
      "Women":["Saree","Tops","Skirt","Salwar Kameez","Kurti","Lehenga","Other"],
      "Men":["Panjabi","T-Shirt","Shirt","Pant","Fotua","Other"],
      "Child":["Baby Boy","Baby Girl"]
    }
  }
};

const catBadge=(cat)=>({
  display:"inline-block",fontSize:10,padding:"2px 8px",borderRadius:10,fontWeight:700,
  textTransform:"uppercase",letterSpacing:0.5,marginBottom:4,
  background:cat==="jewelry"?"rgba(252,228,236,0.9)":cat==="crafts"?"rgba(243,229,245,0.9)":"rgba(237,231,246,0.9)",
  color:cat==="jewelry"?"#AD1457":cat==="crafts"?"#6A1B9A":"#4527A0",
  backdropFilter:BLUR,
});
const statusBadge=(s)=>({
  display:"inline-block",fontSize:11,padding:"3px 10px",borderRadius:10,fontWeight:600,
  background:s==="paid"||s==="delivered"?C.successBg:s==="shipped"?C.infoBg:s==="pending_payment"?C.dangerBg:C.warnBg,
  color:s==="paid"||s==="delivered"?C.success:s==="shipped"?C.info:s==="pending_payment"?C.danger:C.warn,
});
const stockTag=(n)=>({fontSize:11,padding:"2px 8px",borderRadius:10,fontWeight:700,
  background:n<=5?"rgba(255,235,238,0.9)":"rgba(232,245,233,0.9)",
  color:n<=5?C.danger:C.success,backdropFilter:BLUR,
});
const btn={background:GRAD,color:"#FFF",border:"none",padding:"10px 22px",borderRadius:20,
  cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit",
  boxShadow:"0 4px 15px rgba(173,20,87,0.4)"};
const glassCard={background:GLASS2,backdropFilter:BLUR,WebkitBackdropFilter:BLUR,
  border:"1px solid rgba(255,255,255,0.5)",borderRadius:16,
  boxShadow:"0 8px 32px rgba(106,27,154,0.15)"};
const inp={width:"100%",padding:"9px 12px",
  border:"1.5px solid rgba(173,20,87,0.25)",borderRadius:10,fontSize:13,
  fontFamily:"inherit",background:"rgba(255,255,255,0.8)",
  backdropFilter:BLUR,color:C.dark,boxSizing:"border-box",marginTop:2};
const TH={textAlign:"left",padding:"10px 14px",
  background:"rgba(248,234,246,0.8)",color:C.purple,fontWeight:700,
  borderBottom:"1px solid rgba(255,255,255,0.4)",fontSize:12,backdropFilter:BLUR};
const TD={padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,0.3)",verticalAlign:"middle"};
const qBtn={width:30,height:30,background:"rgba(248,234,246,0.8)",
  border:"1px solid rgba(173,20,87,0.2)",borderRadius:6,cursor:"pointer",
  fontSize:14,color:C.purple,display:"inline-flex",alignItems:"center",justifyContent:"center"};
const metCard=(c)=>({...glassCard,padding:"16px 20px",borderLeft:`4px solid ${c||C.primary}`});


/* ── Tag Input Component ── */
function TagInput({values=[], onChange, placeholder="Type & press Enter"}) {
  const [input, setInput] = useState("");
  function add() {
    const v = input.trim().replace(/,$/,"");
    if(v && !values.includes(v)) onChange([...values, v]);
    setInput("");
  }
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:6,padding:"6px 8px",
      border:"1.5px solid rgba(173,20,87,0.25)",borderRadius:10,
      background:"rgba(255,255,255,0.8)",minHeight:38,alignItems:"center"}}>
      {values.map(v=>(
        <span key={v} style={{background:"rgba(173,20,87,0.1)",color:"#AD1457",
          borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:600,
          display:"flex",alignItems:"center",gap:4}}>
          {v}
          <button onClick={()=>onChange(values.filter(x=>x!==v))}
            style={{background:"none",border:"none",cursor:"pointer",color:"#AD1457",
              fontSize:14,lineHeight:1,padding:0,fontWeight:700}}>×</button>
        </span>
      ))}
      <input value={input} onChange={e=>setInput(e.target.value)}
        onKeyDown={e=>{if(e.key==="Enter"||e.key===","){e.preventDefault();add();}}}
        onBlur={add}
        placeholder={values.length===0?placeholder:""}
        style={{border:"none",outline:"none",background:"transparent",
          fontSize:12,minWidth:80,flex:1}}/>
    </div>
  );
}

/* ── Image Carousel Component ── */
function Carousel({ images=[], emoji="💍", height=180, zoom=false }) {
  const [idx, setIdx] = useState(0);
  const valid = images.filter(Boolean);

  useEffect(() => {
    if (valid.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i+1) % valid.length), 2800);
    return () => clearInterval(t);
  }, [valid.length]);

  if (!valid.length) return (
    <div style={{width:"100%",height,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span style={{fontSize:60}}>{emoji}</span>
    </div>
  );

  return (
    <div style={{position:"relative",width:"100%",height,overflow:"hidden",background:"rgba(255,255,255,0.3)"}}>
      {/* Main image */}
      <img src={valid[idx]} alt="product"
        style={{width:"100%",height:"100%",objectFit:zoom?"contain":"contain",
          padding:4,transition:"opacity 0.4s"}}
        onError={e=>e.target.style.display="none"}/>

      {/* Prev / Next arrows */}
      {valid.length>1&&(
        <>
          <button onClick={e=>{e.stopPropagation();setIdx(i=>(i-1+valid.length)%valid.length);}}
            style={{position:"absolute",left:4,top:"50%",transform:"translateY(-50%)",
              background:"rgba(255,255,255,0.75)",border:"none",borderRadius:"50%",
              width:28,height:28,cursor:"pointer",fontSize:16,fontWeight:700,
              display:"flex",alignItems:"center",justifyContent:"center",
              color:"#AD1457",boxShadow:"0 1px 4px rgba(0,0,0,0.15)"}}>‹</button>
          <button onClick={e=>{e.stopPropagation();setIdx(i=>(i+1)%valid.length);}}
            style={{position:"absolute",right:4,top:"50%",transform:"translateY(-50%)",
              background:"rgba(255,255,255,0.75)",border:"none",borderRadius:"50%",
              width:28,height:28,cursor:"pointer",fontSize:16,fontWeight:700,
              display:"flex",alignItems:"center",justifyContent:"center",
              color:"#AD1457",boxShadow:"0 1px 4px rgba(0,0,0,0.15)"}}>›</button>
        </>
      )}

      {/* Dot indicators */}
      {valid.length>1&&(
        <div style={{position:"absolute",bottom:6,left:"50%",transform:"translateX(-50%)",
          display:"flex",gap:5}}>
          {valid.map((_,i)=>(
            <div key={i} onClick={e=>{e.stopPropagation();setIdx(i);}}
              style={{width:i===idx?16:7,height:7,borderRadius:4,cursor:"pointer",
                background:i===idx?"#AD1457":"rgba(255,255,255,0.7)",
                transition:"all 0.3s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
          ))}
        </div>
      )}

      {/* Photo count badge */}
      {valid.length>1&&(
        <div style={{position:"absolute",top:6,right:6,background:"rgba(173,20,87,0.75)",
          color:"#FFF",borderRadius:10,padding:"1px 8px",fontSize:10,fontWeight:700}}>
          {idx+1}/{valid.length}
        </div>
      )}
    </div>
  );
}

const COLOR_MAP = {
  red:"#E53935",blue:"#1E88E5",green:"#43A047",pink:"#E91E63",
  purple:"#8E24AA",yellow:"#FDD835",orange:"#FB8C00",black:"#212121",
  white:"#F5F5F5",gold:"#F9A825",silver:"#9E9E9E",grey:"#757575",
  gray:"#757575",brown:"#795548",cream:"#FFF8E1",maroon:"#880E4F",
  navy:"#1A237E",teal:"#00796B",mint:"#B2EBF2",lavender:"#EDE7F6",
  peach:"#FFCCBC",rose:"#FCE4EC",beige:"#F5F5DC",
};


export default function App() {
  const [lang,setLang]=useState("bn");
  const [tab,setTab]=useState("shop");
  const [products,setProducts]=useState([]);
  const [orders,setOrders]=useState([]);
  const [cart,setCart]=useState([]);
  const [catFilter,setCatFilter]=useState("all");
  const [subFilter,setSubFilter]=useState("all");
  const [clothingGroup,setClothingGroup]=useState("all");
  const [cartOpen,setCartOpen]=useState(false);
  const [showForm,setShowForm]=useState(false);
  const [editProduct,setEditProduct]=useState(null);

  // Reset selections when product detail opens
  useEffect(()=>{
    if(selectedProduct){
      setSelSize(selectedProduct.sizes?.[0]||"");
      setSelColor(selectedProduct.colors?.[0]||"");
      setSelPiece(selectedProduct.pieceCounts?.[0]||"");
    }
  },[selectedProduct?.id]);
  const [selectedProduct,setSelectedProduct]=useState(null);
  const [zoom,setZoom]=useState(1);
  const [selSize,setSelSize]=useState("");
  const [selColor,setSelColor]=useState("");
  const [selPiece,setSelPiece]=useState("");
  const [checkoutModal,setCheckoutModal]=useState(false);
  const [payLoading,setPayLoading]=useState(false);
  const [notif,setNotif]=useState(null);
  const [newP,setNewP]=useState({name:"",category:"jewelry",price:"",stock:"",desc:"",imageUrl:"",imageUrls:[""],subcategory:"",clothingGroup:"",sizes:[],colors:[],pieceCounts:[]});
  const [customer,setCustomer]=useState({name:"",email:"",phone:"",address:""});
  const t=T[lang];

  useEffect(()=>{
    const unsub=onSnapshot(collection(db,"products"),(snap)=>
      setProducts(snap.docs.map(d=>({id:d.id,...d.data()})))
    );
    return unsub;
  },[]);

  useEffect(()=>{
    const q=query(collection(db,"orders"),orderBy("createdAt","desc"));
    const unsub=onSnapshot(q,(snap)=>
      setOrders(snap.docs.map(d=>({id:d.id,...d.data()})))
    );
    return unsub;
  },[]);

  const cartCount=cart.reduce((s,i)=>s+i.qty,0);
  const cartTotal=cart.reduce((s,i)=>s+i.product.price*i.qty,0);
  const lowStock=products.filter(p=>p.stock<=5);
  const totalStock=products.reduce((s,p)=>s+p.stock,0);
  const totalRev=monthlyData.reduce((s,m)=>s+m.revenue,0);
  const visible=products.filter(p=>{
    if(catFilter!=="all" && p.category!==catFilter) return false;
    if(catFilter==="clothing"){
      if(clothingGroup!=="all" && p.clothingGroup!==clothingGroup) return false;
    }
    if(subFilter!=="all" && p.subcategory!==subFilter) return false;
    return true;
  });

  function notify(msg){setNotif(msg);setTimeout(()=>setNotif(null),3000);}

  function addToCart(product, opts={}){
    if(product.stock===0)return;
    const cKey=`${product.id}_${opts.size||""}_${opts.color||""}_${opts.piece||""}`;
    setCart(prev=>{
      const ex=prev.find(i=>i.cKey===cKey);
      if(ex)return prev.map(i=>i.cKey===cKey?{...i,qty:i.qty+1}:i);
      return [...prev,{product,qty:1,cKey,...opts}];
    });
    const optStr=[opts.size,opts.color,opts.piece].filter(Boolean).join(" · ");
    notify(`✓ ${product.name}${optStr?" ("+optStr+")":""} ${t.addedToCart}`);
  }
  function adjustCart(cKey,delta){
    setCart(prev=>prev.map(i=>i.cKey===cKey?{...i,qty:i.qty+delta}:i).filter(i=>i.qty>0));
  }



  async function addProduct(){
    if(!newP.name||!newP.price||!newP.stock)return notify("⚠ Fill all required fields");
    const catEmoji={jewelry:"💍",crafts:"🏺",clothing:"👗"};
    const validUrls = (newP.imageUrls||[]).filter(Boolean);
    await addDoc(collection(db,"products"),{
      name:newP.name,category:newP.category,
      subcategory:newP.subcategory||"",
      clothingGroup:newP.clothingGroup||"",
      price:Number(newP.price),stock:Number(newP.stock),
      desc:newP.desc,emoji:catEmoji[newP.category],
      imageUrl:validUrls[0]||"",
      imageUrls:validUrls,
      sizes:newP.sizes||[],
      colors:newP.colors||[],
      pieceCounts:newP.pieceCounts||[],
    });
    setNewP({name:"",category:"jewelry",price:"",stock:"",desc:"",imageUrl:"",imageUrls:[""],subcategory:"",clothingGroup:"",sizes:[],colors:[],pieceCounts:[]});
    setPreviewUrl(null);setShowForm(false);
    notify("✓ Product added!");
  }

  async function adjustStock(id,delta){
    await updateDoc(doc(db,"products",id),{stock:increment(delta)});
  }

  async function deleteProduct(id,name){
    if(!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await deleteDoc(doc(db,"products",id));
    notify("✓ Product deleted!");
  }

  async function saveEdit(){
    if(!editProduct.name||!editProduct.price||!editProduct.stock) return notify("⚠ Fill all required fields");
    const eValidUrls = (editProduct.imageUrls||[editProduct.imageUrl]).filter(Boolean);
    await updateDoc(doc(db,"products",editProduct.id),{
      name:editProduct.name, category:editProduct.category,
      subcategory:editProduct.subcategory||"",
      clothingGroup:editProduct.clothingGroup||"",
      price:Number(editProduct.price), stock:Number(editProduct.stock),
      desc:editProduct.desc,
      imageUrl:eValidUrls[0]||"",
      imageUrls:eValidUrls,
      sizes:editProduct.sizes||[],
      colors:editProduct.colors||[],
      pieceCounts:editProduct.pieceCounts||[],
    });
    setEditProduct(null);
    notify("✓ Product updated!");
  }

  async function handleCheckout(){
    if(!customer.name||!customer.phone){notify("⚠ Enter name and phone");return;}
    setPayLoading(true);
    try{
      const orderRef=await addDoc(collection(db,"orders"),{
        customer,items:cart.map(i=>({id:i.product.id,name:i.product.name,qty:i.qty,price:i.product.price})),
        total:cartTotal,status:"pending_payment",createdAt:serverTimestamp(),
      });
      const res=await fetch("/api/initiate-payment",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({orderId:orderRef.id,amount:cartTotal,
          customerName:customer.name,customerEmail:customer.email||"noemail@kakonbala.com",
          customerPhone:customer.phone,customerAddress:customer.address||"Dhaka, Bangladesh"}),
      });
      const data=await res.json();
      if(data.url){window.location.href=data.url;}
      else{notify("⚠ Payment error: "+(data.error||"unknown"));setPayLoading(false);}
    }catch(err){notify("⚠ "+err.message);setPayLoading(false);}
  }

  /* ── Page background style ── */
  const pageBg={
    minHeight:"100vh",
    background:"linear-gradient(160deg, #FFE4F0 0%, #F8D7F8 20%, #EDD6FF 40%, #F5D0FF 60%, #FFD6EC 80%, #FFE8F5 100%)",
    position:"relative",
  };
  const overlay={
    position:"fixed",inset:0,
    background:"transparent",
    zIndex:0,pointerEvents:"none",
  };

  return (
    <div style={{fontFamily:"'Hind Siliguri','Segoe UI',Arial,sans-serif",...pageBg,color:C.dark}}>
      {/* Full page tint overlay */}
      <div style={overlay}/>

      {/* ══ HEADER ══ */}
      <header style={{
        background:"rgba(255,255,255,0.25)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(255,255,255,0.4)",
        color:C.dark,padding:"0 24px",display:"flex",alignItems:"center",
        justifyContent:"space-between",height:70,position:"sticky",top:0,zIndex:50,
        boxShadow:"0 4px 20px rgba(173,20,87,0.15)",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <img src="/logo.jpg" alt="logo" style={{width:50,height:50,borderRadius:"50%",border:"2px solid rgba(173,20,87,0.4)",objectFit:"cover"}}/>
          <div>
            <div style={{fontSize:22,fontWeight:800,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{t.shopName}</div>
            <div style={{fontSize:10,color:C.med,letterSpacing:1.5,textTransform:"uppercase"}}>{t.tagline}</div>
          </div>
        </div>
        <nav style={{display:"flex",gap:4}}>
          {[["shop",t.shop],["dashboard",t.dashboard],["inventory",t.inventory],["orders",t.orders]].map(([key,label])=>(
            <button key={key} onClick={()=>setTab(key)} style={{
              background:tab===key?GRAD:"rgba(255,255,255,0.3)",
              color:tab===key?"#FFF":C.dark,
              border:tab===key?"none":"1px solid rgba(255,255,255,0.5)",
              padding:"7px 14px",borderRadius:20,cursor:"pointer",fontSize:12,
              fontFamily:"inherit",fontWeight:tab===key?700:500,
              backdropFilter:BLUR,transition:"all 0.2s",
            }}>{label}</button>
          ))}
        </nav>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setLang(l=>l==="en"?"bn":"en")} style={{
            background:"rgba(255,255,255,0.4)",backdropFilter:BLUR,
            border:"1.5px solid rgba(173,20,87,0.3)",color:C.dark,
            padding:"5px 14px",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"
          }}>{lang==="en"?"বাংলা":"English"}</button>
          <button onClick={()=>setCartOpen(true)} style={{...btn,display:"flex",alignItems:"center",gap:8,padding:"8px 16px"}}>
            {t.cart} {cartCount>0&&<span style={{background:C.gold,color:C.dark,borderRadius:10,padding:"1px 7px",fontSize:11,fontWeight:800}}>{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* ══ TOAST ══ */}
      {notif&&(
        <div style={{position:"fixed",top:80,right:24,background:GRAD,color:"#FFF",padding:"12px 22px",borderRadius:12,zIndex:300,fontSize:13,boxShadow:"0 4px 20px rgba(173,20,87,0.4)",fontWeight:600}}>
          {notif}
        </div>
      )}

      <main style={{padding:"28px 32px",maxWidth:1140,margin:"0 auto",position:"relative",zIndex:1}}>

        {/* ══════════ SHOP ══════════ */}
        {tab==="shop"&&(
          <div>
            {/* Hero Banner — image as bg, dynamic text on top */}
            <div style={{
              borderRadius:20,marginBottom:28,overflow:"hidden",position:"relative",minHeight:180,
              backgroundImage:"url('/banner.png')",
              backgroundSize:"cover",backgroundPosition:"center center",
              boxShadow:"0 8px 32px rgba(173,20,87,0.25)",
            }}>
              {/* subtle overlay so our text is readable */}
              <div style={{position:"absolute",inset:0,background:"rgba(255,240,252,0.45)"}}/>
              <div style={{position:"relative",zIndex:2,padding:"32px 40px",minHeight:180,display:"flex",flexDirection:"column",justifyContent:"center"}}>
                <div style={{fontSize:11,color:"#7B1FA2",letterSpacing:3,textTransform:"uppercase",marginBottom:8,fontWeight:700}}>
                  হাতে তৈরি &nbsp;·&nbsp; HANDMADE &nbsp;✦
                </div>
                <h1 style={{fontSize:34,fontWeight:900,color:"#4A0030",margin:0,
                  textShadow:"0 1px 6px rgba(255,255,255,0.9)",letterSpacing:0.3}}>
                  {t.welcome}
                </h1>
                <p style={{color:"#6A1B4D",fontSize:14,margin:"8px 0 0",fontWeight:600,
                  textShadow:"0 1px 4px rgba(255,255,255,0.8)"}}>
                  {t.welcomeSub}
                </p>
                <div style={{marginTop:16,display:"flex",alignItems:"center",gap:8}}>
                  <div style={{height:1.5,width:45,background:"rgba(180,120,30,0.7)"}}/>
                  <span style={{color:"#B8860B",fontSize:14}}>✦</span>
                  <div style={{height:1.5,width:45,background:"rgba(180,120,30,0.7)"}}/>
                </div>
              </div>
            </div>

            {/* Category filter */}
            <div style={{marginBottom:18}}>
              {/* Main category tabs */}
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                {[["all",t.allItems],["jewelry",t.jewelry],["crafts",t.crafts],["clothing",t.clothing]].map(([key,label])=>(
                  <button key={key} onClick={()=>{setCatFilter(key);setSubFilter("all");setClothingGroup("all");}} style={{
                    background:catFilter===key?GRAD:GLASS2,
                    color:catFilter===key?"#FFF":C.dark,
                    border:`1.5px solid ${catFilter===key?"transparent":"rgba(255,255,255,0.5)"}`,
                    padding:"7px 20px",borderRadius:20,cursor:"pointer",fontSize:13,
                    fontFamily:"inherit",fontWeight:600,backdropFilter:BLUR,
                    boxShadow:catFilter===key?"0 2px 10px rgba(173,20,87,0.4)":"none",
                  }}>{label}</button>
                ))}
              </div>
              {/* Jewelry subcategories */}
              {catFilter==="jewelry"&&(
                <div style={{display:"flex",gap:6,flexWrap:"wrap",paddingLeft:8}}>
                  <button onClick={()=>setSubFilter("all")} style={{background:subFilter==="all"?"rgba(173,20,87,0.15)":GLASS2,color:subFilter==="all"?C.primary:C.med,border:`1px solid ${subFilter==="all"?"rgba(173,20,87,0.4)":"rgba(255,255,255,0.5)"}`,padding:"4px 14px",borderRadius:15,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600,backdropFilter:BLUR}}>All</button>
                  {CATS.jewelry.subs.map(s=>(
                    <button key={s} onClick={()=>setSubFilter(s)} style={{background:subFilter===s?"rgba(173,20,87,0.15)":GLASS2,color:subFilter===s?C.primary:C.med,border:`1px solid ${subFilter===s?"rgba(173,20,87,0.4)":"rgba(255,255,255,0.5)"}`,padding:"4px 14px",borderRadius:15,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600,backdropFilter:BLUR}}>{s}</button>
                  ))}
                </div>
              )}
              {/* Crafts subcategories */}
              {catFilter==="crafts"&&(
                <div style={{display:"flex",gap:6,flexWrap:"wrap",paddingLeft:8}}>
                  <button onClick={()=>setSubFilter("all")} style={{background:subFilter==="all"?"rgba(106,27,154,0.15)":GLASS2,color:subFilter==="all"?C.purple:C.med,border:`1px solid ${subFilter==="all"?"rgba(106,27,154,0.4)":"rgba(255,255,255,0.5)"}`,padding:"4px 14px",borderRadius:15,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600,backdropFilter:BLUR}}>All</button>
                  {CATS.crafts.subs.map(s=>(
                    <button key={s} onClick={()=>setSubFilter(s)} style={{background:subFilter===s?"rgba(106,27,154,0.15)":GLASS2,color:subFilter===s?C.purple:C.med,border:`1px solid ${subFilter===s?"rgba(106,27,154,0.4)":"rgba(255,255,255,0.5)"}`,padding:"4px 14px",borderRadius:15,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600,backdropFilter:BLUR}}>{s}</button>
                  ))}
                </div>
              )}
              {/* Clothing — group + sub */}
              {catFilter==="clothing"&&(
                <div style={{display:"flex",flexDirection:"column",gap:8,paddingLeft:8}}>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <button onClick={()=>{setClothingGroup("all");setSubFilter("all");}} style={{background:clothingGroup==="all"?"rgba(249,168,37,0.2)":GLASS2,color:clothingGroup==="all"?"#B8860B":C.med,border:`1px solid ${clothingGroup==="all"?"rgba(249,168,37,0.5)":"rgba(255,255,255,0.5)"}`,padding:"4px 14px",borderRadius:15,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:700,backdropFilter:BLUR}}>All</button>
                    {Object.keys(CATS.clothing.groups).map(g=>(
                      <button key={g} onClick={()=>{setClothingGroup(g);setSubFilter("all");}} style={{background:clothingGroup===g?"rgba(249,168,37,0.2)":GLASS2,color:clothingGroup===g?"#B8860B":C.med,border:`1px solid ${clothingGroup===g?"rgba(249,168,37,0.5)":"rgba(255,255,255,0.5)"}`,padding:"4px 14px",borderRadius:15,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:700,backdropFilter:BLUR}}>
                        {g==="Women"?"👩 Women":g==="Men"?"👨 Men":"👶 Child"}
                      </button>
                    ))}
                  </div>
                  {clothingGroup!=="all"&&(
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <button onClick={()=>setSubFilter("all")} style={{background:subFilter==="all"?"rgba(249,168,37,0.15)":GLASS2,color:subFilter==="all"?"#B8860B":C.med,border:`1px solid ${subFilter==="all"?"rgba(249,168,37,0.4)":"rgba(255,255,255,0.4)"}`,padding:"3px 12px",borderRadius:12,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:600,backdropFilter:BLUR}}>All {clothingGroup}</button>
                      {CATS.clothing.groups[clothingGroup].map(s=>(
                        <button key={s} onClick={()=>setSubFilter(s)} style={{background:subFilter===s?"rgba(249,168,37,0.15)":GLASS2,color:subFilter===s?"#B8860B":C.med,border:`1px solid ${subFilter===s?"rgba(249,168,37,0.4)":"rgba(255,255,255,0.4)"}`,padding:"3px 12px",borderRadius:12,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:600,backdropFilter:BLUR}}>{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {products.length===0&&(
              <div style={{...glassCard,textAlign:"center",padding:"60px 0",color:C.med}}>
                <div style={{fontSize:50,marginBottom:12}}>🌸</div>
                <div style={{fontSize:15}}>Loading products...</div>
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:20}}>
              {visible.map(p=>(
                <div key={p.id} style={{...glassCard,overflow:"hidden",transition:"transform 0.2s",cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-6px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  <div onClick={()=>{setSelectedProduct(p);setZoom(1);}}
                    style={{height:180,position:"relative",overflow:"hidden",cursor:"pointer"}}>
                    <Carousel images={p.imageUrls&&p.imageUrls.length?p.imageUrls:[p.imageUrl]} emoji={p.emoji} height={180}/>
                    <span style={{position:"absolute",top:8,left:8,...catBadge(p.category),zIndex:3}}>{p.subcategory||p.category}</span>
                    <span style={{position:"absolute",bottom:8,right:8,background:"rgba(255,255,255,0.7)",borderRadius:8,padding:"2px 8px",fontSize:10,color:C.med,backdropFilter:BLUR,zIndex:3}}>🔍 View</span>
                  </div>
                  <div style={{padding:"14px 16px"}}>
                    <div onClick={()=>{setSelectedProduct(p);setZoom(1);}} style={{fontSize:14,fontWeight:700,color:C.dark,marginBottom:4}}>{p.name}</div>
                    <div style={{fontSize:11,color:C.med,lineHeight:1.5,marginBottom:10,minHeight:32}}>{p.desc}</div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                      <span style={{fontSize:18,fontWeight:800,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>৳{p.price.toLocaleString()}</span>
                      <span style={stockTag(p.stock)}>{p.stock<=5?`⚠ ${p.stock} ${t.left}`:`${p.stock} ${t.inStock}`}</span>
                    </div>
                    <button onClick={()=>addToCart(p)} disabled={p.stock===0}
                      style={{...btn,width:"100%",padding:"10px",opacity:p.stock===0?0.45:1,cursor:p.stock===0?"not-allowed":"pointer"}}>
                      {p.stock===0?t.outOfStock:t.addCart}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ DASHBOARD ══════════ */}
        {tab==="dashboard"&&(
          <div>
            <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 22px",background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>📊 {t.dashTitle}</h1>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
              {[
                {label:t.totalRevenue,value:`৳${(totalRev/1000).toFixed(0)}K`,sub:"↑ 12%",c:C.primary},
                {label:t.allOrders,value:orders.length,sub:"Live",c:C.purple},
                {label:t.products,value:products.length,sub:`${lowStock.length} low`,c:C.gold},
                {label:t.totalStock,value:totalStock,sub:"units",c:C.success},
              ].map((m,i)=>(
                <div key={i} style={metCard(m.c)}>
                  <div style={{fontSize:11,color:C.med,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{m.label}</div>
                  <div style={{fontSize:24,fontWeight:800,color:C.dark}}>{m.value}</div>
                  <div style={{fontSize:11,color:C.success,marginTop:3}}>{m.sub}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:18,marginBottom:18}}>
              <div style={{...glassCard,padding:20}}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:14,color:C.purple}}>{t.monthlyRev}</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData} margin={{top:4,right:4,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.4)" vertical={false}/>
                    <XAxis dataKey="month" tick={{fontSize:12,fill:C.med}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:11,fill:C.med}} axisLine={false} tickLine={false} tickFormatter={v=>`৳${(v/1000).toFixed(0)}K`}/>
                    <Tooltip formatter={v=>[`৳${v.toLocaleString()}`,"Revenue"]} contentStyle={{background:GLASS2,border:"1px solid rgba(255,255,255,0.5)",borderRadius:8,fontSize:12,backdropFilter:BLUR}}/>
                    <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#AD1457"/><stop offset="100%" stopColor="#6A1B9A"/></linearGradient></defs>
                    <Bar dataKey="revenue" fill="url(#grad)" radius={[6,6,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{...glassCard,padding:20}}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:10,color:C.purple}}>{t.catRevenue}</div>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={catRevData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={3}>
                      {catRevData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}
                    </Pie>
                    <Tooltip formatter={v=>[`৳${v.toLocaleString()}`,""]} contentStyle={{background:GLASS2,border:"1px solid rgba(255,255,255,0.5)",borderRadius:8,fontSize:12}}/>
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
            <div style={{...glassCard,padding:20,marginBottom:18}}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:14,color:C.purple}}>{t.orderTrend}</div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={monthlyData} margin={{top:4,right:4,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.4)" vertical={false}/>
                  <XAxis dataKey="month" tick={{fontSize:12,fill:C.med}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:C.med}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:GLASS2,border:"1px solid rgba(255,255,255,0.5)",borderRadius:8,fontSize:12}}/>
                  <Line type="monotone" dataKey="orders" stroke={C.primary} strokeWidth={3} dot={{fill:C.primary,r:5}} activeDot={{r:7}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
            {lowStock.length>0&&(
              <div style={{...glassCard,background:"rgba(255,243,224,0.75)",padding:16}}>
                <div style={{fontSize:13,fontWeight:700,color:C.warn,marginBottom:8}}>{t.lowStockAlert}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {lowStock.map(p=>(
                    <span key={p.id} style={{background:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,204,128,0.6)",borderRadius:8,padding:"4px 12px",fontSize:12,color:C.warn}}>
                      {p.emoji} {p.name} — <b>{p.stock}</b>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════ INVENTORY ══════════ */}
        {tab==="inventory"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <h1 style={{fontSize:24,fontWeight:800,margin:0,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>📦 {t.invTitle}</h1>
                <p style={{color:C.med,fontSize:13,margin:"3px 0 0"}}>{t.invSub}</p>
              </div>
              <button onClick={()=>setShowForm(f=>!f)} style={{...btn}}>{showForm?t.cancel:t.addProduct}</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
              {[[t.totalProducts,products.length,C.primary],[t.totalStockUnits,totalStock,C.purple],[t.lowStockItems,lowStock.length,C.danger]].map(([l,v,c])=>(
                <div key={l} style={metCard(c)}>
                  <div style={{fontSize:11,color:C.med,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{l}</div>
                  <div style={{fontSize:26,fontWeight:800,color:C.dark}}>{v}</div>
                </div>
              ))}
            </div>
            {showForm&&(
              <div style={{...glassCard,padding:24,marginBottom:20}}>
                <div style={{fontSize:16,fontWeight:800,marginBottom:16,color:C.purple}}>{t.newProductTitle}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  {[[t.productName,"name","text","e.g. Silk Bangles"],[t.price,"price","number","e.g. 400"],[t.stockQty,"stock","number","e.g. 10"]].map(([l,k,tp,ph])=>(
                    <div key={k}>
                      <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:2}}>{l}</label>
                      <input style={inp} type={tp} placeholder={ph} value={newP[k]} onChange={e=>setNewP(p=>({...p,[k]:e.target.value}))}/>
                    </div>
                  ))}
                  <div>
                    <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:2}}>{t.category}</label>
                    <select style={inp} value={newP.category} onChange={e=>setNewP(p=>({...p,category:e.target.value,subcategory:"",clothingGroup:""}))}>
                      <option value="jewelry">💍 Jewelry / গহনা</option>
                      <option value="crafts">🏺 Crafts / ক্রাফট</option>
                      <option value="clothing">👗 Clothing / পোশাক</option>
                    </select>
                  </div>
                  {/* Clothing group */}
                  {newP.category==="clothing"&&(
                    <div>
                      <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:2}}>For (Group) *</label>
                      <select style={inp} value={newP.clothingGroup||""} onChange={e=>setNewP(p=>({...p,clothingGroup:e.target.value,subcategory:""}))}>
                        <option value="">-- Select --</option>
                        {Object.keys(CATS.clothing.groups).map(g=><option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  )}
                  {/* Subcategory */}
                  {newP.category&&(newP.category!=="clothing"||newP.clothingGroup)&&(
                    <div>
                      <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:2}}>Subcategory *</label>
                      <select style={inp} value={newP.subcategory||""} onChange={e=>setNewP(p=>({...p,subcategory:e.target.value}))}>
                        <option value="">-- Select --</option>
                        {(newP.category==="jewelry"?CATS.jewelry.subs:newP.category==="crafts"?CATS.crafts.subs:newP.clothingGroup?CATS.clothing.groups[newP.clothingGroup]:[]).map(s=><option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                  <div style={{gridColumn:"span 2"}}>
                    <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:2}}>{t.description}</label>
                    <input style={inp} placeholder="Brief product description" value={newP.desc} onChange={e=>setNewP(p=>({...p,desc:e.target.value}))}/>
                  </div>
                  <div style={{gridColumn:"span 2"}}>
                    <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:4}}>📏 Sizes <span style={{fontSize:10,fontWeight:400}}>(type & press Enter — e.g. S, M, L, XL, Free Size)</span></label>
                    <TagInput values={newP.sizes||[]} onChange={v=>setNewP(p=>({...p,sizes:v}))} placeholder="S, M, L, XL, Free Size..."/>
                  </div>
                  <div style={{gridColumn:"span 2"}}>
                    <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:4}}>🎨 Colors <span style={{fontSize:10,fontWeight:400}}>(type & press Enter — e.g. Red, Blue, Gold)</span></label>
                    <TagInput values={newP.colors||[]} onChange={v=>setNewP(p=>({...p,colors:v}))} placeholder="Red, Blue, Pink, Gold..."/>
                  </div>
                  <div style={{gridColumn:"span 2"}}>
                    <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:4}}>📦 Pack Size <span style={{fontSize:10,fontWeight:400}}>(type & press Enter — e.g. 1pc, 2pc, Set of 5)</span></label>
                    <TagInput values={newP.pieceCounts||[]} onChange={v=>setNewP(p=>({...p,pieceCounts:v}))} placeholder="1pc, 2pc, Set of 3..."/>
                  </div>
                  <div style={{gridColumn:"span 2"}}>
                    <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:4}}>{t.photo}</label>
                    <div style={{fontSize:11,color:C.med,marginBottom:8}}>
                      📌 Upload to <b><a href="https://imgbb.com" target="_blank" rel="noreferrer" style={{color:C.primary}}>imgbb.com</a></b> → BBCode → copy URL between [img]...[/img] → paste below. Add up to 5 photos!
                    </div>
                    {(newP.imageUrls||[""]).map((url,i)=>(
                      <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                        <div style={{fontSize:11,color:C.med,fontWeight:700,minWidth:20}}>#{i+1}</div>
                        <input style={{...inp,marginTop:0,flex:1}} type="text"
                          placeholder={`Photo ${i+1} URL`} value={url}
                          onChange={e=>{
                            const arr=[...(newP.imageUrls||[""])];
                            arr[i]=e.target.value;
                            setNewP(p=>({...p,imageUrls:arr,imageUrl:arr[0]||""}));
                          }}/>
                        {url&&<img src={url} alt="" onError={e=>e.target.style.display="none"} style={{width:40,height:40,objectFit:"cover",borderRadius:6,border:"1px solid rgba(255,255,255,0.6)",flexShrink:0}}/>}
                        {(newP.imageUrls||[""]).length>1&&(
                          <button type="button" onClick={()=>{const arr=[...(newP.imageUrls||[""])];arr.splice(i,1);setNewP(p=>({...p,imageUrls:arr,imageUrl:arr[0]||""}));}}
                            style={{background:"rgba(255,235,238,0.9)",border:"1px solid rgba(198,40,40,0.3)",color:C.danger,borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:14,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                        )}
                      </div>
                    ))}
                    {(newP.imageUrls||[""]).length<5&&(
                      <button type="button" onClick={()=>setNewP(p=>({...p,imageUrls:[...(p.imageUrls||[""]),""]})) }
                        style={{fontSize:12,color:C.primary,background:"rgba(173,20,87,0.08)",border:"1px dashed rgba(173,20,87,0.4)",borderRadius:8,padding:"5px 14px",cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>
                        + Add another photo
                      </button>
                    )}
                  </div>
                </div>
                <button style={{...btn,marginTop:16}} onClick={addProduct}>{t.saveDb}</button>
              </div>
            )}
            <div style={{...glassCard,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr>{["Product",t.category,"Price",t.stockQty,t.status,t.adjust].map(h=><th key={h} style={TH}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {products.map(p=>(
                    <tr key={p.id} style={{background:p.stock===0?"rgba(255,235,238,0.4)":"transparent"}}>
                      <td style={TD}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          {p.imageUrl
                            ?<img src={p.imageUrl} alt={p.name} style={{width:44,height:44,borderRadius:8,objectFit:"cover",border:"1px solid rgba(255,255,255,0.6)"}}/>
                            :<span style={{fontSize:28,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.5)",borderRadius:8}}>{p.emoji}</span>
                          }
                          <div>
                            <div style={{fontWeight:700,color:C.dark}}>{p.name}</div>
                            <div style={{fontSize:11,color:C.med}}>{(p.desc||"").slice(0,40)}{(p.desc||"").length>40?"…":""}</div>
                          </div>
                        </div>
                      </td>
                      <td style={TD}><div style={{display:'flex',flexDirection:'column',gap:3}}><span style={catBadge(p.category)}>{p.category}</span>{p.subcategory&&<span style={{fontSize:10,color:C.med}}>{p.clothingGroup?`${p.clothingGroup} › `:''}{p.subcategory}</span>}</div></td>
                      <td style={{...TD,fontWeight:700,color:C.primary}}>৳{p.price.toLocaleString()}</td>
                      <td style={{...TD,fontWeight:800,fontSize:16,color:p.stock<=5?C.danger:C.dark}}>{p.stock}</td>
                      <td style={TD}>
                        <span style={{display:"inline-block",fontSize:11,padding:"3px 10px",borderRadius:8,fontWeight:700,
                          background:p.stock===0?C.dangerBg:p.stock<=5?C.warnBg:C.successBg,
                          color:p.stock===0?C.danger:p.stock<=5?C.warn:C.success}}>
                          {p.stock===0?t.noStock:p.stock<=5?t.lowStock:t.inStockLabel}
                        </span>
                      </td>
                      <td style={TD}>
                        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                          <button style={qBtn} onClick={()=>adjustStock(p.id,-1)} title="Remove 1">−</button>
                          <button style={qBtn} onClick={()=>adjustStock(p.id,5)} title="Add 5">+5</button>
                          <button style={qBtn} onClick={()=>adjustStock(p.id,10)} title="Add 10">+10</button>
                          <button title="Edit product"
                            onClick={()=>setEditProduct({...p})}
                            style={{...qBtn,width:"auto",padding:"0 10px",background:"rgba(227,242,253,0.9)",color:"#1565C0",border:"1px solid rgba(21,101,192,0.3)",fontSize:12,fontWeight:700}}>
                            ✏️
                          </button>
                          <button title="Delete product"
                            onClick={()=>deleteProduct(p.id,p.name)}
                            style={{...qBtn,width:"auto",padding:"0 10px",background:"rgba(255,235,238,0.9)",color:C.danger,border:"1px solid rgba(198,40,40,0.3)",fontSize:12,fontWeight:700}}>
                            🗑️
                          </button>
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
        {tab==="orders"&&(
          <div>
            <h1 style={{fontSize:24,fontWeight:800,margin:"0 0 8px",background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>📋 {t.ordersTitle}</h1>
            <p style={{color:C.med,fontSize:13,marginBottom:22}}>{orders.length} {t.ordersLive}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
              {[["paid",t.paid,C.success,"rgba(232,245,233,0.75)"],["processing",t.processing,C.warn,"rgba(255,243,224,0.75)"],["shipped",t.shipped,C.info,"rgba(227,242,253,0.75)"],["pending_payment",t.pendingPay,C.danger,"rgba(255,235,238,0.75)"]].map(([s,l,c,bg])=>(
                <div key={s} style={{...glassCard,background:bg,padding:"14px 18px",textAlign:"center"}}>
                  <div style={{fontSize:26,fontWeight:800,color:c}}>{orders.filter(o=>o.status===s).length}</div>
                  <div style={{fontSize:12,color:c,marginTop:3,fontWeight:600}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{...glassCard,overflow:"hidden",marginBottom:18}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr>{[t.orderId,t.date,t.customer,t.phone,t.items,"Total",t.status].map(h=><th key={h} style={TH}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {orders.length===0&&<tr><td colSpan={7} style={{...TD,textAlign:"center",color:C.med,padding:40}}>{t.noOrders}</td></tr>}
                  {orders.map(o=>(
                    <tr key={o.id} style={{background:"rgba(255,255,255,0.15)"}}>
                      <td style={{...TD,fontWeight:600,color:C.primary,fontFamily:"monospace",fontSize:11}}>{o.id?.slice(0,8)}…</td>
                      <td style={{...TD,color:C.med,fontSize:12}}>{o.createdAt?.seconds?new Date(o.createdAt.seconds*1000).toLocaleDateString():"—"}</td>
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
            <div style={{...glassCard,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:C.med,fontSize:14}}>{t.totalRevAll}</span>
              <span style={{fontSize:22,fontWeight:800,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>৳{orders.reduce((s,o)=>s+(o.total||0),0).toLocaleString()}</span>
            </div>
          </div>
        )}
      </main>

      {/* ══ PRODUCT DETAIL MODAL ══ */}
      {selectedProduct&&(
        <>
          <div onClick={()=>setSelectedProduct(null)} style={{position:"fixed",inset:0,background:"rgba(45,10,63,0.65)",zIndex:200,backdropFilter:"blur(4px)"}}/>
          <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            width:"min(600px,95vw)",maxHeight:"90vh",overflowY:"auto",
            background:"rgba(255,255,255,0.95)",backdropFilter:"blur(20px)",
            borderRadius:24,overflow:"hidden",zIndex:201,
            boxShadow:"0 24px 80px rgba(173,20,87,0.35)",border:"1px solid rgba(255,255,255,0.7)"}}>
            {/* Close button */}
            <button onClick={()=>setSelectedProduct(null)}
              style={{position:"absolute",top:14,right:14,zIndex:10,background:"rgba(255,255,255,0.8)",
                border:"none",width:34,height:34,borderRadius:"50%",cursor:"pointer",
                fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>✕</button>
            {/* Image section with zoom */}
            <div style={{background:"rgba(255,240,252,0.6)",position:"relative",overflow:"hidden",height:300}}>
              <Carousel
                images={selectedProduct.imageUrls&&selectedProduct.imageUrls.length?selectedProduct.imageUrls:[selectedProduct.imageUrl]}
                emoji={selectedProduct.emoji} height={300} zoom={true}/>
            </div>
            {/* Product details */}
            <div style={{padding:"22px 28px 28px"}}>
              <span style={catBadge(selectedProduct.category)}>{selectedProduct.category}</span>
              <h2 style={{fontSize:24,fontWeight:900,color:C.dark,margin:"6px 0 8px"}}>{selectedProduct.name}</h2>
              <p style={{color:C.med,fontSize:14,lineHeight:1.7,marginBottom:16}}>{selectedProduct.desc||"No description available."}</p>

              {/* Pack Size selector */}
              {selectedProduct.pieceCounts?.length>0&&(
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.dark,marginBottom:6}}>📦 Pack Size</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {selectedProduct.pieceCounts.map(pc=>(
                      <button key={pc} onClick={()=>setSelPiece(pc)}
                        style={{padding:"5px 16px",borderRadius:20,cursor:"pointer",fontSize:13,fontWeight:600,
                          fontFamily:"inherit",border:`1.5px solid ${selPiece===pc?"#AD1457":"rgba(173,20,87,0.25)"}`,
                          background:selPiece===pc?"rgba(173,20,87,0.1)":"rgba(255,255,255,0.6)",
                          color:selPiece===pc?C.primary:C.med}}>
                        {pc}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {selectedProduct.sizes?.length>0&&(
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.dark,marginBottom:6}}>📏 Size</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {selectedProduct.sizes.map(sz=>(
                      <button key={sz} onClick={()=>setSelSize(sz)}
                        style={{padding:"5px 18px",borderRadius:20,cursor:"pointer",fontSize:13,fontWeight:600,
                          fontFamily:"inherit",border:`1.5px solid ${selSize===sz?"#AD1457":"rgba(173,20,87,0.25)"}`,
                          background:selSize===sz?"rgba(173,20,87,0.1)":"rgba(255,255,255,0.6)",
                          color:selSize===sz?C.primary:C.med}}>
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color selector */}
              {selectedProduct.colors?.length>0&&(
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.dark,marginBottom:6}}>
                    🎨 Color {selColor&&<span style={{fontWeight:400,color:C.med}}>— {selColor}</span>}
                  </div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                    {selectedProduct.colors.map(cl=>{
                      const hex=COLOR_MAP[cl.toLowerCase()]||null;
                      return hex?(
                        <button key={cl} onClick={()=>setSelColor(cl)} title={cl}
                          style={{width:32,height:32,borderRadius:"50%",cursor:"pointer",
                            background:hex,border:selColor===cl?"3px solid #AD1457":"2px solid rgba(255,255,255,0.8)",
                            boxShadow:selColor===cl?"0 0 0 2px #AD1457,0 2px 8px rgba(0,0,0,0.2)":"0 2px 6px rgba(0,0,0,0.15)",
                            transition:"all 0.2s"}}/>
                      ):(
                        <button key={cl} onClick={()=>setSelColor(cl)}
                          style={{padding:"5px 16px",borderRadius:20,cursor:"pointer",fontSize:13,fontWeight:600,
                            fontFamily:"inherit",border:`1.5px solid ${selColor===cl?"#AD1457":"rgba(173,20,87,0.25)"}`,
                            background:selColor===cl?"rgba(173,20,87,0.1)":"rgba(255,255,255,0.6)",
                            color:selColor===cl?C.primary:C.med}}>
                          {cl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                background:"rgba(255,240,252,0.6)",borderRadius:12,padding:"14px 18px",marginBottom:20}}>
                <div>
                  <div style={{fontSize:11,color:C.light,marginBottom:2}}>মূল্য / Price</div>
                  <div style={{fontSize:28,fontWeight:900,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                    ৳{selectedProduct.price.toLocaleString()}
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:11,color:C.light,marginBottom:2}}>স্টক / Stock</div>
                  <span style={stockTag(selectedProduct.stock)}>
                    {selectedProduct.stock<=5?`⚠ ${selectedProduct.stock} ${t.left}`:`${selectedProduct.stock} ${t.inStock}`}
                  </span>
                </div>
              </div>
              <button onClick={()=>{addToCart(selectedProduct,{size:selSize,color:selColor,piece:selPiece});setSelectedProduct(null);}}
                disabled={selectedProduct.stock===0}
                style={{...btn,width:"100%",padding:"14px",fontSize:16,
                  opacity:selectedProduct.stock===0?0.45:1,
                  cursor:selectedProduct.stock===0?"not-allowed":"pointer"}}>
                {selectedProduct.stock===0?t.outOfStock:t.addCart}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ══ EDIT PRODUCT MODAL ══ */}
      {editProduct&&(
        <>
          <div onClick={()=>setEditProduct(null)} style={{position:"fixed",inset:0,background:"rgba(45,10,63,0.55)",zIndex:200}}/>
          <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:460,
            background:"rgba(255,255,255,0.92)",backdropFilter:"blur(20px)",borderRadius:20,
            overflow:"hidden",zIndex:201,boxShadow:"0 20px 60px rgba(173,20,87,0.3)",border:"1px solid rgba(255,255,255,0.6)"}}>
            <div style={{background:GRAD,padding:"18px 26px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{color:"#FFF",fontSize:16,fontWeight:800}}>✏️ Edit Product</div>
              <button onClick={()=>setEditProduct(null)} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#FFF",width:30,height:30,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div style={{padding:24}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[["Product Name *","name","text","Product name"],["Price (৳) *","price","number","e.g. 400"],["Stock *","stock","number","e.g. 10"]].map(([l,k,tp,ph])=>(
                  <div key={k}>
                    <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:2}}>{l}</label>
                    <input style={inp} type={tp} placeholder={ph} value={editProduct[k]||""}
                      onChange={e=>setEditProduct(p=>({...p,[k]:e.target.value}))}/>
                  </div>
                ))}
                <div>
                  <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:2}}>Category *</label>
                  <select style={inp} value={editProduct.category||"jewelry"}
                    onChange={e=>setEditProduct(p=>({...p,category:e.target.value,subcategory:"",clothingGroup:""}))}>
                    <option value="jewelry">💍 Jewelry / গহনা</option>
                    <option value="crafts">🏺 Crafts / ক্রাফট</option>
                    <option value="clothing">👗 Clothing / পোশাক</option>
                  </select>
                </div>
                {/* Subcategory for jewelry */}
                {(editProduct.category==="jewelry"||!editProduct.category)&&(
                  <div>
                    <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:2}}>Subcategory</label>
                    <select style={inp} value={editProduct.subcategory||""} onChange={e=>setEditProduct(p=>({...p,subcategory:e.target.value}))}>
                      <option value="">-- Select --</option>
                      {CATS.jewelry.subs.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                {/* Subcategory for crafts */}
                {editProduct.category==="crafts"&&(
                  <div>
                    <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:2}}>Subcategory</label>
                    <select style={inp} value={editProduct.subcategory||""} onChange={e=>setEditProduct(p=>({...p,subcategory:e.target.value}))}>
                      <option value="">-- Select --</option>
                      {CATS.crafts.subs.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                {/* Group + subcategory for clothing */}
                {editProduct.category==="clothing"&&(
                  <>
                    <div>
                      <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:2}}>Group *</label>
                      <select style={inp} value={editProduct.clothingGroup||""} onChange={e=>setEditProduct(p=>({...p,clothingGroup:e.target.value,subcategory:""}))}>
                        <option value="">-- Select group --</option>
                        {Object.keys(CATS.clothing.groups).map(g=><option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:2}}>Subcategory</label>
                      <select style={inp} value={editProduct.subcategory||""} onChange={e=>setEditProduct(p=>({...p,subcategory:e.target.value}))} disabled={!editProduct.clothingGroup}>
                        <option value="">{editProduct.clothingGroup?"-- Select --":"Pick group first"}</option>
                        {(editProduct.clothingGroup?CATS.clothing.groups[editProduct.clothingGroup]:[]).map(s=><option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </>
                )}
                <div style={{gridColumn:"span 2"}}>
                  <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:2}}>Description</label>
                  <input style={inp} placeholder="Product description" value={editProduct.desc||""}
                    onChange={e=>setEditProduct(p=>({...p,desc:e.target.value}))}/>
                </div>
                <div style={{gridColumn:"span 2"}}>
                  <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:4}}>📏 Sizes <span style={{fontSize:10,fontWeight:400}}>(Enter to add)</span></label>
                  <TagInput values={editProduct.sizes||[]} onChange={v=>setEditProduct(p=>({...p,sizes:v}))} placeholder="S, M, L, XL..."/>
                </div>
                <div style={{gridColumn:"span 2"}}>
                  <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:4}}>🎨 Colors <span style={{fontSize:10,fontWeight:400}}>(Enter to add)</span></label>
                  <TagInput values={editProduct.colors||[]} onChange={v=>setEditProduct(p=>({...p,colors:v}))} placeholder="Red, Blue, Gold..."/>
                </div>
                <div style={{gridColumn:"span 2"}}>
                  <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:4}}>📦 Pack Size <span style={{fontSize:10,fontWeight:400}}>(Enter to add)</span></label>
                  <TagInput values={editProduct.pieceCounts||[]} onChange={v=>setEditProduct(p=>({...p,pieceCounts:v}))} placeholder="1pc, 2pc, Set of 3..."/>
                </div>
                <div style={{gridColumn:"span 2"}}>
                  <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:4}}>📸 Photos (up to 5)</label>
                  <div style={{fontSize:11,color:C.med,marginBottom:8}}>
                    Upload to <a href="https://imgbb.com" target="_blank" rel="noreferrer" style={{color:C.primary,fontWeight:700}}>imgbb.com</a> → BBCode → copy URL between [img]...[/img]
                  </div>
                  {(editProduct.imageUrls&&editProduct.imageUrls.length?editProduct.imageUrls:[editProduct.imageUrl||""]).map((url,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                      <div style={{fontSize:11,color:C.med,fontWeight:700,minWidth:20}}>#{i+1}</div>
                      <input style={{...inp,marginTop:0,flex:1}} type="text"
                        placeholder={`Photo ${i+1} URL`} value={url||""}
                        onChange={e=>{
                          const base=editProduct.imageUrls&&editProduct.imageUrls.length?[...editProduct.imageUrls]:[editProduct.imageUrl||""];
                          base[i]=e.target.value;
                          setEditProduct(p=>({...p,imageUrls:base,imageUrl:base[0]||""}));
                        }}/>
                      {url&&<img src={url} alt="" onError={e=>e.target.style.display="none"} style={{width:40,height:40,objectFit:"cover",borderRadius:6,border:"1px solid rgba(255,255,255,0.6)",flexShrink:0}}/>}
                      {(editProduct.imageUrls&&editProduct.imageUrls.length?editProduct.imageUrls:[editProduct.imageUrl||""]).length>1&&(
                        <button type="button" onClick={()=>{const base=editProduct.imageUrls&&editProduct.imageUrls.length?[...editProduct.imageUrls]:[editProduct.imageUrl||""];base.splice(i,1);setEditProduct(p=>({...p,imageUrls:base,imageUrl:base[0]||""}));}}
                          style={{background:"rgba(255,235,238,0.9)",border:"1px solid rgba(198,40,40,0.3)",color:C.danger,borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:14,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                      )}
                    </div>
                  ))}
                  {(editProduct.imageUrls&&editProduct.imageUrls.length?editProduct.imageUrls:[editProduct.imageUrl||""]).length<5&&(
                    <button type="button" onClick={()=>{const base=editProduct.imageUrls&&editProduct.imageUrls.length?[...editProduct.imageUrls]:[editProduct.imageUrl||""];setEditProduct(p=>({...p,imageUrls:[...base,""]}));}}
                      style={{fontSize:12,color:C.primary,background:"rgba(173,20,87,0.08)",border:"1px dashed rgba(173,20,87,0.4)",borderRadius:8,padding:"5px 14px",cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>
                      + Add another photo
                    </button>
                  )}
                </div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:18}}>
                <button onClick={saveEdit} style={{...btn,flex:1,padding:"11px",fontSize:14}}>✓ Save Changes</button>
                <button onClick={()=>setEditProduct(null)} style={{flex:1,padding:"11px",fontSize:14,background:"rgba(255,255,255,0.6)",border:"1px solid rgba(173,20,87,0.3)",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontWeight:600,color:C.med}}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══ CART DRAWER ══ */}
      {cartOpen&&(
        <>
          <div onClick={()=>setCartOpen(false)} style={{position:"fixed",inset:0,background:"rgba(45,10,63,0.45)",zIndex:100}}/>
          <div style={{position:"fixed",right:0,top:0,bottom:0,width:390,background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",zIndex:101,overflowY:"auto",borderLeft:"1px solid rgba(255,255,255,0.5)",boxShadow:"-8px 0 40px rgba(173,20,87,0.2)"}}>
            <div style={{background:GRAD,padding:"18px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{color:"#FFF",fontSize:16,fontWeight:800}}>🛒 {t.yourCart}</div>
              <button onClick={()=>setCartOpen(false)} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#FFF",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div style={{padding:20}}>
              {cart.length===0?(
                <div style={{textAlign:"center",color:C.med,padding:"50px 0"}}>
                  <div style={{fontSize:50,marginBottom:12}}>🌸</div>
                  <div style={{fontSize:14}}>{t.cartEmpty}</div>
                </div>
              ):(
                <>
                  {cart.map(item=>(
                    <div key={item.product.id} style={{display:"flex",gap:12,paddingBottom:16,marginBottom:16,borderBottom:"1px solid rgba(255,255,255,0.4)"}}>
                      <div style={{width:56,height:56,borderRadius:10,overflow:"hidden",flexShrink:0,border:"1px solid rgba(255,255,255,0.5)"}}>
                        {item.product.imageUrl
                          ?<img src={item.product.imageUrl} alt={item.product.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          :<div style={{width:"100%",height:"100%",background:"rgba(255,255,255,0.5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{item.product.emoji}</div>
                        }
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.dark}}>{item.product.name}</div>
                        {(item.size||item.color||item.piece)&&(
                          <div style={{fontSize:10,color:C.med,marginTop:1}}>
                            {[item.size,item.color,item.piece].filter(Boolean).join(" · ")}
                          </div>
                        )}
                        <div style={{fontSize:13,fontWeight:800,color:C.primary,marginTop:2}}>৳{item.product.price.toLocaleString()}</div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:7}}>
                          <button style={qBtn} onClick={()=>adjustCart(item.cKey,-1)}>−</button>
                          <span style={{fontSize:14,fontWeight:800,minWidth:20,textAlign:"center"}}>{item.qty}</span>
                          <button style={qBtn} onClick={()=>adjustCart(item.cKey,1)}>+</button>
                        </div>
                      </div>
                      <div style={{fontSize:13,fontWeight:800,color:C.dark}}>৳{(item.product.price*item.qty).toLocaleString()}</div>
                    </div>
                  ))}
                  <div style={{paddingTop:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0",borderTop:"2px solid rgba(255,255,255,0.4)",margin:"8px 0 16px"}}>
                      <span style={{fontWeight:800,fontSize:16}}>{t.total}</span>
                      <span style={{fontWeight:800,fontSize:20,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>৳{cartTotal.toLocaleString()}</span>
                    </div>
                    <button onClick={()=>{setCartOpen(false);setCheckoutModal(true);}} style={{...btn,width:"100%",padding:"13px",fontSize:15}}>{t.proceedCheckout}</button>
                    <div style={{fontSize:11,color:C.med,textAlign:"center",marginTop:10}}>{t.securePayment}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ══ CHECKOUT MODAL ══ */}
      {checkoutModal&&(
        <>
          <div onClick={()=>setCheckoutModal(false)} style={{position:"fixed",inset:0,background:"rgba(45,10,63,0.55)",zIndex:200}}/>
          <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:430,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderRadius:20,overflow:"hidden",zIndex:201,boxShadow:"0 20px 60px rgba(173,20,87,0.3)",border:"1px solid rgba(255,255,255,0.5)"}}>
            <div style={{background:GRAD,padding:"20px 28px"}}>
              <div style={{color:"#FFF",fontSize:17,fontWeight:800}}>🌸 {t.completeOrder}</div>
            </div>
            <div style={{padding:24}}>
              {[[t.fullName,"name","text","Your name"],[t.phoneNum,"phone","tel","01711-000000"],[t.email,"email","email","your@email.com"],[t.address,"address","text","House, Road, City"]].map(([l,k,tp,ph])=>(
                <div key={k} style={{marginBottom:12}}>
                  <label style={{fontSize:12,color:C.med,fontWeight:700}}>{l}</label>
                  <input style={inp} type={tp} placeholder={ph} value={customer[k]} onChange={e=>setCustomer(c=>({...c,[k]:e.target.value}))}/>
                </div>
              ))}
              <div style={{background:"rgba(255,255,255,0.5)",borderRadius:10,padding:"12px 16px",marginBottom:18,fontSize:13}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{color:C.med}}>{cartCount} items</span>
                  <span style={{fontWeight:700}}>৳{cartTotal.toLocaleString()}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:C.med}}>{t.delivery}</span>
                  <span style={{color:C.success,fontWeight:700}}>{t.free}</span>
                </div>
              </div>
              <button onClick={handleCheckout} disabled={payLoading} style={{...btn,width:"100%",padding:"13px",fontSize:15,opacity:payLoading?0.7:1}}>
                {payLoading?t.redirecting:`৳${cartTotal.toLocaleString()} — ${t.payNow}`}
              </button>
              <div style={{fontSize:11,color:C.med,textAlign:"center",marginTop:10}}>{t.securePayment}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
