type GrowthChartProps = {
  title: string;
  data: { label: string; value: number }[];
  maxValue?: number;
};

const HEIGHT = 160;

export function GrowthChart({ title, data, maxValue }: GrowthChartProps) {
  if (data.length === 0) return null;

  const max = maxValue ?? Math.max(...data.map((d) => d.value));
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = HEIGHT - (item.value / max) * HEIGHT;
    return { x, y };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

  const gradientId = `gradient-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-inner shadow-black/30">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/80">{title}</h3>
        <span className="text-xs text-white/40">Últimos períodos</span>
      </div>
      <div className="mt-4">
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
      </div>
      <div className="mt-3 flex justify-between text-xs text-white/50">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}
