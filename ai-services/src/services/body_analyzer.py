import cv2
import numpy as np
import mediapipe as mp
import requests
from PIL import Image
from io import BytesIO
import math

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

    def download_image(self, image_url):
        """Download image from URL"""
        try:
            response = requests.get(image_url)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content))
            return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        except Exception as e:
            raise Exception(f"Failed to download image: {str(e)}")

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

    def analyze(self, image_url):
        """Main analysis function"""
        try:
            # Download and process image
            image = self.download_image(image_url)
            
            # Extract measurements
            measurements = self.extract_body_measurements(image)
            
            # Classify body type
            result = self.classify_body_type(measurements)
            
            return {
                'success': True,
                'detected': result['body_type'],
                'confidence': result['confidence'],
                'alternatives': result['alternatives'],
                'measurements': {
                    'shoulder_hip_ratio': round(measurements['shoulder_hip_ratio'], 2),
                    'waist_hip_ratio': round(measurements['waist_hip_ratio'], 2)
                },
                'recommendations': self.get_style_recommendations(result['body_type'])
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'detected': 'RECTANGLE',  # Default fallback
                'confidence': 0.1
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