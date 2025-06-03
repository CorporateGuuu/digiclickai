const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateContact } = require('../middleware/enhancedValidation');
const {
  submitContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  getContactStats,
  getHighPriorityContacts,
  getFollowUpContacts
} = require('../controllers/contactController');

// Public routes
router.post('/', validateContact, submitContact);

// Protected routes (Admin only)
router.use(protect, authorize('admin'));

router
  .route('/')
  .get(getContacts);

router
  .route('/:id')
  .get(getContact)
  .patch(updateContact)
  .delete(deleteContact);

router.get('/stats/overview', getContactStats);
router.get('/priority/high', getHighPriorityContacts);
router.get('/follow-up/due', getFollowUpContacts);

module.exports = router;
