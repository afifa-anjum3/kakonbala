import React, { useState, useEffect, useRef, useCallback } from "react";
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, increment, serverTimestamp, query, orderBy, writeBatch, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

/* ── Constants ─────────────────────────────────────────────────── */
const PRIMARY = "#AD1457";
const PURPLE = "#6A1B9A";
const GOLD = "#F9A825";
const DARK = "#2D0A3F";
const MED = "#7B3F9E";
const LIGHT = "#B39DCA";
const SUCCESS = "#2E7D32";
const WARN = "#E65100";
const DANGER = "#C62828";
const INFO = "#1565C0";
const GRAD = `linear-gradient(135deg,${PRIMARY} 0%,${PURPLE} 60%,#4A148C 100%)`;
const GLASS = "rgba(255,255,255,0.75)";
const BLUR = "blur(12px)";
const ADMIN_EMAIL = "afifa.anjum3@gmail.com";

const CATS = {
  jewelry: {
    emoji: "💍",
    subs: [
      "Bangles",
      "Earrings",
      "Finger Ring",
      "Payel",
      "Necklace",
      "Nosepin",
      "Waist Band",
      "Hair Accessories",
    ],
  },
  crafts: {
    emoji: "🏺",
    subs: [
      "Mandala",
      "Canvas Paint",
      "Painted Glass Jar",
      "Wall Hanging",
      "Candle",
      "Clay Art",
      "Other",
    ],
  },
  clothing: {
    emoji: "👗",
    groups: {
      Women: [
        "Saree",
        "Tops",
        "Skirt",
        "Salwar Kameez",
        "Kurti",
        "Lehenga",
        "Other",
      ],
      Men: ["Panjabi", "T-Shirt", "Shirt", "Pant", "Fotua", "Other"],
      Child: ["Baby Boy", "Baby Girl"],
    },
  },
};

const COLOR_MAP = {
  red: "#E53935",
  crimson: "#DC143C",
  scarlet: "#FF2400",
  blue: "#1E88E5",
  navy: "#1A237E",
  skyblue: "#87CEEB",
  "sky blue": "#87CEEB",
  cobalt: "#0047AB",
  green: "#43A047",
  "dark green": "#1B5E20",
  lime: "#76FF03",
  olive: "#827717",
  emerald: "#50C878",
  pink: "#E91E63",
  hotpink: "#FF1493",
  "light pink": "#FFB6C1",
  lightpink: "#FFB6C1",
  blush: "#DE5D83",
  purple: "#8E24AA",
  violet: "#7F00FF",
  indigo: "#3F51B5",
  lavender: "#9575CD",
  yellow: "#FDD835",
  golden: "#FFD700",
  lemon: "#FFF176",
  mustard: "#FFDB58",
  orange: "#FB8C00",
  peach: "#FFAB91",
  coral: "#FF7043",
  salmon: "#FA8072",
  black: "#212121",
  white: "#FAFAFA",
  grey: "#757575",
  gray: "#757575",
  silver: "#BDBDBD",
  beige: "#F5F5DC",
  cream: "#FFF8E1",
  ivory: "#FFFFF0",
  gold: "#F9A825",
  bronze: "#CD7F32",
  copper: "#B87333",
  brown: "#795548",
  chocolate: "#D2691E",
  maroon: "#880E4F",
  burgundy: "#800020",
  teal: "#00796B",
  cyan: "#00BCD4",
  turquoise: "#40E0D0",
  aqua: "#00BCD4",
  mint: "#98FF98",
  magenta: "#E91E8F",
  fuchsia: "#FF00FF",
  rose: "#FF007F",
};

const monthlyData = [
  { month: "Nov", revenue: 28400, orders: 18 },
  { month: "Dec", revenue: 45200, orders: 31 },
  { month: "Jan", revenue: 32100, orders: 22 },
  { month: "Feb", revenue: 38700, orders: 26 },
  { month: "Mar", revenue: 41300, orders: 29 },
  { month: "Apr", revenue: 52800, orders: 37 },
];
const catRevData = [
  { name: "Jewelry", value: 68000 },
  { name: "Crafts", value: 54000 },
  { name: "Clothing", value: 62000 },
];
const PIE_COLORS = [PRIMARY, PURPLE, GOLD];

const T = {
  en: {
    shopName: "Kakonbala",
    tagline: "Handmade Jewelry, Crafts & Clothing",
    welcome: "Welcome to Kakonbala!",
    welcomeSub: "Every piece handcrafted with tradition and love 🌸",
    allItems: "✨ All Items",
    jewelry: "💍 Jewelry",
    crafts: "🏺 Crafts",
    clothing: "👗 Clothing",
    addCart: "🛒 Add to Cart",
    outOfStock: "Out of Stock",
    inStock: "in stock",
    left: "left",
    shop: "🛍 Shop",
    dashboard: "📊 Dashboard",
    inventory: "📦 Inventory",
    orders: "📋 Orders",
    cart: "🛒 Cart",
    cartEmpty: "Your cart is empty",
    proceedCheckout: "Proceed to Checkout →",
    total: "Total",
    delivery: "Delivery",
    free: "Free 💝",
    yourCart: "Your Cart",
    dashTitle: "Business Dashboard",
    totalRevenue: "Total Revenue",
    allOrders: "All Orders",
    products: "Products",
    totalStock: "Total Stock",
    lowStockAlert: "⚠ Low Stock — restock soon",
    monthlyRev: "Monthly Revenue (৳)",
    catRevenue: "Revenue by Category",
    orderTrend: "Monthly Order Trend",
    invTitle: "Stock Inventory",
    invSub: "All changes sync live to Firestore",
    addProduct: "+ Add Product",
    cancel: "✕ Cancel",
    saveDb: "✓ Save to Database",
    productName: "Product Name *",
    price: "Price (৳) *",
    stockQty: "Stock Qty *",
    category: "Category *",
    description: "Description",
    photo: "📸 Photos (up to 5)",
    totalProducts: "Total Products",
    totalStockUnits: "Total Stock Units",
    lowStockItems: "Low Stock Items",
    ordersTitle: "Order History",
    ordersLive: "orders · Live",
    paid: "Paid",
    processing: "Processing",
    shipped: "Shipped",
    pendingPay: "Pending Payment",
    orderId: "Order ID",
    date: "Date",
    customer: "Customer",
    phone: "Phone",
    items: "Items",
    totalRevAll: "Total revenue (all orders)",
    noOrders: "No orders yet",
    completeOrder: "Complete Your Order",
    fullName: "Full Name *",
    phoneNum: "Phone *",
    email: "Email",
    address: "Delivery Address",
    payNow: "Pay via SSLCommerz",
    redirecting: "Redirecting...",
    securePayment: "🔒 bKash · Nagad · Visa · MasterCard",
    adjust: "Adjust",
    status: "Status",
    lowStock: "Low Stock",
    noStock: "Out of Stock",
    inStockLabel: "In Stock",
    addedToCart: "added to cart!",
  },
  bn: {
    shopName: "কাঁকনবালা",
    tagline: "হাতে তৈরি গহনা, ক্রাফট ও পোশাক",
    welcome: "কাঁকনবালায় স্বাগতম!",
    welcomeSub: "প্রতিটি পণ্য হাতে তৈরি, ভালোবাসায় মোড়ানো 🌸",
    allItems: "✨ সব পণ্য",
    jewelry: "💍 গহনা",
    crafts: "🏺 ক্রাফট",
    clothing: "👗 পোশাক",
    addCart: "🛒 কার্টে যোগ করুন",
    outOfStock: "স্টক নেই",
    inStock: "স্টকে",
    left: "বাকি",
    shop: "🛍 শপ",
    dashboard: "📊 ড্যাশবোর্ড",
    inventory: "📦 ইনভেন্টরি",
    orders: "📋 অর্ডার",
    cart: "🛒 কার্ট",
    cartEmpty: "কার্ট খালি আছে",
    proceedCheckout: "অর্ডার করুন →",
    total: "মোট",
    delivery: "ডেলিভারি",
    free: "বিনামূল্যে 💝",
    yourCart: "আপনার কার্ট",
    dashTitle: "ব্যবসার সারসংক্ষেপ",
    totalRevenue: "মোট আয়",
    allOrders: "অর্ডার",
    products: "পণ্য",
    totalStock: "মোট স্টক",
    lowStockAlert: "⚠ কম স্টক — দ্রুত রিস্টক করুন",
    monthlyRev: "মাসিক আয় (৳)",
    catRevenue: "ক্যাটাগরি অনুযায়ী আয়",
    orderTrend: "মাসিক অর্ডার ট্রেন্ড",
    invTitle: "স্টক ম্যানেজমেন্ট",
    invSub: "সব পরিবর্তন Firestore-এ সাথে সাথে সেভ হয়",
    addProduct: "+ নতুন পণ্য যোগ করুন",
    cancel: "✕ বাতিল",
    saveDb: "✓ ডেটাবেসে সেভ করুন",
    productName: "পণ্যের নাম *",
    price: "মূল্য (৳) *",
    stockQty: "স্টক পরিমাণ *",
    category: "ক্যাটাগরি *",
    description: "বিবরণ",
    photo: "📸 ছবি (সর্বোচ্চ ৫টি)",
    totalProducts: "মোট পণ্য",
    totalStockUnits: "মোট স্টক ইউনিট",
    lowStockItems: "কম স্টক পণ্য",
    ordersTitle: "অর্ডার হিস্ট্রি",
    ordersLive: "টি অর্ডার · লাইভ",
    paid: "পেইড",
    processing: "প্রক্রিয়াধীন",
    shipped: "পাঠানো হয়েছে",
    pendingPay: "পেমেন্ট বাকি",
    orderId: "অর্ডার ID",
    date: "তারিখ",
    customer: "কাস্টমার",
    phone: "ফোন",
    items: "পণ্য",
    totalRevAll: "মোট আয় (সব অর্ডার)",
    noOrders: "এখনো কোনো অর্ডার নেই",
    completeOrder: "অর্ডার সম্পন্ন করুন",
    fullName: "পুরো নাম *",
    phoneNum: "ফোন নম্বর *",
    email: "ইমেইল",
    address: "ডেলিভারি ঠিকানা",
    payNow: "SSLCommerz-এ পেমেন্ট করুন",
    redirecting: "পেমেন্ট পেজে যাচ্ছে...",
    securePayment: "🔒 bKash · Nagad · Visa · MasterCard",
    adjust: "স্টক পরিবর্তন",
    status: "অবস্থা",
    lowStock: "কম স্টক",
    noStock: "স্টক নেই",
    inStockLabel: "স্টকে আছে",
    addedToCart: "কার্টে যোগ হয়েছে!",
  },
};

/* ── Styles ─────────────────────────────────────────────────────── */
const btn = {
  background: GRAD,
  color: "#FFF",
  border: "none",
  padding: "10px 22px",
  borderRadius: 20,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
  fontFamily: "inherit",
  boxShadow: `0 4px 15px rgba(173,20,87,0.35)`,
};
const inp = {
  width: "100%",
  padding: "9px 12px",
  border: `1.5px solid rgba(173,20,87,0.25)`,
  borderRadius: 10,
  fontSize: 13,
  fontFamily: "inherit",
  background: "rgba(255,255,255,0.85)",
  color: DARK,
  boxSizing: "border-box",
  marginTop: 2,
};
const glass = {
  background: GLASS,
  backdropFilter: BLUR,
  WebkitBackdropFilter: BLUR,
  border: "1px solid rgba(255,255,255,0.5)",
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(106,27,154,0.12)",
};
const TH = {
  textAlign: "left",
  padding: "10px 14px",
  background: "rgba(248,234,246,0.8)",
  color: PURPLE,
  fontWeight: 700,
  borderBottom: "1px solid rgba(255,255,255,0.4)",
  fontSize: 12,
};
const TD = {
  padding: "10px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.3)",
  verticalAlign: "middle",
};
const qBtnS = {
  width: 30,
  height: 30,
  background: "rgba(248,234,246,0.8)",
  border: `1px solid rgba(173,20,87,0.2)`,
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
  color: PURPLE,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

function catBadge(cat) {
  const bg =
    cat === "jewelry"
      ? "rgba(252,228,236,0.9)"
      : cat === "crafts"
        ? "rgba(243,229,245,0.9)"
        : "rgba(237,231,246,0.9)";
  const color =
    cat === "jewelry" ? PRIMARY : cat === "crafts" ? PURPLE : "#4527A0";
  return {
    display: "inline-block",
    fontSize: 10,
    padding: "2px 8px",
    borderRadius: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    background: bg,
    color,
  };
}
function stockTag(n) {
  return {
    fontSize: 11,
    padding: "2px 8px",
    borderRadius: 10,
    fontWeight: 700,
    background: n <= 5 ? "rgba(255,235,238,0.9)" : "rgba(232,245,233,0.9)",
    color: n <= 5 ? DANGER : SUCCESS,
  };
}
function statusBadge(s) {
  const isPaid = s === "paid" || s === "delivered";
  const isShipped = s === "shipped";
  const isPending = s === "pending_payment";
  return {
    display: "inline-block",
    fontSize: 11,
    padding: "3px 10px",
    borderRadius: 10,
    fontWeight: 600,
    background: isPaid
      ? "rgba(232,245,233,0.85)"
      : isShipped
        ? "rgba(227,242,253,0.85)"
        : isPending
          ? "rgba(255,235,238,0.85)"
          : "rgba(255,243,224,0.85)",
    color: isPaid ? SUCCESS : isShipped ? INFO : isPending ? DANGER : WARN,
  };
}
function metCard(c) {
  return {
    ...glass,
    padding: "16px 20px",
    borderLeft: `4px solid ${c || PRIMARY}`,
  };
}

/* ── Bangladesh Address Data ── */
const BD_ADDRESS = {
  Dhaka: {
    Dhanmondi: {
      Dhanmondi: ["Dhanmondi HO - 1209", "Jigatola - 1209", "Kalabagan - 1205"],
      Hazaribagh: ["Hazaribagh - 1209", "Rayerbazar - 1209"],
      Lalbagh: ["Lalbagh - 1211", "Azimpur - 1205", "Bangshal - 1100"],
    },
    Gulshan: {
      Gulshan: ["Gulshan - 1212", "Baridhara - 1212", "Niketon - 1212"],
      Banani: ["Banani - 1213", "Mohakhali - 1212"],
      Badda: ["Badda - 1212", "Rampura - 1219"],
    },
    Mirpur: {
      Mirpur: ["Mirpur-1 - 1216", "Mirpur-10 - 1216", "Pallabi - 1216"],
      Kafrul: ["Kafrul - 1215", "Taltola - 1215"],
      "Shah Ali": ["Shah Ali - 1216", "Rupnagar - 1216"],
    },
    Uttara: {
      Uttara: ["Uttara - 1230", "Uttara Model Town - 1230"],
      Turag: ["Turag - 1230", "Diabari - 1230"],
      Dakshinkhan: ["Dakshinkhan - 1230", "Ashkona - 1229"],
    },
    Motijheel: {
      Motijheel: ["Motijheel - 1000", "Arambagh - 1000", "Fakirapool - 1000"],
      Tejgaon: ["Tejgaon - 1215", "Farmgate - 1215", "Kawran Bazar - 1215"],
      Paltan: ["Paltan - 1000", "Nayapaltan - 1000", "Bijoynagar - 1000"],
    },
    Demra: {
      Demra: ["Demra - 1361", "Shyampur - 1204"],
      Kadamtali: ["Kadamtali - 1204", "Matuail - 1362"],
    },
    Savar: {
      Savar: ["Savar - 1340", "Ashulia - 1341", "Birulia - 1341"],
      Keraniganj: ["Keraniganj - 1310", "Aganagar - 1311"],
    },
  },
  Gazipur: {
    "Gazipur Sadar": {
      "Gazipur Sadar": ["Gazipur - 1700", "Tongi - 1712", "Pubail - 1724"],
      Tongi: ["Tongi - 1712", "Bhulta - 1460"],
    },
    Kaliakair: { Kaliakair: ["Kaliakair - 1750", "Chandra - 1751"] },
    Kapasia: { Kapasia: ["Kapasia - 1730", "Ghagutia - 1732"] },
  },
  Narayanganj: {
    "Narayanganj Sadar": {
      Narayanganj: ["Narayanganj - 1400", "Siddhirganj - 1401"],
      Fatullah: ["Fatullah - 1421", "Enayetnagar - 1421"],
    },
    Araihazar: { Araihazar: ["Araihazar - 1450", "Gouripur - 1452"] },
    Rupganj: { Rupganj: ["Rupganj - 1460", "Bhulta - 1460", "Kanchan - 1461"] },
  },
  Chittagong: {
    "Chittagong Sadar": {
      Kotwali: [
        "Chittagong HO - 4000",
        "Anderkilla - 4000",
        "Chawk Bazar - 4000",
      ],
      "Double Mooring": ["Double Mooring - 4100", "Patenga - 4204"],
      Pahartali: ["Pahartali - 4202", "Baizid Bostami - 4210"],
    },
    Hathazari: { Hathazari: ["Hathazari - 4330", "Meorazari - 4332"] },
    Chandgaon: { Chandgaon: ["Chandgaon - 4212", "Nasirabad - 4210"] },
    Sitakunda: { Sitakunda: ["Sitakunda - 4310", "Bhatiyari - 4311"] },
  },
  "Cox's Bazar": {
    "Cox's Bazar Sadar": {
      "Cox's Bazar": ["Cox's Bazar - 4700", "Kolatoli - 4700"],
    },
    Ukhia: { Ukhia: ["Ukhia - 4730", "Teknaf - 4761"] },
    Teknaf: { Teknaf: ["Teknaf - 4761", "Shah Porir Dwip - 4762"] },
  },
  Sylhet: {
    "Sylhet Sadar": {
      Sylhet: ["Sylhet HO - 3100", "Ambarkhana - 3100", "Zindabazar - 3100"],
      Kotwali: ["Kotwali - 3100", "Bondor Bazar - 3100"],
    },
    Golapganj: { Golapganj: ["Golapganj - 3170", "Fulbari - 3172"] },
    Beanibazar: { Beanibazar: ["Beanibazar - 3150", "Mograbajar - 3152"] },
  },
  Rajshahi: {
    "Rajshahi Sadar": {
      Rajshahi: [
        "Rajshahi HO - 6000",
        "Shaheb Bazar - 6000",
        "Uposhahar - 6202",
      ],
      Boalia: ["Boalia - 6100", "Rajpara - 6000"],
    },
    Godagari: { Godagari: ["Godagari - 6280", "Paba - 6240"] },
    Puthia: { Puthia: ["Puthia - 6250", "Belpukur - 6252"] },
  },
  Khulna: {
    "Khulna Sadar": {
      Khulna: ["Khulna HO - 9000", "Boyra - 9000", "Daulatpur - 9210"],
      Sonadanga: ["Sonadanga - 9000", "Khalishpur - 9000"],
    },
    Batiaghata: { Batiaghata: ["Batiaghata - 9351", "Surkhali - 9352"] },
    Rupsha: { Rupsha: ["Rupsha - 9221", "Alaipur - 9220"] },
  },
  Barisal: {
    "Barisal Sadar": {
      Barisal: ["Barisal HO - 8200", "Nathullabad - 8201", "Rupatali - 8202"],
      Kotwali: ["Kotwali - 8200", "Band Road - 8200"],
    },
    Bakerganj: { Bakerganj: ["Bakerganj - 8210", "Vadra - 8213"] },
    Wazirpur: { Wazirpur: ["Wazirpur - 8260", "Bambaria - 8261"] },
  },
  Rangpur: {
    "Rangpur Sadar": {
      Rangpur: ["Rangpur HO - 5400", "Dhap - 5400", "Modern - 5401"],
      Kotwali: ["Kotwali - 5400", "Shapla Chattar - 5400"],
    },
    Mithapukur: { Mithapukur: ["Mithapukur - 5460", "Parbatipur - 5250"] },
    Pirganj: { Pirganj: ["Pirganj - 5450", "Misripara - 5451"] },
  },
  Mymensingh: {
    "Mymensingh Sadar": {
      Mymensingh: [
        "Mymensingh HO - 2200",
        "Brahmaputra - 2200",
        "Ganginarpar - 2201",
      ],
      Kotwali: ["Kotwali - 2200", "Kewatkhali - 2201"],
    },
    Trishal: { Trishal: ["Trishal - 2240", "Dhanikhola - 2241"] },
    Muktagachha: { Muktagachha: ["Muktagachha - 2210", "Bhabkhali - 2211"] },
  },
  Comilla: {
    "Comilla Sadar": {
      Comilla: [
        "Comilla HO - 3500",
        "Kandirpar - 3500",
        "Tomsom Bridge - 3500",
      ],
      Kotwali: ["Kotwali - 3500", "Laksham Road - 3500"],
    },
    Brahmanpara: { Brahmanpara: ["Brahmanpara - 3540", "Siddhi - 3542"] },
    Chandina: { Chandina: ["Chandina - 3510", "Maijchar - 3511"] },
  },
  Bogra: {
    "Bogra Sadar": {
      Bogra: ["Bogra HO - 5800", "Sherpur Road - 5800", "Malopara - 5800"],
      Kotwali: ["Kotwali - 5800", "Station Road - 5800"],
    },
    Sherpur: { Sherpur: ["Sherpur - 5840", "Bheluripara - 5841"] },
  },
  Jessore: {
    "Jessore Sadar": {
      Jessore: [
        "Jessore HO - 7400",
        "Chanchra - 7400",
        "Monirampur Road - 7400",
      ],
      Kotwali: ["Kotwali - 7400", "Boro Bazar - 7400"],
    },
    Benapole: { Benapole: ["Benapole - 7431", "Sharsha - 7430"] },
    Jhikargachha: { Jhikargachha: ["Jhikargachha - 7420", "Godkhali - 7421"] },
  },
  Dinajpur: {
    "Dinajpur Sadar": {
      Dinajpur: ["Dinajpur HO - 5200", "Munshipara - 5200", "Ful Bari - 5200"],
    },
    Birampur: { Birampur: ["Birampur - 5220", "Nandoil - 5221"] },
  },
  Faridpur: {
    "Faridpur Sadar": { Faridpur: ["Faridpur HO - 7800", "Alipur - 7800"] },
    Bhanga: { Bhanga: ["Bhanga - 7810", "Charbhadrasan - 7840"] },
  },
  Tangail: {
    "Tangail Sadar": {
      Tangail: ["Tangail HO - 1900", "Akur Takur Para - 1900"],
    },
    Ghatail: { Ghatail: ["Ghatail - 1980", "Dhopakandi - 1981"] },
    Sakhipur: { Sakhipur: ["Sakhipur - 1960", "Kakraid - 1961"] },
  },
  Narsingdi: {
    "Narsingdi Sadar": { Narsingdi: ["Narsingdi HO - 1600", "Shibpur - 1620"] },
    Palash: { Palash: ["Palash - 1610", "Ghoda Shail - 1611"] },
  },
  Manikganj: {
    "Manikganj Sadar": { Manikganj: ["Manikganj HO - 1800", "Ghior - 1840"] },
    Singair: { Singair: ["Singair - 1820", "Bayra - 1821"] },
  },
  Munshiganj: {
    "Munshiganj Sadar": {
      Munshiganj: ["Munshiganj HO - 1500", "Mirkadim - 1501"],
    },
    Srinagar: { Srinagar: ["Srinagar - 1540", "Shyamside - 1541"] },
  },
  Madaripur: {
    "Madaripur Sadar": {
      Madaripur: ["Madaripur HO - 7900", "Kalikapur - 7900"],
    },
    Shibchar: { Shibchar: ["Shibchar - 7910", "Bandhabari - 7912"] },
  },
  Shariatpur: {
    "Shariatpur Sadar": {
      Shariatpur: ["Shariatpur HO - 8000", "Palong - 8021"],
    },
    Damudya: { Damudya: ["Damudya - 8010", "Rudrakar - 8011"] },
  },
  Gopalganj: {
    "Gopalganj Sadar": {
      Gopalganj: ["Gopalganj HO - 8100", "Kashiani - 8120"],
    },
    Kotalipara: { Kotalipara: ["Kotalipara - 8110", "Ratail - 8111"] },
  },
  Kishoreganj: {
    "Kishoreganj Sadar": {
      Kishoreganj: ["Kishoreganj HO - 2300", "Kuliarchar - 2310"],
    },
    Bajitpur: { Bajitpur: ["Bajitpur - 2330", "Saraswati - 2332"] },
  },
  Netrokona: {
    "Netrokona Sadar": {
      Netrokona: ["Netrokona HO - 2400", "Mohanganj - 2440"],
    },
    Kendua: { Kendua: ["Kendua - 2420", "Baro Sona - 2421"] },
  },
  Jamalpur: {
    "Jamalpur Sadar": {
      Jamalpur: ["Jamalpur HO - 2000", "Sarishabari - 2040"],
    },
    Melandaha: { Melandaha: ["Melandaha - 2020", "Jhaugara - 2021"] },
  },
  Sherpur: {
    "Sherpur Sadar": { Sherpur: ["Sherpur HO - 2100", "Jhenaigati - 2120"] },
    Nakla: { Nakla: ["Nakla - 2110", "Urfa - 2111"] },
  },
  Pabna: {
    "Pabna Sadar": { Pabna: ["Pabna HO - 6600", "Santhia - 6640"] },
    Chatmohar: { Chatmohar: ["Chatmohar - 6620", "Faridpur - 6621"] },
  },
  Natore: {
    "Natore Sadar": { Natore: ["Natore HO - 6400", "Baraigram - 6430"] },
    Lalpur: { Lalpur: ["Lalpur - 6420", "Duaria - 6421"] },
  },
  Naogaon: {
    "Naogaon Sadar": { Naogaon: ["Naogaon HO - 6500", "Manda - 6530"] },
    Raninagar: { Raninagar: ["Raninagar - 6560", "Abhaynagar - 6561"] },
  },
  Chapainawabganj: {
    "Chapainawabganj Sadar": {
      Chapainawabganj: ["Chapainawabganj HO - 6300", "Shibganj - 6310"],
    },
    Gomastapur: { Gomastapur: ["Gomastapur - 6320", "Nachol - 6330"] },
  },
  Joypurhat: {
    "Joypurhat Sadar": {
      Joypurhat: ["Joypurhat HO - 5900", "Akkelpur - 5910"],
    },
    Panchbibi: { Panchbibi: ["Panchbibi - 5930", "Atapur - 5931"] },
  },
  Sirajganj: {
    "Sirajganj Sadar": { Sirajganj: ["Sirajganj HO - 6700", "Kazipur - 6730"] },
    Ullapara: { Ullapara: ["Ullapara - 6720", "Hatikumrul - 6721"] },
  },
  Kushtia: {
    "Kushtia Sadar": { Kushtia: ["Kushtia HO - 7000", "Kumarkhali - 7020"] },
    Khoksa: { Khoksa: ["Khoksa - 7010", "Jagati - 7011"] },
  },
  Chuadanga: {
    "Chuadanga Sadar": {
      Chuadanga: ["Chuadanga HO - 7200", "Alamdanga - 7210"],
    },
    Damurhuda: { Damurhuda: ["Damurhuda - 7220", "Jibanpur - 7221"] },
  },
  Meherpur: {
    "Meherpur Sadar": { Meherpur: ["Meherpur HO - 7100", "Gangni - 7110"] },
    Mujibnagar: { Mujibnagar: ["Mujibnagar - 7120", "Bahadurpur - 7121"] },
  },
  Jhenaidah: {
    "Jhenaidah Sadar": {
      Jhenaidah: ["Jhenaidah HO - 7300", "Kaliganj - 7340"],
    },
    Shailkupa: { Shailkupa: ["Shailkupa - 7320", "Durbachara - 7321"] },
  },
  Magura: {
    "Magura Sadar": { Magura: ["Magura HO - 7600", "Shalikha - 7620"] },
    Mohammadpur: { Mohammadpur: ["Mohammadpur - 7610", "Binodpur - 7611"] },
  },
  Narail: {
    "Narail Sadar": { Narail: ["Narail HO - 7500", "Lohagara - 7530"] },
    Kalia: { Kalia: ["Kalia - 7520", "Naragati - 7521"] },
  },
  Satkhira: {
    "Satkhira Sadar": { Satkhira: ["Satkhira HO - 9400", "Tala - 9420"] },
    Kaliganj: { Kaliganj: ["Kaliganj - 9410", "Nalta - 9411"] },
  },
  Bagerhat: {
    "Bagerhat Sadar": { Bagerhat: ["Bagerhat HO - 9300", "Kachua - 9320"] },
    Mongla: { Mongla: ["Mongla - 9350", "Rampal - 9360"] },
  },
  Patuakhali: {
    "Patuakhali Sadar": {
      Patuakhali: ["Patuakhali HO - 8600", "Bauphal - 8620"],
    },
    Kalapara: { Kalapara: ["Kalapara - 8640", "Nil Ganj - 8641"] },
  },
  Barguna: {
    "Barguna Sadar": { Barguna: ["Barguna HO - 8700", "Amtali - 8710"] },
    Betagi: { Betagi: ["Betagi - 8720", "Bamna - 8730"] },
  },
  Bhola: {
    "Bhola Sadar": { Bhola: ["Bhola HO - 8300", "Lalmohan - 8320"] },
    "Char Fasson": {
      "Char Fasson": ["Char Fasson - 8340", "Daulatkhan - 8310"],
    },
  },
  Pirojpur: {
    "Pirojpur Sadar": { Pirojpur: ["Pirojpur HO - 8500", "Nazirpur - 8510"] },
    Bhandaria: { Bhandaria: ["Bhandaria - 8520", "Patharghata - 8540"] },
  },
  Jhalokati: {
    "Jhalokati Sadar": {
      Jhalokati: ["Jhalokati HO - 8400", "Nalchity - 8420"],
    },
    Kathalia: { Kathalia: ["Kathalia - 8410", "Rajapur - 8430"] },
  },
  Feni: {
    "Feni Sadar": { Feni: ["Feni HO - 3900", "Daganbhuiyan - 3940"] },
    Chhagalnaiya: {
      Chhagalnaiya: ["Chhagalnaiya - 3920", "Subarna Char - 3941"],
    },
  },
  Noakhali: {
    "Noakhali Sadar": {
      Noakhali: ["Noakhali HO - 3800", "Maijdee - 3800", "Begumganj - 3820"],
    },
    Chatkhil: { Chatkhil: ["Chatkhil - 3840", "Sonaimuri - 3860"] },
  },
  Lakshmipur: {
    "Lakshmipur Sadar": {
      Lakshmipur: ["Lakshmipur HO - 3700", "Raipur - 3740"],
    },
    Ramganj: { Ramganj: ["Ramganj - 3720", "Ramgati - 3750"] },
  },
  Chandpur: {
    "Chandpur Sadar": { Chandpur: ["Chandpur HO - 3600", "Faridganj - 3630"] },
    Hajiganj: { Hajiganj: ["Hajiganj - 3610", "Kachua - 3620"] },
  },
  Brahmanbaria: {
    "Brahmanbaria Sadar": {
      Brahmanbaria: ["Brahmanbaria HO - 3400", "Nabinagar - 3430"],
    },
    Kasba: { Kasba: ["Kasba - 3410", "Akhaura - 3440"] },
  },
  Habiganj: {
    "Habiganj Sadar": {
      Habiganj: ["Habiganj HO - 3300", "Chunarughat - 3320"],
    },
    Madhabpur: { Madhabpur: ["Madhabpur - 3310", "Shayestaganj - 3330"] },
  },
  Moulvibazar: {
    "Moulvibazar Sadar": {
      Moulvibazar: ["Moulvibazar HO - 3200", "Srimangal - 3210"],
    },
    Barlekha: { Barlekha: ["Barlekha - 3230", "Kulaura - 3220"] },
  },
  Sunamganj: {
    "Sunamganj Sadar": {
      Sunamganj: ["Sunamganj HO - 3000", "Tahirpur - 3030"],
    },
    Dharmapasha: { Dharmapasha: ["Dharmapasha - 3040", "Jagannathpur - 3060"] },
  },
  Kurigram: {
    "Kurigram Sadar": { Kurigram: ["Kurigram HO - 5600", "Nageshwari - 5640"] },
    Ulipur: { Ulipur: ["Ulipur - 5620", "Chilmari - 5630"] },
  },
  Gaibandha: {
    "Gaibandha Sadar": {
      Gaibandha: ["Gaibandha HO - 5700", "Gobindaganj - 5740"],
    },
    Palashbari: { Palashbari: ["Palashbari - 5720", "Fulchari - 5730"] },
  },
  Nilphamari: {
    "Nilphamari Sadar": {
      Nilphamari: ["Nilphamari HO - 5300", "Saidpur - 5310"],
    },
    Jaldhaka: { Jaldhaka: ["Jaldhaka - 5320", "Domar - 5330"] },
  },
  Lalmonirhat: {
    "Lalmonirhat Sadar": {
      Lalmonirhat: ["Lalmonirhat HO - 5500", "Aditmari - 5510"],
    },
    Kaliganj: { Kaliganj: ["Kaliganj - 5520", "Hatibandha - 5530"] },
  },
  Panchagarh: {
    "Panchagarh Sadar": {
      Panchagarh: ["Panchagarh HO - 5010", "Tetulia - 5020"],
    },
    Boda: { Boda: ["Boda - 5030", "Atwari - 5040"] },
  },
  Thakurgaon: {
    "Thakurgaon Sadar": {
      Thakurgaon: ["Thakurgaon HO - 5100", "Pirganj - 5110"],
    },
    Baliadangi: { Baliadangi: ["Baliadangi - 5120", "Haripur - 5130"] },
  },
  Rajbari: {
    "Rajbari Sadar": { Rajbari: ["Rajbari HO - 7700", "Pangsha - 7720"] },
    Kalukhali: { Kalukhali: ["Kalukhali - 7710", "Baliakandi - 7730"] },
  },
  Khagrachhari: {
    "Khagrachhari Sadar": {
      Khagrachhari: ["Khagrachhari HO - 4400", "Mahalchhari - 4410"],
    },
    Ramgarh: { Ramgarh: ["Ramgarh - 4420", "Matiranga - 4430"] },
  },
  Rangamati: {
    "Rangamati Sadar": { Rangamati: ["Rangamati HO - 4500", "Kaptai - 4530"] },
    Barkal: { Barkal: ["Barkal - 4540", "Belaichhari - 4550"] },
  },
  Bandarban: {
    "Bandarban Sadar": { Bandarban: ["Bandarban HO - 4600", "Lama - 4620"] },
    Ruma: { Ruma: ["Ruma - 4630", "Rowangchhari - 4640"] },
  },
};
const BD_DISTRICTS = Object.keys(BD_ADDRESS).sort();

function getAreas(district) {
  return district ? Object.keys(BD_ADDRESS[district] || {}).sort() : [];
}
function getThanas(district, area) {
  return district && area
    ? Object.keys((BD_ADDRESS[district] || {})[area] || {}).sort()
    : [];
}
function getPostOffices(district, area, thana) {
  return district && area && thana
    ? ((BD_ADDRESS[district] || {})[area] || {})[thana] || []
    : [];
}

/* ── Validation helpers ── */
function validatePhone(phone) {
  const clean = phone.replace(/\s+/g, "");
  // Accept: 01XXXXXXXXX (11 digits) or +8801XXXXXXXXX (14 chars)
  const local = /^01[3-9]\d{8}$/;
  const intl = /^\+8801[3-9]\d{8}$/;
  return local.test(clean) || intl.test(clean);
}
function formatPhone(val) {
  // Only allow digits and leading +
  return val.replace(/[^\d+]/g, "").slice(0, 14);
}
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/* ── Error Boundary ── */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(e) {
    return { error: e.message || String(e) };
  }
  componentDidCatch(e, info) {
    console.error("Caught:", e, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 24,
            margin: 16,
            background: "rgba(255,235,238,0.95)",
            borderRadius: 14,
            border: "2px solid #E57373",
            color: "#C62828",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 15 }}>
            ⚠ Something went wrong — please screenshot this and share
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              wordBreak: "break-all",
              background: "rgba(255,255,255,0.8)",
              padding: 10,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            {this.state.error}
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              padding: "7px 16px",
              background: "#C62828",
              color: "#FFF",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Dismiss
          </button>
        </div>
      );
    }
    return this.props.children;
  }
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
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: "6px 8px",
        border: "1.5px solid rgba(173,20,87,0.25)",
        borderRadius: 10,
        background: "rgba(255,255,255,0.85)",
        minHeight: 38,
        alignItems: "center",
      }}
    >
      {vals.map((v) => (
        <span
          key={v}
          style={{
            background: "rgba(173,20,87,0.1)",
            color: "#AD1457",
            borderRadius: 20,
            padding: "2px 10px",
            fontSize: 12,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {v}
          <button
            onClick={() => onChange(vals.filter((x) => x !== v))}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#AD1457",
              fontSize: 14,
              lineHeight: 1,
              padding: 0,
              fontWeight: 700,
            }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={inp2}
        onChange={(e) => setInp2(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
          }
        }}
        onBlur={addTag}
        placeholder={vals.length === 0 ? ph : ""}
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 12,
          minWidth: 80,
          flex: 1,
        }}
      />
    </div>
  );
}

