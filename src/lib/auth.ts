import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { redis } from "./redis";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credentials({
      name: "Demo Account",
      credentials: {
        name: { label: "Display Name", type: "text", placeholder: "Your name" },
      },
      async authorize(credentials) {
        const name = credentials?.name as string;
        if (!name || name.trim().length < 2) return null;
        const id = `demo-${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
        return {
          id,
          name: name.trim(),
          email: `${id}@launchfeed.demo`,
          image: null,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.id) return false;
      const existing = await redis.hgetall(`user:${user.id}`);
      if (!existing || Object.keys(existing).length === 0) {
        await redis.hset(`user:${user.id}`, {
          id: user.id,
          name: user.name || "Anonymous",
          email: user.email || "",
          image: user.image || "",
          username: (user.name || "user").toLowerCase().replace(/\s+/g, "") + "-" + Date.now().toString(36),
          bio: "",
          createdAt: Date.now(),
        });
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
        const userData = await redis.hgetall(`user:${token.sub}`) as Record<string, string> | null;
        if (userData) {
          session.user.name = userData.name;
          session.user.image = userData.image || null;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
});
