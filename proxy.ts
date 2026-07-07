import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/booking(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  // /claim/[token] and /chat/[chatId] are intentionally NOT gated by Clerk —
  // claimed members authenticate via the burned-invite session cookie instead,
  // and /chat itself decides admin-vs-member view server-side (see page.tsx).
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
