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
      <div className="flex-1 space-y-5 p-3grid gap-6 md:grid-cols-4">
        <div className="flex flex-col mx-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 ">
            {/* grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4" */}
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
              <Card className="w-full bg-gradient-to-r from-[#26218c] to-[#6f64e2] shadow-lg">
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
              <Card className="w-full bg-gradient-to-r from-[#d7871d] to-[#e4f10c] shadow-lg">
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
              className="grid"
              variants={{
                hidden: { opacity: 0, y: -100 },
                visible: { opacity: 1, y: 0 },
              }}
              initial="hidden"
              animate="visible"
              transition={{ duration: 1, delay: 1.0 }}
            >
              <Card className="w-full bg-gradient-to-r from-[#82da50] to-[#11a62d] shadow-lg">
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
              className="grid"
              variants={{
                hidden: { opacity: 0, y: -100 },
                visible: { opacity: 1, y: 0 },
              }}
              initial="hidden"
              animate="visible"
              transition={{ duration: 1, delay: 1.2 }}
            >
              <Card className="w-full bg-gradient-to-r from-[#e86e6a] to-[#a62511] shadow-lg">
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
          <div className="w-[100%] h-0 border border-black mt-4"></div>
          <div className="flex flex-col ">
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
              <div className="relative right-[-10rem]">
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
              <div className="w-full overflow-x-auto rounded-xl shadow-lg bg-gray-900 p-4">
                <h1 className="text-3xl 2xl:text-4xl text-white text-center font-bold mb-4">
                  Tasks
                </h1>
                <Table className="border-collapse border border-gray-900 w-full">
                  <TableCaption className="text-md text-gray-500">
                    A list of all completed tasks.
                  </TableCaption>
                  <TableHeader className="">
                    <TableRow>
                      <TableHead className="text-center text-l text-gray-500 font-bold py-2 ">
                        Vehicle Number
                      </TableHead>
                      <TableHead className="text-center text-l text-gray-500 font-bold py-2 ">
                        Owner Name
                      </TableHead>
                      <TableHead className="text-center text-l text-gray-500 font-bold py-2 ">
                        Owner Phone Number
                      </TableHead>
                      <TableHead className="text-center text-l text-gray-500 font-bold py-2 ">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTasksForPagination.map((item) => (
                      <TableRow
                        key={item.id}
                        className="bg-gray-900 hover:bg-gray-800 transition duration-200"
                      >
                        <TableCell className="border-none text-center  text-white py-2 border ">
                          {item.vehicleNumber.toUpperCase()}
                        </TableCell>
                        <TableCell className="border-none text-center text-white py-2 border">
                          {item.ownerName}
                        </TableCell>
                        <TableCell className="border-none text-center text-white  py-2 border">
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
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  } else {
    return redirect("/login");
  }
}
