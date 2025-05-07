import React, { useState, useEffect } from 'react';
import styles from '../../styles/InventoryManagement.module.css';

export default function InventoryManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    description: ''
  });

  // Mock categories
  const categories = [
    'iPhone Parts',
    'Samsung Parts',
    'iPad Parts',
    'MacBook Parts',
    'Repair Tools',
    'Accessories'
  ];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // In a real app, this would be an API call
        // For now, using mock data
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

        const mockProducts = [
          {
            id: 1,
            name: 'iPhone 13 Pro LCD Screen',
            sku: 'IP13P-LCD',
            category: 'iPhone Parts',
            price: 89.99,
            cost: 45.00,
            stock: 24,
            low_stock_threshold: 5,
            description: 'Replacement LCD screen for iPhone 13 Pro',
            created_at: '2023-01-15T10:30:00Z',
            updated_at: '2023-06-20T14:45:00Z'
          },
          {
            id: 2,
            name: 'Samsung Galaxy S22 Battery',
            sku: 'SG22-BAT',
            category: 'Samsung Parts',
            price: 39.99,
            cost: 18.50,
            stock: 42,
            low_stock_threshold: 10,
            description: 'Replacement battery for Samsung Galaxy S22',
            created_at: '2023-02-10T09:15:00Z',
            updated_at: '2023-06-18T11:20:00Z'
          },
          {
            id: 3,
            name: 'iPad Pro 12.9" LCD Assembly',
            sku: 'IPP129-LCD',
            category: 'iPad Parts',
            price: 199.99,
            cost: 110.00,
            stock: 8,
            low_stock_threshold: 3,
            description: 'Replacement LCD assembly for iPad Pro 12.9"',
            created_at: '2023-03-05T13:45:00Z',
            updated_at: '2023-06-15T16:30:00Z'
          },
          {
            id: 4,
            name: 'MacBook Pro Retina Display 13"',
            sku: 'MBP13-DISP',
            category: 'MacBook Parts',
            price: 299.99,
            cost: 180.00,
            stock: 5,
            low_stock_threshold: 2,
            description: 'Replacement Retina display for 13" MacBook Pro',
            created_at: '2023-03-20T11:30:00Z',
            updated_at: '2023-06-10T09:15:00Z'
          },
          {
            id: 5,
            name: 'Professional Repair Tool Kit',
            sku: 'TOOL-KIT-PRO',
            category: 'Repair Tools',
            price: 129.99,
            cost: 65.00,
            stock: 18,
            low_stock_threshold: 5,
            description: 'Professional toolkit for mobile device repair',
            created_at: '2023-04-12T15:20:00Z',
            updated_at: '2023-06-05T10:45:00Z'
          },
          {
            id: 6,
            name: 'iPhone 12 Battery',
            sku: 'IP12-BAT',
            category: 'iPhone Parts',
            price: 29.99,
            cost: 12.50,
            stock: 35,
            low_stock_threshold: 10,
            description: 'Replacement battery for iPhone 12',
            created_at: '2023-05-08T14:10:00Z',
            updated_at: '2023-06-01T13:25:00Z'
          }
        ];

        setProducts(mockProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      // Filter by search term
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by category
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort by selected field
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'sku') {
        comparison = a.sku.localeCompare(b.sku);
      } else if (sortBy === 'price') {
        comparison = a.price - b.price;
      } else if (sortBy === 'stock') {
        comparison = a.stock - b.stock;
      }

      // Apply sort order
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Handle bulk selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(filteredProducts.map(product => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (e, productId) => {
    if (e.target.checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  // Handle bulk actions
  const handleBulkAction = () => {
    if (!bulkAction || selectedProducts.length === 0) return;

    // In a real app, this would call an API
    alert(`Performing ${bulkAction} on ${selectedProducts.length} products`);

    // Reset selection
    setSelectedProducts([]);
    setBulkAction('');
  };

  // Handle new product form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };

  const handleAddProduct = (e) => {
    e.preventDefault();

    // In a real app, this would call an API
    const newProductWithId = {
      ...newProduct,
      id: products.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      low_stock_threshold: 5
    };

    setProducts([...products, newProductWithId]);
    setShowAddModal(false);
    setNewProduct({
      name: '',
      sku: '',
      category: '',
      price: '',
      cost: '',
      stock: '',
      description: ''
    });
  };

  // File input reference
  const fileInputRef = React.useRef(null);

  // Handle import/export
  const handleImport = () => {
    // Trigger file input click
    fileInputRef.current.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const fileType = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileType)) {
      alert('Please upload a CSV or Excel file');
      e.target.value = null;
      return;
    }

    // Create a FormData object
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);
    formData.append('importType', 'inventory');

    // Show loading state
    setLoading(true);

    try {
      // In a real app, this would be an API call to upload the file
      // For demo purposes, we'll simulate processing the file
      // Processing file

      // Simulate reading the file
      const reader = new FileReader();

      // Create a promise to handle the file reading
      const fileContents = await new Promise((resolve, reject) => {
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);

        if (fileType === 'csv') {
          reader.readAsText(file);
        } else {
          // For Excel files, we'd use a library like SheetJS in a real app
          // Here we'll just simulate it
          reader.readAsArrayBuffer(file);
        }
      });

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Log file processing (in a real app, we'd parse the CSV/Excel data)
      // File processed

      // Generate mock products based on the file type and name
      let importedProducts = [];

      if (fileType === 'csv') {
        // Simulate parsing CSV data
        importedProducts = [
          {
            id: products.length + 1,
            name: 'iPhone 15 Pro Max Screen Assembly',
            sku: 'CSV-IP15PM-SCRN',
            category: 'iPhone Parts',
            price: 189.99,
            cost: 110.00,
            stock: 12,
            low_stock_threshold: 4,
            description: 'Premium quality iPhone 15 Pro Max screen assembly with True Tone support',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: products.length + 2,
            name: 'iPhone 15 Battery Replacement',
            sku: 'CSV-IP15-BAT',
            category: 'iPhone Parts',
            price: 49.99,
            cost: 25.00,
            stock: 28,
            low_stock_threshold: 8,
            description: 'High capacity replacement battery for iPhone 15',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: products.length + 3,
            name: 'Samsung Galaxy S24 Ultra Back Glass',
            sku: 'CSV-S24U-BACK',
            category: 'Samsung Parts',
            price: 39.99,
            cost: 18.50,
            stock: 15,
            low_stock_threshold: 5,
            description: 'Original quality back glass for Samsung Galaxy S24 Ultra',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
      } else {
        // Simulate parsing Excel data
        importedProducts = [
          {
            id: products.length + 1,
            name: 'iPad Air 5 LCD Assembly',
            sku: 'XLS-IPAD-AIR5',
            category: 'iPad Parts',
            price: 149.99,
            cost: 85.00,
            stock: 8,
            low_stock_threshold: 3,
            description: 'Complete LCD assembly for iPad Air 5th generation',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: products.length + 2,
            name: 'MacBook Pro M2 Trackpad',
            sku: 'XLS-MBP-M2-TP',
            category: 'MacBook Parts',
            price: 89.99,
            cost: 45.00,
            stock: 6,
            low_stock_threshold: 2,
            description: 'Replacement trackpad for MacBook Pro M2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: products.length + 3,
            name: 'Heat Gun for Phone Repair',
            sku: 'XLS-HEAT-GUN',
            category: 'Repair Tools',
            price: 59.99,
            cost: 32.00,
            stock: 10,
            low_stock_threshold: 3,
            description: 'Professional heat gun for phone screen removal and repair',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: products.length + 4,
            name: 'Precision Screwdriver Set (24pcs)',
            sku: 'XLS-SCREWDRIVER-24',
            category: 'Repair Tools',
            price: 29.99,
            cost: 14.50,
            stock: 20,
            low_stock_threshold: 5,
            description: '24-piece precision screwdriver set for electronics repair',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
      }

      // Update products state
      setProducts([...products, ...importedProducts]);

      // Show success message with details
      alert(`Successfully imported ${importedProducts.length} products from ${file.name}`);

    } catch (error) {
      // Error processing file
      alert(`Error processing file: ${error.message}`);
    } finally {
      setLoading(false);
      // Reset file input
      e.target.value = null;
    }
  };

  const handleExport = () => {
    // Generate CSV content
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Price', 'Cost', 'Stock', 'Description'];
    const csvContent = [
      headers.join(','),
      ...products.map(product => [
        product.id,
        `"${product.name}"`,
        product.sku,
        `"${product.category}"`,
        product.price,
        product.cost,
        product.stock,
        `"${product.description}"`
      ].join(','))
    ].join('\n');

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle sync with external platforms
  const handleSync = async (platform) => {
    // Show loading state
    setLoading(true);

    try {
      // In a real implementation, this would be an API call to your backend
      // which would then use the platform's API to sync inventory

      // For demonstration purposes, we'll simulate the API call
      const platformConfig = {
        '4seller': {
          apiUrl: 'https://api.4seller.com/v2/inventory',
          apiKey: process.env.NEXT_PUBLIC_4SELLER_API_KEY || 'demo-key',
          accountId: process.env.NEXT_PUBLIC_4SELLER_ACCOUNT_ID || 'demo-account'
        },
        'ebay': {
          apiUrl: 'https://api.ebay.com/sell/inventory/v1/inventory_item',
          apiKey: process.env.NEXT_PUBLIC_EBAY_API_KEY || 'demo-key',
          accountId: process.env.NEXT_PUBLIC_EBAY_ACCOUNT_ID || 'demo-account'
        },
        'amazon': {
          apiUrl: 'https://sellingpartnerapi-na.amazon.com/listings/2021-08-01/items',
          apiKey: process.env.NEXT_PUBLIC_AMAZON_API_KEY || 'demo-key',
          accountId: process.env.NEXT_PUBLIC_AMAZON_SELLER_ID || 'demo-account'
        },
        'tiktok': {
          apiUrl: 'https://open-api.tiktokglobalshop.com/api/products/products',
          apiKey: process.env.NEXT_PUBLIC_TIKTOK_API_KEY || 'demo-key',
          accountId: process.env.NEXT_PUBLIC_TIKTOK_SHOP_ID || 'demo-account'
        }
      };

      // Get the configuration for the selected platform
      const config = platformConfig[platform];

      if (!config) {
        throw new Error(`Platform ${platform} is not supported`);
      }

      // Log the sync attempt (in a real app, this would be a fetch call to your backend)
      // Syncing with platform

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock products based on the platform (in a real app, these would come from the API)
      let platformProducts = [];

      if (platform === '4seller') {
        platformProducts = [
          {
            id: products.length + 1,
            name: 'iPhone 14 Pro Screen Assembly',
            sku: '4S-IP14PRO-SCRN',
            category: 'iPhone Parts',
            price: 149.99,
            cost: 85.00,
            stock: 18,
            low_stock_threshold: 5,
            description: 'Premium quality iPhone 14 Pro screen assembly with True Tone support',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: products.length + 2,
            name: 'iPhone 13 Battery Original',
            sku: '4S-IP13-BAT-OEM',
            category: 'iPhone Parts',
            price: 39.99,
            cost: 22.50,
            stock: 24,
            low_stock_threshold: 8,
            description: 'Original capacity iPhone 13 battery replacement',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
      } else if (platform === 'ebay') {
        platformProducts = [
          {
            id: products.length + 1,
            name: 'Samsung Galaxy S23 OLED Screen',
            sku: 'EB-S23-OLED',
            category: 'Samsung Parts',
            price: 129.99,
            cost: 72.50,
            stock: 12,
            low_stock_threshold: 4,
            description: 'Original quality Samsung Galaxy S23 OLED screen replacement',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: products.length + 2,
            name: 'Samsung Galaxy Z Flip 4 Hinge Assembly',
            sku: 'EB-ZFLIP4-HINGE',
            category: 'Samsung Parts',
            price: 89.99,
            cost: 45.00,
            stock: 6,
            low_stock_threshold: 2,
            description: 'Replacement hinge assembly for Samsung Galaxy Z Flip 4',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
      } else if (platform === 'amazon') {
        platformProducts = [
          {
            id: products.length + 1,
            name: 'iPad Pro 11" (2022) LCD Assembly',
            sku: 'AMZ-IPADPRO11-22',
            category: 'iPad Parts',
            price: 189.99,
            cost: 105.00,
            stock: 8,
            low_stock_threshold: 3,
            description: 'Complete LCD assembly for iPad Pro 11" (2022 model)',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: products.length + 2,
            name: 'MacBook Air M2 Keyboard Replacement',
            sku: 'AMZ-MBA-M2-KB',
            category: 'MacBook Parts',
            price: 149.99,
            cost: 85.00,
            stock: 5,
            low_stock_threshold: 2,
            description: 'Replacement keyboard for MacBook Air M2 (2022)',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
      } else if (platform === 'tiktok') {
        platformProducts = [
          {
            id: products.length + 1,
            name: 'Professional Phone Repair Tool Kit (80pcs)',
            sku: 'TT-TOOL-KIT-80',
            category: 'Repair Tools',
            price: 79.99,
            cost: 42.00,
            stock: 15,
            low_stock_threshold: 5,
            description: '80-piece professional phone repair tool kit with magnetic screwdrivers',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: products.length + 2,
            name: 'Phone Screen Separator Machine',
            sku: 'TT-SCREEN-SEP',
            category: 'Repair Tools',
            price: 199.99,
            cost: 120.00,
            stock: 4,
            low_stock_threshold: 2,
            description: 'Professional LCD screen separator machine for phone repair',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
      }

      // Update products state with the new products
      setProducts([...products, ...platformProducts]);

      // Show success message
      alert(`Successfully synced ${platformProducts.length} products from ${platform}`);

    } catch (error) {
      // Error syncing with platform
      alert(`Failed to sync with ${platform}. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading inventory data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className={styles.inventoryManagement}>
      <div className={styles.sectionHeader}>
        <h2>Inventory Management</h2>
        <p className={styles.sectionDescription}>
          Manage your product inventory, sync with external systems, and track stock levels.
        </p>
      </div>

      <div className={styles.inventoryActions}>
        <div className={styles.inventoryFilters}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.filterBox}>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className={styles.sortBox}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="sku">Sort by SKU</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
            </select>

            <button
              className={styles.sortOrderButton}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className={styles.inventoryButtons}>
          <button
            className={styles.addButton}
            onClick={() => setShowAddModal(true)}
          >
            Add Product
          </button>

          <button
            className={styles.importButton}
            onClick={handleImport}
          >
            Import
          </button>

          <button
            className={styles.exportButton}
            onClick={handleExport}
          >
            Export
          </button>
        </div>
      </div>

      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
      />

      <div className={styles.syncPlatformsContainer}>
        <h3 className={styles.syncPlatformsTitle}>Sync with External Platforms</h3>
        <div className={styles.syncPlatformsButtons}>
          <button className={styles.platformButton} onClick={() => handleSync('4seller')}>
            <img src="/images/integrations/4seller-logo.png" alt="4seller" width="20" height="20" onError={(e) => e.target.src = '/images/placeholder.svg'} />
            4seller.com
          </button>
          <button className={styles.platformButton} onClick={() => handleSync('ebay')}>
            <img src="/images/integrations/ebay-logo.png" alt="eBay" width="20" height="20" onError={(e) => e.target.src = '/images/placeholder.svg'} />
            eBay
          </button>
          <button className={styles.platformButton} onClick={() => handleSync('amazon')}>
            <img src="/images/integrations/amazon-logo.png" alt="Amazon" width="20" height="20" onError={(e) => e.target.src = '/images/placeholder.svg'} />
            Amazon
          </button>
          <button className={styles.platformButton} onClick={() => handleSync('tiktok')}>
            <img src="/images/integrations/tiktok-logo.png" alt="TikTok Shop" width="20" height="20" onError={(e) => e.target.src = '/images/placeholder.svg'} />
            TikTok Shop
          </button>
        </div>
      </div>

      <table className={styles.inventoryTable}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th>Product</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan="8" className={styles.noResults}>
                No products found. Try adjusting your filters.
              </td>
            </tr>
          ) : (
            filteredProducts.map(product => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => handleSelectProduct(e, product.id)}
                  />
                </td>
                <td>
                  <div className={styles.productCell}>
                    <div className={styles.productImage}>
                      <img src={`/images/products/${product.sku.toLowerCase()}.jpg`} alt={product.name} onError={(e) => e.target.src = '/images/placeholder.svg'} />
                    </div>
                    <div className={styles.productName}>{product.name}</div>
                  </div>
                </td>
                <td>{product.sku}</td>
                <td>{product.category}</td>
                <td>${product.price.toFixed(2)}</td>
                <td className={product.stock <= product.low_stock_threshold ? styles.lowStock : ''}>
                  {product.stock}
                </td>
                <td>
                  <span className={`${styles.status} ${product.stock > 0 ? styles.inStock : styles.outOfStock}`}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={styles.editButton}>Edit</button>
                    <button className={styles.deleteButton}>Delete</button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selectedProducts.length > 0 && (
        <div className={styles.bulkActionBar}>
          <span>{selectedProducts.length} items selected</span>
          <div className={styles.bulkActionControls}>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className={styles.bulkActionSelect}
            >
              <option value="">Bulk Actions</option>
              <option value="delete">Delete</option>
              <option value="update-stock">Update Stock</option>
              <option value="update-price">Update Price</option>
              <option value="export-selected">Export Selected</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className={styles.bulkActionButton}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add New Product</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>

            <div className={styles.modalBody}>
              <form onSubmit={handleAddProduct}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="name">Product Name</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    id="name"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.formLabel} htmlFor="sku">SKU</label>
                    <input
                      className={styles.formInput}
                      type="text"
                      id="sku"
                      name="sku"
                      value={newProduct.sku}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.formLabel} htmlFor="category">Category</label>
                    <select
                      className={styles.formSelect}
                      id="category"
                      name="category"
                      value={newProduct.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.formLabel} htmlFor="price">Price ($)</label>
                    <input
                      className={styles.formInput}
                      type="number"
                      id="price"
                      name="price"
                      min="0"
                      step="0.01"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.formLabel} htmlFor="cost">Cost ($)</label>
                    <input
                      className={styles.formInput}
                      type="number"
                      id="cost"
                      name="cost"
                      min="0"
                      step="0.01"
                      value={newProduct.cost}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.formLabel} htmlFor="stock">Stock</label>
                    <input
                      className={styles.formInput}
                      type="number"
                      id="stock"
                      name="stock"
                      min="0"
                      value={newProduct.stock}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="description">Description</label>
                  <textarea
                    className={styles.formTextarea}
                    id="description"
                    name="description"
                    rows="3"
                    value={newProduct.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
