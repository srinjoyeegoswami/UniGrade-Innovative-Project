import React, { useState, useEffect } from 'react';
import {
  getPerformanceReport,
  getGradeDistribution,
  getPassFailStats,
  getSubmissionReport,
  getFacultyWorkload,
} from '../../services/reports.service';
import DataTable from '../../components/tables/DataTable';
import Button from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import { useToast } from '../../components/common/Toast';
import { Download, BarChart2, Award, Users, CheckCircle } from 'lucide-react';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('performance');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const loadReport = async (tab) => {
    setLoading(true);
    setReportData([]);
    try {
      if (tab === 'performance') {
        const res = await getPerformanceReport();
        if (res.data?.success) setReportData(res.data.data.performance || []);
      } else if (tab === 'grade-distribution') {
        const res = await getGradeDistribution();
        if (res.data?.success) setReportData(res.data.data.grade_distribution || []);
      } else if (tab === 'pass-fail') {
        const res = await getPassFailStats();
        if (res.data?.success) setReportData(res.data.data.pass_fail_stats || []);
      } else if (tab === 'faculty-workload') {
        const res = await getFacultyWorkload();
        if (res.data?.success) setReportData(res.data.data.workload || []);
      }
    } catch (e) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(activeTab);
  }, [activeTab]);

  const tabs = [
    { id: 'performance', label: 'Academic Performance', icon: Award },
    { id: 'grade-distribution', label: 'Grade Distribution', icon: BarChart2 },
    { id: 'pass-fail', label: 'Department Pass/Fail', icon: CheckCircle },
    { id: 'faculty-workload', label: 'Faculty Assessment Workload', icon: Users },
  ];

  const exportCSV = () => {
    if (!reportData || reportData.length === 0) return;
    const keys = Object.keys(reportData[0]);
    const csvRows = [
      keys.join(','),
      ...reportData.map((row) => keys.map((k) => `"${row[k] ?? ''}"`).join(',')),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UniGrade_Report_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
            Reports & Academic Analytics
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
            Auditable institutional reporting, cohort GPA metrics, and evaluation summaries.
          </p>
        </div>
        <Button onClick={exportCSV} variant="secondary" icon={Download}>
          Export CSV Report
        </Button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Visual Chart if applicable */}
      {activeTab === 'grade-distribution' && reportData.length > 0 && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>Grade Dispersion Visualizer</h3>
          <BarChart
            data={reportData.map((r) => ({ name: `Grade ${r.letter_grade}`, count: parseInt(r.count) }))}
            xKey="name"
            yKey="count"
            height={260}
          />
        </div>
      )}

      {activeTab === 'pass-fail' && reportData.length > 0 && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>Department Pass Rate Visualizer (%)</h3>
          <BarChart
            data={reportData.map((r) => ({ name: r.department_code || r.department_name, pass_rate: parseFloat(r.pass_percentage) }))}
            xKey="name"
            yKey="pass_rate"
            height={260}
          />
        </div>
      )}

      {/* Data Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        {activeTab === 'performance' && (
          <DataTable
            loading={loading}
            data={reportData}
            columns={[
              { key: 'roll_number', label: 'Roll Number', render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v}</span> },
              { key: 'full_name', label: 'Student Name', render: (v) => <strong>{v}</strong> },
              { key: 'program_code', label: 'Program' },
              { key: 'courses_taken', label: 'Courses Evaluated', render: (v) => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
              { key: 'avg_percentage', label: 'Average Score', render: (v) => <span style={{ fontFamily: 'monospace' }}>{v}%</span> },
              { key: 'gpa', label: 'Calculated CGPA', render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{v}</span> },
            ]}
          />
        )}

        {activeTab === 'grade-distribution' && (
          <DataTable
            loading={loading}
            data={reportData}
            columns={[
              { key: 'letter_grade', label: 'Letter Grade', render: (v) => <span className={`badge badge-grade-${v}`}>{v}</span> },
              { key: 'count', label: 'Candidate Frequency', render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v}</span> },
              { key: 'avg_grade_point', label: 'Grade Point', render: (v) => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
            ]}
          />
        )}

        {activeTab === 'pass-fail' && (
          <DataTable
            loading={loading}
            data={reportData}
            columns={[
              { key: 'department_name', label: 'Department', render: (v, r) => <strong>{v} ({r.department_code})</strong> },
              { key: 'total_candidates', label: 'Candidates Evaluated', render: (v) => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
              { key: 'passed', label: 'Passed Count', render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v}</span> },
              { key: 'failed', label: 'Failed Count', render: (v) => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
              { key: 'pass_percentage', label: 'Pass Rate (%)', render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{v}%</span> },
            ]}
          />
        )}

        {activeTab === 'faculty-workload' && (
          <DataTable
            loading={loading}
            data={reportData}
            columns={[
              { key: 'employee_code', label: 'Employee ID', render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v}</span> },
              { key: 'full_name', label: 'Faculty Member', render: (v) => <strong>{v}</strong> },
              { key: 'department_name', label: 'Department' },
              { key: 'designation', label: 'Designation' },
              { key: 'active_offerings_count', label: 'Assigned Courses', render: (v) => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
              { key: 'total_enrolled_students', label: 'Total Students', render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v}</span> },
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default Reports;

