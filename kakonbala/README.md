# ✦ Hastkala — Deployment Guide
## From zero to a live website in ~30 minutes

---

## WHAT YOU HAVE
- React frontend (Vite) — Shop, Dashboard, Inventory, Orders
- Firebase Firestore — real database (products, orders sync live)
- SSLCommerz — real payment gateway (bKash, Nagad, Visa, MasterCard)
- Vercel serverless API — handles payment + Firestore writes securely

---

## STEP 1 — Create a Firebase Project (Free)

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"** → name it `hastkala` → click through
3. Once created, click **"</> Web"** to add a web app → name it `hastkala-web`
4. Copy the `firebaseConfig` object shown — you'll need it in Step 4

### Enable Firestore Database
- Sidebar → **Firestore Database** → **Create database**
- Choose **"Start in test mode"** (allows all reads/writes for 30 days)
- Pick region: **asia-south1 (Mumbai)** — closest to Bangladesh

### Get Service Account Key (for server API)
- Sidebar → ⚙️ **Project Settings** → **Service accounts** tab
- Click **"Generate new private key"** → download the JSON file
- Open it in Notepad, select ALL, copy — you'll paste this in Step 4

---

## STEP 2 — Register with SSLCommerz (Free Sandbox)

1. Go to **https://developer.sslcommerz.com**
2. Click **"Register"** and create a developer account
3. After approval (usually instant for sandbox), go to your dashboard
4. You'll see your **Store ID** and **Store Password**
5. Use sandbox credentials for testing — switch to live when ready

**For live payments:**
- Go to **https://www.sslcommerz.com** → click "Open Account"
- You'll need your trade licence and bank account details
- Approval takes 2–5 business days

---

## STEP 3 — Push Code to GitHub

```bash
# Install Git if you don't have it: https://git-scm.com

cd hastkala
git init
git add .
git commit -m "Initial Hastkala commit"

# Create a new repo on https://github.com → copy its URL, then:
git remote add origin https://github.com/YOUR_USERNAME/hastkala.git
git push -u origin main
```

---

## STEP 4 — Deploy to Vercel (Free)

1. Go to **https://vercel.com** → sign up with your GitHub account
2. Click **"New Project"** → import your `hastkala` repository
3. Framework preset: **Vite** (auto-detected)
4. Click **"Environment Variables"** and add ALL of these:

| Variable Name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | from firebaseConfig |
| `VITE_FIREBASE_AUTH_DOMAIN` | from firebaseConfig |
| `VITE_FIREBASE_PROJECT_ID` | from firebaseConfig |
| `VITE_FIREBASE_STORAGE_BUCKET` | from firebaseConfig |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | from firebaseConfig |
| `VITE_FIREBASE_APP_ID` | from firebaseConfig |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | the ENTIRE contents of the JSON key file (all on one line) |
| `SSL_STORE_ID` | your SSLCommerz Store ID |
| `SSL_STORE_PASSWORD` | your SSLCommerz Store Password |
| `SSL_IS_LIVE` | `false` (change to `true` when going live) |
| `SITE_URL` | leave blank for now — add after first deploy |

5. Click **"Deploy"** — wait ~2 minutes
6. Vercel gives you a URL like `https://hastkala-abc123.vercel.app`
7. Go back to **Environment Variables**, set `SITE_URL` to that URL
8. **Redeploy** (Settings → Deployments → Redeploy)

---

## STEP 5 — Seed Your Database with Products

1. Visit your live site URL
2. Open browser **DevTools** (F12) → **Console** tab
3. Paste and run:

```javascript
import("/src/seed.js").then(m => m.seedProducts())
```

Or temporarily add this to `src/App.jsx` at the top of the component:
```javascript
useEffect(() => { import("./seed.js").then(m => m.seedProducts()); }, []);
// Remove this line after running once!
```

---

## STEP 6 — Add a Custom Domain (Optional)

1. Buy a domain at **Namecheap** (~৳1,200/year for .com) or **Hostinger BD**
2. In Vercel → your project → **Settings → Domains**
3. Add your domain → follow the DNS instructions
4. Update `SITE_URL` environment variable to your new domain
5. Redeploy

---

## PAYMENT FLOW EXPLAINED

```
Customer clicks "Pay"
    ↓
Your site calls /api/initiate-payment (Vercel function)
    ↓
SSLCommerz returns a payment page URL
    ↓
Customer is redirected to SSLCommerz
    ↓
Customer pays via bKash / Nagad / Card
    ↓
SSLCommerz redirects to /api/payment-success
    ↓
Order status updated to "paid" in Firestore
Stock is automatically deducted
    ↓
Customer sees confirmation on your site
```

---

## GOING LIVE CHECKLIST

- [ ] Firebase Firestore rules tightened (not test mode)
- [ ] `SSL_IS_LIVE=true` in Vercel environment variables
- [ ] `SITE_URL` set to your real domain
- [ ] SSLCommerz live account approved
- [ ] Custom domain connected
- [ ] Test a full order end-to-end with sandbox first

---

## COSTS SUMMARY

| Service | Cost |
|---|---|
| Firebase (Firestore) | Free up to 50,000 reads/day |
| Vercel hosting | Free (Hobby plan) |
| SSLCommerz | Free to integrate; 2–3% per transaction |
| Domain (.com.bd) | ~৳800–1,500/year |
| **Total to start** | **৳0 (just transaction fees when you sell)** |

---

## NEED HELP?

- Firebase docs: https://firebase.google.com/docs/firestore
- SSLCommerz docs: https://developer.sslcommerz.com/doc/v4/
- Vercel docs: https://vercel.com/docs
