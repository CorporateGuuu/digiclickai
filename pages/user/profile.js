import React from 'react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import TwoFactorSetup from '../../components/TwoFactorAuth/TwoFactorSetup';
import styles from '../../styles/UserProfile.module.css';

export default function UserProfile() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // User profile data
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    image: '',
  });

  // Password change data
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Address data
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    is_default: false,
  });
  const [editingAddressId, setEditingAddressId] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin?callbackUrl=/user/profile');
    } else if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, router, activeTab]);

  async function fetchUserData() {
    try {
      setLoading(true);

      if (activeTab === 'profile') {
        try {
          // Try to fetch from the real API endpoint
          const response = await fetch('/api/user/profile');

          if (!response.ok) {
            throw new Error('Failed to fetch user profile');
          }

          const data = await response.json();
          setProfile(data.user);
        } catch (error) {
          console.warn('Falling back to mock profile data:', error);

          // Fall back to mock data if the API fails
          const mockResponse = await fetch('/api/user/mock-profile');
          const mockData = await mockResponse.json();
          setProfile(mockData.user);
        }
      } else if (activeTab === 'addresses') {
        try {
          // Try to fetch from the real API endpoint
          const response = await fetch('/api/user/addresses');

          if (!response.ok) {
            throw new Error('Failed to fetch user addresses');
          }

          const data = await response.json();
          setAddresses(data.addresses);
        } catch (error) {
          console.warn('Using mock address data:', error);

          // Use mock data if the API fails
          setAddresses([
            {
              id: 1,
              address_line1: '123 Main St',
              address_line2: 'Apt 4B',
              city: 'Vienna',
              state: 'VA',
              postal_code: '22182',
              country: 'US',
              is_default: true
            },
            {
              id: 2,
              address_line1: '456 Oak Ave',
              address_line2: '',
              city: 'Arlington',
              state: 'VA',
              postal_code: '22201',
              country: 'US',
              is_default: false
            }
          ]);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data. Please try again.');
      setLoading(false);
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress({
      ...newAddress,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setSuccess('');
      setError('');

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      // Validate passwords
      if (passwordData.new_password !== passwordData.confirm_password) {
        setError('New passwords do not match');
        return;
      }

      setSaving(true);
      setSuccess('');
      setError('');

      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.current_password,
          newPassword: passwordData.new_password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to change password');
      }

      setSuccess('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setSaving(false);
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.message || 'Failed to change password. Please try again.');
      setSaving(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setSuccess('');
      setError('');

      const method = editingAddressId ? 'PUT' : 'POST';
      const url = editingAddressId
        ? `/api/user/addresses/${editingAddressId}`
        : '/api/user/addresses';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAddress),
      });

      if (!response.ok) {
        throw new Error('Failed to save address');
      }

      setSuccess('Address saved successfully!');
      setNewAddress({
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
        is_default: false,
      });
      setEditingAddressId(null);
      setSaving(false);

      // Refresh addresses
      fetchUserData();
    } catch (error) {
      console.error('Error saving address:', error);
      setError('Failed to save address. Please try again.');
      setSaving(false);
    }
  };

  const handleEditAddress = (address) => {
    setNewAddress({
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default,
    });
    setEditingAddressId(address.id);
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const response = await fetch(`/api/user/addresses/${addressId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete address');
        }

        setSuccess('Address deleted successfully!');

        // Refresh addresses
        fetchUserData();
      } catch (error) {
        console.error('Error deleting address:', error);
        setError('Failed to delete address. Please try again.');
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await fetch(`/api/user/addresses/${addressId}/default`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to set default address');
      }

      setSuccess('Default address updated successfully!');

      // Refresh addresses
      fetchUserData();
    } catch (error) {
      console.error('Error setting default address:', error);
      setError('Failed to set default address. Please try again.');
    }
  };

  const renderProfileTab = () => (
    <div className={styles.tabContent}>
      <h2>Profile Information</h2>

      <form onSubmit={handleSaveProfile} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="first_name">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={profile.first_name || ''}
              onChange={handleProfileChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="last_name">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={profile.last_name || ''}
              onChange={handleProfileChange}
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={profile.email || ''}
            onChange={handleProfileChange}
            className={styles.input}
            required
            disabled
          />
          <p className={styles.helpText}>Email address cannot be changed</p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone_number">Phone Number</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={profile.phone_number || ''}
            onChange={handleProfileChange}
            className={styles.input}
            placeholder="e.g. +1 (555) 123-4567"
          />
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div className={styles.divider}></div>

      <h2>Change Password</h2>

      <form onSubmit={handleChangePassword} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="current_password">Current Password</label>
          <input
            type="password"
            id="current_password"
            name="current_password"
            value={passwordData.current_password}
            onChange={handlePasswordChange}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="new_password">New Password</label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              className={styles.input}
              required
              minLength={8}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirm_password">Confirm New Password</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={passwordData.confirm_password}
              onChange={handlePasswordChange}
              className={styles.input}
              required
              minLength={8}
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={saving}
          >
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderAddressesTab = () => (
    <div className={styles.tabContent}>
      <h2>Your Addresses</h2>

      <div className={styles.addressList}>
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <div key={address.id} className={styles.addressCard}>
              {address.is_default && (
                <div className={styles.defaultBadge}>Default</div>
              )}

              <div className={styles.addressDetails}>
                <p className={styles.addressName}>
                  {profile.first_name} {profile.last_name}
                </p>
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>
                  {address.city}, {address.state} {address.postal_code}
                </p>
                <p>{address.country}</p>
              </div>

              <div className={styles.addressActions}>
                <button
                  onClick={() => handleEditAddress(address)}
                  className={styles.editButton}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
                {!address.is_default && (
                  <button
                    onClick={() => handleSetDefaultAddress(address.id)}
                    className={styles.defaultButton}
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noAddresses}>You haven't added any addresses yet.</p>
        )}
      </div>

      <div className={styles.divider}></div>

      <h2>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h2>

      <form onSubmit={handleSaveAddress} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="address_line1">Address Line 1</label>
          <input
            type="text"
            id="address_line1"
            name="address_line1"
            value={newAddress.address_line1}
            onChange={handleAddressChange}
            className={styles.input}
            required
            placeholder="Street address, P.O. box, company name"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="address_line2">Address Line 2 (Optional)</label>
          <input
            type="text"
            id="address_line2"
            name="address_line2"
            value={newAddress.address_line2}
            onChange={handleAddressChange}
            className={styles.input}
            placeholder="Apartment, suite, unit, building, floor, etc."
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={newAddress.city}
              onChange={handleAddressChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="state">State / Province</label>
            <input
              type="text"
              id="state"
              name="state"
              value={newAddress.state}
              onChange={handleAddressChange}
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="postal_code">Postal Code</label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              value={newAddress.postal_code}
              onChange={handleAddressChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="country">Country</label>
            <select
              id="country"
              name="country"
              value={newAddress.country}
              onChange={handleAddressChange}
              className={styles.select}
              required
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="JP">Japan</option>
              <option value="CN">China</option>
              <option value="IN">India</option>
              <option value="BR">Brazil</option>
              <option value="MX">Mexico</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="is_default"
              checked={newAddress.is_default}
              onChange={handleAddressChange}
            />
            Set as default address
          </label>
        </div>

        <div className={styles.formActions}>
          {editingAddressId && (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => {
                setNewAddress({
                  address_line1: '',
                  address_line2: '',
                  city: '',
                  state: '',
                  postal_code: '',
                  country: 'US',
                  is_default: false,
                });
                setEditingAddressId(null);
              }}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className={styles.saveButton}
            disabled={saving}
          >
            {saving ? 'Saving...' : editingAddressId ? 'Update Address' : 'Add Address'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderSecurityTab = () => (
    <div className={styles.tabContent}>
      <h2>Security Settings</h2>

      <div className={styles.securitySection}>
        <h3>Two-Factor Authentication</h3>
        <TwoFactorSetup />
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className={styles.tabContent}>
      <h2>Your Orders</h2>

      <div className={styles.ordersList}>
        {/* Orders will be loaded here */}
        <p className={styles.comingSoon}>Order history coming soon!</p>
      </div>
    </div>
  );

  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Your Profile | MDTS Tech</title>
        </Head>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Your Profile | MDTS Tech</title>
      </Head>

      <div className={styles.header}>
        <h1>Your Account</h1>
        <Link href="/" className={styles.backLink}>
          Back to Store
        </Link>
      </div>

      {success && <div className={styles.successMessage}>{success}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {profile.image ? (
                <img src={profile.image} alt={`${profile.first_name} ${profile.last_name}`} />
              ) : (
                <div className={styles.initials}>
                  {profile.first_name && profile.first_name[0]}
                  {profile.last_name && profile.last_name[0]}
                </div>
              )}
            </div>
            <div className={styles.userName}>
              {profile.first_name} {profile.last_name}
            </div>
            <div className={styles.userEmail}>{profile.email}</div>
          </div>

          <nav className={styles.nav}>
            <button
              className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Information
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'addresses' ? styles.active : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              Addresses
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'security' ? styles.active : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'orders' ? styles.active : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
          </nav>
        </div>

        <div className={styles.mainContent}>
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'addresses' && renderAddressesTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'orders' && renderOrdersTab()}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin?callbackUrl=/user/profile',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}
