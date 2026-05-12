import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { publishToQueue } from '../services/queue.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_change_me_in_production';

router.post("/register", async (req, res) => {
  try {
    const { email, password, ad, soyad, role } = req.body;

    if (!email || !password || !ad || !soyad) {
      return res.status(400).json({ message: "Tüm alanları doldurunuz" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Bu e-posta adresi zaten kullanımda" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      password: hashedPassword,
      ad,
      soyad,
      role: role === 'admin' ? 'admin' : 'user'
    });

    await user.save();

    res.status(201).json({
      id: user._id,
      email: user.email,
      ad: user.ad,
      soyad: user.soyad
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(400).json({ message: "Geçersiz istek verisi" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "E-posta ve şifre gereklidir" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "E-posta veya şifre hatalı" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "E-posta veya şifre hatalı" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, ad: user.ad, soyad: user.soyad },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ── RabbitMQ: Kullanıcı giriş bildirimi kuyruğa gönder ──
    await publishToQueue('login_notifications', {
      userId: user._id.toString(),
      email: user.email,
      ad: user.ad,
      soyad: user.soyad,
      role: user.role,
      loginAt: new Date().toISOString(),
    });

    res.json({ token });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

export default router;
