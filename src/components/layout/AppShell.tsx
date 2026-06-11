import { CalendarDays, Database, Home, Lock, UsersRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { DoctorProfile } from '../../types';

export function AppShell({ children, profile, onLock }: { children: React.ReactNode; profile: DoctorProfile | null; onLock: () => void }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Offline Patient Database</p>
          <h1>OrthoTrackr</h1>
        </div>
        <button className="icon-button" onClick={onLock} title="Lock vault" aria-label="Lock vault">
          <Lock size={20} />
        </button>
      </header>

      <main className="content">
        <div className="doctor-strip">
          <span>{profile?.doctorName}</span>
          <small>{profile?.clinicName}</small>
        </div>
        {children}
      </main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        <NavLink to="/" end>
          <Home size={21} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/patients">
          <UsersRound size={21} />
          <span>Patients</span>
        </NavLink>
        <NavLink to="/schedule">
          <CalendarDays size={21} />
          <span>Schedule</span>
        </NavLink>
        <NavLink to="/admin">
          <Database size={21} />
          <span>Admin</span>
        </NavLink>
      </nav>
    </div>
  );
}
