// api/payment-success.js
// SSLCommerz redirects the customer HERE after successful payment

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore }                  from "firebase-admin/firestore";

function getDb() {
  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)) });
  }
  return getFirestore();
}

export default async function handler(req, res) {
  const { orderId } = req.query;
  try {
    const db = getDb();
    await db.collection("orders").doc(orderId).update({ status: "paid" });
    // Deduct stock for each item in the order
    const order = await db.collection("orders").doc(orderId).get();
    const items  = order.data()?.items || [];
    const batch  = db.batch();
    for (const item of items) {
      const ref = db.collection("products").doc(item.id);
      batch.update(ref, { stock: require("firebase-admin/firestore").FieldValue.increment(-item.qty) });
    }
    await batch.commit();
  } catch (e) {
    console.error("Success handler error:", e.message);
  }
  // Redirect customer to a thank-you page
  res.redirect(302, `${process.env.SITE_URL}/?payment=success&order=${orderId}`);
}
