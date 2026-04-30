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
import { getSkillsGap } from '../../services/api';
import './ChartCard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SkillsGapChart({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getSkillsGap(filters);
        const gaps = res.data.certificationGaps || [];
        
        // Top 10 only
        const top10 = gaps.slice(0, 10);

        // Color by severity
        const colors = top10.map(g => 
          g.severity === 'critical' ? '#e53e3e' :
          g.severity === 'significant' ? '#ed8936' :
          '#48bb78'
        );

        setData({
          labels: top10.map(g => `${g.title} (${g.issuingBody})`),
          datasets: [{
            label: '% of Alumni Acquired',
            data: top10.map(g => g.percentage),
            backgroundColor: colors,
            borderRadius: 6
          }]
        });
      } catch (err) {
        console.error('Failed to fetch skills gap:', err);
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
        text: 'Curriculum Skills Gap — Certifications Acquired Post-Graduation',
        font: { size: 16, weight: 600 }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y}% of alumni`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Percentage of Alumni' }
      }
    }
  };
  const handleDownload = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const a = document.createElement('a');
      a.href = url;
      a.download = 'skills-gap.png';
      a.click();
    }
  };

  if (loading) return <div className="chart-card loading">Loading Skills Gap...</div>;
  if (!data) return <div className="chart-card error">Failed to load data</div>;

  return (
    <div className="chart-card">
      <div className="chart-container">
        <Bar ref={chartRef} data={data} options={options} />
      </div>
      <div className="chart-legend">
        <span className="legend-item">
          <span className="legend-color" style={{ background: '#e53e3e' }}></span>
          Critical (≥50%)
        </span>
        <span className="legend-item">
          <span className="legend-color" style={{ background: '#ed8936' }}></span>
          Significant (25-49%)
        </span>
        <span className="legend-item">
          <span className="legend-color" style={{ background: '#48bb78' }}></span>
          Emerging (&lt;25%)
        </span>
      </div>
      <button className="btn-export-chart" onClick={handleDownload}>
        📥 Download Chart
      </button>
    </div>
  );
}