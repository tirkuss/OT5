import { ShieldCheck } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { DoctorProfile } from '../../types';

export function OnboardingPage({ onSetup }: { onSetup: (profile: DoctorProfile, passcode: string) => Promise<void> }) {
  const [doctorName, setDoctorName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      await onSetup({ doctorName: doctorName.trim() }, passcode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not set up vault.');
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <ShieldCheck size={36} />
        <h1>Set up doctor vault</h1>
        <p>Offline-only records, locked locally on this device.</p>
        <label>
          Doctor name
          <input required value={doctorName} onChange={(event) => setDoctorName(event.target.value)} autoComplete="off" />
        </label>
        <label>
          Vault passcode
          <input required minLength={6} value={passcode} onChange={(event) => setPasscode(event.target.value)} type="password" />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary-button" type="submit">Create offline vault</button>
      </form>
    </section>
  );
}
