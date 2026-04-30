import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiKey, getAllAlumni } from '../services/api';
import Navbar from '../components/Navbar';
import FilterPanel from '../components/FilterPanel';
import './AlumniList.css';

const PAGE_SIZE = 10;

export default function AlumniList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
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
        const res = await getAllAlumni(filters);
        setAlumni(res.data.alumni || []);
        setCurrentPage(1); // reset to page 1 on filter change
      } catch (err) {
        console.error('Failed to fetch alumni:', err);
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

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Programme', 'Graduation Year', 'Current Job', 'Company'];
    const rows = alumni.map(a => [
      a.bio || 'N/A',
      a.User?.email || '',
      a.programme || '',
      a.graduationYear || '',
      a.Employments?.[0]?.jobTitle || 'N/A',
      a.Employments?.[0]?.company || 'N/A'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alumni-list.csv';
    a.click();
  };

  const getInitials = (email, bio) => {
    if (bio && bio !== 'Anonymous Alumni') {
      const parts = bio.trim().split(' ');
      return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
    }
    return email?.[0]?.toUpperCase() || '?';
  };

  const avatarColors = [
    '#534AB7', '#0F6E56', '#993C1D', '#185FA5',
    '#854F0B', '#993556', '#3B6D11', '#A32D2D'
  ];
  const getAvatarColor = (id) => avatarColors[id % avatarColors.length];

  // Pagination calculations
  const totalPages = Math.ceil(alumni.length / PAGE_SIZE);
  const paginatedAlumni = alumni.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  if (loading && alumni.length === 0) {
    return (
      <>
        <Navbar />
        <div className="alumni-loading">
          <div className="loading-spinner" />
          <span>Loading alumni...</span>
        </div>
      </>
    );
  }

  return (
    <div className="alumni-shell">
      <Navbar />

      <div className="alumni-hero">
        <div className="alumni-hero-inner">
          <div>
            <h1 className="alumni-hero-title">Alumni Directory</h1>
            <p className="alumni-hero-sub">
              {alumni.length} alumni found
              {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {loading && <div className="loading-spinner-small" />}
            <button className="btn-export" onClick={exportToCSV}>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="alumni-body">

        <div className="filter-bar">
          <FilterPanel onFilterChange={handleFilterChange} />
        </div>

        {alumni.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="14" r="8" stroke="#534AB7" strokeWidth="2"/>
                <path d="M6 36c0-7.732 6.268-12 14-12s14 4.268 14 12" stroke="#534AB7" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p>No alumni found matching the current filters.</p>
            <span>Try adjusting your search criteria</span>
          </div>
        ) : (
          <>
            {/* Results info */}
            <div className="results-info">
              <span>
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, alumni.length)} of {alumni.length} alumni
              </span>
            </div>

            {/* List */}
            <div className="alumni-list">
              {paginatedAlumni.map((a) => (
                <div key={a.id} className="alumni-row">

                  <div
                    className="alumni-avatar"
                    style={{ background: getAvatarColor(a.id) }}
                  >
                    {getInitials(a.User?.email, a.bio).toUpperCase()}
                  </div>

                  <div className="alumni-identity">
                    <span className="alumni-name">{a.bio || 'Anonymous Alumni'}</span>
                    <span className="alumni-email">{a.User?.email}</span>
                  </div>

                  <div className="alumni-col">
                    <span className="col-label">Programme</span>
                    <span className="col-value">{a.programme || '—'}</span>
                  </div>

                  <div className="alumni-col alumni-col--narrow">
                    <span className="col-label">Graduated</span>
                    <span className="col-value">{a.graduationYear || '—'}</span>
                  </div>

                  <div className="alumni-col">
                    <span className="col-label">Current role</span>
                    <span className="col-value">
                      {a.Employments?.[0]?.jobTitle || 'Not specified'}
                    </span>
                  </div>

                  <div className="alumni-col">
                    <span className="col-label">Company</span>
                    <span className="col-value">
                      {a.Employments?.[0]?.company || '—'}
                    </span>
                  </div>

                  <div className="alumni-badges">
                    <span className="badge badge--purple">{a.Certifications?.length || 0} certs</span>
                    <span className="badge badge--teal">{a.Courses?.length || 0} courses</span>
                  </div>

                  {a.linkedInUrl ? (
                    <a
                      href={a.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-linkedin"
                    >
                      LinkedIn
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </a>
                  ) : (
                    <div className="btn-linkedin-placeholder" />
                  )}

                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn page-btn--nav"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Prev
                </button>

                {getPageNumbers().map((page, i) =>
                  page === '...' ? (
                    <span key={`dots-${i}`} className="page-dots">···</span>
                  ) : (
                    <button
                      key={page}
                      className={`page-btn ${currentPage === page ? 'page-btn--active' : ''}`}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  className="page-btn page-btn--nav"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}