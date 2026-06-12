# PowerShell script to convert CSV to Excel
# Run this script to create an Excel file from the CSV sample data

$csvPath = Join-Path $PSScriptRoot "bulk_upload_sample_data.csv"
$excelPath = Join-Path $PSScriptRoot "bulk_upload_sample_data.xlsx"

Write-Host "Converting CSV to Excel..." -ForegroundColor Cyan
Write-Host "CSV Path: $csvPath" -ForegroundColor Gray
Write-Host "Excel Path: $excelPath" -ForegroundColor Gray

try {
    # Create Excel COM object
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    
    # Open CSV file
    $workbook = $excel.Workbooks.Open($csvPath)
    
    # Save as Excel format
    $workbook.SaveAs($excelPath, 51) # 51 = xlOpenXMLWorkbook (.xlsx)
    
    # Close workbook and Excel
    $workbook.Close($false)
    $excel.Quit()
    
    # Release COM objects
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
    
    Write-Host "`nSuccess! Excel file created:" -ForegroundColor Green
    Write-Host $excelPath -ForegroundColor Yellow
    Write-Host "`nYou can now use this file for bulk upload testing." -ForegroundColor Cyan
    
} catch {
    Write-Host "`nError: $_" -ForegroundColor Red
    Write-Host "`nAlternative: Open the CSV file in Excel and save it as .xlsx manually" -ForegroundColor Yellow
}

# Made with Bob
