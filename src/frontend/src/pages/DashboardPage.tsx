import React, { useEffect, useState } from 'react';
import reportService from '../services/reportService';
import aiService from '../services/aiService';
import type { DashboardOverview } from '../types/dashboard';

import MySpinner from '../components/MySpinner';
import AiAdviceCard from '../components/dashboard/AiAdviceCard';
import SummaryCards from '../components/dashboard/SummaryCards';

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string>('Đang nhờ trợ lý AI phân tích dữ liệu...');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

    try {
      const overviewData = await reportService.getOverview(firstDay, lastDay);
      setOverview(overviewData);
    } catch (error) {
      console.error("Lỗi tải overview:", error);
      setLoading(false);
      return;
    }

    try {
      const res = await aiService.analyzeReport(firstDay, lastDay);
      setAiAdvice(res.reply);
    } catch (error) {
      console.error("Lỗi AI:", error);
      setAiAdvice("Trợ lý AI hiện đang nghỉ ngơi, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      await reportService.downloadExcel(firstDay, lastDay);
    } catch (error) {
      alert("Lỗi khi tải báo cáo Excel!");
    }
  };

  if (loading) return <MySpinner />;
  if (!overview) return <p className="text-center mt-5">Không có dữ liệu hiển thị.</p>;

  return (
    <div className="p-4 flex-grow-1">
      <AiAdviceCard aiAdvice={aiAdvice} overview={overview} onExport={handleExportReport} />
      <SummaryCards overview={overview} />
    </div>
  );
}