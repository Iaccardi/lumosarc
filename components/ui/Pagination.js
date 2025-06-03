export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = ''
}) {
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

  const goToPrevious = () => {
    onPageChange(Math.max(1, currentPage - 1))
  }

  const goToNext = () => {
    onPageChange(Math.min(totalPages, currentPage + 1))
  }

  // Generate page numbers with smart truncation
  const getPageNumbers = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) return null

  return (
    <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">{endIndex}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Previous button */}
          <button
            onClick={goToPrevious}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          {/* Page numbers */}
          <div className="hidden md:flex space-x-1">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => page !== '...' && onPageChange(page)}
                disabled={page === '...'}
                className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border border-blue-600'
                    : page === '...'
                    ? 'text-gray-700 cursor-default'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Mobile page info */}
          <div className="md:hidden">
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {/* Next button */}
          <button
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Quick jump to first/last page */}
      <div className="mt-3 flex justify-center space-x-2 text-sm">
        {currentPage > 3 && (
          <button
            onClick={() => onPageChange(1)}
            className="text-blue-600 hover:text-blue-800"
          >
            « First
          </button>
        )}
        {currentPage < totalPages - 2 && (
          <button
            onClick={() => onPageChange(totalPages)}
            className="text-blue-600 hover:text-blue-800"
          >
            Last »
          </button>
        )}
      </div>
    </div>
  )
}

// Usage example:
// <Pagination
//   currentPage={currentPage}
//   totalPages={totalPages}
//   totalItems={items.length}
//   itemsPerPage={itemsPerPage}
//   onPageChange={setCurrentPage}
// />