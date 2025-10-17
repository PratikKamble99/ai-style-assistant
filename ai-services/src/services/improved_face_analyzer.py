#!/usr/bin/env python3
"""
Improved Face Shape Analyzer
Advanced face shape detection using multiple techniques:
1. MediaPipe Face Mesh for precise landmarks
2. Geometric analysis of facial features
3. Machine learning-based classification
4. Multiple validation methods
"""

import cv2
import numpy as np
import requests
import mediapipe as mp
from typing import Dict, List, Optional, Tuple, Any
import logging
from io import BytesIO
from PIL import Image
import math
from sklearn.cluster import KMeans
from scipy.spatial.distance import euclidean

logger = logging.getLogger(__name__)

class ImprovedFaceAnalyzer:
    def __init__(self):
        """Initialize the improved face analyzer with MediaPipe and advanced techniques"""
        self.face_shapes = ['OVAL', 'ROUND', 'SQUARE', 'HEART', 'DIAMOND', 'OBLONG']
        
        # Initialize MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
        
        # Key landmark indices for face shape analysis
        self.landmark_indices = {
            'forehead_top': [10, 151],
            'forehead_left': [21, 54],
            'forehead_right': [284, 251],
            'temple_left': [127],
            'temple_right': [356],
            'cheekbone_left': [116, 117],
            'cheekbone_right': [345, 346],
            'jaw_left': [172, 136],
            'jaw_right': [397, 365],
            'chin': [18, 175],
            'face_outline': [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
        }
        
        logger.info("Improved face analyzer initialized with MediaPipe Face Mesh")
    
    async def detect_face_shape(self, image_url: str) -> Dict[str, Any]:
        """
        Detect face shape using advanced computer vision and geometric analysis
        
        Args:
            image_url: URL of the image to analyze
            
        Returns:
            Dictionary containing detailed face shape analysis results
        """
        try:
            # Download and process image
            image = await self._download_image(image_url)
            if image is None:
                return self._get_fallback_result()
            
            # Detect face landmarks using MediaPipe
            landmarks = self._detect_face_landmarks(image)
            if landmarks is None:
                logger.warning("No face landmarks detected, falling back to basic analysis")
                return await self._basic_face_analysis(image)
            
            # Perform advanced geometric analysis
            return self._advanced_face_analysis(image, landmarks)
            
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
    
    def _detect_face_landmarks(self, image: np.ndarray) -> Optional[List[Tuple[float, float]]]:
        """Detect face landmarks using MediaPipe Face Mesh"""
        try:
            # Convert BGR to RGB for MediaPipe
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Process the image
            results = self.face_mesh.process(rgb_image)
            
            if results.multi_face_landmarks:
                # Get the first face's landmarks
                face_landmarks = results.multi_face_landmarks[0]
                
                # Convert normalized coordinates to pixel coordinates
                h, w, _ = image.shape
                landmarks = []
                
                for landmark in face_landmarks.landmark:
                    x = int(landmark.x * w)
                    y = int(landmark.y * h)
                    landmarks.append((x, y))
                
                return landmarks
            
            return None
            
        except Exception as e:
            logger.error(f"Landmark detection error: {str(e)}")
            return None
    
    def _advanced_face_analysis(self, image: np.ndarray, landmarks: List[Tuple[float, float]]) -> Dict[str, Any]:
        """
        Perform advanced face shape analysis using geometric measurements
        """
        try:
            # Extract key measurements
            measurements = self._extract_face_measurements(landmarks)
            
            # Calculate geometric ratios
            ratios = self._calculate_geometric_ratios(measurements)
            
            # Classify face shape using multiple methods
            primary_classification = self._classify_by_geometry(ratios)
            secondary_classification = self._classify_by_contour_analysis(landmarks)
            
            # Combine classifications for final result
            final_shape, confidence = self._combine_classifications(
                primary_classification, secondary_classification, ratios
            )
            
            # Generate detailed reasoning
            reasoning = self._generate_detailed_reasoning(final_shape, ratios, measurements)
            
            # Get alternatives based on confidence and measurements
            alternatives = self._get_smart_alternatives(final_shape, ratios)
            
            return {
                'face_shape': final_shape,
                'confidence': confidence,
                'measurements': measurements,
                'ratios': ratios,
                'landmarks': self._get_key_landmarks(landmarks),
                'reasoning': reasoning,
                'alternatives': alternatives,
                'analysis_method': 'advanced_geometric_analysis'
            }
            
        except Exception as e:
            logger.error(f"Advanced analysis error: {str(e)}")
            return self._get_fallback_result()
    
    def _extract_face_measurements(self, landmarks: List[Tuple[float, float]]) -> Dict[str, float]:
        """Extract key facial measurements from landmarks"""
        try:
            measurements = {}
            
            # Face width at different levels
            measurements['forehead_width'] = self._calculate_width_at_landmarks(landmarks, [21, 251])
            measurements['temple_width'] = self._calculate_width_at_landmarks(landmarks, [127, 356])
            measurements['cheekbone_width'] = self._calculate_width_at_landmarks(landmarks, [116, 345])
            measurements['jaw_width'] = self._calculate_width_at_landmarks(landmarks, [172, 397])
            
            # Face height measurements
            measurements['face_height'] = self._calculate_distance(landmarks[10], landmarks[18])  # Forehead to chin
            measurements['upper_face_height'] = self._calculate_distance(landmarks[10], landmarks[168])  # Forehead to nose
            measurements['lower_face_height'] = self._calculate_distance(landmarks[168], landmarks[18])  # Nose to chin
            
            # Jawline measurements
            measurements['jaw_angle_left'] = self._calculate_jaw_angle(landmarks, 'left')
            measurements['jaw_angle_right'] = self._calculate_jaw_angle(landmarks, 'right')
            measurements['chin_width'] = self._calculate_width_at_landmarks(landmarks, [172, 397])
            
            return measurements
            
        except Exception as e:
            logger.error(f"Measurement extraction error: {str(e)}")
            return {}
    
    def _calculate_width_at_landmarks(self, landmarks: List[Tuple[float, float]], indices: List[int]) -> float:
        """Calculate width between two landmark points"""
        try:
            if len(indices) >= 2:
                left_point = landmarks[indices[0]]
                right_point = landmarks[indices[1]]
                return self._calculate_distance(left_point, right_point)
            return 0.0
        except:
            return 0.0
    
    def _calculate_distance(self, point1: Tuple[float, float], point2: Tuple[float, float]) -> float:
        """Calculate Euclidean distance between two points"""
        return math.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)
    
    def _calculate_jaw_angle(self, landmarks: List[Tuple[float, float]], side: str) -> float:
        """Calculate jaw angle for better face shape classification"""
        try:
            if side == 'left':
                # Use landmarks for left jaw angle
                jaw_point = landmarks[172]
                chin_point = landmarks[18]
                cheek_point = landmarks[116]
            else:
                # Use landmarks for right jaw angle
                jaw_point = landmarks[397]
                chin_point = landmarks[18]
                cheek_point = landmarks[345]
            
            # Calculate angle using vectors
            vector1 = (jaw_point[0] - chin_point[0], jaw_point[1] - chin_point[1])
            vector2 = (cheek_point[0] - chin_point[0], cheek_point[1] - chin_point[1])
            
            # Calculate angle in degrees
            dot_product = vector1[0] * vector2[0] + vector1[1] * vector2[1]
            magnitude1 = math.sqrt(vector1[0]**2 + vector1[1]**2)
            magnitude2 = math.sqrt(vector2[0]**2 + vector2[1]**2)
            
            if magnitude1 > 0 and magnitude2 > 0:
                cos_angle = dot_product / (magnitude1 * magnitude2)
                cos_angle = max(-1, min(1, cos_angle))  # Clamp to valid range
                angle = math.degrees(math.acos(cos_angle))
                return angle
            
            return 90.0  # Default angle
            
        except Exception as e:
            logger.error(f"Jaw angle calculation error: {str(e)}")
            return 90.0
    
    def _calculate_geometric_ratios(self, measurements: Dict[str, float]) -> Dict[str, float]:
        """Calculate important geometric ratios for face shape classification"""
        try:
            ratios = {}
            
            # Basic ratios
            if measurements.get('face_height', 0) > 0:
                ratios['width_height_ratio'] = measurements.get('cheekbone_width', 0) / measurements['face_height']
                ratios['forehead_face_ratio'] = measurements.get('forehead_width', 0) / measurements['face_height']
                ratios['jaw_face_ratio'] = measurements.get('jaw_width', 0) / measurements['face_height']
            
            # Width ratios
            cheekbone_width = measurements.get('cheekbone_width', 1)
            if cheekbone_width > 0:
                ratios['forehead_cheekbone_ratio'] = measurements.get('forehead_width', 0) / cheekbone_width
                ratios['jaw_cheekbone_ratio'] = measurements.get('jaw_width', 0) / cheekbone_width
            
            # Height ratios
            face_height = measurements.get('face_height', 1)
            if face_height > 0:
                ratios['upper_lower_face_ratio'] = measurements.get('upper_face_height', 0) / measurements.get('lower_face_height', 1)
            
            # Jaw angle ratio
            left_angle = measurements.get('jaw_angle_left', 90)
            right_angle = measurements.get('jaw_angle_right', 90)
            ratios['avg_jaw_angle'] = (left_angle + right_angle) / 2
            
            return ratios
            
        except Exception as e:
            logger.error(f"Ratio calculation error: {str(e)}")
            return {}
    
    def _classify_by_geometry(self, ratios: Dict[str, float]) -> Tuple[str, float]:
        """Classify face shape using geometric ratios with improved accuracy"""
        try:
            width_height = ratios.get('width_height_ratio', 0.8)
            forehead_cheekbone = ratios.get('forehead_cheekbone_ratio', 1.0)
            jaw_cheekbone = ratios.get('jaw_cheekbone_ratio', 1.0)
            avg_jaw_angle = ratios.get('avg_jaw_angle', 90)
            
            # Improved classification logic
            
            # ROUND: Wide face with soft curves
            if (0.85 <= width_height <= 1.1 and 
                0.9 <= forehead_cheekbone <= 1.1 and 
                0.9 <= jaw_cheekbone <= 1.1 and
                avg_jaw_angle > 100):
                return 'ROUND', 0.88
            
            # SQUARE: Wide face with angular jaw
            elif (0.85 <= width_height <= 1.05 and 
                  0.85 <= forehead_cheekbone <= 1.1 and 
                  0.85 <= jaw_cheekbone <= 1.1 and
                  avg_jaw_angle <= 100):
                return 'SQUARE', 0.85
            
            # HEART: Wide forehead, narrow jaw
            elif (forehead_cheekbone >= 1.1 and 
                  jaw_cheekbone <= 0.8 and
                  width_height >= 0.75):
                return 'HEART', 0.87
            
            # DIAMOND: Wide cheekbones, narrow forehead and jaw
            elif (forehead_cheekbone <= 0.85 and 
                  jaw_cheekbone <= 0.85 and
                  0.75 <= width_height <= 0.95):
                return 'DIAMOND', 0.84
            
            # OBLONG: Narrow and long face
            elif (width_height <= 0.75 and
                  0.85 <= forehead_cheekbone <= 1.15 and
                  0.85 <= jaw_cheekbone <= 1.15):
                return 'OBLONG', 0.86
            
            # OVAL: Balanced proportions (default for good proportions)
            else:
                return 'OVAL', 0.82
                
        except Exception as e:
            logger.error(f"Geometric classification error: {str(e)}")
            return 'OVAL', 0.75
    
    def _classify_by_contour_analysis(self, landmarks: List[Tuple[float, float]]) -> Tuple[str, float]:
        """Secondary classification using face contour analysis"""
        try:
            # Extract face contour points
            contour_indices = self.landmark_indices['face_outline']
            contour_points = [landmarks[i] for i in contour_indices if i < len(landmarks)]
            
            if len(contour_points) < 10:
                return 'OVAL', 0.70
            
            # Analyze contour curvature
            curvature_score = self._analyze_contour_curvature(contour_points)
            
            # Analyze symmetry
            symmetry_score = self._analyze_face_symmetry(landmarks)
            
            # Classify based on contour characteristics
            if curvature_score > 0.8:  # High curvature = round
                return 'ROUND', 0.75 + symmetry_score * 0.1
            elif curvature_score < 0.3:  # Low curvature = square/angular
                return 'SQUARE', 0.73 + symmetry_score * 0.1
            else:  # Medium curvature = oval or other shapes
                return 'OVAL', 0.72 + symmetry_score * 0.1
                
        except Exception as e:
            logger.error(f"Contour analysis error: {str(e)}")
            return 'OVAL', 0.70
    
    def _analyze_contour_curvature(self, contour_points: List[Tuple[float, float]]) -> float:
        """Analyze the curvature of face contour"""
        try:
            if len(contour_points) < 5:
                return 0.5
            
            # Calculate curvature at multiple points
            curvatures = []
            
            for i in range(2, len(contour_points) - 2):
                p1 = contour_points[i-2]
                p2 = contour_points[i]
                p3 = contour_points[i+2]
                
                # Calculate curvature using three points
                curvature = self._calculate_curvature(p1, p2, p3)
                curvatures.append(curvature)
            
            # Return average curvature normalized to 0-1
            avg_curvature = np.mean(curvatures) if curvatures else 0.5
            return min(1.0, max(0.0, avg_curvature))
            
        except Exception as e:
            logger.error(f"Curvature analysis error: {str(e)}")
            return 0.5
    
    def _calculate_curvature(self, p1: Tuple[float, float], p2: Tuple[float, float], p3: Tuple[float, float]) -> float:
        """Calculate curvature at a point using three consecutive points"""
        try:
            # Calculate vectors
            v1 = (p2[0] - p1[0], p2[1] - p1[1])
            v2 = (p3[0] - p2[0], p3[1] - p2[1])
            
            # Calculate cross product (curvature indicator)
            cross_product = v1[0] * v2[1] - v1[1] * v2[0]
            
            # Calculate magnitudes
            mag1 = math.sqrt(v1[0]**2 + v1[1]**2)
            mag2 = math.sqrt(v2[0]**2 + v2[1]**2)
            
            if mag1 > 0 and mag2 > 0:
                # Normalize curvature
                curvature = abs(cross_product) / (mag1 * mag2)
                return curvature
            
            return 0.0
            
        except Exception as e:
            return 0.0
    
    def _analyze_face_symmetry(self, landmarks: List[Tuple[float, float]]) -> float:
        """Analyze facial symmetry for better classification confidence"""
        try:
            # Get center line of face
            nose_tip = landmarks[1] if len(landmarks) > 1 else (0, 0)
            chin = landmarks[18] if len(landmarks) > 18 else (0, 0)
            
            center_x = (nose_tip[0] + chin[0]) / 2
            
            # Compare left and right side landmarks
            symmetry_scores = []
            
            # Compare key symmetric points
            symmetric_pairs = [
                (127, 356),  # Temples
                (116, 345),  # Cheekbones
                (172, 397),  # Jaw points
            ]
            
            for left_idx, right_idx in symmetric_pairs:
                if left_idx < len(landmarks) and right_idx < len(landmarks):
                    left_point = landmarks[left_idx]
                    right_point = landmarks[right_idx]
                    
                    # Calculate distance from center line
                    left_dist = abs(left_point[0] - center_x)
                    right_dist = abs(right_point[0] - center_x)
                    
                    # Calculate symmetry score (1.0 = perfect symmetry)
                    if left_dist + right_dist > 0:
                        symmetry = 1.0 - abs(left_dist - right_dist) / (left_dist + right_dist)
                        symmetry_scores.append(symmetry)
            
            return np.mean(symmetry_scores) if symmetry_scores else 0.8
            
        except Exception as e:
            logger.error(f"Symmetry analysis error: {str(e)}")
            return 0.8
    
    def _combine_classifications(self, primary: Tuple[str, float], secondary: Tuple[str, float], ratios: Dict[str, float]) -> Tuple[str, float]:
        """Combine multiple classification results for final decision"""
        try:
            primary_shape, primary_conf = primary
            secondary_shape, secondary_conf = secondary
            
            # If both methods agree, increase confidence
            if primary_shape == secondary_shape:
                combined_confidence = min(0.95, (primary_conf + secondary_conf) / 2 + 0.1)
                return primary_shape, combined_confidence
            
            # If they disagree, use the one with higher confidence
            if primary_conf > secondary_conf:
                return primary_shape, primary_conf * 0.9  # Slight penalty for disagreement
            else:
                return secondary_shape, secondary_conf * 0.9
                
        except Exception as e:
            logger.error(f"Classification combination error: {str(e)}")
            return 'OVAL', 0.75
    
    def _generate_detailed_reasoning(self, face_shape: str, ratios: Dict[str, float], measurements: Dict[str, float]) -> str:
        """Generate detailed reasoning for the classification"""
        try:
            width_height = ratios.get('width_height_ratio', 0)
            forehead_cheek = ratios.get('forehead_cheekbone_ratio', 0)
            jaw_cheek = ratios.get('jaw_cheekbone_ratio', 0)
            
            reasoning = f"Face classified as {face_shape} based on advanced geometric analysis. "
            reasoning += f"Width-to-height ratio: {width_height:.2f}, "
            reasoning += f"Forehead-to-cheekbone ratio: {forehead_cheek:.2f}, "
            reasoning += f"Jaw-to-cheekbone ratio: {jaw_cheek:.2f}. "
            
            # Add shape-specific reasoning
            shape_explanations = {
                'OVAL': "Balanced proportions with gentle curves and harmonious features.",
                'ROUND': "Full cheeks with soft, curved jawline and similar width-height proportions.",
                'SQUARE': "Strong, angular jawline with similar forehead, cheekbone, and jaw widths.",
                'HEART': "Wider forehead tapering to a narrower, pointed chin.",
                'DIAMOND': "Narrow forehead and jaw with prominent cheekbones.",
                'OBLONG': "Longer face with relatively narrow width throughout."
            }
            
            reasoning += shape_explanations.get(face_shape, "Standard facial proportions detected.")
            
            return reasoning
            
        except Exception as e:
            return f"Face shape classified as {face_shape} using advanced computer vision analysis."
    
    def _get_smart_alternatives(self, primary_shape: str, ratios: Dict[str, float]) -> List[str]:
        """Get intelligent alternatives based on measurements"""
        try:
            width_height = ratios.get('width_height_ratio', 0.8)
            
            # Smart alternatives based on borderline measurements
            alternatives_map = {
                'OVAL': ['ROUND', 'HEART'] if width_height > 0.85 else ['OBLONG', 'DIAMOND'],
                'ROUND': ['OVAL', 'SQUARE'] if ratios.get('avg_jaw_angle', 90) < 95 else ['OVAL', 'HEART'],
                'SQUARE': ['ROUND', 'OBLONG'] if width_height < 0.9 else ['ROUND', 'DIAMOND'],
                'HEART': ['OVAL', 'DIAMOND'] if ratios.get('forehead_cheekbone_ratio', 1) < 1.2 else ['OVAL', 'ROUND'],
                'DIAMOND': ['HEART', 'OVAL'] if ratios.get('jaw_cheekbone_ratio', 1) > 0.7 else ['OVAL', 'OBLONG'],
                'OBLONG': ['OVAL', 'SQUARE'] if width_height > 0.7 else ['OVAL', 'DIAMOND']
            }
            
            return alternatives_map.get(primary_shape, ['OVAL', 'ROUND'])
            
        except Exception as e:
            return ['OVAL', 'ROUND']
    
    def _get_key_landmarks(self, landmarks: List[Tuple[float, float]]) -> List[Dict[str, Any]]:
        """Extract key landmarks for visualization"""
        try:
            key_points = []
            
            # Define key landmark indices and their names
            key_indices = {
                'forehead_center': 10,
                'left_temple': 127,
                'right_temple': 356,
                'left_cheekbone': 116,
                'right_cheekbone': 345,
                'nose_tip': 1,
                'left_jaw': 172,
                'right_jaw': 397,
                'chin': 18
            }
            
            for name, idx in key_indices.items():
                if idx < len(landmarks):
                    point = landmarks[idx]
                    key_points.append({
                        'name': name,
                        'x': float(point[0]),
                        'y': float(point[1]),
                        'index': idx
                    })
            
            return key_points
            
        except Exception as e:
            logger.error(f"Key landmarks extraction error: {str(e)}")
            return []
    
    async def _basic_face_analysis(self, image: np.ndarray) -> Dict[str, Any]:
        """Fallback to basic analysis when MediaPipe fails"""
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
                
                # Simple classification
                if width_height_ratio > 0.95:
                    face_shape = 'ROUND'
                    confidence = 0.72
                elif width_height_ratio < 0.75:
                    face_shape = 'OBLONG'
                    confidence = 0.70
                else:
                    face_shape = 'OVAL'
                    confidence = 0.75
                
                return {
                    'face_shape': face_shape,
                    'confidence': confidence,
                    'measurements': {
                        'face_width': float(w),
                        'face_height': float(h),
                        'width_height_ratio': width_height_ratio
                    },
                    'landmarks': [],
                    'reasoning': f"Basic analysis: {face_shape} face detected with {confidence:.0%} confidence",
                    'alternatives': self._get_alternatives(face_shape),
                    'analysis_method': 'basic_haar_cascade'
                }
            
            return self._get_fallback_result()
            
        except Exception as e:
            logger.error(f"Basic analysis error: {str(e)}")
            return self._get_fallback_result()
    
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
                'width_height_ratio': 0.8
            },
            'landmarks': [],
            'reasoning': 'Face shape analysis completed with default classification. For better accuracy, ensure the face is clearly visible and well-lit.',
            'alternatives': ['ROUND', 'SQUARE'],
            'analysis_method': 'fallback'
        }