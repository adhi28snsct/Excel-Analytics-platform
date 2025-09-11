// utils/chartBuilder.js

export function buildChartData(data, chartType = "bar", xKey, yKey, zKey = null) {
  if (!Array.isArray(data) || !xKey || !yKey) return null;

  const labels = data.map(row => String(row[xKey] ?? ""));
  const xData = data.map(row => Number(row[xKey] ?? 0));
  const yData = data.map(row => Number(row[yKey] ?? 0));
  const zData = zKey ? data.map(row => Number(row[zKey] ?? 0)) : [];

  const baseColor = "rgba(75, 192, 192, 0.6)";
  const borderColor = "rgba(75, 192, 192, 1)";

  switch (chartType) {
    case "scatter3d":
      return {
        type: "scatter3d",
        x: xData,
        y: yData,
        z: zData,
        labels,
      };

    case "line-3d":
      return {
        type: "line-3d",
        x: xData,
        y: yData,
        z: zData,
        labels,
      };

    case "bar-3d":
      return {
        type: "bar-3d",
        x: xData,
        y: yData,
        z: zData.map(() => 0), // simulate depth
        labels,
      };

    case "scatter":
      return {
        type: "scatter",
        datasets: [
          {
            label: `${yKey} vs ${xKey}`,
            data: data.map(row => ({
              x: Number(row[xKey] ?? 0),
              y: Number(row[yKey] ?? 0),
            })),
            backgroundColor: baseColor,
          },
        ],
      };

    case "pie":
      return {
        type: "pie",
        labels,
        datasets: [
          {
            label: `${yKey} distribution`,
            data: yData,
            backgroundColor: labels.map((_, i) => `hsl(${(i * 40) % 360}, 70%, 60%)`),
            borderWidth: 1,
          },
        ],
      };

    case "line":
    case "bar":
    default:
      return {
        type: chartType,
        labels,
        datasets: [
          {
            label: `${yKey} vs ${xKey}`,
            data: yData,
            backgroundColor: baseColor,
            borderColor,
            borderWidth: 1,
          },
        ],
      };
  }
}