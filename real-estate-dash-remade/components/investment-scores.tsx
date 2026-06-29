"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ScoreCircleProps {
  score: number
  label: string
  maxScore?: number
}

function ScoreCircle({ score, label, maxScore = 100 }: ScoreCircleProps) {
  const percentage = (score / maxScore) * 100
  const circumference = 2 * Math.PI * 45 // radius of 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="text-primary transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{score}</span>
          <span className="text-sm text-muted-foreground">/{maxScore}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-center">{label}</span>
    </div>
  )
}

export function InvestmentScores() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Investment Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center space-x-12">
          <ScoreCircle score={71} label="AVM" />
          <ScoreCircle score={84} label="AI Score" />
        </div>
      </CardContent>
    </Card>
  )
}
