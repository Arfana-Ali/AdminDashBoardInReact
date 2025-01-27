import { ActionFunctionArgs } from "@remix-run/node";
import { Form, Link, redirect } from "@remix-run/react";
import prisma from "~/utils/db";
import bcrypt from "bcryptjs";

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

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

// Animation imports

import { motion } from "motion/react";

export default function signup() {
  return (
    <div className="w-full h-screen flex justify-center items-center md:flex  md:flex-row bg-gray-900 ">
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
            Welcome
          </p>
          <p className="text-orange-500 text-center font-bold text-4xl md:text-6xl lg:text-7xl mb-4">
            To
          </p>
          <p className="text-gray-900 text-center font-bold text-4xl md:text-5xl lg:text-7xl mb-4">
            Afford Motors
          </p>
        </motion.div>
      </div>
      <div className="w-full h-1/2 md:w-[50%] md:h-full flex items-center justify-center bg-grey-900">
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
              <CardTitle className="mx-auto text-center">Signup</CardTitle>
            </CardHeader>
            <CardContent>
              <Form method="post">
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col md:flex-row space-y-1.5 md:space-y-0 md:space-x-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="First Name"
                        name="firstName"
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Last Name"
                        name="lastName"
                      />
                    </div>
                  </div>
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
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="city">Working City</Label>
                    <Select name="city">
                      <SelectTrigger className="w-full border border-l-white">
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 text-white">
                        <SelectGroup>
                          <SelectLabel>Cities</SelectLabel>
                          <SelectItem value="jabalpur">Jabalpur</SelectItem>
                          <SelectItem value="bhopal">Bhopal</SelectItem>
                          <SelectItem value="gwalior">Gwalior</SelectItem>
                          <SelectItem value="sagar">Sagaur</SelectItem>
                          <SelectItem value="indore">Indore</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="bg-orange-600 hover:bg-orange-700"
                    type="submit"
                  >
                    Signup
                  </Button>
                </div>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <p className="mt-2">
                Already Have An Account?
                <span className="ml-2">
                  <Link
                    to={"/login"}
                    className="underline text-md font-bold text-orange-500"
                  >
                    Login
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

  const firstName = String(formData.get("firstName"));
  const lastName = String(formData.get("lastName"));
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));
  const city = String(formData.get("city"));

  // hash password

  const hashedPassword = await bcrypt.hash(password, 10);

  // create user in database

  const createUser = await prisma.users.create({
    data: {
      firstName: firstName,
      lastName: lastName,
      username: username,
      password: hashedPassword,
      city: city,
    },
  });

  if (createUser) {
    return redirect("/login");
  }
}