/* ── Carousel (product card thumbnails - simple auto-play) ── */
function Carousel({ images, emoji, height, primaryImage }) {
  const imgs = images || [];
  const em = emoji || "💍";
  const h = height || 180;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const baseImgs = primaryImage
    ? [primaryImage, ...imgs.filter((u) => u && u !== primaryImage)]
    : imgs;
  const valid = baseImgs.filter(Boolean);

  useEffect(() => {
    if (valid.length <= 1 || paused) return;
    const timer = setInterval(
      () => setIdx((i) => (i + 1) % valid.length),
      2800,
    );
    return () => clearInterval(timer);
  }, [valid.length, paused]);

  if (!valid.length) {
    return (
      <div
        style={{
          width: "100%",
          height: h,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.3)",
        }}
      >
        <span style={{ fontSize: 60 }}>{em}</span>
      </div>
    );
  }

  function handlePrev(e) {
    e.stopPropagation();
    setPaused(true);
    setIdx((i) => (i - 1 + valid.length) % valid.length);
  }
  function handleNext(e) {
    e.stopPropagation();
    setPaused(true);
    setIdx((i) => (i + 1) % valid.length);
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: h,
        overflow: "hidden",
        background: "rgba(255,255,255,0.3)",
      }}
    >
      <img
        src={valid[idx]}
        alt="product"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          padding: 4,
          transition: "opacity 0.3s",
        }}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
      {valid.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            style={{
              position: "absolute",
              left: 4,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.8)",
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 700,
              color: "#AD1457",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3,
            }}
          >
            ‹
          </button>
          <button
            onClick={handleNext}
            style={{
              position: "absolute",
              right: 4,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.8)",
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 700,
              color: "#AD1457",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3,
            }}
          >
            ›
          </button>
          <div
            style={{
              position: "absolute",
              bottom: 6,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 5,
              zIndex: 3,
            }}
          >
            {valid.map((_, i) => (
              <div
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setPaused(true);
                  setIdx(i);
                }}
                style={{
                  width: i === idx ? 14 : 6,
                  height: 6,
                  borderRadius: 3,
                  cursor: "pointer",
                  background: i === idx ? "#AD1457" : "rgba(255,255,255,0.7)",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              background: "rgba(173,20,87,0.75)",
              color: "#FFF",
              borderRadius: 10,
              padding: "1px 7px",
              fontSize: 9,
              fontWeight: 700,
            }}
          >
            {idx + 1}/{valid.length}
          </div>
        </>
      )}
    </div>
  );
}

/* ── ZoomableCarousel (product detail modal - zoom + pan + manual nav) ── */
function ZoomableCarousel({ images, emoji, height, primaryImage }) {
  const imgs = images || [];
  const em = emoji || "💍";
  const h = height || 300;
  const baseImgs = primaryImage
    ? [primaryImage, ...imgs.filter((u) => u && u !== primaryImage)]
    : imgs;
  const valid = baseImgs.filter(Boolean);

  const [idx, setIdx] = useState(0);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [manualNav, setManualNav] = useState(false);
  const containerRef = useRef(null);

  // Reset pan when image changes
  useEffect(() => {
    setPan({ x: 0, y: 0 });
    setScale(1);
  }, [idx]);
  // Reset idx when primaryImage changes
  useEffect(() => {
    setIdx(0);
  }, [primaryImage]);

  function resetZoom() {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }

  function goPrev(e) {
    e.stopPropagation();
    setManualNav(true);
    resetZoom();
    setIdx((i) => (i - 1 + valid.length) % valid.length);
  }
  function goNext(e) {
    e.stopPropagation();
    setManualNav(true);
    resetZoom();
    setIdx((i) => (i + 1) % valid.length);
  }
  function goDot(i, e) {
    e.stopPropagation();
    setManualNav(true);
    resetZoom();
    setIdx(i);
  }

  function onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setScale((s) => {
      const ns = Math.max(1, Math.min(4, s + delta));
      if (ns === 1) setPan({ x: 0, y: 0 });
      return ns;
    });
  }

  function onMouseDown(e) {
    if (scale > 1) {
      e.preventDefault();
      setDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }
  function onMouseMove(e) {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }
  function onMouseUp() {
    setDragging(false);
  }

  // Touch events for mobile
  const lastTouchDist = useRef(null);
  function onTouchStart(e) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  }
  function onTouchMove(e) {
    if (e.touches.length === 2 && lastTouchDist.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = dist / lastTouchDist.current;
      lastTouchDist.current = dist;
      setScale((s) => Math.max(1, Math.min(4, s * ratio)));
    }
  }
  function onTouchEnd() {
    lastTouchDist.current = null;
  }

  if (!valid.length) {
    return (
      <div
        style={{
          width: "100%",
          height: h,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,240,252,0.4)",
        }}
      >
        <span style={{ fontSize: 90 }}>{em}</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: h,
        overflow: "hidden",
        background: "rgba(255,255,255,0.35)",
        cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "default",
      }}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Image */}
      <img
        src={valid[idx]}
        alt="product"
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform:
            "scale(" +
            scale +
            ") translate(" +
            pan.x / scale +
            "px," +
            pan.y / scale +
            "px)",
          transition: dragging ? "none" : "transform 0.15s",
          userSelect: "none",
          pointerEvents: "none",
        }}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />

      {/* Prev / Next arrows */}
      {valid.length > 1 && (
        <>
          <button
            onClick={goPrev}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.9)",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              cursor: "pointer",
              fontSize: 22,
              fontWeight: 700,
              color: "#AD1457",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 5,
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#FFF")}
            onMouseLeave={(e) =>
              (e.target.style.background = "rgba(255,255,255,0.9)")
            }
          >
            ‹
          </button>
          <button
            onClick={goNext}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.9)",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              cursor: "pointer",
              fontSize: 22,
              fontWeight: 700,
              color: "#AD1457",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 5,
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#FFF")}
            onMouseLeave={(e) =>
              (e.target.style.background = "rgba(255,255,255,0.9)")
            }
          >
            ›
          </button>
        </>
      )}

      {/* Dot indicators */}
      {valid.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 6,
            zIndex: 5,
          }}
        >
          {valid.map((_, i) => (
            <div
              key={i}
              onClick={(e) => goDot(i, e)}
              style={{
                width: i === idx ? 18 : 8,
                height: 8,
                borderRadius: 4,
                cursor: "pointer",
                background: i === idx ? "#AD1457" : "rgba(255,255,255,0.75)",
                transition: "all 0.3s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          ))}
        </div>
      )}

      {/* Zoom controls */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          display: "flex",
          gap: 5,
          zIndex: 5,
          alignItems: "center",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScale((s) => Math.min(4, Math.round((s + 0.5) * 10) / 10));
          }}
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(173,20,87,0.3)",
            borderRadius: 8,
            width: 30,
            height: 30,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 700,
            color: "#AD1457",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          +
        </button>
        <span
          style={{
            background: "rgba(255,255,255,0.92)",
            borderRadius: 8,
            padding: "0 7px",
            fontSize: 11,
            fontWeight: 700,
            color: "#6A1B9A",
            height: 30,
            display: "flex",
            alignItems: "center",
            minWidth: 40,
            justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScale((s) => {
              const ns = Math.max(1, Math.round((s - 0.5) * 10) / 10);
              if (ns === 1) setPan({ x: 0, y: 0 });
              return ns;
            });
          }}
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(173,20,87,0.3)",
            borderRadius: 8,
            width: 30,
            height: 30,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 700,
            color: "#AD1457",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          −
        </button>
        {scale > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              resetZoom();
            }}
            style={{
              background: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(173,20,87,0.2)",
              borderRadius: 8,
              padding: "0 9px",
              height: 30,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              color: "#7B3F9E",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Hint */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          background: "rgba(255,255,255,0.75)",
          borderRadius: 6,
          padding: "2px 8px",
          fontSize: 9,
          color: "#7B3F9E",
          zIndex: 5,
        }}
      >
        {scale > 1
          ? "🖱️ Drag to pan · Scroll to zoom"
          : "🔍 +/− or scroll to zoom"}
      </div>

      {/* Image counter */}
      {valid.length > 1 && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "rgba(173,20,87,0.7)",
            color: "#FFF",
            borderRadius: 10,
            padding: "2px 9px",
            fontSize: 10,
            fontWeight: 700,
            zIndex: 5,
          }}
        >
          {idx + 1} / {valid.length}
        </div>
      )}
    </div>
  );
}

