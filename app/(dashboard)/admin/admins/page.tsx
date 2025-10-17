'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaTooth,
  FaUsers,
  FaQuestionCircle,
  FaChartBar,
  FaExclamationTriangle,
  FaCog,
  FaClipboardList,
  FaKey,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaUserShield,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaTimes,
  FaCheck,
  FaUser,
  FaCrown,
  FaUserTie,
  FaLock,
  FaUnlock,
  FaSave,
  FaEnvelope,
  FaCalendarAlt,
  FaBan,
  FaUserCheck
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

// Type definitions
type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'viewer';
type AdminStatus = 'active' | 'inactive' | 'suspended';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'questions' | 'codes' | 'statistics' | 'system';
}

interface AdminAccount {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    status: AdminStatus;
    created_at: string;
    last_login?: string;
  };
  role: AdminRole;
  permissions: string[];
  created_at: string;
  last_login?: string;
  created_by?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  };
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// API helper functions
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('toothquest-token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  
  return headers;
};

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const authHeaders = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('toothquest-token');
        localStorage.removeItem('toothquest-user');
        window.location.href = '/login';
      }
      return;
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

export default function AdminManagementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false); // Add mounted state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | AdminRole>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | AdminStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [adminsPerPage] = useState(8);
  const [permissions, setPermissions] = useState<Record<string, string>>({});
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'viewer' as AdminRole,
    permissions: [] as string[]
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Available permissions mapping
  const PERMISSION_CATEGORIES = {
    users: 'Users Management',
    questions: 'Questions Management', 
    codes: 'Access Codes',
    stats: 'Statistics & Analytics',
    system: 'System Management'
  };

  // Fix hydration by ensuring client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return; // Don't run until mounted
    
    // Check authentication and load data
    const initializePage = async () => {
      try {
        const token = localStorage.getItem('toothquest-token');
        const userStr = localStorage.getItem('toothquest-user');
        
        console.log('=== DEBUGGING AUTH ===');
        console.log('Token exists:', !!token);
        console.log('User string:', userStr);
        
        if (!token || !userStr) {
          console.log('Missing token or user data, redirecting to login');
          router.push('/login');
          return;
        }

        const user = JSON.parse(userStr);
        
        console.log('Parsed user:', user);
        console.log('User role:', user.role);
        console.log('User is_admin property:', user.is_admin);
        console.log('Manual admin check:', ['super_admin', 'admin', 'moderator'].includes(user.role));
        
        // More flexible admin check
        const isAdminByRole = ['super_admin', 'admin', 'moderator'].includes(user.role);
        const isAdminByProperty = user.is_admin === true;
        
        console.log('Is admin by role:', isAdminByRole);
        console.log('Is admin by property:', isAdminByProperty);
        
        if (!isAdminByRole && !isAdminByProperty) {
          console.error('Access denied - user is not admin');
          toast.error('Access denied. Admin privileges required.');
          router.push('/');
          return;
        }

        console.log('✓ Admin access granted');
        setCurrentUser(user);
        
        // Test API call to verify token works
        console.log('Testing API access...');
        
        await loadAdmins();
        await loadPermissions();
        
        console.log('✓ API calls successful');
        
        // Debug logging
        console.log('Loaded admins:', admins.length);
        console.log('Loaded permissions:', Object.keys(permissions).length);
        if (admins.length > 0) {
          console.log('Sample admin permissions:', admins[0].permissions);
        }
      } catch (error) {
        console.error('Error initializing page:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error('Failed to load page data');
        
        // If it's an auth error, redirect to login
        if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          console.log('Auth error detected, redirecting to login');
          localStorage.removeItem('toothquest-token');
          localStorage.removeItem('toothquest-user');
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [router, isMounted]);

  // Enhanced permission system with proper role-based defaults
  const getDefaultPermissions = (role: AdminRole): string[] => {
    switch (role) {
      case 'super_admin':
        return Object.keys(permissions); // ALL permissions
      case 'admin':
        return [
          'users.view', 'users.create', 'users.edit', 'users.suspend',
          'questions.view', 'questions.create', 'questions.edit', 'questions.moderate',
          'codes.view', 'codes.generate', 'codes.download',
          'stats.view', 'stats.export',
        ];
      case 'moderator':
        return [
          'users.view', 'users.suspend',
          'questions.view', 'questions.moderate',
          'codes.view',
          'stats.view',
        ];
      case 'viewer':
        return [
          'users.view',
          'questions.view',
          'codes.view',
          'stats.view',
        ];
      default:
        return [];
    }
  };

  const loadAdmins = async () => {
    try {
      const data = await apiCall('/auth/admin-accounts/');
      
      // Handle both direct arrays and paginated results
      if (Array.isArray(data)) {
        setAdmins(data);
      } else if (data && Array.isArray(data.results)) {
        setAdmins(data.results);
      } else {
        console.log('API returned unexpected data format');
        setAdmins([]);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load admin accounts';
      toast.error(errorMessage);
      setAdmins([]);
    }
  };

  const loadPermissions = async () => {
    try {
      const data = await apiCall('/auth/permissions/');
      setPermissions(data);
    } catch (error) {
      console.error('Error loading permissions:', error);
      // Fallback to local permissions if API fails
      const fallbackPermissions = {
        // Users Management
        'users.view': 'View Users',
        'users.create': 'Create Users',
        'users.edit': 'Edit Users',
        'users.delete': 'Delete Users',
        'users.suspend': 'Suspend Users',
        
        // Questions Management
        'questions.view': 'View Questions',
        'questions.create': 'Create Questions',
        'questions.edit': 'Edit Questions',
        'questions.delete': 'Delete Questions',
        'questions.moderate': 'Moderate Questions',
        
        // Access Codes
        'codes.view': 'View Access Codes',
        'codes.generate': 'Generate Access Codes',
        'codes.download': 'Download Access Codes',
        'codes.revoke': 'Revoke Access Codes',
        
        // Statistics & Analytics
        'stats.view': 'View Statistics',
        'stats.export': 'Export Statistics',
        'stats.detailed': 'Detailed Analytics',
        
        // System Management
        'system.settings': 'System Settings',
        'system.backup': 'System Backup',
        'system.logs': 'View System Logs',
      };
      setPermissions(fallbackPermissions);
    }
  };

  useEffect(() => {
    if (!isMounted || !Array.isArray(admins)) return;
    
    // Apply filters
    let filtered = [...admins];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(admin => 
        admin.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(admin => admin.role === filterRole);
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(admin => admin.user.status === filterStatus);
    }
    
    setFilteredAdmins(filtered);
    setCurrentPage(1);
  }, [admins, searchTerm, filterRole, filterStatus, isMounted]);

  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = filteredAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin);
  const totalPages = Math.ceil(filteredAdmins.length / adminsPerPage);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('toothquest-token');
      localStorage.removeItem('toothquest-user');
      router.push('/login');
    }
  };

  const handleCreateAdmin = () => {
    setFormData({
      username: '',
      email: '',
      full_name: '',
      password: '',
      role: 'viewer',
      permissions: getDefaultPermissions('viewer')
    });
    setShowCreateModal(true);
  };

  const handleEditAdmin = (admin: AdminAccount) => {
    setCurrentAdmin(admin);
    
    // Properly load existing permissions from the admin account
    const adminPermissions = admin.permissions || [];
    
    setFormData({
      username: admin.user.username,
      email: admin.user.email,
      full_name: admin.user.full_name,
      password: '',
      role: admin.role,
      permissions: [...adminPermissions] // Use actual saved permissions
    });
    setShowEditModal(true);
  };

  // Auto-update permissions when role changes
  const handleRoleChange = (newRole: AdminRole) => {
    const defaultPermissions = getDefaultPermissions(newRole);
    setFormData({
      ...formData,
      role: newRole,
      permissions: defaultPermissions
    });
  };

  const handleViewAdmin = (admin: AdminAccount) => {
    setCurrentAdmin(admin);
    setShowViewModal(true);
  };

  const handleDeleteAdmin = (admin: AdminAccount) => {
    setCurrentAdmin(admin);
    setShowDeleteModal(true);
  };

  const confirmCreateAdmin = async () => {
    if (!formData.username || !formData.email || !formData.full_name || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare data for backend API
      const createData = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        role: formData.role,
        permissions: formData.permissions // This will be saved to database
      };

      console.log('Creating admin with data:', createData);

      const response = await apiCall('/auth/admin-accounts/', {
        method: 'POST',
        body: JSON.stringify(createData),
      });

      console.log('Admin created successfully:', response);

      toast.success(`Admin account created for ${formData.full_name}`);
      setShowCreateModal(false);
      
      // Clear form
      setFormData({
        username: '',
        email: '',
        full_name: '',
        password: '',
        role: 'viewer',
        permissions: getDefaultPermissions('viewer')
      });
      
      await loadAdmins();
    } catch (error) {
      console.error('Error creating admin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create admin';
      toast.error(`Failed to create admin: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmEditAdmin = async () => {
    if (!currentAdmin || !formData.full_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare data for backend API
      const updateData = {
        full_name: formData.full_name,
        role: formData.role,
        permissions: formData.permissions // This will be saved to database
      };

      console.log('Updating admin with data:', updateData);

      const response = await apiCall(`/auth/admin-accounts/${currentAdmin.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      console.log('Admin updated successfully:', response);

      toast.success(`Admin account updated for ${formData.full_name}`);
      setShowEditModal(false);
      setCurrentAdmin(null);
      
      await loadAdmins();
    } catch (error) {
      console.error('Error updating admin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update admin';
      toast.error(`Failed to update admin: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDeleteAdmin = async () => {
    if (!currentAdmin) return;

    setIsProcessing(true);

    try {
      await apiCall(`/auth/admin-accounts/${currentAdmin.id}/`, {
        method: 'DELETE',
      });

      toast.success(`Admin account deleted for ${currentAdmin.user.full_name}`);
      setShowDeleteModal(false);
      setCurrentAdmin(null);
      
      await loadAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete admin';
      toast.error(`Failed to delete admin: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleAdminStatus = async (admin: AdminAccount) => {
    const newStatus: AdminStatus = admin.user.status === 'active' ? 'suspended' : 'active';
    
    try {
      const response = await apiCall(`/auth/admin-accounts/${admin.id}/status/`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus }),
      });

      console.log('Admin status updated:', response);

      toast.success(`Admin ${newStatus === 'active' ? 'activated' : 'suspended'}`);
      await loadAdmins();
    } catch (error) {
      console.error('Error updating admin status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update admin status';
      toast.error(`Failed to update admin status: ${errorMessage}`);
    }
  };

  const getRoleInfo = (role: AdminRole) => {
    switch (role) {
      case 'super_admin': return { name: 'Super Admin', icon: <FaCrown />, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'admin': return { name: 'Admin', icon: <FaUserShield />, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'moderator': return { name: 'Moderator', icon: <FaUserTie />, color: 'text-green-600', bg: 'bg-green-100' };
      case 'viewer': return { name: 'Viewer', icon: <FaUser />, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getStatusBadgeClass = (status: AdminStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!isMounted) return ''; // Prevent hydration issues
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPermissionsByCategory = (category: string) => {
    return Object.entries(permissions)
      .filter(([key]) => key.startsWith(category))
      .map(([key, value]) => ({ id: key, name: value, category }));
  };

  const togglePermission = (permissionId: string) => {
    const currentPermissions = formData.permissions;
    if (currentPermissions.includes(permissionId)) {
      setFormData({
        ...formData,
        permissions: currentPermissions.filter(p => p !== permissionId)
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...currentPermissions, permissionId]
      });
    }
  };

  const selectAllPermissions = (category: string) => {
    const categoryPermissions = getPermissionsByCategory(category).map(p => p.id);
    const otherPermissions = formData.permissions.filter(p => 
      !getPermissionsByCategory(category).some(cp => cp.id === p)
    );
    setFormData({
      ...formData,
      permissions: [...otherPermissions, ...categoryPermissions]
    });
  };

  const deselectAllPermissions = (category: string) => {
    const categoryPermissions = getPermissionsByCategory(category).map(p => p.id);
    setFormData({
      ...formData,
      permissions: formData.permissions.filter(p => !categoryPermissions.includes(p))
    });
  };

  // Don't render anything until mounted (prevents hydration errors)
  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#002F5A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading admin management...</p>
        </div>
      </div>
    );
  }

  // Enhanced Sidebar Component
  const EnhancedSidebar = () => {
    return (
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white rounded-tr-2xl rounded-br-2xl shadow-lg h-full py-6 transition-all duration-300 ease-in-out relative`}>
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 bg-[#002F5A] text-white p-1.5 rounded-full shadow-md hover:bg-blue-600 transition-colors"
        >
          {sidebarCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
        </button>

        <div className="px-4">
          <div className="flex items-center mb-10 justify-center">
            {!sidebarCollapsed && (
              <div className="w-full flex justify-center">
                <div className="text-2xl font-bold text-blue-600">ToothQuest</div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="w-full flex justify-center">
                <div className="text-xl font-bold text-blue-600">TQ</div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {[
              { icon: <FaChartBar size={20} />, name: 'Dashboard', id: 'dashboard', path: '/admin/dashboard' },
              { icon: <FaUsers size={20} />, name: 'Users', id: 'users', path: '/admin/users' },
              { icon: <FaQuestionCircle size={20} />, name: 'Questions', id: 'questions', path: '/admin/questions' },
              { icon: <FaExclamationTriangle size={20} />, name: 'Reported Questions', id: 'reports', path: '/admin/reports' },
              { icon: <FaKey size={20} />, name: 'Access Codes', id: 'codes', path: '/admin/codes' },
              { icon: <FaUserShield size={20} />, name: 'Admin Management', id: 'admin-management', path: '/admin/admins' },
              { icon: <FaClipboardList size={20} />, name: 'Statistics', id: 'statistics', path: '/admin/statistics' },
              { icon: <FaCog size={20} />, name: 'Settings', id: 'settings', path: '/admin/settings' },
            ].map((item) => (
              <Link
                key={item.id}
                href={item.path}
                className={`group flex items-center py-3 ${sidebarCollapsed ? 'justify-center' : 'px-4'} rounded-xl cursor-pointer relative ${
                  item.id === 'admin-management' ? 'bg-[#002F5A]' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`${item.id === 'admin-management' ? 'text-white' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                
                {!sidebarCollapsed && (
                  <span className={`ml-3 text-sm font-medium ${item.id === 'admin-management' ? 'text-white' : 'text-gray-600'}`}>
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

  return (
    <div className="flex h-screen bg-gray-50">
      <EnhancedSidebar />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center">
                <FaUserShield className="mr-3 text-[#002F5A]" /> Admin Management
              </h1>
              <p className="text-sm text-gray-600">
                {isMounted && new Intl.DateTimeFormat('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }).format(new Date())}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCreateAdmin}
                className="bg-[#002F5A] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <FaPlus className="mr-2" /> Create Admin
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="bg-blue-50 rounded-xl shadow-sm p-6 border-l-4 border-[#002F5A]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Admins</p>
                  <h3 className="text-3xl font-bold text-blue-600">
                    {Array.isArray(admins) ? admins.length : 0}
                  </h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaUserShield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active</p>
                  <h3 className="text-3xl font-bold text-green-600">
                    {Array.isArray(admins) ? admins.filter(a => a.user.status === 'active').length : 0}
                  </h3>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FaUserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 rounded-xl shadow-sm p-6 border-l-4 border-red-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Suspended</p>
                  <h3 className="text-3xl font-bold text-red-600">
                    {Array.isArray(admins) ? admins.filter(a => a.user.status === 'suspended').length : 0}
                  </h3>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <FaBan className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Super Admins</p>
                  <h3 className="text-3xl font-bold text-purple-600">
                    {Array.isArray(admins) ? admins.filter(a => a.role === 'super_admin').length : 0}
                  </h3>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaCrown className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col lg:flex-row items-stretch gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black placeholder-blue-400"
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as 'all' | AdminRole)}
                  className="px-4 py-2 border-2 border-blue-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black"
                >
                  <option value="all">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="viewer">Viewer</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | AdminStatus)}
                  className="px-4 py-2 border-2 border-blue-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </motion.div>
          
          {/* Admins Grid */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {Array.isArray(currentAdmins) && currentAdmins.length > 0 ? (
              currentAdmins.map((admin) => {
                const roleInfo = getRoleInfo(admin.role);
                return (
                  <div key={admin.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mr-3">
                          {admin.user.full_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{admin.user.full_name}</h3>
                          <p className="text-sm text-gray-500">@{admin.user.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(admin.user.status)}`}>
                          {admin.user.status.charAt(0).toUpperCase() + admin.user.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium text-gray-500">{admin.user.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Role:</span>
                        <div className={`flex items-center px-2 py-1 rounded-full ${roleInfo.bg}`}>
                          <span className={`mr-1 ${roleInfo.color}`}>{roleInfo.icon}</span>
                          <span className={`text-xs font-medium ${roleInfo.color}`}>{roleInfo.name}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Permissions:</span>
                        <span className="text-sm font-medium text-blue-600">
                          {Array.isArray(admin.permissions) ? admin.permissions.length : 0} granted
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Created:</span>
                        <span className="text-sm text-gray-500">{formatDate(admin.created_at)}</span>
                      </div>
                      {admin.last_login && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Login:</span>
                          <span className="text-sm text-gray-500">{formatDate(admin.last_login)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Created By:</span>
                        <span className="text-sm text-gray-500">{admin.created_by?.full_name || 'System'}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleViewAdmin(admin)}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <FaEye className="mr-1" /> View Details
                      </button>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleAdminStatus(admin)}
                          className={`px-3 py-1 rounded-md text-sm transition-colors flex items-center ${
                            admin.user.status === 'active' 
                              ? 'bg-red-500 text-white hover:bg-red-600' 
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {admin.user.status === 'active' ? <FaLock className="mr-1" /> : <FaUnlock className="mr-1" />}
                          {admin.user.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleEditAdmin(admin)}
                          className="px-3 py-1 bg-[#002F5A] text-white rounded-md text-sm hover:bg-blue-600 transition-colors flex items-center"
                        >
                          <FaEdit className="mr-1" /> Edit
                        </button>
                        {admin.role !== 'super_admin' && (
                          <button
                            onClick={() => handleDeleteAdmin(admin)}
                            className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors flex items-center"
                          >
                            <FaTrash className="mr-1" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-12">
                <FaUserShield className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Admin Accounts Found</h3>
                <p className="text-gray-500 mb-4">There are no admin accounts to display.</p>
                <button
                  onClick={handleCreateAdmin}
                  className="bg-[#002F5A] text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center mx-auto"
                >
                  <FaPlus className="mr-2" /> Create First Admin
                </button>
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {filteredAdmins.length > adminsPerPage && (
            <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstAdmin + 1} to{' '}
                {Math.min(indexOfLastAdmin, filteredAdmins.length)}{' '}
                of {filteredAdmins.length} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <FaChevronLeft />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-[#002F5A] text-white border-[#002F5A]'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Create New Admin</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black"
                      placeholder="Enter username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black"
                      placeholder="Enter password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleRoleChange(e.target.value as AdminRole)}
                      className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.role === 'super_admin' && '🔥 Has ALL permissions automatically'}
                      {formData.role === 'admin' && '⚡ Has most permissions for daily management'}
                      {formData.role === 'moderator' && '🛡️ Can moderate content and view data'}
                      {formData.role === 'viewer' && '👁️ Read-only access to most sections'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Permissions</h3>
                    {formData.role === 'super_admin' ? (
                      <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        🚀 Super Admin has ALL permissions
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        {formData.permissions.length} permissions selected
                      </div>
                    )}
                  </div>
                  
                  {formData.role === 'super_admin' ? (
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 text-center">
                      <FaCrown className="mx-auto text-4xl text-purple-600 mb-3" />
                      <h4 className="text-lg font-semibold text-purple-800 mb-2">Super Administrator</h4>
                      <p className="text-purple-700">
                        This role automatically grants ALL permissions in the system. 
                        Super Admins have unrestricted access to every feature and setting.
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-white rounded-lg p-2">
                          <strong>✅ All User Management</strong>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <strong>✅ All Question Management</strong>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <strong>✅ All Access Code Management</strong>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <strong>✅ All System Management</strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    Object.entries(PERMISSION_CATEGORIES).map(([category, categoryName]) => (
                      <div key={category} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-800">{categoryName}</h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => selectAllPermissions(category)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Select All
                            </button>
                            <button
                              onClick={() => deselectAllPermissions(category)}
                              className="text-xs text-gray-600 hover:text-gray-800"
                            >
                              Deselect All
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {getPermissionsByCategory(category).map(permission => (
                            <label key={permission.id} className="flex items-start">
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="mt-1 mr-3 rounded border-gray-300 text-blue-600 focus:ring-[#002F5A]"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> The admin will be able to log in immediately with the provided credentials.
                  It's recommended to advise them to change their password on first login.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border-2 border-blue-300 rounded-lg text-black hover:bg-blue-50 transition-colors bg-white"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCreateAdmin}
                  disabled={isProcessing || !formData.username || !formData.email || !formData.full_name || !formData.password}
                  className="px-4 py-2 bg-[#002F5A] text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </span>
                  ) : (
                    <>
                      <FaPlus className="mr-1" /> Create Admin
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && currentAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-green-600 p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit Admin: {currentAdmin.user.full_name}</h2>
              <button onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username (Read Only)
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      readOnly
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (Read Only)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleRoleChange(e.target.value as AdminRole)}
                      className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.role === 'super_admin' && '🔥 Has ALL permissions automatically'}
                      {formData.role === 'admin' && '⚡ Has most permissions for daily management'}
                      {formData.role === 'moderator' && '🛡️ Can moderate content and view data'}
                      {formData.role === 'viewer' && '👁️ Read-only access to most sections'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Permissions</h3>
                    {formData.role === 'super_admin' ? (
                      <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        🚀 Super Admin has ALL permissions
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        {formData.permissions.length} permissions selected
                      </div>
                    )}
                  </div>
                  
                  {formData.role === 'super_admin' ? (
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 text-center">
                      <FaCrown className="mx-auto text-4xl text-purple-600 mb-3" />
                      <h4 className="text-lg font-semibold text-purple-800 mb-2">Super Administrator</h4>
                      <p className="text-purple-700">
                        This role automatically grants ALL permissions in the system. 
                        Super Admins have unrestricted access to every feature and setting.
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-white rounded-lg p-2">
                          <strong>✅ All User Management</strong>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <strong>✅ All Question Management</strong>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <strong>✅ All Access Code Management</strong>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <strong>✅ All System Management</strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    Object.entries(PERMISSION_CATEGORIES).map(([category, categoryName]) => (
                      <div key={category} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-800">{categoryName}</h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => selectAllPermissions(category)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Select All
                            </button>
                            <button
                              onClick={() => deselectAllPermissions(category)}
                              className="text-xs text-gray-600 hover:text-gray-800"
                            >
                              Deselect All
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {getPermissionsByCategory(category).map(permission => (
                            <label key={permission.id} className="flex items-start">
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="mt-1 mr-3 rounded border-gray-300 text-blue-600 focus:ring-[#002F5A]"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border-2 border-blue-300 rounded-lg text-black hover:bg-blue-50 transition-colors bg-white"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEditAdmin}
                  disabled={isProcessing || !formData.full_name}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </span>
                  ) : (
                    <>
                      <FaSave className="mr-1" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Admin Modal */}
      {showViewModal && currentAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Admin Details</h2>
              <button onClick={() => setShowViewModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Full Name:</span>
                      <span className="text-gray-900">{currentAdmin.user.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Username:</span>
                      <span className="text-gray-900">@{currentAdmin.user.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="text-gray-900">{currentAdmin.user.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Role:</span>
                      <div className={`flex items-center px-2 py-1 rounded-full ${getRoleInfo(currentAdmin.role).bg}`}>
                        <span className={`mr-1 ${getRoleInfo(currentAdmin.role).color}`}>{getRoleInfo(currentAdmin.role).icon}</span>
                        <span className={`text-xs font-medium ${getRoleInfo(currentAdmin.role).color}`}>{getRoleInfo(currentAdmin.role).name}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(currentAdmin.user.status)}`}>
                        {currentAdmin.user.status.charAt(0).toUpperCase() + currentAdmin.user.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Created:</span>
                      <span className="text-gray-900">{formatDate(currentAdmin.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Created By:</span>
                      <span className="text-gray-900">{currentAdmin.created_by?.full_name || 'System'}</span>
                    </div>
                    {currentAdmin.last_login && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Last Login:</span>
                        <span className="text-gray-900">{formatDate(currentAdmin.last_login)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Total Permissions:</span>
                      <span className="text-blue-600 font-bold">
                        {Array.isArray(currentAdmin.permissions) ? currentAdmin.permissions.length : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Granted Permissions</h3>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(PERMISSION_CATEGORIES).map(([category, categoryName]) => {
                    const categoryPermissions = getPermissionsByCategory(category).filter(p => 
                      Array.isArray(currentAdmin.permissions) && currentAdmin.permissions.includes(p.id)
                    );
                    
                    if (categoryPermissions.length === 0) return null;
                    
                    return (
                      <div key={category} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-800 mb-2">{categoryName}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {categoryPermissions.map(permission => (
                            <div key={permission.id} className="flex items-center">
                              <FaCheck className="text-green-600 mr-2" size={12} />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Show message if admin has no permissions in any category */}
                  {Object.entries(PERMISSION_CATEGORIES).every(([category]) => {
                    const categoryPermissions = getPermissionsByCategory(category).filter(p => 
                      Array.isArray(currentAdmin.permissions) && currentAdmin.permissions.includes(p.id)
                    );
                    return categoryPermissions.length === 0;
                  }) && (
                    <div className="text-center py-8 text-gray-500">
                      <FaBan className="mx-auto text-4xl mb-2" />
                      <p>No permissions granted in the defined categories</p>
                      {Array.isArray(currentAdmin.permissions) && currentAdmin.permissions.length > 0 && (
                        <p className="text-sm mt-2">
                          This admin has {currentAdmin.permissions.length} custom permissions
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border-2 border-blue-300 rounded-lg text-black hover:bg-blue-50 transition-colors bg-white"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditAdmin(currentAdmin);
                  }}
                  className="px-4 py-2 bg-[#002F5A] text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <FaEdit className="mr-1" /> Edit Admin
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Admin Modal */}
      {showDeleteModal && currentAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-red-600 p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Delete Admin</h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete the admin account for <strong>{currentAdmin.user.full_name}</strong>?
                </p>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800 text-sm">
                    <strong>Warning:</strong> This action cannot be undone. The admin will lose access immediately 
                    and all their activity logs will be preserved for audit purposes.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border-2 border-blue-300 rounded-lg text-black hover:bg-blue-50 transition-colors bg-white"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAdmin}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </span>
                  ) : (
                    <>
                      <FaTrash className="mr-1" /> Delete Admin
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}