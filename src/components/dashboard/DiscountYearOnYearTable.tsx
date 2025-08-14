
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DiscountYearOnYearTableProps {
  data: SalesData[];
  filters?: any;
}

export const DiscountYearOnYearTable: React.FC<DiscountYearOnYearTableProps> = ({ data, filters }) => {
  const processedData = useMemo(() => {
    const discountedData = data.filter(item => (item.discountAmount || 0) > 0);
    
    // Group by year and month
    const yearMonthData = discountedData.reduce((acc, item) => {
      const date = new Date(item.paymentDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleDateString('en-US', { month: 'long' });
      const key = `${monthName}`;
      
      if (!acc[key]) {
        acc[key] = { month: monthName, years: {} };
      }
      
      if (!acc[key].years[year]) {
        acc[key].years[year] = {
          transactions: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          totalPotentialRevenue: 0,
          uniqueCustomers: new Set(),
          discountPercentages: []
        };
      }

      acc[key].years[year].transactions += 1;
      acc[key].years[year].totalDiscount += item.discountAmount || 0;
      acc[key].years[year].totalRevenue += item.paymentValue || 0;
      acc[key].years[year].totalPotentialRevenue += item.mrpPostTax || item.paymentValue || 0;
      acc[key].years[year].uniqueCustomers.add(item.customerEmail);
      acc[key].years[year].discountPercentages.push(item.discountPercentage || 0);

      return acc;
    }, {} as Record<string, any>);

    // Convert to table format
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return months.map(month => {
      const monthData = yearMonthData[month];
      if (!monthData) {
        return {
          month,
          transactions2024: 0,
          transactions2025: 0,
          discount2024: 0,
          discount2025: 0,
          revenue2024: 0,
          revenue2025: 0,
          atv2024: 0,
          atv2025: 0,
          customers2024: 0,
          customers2025: 0,
          transactionChange: 0,
          discountChange: 0,
          revenueChange: 0,
          atvChange: 0
        };
      }

      const data2024 = monthData.years[2024] || { transactions: 0, totalDiscount: 0, totalRevenue: 0, totalPotentialRevenue: 0, uniqueCustomers: new Set() };
      const data2025 = monthData.years[2025] || { transactions: 0, totalDiscount: 0, totalRevenue: 0, totalPotentialRevenue: 0, uniqueCustomers: new Set() };

      const transactions2024 = data2024.transactions;
      const transactions2025 = data2025.transactions;
      const discount2024 = data2024.totalDiscount;
      const discount2025 = data2025.totalDiscount;
      const revenue2024 = data2024.totalRevenue;
      const revenue2025 = data2025.totalRevenue;
      const atv2024 = transactions2024 > 0 ? revenue2024 / transactions2024 : 0;
      const atv2025 = transactions2025 > 0 ? revenue2025 / transactions2025 : 0;

      return {
        month,
        transactions2024,
        transactions2025,
        discount2024,
        discount2025,
        revenue2024,
        revenue2025,
        atv2024,
        atv2025,
        customers2024: data2024.uniqueCustomers.size,
        customers2025: data2025.uniqueCustomers.size,
        transactionChange: transactions2024 > 0 ? ((transactions2025 - transactions2024) / transactions2024) * 100 : 0,
        discountChange: discount2024 > 0 ? ((discount2025 - discount2024) / discount2024) * 100 : 0,
        revenueChange: revenue2024 > 0 ? ((revenue2025 - revenue2024) / revenue2024) * 100 : 0,
        atvChange: atv2024 > 0 ? ((atv2025 - atv2024) / atv2024) * 100 : 0
      };
    });
  }, [data]);

  const totals = useMemo(() => {
    return processedData.reduce((acc, row) => ({
      transactions2024: acc.transactions2024 + row.transactions2024,
      transactions2025: acc.transactions2025 + row.transactions2025,
      discount2024: acc.discount2024 + row.discount2024,
      discount2025: acc.discount2025 + row.discount2025,
      revenue2024: acc.revenue2024 + row.revenue2024,
      revenue2025: acc.revenue2025 + row.revenue2025,
      customers2024: acc.customers2024 + row.customers2024,
      customers2025: acc.customers2025 + row.customers2025
    }), { 
      transactions2024: 0, transactions2025: 0, 
      discount2024: 0, discount2025: 0, 
      revenue2024: 0, revenue2025: 0,
      customers2024: 0, customers2025: 0
    });
  }, [processedData]);

  const columns = [
    { 
      key: 'month', 
      header: 'Month', 
      align: 'left' as const,
      render: (value: string) => <span className="font-semibold text-slate-800">{value}</span>
    },
    { 
      key: 'transactions2024', 
      header: '2024 Transactions', 
      align: 'center' as const,
      render: (value: number) => <span className="font-medium">{formatNumber(value)}</span>
    },
    { 
      key: 'transactions2025', 
      header: '2025 Transactions', 
      align: 'center' as const,
      render: (value: number) => <span className="font-medium">{formatNumber(value)}</span>
    },
    { 
      key: 'transactionChange', 
      header: 'Transaction Change', 
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant={value >= 0 ? "default" : "destructive"} className="min-w-[70px] justify-center">
          {value > 0 ? '+' : ''}{value.toFixed(1)}%
        </Badge>
      )
    },
    { 
      key: 'discount2024', 
      header: '2024 Discount', 
      align: 'center' as const,
      render: (value: number) => <span className="text-red-600 font-medium">{formatCurrency(value)}</span>
    },
    { 
      key: 'discount2025', 
      header: '2025 Discount', 
      align: 'center' as const,
      render: (value: number) => <span className="text-red-600 font-medium">{formatCurrency(value)}</span>
    },
    { 
      key: 'discountChange', 
      header: 'Discount Change', 
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant={value <= 0 ? "default" : "destructive"} className="min-w-[70px] justify-center">
          {value > 0 ? '+' : ''}{value.toFixed(1)}%
        </Badge>
      )
    },
    { 
      key: 'atv2024', 
      header: '2024 ATV', 
      align: 'center' as const,
      render: (value: number) => <span className="text-blue-600 font-medium">{formatCurrency(value)}</span>
    },
    { 
      key: 'atv2025', 
      header: '2025 ATV', 
      align: 'center' as const,
      render: (value: number) => <span className="text-blue-600 font-medium">{formatCurrency(value)}</span>
    },
    { 
      key: 'atvChange', 
      header: 'ATV Change', 
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant={value >= 0 ? "default" : "destructive"} className="min-w-[70px] justify-center">
          {value > 0 ? '+' : ''}{value.toFixed(1)}%
        </Badge>
      )
    }
  ];

  const footerData = {
    month: 'TOTAL',
    transactions2024: totals.transactions2024,
    transactions2025: totals.transactions2025,
    discount2024: totals.discount2024,
    discount2025: totals.discount2025,
    revenue2024: totals.revenue2024,
    revenue2025: totals.revenue2025,
    customers2024: totals.customers2024,
    customers2025: totals.customers2025,
    transactionChange: totals.transactions2024 > 0 ? ((totals.transactions2025 - totals.transactions2024) / totals.transactions2024) * 100 : 0,
    discountChange: totals.discount2024 > 0 ? ((totals.discount2025 - totals.discount2024) / totals.discount2024) * 100 : 0,
    revenueChange: totals.revenue2024 > 0 ? ((totals.revenue2025 - totals.revenue2024) / totals.revenue2024) * 100 : 0,
    atv2024: totals.transactions2024 > 0 ? totals.revenue2024 / totals.transactions2024 : 0,
    atv2025: totals.transactions2025 > 0 ? totals.revenue2025 / totals.transactions2025 : 0,
    atvChange: totals.transactions2024 > 0 && totals.revenue2024 > 0 && totals.transactions2025 > 0 && totals.revenue2025 > 0 ? 
      (((totals.revenue2025 / totals.transactions2025) - (totals.revenue2024 / totals.transactions2024)) / (totals.revenue2024 / totals.transactions2024)) * 100 : 0
  };

  return (
    <Card className="bg-gradient-to-br from-white via-purple-50/30 to-blue-50/20 border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-600" />
          Year-on-Year Discount Comparison (2024 vs 2025)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ModernDataTable
          data={processedData}
          columns={columns}
          showFooter={true}
          footerData={footerData}
          maxHeight="500px"
          stickyHeader={true}
        />
        
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-800 mb-2">Year-on-Year Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-600">2024 Total Discount:</span>
              <div className="font-semibold text-red-600">{formatCurrency(totals.discount2024)}</div>
            </div>
            <div>
              <span className="text-slate-600">2025 Total Discount:</span>
              <div className="font-semibold text-red-600">{formatCurrency(totals.discount2025)}</div>
            </div>
            <div>
              <span className="text-slate-600">Discount Change:</span>
              <div className={`font-semibold ${totals.discount2024 > 0 ? 
                ((totals.discount2025 - totals.discount2024) / totals.discount2024) * 100 > 0 ? 'text-red-600' : 'text-green-600'
                : 'text-slate-600'}`}>
                {totals.discount2024 > 0 ? 
                  `${((totals.discount2025 - totals.discount2024) / totals.discount2024) * 100 > 0 ? '+' : ''}${(((totals.discount2025 - totals.discount2024) / totals.discount2024) * 100).toFixed(1)}%`
                  : 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-slate-600">Revenue Impact:</span>
              <div className="font-semibold">{formatCurrency(totals.revenue2025 - totals.revenue2024)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
