import { useEffect, useState,useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { getCertTrends } from '../../services/api';
import './ChartCard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function CertTrendsChart({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getCertTrends(filters);
        const trends = res.data.trends || [];

        // Group by issuingBody
        const grouped = {};
        trends.forEach(t => {
          if (!grouped[t.issuingBody]) grouped[t.issuingBody] = {};
          grouped[t.issuingBody][t.month] = t.count;
        });

        // Get all unique months sorted
        const allMonths = [...new Set(trends.map(t => t.month))].sort();

        // Top 5 issuers only
        const topIssuers = Object.entries(grouped)
          .sort((a, b) => {
            const sumA = Object.values(a[1]).reduce((acc, val) => acc + val, 0);
            const sumB = Object.values(b[1]).reduce((acc, val) => acc + val, 0);
            return sumB - sumA;
          })
          .slice(0, 5);

        const colors = ['#667eea', '#f093fb', '#43e97b', '#fa709a', '#fee140'];

        const datasets = topIssuers.map(([issuer, months], idx) => ({
          label: issuer,
          data: allMonths.map(m => months[m] || 0),
          borderColor: colors[idx],
          backgroundColor: colors[idx],
          tension: 0.4
        }));

        setData({
          labels: allMonths,
          datasets
        });
      } catch (err) {
        console.error('Failed to fetch cert trends:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Certification Trends — Last 24 Months',
        font: { size: 16, weight: 600 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Certifications Acquired' }
      },
      x: {
        title: { display: true, text: 'Month' }
      }
    }
  };
  const handleDownload = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cert-trends.png';
      a.click();
    }
  };

  if (loading) return <div className="chart-card loading">Loading Trends...</div>;
  if (!data) return <div className="chart-card error">Failed to load data</div>;

  return (
    <div className="chart-card">
      <div className="chart-container" style={{ height: '400px' }}>
        <Line ref={chartRef} data={data} options={options} />
      </div>
      <button className="btn-export-chart" onClick={handleDownload}>
        📥 Download Chart
      </button>
    </div>
  );
}
        