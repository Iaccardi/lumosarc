// components/content/Pagination.js
'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onChange, showing }) {
  const goToPrevious = () => onChange(Math.max(1, page - 1))
  const goToNext = () => onChange(Math.min(totalPages, page + 1))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Showing {showing.from}–{showing.to} of {showing.total} ideas
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={goToPrevious}
          disabled={page === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <div className="flex items-center gap-1">
          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= page - 1 && pageNum <= page + 1)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => onChange(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pageNum === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            } else if (pageNum === page - 2 || pageNum === page + 2) {
              return <span key={pageNum} className="px-2 text-gray-400">...</span>
            }
            return null
          })}
        </div>

        <button
          onClick={goToNext}
          disabled={page === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}