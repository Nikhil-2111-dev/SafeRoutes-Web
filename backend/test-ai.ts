import dotenv from 'dotenv';
dotenv.config();

import { AIService } from './src/services/ai.service';
import fs from 'fs';

async function test() {
  try {
    const aiService = new AIService();
    // A tiny 1x1 pixel base64 image
    const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const result = await aiService.analyzeIncidentImage(base64Image, 'image/png');
    console.log("SUCCESS:", result);
  } catch (error) {
    console.error("FAILED:", error);
  }
}

test();
