import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";

type ComparisonBarsProps = {
  title: string;
  items: { label: string; value: number; hint?: string }[];
  maxValue?: number;
};

export function ComparisonBars({ title, items, maxValue }: ComparisonBarsProps) {
  if (items.length === 0) return null;

  const max = maxValue ?? Math.max(...items.map((item) => item.value));

  return (
    <Card className="bg-white/[0.03]">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-sm text-white">{title}</CardTitle>
          <CardDescription>Distribución</CardDescription>
        </div>
        <span className="text-xs text-white/40">{max.toLocaleString("es-MX")}</span>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {items.map((item) => {
          const percentage = max === 0 ? 0 : Math.round((item.value / max) * 100);
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span className="font-medium text-white/80">{item.label}</span>
                <span>{item.value.toLocaleString("es-MX")}</span>
              </div>
              <div className="relative h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500/80 to-blue-300/60"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {item.hint && <p className="text-xs text-white/40">{item.hint}</p>}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
