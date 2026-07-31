import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import type { PriorityType } from "./PriorityBadge";
import StatusBadge from "./StatusBadge";
import type { StatusType } from "./StatusBadge";
import ActionDropdown from "./ActionDropdown";
import Pagination from "./Pagination";

export interface TicketItem {
  id: string;
  rawId?: string;
  subject: string;
  requesterOrg: string;
  priority: PriorityType;
  status: StatusType;
  assignedToId?: string;
}

interface TicketTableProps {
  data?: TicketItem[];
  isLoading?: boolean;
  searchQuery?: string;
  statusFilter?: string;
  priorityFilter?: string;
  orgFilter?: string;
  assigneeFilter?: string;
  onEditTicket?: (ticket: TicketItem) => void;
  onDeleteTicket?: (ticketId: string) => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  data = [],

  isLoading = false,
  searchQuery = "",
  statusFilter = "All",
  priorityFilter = "All",
  orgFilter = "All",
  assigneeFilter = "All",
  onEditTicket,
  onDeleteTicket,
}) => {
  const { user } = useAuth();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || item.priority === priorityFilter;
      const matchesOrg = orgFilter === "All" || item.requesterOrg === orgFilter;
      const matchesAssignee = assigneeFilter === "All" || (assigneeFilter === "Me" && item.assignedToId === user?.id);
      return matchesSearch && matchesStatus && matchesPriority && matchesOrg && matchesAssignee;
    });
  }, [data, searchQuery, statusFilter, priorityFilter, orgFilter, assigneeFilter, user?.id]);

  const columns = useMemo<ColumnDef<TicketItem>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 font-bold text-xs text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <span>ID</span>
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <Link
            to={`/tickets/${info.row.original.rawId || info.getValue<string>()}`}
            className="text-[#0066FF] font-bold text-xs hover:underline cursor-pointer"
          >
            {info.getValue<string>()}
          </Link>
        ),
      },
      {
        accessorKey: "subject",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 font-bold text-xs text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <span>Subject</span>
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <span className="text-xs font-medium text-slate-800">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "requesterOrg",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 font-bold text-xs text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <span>Requester (Organization)</span>
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <span className="text-xs text-slate-600 font-normal">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "priority",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 font-bold text-xs text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <span>Priority</span>
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </button>
        ),
        cell: (info) => <PriorityBadge priority={info.getValue<PriorityType>()} />,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 font-bold text-xs text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <span>Status</span>
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </button>
        ),
        cell: (info) => <StatusBadge status={info.getValue<StatusType>()} />,
      },
      {
        id: "actions",
        header: () => <span className="font-bold text-xs text-slate-700">Actions</span>,
        cell: (info) => (
          <ActionDropdown
            ticketId={info.row.original.rawId || info.row.original.id}
            onEdit={() => onEditTicket?.(info.row.original)}
            onDelete={() => onDeleteTicket?.(info.row.original.rawId || info.row.original.id)}
          />
        ),
      },
    ],
    [onEditTicket, onDeleteTicket]
  );

  const table = useReactTable({
    data: filteredData,
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
      {/* Scrollable Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-100 bg-white">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-4 text-xs font-bold text-slate-700">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-8" /></td>
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-xs text-slate-400">
                  No tickets match the selected filters.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 text-xs">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <Pagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPages={table.getPageCount() || 1}
        pageSize={table.getState().pagination.pageSize}
        totalItems={filteredData.length}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        onPageSizeChange={(size) => table.setPageSize(size)}
      />
    </div>
  );
};

export default TicketTable;
