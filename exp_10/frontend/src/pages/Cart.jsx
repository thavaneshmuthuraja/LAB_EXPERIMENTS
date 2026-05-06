import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

export default function Cart() {
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) return

    const fetchCart = async () => {
      try {
        const response = await axios.get('/cart')
        setCart(response.data.data)
      } catch (error) {
        console.error('Error fetching cart:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [isAuthenticated])

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      setUpdating(prev => ({ ...prev, [itemId]: true }))
      await axios.put(`/cart/update/${itemId}`, { quantity: newQuantity })
      
      setCart(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item._id === itemId 
            ? { ...item, quantity: newQuantity }
            : item
        ),
        total: prev.items.reduce((sum, item) => {
          if (item._id === itemId) {
            return sum + (item.product.price * newQuantity)
          }
          return sum + (item.product.price * item.quantity)
        }, 0)
      }))
    } catch (error) {
      console.error('Error updating cart:', error)
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }))
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      setUpdating(prev => ({ ...prev, [itemId]: true }))
      await axios.delete(`/cart/remove/${itemId}`)
      
      setCart(prev => {
        const removedItem = prev.items.find(item => item._id === itemId)
        const newItems = prev.items.filter(item => item._id !== itemId)
        const newTotal = prev.total - (removedItem.product.price * removedItem.quantity)
        
        return {
          items: newItems,
          total: newTotal,
          count: newItems.length
        }
      })
    } catch (error) {
      console.error('Error removing from cart:', error)
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }))
    }
  }

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return

    try {
      await axios.delete('/cart/clear')
      setCart({ items: [], total: 0, count: 0 })
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please login to view your cart
          </h1>
          <Link
            to="/login"
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Login
          </Link>
        </div>
      </div>
    )
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
      <h1 className="text-3xl font-extrabold text-gray-900">Shopping Cart</h1>

      {cart.items.length === 0 ? (
        <div className="mt-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            to="/products"
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Cart Items */}
          <div className="lg:col-span-7">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <li key={item._id} className="flex py-6 px-4 sm:px-6">
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.mainImage?.url || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-20 h-20 rounded-md object-center object-cover"
                      />
                    </div>
                    
                    <div className="ml-4 flex-1 flex flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>
                            <Link 
                              to={`/products/${item.product._id}`}
                              className="hover:text-indigo-600"
                            >
                              {item.product.name}
                            </Link>
                          </h3>
                          <p className="ml-4 text-lg font-medium text-gray-900">
                            ${item.product.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.product.category}
                        </p>
                      </div>
                      
                      <div className="flex-1 flex items-end justify-between text-sm">
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            disabled={updating[item._id]}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                            className="mx-2 w-16 text-center border border-gray-300 rounded-md py-1"
                            disabled={updating[item._id]}
                          />
                          
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            disabled={updating[item._id]}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <p className="text-gray-900">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            disabled={updating[item._id]}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-12 lg:mt-0 lg:col-span-5">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
              
              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-base">
                  <p>Subtotal</p>
                  <p>${cart.total.toFixed(2)}</p>
                </div>
                
                <div className="flex justify-between text-base">
                  <p>Shipping</p>
                  <p>{cart.total > 100 ? 'FREE' : '$10.00'}</p>
                </div>
                
                <div className="flex justify-between text-base">
                  <p>Tax</p>
                  <p>${(cart.total * 0.08).toFixed(2)}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-medium text-gray-900">
                    <p>Order Total</p>
                    <p>${(cart.total + (cart.total > 100 ? 0 : 10) + (cart.total * 0.08)).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  to="/checkout"
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 text-center block"
                >
                  Proceed to Checkout
                </Link>
                
                <button
                  onClick={clearCart}
                  className="w-full bg-white text-indigo-600 py-3 px-4 rounded-md hover:bg-gray-50 border border-indigo-600"
                >
                  Clear Cart
                </button>
                
                <Link
                  to="/products"
                  className="w-full text-center text-indigo-600 hover:text-indigo-500 block"
                >
                  Continue Shopping
                </Link>
              </div>

              {cart.total < 100 && (
                <div className="mt-4 text-sm text-gray-500">
                  Add ${(100 - cart.total).toFixed(2)} more to qualify for free shipping!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
