import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredResponse, categoriesResponse] = await Promise.all([
          axios.get('/products/featured/list'),
          axios.get('/products/categories/list')
        ])
        
        setFeaturedProducts(featuredResponse.data.data)
        setCategories(categoriesResponse.data.data)
      } catch (error) {
        console.error('Error fetching home data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Welcome to ShopHub
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Discover amazing products at great prices. Shop with confidence and enjoy fast delivery.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  to="/products"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Start Shopping
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  to="/products"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  View Categories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Shop by Category</h2>
          <p className="mt-4 text-lg text-gray-500">
            Browse our wide selection of products
          </p>
        </div>
        
        <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category}
              to={`/products?category=${category}`}
              className="group text-center"
            >
              <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                <span className="text-2xl">
                  {category === 'Electronics' && '📱'}
                  {category === 'Clothing' && '👕'}
                  {category === 'Books' && '📚'}
                  {category === 'Home & Garden' && '🏠'}
                  {category === 'Sports' && '⚽'}
                  {category === 'Toys' && '🧸'}
                  {category === 'Beauty' && '💄'}
                  {category === 'Food' && '🍔'}
                  {category === 'Other' && '📦'}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                {category}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Featured Products</h2>
            <p className="mt-4 text-lg text-gray-500">
              Check out our handpicked selection of amazing products
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
            {featuredProducts.map((product) => (
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
                    <Link to={`/products/${product._id}`} className="hover:indigo-600">
                      {product.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                  <p className="mt-2 text-lg font-medium text-gray-900">
                    ${product.hasDiscount ? product.discountedPrice.toFixed(2) : product.price.toFixed(2)}
                    {product.hasDiscount && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {featuredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white">
            Ready to start shopping?
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Join thousands of satisfied customers who trust ShopHub for their shopping needs.
          </p>
          <Link
            to="/products"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-800 sm:w-auto"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}
