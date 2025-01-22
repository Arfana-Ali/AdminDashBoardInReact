import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { motion } from "framer-motion";
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
      color: "#60a5fa",
    },
    cancelled: {
      label: "Cancelled",
      color: "#D22B2B",
    },
  } satisfies ChartConfig;

  const monthWiseChartData = Object.entries(
    allTasks.reduce(
      (
        acc: Record<
          number,
          { pending: number; complete: number; cancelled: number }
        >,
        task
      ) => {
        const month = new Date(task.createdAt).getMonth() + 1;
        if (!acc[month]) {
          acc[month] = { pending: 0, complete: 0, cancelled: 0 };
        }
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
    <div className="flex flex-col md:flex-row bg-gray-900 h-screen w-full overflow-hidden">
      <div className="flex flex-col gap-4 w-full md:w-[400px] h-screen">
        <motion.div
          className="flex gap-4 w-full items-center mt-4 md:mt-[3.2rem] ml-4 md:ml-[2rem]"
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
            className="w-[33px] h-[33px] ml-4"
          />
          <h1 className="text-2xl md:text-4xl text-orange-600 font-bold tracking-tighter">
            Afford Motors
          </h1>
        </motion.div>
        <div className="mt-4 md:mt-[5rem] ml-4 md:ml-[6rem] flex flex-col gap-4">
          <motion.h1
            className="text-white font-bold tracking-tight text-xl md:text-2xl"
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
            className="text-white font-bold tracking-wide relative left-[-1.3rem] text-sm md:text-base"
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
          className="relative bottom-[-25rem] md:bottom-[-38rem] md:ml-[4rem] mt-4"
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
              className="ml-4 sm:ml-[4rem] bg-orange-500 text-white"
              type="submit"
            >
              Logout
            </Button>
          </Form>
        </motion.div>
      </div>
      <div className="rounded-l-[100px] h-screen w-full overflow-hidden bg-[#F8F8FF] relative right-[-2rem]">
        <div className="relative mt-4 sm:mt-[10rem]">
          <div className="flex flex-col sm:ml-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                <Card className="sm:w-[300px] bg-gradient-to-r from-[#26218c] to-[#6f64e2]">
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
                className="grid"
                variants={{
                  hidden: { opacity: 0, y: -100 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ duration: 1, delay: 1.0 }}
              >
                <Card className="sm:w-[300px] bg-gradient-to-r from-[#82da50] to-[#11a62d]">
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
            <div className="mt-[20px] flex">
              <BarChartComponent
                chartConfig={monthWiseChartConfig}
                chartData={monthWiseChartData}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
