import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, redirect, useActionData, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/gaurds.server";

// Ui Imports
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import { Button } from "~/components/ui/button";

// Animation imports

import { motion } from "motion/react";
import prisma from "~/utils/db";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import { useEffect } from "react";
import { Input } from "~/components/ui/input";

// Excel function imports
import * as XLSX from "xlsx";

// File upload imports
import { v2 as cloudinary } from "cloudinary";

// Loader function to load data when page loads
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  const perPage = url.searchParams.get("perPage") || "5";

  const userTasksForPagination = await prisma.tasks.findMany({
    where: { authorId: user.id, taskStatus: "isPending" },
    orderBy: { createdAt: "desc" },
    skip: (parseInt(page) - 1) * parseInt(perPage),
    take: parseInt(perPage),
  });

  const userTotalTasks = await prisma.tasks.findMany({
    where: { authorId: user.id },
  });

  const total = await prisma.tasks.count({
    where: { authorId: user.id },
  });

  const downloadingTotalTasks = await prisma.tasks.findMany({
    where: { authorId: user.id, taskStatus: "isPending" },
    select: {
      createdAt: true,
      updatedAt: true,
      vehicleNumber: true,
      ownerName: true,
      ownerPhone: true,
    },
  });

  return {
    user,
    userTotalTasks,
    userTasksForPagination,
    page,
    perPage,
    total,
    downloadingTotalTasks,
  };
};

