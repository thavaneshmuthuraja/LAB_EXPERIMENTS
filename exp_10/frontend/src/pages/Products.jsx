import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [searchParams] = useSearchParams()

  const currentPage = parseInt(searchParams.get('page')) || 1
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          page: currentPage,
          limit: 12,
          ...(category && { category }),
          ...(search && { search }),
          sortBy,
          sortOrder
        })

        const [productsResponse, categoriesResponse] = await Promise.all([
          axios.get(`/products?${params}`),
          axios.get('/products/categories/list')
        ])

        setProducts(productsResponse.data.data)
        setPagination(productsResponse.data.pagination)
        setCategories(categoriesResponse.data.data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentPage, category, search, sortBy, sortOrder])

  const updateURL = (newParams) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    // Reset to page 1 when filters change
    if (newParams.category || newParams.search || newParams.sortBy) {
      params.set('page', '1')
    }
    
    window.history.pushState(null, '', `?${params.toString()}`)
  }

  const handleCategoryChange = (e) => {
    updateURL({ category: e.target.value })
  }

  const handleSearchChange = (e) => {
    updateURL({ search: e.target.value })
  }

  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split('-')
    updateURL({ sortBy, sortOrder })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          {category ? `${category} Products` : search ? `Search Results for "${search}"` : 'All Products'}
        </h1>
        <p className="mt-2 text-gray-500">
          {pagination.totalItems} products found
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            value={category || ''}
            onChange={handleCategoryChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={search || ''}
            onChange={handleSearchChange}
            placeholder="Search products..."
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>

        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
            Sort By
          </label>
          <select
            id="sort"
            value={`${sortBy}-${sortOrder}`}
            onChange={handleSortChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4 xl:gap-x-8">
        {products.map((product) => (
          <div key={product._id} className="group">
            <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden group-hover:opacity-75 transition-opacity">
              {product.mainImage ? (
                <img
                  src={product.mainImage.url}
                  alt={product.mainImage.alt || product.name}
                  className="w-full h-full object-center object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900">
                <Link 
                  to={`/products/${product._id}`}
                  className="hover:text-indigo-600"
                >
                  {product.name}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-gray-500">{product.category}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-lg font-medium text-gray-900">
                  ${product.hasDiscount ? product.discountedPrice.toFixed(2) : product.price.toFixed(2)}
                  {product.hasDiscount && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.isOutOfStock 
                    ? 'bg-red-100 text-red-800'
                    : product.isLowStock
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {product.isOutOfStock ? 'Out of Stock' : product.isLowStock ? 'Low Stock' : 'In Stock'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {currentPage > 1 && (
              <Link
                to={`?${searchParams.toString().replace(/page=\d+/, `page=${currentPage - 1}`)}`}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Previous
              </Link>
            )}

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                to={`?${searchParams.toString().replace(/page=\d+/, `page=${page}`)}`}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  page === currentPage
                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </Link>
            ))}

            {currentPage < pagination.totalPages && (
              <Link
                to={`?${searchParams.toString().replace(/page=\d+/, `page=${currentPage + 1}`)}`}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}
