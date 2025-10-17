'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import {
  FaTooth,
  FaCalendarAlt,
  FaPlus,
  FaTrash,
  FaEdit,
  FaClock,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaSignOutAlt,
  FaHome,
  FaUser,
  FaHistory,
  FaBookOpen,
  FaCog,
  FaFilter,
  FaSearch,
  FaTags,
  FaStar,
  FaBell,
  FaRegBell,
  FaEllipsisH,
  FaShareAlt,
  FaPrint,
  FaDownload,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import { IconType } from 'react-icons';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toast } from 'react-toastify';
import { format, isSameDay, isPast, isToday, addDays, isThisMonth } from 'date-fns';

// Use FaHistory for FaList and FaEdit for FaStream 
const FaList = FaHistory;
const FaStream = FaEdit;

// Type definitions for react-calendar
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Event {
  id: number;
  title: string;
  description: string;
  event_type: 'exam' | 'quiz' | 'study' | 'assignment';
  event_date: string;
  location: string;
  priority: 'low' | 'medium' | 'high';
  is_completed: boolean;
  reminder_enabled: boolean;
  tags: string[];
  color?: string;
  created_at: string;
  updated_at: string;
}

interface EventTypeConfig {
  bgColor: string;
  textColor: string;
  icon: IconType;
  gradient: string;
}

interface EventTypes {
  exam: EventTypeConfig;
  quiz: EventTypeConfig;
  study: EventTypeConfig;
  assignment: EventTypeConfig;
}

interface FormData {
  title: string;
  event_date: string;
  description: string;
  location: string;
  event_type: 'exam' | 'quiz' | 'study' | 'assignment';
  reminder_enabled: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  color?: string;
  is_completed?: boolean;
}

interface FilterOptions {
  searchTerm: string;
  event_type: string[];
  priority: string[];
  onlyUpcoming: boolean;
  tags: string[];
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// API Service
class CalendarAPI {
  private static getHeaders() {
    const token = localStorage.getItem('toothquest-token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Token ${token}` : '',
    };
  }

  static async getEvents(): Promise<Event[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/students/calendar/events/`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
      return [];
    }
  }

  static async createEvent(eventData: Omit<FormData, 'tags'> & { tags: string[] }): Promise<Event | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/students/calendar/events/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      toast.success('Event created successfully!');
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      return null;
    }
  }

  static async updateEvent(id: number, eventData: Partial<FormData>): Promise<Event | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/students/calendar/events/${id}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      toast.success('Event updated successfully!');
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      return null;
    }
  }

  static async deleteEvent(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/students/calendar/events/${id}/`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success('Event deleted successfully!');
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      return false;
    }
  }
}

// Event type configurations
const eventTypes: EventTypes = {
  exam: { 
    bgColor: 'bg-red-500', 
    textColor: 'text-red-500', 
    icon: FaExclamationTriangle,
    gradient: 'from-red-500 to-red-600'
  },
  quiz: { 
    bgColor: 'bg-orange-500', 
    textColor: 'text-orange-500', 
    icon: FaClock,
    gradient: 'from-orange-400 to-orange-500'
  },
  study: { 
    bgColor: 'bg-teal-500', 
    textColor: 'text-teal-500', 
    icon: FaCalendarAlt,
    gradient: 'from-teal-400 to-teal-500'
  },
  assignment: { 
    bgColor: 'bg-blue-500', 
    textColor: 'text-blue-500', 
    icon: FaEdit,
    gradient: 'from-blue-400 to-blue-500'
  }
};

// Priority colors
const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800'
};

