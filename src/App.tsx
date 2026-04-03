/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Categories from './components/Categories';
import Budget from './components/Budget';
import Goals from './components/Goals';
import Home from './components/Home';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
      />
      <Route 
        path="/auth" 
        element={<Navigate to="/login" replace />} 
      />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/auth" replace />}
      />
      <Route
        path="/transactions"
        element={user ? <Layout><Transactions /></Layout> : <Navigate to="/auth" replace />}
      />
      <Route
        path="/goals"
        element={user ? <Layout><Goals /></Layout> : <Navigate to="/auth" replace />}
      />
      <Route
        path="/categories"
        element={user ? <Layout><Categories /></Layout> : <Navigate to="/auth" replace />}
      />
      <Route
        path="/budget"
        element={user ? <Layout><Budget /></Layout> : <Navigate to="/auth" replace />}
      />
      <Route
        path="/profile"
        element={user ? <Layout><Profile /></Layout> : <Navigate to="/auth" replace />}
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
