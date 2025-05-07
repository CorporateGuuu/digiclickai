import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import AdminLayout from '../../../../../../components/AdminLayout';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

export default function AddRecipients() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [manualRecipients, setManualRecipients] = useState([
    { name: '', email: '', phone: '', platform: '', platformId: '' }
  ]);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvMapping, setCsvMapping] = useState({
    name: '',
    email: '',
    phone: '',
    platform: '',
    platformId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch campaign on load
  useEffect(() => {
    if (status === 'authenticated' && id) {
      fetchCampaign();
    }
  }, [status, id]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/admin/outreach');
    }
  }, [status, router]);

  // Fetch campaign from API
  const fetchCampaign = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/outreach/campaigns/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch campaign');
      }

      const data = await response.json();
      setCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      showSnackbar('Failed to fetch campaign details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle manual recipient change
  const handleManualRecipientChange = (index, field, value) => {
    const updatedRecipients = [...manualRecipients];
    updatedRecipients[index] = {
      ...updatedRecipients[index],
      [field]: value
    };
    setManualRecipients(updatedRecipients);
  };

  // Handle add manual recipient
  const handleAddManualRecipient = () => {
    setManualRecipients([
      ...manualRecipients,
      { name: '', email: '', phone: '', platform: '', platformId: '' }
    ]);
  };

  // Handle remove manual recipient
  const handleRemoveManualRecipient = (index) => {
    if (manualRecipients.length === 1) {
      // Don't remove the last one, just clear it
      setManualRecipients([
        { name: '', email: '', phone: '', platform: '', platformId: '' }
      ]);
      return;
    }

    const updatedRecipients = manualRecipients.filter((_, i) => i !== index);
    setManualRecipients(updatedRecipients);
  };

  // Handle CSV file upload
  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setCsvFile(file);

    // Parse CSV for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split('\\n');

      if (lines.length < 2) {
        showSnackbar('CSV file must contain at least a header row and one data row', 'error');
        return;
      }

      // Parse headers
      const headers = lines[0].split(',').map(header => header.trim());
      setCsvHeaders(headers);

      // Set default mappings if headers match expected fields
      const defaultMapping = {};
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('name')) defaultMapping.name = header;
        if (lowerHeader.includes('email')) defaultMapping.email = header;
        if (lowerHeader.includes('phone')) defaultMapping.phone = header;
        if (lowerHeader.includes('platform')) defaultMapping.platform = header;
        if (lowerHeader.includes('platform_id') || lowerHeader.includes('platformid')) defaultMapping.platformId = header;
      });
      setCsvMapping(defaultMapping);

      // Parse preview data (up to 5 rows)
      const previewData = [];
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        if (lines[i].trim() === '') continue;

        const values = lines[i].split(',').map(value => value.trim());
        const row = {};

        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        previewData.push(row);
      }

      setCsvPreview(previewData);
    };

    reader.readAsText(file);
  };

  // Handle CSV mapping change
  const handleCsvMappingChange = (field, value) => {
    setCsvMapping({
      ...csvMapping,
      [field]: value
    });
  };

  // Handle submit manual recipients
  const handleSubmitManualRecipients = async () => {
    try {
      // Validate recipients
      const validRecipients = manualRecipients.filter(recipient =>
        recipient.name || recipient.email || recipient.phone || (recipient.platform && recipient.platformId)
      );

      if (validRecipients.length === 0) {
        showSnackbar('Please add at least one recipient with valid information', 'error');
        return;
      }

      setSubmitting(true);

      // Submit recipients
      const response = await fetch(`/api/outreach/campaigns/${id}/recipients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipients: validRecipients
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add recipients');
      }

      showSnackbar(`Successfully added ${validRecipients.length} recipients`, 'success');

      // Clear form
      setManualRecipients([
        { name: '', email: '', phone: '', platform: '', platformId: '' }
      ]);

      // Navigate back to campaign
      setTimeout(() => {
        router.push(`/admin/outreach/campaigns/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Error adding recipients:', error);
      showSnackbar('Failed to add recipients', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle submit CSV recipients
  const handleSubmitCsvRecipients = async () => {
    try {
      if (!csvFile) {
        showSnackbar('Please upload a CSV file', 'error');
        return;
      }

      // Validate mapping
      if (!csvMapping.name && !csvMapping.email && !csvMapping.phone &&
        !(csvMapping.platform && csvMapping.platformId)) {
        showSnackbar('Please map at least one identification field (name, email, phone, or platform with platformId)', 'error');
        return;
      }

      setSubmitting(true);

      // Parse entire CSV file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          const lines = content.split('\\n');

          // Parse headers
          const headers = lines[0].split(',').map(header => header.trim());

          // Parse all data rows
          const recipients = [];
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;

            const values = lines[i].split(',').map(value => value.trim());
            const recipient = {
              name: '',
              email: '',
              phone: '',
              platform: '',
              platformId: ''
            };

            // Map values based on mapping
            Object.keys(csvMapping).forEach(field => {
              if (csvMapping[field]) {
                const headerIndex = headers.indexOf(csvMapping[field]);
                if (headerIndex !== -1) {
                  recipient[field] = values[headerIndex] || '';
                }
              }
            });

            // Only add if at least one identification field is present
            if (recipient.name || recipient.email || recipient.phone ||
              (recipient.platform && recipient.platformId)) {
              recipients.push(recipient);
            }
          }

          if (recipients.length === 0) {
            showSnackbar('No valid recipients found in CSV file', 'error');
            setSubmitting(false);
            return;
          }

          // Submit recipients
          const response = await fetch(`/api/outreach/campaigns/${id}/recipients`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              recipients
            })
          });

          if (!response.ok) {
            throw new Error('Failed to add recipients');
          }

          showSnackbar(`Successfully added ${recipients.length} recipients from CSV`, 'success');

          // Clear form
          setCsvFile(null);
          setCsvPreview([]);
          setCsvHeaders([]);
          setCsvMapping({
            name: '',
            email: '',
            phone: '',
            platform: '',
            platformId: ''
          });

          // Reset file input
          const fileInput = document.getElementById('csv-file-input');
          if (fileInput) fileInput.value = '';

          // Navigate back to campaign
          setTimeout(() => {
            router.push(`/admin/outreach/campaigns/${id}`);
          }, 1500);
        } catch (error) {
          console.error('Error processing CSV:', error);
          showSnackbar('Failed to process CSV file', 'error');
          setSubmitting(false);
        }
      };

      reader.readAsText(csvFile);
    } catch (error) {
      console.error('Error adding recipients from CSV:', error);
      showSnackbar('Failed to add recipients from CSV', 'error');
      setSubmitting(false);
    }
  };

  // Show snackbar
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <AdminLayout title={campaign ? `Add Recipients: ${campaign.name}` : 'Add Recipients'}>
      <Container maxWidth="xl">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <Typography>Loading campaign...</Typography>
          </Box>
        ) : !campaign ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <Typography>Campaign not found</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <IconButton onClick={() => router.push(`/admin/outreach/campaigns/${id}`)}>
                    <ArrowBackIcon />
                  </IconButton>
                </Grid>
                <Grid item xs>
                  <Typography variant="h4" component="h1">
                    Add Recipients
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Campaign: {campaign.name}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Manual Entry" />
                <Tab label="CSV Upload" />
              </Tabs>
              <Divider />

              {/* Manual Entry Tab */}
              {activeTab === 0 && (
                <Box sx={{ mt: 3 }}>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Add recipients manually by filling in their details. At least one of name, email, phone, or platform with platform ID is required.
                  </Alert>

                  <Paper sx={{ p: 3, mb: 3 }}>
                    {manualRecipients.map((recipient, index) => (
                      <Grid container spacing={2} key={index} sx={{ mb: index < manualRecipients.length - 1 ? 3 : 0 }}>
                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            fullWidth
                            label="Name"
                            value={recipient.name}
                            onChange={(e) => handleManualRecipientChange(index, 'name', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={recipient.email}
                            onChange={(e) => handleManualRecipientChange(index, 'email', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <TextField
                            fullWidth
                            label="Phone"
                            value={recipient.phone}
                            onChange={(e) => handleManualRecipientChange(index, 'phone', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <TextField
                            fullWidth
                            label="Platform"
                            value={recipient.platform}
                            onChange={(e) => handleManualRecipientChange(index, 'platform', e.target.value)}
                            helperText="e.g. linkedin, facebook"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <TextField
                            fullWidth
                            label="Platform ID"
                            value={recipient.platformId}
                            onChange={(e) => handleManualRecipientChange(index, 'platformId', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1} sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveManualRecipient(index)}
                            aria-label="Remove recipient"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>

                        {index < manualRecipients.length - 1 && (
                          <Grid item xs={12}>
                            <Divider />
                          </Grid>
                        )}
                      </Grid>
                    ))}
                  </Paper>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddManualRecipient}
                    >
                      Add Another Recipient
                    </Button>

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmitManualRecipients}
                      disabled={submitting}
                    >
                      {submitting ? <CircularProgress size={24} /> : 'Add Recipients'}
                    </Button>
                  </Box>
                </Box>
              )}

              {/* CSV Upload Tab */}
              {activeTab === 1 && (
                <Box sx={{ mt: 3 }}>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Upload a CSV file with recipient information. The first row should contain headers.
                  </Alert>

                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                      >
                        Upload CSV File
                        <input
                          id="csv-file-input"
                          type="file"
                          accept=".csv"
                          hidden
                          onChange={handleCsvUpload}
                        />
                      </Button>
                      {csvFile && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Selected file: {csvFile.name}
                        </Typography>
                      )}
                    </Box>

                    {csvHeaders.length > 0 && (
                      <>
                        <Typography variant="h6" gutterBottom>
                          Map CSV Columns
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              select
                              label="Name Column"
                              value={csvMapping.name}
                              onChange={(e) => handleCsvMappingChange('name', e.target.value)}
                              SelectProps={{
                                native: true
                              }}
                            >
                              <option value="">Not mapped</option>
                              {csvHeaders.map(header => (
                                <option key={header} value={header}>{header}</option>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              select
                              label="Email Column"
                              value={csvMapping.email}
                              onChange={(e) => handleCsvMappingChange('email', e.target.value)}
                              SelectProps={{
                                native: true
                              }}
                            >
                              <option value="">Not mapped</option>
                              {csvHeaders.map(header => (
                                <option key={header} value={header}>{header}</option>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              select
                              label="Phone Column"
                              value={csvMapping.phone}
                              onChange={(e) => handleCsvMappingChange('phone', e.target.value)}
                              SelectProps={{
                                native: true
                              }}
                            >
                              <option value="">Not mapped</option>
                              {csvHeaders.map(header => (
                                <option key={header} value={header}>{header}</option>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              select
                              label="Platform Column"
                              value={csvMapping.platform}
                              onChange={(e) => handleCsvMappingChange('platform', e.target.value)}
                              SelectProps={{
                                native: true
                              }}
                            >
                              <option value="">Not mapped</option>
                              {csvHeaders.map(header => (
                                <option key={header} value={header}>{header}</option>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              select
                              label="Platform ID Column"
                              value={csvMapping.platformId}
                              onChange={(e) => handleCsvMappingChange('platformId', e.target.value)}
                              SelectProps={{
                                native: true
                              }}
                            >
                              <option value="">Not mapped</option>
                              {csvHeaders.map(header => (
                                <option key={header} value={header}>{header}</option>
                              ))}
                            </TextField>
                          </Grid>
                        </Grid>

                        <Typography variant="h6" gutterBottom>
                          Preview
                        </Typography>

                        <TableContainer component={Paper} sx={{ mb: 3 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                {csvHeaders.map(header => (
                                  <TableCell key={header}>{header}</TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {csvPreview.map((row, index) => (
                                <TableRow key={index}>
                                  {csvHeaders.map(header => (
                                    <TableCell key={header}>{row[header]}</TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmitCsvRecipients}
                            disabled={submitting}
                          >
                            {submitting ? <CircularProgress size={24} /> : 'Import Recipients'}
                          </Button>
                        </Box>
                      </>
                    )}
                  </Paper>
                </Box>
              )}
            </Box>
          </>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={snackbar.message}
          severity={snackbar.severity}
        />
      </Container>
    </AdminLayout>
  );
}
