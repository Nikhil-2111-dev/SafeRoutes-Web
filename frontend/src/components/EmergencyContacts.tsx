'use client';
import { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Trash2, User, Phone, CheckCircle, Plus, Edit2, X, ShieldAlert } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  isPrimary: boolean;
}

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phoneNumber: '' });

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      const isEditing = !!editingId;
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/contacts/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/contacts`;

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          phoneNumber: formData.phoneNumber
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save contact');
      }

      await fetchContacts();
      setShowForm(false);
      setFormData({ name: '', phoneNumber: '' });
      setEditingId(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this contact?')) return;
    
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete contact');
      
      await fetchContacts();
    } catch (err) {
      console.error("Error deleting contact", err);
      alert("Failed to delete contact. Please try again.");
    }
  };

  const openEdit = (contact: Contact) => {
    setEditingId(contact.id);
    const phone = typeof contact.phoneNumber === 'object' ? (contact.phoneNumber as any).formatted || '' : contact.phoneNumber;
    setFormData({ name: contact.name, phoneNumber: phone });
    setShowForm(true);
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData({ name: '', phoneNumber: '' });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="bg-[#0B1221] rounded-2xl p-8 border border-[#00F2FE]/20 shadow-[0_0_30px_rgba(0,242,254,0.05)] text-[#00F2FE] flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00F2FE]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#050B14]/80 lg:bg-[#050B14] backdrop-blur-2xl lg:backdrop-blur-none rounded-3xl p-6 sm:p-10 border-2 border-[#00F2FE]/50 lg:border-[#00F2FE]/30 shadow-[0_0_40px_rgba(0,242,254,0.15),inset_0_0_30px_rgba(0,242,254,0.05)] relative overflow-hidden w-full">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#00F2FE]/20">
          <div>
            <h2 className="text-[#00F2FE] font-mono text-xs uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> EMERGENCY // CONTACTS
            </h2>
            <h3 className="text-white text-2xl font-bold tracking-tight">TRUSTED NETWORK</h3>
          </div>
          <div className="text-right">
            <span className="text-[#00F2FE] font-mono text-xl">{contacts.length}</span>
            <span className="text-slate-500 font-mono text-sm"> / 5</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#FF2A5F]/10 border border-[#FF2A5F]/30 text-[#FF2A5F] rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {!showForm ? (
          <>
            {contacts.length > 0 ? (
              <div className="space-y-4 mb-10">
                {contacts.map((c, i) => (
                  <div key={c.id} className="group flex justify-between items-center p-4 sm:p-5 bg-[#0A101C] rounded-2xl border border-slate-800 hover:border-[#00F2FE]/30 hover:bg-[#0C1524] transition-all duration-300">
                    <div className="flex items-center gap-4 sm:gap-5">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#00F2FE]/5 rounded-xl border border-[#00F2FE]/10 flex items-center justify-center text-[#00F2FE] group-hover:bg-[#00F2FE]/10 group-hover:border-[#00F2FE]/30 group-hover:shadow-[0_0_15px_rgba(0,242,254,0.2)] transition-all">
                        <span className="font-mono text-xs font-bold">{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-200 text-base sm:text-lg tracking-wide mb-0.5 sm:mb-1 group-hover:text-white transition-colors">
                          {c.name}
                        </p>
                        <p className="text-xs sm:text-sm text-[#00F2FE] font-mono flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                          <Phone className="w-3 h-3" /> {typeof c.phoneNumber === 'object' ? (c.phoneNumber as any)?.formatted || JSON.stringify(c.phoneNumber) : c.phoneNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEdit(c)}
                        className="p-2 text-[#00F2FE] hover:bg-[#00F2FE]/10 rounded-lg transition-colors border border-transparent hover:border-[#00F2FE]/30"
                        title="Edit Contact"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-[#FF2A5F] hover:bg-[#FF2A5F]/10 rounded-lg transition-colors border border-transparent hover:border-[#FF2A5F]/30"
                        title="Remove Contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-[#050B14] rounded-xl border border-dashed border-slate-800 mb-8 text-slate-400">
                <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-slate-600 opacity-50" />
                <p className="font-medium text-white mb-2 text-lg">No emergency contacts configured.</p>
                <p className="text-sm opacity-70">Add a trusted contact to activate the SOS system.</p>
              </div>
            )}

            {contacts.length < 5 && (
              <button 
                onClick={openAdd}
                className="w-full py-4 sm:py-5 flex items-center justify-center gap-3 bg-transparent border-2 border-[#00F2FE]/20 text-[#00F2FE] rounded-2xl hover:bg-[#00F2FE]/5 hover:border-[#00F2FE]/60 transition-all font-bold tracking-[0.2em] uppercase text-xs sm:text-sm hover:shadow-[0_0_30px_rgba(0,242,254,0.1)]"
              >
                <Plus className="w-5 h-5" /> REGISTER NEW CONTACT
              </button>
            )}
          </>
        ) : (
          <div className="p-6 bg-[#050B14] rounded-xl border border-[#00F2FE]/30 shadow-[0_0_20px_rgba(0,242,254,0.1)]">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="font-mono text-sm tracking-widest text-[#00F2FE] uppercase">{editingId ? 'EDIT // CONTACT' : 'NEW // CONTACT'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveContact} className="space-y-5">
              <div>
                <label className="block text-xs font-mono tracking-wider text-slate-400 mb-2 uppercase">Contact Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-4 rounded-lg border border-slate-700 bg-[#0B1221] text-white focus:border-[#00F2FE] focus:ring-1 focus:ring-[#00F2FE] outline-none transition-all placeholder-slate-700 font-medium tracking-wide"
                  placeholder="JOHN DOE"
                />
              </div>
              <div>
                <label className="block text-xs font-mono tracking-wider text-slate-400 mb-2 uppercase">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full p-4 rounded-lg border border-slate-700 bg-[#0B1221] text-white focus:border-[#00F2FE] focus:ring-1 focus:ring-[#00F2FE] outline-none transition-all placeholder-slate-700 font-mono tracking-wider"
                  placeholder="+15551234567"
                />
                <p className="text-xs text-slate-500 mt-2 font-mono">MUST INCLUDE COUNTRY CODE (+91, +1)</p>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 px-4 rounded-lg font-bold border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all uppercase tracking-widest text-xs"
                  disabled={isSubmitting}
                >
                  ABORT
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-4 px-4 rounded-lg font-bold bg-[#00F2FE] text-[#050B14] hover:bg-white hover:shadow-[0_0_20px_rgba(0,242,254,0.6)] transition-all disabled:opacity-50 flex justify-center items-center gap-2 uppercase tracking-widest text-xs"
                >
                  {isSubmitting ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#050B14]"></span>
                  ) : (
                    'SAVE CONTACT'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
