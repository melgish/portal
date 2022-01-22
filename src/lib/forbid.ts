import type { RequestEvent } from "@sveltejs/kit";
import type { Locals } from "$lib/models/locals";

export const FORBIDDEN = { status: 403, body: { message: "Forbidden" } };

export const forbid = async ({ locals }: RequestEvent<Locals>) => {
  if (!locals.authenticated) {
    return FORBIDDEN;
  }
};
