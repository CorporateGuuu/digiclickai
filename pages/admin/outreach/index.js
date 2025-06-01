import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import AdminLayout from '../../../components/AdminLayout';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  LinkedIn as LinkedInIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Telegram as TelegramIcon
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

export default function OutreachDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    channels: []
  });

  // Fetch campaigns on load and when filters change
  useEffect(() => {
    if (status === 'authenticated') {
      fetchCampaigns();
    }
  }, [status, page, search, statusFilter]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/admin/outreach');
    }
  }, [status, router]);

  // Fetch campaigns from API
  const fetchCampaigns = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 12);

      if (search) {
        params.append('search', search);
      }

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      // Fetch campaigns
      const response = await fetch(`/api/outreach/campaigns?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const data = await response.json();

      setCampaigns(data.campaigns);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      // TODO: Show error notification
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1); // Reset to first page when search changes
  };

  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  // Handle create dialog open
  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  // Handle create dialog close
  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setNewCampaign({
      name: '',
      description: '',
      channels: []
    });
  };

  // Handle new campaign input change
  const handleNewCampaignChange = (event) => {
    const { name, value } = event.target;
    setNewCampaign(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle channels selection change
  const handleChannelsChange = (event) => {
    const { value } = event.target;
    setNewCampaign(prev => ({
      ...prev,
      channels: value
    }));
  };

  // Handle create campaign
  const handleCreateCampaign = async () => {
    try {
      // Validate form
      if (!newCampaign.name || newCampaign.channels.length === 0) {
        // TODO: Show validation error
        return;
      }

      // Create campaign
      const response = await fetch('/api/outreach/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCampaign)
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      const data = await response.json();

      // Close dialog and refresh campaigns
      handleCloseCreateDialog();
      fetchCampaigns();

      // Navigate to the new campaign
      router.push(`/admin/outreach/campaigns/${data.campaign.id}`);
    } catch (error) {
      console.error('Error creating campaign:', error);
      // TODO: Show error notification
    }
  };

  // Handle view campaign
  const handleViewCampaign = (campaignId) => {
    router.push(`/admin/outreach/campaigns/${campaignId}`);
  };

  // Available channels
  const availableChannels = [
    { value: 'email', label: 'Email' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'telegram', label: 'Telegram' }
  ];

  return (
    <AdminLayout title="Outreach Dashboard">
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h4" component="h1" gutterBottom>
                Outreach Campaigns
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
              >
                Create Campaign
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search campaigns..."
                value={search}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status"
                  displayEmpty
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                  <MenuItem value="stopped">Stopped</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            {loading ? (
              <Grid item xs={12}>
                <Typography align="center">Loading campaigns...</Typography>
              </Grid>
            ) : campaigns.length === 0 ? (
              <Grid item xs={12}>
                <Typography align="center">
                  {search || statusFilter ? 'No campaigns match your filters' : 'No campaigns found. Create your first campaign!'}
                </Typography>
              </Grid>
            ) : (
              campaigns.map(campaign => (
                <Grid item xs={12} sm={6} md={4} key={campaign.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" component="h2" noWrap>
                          {campaign.name}
                        </Typography>
                        <Chip
                          label={campaign.status}
                          color={statusColors[campaign.status] || 'default'}
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {campaign.description || 'No description'}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        {campaign.channels && JSON.parse(campaign.channels).map(channel => (
                          <Chip
                            key={channel}
                            icon={channelIcons[channel]}
                            label={channel}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>

                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Recipients
                          </Typography>
                          <Typography variant="body2">
                            {campaign.total_recipients || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Sent
                          </Typography>
                          <Typography variant="body2">
                            {campaign.sent_count || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Created
                          </Typography>
                          <Typography variant="body2">
                            {new Date(campaign.created_at).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => handleViewCampaign(campaign.id)}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}

        {/* Create Campaign Dialog */}
        <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Campaign Name"
                name="name"
                value={newCampaign.name}
                onChange={handleNewCampaignChange}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Description"
                name="description"
                value={newCampaign.description}
                onChange={handleNewCampaignChange}
                margin="normal"
                multiline
                rows={3}
              />

              <FormControl fullWidth margin="normal" required>
                <InputLabel id="channels-label">Channels</InputLabel>
                <Select
                  labelId="channels-label"
                  multiple
                  value={newCampaign.channels}
                  onChange={handleChannelsChange}
                  input={<OutlinedInput label="Channels" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          icon={channelIcons[value]}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {availableChannels.map((channel) => (
                    <MenuItem key={channel.value} value={channel.value}>
                      <Checkbox checked={newCampaign.channels.indexOf(channel.value) > -1} />
                      <ListItemText primary={channel.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateDialog}>Cancel</Button>
            <Button
              onClick={handleCreateCampaign}
              variant="contained"
              color="primary"
              disabled={!newCampaign.name || newCampaign.channels.length === 0}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
}
