// api/initiate-payment.js
// Vercel serverless function — called when customer clicks "Pay"

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { orderId, amount, customerName, customerEmail, customerPhone, customerAddress } = req.body;

  const STORE_ID  = process.env.SSL_STORE_ID;
  const STORE_PASS = process.env.SSL_STORE_PASSWORD;
  const IS_LIVE   = process.env.SSL_IS_LIVE === "true";
  const SITE_URL  = process.env.SITE_URL || "http://localhost:3000";

  const sslEndpoint = IS_LIVE
    ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
    : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

  const params = new URLSearchParams({
    store_id:          STORE_ID,
    store_passwd:      STORE_PASS,
    total_amount:      amount.toString(),
    currency:          "BDT",
    tran_id:           orderId,
    success_url:       `${SITE_URL}/api/payment-success?orderId=${orderId}`,
    fail_url:          `${SITE_URL}/api/payment-fail?orderId=${orderId}`,
    cancel_url:        `${SITE_URL}/api/payment-cancel?orderId=${orderId}`,
    ipn_url:           `${SITE_URL}/api/payment-ipn`,
    cus_name:          customerName,
    cus_email:         customerEmail,
    cus_phone:         customerPhone,
    cus_add1:          customerAddress,
    cus_city:          "Dhaka",
    cus_country:       "Bangladesh",
    shipping_method:   "NO",
    product_name:      "Hastkala Handmade Products",
    product_category:  "Handcraft",
    product_profile:   "general",
  });

  try {
    const response = await fetch(sslEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await response.json();

    if (data.status === "SUCCESS") {
      return res.status(200).json({ url: data.GatewayPageURL });
    } else {
      return res.status(400).json({ error: data.failedreason || "Payment init failed" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
