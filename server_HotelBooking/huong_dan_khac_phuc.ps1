Write-Host "=== HUONG DAN CHI TIET KHAC PHUC LOI ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "BUOC 1: LAY CLERK ID THUC CUA BAN" -ForegroundColor Cyan
Write-Host "1. Mo trang admin trong trinh duyet"
Write-Host "2. Nhan F12 de mo Developer Tools"
Write-Host "3. Vao tab Console"
Write-Host "4. Go lenh: window.Clerk.user.id"
Write-Host "5. Copy Clerk ID hien thi (vi du: user_2abc123def456)" -ForegroundColor Green
Write-Host ""
Write-Host "BUOC 2: CAP NHAT SCRIPT" -ForegroundColor Cyan
Write-Host "1. Mo file fix_clerk_id.js"
Write-Host "2. Tim dong: const YOUR_REAL_CLERK_ID = 'user_test123';"
Write-Host "3. Thay the 'user_test123' bang Clerk ID thuc cua ban"
Write-Host "4. Luu file"
Write-Host ""
Write-Host "BUOC 3: CHAY SCRIPT" -ForegroundColor Cyan
Write-Host "node fix_clerk_id.js" -ForegroundColor Green
Write-Host ""
Write-Host "=== KIEM TRA TRANG THAI HIEN TAI ===" -ForegroundColor Yellow
Write-Host ""
node check_admin.js
Write-Host ""
Write-Host "=== CAC FILE HO TRO ===" -ForegroundColor Yellow
Write-Host "fix_clerk_id.js - Script chinh de khac phuc" -ForegroundColor Green
Write-Host "check_admin.js - Kiem tra thong tin admin"
Write-Host "quick_fix_admin.js - Script khac"
Write-Host "update_admin_clerkid.js - Script voi tham so"
Write-Host ""
Write-Host "SAU KHI CAP NHAT:" -ForegroundColor Cyan
Write-Host "- Trang 'Thong ke tong quan' se hoat dong binh thuong"
Write-Host "- Khong con loi 'ban khong co quyen'"
Write-Host "- Tat ca cac trang thong ke tour deu hoat dong"