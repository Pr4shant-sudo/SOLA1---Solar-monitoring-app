import React, { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0a0f1e",
  bgCard: "rgba(255,255,255,0.04)", 
  bgCardHover: "rgba(255,255,255,0.07)",
  green: "#00e87a",
  greenDim: "#00b85f",
  blue: "#0ea5e9",
  blueDim: "#0284c7",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#a78bfa",
  border: "rgba(255,255,255,0.08)",
  text: "#f0f4ff",
  textMuted: "#8899bb",
  textDim: "#4a5a7a",
};

const GlassCard = ({ children, style = {}, onClick, glow }) => (
  <div
    onClick={onClick}
    style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${COLORS.border}`,
      borderRadius: 20,
      padding: 20,
      backdropFilter: "blur(12px)",
      boxShadow: glow
        ? `0 0 32px ${glow}33, 0 8px 32px rgba(0,0,0,0.4)`
        : "0 4px 24px rgba(0,0,0,0.3)",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.25s ease",
      ...style,
    }}
  >
    {children}
  </div>
);

const Badge = ({ children, color = COLORS.green, style = {} }) => (
  <span
    style={{
      background: `${color}22`,
      color,
      border: `1px solid ${color}44`,
      borderRadius: 100,
      fontSize: 10,
      fontWeight: 700,
      padding: "2px 10px",
      letterSpacing: 1,
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </span>
);

const Pulse = ({ color = COLORS.green, size = 8 }) => (
  <span
    style={{
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      boxShadow: `0 0 8px ${color}`,
      animation: "pulse 2s infinite",
    }}
  />
);

// ─── Mini Sparkline ───────────────────────────────────────────────────
const Sparkline = ({ data, color, height = 40, width = 120 }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  const area = `0,${height} ${pts} ${width},${height}`;
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ─── Arc Gauge ────────────────────────────────────────────────────────
const ArcGauge = ({ value, max = 100, color, label, unit, size = 100 }) => {
  const pct = Math.min(value / max, 1);
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const start = -225;
  const sweep = 270 * pct;
  const toRad = (d) => (d * Math.PI) / 180;
  const arc = (deg, radius) => ({
    x: cx + radius * Math.cos(toRad(deg)),
    y: cy + radius * Math.sin(toRad(deg)),
  });
  const s = arc(start, r);
  const e = arc(start + sweep, r);
  const large = sweep > 180 ? 1 : 0;
  const track = arc(-225, r);
  const trackE = arc(45, r);
  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      <path
        d={`M ${track.x} ${track.y} A ${r} ${r} 0 1 1 ${trackE.x} ${trackE.y}`}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={size * 0.07}
        strokeLinecap="round"
      />
      {pct > 0 && (
        <path
          d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`}
          fill="none"
          stroke={color}
          strokeWidth={size * 0.07}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      )}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fill={COLORS.text}
        fontSize={size * 0.2}
        fontWeight={700}
        fontFamily="'DM Mono', monospace"
      >
        {value}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fill={COLORS.textMuted}
        fontSize={size * 0.1}
        fontFamily="system-ui"
      >
        {unit}
      </text>
      <text
        x={cx}
        y={cy + size * 0.38}
        textAnchor="middle"
        fill={color}
        fontSize={size * 0.1}
        fontWeight={600}
        fontFamily="system-ui"
      >
        {label}
      </text>
    </svg>
  );
};

// ─── Bar Chart ────────────────────────────────────────────────────────
const BarChart = ({ data, labels, color, height = 80 }) => {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: "100%",
              height: (v / max) * (height - 20),
              background: `linear-gradient(180deg, ${color}, ${color}66)`,
              borderRadius: "4px 4px 0 0",
              boxShadow: `0 0 8px ${color}44`,
              transition: "height 0.5s ease",
            }}
          />
          <span style={{ color: COLORS.textDim, fontSize: 9 }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Energy Flow Animation ────────────────────────────────────────────
const EnergyFlow = () => {
  const nodes = [
    { id: "sun", x: 50, y: 20, icon: "☀️", label: "Solar", value: "4.2 kW" },
    { id: "battery", x: 20, y: 55, icon: "🔋", label: "Battery", value: "78%" },
    { id: "home", x: 80, y: 55, icon: "🏠", label: "Home", value: "1.8 kW" },
    { id: "grid", x: 50, y: 85, icon: "⚡", label: "Grid", value: "+0.8 kW" },
  ];
  const links = [
    { from: "sun", to: "battery", color: COLORS.green },
    { from: "sun", to: "home", color: COLORS.blue },
    { from: "battery", to: "grid", color: COLORS.amber },
  ];
  return (
    <div style={{ position: "relative", height: 160, marginTop: 8 }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <defs>
          {links.map((l, i) => (
            <linearGradient key={i} id={`flow-${i}`} gradientUnits="userSpaceOnUse">
              <stop stopColor={l.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={l.color} stopOpacity="0.2" />
            </linearGradient>
          ))}
        </defs>
        {links.map((l, i) => {
          const from = nodes.find((n) => n.id === l.from);
          const to = nodes.find((n) => n.id === l.to);
          return (
            <line
              key={i}
              x1={`${from.x}%`} y1={`${from.y}%`}
              x2={`${to.x}%`} y2={`${to.y}%`}
              stroke={l.color}
              strokeWidth="2"
              strokeDasharray="6,4"
              opacity="0.5"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1s" repeatCount="indefinite" />
            </line>
          );
        })}
      </svg>
      {nodes.map((n) => (
        <div
          key={n.id}
          style={{
            position: "absolute",
            left: `${n.x}%`,
            top: `${n.y}%`,
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: 44, height: 44,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${COLORS.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              margin: "0 auto 4px",
              backdropFilter: "blur(8px)",
            }}
          >
            {n.icon}
          </div>
          <div style={{ color: COLORS.text, fontSize: 10, fontWeight: 700 }}>{n.value}</div>
          <div style={{ color: COLORS.textMuted, fontSize: 9 }}>{n.label}</div>
        </div>
      ))}
    </div>
  );
};

// ─── Navigation ───────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "monitor", icon: "📡", label: "Monitor" },
  { id: "camera", icon: "📷", label: "AI Scan" },
  { id: "weather", icon: "🌤", label: "Weather" },
  { id: "chat", icon: "🤖", label: "SOLA AI" },
  { id: "trade", icon: "⚡", label: "Trade" },
  { id: "analytics", icon: "📊", label: "Analytics" },
  { id: "maintenance", icon: "🔧", label: "Service" },
  { id: "installer", icon: "👷", label: "Installer" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

// ══════════════════════════════════════════════════════════════════════
// SCREENS
// ══════════════════════════════════════════════════════════════════════

// ─── 1. DASHBOARD ────────────────────────────────────────────────────
const Dashboard = () => {
  const genData = [3.1, 3.8, 4.2, 4.6, 4.9, 4.4, 4.2, 3.8, 3.2, 2.1, 1.0];
  const weekData = [18, 22, 19, 25, 28, 24, 21];
  const weekLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: COLORS.textMuted, fontSize: 12 }}>Good morning, Rajesh 👋</div>
          <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 800 }}>SOLA1 Dashboard</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge color={COLORS.green}>LIVE</Badge>
          <Pulse />
        </div>
      </div>

      {/* Offline Banner */}
      <div style={{
        background: `${COLORS.amber}15`,
        border: `1px solid ${COLORS.amber}33`,
        borderRadius: 12,
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
      }}>
        <span>📶</span>
        <span style={{ color: COLORS.amber }}>Low signal — Offline mode active. Last sync: 2 min ago</span>
      </div>

      {/* Energy Flow */}
      <GlassCard glow={COLORS.green}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 14 }}>⚡ Live Energy Flow</span>
          <Badge color={COLORS.green}>4.2 kW</Badge>
        </div>
        <EnergyFlow />
      </GlassCard>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "Generation", value: "4.2", unit: "kW", color: COLORS.green, icon: "☀️" },
          { label: "Battery", value: "78", unit: "%", color: COLORS.blue, icon: "🔋" },
          { label: "Savings", value: "₹94", unit: "/day", color: COLORS.amber, icon: "💰" },
        ].map((k) => (
          <GlassCard key={k.label} style={{ padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>{k.icon}</div>
            <div style={{ color: k.color, fontSize: 20, fontWeight: 800, marginTop: 4 }}>{k.value}</div>
            <div style={{ color: COLORS.textMuted, fontSize: 10 }}>{k.unit}</div>
            <div style={{ color: COLORS.textDim, fontSize: 10 }}>{k.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Generation Chart */}
      <GlassCard>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 14 }}>📈 Today's Generation</span>
          <span style={{ color: COLORS.textMuted, fontSize: 11 }}>28.4 kWh total</span>
        </div>
        <div style={{ padding: "0 4px" }}>
          <Sparkline data={genData} color={COLORS.green} height={60} width={300} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          {["6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p", "11p", ""].map((t, i) => (
            <span key={i} style={{ color: COLORS.textDim, fontSize: 8 }}>{t}</span>
          ))}
        </div>
      </GlassCard>

      {/* Weekly Bar */}
      <GlassCard>
        <div style={{ marginBottom: 12, color: COLORS.text, fontWeight: 700, fontSize: 14 }}>📅 Weekly Output (kWh)</div>
        <BarChart data={weekData} labels={weekLabels} color={COLORS.blue} height={80} />
      </GlassCard>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <GlassCard style={{ padding: 16 }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>🌱</div>
          <div style={{ color: COLORS.green, fontSize: 18, fontWeight: 800 }}>127 kg</div>
          <div style={{ color: COLORS.textMuted, fontSize: 11 }}>CO₂ Saved (month)</div>
        </GlassCard>
        <GlassCard style={{ padding: 16 }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>💸</div>
          <div style={{ color: COLORS.amber, fontSize: 18, fontWeight: 800 }}>₹2,840</div>
          <div style={{ color: COLORS.textMuted, fontSize: 11 }}>Earnings (month)</div>
        </GlassCard>
      </div>

      {/* AI Insights */}
      <GlassCard glow={COLORS.blue} style={{ background: `${COLORS.blue}0a` }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ fontSize: 28 }}>🤖</div>
          <div>
            <div style={{ color: COLORS.blue, fontWeight: 700, fontSize: 13 }}>SOLA AI Insight</div>
            <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 4, lineHeight: 1.6 }}>
              Panel efficiency dropped 8% this week. Dust accumulation detected on sectors 2 & 3. Best cleaning day: <span style={{ color: COLORS.green }}>Tomorrow (Mon)</span> — 0% rain, 14 km/h wind.
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Quick Actions */}
      <div style={{ color: COLORS.textMuted, fontSize: 12, fontWeight: 600, marginBottom: -6 }}>QUICK ACTIONS</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
        {[
          { icon: "📷", label: "Scan", color: COLORS.green },
          { icon: "🔧", label: "Service", color: COLORS.amber },
          { icon: "⚡", label: "Trade", color: COLORS.purple },
          { icon: "📊", label: "Reports", color: COLORS.blue },
        ].map((a) => (
          <GlassCard key={a.label} style={{ padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>{a.icon}</div>
            <div style={{ color: a.color, fontSize: 10, fontWeight: 600, marginTop: 6 }}>{a.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Alerts */}
      <GlassCard>
        <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 14, marginBottom: 12 }}>🔔 Alerts</div>
        {[
          { icon: "🟡", msg: "Panel 3 temperature high — 68°C", time: "12m" },
          { icon: "🔴", msg: "Pump Unit B offline — check connection", time: "1h" },
          { icon: "🟢", msg: "Battery fully charged — export ready", time: "2h" },
        ].map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 2 ? `1px solid ${COLORS.border}` : "none" }}>
            <span style={{ fontSize: 14 }}>{a.icon}</span>
            <span style={{ color: COLORS.textMuted, fontSize: 12, flex: 1 }}>{a.msg}</span>
            <span style={{ color: COLORS.textDim, fontSize: 10 }}>{a.time}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  );
};

// ─── 2. MONITOR ──────────────────────────────────────────────────────
const Monitor = () => {
  const [tab, setTab] = useState("rooftop");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 800 }}>📡 Solar Monitor</div>
      <div style={{ display: "flex", gap: 8 }}>
        {["rooftop", "pump"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "10px 0", borderRadius: 12, border: "none", cursor: "pointer",
            background: tab === t ? COLORS.green : "rgba(255,255,255,0.05)",
            color: tab === t ? "#000" : COLORS.textMuted,
            fontWeight: 700, fontSize: 12, textTransform: "capitalize",
          }}>{t === "rooftop" ? "🏠 Rooftop" : "💧 Solar Pump"}</button>
        ))}
      </div>

      {tab === "rooftop" ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <GlassCard style={{ padding: 14, textAlign: "center" }}>
              <ArcGauge value={4.2} max={6} color={COLORS.green} label="Output" unit="kW" size={90} />
            </GlassCard>
            <GlassCard style={{ padding: 14, textAlign: "center" }}>
              <ArcGauge value={78} max={100} color={COLORS.blue} label="Battery" unit="%" size={90} />
            </GlassCard>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Voltage", value: "48.2V", color: COLORS.amber, icon: "⚡" },
              { label: "Current", value: "8.7A", color: COLORS.green, icon: "🔌" },
              { label: "Panel Temp", value: "52°C", color: COLORS.red, icon: "🌡" },
              { label: "Efficiency", value: "89%", color: COLORS.blue, icon: "📈" },
            ].map((m) => (
              <GlassCard key={m.label} style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <span style={{ color: m.color, fontSize: 18, fontWeight: 800 }}>{m.value}</span>
                </div>
                <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 6 }}>{m.label}</div>
              </GlassCard>
            ))}
          </div>
          <GlassCard>
            <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 10 }}>🗂 Panel Grid Status</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
              {Array.from({ length: 12 }, (_, i) => {
                const status = i === 2 ? "warn" : i === 7 ? "fault" : "ok";
                const c = status === "ok" ? COLORS.green : status === "warn" ? COLORS.amber : COLORS.red;
                return (
                  <div key={i} style={{
                    height: 32, borderRadius: 6, background: `${c}22`,
                    border: `1px solid ${c}66`, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 9, color: c, fontWeight: 700,
                  }}>P{i + 1}</div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              {[["🟢", "Normal", COLORS.green], ["🟡", "Warning", COLORS.amber], ["🔴", "Fault", COLORS.red]].map(([dot, l, c]) => (
                <span key={l} style={{ fontSize: 10, color: c }}>{dot} {l}</span>
              ))}
            </div>
          </GlassCard>
          <GlassCard>
            <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 10 }}>🔘 Remote Control</div>
            {[
              { label: "System Power", state: true },
              { label: "Export to Grid", state: true },
              { label: "Night Mode", state: false },
            ].map((c) => (
              <div key={c.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ color: COLORS.textMuted, fontSize: 13 }}>{c.label}</span>
                <div style={{
                  width: 44, height: 24, borderRadius: 100,
                  background: c.state ? COLORS.green : "rgba(255,255,255,0.1)",
                  position: "relative", cursor: "pointer",
                }}>
                  <div style={{
                    position: "absolute", top: 3,
                    left: c.state ? 22 : 3,
                    width: 18, height: 18, borderRadius: "50%",
                    background: "#fff", transition: "left 0.2s",
                  }} />
                </div>
              </div>
            ))}
          </GlassCard>
        </>
      ) : (
        <>
          <GlassCard glow={COLORS.blue}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ color: COLORS.text, fontWeight: 700 }}>💧 Pump Unit A</span>
              <Badge color={COLORS.green}>RUNNING</Badge>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { l: "Flow Rate", v: "4.2 L/s", c: COLORS.blue },
                { l: "Pressure", v: "3.1 bar", c: COLORS.green },
                { l: "Runtime", v: "6.4 hrs", c: COLORS.amber },
              ].map((m) => (
                <div key={m.l} style={{ textAlign: "center" }}>
                  <div style={{ color: m.c, fontSize: 16, fontWeight: 800 }}>{m.v}</div>
                  <div style={{ color: COLORS.textDim, fontSize: 10 }}>{m.l}</div>
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ color: COLORS.text, fontWeight: 700 }}>💧 Pump Unit B</span>
              <Badge color={COLORS.red}>OFFLINE</Badge>
            </div>
            <div style={{ color: COLORS.amber, fontSize: 12 }}>⚠️ Connection lost 1h 23m ago. Check inverter cable.</div>
          </GlassCard>
          <GlassCard>
            <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>📊 Daily Water Output</div>
            <BarChart data={[12, 18, 15, 20, 22, 19, 16]} labels={["M", "T", "W", "T", "F", "S", "S"]} color={COLORS.blue} height={80} />
          </GlassCard>
        </>
      )}
    </div>
  );
};

// ─── 3. AI CAMERA ────────────────────────────────────────────────────
const Camera = () => {
  const [stage, setStage] = useState("capture");
  const issues = [
    { icon: "🟡", label: "Dust Accumulation", severity: 72, color: COLORS.amber, zone: "Top-left, Center", action: "Clean within 3 days" },
    { icon: "🔴", label: "Bird Droppings", severity: 88, color: COLORS.red, zone: "Panel 4, 7", action: "Clean immediately" },
    { icon: "🟢", label: "Shading", severity: 20, color: COLORS.green, zone: "Minor — right edge", action: "Monitor weekly" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 800 }}>📷 AI Panel Scanner</div>
      {stage === "capture" ? (
        <>
          <GlassCard style={{ padding: 0, overflow: "hidden" }}>
            <div style={{
              height: 220, background: "linear-gradient(145deg, #0a1a0a, #0a1428)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <div style={{
                width: 180, height: 140,
                border: `2px solid ${COLORS.green}`,
                borderRadius: 8, position: "relative",
              }}>
                <div style={{ position: "absolute", top: -1, left: -1, width: 20, height: 20, borderTop: `3px solid ${COLORS.green}`, borderLeft: `3px solid ${COLORS.green}`, borderRadius: "4px 0 0 0" }} />
                <div style={{ position: "absolute", top: -1, right: -1, width: 20, height: 20, borderTop: `3px solid ${COLORS.green}`, borderRight: `3px solid ${COLORS.green}`, borderRadius: "0 4px 0 0" }} />
                <div style={{ position: "absolute", bottom: -1, left: -1, width: 20, height: 20, borderBottom: `3px solid ${COLORS.green}`, borderLeft: `3px solid ${COLORS.green}`, borderRadius: "0 0 0 4px" }} />
                <div style={{ position: "absolute", bottom: -1, right: -1, width: 20, height: 20, borderBottom: `3px solid ${COLORS.green}`, borderRight: `3px solid ${COLORS.green}`, borderRadius: "0 0 4px 0" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.textDim, fontSize: 12 }}>Point at panel</div>
              </div>
              <div style={{ color: COLORS.green, fontSize: 12, marginTop: 12 }}>AI scanning ready</div>
            </div>
          </GlassCard>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button onClick={() => setStage("result")} style={{
              padding: 14, borderRadius: 14, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenDim})`,
              color: "#000", fontWeight: 800, fontSize: 14,
            }}>📸 Scan Panel</button>
            <button onClick={() => setStage("result")} style={{
              padding: 14, borderRadius: 14, border: `1px solid ${COLORS.border}`,
              cursor: "pointer", background: "rgba(255,255,255,0.04)",
              color: COLORS.text, fontWeight: 700, fontSize: 14,
            }}>🖼 Upload Image</button>
          </div>
          <GlassCard>
            <div style={{ color: COLORS.textMuted, fontSize: 12 }}>AI Detects: Dust • Cracks • Bird Droppings • Shading • Water damage</div>
          </GlassCard>
        </>
      ) : (
        <>
          <GlassCard style={{ background: `${COLORS.amber}08`, border: `1px solid ${COLORS.amber}22` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ color: COLORS.text, fontWeight: 700 }}>🔬 AI Analysis Complete</span>
              <Badge color={COLORS.amber}>2 Issues</Badge>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: COLORS.amber, fontSize: 28, fontWeight: 900 }}>76</div>
                <div style={{ color: COLORS.textMuted, fontSize: 10 }}>Issue Score</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: COLORS.red, fontSize: 28, fontWeight: 900 }}>-8%</div>
                <div style={{ color: COLORS.textMuted, fontSize: 10 }}>Efficiency Loss</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: COLORS.green, fontSize: 28, fontWeight: 900 }}>3</div>
                <div style={{ color: COLORS.textMuted, fontSize: 10 }}>Panels Affected</div>
              </div>
            </div>
          </GlassCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {issues.map((issue, i) => (
              <GlassCard key={i}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 22 }}>{issue.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 13 }}>{issue.label}</span>
                      <span style={{ color: issue.color, fontWeight: 800 }}>{issue.severity}</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, margin: "6px 0" }}>
                      <div style={{ width: `${issue.severity}%`, height: "100%", background: issue.color, borderRadius: 4 }} />
                    </div>
                    <div style={{ color: COLORS.textMuted, fontSize: 11 }}>📍 {issue.zone}</div>
                    <div style={{ color: issue.color, fontSize: 11, marginTop: 2 }}>→ {issue.action}</div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
          <button onClick={() => setStage("capture")} style={{
            padding: 14, borderRadius: 14, border: `1px solid ${COLORS.border}`,
            cursor: "pointer", background: "rgba(255,255,255,0.04)",
            color: COLORS.text, fontWeight: 700,
          }}>← Scan Again</button>
        </>
      )}
    </div>
  );
};

// ─── 4. WEATHER ──────────────────────────────────────────────────────
const Weather = () => {
  const forecast = [
    { day: "Today", icon: "☀️", high: 38, solar: 5.2, rain: 0 },
    { day: "Mon", icon: "🌤", high: 36, solar: 4.8, rain: 5 },
    { day: "Tue", icon: "⛅", high: 33, solar: 3.9, rain: 20 },
    { day: "Wed", icon: "🌧", high: 29, solar: 1.8, rain: 80 },
    { day: "Thu", icon: "🌦", high: 31, solar: 2.9, rain: 40 },
    { day: "Fri", icon: "☀️", high: 37, solar: 5.1, rain: 0 },
    { day: "Sat", icon: "☀️", high: 39, solar: 5.4, rain: 0 },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 800 }}>🌤 Weather & Solar Forecast</div>
      <GlassCard glow={COLORS.amber} style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64 }}>☀️</div>
        <div style={{ color: COLORS.text, fontSize: 36, fontWeight: 900 }}>38°C</div>
        <div style={{ color: COLORS.textMuted, fontSize: 14 }}>Clear Sky • Nashik, Maharashtra</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12 }}>
          {[
            { l: "Humidity", v: "42%" },
            { l: "Wind", v: "14 km/h" },
            { l: "UV Index", v: "9 (High)" },
          ].map((m) => (
            <div key={m.l} style={{ textAlign: "center" }}>
              <div style={{ color: COLORS.amber, fontWeight: 700 }}>{m.v}</div>
              <div style={{ color: COLORS.textDim, fontSize: 10 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>☀️ Solar Irradiance Forecast</div>
        <BarChart data={forecast.map((f) => f.solar)} labels={forecast.map((f) => f.day)} color={COLORS.amber} height={80} />
        <div style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 8 }}>kWh/m² peak irradiance</div>
      </GlassCard>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {forecast.map((f) => (
          <GlassCard key={f.day} style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 24 }}>{f.icon}</span>
                <div>
                  <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 13 }}>{f.day}</div>
                  <div style={{ color: COLORS.textDim, fontSize: 10 }}>Rain: {f.rain}%</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: COLORS.amber, fontWeight: 700 }}>{f.high}°C</div>
                <div style={{ color: COLORS.green, fontSize: 11 }}>{f.solar} kWh/m²</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard glow={COLORS.green} style={{ background: `${COLORS.green}08` }}>
        <div style={{ color: COLORS.green, fontWeight: 700, marginBottom: 8 }}>🤖 AI Recommendation</div>
        <div style={{ color: COLORS.textMuted, fontSize: 12, lineHeight: 1.6 }}>
          Run heavy appliances (AC, pumps, motor) <strong style={{ color: COLORS.text }}>10 AM – 2 PM today & tomorrow</strong> — peak solar window. Avoid Wednesday (80% rain probability). Best cleaning day: <strong style={{ color: COLORS.green }}>Monday morning.</strong>
        </div>
      </GlassCard>
    </div>
  );
};

// ─── 5. AI CHAT ──────────────────────────────────────────────────────
const Chat = () => {
  const [msgs, setMsgs] = useState([
    { role: "ai", text: "Namaste! 🙏 I'm SOLA AI. How can I help you today? Ask me about subsidies, ROI, maintenance, or troubleshooting!" },
    { role: "user", text: "What subsidy am I eligible for?" },
    { role: "ai", text: "Based on your 5kW rooftop system in Maharashtra: PM Surya Ghar Muft Bijli Yojana — up to ₹78,000 subsidy (₹30,000/kW for first 2kW + ₹18,000/kW for 3rd kW). Apply at pmsuryaghar.gov.in. Need help with the application process? 📋" },
  ]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("en");

  const prompts = ["ROI calculator", "Cleaning schedule", "My system health", "Government schemes"];

  const send = (text) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text },
      { role: "ai", text: "I'm analyzing your query about: **" + text + "**. Based on your 5kW system with current 89% efficiency, I recommend checking panel output during 10–2 PM peak hours. Would you like a detailed report? 📊" }
    ]);
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 800 }}>🤖 SOLA AI</div>
        <div style={{ display: "flex", gap: 6 }}>
          {["en", "hi"].map((l) => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: "4px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: lang === l ? COLORS.green : "rgba(255,255,255,0.06)",
              color: lang === l ? "#000" : COLORS.textMuted,
              fontSize: 11, fontWeight: 700,
            }}>{l === "en" ? "EN" : "हिं"}</button>
          ))}
        </div>
      </div>

      {/* Avatar */}
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.green})`,
          margin: "0 auto", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 28,
          boxShadow: `0 0 24px ${COLORS.blue}44`,
        }}>🤖</div>
        <div style={{ color: COLORS.blue, fontSize: 12, marginTop: 6, fontWeight: 600 }}>SOLA AI • Online</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 3, marginTop: 4 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{
              width: 3, height: 8 + Math.sin(i) * 4, borderRadius: 2,
              background: COLORS.blue, opacity: 0.7,
              animation: `wave ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
            }} />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 280, overflowY: "auto" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user" ? `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.blueDim})` : "rgba(255,255,255,0.06)",
              color: COLORS.text, fontSize: 13, lineHeight: 1.5,
            }}>{m.text}</div>
          </div>
        ))}
      </div>

      {/* Suggested Prompts */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {prompts.map((p) => (
          <button key={p} onClick={() => send(p)} style={{
            padding: "6px 12px", borderRadius: 20, border: `1px solid ${COLORS.border}`,
            background: "rgba(255,255,255,0.04)", color: COLORS.textMuted,
            fontSize: 11, cursor: "pointer",
          }}>{p}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder={lang === "en" ? "Ask SOLA AI anything..." : "SOLA AI से पूछें..."}
          style={{
            flex: 1, padding: "12px 16px", borderRadius: 14,
            background: "rgba(255,255,255,0.06)", border: `1px solid ${COLORS.border}`,
            color: COLORS.text, fontSize: 13, outline: "none",
          }}
        />
        <button onClick={() => send(input)} style={{
          width: 44, height: 44, borderRadius: 12, border: "none",
          background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenDim})`,
          cursor: "pointer", fontSize: 18,
        }}>↑</button>
      </div>
    </div>
  );
};

// ─── 6. ENERGY TRADE ─────────────────────────────────────────────────
const Trade = () => {
  const txns = [
    { to: "Amit Kumar", units: 2.4, credits: 28.8, time: "Today, 2:14 PM", dir: "sell" },
    { to: "Priya Solar Co.", units: 5.0, credits: 60.0, time: "Today, 11:30 AM", dir: "buy" },
    { to: "Village Grid", units: 8.2, credits: 98.4, time: "Yesterday", dir: "sell" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 800 }}>⚡ Energy Marketplace</div>

      {/* Wallet */}
      <GlassCard glow={COLORS.purple} style={{ background: `linear-gradient(135deg, ${COLORS.purple}22, ${COLORS.blue}11)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: COLORS.textMuted, fontSize: 11 }}>ENERGY WALLET</div>
            <div style={{ color: COLORS.purple, fontSize: 32, fontWeight: 900, marginTop: 4 }}>₹ 2,840</div>
            <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 2 }}>236.6 kWh credits</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: COLORS.green, fontSize: 13, fontWeight: 700 }}>+₹98 today</div>
            <Badge color={COLORS.green} style={{ marginTop: 6 }}>VERIFIED</Badge>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {["Sell Energy", "Buy Energy", "Withdraw"].map((a, i) => (
            <button key={a} style={{
              flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer",
              background: i === 0 ? COLORS.green : i === 1 ? COLORS.blue : "rgba(255,255,255,0.1)",
              color: i < 2 ? "#000" : COLORS.text, fontWeight: 700, fontSize: 11,
            }}>{a}</button>
          ))}
        </div>
      </GlassCard>

      {/* Live Rates */}
      <GlassCard>
        <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>📈 Live Electricity Rates</div>
        {[
          { label: "Current Buy Rate", value: "₹8.2/kWh", trend: "+0.3", color: COLORS.green },
          { label: "Current Sell Rate", value: "₹12.0/kWh", trend: "+0.8", color: COLORS.amber },
          { label: "Grid Import Rate", value: "₹6.5/kWh", trend: "-0.1", color: COLORS.blue },
        ].map((r) => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ color: COLORS.textMuted, fontSize: 12 }}>{r.label}</span>
            <div style={{ textAlign: "right" }}>
              <span style={{ color: r.color, fontWeight: 700 }}>{r.value}</span>
              <span style={{ color: r.trend.startsWith("+") ? COLORS.green : COLORS.red, fontSize: 10, marginLeft: 6 }}>{r.trend}</span>
            </div>
          </div>
        ))}
      </GlassCard>

      {/* Transactions */}
      <GlassCard>
        <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>🔄 Transaction History</div>
        {txns.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0", borderBottom: i < txns.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: t.dir === "sell" ? `${COLORS.green}22` : `${COLORS.blue}22`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              border: `1px solid ${t.dir === "sell" ? COLORS.green : COLORS.blue}44`,
            }}>
              {t.dir === "sell" ? "↑" : "↓"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: COLORS.text, fontSize: 12, fontWeight: 600 }}>{t.to}</div>
              <div style={{ color: COLORS.textDim, fontSize: 10 }}>{t.time}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: t.dir === "sell" ? COLORS.green : COLORS.blue, fontWeight: 700 }}>
                {t.dir === "sell" ? "+" : "-"}₹{t.credits}
              </div>
              <div style={{ color: COLORS.textDim, fontSize: 10 }}>{t.units} kWh</div>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
};

// ─── 7. ANALYTICS ────────────────────────────────────────────────────
const Analytics = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const genMonthly = [180, 210, 260, 310, 340, 320, 290, 300, 280, 250, 200, 190];
  const savings = [1800, 2100, 2600, 3100, 3400, 3200, 2900, 3000, 2800, 2500, 2000, 1900];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 800 }}>📊 Analytics & ROI</div>

      {/* ROI Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { l: "Total Investment", v: "₹1,85,000", c: COLORS.textMuted, icon: "💼" },
          { l: "ROI to Date", v: "₹42,800", c: COLORS.green, icon: "📈" },
          { l: "Payback Period", v: "4.1 yrs", c: COLORS.amber, icon: "⏳" },
          { l: "Carbon Saved", v: "1.24 T", c: COLORS.green, icon: "🌱" },
        ].map((m) => (
          <GlassCard key={m.l} style={{ padding: 16 }}>
            <div style={{ fontSize: 22 }}>{m.icon}</div>
            <div style={{ color: m.c, fontSize: 18, fontWeight: 800, marginTop: 6 }}>{m.v}</div>
            <div style={{ color: COLORS.textDim, fontSize: 10 }}>{m.l}</div>
          </GlassCard>
        ))}
      </div>

      {/* Monthly Generation */}
      <GlassCard>
        <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>📅 Monthly Generation (kWh)</div>
        <BarChart data={genMonthly} labels={months} color={COLORS.green} height={90} />
      </GlassCard>

      {/* Monthly Savings */}
      <GlassCard>
        <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>💰 Monthly Savings (₹)</div>
        <BarChart data={savings} labels={months} color={COLORS.amber} height={90} />
      </GlassCard>

      {/* Payback Progress */}
      <GlassCard>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ color: COLORS.text, fontWeight: 700 }}>🎯 Payback Progress</span>
          <span style={{ color: COLORS.green, fontWeight: 700 }}>23%</span>
        </div>
        <div style={{ height: 10, background: "rgba(255,255,255,0.08)", borderRadius: 10 }}>
          <div style={{ width: "23%", height: "100%", background: `linear-gradient(90deg, ${COLORS.green}, ${COLORS.blue})`, borderRadius: 10 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ color: COLORS.textDim, fontSize: 10 }}>₹0</span>
          <span style={{ color: COLORS.textDim, fontSize: 10 }}>₹1,85,000 goal</span>
        </div>
      </GlassCard>

      {/* AI Predictions */}
      <GlassCard glow={COLORS.blue} style={{ background: `${COLORS.blue}08` }}>
        <div style={{ color: COLORS.blue, fontWeight: 700, marginBottom: 10 }}>🔮 AI Predictions (Next 12 months)</div>
        {[
          { l: "Projected Generation", v: "3,240 kWh/yr", c: COLORS.green },
          { l: "Projected Savings", v: "₹32,400/yr", c: COLORS.amber },
          { l: "Maintenance Cost", v: "~₹4,200/yr", c: COLORS.textMuted },
          { l: "Full Payback by", v: "March 2029", c: COLORS.purple },
        ].map((p) => (
          <div key={p.l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ color: COLORS.textMuted, fontSize: 12 }}>{p.l}</span>
            <span style={{ color: p.c, fontWeight: 700 }}>{p.v}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  );
};

// ─── 8. MAINTENANCE ──────────────────────────────────────────────────
const Maintenance = () => {
  const schedule = [
    { date: "28 May", task: "Visual Inspection", status: "today", tech: "Auto-AI" },
    { date: "29 May", task: "Panel Cleaning", status: "due", tech: "Self / Book" },
    { date: "5 Jun", task: "Inverter Check", status: "upcoming", tech: "Technician" },
    { date: "20 Jun", task: "Quarterly AMC Service", status: "upcoming", tech: "SolarPro Ltd." },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 800 }}>🔧 Smart Maintenance</div>

      {/* Best Cleaning Day */}
      <GlassCard glow={COLORS.green} style={{ background: `${COLORS.green}08` }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ fontSize: 40 }}>🧹</div>
          <div>
            <div style={{ color: COLORS.green, fontWeight: 800, fontSize: 16 }}>Best Cleaning Day</div>
            <div style={{ color: COLORS.text, fontSize: 22, fontWeight: 900 }}>Tomorrow — Mon</div>
            <div style={{ color: COLORS.textMuted, fontSize: 11 }}>Clear sky • 0% rain • 14 km/h wind • +8% efficiency gain expected</div>
          </div>
        </div>
      </GlassCard>

      {/* Health Scores */}
      <GlassCard>
        <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>🩺 System Health Scores</div>
        {[
          { l: "Solar Panels", v: 82, c: COLORS.green },
          { l: "Inverter", v: 91, c: COLORS.blue },
          { l: "Battery Pack", v: 68, c: COLORS.amber },
          { l: "Wiring & MC4", v: 95, c: COLORS.green },
        ].map((h) => (
          <div key={h.l} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: COLORS.textMuted, fontSize: 12 }}>{h.l}</span>
              <span style={{ color: h.c, fontWeight: 700, fontSize: 12 }}>{h.v}%</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 6 }}>
              <div style={{ width: `${h.v}%`, height: "100%", background: h.c, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </GlassCard>

      {/* Maintenance Schedule */}
      <GlassCard>
        <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>📅 Maintenance Schedule</div>
        {schedule.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < schedule.length - 1 ? `1px solid ${COLORS.border}` : "none", alignItems: "center" }}>
            <div style={{
              width: 44, textAlign: "center",
              color: s.status === "today" ? COLORS.green : s.status === "due" ? COLORS.amber : COLORS.textDim,
              fontSize: 10, fontWeight: 700,
            }}>{s.date}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: COLORS.text, fontSize: 12, fontWeight: 600 }}>{s.task}</div>
              <div style={{ color: COLORS.textDim, fontSize: 10 }}>{s.tech}</div>
            </div>
            <Badge color={s.status === "today" ? COLORS.green : s.status === "due" ? COLORS.amber : COLORS.textDim}>
              {s.status}
            </Badge>
          </div>
        ))}
      </GlassCard>

      {/* Book Technician */}
      <GlassCard>
        <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>👨‍🔧 Book Technician</div>
        {[
          { name: "Ravi Patil", rating: "⭐ 4.8", loc: "12 km away", avail: "Tomorrow" },
          { name: "SolarFix Pro", rating: "⭐ 4.6", loc: "8 km away", avail: "Today 4 PM" },
        ].map((t) => (
          <div key={t.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
            <div>
              <div style={{ color: COLORS.text, fontWeight: 600, fontSize: 13 }}>{t.name}</div>
              <div style={{ color: COLORS.textDim, fontSize: 10 }}>{t.rating} • {t.loc}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: COLORS.green, fontSize: 11 }}>{t.avail}</div>
              <button style={{
                marginTop: 4, padding: "4px 12px", borderRadius: 8, border: "none",
                background: `${COLORS.green}22`, color: COLORS.green, fontSize: 10,
                fontWeight: 700, cursor: "pointer",
              }}>Book</button>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
};

// ─── 9. INSTALLER PANEL ──────────────────────────────────────────────
const Installer = () => {
  const jobs = [
    { id: "JB-1204", client: "Suresh Farms", type: "Installation", status: "In Progress", date: "28 May" },
    { id: "JB-1203", client: "Ramesh Home", type: "AMC Service", status: "Completed", date: "27 May" },
    { id: "JB-1202", client: "Om Textiles", type: "Fault Repair", status: "Pending", date: "29 May" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 800 }}>👷 Installer Dashboard</div>

      {/* Revenue Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { l: "Monthly Revenue", v: "₹1.2L", c: COLORS.green, icon: "💰" },
          { l: "Active Jobs", v: "7", c: COLORS.blue, icon: "🔨" },
          { l: "Customers", v: "48", c: COLORS.amber, icon: "👥" },
        ].map((m) => (
          <GlassCard key={m.l} style={{ padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>{m.icon}</div>
            <div style={{ color: m.c, fontSize: 18, fontWeight: 800, marginTop: 4 }}>{m.v}</div>
            <div style={{ color: COLORS.textDim, fontSize: 9 }}>{m.l}</div>
          </GlassCard>
        ))}
      </div>

      {/* Job Tracker */}
      <GlassCard>
        <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>📋 Job Tracker</div>
        {jobs.map((j, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: i < jobs.length - 1 ? `1px solid ${COLORS.border}` : "none", alignItems: "center" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: COLORS.textMuted, fontSize: 9, fontWeight: 700, border: `1px solid ${COLORS.border}`,
            }}>{j.id}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: COLORS.text, fontSize: 12, fontWeight: 600 }}>{j.client}</div>
              <div style={{ color: COLORS.textDim, fontSize: 10 }}>{j.type} • {j.date}</div>
            </div>
            <Badge color={j.status === "Completed" ? COLORS.green : j.status === "In Progress" ? COLORS.blue : COLORS.amber}>
              {j.status}
            </Badge>
          </div>
        ))}
      </GlassCard>

      {/* Quick Invoice */}
      <GlassCard glow={COLORS.amber} style={{ background: `${COLORS.amber}08` }}>
        <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>🧾 Quick Invoice Generator</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["Client Name", "Service Type", "Amount (₹)"].map((f) => (
            <input key={f} placeholder={f} style={{
              padding: "10px 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.06)", border: `1px solid ${COLORS.border}`,
              color: COLORS.text, fontSize: 12, outline: "none",
            }} />
          ))}
          <button style={{
            padding: 12, borderRadius: 12, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.red}88)`,
            color: "#000", fontWeight: 800, fontSize: 13,
          }}>📄 Generate Invoice</button>
        </div>
      </GlassCard>

      {/* AMC Plans */}
      <GlassCard>
        <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>🛡 AMC Plans Active</div>
        {[
          { client: "Rajesh Kumar", plan: "Premium — ₹8,400/yr", next: "Service due 5 Jun" },
          { client: "Om Textiles", plan: "Basic — ₹3,600/yr", next: "Service due 15 Jun" },
        ].map((a, i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: i === 0 ? `1px solid ${COLORS.border}` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: COLORS.text, fontWeight: 600, fontSize: 12 }}>{a.client}</span>
              <Badge color={COLORS.green}>Active</Badge>
            </div>
            <div style={{ color: COLORS.textDim, fontSize: 10, marginTop: 2 }}>{a.plan}</div>
            <div style={{ color: COLORS.amber, fontSize: 10 }}>⏰ {a.next}</div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
};

// ─── 10. SETTINGS ────────────────────────────────────────────────────
const Settings = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [offline, setOffline] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [lang, setLang] = useState("English");

  const Toggle = ({ value, onChange }) => (
    <div onClick={() => onChange(!value)} style={{
      width: 44, height: 24, borderRadius: 100, cursor: "pointer",
      background: value ? COLORS.green : "rgba(255,255,255,0.1)",
      position: "relative", transition: "background 0.2s",
    }}>
      <div style={{
        position: "absolute", top: 3, left: value ? 22 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s",
      }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 800 }}>⚙️ Settings</div>

      {/* Profile */}
      <GlassCard>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.blue})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
          }}>👨‍🌾</div>
          <div>
            <div style={{ color: COLORS.text, fontWeight: 800, fontSize: 16 }}>Rajesh Kumar</div>
            <div style={{ color: COLORS.textMuted, fontSize: 12 }}>Farmer • Nashik, MH</div>
            <Badge color={COLORS.green} style={{ marginTop: 4 }}>5kW System</Badge>
          </div>
        </div>
      </GlassCard>

      {/* User Type */}
      <GlassCard>
        <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>👤 User Type</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { icon: "👨‍🌾", l: "Farmer", active: true },
            { icon: "🏠", l: "Homeowner", active: false },
            { icon: "👷", l: "Installer", active: false },
            { icon: "🏭", l: "Business", active: false },
          ].map((u) => (
            <div key={u.l} style={{
              padding: 12, borderRadius: 12, textAlign: "center",
              background: u.active ? `${COLORS.green}22` : "rgba(255,255,255,0.04)",
              border: `1px solid ${u.active ? COLORS.green : COLORS.border}`,
              cursor: "pointer",
            }}>
              <div style={{ fontSize: 20 }}>{u.icon}</div>
              <div style={{ color: u.active ? COLORS.green : COLORS.textMuted, fontSize: 11, fontWeight: 600, marginTop: 4 }}>{u.l}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Settings Toggles */}
      <GlassCard>
        <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>🎛 Preferences</div>
        {[
          { l: "Dark Mode", v: darkMode, fn: setDarkMode },
          { l: "Push Notifications", v: notifications, fn: setNotifications },
          { l: "Offline Mode (Auto-sync)", v: offline, fn: setOffline },
          { l: "SMS Fallback Alerts", v: smsAlerts, fn: setSmsAlerts },
        ].map((s) => (
          <div key={s.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ color: COLORS.textMuted, fontSize: 13 }}>{s.l}</span>
            <Toggle value={s.v} onChange={s.fn} />
          </div>
        ))}
      </GlassCard>

      {/* Language */}
      <GlassCard>
        <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 12 }}>🌐 Language</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["English", "हिंदी", "मराठी", "தமிழ்"].map((l) => (
            <button key={l} onClick={() => setLang(l)} style={{
              flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer",
              background: lang === l ? COLORS.green : "rgba(255,255,255,0.06)",
              color: lang === l ? "#000" : COLORS.textMuted,
              fontWeight: 700, fontSize: 10,
            }}>{l}</button>
          ))}
        </div>
      </GlassCard>

      {/* System Info */}
      <GlassCard>
        <div style={{ color: COLORS.text, fontWeight: 700, marginBottom: 10 }}>📱 System Info</div>
        {[
          ["App Version", "SOLA1 v2.4.1"],
          ["Device ID", "INV-MH-0047"],
          ["Last Sync", "2 min ago"],
          ["Data Mode", "Low Bandwidth"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span style={{ color: COLORS.textDim, fontSize: 11 }}>{k}</span>
            <span style={{ color: COLORS.textMuted, fontSize: 11 }}>{v}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════
export default function SOLA1() {
  const [screen, setScreen] = useState("dashboard");
  const [showNav, setShowNav] = useState(false);

  const screens = {
    dashboard: <Dashboard />,
    monitor: <Monitor />,
    camera: <Camera />,
    weather: <Weather />,
    chat: <Chat />,
    trade: <Trade />,
    analytics: <Analytics />,
    maintenance: <Maintenance />,
    installer: <Installer />,
    settings: <Settings />,
  };

  const bottomNav = [
    { id: "dashboard", icon: "⊞", label: "Home" },
    { id: "monitor", icon: "📡", label: "Monitor" },
    { id: "camera", icon: "📷", label: "Scan" },
    { id: "chat", icon: "🤖", label: "AI" },
    { id: "trade", icon: "⚡", label: "Trade" },
  ];

  return (
    <div style={{
      background: COLORS.bg,
      minHeight: "100vh",
      fontFamily: "'Outfit', 'Segoe UI', system-ui, sans-serif",
      color: COLORS.text,
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 0; }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.4); } }
        @keyframes wave { from { transform:scaleY(1); } to { transform:scaleY(1.8); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .screen-content { animation: fadeIn 0.25s ease; }
      `}</style>

      {/* Phone Frame */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        minHeight: "100vh",
        background: COLORS.bg,
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Status Bar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 20px 6px", fontSize: 11, color: COLORS.textMuted,
          borderBottom: `1px solid ${COLORS.border}`,
          background: "rgba(10,15,30,0.95)", backdropFilter: "blur(20px)",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 14 }}>
              {NAV_ITEMS.find((n) => n.id === screen)?.icon}
            </span>
            <span style={{ fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
              {NAV_ITEMS.find((n) => n.id === screen)?.label?.toUpperCase()}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ color: COLORS.green, fontSize: 10 }}>●●●</span>
            <span>9:41 AM</span>
            <span>🔋 78%</span>
            <button
              onClick={() => setShowNav((p) => !p)}
              style={{
                width: 28, height: 28, borderRadius: 8, border: `1px solid ${COLORS.border}`,
                background: "rgba(255,255,255,0.06)", cursor: "pointer", fontSize: 13,
              }}
            >☰</button>
          </div>
        </div>

        {/* Full Nav Drawer */}
        {showNav && (
          <div style={{
            position: "absolute", top: 44, left: 0, right: 0, bottom: 0,
            background: "rgba(10,15,30,0.98)", backdropFilter: "blur(20px)",
            zIndex: 200, padding: 20, overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ color: COLORS.green, fontWeight: 900, fontSize: 22 }}>SOLA1</div>
                <div style={{ color: COLORS.textDim, fontSize: 11 }}>AI Solar Companion</div>
              </div>
              <button onClick={() => setShowNav(false)} style={{
                width: 32, height: 32, borderRadius: 8, border: `1px solid ${COLORS.border}`,
                background: "rgba(255,255,255,0.06)", cursor: "pointer", color: COLORS.textMuted,
              }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {NAV_ITEMS.map((n) => (
                <button key={n.id} onClick={() => { setScreen(n.id); setShowNav(false); }} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", borderRadius: 14, border: "none", cursor: "pointer",
                  background: screen === n.id ? `${COLORS.green}22` : "transparent",
                  borderLeft: screen === n.id ? `3px solid ${COLORS.green}` : "3px solid transparent",
                  textAlign: "left",
                }}>
                  <span style={{ fontSize: 20 }}>{n.icon}</span>
                  <span style={{ color: screen === n.id ? COLORS.green : COLORS.textMuted, fontWeight: screen === n.id ? 700 : 400, fontSize: 14 }}>{n.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="screen-content" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 90px" }}>
          {screens[screen]}
        </div>

        {/* Bottom Nav */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "100%", maxWidth: 420,
          background: "rgba(10,15,30,0.95)", backdropFilter: "blur(20px)",
          borderTop: `1px solid ${COLORS.border}`,
          display: "flex", padding: "8px 0 12px", zIndex: 100,
        }}>
        {bottomNav.map((n) => (
  <button 
    key={n.id} 
    onClick={() => setScreen(n.id)}
    style={{
      flex: 1, 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      gap: 3,
      border: "none", 
      background: "transparent", 
      cursor: "pointer", 
      padding: "4px 0",
      position: "relative",
    }}
  >
    {screen === n.id && (
      <div style={{
        position: "absolute", 
        top: -8, 
        left: "50%",
        transform: "translateX(-50%)",
        width: 28, 
        height: 3, 
        borderRadius: 2, 
        background: COLORS.green,
      }} />
    )}
    <span style={{ fontSize: 20 }}>{n.icon}</span>
    <span style={{ 
      fontSize: 9, 
      color: screen === n.id ? COLORS.green : COLORS.textDim,
      fontWeight: screen === n.id ? 700 : 400 
    }}>
      {n.label}
    </span>
  </button>
))}
          <button onClick={() => setShowNav(true)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            border: "none", background: "transparent", cursor: "pointer", padding: "4px 0",
          }}>
            <span style={{ fontSize: 20 }}>☰</span>
            <span style={{ fontSize: 9, color: COLORS.textDim }}>More</span>
          </button>
        </div>
      </div>
    </div>
  );
}
