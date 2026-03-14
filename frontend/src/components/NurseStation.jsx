import React, { useState } from 'react';
import axios from 'axios';
import { Fingerprint, AlertCircle, CheckCircle, Hospital, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import AIClinicalAssistant from './AIClinicalAssistant';

const patients = [
  { id: 'FP-SIM-001', name: 'Ravi Kumar', condition: 'Normal Condition', badge: 'success' },
  { id: 'FP-SIM-002', name: 'Priya Sharma', condition: 'Normal Condition', badge: 'success' },
  { id: 'FP-SIM-003', name: 'Arjun Mehta', condition: 'Normal Condition', badge: 'success' },
  { id: 'FP-SIM-004', name: 'Sunita Rao', condition: 'Normal Condition', badge: 'success' },
  { id: 'FP-SIM-005', name: 'Vikram Das', condition: 'Normal Condition', badge: 'success' },
  // Appended 15 patients
  { id: 'FP-SIM-006', name: 'Meera Nair', condition: 'Emergency Condition', badge: 'warning' },
  { id: 'FP-SIM-007', name: 'Karthik Rajan', condition: 'Normal Condition', badge: 'success' },
  { id: 'FP-SIM-008', name: 'Anjali Menon', condition: 'Severe Condition', badge: 'danger' },
  { id: 'FP-SIM-009', name: 'Deepak Sharma', condition: 'Normal Condition', badge: 'success' },
  { id: 'FP-SIM-010', name: 'Lakshmi Iyer', condition: 'Normal Condition', badge: 'success' },
  { id: 'FP-SIM-011', name: 'Rahul Pillai', condition: 'Emergency Condition', badge: 'warning' },
  { id: 'FP-SIM-012', name: 'Fatima Sheikh', condition: 'Severe Condition', badge: 'danger' },
  { id: 'FP-SIM-013', name: 'Suresh Babu', condition: 'Normal Condition', badge: 'success' },
  { id: 'FP-SIM-014', name: 'Preethi Selvam', condition: 'Emergency Condition', badge: 'warning' },
  { id: 'FP-SIM-015', name: 'Mohan Krishnan', condition: 'Severe Condition', badge: 'danger' },
  { id: 'FP-SIM-016', name: 'Nithya Prakash', condition: 'Emergency Condition', badge: 'warning' },
  { id: 'FP-SIM-017', name: 'Aruna Chandran', condition: 'Emergency Condition', badge: 'warning' },
  { id: 'FP-SIM-018', name: 'Sanjay Verma', condition: 'Normal Condition', badge: 'success' },
  { id: 'FP-SIM-019', name: 'Kavitha Reddy', condition: 'Normal Condition', badge: 'success' },
  { id: 'FP-SIM-020', name: 'Venkatesh Patel', condition: 'Severe Condition', badge: 'danger' },
];

const NurseStation = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [emergencyResult, setEmergencyResult] = useState(null);
  const [error, setError] = useState('');

  const handleScan = async (fingerprint_id) => {
    setLoading(true);
    setResult(null);
    setEmergencyResult(null);
    setError('');

    try {
      const { data } = await axios.post('/api/identify', { fingerprint_id });
      if (data.status === 'found') {
        setResult(data.patient);
        
        // Simulate notification
        await axios.post('/api/notify', {
          patient_id: data.patient.id,
          sent_to: data.patient.emergency_contact,
          message: `LifeKey Alert: ${data.patient.name} admitted to Emergency Department. Status: ${data.patient.is_critical ? 'Critical' : 'Stable'}.`
        }).catch(console.error);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // Trigger Emergency Fallback
        handleEmergencyFallback();
      } else {
        setError(err.message || 'Scan failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyFallback = async () => {
    try {
      const { data } = await axios.post('/api/emergency/create', {});
      setEmergencyResult(data.emergency_id);
    } catch (err) {
      setError('Emergency Fallback Generation Failed. ' + err.message);
    }
  };

  return (
    <div className="container mt-8">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>ER Admission Station</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Biometric Identification Console</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Col: Scanner Panel */}
        <div className="glass-panel">
          <h2 className="flex items-center gap-2">
            <Fingerprint className="brand-icon" size={24} /> Simulator Panel
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Select a fingerprint to simulate biometric scanner input. Time to identify: &lt; 2s.
          </p>
          
          <div className="fp-panel">
            {patients.map(p => (
              <button key={p.id} className="fp-btn" onClick={() => handleScan(p.id)} disabled={loading}>
                <Fingerprint className="fp-icon" />
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                {p.condition && <span className={`badge ${p.badge}`} style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>{p.condition}</span>}
                <span className="badge info" style={{ fontSize: '0.65rem' }}>{p.id}</span>
              </button>
            ))}
            
            {/* Fallback button simulating an unknown patient */}
            <button className="fp-btn" onClick={() => handleScan('FP-UNKNOWN')} disabled={loading}>
              <AlertCircle size={40} color="var(--warning)" style={{ marginBottom: '0.5rem' }} />
              <span style={{ fontWeight: 600, color: 'var(--warning)' }}>Unknown Victim</span>
              <span className="badge warning" style={{ fontSize: '0.65rem' }}>Unregistered</span>
            </button>
          </div>
        </div>

        {/* Right Col: Output Terminal */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2>Identification Result</h2>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '300px' }}>
            {loading && (
              <div className="text-center pulse">
                <Fingerprint size={64} color="var(--primary)" style={{ opacity: 0.5 }} />
                <h3 className="mt-4">Scanning Bio-Database...</h3>
              </div>
            )}

            {error && (
              <div className="alert alert-danger">
                <AlertCircle /> <span>{error}</span>
              </div>
            )}

            {!loading && !result && !emergencyResult && !error && (
              <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
                <Hospital size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p>Awaiting Scanner Input</p>
              </div>
            )}

            {/* Found Record */}
            {!loading && result && (
              <div style={{ animation: 'slideIn 0.3s ease-out' }}>
                <div className="alert flex items-center gap-2" style={{ background: 'var(--success)', color: '#000', borderRadius: '8px 8px 0 0', margin: 0 }}>
                  <CheckCircle size={20} />
                  <strong>IDENTITY MATCH CONFIRMED - RECORD ADMITTED TO ER DASHBOARD</strong>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--success)', padding: '1.5rem', borderRadius: '0 0 8px 8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    
                    <div className="data-item">
                      <span className="data-label">Patient Name</span>
                      <span className="data-value" style={{ fontSize: '1.25rem', color: 'var(--success)' }}>{result.name}</span>
                    </div>

                    <div className="data-item">
                      <span className="data-label">Patient ID</span>
                      <span className="data-value" style={{ fontSize: '1.25rem' }}>{result.id}</span>
                    </div>

                    <div className="data-item">
                      <span className="data-label">Blood Group</span>
                      <span className="data-value badge danger" style={{ alignSelf: 'flex-start', fontSize: '1rem', marginTop: '0.25rem' }}>{result.blood_group}</span>
                    </div>

                    <div className="data-item">
                      <span className="data-label">Alert Profile</span>
                      <span className="data-value">{result.is_critical ? 'CRITICAL ALERT' : 'Standard Routine'}</span>
                    </div>

                  </div>

                  <div className="mt-4 p-4" style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px' }}>
                    <div className="data-label" style={{ color: '#fca5a5' }}>Drug Allergies [SEVERE ALERT]</div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{((typeof result.allergies === 'string' ? JSON.parse(result.allergies) : result.allergies) || ['None']).join(', ')}</div>
                  </div>
                  
                  <div className="mt-4 data-item">
                     <span className="data-label">Conditions</span>
                     <span className="data-value">{((typeof result.conditions === 'string' ? JSON.parse(result.conditions) : result.conditions) || ['None']).join(', ')}</span>
                  </div>

                </div>
              </div>
            )}

            {/* Emergency Fallback Record */}
            {!loading && emergencyResult && (
               <div style={{ animation: 'slideIn 0.3s ease-out' }}>
                 <div className="alert flex items-center gap-2" style={{ background: 'var(--warning)', color: '#000', borderRadius: '8px 8px 0 0', margin: 0 }}>
                  <AlertCircle size={20} />
                  <strong>NO MATCH - EMERGENCY FALLBACK TRIGGERED</strong>
                 </div>
                 <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--warning)', padding: '1.5rem', borderRadius: '0 0 8px 8px', textAlign: 'center' }}>
                   <p style={{ color: '#fcd34d', marginBottom: '1rem', fontWeight: 600 }}>Temporary Identity Assigned</p>
                   <h2 style={{ fontSize: '2rem', letterSpacing: '0.1em' }}>{emergencyResult}</h2>
                   
                   <div className="qr-container mt-4">
                     <QRCodeSVG value={emergencyResult} size={150} />
                   </div>
                   
                   <p className="mt-4" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                     Print this QR wristband. Doctors can scan it to append notes until real identity is established.
                   </p>
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>
      <AIClinicalAssistant />
    </div>
  );
};

export default NurseStation;
