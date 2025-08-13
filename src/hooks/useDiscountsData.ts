
import { useState, useEffect, useMemo } from 'react';
import { useGoogleSheets } from './useGoogleSheets';
import { SalesData } from '@/types/dashboard';

export const useDiscountsData = () => {
  const { data: salesData, loading, error } = useGoogleSheets();
  const [discountData, setDiscountData] = useState<SalesData[]>([]);

  useEffect(() => {
    if (salesData && salesData.length > 0) {
      try {
        console.log('Processing sales data for discounts...', salesData.length, 'items');
        
        const processedData: SalesData[] = salesData.map((item: any) => {
          // Parse date correctly - handle DD/MM/YYYY HH:mm:ss format
          const parseDate = (dateStr: string) => {
            if (!dateStr) return '';
            try {
              // Split date and time if present
              const [datePart] = dateStr.split(' ');
              const [day, month, year] = datePart.split('/');
              // Create ISO date string for proper parsing
              const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              const date = new Date(isoDate);
              return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
            } catch (e) {
              console.error('Date parsing error for:', dateStr, e);
              return '';
            }
          };

          // Parse numeric values safely
          const parseNumber = (value: any): number => {
            if (value === null || value === undefined || value === '') return 0;
            // Handle string values with currency symbols or commas
            const cleanValue = value.toString().replace(/[₹,\s]/g, '');
            const num = parseFloat(cleanValue);
            return isNaN(num) ? 0 : num;
          };

          // Fix the column names to match the Google Sheets structure
          const discountAmount = parseNumber(item['Discount Amount -Mrp- Payment Value']);
          const discountPercentage = parseNumber(item['Discount Percentage - discount amount/mrp*100']);
          const paymentValue = parseNumber(item['Payment Value']);
          const mrpPreTax = parseNumber(item['Mrp - Pre Tax']);
          const mrpPostTax = parseNumber(item['Mrp - Post Tax']);
          const paymentVAT = parseNumber(item['Payment VAT']);
          
          return {
            memberId: item['Member ID']?.toString() || '',
            customerName: item['Customer Name'] || '',
            customerEmail: item['Customer Email'] || '',
            saleItemId: item['Sale Item ID']?.toString() || '',
            paymentCategory: item['Payment Category'] || '',
            membershipType: item['Membership Type'] || '',
            paymentDate: parseDate(item['Payment Date'] || ''),
            paymentValue,
            paidInMoneyCredits: parseNumber(item['Paid In Money Credits']),
            paymentVAT,
            paymentItem: item['Payment Item'] || '',
            paymentStatus: item['Payment Status'] || '',
            paymentMethod: item['Payment Method'] || '',
            paymentTransactionId: item['Payment Transaction ID']?.toString() || '',
            stripeToken: item['Stripe Token'] || '',
            soldBy: item['Sold By'] === '-' ? 'Online/System' : (item['Sold By'] || 'Unknown'),
            saleReference: item['Sale Reference']?.toString() || '',
            calculatedLocation: item['Calculated Location'] || '',
            cleanedProduct: item['Cleaned Product'] || '',
            cleanedCategory: item['Cleaned Category'] || '',
            hostId: item['Host Id']?.toString() || '',
            mrpPreTax,
            mrpPostTax,
            discountAmount,
            discountPercentage,
            netRevenue: paymentValue - paymentVAT,
            vat: paymentVAT,
            grossRevenue: paymentValue,
          };
        });

        // Show all transactions, not just discounted ones for better visibility
        // Filter for items with actual discounts OR show all items if no discounts exist
        const discountedItems = processedData.filter(item => {
          const hasDiscountAmount = item.discountAmount && item.discountAmount > 0;
          const hasDiscountPercentage = item.discountPercentage && item.discountPercentage > 0;
          return hasDiscountAmount || hasDiscountPercentage;
        });

        // If no discounted items found, show all items for analysis
        const finalData = discountedItems.length > 0 ? discountedItems : processedData;

        console.log('Total processed items:', processedData.length);
        console.log('Items with discounts:', discountedItems.length);
        console.log('Final data shown:', finalData.length);
        
        if (finalData.length > 0) {
          console.log('Sample item:', finalData[0]);
          console.log('Sample discount amount:', finalData[0].discountAmount);
          console.log('Sample discount percentage:', finalData[0].discountPercentage);
        }
        
        setDiscountData(finalData);
      } catch (error) {
        console.error('Error processing discount data:', error);
        setDiscountData([]);
      }
    } else {
      console.log('No sales data available for discount processing');
      setDiscountData([]);
    }
  }, [salesData]);

  return {
    data: discountData,
    loading,
    error,
  };
};
