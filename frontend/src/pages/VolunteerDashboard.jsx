import { useState } from "react";

const mockRequests = [
  {
    id: "REQ-7F3K2A",
    name: "Fatema Begum",
    phone: "01711234567",
    people: 5,
    location: "Ward 12, Sylhet Sadar",
    urgency: "critical",
    needs: ["rescue", "medical"],
    description: "We are on the 2nd floor. Road is fully flooded. Elderly mother needs insulin.",
    time: "8 mins ago",
    status: "pending",
  },
  {
    id: "REQ-2X9QM1",
    name: "Rahim Uddin",
    phone: "01831234567",
    people: 3,
    location: "Ambarkhana, Sylhet",
    urgency: "high",
    needs: ["food", "water"],
    description: "3 days without food. Children are hungry. Water is dirty.",
    time: "22 mins ago",
    status: "pending",
  },
  {
    id: "REQ-B4TK8R",
    name: "Nasrin Akter",
    phone: "01912345678",
    people: 8,
    location: "Golapganj Upazila",
    urgency: "high",
    needs: ["shelter", "clothing"],
    description: "House is flooded. 8 people need shelter including 2 toddlers.",
    time: "35 mins ago",
    status: "accepted",
    volunteer: "You",
  },
  {
    id: "REQ-M7CZ3P",
    name: "Karim Sheikh",
    phone: "01521234567",
    people: 2,
    location: "Sunamganj District",
    urgency: "medium",
    needs: ["medical", "food"],
    description: "Wife has fever. Need medicine and dry food supplies.",
    time: "1 hr ago",
    status: "pending",
  },
  {
    id: "REQ-Q1WN6S",
    name: "Momtaz Ali",
    phone: "01611234567",
    people: 12,
    location: "Zakiganj, Sylhet",
    urgency: "critical",
    needs: ["rescue", "food", "water"],
    description: "Large family. Trapped. Water rising fast. Need immediate rescue.",
    time: "2 hrs ago",
    status: "dispatched",
    volunteer: "Abdul Karim",
  },
];

const urgencyConfig = {
  critical: { color: "#ff2d2d", bg: "#1a0404", label: "CRITICAL" },
  high: { color: "#ff7b00", bg: "#1a0d00", label: "HIGH" },
  medium: { color: "#f5c518", bg: "#1a1500", label: "MEDIUM" },
  low: { color: "#4ade80", bg: "#041a08", label: "LOW" },
};

const needIcons = {
  food: "🍚", water: "💧", medical: "🩺",
  shelter: "🏠", clothing: "👕", rescue: "🚨",
};

const statusConfig = {
  pending: { color: "#f5c518", label: "Awaiting Response" },
  accepted: { color: "#4ade80", label: "Accepted" },
  dispatched: { color: "#60a5fa", label: "Dispatched" },
};

