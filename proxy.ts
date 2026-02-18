import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/auth", "/agenda"];

export async function proxy(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Refrescar la sesión — getUser() valida el token con el servidor
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // Usuario NO autenticado intentando acceder a ruta protegida → redirigir a /auth
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // Usuario autenticado en /auth → redirigir a /dashboard
  if (user && pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
