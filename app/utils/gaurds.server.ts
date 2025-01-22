import { redirect } from "@remix-run/node";
import { getUserIdFromSession } from "./session.server";
import prisma from "./db";

export const requireUser = async (request: Request) => {
  const userId = await getUserIdFromSession(request);


  if (!userId) {
    throw redirect("/login");
  }

  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw redirect("/login");
  }
  return user;
};
