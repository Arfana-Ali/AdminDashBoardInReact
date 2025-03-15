import { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "~/utils/db";
import { requireUser } from "~/utils/gaurds.server";
import { motion } from "motion/react";
import { redirect, useLoaderData, Link } from "@remix-run/react";
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
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
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

// Loader function to run at the start of loading of the page

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
    where: { taskStatus: "isComplete" },
    orderBy: { createdAt: "desc" },
    skip: (parseInt(page) - 1) * parseInt(perPage),
    take: parseInt(perPage),
  });

  const total = await prisma.tasks.count({
    where: { taskStatus: "isComplete" },
  });

  const userTotalTasks = await prisma.tasks.findMany();

  const downloadingTotalTasks = await prisma.tasks.findMany({
    where: { taskStatus: "isComplete" },
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
    XLSX.writeFile(wb, "CompletedTasksData.xlsx");
  };

  if (loggedinUser && loggedinUser.role === "MODERATOR") {
    return (
      <div className="mt-[1rem] ">
        <div className="flex flex-col ml-8">
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

          {/* Divider */}
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
                        href={`?page=${Math.max(1, Number.parseInt(page) - 1)}`}
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
                  <Table>
                    <TableCaption className="sm:mt-0 md:mt-0 xl:mt-0 xl:px-0">
                      A list of all completed tasks.
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center  xl:h-6">
                          Vehicle Number
                        </TableHead>
                        <TableHead className="text-center  ">
                          Owner Name
                        </TableHead>
                        <TableHead className="text-center  ">
                          Owner Phone Number
                        </TableHead>
                        <TableHead className="text-center  ">Action</TableHead>
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
                          <TableCell className="border-none text-center text-white py-2 border">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="bg-gradient-to-r to-gray-800 text-white hover:from-gray-600 hover:to-gray-700 px-4 py-2 rounded-lg"
                                >
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px] bg-gray-900 text-white rounded-2xl shadow-lg">
                                <DialogHeader>
                                  <DialogTitle className="text-center text-2xl font-semibold">
                                    Completed Task
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="vehicleNumber"
                                      className="text-right text-gray-300 font-medium"
                                    >
                                      Vehicle Number
                                    </Label>
                                    <Input
                                      id="vehicleNumber"
                                      value={item.vehicleNumber.toUpperCase()}
                                      readOnly={true}
                                      className="col-span-3 text-center bg-gray-800 text-gray-300 border border-gray-600 rounded-lg"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="ownerName"
                                      className="text-right text-gray-300 font-medium"
                                    >
                                      Owner Name
                                    </Label>
                                    <Input
                                      id="ownerName"
                                      value={item.ownerName.toUpperCase()}
                                      readOnly={true}
                                      className="col-span-3 text-center bg-gray-800 text-gray-300 border border-gray-600 rounded-lg"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="ownerPhone"
                                      className="text-right text-gray-300 font-medium"
                                    >
                                      Owner Phone Number
                                    </Label>
                                    <Input
                                      id="ownerPhone"
                                      value={item.ownerPhone.toUpperCase()}
                                      readOnly={true}
                                      className="col-span-3 text-center bg-gray-800 text-gray-300 border border-gray-600 rounded-lg"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="uploadedImage"
                                      className="text-right text-gray-300 font-medium"
                                    >
                                      Attachments
                                    </Label>
                                    <Link
                                      to={item.uploadedImage || "#"}
                                      id="uploadedImage"
                                      className="col-span-3 text-center underline text-blue-400 hover:text-blue-600"
                                    >
                                      Uploaded Image
                                    </Link>
                                  </div>
                                </div>
                                <DialogClose asChild>
                                  <Button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                                    Close
                                  </Button>
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
