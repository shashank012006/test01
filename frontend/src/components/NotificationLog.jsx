import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, MapPin } from 'lucide-react';

const NotificationLog = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchLiveAdmissions = async () => {
            try {
              const { data } = await axios.get('/api/dashboard/live');
              if (data.length > 0) {
                  const recentLogs = data.map(adm => ({
                      time: new Date(adm.admitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                      msg: `LifeKey SMS Alert: ${adm.name} (${adm.id}) admitted to ${adm.hospital_info?.name || 'LifeKey General Hospital'}. Status: ${adm.is_critical ? 'CRITICAL' : 'Stable'}. Assigned physician: ${adm.hospital_info?.doctor || 'Dr. Anil Kapoor'}.`,
                      to: adm.contact_name + " (" + adm.emergency_contact + ")",
                      maps: adm.hospital_info?.maps || '#'
                  }));
                  setNotifications(recentLogs);
              }
            } catch (err) {
                console.warn('Failed to fetch notifications', err);
            }
        };

        fetchLiveAdmissions();
        const interval = setInterval(fetchLiveAdmissions, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container mt-4">
             <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <div>
                  <h1 className="flex items-center gap-2">
                    <Bell color="var(--primary)" /> Family SMS Notification Log
                  </h1>
                  <p style={{ color: 'var(--text-secondary)' }}>Automated dispatches to emergency contacts</p>
                </div>
            </div>

            <div className="glass-panel">
                {notifications.length === 0 ? (
                    <div className="text-center text-secondary py-8">Waiting for hospital admission alerts...</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {notifications.map((log, i) => (
                           <div key={i} style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid var(--primary)', borderRadius: '8px' }}>
                               <div className="flex justify-between items-center mb-4">
                                   <div className="badge info pulse text-sm">Dispatched a few seconds ago</div>
                                   <div style={{ color: 'var(--text-secondary)' }}>Recipient: {log.to}</div>
                               </div>
                               <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>"{log.msg}"</p>
                               <div className="mt-4 flex gap-2">
                                   <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }} onClick={() => { if(log.maps !== '#') window.open(log.maps, '_blank'); }}>
                                       <MapPin size={14} /> Open in Google Maps
                                   </button>
                               </div>
                           </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationLog;
