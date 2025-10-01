'use client';

import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VitalSign, VitalSignType, vitalSignTypeLabels } from '@/types/vital-signs';

interface VitalSignsChartProps {
  patientId: string;
}

export function VitalSignsChart({ patientId }: VitalSignsChartProps) {
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [selectedType, setSelectedType] = useState<VitalSignType>(VitalSignType.HEART_RATE);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVitalSigns = async () => {
      try {
        setLoading(true);
        const { vitalSignsService } = await import('@/services/vital-signs');
        const history = await vitalSignsService.getPatientHistory(patientId, {
          type: selectedType,
          days,
        });
        setVitalSigns(history);
      } catch (error) {
        console.error('Error loading vital signs history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVitalSigns();
  }, [patientId, selectedType, days]);

  const chartData = vitalSigns.map((vs) => ({
    date: format(new Date(vs.measuredAt), 'MMM dd'),
    time: format(new Date(vs.measuredAt), 'HH:mm'),
    value: parseFloat(vs.value) || 0,
    isAbnormal: vs.isAbnormal,
    notes: vs.notes,
    measuredBy: vs.measuredBy,
  }));

  const maxValue = Math.max(...chartData.map(d => d.value), 0);
  const minValue = Math.min(...chartData.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Vital Signs Trend</CardTitle>
          <div className="flex space-x-4">
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as VitalSignType)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(vitalSignTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={days.toString()} onValueChange={(value) => setDays(parseInt(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {chartData.length > 0 ? (
          <div className="space-y-4">
            {/* Simple line chart representation */}
            <div className="relative h-64 border rounded-lg p-4 bg-gray-50">
              <div className="absolute inset-4">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
                  <span>{maxValue.toFixed(1)}</span>
                  <span>{((maxValue + minValue) / 2).toFixed(1)}</span>
                  <span>{minValue.toFixed(1)}</span>
                </div>

                {/* Chart area */}
                <div className="ml-8 h-full relative">
                  <svg className="w-full h-full">
                    {/* Grid lines */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Data points and lines */}
                    {chartData.map((point, index) => {
                      const x = (index / (chartData.length - 1 || 1)) * 100;
                      const y = 100 - ((point.value - minValue) / range) * 100;

                      return (
                        <g key={index}>
                          {/* Line to next point */}
                          {index < chartData.length - 1 && (
                            <line
                              x1={`${x}%`}
                              y1={`${y}%`}
                              x2={`${((index + 1) / (chartData.length - 1)) * 100}%`}
                              y2={`${100 - ((chartData[index + 1].value - minValue) / range) * 100}%`}
                              stroke={point.isAbnormal ? "#ef4444" : "#3b82f6"}
                              strokeWidth="2"
                            />
                          )}

                          {/* Data point */}
                          <circle
                            cx={`${x}%`}
                            cy={`${y}%`}
                            r="4"
                            fill={point.isAbnormal ? "#ef4444" : "#3b82f6"}
                            className="hover:r-6 transition-all cursor-pointer"
                            title={`${point.date} ${point.time}: ${point.value}`}
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className="ml-8 mt-2 flex justify-between text-xs text-gray-500">
                  {chartData.length > 0 && (
                    <>
                      <span>{chartData[0].date}</span>
                      {chartData.length > 2 && (
                        <span>{chartData[Math.floor(chartData.length / 2)].date}</span>
                      )}
                      <span>{chartData[chartData.length - 1].date}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Normal</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Abnormal</span>
              </div>
            </div>

            {/* Recent values table */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Recent Values</h4>
              <div className="space-y-2">
                {chartData.slice(-5).reverse().map((point, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          point.isAbnormal ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                      ></div>
                      <span className="text-sm font-medium">
                        {point.date} at {point.time}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{point.value}</span>
                      {point.measuredBy && (
                        <div className="text-xs text-gray-500">by {point.measuredBy}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📈</div>
            <p className="text-lg mb-2">No data available</p>
            <p className="text-sm">
              No {vitalSignTypeLabels[selectedType].toLowerCase()} readings found for the selected period
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}