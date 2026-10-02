/**
 * simulation.js — Routes for Market Simulation control
 */

import express from 'express';
import { simulationService } from '../services/simulationService.js';

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ success: true, data: simulationService.getStatus() });
});

router.post('/toggle', (req, res) => {
  const isRunning = simulationService.toggle();
  res.json({
    success: true,
    message: `Market simulation turned ${isRunning ? 'ON' : 'OFF'}`,
    data: simulationService.getStatus()
  });
});

router.post('/start', (req, res) => {
  simulationService.start();
  res.json({ success: true, message: 'Market simulation started', data: simulationService.getStatus() });
});

router.post('/stop', (req, res) => {
  simulationService.stop();
  res.json({ success: true, message: 'Market simulation stopped', data: simulationService.getStatus() });
});

export default router;
