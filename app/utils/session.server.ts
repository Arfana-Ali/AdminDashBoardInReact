import { Users } from "@prisma/client";
import { createCookieSessionStorage } from "@remix-run/node";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is not defined");
}

const { commitSession, destroySession, getSession } =
  createCookieSessionStorage({
    cookie: {
      name: "afford_session",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 1,
      path: "/",
      httpOnly: true,
      secrets: [process.env.SESSION_SECRET],
      secure: process.env.NODE_ENV === "production",
    },
  });

export const storeUserInSession = async (user: Pick<Users, "id">) => {
  const session = await getSession();
  session.set("userId", user.id);
  const header = await commitSession(session);
  return header;
};

export const getUserIdFromSession = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  return userId;
};

export { getSession, destroySession };
