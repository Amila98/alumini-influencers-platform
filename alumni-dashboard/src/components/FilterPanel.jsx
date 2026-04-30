import { useState, useEffect } from 'react';
import { getFilterOptions } from '../services/api';
import './FilterPanel.css';

export default function FilterPanel({ onFilterChange }) {
  const [filters, setFilters] = useState({
    programme: '',
    graduationYear: '',
    sector: ''
  });
  const [options, setOptions] = useState({
    programmes: [],
    graduationYears: [],
    sectors: []
  });
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await getFilterOptions();
        setOptions(res.data);
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Fire API only on Search click
  const handleSearch = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const emptyFilters = { programme: '', graduationYear: '', sector: '' };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const isFiltered = filters.programme || filters.graduationYear || filters.sector;

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h3>Filters</h3>
        {isFiltered && (
          <span className="filter-active-badge">Filters active</span>
        )}
      </div>

      <div className="filter-grid">
        <div className="filter-group">
          <label>Programme</label>
          <select
            value={filters.programme}
            onChange={(e) => handleChange('programme', e.target.value)}
            disabled={loadingOptions}
          >
            <option value="">All programmes</option>
            {options.programmes.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Graduation Year</label>
          <select
            value={filters.graduationYear}
            onChange={(e) => handleChange('graduationYear', e.target.value)}
            disabled={loadingOptions}
          >
            <option value="">All years</option>
            {options.graduationYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Industry Sector</label>
          <select
            value={filters.sector}
            onChange={(e) => handleChange('sector', e.target.value)}
            disabled={loadingOptions}
          >
            <option value="">All sectors</option>
            {options.sectors.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="filter-actions">
          <button className="btn-search" onClick={handleSearch}>
            Search
          </button>
          <button className="btn-reset" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}