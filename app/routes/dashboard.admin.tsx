import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { motion } from "motion/react";
import BarChartComponent from "~/components/barchartcomponent";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ChartConfig } from "~/components/ui/chart";

import prisma from "~/utils/db";
import { requireUser } from "~/utils/gaurds.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  if (!user || user?.role !== "ADMIN") {
    return redirect("/login");
  }

  const totalTaskscount = await prisma.tasks.count();

  const pendingTasksCount = await prisma.tasks.count({
    where: { taskStatus: "isPending" },
  });

  const completedTasksCount = await prisma.tasks.count({
    where: { taskStatus: "isComplete" },
  });

  const cancelledTasksCount = await prisma.tasks.count({
    where: { taskStatus: "isCancelled" },
  });

  const allTasks = await prisma.tasks.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
    },
  });

  return {
    user,
    totalTaskscount,
    pendingTasksCount,
    completedTasksCount,
    cancelledTasksCount,
    allTasks,
  };
};

export default function Admin() {
  const data = useLoaderData<typeof loader>();

  const {
    user,
    totalTaskscount,
    pendingTasksCount,
    completedTasksCount,
    cancelledTasksCount,
    allTasks,
  } = data;

  const monthWiseChartConfig = {
    pending: {
      label: "Pending",
      color: "#d7871d",
    },
    complete: {
      label: "Completed",
      color: "#14b521",
    },
    cancelled: {
      label: "Cancelled",
      color: "#e85810",
    },
    total: {
      label: "Total",
      color: "#104ee8",
    },
  } satisfies ChartConfig;

  const monthWiseChartData = Object.entries(
    allTasks.reduce(
      (
        acc: Record<
          number,
          {
            pending: number;
            complete: number;
            cancelled: number;
            total: number;
          }
        >,
        task
      ) => {
        const month = new Date(task.createdAt).getMonth() + 1;
        if (!acc[month]) {
          acc[month] = { pending: 0, complete: 0, cancelled: 0, total: 0 };
        }
        acc[month].total += 1;
        if (task.taskStatus === "isPending") {
          acc[month].pending++;
        } else if (task.taskStatus === "isComplete") {
          acc[month].complete++;
        } else if (task.taskStatus === "isCancelled") {
          acc[month].cancelled++;
        }
        return acc;
      },
      {}
    )
  ).map(([month, data]) => ({
    month: Number(month),
    ...data,
  }));

  return (
    <div className="flex bg-gray-900 h-screen w-full overflow-hidden absolute">
      <div className="flex flex-col gap-4 w-[15rem] md:w-[16rem] lg:w-[21rem]">
        <motion.div
          className="flex gap-3 md:gap-4 w-full items-center mt-1 ml-4 "
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
            className="w-[33px] h-[33px] ml-1 mt-5"
          />
          <h1 className="text-3xl sm:text-2xl md:text-xl lg:text-3xl text-orange-600 font-bold tracking-tighter mt-5 ">
            Afford Motors
          </h1>
        </motion.div>
        <div className=" h-[300px] flex flex-col gap-4  justify-center items-center">
          <motion.h1
            className="text-white font-bold tracking-tight text-xl lg:text-2xl  "
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
            className="text-white font-bold tracking-wide relative "
            variants={{
              hidden: { opacity: 0, x: -200 },
              visible: { opacity: 1, x: 0 },
            }}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 1 }}
          >
            Working City: {user.city.toUpperCase()}
          </motion.h3>
        </div>
        <motion.div
          className="relative flex items-center justify-center h-screen"
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
              className="bg-orange-500 text-white hover:bg-orange-600 px-6 py-3"
              type="submit"
            >
              Logout
            </Button>
          </Form>
        </motion.div>
      </div>
      <div className="hidden sm:block rounded-l-[35px] md:rounded-l-[35px] lg:rounded-l-[50px] h-screen w-[calc(100%)] md:w-[calc(100%)] lg:w-[calc(100%)] xl:w-[calc(100%)] overflow-hidden bg-[#F8F8FF]  ">
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
                      {totalTaskscount}
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

            <div className="space-y-4 py-4">
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
                
                  <BarChartComponent
                    chartConfig={monthWiseChartConfig}
                    chartData={monthWiseChartData}
                  />
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
