export default async function handler(req, res) {
  const { orderId } = req.query;
  res.redirect(302, `${process.env.SITE_URL}/?payment=failed&order=${orderId}`);
}
