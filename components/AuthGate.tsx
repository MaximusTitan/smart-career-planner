"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChatWidget } from "./ChatWidget";
import { Loading } from "./Loading";
import { useAuth } from "@/lib/auth";

/** Pages anyone can open: sign in, sign up, and read-only shared plans (/plan/<id>). */
function isPublic(path: string) {
  return path === "/login" || path === "/signup" || path.startsWith("/plan/");
}

/**
 * Keeps the app behind login: signed-out visitors are sent to /login.
 * The API routes check the login again on the server, so this is not the only lock.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const { status } = useAuth();

  const open = isPublic(path);
  // The home page doubles as the public landing page for signed-out visitors.
  const needsLogin = !open && path !== "/" && status === "anon";

  useEffect(() => {
    if (needsLogin) router.replace("/login");
  }, [needsLogin, router]);

  if (open) return <>{children}</>;
  if (status === "loading" || needsLogin) return <Loading />;

  return (
    <>
      {children}
      {status === "user" && <ChatWidget />}
    </>
  );
}
