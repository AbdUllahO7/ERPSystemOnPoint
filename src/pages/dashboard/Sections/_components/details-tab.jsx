import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSectionById } from '../../../../lib/api';

export default function DetailsTab({ id }) {
  const { data, isLoading } = useQuery({
    queryKey: ['sectionDetails', id],
    queryFn: () => getSectionById(id),
    enabled: !!id,
  });

  const section = data?.data || {};

  if (isLoading) {
    return <div className="py-4 text-sm text-muted-foreground">Loading details...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-foreground">Sector ID</p>
        <p className="text-sm text-primary mt-1">#{id ? id.substring(0, 8) : 'N/A'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Sector Name</p>
        <p className="text-sm text-muted-foreground mt-1">{section.section_name || 'N/A'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">The Department Belonging To It</p>
        <p className="text-sm text-primary mt-1">{section.department_Name || 'N/A'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Number of employees</p>
        <p className="text-sm text-primary mt-1">{section.employees_count ?? 0}</p>
      </div>
    </div>
  );
}
