import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// EXAMPLE ROUTES FOR TEAMMATES - Copy these patterns for your features

// ===== SHELTER MANAGEMENT EXAMPLES =====
// All authenticated users can view shelters
router.get('/shelters', protect, (req, res) => {
    res.json({ message: 'All shelters - accessible to all authenticated users' });
});

// Only admins can create/update shelters
router.post('/shelters', protect, authorize('admin'), (req, res) => {
    res.json({ message: 'Create shelter - Admin only' });
});

// ===== AID REQUEST SYSTEM EXAMPLES =====
// Victims can create aid requests
router.post('/aid-requests', protect, authorize('victim'), (req, res) => {
    res.json({ message: 'Create aid request - Victims only' });
});

// Volunteers and trusted volunteers can view aid requests
router.get('/aid-requests', protect, authorize('volunteer', 'trusted_volunteer'), (req, res) => {
    res.json({ message: 'View aid requests - Volunteers and Trusted Volunteers' });
});

// Trusted volunteers can verify deliveries
router.put('/aid-requests/:id/verify', protect, authorize('trusted_volunteer'), (req, res) => {
    res.json({ message: 'Verify delivery - Trusted Volunteers only' });
});

// ===== ADMIN DASHBOARD EXAMPLES =====
// Admin only routes
router.get('/admin/analytics', protect, authorize('admin'), (req, res) => {
    res.json({ message: 'Admin analytics - Admin only' });
});

// Admin can verify users (promote to trusted_volunteer)
router.put('/admin/users/:userId/verify', protect, authorize('admin'), (req, res) => {
    res.json({ message: 'Verify user - Admin only' });
});

// ===== VOLUNTEER COORDINATION EXAMPLES =====
// Volunteers can sign up for tasks
router.post('/volunteer/tasks', protect, authorize('volunteer', 'trusted_volunteer'), (req, res) => {
    res.json({ message: 'Sign up for task - Volunteers and Trusted Volunteers' });
});

// Trusted volunteers can assign tasks
router.put('/volunteer/tasks/:id/assign', protect, authorize('trusted_volunteer'), (req, res) => {
    res.json({ message: 'Assign task - Trusted Volunteers only' });
});

// ===== GENERAL ACCESS EXAMPLES =====
// Multiple roles can access
router.get('/general-info', protect, authorize('victim', 'volunteer', 'trusted_volunteer', 'admin'), (req, res) => {
    res.json({ message: 'General info - All authenticated users' });
});

// Higher role access (admin and trusted_volunteer)
router.get('/premium-features', protect, authorize('trusted_volunteer', 'admin'), (req, res) => {
    res.json({ message: 'Premium features - Trusted Volunteers and Admins' });
});

export default router;
