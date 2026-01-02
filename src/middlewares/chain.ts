import { NextResponse, NextRequest, NextFetchEvent } from "next/server";

export type Middleware = (
  req: NextRequest,
  event: NextFetchEvent,
  next: () => Promise<NextResponse>
) => Promise<NextResponse | void>;

export async function middlewareChain(
  middlewares: Middleware[],
  req: NextRequest,
  event: NextFetchEvent,
  index = 0
): Promise<NextResponse> {
  const currentMiddleware = middlewares[index];
  if (!currentMiddleware) {
    return NextResponse.next();
  }

  const result = await currentMiddleware(req, event, () =>
    middlewareChain(middlewares, req, event, index + 1)
  );

  return (result as NextResponse) || NextResponse.next();
}
