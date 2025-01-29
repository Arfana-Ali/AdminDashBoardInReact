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
          {/* <div className="mt-[5rem] ml-[3rem] flex flex-col gap-4 "> */}
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
              Welcome {loggedinUser.firstName}
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
              Working City : {loggedinUser.city.toUpperCase()}
            </motion.h3>
          </div>
          <nav className="mt-8 sm:mt-12 flex-grow">
            <motion.ul
              className="space-y-2 sm:space-y-4 px-4"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 },
              }}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 1.2, staggerChildren: 0.1 }}
            >
              <Button
                variant="ghost"
                className="w-[80%] mx-4 justify-start text-base sm:text-lg text-white  transition-colors"
              >
                <Link to="/dashboard/moderator/createTasks">Create Tasks</Link>
              </Button>
              <Button
                variant="ghost"
                className="w-[80%] mx-4 justify-start text-base sm:text-lg text-white  transition-colors"
              >
                <Link to="/dashboard/moderator/completedTasks">
                  Completed Tasks
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-[80%] mx-4 justify-start text-base sm:text-lg text-white  transition-colors"
              >
                <Link to="/dashboard/moderator/cancelledTasks">
                  Cancelled Tasks
                </Link>
              </Button>
            </motion.ul>
          </nav>
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
            <F method="post" action="/logout">
              <Button
                className="bg-orange-500 text-white hover:bg-orange-600 px-6 py-3"
                type="submit"
              >
                Logout
              </Button>
            </F>
          </motion.div>
        </div>
        <div className="hidden sm:block rounded-l-[35px] md:rounded-l-[35px] lg:rounded-l-[50px] h-screen w-[calc(100%)] md:w-[calc(100%)] lg:w-[calc(100%)] xl:w-[calc(100%)] overflow-hidden bg-[#F8F8FF]  ">
          <Outlet />
        </div>
      </div>
    );
  } else {
    return redirect("/login");
  }
}
