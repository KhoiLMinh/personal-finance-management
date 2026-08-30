import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
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

  useEffect(() => {
    fetchOverview();
    fetchAiAdvice();
  }, []);


  const fetchOverview = async () => {
    setOverviewLoading(true);
    try {
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      const overviewData = await reportService.getOverview(firstDay, lastDay);
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
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
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
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      await reportService.downloadExcel(firstDay, lastDay);
    } catch (error) {
      alert("Lỗi khi tải báo cáo Excel!");
    }
  };

  const handleExportPdf = async () => {
    try {
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      await reportService.downloadPdf(firstDay, lastDay);
    } catch (error) {
      alert("Lỗi khi tải báo cáo PDF!");
    }
  };


  if (overviewLoading) return <MySpinner />;
  if (!overview) return <p className="text-center mt-5">Không có dữ liệu hiển thị.</p>;

  return (
    <div className="p-4 flex-grow-1">
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
          <ExpenseCategoryChart data={overview.expenseByCategory} />
        </Col>
        <Col lg={7}>
          <TrendChart data={overview.trendData} />
        </Col>
      </Row>
    </div>
  );
}