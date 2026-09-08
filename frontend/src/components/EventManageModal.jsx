import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, ShieldAlert, Sparkles } from 'lucide-react';
import { api } from '../services/api';

const VENUE_PRESETS = [
  { name: 'Grand Central Auditorium', lat: 12.9716, lng: 77.5946, radius: 150 },
  { name: 'Innovation & Research Complex', lat: 12.9725, lng: 77.5938, radius: 100 },
  { name: 'Tech Lab 4B (East Wing)', lat: 12.9705, lng: 77.5955, radius: 75 },
  { name: 'Central Campus Library (Hall 2)', lat: 12.9730, lng: 77.5960, radius: 80 }
];

export default function EventManageModal({
  isOpen,
  onClose,
  eventToEdit = null,
  onSaved
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: 'Grand Central Auditorium',
    lat: 12.9716,
    lng: 77.5946,
    geofenceRadius: 100,
    date: new Date().toISOString().split('T')[0],
    startTime: '09:30',
    endTime: '17:00',
    capacity: 150,
    category: 'Conference'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title || '',
        description: eventToEdit.description || '',
        venue: eventToEdit.venue || 'Grand Central Auditorium',
        lat: eventToEdit.lat || 12.9716,
        lng: eventToEdit.lng || 77.5946,
        geofenceRadius: eventToEdit.geofenceRadius || 100,
        date: eventToEdit.date || new Date().toISOString().split('T')[0],
        startTime: eventToEdit.startTime || '09:30',
        endTime: eventToEdit.endTime || '17:00',
        capacity: eventToEdit.capacity || 150,
        category: eventToEdit.category || 'Conference'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        venue: 'Grand Central Auditorium',
        lat: 12.9716,
        lng: 77.5946,
        geofenceRadius: 100,
        date: new Date().toISOString().split('T')[0],
        startTime: '09:30',
        endTime: '17:00',
        capacity: 150,
        category: 'Conference'
      });
    }
  }, [eventToEdit, isOpen]);

  const handleVenuePreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      venue: preset.name,
      lat: preset.lat,
      lng: preset.lng,
      geofenceRadius: preset.radius
    }));
  };

  const handleGenerateAiDescription = async () => {
    if (!formData.title) {
      alert('Please enter an event title first.');
      return;
    }
    setIsGeneratingAi(true);
    try {
      const desc = await api.ai.generateDescription({
        title: formData.title,
        venue: formData.venue,
        category: formData.category
      });
      setFormData((prev) => ({ ...prev, description: desc }));
    } catch (err) {
      alert('AI generation notice: ' + err.message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.venue) {
      alert('Title and venue are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (eventToEdit) {
        await api.events.update(eventToEdit.id, formData);
      } else {
        await api.events.create(formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      alert('Error saving event: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E3E7E0] max-w-xl w-full p-6 shadow-2xl relative text-left my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#F0F4EE] hover:bg-[#E5EBE2] text-[#4A5D51] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-[#14261C] mb-1">
          {eventToEdit ? 'Edit Event & Geofence Boundaries' : 'Create New Event'}
        </h2>
        <p className="text-xs text-[#6B8073] mb-5">
          Define event coordinates, geofence radius perimeter, and schedule.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-semibold text-[#3C4F42] mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Annual Developers Conference 2026"
              className="w-full bg-[#F5F8F5] border border-[#DDE4DB] rounded-xl px-3.5 py-2.5 text-xs text-[#16291E] font-medium focus:outline-none focus:border-[#203D2C]"
            />
          </div>

          {/* Description + AI Generator button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-[#3C4F42]">Event Description</label>
              <button
                type="button"
                onClick={handleGenerateAiDescription}
                disabled={isGeneratingAi}
                className="text-[11px] font-semibold text-[#204E35] hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isGeneratingAi ? 'Writing with AI...' : 'Auto-Write with AI'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide agenda, speaker details, and check-in instructions..."
              className="w-full bg-[#F5F8F5] border border-[#DDE4DB] rounded-xl px-3.5 py-2 text-xs text-[#16291E] focus:outline-none focus:border-[#203D2C]"
            />
          </div>

          {/* Venue & Coordinates */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-[#3C4F42]">Venue Name & Location</label>
              <span className="text-[10px] text-[#7A9182]">Presets:</span>
            </div>

            {/* Presets Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {VENUE_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => handleVenuePreset(preset)}
                  className="px-2 py-0.5 rounded-lg bg-[#EBF3ED] text-[#205238] text-[10px] font-semibold hover:bg-[#DCECE0] transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <input
              type="text"
              required
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full bg-[#F5F8F5] border border-[#DDE4DB] rounded-xl px-3.5 py-2 text-xs text-[#16291E] font-medium focus:outline-none focus:border-[#203D2C]"
            />
          </div>

          {/* Latitude, Longitude, Radius Slider */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#3C4F42] mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                className="w-full bg-[#F5F8F5] border border-[#DDE4DB] rounded-xl px-3 py-2 text-xs font-mono text-[#16291E]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#3C4F42] mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                className="w-full bg-[#F5F8F5] border border-[#DDE4DB] rounded-xl px-3 py-2 text-xs font-mono text-[#16291E]"
              />
            </div>
          </div>

          {/* Geofence Radius Slider */}
          <div className="p-3.5 rounded-xl bg-[#F4F8F4] border border-[#DCE4DB]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-[#284232]">Geofence Radius Perimeter</span>
              <span className="font-mono font-bold text-[#1E5C38] text-xs">
                {formData.geofenceRadius} meters
              </span>
            </div>
            <input
              type="range"
              min={25}
              max={1000}
              step={25}
              value={formData.geofenceRadius}
              onChange={(e) => setFormData({ ...formData, geofenceRadius: parseInt(e.target.value) })}
              className="w-full accent-[#234A35] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#7A8E81] mt-1">
              <span>Tight (25m - Room)</span>
              <span>Medium (100m - Hall)</span>
              <span>Broad (1000m - Campus)</span>
            </div>
          </div>

          {/* Date, Time, Capacity */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#3C4F42] mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-[#F5F8F5] border border-[#DDE4DB] rounded-xl px-2.5 py-2 text-xs text-[#16291E]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#3C4F42] mb-1">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-[#F5F8F5] border border-[#DDE4DB] rounded-xl px-2.5 py-2 text-xs text-[#16291E]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#3C4F42] mb-1">Capacity</label>
              <input
                type="number"
                min={10}
                max={5000}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full bg-[#F5F8F5] border border-[#DDE4DB] rounded-xl px-2.5 py-2 text-xs text-[#16291E]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-[#203D2C] hover:bg-[#284E38] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Event...' : eventToEdit ? 'Update Event' : 'Create Event & Launch Geofence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
