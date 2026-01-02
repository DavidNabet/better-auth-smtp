import type { NextFetchEvent, NextRequest } from "next/server";
import { Middleware, middlewareChain } from "@/middlewares/chain";
import { routeMiddleware } from "@/middlewares/routeMiddleware";
import { authMiddleware } from "@/middlewares/authMiddleware";
/**
 * L'admin a accès à certaines routes, le user non !
 * Pour comparer un admin d'un user, soit on met un userId param, soit on crée un accessToken** encoded qui est stocké dans le cookie et dont le role est soit user soit admin.
 * On peut également créer une fonction custom getSession qui ira cherche le role du userbyid
 *
 * **accessToken** encoded est un token qui est stocké dans le cookie et qui contient le userId, l'email et le role
 * On pourra créer un portage avec une invitation par email d'un user qui pointera sur un magicLink dont le token contient le userId, l'email et le role
 */

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const middlewares: Middleware[] = [routeMiddleware, authMiddleware];

  return middlewareChain(middlewares, req, event);
}

export const config = {
  // exclude routes
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/",
    // "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
