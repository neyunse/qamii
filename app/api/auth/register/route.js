import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mail";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({ message: "Username must be at least 3 characters" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    await connectToDatabase();

    // Check if user already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return NextResponse.json({ message: "Username already taken" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Generate OBS Overlay Key
    const obsKey = crypto.randomBytes(16).toString('hex');

    // Create user
    const newUser = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiry,
      integrations: {
        obsKey
      }
    });

    // Send the verification email in the background
    sendVerificationEmail(newUser.email, verificationToken, "QAmii")
      .catch(err => console.error("Failed to send verification email:", err));

    return NextResponse.json({ message: "User created successfully. Please check your email to verify your account." }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
