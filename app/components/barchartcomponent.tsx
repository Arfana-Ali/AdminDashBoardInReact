import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "~/components/ui/chart";

import { Bar, BarChart, XAxis } from "recharts";

interface BarChartComponentProps {
  chartData: any;
  chartConfig: any;
}

export default function BarChartComponent(props: BarChartComponentProps) {
  const { chartData, chartConfig } = props;

  return (
    <Card className="bg-gray-900 w-auto h-auto m-2 p-2">
      <CardHeader>
        <CardTitle className="text-center font-2xl text-white">
          Month Wise Data
        </CardTitle>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <div className="w-full h-[300px]">
              <BarChart data={chartData} width={900} height={500}>
                <XAxis
                  dataKey="month"
                  tickFormatter={(month) => {
                    const date = new Date();
                    date.setMonth(month - 1);
                    return date.toLocaleString("default", {
                      month: "long",
                    });
                  }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend
                  content={
                    <ChartLegendContent className="text-lg text-white" />
                  }
                />
                <Bar
                  dataKey="total"
                  fill={chartConfig.total.color}
                  radius={4}
                />
                <Bar
                  dataKey="pending"
                  fill={chartConfig.pending.color}
                  radius={4}
                />
                <Bar
                  dataKey="complete"
                  fill={chartConfig.complete.color}
                  radius={4}
                />
                <Bar
                  dataKey="cancelled"
                  fill={chartConfig.cancelled.color}
                  radius={4}
                />
              </BarChart>
            </div>
          </ChartContainer>
        </CardContent>
      </CardHeader>
    </Card>
  );
}
