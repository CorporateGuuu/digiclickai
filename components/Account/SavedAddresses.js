import React from 'react';
import { useState, useEffect } from 'react';
import styles from '../../styles/Account.module.css';

const SavedAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch addresses from an API
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock address data
        const mockAddresses = [
          {
            id: 1,
            type: 'Home',
            isDefault: true,
            firstName: 'John',
            lastName: 'Doe',
            address1: '123 Main St',
            address2: 'Apt 4B',
            city: 'Vienna',
            state: 'VA',
            postalCode: '22182',
            country: 'United States',
            phone: '+1 (240) 351-0511'
          },
          {
            id: 2,
            type: 'Work',
            isDefault: false,
            firstName: 'John',
            lastName: 'Doe',
            address1: '456 Business Ave',
            address2: 'Suite 200',
            city: 'Vienna',
            state: 'VA',
            postalCode: '22182',
            country: 'United States',
            phone: '+1 (240) 351-0511'
          }
        ];
        
        setAddresses(mockAddresses);
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setError('Failed to load addresses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAddresses();
  }, []);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (addressId) => {
    // In a real app, this would call an API to delete the address
    setAddresses(addresses.filter(address => address.id !== addressId));
  };

  const handleSetDefaultAddress = (addressId) => {
    // In a real app, this would call an API to set the default address
    setAddresses(addresses.map(address => ({
      ...address,
      isDefault: address.id === addressId
    })));
  };

  const handleSaveAddress = (formData) => {
    // In a real app, this would call an API to save the address
    if (editingAddress) {
      // Update existing address
      setAddresses(addresses.map(address => 
        address.id === editingAddress.id ? { ...formData, id: address.id } : address
      ));
    } else {
      // Add new address
      setAddresses([...addresses, { ...formData, id: Date.now() }]);
    }
    
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your addresses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Saved Addresses</h2>
      <p>Manage your shipping and billing addresses</p>
      
      {showAddressForm ? (
        <AddressForm 
          address={editingAddress} 
          onSave={handleSaveAddress} 
          onCancel={handleCancelAddressForm} 
        />
      ) : (
        <>
          <div className={styles.addressGrid}>
            {addresses.map(address => (
              <div 
                key={address.id} 
                className={`${styles.addressCard} ${address.isDefault ? styles.default : ''}`}
              >
                {address.isDefault && (
                  <div className={styles.defaultBadge}>Default</div>
                )}
                
                <div className={styles.addressType}>{address.type}</div>
                
                <div className={styles.addressDetails}>
                  <p>{address.firstName} {address.lastName}</p>
                  <p>{address.address1}</p>
                  {address.address2 && <p>{address.address2}</p>}
                  <p>{address.city}, {address.state} {address.postalCode}</p>
                  <p>{address.country}</p>
                  <p>{address.phone}</p>
                </div>
                
                <div className={styles.addressActions}>
                  <button 
                    className={styles.editAddressButton}
                    onClick={() => handleEditAddress(address)}
                  >
                    Edit
                  </button>
                  
                  {!address.isDefault && (
                    <>
                      <button 
                        className={styles.editAddressButton}
                        onClick={() => handleSetDefaultAddress(address.id)}
                      >
                        Set as Default
                      </button>
                      
                      <button 
                        className={styles.deleteAddressButton}
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className={styles.addAddressButton}
            onClick={handleAddAddress}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Address
          </button>
        </>
      )}
    </div>
  );
};

// Address Form Component
const AddressForm = ({ address, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: address?.type || 'Home',
    isDefault: address?.isDefault || false,
    firstName: address?.firstName || '',
    lastName: address?.lastName || '',
    address1: address?.address1 || '',
    address2: address?.address2 || '',
    city: address?.city || '',
    state: address?.state || '',
    postalCode: address?.postalCode || '',
    country: address?.country || 'United States',
    phone: address?.phone || ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.addressForm}>
      <h3>{address ? 'Edit Address' : 'Add New Address'}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="addressType">Address Type</label>
          <select 
            id="addressType" 
            name="type" 
            value={formData.type} 
            onChange={handleChange}
            required
          >
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className={styles.checkboxGroup}>
          <input 
            type="checkbox" 
            id="isDefault" 
            name="isDefault" 
            checked={formData.isDefault} 
            onChange={handleChange}
          />
          <label htmlFor="isDefault">Set as default address</label>
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName">First Name</label>
            <input 
              type="text" 
              id="firstName" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="lastName">Last Name</label>
            <input 
              type="text" 
              id="lastName" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="address1">Address Line 1</label>
          <input 
            type="text" 
            id="address1" 
            name="address1" 
            value={formData.address1} 
            onChange={handleChange}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="address2">Address Line 2 (Optional)</label>
          <input 
            type="text" 
            id="address2" 
            name="address2" 
            value={formData.address2} 
            onChange={handleChange}
          />
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="city">City</label>
            <input 
              type="text" 
              id="city" 
              name="city" 
              value={formData.city} 
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="state">State/Province</label>
            <input 
              type="text" 
              id="state" 
              name="state" 
              value={formData.state} 
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="postalCode">Postal Code</label>
            <input 
              type="text" 
              id="postalCode" 
              name="postalCode" 
              value={formData.postalCode} 
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="country">Country</label>
          <select 
            id="country" 
            name="country" 
            value={formData.country} 
            onChange={handleChange}
            required
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            {/* Add more countries as needed */}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <input 
            type="tel" 
            id="phone" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange}
            required
          />
        </div>
        
        <div className={styles.formActions}>
          <button type="submit" className={styles.saveButton}>
            Save Address
          </button>
          
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SavedAddresses;
