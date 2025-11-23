import { useState, useEffect, useRef } from 'react';
import { Button, Input } from '@task-management/shared-ui';
import { useAuth } from '@task-management/shared-ui';
import { apiClient } from '@task-management/shared-ui';

interface Organization {
  id: string;
  name: string;
}

export function Register() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSearch, setOrganizationSearch] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch organizations on mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await apiClient.get('/api/v1/auth/organizations');
        setOrganizations(response.data);
        setFilteredOrganizations(response.data);
      } catch (err) {
        console.error('Failed to fetch organizations:', err);
      }
    };
    fetchOrganizations();
  }, []);

  // Filter organizations based on search
  useEffect(() => {
    if (organizationSearch.trim() === '') {
      setFilteredOrganizations(organizations);
      setIsCreatingNew(false);
    } else {
      const filtered = organizations.filter((org) =>
        org.name.toLowerCase().includes(organizationSearch.toLowerCase())
      );
      setFilteredOrganizations(filtered);
      
      // Check if search doesn't match any organization
      const exactMatch = organizations.some(
        (org) => org.name.toLowerCase() === organizationSearch.toLowerCase()
      );
      setIsCreatingNew(!exactMatch && organizationSearch.trim() !== '');
    }
  }, [organizationSearch, organizations]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOrganizationSelect = (org: Organization) => {
    setOrganizationName(org.name);
    setOrganizationSearch(org.name);
    setShowDropdown(false);
  };

  const handleCreateNewOrganization = () => {
    setOrganizationName(organizationSearch);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/v1/auth/register', {
        email,
        password,
        organizationName,
      });

      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem('refreshToken', refreshToken);
      login(user, accessToken);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-bold text-center">Create account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Get started with your free account
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <div className="relative" ref={dropdownRef}>
          <Input
            label="Organization"
            type="text"
            value={organizationSearch}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setOrganizationSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search or create organization..."
            autoComplete="off"
          />
          {showDropdown && (filteredOrganizations.length > 0 || isCreatingNew) && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredOrganizations.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => handleOrganizationSelect(org)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  {org.name}
                </button>
              ))}
              {isCreatingNew && (
                <button
                  type="button"
                  onClick={handleCreateNewOrganization}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-t border-gray-200 text-blue-600 font-medium"
                >
                  + Create "{organizationSearch}"
                </button>
              )}
            </div>
          )}
        </div>
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <Input
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          Create account
        </Button>
      </form>
    </div>
  );
}

