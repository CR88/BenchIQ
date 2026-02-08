import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublic = ["/login", "/register"].some((p) =>
        nextUrl.pathname.startsWith(p)
      )
      const isAuthApi = nextUrl.pathname.startsWith("/api/auth")

      if (isAuthApi) return true
      if (!isLoggedIn && !isPublic) return false
      if (isLoggedIn && isPublic) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
