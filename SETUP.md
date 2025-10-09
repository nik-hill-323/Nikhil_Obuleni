# Portfolio Setup Guide

## 🚀 Quick Start

### 1. Fix npm Installation (Required First)

Run these commands in your terminal:

```bash
sudo chown -R 501:20 "/Users/nik_hill_126/.npm"
npm install --legacy-peer-deps
```

### 2. Set Up Email Service (Resend)

The contact form now uses Resend for sending emails. Follow these steps:

#### Get Your Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account (no credit card required)
3. Verify your email address
4. Go to API Keys section: [https://resend.com/api-keys](https://resend.com/api-keys)
5. Click "Create API Key"
6. Copy your API key

#### Configure Environment Variables

1. Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

2. Open `.env.local` and add your Resend API key:

```env
RESEND_API_KEY=re_your_actual_api_key_here
```

**Important:** Never commit `.env.local` to git. It's already in `.gitignore`.

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📧 Contact Form Features

### Current Features

✅ **Email Integration**
- Sends beautiful HTML emails via Resend
- Fallback mode if API key is not configured (logs to console)

✅ **Client-Side Validation**
- Name: minimum 2 characters
- Email: valid email format
- Subject: minimum 3 characters
- Message: minimum 10 characters
- Real-time error messages
- Visual feedback on invalid fields

✅ **Enhanced UX**
- Loading states with spinner
- Success/error toast notifications
- Form auto-clears on successful submission
- Animated error messages

✅ **Professional Email Template**
- Gradient header design
- Properly formatted fields
- Mobile-responsive
- Plain text fallback

### Testing the Contact Form

1. **Without Resend (Testing Mode)**
   - Don't set `RESEND_API_KEY`
   - Form submissions will log to console
   - Still shows success messages to user

2. **With Resend (Production Mode)**
   - Set `RESEND_API_KEY` in `.env.local`
   - Emails will be sent to `nikhil.obuleni@gwu.edu`
   - Check your inbox for beautifully formatted emails

## 🎨 Visual Enhancements

### Already Included

- **Galaxy Background**: Animated 3D space background
- **Smooth Animations**: Intersection Observer-based reveal effects
- **Dark/Light Mode**: Theme switching with smooth transitions
- **Gradient Effects**: Animated gradients on buttons and text
- **Glassmorphism**: Frosted glass effect on cards
- **Hover Effects**: Scale, glow, and translate animations

### Color Scheme

The portfolio uses a cohesive color palette:
- **Primary**: Blue/Purple gradient
- **Accent**: Teal/Cyan highlights
- **Secondary**: Pink/Purple accents

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **UI**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI
- **3D Graphics**: Three.js + React Three Fiber
- **Email**: Resend
- **Notifications**: Sonner (toast)
- **Forms**: React Hook Form + Zod (validation)

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🚢 Deployment

### Recommended: Vercel (Easiest)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variable:
   - `RESEND_API_KEY`: your Resend API key
5. Deploy!

### Environment Variables for Production

Make sure to add these in your hosting platform:

```
RESEND_API_KEY=re_your_api_key_here
```

## 📝 Customization

### Update Personal Information

Edit these files:

1. **Contact Info**: `components/contact.tsx`
   - Email: Line 94, 70 (API route)
   - Phone: Line 111
   - Location: Line 134
   - LinkedIn: Line 146

2. **Hero Section**: `components/hero.tsx`
   - Name: Line 12
   - Tagline: Line 69
   - Description: Line 79-83
   - GitHub: Line 119

3. **Projects**: `components/projects.tsx`
   - Update the `projects` array (Line 9-62)

4. **Skills**: `components/skills.tsx`
   - Add/remove skills

5. **Experience**: `components/experience.tsx`
   - Add/update work experience

## 🐛 Troubleshooting

### npm Install Issues

If you still have permission errors:

```bash
# Clear npm cache completely
sudo rm -rf /Users/nik_hill_126/.npm
npm cache clean --force
npm install --legacy-peer-deps
```

### Email Not Sending

1. Check `.env.local` exists and contains `RESEND_API_KEY`
2. Verify API key is correct (starts with `re_`)
3. Check console for errors
4. Verify Resend account is active

### Build Errors

If you get TypeScript errors:

```bash
npm run lint
```

Fix any linting issues before building.

## 📞 Need Help?

- Check [Next.js Documentation](https://nextjs.org/docs)
- Check [Resend Documentation](https://resend.com/docs)
- Review error logs in browser console

## 🎉 You're All Set!

Your portfolio is ready to impress! The contact form will send emails directly to your inbox, and visitors can easily reach out to you.
