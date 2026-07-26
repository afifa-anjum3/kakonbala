// api/payment-ipn.js
// SSLCommerz calls this URL server-to-server to confirm payment
// Use this as a backup to update order status securely

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore }                  from "firebase-admin/firestore";

function getDb() {
  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)) });
  }
  return getFirestore();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { tran_id, status, val_id, amount } = req.body;

  if (status === "VALID" || status === "VALIDATED") {
    try {
      const db = getDb();
      await db.collection("orders").doc(tran_id).update({
        status:    "paid",
        valId:     val_id,
        paidAmount: parseFloat(amount),
      });
    } catch (e) {
      console.error("IPN update error:", e.message);
    }
  }
  res.status(200).send("IPN received");
}
