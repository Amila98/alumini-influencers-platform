import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiKey, getSummary } from '../services/api';
import Navbar from '../components/Navbar';
import FilterPanel from '../components/FilterPanel';
import StatsCard from '../components/StatsCard';
import SkillsGapChart from '../components/charts/SkillsGapChart';
import EmploymentSectorChart from '../components/charts/EmploymentSectorChart';
import JobTitlesChart from '../components/charts/JobTitlesChart';
import TopEmployersChart from '../components/charts/TopEmployersChart';
import GeographicChart from '../components/charts/GeographicChart';
import CertTrendsChart from '../components/charts/CertTrendsChart';
import ProgrammeRadarChart from '../components/charts/ProgrammeRadarChart';
import CareerProgressionChart from '../components/charts/CareerProgressionChart';
import EmploymentTimelineChart from '../components/charts/EmploymentTimelineChart';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (!getApiKey()) {
      navigate('/');
      return;
    }

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await getSummary(filters);
        setSummary(res.data.summary);
      } catch (err) {
        console.error('Failed to fetch summary:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [filters, navigate]);

  const handleFilterChange = (newFilters) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([key, value]) => value !== '')
    );
    setFilters(cleanFilters);
  };

  const handleExportCSV = async () => {
    try {
      const res = await getSummary(filters);
      const data = res.data.summary;

      const csv = [
        ['Metric', 'Value'],
        ['Total Alumni', data.totalAlumni],
        ['Total Certifications', data.totalCertifications],
        ['Currently Employed', data.totalEmployed],
        ['Total Courses', data.totalCourses],
        ['Avg Certs per Alumni', data.avgCertsPerAlumni],
        ['Employment Rate', `${data.employmentRate}%`]
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'alumni-summary.csv';
      a.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // Only show full-page loading on initial load, not on filter changes
  if (loading && !summary) {
    return (
      <>
        <Navbar />
        <div className="hero-actions">
          {loading && <div className="loading-spinner-small" />}
          <button className="btn-export" onClick={handleExportCSV}>
            Export CSV
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="dashboard-shell">
      <Navbar />

      {/* Hero Header */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-inner">
          <div>
            <h1 className="dashboard-hero-title">Analytics Dashboard</h1>
            <p className="dashboard-hero-sub">
              Alumni insights &amp; career intelligence
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {loading && <div className="loading-spinner-small" />}
            <button className="btn-export" onClick={handleExportCSV}>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-body">
        <div className="stats-row">
          <StatsCard
            theme="purple"
            title="Alumni"
            value={summary?.totalAlumni || 0}
            subtitle={`Total registered`}
          />
          <StatsCard
            theme="teal"
            title="Employed"
            value={summary?.totalEmployed || 0}
            subtitle={`${summary?.employmentRate || 0}% rate`}
          />
          <StatsCard
            theme="amber"
            title="Certifications"
            value={summary?.totalCertifications || 0}
            subtitle={`${summary?.avgCertsPerAlumni || 0} avg`}
          />
          <StatsCard
            theme="coral"
            title="Courses"
            value={summary?.totalCourses || 0}
            subtitle="Completed"
          />
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <FilterPanel onFilterChange={handleFilterChange} />
        </div>

        {/* Charts */}
        <div className="charts-stack">
          <div className="chart-card chart-card--full">
            <p className="chart-eyebrow">Skills analysis</p>
            <h2 className="chart-heading">Skills gap overview</h2>
            <SkillsGapChart filters={filters} />
          </div>

          <div className="chart-card chart-card--halves">
            <div className="chart-half">
              <p className="chart-eyebrow">Employment</p>
              <h2 className="chart-heading">Industry sectors</h2>
              <EmploymentSectorChart filters={filters} />
            </div>
            <div className="chart-half">
              <p className="chart-eyebrow">Roles</p>
              <h2 className="chart-heading">Top job titles</h2>
              <JobTitlesChart filters={filters} />
            </div>
          </div>

          <div className="chart-card chart-card--halves">
            <div className="chart-half">
              <p className="chart-eyebrow">Companies</p>
              <h2 className="chart-heading">Top employers</h2>
              <TopEmployersChart filters={filters} />
            </div>
            <div className="chart-half">
              <p className="chart-eyebrow">Locations</p>
              <h2 className="chart-heading">Geographic spread</h2>
              <GeographicChart filters={filters} />
            </div>
          </div>

          <div className="chart-card chart-card--full">
            <p className="chart-eyebrow">Over time</p>
            <h2 className="chart-heading">Certification trends</h2>
            <CertTrendsChart filters={filters} />
          </div>

          <div className="chart-card chart-card--full">
            <p className="chart-eyebrow">Programme intelligence</p>
            <h2 className="chart-heading">Programme comparison</h2>
            <ProgrammeRadarChart filters={filters} />
          </div>
          <div className="chart-card chart-card--full">
            <p className="chart-eyebrow">Career Progression</p>
            <h2 className="chart-heading">Career Progression</h2>
            <CareerProgressionChart filters={filters} />
          </div>
          <div className="chart-card chart-card--full">
            <p className="chart-eyebrow">Employment Trends</p>
            <h2 className="chart-heading">Employment Timeline</h2>
            <EmploymentTimelineChart filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
}