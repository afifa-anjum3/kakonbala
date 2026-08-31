import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
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
  const [wishlist, setWishlist] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);
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
      const unsub = onAuthStateChanged(auth, (u) => setUser(u));
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
      setSelSize(selectedProduct.sizes?.[0] || "");
      setSelColor(selectedProduct.colors?.[0] || "");
      setSelPiece(selectedProduct.pieceCounts?.[0] || "");
      setZoom(1);
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

  const visible = products.filter((p) => {
    if (catFilter !== "all" && p.category !== catFilter) return false;
    if (
      catFilter === "clothing" &&
      clothingGroup !== "all" &&
      p.clothingGroup !== clothingGroup
    )
      return false;
    if (subFilter !== "all" && p.subcategory !== subFilter) return false;
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
      await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      setShowAuth(false);
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
      notify("✓ Account created! Welcome!");
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
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
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

    // Online payment via SSLCommerz
    setPayLoading(true);
    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        ...orderData,
        status: "pending_payment",
      });
      const res = await fetch("/api/initiate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderRef.id,
          amount: total,
          customerName: customer.name,
          customerEmail: customer.email || "noemail@kakonbala.com",
          customerPhone: customer.phone,
          customerAddress: `${customer.houseRoad}, ${customer.thana}, ${customer.area}, ${customer.district} - ${customer.postOffice}`,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        notify("⚠ " + (data.error || "Payment error"));
        setPayLoading(false);
      }
    } catch (e) {
      notify("⚠ " + e.message);
      setPayLoading(false);
    }
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
              <span
                style={{
                  fontSize: 11,
                  color: MED,
                  maxWidth: 80,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {isAdmin ? "👑" : ""}
                {user.email.split("@")[0]}
              </span>
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
                  background:
                    "linear-gradient(90deg,rgba(255,240,252,0.82) 0%,rgba(255,240,252,0.55) 55%,rgba(255,240,252,0.1) 100%)",
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
                        isolation: "isolate",
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
                          zIndex: 1,
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
                        <div style={{ height: 200, overflow: "hidden" }}>
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

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <>
          <div
            onClick={() => setSelectedProduct(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(45,10,63,0.65)",
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
              width: "min(600px,95vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: 24,
              zIndex: 201,
              boxShadow: "0 24px 80px rgba(173,20,87,0.35)",
            }}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                zIndex: 10,
                background: "rgba(255,255,255,0.8)",
                border: "none",
                width: 34,
                height: 34,
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
            <div
              style={{ height: 300, position: "relative", overflow: "hidden" }}
            >
              <ZoomableCarousel
                images={
                  selectedProduct.imageUrls && selectedProduct.imageUrls.length
                    ? selectedProduct.imageUrls
                    : [selectedProduct.imageUrl]
                }
                emoji={selectedProduct.emoji}
                height={300}
                primaryImage={
                  selColor &&
                  selectedProduct.colorImages &&
                  selectedProduct.colorImages[selColor]
                    ? selectedProduct.colorImages[selColor]
                    : null
                }
              />
            </div>
            <div style={{ padding: "22px 28px 28px" }}>
              <span style={catBadge(selectedProduct.category)}>
                {selectedProduct.subcategory || selectedProduct.category}
              </span>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: DARK,
                  margin: "6px 0 8px",
                }}
              >
                {selectedProduct.name}
              </h2>
              <p
                style={{
                  color: MED,
                  fontSize: 14,
                  lineHeight: 1.7,
                  marginBottom: 16,
                }}
              >
                {selectedProduct.desc || "No description."}
              </p>
              {selectedProduct.packOptions &&
              selectedProduct.packOptions.length > 0 ? (
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: DARK,
                      marginBottom: 8,
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
                          padding: "8px 16px",
                          borderRadius: 12,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          textAlign: "center",
                          border:
                            "1.5px solid " +
                            (selPiece === opt.label
                              ? PRIMARY
                              : "rgba(173,20,87,0.25)"),
                          background:
                            selPiece === opt.label
                              ? "rgba(173,20,87,0.1)"
                              : "rgba(255,255,255,0.6)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: selPiece === opt.label ? PRIMARY : MED,
                          }}
                        >
                          {opt.label}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: PRIMARY,
                          }}
                        >
                          ৳{opt.price.toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                selectedProduct.pieceCounts &&
                selectedProduct.pieceCounts.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: DARK,
                        marginBottom: 6,
                      }}
                    >
                      📦 Pack Size
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {selectedProduct.pieceCounts.map((pc) => (
                        <button
                          key={pc}
                          onClick={() => setSelPiece(pc)}
                          style={{
                            padding: "5px 16px",
                            borderRadius: 20,
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            fontFamily: "inherit",
                            border:
                              "1.5px solid " +
                              (selPiece === pc
                                ? PRIMARY
                                : "rgba(173,20,87,0.25)"),
                            background:
                              selPiece === pc
                                ? "rgba(173,20,87,0.1)"
                                : "rgba(255,255,255,0.6)",
                            color: selPiece === pc ? PRIMARY : MED,
                          }}
                        >
                          {pc}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
              {selectedProduct.sizes?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: DARK,
                      marginBottom: 6,
                    }}
                  >
                    📏 Size
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {selectedProduct.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelSize(sz)}
                        style={{
                          padding: "5px 18px",
                          borderRadius: 20,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                          fontFamily: "inherit",
                          border: `1.5px solid ${selSize === sz ? PRIMARY : "rgba(173,20,87,0.25)"}`,
                          background:
                            selSize === sz
                              ? "rgba(173,20,87,0.1)"
                              : "rgba(255,255,255,0.6)",
                          color: selSize === sz ? PRIMARY : MED,
                        }}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {selectedProduct.colors?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: DARK,
                      marginBottom: 6,
                    }}
                  >
                    🎨 Color{" "}
                    {selColor && (
                      <span style={{ fontWeight: 400, color: MED }}>
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
                            gap: 3,
                          }}
                        >
                          <button
                            onClick={() => setSelColor(cl)}
                            title={cl}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              cursor: "pointer",
                              position: "relative",
                              overflow: "hidden",
                              background:
                                hex ||
                                "linear-gradient(135deg,#AD1457,#6A1B9A)",
                              border:
                                selColor === cl
                                  ? "3px solid " + PRIMARY
                                  : "2px solid rgba(255,255,255,0.8)",
                              boxShadow:
                                selColor === cl
                                  ? "0 0 0 2px " +
                                    PRIMARY +
                                    ",0 2px 8px rgba(0,0,0,0.2)"
                                  : "0 2px 6px rgba(0,0,0,0.15)",
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
                                  opacity: 0.75,
                                  borderRadius: "50%",
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
                              color: selColor === cl ? PRIMARY : MED,
                              fontWeight: selColor === cl ? 700 : 400,
                              textAlign: "center",
                              maxWidth: 40,
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(255,240,252,0.6)",
                  borderRadius: 12,
                  padding: "14px 18px",
                  marginBottom: 20,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: LIGHT, marginBottom: 2 }}>
                    মূল্য / Price
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      background: GRAD,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    ৳
                    {getDisplayPrice(
                      selectedProduct,
                      selPiece,
                    ).toLocaleString()}
                  </div>
                </div>
                <span style={stockTag(selectedProduct.stock)}>
                  {selectedProduct.stock <= 5
                    ? `⚠ ${selectedProduct.stock} ${t.left}`
                    : `${selectedProduct.stock} ${t.inStock}`}
                </span>
              </div>
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
                }}
                disabled={selectedProduct.stock === 0}
                style={{
                  ...btn,
                  width: "100%",
                  padding: "14px",
                  fontSize: 16,
                  opacity: selectedProduct.stock === 0 ? 0.45 : 1,
                  cursor:
                    selectedProduct.stock === 0 ? "not-allowed" : "pointer",
                }}
              >
                {selectedProduct.stock === 0 ? t.outOfStock : t.addCart}
              </button>
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
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    fontSize: 12,
                    color: MED,
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  💳 Payment Method
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <button
                    onClick={() => setPayMethod("cod")}
                    style={{
                      padding: "12px",
                      borderRadius: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: 700,
                      fontSize: 13,
                      border: `2px solid ${payMethod === "cod" ? PRIMARY : "rgba(173,20,87,0.2)"}`,
                      background:
                        payMethod === "cod"
                          ? "rgba(173,20,87,0.08)"
                          : "rgba(255,255,255,0.6)",
                      color: payMethod === "cod" ? PRIMARY : MED,
                    }}
                  >
                    🚚 Cash on Delivery
                    <br />
                    <span style={{ fontSize: 10, fontWeight: 400 }}>
                      Dhaka only
                    </span>
                  </button>
                  <button
                    onClick={() => setPayMethod("online")}
                    style={{
                      padding: "12px",
                      borderRadius: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: 700,
                      fontSize: 13,
                      border: `2px solid ${payMethod === "online" ? PRIMARY : "rgba(173,20,87,0.2)"}`,
                      background:
                        payMethod === "online"
                          ? "rgba(173,20,87,0.08)"
                          : "rgba(255,255,255,0.6)",
                      color: payMethod === "online" ? PRIMARY : MED,
                    }}
                  >
                    💳 Online Payment
                    <br />
                    <span style={{ fontSize: 10, fontWeight: 400 }}>
                      bKash · Nagad · Card
                    </span>
                  </button>
                </div>
                {payMethod === "cod" && deliveryCharge() === 150 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: DANGER,
                      fontWeight: 600,
                      marginTop: 6,
                      padding: "6px 10px",
                      background: "rgba(255,235,238,0.85)",
                      borderRadius: 8,
                    }}
                  >
                    ⚠ Outside Dhaka: Please select Online Payment (advance
                    payment required)
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
