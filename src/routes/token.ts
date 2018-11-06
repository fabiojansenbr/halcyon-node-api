import express from 'express';
import * as tokenController from '../controllers/tokenController';
const router = express.Router();

router.post('/', tokenController.getToken);

export default router;
