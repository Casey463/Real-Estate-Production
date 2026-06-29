"use client";

import type React from "react";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, TrendingUp, HelpCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "framer-motion";

// Define the structure for our form inputs
interface FormInputs {
  // Income
  monthlyRent: number;
  vacancyRate: number;
  otherIncome: number;
  // Expenses
  propertyTaxes: number;
  insurance: number;
  maintenance: number;
  managementFee: number;
  utilities: number;
  hoaFees: number;
  // Financing
  purchasePrice: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  // Acquisition & Disposition
  closingCosts: number;
  sellingCosts: number;
  capex: number;
  // Market & Taxes
  appreciation: number;
  incomeGrowth: number;
  expenseGrowth: number;
  incomeTaxRate: number;
  capitalGainsTaxRate: number;
  // Projections
  holdingPeriod: number;
}

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

interface InvestmentCalculatorProps {
  results: CalculationResults | null;
  onResultsChange: (results: CalculationResults | null) => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export function InvestmentCalculator({
  results,
  onResultsChange,
  selectedYear,
  onYearChange,
}: InvestmentCalculatorProps) {
  const [inputs, setInputs] = useState<FormInputs>({
    monthlyRent: 2000,
    vacancyRate: 5,
    otherIncome: 50,
    propertyTaxes: 3000,
    insurance: 1200,
    maintenance: 1500,
    managementFee: 8,
    utilities: 2400,
    hoaFees: 600,
    purchasePrice: 300000,
    loanAmount: 240000,
    interestRate: 6.5,
    loanTerm: 30,
    closingCosts: 3,
    sellingCosts: 6,
    capex: 1000,
    appreciation: 3,
    incomeGrowth: 2,
    expenseGrowth: 2,
    incomeTaxRate: 25,
    capitalGainsTaxRate: 15,
    holdingPeriod: 10,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: Number.parseFloat(value) || 0 }));
  };

  const calculateFinancials = () => {
    // --- YEAR 1 BASE CALCULATIONS ---
    const grossScheduledIncome = inputs.monthlyRent * 12;
    const vacancyLoss = grossScheduledIncome * (inputs.vacancyRate / 100);
    const otherIncomeTotal = inputs.otherIncome * 12;
    const effectiveGrossIncome =
      grossScheduledIncome - vacancyLoss + otherIncomeTotal;

    const managementCost = effectiveGrossIncome * (inputs.managementFee / 100);
    const totalOperatingExpenses =
      inputs.propertyTaxes +
      inputs.insurance +
      inputs.maintenance +
      managementCost +
      inputs.utilities +
      inputs.hoaFees;

    const monthlyInterestRate = inputs.interestRate / 100 / 12;
    const numberOfPayments = inputs.loanTerm * 12;
    const monthlyPayment =
      (inputs.loanAmount *
        (monthlyInterestRate *
          Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    const downPayment = inputs.purchasePrice - inputs.loanAmount;
    const acquisitionCosts = inputs.purchasePrice * (inputs.closingCosts / 100);
    const initialInvestment = downPayment + acquisitionCosts;

    // --- DYNAMIC PROJECTIONS ---
    const projectionData = [];
    let currentPropertyValue = inputs.purchasePrice;
    let currentLoanBalance = inputs.loanAmount;
    let cumulativeCashFlow = 0;
    let currentEGI = effectiveGrossIncome;
    let currentOpEx = totalOperatingExpenses;

    for (let year = 1; year <= inputs.holdingPeriod; year++) {
      if (year > 1) {
        currentEGI *= 1 + inputs.incomeGrowth / 100;
        currentOpEx *= 1 + inputs.expenseGrowth / 100;
      }
      const currentNOI = currentEGI - currentOpEx;

      let interestForYear = 0;
      let principalForYear = 0;
      for (let month = 1; month <= 12; month++) {
        const interestComponent = currentLoanBalance * monthlyInterestRate;
        const principalComponent = monthlyPayment - interestComponent;
        interestForYear += interestComponent;
        principalForYear += principalComponent;
        currentLoanBalance -= principalComponent;
      }
      const annualDebtService = interestForYear + principalForYear;
      const yearCashFlow = currentNOI - annualDebtService;
      cumulativeCashFlow += yearCashFlow;
      currentPropertyValue *= 1 + inputs.appreciation / 100;

      projectionData.push({
        year,
        propertyValue: Math.round(currentPropertyValue),
        loanBalance: Math.round(currentLoanBalance),
        cumulativeCashFlow: Math.round(cumulativeCashFlow),
        equity: Math.round(currentPropertyValue - currentLoanBalance),
        netOperatingIncome: Math.round(currentNOI),
        effectiveGrossIncome: Math.round(currentEGI),
        totalOperatingExpenses: Math.round(currentOpEx),
        annualDebtService: Math.round(annualDebtService),
        cashFlowBeforeTax: Math.round(yearCashFlow),
      });
    }

    const year1Results = projectionData[0];
    const appreciationYear1 =
      inputs.purchasePrice * (inputs.appreciation / 100);
    let principalPaydownYear1 = 0;
    let tempLoanBalance = inputs.loanAmount;
    for (let month = 1; month <= 12; month++) {
      const interestComponent = tempLoanBalance * monthlyInterestRate;
      principalPaydownYear1 += monthlyPayment - interestComponent;
      tempLoanBalance -= monthlyPayment - interestComponent;
    }

    const roi =
      ((year1Results.cashFlowBeforeTax +
        principalPaydownYear1 +
        appreciationYear1) /
        initialInvestment) *
      100;
    const capRate =
      (year1Results.netOperatingIncome / inputs.purchasePrice) * 100;
    const cashOnCashReturn =
      (year1Results.cashFlowBeforeTax / initialInvestment) * 100;
    const dscr =
      year1Results.netOperatingIncome / year1Results.annualDebtService;

    const calculationResults = {
      year1Metrics: {
        netOperatingIncome: year1Results.netOperatingIncome,
        cashFlowBeforeTax: year1Results.cashFlowBeforeTax,
        roi,
        capRate,
        cashOnCashReturn,
        dscr,
      },
      projections: projectionData,
    };

    onResultsChange(calculationResults);
    onYearChange(1); // Reset to year 1 on new calculation
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;
  const formatNumber = (value: number) => value.toFixed(2);

  const renderInputField = (
    name: keyof FormInputs,
    label: string,
    type: "currency" | "percent" | "years" = "currency"
  ) => {
    const value = inputs[name];
    return (
      <div className="space-y-2">
        <Label
          htmlFor={name}
          className="text-sm font-medium flex items-center gap-1"
        >
          {label}
          <HelpCircle className="h-3 w-3 text-muted-foreground" />
        </Label>
        <div className="relative">
          <Input
            id={name}
            name={name}
            type="number"
            value={value}
            onChange={handleInputChange}
            className="pr-12"
            step={type === "percent" ? "0.1" : type === "currency" ? "1" : "1"}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {type === "currency" && "$"}
            {type === "percent" && "%"}
            {type === "years" && "yrs"}
          </span>
        </div>
      </div>
    );
  };

  const createPieChart = (
    data: { label: string; value: number; color: string }[]
  ) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="flex items-center justify-center space-x-6">
        <div className="relative w-40 h-40">
          <svg width="160" height="160" className="transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="24"
            />
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${(percentage / 100) * 377} 377`;
              const strokeDashoffset = -cumulativePercentage * 3.77;
              cumulativePercentage += percentage;

              return (
                <circle
                  key={index}
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="24"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
        </div>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  {item.label}
                </div>
                <div className="text-lg font-semibold">
                  {formatCurrency(item.value)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const yearlyData = results
    ? results.projections.find((p) => p.year === selectedYear) ||
      results.projections[0]
    : null;

  const pieChartData = yearlyData
    ? [
        {
          label: "Expenses",
          value: yearlyData.totalOperatingExpenses,
          color: "#eab308",
        },
        {
          label: "Debt",
          value: yearlyData.annualDebtService,
          color: "#ef4444",
        },
        {
          label: "Cash flow",
          value: Math.max(0, yearlyData.cashFlowBeforeTax),
          color: "#22c55e",
        },
      ]
    : [];

  const totalProfit = yearlyData
    ? yearlyData.effectiveGrossIncome -
      yearlyData.totalOperatingExpenses -
      yearlyData.annualDebtService
    : 0;

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6">
      {/* Left Pane - Inputs */}
      <div className="w-1/2 border-r pr-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Investment Calculator</h2>
          <p className="text-muted-foreground">
            Enter your property details to calculate investment returns
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="space-y-8 pr-4">
            {/* Income & Cash Flow */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Income & Cash Flow
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {renderInputField("monthlyRent", "Monthly Rental Income")}
                {renderInputField("vacancyRate", "Vacancy Rate", "percent")}
              </div>
              <div className="grid grid-cols-1 gap-4">
                {renderInputField("otherIncome", "Other Monthly Income")}
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Operating Expenses
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {renderInputField("propertyTaxes", "Annual Property Taxes")}
                {renderInputField("insurance", "Annual Insurance")}
                {renderInputField("maintenance", "Annual Maintenance")}
                {renderInputField("managementFee", "Management Fee", "percent")}
                {renderInputField("utilities", "Annual Utilities")}
                {renderInputField("hoaFees", "Annual HOA Fees")}
              </div>
            </div>

            {/* Financing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Financing</h3>
              <div className="grid grid-cols-2 gap-4">
                {renderInputField("purchasePrice", "Purchase Price")}
                {renderInputField("loanAmount", "Loan Amount")}
                {renderInputField("interestRate", "Interest Rate", "percent")}
                {renderInputField("loanTerm", "Loan Term", "years")}
              </div>
            </div>

            {/* Acquisition & Disposition */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Acquisition & Disposition
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {renderInputField("closingCosts", "Closing Costs", "percent")}
                {renderInputField("sellingCosts", "Selling Costs", "percent")}
              </div>
              <div className="grid grid-cols-1 gap-4">
                {renderInputField("capex", "Annual CapEx Reserve")}
              </div>
            </div>

            {/* Market & Taxes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Market & Taxes
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {renderInputField(
                  "appreciation",
                  "Annual Appreciation",
                  "percent"
                )}
                {renderInputField(
                  "incomeGrowth",
                  "Annual Income Growth",
                  "percent"
                )}
                {renderInputField(
                  "expenseGrowth",
                  "Annual Expense Growth",
                  "percent"
                )}
                {renderInputField(
                  "incomeTaxRate",
                  "Income Tax Rate",
                  "percent"
                )}
              </div>
            </div>

            {/* Projection Period */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Projection Period
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {renderInputField("holdingPeriod", "Holding Period", "years")}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="mt-2 pt-4 border-t">
          <Button size="lg" onClick={calculateFinancials} className="w-full">
            <Calculator className="mr-2 h-4 w-5" />
            Calculate
          </Button>
        </div>
      </div>

      {/* Right Pane - Results */}
      <div className="w-1/2 pl-6">
        <AnimatePresence>
          {results ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Income & Cash Flow Metrics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Income & Cash Flow
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      Net Operating Income (NOI)
                      <HelpCircle className="h-3 w-3" />
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(results.year1Metrics.netOperatingIncome)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      Cash Flow (Before Tax)
                      <HelpCircle className="h-3 w-3" />
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(results.year1Metrics.cashFlowBeforeTax)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      Return on Investment (ROI)
                      <HelpCircle className="h-3 w-3" />
                    </div>
                    <div className="text-2xl font-bold">
                      {formatPercent(results.year1Metrics.roi)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      Capitalization Rate (Cap Rate)
                      <HelpCircle className="h-3 w-3" />
                    </div>
                    <div className="text-2xl font-bold">
                      {formatPercent(results.year1Metrics.capRate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      Cash-on-Cash Return
                      <HelpCircle className="h-3 w-3" />
                    </div>
                    <div className="text-2xl font-bold">
                      {formatPercent(results.year1Metrics.cashOnCashReturn)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      Debt Service Coverage Ratio (DSCR)
                      <HelpCircle className="h-3 w-3" />
                    </div>
                    <div className="text-2xl font-bold">
                      {formatNumber(results.year1Metrics.dscr)}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Income Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Income Breakdown</h3>
                  <Select
                    value={String(selectedYear)}
                    onValueChange={(value) => onYearChange(Number(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {results.projections.map((p) => (
                        <SelectItem key={p.year} value={String(p.year)}>
                          {p.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  Breakdown of your income by year
                </div>

                {yearlyData && (
                  <>
                    {createPieChart(pieChartData)}
                    <div className="mt-6 pt-4 border-t">
                      <div className="text-sm text-muted-foreground mb-1">
                        Total Profit (Year {selectedYear})
                      </div>
                      <div
                        className={`text-3xl font-bold ${
                          totalProfit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {totalProfit >= 0 ? "+" : ""}{" "}
                        {formatCurrency(totalProfit)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
              <div>
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Ready to Calculate</p>
                <p className="text-sm">
                  Enter your property details and click Calculate to see results
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
