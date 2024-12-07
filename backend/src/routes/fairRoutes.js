const express = require('express');
const {
    getFairs, createFair, createFairRequest,
    assignGuide, getAvailableGuides, approveFair, cancelFair, unassignGuide
} = require('../controllers/fairController');

const router = express.Router();

router.get('/', getFairs);
router.post('/createFair', createFair);
router.post('/fair-requests', createFairRequest);
router.put('/:id/assign', assignGuide);
router.get('/available-guides', getAvailableGuides);
router.put('/:id/approve', approveFair);
router.put('/:id/cancel', cancelFair);
router.put("/:id/unassign", unassignGuide);


module.exports = router;
