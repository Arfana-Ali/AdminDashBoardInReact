import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUser } from "~/utils/gaurds.server";
import {
  redirect,
  useLoaderData,
  useSubmit,
  Form as F,
  useActionData,
  Link,
  Outlet,
} from "@remix-run/react";

import { FormDataSchema } from "~/lib/schema";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import prisma from "~/utils/db";
import { Button } from "~/components/ui/button";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { toast } from "sonner";

type FormData = z.infer<typeof FormDataSchema>;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const loggedinUser = await requireUser(request);

  if (!loggedinUser) {
    return redirect("/login");
  }

  const usersOptions = await prisma.users.findMany({
    where: {
      role: "USER",
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      city: true,
    },
  });

  const selectCities = ["bhopal", "indore", "jabalpur", "gwalior", "sagaur"];

  const citiesWithUsersOption = usersOptions.reduce((acc: any, user) => {
    if (!acc[user.city]) acc[user.city] = [];
    acc[user.city].push(user);
    return acc;
  }, {});

  return { loggedinUser, citiesWithUsersOption, selectCities };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.json();

  if (formData) {
    const createdTask = await prisma.tasks.create({
      data: {
        vehicleNumber: formData.vehicleNumber,
        ownerName: formData.ownerName,
        ownerPhone: formData.ownerPhone,
        selectCities: formData.selectedCity,
        authorId: formData.selectEmployee,
      },
    });

    if (createdTask) {
      const toastMessage = "Task created sucessfully";
      return { toastMessage, success: true };
    }
    if (!createdTask) {
      const toastMessage =
        "Something went wrong. Please try again after sometime.";
      return { toastMessage, success: false };
    }
  }
};

export default function ModeratorPage() {
  const data = useLoaderData<typeof loader>();
  const { loggedinUser, citiesWithUsersOption, selectCities } = data;

  const form = useForm<z.infer<typeof FormDataSchema>>({
    resolver: zodResolver(FormDataSchema),
    defaultValues: {
      vehicleNumber: "",
      ownerName: "",
      ownerPhone: "",
      selectCities: "",
      selectEmployee: "",
    },
  });

  // handeling toast notification
  const actionData = useActionData<typeof action>();
  const toastMessage = actionData?.toastMessage;
  const success = actionData?.success;

  useEffect(() => {
    if (toastMessage && success === true) {
      toast.success(toastMessage, { duration: 5000 });
      window.location.reload();
    } else toast.error(toastMessage, { duration: 5000 });
  }, [toastMessage]);

  const selectedCity = form.watch("selectCities");
  const availableEmployees = selectedCity
    ? citiesWithUsersOption[selectedCity] || []
    : [];

  const submit = useSubmit();

  const onSubmit = async (data: FormData) => {
    await submit(
      {
        vehicleNumber: data.vehicleNumber,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        selectedCity: data.selectCities,
        selectEmployee: data.selectEmployee,
      },
      { method: "POST", encType: "application/json" }
    );
  };

  if (loggedinUser.role === "MODERATOR") {
    return (
      <div className="flex bg-gray-900 h-screen w-full overflow-hidden">
        <div className="flex flex-col gap-4 w-[400px]">
          <motion.div
            className="flex gap-4 w-full items-center mt-[3.2rem] ml-[2rem]"
            variants={{
              hidden: { opacity: 0, x: -200 },
              visible: { opacity: 1, x: 0 },
            }}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            <img
              alt="logo"
              src="https://affordmotors.com/loan-recovery/assets/admin/dist/img/logo-new.png"
              className="w-[33px] h-[33px] ml-[20px]"
            />
            <h1 className="text-4xl text-orange-600 font-bold tracking-tighter">
              Afford Motors
            </h1>
          </motion.div>
          <div className="mt-[5rem] ml-[6rem] flex flex-col gap-4">
            <motion.h1
              className="text-white font-bold tracking-tight text-2xl"
              variants={{
                hidden: { opacity: 0, x: -200 },
                visible: { opacity: 1, x: 0 },
              }}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Welcome {loggedinUser.firstName}
            </motion.h1>
            <motion.h3
              className="text-white font-bold tracking-wide relative left-[-1.3rem]"
              variants={{
                hidden: { opacity: 0, x: -200 },
                visible: { opacity: 1, x: 0 },
              }}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.8, delay: 1 }}
            >
              Working City : {loggedinUser.city.toUpperCase()}
            </motion.h3>
          </div>
          <div className="mt-[4rem] text-white text-2xl relative  text-center flex flex-col gap-4">
            <Button className="m-2 p-2 rounded-lg text-2xl " variant="ghost">
              <Link to="/dashboard/moderator/createTasks">Create Tasks</Link>
            </Button>
            <Button className="m-2 p-2 rounded-lg text-2xl" variant="ghost">
              <Link to="/dashboard/moderator/completedTasks">
                Completed Tasks
              </Link>
            </Button>
            <Button className="m-2 p-2 rounded-lg text-2xl " variant="ghost">
              <Link to="/dashboard/moderator/cancelledTasks">
                Cancelled Tasks
              </Link>
            </Button>
          </div>
          <motion.div
            className="relative bottom-[-38rem] ml-[4rem]"
            variants={{
              hidden: { opacity: 0, x: -200 },
              visible: { opacity: 1, x: 0 },
            }}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <F method="POST" action="/logout">
              <Button
                className="ml-[4rem]  bg-orange-500 text-white"
                type="submit"
              >
                Logout
              </Button>
            </F>
          </motion.div>
        </div>
        <div className="rounded-l-[100px] h-screen w-full overflow-hidden bg-[#F8F8FF] relative right-[-2rem]">
          <Outlet />
        </div>
      </div>
    );
  } else {
    return redirect("/login");
  }
}
