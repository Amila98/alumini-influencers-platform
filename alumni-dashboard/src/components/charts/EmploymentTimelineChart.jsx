import { useEffect, useState, useRef } from 'react';
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
import { getEmploymentTimeline } from '../../services/api';
import './ChartCard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function EmploymentTimelineChart({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getEmploymentTimeline(filters);
        const timeline = res.data.timeline || [];

        setData({
          labels: timeline.map(t => t.year.toString()),
          datasets: [{
            label: 'Employment Rate (%)',
            data: timeline.map(t => t.employmentRate),
            borderColor: '#48bb78',
            backgroundColor: 'rgba(72, 187, 120, 0.1)',
            tension: 0.4,
            fill: true
          }]
        });
      } catch (err) {
        console.error('Failed to fetch employment timeline:', err);
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
        text: 'Employment Rate by Graduation Year',
        font: { size: 16, weight: 600 }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y}% employed`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: 'Employment Rate (%)' }
      },
      x: {
        title: { display: true, text: 'Graduation Year' }
      }
    }
  };

  const handleDownload = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employment-timeline.png';
      a.click();
    }
  };

  if (loading) return <div className="chart-card loading">Loading Employment Timeline...</div>;
  if (!data) return <div className="chart-card error">Failed to load data</div>;

  return (
    <div className="chart-card">
      <div className="chart-container">
        <Line ref={chartRef} data={data} options={options} />
      </div>
      <button className="btn-export-chart" onClick={handleDownload}>
        📥 Download Chart
      </button>
    </div>
  );
}