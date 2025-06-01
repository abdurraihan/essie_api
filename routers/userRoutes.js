
import express from 'express';
import {
  submitContact,
  submitLikes,
  getLikes,
  sendLikedPolishesEmail,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/contact', submitContact);
router.post('/likes', submitLikes);
router.get('/likes/:email', getLikes);
router.post('/send-liked-email', sendLikedPolishesEmail);

export default router;

