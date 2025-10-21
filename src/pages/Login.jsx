"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useApp } from "../context/AppContext"
import { loginUser } from "../service/authService"
import { toast } from "react-toastify"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useApp()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await loginUser({ credential: username, password })
    if (res.statusCode !== 200){
      toast.error(res.message)
      return;
    }
    if (login(username, password)) {
      navigate("/home")
    } else {
      setError("Invalid credentials")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ig-bg dark:bg-black p-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Main Card */}
        <div className="card p-10">
          <h1 className="text-4xl font-bold text-center mb-8">Instagram</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button type="submit" className="w-full btn-primary">
              Log In
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
            <span className="text-gray-500 text-sm font-semibold">OR</span>
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
          </div>

          <button className="w-full text-ig-primary font-semibold text-sm">Log in with Facebook</button>

          <Link to="/forgot-password" className="block text-center text-xs text-gray-500 mt-4">
            Forgot password?
          </Link>
        </div>

        {/* Sign Up Card */}
        <div className="card p-6 text-center">
          <p className="text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-ig-primary font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
