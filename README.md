# Neon‑mart 🌟

**Neon‑mart** is your electrifying one‑stop e‑commerce bazaar, where vibrant neon vibes meet seamless shopping. Whether you're hunting for the latest tech gadgets, killer streetwear, or glow‑in‑the‑dark accessories, we’ve got you. Buckle up and let’s light up your cart! 🔥

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Configuration](#configuration)
5. [Running Locally](#running-locally)
6. [Deployment](#deployment)
7. [Contributing](#contributing)
8. [License](#license)

---

## Features ✨ (#features)

* 💡 **Vibrant UI** powered by **Bootstrap**, **Framer Motion**, and **GSAP** animations for a truly electrifying experience.
  
* 🔍 **Smooth Navigation** with **React Router** for lightning‑fast page transitions.
  
* 📦 **Product Management**: Browse, search, filter, and add to cart with real‑time updates.
  
* 🔔 **Notifications & Emails** via **EmailJS** to keep users in the loop.

* 🔒 **Authentication & Database** handled by **Firebase** (Auth, Firestore, Storage).
  
* ⚡ **Lazy Loading & Intersection Observer** for supercharged performance.
  
* 📱 **Responsive Design**: Looks flawless on mobile, tablet, and desktop.
  
* 🌱 **Modern UX** meets **Retro Neon** aesthetic — a fusion of past traditions and future dreams.

---

## Tech Stack 🛠️(#tech-stack)

* **React** (^18.2.0)
* **React DOM** (^18.2.0)
* **React Router DOM** (^7.3.0)
  
* **Bootstrap** (^5.3.3)
* **Framer Motion** (^12.5.0)
* **GSAP** (^3.12.7)
  
* **Axios** (^1.8.4)
* **Firebase** (^11.4.0)
* **EmailJS** (@emailjs/browser ^4.4.1)
  
* **React Icons** (^5.5.0)
* **React Intersection Observer** (^9.16.0)

---

## Getting Started 🚀(#getting-started)

Follow these steps to spin up Neon‑mart on your local machine:

1. **Clone the repo**

   ```bash
   git clone git@github.com:mrrafi2/Neon-cart.git
   cd neon-mart
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or yarn install
   ```

3. **Set up environment variables** (see [Configuration](#configuration))

4. **Start the dev server**

   ```bash
   npm run dev
   # or yarn dev
   ```

5. **Open your browser** at `http://localhost:3000` and get glowing! 🌈

---

## Configuration 🛠️

Create a `.env.local` file in the project root and add your keys:

```bash
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# EmailJS
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

*Keep these secrets safe!* 🔐

---

## Running Locally 🏃‍♂️

* **Dev mode**: `npm run dev` — edits live with hot‑reload.
* **Build**: `npm run build` — creates an optimized production bundle.
* **Preview**: `npm run preview` — serve the build locally.

> Tip: Use **React DevTools** and **Redux DevTools** (if applicable) for debugging.

---

## Deployment 📦

Neon‑mart plays nice with most hosting platforms:

* **Vercel**: `vercel --prod`
* **Netlify**: Drag & drop in the UI or link your GitHub repo.
* **Firebase Hosting**:

  ```bash
  npm install -g firebase-tools
  firebase login
  firebase init hosting
  firebase deploy
  ```

Choose your neon‑powered runway and watch it soar! 🚀

---

## Contributing ❤️

We’d love your spark! ✨

1. Fork the repo.
2. Create a feature branch: `git checkout -b feature/your-cool-idea`
3. Commit your changes: \`git commit -m "Add some glitz"
4. Push: `git push origin feature/your-cool-idea`
5. Open a PR and let's make Neon‑mart brighter together!

---

## License 📜

Distributed under the MIT License. See `LICENSE` for more info.

---

*“In the neon glow of commerce, may your cart always be full and your heart even fuller.”* 🌟
