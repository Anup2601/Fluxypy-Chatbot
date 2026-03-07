'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, BookOpen, Zap } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1">
          Track your chatbot performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Conversations', value: '—', icon: MessageSquare, color: 'text-indigo-500' },
          { label: 'Unique Visitors', value: '—', icon: Users, color: 'text-green-500' },
          { label: 'Knowledge Sources', value: '—', icon: BookOpen, color: 'text-purple-500' },
          { label: 'API Calls', value: '—', icon: Zap, color: 'text-orange-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                {stat.label}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-400">
                {stat.value}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Coming in next phase
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Zap className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="font-semibold text-slate-600">
            Analytics Coming Soon
          </h3>
          <p className="text-sm text-slate-400 mt-1 text-center max-w-sm">
            Detailed analytics including conversation trends, popular questions,
            and lead tracking will be available in the next update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}