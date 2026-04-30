import { useEffect, useState, useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getEmploymentSectors } from '../../services/api';
import './ChartCard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function EmploymentSectorChart({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getEmploymentSectors(filters);
        const sectors = res.data.sectors || [];

        const colors = [
          '#667eea', '#764ba2', '#f093fb', '#4facfe',
          '#43e97b', '#fa709a', '#fee140', '#30cfd0'
        ];

        setData({
          labels: sectors.map(s => s.sector),
          datasets: [{
            label: 'Alumni Count',
            data: sectors.map(s => s.count),
            backgroundColor: colors.slice(0, sectors.length),
            borderWidth: 2,
            borderColor: '#fff'
          }]
        });
      } catch (err) {
        console.error('Failed to fetch sectors:', err);
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
      legend: { position: 'right' },
      title: {
        display: true,
        text: 'Employment by Industry Sector',
        font: { size: 16, weight: 600 }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const dataset = context.dataset.data;
            const total = dataset.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const handleDownload = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const a = document.createElement('a');
      a.href = url;
      a.download = 'industry-sectors.png';
      a.click();
    }
  };

  if (loading) return <div className="chart-card loading">Loading Sectors...</div>;
  if (!data) return <div className="chart-card error">Failed to load data</div>;

  return (
    <div className="chart-card">
      <div className="chart-container" style={{ height: '400px' }}>
        <Doughnut ref={chartRef} data={data} options={options} />
      </div>
      <button className="btn-export-chart" onClick={handleDownload}>
        📥 Download Chart
      </button>
    </div>
  );
}