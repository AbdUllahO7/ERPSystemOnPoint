import { useQuery } from "@tanstack/react-query";
import { getHrDashboardSummary } from "@/lib/api";
import GeneralStats from "./components/GeneralStats";
import AttendanceStats from "./components/AttendanceStats";
import ChartsSection from "./components/ChartsSection";
import EmployeePerformanceStats from "./components/EmployeePerformanceStats";
import AttendanceByDepartmentChart from "./components/AttendanceByDepartmentChart";
import ActualWorkingHoursChart from "./components/ActualWorkingHoursChart";
import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";

export default function HrDashboardPage() {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["hrDashboardSummary"],
    queryFn: getHrDashboardSummary,
  });

  if (isLoading) return <div className="p-8">{isAr ? "جاري تحميل بيانات لوحة التحكم..." : "Loading dashboard data..."}</div>;
  if (isError) return <div className="p-8 text-red-500">{isAr ? "حدث خطأ أثناء تحميل بيانات لوحة التحكم." : "Error loading dashboard data."}</div>;

  const dashboardData = data?.data;

  if (!dashboardData) return null;

  return (
    <div className="p-6 space-y-6 bg-[#f4f7fe] min-h-screen">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-[#1B2559]">
          {isAr ? "لوحة تحكم الموارد البشرية" : "HR Dashboard"}
        </h1>
        <span className="text-gray-400 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
        </span>
      </div>

      <GeneralStats data={dashboardData.generalStats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AttendanceStats data={dashboardData.attendanceStats} />
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ChartsSection chartsData={dashboardData.chartsData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4 text-[#1B2559]">
            {isAr ? "الحضور حسب القسم" : "Attendance by Department"}
          </h2>
          <AttendanceByDepartmentChart data={dashboardData.chartsData.attendanceByDepartmentChart} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4 text-[#1B2559]">
            {isAr ? "ساعات العمل الفعلية" : "Actual Working Hours"}
          </h2>
          <ActualWorkingHoursChart data={dashboardData.chartsData.actualWorkingHoursChart} />
        </div>
      </div>

      <EmployeePerformanceStats data={dashboardData.performanceStats} />
    </div>
  );
}
