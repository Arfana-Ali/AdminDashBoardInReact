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
    <div className="w-full h-screen overflow-hidden flex bg-gray-900">
      <div className="hidden sm:inline-block sm:bg-white sm:w-[2400px] sm:h-[1190px] sm:mt-[-20px] sm:relative sm:left-[-10rem]"></div>
      <motion.div
        className="hidden sm:flex sm:flex-col"
        variants={{
          hidden: { opacity: 0, x: 100 },
          visible: { opacity: 1, x: 0 },
        }}
        initial="hidden"
        animate="visible"
        transition={{ duration: 1, delay: 0.5 }}
      >
        <p className="text-orange-500 relative mt-[18rem] font-bold left-[-38rem] text-7xl ">
          Login
        </p>
        <p className="text-orange-500 relative mt-[2rem] font-bold left-[-35rem] text-7xl ">
          To
        </p>
        <p className="text-gray-900 relative mt-[2rem] font-bold left-[-40rem] text-7xl ">
          Afford Motors
        </p>
      </motion.div>
      <motion.div
        className="mt-[20rem] ml-[5rem]  sm:mt-[20rem] sm:relative sm:left-[-15rem]"
        variants={{
          hidden: { opacity: 0, x: -200 },
          visible: { opacity: 1, x: 0 },
        }}
        initial="hidden"
        animate="visible"
        transition={{ duration: 1, delay: 0.5 }}
      >
        <Card className="w-[400px] h-[500px] bg-transparent text-white sm:w-[350px] sm:h-[320px] sm:bg-transparent sm:text-white">
          <CardHeader>
            <CardTitle className="mx-auto text-center text-5xl sm:text-xl">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Form method="post">
              <div className="flex flex-col gap-[4rem] sm:grid sm:w-full sm:items-center sm:gap-4">
                <div className="flex flex-col text-center sm:space-y-1.5 sm:text-start">
                  <Label htmlFor="username" className="font-bold text-2xl mt-[2rem] sm:font-medium sm:text-sm sm:mt-0">Username</Label>
                  <Input id="username" placeholder="Username" name="username"  />
                </div>
                <div className="flex flex-col text-center sm:space-y-1.5 sm:text-start">
                  <Label htmlFor="password" className="font-bold text-2xl sm:font-medium sm:text-sm">Password</Label>
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
