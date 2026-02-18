import { Card, CardHeader, CardContent } from '@/components/ui/card';

export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="animate-pulse bg-muted/50 rounded" style={{ height }} />
      </CardContent>
    </Card>
  );
}
