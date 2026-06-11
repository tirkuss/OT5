import type { DoctorProfile } from '../types';
import { createSalt, derivePasscodeHash } from './crypto.service';

const profileKey = 'orthotrackr_doctor_profile';
const saltKey = 'orthotrackr_passcode_salt';
const hashKey = 'orthotrackr_passcode_hash';

export function getDoctorProfile(): DoctorProfile | null {
  const raw = localStorage.getItem(profileKey);
  return raw ? (JSON.parse(raw) as DoctorProfile) : null;
}

export async function setupDoctorVault(profile: DoctorProfile, passcode: string): Promise<void> {
  localStorage.setItem(profileKey, JSON.stringify(profile));
  if (passcode) {
    if (passcode.length < 6) throw new Error('Use a passcode of at least 6 digits or characters.');
    const salt = createSalt();
    const hash = await derivePasscodeHash(passcode, salt);
    localStorage.setItem(saltKey, salt);
    localStorage.setItem(hashKey, hash);
  }
}

export function hasVault(): boolean {
  return Boolean(localStorage.getItem(profileKey) && localStorage.getItem(hashKey) && localStorage.getItem(saltKey));
}

export async function unlockVault(passcode: string): Promise<boolean> {
  const salt = localStorage.getItem(saltKey);
  const hash = localStorage.getItem(hashKey);
  if (!salt || !hash) return false;
  return (await derivePasscodeHash(passcode, salt)) === hash;
}
