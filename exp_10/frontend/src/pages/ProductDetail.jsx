import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [error, setError] = useState('')
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/products/${id}`)
        setProduct(response.data.data)
      } catch (error) {
        setError('Product not found')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setError('Please login to add items to cart')
      return
    }

    try {
      setAddingToCart(true)
      await axios.post('/cart/add', {
        productId: product._id,
        quantity
      })
      setError('')
      setQuantity(1)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Product not found'}
          </h1>
          <Link
            to="/products"
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        {/* Product Images */}
        <div className="lg:max-w-lg lg:self-start">
          <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
            {product.mainImage ? (
              <img
                src={product.mainImage.url}
                alt={product.mainImage.alt || product.name}
                className="w-full h-full object-center object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          
          {/* Additional images */}
          {product.images && product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((image, index) => (
                <div key={index} className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.alt || `${product.name} ${index + 2}`}
                    className="w-full h-full object-center object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            {product.name}
          </h1>

          <div className="mt-3">
            <p className="text-3xl text-gray-900">
              ${product.hasDiscount ? product.discountedPrice.toFixed(2) : product.price.toFixed(2)}
              {product.hasDiscount && (
                <span className="ml-2 text-lg text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </p>
            {product.hasDiscount && (
              <p className="mt-1 text-sm text-green-600">
                Save ${(product.price - product.discountedPrice).toFixed(2)} ({product.discount.percentage}% off)
              </p>
            )}
          </div>

          {/* Reviews */}
          <div className="mt-6">
            <div className="flex items-center">
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <svg
                    key={rating}
                    className={`h-5 w-5 ${
                      rating < Math.floor(product.rating.average)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="ml-2 text-sm text-gray-500">
                {product.rating.count} reviews
              </p>
            </div>
          </div>

          {/* Stock Status */}
          <div className="mt-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              product.isOutOfStock 
                ? 'bg-red-100 text-red-800'
                : product.isLowStock
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {product.isOutOfStock ? 'Out of Stock' : product.isLowStock ? 'Low Stock' : 'In Stock'}
            </span>
            <p className="mt-2 text-sm text-gray-500">
              {product.availableQuantity} items available
            </p>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900">Description</h3>
            <div className="mt-2 space-y-6">
              <p className="text-base text-gray-700">{product.description}</p>
            </div>
          </div>

          {/* Product Details */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-sm font-medium text-gray-900">Product Details</h2>
            <div className="mt-4 space-y-4">
              <div className="flex">
                <p className="text-sm font-medium text-gray-900 w-24">Category:</p>
                <p className="text-sm text-gray-700">{product.category}</p>
              </div>
              {product.subcategory && (
                <div className="flex">
                  <p className="text-sm font-medium text-gray-900 w-24">Subcategory:</p>
                  <p className="text-sm text-gray-700">{product.subcategory}</p>
                </div>
              )}
              {product.brand && (
                <div className="flex">
                  <p className="text-sm font-medium text-gray-900 w-24">Brand:</p>
                  <p className="text-sm text-gray-700">{product.brand}</p>
                </div>
              )}
              <div className="flex">
                <p className="text-sm font-medium text-gray-900 w-24">SKU:</p>
                <p className="text-sm text-gray-700">{product.sku}</p>
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="mt-10">
            {product.isOutOfStock ? (
              <button
                disabled
                className="w-full bg-gray-400 text-white py-3 px-8 rounded-md text-base font-medium cursor-not-allowed"
              >
                Out of Stock
              </button>
            ) : (
              <div className="flex space-x-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.availableQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(product.availableQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center border-0 focus:ring-0"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.availableQuantity, quantity + 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900"
                  >
                    +
                  </button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 bg-indigo-600 text-white py-3 px-8 rounded-md text-base font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Add to Cart'
                  )}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
