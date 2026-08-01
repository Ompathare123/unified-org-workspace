import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  RefreshCw,
  Sliders,
} from "lucide-react";

import AuditPagination from "./AuditPagination";
import AuditDetailsPanel from "./AuditDetailsPanel";

export interface AuditEventItem {
  id: string;
  timestamp: string;
  user: string;
  userInitials: string;
  userBg: string;
  action: string;
  actionIcon: React.ReactNode;
  resourceType: string;
  resourceTypeStyle: string;
  resourceEntity: string;
  application: string;
  organization: string;
  ipAddress: string;
  result: "Success" | "Denied";
  severity?: "Critical" | "High" | "Medium" | "Low";
}


interface AuditTableProps {
  data?: AuditEventItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const AuditTable: React.FC<AuditTableProps> = ({
  data = [],
  onRefresh,
}) => {

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const columns = useMemo<ColumnDef<AuditEventItem>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 font-bold text-xs text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <span>Timestamp (UTC)</span>
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <span className="text-xs font-mono text-slate-600 whitespace-nowrap">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "user",
        header: "User",
        cell: (info) => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div
              className={`w-6 h-6 rounded-full ${info.row.original.userBg} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
            >
              {info.row.original.userInitials}
            </div>
            <span className="text-xs font-medium text-slate-800">
              {info.getValue<string>()}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 whitespace-nowrap">
            {info.row.original.actionIcon}
            <span>{info.getValue<string>()}</span>
          </div>
        ),
      },
      {
        accessorKey: "resourceType",
        header: "Resource Type",
        cell: (info) => (
          <span
            className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${info.row.original.resourceTypeStyle}`}
          >
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "resourceEntity",
        header: "Resource / Entity",
        cell: (info) => (
          <span className="text-xs font-semibold text-[#0066FF] hover:underline cursor-pointer">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "application",
        header: "Application",
        cell: (info) => (
          <span className="text-xs font-semibold text-[#0066FF] whitespace-nowrap">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "organization",
        header: "Organization",
        cell: (info) => (
          <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "ipAddress",
        header: "IP Address",
        cell: (info) => (
          <span className="text-xs font-mono text-slate-600 whitespace-nowrap">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "result",
        header: "Result",
        cell: (info) => {
          const isSuccess = info.getValue<string>() === "Success";
          return (
            <div className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSuccess ? "bg-[#16A34A]" : "bg-[#DC2626]"
                }`}
              />
              <span className={isSuccess ? "text-[#16A34A]" : "text-[#DC2626]"}>
                {info.getValue<string>()}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Details",
        cell: (info) => (
          <button
            type="button"
            onClick={() => toggleRow(info.row.original.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Expand details"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Table Header Counter Bar */}
      <div className="px-6 py-3.5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span className="text-xs text-slate-500 font-normal">
          Showing <strong className="font-semibold text-slate-700">{data.length === 0 ? 0 : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)}</strong> of{" "}
          <strong className="font-semibold text-slate-700">{data.length}</strong> audit events
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >

            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Columns</span>
          </button>
        </div>
      </div>

      {/* Scrollable Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-100 bg-[#F8FAFC]">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-3.5 text-xs font-bold text-slate-700">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => {
              const isExpanded = expandedRowId === row.original.id;
              return (
                <React.Fragment key={row.id}>
                  <tr
                    onClick={() => toggleRow(row.original.id)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      isExpanded ? "bg-blue-50/30" : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-xs">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>

                  {/* Expandable Details Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-2 bg-slate-50/50">
                        <AuditDetailsPanel event={row.original} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <AuditPagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPages={table.getPageCount() || 1}
        pageSize={table.getState().pagination.pageSize}
        totalItems={data.length}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        onPageSizeChange={(size) => table.setPageSize(size)}
      />
    </div>
  );
};

export default AuditTable;
