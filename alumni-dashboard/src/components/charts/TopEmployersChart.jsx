import { useEffect, useState,useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { getTopEmployers } from '../../services/api';
import './ChartCard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TopEmployersChart({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getTopEmployers({ ...filters, limit: 10 });
        const employers = res.data.employers || [];

        setData({
          labels: employers.map(e => e.company),
          datasets: [{
            label: 'Number of Alumni',
            data: employers.map(e => e.count),
            backgroundColor: '#43e97b',
            borderRadius: 6
          }]
        });
      } catch (err) {
        console.error('Failed to fetch employers:', err);
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
      legend: { display: false },
      title: {
        display: true,
        text: 'Top 10 Employers',
        font: { size: 16, weight: 600 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Number of Alumni' }
      }
    }
  };
  const handleDownload = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const a = document.createElement('a');
      a.href = url;
      a.download = 'top-employers.png';
      a.click();  
    }
  };

  if (loading) return <div className="chart-card loading">Loading Employers...</div>;
  if (!data) return <div className="chart-card error">Failed to load data</div>;

  return (
    <div className="chart-card">
      <div className="chart-container">
        <Bar ref={chartRef} data={data} options={options} />
      </div>
      <button className="btn-export-chart" onClick={handleDownload}>
        📥 Download Chart
      </button>
    </div>
  );
}
      