'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Target, Activity, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-hi mb-2">Dashboard</h1>
        <p className="text-text-mid">Overview of your advertising performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-mid">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-text-mid" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-hi">$45,231</div>
            <p className="text-xs text-accent-lime">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-mid">Conversions</CardTitle>
            <Target className="h-4 w-4 text-text-mid" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-hi">2,350</div>
            <p className="text-xs text-accent-lime">
              +180 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-mid">ROAS</CardTitle>
            <TrendingUp className="h-4 w-4 text-text-mid" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-hi">3.2x</div>
            <p className="text-xs text-accent-lime">
              +0.4x improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-mid">Active Campaigns</CardTitle>
            <Activity className="h-4 w-4 text-text-mid" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-hi">12</div>
            <p className="text-xs text-text-mid">
              Across 3 platforms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/campaigns">
          <Card className="cursor-pointer hover:bg-carbon-800 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg text-text-hi">Campaigns</CardTitle>
              <CardDescription>View and manage your advertising campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-accent-cyan">
                <span className="text-sm">View campaigns</span>
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/optimizations">
          <Card className="cursor-pointer hover:bg-carbon-800 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg text-text-hi">Optimizations</CardTitle>
              <CardDescription>AI-powered recommendations and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-accent-cyan">
                <span className="text-sm">View optimizations</span>
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/conversions">
          <Card className="cursor-pointer hover:bg-carbon-800 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg text-text-hi">Conversions</CardTitle>
              <CardDescription>Track conversion events and attribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-accent-cyan">
                <span className="text-sm">View conversions</span>
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-text-hi">Recent Activity</CardTitle>
          <CardDescription>Latest updates from your campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b border-stroke-1">
              <div className="w-2 h-2 mt-2 rounded-full bg-accent-lime" />
              <div className="flex-1">
                <p className="text-sm text-text-hi">Campaign "Q4 Brand Awareness" launched successfully</p>
                <p className="text-xs text-text-low mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4 pb-4 border-b border-stroke-1">
              <div className="w-2 h-2 mt-2 rounded-full bg-accent-cyan" />
              <div className="flex-1">
                <p className="text-sm text-text-hi">12 new optimization recommendations available</p>
                <p className="text-xs text-text-low mt-1">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-accent-amber" />
              <div className="flex-1">
                <p className="text-sm text-text-hi">Budget threshold reached for "Product Launch"</p>
                <p className="text-xs text-text-low mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
