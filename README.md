# 🚀 TechBlogger — Premium MERN Blogging Platform

<div align="center">

![TechBlogger Banner](<./client/src/assets/Screenshot 2026-05-19 145144.png />
)

**A full-stack, engineering-focused blogging platform built for developers, by developers.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 📝 About

**TechBlogger** is a premium, full-stack blogging platform built with the **MERN stack** — designed specifically for the software engineering community. It features a sleek dark-themed UI with glassmorphism, rich text authoring, JWT-based authentication, Cloudinary image uploads, and a fully functional writer dashboard — everything a developer needs to publish, manage, and share technical content.

---

## ✨ Features

### 👤 Authentication
- JWT-based login and registration with **HttpOnly cookie** sessions
- Secure password hashing with **bcryptjs**
- Protected routes for dashboard and blog creation

### 📝 Blog Management
- Rich text editor powered by **React Quill** with full formatting support
- Markdown rendering with **React Markdown** + GitHub Flavored Markdown (GFM)
- Create, edit, and delete blog posts
- Category tagging and filtering
- Single blog page with reading time, author info, and content

### 👤 User Dashboard
- Update profile info: name, bio, avatar, website, and social links
- Manage all personal blog posts from one view
- Avatar image uploads via **Cloudinary** + **Multer**

### 🏠 Homepage
- Dynamic Hero section with animated gradient text
- Featured **Top Writers** section with author cards and social links
- Trending & latest blog previews
- Category browsing section
- Animated scroll interactions via **Framer Motion**

### 🎨 UI/UX
- **Dark-first** design with glassmorphism cards and neon glow accents
- Fully **responsive** layout for mobile, tablet, and desktop
- Smooth page transitions and micro-animations with **Framer Motion**
- Scroll-to-top button for long content pages
- Toast notifications via **React Toastify**

---

## 🛠 Tech Stack

### Frontend (`/client`)

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool & dev server |
| Tailwind CSS v4 | Utility-first styling |
| Redux Toolkit + RTK Query | State management & data fetching |
| React Router DOM v7 | Client-side routing |
| Framer Motion | Animations & transitions |
| React Quill New | Rich text blog editor |
| React Markdown + remark-gfm | Markdown rendering |
| Axios | HTTP client |
| React Icons | Icon library |
| React Toastify | Notifications |
| date-fns | Date formatting |
| DOMPurify | XSS sanitization |

### Backend (`/server`)

| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password hashing |
| Multer | File upload handling |
| Cloudinary | Cloud image storage |
| cookie-parser | Cookie middleware |
| dotenv | Environment config |
| express-async-handler | Async error handling |

---

## 📁 Project Structure

```
Tech Blogger/
├── client/                     # React frontend (Vite)
│   ├── public/                 # Static assets & logo
│   ├── src/
│   │   ├── assets/             # Images and icons
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Header.jsx      # Sticky navigation bar
│   │   │   ├── Footer.jsx      # Site footer with social links
│   │   │   └── ScrollToTopButton.jsx
│   │   ├── context/            # React context providers
│   │   ├── pages/              # Application pages/routes
│   │   │   ├── HomePage.jsx    # Landing page
│   │   │   ├── BlogsPage.jsx   # Blog listing & search
│   │   │   ├── SingleBlogPage.jsx  # Full blog post view
│   │   │   ├── DashboardPage.jsx   # Author dashboard
│   │   │   ├── CategoriesPage.jsx  # Browse by category
│   │   │   ├── LoginPage.jsx   # Authentication
│   │   │   └── RegisterPage.jsx
│   │   ├── redux/              # Redux store, slices & RTK Query APIs
│   │   ├── App.jsx             # Root component & routes
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global design system styles
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Node.js/Express backend
│   ├── controllers/            # Route handler logic
│   ├── middlewares/            # Auth middleware (JWT verify)
│   ├── models/
│   │   ├── User.js             # User schema (name, email, avatar, bio, socials)
│   │   └── Blog.js             # Blog schema (title, content, category, author)
│   ├── routes/
│   │   ├── authRoutes.js       # POST /api/auth/register, /login, /logout
│   │   ├── blogRoutes.js       # CRUD /api/blogs
│   │   ├── uploadRoutes.js     # POST /api/upload (Cloudinary)
│   │   └── writerRoutes.js     # GET /api/writers (top authors)
│   ├── uploads/                # Local fallback for file storage
│   ├── server.js               # Express app entry point
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) **or** a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string
- A **Cloudinary** account (free tier) for image uploads

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/tech-blogger.git
cd tech-blogger
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
MONGO_URI=mongodb://127.0.0.1:27017/techblogger
JWT_SECRET=your_super_secret_key
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```

Start the backend server:

```bash
node server.js
```

> The API will be running at `http://localhost:5000`

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

> The app will be running at `http://localhost:3000`

---

## 🔐 Environment Variables

| Variable | Location | Description |
|---|---|---|
| `MONGO_URI` | `server/.env` | MongoDB connection string |
| `JWT_SECRET` | `server/.env` | Secret key for signing JWTs |
| `PORT` | `server/.env` | Port for the Express server (default: 5000) |
| `CLOUDINARY_CLOUD_NAME` | `server/.env` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `server/.env` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `server/.env` | Cloudinary API secret |
| `NODE_ENV` | `server/.env` | `development` or `production` |

> ⚠️ **Never commit your `.env` file to version control.**

---

## 📡 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/register` | Register a new user | ❌ |
| `POST` | `/login` | Login and receive JWT cookie | ❌ |
| `POST` | `/logout` | Clear auth cookie | ✅ |

### Blogs — `/api/blogs`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | Get all blog posts | ❌ |
| `GET` | `/:id` | Get a single blog post | ❌ |
| `POST` | `/` | Create a new blog post | ✅ |
| `PUT` | `/:id` | Update a blog post | ✅ |
| `DELETE` | `/:id` | Delete a blog post | ✅ |

### Writers — `/api/writers`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | Get top writers | ❌ |
| `GET` | `/profile` | Get logged-in user profile | ✅ |
| `PUT` | `/profile` | Update user profile & social links | ✅ |

### Upload — `/api/upload`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/` | Upload an image to Cloudinary | ✅ |

---

## 🌐 Deployment

### Backend — Render / Railway

1. Push your code to GitHub.
2. Create a new **Web Service** on [Render](https://render.com) or [Railway](https://railway.app).
3. Set **Root Directory** to `server`.
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add all **Environment Variables** from your `.env` file.
7. Update the CORS origin in `server.js` to your deployed frontend URL.

### Frontend — Vercel

1. Update `client/vite.config.js` — change the proxy `target` to your deployed backend URL.
2. Connect your repository to [Vercel](https://vercel.com).
3. Set **Root Directory** to `client`.
4. Vercel auto-detects Vite. Set:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Deploy 🚀

---

## 📸 Screenshots

> Coming soon — add screenshots of your deployed app here.

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

Made with ❤️ by **Satya** · [GitHub](https://github.com/your-username) · [LinkedIn](https://linkedin.com/in/your-profile)

</div>
