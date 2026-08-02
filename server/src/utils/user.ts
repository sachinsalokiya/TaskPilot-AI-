import { User } from "@prisma/client";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
};

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
