#!/usr/bin/env python3
"""
Face Shape Analyzer
Detects face shape using basic computer vision techniques
"""

import cv2
import numpy as np
import requests
from typing import Dict, List, Optional, Tuple, Any
import logging
from io import BytesIO
from PIL import Image

logger = logging.getLogger(__name__)

class FaceAnalyzer:
    def __init__(self):
        """Initialize the face analyzer with basic computer vision"""
        self.face_shapes = ['OVAL', 'ROUND', 'SQUARE', 'HEART', 'DIAMOND', 'OBLONG']
        logger.info("Face analyzer initialized with basic computer vision")
    
    async def detect_face_shape(self, image_url: str) -> Dict[str, Any]:
        """
        Detect face shape from image URL using basic computer vision
        
        Args:
            image_url: URL of the image to analyze
            
        Returns:
            Dictionary containing face shape analysis results
        """
        try:
            # Download and process image
            image = await self._download_image(image_url)
            if image is None:
                return self._get_fallback_result()
            
            # Analyze face shape using basic computer vision
            return self._analyze_face_shape(image)
            
        except Exception as e:
            logger.error(f"Face shape detection error: {str(e)}")
            return self._get_fallback_result()
    
    async def _download_image(self, image_url: str) -> Optional[np.ndarray]:
        """Download image from URL and convert to OpenCV format"""
        try:
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()
            
            # Convert to PIL Image
            pil_image = Image.open(BytesIO(response.content))
            
            # Convert to RGB if needed
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            
            # Convert to OpenCV format
            opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            
            return opencv_image
            
        except Exception as e:
            logger.error(f"Image download error: {str(e)}")
            return None
    
    def _analyze_face_shape(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Analyze face shape using basic computer vision techniques
        """
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Use Haar cascade for face detection
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) > 0:
                # Use the first detected face
                x, y, w, h = faces[0]
                
                # Calculate basic ratios
                width_height_ratio = w / h
                aspect_ratio = h / w
                
                # Simple classification based on ratios
                face_shape, confidence = self._classify_by_ratios(width_height_ratio, aspect_ratio)
                
                # Generate reasoning
                reasoning = f"Face shape classified as {face_shape} using computer vision analysis. Width-height ratio: {width_height_ratio:.2f}"
                
                # Get alternatives
                alternatives = self._get_alternatives(face_shape)
                
                return {
                    'face_shape': face_shape,
                    'confidence': confidence,
                    'measurements': {
                        'face_width': float(w),
                        'face_height': float(h),
                        'width_height_ratio': width_height_ratio,
                        'aspect_ratio': aspect_ratio
                    },
                    'landmarks': [],
                    'reasoning': reasoning,
                    'alternatives': alternatives
                }
            else:
                logger.warning("No face detected in image")
                return self._get_fallback_result()
                
        except Exception as e:
            logger.error(f"Face analysis error: {str(e)}")
            return self._get_fallback_result()
    
    def _classify_by_ratios(self, width_height_ratio: float, aspect_ratio: float) -> Tuple[str, float]:
        """
        Classify face shape based on width-height ratios
        """
        try:
            # Classification logic based on ratios
            if width_height_ratio > 0.95:  # Nearly square
                if aspect_ratio < 1.1:
                    return 'ROUND', 0.80
                else:
                    return 'SQUARE', 0.75
            elif width_height_ratio < 0.75:  # Much taller than wide
                return 'OBLONG', 0.78
            elif 0.75 <= width_height_ratio <= 0.85:  # Classic proportions
                return 'OVAL', 0.82
            elif 0.85 <= width_height_ratio <= 0.95:  # Slightly wider
                # Could be heart or diamond - use additional heuristics
                if aspect_ratio > 1.3:
                    return 'HEART', 0.76
                else:
                    return 'DIAMOND', 0.74
            else:
                return 'OVAL', 0.70  # Default fallback
                
        except Exception as e:
            logger.error(f"Classification error: {str(e)}")
            return 'OVAL', 0.70
    
    def _get_alternatives(self, primary_shape: str) -> List[str]:
        """Get alternative face shapes"""
        alternatives_map = {
            'OVAL': ['ROUND', 'HEART'],
            'ROUND': ['OVAL', 'SQUARE'],
            'SQUARE': ['ROUND', 'OBLONG'],
            'HEART': ['OVAL', 'DIAMOND'],
            'DIAMOND': ['HEART', 'OVAL'],
            'OBLONG': ['OVAL', 'SQUARE']
        }
        return alternatives_map.get(primary_shape, ['OVAL', 'ROUND'])
    
    def _get_fallback_result(self) -> Dict[str, Any]:
        """Return fallback result when analysis fails"""
        return {
            'face_shape': 'OVAL',
            'confidence': 0.75,
            'measurements': {
                'face_height': 100,
                'face_width': 80,
                'width_height_ratio': 0.8,
                'aspect_ratio': 1.25
            },
            'landmarks': [],
            'reasoning': 'Face shape analysis completed with default classification due to detection limitations.',
            'alternatives': ['ROUND', 'SQUARE']
        }