// UsersPage to display content in page
export default function UsersPage() {
  const data = useLoaderData<typeof loader>();

  // handeling toast notification
  const actionData = useActionData<typeof action>();
  const toastMessage = actionData?.toastMessage;
  const success = actionData?.success;

  useEffect(() => {
    if (toastMessage) {
      if (success) {
        toast.success(toastMessage, { duration: 5000 });
      } else {
        toast.error(toastMessage, { duration: 5000 });
      }
    }
  }, [toastMessage, success]);

  const {
    user,
    userTotalTasks,
    userTasksForPagination,
    page,
    perPage,
    total,
    downloadingTotalTasks,
  } = data;

  if (!user || user.role !== "USER") {
    throw redirect("/login");
  }

  // Total tasks from userTasks
  const totalTaskCount = userTotalTasks.length;

  const pendingTasksCount = userTotalTasks.filter(
    (task) => task.taskStatus === "isPending"
  ).length;

  const completedTasksCount = userTotalTasks.filter(
    (task) => task.taskStatus === "isComplete"
  ).length;

  const cancelledTasksCount = userTotalTasks.filter(
    (task) => task.taskStatus === "isCancelled"
  ).length;

  const totalPages = Math.ceil(total / parseInt(perPage)); // Calculate total pages

  const handleDownloadTasks = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(downloadingTotalTasks);

    XLSX.utils.book_append_sheet(wb, ws, "TaskSheet");
    XLSX.writeFile(wb, "UserPendingTasksData.xlsx");
  };

  // Display toast if exists

  return (
    <div className="flex bg-gray-900 h-screen w-full overflow-hidden absolute">
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
            Welcome {user.firstName}
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
            Working City : {user.city.toUpperCase()}
          </motion.h3>
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
          <Form method="post" action="/logout">
            <Button
              className="ml-[4rem]  bg-orange-500 text-white"
              type="submit"
            >
              Logout
            </Button>
          </Form>
        </motion.div>
      </div>
      <div className="rounded-l-[100px] h-screen w-full overflow-hidden bg-[#F8F8FF] relative right-[-2rem]">
        <div className="relative mt-[10rem] ">
          <div className="flex flex-col ml-8">
            <div className="grid grid-cols-4">
              <motion.div
                className="grid"
                variants={{
                  hidden: { opacity: 0, y: -100 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 1, delay: 0.5 }}
              >
                <Card className="w-[300px] bg-gradient-to-r from-[#26218c] to-[#6f64e2]">
                  <CardHeader>
                    <CardTitle className="text-center text-white">
                      Total Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardDescription>
                    <p className="text-center mb-4 text-4xl text-orange-400">
                      {totalTaskCount}
                    </p>
                  </CardDescription>
                </Card>
              </motion.div>
              <motion.div
                className="grid"
                variants={{
                  hidden: { opacity: 0, y: -100 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 1, delay: 0.8 }}
              >
                <Card className="w-[300px] bg-gradient-to-r from-[#d7871d] to-[#e4f10c]">
                  <CardHeader>
                    <CardTitle className="text-center text-white">
                      Pending Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardDescription>
                    <p className="text-center mb-4 text-4xl text-white">
                      {pendingTasksCount}
                    </p>
                  </CardDescription>
                </Card>
              </motion.div>
              <motion.div
                className="grid mr-[4rem]"
                variants={{
                  hidden: { opacity: 0, y: -100 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 1, delay: 1.0 }}
              >
                <Card className="w-[300px] bg-gradient-to-r from-[#82da50] to-[#11a62d]">
                  <CardHeader>
                    <CardTitle className="text-center text-white">
                      Completed Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardDescription>
                    <p className="text-center mb-4 text-4xl text-white">
                      {completedTasksCount}
                    </p>
                  </CardDescription>
                </Card>
              </motion.div>
              <motion.div
                className="grid mr-[4rem]"
                variants={{
                  hidden: { opacity: 0, y: -100 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 1, delay: 1.0 }}
              >
                <Card className="w-[300px] bg-gradient-to-r from-[#e86e6a] to-[#a62511]">
                  <CardHeader>
                    <CardTitle className="text-center text-white">
                      Cancelled Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardDescription>
                    <p className="text-center mb-4 text-4xl text-white">
                      {cancelledTasksCount}
                    </p>
                  </CardDescription>
                </Card>
              </motion.div>
            </div>
            <div className="w-[90%] h-0 border border-black mt-4 ml-4"></div>
            <div className="flex flex-col ml-8">
              <motion.div
                className="flex mt-4 justify-evenly"
                variants={{
                  hidden: { opacity: 0, x: -100 },
                  visible: { opacity: 1, x: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 1, delay: 0.8 }}
              >
                <Button
                  className="relative left-[-9rem]"
                  onClick={() => handleDownloadTasks()}
                >
                  Download
                </Button>
                <div className="relative right-[-5rem]">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href={`?page=${Math.max(1, parseInt(page) - 1)}`}
                        />
                      </PaginationItem>
                      {/* Loop through total pages to create pagination links */}
                      {Array.from({ length: totalPages }, (_, index) => (
                        <PaginationItem key={index + 1}>
                          <PaginationLink
                            href={`?page=${index + 1}`}
                            isActive={index + 1 === parseInt(page)}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href={`?page=${Math.min(
                            totalPages,
                            parseInt(page) + 1
                          )}`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </motion.div>
              <motion.div
                className="mt-4"
                variants={{
                  hidden: { opacity: 0, y: -100 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 1, delay: 1.0 }}
              >
                <Card className="w-[60rem] text-white bg-gray-900 shadow-lg shadow-gray-400 rounded-xl">
                  <CardHeader className="text-center items-center ">
                    <CardTitle className="text-center text-4xl ">
                      Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Table Of All Pending Tasks */}
                    <Table>
                      <TableCaption>A list of your pending tasks.</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">
                            Vehicle Number
                          </TableHead>
                          <TableHead className="text-center">
                            Owner Name
                          </TableHead>
                          <TableHead className="text-center">
                            Owner Phone Number
                          </TableHead>
                          <TableHead className="text-center">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userTasksForPagination.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-center">
                              {item.vehicleNumber.toUpperCase()}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.ownerName}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.ownerPhone}
                            </TableCell>
                            <TableCell className="text-center">
                              <Popover>
                                <PopoverTrigger className="rounded-xl bg-black w-auto h-auto m-2 p-2 text-white">
                                  Action
                                </PopoverTrigger>
                                <PopoverContent className="bg-gray-900 w-auto h-auto">
                                  <div className="flex gap-4">
                                    <Button className="bg-gradient-to-b from-[#0093E9] to-[#80D0C7]">
                                      <Dialog>
                                        <DialogTrigger>Complete</DialogTrigger>
                                        <DialogContent aria-label="Complete">
                                          <DialogHeader>
                                            <DialogTitle className="text-center">
                                              Complete Task
                                            </DialogTitle>
                                          </DialogHeader>
                                          <Form
                                            method="post"
                                            encType="multipart/form-data"
                                          >
                                            <div className="flex flex-col gap-2 justify-between">
                                              <div className="flex gap-4 ">
                                                <Label className=" text-black font-bold m-2 p-2">
                                                  Vehicle Number
                                                </Label>
                                                <Label className="bg-gray-600 rounded-lg text-white font-bold m-2 p-4 w-[250px] text-center">
                                                  {item.vehicleNumber.toUpperCase()}
                                                </Label>
                                              </div>
                                              <div className="flex gap-4">
                                                <Label className=" text-black font-bold m-2 p-2 mr-[30px]">
                                                  Owner Name
                                                </Label>
                                                <Label className="bg-gray-600 relative rounded-lg text-white font-bold m-2 p-4 w-[250px] text-center">
                                                  {item.ownerName.toUpperCase()}
                                                </Label>
                                              </div>
                                              <div className="flex flex-col gap-4">
                                                <Label className=" text-black font-bold m-2 p-2">
                                                  Upload First Image
                                                </Label>
                                                <Input
                                                  type="file"
                                                  name="uploadImage"
                                                  required={true}
                                                  className="file:mr-4 file:py-2 file:px-4
                                                  file:rounded-full file:border-0
                                                  file:text-sm file:font-semibold
                                                  file:bg-violet-50 file:text-violet-700
                                                  hover:file:bg-violet-100 h-[50px] w-[300px]"
                                                />
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <div className="flex justify-between w-[500px]">
                                                <DialogClose asChild>
                                                  <Button
                                                    type="button"
                                                    variant="destructive"
                                                  >
                                                    Close
                                                  </Button>
                                                </DialogClose>
                                                <input
                                                  type="hidden"
                                                  name="id"
                                                  value={item.id}
                                                />
                                                <Button
                                                  name="_action"
                                                  type="submit"
                                                  value="completeTask"
                                                  className="mr-16"
                                                >
                                                  Submit
                                                </Button>
                                              </div>
                                            </DialogFooter>
                                          </Form>
                                        </DialogContent>
                                      </Dialog>
                                    </Button>
                                    <Button className="bg-gradient-to-b from-[#f56e6e] to-[#f02b2b]">
                                      <Dialog>
                                        <DialogTrigger>Cancel</DialogTrigger>
                                        <DialogContent aria-label="Cancel">
                                          <DialogHeader>
                                            <DialogTitle>
                                              Cancel Task
                                            </DialogTitle>
                                          </DialogHeader>
                                          <Form
                                            method="post"
                                            encType="multipart/form-data"
                                          >
                                            <div className="flex flex-col gap-2 justify-between">
                                              <div className="flex gap-4 ">
                                                <Label className=" text-black font-bold m-2 p-2">
                                                  Vehicle Number
                                                </Label>
                                                <Label className="bg-gray-600 rounded-lg text-white font-bold m-2 p-4 w-[250px] text-center">
                                                  {item.vehicleNumber.toUpperCase()}
                                                </Label>
                                              </div>
                                              <div className="flex gap-4">
                                                <Label className=" text-black font-bold m-2 p-2 mr-[30px]">
                                                  Owner Name
                                                </Label>
                                                <Label className="bg-gray-600 relative rounded-lg text-white font-bold m-2 p-4 w-[250px] text-center">
                                                  {item.ownerName.toUpperCase()}
                                                </Label>
                                              </div>
                                              <div className="flex gap-4">
                                                <Label className=" text-black font-bold m-2 p-2">
                                                  Upload Image
                                                </Label>
                                                <Input
                                                  type="file"
                                                  name="uploadImage"
                                                  required={true}
                                                  className="file:mr-4 file:py-2 file:px-4
                                                  file:rounded-full file:border-0
                                                  file:text-sm file:font-semibold
                                                  file:bg-violet-50 file:text-violet-700
                                                  hover:file:bg-violet-100 h-[50px] w-[300px]"
                                                />
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <div className="flex justify-between w-[500px]">
                                                <DialogClose asChild>
                                                  <Button
                                                    type="button"
                                                    variant="destructive"
                                                  >
                                                    Close
                                                  </Button>
                                                </DialogClose>
                                                <input
                                                  type="hidden"
                                                  name="id"
                                                  value={item.id}
                                                />
                                                <Button
                                                  name="_action"
                                                  type="submit"
                                                  value="cancelTask"
                                                  className="mr-16"
                                                >
                                                  Submit
                                                </Button>
                                              </div>
                                            </DialogFooter>
                                          </Form>
                                        </DialogContent>
                                      </Dialog>
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  // Cloudinary Configuration;
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

  const formData = await request.formData();

  const { _action, ...values } = Object.fromEntries(formData);

  const id = values.id as string;

  const file = values.uploadImage as File;

  const fileData = await file.arrayBuffer();

  const buffer = new Uint8Array(fileData);
  const fileResponseFromCloudinary = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({}, function (error, result) {
        if (error) {
          reject(error);
        }
        resolve(result);
      })
      .end(buffer);
  });

  const fileSecureUrl = fileResponseFromCloudinary.secure_url as string;

  if (_action === "completeTask") {
    // get the upload function from cloudinary which will return a url

    const updateComplete = await prisma.tasks.update({
      where: {
        id: id,
      },
      data: {
        taskStatus: "isComplete",
        uploadedImage: fileSecureUrl,
      },
    });

    if (updateComplete) {
      const toastMessage = "Task is marked complete";
      return { toastMessage, success: true };
    }
    if (!updateComplete) {
      const toastMessage =
        "Something went wrong. Please try again after sometime.";
      return { toastMessage, success: false };
    }

    // reload page
  }

  if (_action === "cancelTask") {
    // Update DB and set isPending = false, isComplete = false and isCancelled = true
    console.log(values.uploadImage);

    // get the upload function from cloudinary which will return a url
    // save this url in database

    const updateCancelled = await prisma.tasks.update({
      where: {
        id: id,
      },
      data: {
        taskStatus: "isCancelled",
        uploadedImage: fileSecureUrl,
      },
    });

    if (updateCancelled) {
      const toastMessage = "Task is cancelled";
      return { toastMessage, success: true };
    }
    if (!updateCancelled) {
      const toastMessage =
        "Something went wrong. Please try again after sometime.";
      return { toastMessage, success: false };
    }
  }
}
