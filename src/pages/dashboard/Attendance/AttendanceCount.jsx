import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Calculator, Play, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMonthStats } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function AttendanceCount() {
  const { year, month } = useParams();
  const navigate = useNavigate();
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationDone, setCalculationDone] = useState(false);

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["getMonthStats", year, month],
    queryFn: () => getMonthStats(year, month),
  });

  const stats = statsData?.data || { totalRecords: 0, correctRecords: 0, errorsCount: 0 };

  const handleCalculate = () => {
    setIsCalculating(true);
    // Simulate calculation process
    setTimeout(() => {
      setIsCalculating(false);
      setCalculationDone(true);
    }, 2000);
  };

  const getMonthName = (monthNumber) => {
    const d = new Date();
    d.setMonth(monthNumber - 1);
    return d.toLocaleString("en-US", { month: "long" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-neutral-900">Calculate Attendance</h2>
          <p className="text-neutral-500">
            For {getMonthName(month)} {year}
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 text-center space-y-8">
        <div className="flex justify-center">
          <div className="bg-blue-50 p-6 rounded-full">
            <Calculator className="w-16 h-16 text-blue-600" />
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-neutral-800 mb-2">Ready to calculate attendance?</h3>
          <p className="text-neutral-500 max-w-lg mx-auto">
            This action will process all raw time logs for {getMonthName(month)} {year}, apply the company policies, calculate working hours, deductions, and mark any anomalies.
          </p>
        </div>

        {isLoading ? (
          <p className="text-neutral-400">Loading current status...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-left mb-8">
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
              <span className="text-sm text-neutral-500 block">Total Logs</span>
              <span className="text-2xl font-bold text-neutral-900">{stats.totalRecords}</span>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <span className="text-sm text-green-600 block">Valid Logs</span>
              <span className="text-2xl font-bold text-green-700">{stats.correctRecords}</span>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <span className="text-sm text-red-600 block">Errors Detected</span>
              <span className="text-2xl font-bold text-red-700">{stats.errorsCount}</span>
            </div>
          </div>
        )}

        {calculationDone ? (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center justify-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="font-medium">Calculation completed successfully!</span>
            </div>
            {stats.errorsCount > 0 && (
              <Button 
                onClick={() => navigate(`/dashboard/hr/attendance/${year}/${month}/errors`)}
                size="lg"
                variant="outline"
                className="w-full max-w-sm text-lg h-14 border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
              >
                Resolve Detected Errors
              </Button>
            )}
            {stats.errorsCount === 0 && (
              <Button 
                onClick={() => navigate(`/dashboard/hr/attendance/${year}/${month}`)}
                size="lg"
                className="w-full max-w-sm text-lg h-14 bg-blue-600 hover:bg-blue-700 text-white"
              >
                View Daily Summaries
              </Button>
            )}
          </div>
        ) : (
          <Button 
            onClick={handleCalculate} 
            disabled={isCalculating || isLoading}
            size="lg"
            className="w-full max-w-sm text-lg h-14 bg-blue-600 hover:bg-blue-700"
          >
            {isCalculating ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Calculating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5 fill-current" />
                Start Calculation
              </span>
            )}
          </Button>
        )}
      </div>

      <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3 text-orange-800">
        <AlertTriangle className="w-5 h-5 shrink-0 text-orange-600 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Important Note</p>
          <p>
            If there are unresolved errors (like missing check-outs), they will be marked as "Needs Review". You will need to manually resolve them in the Detected Errors section after the calculation completes.
          </p>
        </div>
      </div>
    </div>
  );
}
