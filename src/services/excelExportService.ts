import * as XLSX from 'xlsx';
import { Receipt } from '../App';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export const excelExportService = {
  /**
   * Generate a tax report Excel file from receipts
   * Downloads the file to the user's device (web) or shares it (iOS/Android)
   */
  async generateTaxReport(receipts: Receipt[], userName?: string) {
    console.log('📊 Generating tax report for', receipts.length, 'receipts');

    // Helper function to get classification label based on score
    const getClassification = (score: number): string => {
      if (score >= 70) return 'Likely business-related';
      if (score >= 40) return 'Possibly business-related';
      return 'Needs review';
    };

    // Transform receipts into spreadsheet rows
    const rows = receipts.map((receipt) => ({
      'Receipt ID': receipt.id,
      'Date': receipt.date,
      'Merchant/Vendor': receipt.merchant,
      'Amount': receipt.amount,
      'Category': receipt.category,
      'Description': receipt.items.length > 0
        ? receipt.items.map(item => item.description).join(', ')
        : 'No items',
      'Subtotal': receipt.subtotal || 0,
      'Tax': receipt.tax || 0,
      'Classification': getClassification(receipt.score),
      'Write-off Likelihood': `${receipt.score}%`,
      'Audit Notes': '', // Empty column for CPA use
    }));

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 12 }, // Receipt ID
      { wch: 15 }, // Date
      { wch: 25 }, // Merchant/Vendor
      { wch: 12 }, // Amount
      { wch: 15 }, // Category
      { wch: 40 }, // Description
      { wch: 12 }, // Subtotal
      { wch: 10 }, // Tax
      { wch: 25 }, // Classification
      { wch: 20 }, // Write-off Likelihood
      { wch: 30 }, // Audit Notes
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tax Report');

    // Add a summary sheet
    const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);
    const totalTax = receipts.reduce((sum, r) => sum + (r.tax || 0), 0);
    const likelyBusinessCount = receipts.filter(r => r.score >= 70).length;
    const possiblyBusinessCount = receipts.filter(r => r.score >= 40 && r.score < 70).length;
    const needsReviewCount = receipts.filter(r => r.score < 40).length;

    const summaryData = [
      { 'Metric': 'Total Receipts', 'Value': receipts.length },
      { 'Metric': 'Total Amount', 'Value': `$${totalAmount.toFixed(2)}` },
      { 'Metric': 'Total Tax', 'Value': `$${totalTax.toFixed(2)}` },
      { 'Metric': '', 'Value': '' },
      { 'Metric': 'Likely Business-Related', 'Value': likelyBusinessCount },
      { 'Metric': 'Possibly Business-Related', 'Value': possiblyBusinessCount },
      { 'Metric': 'Needs Review', 'Value': needsReviewCount },
      { 'Metric': '', 'Value': '' },
      { 'Metric': 'Generated Date', 'Value': new Date().toLocaleDateString() },
      { 'Metric': 'User', 'Value': userName || 'N/A' },
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Generate filename with current date
    const today = new Date().toISOString().split('T')[0];
    const filename = `Tax_Report_${today}.xlsx`;

    // Check if running on native platform (iOS/Android)
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      console.log('📱 Running on native platform, using Filesystem + Share');

      // Generate binary Excel file
      const workbookBinary = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

      // Save to temporary directory
      const result = await Filesystem.writeFile({
        path: filename,
        data: workbookBinary,
        directory: Directory.Cache,
      });

      console.log('✅ File saved to:', result.uri);

      // Share the file using native share dialog
      await Share.share({
        title: 'Tax Report',
        text: `Tax report for ${receipts.length} receipts`,
        url: result.uri,
        dialogTitle: 'Share Tax Report',
      });

      console.log('✅ Tax report shared successfully');
    } else {
      console.log('🌐 Running on web, using browser download');

      // Write and download the file (web browser)
      XLSX.writeFile(workbook, filename);

      console.log('✅ Tax report downloaded:', filename);
    }

    return filename;
  },
};
