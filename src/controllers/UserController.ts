import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/UserModel";

class UserController {
  async signup(req: Request, res: Response) {
    const { name, email, password, timezone } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword, timezone });
      await user.save();

      const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        to: email,
        subject: "Verify your email",
        text: `Click the link to verify your account: http://localhost:5000/verify/${token}`,
      });

      res.status(201).json({ message: "User registered. Verify your email." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ error: "User not found" });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ error: "Invalid credentials" });
        return;
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
        expiresIn: "1d",
      });

      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async editProfile(req: Request, res: Response) {
    const { name, email, timezone } = req.body;
    const userId = req.user.id; // Assuming `req.user` contains authenticated user info (from middleware)
    let profilePicture;

    if (req.file) {
      profilePicture = `/uploads/${req.file.filename}`; // Assuming you're using a library like `multer` for file uploads
    }

    try {
      const updatedFields: any = {};
      if (name) updatedFields.name = name;
      if (email) updatedFields.email = email;
      if (timezone) updatedFields.timezone = timezone;
      if (profilePicture) updatedFields.profilePicture = profilePicture;

      const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
        new: true,
      });

      if (!updatedUser) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new UserController();
