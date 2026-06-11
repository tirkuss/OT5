import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { OnboardingPage } from './features/onboarding/OnboardingPage';
import { LockScreen } from './features/onboarding/LockScreen';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { PatientsPage } from './features/patients/PatientsPage';
import { PatientProfilePage } from './features/patients/PatientProfilePage';
import { SchedulePage } from './features/appointments/SchedulePage';
import { AdminPage } from './features/backups/AdminPage';
import { useSession } from './hooks/useSession';
import { BackupService } from './services/backup.service';

export default function App() {
  const session = useSession();
  const doctorName = session.profile?.doctorName ?? 'Doctor';

  useEffect(() => {
    if (session.isUnlocked && session.profile) {
      BackupService.maybeCreateDailyBackup(session.profile.doctorName).catch(console.error);
    }

    // Android Native Enhancements
    const setupNative = async () => {
      try {
        const corePkg = '@capacitor/core';
        const { Capacitor } = await import(/* @vite-ignore */ corePkg);
        if (Capacitor.isNativePlatform()) {
          // 1. Back button exit confirmation
          const appPkg = '@capacitor/app';
          const { App: NativeApp } = await import(/* @vite-ignore */ appPkg);
          await NativeApp.addListener('backButton', async (data: { canGoBack: boolean }) => {
            if (!data.canGoBack) {
              if (confirm('Are you sure you want to exit OrthoTrackr?')) {
                NativeApp.exitApp();
              }
            } else {
              window.history.back();
            }
          });

          // 2. Immersive mode (Hide Status Bar & Navigation Bar)
          const sbPkg = '@capacitor/status-bar';
          const { StatusBar } = await import(/* @vite-ignore */ sbPkg);
          await StatusBar.hide();

          const nbPkg = '@capgo/capacitor-navigationbar';
          const { NavigationBar } = await import(/* @vite-ignore */ nbPkg);
          await NavigationBar.hide();
        }
      } catch (e) {
        console.warn('Native setup failed', e);
      }
    };

    setupNative();
  }, [session.isUnlocked, session.profile]);

  if (session.needsSetup) return <OnboardingPage onSetup={session.setup} />;
  if (!session.isUnlocked) return <LockScreen onUnlock={session.unlock} />;

  return (
    <AppShell profile={session.profile} onLock={session.lock}>
      <Routes>
        <Route path="/" element={<DashboardPage doctorName={doctorName} />} />
        <Route path="/patients" element={<PatientsPage doctorName={doctorName} />} />
        <Route path="/patients/:id" element={<PatientProfilePage doctorName={doctorName} />} />
        <Route path="/schedule" element={<SchedulePage doctorName={doctorName} />} />
        <Route path="/admin" element={<AdminPage doctorName={doctorName} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
