import React, { useState } from 'react';
import axios from 'axios';
import { Search, AlertCircle, CheckCircle, Activity, FileText, Plus, Save } from 'lucide-react';

const SearchPatient = () => {
  const [patientId, setPatientId] = useState('');
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Forms mapping
  const [showMeds, setShowMeds] = useState(false);
  const [newMed, setNewMed] = useState('');
  const [medReason, setMedReason] = useState('');

  const [showStatus, setShowStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const [showHistory, setShowHistory] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('lifekey_user'));

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPatient(null);
    setHistory([]);
    resetForms();

    try {
      const { data } = await axios.get(`/api/patient/${patientId}`);
      if (data.status === 'success') {
        setPatient(data.patient);
        setHistory(data.history || []);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Patient ID not found. Please check the ID and try again.');
      } else {
        setError('Error retrieving patient: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setShowMeds(false); setNewMed(''); setMedReason('');
    setShowStatus(false); setNewStatus('');
    setShowNotes(false); setNotes('');
    setShowHistory(false);
  };

  const handleUpdateMeds = async () => {
    try {
      let currentMeds = typeof patient.medications === 'string' ? JSON.parse(patient.medications) : patient.medications;
      // Simple additive approach for now (comma separated payload into the array)
      const addedMeds = newMed.split(',').map(s => s.trim()).filter(Boolean);
      const combined = [...currentMeds, ...addedMeds];
      
      await axios.put(`/api/patient/${patient.id}/medications`, {
        new_medications_json: JSON.stringify(combined),
        old_medications_json: JSON.stringify(currentMeds),
        reason: medReason,
        doctor_id: currentUser?.id || 'DR-UNKNOWN'
      });
      setPatient({ ...patient, medications: JSON.stringify(combined) });
      resetForms();
    } catch (err) {
      setError('Failed to update medications: ' + err.message);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(`/api/patient/${patient.id}/status`, {
        status: newStatus,
        // we'd need admission_id if currently admitted, assuming null if discharged here for simplicity unless we attach it.
        // The backend handles the fallback to last_status anyway.
      });
      setPatient({ ...patient, last_status: newStatus });
      resetForms();
    } catch (err) {
       setError('Failed to update status: ' + err.message);
    }
  };

  const handleDischarge = async () => {
    try {
      if(!notes) {
         setError('Please add discharge notes before confirming discharge.');
         return;
      }
      await axios.post(`/api/patient/${patient.id}/discharge`, {
        diagnosis: "Updated via Search",
        treatment_given: "Standard Protocol",
        medications_added: [],
        new_conditions: [],
        new_surgeries: [],
        doctor_id: currentUser?.id,
        notes: notes,
        admitted_at: new Date()
      });
      setPatient({ ...patient, last_status: 'Discharged' });
      resetForms();
      // Synchronize Dashboard via Custom Event
      window.dispatchEvent(new Event('dashboardRefresh'));
      setSuccessMsg('Patient successfully discharged. Dashboard has been updated.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
       setError('Failed to discharge: ' + err.message);
    }
  };

  return (
    <div className="container mt-4">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Search Patient Record</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manual Universal ID Lookup</p>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Enter Patient ID (e.g. PT-10245)" 
            value={patientId} 
            onChange={e => setPatientId(e.target.value)}
            style={{ flex: 1 }}
            required
          />
          <button type="submit" className="btn test" disabled={loading}>
            <Search size={18} /> Lookup Record
          </button>
        </form>
        {error && <div className="alert alert-danger mt-4"><AlertCircle size={18} /> {error}</div>}
        {successMsg && <div className="alert mt-4" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', color: '#6ee7b7' }}><CheckCircle size={18} /> {successMsg}</div>}
      </div>

      {loading && <div className="text-center mt-4"><Activity className="pulse" size={48} color="var(--primary)" /></div>}

      {patient && !loading && (
        <div className="patient-card glass-panel" style={{ animation: 'slideIn 0.3s ease-out' }}>
          <div className="card-header">
            <div>
              <div className="flex items-center gap-2">
                <h3>{patient.name}</h3>
                <span className="badge info">{patient.id}</span>
                {patient.last_status === 'Discharged' || patient.last_status === 'Cured' ? (
                  <span className="badge" style={{ background: '#374151', color: '#9ca3af' }}>Discharged</span>
                ) : (patient.last_status && patient.last_status !== 'Not Admitted') ? (
                  <span className="badge success pulse">Currently Admitted</span>
                ) : null}
              </div>
              <div className="card-meta">Age: {patient.age} | Last Status: {patient.last_status || 'Unknown'}</div>
            </div>
            <div className="badge danger" style={{ padding: '0.4rem 0.8rem', fontSize: '1.25rem' }}>
              {patient.blood_group}
            </div>
          </div>

          <div className="data-grid mt-4">
             <div className="data-item">
               <span className="data-label" style={{ color: '#fca5a5' }}>Drug Allergies</span>
               <span className="data-value">{patient.allergies ? (typeof patient.allergies === 'string' ? JSON.parse(patient.allergies).join(', ') : patient.allergies.join(', ')) : 'None'}</span>
             </div>
             <div className="data-item">
               <span className="data-label" style={{ color: '#fcd34d' }}>Conditions</span>
               <span className="data-value">{patient.conditions ? (typeof patient.conditions === 'string' ? JSON.parse(patient.conditions).join(', ') : patient.conditions.join(', ')) : 'None'}</span>
             </div>
             <div className="data-item">
               <span className="data-label">Current Medications</span>
               <span className="data-value">{patient.medications ? (typeof patient.medications === 'string' ? JSON.parse(patient.medications).join(', ') : patient.medications.join(', ')) : 'None'}</span>
             </div>
             <div className="data-item">
               <span className="data-label">Previous Surgeries</span>
               <span className="data-value">{patient.surgeries ? (typeof patient.surgeries === 'string' ? JSON.parse(patient.surgeries).join(', ') : patient.surgeries.join(', ')) : 'None'}</span>
             </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--panel-border)', margin: '2rem 0' }} />
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
             <button className="btn btn-outline" onClick={() => { resetForms(); setShowMeds(!showMeds); }}>Update Medications</button>
             <button className="btn btn-outline" onClick={() => { resetForms(); setShowStatus(!showStatus); }}>Update Status</button>
             <button className="btn btn-outline" onClick={() => { resetForms(); setShowNotes(!showNotes); }}>Add Notes</button>
             <button className="btn btn-outline" onClick={() => { resetForms(); setShowHistory(!showHistory); }}>View History</button>
             {patient.last_status !== 'Discharged' && (
                 <button className="btn btn-warning" onClick={() => { resetForms(); setShowNotes(true); }}>Discharge Patient</button>
             )}
          </div>

          {/* Action Panels */}
          {showMeds && (
            <div className="mt-4 p-4" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
               <h4>Add Medications</h4>
               <input type="text" placeholder="e.g. Aspirin 50mg, Ibuprofen" className="mt-4" value={newMed} onChange={e=>setNewMed(e.target.value)} />
               <input type="text" placeholder="Reason for change" className="mt-4" value={medReason} onChange={e=>setMedReason(e.target.value)} />
               <button className="btn mt-4" onClick={handleUpdateMeds}><Save size={16}/> Save Medications</button>
            </div>
          )}

          {showStatus && (
             <div className="mt-4 p-4" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
               <h4>Set Patient Status</h4>
               <select className="mt-4" value={newStatus} onChange={e=>setNewStatus(e.target.value)}>
                  <option value="">Select Status...</option>
                  <option value="Critical">Critical</option>
                  <option value="Under Treatment">Under Treatment</option>
                  <option value="Stable">Stable</option>
                  <option value="Discharged">Discharged / Cured</option>
               </select>
               <button className="btn mt-4" onClick={handleUpdateStatus}><Save size={16}/> Save Status</button>
            </div>
          )}

          {showNotes && (
             <div className="mt-4 p-4" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
               <h4>Treatment / Discharge Notes</h4>
               <textarea 
                  style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '1rem', color: '#fff', minHeight: '100px', marginTop: '1rem' }}
                  placeholder="Enter detailed observation notes..."
                  value={notes}
                  onChange={e=>setNotes(e.target.value)}
               ></textarea>
               <div className="flex gap-2 mt-4">
                  <button className="btn" onClick={() => handleUpdateStatus()} disabled={newStatus==='Discharged'}><Save size={16}/> Save Notes</button>
                  {patient.last_status !== 'Discharged' && <button className="btn btn-warning" onClick={handleDischarge}>Confirm Discharge</button>}
               </div>
            </div>
          )}

          {showHistory && (
             <div className="mt-4 p-4" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
               <h4>Admission History</h4>
               {history.length === 0 ? <p className="mt-4 text-secondary">No previous treatment records found.</p> : (
                  <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {history.map(record => (
                       <div key={record.id} style={{ padding: '1rem', borderLeft: '2px solid var(--primary)', background: 'rgba(255,255,255,0.02)' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(record.admitted_at).toLocaleDateString()} - {new Date(record.discharged_at).toLocaleDateString()}</span>
                          <p className="mt-4 mb-4"><strong>Notes: </strong>{record.notes}</p>
                       </div>
                    ))}
                  </div>
               )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPatient;
