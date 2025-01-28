import { ActionFunctionArgs } from "@remix-run/node";
import { Form, Link, redirect } from "@remix-run/react";
import prisma from "~/utils/db";
import bcrypt from "bcryptjs";
import { storeUserInSession } from "~/utils/session.server";

// Card from shadcn

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

// Animation imports

import { motion } from "motion/react";

export default function login() {
  return (
    <div className="w-full h-screen flex justify-center items-center md:flex  md:flex-row bg-gray-900">
      <div className="bg-white hidden md:flex md:w-[50%]  md:h-full  justify-center items-center relative">
        <motion.div
          className="w-full max-w-sm px-4 md:max-w-md lg:max-w-lg"
          variants={{
            hidden: { opacity: 0, x: 200 },
            visible: { opacity: 1, x: 0 },
          }}
          initial="hidden"
          animate="visible"
          transition={{ duration: 1, delay: 0.5 }}
        >
          <p className="text-orange-500 text-center font-bold text-4xl md:text-6xl lg:text-7xl mb-4">
            Login
          </p>
          <p className="text-orange-500 text-center font-bold text-4xl md:text-6xl lg:text-7xl mb-4">
            To
          </p>
          <p className="text-gray-900 text-center font-bold text-4xl md:text-5xl lg:text-7xl mb-4">
            Afford Motors
          </p>
        </motion.div>
      </div>
      <div className="w-full h-1/2 md:w-[50%] md:h-full flex items-center justify-center bg-grey-900 ">
        <motion.div
          className="w-full max-w-md px-4"
          variants={{
            hidden: { opacity: 0, x: -200 },
            visible: { opacity: 1, x: 0 },
          }}
          initial="hidden"
          animate="visible"
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Card className="w-full max-w-sm md:max-w-md lg:max-w-lg bg-transparent text-white">
            <CardHeader>
              <CardTitle className="mx-auto           text-center">
                Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form method="post">
                <div className="  grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Username"
                      name="username"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" name="password" />
                  </div>
                  <Button
                    className="bg-orange-600 hover:bg-orange-600"
                    type="submit"
                  >
                    Login
                  </Button>
                </div>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <p className="mt-2">
                No Account Yet?
                <span className="ml-2">
                  <Link
                    to={"/signup"}
                    className="underline text-md font-bold text-orange-500"
                  >
                    Sign Up
                  </Link>
                </span>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");

  // check if username exists in db

  const checkExistingUser = await prisma.users.findUnique({
    where: {
      username: username as string,
    },
  });

  // If no user is found return them to signup page

  if (!checkExistingUser) {
    return redirect("/signup");
  }

  // If user is found redirect them based on roles
  if (checkExistingUser) {
    const checkPassword = await bcrypt.compare(
      password as string,
      checkExistingUser.password
    );

    if (checkPassword) {
      const sessionHeader = await storeUserInSession(checkExistingUser);

      const role = checkExistingUser.role;

      switch (role) {
        case "ADMIN":
          return redirect("/dashboard/admin", {
            headers: {
              "Set-Cookie": sessionHeader,
            },
          });
        case "USER":
          return redirect("/dashboard/users", {
            headers: {
              "Set-Cookie": sessionHeader,
            },
          });
        case "MODERATOR":
          return redirect("/dashboard/moderator/createTasks", {
            headers: {
              "Set-Cookie": sessionHeader,
            },
          });
        default:
          break;
      }
    }
  }

  return checkExistingUser;
}
