import type { RequestHandler, RequestEvent } from "@sveltejs/kit";

export const chain =
  (...handlers: RequestHandler[]): RequestHandler =>
  async (event: RequestEvent) => {
    for (const handler of handlers) {
      const rs = await handler(event);
      if (rs) {
        return rs;
      }
    }
  };
