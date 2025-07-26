# Neon-Cart

**A full-stack e-commerce marketplace built with React, Firebase, and passion for clean & simple UI and scalable architecture.**

neonCart isn’t just another shopping site. It was born from a need to bridge the gap between sleek design, real-world seller tools, and user-first performance. Whether you're a casual buyer or a committed seller, neonCart delivers a smooth experience backed by clean code and sharp problem-solving.

---

## Table of Contents

* [Getting Started](#getting-started)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Problem Solving Philosophy](#problem-solving-philosophy)
* [Challenges Tackled](#challenges-tackled)
* [Future Roadmap](#future-roadmap)
* [License](#license)

---

## Getting Started

**Prerequisites**

* Node.js >= 18.x
* pnpm (recommended)
* Firebase account and project setup (Auth + Firestore)

**Clone the repo**

   ```bash
   git clone git@github.com:mrrafi2/Neon-cart.git
   cd neon-mart
   ```

**Installation**

```bash
pnpm install
```
**Set up environment variables** 
Create a `.env.local` file in the project root and add your config keys

**Running the App**

```bash
pnpm dev
```

The app runs locally at `http://localhost:5173`.

---

## Features

### Buyer Experience

* Browse by neon-themed categories
* Real-time search with local + remote query support
* Add to cart, dynamic subtotal calculations
* Also have direct buy product without add to cart 
* Persistent cart with localStorage fallback

### Seller Experience

* Apply for seller access via a multi-step form
* Add products with all kinds of detail & drag-and-drop product image upload
* Live listing preview while editing
* Protected routes and role-based access

### Shared

* Secured Firebase Auth with contextual UI logic
* Fully responsive layout
* Clean, modular UI components with scoped CSS
* Context API used for Auth and Cart

---

## Tech Stack

* **Frontend**: React 18, Vite
* **State**: React Context + custom hooks
* **Backend**: Firebase Auth + Firestore
* **Routing**: React Router v6
* **Styling**: Bootstrap + CSS Modules
* **Hosting**: Vercel / Firebase Hosting
* **Icons**: Lucide / FontAwesome (via React-Icons)

---

## Project Structure

```
src/
├── components/
│   ├── auth/
│   ├── buyer/
│   ├── seller/
│   ├── common/
│   └── topNavs/
├── context/
│   ├── AuthContext.jsx
│   └── CartContext.jsx
├── data/
│   ├── locationData.json
│   └── productMeta.json
├── firebaseInit/
│   └── firebase.js
├── App.jsx
├── main.jsx
└── style/
```

This layout favors a **feature-first** structure, where components and logic are grouped by purpose instead of type. This approach keeps code maintainable and scalable.

---

## Problem Solving Philosophy

This project reflects a no-shortcuts, real-world engineering mindset. Every feature you see was tested under fire. Every redirect, state, and style decision was weighed with user experience in mind.

Rather than relying on assumptions, the app handles edge cases like async state loading, premature redirects, and cart persistence head-on. You'll see deliberate pauses, conditional rendering, and data hydration strategies throughout the codebase.

When Firebase auth returns `null` temporarily, the app doesn’t guess — it waits. When a user reloads the browser, their cart stays intact. When a seller uploads an image, they see it instantly, thanks to object URLs and smart previews.

This isn’t a pile of plug-and-play libraries. It’s a system built with eyes wide open.

---

## Challenges Tackled

### Async Auth Handling

* **Issue**: Firebase’s `onAuthStateChanged` fires after the app loads, leading to false negatives on `isSeller` check.
* **Solution**: Introduced a `loadingAuth` state and gated UI/rendering until auth fully resolves. Ensured route guards didn’t redirect prematurely.

### Cart Persistence

* **Issue**: Cart wiped on reload or tab close.
* **Solution**: Cart state is saved to `localStorage` and rehydrated on boot. No Redux needed.

### Styling Conflicts

* **Issue**: Bootstrap overrides clashing with custom CSS.
* **Solution**: Used CSS Modules and BEM-style naming inside modules to maintain scoped, override-safe styles.

### Data Load Optimization

* **Issue**: Huge static JSON files causing slow load.
* **Solution**: Lazy loaded category metadata on demand. Exploring Firestore for dynamic content.

### Seller UX

* **Issue**: Rigid product creation UI lacked flexibility.
* **Solution**: Added drag-and-drop uploads, real-time preview, and flexible category inputs. Simplified seller journey.

---

## Future Roadmap

* **Analytics Dashboard** for sellers with visual charts (sales trends, top categories)
* **Algolia Search** integration for typo-tolerant, instant results
* **PWA Support** to allow offline browsing and caching
* **Mobile UX Boost**: gesture-based cart interactions, better touch targets
* **Admin Panel**: for managing flagged listings, reports, and approvals

---



## Contributing

We're not looking for perfection—we’re looking for thoughtful contributions.

If you’ve got an idea, a fix, or even just a small tweak that makes the experience sharper or the code cleaner, here’s how to get involved:

1. **Fork the repo** and clone it locally.
2. **Create a new branch** for your idea:
   `git checkout -b feature/your-cool-idea`
3. **Make your changes** with care and context.
4. **Commit with meaning**:
   `git commit -m "Describe what you actually changed"`
5. **Push to your fork**:
   `git push origin feature/your-cool-idea`
6. **Open a pull request** and explain *why* your change matters.

We review contributions with a critical but open mind—if you show your work and your thinking, we’ll take it seriously. Let's build something real, together.


## License

This project is licensed under the MIT License. Feel free to use it, break it, fork it, remix it—just don't forget to build something that matters.
