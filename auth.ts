import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Usuario } from "@/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [Google],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (account?.provider === "google") {
        const email = user?.email?.toLowerCase().trim();
        if (!email) return token;

        const { data: existente } = await supabaseAdmin
          .from("usuarios")
          .select("*")
          .eq("email", email)
          .maybeSingle<Usuario>();

        let usuario = existente;

        if (!usuario) {
          const { data: creado } = await supabaseAdmin
            .from("usuarios")
            .insert({
              email,
              nombre: user?.name ?? email,
            })
            .select()
            .single<Usuario>();
          usuario = creado;
        }

        if (usuario) {
          token.id = usuario.id;
        }
        return token;
      }

      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
