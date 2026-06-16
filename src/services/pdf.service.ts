import type { Patient } from '../types';

export async function exportPatientPdf(patient: Patient, doctorName: string): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('OrthoTrackr Clinical Summary', 14, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Doctor: ${doctorName}`, 14, 26);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

  doc.setFontSize(13);
  doc.text(patient.name, 14, 46);
  doc.setFontSize(10);
  doc.text(`ID: ${patient.id}`, 14, 54);
  doc.text(`Status: ${patient.treatmentStatus}`, 14, 60);
  doc.text(`Phone: ${patient.phone || 'Not recorded'}`, 14, 66);
  doc.text(`Clinic: ${patient.clinic || 'Not recorded'}`, 14, 72);
  doc.text(`Chief complaint: ${patient.chiefComplaint || 'Not recorded'}`, 14, 84, { maxWidth: 180 });
  doc.text(`Treatment plan: ${patient.treatmentPlan || 'Not recorded'}`, 14, 102, { maxWidth: 180 });

  let y = 124;
  doc.setFont('helvetica', 'bold');
  doc.text('Timeline', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  patient.progressLogs.forEach((log) => {
    if (y > 270) {
      doc.addPage();
      y = 18;
    }
    doc.text(`${log.date} - ${log.title}`, 14, y);
    y += 6;
    doc.text(log.notes, 14, y, { maxWidth: 180 });
    y += 14;
  });

  const blob = doc.output('blob');
  return blob;
}

export async function saveBlob(filename: string, _mimeType: string, blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = String(reader.result).split(',')[1];

        const fsPkg = '@capacitor/filesystem';
        const { Filesystem, Directory } = await import(/* @vite-ignore */ fsPkg);
        const sharePkg = '@capacitor/share';
        const { Share } = await import(/* @vite-ignore */ sharePkg);

        const result = await Filesystem.writeFile({
          path: filename,
          data: base64,
          directory: Directory.Cache
        });

        await Share.share({
          title: filename,
          text: 'OrthoTrackr Patient PDF',
          url: result.uri,
          dialogTitle: 'Save PDF'
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
