package com.personal.finance.backend.reports.service.impl;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.personal.finance.backend.reports.dto.response.CategoryExpenseDTO;
import com.personal.finance.backend.reports.dto.response.DashboardOverviewDTO;
import com.personal.finance.backend.reports.dto.response.TrendDataDTO;
import com.personal.finance.backend.reports.service.ReportService;
import com.personal.finance.backend.transactions.entity.Transaction;
import com.personal.finance.backend.transactions.repository.TransactionRepository;
import com.personal.finance.backend.wallets.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public DashboardOverviewDTO getDashboardOverview(Long userId, LocalDate startDate, LocalDate endDate) {
        DashboardOverviewDTO overview = new DashboardOverviewDTO();

        // 1. TÍNH TOÁN DỮ LIỆU KỲ HIỆN TẠI
        Double totalBalance = walletRepository.getTotalBalanceAccessibleByUser(userId);
        overview.setTotalBalance(totalBalance);

        Double totalIncome = transactionRepository.getTotalAmountByType(userId, Transaction.TransactionType.INCOME, startDate, endDate);
        Double totalExpense = transactionRepository.getTotalAmountByType(userId, Transaction.TransactionType.EXPENSE, startDate, endDate);

        overview.setTotalIncome(totalIncome);
        overview.setTotalExpense(totalExpense);
        overview.setNetSavings(totalIncome - totalExpense);

        // 2. SO SÁNH VỚI KỲ TRƯỚC (So sánh chi tiêu giữa các kỳ khác nhau)
        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);
        LocalDate prevEndDate = startDate.minusDays(1);
        LocalDate prevStartDate = prevEndDate.minusDays(daysBetween);

        Double prevIncome = transactionRepository.getTotalAmountByType(userId, Transaction.TransactionType.INCOME, prevStartDate, prevEndDate);
        Double prevExpense = transactionRepository.getTotalAmountByType(userId, Transaction.TransactionType.EXPENSE, prevStartDate, prevEndDate);

        overview.setIncomeChangePercent(calculatePercentageChange(prevIncome, totalIncome));
        overview.setExpenseChangePercent(calculatePercentageChange(prevExpense, totalExpense));

        List<CategoryExpenseDTO> expenseByCategory = transactionRepository.getExpenseByCategory(userId, startDate, endDate);
        overview.setExpenseByCategory(expenseByCategory);

        List<Object[]> rawTrendData = transactionRepository.getTrendData(userId, startDate, endDate);
        overview.setTrendData(formatTrendData(rawTrendData));

        return overview;
    }

    private Double calculatePercentageChange(Double previous, Double current) {
        if (previous == null || previous == 0.0) {
            return (current != null && current > 0.0) ? 100.0 : 0.0;
        }
        if (current == null) current = 0.0;
        return ((current - previous) / previous) * 100.0;
    }

    // Hàm phụ trợ: Format dữ liệu thô từ DB thành danh sách vẽ biểu đồ
    private List<TrendDataDTO> formatTrendData(List<Object[]> rawData) {
        Map<String, TrendDataDTO> trendMap = new LinkedHashMap<>();

        for (Object[] row : rawData) {
            String dateStr = row[0].toString();
            Transaction.TransactionType type = (Transaction.TransactionType) row[1];
            Double amount = (Double) row[2];

            trendMap.putIfAbsent(dateStr, new TrendDataDTO(dateStr, 0.0, 0.0));
            TrendDataDTO dto = trendMap.get(dateStr);

            if (type == Transaction.TransactionType.INCOME) {
                dto.setIncome(amount);
            } else {
                dto.setExpense(amount);
            }
        }
        return new ArrayList<>(trendMap.values());
    }

    private List<Transaction> getTransactionData(Long userId, Long walletId, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.filterTransactions(
                userId, walletId, null, startDate, endDate, null, Pageable.unpaged()
        ).getContent();
    }

    @Override
    public byte[] exportTransactionsToExcel(Long userId, Long walletId, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = getTransactionData(userId, walletId, startDate, endDate);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Sao ke Giao Dich");
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Ngày", "Loại", "Danh mục", "Ví", "Số tiền", "Ghi chú"};
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
            }
            int rowIdx = 1;
            for (Transaction t : transactions) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(t.getDate().toString());
                row.createCell(1).setCellValue(t.getType() == Transaction.TransactionType.INCOME ? "Thu nhập" : "Chi tiêu");
                row.createCell(2).setCellValue(t.getCategory().getName());
                row.createCell(3).setCellValue(t.getWallet().getName());
                row.createCell(4).setCellValue(t.getAmount());
                row.createCell(5).setCellValue(t.getDescription() != null ? t.getDescription() : "");
            }
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Lỗi xuất Excel: ", e);
            throw new RuntimeException("Không thể tạo file Excel!");
        }
    }

    @Override
    public byte[] exportTransactionsToPdf(Long userId, Long walletId, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = getTransactionData(userId, walletId, startDate, endDate);
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Paragraph title = new Paragraph("Sao ke Giao Dich", titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            String[] headers = {"Ngay", "Loai", "Danh muc", "So tien", "Ghi chu"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, new Font(Font.HELVETICA, 12, Font.BOLD)));
                cell.setBackgroundColor(Color.LIGHT_GRAY);
                table.addCell(cell);
            }
            for (Transaction t : transactions) {
                table.addCell(t.getDate().toString());
                table.addCell(t.getType() == Transaction.TransactionType.INCOME ? "Thu nhap" : "Chi tieu");
                table.addCell(t.getCategory().getName());
                table.addCell(String.format("%,.0f", t.getAmount()));
                table.addCell(t.getDescription() != null ? t.getDescription() : "");
            }
            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Lỗi xuất PDF: ", e);
            throw new RuntimeException("Không thể tạo file PDF!");
        }
    }
}