export default function VolunteerDashboard() {
  const [requests, setRequests] = useState(mockRequests);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = requests.filter((r) => {
    if (filter === "all") return true;
    if (filter === "pending") return r.status === "pending";
    if (filter === "mine") return r.volunteer === "You";
    return r.urgency === filter;
  });

  const accept = (id) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "accepted", volunteer: "You" } : r
      )
    );
    setSelected(null);
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const criticalCount = requests.filter((r) => r.urgency === "critical" && r.status === "pending").length;

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.layout}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.logoRow}>
            <span style={styles.logoIcon}>⚡</span>
            <span style={styles.logoText}>ResponX</span>
          </div>

          <div style={styles.volunteerCard}>
            <div style={styles.avatarCircle}>VL</div>
            <div>
              <div style={styles.volunteerName}>Volunteer</div>
              <div style={styles.volunteerBadge}>
                <span style={styles.badgeDot} />
                Trusted
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <span style={styles.statNum}>{requests.length}</span>
              <span style={styles.statLabel}>Total Requests</span>
            </div>
            <div style={{ ...styles.statBox, borderColor: "#3a0a0a" }}>
              <span style={{ ...styles.statNum, color: "#ff2d2d" }}>{criticalCount}</span>
              <span style={styles.statLabel}>Critical</span>
            </div>
            <div style={styles.statBox}>
              <span style={{ ...styles.statNum, color: "#f5c518" }}>{pendingCount}</span>
              <span style={styles.statLabel}>Pending</span>
            </div>
            <div style={styles.statBox}>
              <span style={{ ...styles.statNum, color: "#4ade80" }}>
                {requests.filter((r) => r.volunteer === "You").length}
              </span>
              <span style={styles.statLabel}>Accepted</span>
            </div>
          </div>

          {/* Filters */}
          <div style={styles.filterSection}>
            <div style={styles.filterTitle}>FILTER</div>
            {[
              { key: "all", label: "All Requests" },
              { key: "pending", label: "Pending Only" },
              { key: "mine", label: "My Accepted" },
              { key: "critical", label: "🔴 Critical" },
              { key: "high", label: "🟠 High Priority" },
            ].map((f) => (
              <button
                key={f.key}
                style={{
                  ...styles.filterBtn,
                  backgroundColor: filter === f.key ? "#1a1a1a" : "transparent",
                  color: filter === f.key ? "#fff" : "#555",
                  borderLeft: filter === f.key ? "2px solid #e63946" : "2px solid transparent",
                }}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main style={styles.main}>
          <div style={styles.mainHeader}>
            <div>
              <h1 style={styles.mainTitle}>Aid Requests</h1>
              <p style={styles.mainSub}>
                {filtered.length} request{filtered.length !== 1 ? "s" : ""} shown
              </p>
            </div>
            <div style={styles.liveIndicator}>
              <span style={styles.liveDot} />
              <span style={styles.liveText}>LIVE</span>
            </div>
          </div>

          <div style={styles.requestList}>
            {filtered.map((req) => {
              const urg = urgencyConfig[req.urgency];
              const stat = statusConfig[req.status];
              return (
                <div
                  key={req.id}
                  style={{
                    ...styles.requestCard,
                    borderLeft: `3px solid ${urg.color}`,
                    cursor: "pointer",
                  }}
                  onClick={() => setSelected(req)}
                >
                  <div style={styles.cardTop}>
                    <div style={styles.cardLeft}>
                      <div style={styles.cardId}>{req.id}</div>
                      <div style={styles.cardName}>{req.name}</div>
                      <div style={styles.cardLocation}>📍 {req.location}</div>
                    </div>
                    <div style={styles.cardRight}>
                      <span
                        style={{
                          ...styles.urgencyTag,
                          color: urg.color,
                          backgroundColor: urg.bg,
                          border: `1px solid ${urg.color}33`,
                        }}
                      >
                        {urg.label}
                      </span>
                      <span
                        style={{
                          ...styles.statusTag,
                          color: stat.color,
                        }}
                      >
                        {stat.label}
                      </span>
                    </div>
                  </div>

                  <div style={styles.cardNeeds}>
                    {req.needs.map((n) => (
                      <span key={n} style={styles.needTag}>
                        {needIcons[n]} {n}
                      </span>
                    ))}
                  </div>

                  <div style={styles.cardFooter}>
                    <span style={styles.cardPeople}>👥 {req.people} people</span>
                    <span style={styles.cardTime}>{req.time}</span>
                    {req.status === "pending" && (
                      <button
                        style={styles.acceptBtnSmall}
                        onClick={(e) => {
                          e.stopPropagation();
                          accept(req.id);
                        }}
                      >
                        Accept
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalId}>{selected.id}</div>
                <div style={styles.modalName}>{selected.name}</div>
              </div>
              <button style={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalRow}>
                <div style={styles.modalField}>
                  <span style={styles.modalLabel}>Phone</span>
                  <span style={styles.modalValue}>{selected.phone}</span>
                </div>
                <div style={styles.modalField}>
                  <span style={styles.modalLabel}>People Affected</span>
                  <span style={styles.modalValue}>{selected.people}</span>
                </div>
              </div>
              <div style={styles.modalField}>
                <span style={styles.modalLabel}>Location</span>
                <span style={styles.modalValue}>📍 {selected.location}</span>
              </div>
              <div style={styles.modalField}>
                <span style={styles.modalLabel}>Urgency</span>
                <span style={{
                  ...styles.urgencyTag,
                  color: urgencyConfig[selected.urgency].color,
                  backgroundColor: urgencyConfig[selected.urgency].bg,
                  border: `1px solid ${urgencyConfig[selected.urgency].color}33`,
                  display: "inline-block",
                }}>
                  {urgencyConfig[selected.urgency].label}
                </span>
              </div>
              <div style={styles.modalField}>
                <span style={styles.modalLabel}>Needs</span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  {selected.needs.map((n) => (
                    <span key={n} style={styles.needTag}>
                      {needIcons[n]} {n}
                    </span>
                  ))}
                </div>
              </div>
              {selected.description && (
                <div style={styles.modalField}>
                  <span style={styles.modalLabel}>Description</span>
                  <p style={styles.modalDesc}>{selected.description}</p>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              {selected.status === "pending" ? (
                <button
                  style={styles.acceptBtnLarge}
                  onClick={() => accept(selected.id)}
                >
                  ✓ Accept This Request
                </button>
              ) : (
                <div style={{ color: "#4ade80", fontSize: 13, fontWeight: 600 }}>
                  ✓ {selected.status === "accepted" ? "You accepted this request" : `Dispatched to ${selected.volunteer}`}
                </div>
              )}
              <button style={styles.closeModalBtn} onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
  },
  blob1: {
    position: "fixed",
    top: -200,
    right: -200,
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(230,57,70,0.05) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "fixed",
    bottom: -300,
    left: -200,
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(96,165,250,0.03) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  layout: {
    display: "flex",
    minHeight: "100vh",
    position: "relative",
    zIndex: 1,
  },
  sidebar: {
    width: 240,
    borderRight: "1px solid #141414",
    padding: "32px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 28,
    flexShrink: 0,
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: { fontSize: 18 },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "#fff",
  },
  volunteerCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0f0f0f",
    border: "1px solid #1a1a1a",
    borderRadius: 8,
    padding: "12px",
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    backgroundColor: "#1a0808",
    border: "2px solid #e63946",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    color: "#e63946",
    flexShrink: 0,
  },
  volunteerName: {
    fontSize: 16,
    fontWeight: 600,
    color: "#fff",
  },
  volunteerBadge: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 13,
    color: "#4ade80",
    marginTop: 3,
    letterSpacing: "0.1em",
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    backgroundColor: "#4ade80",
    boxShadow: "0 0 4px #4ade80",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  statBox: {
    backgroundColor: "#0f0f0f",
    border: "1px solid #1a1a1a",
    borderRadius: 6,
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  statNum: {
    fontSize: 22,
    fontWeight: 700,
    color: "#fff",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 13,
    color: "#bebbbb",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  filterSection: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  filterTitle: {
    fontSize: 13,
    color: "#ffffff",
    letterSpacing: "0.2em",
    marginBottom: 6,
    paddingLeft: 10,
  },
  filterBtn: {
    textAlign: "left",
    padding: "9px 12px",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "inherit",
    transition: "all 0.15s",
    borderLeft: "2px solid transparent",
  },
  main: {
    flex: 1,
    padding: "32px 28px",
    overflow: "auto",
  },
  mainHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: "#fff",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  mainSub: {
    fontSize: 16,
    color: "#bcb0b0",
    margin: "4px 0 0",
  },
  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0a1a0a",
    border: "1px solid #1a3a1a",
    borderRadius: 4,
    padding: "8px 14px",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "#4ade80",
    boxShadow: "0 0 8px #4ade80",
  },
  liveText: {
    fontSize: 11,
    letterSpacing: "0.2em",
    color: "#4ade80",
    fontWeight: 600,
  },
  requestList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  requestCard: {
    backgroundColor: "#0c0c0c",
    border: "1px solid #1a1a1a",
    borderRadius: 8,
    padding: "16px 18px",
    transition: "border-color 0.2s, background-color 0.2s",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  cardId: {
    fontSize: 12,
    color: "#878787",
    letterSpacing: "0.1em",
  },
  cardName: {
    fontSize: 17,
    fontWeight: 600,
    color: "#ddd",
  },
  cardLocation: {
    fontSize: 13,
    color: "#878686",
  },
  cardRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
  },
  urgencyTag: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.12em",
    padding: "3px 10px",
    borderRadius: 3,
  },
  statusTag: {
    fontSize: 11,
    letterSpacing: "0.05em",
  },
  cardNeeds: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  needTag: {
    fontSize: 13,
    backgroundColor: "#111",
    border: "1px solid #222",
    borderRadius: 4,
    padding: "3px 10px",
    color: "#d1d1d1",
    textTransform: "capitalize",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    borderTop: "1px solid #141414",
    paddingTop: 10,
  },
  cardPeople: {
    fontSize: 12,
    color: "#afafaf",
  },
  cardTime: {
    fontSize: 11,
    color: "#908f8f",
    marginLeft: "auto",
  },
  acceptBtnSmall: {
    backgroundColor: "#e63946",
    border: "none",
    borderRadius: 4,
    padding: "5px 16px",
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.05em",
  },
  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 20,
  },
  modal: {
    backgroundColor: "#0e0e0e",
    border: "1px solid #222",
    borderRadius: 10,
    width: "100%",
    maxWidth: 520,
    maxHeight: "90vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "24px 24px 0",
  },
  modalId: {
    fontSize: 10,
    color: "#444",
    letterSpacing: "0.1em",
    marginBottom: 4,
  },
  modalName: {
    fontSize: 20,
    fontWeight: 700,
    color: "#fff",
  },
  closeBtn: {
    backgroundColor: "transparent",
    border: "1px solid #222",
    borderRadius: 4,
    padding: "6px 10px",
    color: "#555",
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "inherit",
  },
  modalBody: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  modalRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  modalField: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  modalLabel: {
    fontSize: 9,
    color: "#444",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
  },
  modalValue: {
    fontSize: 14,
    color: "#ccc",
    fontWeight: 500,
  },
  modalDesc: {
    fontSize: 13,
    color: "#777",
    backgroundColor: "#111",
    border: "1px solid #1a1a1a",
    borderRadius: 6,
    padding: "12px",
    margin: 0,
    lineHeight: 1.6,
  },
  modalFooter: {
    padding: "16px 24px 24px",
    display: "flex",
    gap: 12,
    alignItems: "center",
    borderTop: "1px solid #141414",
  },
  acceptBtnLarge: {
    flex: 1,
    backgroundColor: "#e63946",
    border: "none",
    borderRadius: 6,
    padding: "14px",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.1em",
  },
  closeModalBtn: {
    backgroundColor: "transparent",
    border: "1px solid #222",
    borderRadius: 6,
    padding: "14px 20px",
    color: "#555",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
