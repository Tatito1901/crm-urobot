import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type GrowthChartProps = {
  title: string;
  data: { label: string; value: number }[];
  maxValue?: number;
};

const HEIGHT = 160;

export function GrowthChart({ title, data, maxValue }: GrowthChartProps) {
  if (data.length === 0) return null;

  const max = maxValue ?? Math.max(...data.map((d) => d.value));
  const safeMax = max > 0 ? max : 1;
  const divisor = data.length > 1 ? data.length - 1 : 1;

  const points = data.map((item, index) => {
    const x = (index / divisor) * 100;
    const y = HEIGHT - (item.value / safeMax) * HEIGHT;
    return { x, y };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

  const gradientId = `gradient-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <Card className="bg-white/[0.03]">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-sm text-white">{title}</CardTitle>
          <CardDescription>Últimos períodos</CardDescription>
        </div>
        <span className="text-xs text-white/40">(+{max.toLocaleString("es-MX")})</span>
      </CardHeader>
      <CardContent className="pt-0">
        <svg
          viewBox={`0 0 100 ${HEIGHT}`}
          className="h-40 w-full text-blue-400"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(59,130,246,0.45)" />
              <stop offset="100%" stopColor="rgba(59,130,246,0)" />
            </linearGradient>
          </defs>
          <path
            d={`${path} L100,${HEIGHT} L0,${HEIGHT} Z`}
            fill={`url(#${gradientId})`}
            className="transition-all duration-500"
          />
          <path d={path} fill="none" stroke="currentColor" strokeWidth={1.2} />
          {points.map((point, index) => (
            <circle
              key={`${point.x}-${point.y}`}
              cx={point.x}
              cy={point.y}
              r={1.8}
              className="fill-blue-200"
            >
              <title>
                {data[index].label}: {data[index].value.toLocaleString("es-MX")}
              </title>
            </circle>
          ))}
        </svg>
        <div className="mt-3 flex justify-between text-xs text-white/50">
          {data.map((item) => (
            <span key={item.label}>{item.label}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
