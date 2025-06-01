import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import AdminLayout from '../../../../components/AdminLayout';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  LinkedIn as LinkedInIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Telegram as TelegramIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

// Channel icons mapping
const channelIcons = {
  email: <EmailIcon />,
  whatsapp: <WhatsAppIcon />,
  linkedin: <LinkedInIcon />,
  facebook: <FacebookIcon />,
  instagram: <InstagramIcon />,
  telegram: <TelegramIcon />
};

// Status color mapping
const statusColors = {
  draft: 'default',
  scheduled: 'primary',
  in_progress: 'info',
  paused: 'warning',
  stopped: 'error',
  completed: 'success'
};

export default function CampaignDetails() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [scheduleOptions, setScheduleOptions] = useState({
    frequency: 'daily',
    startDate: new Date().toISOString().split('T')[0],
    hour: 9,
    minute: 0,
    batchSize: 50
  });
  const [messageData, setMessageData] = useState({
    channel: '',
    subject: '',
    template: ''
  });
  const [recipients, setRecipients] = useState([]);
  const [recipientsPage, setRecipientsPage] = useState(0);
  const [recipientsRowsPerPage, setRecipientsRowsPerPage] = useState(10);
  const [recipientsTotalCount, setRecipientsTotalCount] = useState(0);

  // Fetch campaign on load
  useEffect(() => {
    if (status === 'authenticated' && id) {
      fetchCampaign();
      fetchRecipients();
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
      // TODO: Show error notification
    } finally {
      setLoading(false);
    }
  };

  // Fetch campaign recipients
  const fetchRecipients = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', recipientsPage + 1);
      params.append('limit', recipientsRowsPerPage);

      const response = await fetch(`/api/outreach/campaigns/${id}/recipients?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch recipients');
      }

      const data = await response.json();
      setRecipients(data.recipients);
      setRecipientsTotalCount(data.pagination.totalCount);
    } catch (error) {
      console.error('Error fetching recipients:', error);
      // TODO: Show error notification
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle menu open
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle schedule dialog open
  const handleOpenScheduleDialog = () => {
    handleMenuClose();
    setOpenScheduleDialog(true);
  };

  // Handle schedule dialog close
  const handleCloseScheduleDialog = () => {
    setOpenScheduleDialog(false);
  };

  // Handle message dialog open
  const handleOpenMessageDialog = (channel = '') => {
    setMessageData({
      channel,
      subject: '',
      template: ''
    });
    setOpenMessageDialog(true);
  };

  // Handle message dialog close
  const handleCloseMessageDialog = () => {
    setOpenMessageDialog(false);
  };

  // Handle delete dialog open
  const handleOpenDeleteDialog = () => {
    handleMenuClose();
    setOpenDeleteDialog(true);
  };

  // Handle delete dialog close
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  // Handle schedule options change
  const handleScheduleOptionsChange = (event) => {
    const { name, value } = event.target;
    setScheduleOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle message data change
  const handleMessageDataChange = (event) => {
    const { name, value } = event.target;
    setMessageData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle schedule campaign
  const handleScheduleCampaign = async () => {
    try {
      const response = await fetch(`/api/outreach/campaigns/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'schedule',
          scheduleOptions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule campaign');
      }

      // Close dialog and refresh campaign
      handleCloseScheduleDialog();
      fetchCampaign();

      // TODO: Show success notification
    } catch (error) {
      console.error('Error scheduling campaign:', error);
      // TODO: Show error notification
    }
  };

  // Handle execute campaign
  const handleExecuteCampaign = async () => {
    try {
      handleMenuClose();

      const response = await fetch(`/api/outreach/campaigns/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'execute'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to execute campaign');
      }

      // Refresh campaign
      fetchCampaign();

      // TODO: Show success notification
    } catch (error) {
      console.error('Error executing campaign:', error);
      // TODO: Show error notification
    }
  };

  // Handle pause campaign
  const handlePauseCampaign = async () => {
    try {
      handleMenuClose();

      const response = await fetch(`/api/outreach/campaigns/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'pause'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to pause campaign');
      }

      // Refresh campaign
      fetchCampaign();

      // TODO: Show success notification
    } catch (error) {
      console.error('Error pausing campaign:', error);
      // TODO: Show error notification
    }
  };

  // Handle resume campaign
  const handleResumeCampaign = async () => {
    try {
      handleMenuClose();

      const response = await fetch(`/api/outreach/campaigns/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'resume'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to resume campaign');
      }

      // Refresh campaign
      fetchCampaign();

      // TODO: Show success notification
    } catch (error) {
      console.error('Error resuming campaign:', error);
      // TODO: Show error notification
    }
  };

  // Handle stop campaign
  const handleStopCampaign = async () => {
    try {
      handleMenuClose();

      const response = await fetch(`/api/outreach/campaigns/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'stop'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to stop campaign');
      }

      // Refresh campaign
      fetchCampaign();

      // TODO: Show success notification
    } catch (error) {
      console.error('Error stopping campaign:', error);
      // TODO: Show error notification
    }
  };

  // Handle delete campaign
  const handleDeleteCampaign = async () => {
    try {
      const response = await fetch(`/api/outreach/campaigns/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete campaign');
      }

      // Close dialog and navigate back to campaigns list
      handleCloseDeleteDialog();
      router.push('/admin/outreach');

      // TODO: Show success notification
    } catch (error) {
      console.error('Error deleting campaign:', error);
      // TODO: Show error notification
    }
  };

  // Handle create message
  const handleCreateMessage = async () => {
    try {
      // Validate form
      if (!messageData.channel || !messageData.template) {
        // TODO: Show validation error
        return;
      }

      const response = await fetch(`/api/outreach/campaigns/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error('Failed to create message');
      }

      // Close dialog and refresh campaign
      handleCloseMessageDialog();
      fetchCampaign();

      // TODO: Show success notification
    } catch (error) {
      console.error('Error creating message:', error);
      // TODO: Show error notification
    }
  };

  // Handle recipients page change
  const handleRecipientsPageChange = (event, newPage) => {
    setRecipientsPage(newPage);
  };

  // Handle recipients rows per page change
  const handleRecipientsRowsPerPageChange = (event) => {
    setRecipientsRowsPerPage(parseInt(event.target.value, 10));
    setRecipientsPage(0);
  };

  // Effect to fetch recipients when page or rows per page changes
  useEffect(() => {
    if (id) {
      fetchRecipients();
    }
  }, [id, recipientsPage, recipientsRowsPerPage]);

  // Available channels
  const availableChannels = [
    { value: 'email', label: 'Email' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'telegram', label: 'Telegram' }
  ];

  // Get channels that don't have a message yet
  const getAvailableChannelsForNewMessage = () => {
    if (!campaign || !campaign.messages) return availableChannels;

    const usedChannels = campaign.messages.map(message => message.channel);
    return availableChannels.filter(channel => !usedChannels.includes(channel.value));
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!campaign || !campaign.recipientStats) return 0;

    const { total, sent, failed } = campaign.recipientStats;
    if (total === 0) return 0;

    return Math.round(((sent + failed) / total) * 100);
  };

  return (
    <AdminLayout title={campaign ? `Campaign: ${campaign.name}` : 'Campaign Details'}>
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
                  <IconButton onClick={() => router.push('/admin/outreach')}>
                    <ArrowBackIcon />
                  </IconButton>
                </Grid>
                <Grid item xs>
                  <Typography variant="h4" component="h1">
                    {campaign.name}
                  </Typography>
                </Grid>
                <Grid item>
                  <Chip
                    label={campaign.status}
                    color={statusColors[campaign.status] || 'default'}
                  />
                </Grid>
                <Grid item>
                  <IconButton onClick={handleMenuOpen}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={handleMenuClose}
                  >
                    {campaign.status === 'draft' && (
                      <MenuItem onClick={handleOpenScheduleDialog}>
                        <ScheduleIcon sx={{ mr: 1 }} /> Schedule
                      </MenuItem>
                    )}
                    {campaign.status === 'draft' && (
                      <MenuItem onClick={handleExecuteCampaign}>
                        <PlayIcon sx={{ mr: 1 }} /> Execute Now
                      </MenuItem>
                    )}
                    {campaign.status === 'scheduled' && (
                      <MenuItem onClick={handleExecuteCampaign}>
                        <PlayIcon sx={{ mr: 1 }} /> Execute Now
                      </MenuItem>
                    )}
                    {campaign.status === 'in_progress' && (
                      <MenuItem onClick={handlePauseCampaign}>
                        <PauseIcon sx={{ mr: 1 }} /> Pause
                      </MenuItem>
                    )}
                    {campaign.status === 'paused' && (
                      <MenuItem onClick={handleResumeCampaign}>
                        <PlayIcon sx={{ mr: 1 }} /> Resume
                      </MenuItem>
                    )}
                    {(campaign.status === 'scheduled' || campaign.status === 'in_progress' || campaign.status === 'paused') && (
                      <MenuItem onClick={handleStopCampaign}>
                        <StopIcon sx={{ mr: 1 }} /> Stop
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={handleOpenDeleteDialog}>
                      <DeleteIcon sx={{ mr: 1 }} /> Delete
                    </MenuItem>
                  </Menu>
                </Grid>
              </Grid>

              {campaign.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  {campaign.description}
                </Typography>
              )}

              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                {campaign.channels && JSON.parse(campaign.channels).map(channel => (
                  <Chip
                    key={channel}
                    icon={channelIcons[channel]}
                    label={channel}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recipients
                    </Typography>
                    <Typography variant="h4">
                      {campaign.recipientStats?.total || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Sent
                    </Typography>
                    <Typography variant="h4">
                      {campaign.recipientStats?.sent || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Failed
                    </Typography>
                    <Typography variant="h4">
                      {campaign.recipientStats?.failed || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Pending
                    </Typography>
                    <Typography variant="h4">
                      {campaign.recipientStats?.pending || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {(campaign.status === 'in_progress' || campaign.status === 'paused') && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" gutterBottom>
                  Progress: {calculateProgress()}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress()}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            )}

            <Box sx={{ mb: 4 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Messages" />
                <Tab label="Recipients" />
                <Tab label="Analytics" />
              </Tabs>
              <Divider />

              {/* Messages Tab */}
              {activeTab === 0 && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Campaign Messages</Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenMessageDialog()}
                      disabled={getAvailableChannelsForNewMessage().length === 0}
                    >
                      Add Message
                    </Button>
                  </Box>

                  {campaign.messages && campaign.messages.length === 0 ? (
                    <Alert severity="info">
                      No messages have been created for this campaign yet. Add messages for each channel you want to use.
                    </Alert>
                  ) : (
                    <Grid container spacing={3}>
                      {campaign.messages && campaign.messages.map(message => (
                        <Grid item xs={12} md={6} key={message.id}>
                          <Card>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                {channelIcons[message.channel]}
                                <Typography variant="h6" sx={{ ml: 1 }}>
                                  {message.channel.charAt(0).toUpperCase() + message.channel.slice(1)}
                                </Typography>
                              </Box>

                              {message.channel === 'email' && (
                                <Typography variant="subtitle1" gutterBottom>
                                  Subject: {message.subject}
                                </Typography>
                              )}

                              <Typography variant="body2" color="text.secondary">
                                {message.template.length > 200
                                  ? message.template.substring(0, 200) + '...'
                                  : message.template}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}

              {/* Recipients Tab */}
              {activeTab === 1 && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Campaign Recipients</Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => router.push(`/admin/outreach/campaigns/${id}/recipients/add`)}
                    >
                      Add Recipients
                    </Button>
                  </Box>

                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Platform</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Added</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recipients.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              No recipients found
                            </TableCell>
                          </TableRow>
                        ) : (
                          recipients.map(recipient => (
                            <TableRow key={recipient.id}>
                              <TableCell>{recipient.name || 'N/A'}</TableCell>
                              <TableCell>{recipient.email || 'N/A'}</TableCell>
                              <TableCell>{recipient.phone || 'N/A'}</TableCell>
                              <TableCell>
                                {recipient.platform ? `${recipient.platform} (${recipient.platform_id})` : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={recipient.status}
                                  color={
                                    recipient.status === 'sent' ? 'success' :
                                      recipient.status === 'failed' ? 'error' :
                                        'default'
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {new Date(recipient.added_at).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    <TablePagination
                      rowsPerPageOptions={[10, 25, 50, 100]}
                      component="div"
                      count={recipientsTotalCount}
                      rowsPerPage={recipientsRowsPerPage}
                      page={recipientsPage}
                      onPageChange={handleRecipientsPageChange}
                      onRowsPerPageChange={handleRecipientsRowsPerPageChange}
                    />
                  </TableContainer>
                </Box>
              )}

              {/* Analytics Tab */}
              {activeTab === 2 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Campaign Analytics
                  </Typography>

                  <Alert severity="info" sx={{ mb: 2 }}>
                    Detailed analytics will be available once the campaign has started sending messages.
                  </Alert>

                  {/* Analytics content will go here */}
                </Box>
              )}
            </Box>
          </>
        )}

        {/* Schedule Dialog */}
        <Dialog open={openScheduleDialog} onClose={handleCloseScheduleDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Schedule Campaign</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="frequency-label">Frequency</InputLabel>
                <Select
                  labelId="frequency-label"
                  name="frequency"
                  value={scheduleOptions.frequency}
                  onChange={handleScheduleOptionsChange}
                  label="Frequency"
                >
                  <MenuItem value="once">One time</MenuItem>
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={scheduleOptions.startDate}
                onChange={handleScheduleOptionsChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Hour"
                    name="hour"
                    type="number"
                    value={scheduleOptions.hour}
                    onChange={handleScheduleOptionsChange}
                    margin="normal"
                    inputProps={{ min: 0, max: 23 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Minute"
                    name="minute"
                    type="number"
                    value={scheduleOptions.minute}
                    onChange={handleScheduleOptionsChange}
                    margin="normal"
                    inputProps={{ min: 0, max: 59 }}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Batch Size"
                name="batchSize"
                type="number"
                value={scheduleOptions.batchSize}
                onChange={handleScheduleOptionsChange}
                margin="normal"
                helperText="Number of recipients to process in each batch"
                inputProps={{ min: 1, max: 1000 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseScheduleDialog}>Cancel</Button>
            <Button onClick={handleScheduleCampaign} variant="contained" color="primary">
              Schedule
            </Button>
          </DialogActions>
        </Dialog>

        {/* Message Dialog */}
        <Dialog open={openMessageDialog} onClose={handleCloseMessageDialog} maxWidth="md" fullWidth>
          <DialogTitle>Add Campaign Message</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="message-channel-label">Channel</InputLabel>
                <Select
                  labelId="message-channel-label"
                  name="channel"
                  value={messageData.channel}
                  onChange={handleMessageDataChange}
                  label="Channel"
                >
                  {getAvailableChannelsForNewMessage().map(channel => (
                    <MenuItem key={channel.value} value={channel.value}>
                      {channel.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {messageData.channel === 'email' && (
                <TextField
                  fullWidth
                  label="Subject"
                  name="subject"
                  value={messageData.subject}
                  onChange={handleMessageDataChange}
                  margin="normal"
                  required
                />
              )}

              <TextField
                fullWidth
                label="Message Template"
                name="template"
                value={messageData.template}
                onChange={handleMessageDataChange}
                margin="normal"
                multiline
                rows={10}
                required
                helperText="You can use variables like {{recipient.name}}, {{recipient.email}}, etc."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMessageDialog}>Cancel</Button>
            <Button
              onClick={handleCreateMessage}
              variant="contained"
              color="primary"
              disabled={!messageData.channel || !messageData.template || (messageData.channel === 'email' && !messageData.subject)}
            >
              Add Message
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Delete Campaign</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button onClick={handleDeleteCampaign} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
}
