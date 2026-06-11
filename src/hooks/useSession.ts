import { useCallback, useEffect, useState } from 'react';
import type { DoctorProfile } from '../types';
import { getDoctorProfile, hasVault, setupDoctorVault, unlockVault } from '../services/session.service';

const sessionMinutes = 15;

export function useSession() {
  const [profile, setProfile] = useState<DoctorProfile | null>(() => getDoctorProfile());
  const [isUnlocked, setUnlocked] = useState(() => !hasVault());
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    const refresh = () => setLastActivity(Date.now());
    window.addEventListener('pointerdown', refresh);
    window.addEventListener('keydown', refresh);
    return () => {
      window.removeEventListener('pointerdown', refresh);
      window.removeEventListener('keydown', refresh);
    };
  }, []);

  useEffect(() => {
    const minutes = profile?.lockTimer ?? sessionMinutes;
    if (minutes === 0) return;

    const timer = window.setInterval(() => {
      if (hasVault() && Date.now() - lastActivity > minutes * 60 * 1000) setUnlocked(false);
    }, 30000);
    return () => window.clearInterval(timer);
  }, [lastActivity, profile?.lockTimer]);

  const setup = useCallback(async (nextProfile: DoctorProfile, passcode: string) => {
    await setupDoctorVault(nextProfile, passcode);
    setProfile(nextProfile);
    setUnlocked(true);
  }, []);

  const unlock = useCallback(async (passcode: string) => {
    const ok = await unlockVault(passcode);
    setUnlocked(ok);
    return ok;
  }, []);

  return { profile, isUnlocked, needsSetup: !hasVault(), setup, unlock, lock: () => setUnlocked(false) };
}
