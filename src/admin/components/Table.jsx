import { useState, useMemo } from 'react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsPointingOutIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const Table = ({
  columns,
  data,
  title,
  onAdd,
  onEdit,
  onView,
  onDelete,
  onRowClick,
  selectable = false,
  searchable = false,
  pagination = true,
  defaultPageSize = 10
}) => {
  // State management
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterValues, setFilterValues] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [expandedRow, setExpandedRow] = useState(null);

  // Process data based on sorting, filtering, and search
  const processedData = useMemo(() => {
    let result = [...data];
    
    // Apply search
    if (searchTerm) {
      result = result.filter(item =>
        columns.some(column => {
          const value = item[column.key];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }
    
    // Apply filters
    Object.keys(filterValues).forEach(key => {
      if (filterValues[key]) {
        result = result.filter(item => 
          item[key]?.toString().toLowerCase().includes(filterValues[key].toLowerCase())
        );
      }
    });
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [data, columns, sortConfig, filterValues, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Handlers
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilter = (key, value) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(paginatedData.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  // Render sort indicator
  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronUpDownIcon className="w-4 h-4 ml-1" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUpIcon className="w-4 h-4 ml-1" /> : 
      <ChevronDownIcon className="w-4 h-4 ml-1" />;
  };

  // Render cell content based on type
  const renderCellContent = (column, value) => {
    if (column.render) {
      return column.render(value);
    }
    
    switch (column.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'status':
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          inactive: 'bg-red-100 text-red-800',
          confirmed: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'actions':
        return (
          <div className="flex space-x-2">
            {onView && (
              <button
                onClick={() => onView(value)}
                className="text-blue-600 hover:text-blue-900"
                title="View"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(value)}
                className="text-yellow-600 hover:text-yellow-900"
                title="Edit"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(value)}
                className="text-red-600 hover:text-red-900"
                title="Delete"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      default:
        return value;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Table Header with Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            {searchable && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            )}
            
            {onAdd && (
              <button
                onClick={onAdd}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-1" />
                Add New
              </button>
            )}
          </div>
        </div>
        
        {selectedRows.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <div className="flex items-center justify-between">
              <p className="text-blue-800 dark:text-blue-200">
                {selectedRows.length} item{selectedRows.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex space-x-2">
                <button className="text-blue-800 dark:text-blue-200 hover:underline">
                  Export Selected
                </button>
                <button className="text-red-600 dark:text-red-400 hover:underline">
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {selectable && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.title}
                    {column.sortable !== false && renderSortIndicator(column.key)}
                  </div>
                  
                  {column.filterable && (
                    <div className="mt-1">
                      <input
                        type="text"
                        placeholder={`Filter ${column.title}...`}
                        className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
                        value={filterValues[column.key] || ''}
                        onChange={(e) => handleFilter(column.key, e.target.value)}
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <>
                  <tr 
                    key={item.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${onRowClick ? 'cursor-pointer' : ''} ${expandedRow === item.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    {selectable && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={selectedRows.includes(item.id)}
                          onChange={() => handleSelectRow(item.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    
                    {columns.map(column => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {renderCellContent(column, item[column.key])}
                      </td>
                    ))}
                  </tr>
                  
                  {expandedRow === item.id && (
                    <tr className="bg-blue-50 dark:bg-blue-900/10">
                      <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {columns.map(column => (
                            <div key={column.key}>
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{column.title}:</span>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {renderCellContent(column, item[column.key])}
                              </p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0)} 
                  className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center">
                    <FunnelIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
                    <p>No data found</p>
                    {searchTerm || Object.values(filterValues).some(v => v) ? (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFilterValues({});
                        }}
                        className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Clear filters
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Pagination */}
      {pagination && processedData.length > 0 && (
        <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4 sm:mb-0">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, processedData.length)}
              </span>{' '}
              of <span className="font-medium">{processedData.length}</span> results
            </span>
            
            <div className="ml-4">
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {totalPages > 5 && (
              <span className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
            )}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;