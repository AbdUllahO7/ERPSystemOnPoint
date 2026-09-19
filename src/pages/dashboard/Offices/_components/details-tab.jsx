import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOfficeById } from '../../../../lib/api';

export default function DetailsTab({ id }) {
  const { data, isLoading } = useQuery({
    queryKey: ['officeDetails', id],
    queryFn: () => getOfficeById(id),
    enabled: !!id,
  });

  const office = data?.data || {};

  if (isLoading) {
    return <div className="py-4 text-sm text-muted-foreground">Loading details...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-foreground">Office ID</p>
        <p className="text-sm text-primary mt-1">#{id ? id.substring(0, 8) : 'N/A'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Office Name</p>
        <p className="text-sm text-muted-foreground mt-1">{office.office_name || 'N/A'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">The Department Belonging To It</p>
        <p className="text-sm text-primary mt-1">{office.department_name || 'N/A'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Number of employees</p>
        <p className="text-sm text-primary mt-1">{office.total_employees ?? 0}</p>
      </div>
    </div>
  );
}
