"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2 } from "lucide-react";
import { PropertyComparison } from "@/components/property-comparison";
import { InvestmentCalculator } from "@/components/investment-calculator";
import { DetailedAnalysis } from "@/components/detailed-analysis";

// Define the shared calculation results interface
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

interface CalculationResults {
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

export default function TrendsPage() {
  const [calculationResults, setCalculationResults] =
    useState<CalculationResults | null>(null);
  const [selectedYear, setSelectedYear] = useState(1);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              Investment Calculator
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              Detailed Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="mt-6">
            <PropertyComparison />
          </TabsContent>

          <TabsContent value="calculator" className="mt-6">
            <InvestmentCalculator
              results={calculationResults}
              onResultsChange={setCalculationResults}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            <DetailedAnalysis
              results={calculationResults}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
