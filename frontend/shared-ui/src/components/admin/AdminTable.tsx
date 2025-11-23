import { ReactNode } from 'react';

export interface AdminTableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function AdminTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data found',
  onRowClick,
}: AdminTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full table-auto divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              {columns.map((column) => {
                const alignClass = column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left';
                return (
                  <th
                    key={column.key}
                    className={`px-6 py-4 ${alignClass} text-xs font-semibold text-gray-400 uppercase tracking-wider`}
                  >
                    {column.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-800">
            {data && data.length > 0 ? (
              data.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={`hover:bg-gray-800 transition-colors w-full ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((column) => {
                    const alignClass = column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left';
                    return (
                      <td
                        key={column.key}
                        className={`px-6 py-4 ${alignClass}`}
                      >
                        {column.render(item)}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <p className="text-gray-400">{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

