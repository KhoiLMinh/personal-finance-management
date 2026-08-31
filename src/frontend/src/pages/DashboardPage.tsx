import React, { useEffect, useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import reportService from '../services/reportService';
import aiService from '../services/aiService';
import type { DashboardOverview } from '../types/dashboard';

import MySpinner from '../components/MySpinner';
import AiAdviceCard from '../components/dashboard/AiAdviceCard';
import SummaryCards from '../components/dashboard/SummaryCards';
import ExpenseCategoryChart from '../components/dashboard/ExpenseCategoryChart';
import TrendChart from '../components/dashboard/TrendChart';

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState<boolean>(true);

  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(true);
  const [aiError, setAiError] = useState<boolean>(false);

  // === STATE QUẢN LÝ BỘ LỌC ===
  const [timeUnit, setTimeUnit] = useState<string>('WEEK'); // Mặc định xem theo Tuần (Từng tháng)
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    fetchOverview();
    fetchAiAdvice();
  }, [timeUnit, currentMonth, currentYear]); // Tự động load lại khi bộ lọc thay đổi

  // Hàm helper để tính ngày bắt đầu và kết thúc dựa trên bộ lọc
  const getDateRange = () => {
    let firstDay, lastDay;
    if (timeUnit === 'WEEK') {
      // Xem theo tuần -> Trích xuất dữ liệu của 1 tháng
      firstDay = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      const lastDate = new Date(currentYear, currentMonth, 0).getDate();
      lastDay = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${lastDate}`;
    } else {
      // Xem theo tháng -> Trích xuất dữ liệu của cả 1 năm
      firstDay = `${currentYear}-01-01`;
      lastDay = `${currentYear}-12-31`;
    }
    return { firstDay, lastDay };
  };

  const fetchOverview = async () => {
    setOverviewLoading(true);
    try {
      const { firstDay, lastDay } = getDateRange();
      const overviewData = await reportService.getOverview(firstDay, lastDay, timeUnit);
      setOverview(overviewData);
    } catch (error) {
      console.error("Lỗi tải overview:", error);
    } finally {
      setOverviewLoading(false);
    }
  };

  const fetchAiAdvice = async () => {
    setAiLoading(true);
    setAiError(false);
    try {
      const { firstDay, lastDay } = getDateRange();
      const res = await aiService.analyzeReport(firstDay, lastDay);
      setAiAdvice(res.reply);
    } catch (error) {
      console.error("Lỗi AI:", error);
      setAiError(true);
    } finally {
      setAiLoading(false);
    }
  };
  
  //Fr13
  const handleExportExcel = async () => {
    try {
      const { firstDay, lastDay } = getDateRange();
      await reportService.downloadExcel(firstDay, lastDay);
    } catch (error) {
      alert("Lỗi khi tải báo cáo Excel!");
    }
  };

  const handleExportPdf = async () => {
    try {
      const { firstDay, lastDay } = getDateRange();
      await reportService.downloadPdf(firstDay, lastDay);
    } catch (error) {
      alert("Lỗi khi tải báo cáo PDF!");
    }
  };

  if (overviewLoading && !overview) return <MySpinner />;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-3 mb-md-0 text-dark">Tổng quan tài chính</h4>
        
        <div className="d-flex gap-2">

          <Form.Select 
            className="border-0 shadow-sm rounded-3 fw-medium"
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            style={{ minWidth: '110px' }}
          >
            {[2024, 2025, 2026, 2027, 2028].map(year => (
              <option key={year} value={year}>Năm {year}</option>
            ))}
          </Form.Select>

          {timeUnit === 'WEEK' && (
            <Form.Select 
              className="border-0 shadow-sm rounded-3 fw-medium"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              style={{ minWidth: '120px' }}
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>Tháng {month}</option>
              ))}
            </Form.Select>
          )}

          <Form.Select 
            className="border-0 shadow-sm rounded-3 fw-bold text-primary"
            style={{ backgroundColor: '#e0e7ff', minWidth: '130px' }}
            value={timeUnit}
            onChange={(e) => setTimeUnit(e.target.value)}
          >
            <option value="WEEK">Theo Tuần</option>
            <option value="MONTH">Theo Tháng</option>
          </Form.Select>
        </div>
      </div>

      {overviewLoading ? (
        <MySpinner />
      ) : !overview ? (
        <p className="text-center mt-5 text-muted">Không có dữ liệu hiển thị.</p>
      ) : (
        <>
          <AiAdviceCard
            aiAdvice={aiAdvice}
            aiLoading={aiLoading}
            aiError={aiError}
            onRetryAi={fetchAiAdvice}
            overview={overview}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}  
          />
          <SummaryCards overview={overview} />
          <Row className="g-4">
            <Col lg={5}>
              {/* Tái sử dụng trọn vẹn Chart tròn của bạn */}
              <ExpenseCategoryChart data={overview.expenseByCategory} />
            </Col>
            <Col lg={7}>
              {/* Tái sử dụng trọn vẹn Chart cột của bạn, dữ liệu X/Y/Z/W/V đã được Backend tự động tạo */}
              <TrendChart data={overview.trendData} />
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}