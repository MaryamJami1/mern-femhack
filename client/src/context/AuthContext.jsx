"use client"

import { createContext, useState, useEffect } from "react"
import axios from '../api/axios';

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common["Authorization"]
    }
  }, [token])

  // Check if user is logged in on page load
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        // Extract user info from token (since there's no /me endpoint)
        const tokenParts = token.split(".")
        if (tokenParts.length !== 3) {
          throw new Error("Invalid token format")
        }

        const payload = JSON.parse(atob(tokenParts[1]))
        if (!payload || !payload.id) {
          throw new Error("Invalid token payload")
        }

        setUser({
          _id: payload.id,
         
        })
        setLoading(false)
      } catch (err) {
        console.error("Error loading user:", err)
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
        setLoading(false)
      }
    }

    loadUser()
  }, [token])

  // Register user
  const register = async (userData) => {
    try {
      setError(null)
      const res = await axios.post("/api/users/register", userData)
      localStorage.setItem("token", res.data.token)
      setToken(res.data.token)
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
      })
      return res.data
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
      throw err
    }
  }

  // Login user
  const login = async (userData) => {
    try {
      setError(null)
      const res = await axios.post("/api/users/login", userData)
      localStorage.setItem("token", res.data.token)
      setToken(res.data.token)
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
      })
      return res.data
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
      throw err
    }
  }

  // Logout user
  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
