/**
 * SEED SCRIPT — run this ONCE to populate your Firestore database.
 *
 * How to run:
 *   1. npm run dev    (start the app)
 *   2. Open browser console on your localhost page
 *   3. Paste this file's contents and press Enter
 *
 * OR: import and call seedProducts() from App.jsx temporarily,
 * then remove it once seeding is done.
 */

import { db } from "./firebase.js";
import { collection, doc, setDoc, writeBatch } from "firebase/firestore";

const initialProducts = [
  { id: "p01",  name: "Hammered Gold Cuff",       category: "jewelry",  price: 1800, stock: 12, emoji: "💍", desc: "Hand-hammered brass cuff with gold plating" },
  { id: "p02",  name: "Moonstone Drop Earrings",  category: "jewelry",  price: 1200, stock: 8,  emoji: "✨", desc: "Sterling silver with genuine moonstone" },
  { id: "p03",  name: "Braided Leather Bracelet", category: "jewelry",  price: 650,  stock: 20, emoji: "🪡", desc: "Hand-braided genuine leather, brass clasp" },
  { id: "p04",  name: "Terracotta Bead Necklace", category: "jewelry",  price: 900,  stock: 3,  emoji: "📿", desc: "Handmade clay beads with natural cord" },
  { id: "p05",  name: "Copper Leaf Ring",         category: "jewelry",  price: 450,  stock: 30, emoji: "💎", desc: "Artisan copper ring with leaf motif" },
  { id: "p06",  name: "Macramé Anklet",           category: "jewelry",  price: 350,  stock: 25, emoji: "🧵", desc: "Knotted cotton thread with shell beads" },
  { id: "p07",  name: "Hand-Thrown Ceramic Bowl", category: "crafts",   price: 1400, stock: 6,  emoji: "🏺", desc: "Wheel-thrown stoneware, terracotta glaze" },
  { id: "p08",  name: "Woven Wall Hanging",       category: "crafts",   price: 2200, stock: 2,  emoji: "🖼️", desc: "Natural wool and cotton fiber art" },
  { id: "p09",  name: "Soy Wax Candle Set",       category: "crafts",   price: 850,  stock: 18, emoji: "🕯️", desc: "Hand-poured with essential oils, set of 3" },
  { id: "p10",  name: "Pressed Flower Frame",     category: "crafts",   price: 1100, stock: 9,  emoji: "🌸", desc: "Real pressed wildflowers in rustic wood" },
  { id: "p11",  name: "Crochet Plant Hanger",     category: "crafts",   price: 750,  stock: 14, emoji: "🌿", desc: "Handcrafted macramé cotton rope hanger" },
  { id: "p12",  name: "Hand-painted Tote Bag",    category: "crafts",   price: 950,  stock: 5,  emoji: "👜", desc: "Canvas tote with original botanical art" },
  { id: "p13",  name: "Block Print Kurta",        category: "clothing", price: 2800, stock: 7,  emoji: "👘", desc: "Handblock-printed on organic cotton" },
  { id: "p14",  name: "Kantha Stitch Jacket",     category: "clothing", price: 4500, stock: 3,  emoji: "🧥", desc: "Vintage sari fabric, hand-stitched" },
  { id: "p15",  name: "Tie-dye Linen Scarf",      category: "clothing", price: 1200, stock: 16, emoji: "🧣", desc: "Natural dye on pure handwoven linen" },
  { id: "p16",  name: "Embroidered Jute Bag",     category: "clothing", price: 1600, stock: 10, emoji: "👝", desc: "Hand-embroidered jute with cotton lining" },
  { id: "p17",  name: "Batik Print Dress",        category: "clothing", price: 3500, stock: 5,  emoji: "👗", desc: "Traditional wax-resist batik on cotton" },
  { id: "p18",  name: "Handwoven Wool Shawl",     category: "clothing", price: 2200, stock: 8,  emoji: "🧤", desc: "Pure wool handloom weave, winter-ready" },
];

export async function seedProducts() {
  const batch = writeBatch(db);
  initialProducts.forEach((p) => {
    const ref = doc(collection(db, "products"), p.id);
    batch.set(ref, p);
  });
  await batch.commit();
  console.log("✅ Firestore seeded with", initialProducts.length, "products.");
}
