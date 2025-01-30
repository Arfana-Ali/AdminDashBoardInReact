import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "~/components/ui/chart";

interface BarChartComponentProps {
  chartData: any;
  chartConfig: any;
}

export default function BarChartComponent(props: BarChartComponentProps) {
  const { chartData, chartConfig } = props;
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatXAxisTick = (month: number) => {
    const date = new Date();
    date.setMonth(month - 1);
    const monthName = date.toLocaleString("default", { month: "long" });
    if (windowWidth < 640) {
      return monthName.slice(0, 1);
    } else if (windowWidth < 1024) {
      return monthName.slice(0, 3);
    }
    return monthName;
  };

  return (
    <Card className="w-full mx-auto bg-gray-900">
      <CardHeader className="py-0 sm:py-1">
        <CardTitle className="p-0 text-lg sm:text-xl font-bold text-center text-white">
          Month Wise Data
        </CardTitle>
      </CardHeader>
      <CardContent className="py-0 sm:py-2">
        <ChartContainer
          config={chartConfig}
          className="h-[100px] sm:h-[300px] md:h-[320px] w-full"
        >
          <BarChart
            data={chartData}
            margin={{ right: 5, left: -20, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={5}
              axisLine={false}
              tickFormatter={formatXAxisTick}
              fontSize={windowWidth < 640 ? 8 : windowWidth < 1024 ? 8 : 10}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={5}
              fontSize={windowWidth < 640 ? 8 : windowWidth < 1024 ? 8 : 10}
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
              content={<ChartTooltipContent />}
            />
            <ChartLegend
              className="text-white"
              content={<ChartLegendContent />}
            />
            <Bar
              dataKey="total"
              fill={chartConfig.total.color}
              radius={[4, 4, 0, 0]}
              barSize={windowWidth < 640 ? 10 : windowWidth < 1024 ? 15 : 20}
              name={chartConfig.total.label}
            />
            <Bar
              dataKey="pending"
              fill={chartConfig.pending.color}
              radius={[4, 4, 0, 0]}
              barSize={windowWidth < 640 ? 10 : windowWidth < 1024 ? 15 : 20}
              name={chartConfig.pending.label}
            />
            <Bar
              dataKey="complete"
              fill={chartConfig.complete.color}
              radius={[4, 4, 0, 0]}
              barSize={windowWidth < 640 ? 10 : windowWidth < 1024 ? 15 : 20}
              name={chartConfig.complete.label}
            />
            <Bar
              dataKey="cancelled"
              fill={chartConfig.cancelled.color}
              radius={[4, 4, 0, 0]}
              barSize={windowWidth < 640 ? 10 : windowWidth < 1024 ? 15 : 20}
              name={chartConfig.cancelled.label}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
