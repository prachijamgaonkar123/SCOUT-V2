

import Box from "@mui/material/Box";
import { LineChart } from "@mui/x-charts/LineChart";

type Series = {
  label: string;
  data: number[];
  color: string;
  showMark: boolean;
};

type Props = Readonly<{
  series: Series[];
  xAxisDates: string[];
  xAxisTimes: string[];
  granularity: "hour" | "weekday" | "week";
  /** Set false for category axes (e.g. gate names) where the line should start
   * right at the first tick instead of leaving a blank leading tick. */
  padStart?: boolean;
  /** Overrides the caption below the chart — use for non-time category axes
   * (e.g. "Zone") instead of the granularity-based "Time (...)" caption. */
  xAxisLabel?: string;
}>;
const xAxisLabelMap = {
  hour: "Time (Hourly)",
  weekday: "Time (Day)",
  week: "Time (Weekly)",
};


export default function TimeScaleLineChart({ series, xAxisDates, xAxisTimes, granularity, padStart = true, xAxisLabel }: Props) {
const xAxisKeys = padStart
  ? ["", ...xAxisTimes.map((time, i) => `${xAxisDates[i]}|${time}`)]
  : xAxisTimes.map((time, i) => `${xAxisDates[i]}|${time}`);
const paddedSeries = series.map((s) => ({
  ...s,
  data: padStart ? [null, ...s.data] : s.data,
  showMark: padStart ? false : s.showMark, // no circles on the line
}));
const allValues = series.flatMap((s) => s.data);
const allZero = allValues.length > 0 && allValues.every((v) => v === 0);
const hasNoData = allValues.length === 0 || allZero;

  return (
  <Box
    sx={{
      width: "100%",
      minWidth: 0,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      "& > div": { minWidth: 0, width: "100%" },
    }}
  >
    {hasNoData ? (
      <Box sx={{ fontSize: 16, color: "#888" }}>
        No data available
      </Box>
    ) : (
      <>
      <LineChart
        height={278}
        skipAnimation
        series={paddedSeries}
        xAxis={[
          {
            scaleType: "point",
            data: xAxisKeys,
            // Axis label is rendered as an HTML caption below the chart instead
            // (the SVG label kept clipping under the two-line tick labels).
            height: 44,
            tickLabelStyle: {
              fontSize: 8,
              textAnchor: "middle",
            },
          },
        ]}
        yAxis={[
          {
            width: 44,
            label: "Count",
            min: 0,
            labelStyle: {
              fontSize: 11,
            },
          },
        ]}
        margin={{ right: 16, bottom: 8 }}
        slots={{
          axisTickLabel: ({ text, x, y }) => {
            const isXAxis = (text ?? "").includes("|");
            if (!isXAxis) {
              return (
                <g transform={`translate(${x}, ${y})`}>
                  <text textAnchor="end" dominantBaseline="central" fontSize={9}>
                    {text}
                  </text>
                </g>
              );
            }
            const [date, time] = (text ?? "").split("|");
            // "YYYY-MM-DD" → "DD/MM"; anything else is shown as-is
            const [yyyy, mm, dd] = date.split("-");
            const shortDate = yyyy && mm && dd ? `${dd}/${mm}` : date;
            return (
              <g transform={`translate(${x}, ${y})`}>
                <text textAnchor="middle" dominantBaseline="hanging">
                  <tspan x="0" dy="0" fontSize={8}>
                    {time}
                  </tspan>
                  <tspan x="0" dy="10" fontSize={8}>
                    {shortDate}
                  </tspan>
                </text>
              </g>
            );
          },
        }}
        sx={{
          width: "100%",
          "& .MuiLineElement-root": {
            strokeWidth: 2,

          },
          "& .MuiChartsAxis-label": {
            fontWeight: 500,
          },
        }}
      />
      <Box
        sx={{
          fontSize: 11,
          fontWeight: 500,
          color: "text.secondary",
          textAlign: "center",
          lineHeight: "22px",
          flexShrink: 0,
        }}
      >
        {xAxisLabel ?? xAxisLabelMap[granularity]}
      </Box>
      </>
    )}
  </Box>
);

}
