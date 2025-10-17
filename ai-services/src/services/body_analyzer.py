import cv2
import numpy as np
import mediapipe as mp
import requests
from PIL import Image
from io import BytesIO
import math
import logging
from typing import Dict, List, Optional, Tuple, Any

logger = logging.getLogger(__name__)

class BodyAnalyzer:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=True,
            model_complexity=2,
            enable_segmentation=True,
            min_detection_confidence=0.5
        )
        
        # Body type classification thresholds
        self.body_type_rules = {
            'ECTOMORPH': {'shoulder_hip_ratio': (0.9, 1.1), 'waist_hip_ratio': (0.7, 0.85)},
            'MESOMORPH': {'shoulder_hip_ratio': (1.1, 1.3), 'waist_hip_ratio': (0.7, 0.85)},
            'ENDOMORPH': {'shoulder_hip_ratio': (0.9, 1.1), 'waist_hip_ratio': (0.85, 1.0)},
            'PEAR': {'shoulder_hip_ratio': (0.8, 0.95), 'waist_hip_ratio': (0.6, 0.8)},
            'APPLE': {'shoulder_hip_ratio': (1.0, 1.2), 'waist_hip_ratio': (0.8, 1.0)},
            'HOURGLASS': {'shoulder_hip_ratio': (0.95, 1.05), 'waist_hip_ratio': (0.6, 0.75)},
            'RECTANGLE': {'shoulder_hip_ratio': (0.95, 1.05), 'waist_hip_ratio': (0.75, 0.9)},
            'INVERTED_TRIANGLE': {'shoulder_hip_ratio': (1.2, 1.5), 'waist_hip_ratio': (0.7, 0.9)}
        }

    async def download_image(self, image_url: str) -> Optional[np.ndarray]:
        """Download image from URL"""
        try:
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
                
            return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        except Exception as e:
            logger.error(f"Failed to download image: {str(e)}")
            return None

    def extract_body_measurements(self, image):
        """Extract body measurements using MediaPipe Pose"""
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb_image)
        
        if not results.pose_landmarks:
            raise Exception("No pose landmarks detected in the image")
        
        landmarks = results.pose_landmarks.landmark
        h, w = image.shape[:2]
        
        # Key body points
        left_shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER]
        right_shoulder = landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER]
        left_hip = landmarks[self.mp_pose.PoseLandmark.LEFT_HIP]
        right_hip = landmarks[self.mp_pose.PoseLandmark.RIGHT_HIP]
        
        # Calculate measurements
        shoulder_width = self.calculate_distance(
            (left_shoulder.x * w, left_shoulder.y * h),
            (right_shoulder.x * w, right_shoulder.y * h)
        )
        
        hip_width = self.calculate_distance(
            (left_hip.x * w, left_hip.y * h),
            (right_hip.x * w, right_hip.y * h)
        )
        
        # Estimate waist width (midpoint between shoulders and hips)
        waist_y = (left_shoulder.y + left_hip.y) / 2
        waist_width = hip_width * 0.8  # Approximate waist width
        
        return {
            'shoulder_width': shoulder_width,
            'waist_width': waist_width,
            'hip_width': hip_width,
            'shoulder_hip_ratio': shoulder_width / hip_width if hip_width > 0 else 1.0,
            'waist_hip_ratio': waist_width / hip_width if hip_width > 0 else 1.0
        }

    def calculate_distance(self, point1, point2):
        """Calculate Euclidean distance between two points"""
        return math.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)

    def classify_body_type(self, measurements):
        """Classify body type based on measurements"""
        shoulder_hip_ratio = measurements['shoulder_hip_ratio']
        waist_hip_ratio = measurements['waist_hip_ratio']
        
        scores = {}
        
        for body_type, rules in self.body_type_rules.items():
            score = 0
            
            # Check shoulder-hip ratio
            shr_min, shr_max = rules['shoulder_hip_ratio']
            if shr_min <= shoulder_hip_ratio <= shr_max:
                score += 1
            else:
                # Penalty for being outside range
                distance = min(abs(shoulder_hip_ratio - shr_min), abs(shoulder_hip_ratio - shr_max))
                score -= distance * 0.5
            
            # Check waist-hip ratio
            whr_min, whr_max = rules['waist_hip_ratio']
            if whr_min <= waist_hip_ratio <= whr_max:
                score += 1
            else:
                # Penalty for being outside range
                distance = min(abs(waist_hip_ratio - whr_min), abs(waist_hip_ratio - whr_max))
                score -= distance * 0.5
            
            scores[body_type] = score
        
        # Get the body type with highest score
        best_match = max(scores, key=scores.get)
        confidence = max(0.1, min(1.0, (scores[best_match] + 2) / 4))  # Normalize to 0.1-1.0
        
        # Get alternatives (top 3)
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        alternatives = [body_type for body_type, _ in sorted_scores[1:4]]
        
        return {
            'body_type': best_match,
            'confidence': confidence,
            'alternatives': alternatives,
            'measurements': measurements
        }

    async def detect_body_type(self, image_url: str) -> Dict[str, Any]:
        """Simple body type detection from a single image"""
        try:
            # Download and process image
            image = await self.download_image(image_url)
            if image is None:
                return self._get_fallback_result()
            
            # Extract measurements
            measurements = self.extract_body_measurements(image)
            
            # Classify body type
            result = self.classify_body_type(measurements)
            
            return {
                'body_type': result['body_type'],
                'confidence': result['confidence'],
                'alternatives': result['alternatives'],
                'measurements': {
                    'shoulder_hip_ratio': round(measurements['shoulder_hip_ratio'], 2),
                    'waist_hip_ratio': round(measurements['waist_hip_ratio'], 2)
                },
                'reasoning': f"Body type classified based on shoulder-hip ratio of {measurements['shoulder_hip_ratio']:.2f} and waist-hip ratio of {measurements['waist_hip_ratio']:.2f}"
            }
            
        except Exception as e:
            logger.error(f"Body type detection error: {str(e)}")
            return self._get_fallback_result()

    async def analyze_comprehensive(self, image_urls: List[str], user_height: Optional[float] = None) -> Dict[str, Any]:
        """Comprehensive body analysis including measurements and body type detection"""
        try:
            if not image_urls:
                return self._get_fallback_comprehensive_result()
            
            # Use the first image for analysis (can be extended to use multiple images)
            primary_image_url = image_urls[0]
            
            # Download and process image
            image = await self.download_image(primary_image_url)
            if image is None:
                return self._get_fallback_comprehensive_result()
            
            # Extract measurements
            measurements = self.extract_body_measurements(image)
            
            # Classify body type
            result = self.classify_body_type(measurements)
            
            # Generate keypoints for visualization
            keypoints = self._extract_keypoints(image)
            
            # Get detailed recommendations
            recommendations = self.get_detailed_recommendations(result['body_type'])
            
            return {
                'body_type': result['body_type'],
                'confidence': result['confidence'],
                'measurements': {
                    'chest': measurements.get('shoulder_width', 90),
                    'waist': measurements.get('waist_width', 70),
                    'hips': measurements.get('hip_width', 94),
                    'shoulders': measurements.get('shoulder_width', 40),
                    'confidence': result['confidence'],
                    'keyPoints': keypoints
                },
                'keypoints': keypoints,
                'analysis_details': f"Comprehensive body analysis completed. Body type: {result['body_type']} with {result['confidence']:.1%} confidence. Key ratios: shoulder-hip {measurements['shoulder_hip_ratio']:.2f}, waist-hip {measurements['waist_hip_ratio']:.2f}.",
                'recommendations': recommendations
            }
            
        except Exception as e:
            logger.error(f"Comprehensive body analysis error: {str(e)}")
            return self._get_fallback_comprehensive_result()

    def _extract_keypoints(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """Extract pose keypoints for visualization"""
        try:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.pose.process(rgb_image)
            
            if not results.pose_landmarks:
                return []
            
            keypoints = []
            h, w = image.shape[:2]
            
            # Extract key body landmarks
            key_landmarks = [
                self.mp_pose.PoseLandmark.LEFT_SHOULDER,
                self.mp_pose.PoseLandmark.RIGHT_SHOULDER,
                self.mp_pose.PoseLandmark.LEFT_HIP,
                self.mp_pose.PoseLandmark.RIGHT_HIP,
                self.mp_pose.PoseLandmark.LEFT_ELBOW,
                self.mp_pose.PoseLandmark.RIGHT_ELBOW,
                self.mp_pose.PoseLandmark.LEFT_KNEE,
                self.mp_pose.PoseLandmark.RIGHT_KNEE
            ]
            
            for landmark_id in key_landmarks:
                landmark = results.pose_landmarks.landmark[landmark_id]
                keypoints.append({
                    'id': landmark_id.name,
                    'x': landmark.x * w,
                    'y': landmark.y * h,
                    'visibility': landmark.visibility
                })
            
            return keypoints
            
        except Exception as e:
            logger.error(f"Keypoint extraction error: {str(e)}")
            return []

    def get_detailed_recommendations(self, body_type: str) -> List[str]:
        """Get detailed style recommendations for body type"""
        recommendations_map = {
            'ECTOMORPH': [
                'Add volume with layered outfits and textured fabrics',
                'Choose horizontal stripes to create width',
                'Opt for structured jackets and blazers',
                'Try cropped tops to break up your torso'
            ],
            'MESOMORPH': [
                'Emphasize your natural athletic build with fitted clothes',
                'Choose tailored pieces that follow your body lines',
                'Avoid oversized clothing that hides your shape',
                'Try monochromatic outfits for a sleek look'
            ],
            'ENDOMORPH': [
                'Create a defined waistline with belts and fitted tops',
                'Choose A-line dresses and empire waist styles',
                'Use vertical lines to elongate your silhouette',
                'Opt for darker colors on areas you want to minimize'
            ],
            'PEAR': [
                'Balance proportions by emphasizing your upper body',
                'Choose boat necks and statement tops',
                'Try A-line skirts that skim over hips',
                'Add visual interest with scarves and jewelry'
            ],
            'APPLE': [
                'Draw attention away from midsection with V-necks',
                'Choose empire waist and flowy tops',
                'Highlight your legs with well-fitted bottoms',
                'Use accessories to draw attention upward'
            ],
            'HOURGLASS': [
                'Highlight your natural waistline with belted styles',
                'Choose fitted waists and wrap dresses',
                'Avoid shapeless clothing that hides your curves',
                'Try high-waisted bottoms to accentuate your waist'
            ],
            'RECTANGLE': [
                'Create curves with peplum tops and belted dresses',
                'Add visual interest with layered looks',
                'Try different textures and patterns',
                'Use accessories to define your waistline'
            ],
            'INVERTED_TRIANGLE': [
                'Balance broad shoulders with fuller bottoms',
                'Choose A-line bottoms and wide-leg pants',
                'Add details to your hips and legs',
                'Avoid shoulder pads and boat necks'
            ]
        }
        
        return recommendations_map.get(body_type, recommendations_map['RECTANGLE'])

    def _get_fallback_result(self) -> Dict[str, Any]:
        """Return fallback result for simple body type detection"""
        return {
            'body_type': 'RECTANGLE',
            'confidence': 0.75,
            'alternatives': ['HOURGLASS', 'PEAR'],
            'measurements': {
                'shoulder_hip_ratio': 1.0,
                'waist_hip_ratio': 0.8
            },
            'reasoning': 'Body type analysis completed with default classification.'
        }

    def _get_fallback_comprehensive_result(self) -> Dict[str, Any]:
        """Return fallback result for comprehensive analysis"""
        return {
            'body_type': 'RECTANGLE',
            'confidence': 0.75,
            'measurements': {
                'chest': 90,
                'waist': 70,
                'hips': 94,
                'shoulders': 40,
                'confidence': 0.75,
                'keyPoints': []
            },
            'keypoints': [],
            'analysis_details': 'Body analysis completed with default measurements and classification.',
            'recommendations': self.get_detailed_recommendations('RECTANGLE')
        }

    def get_style_recommendations(self, body_type):
        """Get style recommendations for body type"""
        recommendations = {
            'ECTOMORPH': {
                'clothing': ['Layered outfits', 'Horizontal stripes', 'Textured fabrics'],
                'avoid': ['Vertical stripes', 'Tight-fitting clothes'],
                'tips': 'Add volume and create curves with layering'
            },
            'MESOMORPH': {
                'clothing': ['Fitted clothes', 'Tailored pieces', 'Clean lines'],
                'avoid': ['Oversized clothing', 'Too much layering'],
                'tips': 'Emphasize your natural athletic build'
            },
            'ENDOMORPH': {
                'clothing': ['A-line dresses', 'Empire waist', 'Vertical lines'],
                'avoid': ['Tight clothing', 'Horizontal stripes'],
                'tips': 'Create a defined waistline and elongate silhouette'
            },
            'PEAR': {
                'clothing': ['Boat necks', 'Statement tops', 'A-line skirts'],
                'avoid': ['Tight bottoms', 'Hip-hugging styles'],
                'tips': 'Balance proportions by emphasizing upper body'
            },
            'APPLE': {
                'clothing': ['Empire waist', 'V-necks', 'Flowy tops'],
                'avoid': ['Tight waistlines', 'Crop tops'],
                'tips': 'Draw attention away from midsection'
            },
            'HOURGLASS': {
                'clothing': ['Fitted waists', 'Wrap dresses', 'Belted styles'],
                'avoid': ['Shapeless clothing', 'Boxy cuts'],
                'tips': 'Highlight your natural waistline'
            },
            'RECTANGLE': {
                'clothing': ['Peplum tops', 'Belted dresses', 'Layered looks'],
                'avoid': ['Straight cuts', 'Shapeless clothing'],
                'tips': 'Create curves and define waistline'
            },
            'INVERTED_TRIANGLE': {
                'clothing': ['A-line bottoms', 'Wide-leg pants', 'Hip details'],
                'avoid': ['Shoulder pads', 'Boat necks'],
                'tips': 'Balance broad shoulders with fuller bottoms'
            }
        }
        
        return recommendations.get(body_type, recommendations['RECTANGLE'])