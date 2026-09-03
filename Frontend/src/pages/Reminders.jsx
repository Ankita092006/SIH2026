import React, { useState, useEffect } from 'react';
import { getReminders, addReminder, updateReminder, deleteReminder } from '../services/reminderService';
import { CheckCircle2, Circle, Clock, Plus, Trash2, Edit2, X } from 'lucide-react';

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('Today');
  
  // Custom Time State
  const [newHour, setNewHour] = useState('08');
  const [newMinute, setNewMinute] = useState('00');
  const [newPeriod, setNewPeriod] = useState('AM');

  const [editingId, setEditingId] = useState(null);

  const loadReminders = () => setReminders(getReminders());

  useEffect(() => {
    loadReminders();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setNewTitle('');
    setNewDate('Today');
    setNewHour('08');
    setNewMinute('00');
    setNewPeriod('AM');
    setIsModalOpen(true);
  };

  const parseTime = (timeStr) => {
    try {
      const [time, period] = timeStr.split(' ');
      const [h, m] = time.split(':');
      return { hour: h.padStart(2, '0'), minute: m, period };
    } catch {
      return { hour: '08', minute: '00', period: 'AM' };
    }
  };

  const openEditModal = (reminder) => {
    setEditingId(reminder.id);
    setNewTitle(reminder.text);
    setNewDate(reminder.date);
    const t = parseTime(reminder.time);
    setNewHour(t.hour);
    setNewMinute(t.minute);
    setNewPeriod(t.period);
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!newTitle) return;
    
    // Ensure "6:00 PM" format without leading zero on hour unless it's a single digit and you want that
    const formattedHour = parseInt(newHour, 10).toString(); 
    const formattedTime = `${formattedHour}:${newMinute} ${newPeriod}`;

    if (editingId) {
      updateReminder(editingId, { text: newTitle, time: formattedTime, date: newDate });
    } else {
      addReminder({ text: newTitle, time: formattedTime, date: newDate, status: 'pending' });
    }
    
    loadReminders();
    setIsModalOpen(false);
  };

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    updateReminder(id, { status: newStatus });
    loadReminders();
  };

  const handleDelete = (id) => {
    deleteReminder(id);
    loadReminders();
  };

  const hours = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>My Reminders</h1>
        <button onClick={openAddModal} style={{ padding: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Plus /> Add Reminder
        </button>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{editingId ? "Edit Reminder" : "Add Reminder"}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'black', padding: '0.5rem' }}><X /></button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.2rem' }}>What do you need to do?</label>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} required style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', boxSizing: 'border-box' }} placeholder="e.g. Take Medication" />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Time</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <select value={newHour} onChange={e => setNewHour(e.target.value)} style={{ padding: '1rem', fontSize: '1.2rem', flex: 1 }}>
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span style={{ fontSize: '2rem', display: 'flex', alignItems: 'center' }}>:</span>
                  <select value={newMinute} onChange={e => setNewMinute(e.target.value)} style={{ padding: '1rem', fontSize: '1.2rem', flex: 1 }}>
                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={newPeriod} onChange={e => setNewPeriod(e.target.value)} style={{ padding: '1rem', fontSize: '1.2rem', flex: 1, backgroundColor: 'var(--secondary-color)' }}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Date</label>
                <select value={newDate} onChange={e => setNewDate(e.target.value)} style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', boxSizing: 'border-box' }}>
                  <option value="Today">Today</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="Everyday">Everyday</option>
                </select>
              </div>
              <button type="submit" style={{ marginTop: '1rem', width: '100%', padding: '1.2rem', fontSize: '1.5rem' }}>Save Reminder</button>
            </form>
          </div>
        </div>
      )}

      {reminders.length === 0 ? (
        <p style={{ fontSize: '1.5rem', textAlign: 'center' }}>You have no reminders. Add one to get started.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reminders.map(reminder => (
            <div key={reminder.id} className="card" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.5rem',
              opacity: reminder.status === 'completed' ? 0.6 : 1,
              margin: '0',
              padding: '1.5rem'
            }}>
              <div onClick={() => toggleStatus(reminder.id, reminder.status)} style={{ cursor: 'pointer' }}>
                {reminder.status === 'completed' ? (
                  <CheckCircle2 size={40} color="green" />
                ) : reminder.status === 'pending' ? (
                  <Circle size={40} color="var(--primary-color)" />
                ) : (
                  <Clock size={40} color="gray" />
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', textDecoration: reminder.status === 'completed' ? 'line-through' : 'none' }}>
                  {reminder.text}
                </h2>
                <p style={{ margin: 0, fontSize: '1.2rem', color: 'var(--nav-text)' }}>
                  {reminder.date} • {reminder.time}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => openEditModal(reminder)} style={{ padding: '0.8rem', background: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }} aria-label="Edit Reminder">
                  <Edit2 />
                </button>
                <button onClick={() => handleDelete(reminder.id)} style={{ padding: '0.8rem', background: 'transparent', color: '#e53e3e', border: '1px solid #e53e3e' }} aria-label="Delete Reminder">
                  <Trash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
