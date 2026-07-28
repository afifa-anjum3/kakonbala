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

export default function App() {
  const [lang,setLang]=useState("bn");
  const [tab,setTab]=useState("shop");
  const [products,setProducts]=useState([]);
  const [orders,setOrders]=useState([]);
  const [cart,setCart]=useState([]);
  const [catFilter,setCatFilter]=useState("all");
  const [cartOpen,setCartOpen]=useState(false);
  const [showForm,setShowForm]=useState(false);
  const [checkoutModal,setCheckoutModal]=useState(false);
  const [payLoading,setPayLoading]=useState(false);
  const [notif,setNotif]=useState(null);
  const [uploading,setUploading]=useState(false);
  const [previewUrl,setPreviewUrl]=useState(null);
  const fileRef=useRef();
  const [newP,setNewP]=useState({name:"",category:"jewelry",price:"",stock:"",desc:"",imageUrl:""});
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
  const visible=catFilter==="all"?products:products.filter(p=>p.category===catFilter);

  function notify(msg){setNotif(msg);setTimeout(()=>setNotif(null),3000);}

  function addToCart(product){
    if(product.stock===0)return;
    setCart(prev=>{
      const ex=prev.find(i=>i.product.id===product.id);
      if(ex)return prev.map(i=>i.product.id===product.id?{...i,qty:i.qty+1}:i);
      return [...prev,{product,qty:1}];
    });
    notify(`✓ ${product.name} ${t.addedToCart}`);
  }
  function adjustCart(id,delta){
    setCart(prev=>prev.map(i=>i.product.id===id?{...i,qty:i.qty+delta}:i).filter(i=>i.qty>0));
  }

  async function handlePhotoChange(e){
    const file=e.target.files[0];
    if(!file)return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try{
      const sRef=ref(storage,`products/${Date.now()}_${file.name}`);
      await uploadBytes(sRef,file);
      const url=await getDownloadURL(sRef);
      setNewP(p=>({...p,imageUrl:url}));
      notify("✓ Photo uploaded!");
    }catch(err){notify("⚠ Upload failed: "+err.message);}
    setUploading(false);
  }

  async function addProduct(){
    if(!newP.name||!newP.price||!newP.stock)return notify("⚠ Fill all required fields");
    const catEmoji={jewelry:"💍",crafts:"🏺",clothing:"👗"};
    await addDoc(collection(db,"products"),{
      name:newP.name,category:newP.category,
      price:Number(newP.price),stock:Number(newP.stock),
      desc:newP.desc,emoji:catEmoji[newP.category],imageUrl:newP.imageUrl||"",
    });
    setNewP({name:"",category:"jewelry",price:"",stock:"",desc:"",imageUrl:""});
    setPreviewUrl(null);setShowForm(false);
    notify("✓ Product added!");
  }

  async function adjustStock(id,delta){
    await updateDoc(doc(db,"products",id),{stock:increment(delta)});
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
            {/* Hero Banner — light pink floral like reference image */}
            <div style={{borderRadius:20,marginBottom:28,overflow:"hidden",position:"relative",minHeight:180,
              background:"linear-gradient(120deg,#FFF0F8 0%,#FFE4F4 25%,#F8E0FF 50%,#FFE8F8 75%,#FFF5FC 100%)",
              boxShadow:"0 8px 32px rgba(173,20,87,0.2)",border:"1px solid rgba(255,255,255,0.8)"}}>
              {/* Soft pink glow blobs */}
              <div style={{position:"absolute",width:260,height:260,top:-80,left:-60,borderRadius:"50%",background:"rgba(230,130,180,0.18)",filter:"blur(50px)"}}/>
              <div style={{position:"absolute",width:200,height:200,bottom:-70,right:100,borderRadius:"50%",background:"rgba(180,100,220,0.12)",filter:"blur(40px)"}}/>
              <div style={{position:"absolute",width:150,height:150,top:-30,right:200,borderRadius:"50%",background:"rgba(255,180,220,0.15)",filter:"blur(35px)"}}/>
              {/* Gold ring */}
              <div style={{position:"absolute",top:"50%",right:55,transform:"translateY(-50%)",width:120,height:120,borderRadius:"50%",border:"1.5px solid rgba(200,150,50,0.45)",boxShadow:"0 0 20px rgba(200,150,50,0.1)"}}/>
              <div style={{position:"absolute",top:"50%",right:45,transform:"translateY(-50%)",width:148,height:148,borderRadius:"50%",border:"1px solid rgba(200,150,50,0.25)"}}/>
              {/* LEFT side flowers cluster */}
              <div style={{position:"absolute",top:-8,left:-10,fontSize:52,opacity:0.75,transform:"rotate(-15deg)",filter:"saturate(1.3)"}}>🌸</div>
              <div style={{position:"absolute",top:10,left:38,fontSize:36,opacity:0.7,transform:"rotate(5deg)"}}>💜</div>
              <div style={{position:"absolute",bottom:-10,left:-8,fontSize:48,opacity:0.7,transform:"rotate(10deg)"}}>🌷</div>
              <div style={{position:"absolute",bottom:10,left:42,fontSize:28,opacity:0.6,transform:"rotate(-8deg)"}}>🌸</div>
              <div style={{position:"absolute",top:52,left:5,fontSize:22,opacity:0.55,transform:"rotate(20deg)"}}>🦋</div>
              <div style={{position:"absolute",top:18,left:72,fontSize:14,opacity:0.5}}>✨</div>
              <div style={{position:"absolute",bottom:30,left:70,fontSize:12,opacity:0.45}}>✨</div>
              {/* RIGHT side flowers cluster */}
              <div style={{position:"absolute",top:-8,right:-10,fontSize:50,opacity:0.75,transform:"rotate(15deg)",filter:"saturate(1.3)"}}>🌸</div>
              <div style={{position:"absolute",top:12,right:38,fontSize:34,opacity:0.65,transform:"rotate(-5deg)"}}>💜</div>
              <div style={{position:"absolute",bottom:-10,right:-8,fontSize:46,opacity:0.7,transform:"rotate(-12deg)"}}>🌷</div>
              <div style={{position:"absolute",bottom:12,right:44,fontSize:26,opacity:0.6,transform:"rotate(8deg)"}}>🌸</div>
              <div style={{position:"absolute",top:55,right:8,fontSize:20,opacity:0.5,transform:"rotate(-15deg)"}}>🦋</div>
              <div style={{position:"absolute",top:20,right:75,fontSize:13,opacity:0.5}}>✨</div>
              <div style={{position:"absolute",bottom:28,right:72,fontSize:11,opacity:0.4}}>✨</div>
              {/* Top scattered sparkles */}
              <div style={{position:"absolute",top:14,left:"35%",fontSize:11,opacity:0.4,color:"#C8960A"}}>✦</div>
              <div style={{position:"absolute",top:8,left:"50%",fontSize:10,opacity:0.35,color:"#C8960A"}}>✦</div>
              <div style={{position:"absolute",bottom:14,left:"42%",fontSize:10,opacity:0.3,color:"#C8960A"}}>✦</div>
              {/* Text — dark on light background */}
              <div style={{position:"relative",zIndex:2,padding:"32px 160px 32px 130px",display:"flex",flexDirection:"column",justifyContent:"center",minHeight:180}}>
                <div style={{fontSize:11,color:"#9C4070",letterSpacing:3,textTransform:"uppercase",marginBottom:8,fontWeight:600}}>
                  হাতে তৈরি &nbsp;·&nbsp; HANDMADE &nbsp;✦
                </div>
                <h1 style={{fontSize:32,fontWeight:900,color:"#5C0A30",margin:0,textShadow:"0 1px 3px rgba(180,80,120,0.15)",letterSpacing:0.3}}>
                  {t.welcome}
                </h1>
                <p style={{color:"#7B3060",fontSize:14,margin:"8px 0 0",fontWeight:500}}>
                  {t.welcomeSub}
                </p>
                <div style={{marginTop:16,display:"flex",alignItems:"center",gap:8}}>
                  <div style={{height:1,width:45,background:"rgba(200,150,50,0.6)"}}/>
                  <span style={{color:"#C8960A",fontSize:14}}>✦</span>
                  <div style={{height:1,width:45,background:"rgba(200,150,50,0.6)"}}/>
                </div>
              </div>
            </div>

            {/* Category filter */}
            <div style={{display:"flex",gap:8,marginBottom:22,flexWrap:"wrap"}}>
              {[["all",t.allItems],["jewelry",t.jewelry],["crafts",t.crafts],["clothing",t.clothing]].map(([key,label])=>(
                <button key={key} onClick={()=>setCatFilter(key)} style={{
                  background:catFilter===key?GRAD:GLASS2,
                  color:catFilter===key?"#FFF":C.dark,
                  border:`1.5px solid ${catFilter===key?"transparent":"rgba(255,255,255,0.5)"}`,
                  padding:"7px 20px",borderRadius:20,cursor:"pointer",fontSize:13,
                  fontFamily:"inherit",fontWeight:600,backdropFilter:BLUR,
                  boxShadow:catFilter===key?"0 2px 10px rgba(173,20,87,0.4)":"none",
                }}>{label}</button>
              ))}
            </div>

            {products.length===0&&(
              <div style={{...glassCard,textAlign:"center",padding:"60px 0",color:C.med}}>
                <div style={{fontSize:50,marginBottom:12}}>🌸</div>
                <div style={{fontSize:15}}>Loading products...</div>
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:20}}>
              {visible.map(p=>(
                <div key={p.id} style={{...glassCard,overflow:"hidden",transition:"transform 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-6px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  <div style={{height:160,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative",background:"rgba(255,255,255,0.3)"}}>
                    {p.imageUrl
                      ?<img src={p.imageUrl} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      :<span style={{fontSize:60}}>{p.emoji}</span>
                    }
                    <span style={{position:"absolute",top:8,left:8,...catBadge(p.category)}}>{p.category}</span>
                  </div>
                  <div style={{padding:"14px 16px"}}>
                    <div style={{fontSize:14,fontWeight:700,color:C.dark,marginBottom:4}}>{p.name}</div>
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
                    <select style={inp} value={newP.category} onChange={e=>setNewP(p=>({...p,category:e.target.value}))}>
                      <option value="jewelry">💍 Jewelry / গহনা</option>
                      <option value="crafts">🏺 Crafts / ক্রাফট</option>
                      <option value="clothing">👗 Clothing / পোশাক</option>
                    </select>
                  </div>
                  <div style={{gridColumn:"span 2"}}>
                    <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:2}}>{t.description}</label>
                    <input style={inp} placeholder="Brief product description" value={newP.desc} onChange={e=>setNewP(p=>({...p,desc:e.target.value}))}/>
                  </div>
                  <div style={{gridColumn:"span 2"}}>
                    <label style={{fontSize:12,color:C.med,fontWeight:700,display:"block",marginBottom:6}}>{t.photo}</label>
                    <div style={{display:"flex",alignItems:"center",gap:16}}>
                      <input type="file" accept="image/*" ref={fileRef} style={{display:"none"}} onChange={handlePhotoChange}/>
                      <button type="button" onClick={()=>fileRef.current.click()} style={{...btn,padding:"8px 20px",fontSize:12}}>
                        {uploading?t.uploading:t.choosePhoto}
                      </button>
                      {previewUrl&&<img src={previewUrl} alt="preview" style={{width:60,height:60,objectFit:"cover",borderRadius:10,border:"2px solid rgba(255,255,255,0.6)"}}/>}
                      {newP.imageUrl&&!uploading&&<span style={{fontSize:11,color:C.success,fontWeight:600}}>{t.photoReady}</span>}
                    </div>
                    <div style={{fontSize:11,color:C.med,marginTop:4}}>{t.photoHint}</div>
                  </div>
                </div>
                <button style={{...btn,marginTop:16}} onClick={addProduct} disabled={uploading}>{t.saveDb}</button>
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
                      <td style={TD}><span style={catBadge(p.category)}>{p.category}</span></td>
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
