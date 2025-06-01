import React from 'react';
import { useState } from 'react';
import styles from './InventoryImport.module.css';

const InventoryImport = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [importSource, setImportSource] = useState('4seller');
  const [mappingFields, setMappingFields] = useState({
    sku: 'sku',
    name: 'title',
    description: 'description',
    price: 'price',
    stock: 'quantity',
    category: 'category',
    brand: 'brand',
    images: 'image_url'
  });
  const [previewData, setPreviewData] = useState(null);
  const [step, setStep] = useState(1);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadResult(null);
    
    // If a CSV file is selected, show a preview
    if (selectedFile && selectedFile.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvText = event.target.result;
        const preview = parseCSVPreview(csvText);
        setPreviewData(preview);
      };
      reader.readAsText(selectedFile);
    }
  };

  const parseCSVPreview = (csvText) => {
    const lines = csvText.split('\n');
    if (lines.length < 2) return null;
    
    const headers = lines[0].split(',').map(header => header.trim());
    const firstRow = lines[1].split(',').map(cell => cell.trim());
    
    const preview = {
      headers,
      sample: firstRow,
      totalRows: lines.length - 1
    };
    
    return preview;
  };

  const handleMappingChange = (field, value) => {
    setMappingFields({
      ...mappingFields,
      [field]: value
    });
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source', importSource);
    formData.append('mapping', JSON.stringify(mappingFields));
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);
      
      const response = await fetch('/api/admin/import-inventory', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      setUploadResult(result);
      setStep(3); // Move to confirmation step
    } catch (error) {
      console.error('Error uploading inventory:', error);
      setUploadResult({
        success: false,
        message: error.message || 'Failed to upload inventory data'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && file) {
      setStep(2);
    } else if (step === 2) {
      handleUpload();
    } else if (step === 3) {
      // Reset the form
      setFile(null);
      setPreviewData(null);
      setUploadResult(null);
      setStep(1);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className={styles.importContainer}>
      <div className={styles.importHeader}>
        <h2>Import Inventory</h2>
        <p>Import your inventory data from 4seller.com or other sources</p>
      </div>
      
      <div className={styles.stepIndicator}>
        <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepLabel}>Upload File</div>
        </div>
        <div className={styles.stepConnector}></div>
        <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepLabel}>Map Fields</div>
        </div>
        <div className={styles.stepConnector}></div>
        <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepLabel}>Confirmation</div>
        </div>
      </div>
      
      <div className={styles.importContent}>
        {step === 1 && (
          <div className={styles.uploadStep}>
            <div className={styles.sourceSelector}>
              <h3>Select Import Source</h3>
              <div className={styles.sourceOptions}>
                <label className={`${styles.sourceOption} ${importSource === '4seller' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="importSource"
                    value="4seller"
                    checked={importSource === '4seller'}
                    onChange={() => setImportSource('4seller')}
                  />
                  <div className={styles.sourceIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    </svg>
                  </div>
                  <div className={styles.sourceInfo}>
                    <h4>4seller.com</h4>
                    <p>Import inventory from 4seller.com exported CSV</p>
                  </div>
                </label>
                
                <label className={`${styles.sourceOption} ${importSource === 'csv' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="importSource"
                    value="csv"
                    checked={importSource === 'csv'}
                    onChange={() => setImportSource('csv')}
                  />
                  <div className={styles.sourceIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <div className={styles.sourceInfo}>
                    <h4>Generic CSV</h4>
                    <p>Import from any CSV file with custom field mapping</p>
                  </div>
                </label>
                
                <label className={`${styles.sourceOption} ${importSource === 'excel' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="importSource"
                    value="excel"
                    checked={importSource === 'excel'}
                    onChange={() => setImportSource('excel')}
                  />
                  <div className={styles.sourceIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <div className={styles.sourceInfo}>
                    <h4>Excel Spreadsheet</h4>
                    <p>Import from Excel (.xlsx) file with custom field mapping</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className={styles.fileUpload}>
              <h3>Upload File</h3>
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  id="inventory-file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
                <label htmlFor="inventory-file" className={styles.fileLabel}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>{file ? file.name : 'Choose a file or drag it here'}</span>
                </label>
                <p className={styles.fileHint}>
                  Supported formats: CSV, Excel (.xlsx, .xls)
                </p>
              </div>
            </div>
            
            {previewData && (
              <div className={styles.filePreview}>
                <h3>File Preview</h3>
                <p>Found {previewData.totalRows} products in the file</p>
                <div className={styles.previewTable}>
                  <div className={styles.previewHeader}>
                    {previewData.headers.map((header, index) => (
                      <div key={index} className={styles.previewCell}>{header}</div>
                    ))}
                  </div>
                  <div className={styles.previewRow}>
                    {previewData.sample.map((cell, index) => (
                      <div key={index} className={styles.previewCell}>{cell}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {step === 2 && (
          <div className={styles.mappingStep}>
            <h3>Map Fields</h3>
            <p>Match the fields from your file to our system fields</p>
            
            {previewData && (
              <div className={styles.mappingTable}>
                <div className={styles.mappingHeader}>
                  <div className={styles.mappingField}>System Field</div>
                  <div className={styles.mappingSource}>Source Field</div>
                  <div className={styles.mappingPreview}>Preview</div>
                </div>
                
                {Object.entries(mappingFields).map(([field, sourceField], index) => {
                  const sourceIndex = previewData.headers.findIndex(h => h.toLowerCase() === sourceField.toLowerCase());
                  const previewValue = sourceIndex !== -1 ? previewData.sample[sourceIndex] : '';
                  
                  return (
                    <div key={field} className={styles.mappingRow}>
                      <div className={styles.mappingField}>
                        <label htmlFor={`field-${field}`}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                      </div>
                      <div className={styles.mappingSource}>
                        <select
                          id={`field-${field}`}
                          value={sourceField}
                          onChange={(e) => handleMappingChange(field, e.target.value)}
                        >
                          <option value="">-- Not Mapped --</option>
                          {previewData.headers.map((header, i) => (
                            <option key={i} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.mappingPreview}>
                        {previewValue || '-'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {step === 3 && (
          <div className={styles.confirmationStep}>
            {isUploading ? (
              <div className={styles.uploadProgress}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className={styles.progressText}>
                  Uploading... {uploadProgress}%
                </div>
              </div>
            ) : uploadResult ? (
              <div className={`${styles.uploadResult} ${uploadResult.success ? styles.success : styles.error}`}>
                <div className={styles.resultIcon}>
                  {uploadResult.success ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  )}
                </div>
                <h3>{uploadResult.success ? 'Import Successful' : 'Import Failed'}</h3>
                <p>{uploadResult.message}</p>
                
                {uploadResult.success && uploadResult.stats && (
                  <div className={styles.importStats}>
                    <div className={styles.statItem}>
                      <div className={styles.statLabel}>Products Imported</div>
                      <div className={styles.statValue}>{uploadResult.stats.imported}</div>
                    </div>
                    <div className={styles.statItem}>
                      <div className={styles.statLabel}>Products Updated</div>
                      <div className={styles.statValue}>{uploadResult.stats.updated}</div>
                    </div>
                    <div className={styles.statItem}>
                      <div className={styles.statLabel}>Products Skipped</div>
                      <div className={styles.statValue}>{uploadResult.stats.skipped}</div>
                    </div>
                    <div className={styles.statItem}>
                      <div className={styles.statLabel}>Errors</div>
                      <div className={styles.statValue}>{uploadResult.stats.errors}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.confirmationMessage}>
                <h3>Ready to Import</h3>
                <p>Please confirm to start importing your inventory data</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className={styles.importActions}>
        {step > 1 && (
          <button 
            className={styles.backButton}
            onClick={handlePreviousStep}
            disabled={isUploading}
          >
            Back
          </button>
        )}
        
        <button 
          className={styles.nextButton}
          onClick={handleNextStep}
          disabled={
            (step === 1 && !file) || 
            isUploading || 
            (step === 3 && !uploadResult)
          }
        >
          {step === 1 ? 'Next' : step === 2 ? 'Import' : 'Done'}
        </button>
      </div>
    </div>
  );
};

export default InventoryImport;
