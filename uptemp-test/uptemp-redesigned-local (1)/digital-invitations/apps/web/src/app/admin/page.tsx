'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalInvitations: number;
  publishedInvitations: number;
  totalGuests: number;
  activeTemplates: number;
  bulkRequests: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, color: 'bg-blue-500', href: '/admin/users' },
    { label: 'Total Invitations', value: stats?.totalInvitations || 0, color: 'bg-purple-500', href: '/admin/invitations' },
    { label: 'Published', value: stats?.publishedInvitations || 0, color: 'bg-green-500', href: '/admin/invitations' },
    { label: 'Total Guests', value: stats?.totalGuests || 0, color: 'bg-amber-500', href: '/admin/invitations' },
    { label: 'Templates', value: stats?.activeTemplates || 0, color: 'bg-pink-500', href: '/admin/templates' },
    { label: 'Pending Bulk Requests', value: stats?.bulkRequests || 0, color: 'bg-red-500', href: '/admin/invitations' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-xl font-bold text-primary-600">
                Admin Panel
              </Link>
              <Link href="/admin/users" className="text-gray-600 hover:text-gray-900">
                Users
              </Link>
              <Link href="/admin/invitations" className="text-gray-600 hover:text-gray-900">
                Invitations
              </Link>
              <Link href="/admin/templates" className="text-gray-600 hover:text-gray-900">
                Templates
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <Link href="/dashboard" className="text-sm text-primary-600 hover:text-primary-700">
                Customer Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <span className="text-white text-xl font-bold">{card.value}</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/admin/users"
                className="block w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                Manage Users
              </Link>
              <Link
                href="/admin/invitations"
                className="block w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                View All Invitations
              </Link>
              <Link
                href="/admin/templates"
                className="block w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                Manage Templates
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Database</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">API Server</span>
                <span className="text-green-600 font-medium">Running</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Redis</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
