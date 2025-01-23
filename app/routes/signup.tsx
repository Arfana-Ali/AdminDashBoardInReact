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

import { motion } from "motion/react"

export default function signup() {
  return (
    <div className="w-full h-screen overflow-hidden flex bg-gray-900">
      <div className="bg-white w-[2800px] h-[1190px] mt-[-20px] relative right-[-45rem]"></div>
      <motion.div
        className="flex flex-col"
        variants={{
          hidden: { opacity: 0, x: 100 },
          visible: { opacity: 1, x: 0 },
        }}
        initial="hidden"
        animate="visible"
        transition={{ duration: 1, delay: 0.5 }}
      >
        <p className="text-orange-500 relative mt-[20rem] font-bold right-[-15rem] text-7xl w-[20rem] ">
          Welcome
        </p>
        <p className="text-orange-500 relative mt-[2rem] font-bold right-[-22rem] text-7xl ">
          To{" "}
        </p>
        <p className="text-gray-900 relative mt-[2rem] font-bold right-[-18rem] text-7xl ">
          Afford Motors
        </p>
      </motion.div>
      <motion.div
        className="mt-[20rem] relative right-[50rem]"
        variants={{
          hidden: { opacity: 0, x: -100 },
          visible: { opacity: 1, x: 0 },
        }}
        initial="hidden"
        animate="visible"
        transition={{ duration: 1, delay: 0.5 }}
      >
        <Card className="w-[400px] bg-transparent text-white">
          <CardHeader>
            <CardTitle className="mx-auto text-center">Signup</CardTitle>
          </CardHeader>
          <CardContent>
            <Form method="post">
              <div className="grid w-full items-center gap-4">
                <div className="flex space-x-1.5">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="First Name"
                      name="firstName"
                    />
                  </div>
                  <div>
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
                  <Input id="username" placeholder="Username" name="username" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" name="password" />
                </div>
                <div className="flex items-center gap-4">
                  <Label htmlFor="city">Working City</Label>
                  <div>
                    <Select name="city">
                      <SelectTrigger className="w-[200px] ml-10 border border-l-white">
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
                </div>
                <Button className="bg-orange-600" type="submit">
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
