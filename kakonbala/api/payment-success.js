import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue }      from "firebase-admin/firestore";

function getDb() {
  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)) });
  }
  return getFirestore();
}

export default async function handler(req, res) {
  const { orderId } = req.query;
  try {
    const db    = getDb();
    const oSnap = await db.collection("orders").doc(orderId).get();
    const items  = oSnap.data()?.items || [];
    const batch  = db.batch();
    batch.update(db.collection("orders").doc(orderId), { status: "paid" });
    for (const item of items) {
      batch.update(db.collection("products").doc(item.id), {
        stock: FieldValue.increment(-item.qty),
      });
    }
    await batch.commit();
  } catch (e) {
    console.error("Success handler error:", e.message);
  }
  res.redirect(302, `${process.env.SITE_URL}/?payment=success&order=${orderId}`);
}
