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
    skip: (Number.parseInt(page) - 1) * Number.parseInt(perPage),
    take: Number.parseInt(perPage),
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

  const totalPages = Math.ceil(total / Number.parseInt(perPage)); // Calculate total pages

  const handleDownloadTasks = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(downloadingTotalTasks);

    XLSX.utils.book_append_sheet(wb, ws, "TaskSheet");
    XLSX.writeFile(wb, "UserPendingTasksData.xlsx");
  };

  return (
    <div className="flex bg-gray-900 h-screen w-full overflow-hidden max-sm:flex-col max-sm:h-auto">
      {/* Sidebar */}
      <div className="flex flex-col gap-4 w-[15rem] md:w-[16rem] lg:w-[20rem] xl:w-[22rem] overflow-hidden max-sm:w-full max-sm:h-44 max-sm:grid max-sm:grid-cols-3 max-sm:grid-rows-2">
        {/* Logo and title */}
        <motion.div
          className="flex max-sm:gap-2 sm:gap-2 md:gap-1 lg:gap-3 w-full justify-center items-center mt-8 max-sm:col-span-2 max-sm:m-4 max-sm:justify-start"
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
            className="max-sm:w-[36px] max-sm:h-[36px] sm:w-[28px] sm:h-[28px] md:w-[33px] md:h-[33px] xl:w-[40px] xl:h-[40px]"
          />
          <h1 className="text-orange-600 font-bold tracking-tighter max-sm:text-2xl sm:text-xl md:text-2xl xl:text-4xl">
            Afford Motors
          </h1>
        </motion.div>

        {/* User welcome section */}
        <div className="h-[300px] flex flex-col gap-4 justify-center items-center max-sm:col-span-3 max-sm:row-start-2 max-sm:h-auto">
          <motion.h1
            className="text-white font-bold tracking-tight sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-3xl max-sm:text-xl"
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
            className="text-white font-bold tracking-wide sm:text-xs md:text-sm xl:text-lg 2xl:text-lg"
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

        {/* Logout button */}
        <motion.div
          className="h-screen flex justify-center items-end mb-12 max-sm:col-span-1 max-sm:h-auto max-sm:m-0 max-sm:justify-center max-sm:self-center max-sm:p-2"
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
              className="bg-orange-500 text-white xl:text-lg 2xl:text-xl max-sm:text-xs max-sm:h-6"
              type="submit"
            >
              Logout
            </Button>
          </Form>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="rounded-l-[50px] w-full overflow-hidden bg-[#F8F8FF] max-sm:rounded-none max-sm:rounded-t-[50px]">
        <div className="mt-[1rem]">
          <div className="flex flex-col ml-8 max-sm:m-3 max-sm:flex max-sm:justify-center max-sm:items-center">
            {/* Task summary cards */}
            <div className="grid grid-cols-4 sm:gap-1 md:gap-4 w-[95%] mb-2 max-sm:grid max-sm:grid-cols-2 max-sm:grid-rows-2">
              {/* Total Tasks Card */}
              <motion.div
                className="grid h-32 sm:px-0 py-2 max-sm:p-1"
                variants={{
                  hidden: { opacity: 0, y: -100 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 1, delay: 0.5 }}
              >
                <Card className="bg-gradient-to-r from-[#26218c] to-[#6f64e2] max-sm:min-w-0">
                  <CardHeader className="sm:p-4 md:p-4 lg:p-4">
                    <CardTitle className="text-center text-white 2xl:text-2xl">
                      Total Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardDescription>
                    <p className="text-center mb-4 md:text-2xl lg:text-4xl text-orange-400">
                      {totalTaskCount}
                    </p>
                  </CardDescription>
                </Card>
              </motion.div>

              {/* Pending Tasks Card */}
              <motion.div
                className="grid h-32 sm:px-0 py-2 max-sm:p-1"
                variants={{
                  hidden: { opacity: 0, y: -100 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 1, delay: 0.8 }}
              >
                <Card className="bg-gradient-to-r from-[#d7871d] to-[#e4f10c] max-sm:min-w-0">
                  <CardHeader className="sm:p-3 md:p-3 lg:p-4">
                    <CardTitle className="text-center text-white 2xl:text-2xl">
                      Pending Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardDescription>
                    <p className="text-center mb-4 md:text-2xl lg:text-4xl text-white">
                      {pendingTasksCount}
                    </p>
                  </CardDescription>
                </Card>
              </motion.div>

              {/* Completed Tasks Card */}
              <motion.div
                className="grid h-32 sm:px-0 py-2 max-sm:p-1"
                variants={{
                  hidden: { opacity: 0, y: -100 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 1, delay: 1.0 }}
              >
                <Card className="bg-gradient-to-r from-[#82da50] to-[#11a62d] max-sm:min-w-0">
                  <CardHeader className="sm:p-3 md:p-3 lg:p-4">
                    <CardTitle className="text-center text-white 2xl:text-2xl">
                      Completed Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardDescription>
                    <p className="text-center mb-4 md:text-2xl lg:text-4xl text-white">
                      {completedTasksCount}
                    </p>
                  </CardDescription>
                </Card>
              </motion.div>

              {/* Cancelled Tasks Card */}
              <motion.div
                className="grid h-32 sm:px-1 py-2 max-sm:p-1"
                variants={{
                  hidden: { opacity: 0, y: -100 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 1, delay: 1.0 }}
              >
                <Card className="bg-gradient-to-r from-[#e86e6a] to-[#a62511] max-sm:min-w-0">
                  <CardHeader className="sm:p-3 md:p-3 lg:p-4">
                    <CardTitle className="text-center text-white 2xl:text-2xl">
                      Cancelled Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardDescription>
                    <p className="text-center mb-4 md:text-2xl lg:text-4xl text-white">
                      {cancelledTasksCount}
                    </p>
                  </CardDescription>
                </Card>
              </motion.div>
            </div>

            <div className="w-[95%] xl:h-0 border border-black md:mt-0 xl:mt-0 2xl:mt-6"></div>

            <div className="flex flex-col w-full sm:mt-2 md:mt-3 xl:mt-0 2xl:mt-2">
              {/* Download and Pagination */}
              <motion.div
                className="flex xl:mt-2 justify-between w-[95%] max-sm:m-2"
                variants={{
                  hidden: { opacity: 0, x: -100 },
                  visible: { opacity: 1, x: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 1, delay: 0.8 }}
              >
                <Button
                  className="xl:ml-4 2xl:text-lg max-sm:h-6 max-sm:px-1 max-sm:text-sm max-sm:mt-2 max-sm:mx-2"
                  onClick={() => handleDownloadTasks()}
                >
                  Download
                </Button>
                <div className="2xl:text-lg">
                  <Pagination className="max-sm:mx-0">
                    <PaginationContent className="max-sm:gap-0">
                      <PaginationItem>
                        <PaginationPrevious
                          href={`?page=${Math.max(
                            1,
                            Number.parseInt(page) - 1
                          )}`}
                          className="max-sm:px-0"
                        />
                      </PaginationItem>
                      {/* Loop through total pages to create pagination links */}
                      {Array.from({ length: totalPages }, (_, index) => (
                        <PaginationItem key={index + 1}>
                          <PaginationLink
                            href={`?page=${index + 1}`}
                            isActive={index + 1 === Number.parseInt(page)}
                            className="max-sm:w-4 max-sm:pl-1"
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href={`?page=${Math.min(
                            totalPages,
                            Number.parseInt(page) + 1
                          )}`}
                          className="max-sm:p-1.5"
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </motion.div>

              {/* Tasks Table */}
              <motion.div
                className="sm:mt-2 md:mt-2 xl:mt-2 2xl:mt-4 xl:mr-1"
                variants={{
                  hidden: { opacity: 0, y: -100 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 1, delay: 1.0 }}
              >
                <Card className="w-[95%] max-sm:w-auto text-white bg-gray-900 shadow-lg shadow-gray-400 rounded-xl">
                  <CardHeader className="text-center items-center max-sm:p-3 sm:p-2 md:p-2 xl:p-2">
                    <CardTitle className="sm:text-2xl md:text-2xl xl:text-3xl max-sm:text-xl">
                      Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="max-sm:p-2 md:p-1 xl:p-2">
                    {/* Table Of All Pending Tasks */}
                    <Table className="max-sm:text-xs">
                      <TableCaption className="sm:mt-0 md:mt-0 xl:mt-0 xl:px-0">
                        A list of your pending tasks.
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center max-sm:px-1 xl:h-6">
                            Vehicle Number
                          </TableHead>
                          <TableHead className="text-center max-sm:px-1">
                            Owner Name
                          </TableHead>
                          <TableHead className="text-center max-sm:px-1">
                            Owner Phone Number
                          </TableHead>
                          <TableHead className="text-center max-sm:px-1">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userTasksForPagination.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-center sm:py-3 xl:py-0">
                              {item.vehicleNumber.toUpperCase()}
                            </TableCell>
                            <TableCell className="text-center xl:py-0">
                              {item.ownerName}
                            </TableCell>
                            <TableCell className="text-center xl:py-0">
                              {item.ownerPhone}
                            </TableCell>
                            <TableCell className="text-center sm:p-0 xl:py-0">
                              <Popover>
                                <PopoverTrigger className="rounded-xl bg-black w-auto h-auto md:p-2 sm:p-2 xl:m-2 xl:p-2 max-sm:p-2 text-white">
                                  Action
                                </PopoverTrigger>
                                <PopoverContent className="bg-gray-900 w-auto h-auto max-sm:w-50 max-sm:p-2">
                                  <div className="flex gap-4 max-sm:gap-2">
                                    <Button className="bg-gradient-to-b from-[#0093E9] to-[#80D0C7] max-sm:min-w-3">
                                      <Dialog>
                                        <DialogTrigger>Complete</DialogTrigger>
                                        <DialogContent
                                          aria-label="Complete"
                                          className="max-sm:w-[90%] max-sm:p-4"
                                        >
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
                                              <div className="flex gap-4">
                                                <Label className="text-black font-bold m-2 p-2 max-sm:w-[100%]">
                                                  Vehicle Number
                                                </Label>
                                                <Label className="bg-gray-600 rounded-lg text-white font-bold m-2 p-4 w-[250px] text-center max-sm:w-[100%] max-sm:px-2">
                                                  {item.vehicleNumber.toUpperCase()}
                                                </Label>
                                              </div>
                                              <div className="flex gap-4">
                                                <Label className="text-black font-bold m-2 p-2 mr-[30px] max-sm:w-[100%]">
                                                  Owner Name
                                                </Label>
                                                <Label className="bg-gray-600 rounded-lg text-white font-bold m-2 p-4 w-[250px] text-center max-sm:w-[100%] max-sm:px-2">
                                                  {item.ownerName.toUpperCase()}
                                                </Label>
                                              </div>
                                              <div className="flex flex-col gap-4 max-sm:gap-0">
                                                <Label className="text-black font-bold m-2 p-2 max-sm:w-[100%] max-sm:m-0">
                                                  Upload First Image
                                                </Label>
                                                <Input
                                                  type="file"
                                                  name="uploadImage"
                                                  required
                                                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 h-[50px] w-[300px] max-sm:w-[100%] max-sm:p-1"
                                                />
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <div className="flex justify-between w-[500px] max-sm:w-full">
                                                <DialogClose asChild>
                                                  <Button
                                                    type="button"
                                                    variant="destructive"
                                                    className="max-sm:h-7 max-sm:px-2 max-sm:text-sm max-sm:mt-2 max-sm:mx-2"
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
                                                  className="mr-16 max-sm:h-7 max-sm:px-2 max-sm:text-sm max-sm:mt-2 max-sm:mx-2"
                                                >
                                                  Submit
                                                </Button>
                                              </div>
                                            </DialogFooter>
                                          </Form>
                                        </DialogContent>
                                      </Dialog>
                                    </Button>
                                    <Button className="bg-gradient-to-b from-[#f56e6e] to-[#f02b2b] max-sm:min-w-3">
                                      <Dialog>
                                        <DialogTrigger>Cancel</DialogTrigger>
                                        <DialogContent
                                          aria-label="Cancel"
                                          className="max-sm:w-[90%] max-sm:p-4"
                                        >
                                          <DialogHeader>
                                            <DialogTitle className="text-center">
                                              Cancel Task
                                            </DialogTitle>
                                          </DialogHeader>
                                          <Form
                                            method="post"
                                            encType="multipart/form-data"
                                          >
                                            <div className="flex flex-col gap-2 justify-between">
                                              <div className="flex gap-4">
                                                <Label className="text-black font-bold m-2 p-2 max-sm:w-[100%]">
                                                  Vehicle Number
                                                </Label>
                                                <Label className="bg-gray-600 rounded-lg text-white font-bold m-2 p-4 w-[250px] text-center max-sm:w-[100%] max-sm:px-2">
                                                  {item.vehicleNumber.toUpperCase()}
                                                </Label>
                                              </div>
                                              <div className="flex gap-4">
                                                <Label className="text-black font-bold m-2 p-2 mr-[30px] max-sm:w-[100%]">
                                                  Owner Name
                                                </Label>
                                                <Label className="bg-gray-600 rounded-lg text-white font-bold m-2 p-4 w-[250px] text-center max-sm:w-[100%] max-sm:px-2">
                                                  {item.ownerName.toUpperCase()}
                                                </Label>
                                              </div>
                                              <div className="flex flex-col gap-4 max-sm:gap-0">
                                                <Label className="text-black font-bold m-2 p-2 max-sm:w-[100%] max-sm:m-0">
                                                  Upload Image
                                                </Label>
                                                <Input
                                                  type="file"
                                                  name="uploadImage"
                                                  required
                                                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 h-[50px] w-[300px] max-sm:w-[100%] max-sm:p-1"
                                                />
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <div className="flex justify-between w-[500px] max-sm:w-full">
                                                <DialogClose asChild>
                                                  <Button
                                                    type="button"
                                                    variant="destructive"
                                                    className="max-sm:h-7 max-sm:px-2 max-sm:text-sm max-sm:mt-2 max-sm:mx-2"
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
                                                  className="mr-16 max-sm:h-7 max-sm:px-2 max-sm:text-sm max-sm:mt-2 max-sm:mx-2"
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
      .upload_stream({}, (error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      })
      .end(buffer);
  });

  const fileResponse = fileResponseFromCloudinary as { secure_url: string };
  const fileSecureUrl = fileResponse.secure_url;

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
