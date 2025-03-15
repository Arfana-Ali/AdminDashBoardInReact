import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUser } from "~/utils/gaurds.server";
import {
  redirect,
  useLoaderData,
  useSubmit,
  useActionData,
  Outlet,
} from "@remix-run/react";

import { FormDataSchema } from "~/lib/schema";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import prisma from "~/utils/db";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { FormControl, FormField, FormItem, Form } from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
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

  const citiesWithUsersOption = usersOptions.reduce(
    (acc: Record<string, typeof usersOptions>, user) => {
      if (!acc[user.city]) acc[user.city] = [];
      acc[user.city].push(user);
      return acc;
    },
    {}
  );

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
    if (toastMessage) {
      if (success) {
        toast.success(toastMessage, { duration: 5000 });
        window.location.reload();
      } else {
        toast.error(toastMessage, { duration: 5000 });
      }
    }
  }, [toastMessage, success]);

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
      <main className="flex items-center justify-center min-h-screen px-2 sm:px-4">
        <motion.div
          variants={{
            hidden: { opacity: 0, x: -200 },
            visible: { opacity: 1, x: 0 },
          }}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
        >
          <Card className="  bg-gray-900 text-white ">
            <CardHeader className="sm:py-3 md:py-5">
              <CardTitle className="text-center text-4xl sm:text-3xl font-bold">
                Vehicle Registration Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-2 xl:space-y-4 md:space-y-2"
                >
                  <FormField
                    name="vehicleNumber"
                    control={form.control}
                    render={({ field }) => (
                      <FormControl>
                        <FormItem>
                          <div className="space-y-2">
                            <Label htmlFor="vehicleNumber">
                              Vehicle Number
                            </Label>
                            <Input {...field} id="vehicleNumber" />
                          </div>
                        </FormItem>
                      </FormControl>
                    )}
                  />
                  <FormField
                    name="ownerName"
                    control={form.control}
                    render={({ field }) => (
                      <FormControl>
                        <FormItem>
                          <div className="space-y-2">
                            <Label htmlFor="ownerName">Owner Name</Label>
                            <Input {...field} id="ownerName" />
                          </div>
                        </FormItem>
                      </FormControl>
                    )}
                  />
                  <FormField
                    name="ownerPhone"
                    control={form.control}
                    render={({ field }) => (
                      <FormControl>
                        <FormItem>
                          <div className="space-y-2">
                            <Label htmlFor="ownerPhone">Owner Phone</Label>
                            <Input {...field} id="ownerPhone" type="tel" />
                          </div>
                        </FormItem>
                      </FormControl>
                    )}
                  />
                  <FormField
                    name="selectCities"
                    control={form.control}
                    render={({ field }) => (
                      <FormControl>
                        <FormItem>
                          <div className="space-y-2">
                            <Label htmlFor="selectCities">Working City</Label>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder="Select a city"
                                  defaultValue={field.value}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {selectCities.map((city) => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </FormItem>
                      </FormControl>
                    )}
                  />
                  <FormField
                    name="selectEmployee"
                    control={form.control}
                    render={({ field }) => (
                      <FormControl>
                        <FormItem>
                          <div className="space-y-2">
                            <Label htmlFor="selectEmployee">Employee</Label>
                            <Select
                              value={field.value}
                              onValueChange={(value) => field.onChange(value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select employee" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableEmployees.map(
                                  (employee: {
                                    id: string;
                                    firstName: string;
                                    lastName: string;
                                  }) => (
                                    <SelectItem
                                      key={employee.id}
                                      value={employee.id}
                                    >
                                      {employee.firstName} {employee.lastName}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </FormItem>
                      </FormControl>
                    )}
                  />
                  <Button type="submit" className="bg-orange-600 w-full mt-16">
                    Submit
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
        <Outlet />
      </main>
    );
  } else {
    return redirect("/login");
  }
}
