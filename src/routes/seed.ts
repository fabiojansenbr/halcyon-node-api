import express from 'express';
import * as seedController from '../controllers/seedController';
const router = express.Router();

router.get('/', seedController.seedData);

export default router;
