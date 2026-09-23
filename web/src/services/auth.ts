import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
});

export async function currentUser(): Promise<string> {
  const session = await auth();
  return session?.user?.email ?? session?.user?.name ?? "anonymous";
}
