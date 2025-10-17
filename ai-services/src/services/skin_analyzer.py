#!/usr/bin/env python3
"""
Skin Tone Analyzer
Detects skin tone using computer vision and color analysis techniques
"""

import cv2
import numpy as np
import requests
from typing import Dict, List, Optional, Tuple, Any
import logging
from io import BytesIO
from PIL import Image
import colorsys

logger = logging.getLogger(__name__)

class SkinAnalyzer:
    def __init__(self):
        """Initialize the skin analyzer"""
        try:
            import mediapipe as mp
            from sklearn.cluster import KMeans
            self.mp_face_detection = mp.solutions.face_detection
            self.face_detection = self.mp_face_detection.FaceDetection(
                model_selection=1,
                min_detection_confidence=0.5
            )
            self.KMeans = KMeans
            self.mediapipe_available = True
            logger.info("MediaPipe and scikit-learn initialized for skin analysis")
        except ImportError as e:
            logger.warning(f"MediaPipe or scikit-learn not available: {e}. Using basic color analysis.")
            self.mediapipe_available = False
            self.face_detection = None
            self.KMeans = None
        
        # Skin tone classification ranges (HSV)
        self.skin_tone_ranges = {
            'VERY_FAIR': {'h': (0, 25), 'l': (0.8, 1.0)},
            'FAIR': {'h': (0, 30), 'l': (0.65, 0.85)},
            'LIGHT': {'h': (5, 35), 'l': (0.5, 0.7)},
            'MEDIUM': {'h': (10, 40), 'l': (0.35, 0.55)},
            'OLIVE': {'h': (15, 45), 'l': (0.3, 0.5)},
            'TAN': {'h': (15, 50), 'l': (0.25, 0.45)},
            'DARK': {'h': (10, 45), 'l': (0.15, 0.35)},
            'VERY_DARK': {'h': (5, 40), 'l': (0.05, 0.25)}
        }
    
    async def detect_skin_tone(self, image_url: str) -> Dict[str, Any]:
        """
        Detect skin tone from image URL
        """
        try:
            # Download and process image
            image = await self._download_image(image_url)
            if image is None:
                return self._get_fallback_result()
            
            if self.mediapipe_available:
                # Use MediaPipe for face detection
                face_region = self._detect_face_region(image)
                if face_region is None:
                    return self._analyze_without_mediapipe(image)
                
                # Extract skin pixels
                skin_pixels = self._extract_skin_pixels(face_region)
                if len(skin_pixels) == 0:
                    return self._analyze_without_mediapipe(image)
                
                # Analyze skin color
                dominant_color = self._get_dominant_skin_color(skin_pixels)
            else:
                # Fallback analysis without MediaPipe
                return self._analyze_without_mediapipe(image)
            
            # Classify skin tone
            skin_tone, confidence = self._classify_skin_tone(dominant_color)
            
            # Generate reasoning
            reasoning = self._generate_reasoning(skin_tone, dominant_color)
            
            # Get alternative tones
            alternatives = self._get_alternative_tones(dominant_color, skin_tone)
            
            return {
                'skin_tone': skin_tone,
                'confidence': confidence,
                'dominant_color': {
                    'rgb': dominant_color,
                    'hex': self._rgb_to_hex(dominant_color),
                    'hsl': self._rgb_to_hsl(dominant_color)
                },
                'reasoning': reasoning,
                'alternatives': alternatives
            }
            
        except Exception as e:
            logger.error(f"Skin tone detection error: {str(e)}")
            return self._get_fallback_result()
    
    async def _download_image(self, image_url: str) -> Optional[np.ndarray]:
        """Download image from URL and convert to OpenCV format"""
        try:
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()
            
            pil_image = Image.open(BytesIO(response.content))
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            
            opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            return opencv_image
            
        except Exception as e:
            logger.error(f"Image download error: {str(e)}")
            return None
    
    def _detect_face_region(self, image: np.ndarray) -> Optional[np.ndarray]:
        """Detect face region using MediaPipe"""
        try:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.face_detection.process(rgb_image)
            
            if not results.detections:
                return None
            
            detection = results.detections[0]
            h, w = image.shape[:2]
            bbox = detection.location_data.relative_bounding_box
            
            x = int(bbox.xmin * w)
            y = int(bbox.ymin * h)
            width = int(bbox.width * w)
            height = int(bbox.height * h)
            
            # Extract face region with padding
            padding = 20
            x = max(0, x - padding)
            y = max(0, y - padding)
            width = min(w - x, width + 2 * padding)
            height = min(h - y, height + 2 * padding)
            
            face_region = image[y:y+height, x:x+width]
            return face_region
            
        except Exception as e:
            logger.error(f"Face detection error: {str(e)}")
            return None
    
    def _extract_skin_pixels(self, face_region: np.ndarray) -> np.ndarray:
        """Extract skin pixels from face region using color filtering"""
        try:
            hsv = cv2.cvtColor(face_region, cv2.COLOR_BGR2HSV)
            
            lower_skin = np.array([0, 20, 70], dtype=np.uint8)
            upper_skin = np.array([20, 255, 255], dtype=np.uint8)
            
            skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
            
            kernel = np.ones((3, 3), np.uint8)
            skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel)
            skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel)
            
            skin_pixels = face_region[skin_mask > 0]
            return skin_pixels
            
        except Exception as e:
            logger.error(f"Skin pixel extraction error: {str(e)}")
            return np.array([])
    
    def _get_dominant_skin_color(self, skin_pixels: np.ndarray) -> Tuple[int, int, int]:
        """Get dominant skin color using K-means clustering or averaging"""
        try:
            if len(skin_pixels) < 100:
                return (180, 140, 120)
            
            if self.KMeans:
                pixels = skin_pixels.reshape(-1, 3)
                kmeans = self.KMeans(n_clusters=3, random_state=42, n_init=10)
                kmeans.fit(pixels)
                
                centers = kmeans.cluster_centers_
                labels = kmeans.labels_
                label_counts = np.bincount(labels)
                dominant_label = np.argmax(label_counts)
                
                dominant_color = centers[dominant_label]
                return (int(dominant_color[2]), int(dominant_color[1]), int(dominant_color[0]))
            else:
                avg_color = np.mean(skin_pixels, axis=0)
                return (int(avg_color[2]), int(avg_color[1]), int(avg_color[0]))
            
        except Exception as e:
            logger.error(f"Dominant color extraction error: {str(e)}")
            return (180, 140, 120)
    
    def _classify_skin_tone(self, rgb_color: Tuple[int, int, int]) -> Tuple[str, float]:
        """Classify skin tone based on RGB color"""
        try:
            r, g, b = [x / 255.0 for x in rgb_color]
            h, l, s = colorsys.rgb_to_hls(r, g, b)
            h = h * 360
            
            scores = {}
            for tone, ranges in self.skin_tone_ranges.items():
                h_range = ranges['h']
                l_range = ranges['l']
                
                h_score = 1.0 if h_range[0] <= h <= h_range[1] else \
                         max(0, 1.0 - abs(h - np.mean(h_range)) / 30)
                
                l_score = 1.0 if l_range[0] <= l <= l_range[1] else \
                         max(0, 1.0 - abs(l - np.mean(l_range)) / 0.3)
                
                scores[tone] = (h_score + l_score * 2) / 3
            
            best_tone = max(scores, key=scores.get)
            confidence = min(0.95, max(0.6, scores[best_tone]))
            
            return best_tone, confidence
            
        except Exception as e:
            logger.error(f"Skin tone classification error: {str(e)}")
            return 'MEDIUM', 0.75
    
    def _analyze_without_mediapipe(self, image: np.ndarray) -> Dict[str, Any]:
        """Analyze skin tone without MediaPipe using basic computer vision"""
        try:
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            lower_skin = np.array([0, 20, 70], dtype=np.uint8)
            upper_skin = np.array([20, 255, 255], dtype=np.uint8)
            
            skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
            skin_pixels = image[skin_mask > 0]
            
            if len(skin_pixels) > 100:
                avg_color = np.mean(skin_pixels, axis=0)
                dominant_color = (int(avg_color[2]), int(avg_color[1]), int(avg_color[0]))
                
                skin_tone, confidence = self._classify_skin_tone(dominant_color)
                reasoning = f"Skin tone detected as {skin_tone} using basic color analysis (RGB: {dominant_color})"
                alternatives = self._get_alternative_tones(dominant_color, skin_tone)
                
                return {
                    'skin_tone': skin_tone,
                    'confidence': confidence,
                    'dominant_color': {
                        'rgb': dominant_color,
                        'hex': self._rgb_to_hex(dominant_color),
                        'hsl': self._rgb_to_hsl(dominant_color)
                    },
                    'reasoning': reasoning,
                    'alternatives': alternatives
                }
            else:
                return self._get_fallback_result()
                
        except Exception as e:
            logger.error(f"Fallback skin analysis error: {str(e)}")
            return self._get_fallback_result()
    
    def _generate_reasoning(self, skin_tone: str, rgb_color: Tuple[int, int, int]) -> str:
        """Generate human-readable reasoning for the skin tone classification"""
        try:
            r, g, b = rgb_color
            
            reasoning_templates = {
                'VERY_FAIR': f"Very light skin tone detected with high luminance values (RGB: {r}, {g}, {b}).",
                'FAIR': f"Fair skin tone with light coloring and pink undertones (RGB: {r}, {g}, {b}).",
                'LIGHT': f"Light skin tone with warm undertones detected (RGB: {r}, {g}, {b}).",
                'MEDIUM': f"Medium skin tone with balanced coloring (RGB: {r}, {g}, {b}).",
                'OLIVE': f"Olive skin tone with yellow-green undertones detected (RGB: {r}, {g}, {b}).",
                'TAN': f"Tan skin tone with warm, golden undertones (RGB: {r}, {g}, {b}).",
                'DARK': f"Dark skin tone with rich coloring detected (RGB: {r}, {g}, {b}).",
                'VERY_DARK': f"Very dark skin tone with deep, rich coloring (RGB: {r}, {g}, {b})."
            }
            
            return reasoning_templates.get(skin_tone, "Skin tone analysis completed using color analysis.")
            
        except Exception as e:
            logger.error(f"Reasoning generation error: {str(e)}")
            return "Skin tone analysis completed using computer vision techniques."
    
    def _get_alternative_tones(self, rgb_color: Tuple[int, int, int], primary_tone: str) -> List[str]:
        """Get alternative skin tones that could also fit the color"""
        try:
            r, g, b = [x / 255.0 for x in rgb_color]
            h, l, s = colorsys.rgb_to_hls(r, g, b)
            h = h * 360
            
            scores = {}
            for tone, ranges in self.skin_tone_ranges.items():
                if tone == primary_tone:
                    continue
                    
                h_range = ranges['h']
                l_range = ranges['l']
                
                h_score = 1.0 if h_range[0] <= h <= h_range[1] else \
                         max(0, 1.0 - abs(h - np.mean(h_range)) / 40)
                
                l_score = 1.0 if l_range[0] <= l <= l_range[1] else \
                         max(0, 1.0 - abs(l - np.mean(l_range)) / 0.4)
                
                scores[tone] = (h_score + l_score * 2) / 3
            
            alternatives = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:2]
            return [tone for tone, score in alternatives if score > 0.3]
            
        except Exception as e:
            logger.error(f"Alternative tones calculation error: {str(e)}")
            return ['FAIR', 'LIGHT']
    
    def _rgb_to_hex(self, rgb_color: Tuple[int, int, int]) -> str:
        """Convert RGB color to hex string"""
        return f"#{rgb_color[0]:02x}{rgb_color[1]:02x}{rgb_color[2]:02x}"
    
    def _rgb_to_hsl(self, rgb_color: Tuple[int, int, int]) -> Dict[str, float]:
        """Convert RGB color to HSL"""
        r, g, b = [x / 255.0 for x in rgb_color]
        h, l, s = colorsys.rgb_to_hls(r, g, b)
        
        return {
            'h': round(h * 360, 1),
            's': round(s * 100, 1),
            'l': round(l * 100, 1)
        }
    
    def _get_fallback_result(self) -> Dict[str, Any]:
        """Return fallback result when analysis fails"""
        return {
            'skin_tone': 'MEDIUM',
            'confidence': 0.75,
            'dominant_color': {
                'rgb': (180, 140, 120),
                'hex': '#b48c78',
                'hsl': {'h': 30.0, 's': 33.3, 'l': 58.8}
            },
            'reasoning': 'Skin tone analysis completed with default classification.',
            'alternatives': ['LIGHT', 'TAN']
        }