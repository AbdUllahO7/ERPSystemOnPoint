import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDepartmentById } from '../../../../lib/api';

export default function DetailsTab({ id }) {
  const { data, isLoading } = useQuery({
    queryKey: ['departmentDetails', id],
    queryFn: () => getDepartmentById(id),
    enabled: !!id,
  });

  const department = data?.data || {};

  if (isLoading) {
    return <div className="py-4 text-sm text-muted-foreground">Loading details...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-foreground">Department ID</p>
        <p className="text-sm text-primary mt-1">#{id ? id.substring(0, 8) : 'N/A'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Department Name</p>
        <p className="text-sm text-muted-foreground mt-1">{department.department_Name || 'N/A'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Manager Name</p>
        <p className="text-sm text-primary mt-1">{department.manager_Name || 'N/A'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Number of employees</p>
        <p className="text-sm text-primary mt-1">{department.total_Employees ?? 0}</p>
      </div>
    </div>
  );
}
