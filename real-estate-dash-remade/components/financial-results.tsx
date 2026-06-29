"use client";

import type React from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface ProjectionYear {
  year: number;
  propertyValue: number;
  loanBalance: number;
  cumulativeCashFlow: number;
  equity: number;
  netOperatingIncome: number;
  effectiveGrossIncome: number;
  totalOperatingExpenses: number;
  annualDebtService: number;
  cashFlowBeforeTax: number;
}

export interface CalculationResults {
  year1Metrics: {
    netOperatingIncome: number;
    cashFlowBeforeTax: number;
    roi: number;
    capRate: number;
    cashOnCashReturn: number;
    dscr: number;
  };
  projections: ProjectionYear[];
}

interface FinancialResultsProps {
  results: CalculationResults;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
const formatPercent = (value: number) => `${value.toFixed(2)}%`;
const formatNumber = (value: number) => value.toFixed(2);

export function FinancialResults({
  results,
  selectedYear,
  onYearChange,
}: FinancialResultsProps) {
  const { year1Metrics, projections } = results;
  const yearlyData =
    projections.find((p) => p.year === selectedYear) || projections[0];
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    data: { label: string; value: number; year: number };
  } | null>(null);

  // Simple visual representations using CSS
  const createBarChart = (
    data: { label: string; value: number; color: string }[]
  ) => {
    const maxValue = Math.max(...data.map((d) => d.value));
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{item.label}</span>
              <span className="font-medium">{formatCurrency(item.value)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const createPieChart = (
    data: { label: string; value: number; color: string }[]
  ) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="flex items-center justify-center space-x-8">
        <div className="relative w-48 h-48">
          <svg width="192" height="192" className="transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="80"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="32"
            />
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${(percentage / 100) * 502.65} 502.65`;
              const strokeDashoffset = -cumulativePercentage * 5.0265;
              cumulativePercentage += percentage;

              return (
                <circle
                  key={index}
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="32"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.label}</span>
              <span className="text-sm font-medium">
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const createLineChart = (data: ProjectionYear[]) => {
    const maxValue = Math.max(
      ...data.map((d) => Math.max(d.propertyValue, d.equity, d.loanBalance))
    );
    const minValue = Math.min(
      ...data.map((d) => Math.min(d.propertyValue, d.equity, d.loanBalance))
    );
    const range = maxValue - minValue;

    const getY = (value: number) => {
      return 300 - ((value - minValue) / range) * 240;
    };

    const getX = (index: number) => {
      return 80 + index * (640 / (data.length - 1));
    };

    const handleMouseEnter = (
      event: React.MouseEvent,
      value: number,
      label: string,
      year: number,
      index: number
    ) => {
      // const rect = event.currentTarget.getBoundingClientRect()
      const svgRect = event.currentTarget
        .closest("svg")
        ?.getBoundingClientRect();
      if (svgRect) {
        setHoveredPoint({
          x: getX(index),
          y: getY(value),
          data: { label, value, year },
        });
      }
    };

    const handleMouseLeave = () => {
      setHoveredPoint(null);
    };

    return (
      <div className="space-y-4 w-full relative">
        <svg
          width="800"
          height="350"
          className="rounded w-full"
          viewBox="0 0 800 350"
        >
          {/* Grid lines */}
          {(() => {
            const minRounded = Math.floor(minValue / 100000) * 100000;
            const maxRounded = Math.ceil(maxValue / 100000) * 100000;
            const interval = 100000;
            const labels = [];

            for (
              let value = minRounded;
              value <= maxRounded;
              value += interval
            ) {
              if (value > 0) {
                // Only include grid lines for values greater than 0
                labels.push(value);
              }
            }

            const step = Math.ceil(labels.length / 7);
            const displayLabels = labels.filter(
              (_, index) => index % step === 0
            );

            return displayLabels.map((value, index) => {
              const yPosition = 300 - ((value - minValue) / range) * 240;
              return (
                <line
                  key={index}
                  x1="80"
                  y1={yPosition}
                  x2="720"
                  y2={yPosition}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              );
            });
          })()}
          {/* Vertical grid lines */}
          {data.map((d, i) => (
            <line
              key={`v-${i}`}
              x1={getX(i)}
              y1="60"
              x2={getX(i)}
              y2="300"
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}

          {/* Property Value Line */}
          <polyline
            fill="none"
            stroke="#22c55e"
            strokeWidth="4"
            points={data
              .map((d, i) => `${getX(i)},${getY(d.propertyValue)}`)
              .join(" ")}
          />
          {/* Equity Line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="4"
            points={data
              .map((d, i) => `${getX(i)},${getY(d.equity)}`)
              .join(" ")}
          />
          {/* Loan Balance Line */}
          <polyline
            fill="none"
            stroke="#ef4444"
            strokeWidth="4"
            points={data
              .map((d, i) => `${getX(i)},${getY(d.loanBalance)}`)
              .join(" ")}
          />

          {/* Interactive Data points */}
          {data.map((d, i) => (
            <g key={i}>
              {/* Property Value Point */}
              <circle
                cx={getX(i)}
                cy={getY(d.propertyValue)}
                r="8"
                fill="#22c55e"
                className="cursor-pointer hover:r-10 transition-all"
                onMouseEnter={(e) =>
                  handleMouseEnter(
                    e,
                    d.propertyValue,
                    "Property Value",
                    d.year,
                    i
                  )
                }
                onMouseLeave={handleMouseLeave}
              />
              {/* Equity Point */}
              <circle
                cx={getX(i)}
                cy={getY(d.equity)}
                r="8"
                fill="#3b82f6"
                className="cursor-pointer hover:r-10 transition-all"
                onMouseEnter={(e) =>
                  handleMouseEnter(e, d.equity, "Equity", d.year, i)
                }
                onMouseLeave={handleMouseLeave}
              />
              {/* Loan Balance Point */}
              <circle
                cx={getX(i)}
                cy={getY(d.loanBalance)}
                r="8"
                fill="#ef4444"
                className="cursor-pointer hover:r-10 transition-all"
                onMouseEnter={(e) =>
                  handleMouseEnter(e, d.loanBalance, "Loan Balance", d.year, i)
                }
                onMouseLeave={handleMouseLeave}
              />
            </g>
          ))}

          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y="330"
              textAnchor="middle"
              className="text-sm fill-gray-600"
            >
              Year {d.year}
            </text>
          ))}
          {/* Y-axis labels */}
          {(() => {
            const minRounded = Math.floor(minValue / 100000) * 100000;
            const maxRounded = Math.ceil(maxValue / 100000) * 100000;
            const interval = 100000;
            const labels = [];

            for (
              let value = minRounded;
              value <= maxRounded;
              value += interval
            ) {
              if (value > 0) {
                // Only include labels greater than 0
                labels.push(value);
              }
            }

            const step = Math.ceil(labels.length / 7);
            const displayLabels = labels.filter(
              (_, index) => index % step === 0
            );

            return displayLabels.map((value, index) => {
              const yPosition = 300 - ((value - minValue) / range) * 240;
              const formattedValue = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                notation: value >= 1000000 ? "compact" : "standard",
              }).format(value);

              return (
                <text
                  key={`y-${index}`}
                  x="70"
                  y={yPosition + 5}
                  textAnchor="end"
                  className="text-xs fill-gray-600 font-mono"
                >
                  {formattedValue}
                </text>
              );
            });
          })()}

          {/* Hover tooltip */}
          {hoveredPoint && (
            <g>
              {/* Tooltip background */}
              <rect
                x={hoveredPoint.x - 60}
                y={hoveredPoint.y - 45}
                width="120"
                height="35"
                fill="rgba(0, 0, 0, 0.8)"
                rx="4"
                ry="4"
              />
              {/* Tooltip text */}
              <text
                x={hoveredPoint.x}
                y={hoveredPoint.y - 30}
                textAnchor="middle"
                className="text-xs fill-white font-medium"
              >
                {hoveredPoint.data.label}
              </text>
              <text
                x={hoveredPoint.x}
                y={hoveredPoint.y - 15}
                textAnchor="middle"
                className="text-xs fill-white"
              >
                Year {hoveredPoint.data.year}:{" "}
                {formatCurrency(hoveredPoint.data.value)}
              </text>
            </g>
          )}
        </svg>

        <div className="flex justify-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-500 rounded" />
            <span className="text-base font-medium">Property Value</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-blue-500 rounded" />
            <span className="text-base font-medium">Equity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-red-500 rounded" />
            <span className="text-base font-medium">Loan Balance</span>
          </div>
        </div>
      </div>
    );
  };

  const pieChartData = [
    {
      label: "Operating Expenses",
      value: yearlyData.totalOperatingExpenses,
      color: "#eab308",
    },
    {
      label: "Debt Service",
      value: yearlyData.annualDebtService,
      color: "#ef4444",
    },
    {
      label: "Cash Flow",
      value: Math.max(0, yearlyData.cashFlowBeforeTax),
      color: "#3b82f6",
    },
  ];

  const barChartData = [
    {
      label: "Gross Income",
      value: yearlyData.effectiveGrossIncome,
      color: "#22c55e",
    },
    {
      label: "Operating Expenses",
      value: yearlyData.totalOperatingExpenses,
      color: "#eab308",
    },
    {
      label: "Debt Service",
      value: yearlyData.annualDebtService,
      color: "#ef4444",
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Key Financial Metrics (Year 1)</CardTitle>
          <CardDescription>
            A summary of the investment&apos;s performance in the first year.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  Net Operating Income (NOI)
                </TableCell>
                <TableCell className="text-right font-semibold text-lg">
                  {formatCurrency(year1Metrics.netOperatingIncome)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Cash Flow (Before Tax)
                </TableCell>
                <TableCell className="text-right font-semibold text-lg">
                  {formatCurrency(year1Metrics.cashFlowBeforeTax)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Return on Investment (ROI)
                </TableCell>
                <TableCell className="text-right font-semibold text-lg">
                  {formatPercent(year1Metrics.roi)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Capitalization Rate (Cap Rate)
                </TableCell>
                <TableCell className="text-right font-semibold text-lg">
                  {formatPercent(year1Metrics.capRate)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Cash-on-Cash Return
                </TableCell>
                <TableCell className="text-right font-semibold text-lg">
                  {formatPercent(year1Metrics.cashOnCashReturn)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Debt Service Coverage Ratio (DSCR)
                </TableCell>
                <TableCell className="text-right font-semibold text-lg">
                  {formatNumber(year1Metrics.dscr)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Income Breakdown</CardTitle>
                <CardDescription>
                  Breakdown for Year {selectedYear}
                </CardDescription>
              </div>
              <Select
                value={String(selectedYear)}
                onValueChange={(value) => onYearChange(Number(value))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {projections.map((p) => (
                    <SelectItem key={p.year} value={String(p.year)}>
                      Year {p.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>{createPieChart(pieChartData)}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Impact Breakdown</CardTitle>
            <CardDescription>
              Year {selectedYear} Income vs. Outflows
            </CardDescription>
          </CardHeader>
          <CardContent>{createBarChart(barChartData)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Long-Term Investment Projection</CardTitle>
          <CardDescription>
            Growth of your equity and property value over the holding period.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {createLineChart(projections)}
        </CardContent>
      </Card>
    </div>
  );
}
