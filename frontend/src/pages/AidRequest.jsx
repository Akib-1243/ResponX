import { useState } from "react";

const urgencyLevels = [
  { value: "critical", label: "Critical", color: "#ff2d2d" },
  { value: "high", label: "High", color: "#ff7b00" },
  { value: "medium", label: "Medium", color: "#f5c518" },
  { value: "low", label: "Low", color: "#4ade80" },
];

const needTypes = [
  { id: "food", icon: "🍚", label: "Dry Food" },
  { id: "water", icon: "💧", label: "Clean Water" },
  { id: "medical", icon: "🩺", label: "Medical Aid" },
  { id: "shelter", icon: "🏠", label: "Shelter" },
  { id: "clothing", icon: "👕", label: "Clothing" },
  { id: "rescue", icon: "🚨", label: "Rescue" },
];

export default function AidRequest() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    people: "",
    location: "",
    urgency: "",
    needs: [],
    description: "",
    shareLocation: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const toggleNeed = (id) => {
    setForm((f) => ({
      ...f,
      needs: f.needs.includes(id) ? f.needs.filter((n) => n !== id) : [...f.needs, id],
    }));
  };

  const getLocation = () => {
    setLocLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          location: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
          shareLocation: true,
        }));
        setLocLoading(false);
      },
      () => setLocLoading(false)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.successBox}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Request Submitted</h2>
          <p style={styles.successSub}>
            Your aid request has been logged. Volunteers in your area will be notified immediately.
          </p>
          <div style={styles.refBox}>
            <span style={styles.refLabel}>Reference ID</span>
            <span style={styles.refId}>REQ-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
          </div>
          <button style={styles.newBtn} onClick={() => setSubmitted(false)}>
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Ambient background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoRow}>
            <span style={styles.logoIcon}>⚡</span>
            <span style={styles.logoText}>ResponX</span>
          </div>
          <div style={styles.alertBanner}>
            <span style={styles.alertDot} />
            <span style={styles.alertText}>LIVE COORDINATION ACTIVE</span>
          </div>
        </div>

        <h1 style={styles.pageTitle}>Request Aid</h1>
        <p style={styles.pageSubtitle}>
          Fill in the details below. All requests are verified and dispatched to nearby volunteers.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Personal Info */}
          <div style={styles.section}>
            <div style={styles.sectionLabel}>
              <span style={styles.sectionNum}>01</span> Your Information
            </div>
            <div style={styles.row2}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Ariful Islam"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  onFocus={(e) => (e.target.style.borderColor = "#e63946")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Phone Number</label>
                <input
                  style={styles.input}
                  placeholder="01XXXXXXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  onFocus={(e) => (e.target.style.borderColor = "#e63946")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Number of People Affected</label>
              <input
                style={{ ...styles.input, maxWidth: 200 }}
                type="number"
                min="1"
                placeholder="e.g. 4"
                value={form.people}
                onChange={(e) => setForm({ ...form, people: e.target.value })}
                required
                onFocus={(e) => (e.target.style.borderColor = "#e63946")}
                onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
              />
            </div>
          </div>

          {/* Location */}
          <div style={styles.section}>
            <div style={styles.sectionLabel}>
              <span style={styles.sectionNum}>02</span> Location
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Current Location / Address</label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  placeholder="Ward, Area, District or GPS coordinates"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                  onFocus={(e) => (e.target.style.borderColor = "#e63946")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
                />
                <button
                  type="button"
                  style={styles.locBtn}
                  onClick={getLocation}
                  title="Use GPS"
                >
                  {locLoading ? "..." : "📍 GPS"}
                </button>
              </div>
              {form.shareLocation && (
                <p style={styles.locConfirm}>✓ GPS location captured</p>
              )}
            </div>
          </div>

          {/* Urgency */}
          <div style={styles.section}>
            <div style={styles.sectionLabel}>
              <span style={styles.sectionNum}>03</span> Urgency Level
            </div>
            <div style={styles.urgencyRow}>
              {urgencyLevels.map((u) => (
                <button
                  key={u.value}
                  type="button"
                  style={{
                    ...styles.urgencyBtn,
                    borderColor: form.urgency === u.value ? u.color : "#2a2a2a",
                    backgroundColor: form.urgency === u.value ? `${u.color}18` : "transparent",
                    color: form.urgency === u.value ? u.color : "#666",
                  }}
                  onClick={() => setForm({ ...form, urgency: u.value })}
                >
                  <span
                    style={{
                      ...styles.urgencyDot,
                      backgroundColor: u.color,
                      boxShadow: form.urgency === u.value ? `0 0 8px ${u.color}` : "none",
                    }}
                  />
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* Needs */}
          <div style={styles.section}>
            <div style={styles.sectionLabel}>
              <span style={styles.sectionNum}>04</span> What Do You Need?
            </div>
            <div style={styles.needsGrid}>
              {needTypes.map((n) => {
                const selected = form.needs.includes(n.id);
                return (
                  <button
                    key={n.id}
                    type="button"
                    style={{
                      ...styles.needBtn,
                      borderColor: selected ? "#e63946" : "#2a2a2a",
                      backgroundColor: selected ? "#e6394618" : "#111",
                      color: selected ? "#fff" : "#555",
                    }}
                    onClick={() => toggleNeed(n.id)}
                  >
                    <span style={styles.needIcon}>{n.icon}</span>
                    <span style={styles.needLabel}>{n.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div style={styles.section}>
            <div style={styles.sectionLabel}>
              <span style={styles.sectionNum}>05</span> Additional Details
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Describe your situation (optional but helpful)</label>
              <textarea
                style={styles.textarea}
                placeholder="e.g. We are stranded on the rooftop. Road is flooded. Two elderly people cannot move..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                onFocus={(e) => (e.target.style.borderColor = "#e63946")}
                onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
              />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" style={styles.submitBtn}>
            <span style={styles.submitPulse} />
            SEND EMERGENCY REQUEST
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#080808",
    color: "#e0e0e0",
    fontFamily: "'DM Mono', 'Courier New', monospace",
    position: "relative",
    overflow: "hidden",
    padding: "40px 16px 80px",
  },
  blob1: {
    position: "fixed",
    top: -200,
    left: -200,
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(110, 0, 9, 0.18) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "fixed",
    bottom: -300,
    right: -300,
    width: 700,
    height: 700,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(110, 0, 9, 0.18) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  container: {
    maxWidth: 680,
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 48,
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    fontSize: 20,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "#fff",
    fontFamily: "'DM Mono', monospace",
  },
  alertBanner: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1a0a0a",
    border: "1px solid #3a0a0a",
    borderRadius: 4,
    padding: "6px 12px",
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "#e63946",
    boxShadow: "0 0 6px #e63946",
    animation: "none",
  },
  alertText: {
    fontSize: 10,
    letterSpacing: "0.15em",
    color: "#e63946",
    fontWeight: 600,
  },
  pageTitle: {
    fontSize: 42,
    fontWeight: 800,
    color: "#fff",
    margin: 0,
    lineHeight: 1,
    letterSpacing: "-0.02em",
    fontFamily: "'DM Mono', monospace",
  },
  pageSubtitle: {
    fontSize: 16,
    color: "#e6e4e4",
    marginTop: 12,
    marginBottom: 40,
    lineHeight: 1.6,
    maxWidth: 480,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 32,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  sectionLabel: {
    fontSize: 13,
    letterSpacing: "0.15em",
    color: "#ffffff",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 10,
    textTransform: "uppercase",
    paddingBottom: 8,
    borderBottom: "1px solid #1a1a1a",
  },
  sectionNum: {
    color: "#e63946",
    fontSize: 11,
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: "#ffffff",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#0f0f0f",
    border: "1px solid #2a2a2a",
    borderRadius: 6,
    padding: "12px 14px",
    color: "#e0e0e0",
    fontSize: 14,
    fontFamily: "'DM Mono', 'Courier New', monospace",
    outline: "none",
    transition: "border-color 0.2s",
    width: "100%",
    boxSizing: "border-box",
  },
  locBtn: {
    backgroundColor: "#111",
    border: "1px solid #2a2a2a",
    borderRadius: 6,
    padding: "0 16px",
    color: "#aaa",
    fontSize: 12,
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  },
  locConfirm: {
    fontSize: 11,
    color: "#4ade80",
    margin: 0,
  },
  urgencyRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  urgencyBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    border: "1px solid",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "inherit",
    fontWeight: 500,
    transition: "all 0.2s",
    letterSpacing: "0.03em",
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    transition: "box-shadow 0.2s",
  },
  needsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
  },
  needBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "14px 10px",
    border: "1px solid",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  needIcon: {
    fontSize: 22,
  },
  needLabel: {
    fontSize: 13,
    letterSpacing: "0.05em",
  },
  textarea: {
    backgroundColor: "#0f0f0f",
    border: "1px solid #2a2a2a",
    borderRadius: 6,
    padding: "12px 14px",
    color: "#e0e0e0",
    fontSize: 14,
    fontFamily: "'DM Mono', 'Courier New', monospace",
    outline: "none",
    resize: "vertical",
    transition: "border-color 0.2s",
    width: "100%",
    boxSizing: "border-box",
  },
  submitBtn: {
    position: "relative",
    backgroundColor: "#e63946",
    border: "none",
    borderRadius: 6,
    padding: "18px",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.15em",
    cursor: "pointer",
    fontFamily: "inherit",
    textTransform: "uppercase",
    overflow: "hidden",
    marginTop: 8,
  },
  submitPulse: {
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
    animation: "shimmer 2s infinite",
  },
  // Success screen
  successBox: {
    maxWidth: 480,
    margin: "10vh auto",
    textAlign: "center",
    padding: "60px 40px",
    backgroundColor: "#0c0c0c",
    border: "1px solid #1f1f1f",
    borderRadius: 12,
    position: "relative",
    zIndex: 1,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    backgroundColor: "#0f2a0f",
    border: "2px solid #4ade80",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    color: "#4ade80",
    margin: "0 auto 24px",
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 12px",
    fontFamily: "'DM Mono', monospace",
  },
  successSub: {
    fontSize: 14,
    color: "#555",
    lineHeight: 1.6,
    margin: "0 0 32px",
  },
  refBox: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    backgroundColor: "#111",
    border: "1px solid #1f1f1f",
    borderRadius: 8,
    padding: "16px",
    marginBottom: 32,
  },
  refLabel: {
    fontSize: 12,
    letterSpacing: "0.15em",
    color: "#444",
    textTransform: "uppercase",
  },
  refId: {
    fontSize: 20,
    fontWeight: 700,
    color: "#e63946",
    letterSpacing: "0.1em",
  },
  newBtn: {
    backgroundColor: "transparent",
    border: "1px solid #2a2a2a",
    borderRadius: 6,
    padding: "12px 28px",
    color: "#aaa",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.08em",
  },
};
