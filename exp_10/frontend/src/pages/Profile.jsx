import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [message, setMessage] = useState('')
  const { logout } = useAuth()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/auth/me')
        setUser(response.data.data.user)
        setFormData({
          firstName: response.data.data.user.firstName,
          lastName: response.data.data.user.lastName,
          phone: response.data.data.user.phone || ''
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.put('/auth/profile', formData)
      setUser(prev => ({
        ...prev,
        ...formData
      }))
      setEditing(false)
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to update profile')
    }
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
      <div className="md:flex md:space-x-8">
        {/* Sidebar */}
        <div className="md:w-64">
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-white text-xl font-medium">
                    {user?.firstName?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-6 py-4">
              <nav className="space-y-1">
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-indigo-600 bg-indigo-50"
                >
                  Profile
                </Link>
                <Link
                  to="/orders"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  Orders
                </Link>
                <Link
                  to="/cart"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  Cart
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:flex-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Profile Information
                </h3>
                <button
                  onClick={() => setEditing(!editing)}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>
            
            {message && (
              <div className="mx-4 mt-4 rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-800">{message}</p>
              </div>
            )}

            <div className="px-4 py-5 sm:p-6">
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="col-span-6">
                    <div className="text-sm text-gray-500">
                      Email: {user?.email}
                    </div>
                  </div>

                  <div className="col-span-6">
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <p className="text-sm font-medium text-gray-900">First Name</p>
                      <p className="mt-1 text-sm text-gray-500">{user?.firstName}</p>
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <p className="text-sm font-medium text-gray-900">Last Name</p>
                      <p className="mt-1 text-sm text-gray-500">{user?.lastName}</p>
                    </div>
                  </div>

                  <div className="col-span-6">
                    <p className="text-sm font-medium text-gray-900">Email Address</p>
                    <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
                  </div>

                  <div className="col-span-6">
                    <p className="text-sm font-medium text-gray-900">Phone Number</p>
                    <p className="mt-1 text-sm text-gray-500">{user?.phone || 'Not provided'}</p>
                  </div>

                  <div className="col-span-6">
                    <p className="text-sm font-medium text-gray-900">Member Since</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
