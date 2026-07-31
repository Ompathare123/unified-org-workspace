import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  
  
  
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { ArrowUpDown, GitBranch } from "lucide-react";
import PRStatusBadge from "./PRStatusBadge";
import type { PRStatusType } from "./PRStatusBadge";
import ApprovalProgress from "./ApprovalProgress";
import PRActionDropdown from "./PRActionDropdown";
import PRPagination from "./PRPagination";
import type { Reviewer } from "./ReviewerAvatars";


export interface PRItem {
  id: string;
  rawId: string;
  title: string;
  description: string;
  status: PRStatusType;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorBg: string;
  targetBranch: string;
  approvedCount: number;
  totalRequired: number;
  reviewers: Reviewer[];
  updatedAgo: string;
}

interface PRTableProps {
  data?: PRItem[];
  isLoading?: boolean;
  totalItems?: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (id: string, desc: boolean) => void;
  onEdit?: (id: string) => void;
}

export const PRTable: React.FC<PRTableProps> = ({
  data = [],
  isLoading = false,
  totalItems = 0,
  page = 1,
  limit = 10,
  onPageChange,
  onLimitChange,
  sortBy,
  sortOrder,
  onSortChange,
  onEdit,
}) => {
  const [sorting, setSorting] = useState<SortingState>(
    sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : []
  );

  // Data is filtered on the server now
  const filteredData = data;

  const columns = useMemo<ColumnDef<PRItem>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 font-bold text-xs text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <span>PR</span>
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <Link
            to={`/prs/${info.row.original.rawId}`}
            className="text-[#0066FF] font-bold text-xs hover:underline cursor-pointer"
          >
            {info.getValue<string>()}
          </Link>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: (info) => (
          <div className="space-y-0.5 max-w-sm">
            <div className="text-xs font-bold text-slate-900">{info.getValue<string>()}</div>
            <div className="text-[11.5px] text-slate-500 font-normal truncate">
              {info.row.original.description}
            </div>
          </div>
        ),
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
        cell: (info) => <PRStatusBadge status={info.getValue<PRStatusType>()} />,
      },
      {
        accessorKey: "authorName",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 font-bold text-xs text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <span>Author</span>
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full ${info.row.original.authorBg} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
            >
              {info.row.original.authorInitials}
            </div>
            <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
              {info.getValue<string>()}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "targetBranch",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 font-bold text-xs text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <span>Target Branch</span>
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
            <GitBranch className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{info.getValue<string>()}</span>
          </div>
        ),
      },
      {
        accessorKey: "approvedCount",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 font-bold text-xs text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <span>Approvals (2/3 Required)</span>
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <ApprovalProgress
            approvedCount={info.row.original.approvedCount}
            totalRequired={info.row.original.totalRequired}
            reviewers={info.row.original.reviewers}
          />
        ),
      },
      {
        accessorKey: "updatedAgo",
        header: "Updated",
        cell: (info) => (
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert(`View Diff for PR ${info.row.original.id}`)}
              className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0066FF] transition-colors cursor-pointer"
            >
              View Diff
            </button>
            <PRActionDropdown 
              prId={info.row.original.rawId} 
              authorId={info.row.original.authorId}
              status={info.row.original.status}
              onEdit={onEdit}
            />
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination: { pageIndex: page - 1, pageSize: limit },
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(totalItems / limit),
    onSortingChange: (updater) => {
      setSorting(updater);
      if (typeof updater === 'function') {
        const newSort = updater(sorting);
        if (newSort.length > 0 && onSortChange) {
          onSortChange(newSort[0].id, newSort[0].desc);
        }
      }
    },
    getCoreRowModel: getCoreRowModel(),
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
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-xs text-slate-400">
                  Loading pull requests...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-xs text-slate-400">
                  No pull requests match the selected filters.
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
      <PRPagination
        currentPage={page}
        totalPages={Math.max(1, Math.ceil(totalItems / limit))}
        pageSize={limit}
        totalItems={totalItems}
        onPageChange={(p) => onPageChange && onPageChange(p)}
        onPageSizeChange={(s) => onLimitChange && onLimitChange(s)}
      />
    </div>
  );
};

export default PRTable;