/* ── Pack Option Input ── */
function PackOptionInput({ options, onChange }) {
  const opts = options || [];
  const [lbl, setLbl] = useState("");
  const [prc, setPrc] = useState("");
  function addOpt() {
    if (!lbl.trim() || !prc) return;
    onChange([...opts, { label: lbl.trim(), price: Number(prc) }]);
    setLbl("");
    setPrc("");
  }
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 8,
        }}
      >
        {opts.map((o, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(173,20,87,0.06)",
              borderRadius: 8,
              padding: "6px 10px",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#AD1457",
                flex: 1,
              }}
            >
              {o.label}
            </span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#2D0A3F" }}>
              ৳{o.price}
            </span>
            <button
              onClick={() => onChange(opts.filter((_, k) => k !== i))}
              style={{
                background: "none",
                border: "none",
                color: "#C62828",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={lbl}
          onChange={(e) => setLbl(e.target.value)}
          placeholder="e.g. 1pc / Set of 3"
          style={{
            flex: 2,
            padding: "7px 10px",
            border: "1.5px solid rgba(173,20,87,0.25)",
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "inherit",
            background: "rgba(255,255,255,0.85)",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addOpt();
            }
          }}
        />
        <input
          value={prc}
          onChange={(e) => setPrc(e.target.value)}
          placeholder="৳ Price"
          type="number"
          style={{
            flex: 1,
            padding: "7px 10px",
            border: "1.5px solid rgba(173,20,87,0.25)",
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "inherit",
            background: "rgba(255,255,255,0.85)",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addOpt();
            }
          }}
        />
        <button
          onClick={addOpt}
          style={{
            padding: "7px 14px",
            background: "linear-gradient(135deg,#AD1457,#6A1B9A)",
            color: "#FFF",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          + Add
        </button>
      </div>
      <div style={{ fontSize: 10, color: "#B39DCA", marginTop: 4 }}>
        Each pack size can have a different price
      </div>
    </div>
  );
}

/* ── Color Image Mapper ── */
function ColorImageMapper({ colors, colorImages, onChange }) {
  const imgs = colorImages || {};
  const [expanded, setExpanded] = useState(null);
  const cmap = {
    red: "#E53935",
    blue: "#1E88E5",
    green: "#43A047",
    pink: "#E91E63",
    purple: "#8E24AA",
    yellow: "#FDD835",
    orange: "#FB8C00",
    black: "#212121",
    white: "#FAFAFA",
    gold: "#F9A825",
    silver: "#BDBDBD",
    grey: "#757575",
    brown: "#795548",
    maroon: "#880E4F",
    teal: "#00796B",
    coral: "#FF7043",
    navy: "#1A237E",
    lavender: "#9575CD",
    rose: "#FF007F",
    cream: "#FFF8E1",
    peach: "#FFAB91",
    mint: "#98FF98",
  };
  if (!colors || colors.length === 0) return null;
  return (
    <div
      style={{
        border: "1.5px solid rgba(173,20,87,0.2)",
        borderRadius: 10,
        padding: 12,
        background: "rgba(255,255,255,0.6)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#7B3F9E",
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        Link each color to a photo — customer sees this image when selecting
        that color
      </div>
      {colors.map((color) => {
        const hex = cmap[color.toLowerCase()];
        return (
          <div key={color} style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
              onClick={() =>
                setExpanded((prev) => (prev === color ? null : color))
              }
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: hex || "linear-gradient(135deg,#AD1457,#6A1B9A)",
                  border: "2px solid rgba(0,0,0,0.12)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#2D0A3F",
                  flex: 1,
                }}
              >
                {color}
              </span>
              {imgs[color] && (
                <span
                  style={{ fontSize: 10, color: "#2E7D32", fontWeight: 600 }}
                >
                  ✓
                </span>
              )}
              <span style={{ fontSize: 11, color: "#7B3F9E" }}>
                {expanded === color ? "▲" : "▼"}
              </span>
            </div>
            {expanded === color && (
              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  placeholder={"Image URL for " + color}
                  value={imgs[color] || ""}
                  onChange={(e) =>
                    onChange({ ...imgs, [color]: e.target.value })
                  }
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    border: "1.5px solid rgba(173,20,87,0.2)",
                    borderRadius: 8,
                    fontSize: 11,
                    fontFamily: "inherit",
                    background: "rgba(255,255,255,0.85)",
                  }}
                />
                {imgs[color] && (
                  <img
                    src={imgs[color]}
                    alt={color}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                    style={{
                      width: 36,
                      height: 36,
                      objectFit: "cover",
                      borderRadius: 6,
                      border: "1px solid rgba(173,20,87,0.2)",
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main App ───────────────────────────────────────────────────── */
export default function App() {
  const [lang, setLang] = useState("bn");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [tab, setTab] = useState("home");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [catFilter, setCatFilter] = useState("all");
  const [subFilter, setSubFilter] = useState("all");
  const [clothingGroup, setClothingGroup] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [notif, setNotif] = useState(null);
  const [selSize, setSelSize] = useState("");
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selColor, setSelColor] = useState("");
  const [selPiece, setSelPiece] = useState("");
  const [zoom, setZoom] = useState(1);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authWorking, setAuthWorking] = useState(false);
  const [newP, setNewP] = useState({
    name: "",
    category: "jewelry",
    price: "",
    stock: "",
    desc: "",
    imageUrls: [""],
    subcategory: "",
    clothingGroup: "",
    sizes: [],
    colors: [],
    pieceCounts: [],
    packOptions: [],
    colorImages: {},
  });
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    district: "",
    area: "",
    thana: "",
    postOffice: "",
    houseRoad: "",
    city: "",
  });
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(null);
  const [payMethod, setPayMethod] = useState("cod");
  const [transactionId, setTransactionId] = useState("");
  const [selectedGateway, setSelectedGateway] = useState("bKash");
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name:"",phone:"",email:"",district:"",area:"",thana:"",postOffice:"",houseRoad:"" });
  const [promoCodes, setPromoCodes] = useState([]);
  const [showPromoMgr, setShowPromoMgr] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: "",
    type: "percentage",
    value: "",
    minOrder: "",
    active: true,
  });

  const t = T[lang];
  const isAdmin = user && user.email === ADMIN_EMAIL;

  /* ── Firebase listeners ── */
  useEffect(() => {
    try {
      const unsub = onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (u) {
          try {
            const snap = await getDoc(doc(db, "customers", u.uid));
            if (snap.exists()) {
              const d = snap.data();
              setProfileData(d);
              setCustomer(c => ({ ...c, name:d.name||c.name, phone:d.phone||c.phone, email:d.email||c.email, district:d.district||c.district, area:d.area||c.area, thana:d.thana||c.thana, postOffice:d.postOffice||c.postOffice, houseRoad:d.houseRoad||c.houseRoad, city:d.district||c.city }));
            }
          } catch(e) { console.warn("Profile:", e.message); }
        }
      });
      return () => {
        try {
          unsub();
        } catch (e) {}
      };
    } catch (e) {
      console.warn("Auth:", e.message);
    }
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) =>
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "promoCodes"), (snap) =>
      setPromoCodes(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setSelSize("");
      setSelColor("");
      setSelPiece(selectedProduct.packOptions?.[0]?.label || "");
      setZoom(1);
      setActiveImgIdx(0);
      setPan({ x: 0, y: 0 });
    }
  }, [selectedProduct]);

  /* ── Derived ── */
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const lowStock = products.filter((p) => p.stock <= 5);
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const totalRev = monthlyData.reduce((s, m) => s + m.revenue, 0);
  const realIncome = orders
    .filter((o) => o.status === "delivered" || o.status === "paid")
    .reduce((s, o) => s + (o.total || 0), 0);
  const pendingIncome = orders
    .filter(
      (o) =>
        o.status === "processing" ||
        o.status === "in_packaging" ||
        o.status === "shipped",
    )
    .reduce((s, o) => s + (o.total || 0), 0);

  const allSizes = [...new Set(products.flatMap((p) => p.sizes || []))].sort();

  const visible = products
    .filter((p) => {
      if (catFilter !== "all" && p.category !== catFilter) return false;
      if (
        catFilter === "clothing" &&
        clothingGroup !== "all" &&
        p.clothingGroup !== clothingGroup
      )
        return false;
      if (subFilter !== "all" && p.subcategory !== subFilter) return false;
      // Price filter
      const pPrice =
        p.packOptions && p.packOptions.length > 0
          ? Math.min(...p.packOptions.map((o) => o.price))
          : p.price;
      if (pPrice < priceRange[0] || pPrice > priceRange[1]) return false;
      // Size filter
      if (
        selectedSizes.length > 0 &&
        !(p.sizes || []).some((s) => selectedSizes.includes(s))
      )
        return false;
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (p.name || "").toLowerCase().includes(q) ||
          (p.desc || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q) ||
          (p.subcategory || "").toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const pa =
        a.packOptions && a.packOptions.length > 0
          ? Math.min(...a.packOptions.map((o) => o.price))
          : a.price;
      const pb =
        b.packOptions && b.packOptions.length > 0
          ? Math.min(...b.packOptions.map((o) => o.price))
          : b.price;
      if (sortBy === "price_asc") return pa - pb;
      if (sortBy === "price_desc") return pb - pa;
      if (sortBy === "name_asc")
        return (a.name || "").localeCompare(b.name || "");
      return 0;
    });

  function notify(msg) {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  }

  /* ── Auth functions ── */
  async function handleSignup() {
    if (!authName || !authEmail || !authPassword)
      return setAuthError("Please fill all fields");
    if (authPassword.length < 6)
      return setAuthError("Password must be at least 6 characters");
    setAuthWorking(true);
    setAuthError("");
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        authEmail,
        authPassword,
      );
      await sendEmailVerification(result.user);
      await signOut(auth);
      setShowAuth(false);
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
      setAuthError("");
      notify(
        "📧 Verification email sent! Please check your inbox before logging in.",
      );
    } catch (e) {
      setAuthError(
        e.message.replace("Firebase: ", "").replace(/\(auth.*\)/, ""),
      );
    }
    setAuthWorking(false);
  }

  async function handleLogin() {
    if (!authEmail || !authPassword)
      return setAuthError("Please fill all fields");
    setAuthWorking(true);
    setAuthError("");
    try {
      const loginResult = await signInWithEmailAndPassword(
        auth,
        authEmail,
        authPassword,
      );
      if (
        !loginResult.user.emailVerified &&
        loginResult.user.email !== ADMIN_EMAIL
      ) {
        await signOut(auth);
        setAuthError(
          "⚠ Please verify your email first. Check your inbox for the verification link.",
        );
        setAuthWorking(false);
        return;
      }
      setShowAuth(false);
      setAuthEmail("");
      setAuthPassword("");
      notify("✓ Logged in!");
    } catch (e) {
      setAuthError(
        e.message.replace("Firebase: ", "").replace(/\(auth.*\)/, ""),
      );
    }
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
    const cKey = `${product.id}_${o.size || ""}_${o.color || ""}_${o.piece || ""}`;
    setCart((prev) => {
      const ex = prev.find((i) => i.cKey === cKey);
      if (ex)
        return prev.map((i) =>
          i.cKey === cKey ? { ...i, qty: i.qty + 1 } : i,
        );
      return [
        ...prev,
        {
          product,
          qty: 1,
          cKey,
          size: o.size || "",
          color: o.color || "",
          piece: o.piece || "",
        },
      ];
    });
    const optStr = [o.size, o.color, o.piece].filter(Boolean).join(" · ");
    notify(
      `✓ ${product.name}${optStr ? " (" + optStr + ")" : ""} ${t.addedToCart}`,
    );
  }

  function adjustCart(cKey, delta) {
    setCart((prev) =>
      prev
        .map((i) => (i.cKey === cKey ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  }

  /* ── Product CRUD ── */
  async function addProduct() {
    if (!newP.name || !newP.price || !newP.stock)
      return notify("⚠ Fill all required fields");
    const catEmoji = { jewelry: "💍", crafts: "🏺", clothing: "👗" };
    const validUrls = (newP.imageUrls || []).filter(Boolean);
    await addDoc(collection(db, "products"), {
      name: newP.name,
      category: newP.category,
      subcategory: newP.subcategory || "",
      clothingGroup: newP.clothingGroup || "",
      price: Number(newP.price),
      stock: Number(newP.stock),
      desc: newP.desc,
      emoji: catEmoji[newP.category],
      imageUrl: validUrls[0] || "",
      imageUrls: validUrls,
      sizes: newP.sizes || [],
      colors: newP.colors || [],
      pieceCounts: newP.pieceCounts || [],
    });
    setNewP({
      name: "",
      category: "jewelry",
      price: "",
      stock: "",
      desc: "",
      imageUrls: [""],
      subcategory: "",
      clothingGroup: "",
      sizes: [],
      colors: [],
      pieceCounts: [],
    });
    setShowForm(false);
    notify("✓ Product added!");
  }

  async function saveEdit() {
    if (!editProduct.name || !editProduct.price || !editProduct.stock)
      return notify("⚠ Fill all required fields");
    const base =
      editProduct.imageUrls && editProduct.imageUrls.length
        ? [...editProduct.imageUrls]
        : [editProduct.imageUrl || ""];
    const validUrls = base.filter(Boolean);
    await updateDoc(doc(db, "products", editProduct.id), {
      name: editProduct.name,
      category: editProduct.category,
      subcategory: editProduct.subcategory || "",
      clothingGroup: editProduct.clothingGroup || "",
      price: Number(editProduct.price),
      stock: Number(editProduct.stock),
      desc: editProduct.desc,
      imageUrl: validUrls[0] || "",
      imageUrls: validUrls,
      sizes: editProduct.sizes || [],
      colors: editProduct.colors || [],
      pieceCounts: editProduct.pieceCounts || [],
      packOptions: editProduct.packOptions || [],
      colorImages: editProduct.colorImages || {},
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

  function deliveryCharge() {
    const dist = (customer.district || customer.city || "").toLowerCase();
    if (!dist) return 0;
    if (dist.includes("dhaka")) return 80;
    return 150;
  }

  function finalTotal() {
    const disc = promoApplied ? promoApplied.discount : 0;
    return cartTotal + deliveryCharge() - disc;
  }

  async function applyPromo() {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    const promo = promoCodes.find(
      (p) => p.code?.toUpperCase() === code && p.active,
    );
    if (!promo) {
      notify("⚠ Invalid or expired promo code");
      return;
    }
    if (promo.minOrder && cartTotal < Number(promo.minOrder)) {
      notify(`⚠ Min order ৳${promo.minOrder} required for this code`);
      return;
    }
    const disc =
      promo.type === "percentage"
        ? Math.round((cartTotal * Number(promo.value)) / 100)
        : Number(promo.value);
    setPromoApplied({
      code,
      discount: disc,
      label:
        promo.type === "percentage"
          ? `${promo.value}% off`
          : `৳${promo.value} off`,
    });
    notify(`✓ Promo "${code}" applied! You save ৳${disc}`);
  }

  async function savePromo() {
    if (!newPromo.code || !newPromo.value)
      return notify("⚠ Fill code and value");
    await addDoc(collection(db, "promoCodes"), {
      code: newPromo.code.toUpperCase().trim(),
      type: newPromo.type,
      value: Number(newPromo.value),
      minOrder: Number(newPromo.minOrder) || 0,
      active: true,
    });
    setNewPromo({
      code: "",
      type: "percentage",
      value: "",
      minOrder: "",
      active: true,
    });
    notify("✓ Promo code created!");
  }

  async function togglePromo(id, current) {
    await updateDoc(doc(db, "promoCodes", id), { active: !current });
  }

  async function deletePromo(id) {
    await deleteDoc(doc(db, "promoCodes", id));
    notify("✓ Promo deleted");
  }

  function toggleWishlist(productId) {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }

  // All possible order statuses
  const ORDER_STATUSES = [
    {
      value: "processing",
      label: "🔄 Processing",
      color: "#E65100",
      bg: "rgba(255,243,224,0.9)",
    },
    {
      value: "in_packaging",
      label: "📦 In Packaging",
      color: "#1565C0",
      bg: "rgba(227,242,253,0.9)",
    },
    {
      value: "shipped",
      label: "🚚 Shipped",
      color: "#6A1B9A",
      bg: "rgba(237,231,246,0.9)",
    },
    {
      value: "delivered",
      label: "✅ Delivered",
      color: "#2E7D32",
      bg: "rgba(232,245,233,0.9)",
    },
    {
      value: "payment_due",
      label: "💳 Payment Due",
      color: "#C62828",
      bg: "rgba(255,235,238,0.9)",
    },
    {
      value: "cancelled",
      label: "❌ Cancelled",
      color: "#757575",
      bg: "rgba(245,245,245,0.9)",
    },
    {
      value: "pending_payment",
      label: "⏳ Pending Pay",
      color: "#E65100",
      bg: "rgba(255,243,224,0.9)",
    },
  ];

  async function updateOrderStatus(orderId, newStatus) {
    await updateDoc(doc(db, "orders", orderId), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    notify("✓ Order status updated to: " + newStatus.replace("_", " "));
  }

  async function clearDashboard() {
    if (
      !window.confirm(
        "Clear dashboard stats? This won't delete orders, just resets the static chart data.",
      )
    )
      return;
    notify("✓ Dashboard cleared");
  }

  async function handleCheckout() {
    if (!customer.name) {
      notify("⚠ Please enter your name");
      return;
    }
    if (!customer.phone || !validatePhone(customer.phone)) {
      notify("⚠ Enter valid BD phone: 01XXXXXXXXX");
      return;
    }
    if (customer.email && !validateEmail(customer.email)) {
      notify("⚠ Enter a valid email address");
      return;
    }
    if (
      !customer.district ||
      !customer.area ||
      !customer.thana ||
      !customer.postOffice ||
      !customer.houseRoad
    ) {
      notify("⚠ Please complete all address fields");
      return;
    }
    const dc = deliveryCharge();
    const disc = promoApplied ? promoApplied.discount : 0;
    const total = cartTotal + dc - disc;
    const orderData = {
      customer,
      items: cart.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        qty: i.qty,
        price: i.product.price,
      })),
      subtotal: cartTotal,
      deliveryCharge: dc,
      discount: disc,
      promoCode: promoApplied?.code || "",
      total,
      paymentMethod: payMethod,
      createdAt: serverTimestamp(),
    };

    if (payMethod === "cod") {
      if (dc === 150) {
        notify(
          "⚠ Outside Dhaka orders must pay online. Please select Online Payment.",
        );
        return;
      }
      // Batch: create order + deduct stock atomically
      const batch = writeBatch(db);
      const orderRef = doc(collection(db, "orders"));
      batch.set(orderRef, { ...orderData, status: "processing" });
      for (const item of cart) {
        batch.update(doc(db, "products", item.product.id), {
          stock: increment(-item.qty),
        });
      }
      await batch.commit();
      setCart([]);
      setCheckoutModal(false);
      setPromoApplied(null);
      setPromoCode("");
      notify("✓ Order placed! Cash on delivery confirmed 🎉");
      return;
    }

    // Mobile payment (bKash/Nagad/Rocket)
    if (!transactionId.trim()) { notify("⚠ Please send payment first, then enter Transaction ID"); return; }
    if (transactionId.trim().length < 6) { notify("⚠ Transaction ID too short. Please check again."); return; }
    setPayLoading(true);
    try {
      await addDoc(collection(db, "orders"), { ...orderData, status:"pending_payment", transactionId:transactionId.trim(), paymentGateway:selectedGateway });
      if (user && user.uid) {
        await setDoc(doc(db,"customers",user.uid), { name:customer.name, phone:customer.phone, email:customer.email||"", district:customer.district, area:customer.area, thana:customer.thana, postOffice:customer.postOffice, houseRoad:customer.houseRoad, updatedAt:serverTimestamp() }, { merge:true });
      }
      setCart([]); setCheckoutModal(false); setPromoApplied(null); setPromoCode(""); setTransactionId("");
      notify("✓ Order placed! We will confirm after verifying your " + selectedGateway + " payment.");
    } catch(e) { notify("⚠ " + e.message); }
    setPayLoading(false);
  }

  
  /* ── Sub-category helpers ── */
  function getSubOptions(cat, cg) {
    if (cat === "jewelry") return CATS.jewelry.subs;
    if (cat === "crafts") return CATS.crafts.subs;
    if (cat === "clothing" && cg) return CATS.clothing.groups[cg] || [];
    return [];
  }

  function getDisplayPrice(product, selPieceArg) {
    if (selPieceArg && product.packOptions && product.packOptions.length > 0) {
      const opt = product.packOptions.find((o) => o.label === selPieceArg);
      if (opt) return opt.price;
    }
    return product.price;
  }

  /* ── Photo URL helpers ── */
  function updatePhotoUrl(arr, i, val, setter) {
    const next = [...arr];
    next[i] = val;
    setter((p) => ({ ...p, imageUrls: next, imageUrl: next[0] || "" }));
  }
  function removePhoto(arr, i, setter) {
    const next = arr.filter((_, idx) => idx !== i);
    setter((p) => ({ ...p, imageUrls: next, imageUrl: next[0] || "" }));
  }
  function addPhotoSlot(arr, setter) {
    setter((p) => ({ ...p, imageUrls: [...arr, ""] }));
  }

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div
      style={{
        fontFamily: "'Hind Siliguri','Segoe UI',Arial,sans-serif",
        background:
          "linear-gradient(160deg,#FFE4F0 0%,#F8D7F8 20%,#EDD6FF 40%,#F5D0FF 60%,#FFD6EC 80%,#FFE8F5 100%)",
        minHeight: "100vh",
        color: DARK,
      }}
    >
      {/* ══ SIDE MENU DRAWER ══ */}
      {mobileMenu && (
        <div
          onClick={() => setMobileMenu(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,0,20,0.6)",
            zIndex: 300,
            backdropFilter: "blur(3px)",
          }}
        />
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 300,
          background: "#FFF",
          zIndex: 301,
          transform: mobileMenu ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: mobileMenu ? "8px 0 40px rgba(0,0,0,0.2)" : "none",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 20px 16px",
            borderBottom: `1px solid rgba(173,20,87,0.12)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src="/logo.jpg"
              alt="logo"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                objectFit: "cover",
                border: `1.5px solid rgba(173,20,87,0.3)`,
              }}
            />
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                background: GRAD,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              কাঁকনবালা
            </div>
          </div>
          <button
            onClick={() => setMobileMenu(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              cursor: "pointer",
              color: DARK,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Menu items */}
        <div style={{ flex: 1, padding: "8px 0" }}>
          {/* Home */}
          {[
            ["home", "🏠 Home"],
            ["shop", "🛍 Shop"],
            ["collections", "📦 Collections"],
            ["wishlist", "❤️ Wishlist"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                setMobileMenu(false);
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "13px 22px",
                background:
                  tab === key ? "rgba(173,20,87,0.06)" : "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: tab === key ? 700 : 500,
                color: tab === key ? PRIMARY : DARK,
                fontFamily: "inherit",
                borderLeft:
                  tab === key
                    ? `3px solid ${PRIMARY}`
                    : "3px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}

          <div
            style={{
              height: 1,
              background: "rgba(173,20,87,0.1)",
              margin: "8px 20px",
            }}
          />

          {/* Collections expandable */}
          <div style={{ padding: "4px 0" }}>
            <div
              style={{
                padding: "10px 22px 6px",
                fontSize: 10,
                color: LIGHT,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Shop by Category
            </div>

            {/* Jewelry */}
            <div>
              <button
                onClick={() =>
                  setExpandedMenu((e) => (e === "jewelry" ? null : "jewelry"))
                }
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "11px 22px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: DARK,
                  fontFamily: "inherit",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>💍 Jewelry / গহনা</span>
                <span
                  style={{
                    fontSize: 12,
                    transition: "transform 0.2s",
                    transform:
                      expandedMenu === "jewelry"
                        ? "rotate(90deg)"
                        : "rotate(0deg)",
                  }}
                >
                  ›
                </span>
              </button>
              {expandedMenu === "jewelry" && (
                <div
                  style={{
                    background: "rgba(173,20,87,0.03)",
                    borderLeft: `2px solid rgba(173,20,87,0.15)`,
                    marginLeft: 22,
                  }}
                >
                  {CATS.jewelry.subs.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setCatFilter("jewelry");
                        setSubFilter(s);
                        setTab("shop");
                        setMobileMenu(false);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 18px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        color: MED,
                        fontFamily: "inherit",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = PRIMARY)}
                      onMouseLeave={(e) => (e.target.style.color = MED)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Crafts */}
            <div>
              <button
                onClick={() =>
                  setExpandedMenu((e) => (e === "crafts" ? null : "crafts"))
                }
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "11px 22px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: DARK,
                  fontFamily: "inherit",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>🏺 Crafts / ক্রাফট</span>
                <span
                  style={{
                    fontSize: 12,
                    transition: "transform 0.2s",
                    transform:
                      expandedMenu === "crafts"
                        ? "rotate(90deg)"
                        : "rotate(0deg)",
                  }}
                >
                  ›
                </span>
              </button>
              {expandedMenu === "crafts" && (
                <div
                  style={{
                    background: "rgba(106,27,154,0.03)",
                    borderLeft: `2px solid rgba(106,27,154,0.15)`,
                    marginLeft: 22,
                  }}
                >
                  {CATS.crafts.subs.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setCatFilter("crafts");
                        setSubFilter(s);
                        setTab("shop");
                        setMobileMenu(false);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 18px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        color: MED,
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = PURPLE)}
                      onMouseLeave={(e) => (e.target.style.color = MED)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clothing */}
            <div>
              <button
                onClick={() =>
                  setExpandedMenu((e) => (e === "clothing" ? null : "clothing"))
                }
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "11px 22px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: DARK,
                  fontFamily: "inherit",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>👗 Clothing / পোশাক</span>
                <span
                  style={{
                    fontSize: 12,
                    transition: "transform 0.2s",
                    transform:
                      expandedMenu === "clothing"
                        ? "rotate(90deg)"
                        : "rotate(0deg)",
                  }}
                >
                  ›
                </span>
              </button>
              {expandedMenu === "clothing" && (
                <div
                  style={{
                    background: "rgba(249,168,37,0.04)",
                    borderLeft: `2px solid rgba(249,168,37,0.3)`,
                    marginLeft: 22,
                  }}
                >
                  {Object.entries(CATS.clothing.groups).map(([group, subs]) => (
                    <div key={group}>
                      <button
                        onClick={() =>
                          setExpandedMenu((e) => (e === group ? null : group))
                        }
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 18px",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#B8860B",
                          fontFamily: "inherit",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          {group === "Women"
                            ? "👩 Women"
                            : group === "Men"
                              ? "👨 Men"
                              : "👶 Child"}
                        </span>
                        <span style={{ fontSize: 11 }}>
                          {expandedMenu === group ? "▲" : "▼"}
                        </span>
                      </button>
                      {expandedMenu === group && (
                        <div style={{ paddingLeft: 12 }}>
                          {subs.map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                setCatFilter("clothing");
                                setClothingGroup(group);
                                setSubFilter(s);
                                setTab("shop");
                                setMobileMenu(false);
                                setExpandedMenu(null);
                              }}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "7px 18px",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 11,
                                color: MED,
                                fontFamily: "inherit",
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.color = "#B8860B")
                              }
                              onMouseLeave={(e) => (e.target.style.color = MED)}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              height: 1,
              background: "rgba(173,20,87,0.1)",
              margin: "8px 20px",
            }}
          />

          {/* About & Contact */}
          <button
            onClick={() => {
              setTab("home");
              setMobileMenu(false);
              setTimeout(
                () =>
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" }),
                300,
              );
            }}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "13px 22px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              color: DARK,
              fontFamily: "inherit",
            }}
          >
            🌸 About Us
          </button>
          <a
            href="https://wa.me/8801920895985"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "block",
              padding: "13px 22px",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              color: DARK,
            }}
          >
            📱 WhatsApp Us
          </a>
          <a
            href="mailto:kakonbala.official@gmail.com"
            style={{
              display: "block",
              padding: "13px 22px",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              color: DARK,
            }}
          >
            📧 Email Us
          </a>
        </div>

        {/* Auth at bottom */}
        <div
          style={{
            borderTop: `1px solid rgba(173,20,87,0.12)`,
            padding: "16px 22px",
          }}
        >
          {user ? (
            <div>
              <div style={{ fontSize: 12, color: MED, marginBottom: 8 }}>
                <button onClick={()=>{setShowProfile(true);setMobileMenu(false);}} style={{ width:"100%",textAlign:"left",padding:"10px 14px",background:"rgba(173,20,87,0.06)",border:"1px solid rgba(173,20,87,0.15)",borderRadius:10,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8 }}><span style={{ fontSize:18 }}>👤</span><div><div style={{ fontSize:12,fontWeight:700,color:PRIMARY }}>{isAdmin?"👑 Admin":user.email.split("@")[0]}</div><div style={{ fontSize:10,color:LIGHT }}>My Account</div></div></button>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenu(false);
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(255,235,238,0.8)",
                  border: `1px solid rgba(198,40,40,0.2)`,
                  color: DANGER,
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "inherit",
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowAuth(true);
                setMobileMenu(false);
              }}
              style={{
                width: "100%",
                padding: "12px",
                ...btn,
                borderRadius: 10,
                fontSize: 14,
              }}
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </div>

      {/* ANNOUNCEMENT BAR */}
      <div
        style={{
          background: GRAD,
          color: "#FFF",
          fontSize: 12,
          fontWeight: 600,
          padding: "7px 0",
          textAlign: "center",
          position: "sticky",
          top: 0,
          zIndex: 60,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            gap: 40,
            animation: "ticker 20s linear infinite",
            whiteSpace: "nowrap",
          }}
        >
          {"🌸 Handmade with Love  •  🚚 Free Delivery in Dhaka over ৳1500  •  🎁 Gift Wrapping Available  •  ✨ New Arrivals Every Week  •  💎 100% Authentic Handmade  •  🌸 Handmade with Love  •  🚚 Free Delivery in Dhaka over ৳1500  •  🎁 Gift Wrapping Available"
            .split("  •  ")
            .map((item, i) => (
              <span key={i}>{item} &nbsp;•&nbsp; </span>
            ))}
        </div>
        <style>{`@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      </div>

      {/* MAIN HEADER */}
      <header
        style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(173,20,87,0.1)",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
          position: "sticky",
          top: 36,
          zIndex: 50,
          boxShadow: "0 2px 20px rgba(173,20,87,0.08)",
        }}
      >
        {/* Hamburger */}
        <button
          onClick={() => setMobileMenu(true)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 22,
            color: DARK,
            padding: "4px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 5,
            justifyContent: "center",
            marginRight: 8,
          }}
        >
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: DARK,
              borderRadius: 2,
            }}
          />
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: DARK,
              borderRadius: 2,
            }}
          />
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: DARK,
              borderRadius: 2,
            }}
          />
        </button>

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
          onClick={() => setTab("home")}
        >
          <img
            src="/logo.jpg"
            alt="logo"
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "2px solid rgba(173,20,87,0.35)",
              objectFit: "cover",
            }}
          />
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                background: GRAD,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.1,
              }}
            >
              {t.shopName}
            </div>
            <div
              style={{
                fontSize: 9,
                color: MED,
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              {t.tagline}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ display: "flex", gap: 2, alignItems: "center" }}>
          {(isAdmin
            ? [
                ["home", "Home"],
                ["shop", "Shop"],
                ["collections", "Collections"],
                ["dashboard", "Dashboard"],
                ["inventory", "Inventory"],
                ["orders", "Orders"],
              ]
            : [
                ["home", "Home"],
                ["shop", "Shop"],
                ["collections", "Collections"],
              ]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                background: "transparent",
                color: tab === key ? PRIMARY : DARK,
                border: "none",
                padding: "8px 14px",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "inherit",
                fontWeight: tab === key ? 700 : 500,
                borderBottom:
                  tab === key
                    ? `2px solid ${PRIMARY}`
                    : "2px solid transparent",
                transition: "all 0.2s",
                borderRadius: 0,
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Right icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Search */}
          {searchOpen ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.9)",
                border: `1.5px solid rgba(173,20,87,0.3)`,
                borderRadius: 20,
                padding: "4px 12px",
              }}
            >
              <span style={{ fontSize: 14 }}>🔍</span>
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }
                  if (e.key === "Enter" && searchQuery.trim()) {
                    setTab("shop");
                  }
                }}
                placeholder="Search products..."
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 13,
                  width: 160,
                  fontFamily: "inherit",
                  color: DARK,
                }}
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: MED,
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                background: "rgba(255,255,255,0.5)",
                border: `1px solid rgba(173,20,87,0.2)`,
                borderRadius: "50%",
                width: 36,
                height: 36,
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Search"
            >
              🔍
            </button>
          )}
          {/* Wishlist */}
          <button
            onClick={() => setTab("wishlist")}
            style={{
              background: "rgba(255,255,255,0.5)",
              border: `1px solid rgba(173,20,87,0.2)`,
              borderRadius: "50%",
              width: 36,
              height: 36,
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
            title="Wishlist"
          >
            ❤️
            {wishlist.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  background: PRIMARY,
                  color: "#FFF",
                  borderRadius: "50%",
                  width: 16,
                  height: 16,
                  fontSize: 9,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {wishlist.length}
              </span>
            )}
          </button>
          {/* Lang */}
          <button
            onClick={() => setLang((l) => (l === "en" ? "bn" : "en"))}
            style={{
              background: "rgba(255,255,255,0.5)",
              border: `1px solid rgba(173,20,87,0.2)`,
              borderRadius: 16,
              padding: "5px 12px",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "inherit",
              color: MED,
            }}
          >
            {lang === "en" ? "বাং" : "EN"}
          </button>
          {/* Auth */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={()=>setShowProfile(true)}
                style={{ fontSize:11,color:MED,background:"rgba(255,255,255,0.6)",border:"1px solid rgba(173,20,87,0.2)",padding:"5px 12px",borderRadius:16,cursor:"pointer",fontFamily:"inherit",maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                {isAdmin?"👑 Admin":"👤 "+user.email.split("@")[0]}
              </button>
              <button
                onClick={handleLogout}
                style={{
                  background: "rgba(255,255,255,0.5)",
                  border: `1px solid rgba(173,20,87,0.2)`,
                  color: MED,
                  padding: "5px 12px",
                  borderRadius: 16,
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "inherit",
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowAuth(true);
                setAuthError("");
              }}
              style={{ ...btn, padding: "7px 16px", fontSize: 12 }}
            >
              Login
            </button>
          )}
          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            style={{
              ...btn,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              fontSize: 13,
            }}
          >
            🛒{" "}
            {cartCount > 0 && (
              <span
                style={{
                  background: GOLD,
                  color: DARK,
                  borderRadius: 10,
                  padding: "1px 7px",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* TOAST */}
      {notif && (
        <div
          style={{
            position: "fixed",
            top: 80,
            right: 24,
            background: GRAD,
            color: "#FFF",
            padding: "12px 22px",
            borderRadius: 12,
            zIndex: 300,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 4px 20px rgba(173,20,87,0.4)",
          }}
        >
          {notif}
        </div>
      )}

      <main
        style={{
          padding: "28px 32px",
          maxWidth: 1140,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* HOME TAB */}
        {tab === "home" && (
          <div>
            {/* Hero Section — full-width banner with text overlay */}
            <div
              style={{
                position: "relative",
                borderRadius: 24,
                overflow: "hidden",
                marginBottom: 48,
                minHeight: 320,
                backgroundImage: "url('/banner.png')",
                backgroundSize: "cover",
                backgroundPosition: "center center",
                boxShadow: "0 12px 40px rgba(173,20,87,0.25)",
              }}
            >
              {/* Light overlay on left for text readability */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 1,
                  background:
                    "linear-gradient(to top,rgba(20,0,30,0.82) 0%,rgba(20,0,30,0.1) 55%,transparent 100%)",
                }}
              />
              {/* Content */}
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  padding: "48px 48px",
                  maxWidth: "55%",
                  minHeight: 320,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    background: "rgba(173,20,87,0.12)",
                    border: "1px solid rgba(173,20,87,0.25)",
                    borderRadius: 20,
                    padding: "4px 14px",
                    fontSize: 11,
                    color: PRIMARY,
                    fontWeight: 700,
                    marginBottom: 14,
                    alignSelf: "flex-start",
                  }}
                >
                  🌸 Handmade with Love
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: MED,
                    marginBottom: 8,
                    textShadow: "0 1px 3px rgba(255,255,255,0.8)",
                    letterSpacing: 0.3,
                  }}
                >
                  Welcome to কাঁকনবালা! 🌸
                </div>
                <h1
                  style={{
                    fontSize: 40,
                    fontWeight: 900,
                    color: DARK,
                    lineHeight: 1.18,
                    margin: "0 0 14px",
                    textShadow: "0 1px 4px rgba(255,255,255,0.6)",
                  }}
                >
                  Where Every
                  <br />
                  <span
                    style={{
                      background: GRAD,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Piece Tells
                  </span>
                  <br />a Story
                </h1>
                <p
                  style={{
                    fontSize: 14,
                    color: MED,
                    lineHeight: 1.75,
                    marginBottom: 26,
                    fontWeight: 500,
                    textShadow: "0 1px 3px rgba(255,255,255,0.7)",
                  }}
                >
                  Discover handcrafted jewelry, elegant clothing, handmade arts
                  & crafts, and beautiful accessories designed to celebrate
                  every moment.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setTab("shop")}
                    style={{ ...btn, padding: "11px 26px", fontSize: 14 }}
                  >
                    Shop Collection
                  </button>
                  <button
                    onClick={() => setTab("collections")}
                    style={{
                      background: "rgba(255,255,255,0.75)",
                      backdropFilter: "blur(8px)",
                      border: `2px solid ${PRIMARY}`,
                      color: PRIMARY,
                      padding: "11px 26px",
                      fontSize: 14,
                      borderRadius: 20,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: 700,
                    }}
                  >
                    New Arrivals
                  </button>
                </div>
                {/* Stats row */}
                <div style={{ display: "flex", gap: 20, marginTop: 24 }}>
                  {[
                    ["🌸", products.length + "+ Products"],
                    ["⭐", "5★ Rated"],
                    ["🚚", "Fast Delivery"],
                  ].map(([icon, label]) => (
                    <div
                      key={label}
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <span style={{ fontSize: 14 }}>{icon}</span>
                      <span
                        style={{ fontSize: 11, fontWeight: 700, color: MED }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Cards */}
            <div style={{ marginBottom: 48 }}>
              <h2
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: DARK,
                  marginBottom: 6,
                }}
              >
                Shop by Category
              </h2>
              <p style={{ color: MED, fontSize: 14, marginBottom: 24 }}>
                Explore our handcrafted collections
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 18,
                }}
              >
                {["jewelry", "crafts", "clothing"].map((cat) => {
                  const catProduct = products.find(
                    (p) => p.category === cat && p.imageUrl,
                  );
                  const labelMap = {
                    jewelry: "Jewelry / গহনা",
                    crafts: "Crafts / ক্রাফট",
                    clothing: "Clothing / পোশাক",
                  };
                  const subMap = {
                    jewelry: "Bangles, Rings & more",
                    crafts: "Mandala, Canvas & more",
                    clothing: "Saree, Tops & more",
                  };
                  const emojiMap = {
                    jewelry: "💍",
                    crafts: "🏺",
                    clothing: "👗",
                  };
                  return (
                    <div
                      key={cat}
                      onClick={() => {
                        setCatFilter(cat);
                        setTab("shop");
                      }}
                      style={{
                        position: "relative",
                        borderRadius: 20,
                        overflow: "hidden",
                        cursor: "pointer",
                        height: 300,
                        boxShadow: "0 8px 30px rgba(173,20,87,0.18)",
                      }}
                    >
                      {catProduct ? (
                        <img
                          src={catProduct.imageUrl}
                          alt={cat}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            transition: "transform 0.4s",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background:
                              "linear-gradient(135deg,rgba(173,20,87,0.15),rgba(106,27,154,0.15))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 80,
                          }}
                        >
                          {emojiMap[cat]}
                        </div>
                      )}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(to top,rgba(20,0,30,0.82) 0%,rgba(20,0,30,0.1) 55%,transparent 100%)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: "18px 20px",
                          zIndex: 2,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 19,
                            fontWeight: 900,
                            color: "#FFF",
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                          }}
                        >
                          {emojiMap[cat]} {labelMap[cat]}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.7)",
                            marginTop: 3,
                          }}
                        >
                          {subMap[cat]}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "rgba(255,255,255,0.9)",
                            marginTop: 8,
                          }}
                        >
                          Shop Now →
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* New Arrivals - latest 6 products */}
            <div style={{ marginBottom: 48 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: DARK,
                      margin: 0,
                    }}
                  >
                    New Arrivals
                  </h2>
                  <p style={{ color: MED, fontSize: 14, margin: "4px 0 0" }}>
                    Fresh handmade pieces just for you
                  </p>
                </div>
                <button
                  onClick={() => setTab("shop")}
                  style={{
                    background: "transparent",
                    border: `2px solid ${PRIMARY}`,
                    color: PRIMARY,
                    padding: "8px 20px",
                    borderRadius: 20,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "inherit",
                  }}
                >
                  View All →
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 18,
                }}
              >
                {[...products].slice(0, 6).map((p) => (
                  <div
                    key={p.id}
                    style={{
                      ...glass,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-4px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                    onClick={() => setSelectedProduct(p)}
                  >
                    <div
                      style={{
                        height: 150,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <Carousel
                        images={
                          p.imageUrls && p.imageUrls.length
                            ? p.imageUrls
                            : [p.imageUrl]
                        }
                        emoji={p.emoji}
                        height={220}
                      />
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          toggleWishlist(p.id);
                        }}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: "rgba(255,255,255,0.85)",
                          border: "none",
                          borderRadius: "50%",
                          width: 30,
                          height: 30,
                          cursor: "pointer",
                          fontSize: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 3,
                        }}
                      >
                        {wishlist.includes(p.id) ? "❤️" : "🤍"}
                      </button>
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: DARK,
                          marginBottom: 2,
                        }}
                      >
                        {p.name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            background: GRAD,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          ৳
                          {(p.packOptions && p.packOptions.length > 0
                            ? Math.min(...p.packOptions.map((o) => o.price))
                            : p.price
                          ).toLocaleString()}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: p.stock <= 5 ? DANGER : SUCCESS,
                            fontWeight: 700,
                          }}
                        >
                          {p.stock <= 5 ? "⚠ Low" : p.stock + " left"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wishlist section */}
            {wishlist.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: DARK,
                    marginBottom: 20,
                  }}
                >
                  ❤️ Your Wishlist ({wishlist.length})
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 18,
                  }}
                >
                  {products
                    .filter((p) => wishlist.includes(p.id))
                    .map((p) => (
                      <div
                        key={p.id}
                        style={{
                          ...glass,
                          overflow: "hidden",
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedProduct(p)}
                      >
                        <div style={{ height: 120, position: "relative" }}>
                          <Carousel
                            images={
                              p.imageUrls && p.imageUrls.length
                                ? p.imageUrls
                                : [p.imageUrl]
                            }
                            emoji={p.emoji}
                            height={180}
                          />
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              toggleWishlist(p.id);
                            }}
                            style={{
                              position: "absolute",
                              top: 6,
                              right: 6,
                              background: "rgba(255,255,255,0.85)",
                              border: "none",
                              borderRadius: "50%",
                              width: 26,
                              height: 26,
                              cursor: "pointer",
                              fontSize: 13,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 3,
                            }}
                          >
                            ❤️
                          </button>
                        </div>
                        <div style={{ padding: "8px 12px" }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: DARK,
                            }}
                          >
                            {p.name}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: PRIMARY,
                            }}
                          >
                            ৳{p.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ── ABOUT US SECTION ── */}
            <div id="about" style={{ marginBottom: 48 }}>
              {/* Section heading */}
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <div
                  style={{
                    display: "inline-block",
                    background: "rgba(173,20,87,0.08)",
                    border: "1px solid rgba(173,20,87,0.2)",
                    borderRadius: 20,
                    padding: "4px 16px",
                    fontSize: 12,
                    color: PRIMARY,
                    fontWeight: 600,
                    marginBottom: 12,
                  }}
                >
                  🌸 Our Story
                </div>
                <h2
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: DARK,
                    margin: "0 0 12px",
                  }}
                >
                  About{" "}
                  <span
                    style={{
                      background: GRAD,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    কাঁকনবালা
                  </span>
                </h2>
                <div
                  style={{
                    width: 60,
                    height: 3,
                    background: GRAD,
                    borderRadius: 4,
                    margin: "0 auto",
                  }}
                />
              </div>

              {/* Story + image grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 48,
                  alignItems: "center",
                  marginBottom: 48,
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: DARK,
                      marginBottom: 16,
                    }}
                  >
                    Handcrafted with Love, Rooted in Tradition
                  </h3>
                  <p
                    style={{
                      color: MED,
                      fontSize: 14,
                      lineHeight: 1.9,
                      marginBottom: 16,
                    }}
                  >
                    কাঁকনবালা was born from a deep love for Bangladesh's rich
                    artisan heritage. Every piece in our collection is lovingly
                    handcrafted by skilled artisans who pour their heart and
                    soul into their craft.
                  </p>
                  <p
                    style={{
                      color: MED,
                      fontSize: 14,
                      lineHeight: 1.9,
                      marginBottom: 20,
                    }}
                  >
                    We believe that handmade is not just a product — it's a
                    story, a tradition, and a connection between the maker and
                    the wearer. Each purchase you make directly supports local
                    artisans and helps preserve traditional craftsmanship for
                    future generations.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {[
                      [
                        "🌸",
                        "Our Mission",
                        "To celebrate handmade culture and connect artisans with customers who appreciate genuine craftsmanship.",
                      ],
                      [
                        "💎",
                        "Our Promise",
                        "Every product is 100% authentic, handmade with premium quality materials and finished with care.",
                      ],
                      [
                        "🤝",
                        "Our Community",
                        "By shopping with us, you support local artisans and help sustain traditional art forms in Bangladesh.",
                      ],
                    ].map(([icon, title, desc]) => (
                      <div
                        key={title}
                        style={{
                          display: "flex",
                          gap: 14,
                          alignItems: "flex-start",
                          padding: "14px 16px",
                          background: "rgba(173,20,87,0.04)",
                          borderRadius: 12,
                          border: "1px solid rgba(173,20,87,0.12)",
                        }}
                      >
                        <span style={{ fontSize: 22, flexShrink: 0 }}>
                          {icon}
                        </span>
                        <div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: DARK,
                              marginBottom: 3,
                            }}
                          >
                            {title}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: MED,
                              lineHeight: 1.6,
                            }}
                          >
                            {desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      borderRadius: 24,
                      overflow: "hidden",
                      boxShadow: "0 20px 60px rgba(173,20,87,0.2)",
                    }}
                  >
                    <img
                      src="/banner.png"
                      alt="About Kakonbala"
                      style={{ width: "100%", height: 380, objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(173,20,87,0.08)",
                        borderRadius: 24,
                      }}
                    />
                  </div>
                  {/* Stats badge */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: -20,
                      right: -20,
                      background: "#FFF",
                      borderRadius: 16,
                      padding: "16px 22px",
                      boxShadow: "0 8px 30px rgba(173,20,87,0.2)",
                      border: `1px solid rgba(173,20,87,0.15)`,
                    }}
                  >
                    <div style={{ display: "flex", gap: 20 }}>
                      {[
                        ["100+", "Products"],
                        ["500+", "Happy Customers"],
                        ["5★", "Reviews"],
                      ].map(([num, label]) => (
                        <div key={label} style={{ textAlign: "center" }}>
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 900,
                              background: GRAD,
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            {num}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: MED,
                              fontWeight: 600,
                            }}
                          >
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Choose Us */}
              <div style={{ marginBottom: 40 }}>
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: DARK,
                    textAlign: "center",
                    marginBottom: 24,
                  }}
                >
                  Why Choose কাঁকনবালা?
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 18,
                  }}
                >
                  {[
                    {
                      icon: "🚚",
                      title: "Fast Delivery",
                      desc: "Reliable delivery across Bangladesh",
                      color: "rgba(173,20,87,0.06)",
                    },
                    {
                      icon: "💎",
                      title: "Premium Quality",
                      desc: "Every product is carefully handcrafted",
                      color: "rgba(106,27,154,0.06)",
                    },
                    {
                      icon: "🎁",
                      title: "Gift Ready",
                      desc: "Beautiful packaging for every order",
                      color: "rgba(249,168,37,0.08)",
                    },
                    {
                      icon: "✨",
                      title: "Unique Designs",
                      desc: "Exclusive handmade collections you won't find elsewhere",
                      color: "rgba(46,125,50,0.06)",
                    },
                  ].map((f) => (
                    <div
                      key={f.title}
                      style={{
                        ...glass,
                        padding: "28px 20px",
                        textAlign: "center",
                        background: f.color,
                        transition: "all 0.25s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-6px)";
                        e.currentTarget.style.boxShadow =
                          "0 16px 40px rgba(173,20,87,0.18)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "";
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          background: "rgba(173,20,87,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 26,
                          margin: "0 auto 16px",
                        }}
                      >
                        {f.icon}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: DARK,
                          marginBottom: 8,
                        }}
                      >
                        {f.title}
                      </div>
                      <div
                        style={{ fontSize: 12, color: MED, lineHeight: 1.6 }}
                      >
                        {f.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact strip */}
              <div
                style={{
                  ...glass,
                  background: GRAD,
                  borderRadius: 20,
                  padding: "36px 40px",
                  textAlign: "center",
                }}
              >
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#FFF",
                    margin: "0 0 8px",
                  }}
                >
                  Get in Touch
                </h3>
                <p
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: 14,
                    margin: "0 0 28px",
                  }}
                >
                  Have a question or want a custom order? We'd love to hear from
                  you!
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 14,
                    flexWrap: "wrap",
                  }}
                >
                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/8801920895985"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: "#25D366",
                      borderRadius: 14,
                      padding: "12px 20px",
                      textDecoration: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-3px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.126 1.532 5.864L.057 23.929l6.233-1.635A11.935 11.935 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.013-1.378l-.36-.214-3.7.971.989-3.614-.234-.373A9.77 9.77 0 012.18 12C2.18 6.58 6.58 2.18 12 2.18c5.42 0 9.818 4.4 9.818 9.82 0 5.42-4.398 9.818-9.818 9.818z" />
                    </svg>
                    <div style={{ textAlign: "left" }}>
                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(255,255,255,0.8)",
                          fontWeight: 600,
                        }}
                      >
                        WhatsApp
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#FFF", fontWeight: 700 }}
                      >
                        +8801920895985
                      </div>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:kakonbala.official@gmail.com"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: "#EA4335",
                      borderRadius: 14,
                      padding: "12px 20px",
                      textDecoration: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-3px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                    <div style={{ textAlign: "left" }}>
                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(255,255,255,0.8)",
                          fontWeight: 600,
                        }}
                      >
                        Email
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#FFF", fontWeight: 700 }}
                      >
                        kakonbala.official@gmail.com
                      </div>
                    </div>
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://facebook.com/kakonbala.official"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: "#1877F2",
                      borderRadius: 14,
                      padding: "12px 20px",
                      textDecoration: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-3px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <div style={{ textAlign: "left" }}>
                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(255,255,255,0.8)",
                          fontWeight: 600,
                        }}
                      >
                        Facebook
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#FFF", fontWeight: 700 }}
                      >
                        @kakonbala.official
                      </div>
                    </div>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://instagram.com/kako_nbala"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background:
                        "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
                      borderRadius: 14,
                      padding: "12px 20px",
                      textDecoration: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-3px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <div style={{ textAlign: "left" }}>
                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(255,255,255,0.8)",
                          fontWeight: 600,
                        }}
                      >
                        Instagram
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#FFF", fontWeight: 700 }}
                      >
                        @kako_nbala
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COLLECTIONS TAB */}
        {tab === "collections" && (
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                margin: "0 0 6px",
                background: GRAD,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Collections
            </h1>
            <p style={{ color: MED, fontSize: 14, marginBottom: 28 }}>
              Browse by category and find your perfect piece
            </p>
            {Object.entries({
              jewelry: {
                emoji: "💍",
                label: "Jewelry / গহনা",
                subs: CATS.jewelry.subs,
              },
              crafts: {
                emoji: "🏺",
                label: "Crafts / ক্রাফট",
                subs: CATS.crafts.subs,
              },
              clothing: {
                emoji: "👗",
                label: "Clothing / পোশাক",
                subs: ["Women", "Men", "Child"],
              },
            }).map(([cat, info]) => {
              const catProducts = products.filter((p) => p.category === cat);
              if (!catProducts.length) return null;
              return (
                <div key={cat} style={{ marginBottom: 36 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <span style={{ fontSize: 28 }}>{info.emoji}</span>
                      <div>
                        <h2
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: DARK,
                            margin: 0,
                          }}
                        >
                          {info.label}
                        </h2>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            marginTop: 4,
                            flexWrap: "wrap",
                          }}
                        >
                          {info.subs.slice(0, 5).map((s) => (
                            <span
                              key={s}
                              onClick={() => {
                                setCatFilter(cat);
                                setSubFilter(s);
                                setTab("shop");
                              }}
                              style={{
                                fontSize: 10,
                                padding: "2px 10px",
                                borderRadius: 10,
                                background: "rgba(173,20,87,0.08)",
                                color: PRIMARY,
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setCatFilter(cat);
                        setSubFilter("all");
                        setTab("shop");
                      }}
                      style={{
                        background: "transparent",
                        border: `1.5px solid ${PRIMARY}`,
                        color: PRIMARY,
                        padding: "6px 16px",
                        borderRadius: 20,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "inherit",
                      }}
                    >
                      View All →
                    </button>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill,minmax(180px,1fr))",
                      gap: 14,
                    }}
                  >
                    {catProducts.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        style={{
                          ...glass,
                          overflow: "hidden",
                          cursor: "pointer",
                          transition: "transform 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "translateY(-4px)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "translateY(0)")
                        }
                        onClick={() => setSelectedProduct(p)}
                      >
                        <div style={{ height: 130 }}>
                          <Carousel
                            images={
                              p.imageUrls && p.imageUrls.length
                                ? p.imageUrls
                                : [p.imageUrl]
                            }
                            emoji={p.emoji}
                            height={200}
                          />
                        </div>
                        <div style={{ padding: "8px 12px" }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: DARK,
                              marginBottom: 2,
                            }}
                          >
                            {p.name}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: PRIMARY,
                            }}
                          >
                            ৳
                            {(p.packOptions && p.packOptions.length > 0
                              ? Math.min(...p.packOptions.map((o) => o.price))
                              : p.price
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* WISHLIST TAB */}
        {tab === "wishlist" && (
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                margin: "0 0 22px",
                background: GRAD,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ❤️ Wishlist ({wishlist.length})
            </h1>
            {wishlist.length === 0 ? (
              <div
                style={{
                  ...glass,
                  textAlign: "center",
                  padding: "60px 0",
                  color: MED,
                }}
              >
                <div style={{ fontSize: 50, marginBottom: 12 }}>🤍</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                  Your wishlist is empty
                </div>
                <button
                  onClick={() => setTab("shop")}
                  style={{ ...btn, marginTop: 8 }}
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 22,
                }}
              >
                {products
                  .filter((p) => wishlist.includes(p.id))
                  .map((p) => (
                    <div
                      key={p.id}
                      style={{
                        ...glass,
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "transform 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-4px)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "translateY(0)")
                      }
                      onClick={() => setSelectedProduct(p)}
                    >
                      <div style={{ height: 160, position: "relative" }}>
                        <Carousel
                          images={
                            p.imageUrls && p.imageUrls.length
                              ? p.imageUrls
                              : [p.imageUrl]
                          }
                          emoji={p.emoji}
                          height={220}
                        />
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            toggleWishlist(p.id);
                          }}
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            background: "rgba(255,255,255,0.85)",
                            border: "none",
                            borderRadius: "50%",
                            width: 30,
                            height: 30,
                            cursor: "pointer",
                            fontSize: 14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 3,
                          }}
                        >
                          ❤️
                        </button>
                      </div>
                      <div style={{ padding: "12px 14px" }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: DARK,
                            marginBottom: 4,
                          }}
                        >
                          {p.name}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 10,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 16,
                              fontWeight: 800,
                              color: PRIMARY,
                            }}
                          >
                            ৳{p.price.toLocaleString()}
                          </span>
                          <span style={stockTag(p.stock)}>
                            {p.stock <= 5 ? "⚠ Low" : p.stock + " left"}
                          </span>
                        </div>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            addToCart(p);
                          }}
                          disabled={p.stock === 0}
                          style={{
                            ...btn,
                            width: "100%",
                            padding: "9px",
                            fontSize: 13,
                            opacity: p.stock === 0 ? 0.45 : 1,
                          }}
                        >
                          {p.stock === 0 ? t.outOfStock : t.addCart}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* SHOP TAB */}
        {tab === "shop" && (
          <div>
            {/* Banner */}
            <div
              style={{
                borderRadius: 20,
                marginBottom: 28,
                overflow: "hidden",
                position: "relative",
                minHeight: 180,
                backgroundImage: "url('/banner.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: "0 8px 32px rgba(173,20,87,0.25)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,240,252,0.45)",
                }}
              />
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  padding: "32px 40px",
                  minHeight: 180,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#7B1FA2",
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    marginBottom: 8,
                    fontWeight: 700,
                  }}
                >
                  হাতে তৈরি &nbsp;·&nbsp; HANDMADE &nbsp;✦
                </div>
                <h1
                  style={{
                    fontSize: 34,
                    fontWeight: 900,
                    color: "#4A0030",
                    margin: 0,
                    textShadow: "0 1px 6px rgba(255,255,255,0.9)",
                  }}
                >
                  {t.welcome}
                </h1>
                <p
                  style={{
                    color: "#6A1B4D",
                    fontSize: 14,
                    margin: "8px 0 0",
                    fontWeight: 600,
                    textShadow: "0 1px 4px rgba(255,255,255,0.8)",
                  }}
                >
                  {t.welcomeSub}
                </p>
                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      height: 1.5,
                      width: 45,
                      background: "rgba(180,120,30,0.7)",
                    }}
                  />
                  <span style={{ color: "#B8860B", fontSize: 14 }}>✦</span>
                  <div
                    style={{
                      height: 1.5,
                      width: 45,
                      background: "rgba(180,120,30,0.7)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                {[
                  ["all", t.allItems],
                  ["jewelry", t.jewelry],
                  ["crafts", t.crafts],
                  ["clothing", t.clothing],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setCatFilter(key);
                      setSubFilter("all");
                      setClothingGroup("all");
                    }}
                    style={{
                      background: catFilter === key ? GRAD : GLASS,
                      color: catFilter === key ? "#FFF" : DARK,
                      border:
                        catFilter === key
                          ? "none"
                          : `1.5px solid rgba(255,255,255,0.5)`,
                      padding: "7px 20px",
                      borderRadius: 20,
                      cursor: "pointer",
                      fontSize: 13,
                      fontFamily: "inherit",
                      fontWeight: 600,
                      backdropFilter: BLUR,
                      boxShadow:
                        catFilter === key
                          ? `0 2px 10px rgba(173,20,87,0.4)`
                          : "none",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {catFilter === "jewelry" && (
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    paddingLeft: 8,
                  }}
                >
                  <button
                    onClick={() => setSubFilter("all")}
                    style={{
                      background:
                        subFilter === "all" ? "rgba(173,20,87,0.15)" : GLASS,
                      color: subFilter === "all" ? PRIMARY : MED,
                      border:
                        subFilter === "all"
                          ? `1px solid rgba(173,20,87,0.4)`
                          : `1px solid rgba(255,255,255,0.5)`,
                      padding: "4px 14px",
                      borderRadius: 15,
                      cursor: "pointer",
                      fontSize: 12,
                      fontFamily: "inherit",
                      fontWeight: 600,
                    }}
                  >
                    All
                  </button>
                  {CATS.jewelry.subs.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSubFilter(s)}
                      style={{
                        background:
                          subFilter === s ? "rgba(173,20,87,0.15)" : GLASS,
                        color: subFilter === s ? PRIMARY : MED,
                        border:
                          subFilter === s
                            ? `1px solid rgba(173,20,87,0.4)`
                            : `1px solid rgba(255,255,255,0.5)`,
                        padding: "4px 14px",
                        borderRadius: 15,
                        cursor: "pointer",
                        fontSize: 12,
                        fontFamily: "inherit",
                        fontWeight: 600,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {catFilter === "crafts" && (
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    paddingLeft: 8,
                  }}
                >
                  <button
                    onClick={() => setSubFilter("all")}
                    style={{
                      background:
                        subFilter === "all" ? "rgba(106,27,154,0.15)" : GLASS,
                      color: subFilter === "all" ? PURPLE : MED,
                      border:
                        subFilter === "all"
                          ? `1px solid rgba(106,27,154,0.4)`
                          : `1px solid rgba(255,255,255,0.5)`,
                      padding: "4px 14px",
                      borderRadius: 15,
                      cursor: "pointer",
                      fontSize: 12,
                      fontFamily: "inherit",
                      fontWeight: 600,
                    }}
                  >
                    All
                  </button>
                  {CATS.crafts.subs.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSubFilter(s)}
                      style={{
                        background:
                          subFilter === s ? "rgba(106,27,154,0.15)" : GLASS,
                        color: subFilter === s ? PURPLE : MED,
                        border:
                          subFilter === s
                            ? `1px solid rgba(106,27,154,0.4)`
                            : `1px solid rgba(255,255,255,0.5)`,
                        padding: "4px 14px",
                        borderRadius: 15,
                        cursor: "pointer",
                        fontSize: 12,
                        fontFamily: "inherit",
                        fontWeight: 600,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {catFilter === "clothing" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    paddingLeft: 8,
                  }}
                >
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      onClick={() => {
                        setClothingGroup("all");
                        setSubFilter("all");
                      }}
                      style={{
                        background:
                          clothingGroup === "all"
                            ? "rgba(249,168,37,0.2)"
                            : GLASS,
                        color: clothingGroup === "all" ? "#B8860B" : MED,
                        border:
                          clothingGroup === "all"
                            ? `1px solid rgba(249,168,37,0.5)`
                            : `1px solid rgba(255,255,255,0.5)`,
                        padding: "4px 14px",
                        borderRadius: 15,
                        cursor: "pointer",
                        fontSize: 12,
                        fontFamily: "inherit",
                        fontWeight: 700,
                      }}
                    >
                      All
                    </button>
                    {Object.keys(CATS.clothing.groups).map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          setClothingGroup(g);
                          setSubFilter("all");
                        }}
                        style={{
                          background:
                            clothingGroup === g
                              ? "rgba(249,168,37,0.2)"
                              : GLASS,
                          color: clothingGroup === g ? "#B8860B" : MED,
                          border:
                            clothingGroup === g
                              ? `1px solid rgba(249,168,37,0.5)`
                              : `1px solid rgba(255,255,255,0.5)`,
                          padding: "4px 14px",
                          borderRadius: 15,
                          cursor: "pointer",
                          fontSize: 12,
                          fontFamily: "inherit",
                          fontWeight: 700,
                        }}
                      >
                        {g === "Women"
                          ? "👩 Women"
                          : g === "Men"
                            ? "👨 Men"
                            : "👶 Child"}
                      </button>
                    ))}
                  </div>
                  {clothingGroup !== "all" && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        onClick={() => setSubFilter("all")}
                        style={{
                          background:
                            subFilter === "all"
                              ? "rgba(249,168,37,0.15)"
                              : GLASS,
                          color: subFilter === "all" ? "#B8860B" : MED,
                          border:
                            subFilter === "all"
                              ? `1px solid rgba(249,168,37,0.4)`
                              : `1px solid rgba(255,255,255,0.4)`,
                          padding: "3px 12px",
                          borderRadius: 12,
                          cursor: "pointer",
                          fontSize: 11,
                          fontFamily: "inherit",
                          fontWeight: 600,
                        }}
                      >
                        All {clothingGroup}
                      </button>
                      {(CATS.clothing.groups[clothingGroup] || []).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSubFilter(s)}
                          style={{
                            background:
                              subFilter === s ? "rgba(249,168,37,0.15)" : GLASS,
                            color: subFilter === s ? "#B8860B" : MED,
                            border:
                              subFilter === s
                                ? `1px solid rgba(249,168,37,0.4)`
                                : `1px solid rgba(255,255,255,0.4)`,
                            padding: "3px 12px",
                            borderRadius: 12,
                            cursor: "pointer",
                            fontSize: 11,
                            fontFamily: "inherit",
                            fontWeight: 600,
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── FILTER BAR ── */}
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: showFilters ? 14 : 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => setShowFilters((f) => !f)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      ...btn,
                      padding: "8px 18px",
                      fontSize: 13,
                      background: showFilters ? GRAD : "rgba(255,255,255,0.7)",
                      color: showFilters ? "#FFF" : MED,
                      border: `1.5px solid rgba(173,20,87,0.3)`,
                      boxShadow: "none",
                    }}
                  >
                    🎛 Filters{" "}
                    {(selectedSizes.length > 0 ||
                      priceRange[0] > 0 ||
                      priceRange[1] < 10000) && (
                      <span
                        style={{
                          background: PRIMARY,
                          color: "#FFF",
                          borderRadius: "50%",
                          width: 18,
                          height: 18,
                          fontSize: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                        }}
                      >
                        {selectedSizes.length +
                          (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0)}
                      </span>
                    )}
                  </button>
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: "8px 14px",
                      border: `1.5px solid rgba(173,20,87,0.25)`,
                      borderRadius: 20,
                      fontSize: 13,
                      fontFamily: "inherit",
                      background: "rgba(255,255,255,0.75)",
                      color: DARK,
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="default">Sort: Default</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                    <option value="name_asc">Name: A → Z</option>
                  </select>
                  {/* Active filter chips */}
                  {selectedSizes.map((s) => (
                    <span
                      key={s}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: "rgba(173,20,87,0.1)",
                        border: `1px solid rgba(173,20,87,0.3)`,
                        borderRadius: 20,
                        padding: "4px 12px",
                        fontSize: 12,
                        color: PRIMARY,
                        fontWeight: 600,
                      }}
                    >
                      {s}{" "}
                      <button
                        onClick={() =>
                          setSelectedSizes((prev) =>
                            prev.filter((x) => x !== s),
                          )
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: PRIMARY,
                          fontSize: 14,
                          padding: 0,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: "rgba(173,20,87,0.1)",
                        border: `1px solid rgba(173,20,87,0.3)`,
                        borderRadius: 20,
                        padding: "4px 12px",
                        fontSize: 12,
                        color: PRIMARY,
                        fontWeight: 600,
                      }}
                    >
                      ৳{priceRange[0]}–
                      {priceRange[1] < 10000 ? priceRange[1] : "∞"}
                      <button
                        onClick={() => setPriceRange([0, 10000])}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: PRIMARY,
                          fontSize: 14,
                          padding: 0,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {(selectedSizes.length > 0 ||
                    priceRange[0] > 0 ||
                    priceRange[1] < 10000) && (
                    <button
                      onClick={() => {
                        setSelectedSizes([]);
                        setPriceRange([0, 10000]);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: DANGER,
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "inherit",
                      }}
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 13, color: MED, fontWeight: 600 }}>
                  {visible.length} products
                </div>
              </div>

              {/* Expanded filter panel */}
              {showFilters && (
                <div
                  style={{
                    ...glass,
                    padding: 20,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 20,
                  }}
                >
                  {/* Price Range */}
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: DARK,
                        marginBottom: 12,
                      }}
                    >
                      💰 Price Range
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[
                        [0, 500, "Under ৳500"],
                        [500, 1000, "৳500–1000"],
                        [1000, 2000, "৳1000–2000"],
                        [2000, 5000, "৳2000–5000"],
                        [5000, 10000, "৳5000+"],
                      ].map(([min, max, label]) => (
                        <button
                          key={label}
                          onClick={() => setPriceRange([min, max])}
                          style={{
                            padding: "5px 14px",
                            borderRadius: 20,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            fontFamily: "inherit",
                            border: `1.5px solid ${priceRange[0] === min && priceRange[1] === max ? PRIMARY : "rgba(173,20,87,0.25)"}`,
                            background:
                              priceRange[0] === min && priceRange[1] === max
                                ? "rgba(173,20,87,0.1)"
                                : "rgba(255,255,255,0.7)",
                            color:
                              priceRange[0] === min && priceRange[1] === max
                                ? PRIMARY
                                : MED,
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="number"
                          placeholder="Min ৳"
                          value={priceRange[0] || ""}
                          min={0}
                          onChange={(e) =>
                            setPriceRange([
                              Number(e.target.value) || 0,
                              priceRange[1],
                            ])
                          }
                          style={{
                            width: "45%",
                            padding: "6px 10px",
                            border: `1.5px solid rgba(173,20,87,0.25)`,
                            borderRadius: 8,
                            fontSize: 12,
                            fontFamily: "inherit",
                            background: "rgba(255,255,255,0.85)",
                          }}
                        />
                        <span style={{ color: MED, fontSize: 12 }}>to</span>
                        <input
                          type="number"
                          placeholder="Max ৳"
                          value={priceRange[1] === 10000 ? "" : priceRange[1]}
                          min={0}
                          onChange={(e) =>
                            setPriceRange([
                              priceRange[0],
                              Number(e.target.value) || 10000,
                            ])
                          }
                          style={{
                            width: "45%",
                            padding: "6px 10px",
                            border: `1.5px solid rgba(173,20,87,0.25)`,
                            borderRadius: 8,
                            fontSize: 12,
                            fontFamily: "inherit",
                            background: "rgba(255,255,255,0.85)",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Size Filter */}
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: DARK,
                        marginBottom: 12,
                      }}
                    >
                      📏 Size
                    </div>
                    {allSizes.length === 0 ? (
                      <div style={{ fontSize: 12, color: LIGHT }}>
                        No sizes available for current products
                      </div>
                    ) : (
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        {allSizes.map((s) => (
                          <button
                            key={s}
                            onClick={() =>
                              setSelectedSizes((prev) =>
                                prev.includes(s)
                                  ? prev.filter((x) => x !== s)
                                  : [...prev, s],
                              )
                            }
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 10,
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 700,
                              fontFamily: "inherit",
                              border: `1.5px solid ${selectedSizes.includes(s) ? PRIMARY : "rgba(173,20,87,0.25)"}`,
                              background: selectedSizes.includes(s)
                                ? "rgba(173,20,87,0.12)"
                                : "rgba(255,255,255,0.7)",
                              color: selectedSizes.includes(s) ? PRIMARY : MED,
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {searchQuery.trim() && (
              <div
                style={{
                  ...glass,
                  padding: "10px 18px",
                  marginBottom: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 13, color: MED }}>
                  🔍 Showing results for "
                  <b style={{ color: PRIMARY }}>{searchQuery}</b>" —{" "}
                  {visible.length} found
                </span>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: DANGER,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  ✕ Clear
                </button>
              </div>
            )}
            {products.length === 0 && (
              <div
                style={{
                  ...glass,
                  textAlign: "center",
                  padding: "60px 0",
                  color: MED,
                }}
              >
                <div style={{ fontSize: 50, marginBottom: 12 }}>🌸</div>
                <div>Loading products...</div>
              </div>
            )}
            {visible.length === 0 && products.length > 0 && (
              <div
                style={{
                  ...glass,
                  textAlign: "center",
                  padding: "40px 0",
                  color: MED,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>
                  No products found
                </div>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCatFilter("all");
                    setSubFilter("all");
                  }}
                  style={{ ...btn, fontSize: 12, padding: "8px 18px" }}
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Product Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 22,
              }}
            >
              {visible.map((p) => (
                <div
                  key={p.id}
                  style={{
                    ...glass,
                    overflow: "hidden",
                    transition: "transform 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-6px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <div
                    onClick={() => setSelectedProduct(p)}
                    style={{ position: "relative" }}
                  >
                    <Carousel
                      images={
                        p.imageUrls && p.imageUrls.length
                          ? p.imageUrls
                          : [p.imageUrl]
                      }
                      emoji={p.emoji}
                      height={260}
                    />
                    <span
                      style={{
                        ...catBadge(p.category),
                        position: "absolute",
                        top: 8,
                        left: 8,
                        zIndex: 3,
                      }}
                    >
                      {p.subcategory || p.category}
                    </span>
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        toggleWishlist(p.id);
                      }}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "rgba(255,255,255,0.85)",
                        border: "none",
                        borderRadius: "50%",
                        width: 30,
                        height: 30,
                        cursor: "pointer",
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 3,
                      }}
                    >
                      {wishlist.includes(p.id) ? "❤️" : "🤍"}
                    </button>
                    <span
                      style={{
                        position: "absolute",
                        bottom: 8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "rgba(255,255,255,0.7)",
                        borderRadius: 8,
                        padding: "2px 8px",
                        fontSize: 10,
                        color: MED,
                        zIndex: 3,
                      }}
                    >
                      🔍 View
                    </span>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <div
                      onClick={() => setSelectedProduct(p)}
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: DARK,
                        marginBottom: 4,
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: MED,
                        lineHeight: 1.5,
                        marginBottom: 10,
                        minHeight: 32,
                      }}
                    >
                      {p.desc}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          background: GRAD,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {p.packOptions && p.packOptions.length > 0
                          ? "from "
                          : ""}{" "}
                        ৳
                        {(p.packOptions && p.packOptions.length > 0
                          ? Math.min(...p.packOptions.map((o) => o.price))
                          : p.price
                        ).toLocaleString()}
                      </span>
                      <span style={stockTag(p.stock)}>
                        {p.stock <= 5
                          ? `⚠ ${p.stock} ${t.left}`
                          : `${p.stock} ${t.inStock}`}
                      </span>
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      disabled={p.stock === 0}
                      style={{
                        ...btn,
                        width: "100%",
                        padding: "10px",
                        opacity: p.stock === 0 ? 0.45 : 1,
                        cursor: p.stock === 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      {p.stock === 0 ? t.outOfStock : t.addCart}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && isAdmin && (
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                margin: "0 0 22px",
                background: GRAD,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              📊 {t.dashTitle}
            </h1>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div />
              <button
                onClick={clearDashboard}
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border: `1px solid rgba(173,20,87,0.3)`,
                  color: MED,
                  padding: "6px 14px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "inherit",
                }}
              >
                🔄 Reset Stats
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 14,
                marginBottom: 22,
              }}
            >
              {[
                {
                  label: "💰 Total Income (Delivered)",
                  value: `৳${realIncome.toLocaleString()}`,
                  sub: `${orders.filter((o) => o.status === "delivered" || o.status === "paid").length} orders`,
                  c: SUCCESS,
                },
                {
                  label: "⏳ Pending Revenue",
                  value: `৳${pendingIncome.toLocaleString()}`,
                  sub: `${orders.filter((o) => o.status === "processing" || o.status === "in_packaging" || o.status === "shipped").length} in progress`,
                  c: WARN,
                },
                {
                  label: "📦 Total Orders",
                  value: orders.length,
                  sub: "All time",
                  c: PURPLE,
                },
                {
                  label: "🛍 Products",
                  value: products.length,
                  sub: `${lowStock.length} low stock`,
                  c: GOLD,
                },
              ].map((m, i) => (
                <div key={i} style={metCard(m.c)}>
                  <div
                    style={{
                      fontSize: 10,
                      color: LIGHT,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                      marginBottom: 4,
                    }}
                  >
                    {m.label}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: DARK }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: 10, color: MED, marginTop: 3 }}>
                    {m.sub}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: 18,
                marginBottom: 18,
              }}
            >
              <div style={{ ...glass, padding: 20 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 14,
                    color: PURPLE,
                  }}
                >
                  {t.monthlyRev}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.4)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: LIGHT }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: LIGHT }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      formatter={(v) => [`৳${v.toLocaleString()}`, "Revenue"]}
                    />
                    <defs>
                      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={PRIMARY} />
                        <stop offset="100%" stopColor={PURPLE} />
                      </linearGradient>
                    </defs>
                    <Bar
                      dataKey="revenue"
                      fill="url(#bg)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ ...glass, padding: 20 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 10,
                    color: PURPLE,
                  }}
                >
                  {t.catRevenue}
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={catRevData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={65}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {catRevData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [`৳${v.toLocaleString()}`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {catRevData.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      marginTop: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        background: PIE_COLORS[i],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: MED }}>{item.name}</span>
                    <span style={{ marginLeft: "auto", fontWeight: 700 }}>
                      ৳{(item.value / 1000).toFixed(0)}K
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...glass, padding: 20, marginBottom: 18 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 14,
                  color: PURPLE,
                }}
              >
                {t.orderTrend}
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.4)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: LIGHT }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: LIGHT }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke={PRIMARY}
                    strokeWidth={3}
                    dot={{ fill: PRIMARY, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {lowStock.length > 0 && (
              <div
                style={{
                  ...glass,
                  background: "rgba(255,243,224,0.75)",
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: WARN,
                    marginBottom: 8,
                  }}
                >
                  {t.lowStockAlert}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {lowStock.map((p) => (
                    <span
                      key={p.id}
                      style={{
                        background: "rgba(255,255,255,0.7)",
                        border: "1px solid rgba(255,204,128,0.6)",
                        borderRadius: 8,
                        padding: "4px 12px",
                        fontSize: 12,
                        color: WARN,
                      }}
                    >
                      {p.emoji} {p.name} — <b>{p.stock}</b>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Promo Code Manager */}
            <div style={{ ...glass, padding: 20, marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 800, color: PURPLE }}>
                  🎟 Promo Code Manager
                </div>
                <button
                  onClick={() => setShowPromoMgr((p) => !p)}
                  style={{ ...btn, padding: "6px 16px", fontSize: 12 }}
                >
                  {showPromoMgr ? "Hide" : "+ New Code"}
                </button>
              </div>
              {showPromoMgr && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.5)",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: 11,
                          color: MED,
                          fontWeight: 700,
                          display: "block",
                          marginBottom: 2,
                        }}
                      >
                        Code *
                      </label>
                      <input
                        style={inp}
                        type="text"
                        placeholder="EID20"
                        value={newPromo.code}
                        onChange={(e) =>
                          setNewPromo((p) => ({
                            ...p,
                            code: e.target.value.toUpperCase(),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: 11,
                          color: MED,
                          fontWeight: 700,
                          display: "block",
                          marginBottom: 2,
                        }}
                      >
                        Type
                      </label>
                      <select
                        style={inp}
                        value={newPromo.type}
                        onChange={(e) =>
                          setNewPromo((p) => ({ ...p, type: e.target.value }))
                        }
                      >
                        <option value="percentage">% Percentage</option>
                        <option value="fixed">৳ Fixed Amount</option>
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: 11,
                          color: MED,
                          fontWeight: 700,
                          display: "block",
                          marginBottom: 2,
                        }}
                      >
                        Value * {newPromo.type === "percentage" ? "(%)" : "(৳)"}
                      </label>
                      <input
                        style={inp}
                        type="number"
                        placeholder={
                          newPromo.type === "percentage"
                            ? "e.g. 10"
                            : "e.g. 100"
                        }
                        value={newPromo.value}
                        onChange={(e) =>
                          setNewPromo((p) => ({ ...p, value: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: 11,
                          color: MED,
                          fontWeight: 700,
                          display: "block",
                          marginBottom: 2,
                        }}
                      >
                        Min Order (৳)
                      </label>
                      <input
                        style={inp}
                        type="number"
                        placeholder="e.g. 500 (optional)"
                        value={newPromo.minOrder}
                        onChange={(e) =>
                          setNewPromo((p) => ({
                            ...p,
                            minOrder: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <button onClick={savePromo} style={{ ...btn, fontSize: 13 }}>
                    ✓ Create Promo Code
                  </button>
                </div>
              )}
              {promoCodes.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: LIGHT,
                    padding: "16px 0",
                    fontSize: 13,
                  }}
                >
                  No promo codes yet. Create one above!
                </div>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        "Code",
                        "Type",
                        "Value",
                        "Min Order",
                        "Status",
                        "Action",
                      ].map((h) => (
                        <th key={h} style={{ ...TH, fontSize: 11 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes.map((p) => (
                      <tr
                        key={p.id}
                        style={{ background: "rgba(255,255,255,0.3)" }}
                      >
                        <td
                          style={{
                            ...TD,
                            fontWeight: 800,
                            color: PRIMARY,
                            fontFamily: "monospace",
                          }}
                        >
                          {p.code}
                        </td>
                        <td style={TD}>
                          {p.type === "percentage" ? "% Percentage" : "৳ Fixed"}
                        </td>
                        <td style={{ ...TD, fontWeight: 700 }}>
                          {p.type === "percentage"
                            ? `${p.value}%`
                            : `৳${p.value}`}
                        </td>
                        <td style={TD}>
                          {p.minOrder ? `৳${p.minOrder}` : "None"}
                        </td>
                        <td style={TD}>
                          <span
                            style={{
                              fontSize: 11,
                              padding: "2px 10px",
                              borderRadius: 10,
                              fontWeight: 700,
                              background: p.active
                                ? "rgba(232,245,233,0.85)"
                                : "rgba(255,235,238,0.85)",
                              color: p.active ? SUCCESS : DANGER,
                            }}
                          >
                            {p.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={TD}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => togglePromo(p.id, p.active)}
                              style={{
                                fontSize: 11,
                                padding: "3px 10px",
                                borderRadius: 8,
                                border: `1px solid rgba(173,20,87,0.3)`,
                                background: "rgba(255,255,255,0.7)",
                                cursor: "pointer",
                                fontWeight: 600,
                                color: MED,
                              }}
                            >
                              {p.active ? "Disable" : "Enable"}
                            </button>
                            <button
                              onClick={() => deletePromo(p.id)}
                              style={{
                                fontSize: 11,
                                padding: "3px 10px",
                                borderRadius: 8,
                                border: `1px solid rgba(198,40,40,0.3)`,
                                background: "rgba(255,235,238,0.85)",
                                cursor: "pointer",
                                fontWeight: 600,
                                color: DANGER,
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {tab === "inventory" && isAdmin && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    margin: 0,
                    background: GRAD,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  📦 {t.invTitle}
                </h1>
                <p style={{ color: LIGHT, fontSize: 13, margin: "3px 0 0" }}>
                  {t.invSub}
                </p>
              </div>
              <button onClick={() => setShowForm((f) => !f)} style={{ ...btn }}>
                {showForm ? t.cancel : t.addProduct}
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 14,
                marginBottom: 20,
              }}
            >
              {[
                [t.totalProducts, products.length, PRIMARY],
                [t.totalStockUnits, totalStock, PURPLE],
                [t.lowStockItems, lowStock.length, DANGER],
              ].map(([l, v, c]) => (
                <div key={l} style={metCard(c)}>
                  <div
                    style={{
                      fontSize: 11,
                      color: LIGHT,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}
                  >
                    {l}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: DARK }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
            {showForm && (
              <ErrorBoundary>
                <div style={{ ...glass, padding: 24, marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      marginBottom: 16,
                      color: PURPLE,
                    }}
                  >
                    🌸 New Product
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 14,
                    }}
                  >
                    {[
                      [t.productName, "name", "text", "Product name"],
                      [t.price, "price", "number", "e.g. 400"],
                      [t.stockQty, "stock", "number", "e.g. 10"],
                    ].map(([l, k, tp, ph]) => (
                      <div key={k}>
                        <label
                          style={{
                            fontSize: 12,
                            color: MED,
                            fontWeight: 700,
                            display: "block",
                            marginBottom: 2,
                          }}
                        >
                          {l}
                        </label>
                        <input
                          style={inp}
                          type={tp}
                          placeholder={ph}
                          value={newP[k]}
                          onChange={(e) =>
                            setNewP((p) => ({ ...p, [k]: e.target.value }))
                          }
                        />
                      </div>
                    ))}
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          color: MED,
                          fontWeight: 700,
                          display: "block",
                          marginBottom: 2,
                        }}
                      >
                        {t.category}
                      </label>
                      <select
                        style={inp}
                        value={newP.category}
                        onChange={(e) =>
                          setNewP((p) => ({
                            ...p,
                            category: e.target.value,
                            subcategory: "",
                            clothingGroup: "",
                          }))
                        }
                      >
                        <option value="jewelry">💍 Jewelry</option>
                        <option value="crafts">🏺 Crafts</option>
                        <option value="clothing">👗 Clothing</option>
                      </select>
                    </div>
                    {newP.category === "clothing" && (
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            color: MED,
                            fontWeight: 700,
                            display: "block",
                            marginBottom: 2,
                          }}
                        >
                          Group *
                        </label>
                        <select
                          style={inp}
                          value={newP.clothingGroup || ""}
                          onChange={(e) =>
                            setNewP((p) => ({
                              ...p,
                              clothingGroup: e.target.value,
                              subcategory: "",
                            }))
                          }
                        >
                          <option value="">-- Select --</option>
                          {Object.keys(CATS.clothing.groups).map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {(newP.category === "jewelry" ||
                      newP.category === "crafts" ||
                      (newP.category === "clothing" && newP.clothingGroup)) && (
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            color: MED,
                            fontWeight: 700,
                            display: "block",
                            marginBottom: 2,
                          }}
                        >
                          Subcategory
                        </label>
                        <select
                          style={inp}
                          value={newP.subcategory || ""}
                          onChange={(e) =>
                            setNewP((p) => ({
                              ...p,
                              subcategory: e.target.value,
                            }))
                          }
                        >
                          <option value="">-- Select --</option>
                          {getSubOptions(newP.category, newP.clothingGroup).map(
                            (s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    )}
                    <div style={{ gridColumn: "span 2" }}>
                      <label
                        style={{
                          fontSize: 12,
                          color: MED,
                          fontWeight: 700,
                          display: "block",
                          marginBottom: 2,
                        }}
                      >
                        {t.description}
                      </label>
                      <input
                        style={inp}
                        placeholder="Brief description"
                        value={newP.desc}
                        onChange={(e) =>
                          setNewP((p) => ({ ...p, desc: e.target.value }))
                        }
                      />
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label
                        style={{
                          fontSize: 12,
                          color: MED,
                          fontWeight: 700,
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        📏 Sizes{" "}
                        <span style={{ fontSize: 10, fontWeight: 400 }}>
                          (Enter to add)
                        </span>
                      </label>
                      <TagInput
                        values={newP.sizes}
                        onChange={(v) => setNewP((p) => ({ ...p, sizes: v }))}
                        placeholder="S, M, L, XL, Free Size..."
                      />
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label
                        style={{
                          fontSize: 12,
                          color: MED,
                          fontWeight: 700,
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        🎨 Colors{" "}
                        <span style={{ fontSize: 10, fontWeight: 400 }}>
                          (Enter to add)
                        </span>
                      </label>
                      <TagInput
                        values={newP.colors}
                        onChange={(v) => setNewP((p) => ({ ...p, colors: v }))}
                        placeholder="Red, Blue, Gold..."
                      />
                    </div>
                    {(newP.colors || []).length > 0 && (
                      <div style={{ gridColumn: "span 2" }}>
                        <label
                          style={{
                            fontSize: 12,
                            color: MED,
                            fontWeight: 700,
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          🖼️ Color Images{" "}
                          <span style={{ fontSize: 10, fontWeight: 400 }}>
                            (link image to each color)
                          </span>
                        </label>
                        <ColorImageMapper
                          colors={newP.colors}
                          colorImages={newP.colorImages || {}}
                          onChange={(v) =>
                            setNewP((p) => ({ ...p, colorImages: v }))
                          }
                        />
                      </div>
                    )}
                    <div style={{ gridColumn: "span 2" }}>
                      <label
                        style={{
                          fontSize: 12,
                          color: MED,
                          fontWeight: 700,
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        📦 Pack Sizes with Prices{" "}
                        <span style={{ fontSize: 10, fontWeight: 400 }}>
                          (each pack = different price)
                        </span>
                      </label>
                      <PackOptionInput
                        options={newP.packOptions || []}
                        onChange={(v) =>
                          setNewP((p) => ({ ...p, packOptions: v }))
                        }
                      />
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label
                        style={{
                          fontSize: 12,
                          color: MED,
                          fontWeight: 700,
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        {t.photo}
                      </label>
                      <div
                        style={{ fontSize: 11, color: LIGHT, marginBottom: 8 }}
                      >
                        Upload to{" "}
                        <a
                          href="https://imgbb.com"
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: PRIMARY, fontWeight: 700 }}
                        >
                          imgbb.com
                        </a>{" "}
                        → BBCode → copy URL between [img]...[/img]
                      </div>
                      {(newP.imageUrls || [""]).map((url, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: 8,
                            marginBottom: 8,
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: MED,
                              fontWeight: 700,
                              minWidth: 20,
                            }}
                          >
                            #{i + 1}
                          </span>
                          <input
                            style={{ ...inp, marginTop: 0, flex: 1 }}
                            type="text"
                            placeholder={"Photo " + (i + 1) + " URL"}
                            value={url}
                            onChange={(e) => {
                              const a = [...(newP.imageUrls || [""])];
                              a[i] = e.target.value;
                              setNewP((p) => ({
                                ...p,
                                imageUrls: a,
                                imageUrl: a[0] || "",
                              }));
                            }}
                          />
                          {url && (
                            <img
                              src={url}
                              alt=""
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                              style={{
                                width: 40,
                                height: 40,
                                objectFit: "cover",
                                borderRadius: 6,
                                border: "1px solid rgba(255,255,255,0.6)",
                                flexShrink: 0,
                              }}
                            />
                          )}
                          {(newP.imageUrls || [""]).length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const a = [...(newP.imageUrls || [""])];
                                a.splice(i, 1);
                                setNewP((p) => ({
                                  ...p,
                                  imageUrls: a,
                                  imageUrl: a[0] || "",
                                }));
                              }}
                              style={{
                                background: "rgba(255,235,238,0.9)",
                                border: "1px solid rgba(198,40,40,0.3)",
                                color: DANGER,
                                borderRadius: 6,
                                width: 28,
                                height: 28,
                                cursor: "pointer",
                                fontSize: 14,
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      {(newP.imageUrls || [""]).length < 5 && (
                        <button
                          type="button"
                          onClick={() =>
                            setNewP((p) => ({
                              ...p,
                              imageUrls: [...(p.imageUrls || [""]), ""],
                            }))
                          }
                          style={{
                            fontSize: 12,
                            color: PRIMARY,
                            background: "rgba(173,20,87,0.08)",
                            border: "1px dashed rgba(173,20,87,0.4)",
                            borderRadius: 8,
                            padding: "5px 14px",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontFamily: "inherit",
                          }}
                        >
                          + Add another photo
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    style={{ ...btn, marginTop: 16 }}
                    onClick={addProduct}
                  >
                    {t.saveDb}
                  </button>
                </div>
              </ErrorBoundary>
            )}
            <div style={{ ...glass, overflow: "hidden" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Product",
                      "Category",
                      "Price",
                      "Stock",
                      t.status,
                      t.adjust,
                    ].map((h) => (
                      <th key={h} style={TH}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      style={{
                        background:
                          p.stock === 0
                            ? "rgba(255,235,238,0.4)"
                            : "transparent",
                      }}
                    >
                      <td style={TD}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 8,
                                objectFit: "cover",
                                border: "1px solid rgba(255,255,255,0.6)",
                              }}
                            />
                          ) : (
                            <span
                              style={{
                                fontSize: 28,
                                width: 44,
                                height: 44,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "rgba(255,255,255,0.5)",
                                borderRadius: 8,
                              }}
                            >
                              {p.emoji}
                            </span>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, color: DARK }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: 11, color: LIGHT }}>
                              {(p.desc || "").slice(0, 40)}
                              {(p.desc || "").length > 40 ? "…" : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={TD}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <span style={catBadge(p.category)}>{p.category}</span>
                          {p.subcategory && (
                            <span style={{ fontSize: 10, color: MED }}>
                              {p.clothingGroup ? `${p.clothingGroup} › ` : ""}
                              {p.subcategory}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ ...TD, fontWeight: 700, color: PRIMARY }}>
                        ৳{p.price.toLocaleString()}
                      </td>
                      <td
                        style={{
                          ...TD,
                          fontWeight: 800,
                          fontSize: 16,
                          color: p.stock <= 5 ? DANGER : DARK,
                        }}
                      >
                        {p.stock}
                      </td>
                      <td style={TD}>
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: 11,
                            padding: "3px 10px",
                            borderRadius: 8,
                            fontWeight: 700,
                            background:
                              p.stock === 0
                                ? "rgba(255,235,238,0.85)"
                                : p.stock <= 5
                                  ? "rgba(255,243,224,0.85)"
                                  : "rgba(232,245,233,0.85)",
                            color:
                              p.stock === 0
                                ? DANGER
                                : p.stock <= 5
                                  ? WARN
                                  : SUCCESS,
                          }}
                        >
                          {p.stock === 0
                            ? t.noStock
                            : p.stock <= 5
                              ? t.lowStock
                              : t.inStockLabel}
                        </span>
                      </td>
                      <td style={TD}>
                        <div
                          style={{ display: "flex", gap: 5, flexWrap: "wrap" }}
                        >
                          <button
                            style={qBtnS}
                            onClick={() => adjustStock(p.id, -1)}
                          >
                            −
                          </button>
                          <button
                            style={qBtnS}
                            onClick={() => adjustStock(p.id, 5)}
                          >
                            +5
                          </button>
                          <button
                            style={qBtnS}
                            onClick={() => adjustStock(p.id, 10)}
                          >
                            +10
                          </button>
                          <button
                            onClick={() =>
                              setEditProduct({
                                ...p,
                                imageUrls:
                                  p.imageUrls && p.imageUrls.length
                                    ? p.imageUrls
                                    : [p.imageUrl || ""],
                                sizes: p.sizes || [],
                                colors: p.colors || [],
                                pieceCounts: p.pieceCounts || [],
                                packOptions: p.packOptions || [],
                                colorImages: p.colorImages || {},
                              })
                            }
                            style={{
                              ...qBtnS,
                              width: "auto",
                              padding: "0 10px",
                              background: "rgba(227,242,253,0.9)",
                              color: INFO,
                              border: `1px solid rgba(21,101,192,0.3)`,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id, p.name)}
                            style={{
                              ...qBtnS,
                              width: "auto",
                              padding: "0 10px",
                              background: "rgba(255,235,238,0.9)",
                              color: DANGER,
                              border: `1px solid rgba(198,40,40,0.3)`,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
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

        {/* ORDERS TAB */}
        {tab === "orders" && isAdmin && (
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                margin: "0 0 8px",
                background: GRAD,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              📋 {t.ordersTitle}
            </h1>
            <p style={{ color: LIGHT, fontSize: 13, marginBottom: 22 }}>
              {orders.length} {t.ordersLive}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 10,
                marginBottom: 22,
              }}
            >
              {ORDER_STATUSES.map((s) => (
                <div
                  key={s.value}
                  style={{
                    ...glass,
                    background: s.bg,
                    padding: "12px 14px",
                    textAlign: "center",
                    borderLeft: `3px solid ${s.color}`,
                  }}
                >
                  <div
                    style={{ fontSize: 22, fontWeight: 800, color: s.color }}
                  >
                    {orders.filter((o) => o.status === s.value).length}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: s.color,
                      marginTop: 2,
                      fontWeight: 700,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ ...glass, overflow: "hidden", marginBottom: 18 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Order ID",
                      "Date",
                      "Customer",
                      "Items",
                      "Total",
                      "Update Status",
                    ].map((h) => (
                      <th key={h} style={TH}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          ...TD,
                          textAlign: "center",
                          color: LIGHT,
                          padding: 40,
                        }}
                      >
                        {t.noOrders}
                      </td>
                    </tr>
                  )}
                  {orders.map((o) => {
                    const st = ORDER_STATUSES.find(
                      (s) => s.value === o.status,
                    ) || { color: MED, bg: "rgba(245,245,245,0.9)" };
                    return (
                      <tr
                        key={o.id}
                        style={{ background: "rgba(255,255,255,0.15)" }}
                      >
                        <td
                          style={{
                            ...TD,
                            fontWeight: 600,
                            color: PRIMARY,
                            fontFamily: "monospace",
                            fontSize: 11,
                          }}
                        >
                          {(o.id || "").slice(0, 8)}…
                        </td>
                        <td style={{ ...TD, color: MED, fontSize: 11 }}>
                          {o.createdAt?.seconds
                            ? new Date(
                                o.createdAt.seconds * 1000,
                              ).toLocaleDateString()
                            : "—"}
                        </td>
                        <td style={{ ...TD, fontWeight: 600, fontSize: 12 }}>
                          {o.customer?.name || "—"}
                          <br />
                          <span style={{ fontSize: 10, color: MED }}>
                            {o.customer?.phone || ""}
                          </span>
                        </td>
                        <td style={{ ...TD, color: MED, fontSize: 11 }}>
                          {(o.items || [])
                            .slice(0, 2)
                            .map((i) => i.name)
                            .join(", ")}
                          {(o.items || []).length > 2
                            ? ` +${o.items.length - 2}`
                            : ""}
                        </td>
                        <td
                          style={{
                            ...TD,
                            fontWeight: 800,
                            color: PRIMARY,
                            fontSize: 13,
                          }}
                        >
                          ৳{(o.total || 0).toLocaleString()}
                        </td>
                        <td style={{ ...TD, minWidth: 160 }}>
                          <select
                            value={o.status || "processing"}
                            onChange={(e) =>
                              updateOrderStatus(o.id, e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "6px 8px",
                              borderRadius: 8,
                              border: `1.5px solid ${st.color}`,
                              background: st.bg,
                              color: st.color,
                              fontWeight: 700,
                              fontSize: 11,
                              fontFamily: "inherit",
                              cursor: "pointer",
                            }}
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div
              style={{
                ...glass,
                padding: "14px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: MED, fontSize: 14 }}>{t.totalRevAll}</span>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  background: GRAD,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                ৳
                {orders
                  .reduce((s, o) => s + (o.total || 0), 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </main>

      {/* PRODUCT DETAIL MODAL — Kingsbury style */}
      {selectedProduct && (
        <>
          <div
            onClick={() => {
              setSelectedProduct(null);
              setZoom(1);
            }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(10,0,20,0.75)",
              zIndex: 200,
              backdropFilter: "blur(6px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: "min(1100px,96vw)",
              maxHeight: "92vh",
              overflowY: "auto",
              background: "#FFF",
              borderRadius: 20,
              zIndex: 201,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              boxShadow: "0 32px 100px rgba(0,0,0,0.4)",
            }}
          >
            {/* ── LEFT: Image Gallery ── */}
            <div
              style={{
                position: "relative",
                background: "#F9F0F8",
                borderRadius: "20px 0 0 20px",
                overflow: "hidden",
                minHeight: 500,
              }}
            >
              {/* Main large image with zoom */}
              <div
                style={{
                  height: 420,
                  overflow: "hidden",
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: dragging ? "none" : "transform 0.2s",
                  cursor: zoom > 1 ? "grab" : "zoom-in",
                }}
                onMouseDown={(e) => {
                  if (zoom > 1) {
                    setDragging(true);
                    setDragStart({ x: e.clientX, y: e.clientY });
                  }
                }}
                onMouseMove={(e) => {
                  if (dragging) {
                    setPan({
                      x: pan.x + (e.clientX - dragStart.x) * 0.5,
                      y: pan.y + (e.clientY - dragStart.y) * 0.5,
                    });
                    setDragStart({ x: e.clientX, y: e.clientY });
                  }
                }}
                onMouseUp={() => setDragging(false)}
                onMouseLeave={() => setDragging(false)}
                onClick={() => zoom === 1 && setZoom(2)}
              >
                {(() => {
                  const imgs =
                    selectedProduct.imageUrls &&
                    selectedProduct.imageUrls.length
                      ? selectedProduct.imageUrls
                      : [selectedProduct.imageUrl];
                  const colorImg =
                    selColor &&
                    selectedProduct.colorImages &&
                    selectedProduct.colorImages[selColor];
                  const allImgs = colorImg
                    ? [colorImg, ...imgs.filter((u) => u && u !== colorImg)]
                    : imgs;
                  const validImgs = allImgs.filter(Boolean);
                  const mainImg = validImgs[activeImgIdx] || validImgs[0];
                  return mainImg ? (
                    <img
                      src={mainImg}
                      alt={selectedProduct.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        transform: `translate(${pan.x}px,${pan.y}px)`,
                        transition: dragging ? "none" : "transform 0.1s",
                        userSelect: "none",
                        pointerEvents: "none",
                        padding: 8,
                      }}
                      draggable={false}
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        fontSize: 100,
                      }}
                    >
                      {selectedProduct.emoji}
                    </div>
                  );
                })()}
              </div>
              {/* Zoom controls */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  display: "flex",
                  gap: 6,
                  zIndex: 5,
                }}
              >
                <button
                  onClick={() => {
                    setZoom((z) => Math.min(3, z + 0.5));
                    setPan({ x: 0, y: 0 });
                  }}
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(173,20,87,0.3)",
                    borderRadius: 8,
                    width: 30,
                    height: 30,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                    color: PRIMARY,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  +
                </button>
                <span
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    borderRadius: 8,
                    padding: "0 7px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: MED,
                    height: 30,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => {
                    setZoom((z) => Math.max(1, z - 0.5));
                    if (zoom <= 1.5) setPan({ x: 0, y: 0 });
                  }}
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(173,20,87,0.3)",
                    borderRadius: 8,
                    width: 30,
                    height: 30,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                    color: PRIMARY,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  −
                </button>
                {zoom > 1 && (
                  <button
                    onClick={() => {
                      setZoom(1);
                      setPan({ x: 0, y: 0 });
                    }}
                    style={{
                      background: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(173,20,87,0.2)",
                      borderRadius: 8,
                      padding: "0 8px",
                      height: 30,
                      cursor: "pointer",
                      fontSize: 10,
                      fontWeight: 600,
                      color: MED,
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
              {/* Thumbnail strip */}
              {(() => {
                const imgs =
                  selectedProduct.imageUrls && selectedProduct.imageUrls.length
                    ? selectedProduct.imageUrls
                    : [selectedProduct.imageUrl];
                const colorImg =
                  selColor &&
                  selectedProduct.colorImages &&
                  selectedProduct.colorImages[selColor];
                const allImgs = colorImg
                  ? [colorImg, ...imgs.filter((u) => u && u !== colorImg)]
                  : imgs;
                const validImgs = allImgs.filter(Boolean);
                if (validImgs.length <= 1) return null;
                return (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      padding: "10px 12px",
                      overflowX: "auto",
                    }}
                  >
                    {validImgs.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        onClick={() => {
                          setActiveImgIdx(i);
                          setZoom(1);
                          setPan({ x: 0, y: 0 });
                        }}
                        style={{
                          width: 64,
                          height: 64,
                          objectFit: "cover",
                          borderRadius: 8,
                          cursor: "pointer",
                          flexShrink: 0,
                          border:
                            activeImgIdx === i
                              ? `2.5px solid ${PRIMARY}`
                              : "2px solid rgba(173,20,87,0.15)",
                          opacity: activeImgIdx === i ? 1 : 0.7,
                          transition: "all 0.2s",
                        }}
                      />
                    ))}
                  </div>
                );
              })()}
              {/* Close button */}
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                  setActiveImgIdx(0);
                }}
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  background: "rgba(255,255,255,0.9)",
                  border: "none",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 5,
                  color: DARK,
                }}
              >
                ✕
              </button>
            </div>

            {/* ── RIGHT: Product Info ── */}
            <div
              style={{
                padding: "32px 28px",
                overflowY: "auto",
                maxHeight: "92vh",
              }}
            >
              {/* Brand tag */}
              <div
                style={{
                  fontSize: 11,
                  color: LIGHT,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                কাঁকনবালা
              </div>
              {/* Subcategory badge */}
              <span
                style={{
                  ...catBadge(selectedProduct.category),
                  marginBottom: 10,
                }}
              >
                {selectedProduct.subcategory || selectedProduct.category}
              </span>
              {/* Name */}
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: DARK,
                  margin: "8px 0 12px",
                  lineHeight: 1.2,
                }}
              >
                {selectedProduct.name}
              </h1>

              {/* Price */}
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  background: GRAD,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: 6,
                }}
              >
                ৳{getDisplayPrice(selectedProduct, selPiece).toLocaleString()}
              </div>

              {/* Stock status */}
              <div style={{ marginBottom: 18 }}>
                {selectedProduct.stock === 0 ? (
                  <span
                    style={{ fontSize: 12, fontWeight: 700, color: DANGER }}
                  >
                    ● Out of Stock
                  </span>
                ) : selectedProduct.stock <= 5 ? (
                  <span style={{ fontSize: 12, fontWeight: 700, color: WARN }}>
                    ● Only {selectedProduct.stock} left
                  </span>
                ) : (
                  <span
                    style={{ fontSize: 12, fontWeight: 700, color: SUCCESS }}
                  >
                    ● In Stock
                  </span>
                )}
              </div>

              {/* Pack sizes with prices */}
              {selectedProduct.packOptions &&
                selectedProduct.packOptions.length > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: DARK,
                        marginBottom: 8,
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}
                    >
                      📦 Pack Size
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {selectedProduct.packOptions.map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => setSelPiece(opt.label)}
                          style={{
                            padding: "10px 16px",
                            borderRadius: 10,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            textAlign: "center",
                            border: `2px solid ${selPiece === opt.label ? PRIMARY : "rgba(173,20,87,0.2)"}`,
                            background:
                              selPiece === opt.label
                                ? "rgba(173,20,87,0.08)"
                                : "rgba(255,255,255,0.8)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: selPiece === opt.label ? PRIMARY : MED,
                            }}
                          >
                            {opt.label}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: PRIMARY,
                            }}
                          >
                            ৳{opt.price}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Sizes */}
              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: DARK,
                      marginBottom: 8,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    📏 Size Guide
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {selectedProduct.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelSize(sz)}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: "inherit",
                          border: `2px solid ${selSize === sz ? PRIMARY : "rgba(173,20,87,0.2)"}`,
                          background:
                            selSize === sz ? "rgba(173,20,87,0.08)" : "#FFF",
                          color: selSize === sz ? PRIMARY : DARK,
                        }}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: DARK,
                      marginBottom: 8,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    🎨 Colors ({selectedProduct.colors.length} available)
                    {selColor && (
                      <span
                        style={{
                          fontWeight: 400,
                          textTransform: "none",
                          letterSpacing: 0,
                        }}
                      >
                        {" "}
                        — {selColor}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    {selectedProduct.colors.map((cl) => {
                      const hex =
                        COLOR_MAP[cl.toLowerCase()] ||
                        COLOR_MAP[cl.toLowerCase().replace(/\s/g, "_")];
                      const colorImg =
                        selectedProduct.colorImages &&
                        selectedProduct.colorImages[cl];
                      return (
                        <div
                          key={cl}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <button
                            onClick={() => {
                              setSelColor(cl);
                              setActiveImgIdx(0);
                            }}
                            title={cl}
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              cursor: "pointer",
                              position: "relative",
                              overflow: "hidden",
                              background:
                                hex ||
                                "linear-gradient(135deg,#AD1457,#6A1B9A)",
                              border:
                                selColor === cl
                                  ? `3px solid ${PRIMARY}`
                                  : `2px solid rgba(255,255,255,0.9)`,
                              boxShadow:
                                selColor === cl
                                  ? `0 0 0 2px ${PRIMARY},0 2px 10px rgba(0,0,0,0.2)`
                                  : "0 2px 6px rgba(0,0,0,0.15)",
                              outline: "none",
                              transition: "all 0.2s",
                            }}
                          >
                            {colorImg && (
                              <img
                                src={colorImg}
                                alt={cl}
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: "50%",
                                  opacity: 0.85,
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                          </button>
                          <span
                            style={{
                              fontSize: 9,
                              color: selColor === cl ? PRIMARY : LIGHT,
                              fontWeight: selColor === cl ? 700 : 400,
                              textAlign: "center",
                              maxWidth: 44,
                              lineHeight: 1.2,
                            }}
                          >
                            {cl}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add to Cart button */}
              <button
                onClick={() => {
                  addToCart(
                    {
                      ...selectedProduct,
                      price: getDisplayPrice(selectedProduct, selPiece),
                    },
                    { size: selSize, color: selColor, piece: selPiece },
                  );
                  setSelectedProduct(null);
                  setZoom(1);
                  setActiveImgIdx(0);
                }}
                disabled={selectedProduct.stock === 0}
                style={{
                  width: "100%",
                  padding: "16px",
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  background: selectedProduct.stock === 0 ? "#DDD" : GRAD,
                  color: "#FFF",
                  border: "none",
                  borderRadius: 12,
                  cursor:
                    selectedProduct.stock === 0 ? "not-allowed" : "pointer",
                  marginBottom: 12,
                  boxShadow:
                    selectedProduct.stock === 0
                      ? "none"
                      : "0 6px 20px rgba(173,20,87,0.4)",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
              >
                {selectedProduct.stock === 0
                  ? "Out of Stock"
                  : "Add to Cart 🛒"}
              </button>

              {/* Wishlist button */}
              <button
                onClick={() => toggleWishlist(selectedProduct.id)}
                style={{
                  width: "100%",
                  padding: "13px",
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  background: "transparent",
                  color: wishlist.includes(selectedProduct.id) ? DANGER : MED,
                  border: `2px solid ${wishlist.includes(selectedProduct.id) ? DANGER : "rgba(173,20,87,0.25)"}`,
                  borderRadius: 12,
                  cursor: "pointer",
                  marginBottom: 20,
                  transition: "all 0.2s",
                }}
              >
                {wishlist.includes(selectedProduct.id)
                  ? "❤️ Saved to Wishlist"
                  : "🤍 Add to Wishlist"}
              </button>

              {/* Description accordion */}
              <div
                style={{
                  borderTop: `1px solid rgba(173,20,87,0.12)`,
                  paddingTop: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: DARK,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Description
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: MED,
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  {selectedProduct.desc || "No description available."}
                </p>
              </div>

              {/* You may also like */}
              {products.filter(
                (p) =>
                  p.category === selectedProduct.category &&
                  p.id !== selectedProduct.id,
              ).length > 0 && (
                <div
                  style={{
                    marginTop: 24,
                    borderTop: `1px solid rgba(173,20,87,0.12)`,
                    paddingTop: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: DARK,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      marginBottom: 12,
                    }}
                  >
                    You May Also Like
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      overflowX: "auto",
                      paddingBottom: 8,
                    }}
                  >
                    {products
                      .filter(
                        (p) =>
                          p.category === selectedProduct.category &&
                          p.id !== selectedProduct.id,
                      )
                      .slice(0, 4)
                      .map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedProduct(p);
                            setSelSize("");
                            setSelColor("");
                            setSelPiece("");
                            setActiveImgIdx(0);
                            setZoom(1);
                            setPan({ x: 0, y: 0 });
                          }}
                          style={{
                            flexShrink: 0,
                            width: 100,
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              height: 100,
                              borderRadius: 8,
                              overflow: "hidden",
                              background: "#F9F0F8",
                              marginBottom: 5,
                            }}
                          >
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  height: "100%",
                                  fontSize: 32,
                                }}
                              >
                                {p.emoji}
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: DARK,
                              lineHeight: 1.3,
                              marginBottom: 2,
                            }}
                          >
                            {p.name}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: PRIMARY,
                            }}
                          >
                            ৳{p.price}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editProduct && (
        <ErrorBoundary>
          <>
            <div
              onClick={() => setEditProduct(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(45,10,63,0.55)",
                zIndex: 200,
              }}
            />
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: 460,
                maxHeight: "90vh",
                overflowY: "auto",
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(20px)",
                borderRadius: 20,
                zIndex: 201,
                boxShadow: "0 20px 60px rgba(173,20,87,0.3)",
              }}
            >
              <div
                style={{
                  background: GRAD,
                  padding: "18px 26px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ color: "#FFF", fontSize: 16, fontWeight: 800 }}>
                  ✏️ Edit Product
                </div>
                <button
                  onClick={() => setEditProduct(null)}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    color: "#FFF",
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    cursor: "pointer",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ padding: 24 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  {[
                    ["Product Name *", "name", "text", "Product name"],
                    ["Price (৳) *", "price", "number", "e.g. 400"],
                    ["Stock *", "stock", "number", "e.g. 10"],
                  ].map(([l, k, tp, ph]) => (
                    <div key={k}>
                      <label
                        style={{
                          fontSize: 12,
                          color: MED,
                          fontWeight: 700,
                          display: "block",
                          marginBottom: 2,
                        }}
                      >
                        {l}
                      </label>
                      <input
                        style={inp}
                        type={tp}
                        placeholder={ph}
                        value={editProduct[k] || ""}
                        onChange={(e) =>
                          setEditProduct((p) => ({ ...p, [k]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        color: MED,
                        fontWeight: 700,
                        display: "block",
                        marginBottom: 2,
                      }}
                    >
                      Category *
                    </label>
                    <select
                      style={inp}
                      value={editProduct.category || "jewelry"}
                      onChange={(e) =>
                        setEditProduct((p) => ({
                          ...p,
                          category: e.target.value,
                          subcategory: "",
                          clothingGroup: "",
                        }))
                      }
                    >
                      <option value="jewelry">💍 Jewelry</option>
                      <option value="crafts">🏺 Crafts</option>
                      <option value="clothing">👗 Clothing</option>
                    </select>
                  </div>
                  {(editProduct.category === "jewelry" ||
                    editProduct.category === "crafts") && (
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          color: MED,
                          fontWeight: 700,
                          display: "block",
                          marginBottom: 2,
                        }}
                      >
                        Subcategory
                      </label>
                      <select
                        style={inp}
                        value={editProduct.subcategory || ""}
                        onChange={(e) =>
                          setEditProduct((p) => ({
                            ...p,
                            subcategory: e.target.value,
                          }))
                        }
                      >
                        <option value="">-- Select --</option>
                        {getSubOptions(editProduct.category, "").map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {editProduct.category === "clothing" && (
                    <>
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            color: MED,
                            fontWeight: 700,
                            display: "block",
                            marginBottom: 2,
                          }}
                        >
                          Group *
                        </label>
                        <select
                          style={inp}
                          value={editProduct.clothingGroup || ""}
                          onChange={(e) =>
                            setEditProduct((p) => ({
                              ...p,
                              clothingGroup: e.target.value,
                              subcategory: "",
                            }))
                          }
                        >
                          <option value="">-- Select --</option>
                          {Object.keys(CATS.clothing.groups).map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            color: MED,
                            fontWeight: 700,
                            display: "block",
                            marginBottom: 2,
                          }}
                        >
                          Subcategory
                        </label>
                        <select
                          style={inp}
                          value={editProduct.subcategory || ""}
                          onChange={(e) =>
                            setEditProduct((p) => ({
                              ...p,
                              subcategory: e.target.value,
                            }))
                          }
                          disabled={!editProduct.clothingGroup}
                        >
                          <option value="">
                            {editProduct.clothingGroup
                              ? "-- Select --"
                              : "Pick group first"}
                          </option>
                          {getSubOptions(
                            "clothing",
                            editProduct.clothingGroup,
                          ).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  <div style={{ gridColumn: "span 2" }}>
                    <label
                      style={{
                        fontSize: 12,
                        color: MED,
                        fontWeight: 700,
                        display: "block",
                        marginBottom: 2,
                      }}
                    >
                      Description
                    </label>
                    <input
                      style={inp}
                      placeholder="Product description"
                      value={editProduct.desc || ""}
                      onChange={(e) =>
                        setEditProduct((p) => ({ ...p, desc: e.target.value }))
                      }
                    />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label
                      style={{
                        fontSize: 12,
                        color: MED,
                        fontWeight: 700,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      📏 Sizes
                    </label>
                    <TagInput
                      values={editProduct.sizes || []}
                      onChange={(v) =>
                        setEditProduct((p) => ({ ...p, sizes: v }))
                      }
                      placeholder="S, M, L, XL..."
                    />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label
                      style={{
                        fontSize: 12,
                        color: MED,
                        fontWeight: 700,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      🎨 Colors
                    </label>
                    <TagInput
                      values={editProduct.colors || []}
                      onChange={(v) =>
                        setEditProduct((p) => ({ ...p, colors: v }))
                      }
                      placeholder="Red, Blue, Gold..."
                    />
                  </div>
                  {(editProduct.colors || []).length > 0 && (
                    <div style={{ gridColumn: "span 2" }}>
                      <label
                        style={{
                          fontSize: 12,
                          color: MED,
                          fontWeight: 700,
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        🖼️ Color Images
                      </label>
                      <ColorImageMapper
                        colors={editProduct.colors || []}
                        colorImages={editProduct.colorImages || {}}
                        onChange={(v) =>
                          setEditProduct((p) => ({ ...p, colorImages: v }))
                        }
                      />
                    </div>
                  )}
                  <div style={{ gridColumn: "span 2" }}>
                    <label
                      style={{
                        fontSize: 12,
                        color: MED,
                        fontWeight: 700,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      📦 Pack Sizes with Prices
                    </label>
                    <PackOptionInput
                      options={editProduct.packOptions || []}
                      onChange={(v) =>
                        setEditProduct((p) => ({ ...p, packOptions: v }))
                      }
                    />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label
                      style={{
                        fontSize: 12,
                        color: MED,
                        fontWeight: 700,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      📸 Photos (up to 5)
                    </label>
                    <div
                      style={{ fontSize: 11, color: LIGHT, marginBottom: 8 }}
                    >
                      Upload to{" "}
                      <a
                        href="https://imgbb.com"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: PRIMARY, fontWeight: 700 }}
                      >
                        imgbb.com
                      </a>{" "}
                      → BBCode → copy URL between [img]...[/img]
                    </div>
                    {(editProduct.imageUrls && editProduct.imageUrls.length
                      ? editProduct.imageUrls
                      : [editProduct.imageUrl || ""]
                    ).map((url, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 8,
                          marginBottom: 8,
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: MED,
                            fontWeight: 700,
                            minWidth: 20,
                          }}
                        >
                          #{i + 1}
                        </span>
                        <input
                          style={{ ...inp, marginTop: 0, flex: 1 }}
                          type="text"
                          placeholder={"Photo " + (i + 1) + " URL"}
                          value={url || ""}
                          onChange={(e) => {
                            const base =
                              editProduct.imageUrls &&
                              editProduct.imageUrls.length
                                ? [...editProduct.imageUrls]
                                : [editProduct.imageUrl || ""];
                            base[i] = e.target.value;
                            setEditProduct((p) => ({
                              ...p,
                              imageUrls: base,
                              imageUrl: base[0] || "",
                            }));
                          }}
                        />
                        {url && (
                          <img
                            src={url}
                            alt=""
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 6,
                              border: "1px solid rgba(255,255,255,0.6)",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        {(editProduct.imageUrls && editProduct.imageUrls.length
                          ? editProduct.imageUrls
                          : [editProduct.imageUrl || ""]
                        ).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const base =
                                editProduct.imageUrls &&
                                editProduct.imageUrls.length
                                  ? [...editProduct.imageUrls]
                                  : [editProduct.imageUrl || ""];
                              base.splice(i, 1);
                              setEditProduct((p) => ({
                                ...p,
                                imageUrls: base,
                                imageUrl: base[0] || "",
                              }));
                            }}
                            style={{
                              background: "rgba(255,235,238,0.9)",
                              border: "1px solid rgba(198,40,40,0.3)",
                              color: DANGER,
                              borderRadius: 6,
                              width: 28,
                              height: 28,
                              cursor: "pointer",
                              fontSize: 14,
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {(editProduct.imageUrls && editProduct.imageUrls.length
                      ? editProduct.imageUrls
                      : [editProduct.imageUrl || ""]
                    ).length < 5 && (
                      <button
                        type="button"
                        onClick={() => {
                          const base =
                            editProduct.imageUrls &&
                            editProduct.imageUrls.length
                              ? [...editProduct.imageUrls]
                              : [editProduct.imageUrl || ""];
                          setEditProduct((p) => ({
                            ...p,
                            imageUrls: [...base, ""],
                          }));
                        }}
                        style={{
                          fontSize: 12,
                          color: PRIMARY,
                          background: "rgba(173,20,87,0.08)",
                          border: "1px dashed rgba(173,20,87,0.4)",
                          borderRadius: 8,
                          padding: "5px 14px",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontFamily: "inherit",
                        }}
                      >
                        + Add another photo
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <button
                    onClick={saveEdit}
                    style={{ ...btn, flex: 1, padding: "11px", fontSize: 14 }}
                  >
                    ✓ Save Changes
                  </button>
                  <button
                    onClick={() => setEditProduct(null)}
                    style={{
                      flex: 1,
                      padding: "11px",
                      fontSize: 14,
                      background: "rgba(255,255,255,0.6)",
                      border: `1px solid rgba(173,20,87,0.3)`,
                      borderRadius: 20,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: 600,
                      color: MED,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </>
        </ErrorBoundary>
      )}

      {/* AUTH MODAL */}
      {showAuth && (
        <>
          <div
            onClick={() => setShowAuth(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(45,10,63,0.6)",
              zIndex: 200,
              backdropFilter: "blur(4px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 380,
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: 24,
              overflow: "hidden",
              zIndex: 201,
              boxShadow: "0 24px 80px rgba(173,20,87,0.35)",
            }}
          >
            <div style={{ background: GRAD, padding: "20px 28px" }}>
              <div style={{ color: "#FFF", fontSize: 18, fontWeight: 900 }}>
                🌸 কাঁকনবালা
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Your Handmade Shop
              </div>
            </div>
            <div
              style={{
                display: "flex",
                borderBottom: `1px solid rgba(173,20,87,0.15)`,
              }}
            >
              {[
                ["login", "Login"],
                ["signup", "Sign Up"],
              ].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => {
                    setAuthTab(k);
                    setAuthError("");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 14,
                    fontWeight: 700,
                    background:
                      authTab === k ? "rgba(173,20,87,0.07)" : "transparent",
                    color: authTab === k ? PRIMARY : MED,
                    borderBottom:
                      authTab === k
                        ? `2px solid ${PRIMARY}`
                        : "2px solid transparent",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
            <div style={{ padding: "24px 28px" }}>
              {authTab === "signup" && (
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      fontSize: 12,
                      color: MED,
                      fontWeight: 700,
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Full Name
                  </label>
                  <input
                    style={inp}
                    type="text"
                    placeholder="Your name"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                  />
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    fontSize: 12,
                    color: MED,
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Email
                </label>
                <input
                  style={inp}
                  type="email"
                  placeholder="your@email.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (authTab === "login" ? handleLogin() : handleSignup())
                  }
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    fontSize: 12,
                    color: MED,
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Password
                </label>
                <input
                  style={inp}
                  type="password"
                  placeholder="Min. 6 characters"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (authTab === "login" ? handleLogin() : handleSignup())
                  }
                />
              </div>
              {authError && (
                <div
                  style={{
                    background: "rgba(255,235,238,0.85)",
                    color: DANGER,
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 14,
                  }}
                >
                  ⚠ {authError}
                </div>
              )}
              <button
                onClick={authTab === "login" ? handleLogin : handleSignup}
                disabled={authWorking}
                style={{
                  ...btn,
                  width: "100%",
                  padding: "13px",
                  fontSize: 15,
                  opacity: authWorking ? 0.7 : 1,
                }}
              >
                {authWorking
                  ? "Please wait..."
                  : authTab === "login"
                    ? "Login →"
                    : "Create Account →"}
              </button>
              <div
                style={{
                  fontSize: 11,
                  color: LIGHT,
                  textAlign: "center",
                  marginTop: 12,
                }}
              >
                {authTab === "login"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <span
                  onClick={() => {
                    setAuthTab(authTab === "login" ? "signup" : "login");
                    setAuthError("");
                  }}
                  style={{ color: PRIMARY, fontWeight: 700, cursor: "pointer" }}
                >
                  {authTab === "login" ? "Sign Up" : "Login"}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CART DRAWER */}
      {cartOpen && (
        <>
          <div
            onClick={() => setCartOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(45,10,63,0.5)",
              zIndex: 100,
            }}
          />
          <div
            style={{
              position: "fixed",
              right: 0,
              top: 0,
              bottom: 0,
              width: 390,
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(20px)",
              zIndex: 101,
              overflowY: "auto",
              borderLeft: "1px solid rgba(255,255,255,0.5)",
            }}
          >
            <div
              style={{
                background: GRAD,
                padding: "18px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ color: "#FFF", fontSize: 16, fontWeight: 800 }}>
                🛒 {t.yourCart}
              </div>
              <button
                onClick={() => setCartOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#FFF",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 20 }}>
              {cart.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: LIGHT,
                    padding: "50px 0",
                  }}
                >
                  <div style={{ fontSize: 50, marginBottom: 12 }}>🌸</div>
                  <div>{t.cartEmpty}</div>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div
                      key={item.cKey}
                      style={{
                        display: "flex",
                        gap: 12,
                        paddingBottom: 16,
                        marginBottom: 16,
                        borderBottom: "1px solid rgba(255,255,255,0.4)",
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 10,
                          overflow: "hidden",
                          flexShrink: 0,
                          border: "1px solid rgba(255,255,255,0.5)",
                          background: "rgba(255,255,255,0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 26 }}>
                            {item.product.emoji}
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{ fontSize: 13, fontWeight: 700, color: DARK }}
                        >
                          {item.product.name}
                        </div>
                        {(item.size || item.color || item.piece) && (
                          <div
                            style={{ fontSize: 10, color: LIGHT, marginTop: 1 }}
                          >
                            {[item.size, item.color, item.piece]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: PRIMARY,
                            marginTop: 2,
                          }}
                        >
                          ৳{item.product.price.toLocaleString()}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginTop: 7,
                          }}
                        >
                          <button
                            style={qBtnS}
                            onClick={() => adjustCart(item.cKey, -1)}
                          >
                            −
                          </button>
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              minWidth: 20,
                              textAlign: "center",
                            }}
                          >
                            {item.qty}
                          </span>
                          <button
                            style={qBtnS}
                            onClick={() => adjustCart(item.cKey, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div
                        style={{ fontSize: 13, fontWeight: 800, color: DARK }}
                      >
                        ৳{(item.product.price * item.qty).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  <div style={{ paddingTop: 8 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "14px 0",
                        borderTop: "2px solid rgba(255,255,255,0.4)",
                        margin: "8px 0 16px",
                      }}
                    >
                      <span style={{ fontWeight: 800, fontSize: 16 }}>
                        {t.total}
                      </span>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: 20,
                          background: GRAD,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        ৳{cartTotal.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setCartOpen(false);
                        setCheckoutModal(true);
                      }}
                      style={{
                        ...btn,
                        width: "100%",
                        padding: "13px",
                        fontSize: 15,
                      }}
                    >
                      {t.proceedCheckout}
                    </button>
                    <div
                      style={{
                        fontSize: 11,
                        color: LIGHT,
                        textAlign: "center",
                        marginTop: 10,
                      }}
                    >
                      {t.securePayment}
                    </div>
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
          <div
            onClick={() => {
              setCheckoutModal(false);
            }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(45,10,63,0.6)",
              zIndex: 200,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 450,
              maxHeight: "92vh",
              overflowY: "auto",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: 20,
              zIndex: 201,
              boxShadow: "0 20px 60px rgba(173,20,87,0.3)",
            }}
          >
            <div
              style={{
                background: GRAD,
                padding: "18px 26px",
                position: "sticky",
                top: 0,
                zIndex: 2,
              }}
            >
              <div style={{ color: "#FFF", fontSize: 17, fontWeight: 800 }}>
                🌸 {t.completeOrder}
              </div>
            </div>
            <div style={{ padding: 22 }}>
              {/* Name */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: MED, fontWeight: 700 }}>
                  {t.fullName}
                </label>
                <input
                  style={inp}
                  type="text"
                  placeholder="Your full name"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer((c) => ({ ...c, name: e.target.value }))
                  }
                />
              </div>

              {/* Phone with BD validation */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: MED, fontWeight: 700 }}>
                  {t.phoneNum}
                </label>
                <input
                  style={{
                    ...inp,
                    borderColor:
                      customer.phone && !validatePhone(customer.phone)
                        ? DANGER
                        : customer.phone && validatePhone(customer.phone)
                          ? SUCCESS
                          : "rgba(173,20,87,0.25)",
                  }}
                  type="tel"
                  placeholder="01XXXXXXXXX or +8801XXXXXXXXX"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer((c) => ({
                      ...c,
                      phone: formatPhone(e.target.value),
                    }))
                  }
                  maxLength={14}
                />
                {customer.phone && !validatePhone(customer.phone) && (
                  <div
                    style={{
                      fontSize: 10,
                      color: DANGER,
                      marginTop: 3,
                      fontWeight: 600,
                    }}
                  >
                    ⚠ Enter valid BD number: 01XXXXXXXXX (11 digits)
                  </div>
                )}
                {customer.phone && validatePhone(customer.phone) && (
                  <div
                    style={{
                      fontSize: 10,
                      color: SUCCESS,
                      marginTop: 3,
                      fontWeight: 600,
                    }}
                  >
                    ✓ Valid number
                  </div>
                )}
              </div>

              {/* Email with validation */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: MED, fontWeight: 700 }}>
                  {t.email} (optional)
                </label>
                <input
                  style={{
                    ...inp,
                    borderColor:
                      customer.email && !validateEmail(customer.email)
                        ? DANGER
                        : customer.email && validateEmail(customer.email)
                          ? SUCCESS
                          : "rgba(173,20,87,0.25)",
                  }}
                  type="email"
                  placeholder="your@email.com"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer((c) => ({ ...c, email: e.target.value }))
                  }
                />
                {customer.email && !validateEmail(customer.email) && (
                  <div
                    style={{
                      fontSize: 10,
                      color: DANGER,
                      marginTop: 3,
                      fontWeight: 600,
                    }}
                  >
                    ⚠ Enter a valid email address
                  </div>
                )}
              </div>

              {/* Address — 5 level */}
              <div
                style={{
                  ...inp.bg,
                  border: `1.5px solid rgba(173,20,87,0.2)`,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 14,
                  background: "rgba(255,255,255,0.6)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: MED,
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  📍 Delivery Address
                </div>

                {/* District */}
                <div style={{ marginBottom: 8 }}>
                  <label
                    style={{
                      fontSize: 11,
                      color: MED,
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 3,
                    }}
                  >
                    1. District (জেলা) *
                  </label>
                  <select
                    style={{ ...inp, marginTop: 0, fontSize: 12 }}
                    value={customer.district}
                    onChange={(e) =>
                      setCustomer((c) => ({
                        ...c,
                        district: e.target.value,
                        area: "",
                        thana: "",
                        postOffice: "",
                        city: e.target.value,
                      }))
                    }
                  >
                    <option value="">-- Select District --</option>
                    {BD_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {customer.district && (
                    <div
                      style={{
                        fontSize: 10,
                        marginTop: 3,
                        fontWeight: 600,
                        color: customer.district === "Dhaka" ? SUCCESS : WARN,
                      }}
                    >
                      {customer.district === "Dhaka"
                        ? "✓ Dhaka — Delivery ৳80 (COD available)"
                        : "⚠ Outside Dhaka — Delivery ৳150 (Online payment required)"}
                    </div>
                  )}
                </div>

                {/* Area/Upazila */}
                {customer.district && (
                  <div style={{ marginBottom: 8 }}>
                    <label
                      style={{
                        fontSize: 11,
                        color: MED,
                        fontWeight: 600,
                        display: "block",
                        marginBottom: 3,
                      }}
                    >
                      2. Area / Upazila *
                    </label>
                    <select
                      style={{ ...inp, marginTop: 0, fontSize: 12 }}
                      value={customer.area}
                      onChange={(e) =>
                        setCustomer((c) => ({
                          ...c,
                          area: e.target.value,
                          thana: "",
                          postOffice: "",
                        }))
                      }
                    >
                      <option value="">-- Select Area --</option>
                      {getAreas(customer.district).map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Thana/Police Station */}
                {customer.area && (
                  <div style={{ marginBottom: 8 }}>
                    <label
                      style={{
                        fontSize: 11,
                        color: MED,
                        fontWeight: 600,
                        display: "block",
                        marginBottom: 3,
                      }}
                    >
                      3. Police Station / Thana *
                    </label>
                    <select
                      style={{ ...inp, marginTop: 0, fontSize: 12 }}
                      value={customer.thana}
                      onChange={(e) =>
                        setCustomer((c) => ({
                          ...c,
                          thana: e.target.value,
                          postOffice: "",
                        }))
                      }
                    >
                      <option value="">-- Select Thana --</option>
                      {getThanas(customer.district, customer.area).map((t2) => (
                        <option key={t2} value={t2}>
                          {t2}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Post Office */}
                {customer.thana && (
                  <div style={{ marginBottom: 8 }}>
                    <label
                      style={{
                        fontSize: 11,
                        color: MED,
                        fontWeight: 600,
                        display: "block",
                        marginBottom: 3,
                      }}
                    >
                      4. Post Office *
                    </label>
                    <select
                      style={{ ...inp, marginTop: 0, fontSize: 12 }}
                      value={customer.postOffice}
                      onChange={(e) =>
                        setCustomer((c) => ({
                          ...c,
                          postOffice: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- Select Post Office --</option>
                      {getPostOffices(
                        customer.district,
                        customer.area,
                        customer.thana,
                      ).map((po) => (
                        <option key={po} value={po}>
                          {po}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* House / Road */}
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      color: MED,
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 3,
                    }}
                  >
                    5. House No, Road No, Block *
                  </label>
                  <input
                    style={{ ...inp, marginTop: 0, fontSize: 12 }}
                    type="text"
                    placeholder="e.g. House 12, Road 5, Block C"
                    value={customer.houseRoad}
                    onChange={(e) =>
                      setCustomer((c) => ({ ...c, houseRoad: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Promo code */}
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    fontSize: 12,
                    color: MED,
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  🎟 Promo Code
                </label>
                {promoApplied ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: "rgba(46,125,50,0.1)",
                      border: "1px solid rgba(46,125,50,0.3)",
                      borderRadius: 10,
                      padding: "8px 14px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: SUCCESS,
                        flex: 1,
                      }}
                    >
                      ✓ "{promoApplied.code}" — {promoApplied.label} (saves ৳
                      {promoApplied.discount})
                    </span>
                    <button
                      onClick={() => {
                        setPromoApplied(null);
                        setPromoCode("");
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: DANGER,
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      style={{ ...inp, marginTop: 0, flex: 1 }}
                      type="text"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                    />
                    <button
                      onClick={applyPromo}
                      style={{
                        ...btn,
                        padding: "9px 18px",
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Payment method */}
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:12,color:MED,fontWeight:700,display:"block",marginBottom:8 }}>💳 Payment Method</label>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
                  <button onClick={()=>setPayMethod("cod")} style={{ padding:"12px",borderRadius:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,border:`2px solid ${payMethod==="cod"?PRIMARY:"rgba(173,20,87,0.2)"}`,background:payMethod==="cod"?"rgba(173,20,87,0.08)":"rgba(255,255,255,0.6)",color:payMethod==="cod"?PRIMARY:MED }}>
                    🚚 Cash on Delivery<br/><span style={{ fontSize:10,fontWeight:400 }}>Dhaka only</span>
                  </button>
                  <button onClick={()=>setPayMethod("online")} style={{ padding:"12px",borderRadius:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,border:`2px solid ${payMethod==="online"?PRIMARY:"rgba(173,20,87,0.2)"}`,background:payMethod==="online"?"rgba(173,20,87,0.08)":"rgba(255,255,255,0.6)",color:payMethod==="online"?PRIMARY:MED }}>
                    📱 Mobile Payment<br/><span style={{ fontSize:10,fontWeight:400 }}>bKash · Nagad · Rocket</span>
                  </button>
                </div>
                {payMethod==="cod"&&deliveryCharge()===150&&(
                  <div style={{ fontSize:11,color:DANGER,fontWeight:600,padding:"6px 10px",background:"rgba(255,235,238,0.85)",borderRadius:8,marginBottom:8 }}>⚠ Outside Dhaka — Please use Mobile Payment</div>
                )}
                {payMethod==="online"&&(
                  <div style={{ background:"rgba(255,248,255,0.95)",border:"1.5px solid rgba(173,20,87,0.2)",borderRadius:14,padding:16 }}>
                    <div style={{ fontSize:12,fontWeight:800,color:DARK,marginBottom:10 }}>Step 1 — Choose payment method:</div>
                    <div style={{ display:"flex",gap:8,marginBottom:14 }}>
                      {[
                        {name:"bKash",  color:"#E2136E", logo:<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALYAAABkCAYAAAArBsogAAA/sElEQVR42u2debwkVXn3v+dUVe+3++53NmbYBodNZFPcBQVFA5oFVEDQqBBEgQAKAqLIDAKCEBWJRhOXACqJMcSIJOIAokTZYWSXZfa739t7d1Wd8/5RXTXdfav6LgyIvFN8ipm5t0+fp57z1DnP83s2obXWhFy2bTM2NoYQouXnWmtSqRS5XC5sGMVikXw+j5Sy5edKKfr6+ojH4zPGaK0ZGxvDcZwZ8xmGQX9//4yfd6JRKUUmkyGbzYbSmM/nKRaLM2gE6O3tJRaLhY4bHR2dQaPWGtM0GRgYCB1Tq9WYmJgI5WMmk6Grq2teNGqt6e/vx7KsGWOUUoyNjaGUmjEmFovR19cXSeP4+HjommWzWTKZTOi4yclJqtVq6Nr09/djmmYojaOjoyilZvCxE43lcpmpqalQfuRyOVKpVMvPJTuuHdcr8Noh2DuuHYK949px7RDsHdeO6094mVG/EEIQZldG2JozPtNuwLT/O2yuqPnCjJNO362U6kinP1fYZ2abq31c2LPOhWezjYn67k7PFcXHqGd9oXzsRE8UH/2fL5SP7fNFjTFt2458yCgEQwhB1Djfug1DAVzXDR0nhMCyLAzDmHmkSEm9Xg9llOM4mKaJlHIGk3wam18M/+9SSuLxeCSNkcdbY1z7XIZhzJirEx+FEMGC+PwQgJ4HH6OuWCwWuthSysg1c10Xy7JC5/JpDHs2wzBCafTXJowOH0VqX2v/51FzCSEi10xrPePZxObNm3XY5PF4PBJ6qVarTExMzIBeXNcll8t1hIcqlUoo0QMDA6GCrbVmeHg48gXqBA9NTk6GwkPd3d0z4CH/mpiYoFarhS7W4OBgKEToui4jIyOhNCaTSXp6eho/aJJg4UGjhWkPGnWFpxdKDbZ26enpJZVMhtI4Pj5OrVZrecGEEBiGweDgYKSgjY6OLgi+nZ6eDuVjb28viUQidNzY2Bi2bc+YT0rJwMBAJHwbRWM6nY6ksVAokM/nW+THnO3o7XTszfcYj/pcp3H+2zuXo7T9O/17e11zUQM6PovwP9sQNqlxlYOSElcLLCVACITethMFe54/FoECFCCkaCYALQUumnYKBMI7DaRAzxAaUKL1vYvi5fbk42yqynzna/+8+VIr9fMV0D+XuebE/IbkOOUyqlInY0gsI45IJVGui6Nc6gKE1siY6Qm5cj3pw19wiVAaoRSiaRcVjd1e6pnCKUTjRQj5nW6MIUKo/xRrFnYqbjfj8c/98hdjIbv9Qi6l1OwLojQYgvpEiT/+3eX0VDW1PRZjZ5PITJrMisUkd10MMQP6FWLRACI5Uz0zU3Hq2gHXBaW93VgLTzRd5b0Qwtv9dTsEpnXTzixQuk25f6WjIq+Ea3sen9tlLkOglSK1bIDd//4kHvqrc1C/fxAssIRJ0YwRSyVwgbFcmviKxVSXDWKnLPoWDdC7cjl66QBuuURXPEairxudiuOgcITCiUuk1bqkGtdTRZRCOwqUwjEFhpAIAQ4ahQ5kW7xC1syMgthm2+Xaff3zgbDC4KhOOlcY7DQbjf64+dLow07zsSGaUZfZ4DIhJWhN8u37smT1qWy+6DoyyRRaKQwXKNaQUqAqdQqbRnFdG4RkXJpMSRMhJdoyiff3oIe6qeWSiLhFZqcBUiuXMbF8CVYsQWagBzE0iEwa3otjxbBSaVwDTKVRjoNWNmgVqpfPBWabzTYK+0wnfT3qdJ2LXLV/RkxNTekoPScKAtJaU6/XQ788FouFohu+Ze667ozgFyFEEHjU/juAer0eKtiGYYQGA/m0hFnlWmssy0JKGfo7n8YoKC1sUcLgpmYaTdNsHac1ylWkzCRPnPEVJq//BameLNp1QYAUAiEkUgiMhpahREOYGvq2chTadVBaoYVAaoGpGupFIoYc7MYe7MVOmcT7svTuvBQ5kEXFDNJdaVI7LcJdtAjXMDDSBmbKwnFcT41pUs5d1w0NTmuGI8N4Uq/XZwpkQwfqxMcwaLcZIgz7nVJqxjgRFd3nui7Dw8OhO146naa7u7sj9BJGQH9/fyg2Dl7kXDtxvhAODg6GjrFtm5GRkRk4tlKKrq6uSHgon8+HRiBqrRkcHIx8WYaHh2cI/Ww01uv1AMISvgFnGLiOQ66vl1RNcu/fnAv3PYGVSSJdhZZN6ADaUyWMxibQeDGEfyoJ71NSCc9wlAJXK5SrwHFQKG9OpdGuN05mEui+LG62C0eYZN7zenY+/G1MDxg4hmesKqnB0eS6u+nqAN+WSqVQ22JoaChyg9u6dWuo4ykej9Pf3x86plKpREYg9vb2zj26z9+1m2Ez/55NTZFSzrhn0518x0nYuKj5fBrnO1/UXO0vSJi6tJBn8z9nCIklDeR0idRkBb1pgppweM0/nIe7KIuu2AgkWgtUQ/dVQuAKgUaCkGghUQhcwNEapTRKebpyXWhs5YJWSAlG3MKKxzETcYxUEiObQuRS3quydYrEY88Ru2cdAz2DPHn+j1A3P0lXOg1aYgnP8SU6ICML4aOvnrwQPrbf/98Zjy8rQxZwtUYkY4w9uJ61512N6Sgcx2bPo49gr89/iifOWE23jOEKzYy9Ts/NtFNixqDg77qBgEjtGbIOBuYuizAWLyL54G2UH/kZmUOWYSxN4ao/b6hkRxDUSwU/4qkJlVqFZQftzeFnfJjS8AiVJ5/jd1d+lbH8CK86/xTyU1MYhrFgBE4LcCNu1bLbStxqAbXvSuqTJpXRUcxN44xc/DOymLjS3SHYO665XzEMCo7Nkve/g7+58SvEVi4lbiT41flrKO+xE/3HHEllYhJpSG/3VRqtFVqrYAcWQiKE0XTL4Pb+M2bcQksEnmohABOBQJA6eBXi3mdJu5CIJVA3r2P6278nG0+hHPtl5+R6wYLtw2Vh91ygwLB7LvDQfMZ1onEu8NB854qicS6wY8scCMbGJhg89LWc9F/foWe/Vbjj09zxmS+y8yePJXPgnrj5EgYSLQiEUbcoNs13u9IjOn7G/5eIxejfay8q6/5IEgslDFIyzshV/4W8ewtJMxXwMgrFmC8fff17e/Cx01qLQqGgo3BLwzBmNQLaf2aa5qwho2HjwoyAuYSzRhkPPvPCrOhOWKo/X9jvO83V6eeh0KLS1B2XeCqBfnwDN33kM4zcfx8r3/cXvOUjH+KJ0y8jW3WxY96cphKBROoX4HI2UBhaoKt11MolLDvtDDb+/XcZmrBxBDjSwKmVqB20gl1+eja13jq6pj2/vHARQs7g/wysvsn3MF8+RsnHfNfMzOfzoR/sBL1Uq1XGxsZChb23tzcyum9iYoJyuTzjwYQQDA0NhT6wVpqtw+HwUCKRiKQxLPnTZ3hPT09kdN/4+HhkBOKiRYsio/vCIhCVUiSTycgIRLdUYXzrCF2Ls7zve1fwHyd/lnU//RGLdt2FvVafxuNnfpm0mcJFNSDg7eOVE4ByXcSrluM8O4ExWoJY0ptFKtLJLOLe55n8+i/JXnIEY2NbMY0YCLdlHTrCtyOj1Oq10FDXRYsWdYRvoxKfZ4Nvm8fJ+UJs7Y6H9nshMFsn75LS3q5rGMaMe1Y9KwJOmu3IC5urE4QVBUX54yLHNBwPZdvGHurmfd+5lOVvPYxffeUKxlSN/k+cwOTktBeVh0Br4WmPC9R7AxwdcKt1Bg54DZV1z5DSCsfAw8+BGg7JRJrpq26l9r2HyHV3gXBm8KQjH2U4H5tj0ecDFc+2Zu0yssN4/FNCgEKD0JiGQb1exenP8pffvoxd3/Z2/v3jf8/Qe97KomOPQE8VPBXAD2ddIGYitMbQoG0XOZjDiPdSWLeRmIxjA0polAAtNHUp6HIlm1f/J8bDE1iWRDcJ5MvdqNwh2C8HKFBrhGFQdRyqmSTv++7VrHrX4fzwb09m2anvx165AlWuBsIp1AsQbgRG3aW++xBSpVBPT6BMA1eDK8Q2eBCFiBl0PTfO6Jr/IV1NoYT+s4kE3CHYLxOMWwKWNFAaCgnBe3/0VZbtt4pbV1/Gvld/lkraQLqeEaeEQGuCux3Hbr5pqB9+zLWWEqdq0/f6A6j9cT3JagXXAi9nQTeN1djCwUonqd3yEOPX3UGP1YXSzp88AnBOgt2c2BpkbcwxiTNs3Gxj/O9uv2eD2aLu2SC9hdAYdb8YNLZ8VikQYNt1yqLOkTdcQ9+yRdx76y3s8blPMVYvgmF42rKezy7dSDtDoLVCpeNk+nei8PhGYqiGUKuml6AROiEEjnLJxiwK1/2S2u3rScVSKLeO1rPDt9uLj3OFb1vmqFarOuqDYeiAH/QTVQbMtu2g7FUzROMjBFF5jdVqNTLMMRmR+xdFox9lGEVjvV6nXq+HBkElk8lIg69SqYSW5pJSRtLoum5oGbAoGv3FtSs2VbdGXyLJ2rO/RGrXlQxsGGPkB78gk8vhKrcpjap1x26zvpEaDCGQSmPaLvnFWXb7wsU898l/ZHCkhhuTqEaKmBes1Qiu0hqhNSYCu1Smts9O7P6Lc7D7vcCsarWG49ih/Eomk5HYd6VSmSHgPiARlUNp23aQixpWGq09cM2Mgmscx2FycjJUsA3DiIR5bNsOhK0ZiXBdl66urkhhy+fzkbX7oiIJo2j0s66jaKzValQqldBM6a6ursjovunp6cjafVE01uv1UMGelcZKnXqlzla7ypsvPZv7vvY9xL67YO6/B/VHnsVKJ1Faz0Et2JZCoKWgVqmRPngv1OgUmeEixBIt+oxogIqioW8LBY7SmOkU7rpnWH/Rv7PLPx0HEkqlEpVqBUPKGU6gbDYbuYlNTU1F1u6LgvRc141cs3g8PoOPcjZHStg9qxOgAQU2RwfOBpdFzTVbdF/Y52dL0Vpo5GInGjvNFTZ21jQyAVIKDAxGnSq7f/RvKPSlWXn2ibiLcuhK3VMxlIYm1bEBtAR3i5MDkNqlb9Uqys9tQTg1dCN9zIux8tz4qpEkbNDgiSFxgGQ8Q+27dzD2g4cb0qYQ0kAI8wWv2Vxkqxn+m23MDuPxZWtQKrRoZKk7ipppsOyN+xE7ZDdWXnAyZUsgFAgtZqofUe+Kq6j1pojtvIrJ2x4mRtxLGWNbymQYiuLj0pgmWTPJyLk/wFk3hUyn0a56WfJvh2D/OeDdUmIAVVwm7DK5D7yNxZ/6IPVKrWFMyqa7+XhXzccNumZj7LYU7QiMJ8chZs5ugzb0bqnBERosg67hAs+fcwPmpIspJVq/gEhArcFVaFeh/F1e6VlPwD+ZYM8XHVi4k0MsCI1Y6FwvxrPNNl4EkKBAIKnaJXY++/1k3/166lMFLMP0kgs0+IpFoJo0/m0IgVup0nPQvjhTBczJKS/xV0QYnSGCIhDUhUJkunBufZipL99CdzyHUG4jArHBjzA1X3tCrJWX3aO15wJVloHIpYhn03SZDT1ZiuB7VLOlIOYeVmB2ql8X6DBabFPYdPSCzFY0plMwU5jO1KlYTrNAz0Wnm22uudDqGzydahpGBf10SmoN46M/X7vrWmiBwEBbmuVfOpWHn9uE/eRGdMJqqBWtzhuBxtRgKUU5IUjvuTcjt64jRRyURAm3LTkh/HKkT6vA0S65eIax79xB9uDdSb1nVwqlRpF6rZDKE2DXdT1d35S+SYphmiSzSazJKkZZIUbGmH5mPfZEiWc2bGDxiccgRIzuvYdwtQqCroINpe352tc3eO6RkZHQ6D7LsrZ1BFDesdZIr6PuOBQKhch8yCjoq1AoBEnAzbmDPqoQGgTVsKJ9opvxyng8HmlFV6tVisViqKBlMplINCKfz4cmAQshIi1913WZnp5uCcf0x6RSqcigMJ/G9kAt13XJZDKR0FchP41dq5FMJ+E3T/HYqZdj1l2ENNDC9Zwxwt9pFYaCuAOTPRa7nncuo6t/RuqZSWTcwhEqSBaWDSHqaMRpEChiCijXKe05wNJfnIO5JI52NUbMQCKZLEyiDUnc0RijRago9JZRpp/egKpUKT78BFPPbCIzUUYMT6DH8sg3rmLns87g0VOvY+fPfoDMR17LVG0arTSJZIJMOkMghE1XuVyeEVxnOo4TKkwtgUZG8D/vwZ3wzGV/QTsFKLmui2EYgUAKIYKE0Ch4yHGcQGgymQyxWCzIaI6aS0qJ4zihWHUnGv35whbXR3rCTg8/mzsWi9HV1RVkrvvPG7kTttHof5cfjBXKQ+1io3AKRboP2p1lpx/Hpku/hxkzQAoUCtm0+EIInEqV7jfsiVG1kc+MYMY8uFDLuZ1WAT8aviFb2pjJFDw6zObzfsyu3/8IWBpnvEBlvIT54ONMPvo001Ml8o89R3l4ErNSxxovYNYdsAwSQqGkwEzEqGRjrDj2aKYe2sTgSI3xz/4QpeukTjqQyVIRM5nAMM0589GctW4egtH7/kjhW3eRKDmog5YxePo7vJiFkPDT2bxDhmEwMjLCJZdcglKKWq3GySefzMEHHxyqxvg/c12XbDbLT37yE+644w6UUpx66qm87nWv61iFaSEFWKLUlE7qjn9a3Xvvvdx4442Ypsm+++7LSSedNK+55gSpNrJlTCmZsivkTjyU6nObmPjeL7BySWzviPVKnnmFoXAEdO+8J4XHJ7y6IlLgNp5Hi/kWyhGAgYtLJpGm8KPfM37Ya3CXCp4+73IouVgVB2u6jAaMpEFagjYkMm1BMtZYV5BaIWoaY3E/8f32ZeqTN5IQcXpqJuOf/TcGidF7/IHUHTvQuQ3VRIYI51tH49GvNVd/dgz5T78mdcMduDc/jDaMBYdOaq0pl8v8x3/8Bz/60Y+4/vrrQxsktb+NXV1d/OY3v+H888/nu9/9LkopVq1aFVnrrZPO+2Jcvidx/fr13HDDDfzwhz/k3nvvnVN47bxfPC0Q2osZEUKSd6ssPuOvMN68N26hRAzpGZvK04k1UEmZGCv3pHzv8xjoBa9foLlrw6uoJh1yJJn67A/I6F5yA0tJPT9J0hHEMhmM7gwkJcQkwtBoV3mhA1o3vKKSeqVGzyEHomug/vAchrSoW4KsHWf4vB9SvmkduUy3Z0NocCXhyUPzRUWseAKRyaDMNGZvBgVosfCwd8Mw6OnpIZfL0dvbG+np8wUmkUgwOjrKF7/4RfL5PEcddRRXXHHF7GjCS1zizLdNenp66O7uJpvNzuqYeqFotxAC11GUszH2vOij6JWLcMo1JB5EZwCyapPaZRkyDdYfnsUw415ZM6nnjIHPlBzRcO5IVNwgNVpj/Cs/ZcX5f091SS/U6tSERjXqC3oRWyE+UaHRcUHXuw6j8F8Pk5QaETdxpcSwDBY5FlvP+2fGf/qg56BRnnGqhJ4/3BcshC8YDZjGcdzgNVEvAGJTDYvZr7rUKa/O1zXPP/98HnroIfbcc0+uuOKKjgXhO0GOc+3IsJDgneZn8+/ZXrDtQaMhJPVKhdrKQVZ84RTKSRPT1t4aCXDrdTK7LKderGBPFxENmE+JF/JKeYkJWoJCY6WyiF/+gdqdT7HbBadSqFWxkB5cF4QazjTInVodY/fFxHdfROGG26m6DhPlAsVqgXytyIgqYRaLPPWBL/PsD+5qJEuokKqxrfwzo3rxSSlxHQdheBCOV/pK4tY1UmvipoUwjBZafQGNKhEmpcQ0zWCH9gXCh7Tay585jkM8Hudb3/oWv/jFL+jr62P16tUsXbqUQqFAIpFoGdMuEGHGnv+Z2WgMNdocF22Ew4DNJbjaBTQKZYmisTm+JupFai735cdzV2oVBo88hD0+83G2XPgNZMJCIyjKOt2vPZDib9YjlI1rqoZ+Pct5PgfhVrJR1VUrYqluptfcxNCPz2LwxL9m6ns/wRzIoFyjMZOHyPunhJSCml2n720HYA6lSZz0Bkw3QcLw9lQtDLQUCMukS7lUtlaxJ6oYvSbadRGYwanVnr1lRuUMOo7DyOg4yUQce6qIq5V37FTqqGqdgaGhbQp8G6QXlbfW09NDIpGYEZHX29sbdEnwF8xxHLq7u/nZz37GVVddhWVZfP3rX+eII47Atm0ymQz1ej0ocdb8YvnoydDQUChG7NMYVaU/LKBJax003gxTrfr6+rAsi0wmE0CSqVSKZDLJhg0bZrwsfhm2IZ+PbdfU1BTT09Ohu73fZLW9ZQhaMzo8TPdfvp7x3z1A4eZfk02kMfp6ieeyOA8/gJKWt5NvN2XId6IolJSkibP50//Mkm99gsn7n0A99TQiHfM2x211pRqJlwqZSpE7ZB/qacngF44imU1EIEFQmyoxXcnjDjvohgGtlKK7u3sGHzvq2FoptOt6Hi8/WKah9KP1vF729rYSnQw8x3FIJpM899xzrF69munpaT772c9y9NFHB1FxYUdQmPOlk/Nne3gQO1UH9eeLCriai4oyV2RGCIGQEqU1U6bNzheehHXASsrTFZJLlyJTcUpPr8eyrG2evxfoSd7WdUGhpMYRLiJpkXl6lOnv/Io9vnAGVWGB46K0pxr5Mi2EwK7VSa3ahfi+ezBdK1GsTjZkTqFcF1cp3IZfoFwuMFrcii1cNBqpnRfuUtcBJOQdOaGl8Rfong51hzZ2twsuuICHH36Y4447jrPOOgvbtrdLtfuX6ppLgPz2vjz83qXSn2S3Cz/KZFeMzKq9mbh/Pdqu4xpGo2iwaPZ1eypC23+tv2//V+uB7f+8rhzMVI7q9XfiPDXCsgs+TrVQxZSxxjjX2+GVoKYV8u37Ifq6QCsMQyJk4xYGUjQlRguDmIiBMBptSeioRs0aOykCsr1MaQ8R0S9IN+u0W/let6997WvccsstHH744XzjG98IBP6lRDq210u7vVGR2U4jKQ3KtRrGwbuz5PwTKOwygHhgPUrZ2LJhNPonsFDBHRTC9AW7Kf5VCz0j5SzQKhrVXP1uCTYu3UaW/CU/on+/V5M+4lDUVB0pvdJtQntlkM1cjoE3vYaqW8XAQAir8ZUuSIUQrfHmWhoYQiCECcTolEYkZ4PhAyOvUftNa5+x3rGiG3EBNG6t5n7MtWPQ7Xr1TjvtxKWXXkoikZi1klTYdzcjL/49H5XDd7z43+E4Tsf62bPt2M0okP/3FwUKFGBIk3whz9IPvZ1djjyI0oN/wEoY2LKKa9q4Zh3X8OJEvFvM3KHnkO6mGzUdtNCNLHeNEjZuXJEYrzBy4b+y29kfwx7sR5VtlDaQGmr1GrFX70Z658XYtRpCgKdkKOCFd1boWOJMu42H0GobXKOVryQ1nGCebkfjjmfSnh7nuJ7Q+3pYUwhluwtZShmkjj322GNcdNFFJBIJrrrqKl71qlcFHsswGttz3Xyh8ftG+mhFc12LZgHvBOn5tPk1U3K5HF1dXQEaEzauebwv2L6LPpfLkc1mg7urq6tjwNjC80Mbm4s0KJYL5MfHSO0+SElUUaaDMh0caaOkjfZvYTfyLv0k4aZsYa1nqC0tLzA0CbXCMQzqQhFPJZG/e4Lpf7+TnS45lZojMJXA0R4k2n3YfuSzBrbroFwXrZRXX1CEe2Dmk8NqhnUm8FWCRCpBLGZRbzTFFEDMNEFDrVImHktSeHgT6vaN1P/wR7ASsPfOJF4zSOI1AzjVivfYwitG7jcwbZ7Tz4HzuxNceOGFPPXUU3zlK1/h3e9+N1NTU5Hwm1IqqOjkC7llWSQSCbZu3coTTzzBfffdx8aNG1m6dCkHHXQQBx10EF2ZrtAYDj9OxI/5kFJy//33c9ddd/H73/+eZDLJgQceyH777cerX/3q4DmklEE+nh+zIKUMntdHfW677baAnmXLlvGWt7yFt771rViWRbVabY11MM3QvEE/BiWqOajXYNXz0FmxGFt++xijD25k6etWUb3vQWKWAbiARgmvWGWgdioLobz4aqENTCfWegw0+d6VVB6IjWxqsadAOAhtoISkikMqkWP6qz9n0b+eS+9H38v4tT8g092FsdMgvYcdSN0ySaZSgECaJrVaDUI64vhrHdVho703pzk+Ph7KoFgsFpQPq+a6kNLL6iCZQCYSqKdHefaSGxj717VYyiKOhUOFOhaxoSH6P3kEiz99GMQDFZ3JiQlKpRKTk5MtIaDT09MkEglWr17Nrbfeyic/+UnOPPNMXNelv6+frcNbQzsJJJPJGSXOxsfHufTSS7nhhhvI5/PE43FKpVLAmBUrVvD1a7/O6w95fejuNz4+juu6TExMsPqS1fz0P3/KHnvswapVq/jd737H9ddfT29vLx//+Mf5whe+EOwamzdvpre3l2KxGHxXPp/HNE02bNjAKaecwt133w14ia6pVIpvfvObHHzwwaxZs4alS5cGwq2UYmBgYFt0Zds1NjYW6pzyS8UJ4TVTElLy2KMbyP/+AXY76n2opEZRB6kRwkUL2XJoC6oNp6JAK0lNbUOfpGshlBF0G0M1Ehy092cAIAowdAMlUaBMTbIm2fSZr7Ps2lMpPvww9dvuI/uBd5DZe3fQDmS8zHvbrjEyMhbZwLS3tzeUH8VicUbjU7NjsI/SXsEJpQMz0jYl8ZrgsU/+E+4fxlhx8fEkXr8IXTAo/nYDtR//Fv38CNOfux77mc0s/8cT0IbbcOaEw279/f1ce+21XH755Rx11FGsWb0m0L+b8xOj9HP/JXnmmWf4y7/8S8bHxzn55JM57LDDyOVyPP7449x8882sXbuWzZs38+GTPsx//+y/2W333WYEUAkhqFarnHXWWaxdu5bLLruMD37wg6TTaZRSrFmzhquvvjo4Kdp15GYcPpVKcf/993PkkUeyYsUKvvjFLyKlZN26daxdu5Z4PM5vfvMbzj77bH7wgx8E2PR8ci/bg8WCPxv73fTtv2fTI4/wpgtOx0pZCNttwjhUq1oh/X1XgOGA2AapuUYF0WQ1OtoETNASqUxM1wrCT7wYlm02mIxL4htHGPn2zez5sQ9x50NPsevb39DwaAOGlw2vNS1OrubdejZotL27gTlXfFYL7wBL6yRPnnMDtS3T7HPLBZSXJ6jaFeLKpOctu2F88LWs/9tvEntwE8V/+RWjB+3MwCfetI1/ulU/TqVSXHrppTzwwANkMhn2228/srls0Cd9ru5lKSX33Xcf5XKZu+++m+XLlwdOmOXLl3PUUUdx8cUXc/311zMyMsLV11zNtdde23Kk+/Rce+21/PKXv+SjH/0oH/vYx5ienmZiYoKddtqJ1atXc+edd/La17521ngY27Y588wzOe+88zjzzDNbGP+rX/2KU089lf7+fh566CF+/vOfc8wxx1AqlRbuLGnilZSS2uQUGx97ArtQJL9hE5kVi6k/sQHDtEC4DTup6bgPgvr9RXKbw55aZEGJerBjSy0R0gRlNtQVT+CFAi01thAkY2m2/Nf/YByyC/vffCWZZYu9jU6aQcTdfBM/XjCO7fXFVLhWDHHHY+R/dDerrjyV6aUWhekCug61ep3xwiTiNYMs/vJxVJOCpIiz9er/xtlQ9lQ0DUrOFICRkRGq1So9PT1861vfYu3atZimuSAc+PLLL2f58uVMTk5Sr9exbdvrWV4ocPrpp7N48WKSyST33HMPY2NjLRkqQggqlUqwm+6///6BnmwYBvV6HdM0+epXv8rKlStnGMLNL0g6nebmm2/mkNcfwllnnRW41n0d/rDDDuOUU05henoay7K47bbbtg923mS0bvztw5Q2j2JPTJPfMolYtSvVeq1R5NI3+rbd7d6LFihQeA2XlGwOQNKevi5cXFkHWUPIKkqWUaKEsOpIo06lMsZIb43BDx6LtWInBl+3CnOnHKpFjRaNqMHtk9Y3ZweNBOLSoDI1xrKj3kj94CXUSmUs02qE50osM0Y9XyDz1t0w37IXApPkH8co/u/DgSdTqG3YpJSSSqXC5z//eQ455BDK5TKmaXL22WczPT09ZyeHr7IcffTRvO9970MpRTweD1QY0zSxbZtUKsWhhx6K67o899xzPP3008Ec/nG3ccNGxsfHAySk2XPovwQHHXQQS5cunRUm7O7u5sQPnRhAfJZlBVi867oceeSRdHd3I4Rg06ZNjI6ORhrK8/JxN66R3zyArNnEZIzCukdJLhlAGHIeUFpr4fhmPMRrb62RKIR2G14O18vYEQ5xVaNWGmUsUyD9sUNZ+g/nYOyzGxtv/T/q46Xw+mzb01HVsWuB3NbVXjfeplLCJPXeA6jaRTQaV7mt1eUVYEHPkQegNMS1yfSdDwcGpOM4OA2oTBoecpBMJrn88suJxWKkUinWr1/PueeeGwisv9P5AtJeAd/XNxOJREvp3ubP+hBgNuupOYZh4GcPNetn+UI+SDN67rnniMfjOI4TBDJFRSD68/hBWZVKhV133ZUVK1YEsGPzKWUYBoODg6TT6cDA3LRpE6ZpEpbVFPbihHYSkI2aJa5m/a9/j4UgriVbH/4DPfvvgZZNJ9RszrkWXb65h+K2eoBSe6ajgcIUGks5iMI4E7EK4v1vYddLPkNi572YvOwWShf8E0OxLmIDaS8tOcT43V4dKsyurq5IfaZUKGGaBqpSBQnKcbF2yWLu0kU6FceNWwHm6LVLUWgXytUq5sp+XKmIC5PRe59n8eYyZncMIx4jUy55D+VqDCmxbZuVK1dy2mmncdlllzEwMMC//du/ceihh3LMMceQTqcDaK7ZsJBShuqk/u/9FC3wKjIlk0kymUwA9Q0PD1Or1QKEQUpJJpPBsizS6TQ33ngjhxxyCO985ztxHTdAV8IaafpVrprzFPv6+kgkEpG5l1JKlixZwujoaADVpVIpDMNAKRUgLO1j4/H4jCagwZoVi1jxGNP3P8nwY0+SSsXBdpgeHqFSKZNdMkB9bAJMMYfYPh3usMPbrb0jX2Ai0G4dt1ilnIuTfv9b2fXId6G3uoz/w1qsB58iRo1Cpo+djn0LpUoZHIUrBe01pMKwfd8gjuKjn4/agoqECbbvVBjeMkI6GcctVTxBVA7xFQNYu2Sx0unQcYXpAuOFPGlVx8zEoVAlnZe4fxzGfMNi0mYCO1vBEF69Za00uVyOcrnM8ccfz9q1a7n//vvJZDJceOGFrFq1iv322y+axrYmqz4W3dXVNQMeKpfL3HnnnYGDpVgsUqlUgoRa13VZtWoVixcv5vHHH6dWq3HaaadxzDHHcNxxx7Fs2TLi8TjFYjHAq/3kgv7+fqSULZ0ShoaGiMVibN26dYaK4bou3d3dDAwMBC9LNpslkUiQSCTI5/NBdF97RvvQ0FCkyrJ582biOsHI2rvR0yXIpRAyxuSG9dQScdh7F+xfbMbKJdGqEZQUarS16rqyOTxIexWlhBRemla+RL0rhfWBt7P0bW/G2AKTX7sdedcfSGJSWDRI4p0rWXLSm0i+dXe2bt0cicF36lAxMTERGpHpJ3W0OGg6Ig2iAbMFu6QCy6RqCEzcRurYzLptQmnS3TlK3RncYo14voo7Oo02lnpGi6ta4Cn/TqfTXHjhhZxwwglIKcnn81x88cXcdNNNoTES7aXK/PjtbDZLMplkfHycjRs38sgjj3DHHXfwf//3fzz//PMMDQ0xPT09o3K+r5t/5CMf4dRTT2VgYAAhBP/8z//MDTfcwIEHHsg73vEO/uIv/oLe3l4KhUKgM/uwoS8MvsCHQVG+YFuWRXd3d3CC+Fh9c8Jx2EJG5l427ISEgo33PkzS0RiqITQOVJ5+GrmiD6m1F6/R1kO99Xvb5mgqYmNIA0Mb2NMF6ukEsQ++naVvOwyxqc7419cifvcECZLUDtmH2PsPZud3v5r4Hj3eczfUQA0tOnYnj2rzCddejiKKF3L2UEWCtB4XiZlNIwMDMMK1i0aaJq5h4ACuq7Drda9HeDPLRCvR+Xyegw46iNNPP52pqSm6u7tZu3Yt1113XXA8R3VwdV2XdDrNyMgI3/nOdzjmmGN43etex5FHHsn3v/99yuUyn//85zn++OOZnJwMddH7HsQTTjiBiy66iEqlwuTkJKlUikQiwb333svnP/953v/+93PXXXeRTqc76sOdgr18Y7QZ/Qlzy8/XbjQti+qzW9m87gli8TjC9YTdsDUbH/0DS95yIMpxMUIDNJtd5qKpOI233oaQGFpQm85TxkH+9WGs+IcvsGjVWxm74lY2n/sNxKOjcOybyf780yz/n3PoP/OtxPfoxnVtlOugpUBLzYtdQX5eJrhCY2QSCMOvuBzGGo0wBLVCEXe6hKE11VycxOJF4ChvRilQWqGgEaK4LZtkcnKSD3/4w9xxxx389re/pbe3lzVr1vCmN76J1+z/mtCMdNd1yeVy3HbbbZx//vk8//zzDA4Ocvrpp3P00Uez6667bkMKRka48cYbA104LBBJa82nP/1p3vWud3HDDTfwq1/9imeffRbDMOjv72f9+vWcccYZ3HTTTSxfvnxWY282wd9ugVBaIy3J9GPPUNk8QjrpBfhLBEYyyeTzm1COIjHQjVtvZEc1v9i6dXuyXHC9GsQYCsqlIqTipI59F4uOeRfWowWGV99MZd0zdO2+kuRFH6LryH0xVnSTWpwFXLStEIaJNEwfrUAof/t7EVGRuaI+XikG7VX5aYHrZzJXmJJysYKeLmFqQSUl0H0ZsFXwGRWyazerF+effz49PT3Bop919ln4Hc7avVLpdJoHH3yQM888k/Hxcfbaay9uueUWzjzzTHbddVev/nal6kX4OW5LgFHUCeA4Dvvuuy9f+tKXuPUXt/Ld736Xt73tbRQKBbq6upiamuLHP/4xyWRyu0foLTTDXmlNzLRY/7sHMat2ozyGd0bGU0mG1z1BJZbAXbkMKvVtgWxNHQ+2Rat6Ah1XAnu6SIUaub8+jJ2/dQlD+7+Z8Qv+nY1f/D6xxUMs+9dz6P3fM8md8TbKuyeY0Hnceh2hDbRpeuldjcx6D2158WPqO0b3NXWI96L4gMroJMJ1vWNKRNjRdYWRL6NdjY0msXMOJ1lHayKP3GaorFAosO+++3LaaacxOTlJV1cX999/P1dddVVg5Pnj/R33pptuolQqYRgGp512WhAV6H/OinnRfkKKlojC9g4Ozdi3T1d3Tzfvfve7+fa3v80555wTGJtPPvlk8LL5p0izDtwMOzaHzjZDWL7O2Bwi0KlZaqeQWdM0EcN5Nj34KFgGoJGNopKuhljVob5lC8aKIZRqzh7XQR0So/FnzFU4+TxTok7X0Yey/NqL6Tr4jYx/+VYm/vEW0u8+mJ3+91yy3zsO5507Mx6vMlkqoMsaQxtBPqyvfvoQjG+PNPOjmS+d5LEZ5m2O7gstbjQ1NRWpqPf2dmOaBk5XxjMk0RiOxhAxxsfHkNJo2XQ9X7+gL9fNpvuexcRBo+h7yz4kl/dSypdxbJupqanAcNBaUygUiMfj9Pb2Bovrui6nnHIK99xzDz//+c8ZHBzkuuuu43Wvex2HH3544EQZGBigXq9zzz33BDDY/gfsj23b5PP5QJd2HIdsNhtg1L6xmkqlAmeMH2lYKBRadHCfoclkkk996lPcfffd3HrrrUEKm2VZTE5Okslkgu/3sexarUZfX19k8kGlUtmGoec9DL1arRKLxSKDfiqVSgvMqRs6sBmzcCbL5J9cjxmP4Qgw/f1HemUYNj1wH686aD+euf42EghcNK5QCC2JSQPDdqgUpylkLHqPeguLjjyMWqnMxh/dRbLg0nvCG0m8b1/cbBJEHekqEsokmUh6GDqeG71UKgUbVXsocDs018znKHk0TTOSj67rMjU11Qr3lcvlSOglgFBiJtpxiWEy+dQWnGfzuL0OZafRuQAvq8Z1NX0DPcRUDP3r9cSEYiobY8m7DsaKxXB1kXKxSq1W80LKGwJTrVZbPH3NVvKaNWu45557qNfrxONxPve5z7HHHnuQSqVwHIdcLhfEZfixHl0ZDwstl8sB5mzbdoCH+8xIJBJBmwefKf6Ycrk8I0/Tx6qXL19OqVRi0aJF5HI5bNtmfHyceDwehLIKIajX6ziOQzoCGnUcpyVKz8fUS6VSYLCGXaVSaVvbCrxyBLayyfT1sPW+hxATBUQmCVptS7YVCmlJJjZuwn31AahMGuV6FqQ0BKZ2sUtFJhMGPUe/kaFDD0OTZPLuJzAsyZKPvZ3Uq5dTNzXT9SJ6dIqBvkFS6fC6hH6dxrAOFVEJzI7jzBBQXxYymUxkDcRCoTCjBmJoA9NA72xAPFp5gmBbGvXsGNWfPUYilUJoD/pBSqQ0PeYl0uR//TR63dPY2iH5ngOIHzDgRXkZssm50foWh0E3ruuyYsUKTj/9dIrFIslkkmeffZavfvWrpNPpGVVUDcNgamoqyIIPgwUfe+yxFueGL+TNtNx5550tcdVhMBMQxIu4rtsCOzbTFGYcNqsrzb+fT/eHZtpMIZGGJFax2fT7B3CUO0OP1UphphJseOQxZLoLd0kfWjkYQuMUKhS1gz7iYHa+/DyS7z2M8dFh0DaLz/gLur/4VxivWUzRLlOplhFITCvmhWNrQutZRzWr7dTAtBkaDWtyOxsU2HLPGUgS4ABdSCa/cQux52tYmTiuYwfFdKyEhRous3n1f2A4Ns7iXpZd8Ddex1c/A0e09saeDQ6zbZvjjjuOQw89lImJCXp7e7npppu4/fbbyWQyAXa93377Ua16p8Ett9zSkjHjO1AuuOACbrrpJrq6uoLAppbij9qLlb7ooov4yU9+wtDQUODK90+MYqHIHXfcweLFizn22GODY3Ih0Whhtb0XAvHVpUZaFu6WSZ65636spOd8CfwQ/melwJyqUJ8uYQ714BaK5GUdjjiQld9fw97fX421apDUQJaVp7+PoY+/GbEkRXlqirrjokyJNLy8Q4Kb1u5O28lwfolQEQPpQNWt0nXNSbi7dfP08f9A7jlNpncAK5Mj3dNDz4hkw9/9I8avH6Aci9F39YnE9+oG1/FqbYltVSiaWwTPtjsBnHXWWYFqZFkW11xzTUt9khNPPDGo5fGNb3yDb37zmxQKBarVKsPDw/zt3/4td955J5/61KeYmprCsiyKxWJQytcvRP7MM89Qr9e58sor+eEPf0hvby+5XI6BgQEq5Qonn3Iy999/P2vWrGH58uUtL6m/4/iOlU47TXPstJ++ttBLKE08GWfrI49jbxnBsCRCKg+g9RNwAWkYiOkKI5uepf+w/am/aR9WXf1pXv3N8+h9xwEI4dJ34F70H3ogZtpr44HrYrY54XRYrNTL7DJnD4I0sItVplWFFV/7KN2feCPJ9+zFM++/hscPX0P32/YhMZShUCiw6c512Oufp2uvfVh22fFkj9ob7SpksGjb4jYKhQLlcplKpdIRB/bjQfbZZx+OPfZYrrnmGvr7+7n77ru58sor+dKXvoRt27z5zW/m3HPP5bLLLkMpxVlnncWiRYvIZrNs2LCBPffck3/5l38hm82ydu1aHnroIc455xzWrFnDlVdeyeGHH47WmrGxMYrFIsVikZNPPpkbb7yRvfbai3K5zO23387I8Ajf+973OPHEE7dVzGpCaWzbplAoBOleswXuTE9PUyqVItsBzk2wJXEl2PLQY+hyBdmT8dzlIavpmAabn3mWV114GouPORw7l6CkHXKuAml6nci0n8vqlTlQUiOFfknkd3tVIYgWbC28Gg5Acp8hdvnpWfQdtS9oF7k8xc43foLCj+5ny88fofT4FgQ2atfFLPrsXzH0N2/A6I97mTdNTgAf5unq6uKUU07xogUbRlinh/KNueOPPx7DMEin0wE8lJ/Ok81lUUpxzjnn8NrXvpbvf//7jIyMUKvV6O3t5eyzz+aII44IamZff/31rFu3Dtu26e/v55BDDgnmP+CAA/jpT3/K2rVruffee9myZQt33nknmUyGE044gRNOOIElS5a0OIr8HbtWq7HHHnvwmc98BiklO++8cxAuG7Z4rutyxBFHsGrVKiqVSmCIzvc4VpbAmKry3G8ewEzEIwvtaKWIJWJsfuBRasqlngGnVCCTSQfrJCI90Do0MGm2FzcsUGu+wjufWoYBj+v1eugo11UUC0UQEsM0kJbELhbQAuJWjEQ2S0xaXlpNQYMlIAk1p06pXMR2nG0YZgMKTKe9DPb2Iu+u65LP50ONCh8e8gWpXZ8dHR0NvstHRQzDoFartUSK+ahJc2a7b8z4qoivyjQLom9c+uGk5XK5kXDaarT6kYTttfjaobnm7/WjDZv54PPAhwrD1JnmaEeU50gprfsj//6eU3ArZaSMqsonvBIZ8STH/Oc/Ed9/N6TSuK5DvlppDXRiW9PZqO4P5XI5tC4heF0joso7FwqF0AampmlGIki2bQcNAtq/L5VKzWxgGlXCVwgH2/HgmrqtESXdqGavicVMYobX8wRTQY8RYKm1QplyoYQwpZfTJvwybaqpOahGqW1dA/zY6HYm+Q/bDgP6lw+n+R0PfIHQWgdYqS/Mzc85PT0dBEH58/vfnc1mZzhZTNPEdV1GRkaCSLzml9CyrJbvb96p/JesHcv1jd7mkgrNXSRKpVKo0Pg0+vP5SbtbH3mUypYRUn09KOU0GXRNqW/aRZgGtfFJNjzyKHu/dhVojVvX1KtVjDYkxRfsKBnxs8OjIu6iOlSEnUr+v6Pm8qHR9vzUZl/CnKP7AvgJwNhWUjioIi8bWc5Nb7o0TaRpBAkKItS+0KEVRsNQkvaGTa0Vj2a6w31Hy4wGUW3fGdV2I2pMM8oSVh+w3S5oh7DC6pXMJVBqts4KnhUEj936azBnr8VtSIm2aww/+iR7s61+iF+fcb767kK6P3R63vnM1Yl3LzAP6eVlFbdjyNvTGAkzarcnPLVQaMyQktrWSSYfehIjFvOyvdviRwKhNk0qU1NYiwZZ+Y43BaESr8RLvphCNt9W1TuueQp2I1Fg7NGnqP5xI1Yi1ij5uC38VDbqYFvSoDA1SWzvlbzv5m+y05FvajQ4FS9fzO7Fg/u2H2zTKtzyRZ9vPhb0n2Ln3W7zCXjytjvAthEkUUI1anR4O7cpBKaGqYkxdv3AURzxlYuJDeXQykZIK/gSrWjkuOo/GU+2q2DPpZn7fBcmqmFn1Lj22tZzGbNQGpsNtXYduzlyrJP6Mdcmq5107GaDdbYTL+w7lWo4X8o1Jn77sPdZP/y0EWYsDQPbdSnXCuxzxkkcdsXnECa4jo00jGDH9hOrDUNGNqWN4m1U2G+n+t5+ZGWU02qua91sq8yge3h4WEdhxz09PaGT1Ko1pvPTMyZxlUtXpot0Oh3KoOnp6RkIgU9Ub29vqBWtXMXE5EToDhuLxUK7D/iRdfl8PlR4u7q6ZmDL/uXXIwl7McOiy/zQ2YmJidDF8GkM40e5VKZQLITyI5fNEQ/BpIUQDRprmMkk9T88w38f/XcYjgYp0Xg1QAzDoFYu42Ys3nnNF9jjg+9ly+ZNQRirakRm4moSiSTZXHiBzHK5TKFQCO1FmcvlSCQSocI4OTmJbdsznsuP0otCPiYnJ0P7hyaTyQCxan9JioUixVJroq8ZFt8blafXCoeqUAI67TR+GYQwRCRqvvZ46fafd3Jbt2fHNMN/nVSXsGdr7k4Q9iJF8bGj9S62BVC1zx81lw/b1V2XjGHwx9/eQ6lYJJfuQjXUiJhhUsrnSb9qBe+49hKWvflg6tUqQUsiJbZBsdpF40bO5eP4UQ6aTmvdvis3x09HZZu39yGaKx/b18yczzEyG8wzV7gmqmLmfPXnhcBDc32uhTzbduVjp67PwmtHaFbqDN/zMEL5DYs8N/j02BhLj3o7R133JeJL+9CujTAaBSW9rkVe4ckgOWtbnuNcaZzLmkXVF5wvP+bKxznV7ttxvXwvoTSWaVAYHmX0vseIx+K4jcL7lUqBvT/1IQ694kKMhInr2hiG6VVrEo0EXSHwm4b5TToIBPyVgY7sEOw/w0uhSVoxRv/wNKXhcdKxGNVaHWWaHP7VNez1d8eicFDKmVPUYHPYwysFlTUjA2Zm2frn09FqLlDb7FX69YJoXAis1wmp6ETj9uRHx8tVpBE88usHoVanbNuYi/p51+Xns/sHjvS6amFsK1E3g0Yd/OEJs1efOkqoF0JjpzV7KfhoxmKxUMXfD/KP+pL2ElvNRk/UOCll0Cmg/fscx4ms0h8WP+Bb2LPR2D5Xcz3ATjSGCbLfciNqrjA+ykYJt6grjEbfWI4aF08kcEs2W+5bR82pMHToGzjqS+eR3Gd3qpUqhmlAawWXoNd72JpJaSyIRqVU5Di/kFC7jt2JH67rRtLohwTPlUahI14Hx3EiG5Gm02lyuVzoBMVisSXAqJm4/v7+yEixkZGRUMHxizeGXbZtz6hk3wzpRXUEyOfzMyAs/9n6+vrmRaP/gkXRWKvVGB8fD+VjV1cXUSXmomhUSrF46RIKjz3Hdfu/h9cc+x4O+8dLiKUSOLbD+PgkStsturK/OQwMDETSODY2FjpXLpeLzDWcnJyc0YzWvwYHByODoIaHh0NDWuPxeCQUWC6XmZycDF2zXC43IypwTkFQ8zZu5okqdIKO2oOgtgc60xE66qAevRDEZHvxEbxCkI/87295/bmf4K0XfxJQuI7rJXRIGgVpWjXohdD4YgZBLYQnc8kHfVkZjy91HMlc8xG353zb6/uklDi2w0EnvpdEd4Y6GlNta2siGl0aZ5qGLx4vX45xQH8+bW53XNuESWkS3V45ZKnZlpG+I87spd+xX8q3+pUeSagFaNeLoX4xoec/Zz6anR4qzLU8V+il3cU8W1X6qHJVUUE27VBgez2/2eaL+n0nF31Yw8y5HMVR4+YCX83go19uzmhL/mr0uldKo1oayqg5Q6NhazaXce3PNlvyRBQ/5lLirL0OS9QYUS6XdRTBYfCKjwJEAf9RLZmj4DefwHq9HsrE9rSudsb76VPtwTHNZcvaExD89tFhzG+uChWGHoRhrUKIllZ2s/HRX5BOfIxqUupDW1E0RiUDb08+Nq91FI0vBh/DgtN8xGdG/NGmTZt0mBB2qi7vw0NhMFt3d3ckPDQxMRHUtmt/oKGhocggqK1bt4aC/Z1orFQqjI+Ph8JDPT09kdF94+PjVKvVyOagUV3Ctm7dGkp7MpmMrMHnN3ONgkajSpyNjY2FRklKKYMGpmEY8fDwcCjtmUwmNErSh2+npqZC+dgJvh0dHV1QibP2DhX+XJlMJhJiLhQKMyBmM0qY5tIwcqFwTfPYucYzLyT9P2yuuQbTzBfCam622iw0c6VxPshNFI0BMhJB+1xKhc2Hjwuhsbn7Qyca2/k4Vxr/5HDfi52d0RzW+lJkgjS36HjFGq0vER+3x5q9ouG+lzLX8uWK5+6A+7aD0LyYC7tQz912m0/PfhRur7leSj6+2C/jQtTV7TFXaHTfbDBPVKbDXHShdt1sNtd9c+WmMHRmNnio/YHnCjtGIQudIKyF8DGMnrnS2F6/pNML1mmu2Y79TtlS8+XjbPBtmP491wamLd9VLBZ11LEaiRF2qPvc6VjuJMCdiO+kc0Vh7WGJt+1Mj2oqGjpXwymi0ZHj5qN3a60jK83OxsdOp0OnNQtLom1e6zA++jRuNz7SOXy1Ex9no7HleaOi+3x4qP2L/LZzUYm+hUKBfD4f+oYPDAzMCx7yifaLVoZhtiMjIzOY6Ef3RcFD+Xw+MtF3cHAwNAQVYHh4eAZG7+OoUdF99Xp9RgSif+Jls9nICMSpqSlKpVLoQnZqYLoQGpuj+9r52Am+nZycDK2nB17z1iiMfuvWraEv2HzhW5+Pvb29M+BbczbrdCG65AuBAqNKG3SCsMJ2h+0Ns/k0hOG584VGO52Gs/GxYwPTiMi5udI4XzQiKgm7E43+rjtfPoatWZSa+opHRXZc//9eOwR7x/WKvP4f0DQHUW/tM9oAAAAASUVORK5CYII="  alt="bKash"  style={{height:32,maxWidth:100,objectFit:"contain"}}/>},
                        {name:"Nagad",  color:"#E8222E", logo:<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAZoklEQVR42u2beZDd1XXnv+fc+3tb7y11a0O9SeqWBBa2JbaA3eDxjBeqmAm2WOwijrHHKTsY8FDGTqAsyRhDgMQxhsQeT8CVyiQ2zNgOsQnYYNEDZrWwQbilllq9aEFS79tbf/eeM3+891otoaVlkSon9ftUvZLe0+/dd++596z3CIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiDgt6EwHUAWBAAL036MAdI4Mfh/WYM9oMZvARJDjL3Ijo3OIHu3q0o2YfYYIb33+FAIz6OykZ7rObKGXdgLo6lIC/Oy4xU3wc36LgY1EeNS/3b8/nzmd2cl6pLigHdcvqNJvrowrQMXXRvP7rhFFwRfpb25OTK1c2aAdHVXHPEP/bkyWPgJDV8FPbWp5b7KSHipk9P6KTQP3qxY15sCSJanKRM37vOJSIV0j0LoqMjSj8rOG/p5NCvCpNEWL2qRDre1fSBKfk1NxUOLfaX0ESRGZGdHfLBro+RYAjLZ0fMAyfdopNii0hqDZgHi7iDxUO7DrkbLGDDe335hkXpeDOlEwv9WszcpQAPB8zR6pJIhtXvQ3Cwd6vlVeL522rX0ETFfBT29u+Xw8oG8EAZlcTg4kvF277+9yYSpW8d9jSjcGTCssCB6KEEAlM0ZC98uGgZ5L5rEhVHRPoJGWjsMLA9vgVXE6uyF6RDICIMaMYVcYaKivah8bn/52JZnrASCjxadSRIgRoaCKrOpj457/pHWw+9BQS/uBBhssLajCoDjxOTKB6NGTZjrxqQD0qDkZYgyH4f7GgZ7lp+VDFDAEeFUQEfzMlqbbK1J8RzYnUshKoaLCLssEhU8kpyoKC5YE35wohMiKCqkKiIgAbwADUq8AYSNIHy2eiFNqCOkbM86vz0EccGoNKc1RAI0DiGlxMKlSLpDSC0OjM/c02uD6Ee+cqCLBbAsqbkqwQ4kCA6yut/YKhVs93NJxBQh7M+IbMyICkCohi2Igo1AwoKmyc1SQA5BDcQ6qCiYoKygL0owCMVKqKGmIS8FYIrwxd712vpsx9q41zfuoZmjyawevrYibOzI5cSowIAoKOe9NyF8OLnLXT+6gSVhUkoKJyM4RlAFQQYDi0ZJj3QQGwNgMT3TU5syqribtFblpXy1shVROqdEcC4zzGjIKt9Sw/eKkd84QxTIelyrTaADtHvPOK0BJZvaKHhW5tmHwXa+j+eVgAomLxp27q87aC4Y1fAJALA8yKWNsWvzzKvYjBWdszHrnbX6Z9faXIMSqmWna+/8Tp9jNEyEFSGZhgLym0+kgqFmdMHRhKNI3hdyLxldwknwCpLowH5+aG+HZU5goIsCPLV/zWXdIz627c+iBOPOD+bx4ERgmkKh6AptYhV0qH8s3TtwcfHXxQvOXI845oLghJScJCNmJu5rqauLxOkzOHKItBzMABFuO+KVj57Gou3sGwMzp+rmh1o6JsjoxEXKmsMcgdl4VGTMhzgGgOBkaF/elxYO9vwZ6gUF4AFsPr137/vGc+/5CtpePikeo6pNEBkB+0WD3oTkBASxbPWKQKF3V/8bhTdjEW7BF+puba+sSNVtAeh2BFrHh3EJNPD6m4Rcb9u7um3fYO7sZBBlt7Pir6mX6hfGl2TUM/avA2MRMQT0TSAFXmbI2dNKT8YUvh/fH0hV1uGLG+7A0jjIVTas1gGaRtzn6QzH+OwUTezP/tZY3iPQnuULhUbrq4Mip8oRZk9zZydTV5d7yXGenwcwMYds2N6xHa3+MKO4FpLN2smhzAlD73rPOSlZx5RobaPVB8q8u6u6eOrBkyVWaqH4uRfyujHiPYphMCtA2rLfrsc29aUzsaL1WW7QoW/yhlvb/miR+sMrwskkRZFWFgEQVmytrgUsPt6x6X+PA7u3lQz+r4ccTwDPoNESQ4cbV36lfa7+Q+VDm4Yr3oC4V2A+ls+KZYEBwFUljnfXfHnoKV7i/SL0PY/bJams+WmFMUMc2iCuRODg4ZEKnXgVVyFPIgCXipljAHw5i5m8SscT2zFebb9GNMKpHh5ylyGP2BUCpq8sdalrVNt22+tqxlvbr0m0dG6j0OSYnufzcETkpvMYSzriXpsW7GLGFqp8R8R56ZyKo+K03uo2Vty7x9lcHW1ZdsOzgwYxn92kPzaKoHbPzmUalEqBKpEc+JwiRI8CPtnZsrmbzYxCWDTsXhqpKJVmPep+vNqaeiL5dCmz0VBrCl6HLHT6r/Y76SvqMvC+rQSX/wI3jM6iGomjrXSphbD7mbj98S+LJ+uX0i8o6u2wsW8DIlHtWHZ7nBHrMIh23C8SZBCl7H7Nv2qxYqoSoOlXvckogVcu8OFll70uf03x+BQ1eg00gbHmrw3+k5M+GWtq/kmD+cowoGTMGOVVMtq7+VZ78Zurd/VMFePiYcFTFpZb29e4+3Nx+U8Lwg1XWxkJVBCDjoa3TIsipoIJ5VVzMD6dWrnxndW/vq4db2vclmNtFT+VrFQw1Qy3t99Ubc8uI9yKqEiMOBFqWvMYIwZSXKVK6CwA2n8xklR34yKpV70/mzO3Zi/NCMT8j+80BqvYfcnklqGoqZYMc+7uHb0k+19RmXpkJPUZGCt8IztKfVfxhWGmq9d3e4SpxaIGgVoEYoBInn0ZIQTYEEWCLIiM4L2Esj4CArQSodh9Xcw0B/lDrqtsaTLBlxDvNi+aLclJOsdlQTfYnwy3td9LArtuHwDTX1lljnQJEg7v+Zl9r+3O1jq8qQDpibCaycD8m4sOs+MeMSGuNMUtHHX9WgTtGiOypEgsD0KSIKvDxFHMw4r0IVGuMsVMiEwSNMSjlob6SrR3z/muLBnoe24pOexmONr12rqnaDKh2NidGevlBbfKaXK2cnaE3pNJVVwRmUdaJq0yYIKvuyem7Yz9Y1mp+nZnWf82e5e+uvblwsebp72IJuxRMsKQAz1mKU6jThXlSOJn1LRCFr0yaYCbjf1q1efDbuglMW4527qW8xY+2rT7HKL467p1TgKoMx4NSrjMtAhUtLLTBbSMtHYcBHTs2J6BibmNGHI3ct2/n5i3AUcI43Nr+TC2bVRlRBei9BOiwQuaTPmsxeAgyqqJQrWNrZtT/HMR/qiJbLVMKCjPp3XTSyvcU4M3okpM49U6zBV3uhv3JP6o13J4+O5vngOIq0mstNZqAYD2hIDLjR/lWG+cnZvLyHf4f2V/UET0sU7TcC7alc+4xiO4nommoGmGAlJYT6btBdEEqaRIuL5Rz4gnEgQXlCjJl1HxOFfQWHS7OjYEu8dDP1bDhMe98itnOeP9zQLcrqNmA/nOVMdXj3oVC+g0ovTolgrL9L6hSuXY1bPW+m1o7aj5u/JXtvb15Xb8+GBmZvjwG+siMiE8yG9DpVzGKjku1ho2ZUf/Ua32LP3wpunSkpcN6VSSZKS3+1ere3mEFeMtxkuM5G9LldSPM0ItyQ6EWGpwlgLeAxZCCqgEgEWebjodfz9xXcbWt0efMn009ZodiV8HS56empp5tuHd0eu7gU3eubIjBbbaMXar0hAKT+Yz7AzDdXFlpm9IzLozHTDCdllurt/Tt1bNhjtWO2bkBNCK4OM2ilcYEafEPNwzsun5WGOvWVUxM5/+2kvm6CRGfYDovp1oqRAOxOdo2DHpnFZs1zuPVoZb2AyNjM8vihtcKAC8SxkAMRXdJrfg0NkQSxJwRfTOTp2suQ5c7uGhdhaVcDqCyjX6tHCmi6wQaUi5lDL/e8a640jtyC50m4jAQgME5AQSGkMu5ocJziV9SUj9Vf93UH2fGbG3itv7HZye0dm0MlyQVSyoV9QcMEjUTmcMjNl4X+2uZcHCqe9jQ9woeV1DOX11RE/xZesI9U7154DsnykPKGayuXBlXp7UAUVZEQy/3aWenHRgYsEnmmpGp/HVvDPRcv66lo1BnzKfGvHM8JzEtzDFbQ4pRp+ot0doU89qwWC5RAMpElIeSh/xDKaHV+euKapIMj/vwtrPe3D2qgMHh1zPDrR3ZokdTkFIfTlKhKE64vFte/1MFDGbqxYPLX5MEEUYQt+pD/Mg/zcY08T2lpC4zsrJ9Uwrm5jT7i6i7e2fpXEG1mH3rZ9bfkMHo+wNDLQRaEST5DsrJn4ZOb8p6f53U668UIPz2FEW53t4QrR0ZKiV6ZKiylIs4XbvWZvN677rWjo9PSe4ykuQlKeb2nGo5f0DsSIiqBNxrif5ZRTAlmi8VBpiI7AJjedi5B5cM7H5JOzvtyOBBf4oabDkxlDixmRA32BjoP5UqylI8ADrDRPAAlDEMACcq5xfVsaurOFmh9UIAV5QunorHY0mgsg8FIcrgCZeOv1zfvaO7XMIWh3jey2Na4PcUVpz9vbG2jneUA3PdBEv/c1soin8KYsQFJ2F6xjkVLE5W8w/k13RR5s8TnXgETFuOX2wsO2ICBIodAZGSQuPgh4ZbOq4Ybm0/bzTrv1sQCeutfWfKxK8NVW9KMZOq6lul12kbBnoeG3H+U3HQcK3heJ2xsVpjbJwoO+rdPQ0DPTcqwLNyOWHBVgkKVlWnqj5FDFL6EfX25tHZyeW6ohIyDIIo4EXTAHApGvXEG1JyLgo0O1WAi5k6HABFR97Eh7JT/gAC/8pifT2zbQMsABpra6vxxM+Him1EsiFg+oSIfkkBxtq19kimLVulGHQaAtlCqJoueFchwee4CrfS1Se/oHkGnaUjqt8PQJRXcQHR2Snmfw6IX04xX5NXJS/iSOnCxoGen406PxxjtvoW89AlCvCSwZ6HpqlwTkb12ozKF7LQT4jz5yzs7/lSSYsEpyiluyBwRPD1xlpDFCsUD8BWAOULrWIgoRgyVMxVDNFJrx141kYXv1wtANSBCKC8ExBhjdFcTID7Ux9cNEQE3bANIQHeS7DYkp7FkCUK7hkKC9sFtJMAoe7uAn0VjgBVoQPZUJWLv6dEIAI4m/MeIN51w8r4CcokAIDL0OUU4IbmJT8cE/9Sg7WxrGouLT4sqPq09wUCeUNsoXi1mKnri8liJiLH0TpRwCzp6xuq7dv5/Zq+nX9ds2fn39fu3d1Xvkk86U1fcVOpqafnkCdcOCVyL4MOhFAS638LQC9Fl6CzdJCI9pRNrQgWKEBY38enrmWRkiqgGQIRyAl8RYorMlm+sKLWfnPos9kFE22r/zjvPbGhl0lkBsrDnniEIDUW/ICwmLHW1TcYUhMa+dnC3bt3wJdiFZp72wFohgygZtVUOC+3SV1dLr1y5UenPf14oTHr86rwqmBmkyTGsA+3+mzifxVVn3Zz0eApiI5nCn25THRpZ1l5uqT8+TxuvopRbl/PdgC3jjc3f91z7B2Nvb395U3f2lWyQESveQUsAUToIEBp27bwuBtS1g4CdBiYMQyEY1R0R6WSuCp/jG7q/b+6bt30OPI/ZaI2ACAmm8tql02iIwW+Og+tJjX35in/epVPcGbFxDR2AxRgcTJGlA1VyjUd9QBNMMBIo2WwcKrry9KpJurt3d/f3HyJIvlpAi530EarOpGHPD5h5IFVh18vFTY1Nz+hdjmcwX25AvwMOrlusGsCwLPHalKxjuBezjgOE8wBQ68ca2u7exxAW9/yNJ0gU2cAnoT2WUvrZYhVsgACmFxO1Ab04eymFStpy+u9ALYD2D7W1n6JF1yTSPl7WO1dBcUeL9jTOLjjqdnR980W3t7DloBQBQqGAXSa1I4xYOUAbYHM51p39vAMDuYAPFB6HS2g9esDbNsmoNNrpjihwOnkfqQ456IJK10Y+mMOEVNv756hlvZXDOhCImp3al9bShwfaTt0C/rwj4qNptxYwaWwt2hsSX9jLFQnSeVNBgcgJ5B4QAlP/g4A0M8X7b1znBGiLi/2Tg/94eGY3kiM9vHW1fcPtbZ/erxt9ZXDyzqWggEC/siHWvw9BSgA/F5WkyWlQF6bDb3nd0muCtBWdNpypKcAl94TKiuLwXrxCsbjDFt7SGEU6uczr+N3j2ws+RG+K07EAnWqWJ5gs5iAS4prH6Ljh72qv8iJEAgcdhuoAEwwmZz4VIKvmdrU9FH6Vm9eH4FhxkKGXkLQRgiPrenpmVZPX7PQZy3RSxpoIrPPJtP3NH0+lTIrcqF6AhgMaAiEOwyHrKSEp4tzaJy34AjQy9DlyhpFgJTez47BohnLbAjFsPR37NdSBWVq2ZhitEan3a5DeNQrwI39O38y6t1dVWxsjTEsqlDRF45de7m+AwEIa9cGwxnfnTTUls2rJj4Ysl0l8BloEIMSkMkV5AM1W/Y+P/wHHVU2yJlwb+JzMPyvDR/f8dqxuUR6U/N/C+L8qPdKXsEkIEoBhddY8EyMCnE56NOJ9iWHX0+X/djb1PhG421tVSr2Vkv0xUpjgknx6+r7erbPxzTOjfgONXc0x1m/UmuCT4648FeNA7vOm+8Yx6s4HGpefVGN5fVT3u9eNNDz5LHr5tlUE52GursLBP1uipiUIYXnLWQaMDFQWAABVJmM8RP5O5qvbXi+Z7qua3CCQjQgo+m5m6EAp7/WcqON0SNe1HgpbUYckBFC4SUrVXEmAh5ecvj19FZ02rera7BkOqS+r29ywcCu2zKQS9IiD+XYH5qbWc9zHF0y2DNQ37/r+nEpXA7lvzzeHcZpmFpePLjzheSe7gcWDfQ8ebxuSTr2REw0n1vjObcjxtSYyynMcuHE5SGIAV+ABgFR3BJy3j8mB83j4XZm2xL+qKKl4GZMcollfzEpfTIe5/OzeYEIlBSEGIAckH0sJnaM4axOhghXL+7rG94M0Ba8PU74mPXwmXYFzukteFvm9whgNnZ20ok6FunoHy96+0PNHR9baM3/HlcXap4C0yRI/JcQlAQkV7w1rEgUe8YyKsMoAAoKCKhNJRgQRTqvHsXGOaIEIJOE/BMB/GEKF6ZMMBKGn2kc2P3duRHGGTb80VFV8GPaQ4FH5SRaSEeyo7IFn63mEQDZ2tlpd83M0J+cIH/4N+tc1CPXpA81GPvJIXUh5SngBYr4e0OY5cWYQ0N4KCjGxGW9c6JQwBVzNTAFxV9wexiFZy38NMKGlA2GnX9kUX/P1fPcDD7lFcTpfectPXUnatQ7wXs6jtx0zub9Lt2gcrINIQCM9et5dGz6X+qN/cCIuBCOLAFk2j2Cczy4QUFWoQott0tRMRMlkEILBH+I4LZbuD5WsLoFcRtMOP//0mH6g8v378/jSOPCGdHe3r7QFwoXi4gPwvDFXQeP38FyItauXRvLzsy8l5krPLBzYGCgp3V563vYaJ0y9/f19W1vampaYsUu6Nvf98bJui3/TXp7y/5koLk5XmOS/1DL/JEx8RBVhwIZsiBuFPBSAdcrKKUgA6gDNE2QUYa8yfAjBPXwHAcvMIYmvf9pIWGuWdTdPbPpBDdmx7Ji+Yqz2UqFJ8oiRJzICQE5EFWLM6N9B/r2tDW13M6MFz1RFt43MjBARKKqzMYYFQm9cKVlGQmJJFBNqmohJKoeHBx8pa25eSOIakh1F4SqlLWCgFYAL0DpLFXeQSRrAKoBdJIZuwqqeeONY+MDMaavr69vcuXy5SuUYjXQQp6ZA8ccAMgDSLD3TtRUGPKjIpaN8VbUsooW5m6yPVny1VrMiD861trx5wHoK0k28cmEh4o6f5DJHeDivUv5wlOgKgApBAZKAWxNjE3eSzjp/N11/T2big2L89sMAMzEWRV3AYAsGRJRqmBgMRFtIOv/HsAeAo0pNEFeLwC4lkj7BPxJInncqy4i5YBZlguQZAEL088BbLBKKwC8AoDB/FuILACQICULxRtKcjERYgStUVIH6JsA4iL8DgPpU9aUgs8tFAp/u2LFiuXi3PkEd0iJkwKcT0IvQ10ezGcpc4JV3i3C3cpuREB9IFcDg8UA3iiZWeFTZcQKUH1/z9ezkPOz6n9gBYV6Y21Vgk08ScRxEGyxB4YDUDxBVJliUx831ipc1suP8kwX1fX3fKVkaOcbUTEAEeQXe+btpLoAQlUE5FQphOpTqjoNQJTkgArWgHQEpK944YWAvKBEHaQ6CQB7Bgc3geg5gLeq11YBxgnyCwBehffB+yYh6lfWOgUWC0hB1KdKAeBBRP3i6AADdWAdIqCNoUtVPe3fv38Szq00qi+pUDspLQMwBfgmEDVA0AQgR8DDxJoCUVyB1VBqUmU711rZeVQ0i46+f9frAK6Zal61Zga4UkDvV9U1ICyMERkQEKqKUx1V0p0F0NNK+GFdsRo6GyycZs8AhUC/FekUmAEmSTvVnUSIs+qGvr17ny4VP6f79/b/xYrly89W5vPV6C4WWgzCTqiOEBCsaGm5Ys/AwL+saGq6KOPCrckguEyBlmKrqU+T4jci0kFCB5Vkl2EaV6BGSSdU7BTUrzIBJXyBn1LWxcZyfs/AwNMrmlac29zcHBjVgRB4twG9mZPwKWtto/W0DuT3eOUDUFklqhV9e/fetbK5+UIFkhCzj4xrP5386Kiqph4TvYy1tdVMtq5uH27r2DDc2n7eZEtHx3jzubWn+t7vQmdnpz2Z3zvO50fda7S1tTUecwFwXNavXx+cRrTHR88RJ51ja2vrIrwNsnjrxnR22k0nGVgB0s4jxb+3MfCgE4SeNEdAdJLnTjTesX8vj8PHCJCOeeEkfx5vPjjVv9EZbg4BoEdL42ws997+fv4H0LclLP0PMIeIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiP9Y/H9f93LuKZjLAAAAAABJRU5ErkJggg=="  alt="Nagad"  style={{height:32,maxWidth:100,objectFit:"contain"}}/>},
                        {name:"Rocket", color:"#8B1A8B", logo:<img src="data:image/png;base64,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" alt="Rocket" style={{height:36,maxWidth:100,objectFit:"contain"}}/>},
                      ].map(({name,color,logo})=>(
                        <button key={name} onClick={()=>setSelectedGateway(name)}
                          style={{ flex:1,padding:"10px 6px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",
                            border:`2px solid ${selectedGateway===name?color:"rgba(0,0,0,0.08)"}`,
                            background:selectedGateway===name?color+"12":"#FFF",
                            display:"flex",flexDirection:"column",alignItems:"center",gap:4,
                            boxShadow:selectedGateway===name?`0 4px 14px ${color}44`:"0 1px 4px rgba(0,0,0,0.06)",
                            transform:selectedGateway===name?"scale(1.04)":"scale(1)",transition:"all 0.2s" }}>
                          {logo}
                          <span style={{ fontSize:11,fontWeight:700,color:selectedGateway===name?color:"#666" }}>{name}</span>
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize:12,fontWeight:800,color:DARK,marginBottom:8 }}>Step 2 — Send ৳{finalTotal().toLocaleString()} to:</div>
                    <div style={{ background:"#FFF",borderRadius:10,padding:"12px 16px",marginBottom:14,border:"1px solid rgba(173,20,87,0.1)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                      <div>
                        <div style={{ fontSize:10,color:MED,fontWeight:600 }}>{selectedGateway} — Send Money (Personal)</div>
                        <div style={{ fontSize:22,fontWeight:900,color:DARK,letterSpacing:2 }}>01920-895985</div>
                      </div>
                      <div style={{ width:40,height:40,borderRadius:10,background:selectedGateway==="bKash"?"#E2136E":selectedGateway==="Nagad"?"#E8222E":"#8B1A8B",display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <span style={{ color:"#FFF",fontSize:16,fontWeight:900 }}>{selectedGateway[0]}</span>
                      </div>
                    </div>
                    <div style={{ fontSize:12,fontWeight:800,color:DARK,marginBottom:8 }}>Step 3 — Enter Transaction ID:</div>
                    <input style={{ width:"100%",padding:"10px 14px",border:`2px solid ${transactionId.length>5?"#2E7D32":"rgba(173,20,87,0.25)"}`,borderRadius:10,fontSize:14,fontFamily:"monospace",background:"#FFF",boxSizing:"border-box",letterSpacing:1,color:DARK,fontWeight:700 }}
                      type="text" placeholder="e.g. 8FB3A2D1K9"
                      value={transactionId}
                      onChange={e=>setTransactionId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,""))} />
                    {transactionId.length>5&&<div style={{ fontSize:11,color:SUCCESS,fontWeight:600,marginTop:4 }}>✓ Transaction ID entered</div>}
                    <div style={{ fontSize:10,color:LIGHT,marginTop:8,padding:"6px 10px",background:"rgba(173,20,87,0.04)",borderRadius:6 }}>📌 Find TX ID in {selectedGateway} app → Transaction History. We verify within 1 hour.</div>
                  </div>
                )}
              </div>
              {/* Order summary */}
              <div
                style={{
                  background: "rgba(255,240,252,0.6)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 18,
                  fontSize: 13,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ color: MED }}>{cartCount} items</span>
                  <span style={{ fontWeight: 600 }}>
                    ৳{cartTotal.toLocaleString()}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ color: MED }}>Delivery charge</span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: deliveryCharge() === 0 ? LIGHT : DARK,
                    }}
                  >
                    {customer.city
                      ? `৳${deliveryCharge()}`
                      : "Enter city first"}
                  </span>
                </div>
                {promoApplied && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ color: SUCCESS }}>
                      Discount ({promoApplied.label})
                    </span>
                    <span style={{ fontWeight: 700, color: SUCCESS }}>
                      −৳{promoApplied.discount}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 8,
                    borderTop: "1px solid rgba(173,20,87,0.15)",
                    marginTop: 4,
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: 14 }}>Total</span>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 16,
                      background: GRAD,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    ৳{finalTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={payLoading}
                style={{
                  ...btn,
                  width: "100%",
                  padding: "13px",
                  fontSize: 15,
                  opacity: payLoading ? 0.7 : 1,
                }}
              >
                {payLoading
                  ? t.redirecting
                  : payMethod === "cod"
                    ? `✓ Place Order (COD) — ৳${finalTotal().toLocaleString()}`
                    : `💳 Pay ৳${finalTotal().toLocaleString()} Online`}
              </button>
              <div
                style={{
                  fontSize: 11,
                  color: LIGHT,
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                {t.securePayment}
              </div>
            </div>
          </div>
        </>
      )}

      
      {/* ══ CUSTOMER PROFILE MODAL ══ */}
      {showProfile&&(
        <>
          <div onClick={()=>setShowProfile(false)} style={{ position:"fixed",inset:0,background:"rgba(45,10,63,0.6)",zIndex:200,backdropFilter:"blur(4px)" }}/>
          <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"min(500px,95vw)",maxHeight:"90vh",overflowY:"auto",background:"rgba(255,255,255,0.97)",borderRadius:24,zIndex:201,boxShadow:"0 24px 80px rgba(173,20,87,0.3)" }}>
            <div style={{ background:GRAD,padding:"20px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"24px 24px 0 0",position:"sticky",top:0,zIndex:2 }}>
              <div><div style={{ color:"#FFF",fontSize:17,fontWeight:800 }}>👤 My Account</div><div style={{ color:"rgba(255,255,255,0.8)",fontSize:11,marginTop:2 }}>{user?.email}</div></div>
              <button onClick={()=>setShowProfile(false)} style={{ background:"rgba(255,255,255,0.2)",border:"none",color:"#FFF",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
            </div>
            <div style={{ padding:24 }}>
              <div style={{ fontSize:14,fontWeight:800,color:DARK,marginBottom:14 }}>📋 Personal Details</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16 }}>
                <div>
                  <label style={{ fontSize:11,color:MED,fontWeight:700,display:"block",marginBottom:3 }}>Full Name</label>
                  <input style={inp} type="text" placeholder="Your name" value={profileData.name||""} onChange={e=>setProfileData(p=>({...p,name:e.target.value}))}/>
                </div>
                <div>
                  <label style={{ fontSize:11,color:MED,fontWeight:700,display:"block",marginBottom:3 }}>Phone</label>
                  <input style={{ ...inp,borderColor:profileData.phone&&!validatePhone(profileData.phone)?DANGER:profileData.phone&&validatePhone(profileData.phone)?SUCCESS:"rgba(173,20,87,0.25)" }}
                    type="tel" placeholder="01XXXXXXXXX" value={profileData.phone||""}
                    onChange={e=>setProfileData(p=>({...p,phone:formatPhone(e.target.value)}))} maxLength={14}/>
                  {profileData.phone&&!validatePhone(profileData.phone)&&<div style={{ fontSize:10,color:DANGER,marginTop:2,fontWeight:600 }}>⚠ Invalid BD number</div>}
                  {profileData.phone&&validatePhone(profileData.phone)&&<div style={{ fontSize:10,color:SUCCESS,marginTop:2,fontWeight:600 }}>✓ Valid</div>}
                </div>
                <div style={{ gridColumn:"span 2" }}>
                  <label style={{ fontSize:11,color:MED,fontWeight:700,display:"block",marginBottom:3 }}>Email</label>
                  <input style={inp} type="email" placeholder="your@email.com" value={profileData.email||""} onChange={e=>setProfileData(p=>({...p,email:e.target.value}))}/>
                </div>
              </div>
              <div style={{ fontSize:14,fontWeight:800,color:DARK,marginBottom:12 }}>📍 Saved Address</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16 }}>
                <div><label style={{ fontSize:11,color:MED,fontWeight:700,display:"block",marginBottom:3 }}>District</label>
                  <select style={inp} value={profileData.district||""} onChange={e=>setProfileData(p=>({...p,district:e.target.value,area:"",thana:"",postOffice:""}))}>
                    <option value="">-- Select --</option>{BD_DISTRICTS.map(d=><option key={d} value={d}>{d}</option>)}
                  </select></div>
                <div><label style={{ fontSize:11,color:MED,fontWeight:700,display:"block",marginBottom:3 }}>Area</label>
                  <select style={inp} value={profileData.area||""} onChange={e=>setProfileData(p=>({...p,area:e.target.value,thana:"",postOffice:""}))}>
                    <option value="">-- Select --</option>{getAreas(profileData.district).map(a=><option key={a} value={a}>{a}</option>)}
                  </select></div>
                <div><label style={{ fontSize:11,color:MED,fontWeight:700,display:"block",marginBottom:3 }}>Thana</label>
                  <select style={inp} value={profileData.thana||""} onChange={e=>setProfileData(p=>({...p,thana:e.target.value,postOffice:""}))}>
                    <option value="">-- Select --</option>{getThanas(profileData.district,profileData.area).map(t2=><option key={t2} value={t2}>{t2}</option>)}
                  </select></div>
                <div><label style={{ fontSize:11,color:MED,fontWeight:700,display:"block",marginBottom:3 }}>Post Office</label>
                  <select style={inp} value={profileData.postOffice||""} onChange={e=>setProfileData(p=>({...p,postOffice:e.target.value}))}>
                    <option value="">-- Select --</option>{getPostOffices(profileData.district,profileData.area,profileData.thana).map(po=><option key={po} value={po}>{po}</option>)}
                  </select></div>
                <div style={{ gridColumn:"span 2" }}><label style={{ fontSize:11,color:MED,fontWeight:700,display:"block",marginBottom:3 }}>House No, Road No</label>
                  <input style={inp} type="text" placeholder="House 12, Road 5, Block C" value={profileData.houseRoad||""} onChange={e=>setProfileData(p=>({...p,houseRoad:e.target.value}))}/></div>
              </div>
              <button onClick={async()=>{
                if(!user?.uid){notify("⚠ Please login first");return;}
                if(profileData.phone&&!validatePhone(profileData.phone)){notify("⚠ Please enter a valid phone number");return;}
                try{
                  await setDoc(doc(db,"customers",user.uid),{...profileData,updatedAt:serverTimestamp()},{merge:true});
                  setCustomer(c=>({...c,...profileData,city:profileData.district||c.city}));
                  notify("✓ Profile saved!");setShowProfile(false);
                }catch(e){notify("⚠ "+e.message);}
              }} style={{ ...btn,width:"100%",padding:"13px",fontSize:15,marginBottom:20 }}>💾 Save Profile</button>
              <div style={{ borderTop:"1px solid rgba(173,20,87,0.12)",paddingTop:18 }}>
                <div style={{ fontSize:14,fontWeight:800,color:DARK,marginBottom:12 }}>📦 My Orders</div>
                {orders.filter(o=>o.customer?.phone===profileData.phone||o.customer?.email===profileData.email).length===0
                  ?<div style={{ fontSize:13,color:LIGHT,textAlign:"center",padding:"16px 0" }}>No orders yet</div>
                  :orders.filter(o=>o.customer?.phone===profileData.phone||o.customer?.email===profileData.email).slice(0,5).map(o=>(
                    <div key={o.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"rgba(255,255,255,0.7)",borderRadius:10,marginBottom:8,border:"1px solid rgba(173,20,87,0.08)" }}>
                      <div><div style={{ fontSize:12,fontWeight:700,color:DARK }}>{(o.items||[]).slice(0,2).map(i=>i.name).join(", ")}</div><div style={{ fontSize:10,color:MED }}>{o.createdAt?.seconds?new Date(o.createdAt.seconds*1000).toLocaleDateString():""}</div></div>
                      <div style={{ textAlign:"right" }}><div style={{ fontSize:13,fontWeight:800,color:PRIMARY }}>৳{(o.total||0).toLocaleString()}</div><span style={{ fontSize:10,padding:"2px 8px",borderRadius:8,fontWeight:700,background:"rgba(232,245,233,0.9)",color:SUCCESS }}>{(o.status||"").replace(/_/g," ")}</span></div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}

{/* FOOTER */}
      <footer
        style={{
          marginTop: 48,
          background: "rgba(255,255,255,0.6)",
          backdropFilter: BLUR,
          borderTop: "1px solid rgba(173,20,87,0.15)",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <img
            src="/logo.jpg"
            alt="logo"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "2px solid rgba(173,20,87,0.3)",
              objectFit: "cover",
            }}
          />
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                background: GRAD,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              কাঁকনবালা
            </div>
            <div style={{ fontSize: 10, color: MED }}>Handmade with Love</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          {[
            ["home", "Home"],
            ["shop", "Shop"],
            ["collections", "Collections"],
          ].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                background: "none",
                border: "none",
                color: MED,
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "inherit",
                fontWeight: 500,
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: LIGHT }}>
          © 2026 কাঁকনবালা · All rights reserved · Handcrafted with 🌸
        </div>
      </footer>
    </div>
  );
}
