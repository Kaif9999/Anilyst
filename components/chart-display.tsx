import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ChartDisplay() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-square bg-slate-100 flex items-center justify-center">
          <p className="text-slate-500">Chart will be displayed here</p>
        </div>
      </CardContent>
    </Card>
  )
}

