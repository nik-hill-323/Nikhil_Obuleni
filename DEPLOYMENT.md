# 🚀 Deployment Guide - Vercel

Your portfolio is ready to deploy! Here are **3 easy methods** to deploy to Vercel:

---

## 🎯 Method 1: Deploy via Vercel Dashboard (Easiest - Recommended)

This is the **simplest and most recommended** method!

### Steps:

1. **Push to GitHub** (if not already):
   ```bash
   # Create a new repository on GitHub first, then:
   git remote add origin https://github.com/YOUR_USERNAME/nikhil-portfolio.git
   git branch -M main
   git push -u origin main
   ```

2. **Go to Vercel**:
   - Visit [vercel.com/new](https://vercel.com/new)
   - Sign in with GitHub (or create account)

3. **Import Repository**:
   - Click "Import Project"
   - Select your `nikhil-portfolio` repository
   - Click "Import"

4. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Build Command: `npm run build`
   - Install Command: `npm install --legacy-peer-deps`
   - Output Directory: `.next` (auto-filled)

5. **Add Environment Variable** (Optional):
   - Click "Environment Variables"
   - Add: `RESEND_API_KEY` = `your_api_key_here`
   - (Skip this if you don't have Resend set up yet)

6. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your live URL! 🎉

---

## 🔧 Method 2: Deploy via Vercel CLI (Terminal)

### Steps:

1. **Login to Vercel**:
   ```bash
   npx vercel login
   ```
   - Enter your email
   - Click verification link sent to your email

2. **Deploy**:
   ```bash
   npx vercel --prod
   ```
   - Answer the prompts:
     - Set up and deploy? **Y**
     - Which scope? (select your account)
     - Link to existing project? **N**
     - Project name: **nikhil-portfolio**
     - Directory: **./** (press Enter)
     - Override settings? **N**

3. **Add Environment Variable** (if needed):
   ```bash
   npx vercel env add RESEND_API_KEY production
   ```
   - Paste your Resend API key when prompted

4. **Redeploy** (if you added env variable):
   ```bash
   npx vercel --prod
   ```

---

## 🔗 Method 3: One-Click Deploy Button

Click this button to deploy instantly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/nikhil-portfolio)

*(Replace YOUR_USERNAME with your GitHub username after pushing to GitHub)*

---

## 📝 Post-Deployment Steps

### 1. Set Up Custom Domain (Optional)

In Vercel Dashboard:
- Go to your project → Settings → Domains
- Add your custom domain (e.g., `nikhilobuleni.com`)
- Follow DNS configuration instructions

### 2. Configure Environment Variables

**Required for Email Functionality:**

In Vercel Dashboard:
- Go to Settings → Environment Variables
- Add:
  - **Key**: `RESEND_API_KEY`
  - **Value**: Your Resend API key from [resend.com](https://resend.com)
  - **Environment**: Production (and Preview if needed)

### 3. Redeploy

After adding environment variables:
- Go to Deployments tab
- Click "..." on latest deployment
- Click "Redeploy"

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update portfolio"
git push origin main
```

Vercel will automatically:
- Build your project
- Run tests (if configured)
- Deploy to production
- Provide a live URL

---

## 🌐 Your Live URLs

After deployment, you'll get:

1. **Production URL**: `https://nikhil-portfolio-[hash].vercel.app`
2. **Custom Domain** (if configured): `https://yourdomain.com`
3. **Preview URLs**: Every branch/PR gets its own URL

---

## 📊 Vercel Dashboard Features

Access at [vercel.com/dashboard](https://vercel.com/dashboard):

- **Deployments**: View all deployments and their status
- **Analytics**: See visitor stats (free tier)
- **Logs**: Debug issues in real-time
- **Environment Variables**: Manage secrets
- **Domains**: Configure custom domains

---

## ⚡ Quick Deploy Commands

```bash
# Login (one-time)
npx vercel login

# Deploy to preview
npx vercel

# Deploy to production
npx vercel --prod

# Check deployment status
npx vercel ls

# View logs
npx vercel logs
```

---

## 🐛 Troubleshooting

### Build Fails

**Issue**: Build fails due to dependency conflicts

**Solution**:
- In Vercel Dashboard → Settings → Build & Development Settings
- Install Command: `npm install --legacy-peer-deps`
- Save and redeploy

### Contact Form Not Sending Emails

**Issue**: Form submits but no emails received

**Solution**:
1. Check if `RESEND_API_KEY` is set in Vercel environment variables
2. Verify API key is correct (starts with `re_`)
3. Check Vercel deployment logs for errors

### 404 on Routes

**Issue**: Some pages show 404

**Solution**: Ensure Next.js is detected as framework:
- Vercel Dashboard → Settings → General
- Framework Preset: **Next.js**

---

## 🎉 Success Checklist

After deployment, verify:

- ✅ Website loads at Vercel URL
- ✅ All sections display correctly
- ✅ Dark/Light mode works
- ✅ Navigation functions
- ✅ Contact form submits (check logs)
- ✅ Images and assets load
- ✅ Responsive on mobile

---

## 📧 Need Help?

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)

---

**Ready to deploy?** Choose Method 1 (GitHub + Vercel Dashboard) for the easiest experience! 🚀
