import { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "~/utils/db";
import { requireUser } from "~/utils/gaurds.server";

import { motion } from "framer-motion";

import { redirect, useLoaderData, Form as F, Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableHeader,
  TableBody,
} from "~/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogClose,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { Input } from "~/components/ui/input";

// File download import
import * as XLSX from "xlsx";

// Loader function
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const loggedinUser = await requireUser(request);

  if (!loggedinUser) {
    return redirect("/login");
  }

  // Pagination query
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  const perPage = url.searchParams.get("perPage") || "5";

  const userTasksForPagination = await prisma.tasks.findMany({
    where: { taskStatus: "isCancelled" },
    orderBy: { createdAt: "desc" },
    skip: (parseInt(page) - 1) * parseInt(perPage),
    take: parseInt(perPage),
  });

  const total = await prisma.tasks.count({
    where: { taskStatus: "isComplete" },
  });

  const userTotalTasks = await prisma.tasks.findMany();

  const downloadingTotalTasks = await prisma.tasks.findMany({
    where: { taskStatus: "isCancelled" },
    select: {
      createdAt: true,
      updatedAt: true,
      vehicleNumber: true,
      ownerName: true,
      ownerPhone: true,
    },
  });

  return {
    loggedinUser,
    page,
    perPage,
    userTasksForPagination,
    total,
    userTotalTasks,
    downloadingTotalTasks,
  };
};

export default function CompletedTasks() {
  const data = useLoaderData<typeof loader>();

  const {
    loggedinUser,
    userTasksForPagination,
    page,
    perPage,
    total,
    userTotalTasks,
    downloadingTotalTasks,
  } = data;

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

  // File download function
  const handleDownloadTasks = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(downloadingTotalTasks);

    XLSX.utils.book_append_sheet(wb, ws, "TaskSheet");
    XLSX.writeFile(wb, "CancelledTasksData.xlsx");
  };

  if (loggedinUser && loggedinUser.role === "MODERATOR") {
    return (
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
                  <CardTitle className="text-center text-black">
                    Pending Tasks
                  </CardTitle>
                </CardHeader>
                <CardDescription>
                  <p className="text-center mb-4 text-4xl text-black">
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
                  <CardTitle className="text-center text-4xl ">Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Table Of All Cancelled Tasks */}
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="bg-black text-white"
                                >
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                  <DialogTitle className="text-center">
                                    Completed Task
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="vehicleNumber"
                                      className="text-right w-fit"
                                    >
                                      Vehicle Number
                                    </Label>
                                    <Input
                                      id="vehicleNumber"
                                      value={item.vehicleNumber.toUpperCase()}
                                      readOnly={true}
                                      className="col-span-3 text-center"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="ownerName"
                                      className="text-right"
                                    >
                                      Owner Name
                                    </Label>
                                    <Input
                                      id="ownerName"
                                      value={item.ownerName.toUpperCase()}
                                      readOnly={true}
                                      className="col-span-3 text-center"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="ownerPhone"
                                      className="text-right"
                                    >
                                      Owner Phone Number
                                    </Label>
                                    <Input
                                      id="ownerName"
                                      value={item.ownerPhone.toUpperCase()}
                                      readOnly={true}
                                      className="col-span-3 text-center"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="submittedImage"
                                      className="text-right"
                                    >
                                      Attachments
                                    </Label>
                                    <Link
                                      to={item.uploadedImage}
                                      id="uploadedImage"
                                      className="col-span-3 text-center w-[200px] m-2 p-2 underline text-blue-500"
                                    >
                                      Uploaded Image
                                    </Link>
                                  </div>
                                </div>
                                <DialogClose asChild>
                                  <Button>Close</Button>
                                </DialogClose>
                              </DialogContent>
                            </Dialog>
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
    );
  } else {
    return redirect("/login");
  }
}
