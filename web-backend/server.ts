import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import path from "path";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import userRoutes from "./routes/users.js";
import categoryRoutes from "./routes/categories.js";
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
  app.use(cors());
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
  app.use("/v1/categories", categoryRoutes);
  app.use("/v1/products", productRoutes);
  app.use("/v1/cart", cartRoutes);
  app.use("/v1/orders", orderRoutes);
  app.use("/v1/reviews", reviewRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(process.cwd(), "web-frontend"),
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'web-frontend', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
