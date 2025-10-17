#!/usr/bin/env python3
"""
AI Stylist - FastAPI Application
Provides AI analysis endpoints for body type, face shape, and skin tone detection
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import traceback

# Import AI services
from services.body_analyzer import BodyAnalyzer
from services.face_analyzer import FaceAnalyzer
from services.improved_face_analyzer import ImprovedFaceAnalyzer
from services.skin_analyzer import SkinAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Stylist - AI Analysis Service",
    description="Computer vision and AI analysis for fashion styling",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your backend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI analyzers
body_analyzer = BodyAnalyzer()
face_analyzer = FaceAnalyzer()
improved_face_analyzer = ImprovedFaceAnalyzer()
skin_analyzer = SkinAnalyzer()

# Pydantic models for request/response
class BodyAnalysisRequest(BaseModel):
    image_urls: List[str]
    user_height: Optional[float] = None

class SingleImageRequest(BaseModel):
    image_url: str

class AnalysisResponse(BaseModel):
    success: bool
    body_type: Optional[str] = None
    face_shape: Optional[str] = None
    skin_tone: Optional[str] = None
    confidence: float
    measurements: Optional[Dict[str, Any]] = None
    keypoints: Optional[List[Dict[str, Any]]] = None
    analysis_details: Optional[str] = None
    recommendations: Optional[List[str]] = None
    alternatives: Optional[List[str]] = None
    error: Optional[str] = None

@app.get("/")
async def root():
    return {
        "message": "AI Stylist - AI Analysis Service",
        "version": "1.0.0",
        "services": [
            "Body Type Analysis",
            "Face Shape Detection", 
            "Skin Tone Analysis"
        ],
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "body_analyzer": "ready",
            "face_analyzer": "ready",
            "improved_face_analyzer": "ready",
            "skin_analyzer": "ready"
        },
        "features": {
            "mediapipe_face_mesh": "enabled",
            "geometric_analysis": "enabled",
            "advanced_landmarks": "enabled",
            "fallback_detection": "enabled"
        }
    }

@app.post("/analyze/body", response_model=AnalysisResponse)
async def analyze_body_comprehensive(request: BodyAnalysisRequest):
    """
    Comprehensive body analysis including measurements and body type detection
    """
    try:
        logger.info(f"Starting comprehensive body analysis for {len(request.image_urls)} images")
        
        # Analyze body using the body analyzer
        result = await body_analyzer.analyze_comprehensive(
            image_urls=request.image_urls,
            user_height=request.user_height
        )
        
        return AnalysisResponse(
            success=True,
            body_type=result.get('body_type'),
            confidence=result.get('confidence', 0.75),
            measurements=result.get('measurements'),
            keypoints=result.get('keypoints'),
            analysis_details=result.get('analysis_details'),
            recommendations=result.get('recommendations')
        )
        
    except Exception as e:
        logger.error(f"Body analysis error: {str(e)}")
        logger.error(traceback.format_exc())
        return AnalysisResponse(
            success=False,
            confidence=0.0,
            error=f"Body analysis failed: {str(e)}"
        )

@app.post("/analyze/body-type", response_model=AnalysisResponse)
async def analyze_body_type(request: SingleImageRequest):
    """
    Simple body type detection from a single image
    """
    try:
        logger.info(f"Starting body type analysis for image: {request.image_url}")
        
        result = await body_analyzer.detect_body_type(request.image_url)
        
        return AnalysisResponse(
            success=True,
            body_type=result.get('body_type'),
            confidence=result.get('confidence', 0.75),
            alternatives=result.get('alternatives'),
            analysis_details=result.get('reasoning')
        )
        
    except Exception as e:
        logger.error(f"Body type analysis error: {str(e)}")
        return AnalysisResponse(
            success=False,
            confidence=0.0,
            error=f"Body type analysis failed: {str(e)}"
        )

@app.post("/analyze/face-shape", response_model=AnalysisResponse)
async def analyze_face_shape(request: SingleImageRequest):
    """
    Advanced face shape detection and analysis using MediaPipe and geometric analysis
    """
    try:
        logger.info(f"Starting advanced face shape analysis for image: {request.image_url}")
        
        # Try improved analyzer first
        result = await improved_face_analyzer.detect_face_shape(request.image_url)
        
        # If improved analyzer fails, fallback to basic analyzer
        if result.get('confidence', 0) < 0.6:
            logger.info("Improved analyzer confidence low, trying basic analyzer as backup")
            basic_result = await face_analyzer.detect_face_shape(request.image_url)
            
            # Use the result with higher confidence
            if basic_result.get('confidence', 0) > result.get('confidence', 0):
                result = basic_result
                result['analysis_method'] = 'basic_fallback'
        
        return AnalysisResponse(
            success=True,
            face_shape=result.get('face_shape'),
            confidence=result.get('confidence', 0.75),
            alternatives=result.get('alternatives'),
            keypoints=result.get('landmarks'),
            measurements=result.get('measurements'),
            analysis_details=result.get('reasoning')
        )
        
    except Exception as e:
        logger.error(f"Face shape analysis error: {str(e)}")
        return AnalysisResponse(
            success=False,
            confidence=0.0,
            error=f"Face shape analysis failed: {str(e)}"
        )

@app.post("/analyze/face-shape-basic", response_model=AnalysisResponse)
async def analyze_face_shape_basic(request: SingleImageRequest):
    """
    Basic face shape detection (fallback method)
    """
    try:
        logger.info(f"Starting basic face shape analysis for image: {request.image_url}")
        
        result = await face_analyzer.detect_face_shape(request.image_url)
        
        return AnalysisResponse(
            success=True,
            face_shape=result.get('face_shape'),
            confidence=result.get('confidence', 0.75),
            alternatives=result.get('alternatives'),
            keypoints=result.get('landmarks'),
            analysis_details=result.get('reasoning')
        )
        
    except Exception as e:
        logger.error(f"Basic face shape analysis error: {str(e)}")
        return AnalysisResponse(
            success=False,
            confidence=0.0,
            error=f"Basic face shape analysis failed: {str(e)}"
        )

@app.post("/analyze/skin-tone", response_model=AnalysisResponse)
async def analyze_skin_tone(request: SingleImageRequest):
    """
    Skin tone detection and analysis
    """
    try:
        logger.info(f"Starting skin tone analysis for image: {request.image_url}")
        
        result = await skin_analyzer.detect_skin_tone(request.image_url)
        
        return AnalysisResponse(
            success=True,
            skin_tone=result.get('skin_tone'),
            confidence=result.get('confidence', 0.75),
            alternatives=result.get('alternatives'),
            analysis_details=result.get('reasoning')
        )
        
    except Exception as e:
        logger.error(f"Skin tone analysis error: {str(e)}")
        return AnalysisResponse(
            success=False,
            confidence=0.0,
            error=f"Skin tone analysis failed: {str(e)}"
        )

@app.post("/analyze/all")
async def analyze_all_features(request: BodyAnalysisRequest):
    """
    Comprehensive analysis of all features: body type, face shape, and skin tone
    """
    try:
        logger.info(f"Starting comprehensive analysis for {len(request.image_urls)} images")
        
        # Use first image for face and skin analysis
        face_image = request.image_urls[0] if request.image_urls else None
        
        # Run all analyses in parallel
        import asyncio
        
        body_task = body_analyzer.analyze_comprehensive(
            image_urls=request.image_urls,
            user_height=request.user_height
        )
        
        face_task = face_analyzer.detect_face_shape(face_image) if face_image else None
        skin_task = skin_analyzer.detect_skin_tone(face_image) if face_image else None
        
        # Wait for all analyses to complete
        results = await asyncio.gather(
            body_task,
            face_task if face_task else asyncio.sleep(0),
            skin_task if skin_task else asyncio.sleep(0),
            return_exceptions=True
        )
        
        body_result = results[0] if not isinstance(results[0], Exception) else {}
        face_result = results[1] if len(results) > 1 and not isinstance(results[1], Exception) else {}
        skin_result = results[2] if len(results) > 2 and not isinstance(results[2], Exception) else {}
        
        return {
            "success": True,
            "body_analysis": body_result,
            "face_analysis": face_result,
            "skin_analysis": skin_result,
            "overall_confidence": min(
                body_result.get('confidence', 0.75),
                face_result.get('confidence', 0.75),
                skin_result.get('confidence', 0.75)
            )
        }
        
    except Exception as e:
        logger.error(f"Comprehensive analysis error: {str(e)}")
        return {
            "success": False,
            "error": f"Comprehensive analysis failed: {str(e)}"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)