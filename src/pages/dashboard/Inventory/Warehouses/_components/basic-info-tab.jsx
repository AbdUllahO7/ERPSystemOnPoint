import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWarehouseById } from '../../../../../lib/api';

export default function BasicInfoTab({ id }) {
  const { data, isLoading } = useQuery({
    queryKey: ['getWarehouseById', id],
    queryFn: () => getWarehouseById(id),
    enabled: !!id,
  });

  const warehouse = data?.data || {};

  if (isLoading) {
    return <div className="py-4 text-sm text-muted-foreground">Loading details...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-foreground">Warehouse Code</p>
        <p className="text-sm text-primary mt-1">#{warehouse.warehouse_Code || 'N/A'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Warehouse Name</p>
        <p className="text-sm text-muted-foreground mt-1">{warehouse.name_Warehouse || 'N/A'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Location</p>
        <p className="text-sm text-primary mt-1">{warehouse.location || 'N/A'}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Manager Name</p>
        <p className="text-sm text-primary mt-1">{warehouse.manager_Name || 'N/A'}</p>
      </div>
    </div>
  );
}
