import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const createToken = async (userId: number, type: string) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: type === "access" ? "15m" : "7d",
  });

  await prisma.token.create({
    data: {
      userId,
      token,
      type,
    },
  });

  return token;
};

export const validateToken = async (token: string, type: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const storedToken = await prisma.token.findUnique({
      where: { token },
    });

    if (storedToken && storedToken.type === type) {
      return decoded;
    } else {
      throw new Error("Token invalid or not found");
    }
  } catch (err) {
    throw new Error("Token invalid");
  }
};

export const revokeToken = async (token: string) => {
  await prisma.token.delete({
    where: { token },
  });
};
