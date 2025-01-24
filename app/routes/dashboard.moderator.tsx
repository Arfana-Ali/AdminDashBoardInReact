import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireUser } from "~/utils/gaurds.server";
import {
  redirect,
  useLoaderData,
  Form as F,
  Link,
  Outlet,
} from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { motion } from "motion/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const loggedinUser = await requireUser(request);

  if (!loggedinUser || loggedinUser?.role !== "MODERATOR") {
    return redirect("/login");
  }

  return { loggedinUser };
};

export default function ModeratorPage() {
  const data = useLoaderData<typeof loader>();
  const { loggedinUser } = data;

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
