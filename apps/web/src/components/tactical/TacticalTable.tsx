import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  label: string;
  numeric?: boolean;
  render?: (row: T) => ReactNode;
}

interface TacticalTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  selectedRow?: T;
  className?: string;
}

export function TacticalTable<T extends Record<string, any>>({ 
  columns, 
  data, 
  onRowClick,
  selectedRow,
  className = '' 
}: TacticalTableProps<T>) {
  return (
    <table className={`table-tactical ${className}`}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} className={col.numeric ? 'numeric' : ''}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr
            key={idx}
            onClick={() => onRowClick?.(row)}
            className={selectedRow === row ? 'selected' : ''}
          >
            {columns.map((col) => (
              <td key={col.key} className={col.numeric ? 'numeric' : ''}>
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
