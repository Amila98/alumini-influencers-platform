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
import { getJobTitles } from '../../services/api';
import './ChartCard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function JobTitlesChart({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getJobTitles({ ...filters, limit: 10 });
        const titles = res.data.jobTitles || [];

        setData({
          labels: titles.map(t => t.title),
          datasets: [{
            label: 'Number of Alumni',
            data: titles.map(t => t.count),
            backgroundColor: '#4facfe',
            borderRadius: 6
          }]
        });
      } catch (err) {
        console.error('Failed to fetch job titles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const options = {
    indexAxis: 'y', // Horizontal bars
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Most Common Job Titles',
        font: { size: 16, weight: 600 }
      }
    },
    scales: {
      x: {
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
      a.download = 'job-titles.png';
      a.click();
    }
  };

  if (loading) return <div className="chart-card loading">Loading Job Titles...</div>;
  if (!data) return <div className="chart-card error">Failed to load data</div>;

  return (
    <div className="chart-card">
      <div className="chart-container" style={{ height: '500px' }}>
        <Bar ref={chartRef} data={data} options={options} />
      </div>
      <button className="btn-export-chart" onClick={handleDownload}>
        📥 Download Chart
      </button>
    </div>
  );
}
