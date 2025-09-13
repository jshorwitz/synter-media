'use client';

import React from 'react';
import Link from 'next/link';

export default function SettingsHome() {
  const sections = [
    {
      title: 'Billing & Usage',
      description: 'Manage your account balance, purchase credits, and view billing history',
      href: '/settings/billing',
      icon: '💳',
      stats: [
        { label: 'Current Balance', value: '$125.00' },
        { label: 'This Month', value: '$45.00' }
      ]
    },
    {
      title: 'Team Management',
      description: 'Invite team members, manage roles, and control access permissions',
      href: '/settings/team',
      icon: '👥',
      stats: [
        { label: 'Team Members', value: '5' },
        { label: 'Pending Invites', value: '2' }
      ]
    },
    {
      title: 'Sharing & Reports',
      description: 'Create sharing policies and manage report access for external users',
      href: '/settings/sharing',
      icon: '📊',
      stats: [
        { label: 'Active Shares', value: '12' },
        { label: 'Policies', value: '4' }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account, team, and sharing preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-gray-300"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{section.icon}</span>
                <h2 className="text-xl font-semibold text-gray-900">
                  {section.title}
                </h2>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">
                {section.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {section.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/settings/billing"
            className="bg-white rounded-md p-4 text-center hover:bg-gray-50 transition-colors"
          >
            <div className="text-green-600 text-xl mb-2">💰</div>
            <div className="font-medium text-gray-900">Purchase Credits</div>
            <div className="text-sm text-gray-600">Add funds to your account</div>
          </Link>
          
          <Link
            href="/settings/team"
            className="bg-white rounded-md p-4 text-center hover:bg-gray-50 transition-colors"
          >
            <div className="text-blue-600 text-xl mb-2">✉️</div>
            <div className="font-medium text-gray-900">Invite Member</div>
            <div className="text-sm text-gray-600">Add someone to your team</div>
          </Link>
          
          <Link
            href="/settings/sharing"
            className="bg-white rounded-md p-4 text-center hover:bg-gray-50 transition-colors"
          >
            <div className="text-purple-600 text-xl mb-2">🔗</div>
            <div className="font-medium text-gray-900">Share Report</div>
            <div className="text-sm text-gray-600">Create a public report link</div>
          </Link>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Need help? Check out our{' '}
          <a href="/docs" className="text-blue-600 hover:text-blue-800">
            documentation
          </a>{' '}
          or{' '}
          <a href="/support" className="text-blue-600 hover:text-blue-800">
            contact support
          </a>
          .
        </p>
      </div>
    </div>
  );
}
