import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Please sign in to create a post." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { content, imageUrl } = req.body;

  try {
    const prismaUser = await prisma.user.findUnique({
      where: { email: session.user?.email || undefined },
    });

    if (!prismaUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const post = await prisma.post.create({
      data: {
        content,
        image: imageUrl || null, // Use the S3 URL passed from client
        userId: prismaUser.id,
      },
    });

    return res.status(200).json(post);
  } catch (err) {
    console.error("Error in addPost:", err);
    return res.status(500).json({ message: "Error creating post" });
  }
}
