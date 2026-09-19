export default function EmployeeSalaryBreakdown() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Salary Breakdown</h3>
      
      <div className="space-y-4 max-w-3xl">
        <div className="flex justify-between items-center text-sm">
          <span className="text-foreground font-medium">Basic Salary</span>
          <span className="text-muted-foreground">$500</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-foreground font-medium">Total monthly bonuses</span>
          <span className="text-green-500">+500$</span>
        </div>
        <div className="flex justify-between items-center text-sm pb-4 border-b border-border">
          <span className="text-foreground font-medium">Total monthly discounts</span>
          <span className="text-red-500">-50$</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-foreground">Net Salary</span>
          <span className="text-lg font-bold text-primary">950$</span>
        </div>
      </div>
    </div>
  );
}
