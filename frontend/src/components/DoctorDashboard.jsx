import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, Clock, History, Droplet, RefreshCw, Plus, Trash2 } from 'lucide-react';
import AIClinicalAssistant from './AIClinicalAssistant';

const DoctorDashboard = () => {
  const [admissions, setAdmissions] = useState([]);
  const [error, setError] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualForm, setManualForm] = useState({ id: `EM-${Math.floor(10000 + Math.random() * 90000)}`, name: 'Unknown Patient', age: '', blood_group: 'O+', allergies: 'None', conditions: 'None', medications: 'None', emergency_contact: '', contact_name: '', status: 'Emergency' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePatientId, setDeletePatientId] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  
  const user = JSON.parse(localStorage.getItem('lifekey_user') || '{}');
  const isAuthorized = user && (user.dept === 'Admin' || user.dept === 'ED' || user.name?.includes('Doctor') || user.name?.includes('Nurse'));
  const isAdmin = user && (user.dept === 'Admin' || user.name?.includes('Admin'));

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
         ...manualForm,
         allergies: manualForm.allergies.split(',').map(s => s.trim()),
         conditions: manualForm.conditions.split(',').map(s => s.trim()),
         medications: manualForm.medications.split(',').map(s => s.trim()),
         is_critical: manualForm.status === 'Critical' || manualForm.status === 'Emergency' ? 1 : 0,
         admitted_at: new Date().toISOString()
      };
      await axios.post('/api/patient/manual', payload);
      setShowManualEntry(false);
      fetchLiveAdmissions();
    } catch(err) {
      setError('Failed to create manual entry.');
    }
  };

  const handleDeleteConfirm = async () => {
     if(!deleteReason) return;
     try {
       await axios.post(`/api/patient/${deletePatientId}/archive`, { reason: deleteReason, user_id: user.id || null, user_role: user.dept || null });
       setShowDeleteConfirm(false);
       setDeletePatientId(null);
       setDeleteReason('');
       fetchLiveAdmissions();
     } catch(err) {
       setError('Failed to archive patient.');
     }
  };

  const fetchLiveAdmissions = async () => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const { data } = await axios.get('/api/dashboard/live');
      setAdmissions(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Cannot connect to live server. ' + err.message);
    } finally {
      setIsFetching(false);
    }
  };

  const handlePatientClick = async (patient) => {
    try {
      const response = await axios.get(`/api/patient/${patient.id}`);
      if (response.data.status === 'success') {
         setSelectedPatient(response.data.patient);
      }
    } catch(err) {
      setError('Failed to fetch patient details.');
    }
  };

  useEffect(() => {
    fetchLiveAdmissions();
    const interval = setInterval(fetchLiveAdmissions, 10000); // 10 second polling
    
    const handleRefresh = () => fetchLiveAdmissions();
    window.addEventListener('dashboardRefresh', handleRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('dashboardRefresh', handleRefresh);
    };
  }, []);

  return (
    <div className="container mt-4">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="flex items-center gap-2">
            <Activity color="var(--success)" /> Emergency Dept Live Board
            <button 
              className="btn btn-outline" 
              style={{ padding: '0.4rem', border: 'none', background: 'rgba(255,255,255,0.05)', marginLeft: '0.5rem' }} 
              onClick={fetchLiveAdmissions}
              title="Refresh Dashboard"
              aria-label="Refresh Dashboard"
            >
              <RefreshCw size={20} className={isFetching ? 'spinning' : ''} />
            </button>
            {isAuthorized && (
              <button 
                className="btn btn-primary" 
                style={{ padding: '0.4rem 1rem', marginLeft: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }} 
                onClick={() => setShowManualEntry(true)}
              >
                <Plus size={16} /> Manual Entry
              </button>
            )}
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Auto-updating patient pipeline — Data arriving under 10s</p>
          {lastUpdated && <p style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Last refreshed: {lastUpdated}</p>}
        </div>
        <div className="badge success pulse" style={{ padding: '0.5rem 1rem' }}>
          LIVE SYNC ACTIVE
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem' }}>
        
        {/* Main Feed: Patient Cards */}
        <div className="patient-feed" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: '1 / -1' }}>
          {admissions.length === 0 && !error ? (
              <div className="glass-panel text-center pulse" style={{ opacity: 0.7, padding: '4rem' }}>
                  <History size={48} style={{ marginBottom: '1rem' }} />
                  <h2>No active patients in the Emergency Department.</h2>
                  <p className="mt-4">The dashboard will update automatically when a scanning occurs.</p>
              </div>
          ) : (
            admissions.map((patient) => (
              <div key={patient.admission_id} className={`glass-panel patient-card ${patient.is_critical ? 'is-critical' : ''}`}>
                <div className="card-header">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 onClick={() => handlePatientClick(patient)} style={{cursor: 'pointer', display: 'inline-block'}} title="Click to view full profile">
                        {patient.name}
                      </h3>
                      <span className="badge info">{patient.id}</span>
                      {patient.is_critical ? <span className="badge danger pulse">CRITICAL TRAUMA</span> : null}
                      {isAdmin && (
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.2rem', marginLeft: '0.5rem', border: 'none', color: 'var(--danger)', background: 'transparent' }} 
                          onClick={(e) => { e.stopPropagation(); setDeletePatientId(patient.id); setShowDeleteConfirm(true); }}
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="card-meta flex items-center gap-2">
                      <Clock size={14} /> Admitted: {new Date(patient.admitted_at).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="badge danger flex items-center gap-2" style={{ padding: '0.4rem 0.8rem', fontSize: '1rem' }}>
                      <Droplet size={16} /> {patient.blood_group}
                    </div>
                    <div className="card-meta">Age: {patient.age}</div>
                  </div>
                </div>

                {/* Critical Alerts Banner rendered if conditions exist */}
                {((typeof patient.allergies === 'string' ? JSON.parse(patient.allergies) : patient.allergies) || []).map((allergy, idx) => {
                   if (allergy !== 'None') {
                       return (
                         <div key={idx} className="alert alert-danger" style={{ margin: '1rem 0' }}>
                            <AlertTriangle size={20} />
                            <span><strong>[RED ALERT] CRITICAL:</strong> Patient is allergic to <strong>{allergy}</strong> — Do NOT administer</span>
                         </div>
                       )
                   }
                   return null;
                })}

                {((typeof patient.conditions === 'string' ? JSON.parse(patient.conditions) : patient.conditions) || []).map((cond, idx) => {
                   if (cond !== 'None') {
                       return (
                         <div key={idx} className="alert alert-warning" style={{ margin: '0.5rem 0', padding: '0.75rem 1rem' }}>
                            <AlertTriangle size={18} color="#f59e0b" />
                            <span><strong>[RED ALERT] CONDITION:</strong> Patient has <strong>{cond}</strong> — Provide immediate protocol care</span>
                         </div>
                       )
                   }
                   return null;
                })}

                <div className="data-grid mt-4" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <div className="data-item">
                     <span className="data-label">Status Timeline Summary</span>
                     <div className="mt-2" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {(patient.status_timeline || []).map((tl, index) => (
                           <div key={index} className={tl.status === 'Critical' ? 'badge danger' : (tl.status === 'Stable' ? 'badge success' : 'badge warning')}>
                              {tl.status} @ {new Date(tl.changed_at).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                           </div>
                        ))}
                     </div>
                  </div>
                </div>

                <div className="data-grid mt-4" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <div className="data-item">
                    <span className="data-label">Current Medications</span>
                    <span className="data-value">{patient.medications}</span>
                  </div>
                  <div className="data-item">
                     <span className="data-label">Previous Surgeries</span>
                     <span className="data-value">{((typeof patient.surgeries === 'string' ? JSON.parse(patient.surgeries) : patient.surgeries) || ['None']).join(', ')}</span>
                  </div>
                  <div className="data-item">
                    <span className="data-label">Emergency Contact</span>
                    <span className="data-value">{patient.contact_name} ({patient.emergency_contact})</span>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {selectedPatient && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, overflowY: 'auto' }}>
          <div className="glass-panel" style={{ margin: '40px auto', padding: '2rem', maxWidth: '700px', position: 'relative', animation: 'slideIn 0.3s ease-out' }}>
            <button 
              onClick={() => setSelectedPatient(null)} 
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ×
            </button>
            <h2 className="flex items-center gap-2 mb-2">{selectedPatient.name} {selectedPatient.last_status === 'Discharged' && <span className="badge" style={{background:'#374151', color:'#9ca3af', fontSize:'0.8rem'}}>Discharged</span>}</h2>
            
            <div className="data-grid mt-4">
              <div className="data-item"><span className="data-label">Patient ID</span><span className="data-value">{selectedPatient.id}</span></div>
              <div className="data-item"><span className="data-label">Age</span><span className="data-value">{selectedPatient.age}</span></div>
              <div className="data-item"><span className="data-label">Blood Group</span><span className="badge danger" style={{width: 'fit-content'}}>{selectedPatient.blood_group}</span></div>
              <div className="data-item"><span className="data-label">Admitted At</span><span className="data-value">{selectedPatient.admitted_at ? new Date(selectedPatient.admitted_at).toLocaleString() : 'N/A'}</span></div>
            </div>

            <hr style={{ border: 0, borderTop: '1px solid var(--panel-border)', margin: '1.5rem 0' }} />

            <div className="data-grid">
              <div className="data-item"><span className="data-label" style={{color: '#fca5a5'}}>Allergies</span><span className="data-value">{Array.isArray(selectedPatient.allergies) ? selectedPatient.allergies.join(', ') : (typeof selectedPatient.allergies === 'string' ? JSON.parse(selectedPatient.allergies).join(', ') : 'None')}</span></div>
              <div className="data-item"><span className="data-label" style={{color: '#fcd34d'}}>Conditions</span><span className="data-value">{Array.isArray(selectedPatient.conditions) ? selectedPatient.conditions.join(', ') : (typeof selectedPatient.conditions === 'string' ? JSON.parse(selectedPatient.conditions).join(', ') : 'None')}</span></div>
              <div className="data-item"><span className="data-label">Current Medication</span><span className="data-value">{selectedPatient.current_medication || (Array.isArray(selectedPatient.medications) && selectedPatient.medications.length>0 ? selectedPatient.medications[selectedPatient.medications.length-1] : (typeof selectedPatient.medications==='string'?JSON.parse(selectedPatient.medications).pop() : 'None'))}</span></div>
            </div>

            <h3 className="mt-8 mb-4">Treatment History</h3>
            {selectedPatient.history && selectedPatient.history.length > 0 ? selectedPatient.history.map((record, index) => (
              <div key={index} style={{ borderLeft: '2px solid var(--primary)', padding: '1rem', background: 'rgba(255,255,255,0.02)', marginBottom: '1rem', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {new Date(record.admitted_at).toLocaleDateString()} - {record.discharged_at ? new Date(record.discharged_at).toLocaleDateString() : 'N/A'}
                </span>
                <p className="mt-2" style={{lineHeight: '1.4'}}><strong>Diagnosis:</strong> {record.diagnosis || 'Standard'}</p>
                <p style={{lineHeight: '1.4'}}><strong>Treatment:</strong> {record.treatment_given || 'Standard Protocol'}</p>
                <p style={{lineHeight: '1.4', fontStyle: 'italic'}}><strong>Notes:</strong> {record.notes}</p>
              </div>
            )) : (
              <p style={{ color: 'var(--text-secondary)' }}>No previous treatment records found.</p>
            )}
          </div>
        </div>
      )}

      {showManualEntry && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, overflowY: 'auto' }}>
          <div className="glass-panel" style={{ margin: '40px auto', padding: '2rem', maxWidth: '600px', position: 'relative', animation: 'slideIn 0.3s ease-out' }}>
            <h2 className="mb-4">Manual Patient Entry</h2>
            <form onSubmit={handleManualSubmit}>
               <div className="data-grid">
                 <div className="form-group"><label>Patient Name</label><input type="text" value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} required /></div>
                 <div className="form-group"><label>Emergency ID</label><input type="text" value={manualForm.id} onChange={e => setManualForm({...manualForm, id: e.target.value})} required /></div>
                 <div className="form-group"><label>Age</label><input type="number" value={manualForm.age} onChange={e => setManualForm({...manualForm, age: e.target.value})} /></div>
                 <div className="form-group"><label>Blood Group</label><input type="text" value={manualForm.blood_group} onChange={e => setManualForm({...manualForm, blood_group: e.target.value})} /></div>
                 <div className="form-group"><label>Status</label>
                   <select value={manualForm.status} onChange={e => setManualForm({...manualForm, status: e.target.value})} required style={{width: '100%', padding:'0.75rem', borderRadius:'8px', background:'rgba(255,255,255,0.05)', color:'#fff', border:'1px solid var(--panel-border)'}}>
                     <option value="Emergency">Emergency</option>
                     <option value="Critical">Severe / Critical</option>
                     <option value="Under Treatment">Normal</option>
                   </select>
                 </div>
                 <div className="form-group"><label>Allergies (comma separated)</label><input type="text" value={manualForm.allergies} onChange={e => setManualForm({...manualForm, allergies: e.target.value})} /></div>
                 <div className="form-group"><label>Conditions / Injuries</label><input type="text" value={manualForm.conditions} onChange={e => setManualForm({...manualForm, conditions: e.target.value})} /></div>
                 <div className="form-group"><label>Medications</label><input type="text" value={manualForm.medications} onChange={e => setManualForm({...manualForm, medications: e.target.value})} /></div>
                 <div className="form-group"><label>Contact Name</label><input type="text" value={manualForm.contact_name} onChange={e => setManualForm({...manualForm, contact_name: e.target.value})} /></div>
                 <div className="form-group"><label>Contact Phone</label><input type="text" value={manualForm.emergency_contact} onChange={e => setManualForm({...manualForm, emergency_contact: e.target.value})} /></div>
               </div>
               <div className="flex justify-end gap-2 mt-4">
                 <button type="button" className="btn btn-outline" onClick={() => setShowManualEntry(false)}>Cancel</button>
                 <button type="submit" className="btn">Admit Patient</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, overflowY: 'auto' }}>
          <div className="glass-panel" style={{ margin: '40px auto', padding: '2rem', maxWidth: '500px', position: 'relative', animation: 'slideIn 0.3s ease-out' }}>
            <h2 className="mb-4" style={{ color: 'var(--danger)' }}>Confirm Permanent Deletion</h2>
            <p className="mb-4">Are you sure you want to permanently delete record {deletePatientId}? This action will archive the record and schedule it for strict deletion after 24 hours.</p>
            <div className="form-group">
               <label>Reason for Deletion</label>
               <select value={deleteReason} onChange={e => setDeleteReason(e.target.value)} style={{width: '100%', padding:'0.75rem', borderRadius:'8px', background:'rgba(255,255,255,0.05)', color:'#fff', border:'1px solid var(--panel-border)'}}>
                 <option value="" disabled>Select a reason...</option>
                 <option value="Duplicate Record">Duplicate Record</option>
                 <option value="Data Entry Error">Data Entry Error</option>
                 <option value="Patient Transferred">Patient Transferred</option>
                 <option value="Other">Other</option>
               </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
               <button type="button" className="btn btn-outline" onClick={() => { setShowDeleteConfirm(false); setDeleteReason(''); setDeletePatientId(null); }}>Cancel</button>
               <button type="button" className="btn btn-primary" style={{ background: 'var(--danger)' }} onClick={handleDeleteConfirm} disabled={!deleteReason}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
      <AIClinicalAssistant />
    </div>
  );
};

export default DoctorDashboard;