export default function CalendarPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeView, setActiveView] = useState<'calendar' | 'list' | 'timeline'>('calendar');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
    event_type: ['exam', 'quiz', 'study', 'assignment'],
    priority: ['low', 'medium', 'high'],
    onlyUpcoming: false,
    tags: []
  });
  const [formData, setFormData] = useState<FormData>({
    title: '',
    event_date: new Date().toISOString().slice(0, 16),
    description: '',
    location: '',
    event_type: 'exam',
    reminder_enabled: true,
    priority: 'medium',
    tags: []
  });
  const [newTag, setNewTag] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Generate all available tags from events
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    events.forEach(event => {
      if (event.tags && Array.isArray(event.tags)) {
        event.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet);
  }, [events]);

  // Filter events based on filter options
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = 
        filterOptions.searchTerm === '' || 
        event.title.toLowerCase().includes(filterOptions.searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(filterOptions.searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(filterOptions.searchTerm.toLowerCase());
      
      const matchesType = filterOptions.event_type.includes(event.event_type);
      const matchesPriority = filterOptions.priority.includes(event.priority);
      const eventDate = new Date(event.event_date);
      const matchesUpcoming = !filterOptions.onlyUpcoming || !isPast(eventDate) || isToday(eventDate);
      const matchesTags = 
        filterOptions.tags.length === 0 || 
        (event.tags && filterOptions.tags.some(tag => event.tags.includes(tag)));
      
      return matchesSearch && matchesType && matchesPriority && matchesUpcoming && matchesTags;
    });
  }, [events, filterOptions]);

  // Load events from API
  const loadEvents = async () => {
    setIsLoading(true);
    const eventsData = await CalendarAPI.getEvents();
    setEvents(eventsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDateChange = (value: Value): void => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const getTileClassName = ({ date, view }: { date: Date; view: string }): string | null => {
    if (view !== 'month') return null;
    
    const hasEvent = events.some(event => 
      isSameDay(new Date(event.event_date), date)
    );
    
    let classes = [];
    
    if (hasEvent) {
      classes.push('has-event');
      
      const hasHighPriority = events.some(event => 
        isSameDay(new Date(event.event_date), date) && event.priority === 'high'
      );
      
      if (hasHighPriority) {
        classes.push('has-high-priority');
      }
    }
    
    if (isPast(date) && !isToday(date)) {
      classes.push('past-day');
    }
    
    if (isToday(date)) {
      classes.push('is-today');
    }
    
    return classes.length > 0 ? classes.join(' ') : null;
  };

  const getEventsForSelectedDate = (): Event[] => {
    return filteredEvents.filter(event => 
      isSameDay(new Date(event.event_date), selectedDate)
    ).sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  };

  const getUpcomingEvents = (count: number = 5): Event[] => {
    const now = new Date();
    return filteredEvents
      .filter(event => {
        const eventDate = new Date(event.event_date);
        return eventDate >= now || isToday(eventDate);
      })
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, count);
  };

  const handleAddEvent = () => {
    setModalMode('add');
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(10, 0, 0, 0);
    
    setFormData({
      title: '',
      event_date: selectedDateTime.toISOString().slice(0, 16),
      description: '',
      location: '',
      event_type: 'exam',
      reminder_enabled: true,
      priority: 'medium',
      tags: []
    });
    setShowModal(true);
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEditEvent = (event: Event) => {
    setModalMode('edit');
    setSelectedEvent(event);
    
    setFormData({
      title: event.title,
      event_date: new Date(event.event_date).toISOString().slice(0, 16),
      description: event.description,
      location: event.location,
      event_type: event.event_type,
      reminder_enabled: event.reminder_enabled,
      priority: event.priority,
      tags: [...(event.tags || [])],
      color: event.color
    });
    
    setShowModal(true);
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const success = await CalendarAPI.deleteEvent(eventId);
      if (success) {
        setEvents(events.filter(event => event.id !== eventId));
        setShowModal(false);
      }
    }
  };

  const handleToggleComplete = async (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const updatedEvent = await CalendarAPI.updateEvent(eventId, {
      is_completed: !event.is_completed
    });

    if (updatedEvent) {
      setEvents(events.map(e => 
        e.id === eventId ? updatedEvent : e
      ));
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'onlyUpcoming') {
        setFilterOptions(prev => ({
          ...prev,
          onlyUpcoming: checked
        }));
      } else if (name.startsWith('eventType-')) {
        const eventType = name.replace('eventType-', '');
        setFilterOptions(prev => ({
          ...prev,
          event_type: checked
            ? [...prev.event_type, eventType]
            : prev.event_type.filter(type => type !== eventType)
        }));
      } else if (name.startsWith('priority-')) {
        const priority = name.replace('priority-', '');
        setFilterOptions(prev => ({
          ...prev,
          priority: checked
            ? [...prev.priority, priority]
            : prev.priority.filter(p => p !== priority)
        }));
      } else if (name.startsWith('tag-')) {
        const tag = name.replace('tag-', '');
        setFilterOptions(prev => ({
          ...prev,
          tags: checked
            ? [...prev.tags, tag]
            : prev.tags.filter(t => t !== tag)
        }));
      }
    } else {
      setFilterOptions(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetFilters = () => {
    setFilterOptions({
      searchTerm: '',
      event_type: ['exam', 'quiz', 'study', 'assignment'],
      priority: ['low', 'medium', 'high'],
      onlyUpcoming: false,
      tags: []
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (modalMode === 'add') {
        const newEvent = await CalendarAPI.createEvent(formData);
        if (newEvent) {
          setEvents([...events, newEvent]);
        }
      } else if (modalMode === 'edit' && selectedEvent) {
        const updatedEvent = await CalendarAPI.updateEvent(selectedEvent.id, formData);
        if (updatedEvent) {
          setEvents(events.map(event => 
            event.id === selectedEvent.id ? updatedEvent : event
          ));
        }
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('toothquest-token');
    router.push('/login');
  };

  // Enhanced Sidebar Component
  const EnhancedSidebar = () => {
    return (
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white rounded-tr-2xl rounded-br-2xl shadow-lg h-full py-6 transition-all duration-300 ease-in-out relative`}>
        {/* Toggle button */}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 bg-[#00BBB9] text-white p-1.5 rounded-full shadow-md hover:bg-[#009A98] transition-colors"
        >
          {sidebarCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
        </button>
        
        <div className="px-4">
          <div className="flex items-center mb-10 justify-center">
            {!sidebarCollapsed && (
              <div className="w-full flex justify-center">
                <img 
                  src="/images/ui/logo.png" 
                  alt="ToothQuest Logo" 
                  className="w-32 h-auto object-contain"
                />
              </div>
            )}
            {sidebarCollapsed && (
              <div className="w-full flex justify-center">
                <img 
                  src="/images/ui/logo.png" 
                  alt="ToothQuest Logo" 
                  className="w-12 h-auto object-contain"
                />
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            {[
              { icon: <FaHome size={20} />, name: 'Dashboard', id: 'dashboard', path: '/student/dashboard' },
              { icon: <FaBookOpen size={20} />, name: 'Quizzes', id: 'quizzes', path: '/student/quiz' },
              { icon: <FaCalendarAlt size={20} />, name: 'Calendar', id: 'calendar', path: '/student/calendar' },
              { icon: <FaUser size={20} />, name: 'Profile', id: 'profile', path: '/student/profile' },
              { icon: <FaHistory size={20} />, name: 'Quiz History', id: 'history', path: '/student/playlists' },
              { icon: <FaCog size={20} />, name: 'Settings', id: 'settings', path: '/student/settings' },
            ].map((item) => (
              <Link
                key={item.id}
                href={item.path}
                className={`group flex items-center py-3 ${sidebarCollapsed ? 'justify-center' : 'px-4'} rounded-xl cursor-pointer relative ${
                  item.id === 'calendar' ? 'bg-[#00BBB9]' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`${item.id === 'calendar' ? 'text-white' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                
                {!sidebarCollapsed && (
                  <span className={`ml-3 text-sm font-medium ${item.id === 'calendar' ? 'text-white' : 'text-gray-600'}`}>
                    {item.name}
                  </span>
                )}
                
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 scale-0 group-hover:scale-100 transition-all duration-200 origin-left z-10">
                    <div className="bg-gray-800 text-white text-sm py-1 px-3 rounded-md whitespace-nowrap">
                      {item.name}
                    </div>
                  </div>
                )}
              </Link>
            ))}

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className={`group flex items-center py-3 ${sidebarCollapsed ? 'justify-center' : 'px-4'} rounded-xl cursor-pointer relative hover:bg-red-50`}
            >
              <div className="text-red-500">
                <FaSignOutAlt size={20} />
              </div>
              
              {!sidebarCollapsed && (
                <span className="ml-3 text-sm font-medium text-red-600">
                  Logout
                </span>
              )}
              
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 scale-0 group-hover:scale-100 transition-all duration-200 origin-left z-10">
                  <div className="bg-gray-800 text-white text-sm py-1 px-3 rounded-md whitespace-nowrap">
                    Logout
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading calendar...</p>
        </div>
      </div>
    );
  }
    
  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(currentDate);

  return (
    <div className="flex h-screen bg-gray-50">
      <EnhancedSidebar />
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Event Calendar</h1>
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search events..." 
                  className="pl-10 pr-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
                  value={filterOptions.searchTerm}
                  name="searchTerm"
                  onChange={handleFilterChange}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              
              <button 
                onClick={() => setShowFilterModal(true)}
                className="p-2 rounded-full text-gray-500 bg-white shadow-sm hover:bg-gray-50"
                title="Filter events"
              >
                <FaFilter />
              </button>
            </div>
          </div>
          
          {/* View options */}
          <div className="mb-6 bg-white rounded-xl shadow-sm p-2 flex">
            <button
              onClick={() => setActiveView('calendar')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                activeView === 'calendar' 
                  ? 'bg-[#00BBB9] text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaCalendarAlt className="inline mr-2" /> Calendar
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                activeView === 'list' 
                  ? 'bg-[#00BBB9] text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaList className="inline mr-2" /> List
            </button>
            <button
              onClick={() => setActiveView('timeline')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                activeView === 'timeline' 
                  ? 'bg-[#00BBB9] text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaStream className="inline mr-2" /> Timeline
            </button>
          </div>
          
          {/* Active tags filter display */}
          {filterOptions.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500">Active filters:</span>
              {filterOptions.tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center"
                >
                  {tag}
                  <button
                    onClick={() => {
                      setFilterOptions(prev => ({
                        ...prev,
                        tags: prev.tags.filter(t => t !== tag)
                      }));
                    }}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    <FaTimes size={10} />
                  </button>
                </span>
              ))}
              <button
                onClick={resetFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {activeView === 'calendar' && (
              <>
                {/* Calendar */}
                <motion.div 
                  className="lg:col-span-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-800">Your Calendar</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            <span>Exam</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                            <span>Quiz</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-teal-500 mr-2"></div>
                            <span>Study</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                            <span>Assignment</span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={handleAddEvent}
                          className="flex items-center px-4 py-2 bg-[#00BBB9] text-white rounded-lg hover:bg-[#009A98] transition-colors"
                        >
                          <FaPlus className="mr-2" />
                          Add Event
                        </button>
                      </div>
                    </div>
                    
                    <div className="calendar-wrapper">
                      <Calendar 
                        onChange={handleDateChange} 
                        value={selectedDate}
                        tileClassName={getTileClassName}
                        className="custom-calendar"
                        prev2Label={null}
                        next2Label={null}
                        prevLabel={<FaChevronLeft />}
                        nextLabel={<FaChevronRight />}
                      />
                    </div>
                  </div>
                </motion.div>
                
                {/* Events for selected date */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      {format(selectedDate, 'EEEE, MMMM d')}
                    </h3>
                    
                    <div className="space-y-4">
                      {getEventsForSelectedDate().length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-2">
                            <FaCalendarAlt size={32} className="mx-auto" />
                          </div>
                          <p className="text-gray-500">No events scheduled for this date.</p>
                          <button 
                            onClick={handleAddEvent}
                            className="mt-4 px-4 py-2 bg-[#00BBB9] text-white rounded-lg hover:bg-[#009A98] transition-colors"
                          >
                            <FaPlus className="inline mr-2" />
                            Add Event
                          </button>
                        </div>
                      ) : (
                        <div>
                          {getEventsForSelectedDate().map(event => {
                            const EventIcon = eventTypes[event.event_type].icon;
                            const eventBgColor = eventTypes[event.event_type].bgColor;
                            const eventDate = new Date(event.event_date);
                            
                            return (
                              <div 
                                key={event.id} 
                                className={`border border-gray-200 rounded-lg hover:shadow-md transition-shadow overflow-hidden ${
                                  event.is_completed ? 'opacity-60' : ''
                                }`}
                              >
                                <div className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-start">
                                      <div className={`p-2 rounded-lg ${eventBgColor} mr-3`}>
                                        <EventIcon className="text-white" />
                                      </div>
                                      <div>
                                        <h4 
                                          className={`font-medium text-gray-800 text-lg ${
                                            event.is_completed ? 'line-through' : ''
                                          }`}
                                        >
                                          {event.title}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                          {format(eventDate, 'h:mm a')} • {event.location}
                                        </p>
                                        
                                        <div className="flex items-center flex-wrap gap-1 mt-1">
                                          <span 
                                            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[event.priority]}`}
                                          >
                                            {event.priority}
                                          </span>
                                          
                                          {event.tags && event.tags.map(tag => (
                                            <span 
                                              key={tag}
                                              className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                                            >
                                              #{tag}
                                            </span>
                                          ))}
                                        </div>
                                        
                                        {event.description && (
                                          <p className="text-sm text-gray-600 mt-2">
                                            {event.description}
                                          </p>
                                        )}
                                        
                                        {event.reminder_enabled && (
                                          <div className="flex items-center mt-2 text-xs font-medium text-gray-500">
                                            <FaBell className="mr-1 text-orange-500" />
                                            Reminder set
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex flex-col space-y-2">
                                      <button 
                                        onClick={() => handleToggleComplete(event.id)}
                                        className={`p-2 rounded-lg ${
                                          event.is_completed 
                                            ? 'bg-teal-100 text-teal-600' 
                                            : 'bg-gray-100 text-gray-500'
                                        }`}
                                        title={event.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
                                      >
                                        <FaCheck />
                                      </button>
                                      <button 
                                        onClick={() => handleViewEvent(event)}
                                        className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        title="View event details"
                                      >
                                        <FaSearch />
                                      </button>
                                      <button 
                                        onClick={() => handleEditEvent(event)}
                                        className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        title="Edit event"
                                      >
                                        <FaEdit />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500"
                                        title="Delete event"
                                      >
                                        <FaTrash />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 border-t border-gray-200 pt-6">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                        <FaClock className="mr-2 text-blue-500" />
                        Upcoming Events
                      </h4>
                      
                      <div className="space-y-3">
                        {getUpcomingEvents(5).length === 0 ? (
                          <p className="text-gray-500 text-sm">No upcoming events.</p>
                        ) : (
                          getUpcomingEvents(5).map(event => {
                            const eventBgColor = eventTypes[event.event_type].bgColor;
                            const eventDate = new Date(event.event_date);
                            const isEventToday = isSameDay(eventDate, new Date());
                            
                            return (
                              <div 
                                key={event.id} 
                                className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer group border border-gray-100"
                                onClick={() => setSelectedDate(eventDate)}
                              >
                                <div className={`w-3 h-3 mr-3 ${eventBgColor} rounded-full`}></div>
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <p className="font-medium text-gray-700">{event.title}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[event.priority]}`}>
                                      {event.priority}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {isEventToday ? 'Today' : format(eventDate, 'EEE, MMM d')} • {format(eventDate, 'h:mm a')}
                                  </p>
                                </div>
                                <button 
                                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewEvent(event);
                                  }}
                                >
                                  <FaEllipsisH />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
            
            {activeView === 'list' && (
              <motion.div
                className="lg:col-span-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">All Events</h3>
                    <button 
                      onClick={handleAddEvent}
                      className="flex items-center px-4 py-2 bg-[#00BBB9] text-white rounded-lg hover:bg-[#009A98] transition-colors"
                    >
                      <FaPlus className="mr-2" />
                      Add Event
                    </button>
                  </div>
                  
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <FaCalendarAlt size={32} className="mx-auto" />
                      </div>
                      <p className="text-gray-500">No events found matching your filters.</p>
                      <button 
                        onClick={resetFilters}
                        className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredEvents
                        .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
                        .map(event => {
                          const EventIcon = eventTypes[event.event_type].icon;
                          const eventBgColor = eventTypes[event.event_type].bgColor;
                          const eventDate = new Date(event.event_date);
                          
                          return (
                            <div 
                              key={event.id}
                              className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                                event.is_completed ? 'opacity-60' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-start">
                                  <div className={`p-2 rounded-lg ${eventBgColor} mr-3 flex-shrink-0`}>
                                    <EventIcon className="text-white" size={16} />
                                  </div>
                                  <div>
                                    <div className={`text-base font-medium text-gray-800 ${
                                      event.is_completed ? 'line-through' : ''
                                    }`}>
                                      {event.title}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                      {format(eventDate, 'EEEE, MMMM d, yyyy')} • {format(eventDate, 'h:mm a')}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {event.location}
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${priorityColors[event.priority]}`}>
                                        {event.priority}
                                      </span>
                                      {event.tags && event.tags.map(tag => (
                                        <span 
                                          key={tag}
                                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                        >
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                    
                                    {event.description && (
                                      <p className="text-sm text-gray-600 mt-2">
                                        {event.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleToggleComplete(event.id)}
                                    className={`p-2 rounded-lg ${
                                      event.is_completed 
                                        ? 'bg-teal-100 text-teal-600' 
                                        : 'bg-gray-100 text-gray-500'
                                    }`}
                                    title={event.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
                                  >
                                    <FaCheck />
                                  </button>
                                  <button
                                    onClick={() => handleViewEvent(event)}
                                    className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    title="View event details"
                                  >
                                    <FaSearch />
                                  </button>
                                  <button
                                    onClick={() => handleEditEvent(event)}
                                    className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    title="Edit event"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEvent(event.id)}
                                    className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500"
                                    title="Delete event"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {activeView === 'timeline' && (
              <motion.div
                className="lg:col-span-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-800">Timeline View</h3>
                      <button 
                        onClick={handleAddEvent}
                        className="flex items-center px-4 py-2 bg-[#00BBB9] text-white rounded-lg hover:bg-[#009A98] transition-colors"
                      >
                        <FaPlus className="mr-2" />
                        Add Event
                      </button>
                    </div>
                  </div>
                  
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-8 p-6">
                      <div className="text-gray-400 mb-2">
                        <FaCalendarAlt size={32} className="mx-auto" />
                      </div>
                      <p className="text-gray-500">No events found matching your filters.</p>
                      <button 
                        onClick={resetFilters}
                        className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Event
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Priority
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredEvents
                            .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
                            .map(event => {
                              const eventBgColor = eventTypes[event.event_type].bgColor;
                              const EventIcon = eventTypes[event.event_type].icon;
                              const eventDate = new Date(event.event_date);
                              
                              return (
                                <tr 
                                  key={event.id}
                                  className={`hover:bg-gray-50 transition-colors ${
                                    event.is_completed ? 'opacity-60' : ''
                                  }`}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className={`p-2 rounded-lg ${eventBgColor} mr-3 flex-shrink-0`}>
                                        <EventIcon className="text-white" size={14} />
                                      </div>
                                      <div>
                                        <div className={`text-sm font-medium text-gray-800 ${
                                          event.is_completed ? 'line-through' : ''
                                        }`}>
                                          {event.title}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {event.tags && event.tags.map(tag => (
                                            <span 
                                              key={tag}
                                              className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                                            >
                                              #{tag}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-800">
                                      {format(eventDate, 'MMM d, yyyy')}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {format(eventDate, 'h:mm a')}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {event.location}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${priorityColors[event.priority]}`}>
                                      {event.priority}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span 
                                      className={`px-2 py-1 text-xs rounded-full ${
                                        event.is_completed 
                                          ? 'bg-teal-100 text-teal-800' 
                                          : 'bg-orange-100 text-orange-800'
                                      }`}
                                    >
                                      {event.is_completed ? 'Completed' : 'Pending'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                      <button
                                        onClick={() => handleToggleComplete(event.id)}
                                        className={`p-1 rounded ${
                                          event.is_completed 
                                            ? 'text-teal-600 hover:text-teal-800' 
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                        title={event.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
                                      >
                                        <FaCheck />
                                      </button>
                                      <button
                                        onClick={() => handleViewEvent(event)}
                                        className="p-1 rounded text-gray-500 hover:text-gray-700"
                                        title="View event details"
                                      >
                                        <FaSearch />
                                      </button>
                                      <button
                                        onClick={() => handleEditEvent(event)}
                                        className="p-1 rounded text-gray-500 hover:text-gray-700"
                                        title="Edit event"
                                      >
                                        <FaEdit />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="p-1 rounded text-gray-500 hover:text-red-600"
                                        title="Delete event"
                                      >
                                        <FaTrash />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Event Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-black/20 via-gray-900/30 to-black/40 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            />
            
            <motion.div 
              className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-w-2xl w-full overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ 
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.5
              }}
            >
              {modalMode === 'view' && selectedEvent && (
                <>
                  <div className={`bg-gradient-to-br ${eventTypes[selectedEvent.event_type].gradient} p-8 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-4 -translate-x-4"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="p-3 bg-white/20 rounded-xl mr-4">
                            {React.createElement(eventTypes[selectedEvent.event_type].icon, { size: 24 })}
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold mb-1">{selectedEvent.title}</h2>
                            <span className="text-white/80 text-sm capitalize">{selectedEvent.event_type}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => setShowModal(false)}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <FaTimes size={16} />
                        </button>
                      </div>
                      <div className="flex items-center space-x-6 text-white/90">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2" size={16} />
                          <span>{format(new Date(selectedEvent.event_date), 'EEEE, MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center">
                          <FaClock className="mr-2" size={16} />
                          <span>{format(new Date(selectedEvent.event_date), 'h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Location</h3>
                          <p className="text-gray-800 font-medium">{selectedEvent.location || 'Not specified'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Priority</h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityColors[selectedEvent.priority]}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              selectedEvent.priority === 'high' ? 'bg-red-500' :
                              selectedEvent.priority === 'medium' ? 'bg-orange-500' : 'bg-gray-500'
                            }`}></div>
                            {selectedEvent.priority.charAt(0).toUpperCase() + selectedEvent.priority.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            selectedEvent.is_completed 
                              ? 'bg-teal-100 text-teal-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              selectedEvent.is_completed ? 'bg-teal-500' : 'bg-orange-500'
                            }`}></div>
                            {selectedEvent.is_completed ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                        {selectedEvent.reminder_enabled && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Reminder</h3>
                            <div className="flex items-center text-orange-600">
                              <FaBell className="mr-2" size={16} />
                              <span className="font-medium">Enabled</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {selectedEvent.description && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Description</h3>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedEvent.tags.map(tag => (
                            <span 
                              key={tag}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                            >
                              <FaTags className="mr-1.5" size={12} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        Event created on {format(new Date(selectedEvent.created_at), 'MMM d, yyyy')}
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditEvent(selectedEvent)}
                          className="flex items-center px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors"
                        >
                          <FaEdit className="mr-2" size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(selectedEvent.id)}
                          className="flex items-center px-4 py-2.5 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-colors"
                        >
                          <FaTrash className="mr-2" size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {(modalMode === 'add' || modalMode === 'edit') && (
                <>
                  <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-6 -translate-x-6"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold mb-2">
                            {modalMode === 'add' ? 'Create New Event' : 'Edit Event'}
                          </h2>
                          <p className="text-blue-100">
                            {modalMode === 'add' ? 'Add a new event to your calendar' : 'Update event details'}
                          </p>
                        </div>
                        <button 
                          onClick={() => setShowModal(false)}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <FaTimes size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-8">
                    <div className="space-y-6">
                      <div className="group">
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                          Event Title *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all placeholder-gray-400"
                            placeholder="Enter a descriptive title for your event"
                            value={formData.title}
                            onChange={handleFormChange}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <FaEdit className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="group">
                        <label htmlFor="event_date" className="block text-sm font-semibold text-gray-700 mb-2">
                          Date & Time *
                        </label>
                        <div className="relative">
                          <input
                            type="datetime-local"
                            id="event_date"
                            name="event_date"
                            required
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                            value={formData.event_date}
                            onChange={handleFormChange}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="group">
                        <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all placeholder-gray-400"
                          placeholder="Where will this event take place?"
                          value={formData.location}
                          onChange={handleFormChange}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="group">
                          <label htmlFor="event_type" className="block text-sm font-semibold text-gray-700 mb-2">
                            Event Type
                          </label>
                          <div className="relative">
                            <select
                              id="event_type"
                              name="event_type"
                              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all appearance-none"
                              value={formData.event_type}
                              onChange={handleFormChange}
                            >
                              <option value="exam">Exam</option>
                              <option value="quiz">Quiz</option>
                              <option value="study">Study Session</option>
                              <option value="assignment">Assignment</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <FaChevronLeft className="h-4 w-4 text-gray-400 rotate-90" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="group">
                          <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                            Priority Level
                          </label>
                          <div className="relative">
                            <select
                              id="priority"
                              name="priority"
                              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all appearance-none"
                              value={formData.priority}
                              onChange={handleFormChange}
                            >
                              <option value="low">Low Priority</option>
                              <option value="medium">Medium Priority</option>
                              <option value="high">High Priority</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <FaChevronLeft className="h-4 w-4 text-gray-400 rotate-90" />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="group">
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={4}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all placeholder-gray-400 resize-none"
                          placeholder="Add any additional details about this event..."
                          value={formData.description}
                          onChange={handleFormChange}
                        ></textarea>
                      </div>
                      
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {formData.tags.map(tag => (
                            <div 
                              key={tag} 
                              className="inline-flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-200"
                            >
                              <FaTags className="mr-1.5" size={12} />
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <FaTimes size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex rounded-xl border-2 border-gray-200 overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all">
                          <input
                            type="text"
                            placeholder="Add a tag to categorize your event"
                            className="flex-1 px-4 py-3 bg-white text-gray-800 border-none focus:outline-none placeholder-gray-400"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddTag}
                            className="px-6 py-3 bg-[#00BBB9] text-white font-medium hover:bg-[#009A98] transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        {allTags.length > 0 && (
                          <div className="mt-3">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Suggested:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {allTags.filter(tag => !formData.tags.includes(tag)).slice(0, 6).map(tag => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      tags: [...prev.tags, tag]
                                    }));
                                  }}
                                  className="inline-flex items-center px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                >
                                  <FaPlus className="mr-1" size={10} />
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center bg-gray-50 rounded-xl p-4">
                        <input
                          type="checkbox"
                          id="reminder_enabled"
                          name="reminder_enabled"
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-lg"
                          checked={formData.reminder_enabled}
                          onChange={handleCheckboxChange}
                        />
                        <label htmlFor="reminder_enabled" className="ml-3 flex items-center text-gray-700 font-medium">
                          <FaBell className="mr-2 text-orange-500" size={16} />
                          Set reminder for this event
                        </label>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <FaSpinner className="animate-spin mr-2" size={14} />
                            {modalMode === 'add' ? 'Creating...' : 'Updating...'}
                          </div>
                        ) : (
                          modalMode === 'add' ? 'Create Event' : 'Update Event'
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/30 to-blue-900/40 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterModal(false)}
            />
            
            <motion.div 
              className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-w-md w-full overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ 
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.5
              }}
            >
              <div className="bg-[#00BBB9] p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-4 -translate-x-4"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold mb-1">Filter Events</h2>
                      <p className="text-teal-100 text-sm">Customize your event view</p>
                    </div>
                    <button 
                      onClick={() => setShowFilterModal(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <FaTimes size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Event Types
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { type: 'exam', label: 'Exam', color: 'bg-red-50 border-red-200 text-red-800' },
                        { type: 'quiz', label: 'Quiz', color: 'bg-orange-50 border-orange-200 text-orange-800' },
                        { type: 'study', label: 'Study', color: 'bg-teal-50 border-teal-200 text-teal-800' },
                        { type: 'assignment', label: 'Assignment', color: 'bg-blue-50 border-blue-200 text-blue-800' }
                      ].map(({ type, label, color }) => (
                        <div key={type} className="relative">
                          <input 
                            type="checkbox" 
                            id={`eventType-${type}`}
                            name={`eventType-${type}`}
                            checked={filterOptions.event_type.includes(type)}
                            onChange={handleFilterChange}
                            className="sr-only"
                          />
                          <label 
                            htmlFor={`eventType-${type}`} 
                            className={`flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                              filterOptions.event_type.includes(type) 
                                ? `${color} border-opacity-100` 
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <span className="text-sm font-medium">{label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Priority Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { priority: 'low', label: 'Low', color: 'bg-gray-50 border-gray-300 text-gray-700' },
                        { priority: 'medium', label: 'Medium', color: 'bg-orange-50 border-orange-300 text-orange-700' },
                        { priority: 'high', label: 'High', color: 'bg-red-50 border-red-300 text-red-700' }
                      ].map(({ priority, label, color }) => (
                        <div key={priority} className="relative">
                          <input 
                            type="checkbox" 
                            id={`priority-${priority}`}
                            name={`priority-${priority}`}
                            checked={filterOptions.priority.includes(priority)}
                            onChange={handleFilterChange}
                            className="sr-only"
                          />
                          <label 
                            htmlFor={`priority-${priority}`} 
                            className={`flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                              filterOptions.priority.includes(priority) 
                                ? `${color} border-opacity-100` 
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <span className="text-xs font-medium">{label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Time Range
                    </label>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        id="onlyUpcoming"
                        name="onlyUpcoming"
                        checked={filterOptions.onlyUpcoming}
                        onChange={handleFilterChange}
                        className="sr-only"
                      />
                      <label 
                        htmlFor="onlyUpcoming" 
                        className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          filterOptions.onlyUpcoming 
                            ? 'bg-blue-50 border-blue-300 text-blue-700' 
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center">
                          <FaClock className="mr-3" size={16} />
                          <span className="font-medium">Only upcoming events</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          filterOptions.onlyUpcoming ? 'bg-[#00BBB9] border-blue-500' : 'border-gray-300'
                        }`}>
                          {filterOptions.onlyUpcoming && (
                            <FaCheck className="w-3 h-3 text-white m-0.5" />
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {allTags.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Tags
                      </label>
                      <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                        {allTags.map(tag => (
                          <div key={tag} className="relative">
                            <input 
                              type="checkbox" 
                              id={`tag-${tag}`}
                              name={`tag-${tag}`}
                              checked={filterOptions.tags.includes(tag)}
                              onChange={handleFilterChange}
                              className="sr-only"
                            />
                            <label 
                              htmlFor={`tag-${tag}`} 
                              className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                filterOptions.tags.includes(tag) 
                                  ? 'bg-purple-50 border-purple-300 text-purple-700' 
                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-center">
                                <FaTags className="mr-2" size={12} />
                                <span className="text-sm">#{tag}</span>
                              </div>
                              <div className={`w-4 h-4 rounded border-2 ${
                                filterOptions.tags.includes(tag) ? 'bg-purple-500 border-purple-500' : 'border-gray-300'
                              }`}>
                                {filterOptions.tags.includes(tag) && (
                                  <FaCheck className="w-3 h-3 text-white m-0.5" />
                                )}
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-between space-x-4">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                  >
                    Reset All
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilterModal(false)}
                    className="flex-1 px-4 py-3 bg-[#00BBB9] text-white font-medium rounded-xl hover:bg-[#009A98] transform hover:scale-105 transition-all shadow-lg"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar Styles */}
      <style jsx global>{`
        .custom-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
          background-color: #00BBB9;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: none;
        }
        
        .react-calendar__navigation {
          background-color: white;
          border-radius: 0.75rem 0.75rem 0 0;
          margin-bottom: 0;
          height: 60px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .react-calendar__navigation button {
          font-family: inherit;
          font-weight: 600;
          color: #00BBB9;
          font-size: 1rem;
          background: none;
        }
        
        .react-calendar__navigation button:hover,
        .react-calendar__navigation button:focus {
          background-color: #e0f2fe;
        }
        
        .react-calendar__month-view__weekdays {
          background-color: #00BBB9;
          color: white;
          padding: 0.75rem 0;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
        }
        
        .react-calendar__month-view__weekdays__weekday {
          font-weight: 600;
          text-decoration: none;
        }
        
        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }
        
        .react-calendar__tile {
          padding: 1.25rem 0.5rem;
          position: relative;
          font-weight: 500;
          color: #374151;
          background: white;
          border: none;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .react-calendar__tile:hover {
          background-color: #f8fafc;
        }
        
        .react-calendar__tile--active {
          background-color: #00BBB9 !important;
          color: white !important;
          font-weight: 600;
        }
        
        .react-calendar__tile.has-event {
          font-weight: 600;
        }
        
        .react-calendar__tile.has-event::after {
          content: '';
          position: absolute;
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background-color: #00BBB9;
          border-radius: 50%;
        }
        
        .react-calendar__tile.has-high-priority::after {
          background-color: #ef4444;
          width: 8px;
          height: 8px;
        }
        
        .react-calendar__tile--active.has-event::after {
          background-color: white;
        }
        
        .react-calendar__tile.past-day {
          color: #9ca3af;
        }
        
        .react-calendar__tile.is-today {
          background-color: #dbeafe;
          border: 2px solid #00BBB9;
          color: #00BBB9;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}