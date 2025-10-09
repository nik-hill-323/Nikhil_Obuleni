# Nikhil Obuleni - Data Science Portfolio

A modern, interactive portfolio website showcasing data science projects, skills, and professional experience.

## ✨ Features

- **Modern Design**: Sleek UI with galaxy background and 3D elements
- **Dark/Light Mode**: Seamless theme switching
- **Interactive Contact Form**: Email integration with Resend
- **Responsive**: Works beautifully on all devices
- **Smooth Animations**: Intersection Observer-based reveals
- **Performance Optimized**: Built with Next.js 15

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Fix npm permissions first (if needed)
sudo chown -R 501:20 "/Users/nik_hill_126/.npm"

# Install dependencies
npm install --legacy-peer-deps
```

### 2. Set Up Email (Optional)

Create a `.env.local` file:

```env
RESEND_API_KEY=your_resend_api_key_here
```

Get your free API key at [resend.com](https://resend.com)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📚 Full Setup Guide

See [SETUP.md](./SETUP.md) for detailed instructions on:
- Email service configuration
- Customization options
- Deployment guide
- Troubleshooting

## 🛠️ Tech Stack

- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Radix UI** - Accessible components
- **Three.js** - 3D graphics
- **Resend** - Email service
- **Sonner** - Toast notifications

## 📁 Project Structure

```
nikhil-portfolio/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── contact/       # Contact form endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components
│   ├── hero.tsx          # Hero section
│   ├── about.tsx         # About section
│   ├── experience.tsx    # Experience section
│   ├── projects.tsx      # Projects section
│   ├── skills.tsx        # Skills section
│   └── contact.tsx       # Contact section
├── lib/                  # Utilities
├── public/              # Static assets
└── .env.example         # Environment template
```

## 📧 Contact Form

The contact form includes:

✅ Real-time validation
✅ Professional email templates
✅ Error handling
✅ Loading states
✅ Success/error notifications

Messages are sent to: `nikhil.obuleni@gwu.edu`

## 🎨 Customization

1. **Personal Info**: Edit `components/contact.tsx`
2. **Projects**: Update `components/projects.tsx`
3. **Experience**: Modify `components/experience.tsx`
4. **Skills**: Change `components/skills.tsx`
5. **Colors**: Adjust `app/globals.css`

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push code to GitHub
2. Import to Vercel
3. Add `RESEND_API_KEY` environment variable
4. Deploy!

## 📝 License

© 2025 Nikhil Obuleni. All rights reserved.

## 🙏 Acknowledgments

Built with modern web technologies and design best practices.
