import { useEffect, useState, useRef } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { getCareerProgression } from '../../services/api';
import './ChartCard.css';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function CareerProgressionChart({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getCareerProgression(filters);
        const levels = res.data.levels || {};

        setData({
          labels: Object.keys(levels),
          datasets: [{
            label: 'Number of Alumni',
            data: Object.values(levels),
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            borderColor: '#667eea',
            borderWidth: 2,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#667eea'
          }]
        });
      } catch (err) {
        console.error('Failed to fetch career progression:', err);
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
        text: 'Career Progression — Seniority Levels',
        font: { size: 16, weight: 600 }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          stepSize: 5
        }
      }
    }
  };

  const handleDownload = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const a = document.createElement('a');
      a.href = url;
      a.download = 'career-progression.png';
      a.click();
    }
  };

  if (loading) return <div className="chart-card loading">Loading Career Progression...</div>;
  if (!data) return <div className="chart-card error">Failed to load data</div>;

  return (
    <div className="chart-card">
      <div className="chart-container" style={{ height: '400px' }}>
        <Radar ref={chartRef} data={data} options={options} />
      </div>
      <button className="btn-export-chart" onClick={handleDownload}>
        📥 Download Chart
      </button>
    </div>
  );
}