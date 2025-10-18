"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useApp } from "../context/AppContext"

export default function Signup() {
  const navigate = useNavigate()
  const { login } = useApp()
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    // Mock signup - just log them in
    login(username, password)
    navigate("/home")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ig-bg dark:bg-black p-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Main Card */}
        <div className="card p-10">
          <h1 className="text-4xl font-bold text-center mb-2">Instagram</h1>
          <p className="text-center text-gray-500 text-sm mb-6">Sign up to see photos and videos from your friends.</p>

          <button className="w-full btn-primary mb-4">Log in with Facebook</button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
            <span className="text-gray-500 text-sm font-semibold">OR</span>
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              required
            />
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

            <p className="text-xs text-gray-500 text-center">
              By signing up, you agree to our Terms, Data Policy and Cookies Policy.
            </p>

            <button type="submit" className="w-full btn-primary">
              Sign Up
            </button>
          </form>
        </div>

        {/* Login Card */}
        <div className="card p-6 text-center">
          <p className="text-sm">
            Have an account?{" "}
            <Link to="/login" className="text-ig-primary font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
