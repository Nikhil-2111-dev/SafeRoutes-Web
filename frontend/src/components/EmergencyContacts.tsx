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
      <div className="w-full rounded-[32px] bg-[#161618]/80 backdrop-blur-2xl border border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.85)] p-8 sm:p-10 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[32px] bg-[#161618]/80 backdrop-blur-2xl border border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.85)] p-8 sm:p-10 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex flex-row items-center justify-between mb-6 sm:mb-8 pb-4 border-b border-white/10 gap-4">
          <div>
            <h2 className="text-zinc-400 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /> CONTACTS
            </h2>
            <h3 className="text-white text-xl sm:text-2xl font-extrabold tracking-tight uppercase">TRUSTED NETWORK</h3>
          </div>
          <div className="text-right shrink-0">
            <span className="text-zinc-300 font-mono text-lg sm:text-xl font-bold">{contacts.length}</span>
            <span className="text-zinc-600 font-mono text-xs sm:text-sm"> / 5</span>
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
                  <div key={c.id} className="group flex justify-between items-center p-3.5 sm:p-5 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white transition-all">
                        <span className="font-mono text-[10px] sm:text-xs font-bold">{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm sm:text-base tracking-wide mb-0.5 sm:mb-1 truncate">
                          {c.name}
                        </p>
                        <p className="text-xs sm:text-sm text-zinc-400 font-mono flex items-center gap-1.5 sm:gap-2">
                          <Phone className="w-3 h-3 text-zinc-600" /> {typeof c.phoneNumber === 'object' ? (c.phoneNumber as any)?.formatted || JSON.stringify(c.phoneNumber) : c.phoneNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2 shrink-0 ml-2">
                      <button 
                        onClick={() => openEdit(c)}
                        className="p-2 sm:p-2.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        title="Edit Contact"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-2 sm:p-2.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove Contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 sm:p-12 bg-white/5 rounded-xl sm:rounded-2xl border border-dashed border-white/10 mb-6 sm:mb-8 text-zinc-400">
                <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-zinc-500" />
                <p className="font-bold text-white mb-1.5 sm:mb-2 text-base sm:text-lg">No emergency contacts configured.</p>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto">Add a trusted contact to activate the SOS system.</p>
              </div>
            )}

            {contacts.length < 5 && (
              <button 
                onClick={openAdd}
                className="w-full min-h-[56px] py-4 flex items-center justify-center gap-2 sm:gap-3 bg-[#00dfc0] hover:bg-[#00c9ad] text-slate-950 shadow-[0_0_15px_rgba(0,223,192,0.3)] rounded-xl sm:rounded-2xl transition-all font-bold tracking-wider uppercase text-xs sm:text-sm active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> REGISTER NEW CONTACT
              </button>
            )}
          </>
        ) : (
          <div className="p-5 sm:p-6 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 shadow-xl">
            <div className="flex justify-between items-center mb-5 sm:mb-6 border-b border-white/10 pb-3 sm:pb-4">
              <h3 className="font-mono text-xs sm:text-sm font-bold tracking-widest text-zinc-300 uppercase">{editingId ? 'EDIT CONTACT' : 'NEW CONTACT'}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveContact} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-[10px] sm:text-xs font-mono font-bold tracking-wider text-zinc-400 mb-1.5 sm:mb-2 uppercase">Contact Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full min-h-[48px] sm:min-h-[52px] p-3 sm:p-4 rounded-xl border border-white/10 bg-black text-white focus:border-white focus:ring-1 focus:ring-white outline-none transition-all placeholder-zinc-600 text-sm sm:text-base font-medium"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-mono font-bold tracking-wider text-zinc-400 mb-1.5 sm:mb-2 uppercase">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full min-h-[48px] sm:min-h-[52px] p-3 sm:p-4 rounded-xl border border-white/10 bg-black text-white focus:border-white focus:ring-1 focus:ring-white outline-none transition-all placeholder-zinc-600 text-sm sm:text-base font-mono"
                  placeholder="+91"
                />
                <p className="text-[10px] sm:text-xs text-zinc-500 mt-2 font-mono">Include country code (+91, +1, etc)</p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-full sm:w-1/3 min-h-[48px] sm:min-h-[52px] rounded-xl font-bold border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white transition-all uppercase text-xs sm:text-sm cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 min-h-[48px] sm:min-h-[52px] rounded-xl font-bold bg-[#00dfc0] hover:bg-[#00c9ad] text-slate-950 shadow-[0_0_15px_rgba(0,223,192,0.3)] transition-all disabled:opacity-50 flex justify-center items-center gap-2 uppercase tracking-widest text-xs sm:text-sm active:scale-[0.98] cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></span>
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
