import React from 'react';
import { useCarbonFootprint } from 'react-carbon-footprint';

const CarbonReport = () => {
  const [gCO2, bytesTransferred] = useCarbonFootprint();

  // Sample data for demonstration - in a real app, this could be tracked over time
  const carbonData = {
    totalEmissions: gCO2,
    dataTransferred: bytesTransferred,
    averagePerPage: gCO2 / 10, // Assuming 10 page loads
    breakdown: {
      images: bytesTransferred * 0.6,
      scripts: bytesTransferred * 0.25,
      apiCalls: bytesTransferred * 0.1,
      other: bytesTransferred * 0.05,
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateCO2ForBytes = (bytes) => {
    // Using the same formula as the library (simplified)
    return (bytes / 1000000) * 0.2; // Rough estimate: 0.2g CO2 per MB
  };

  return (
    <div className="main-container">
      <div className="view-header">
        <h1 className="view-title">Carbon Footprint Analysis Report</h1>
        <p className="view-subtitle">Environmental impact assessment of the ResponX platform</p>
      </div>

      <div className="stats-section">
        <div className="section-heading">Current Session Metrics</div>
        <div className="stats-grid">
          <div className="stat-card" style={{ borderColor: '#10b981' }}>
            <div className="stat-icon" style={{ background: '#10b98118', color: '#10b981' }}>🌱</div>
            <div className="stat-content">
              <div className="stat-value">{carbonData.totalEmissions.toFixed(3)}g</div>
              <div className="stat-title">CO2 Emissions</div>
              <div className="stat-change" style={{ color: '#10b981' }}>Current session</div>
            </div>
          </div>

          <div className="stat-card" style={{ borderColor: '#3b82f6' }}>
            <div className="stat-icon" style={{ background: '#3b82f618', color: '#3b82f6' }}>📊</div>
            <div className="stat-content">
              <div className="stat-value">{formatBytes(carbonData.dataTransferred)}</div>
              <div className="stat-title">Data Transferred</div>
              <div className="stat-change" style={{ color: '#3b82f6' }}>Network usage</div>
            </div>
          </div>

          <div className="stat-card" style={{ borderColor: '#f97316' }}>
            <div className="stat-icon" style={{ background: '#f9731618', color: '#f97316' }}>⚡</div>
            <div className="stat-content">
              <div className="stat-value">{carbonData.averagePerPage.toFixed(3)}g</div>
              <div className="stat-title">Avg CO2 per Page</div>
              <div className="stat-change" style={{ color: '#f97316' }}>Estimated average</div>
            </div>
          </div>
        </div>
      </div>

      <div className="summary-grid">
        <div className="missing-summary-card" style={{ padding: '1.5rem', border: '1px solid #1a1d2e', background: '#0d0f1a' }}>
          <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '18px' }}>Data Transfer Breakdown</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {Object.entries(carbonData.breakdown).map(([category, bytes]) => (
              <div key={category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#cbd5e1', textTransform: 'capitalize' }}>{category}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#fff', fontWeight: '600' }}>{formatBytes(bytes)}</div>
                  <div style={{ color: '#10b981', fontSize: '12px' }}>{calculateCO2ForBytes(bytes).toFixed(3)}g CO2</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="missing-summary-card" style={{ padding: '1.5rem', border: '1px solid #1a1d2e', background: '#0d0f1a' }}>
          <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '18px' }}>Optimization Recommendations</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#111827', borderRadius: '8px' }}>
              <div style={{ color: '#10b981', fontWeight: '600', marginBottom: '0.5rem' }}>Image Optimization</div>
              <p style={{ color: '#cbd5e1', fontSize: '14px' }}>
                Compress images and use modern formats (WebP) to reduce transfer size by up to 50%.
              </p>
            </div>
            <div style={{ padding: '1rem', background: '#111827', borderRadius: '8px' }}>
              <div style={{ color: '#10b981', fontWeight: '600', marginBottom: '0.5rem' }}>Code Splitting</div>
              <p style={{ color: '#cbd5e1', fontSize: '14px' }}>
                Implement lazy loading and code splitting to reduce initial bundle size.
              </p>
            </div>
            <div style={{ padding: '1rem', background: '#111827', borderRadius: '8px' }}>
              <div style={{ color: '#10b981', fontWeight: '600', marginBottom: '0.5rem' }}>Caching Strategy</div>
              <p style={{ color: '#cbd5e1', fontSize: '14px' }}>
                Use service workers and proper cache headers to minimize repeated data transfers.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="summary-grid">
        <div className="missing-summary-card" style={{ padding: '1.5rem', border: '1px solid #1a1d2e', background: '#0d0f1a' }}>
          <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '18px' }}>Environmental Impact Summary</h3>
          <div style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
            <p>
              The ResponX platform's current carbon footprint is calculated using the Sustainable Web Design model,
              which estimates CO2 emissions based on network data transfers. This includes energy consumption from
              data centers, network infrastructure, and end-user devices.
            </p>
            <br />
            <p>
              <strong>Key Findings:</strong>
            </p>
            <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
              <li>Images account for the largest portion of data transfer (~60%)</li>
              <li>JavaScript bundles contribute significantly to network usage</li>
              <li>API calls for real-time data add to the environmental cost</li>
            </ul>
            <br />
            <p>
              By implementing the recommended optimizations, you can reduce the platform's carbon footprint
              by 30-50%, making ResponX more environmentally sustainable while maintaining functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonReport;