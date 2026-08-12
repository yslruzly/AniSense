import React from "react";
import { ArrowLeft, Bell } from "lucide-react";

// ─── Shared Header ────────────────────────────────────────────────────────────
export function Hdr({ icon, title, sub, onProfile, onBack, userInitials = "JD", extra }: { icon: React.ReactNode; title: string; sub: string; onProfile?: () => void; onBack?: () => void; userInitials?: string; extra?: React.ReactNode }) {
  return (
    <div className="hdr">
      <div className="hdr-brand">
        {onBack && (
          <button onClick={onBack} style={{ background: "#e6f2e9", border: "1px solid #cfe7d6", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginRight: 8, flexShrink: 0 }}>
            <ArrowLeft size={16} color="#2e7d4f" />
          </button>
        )}
        <span className="hdr-icon">{icon}</span>
        <div>
          <div className="hdr-title">{title}</div>
          <div className="hdr-sub">{sub}</div>
        </div>
      </div>
      <div className="hdr-right">
        {extra}
        <div className="notif">
          <Bell size={19} color="#4d4237" />
          <span className="nbadge">3</span>
        </div>
        <div className="ava" onClick={onProfile} style={{ cursor: onProfile ? "pointer" : "default" }}>{userInitials}</div>
      </div>
    </div>
  );
}
