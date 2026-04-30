import { useEffect, useState,useRef } from 'react';
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
import { getProgrammeComparison } from '../../services/api';
import './ChartCard.css';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const COLORS = [
  { bg: 'rgba(83,74,183,0.2)',   border: '#534AB7' },
  { bg: 'rgba(29,158,117,0.2)',  border: '#1D9E75' },
  { bg: 'rgba(216,90,48,0.2)',   border: '#D85A30' },
  { bg: 'rgba(186,117,23,0.2)',  border: '#BA7517' },
  { bg: 'rgba(56,122,221,0.2)',  border: '#387ADD' },
  { bg: 'rgba(155,48,180,0.2)',  border: '#9B30B4' },
  { bg: 'rgba(220,53,69,0.2)',   border: '#DC3545' },
];

export default function ProgrammeRadarChart({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getProgrammeComparison(filters);
        const programmes = res.data.programmes || [];

        // Limit to top 7 by alumni count
        const top = programmes
          .sort((a, b) => b.totalAlumni - a.totalAlumni)
          .slice(0, 7);

        setData({
          labels: ['Avg Certs', 'Avg Courses', 'Avg Degrees', 'Employment Rate (x10)', 'Alumni Count (x10)'],
          datasets: top.map((p, i) => ({
            label: p.programme,
            data: [
              p.avgCerts,
              p.avgCourses,
              p.avgDegrees,
              p.employmentRate / 10,   // scale 0-100 → 0-10
              p.totalAlumni / 10        // scale for radar
            ],
            backgroundColor: COLORS[i % COLORS.length].bg,
            borderColor: COLORS[i % COLORS.length].border,
            borderWidth: 2,
            pointBackgroundColor: COLORS[i % COLORS.length].border,
            pointRadius: 4,
          }))
        });
      } catch (err) {
        console.error('Failed to fetch programme comparison:', err);
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
      legend: {
        position: 'bottom',
        labels: { font: { size: 11 }, padding: 12 }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.dataset.label;
            const metric = ctx.label;
            let val = ctx.parsed.r;
            // Reverse scale for display
            if (metric === 'Employment Rate (x10)') val = (val * 10) + '%';
            else if (metric === 'Alumni Count (x10)') val = Math.round(val * 10);
            return `${label}: ${val}`;
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: { stepSize: 2, font: { size: 10 } },
        pointLabels: { font: { size: 11 } },
        grid: { color: 'rgba(0,0,0,0.08)' }
      }
    }
  };
  const handleDownload = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const a = document.createElement('a');
      a.href = url;
      a.download = 'programme-comparison.png';
      a.click();
    }
  };

  if (loading) return <div className="chart-card loading">Loading Programme Comparison...</div>;
  if (!data)   return <div className="chart-card error">Failed to load data</div>;

  return (
    <div className="chart-card">
      <div className="chart-container" style={{ height: '380px' }}>
        <Radar ref={chartRef} data={data} options={options} />
      </div>
      <button className="btn-export-chart" onClick={handleDownload}>
        📥 Download Chart
      </button>
    </div>
  );
}