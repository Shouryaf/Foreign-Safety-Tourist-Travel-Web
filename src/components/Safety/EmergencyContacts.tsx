import React, { useState, useEffect } from 'react';
import { Phone, Plus, Edit, Trash2, Shield, Heart, User, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: number;
  isVerified: boolean;
}

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Police Control Room',
      phone: '100',
      relationship: 'Emergency Service',
      priority: 1,
      isVerified: true
    },
    {
      id: '2',
      name: 'Ambulance Service',
      phone: '108',
      relationship: 'Medical Emergency',
      priority: 2,
      isVerified: true
    },
    {
      id: '3',
      name: 'Fire Department',
      phone: '101',
      relationship: 'Fire Emergency',
      priority: 3,
      isVerified: true
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: ''
  });

  const handleCall = (phone: string, name: string) => {
    if (navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.success(`Calling ${name} at ${phone}`);
    }
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      ...newContact,
      priority: contacts.length + 1,
      isVerified: false
    };

    setContacts([...contacts, contact]);
    setNewContact({ name: '', phone: '', relationship: '' });
    setShowAddForm(false);
    toast.success('Emergency contact added successfully');
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
    toast.success('Contact removed');
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 3) return 'text-red-600 bg-red-100';
    if (priority <= 6) return 'text-orange-600 bg-orange-100';
    return 'text-blue-600 bg-blue-100';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <Phone className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Emergency Contacts</h1>
                <p className="text-gray-600">Quick access to emergency services and trusted contacts</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Emergency Services */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Emergency Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contacts.filter(c => c.isVerified && c.priority <= 3).map((contact) => (
                <div key={contact.id} className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-red-900">{contact.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(contact.priority)}`}>
                      Priority {contact.priority}
                    </span>
                  </div>
                  <p className="text-red-700 text-sm mb-3">{contact.relationship}</p>
                  <button
                    onClick={() => handleCall(contact.phone, contact.name)}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call {contact.phone}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Contacts */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-600" />
              Personal Emergency Contacts
            </h2>
            <div className="space-y-3">
              {contacts.filter(c => !c.isVerified || c.priority > 3).map((contact) => (
                <div key={contact.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-gray-600 text-sm">{contact.relationship}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCall(contact.phone, contact.name)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        {contact.phone}
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Emergency Contact</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contact name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select relationship</option>
                  <option value="Family Member">Family Member</option>
                  <option value="Friend">Friend</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContact}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}