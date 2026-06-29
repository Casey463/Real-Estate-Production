"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, TrendingUp } from "lucide-react"

export function InvestmentSummary() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">Investment Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Positives */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Positives</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-sm">Positive monthly cash flow</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-sm">Strong neighborhood amenities</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-sm">Below-market purchase price</span>
            </div>
          </div>
        </div>

        {/* Negatives */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Negatives</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                <X className="h-3 w-3 text-red-600" />
              </div>
              <span className="text-sm">High crime rate within neighborhood</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                <X className="h-3 w-3 text-red-600" />
              </div>
              <span className="text-sm">No grocery stores within 5 miles</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                <X className="h-3 w-3 text-red-600" />
              </div>
              <span className="text-sm">Car only neighborhood</span>
            </div>
          </div>
        </div>

        {/* Considerations */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Considerations</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
              <span className="text-sm">Interest rate sensitivity</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
              <span className="text-sm">Property age and maintenance</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
              <span className="text-sm">Market competition</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base">Recommendations</h3>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <TrendingUp className="h-3 w-3 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">This property shows strong investment potential</p>
              <p className="text-xs text-muted-foreground">
                with solid cash flow and appreciation prospects. Consider proceeding with due diligence.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
