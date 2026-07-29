import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export const generateToken = (userId: string) => {
  const payload = { userId };

  const secret: Secret = env.JWT_SECRET;

  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options as jwt.SignOptions);
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET);
};