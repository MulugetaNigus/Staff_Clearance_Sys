import React, { useState, useEffect, useRef } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { dashboardService } from '../services/dashboardService';
import { toastUtils } from '../utils/toastUtils';
import Button from './ui/Button';
import Card from './ui/Card';
import { Download, FileText, PieChart as PieChartIcon, BarChart as BarChartIcon, TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ReportsDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await dashboardService.getReportStats();
                if (response.success) {
                    setStats(response.data);
                }
            } catch (err) {
                setError('Failed to load report statistics.');
                toastUtils.error('Could not load reports.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const exportPDF = () => {
        if (!stats) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(41, 128, 185);
        doc.text('Teacher Clearance System - Analytics Report', 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        // 1. Department Stats
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('Clearance Requests by Department', 14, 45);

        const deptData = stats.byDepartment.map((item: any) => [item.name, item.value]);
        autoTable(doc, {
            startY: 50,
            head: [['Department', 'Count']],
            body: deptData,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });

        // 2. Status Stats
        let finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.text('Request Status Distribution', 14, finalY);

        const statusData = stats.byStatus.map((item: any) => [item.name.toUpperCase(), item.value]);
        autoTable(doc, {
            startY: finalY + 5,
            head: [['Status', 'Count']],
            body: statusData,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] }
        });

        // 3. Trend Stats
        finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.text('Monthly Trends (Last 6 Months)', 14, finalY);

        const trendData = stats.trends.map((item: any) => [item.name, item.value]);
        autoTable(doc, {
            startY: finalY + 5,
            head: [['Month', 'Requests']],
            body: trendData,
            theme: 'grid',
            headStyles: { fillColor: [245, 158, 11] }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text('Confidential Report - Internal Use Only', 14, doc.internal.pageSize.height - 10);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
        }

        doc.save('tcs-analytics-report.pdf');
        toastUtils.success('Report downloaded successfully!');
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-80 bg-gray-100 rounded-xl animate-pulse"></div>
                    <div className="h-80 bg-gray-100 rounded-xl animate-pulse"></div>
                </div>
                <div className="h-80 bg-gray-100 rounded-xl animate-pulse"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-600 font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans_Variable']">Analytics & Reports</h2>
                    <p className="text-gray-500 text-sm mt-1">Visualize system performance and export data</p>
                </div>
                <Button
                    onClick={exportPDF}
                    icon={Download}
                    variant="primary"
                >
                    Export PDF Report
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Chart */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BarChartIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Requests by Department</h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.byDepartment}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Requests" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Status Chart */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <PieChartIcon className="h-5 w-5 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Status Distribution</h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.byStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {stats?.byStatus.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Trend Chart */}
                <Card className="p-6 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Monthly Request Trends</h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats?.trends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
                                    dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 8 }}
                                    name="Requests"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ReportsDashboard;
