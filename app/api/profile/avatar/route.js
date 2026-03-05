import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { uploadImage, deleteImages } from "@/lib/r2";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: "File must be an image" }, { status: 400 });
    }

    // Validate file size (e.g., max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: "File exceeds 5MB limit" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique key
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const key = `${user.username}/avatars/avatar.${fileExtension}`;

    // Upload new image
    await uploadImage(buffer, key, file.type);

    // If the old avatar had a different extension, we should try to delete it
    const oldAvatarKey = user.profile.avatarUrl;
    if (oldAvatarKey && oldAvatarKey !== key && oldAvatarKey.startsWith(`${user.username}/avatars/`)) {
      deleteImages([oldAvatarKey]).catch(console.error);
    }

    // Update user profile
    user.profile.avatarUrl = key;
    await user.save();

    // Adding a cache buster so the client reloads the image immediately
    return NextResponse.json({
      message: "Avatar uploaded successfully",
      avatarUrl: key,
      proxyUrl: `/api/images/${key}?t=${Date.now()}`
    }, { status: 200 });

  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
