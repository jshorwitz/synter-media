'use client';

import { formatCurrency, formatNumber, getPlatformColor } from '@/lib/utils';

interface AttributionData {
  platform: string;
  campaign: string;
  clicks: number;
  conversions: number;
  spend: number;
  cac: number;
  roas: number;
  revenue: number;
}

interface AttributionTableProps {
  data?: AttributionData[];
}

export function AttributionTable({ data = [] }: AttributionTableProps) {
  if (!data.length) {
    return (
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Attribution Report</h3>
          <a
            href="/attribution"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View all →
          </a>
        </div>
        
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-white">No attribution data</h3>
          <p className="mt-1 text-sm text-slate-400">
            Attribution data will appear here once campaigns are running.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">Attribution Report</h3>
            <p className="mt-1 text-sm text-slate-400">
              Last-touch attribution by campaign
            </p>
          </div>
          <a
            href="/attribution"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View all →
          </a>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Clicks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Conv.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Spend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">CAC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data.slice(0, 5).map((item, index) => (
                <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-white truncate">
                        {item.campaign}
                      </div>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPlatformColor(item.platform)}`}>
                          {item.platform}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                    {formatNumber(item.clicks)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                    {formatNumber(item.conversions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                    {formatCurrency(item.spend)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={item.cac > 100 ? 'text-red-400' : item.cac > 50 ? 'text-yellow-400' : 'text-green-400'}>
                      {formatCurrency(item.cac)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={item.roas < 2 ? 'text-red-400' : item.roas < 4 ? 'text-yellow-400' : 'text-green-400'}>
                      {item.roas.toFixed(2)}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
