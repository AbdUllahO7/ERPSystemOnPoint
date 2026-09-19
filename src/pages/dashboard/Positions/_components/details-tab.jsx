import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPositionById } from '../../../../lib/api';

export default function DetailsTab({ id }) {
  const { data, isLoading } = useQuery({
    queryKey: ['positionDetails', id],
    queryFn: () => getPositionById(id),
    enabled: !!id,
  });

  const position = data?.data || {};

  if (isLoading) {
    return <div className="py-4 text-sm text-muted-foreground">Loading details...</div>;
  }

  return (
    <div className="space-y-6 py-4">
      {/* Position Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Position ID</p>
          <p className="text-sm text-primary mt-1">#{id ? id.substring(0, 8) : 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Position Name</p>
          <p className="text-sm text-muted-foreground mt-1">{position.position_name || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Total Employees</p>
          <p className="text-sm text-primary mt-1">{position.total_employees ?? 0}</p>
        </div>
      </div>

      {/* Recent Employees */}
      {/* {position.recentEmployees && position.recentEmployees.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Employees</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-start px-4 py-2 font-medium text-muted-foreground">ID</th>
                  <th className="text-start px-4 py-2 font-medium text-muted-foreground">Employee Name</th>
                  <th className="text-start px-4 py-2 font-medium text-muted-foreground">Job Number</th>
                </tr>
              </thead>
              <tbody>
                {position.recentEmployees.map((emp) => (
                  <tr key={emp.id} className="border-t">
                    <td className="px-4 py-2 text-primary">#{emp.id ? emp.id.substring(0, 8) : ''}</td>
                    <td className="px-4 py-2 text-foreground">{emp.employee_Name || 'N/A'}</td>
                    <td className="px-4 py-2 text-primary">{emp.job_Number || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {position.hasMoreEmployees && (
            <p className="text-xs text-muted-foreground mt-2">More employees available in the Employees tab.</p>
          )}
        </div>
      )} */}
    </div>
  );
}
