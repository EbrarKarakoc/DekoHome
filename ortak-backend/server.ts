import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// Removed static Vite import for production stability
import path from "path";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import userRoutes from "./routes/users.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import reviewRoutes from "./routes/reviews.js";
import { connectDB } from "./config/db.js";

// Load environment variables
dotenv.config();

async function startServer() {
  // Connect to Database in the background
  connectDB().catch(console.error);

  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  // Middleware
  const allowedOrigins = new Set([
    'https://dekohome-api.onrender.com',
    'http://localhost:3000',
    'http://localhost:24679',
    'http://localhost:8081',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:24679',
    'http://127.0.0.1:8081',
  ]);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Native clients may send no Origin header.
        if (!origin) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }

        // Keep dev experience smooth: allow any localhost / loopback port.
        if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    })
  );
  app.use(express.json());

  // API Routes
  app.get("/v1/health", (req, res) => {
    const uri = process.env.MONGODB_URI || '';
    res.json({
      status: "ok",
      message: "DekoHome Backend API is running!",
      dbState: mongoose.connection.readyState,
      hasUri: !!uri,
      uriPrefix: uri.substring(0, 15) + '...'
    });
  });

  app.use("/v1/auth", authRoutes);
  app.use("/v1/users", userRoutes);
  app.use("/v1/products", productRoutes);
  app.use("/v1/categories", categoryRoutes);
  app.use("/v1/cart", cartRoutes);
  app.use("/v1/orders", orderRoutes);
  app.use("/v1/reviews", reviewRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
        root: path.join(process.cwd(), "web-frontend"),
        optimizeDeps: {
          exclude: ['ioredis', 'amqplib']
        }
      });
      app.use(vite.middlewares);
      console.log("✅ Vite dev server started.");
    } catch (err) {
      console.error("❌ Vite server error:", err);
      // In dev we might want to continue if frontend is not needed, but here we exit
      process.exit(1);
    }
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'web-frontend', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Redis & RabbitMQ artık tüm ortamlarda (development dahil) başlatılacak.
  // Not: Eğer Vite çalışırken DataCloneError alırsanız, bu kısıtlamayı geri koymanız gerekebilir.
  import('./services/cache.js').then(({ initRedis }) => {
    setImmediate(() => initRedis());
  }).catch(console.error);

  import('./services/queue.js').then(({ initRabbitMQ }) => {
    setImmediate(() => { initRabbitMQ().catch(console.error); });
  }).catch(console.error);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
