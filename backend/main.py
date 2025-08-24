import os
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import asyncio
import uuid
from datetime import datetime
import logging
from dotenv import load_dotenv

# Imports for image generation and web scraping
from PIL import Image, ImageDraw, ImageFont
import base64
import io
import requests
from bs4 import BeautifulSoup

# Portia imports
from portia import (
    Portia, 
    Config, 
    LLMProvider,
    PortiaToolRegistry,
    StorageClass
)
from portia.open_source_tools.browser_tool import BrowserTool, BrowserInfrastructureOption

# Google Gemini API for text generation
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Business Analysis & Design API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for Business Analysis
class BusinessIdeaRequest(BaseModel):
    business_idea: str
    target_audience: str
    industry: str
    location: Optional[str] = "United States"
    budget_range: Optional[str] = "small"
    goals: Optional[List[str]] = []

class AnalysisStatus(BaseModel):
    analysis_id: str
    status: str  # pending, in_progress, completed, failed
    progress: int  # 0-100
    current_step: str
    created_at: datetime
    completed_at: Optional[datetime] = None

class CompetitorAnalysis(BaseModel):
    name: str
    website: str
    social_media_presence: Dict[str, Any]
    estimated_followers: Dict[str, int]
    content_strategy: List[str]
    strengths: List[str]
    weaknesses: List[str]

class PlatformRecommendation(BaseModel):
    platform: str
    priority: str  # high, medium, low
    reach_potential: int  # 1-10
    engagement_potential: int  # 1-10
    competition_level: str  # low, medium, high
    content_types: List[str]
    estimated_audience_size: str
    key_demographics: List[str]
    pros: List[str]
    cons: List[str]
    recommended_strategy: str

class AnalysisResult(BaseModel):
    analysis_id: str
    business_idea: str
    industry_overview: str
    target_audience_insights: List[str]
    competitors: List[CompetitorAnalysis]
    platform_recommendations: List[PlatformRecommendation]
    key_insights: List[str]
    action_items: List[str]
    generated_at: datetime

# In-memory storage for demo (use Redis/DB in production)
analysis_storage: Dict[str, Dict] = {}
analysis_results: Dict[str, AnalysisResult] = {}

# Google API Key Configuration (used by both Portia and direct Gemini calls)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    logger.error("GOOGLE_API_KEY environment variable not set. Gemini API calls will likely fail.")
    # You might want to raise an HTTPException here if the key is critical for startup
    # raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not set in environment variables.")

genai.configure(api_key=GOOGLE_API_KEY)
gemini_model = genai.GenerativeModel('gemini-pro')

# --- Helper functions for image generation (from previous app.py) ---
def get_robust_font(size, preferred_font_name=None):
    if preferred_font_name:
        try:
            return ImageFont.truetype(preferred_font_name + ".ttf", size)
        except IOError:
            try:
                return ImageFont.truetype(preferred_font_name, size)
            except IOError:
                pass

    bundled_font_path = os.path.join(os.path.dirname(__file__), "DejaVuSans.ttf")
    if os.path.exists(bundled_font_path):
        try:
            return ImageFont.truetype(bundled_font_path, size)
        except IOError:
            print(f"Warning: Could not load bundled font {bundled_font_path}. Trying system fonts.")
    else:
        print(f"Warning: Bundled font {bundled_font_path} not found. Trying system fonts.")

    try:
        return ImageFont.truetype("arial.ttf", size)
    except IOError:
        try:
            return ImageFont.truetype("sans-serif.ttf", size)
        except IOError:
            print(f"Warning: Could not load any truetype font. Using default Pillow font.")
            return ImageFont.load_default()

def draw_text_wrapped(draw, text, font, fill, xy, max_width, line_spacing_factor=1.2):
    lines = []
    words = text.split()
    current_line = []
    
    try:
        sample_text_bbox = draw.textbbox((0,0), "Tg", font=font)
        base_line_height = sample_text_bbox[3] - sample_text_bbox[1]
        if base_line_height == 0: # Avoid division by zero or tiny height
            base_line_height = font.size if hasattr(font, 'size') and font.size > 0 else 20
    except Exception:
        base_line_height = font.size if hasattr(font, 'size') and font.size > 0 else 20
    
    line_height = base_line_height * line_spacing_factor

    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = draw.textbbox((0,0), test_line, font=font)
        text_width = bbox[2] - bbox[0]
        if text_width <= max_width:
            current_line.append(word)
        else:
            lines.append(' '.join(current_line))
            current_line = [word]
    lines.append(' '.join(current_line))

    y_start = xy[1]
    y_offset = 0
    for line in lines:
        bbox = draw.textbbox((0,0), line, font=font)
        line_width = bbox[2] - bbox[0]
        draw.text((xy[0] + (max_width - line_width) / 2, y_start + y_offset), line, font=font, fill=fill)
        y_offset += line_height
    return y_offset # Return total height used by the wrapped text block

def generate_image_from_design(design_data, template_type, image_width, image_height):
    try:
        bg_color = design_data.get('bgColor', '#ffffff')
        text_color = design_data.get('textColor', '#333333')
        user_font_family = design_data.get('fontFamily', 'Arial')
        main_text = design_data.get('text', '')
        sub_text = design_data.get('subText', '')
        offer_details = design_data.get('offerDetails', '')
        phone_number = design_data.get('phoneNumber', '')
        email = design_data.get('email', '')
        website = design_data.get('website', '')
        logo_base64 = design_data.get('logo')
        logo_position = design_data.get('logoPosition', {'x': 0, 'y': 0})

        img = Image.new('RGB', (image_width, image_height), color=bg_color)
        d = ImageDraw.Draw(img)

        # Add logo if provided
        if logo_base64:
            try:
                logo_data = base64.b64decode(logo_base64.split(',')[1])
                logo_img = Image.open(io.BytesIO(logo_data)).convert("RGBA")
                
                logo_w, logo_h = 80, 80
                logo_x, logo_y = 0, 0

                if template_type == 'poster':
                    logo_w, logo_h = 80, 80
                    logo_x, logo_y = 20, 20
                elif template_type == 'businessCard':
                    logo_w, logo_h = 60, 60
                    logo_x = (image_width - logo_w) // 2
                    logo_y = 20
                elif template_type == 'modernEventPoster':
                    logo_w, logo_h = 70, 70
                    logo_x = (image_width - logo_w) // 2
                    logo_y = 30
                elif template_type == 'minimalistBusinessCard':
                    logo_w, logo_h = 50, 50
                    logo_x, logo_y = 20, 20
                elif template_type == 'vibrantOfferPoster':
                    logo_w, logo_h = 60, 60
                    logo_x = (image_width - logo_w) // 2
                    logo_y = 25
                elif template_type == 'professionalFlyer':
                    logo_w, logo_h = 70, 70
                    logo_x = image_width - logo_w - 30
                    logo_y = 30
                elif template_type == 'socialMediaPost':
                    logo_w, logo_h = 60, 60
                    logo_x, logo_y = 20, 20
                elif template_type == 'eventTicket':
                    logo_w, logo_h = 40, 40
                    logo_x = image_width - logo_w - 20
                    logo_y = 20
                elif template_type == 'traditionalIndianBusinessCard':
                    logo_w, logo_h = 60, 60
                    logo_x, logo_y = 20, 20
                elif template_type == 'productDiscountBanner':
                    logo_w, logo_h = 70, 70
                    logo_x, logo_y = 20, 20
                elif template_type == 'inspirationalQuoteCard':
                    logo_w, logo_h = 50, 50
                    logo_x, logo_y = image_width - logo_w - 20, 20
                elif template_type == 'eventInvitationCard':
                    logo_w, logo_h = 60, 60
                    logo_x, logo_y = image_width - logo_w - 25, 25
                elif template_type == 'productShowcasePost':
                    logo_w, logo_h = 80, 80
                    logo_x, logo_y = (image_width - logo_w) // 2, 30
                elif template_type == 'limitedTimeOfferBanner':
                    logo_w, logo_h = 60, 60
                    logo_x, logo_y = 20, 20
                elif template_type == 'elegantContactCard':
                    logo_w, logo_h = 60, 60
                    logo_x, logo_y = (image_width - logo_w) // 2, 25
                elif template_type == 'modernTechBusinessCard':
                    logo_w, logo_h = 70, 70
                    logo_x, logo_y = (image_width * 0.15) - (logo_w // 2), (image_height // 2) - (logo_h // 2)
                elif template_type == 'minimalistQrCodeCard':
                    logo_w, logo_h = 50, 50
                    logo_x, logo_y = 20, 20

                logo_img = logo_img.resize((logo_w, logo_h))
                
                final_logo_x = logo_x + logo_position['x']
                final_logo_y = logo_y + logo_position['y']

                img.paste(logo_img, (final_logo_x, final_logo_y), logo_img)
            except Exception as e:
                print(f"Error processing logo: {e}")

        # --- Template-specific rendering logic ---
        if template_type == 'poster':
            main_font = get_robust_font(40, user_font_family)
            sub_font = get_robust_font(25, user_font_family)
            offer_font = get_robust_font(22, user_font_family)
            small_font = get_robust_font(18, user_font_family)
            
            text_y_offset = 150 if logo_base64 else 50
            
            # Main Text
            bbox_main = d.textbbox((0,0), main_text or 'Your Poster Title', font=main_font)
            main_text_width = bbox_main[2] - bbox_main[0]
            main_text_x = (image_width - main_text_width) / 2
            main_text_y = text_y_offset
            d.text((main_text_x, main_text_y), main_text or 'Your Poster Title', font=main_font, fill=text_color)

            # Sub Text
            bbox_sub = d.textbbox((0,0), sub_text or 'Catchy slogan or details here.', font=sub_font)
            sub_text_width = bbox_sub[2] - bbox_sub[0]
            sub_text_x = (image_width - sub_text_width) / 2
            sub_text_y = main_text_y + main_font.size + 20
            d.text((sub_text_x, sub_text_y), sub_text or 'Catchy slogan or details here.', font=sub_font, fill=text_color)

            # Offer Details
            if offer_details:
                offer_font = get_robust_font(22, user_font_family)
                bbox_offer = d.textbbox((0,0), offer_details, font=offer_font)
                offer_width = bbox_offer[2] - bbox_offer[0]
                offer_x = (image_width - offer_width) / 2
                offer_y = sub_text_y + sub_font.size + 20
                d.text((offer_x, offer_y), offer_details, font=offer_font, fill='red')

            # Contact Info
            contact_y = image_height - 80
            if phone_number:
                d.text((image_width - 20, contact_y), f"Call: {phone_number}", font=small_font, fill=text_color, anchor="ra")
                contact_y += small_font.size + 5
            if website:
                d.text((image_width - 20, contact_y), f"Visit: {website}", font=small_font, fill=text_color, anchor="ra")
            elif not phone_number:
                d.text((image_width - 20, contact_y), "Grogent.com", font=small_font, fill=text_color, anchor="ra")

        elif template_type == 'businessCard':
            main_font = get_robust_font(30, user_font_family)
            sub_font = get_robust_font(20, user_font_family)
            small_font = get_robust_font(16, user_font_family)

            current_y = 80 if logo_base64 else 40

            # Main Text
            bbox_main = d.textbbox((0,0), main_text or 'Your Business Name', font=main_font)
            main_text_width = bbox_main[2] - bbox_main[0]
            d.text(((image_width - main_text_width) / 2, current_y), main_text or 'Your Business Name', font=main_font, fill=text_color)
            current_y += main_font.size + 10

            # Sub Text
            bbox_sub = d.textbbox((0,0), sub_text or 'Your Tagline / Name', font=sub_font)
            sub_text_width = bbox_sub[2] - bbox_sub[0]
            d.text(((image_width - sub_text_width) / 2, current_y), sub_text or 'Your Tagline / Name', font=sub_font, fill=text_color)
            current_y += sub_font.size + 20

            # Contact Info
            d.text((image_width / 2, current_y), f"Contact: {phone_number or '123-456-7890'}", font=small_font, fill=text_color, anchor="mm")
            current_y += small_font.size + 5
            d.text((image_width / 2, current_y), f"Email: {email or 'info@example.com'}", font=small_font, fill=text_color, anchor="mm")
            current_y += small_font.size + 5
            if website:
                d.text((image_width / 2, current_y), f"Web: {website}", font=small_font, fill=text_color, anchor="mm")

        elif template_type == 'modernEventPoster':
            header_height = image_height * 0.25

            # Header
            d.rectangle([(0, 0), (image_width, header_height)], fill=text_color)
            
            header_text_font = get_robust_font(50, user_font_family)
            bbox_header_text = d.textbbox((0,0), main_text or 'Modern Event', font=header_text_font)
            header_text_width = bbox_header_text[2] - bbox_header_text[0]
            d.text(((image_width - header_text_width) / 2, header_height / 2 - header_text_font.size / 2 + (30 if logo_base64 else 0)),
                   main_text or 'Modern Event', font=header_text_font, fill=bg_color)

            # Body
            body_main_font = get_robust_font(30, user_font_family)
            small_font = get_robust_font(18, user_font_family)
            
            current_y = header_height + 50
            
            # Sub Text
            bbox_sub = d.textbbox((0,0), sub_text or 'Join Us for an Exciting Experience!', font=body_main_font)
            sub_text_width = bbox_sub[2] - bbox_sub[0]
            d.text(((image_width - sub_text_width) / 2, current_y), sub_text or 'Join Us for an Exciting Experience!', font=body_main_font, fill=text_color)
            current_y += body_main_font.size + 20

            # Offer Details
            if offer_details:
                offer_font = get_robust_font(24, user_font_family)
                bbox_offer = d.textbbox((0,0), offer_details, font=offer_font)
                offer_width = bbox_offer[2] - bbox_offer[0]
                d.text(((image_width - offer_width) / 2, current_y), offer_details, font=offer_font, fill='red')
                current_y += offer_font.size + 30

            # Call to Action
            cta_text = website if website else 'Learn More at Grogent.com'
            cta_font = get_robust_font(22, user_font_family)
            bbox_cta = d.textbbox((0,0), cta_text, font=cta_font)
            cta_width = bbox_cta[2] - bbox_cta[0] + 40
            cta_height = bbox_cta[3] - bbox_cta[1] + 20
            
            cta_x = (image_width - cta_width) / 2
            cta_y = current_y
            d.rectangle([(cta_x, cta_y), (cta_x + cta_width, cta_y + cta_height)], fill=text_color, radius=5)
            d.text((cta_x + 20, cta_y + 10), cta_text, font=cta_font, fill=bg_color)
            current_y += cta_height + 20

            if phone_number:
                d.text((image_width / 2, current_y), f"Contact: {phone_number}", font=small_font, fill=text_color, anchor="mm")

        elif template_type == 'minimalistBusinessCard':
            main_font = get_robust_font(35, user_font_family)
            sub_font = get_robust_font(22, user_font_family)
            small_font = get_robust_font(18, user_font_family)

            current_y = 30

            # Main Text
            bbox_main = d.textbbox((0,0), main_text or 'Your Name', font=main_font)
            main_text_width = bbox_main[2] - bbox_main[0]
            d.text((image_width - 20 - main_text_width, current_y), main_text or 'Your Name', font=main_font, fill=text_color)
            current_y += main_font.size + 5

            # Sub Text
            bbox_sub = d.textbbox((0,0), sub_text or 'Your Professional Title', font=sub_font)
            sub_text_width = bbox_sub[2] - bbox_sub[0]
            d.text((image_width - 20 - sub_text_width, current_y), sub_text or 'Your Professional Title', font=sub_font, fill=text_color)
            current_y += sub_font.size + 20

            # Contact Info
            contact_y = image_height - 20 - (small_font.size + 5) * (3 if website else (2 if email else 1))
            if website:
                bbox_web = d.textbbox((0,0), website, font=small_font)
                web_width = bbox_web[2] - bbox_web[0]
                d.text((image_width - 20 - web_width, contact_y), website, font=small_font, fill=text_color)
                contact_y -= (small_font.size + 5)
            if email:
                bbox_email = d.textbbox((0,0), email, font=small_font)
                email_width = bbox_email[2] - bbox_email[0]
                d.text((image_width - 20 - email_width, contact_y), email, font=small_font, fill=text_color)
                contact_y -= (small_font.size + 5)
            if phone_number:
                bbox_phone = d.textbbox((0,0), phone_number, font=small_font)
                phone_width = bbox_phone[2] - bbox_phone[0]
                d.text((image_width - 20 - phone_width, contact_y), phone_number, font=small_font, fill=text_color)
            elif not (phone_number or email or website):
                d.text((image_width - 20 - d.textbbox((0,0), '+1 (234) 567-8900', font=small_font)[2], contact_y), '+1 (234) 567-8900', font=small_font, fill=text_color)
                contact_y -= (small_font.size + 5)
                d.text((image_width - 20 - d.textbbox((0,0), 'email@example.com', font=small_font)[2], contact_y), 'email@example.com', font=small_font, fill=text_color)
                contact_y -= (small_font.size + 5)
                d.text((image_width - 20 - d.textbbox((0,0), 'yourwebsite.com', font=small_font)[2], contact_y), 'yourwebsite.com', font=small_font, fill=text_color)

        elif template_type == 'vibrantOfferPoster':
            header_height = image_height * 0.25

            # Header
            d.rectangle([(0, 0), (image_width, header_height)], fill=text_color)
            
            header_text_font = get_robust_font(50, user_font_family)
            bbox_header_text = d.textbbox((0,0), main_text or 'BIG SALE!', font=header_text_font)
            header_text_width = bbox_header_text[2] - bbox_header_text[0]
            d.text(((image_width - header_text_width) / 2, header_height / 2 - header_text_font.size / 2 + (30 if logo_base64 else 0)),
                   main_text or 'BIG SALE!', font=header_text_font, fill=bg_color)

            # Body
            body_main_font = get_robust_font(35, user_font_family)
            small_font = get_robust_font(18, user_font_family)
            
            current_y = header_height + 50
            
            # Sub Text
            bbox_sub = d.textbbox((0,0), sub_text or 'Up to 50% Off Everything!', font=body_main_font)
            sub_text_width = bbox_sub[2] - bbox_sub[0]
            d.text(((image_width - sub_text_width) / 2, current_y), sub_text or 'Up to 50% Off Everything!', font=body_main_font, fill=text_color)
            current_y += body_main_font.size + 20

            # Offer Details
            if offer_details:
                offer_font = get_robust_font(28, user_font_family)
                bbox_offer = d.textbbox((0,0), offer_details, font=offer_font)
                offer_width = bbox_offer[2] - bbox_offer[0]
                d.text(((image_width - offer_width) / 2, current_y), offer_details, font=offer_font, fill='darkred')
                current_y += offer_font.size + 30

            # Call to Action
            cta_text = website if website else 'Shop Now!'
            cta_font = get_robust_font(26, user_font_family)
            bbox_cta = d.textbbox((0,0), cta_text, font=cta_font)
            cta_width = bbox_cta[2] - bbox_cta[0] + 50
            cta_height = bbox_cta[3] - bbox_cta[1] + 30
            
            cta_x = (image_width - cta_width) / 2
            cta_y = current_y
            d.rounded_rectangle([(cta_x, cta_y), (cta_x + cta_width, cta_y + cta_height)], radius=50, fill='red')
            d.text((cta_x + 25, cta_y + 15), cta_text, font=cta_font, fill='white')
            current_y += cta_height + 20

            if phone_number:
                d.text((image_width / 2, image_height - 80), f"Call: {phone_number}", font=small_font, fill=text_color, anchor="mm")
            
            d.text((image_width / 2, image_height - 30), "Limited Time Offer", font=small_font, fill=text_color, anchor="mm")

        elif template_type == 'professionalFlyer':
            main_font = get_robust_font(55, user_font_family)
            sub_font = get_robust_font(30, user_font_family)
            body_font = get_robust_font(22, user_font_family)
            small_font = get_robust_font(20, user_font_family)

            current_y = 30

            # Main Text
            height_used = draw_text_wrapped(d, main_text or 'Professional Service', main_font, text_color, (30, current_y), image_width - 60 - (100 if logo_base64 else 0))
            current_y += height_used + 15

            # Sub Text
            height_used = draw_text_wrapped(d, sub_text or 'Your Tagline Goes Here', sub_font, text_color, (30, current_y), image_width - 60)
            current_y += height_used + 25

            # Offer Details / Body Text
            height_used = draw_text_wrapped(d, offer_details or 'Discover how our solutions can help your business grow. We offer unparalleled quality and dedicated support.', body_font, text_color, (30, current_y), image_width - 60)
            current_y += height_used + 30

            # Contact Section
            d.line([(30, current_y), (image_width - 30, current_y)], fill=text_color, width=1)
            current_y += 20

            if phone_number:
                d.text((30, current_y), f"Phone: {phone_number}", font=small_font, fill=text_color)
                current_y += small_font.size + 5
            if email:
                d.text((30, current_y), f"Email: {email}", font=small_font, fill=text_color)
                current_y += small_font.size + 5
            if website:
                d.text((30, current_y), f"Website: {website}", font=small_font, fill=text_color)
            elif not (phone_number or email):
                d.text((30, current_y), "Learn more at Grogent.com", font=small_font, fill=text_color)

        elif template_type == 'socialMediaPost':
            main_font = get_robust_font(40, user_font_family)
            sub_font = get_robust_font(30, user_font_family)
            cta_font = get_robust_font(22, user_font_family)
            
            current_y = 20

            # Header (Brand Name)
            brand_name = main_text or 'Your Brand Name'
            bbox_brand = d.textbbox((0,0), brand_name, font=sub_font)
            brand_width = bbox_brand[2] - bbox_brand[0]
            d.text((20 + (80 if logo_base64 else 0), current_y + (60 - sub_font.size) / 2), brand_name, font=sub_font, fill=text_color)
            current_y += 80

            # Main Content
            content_center_y = image_height / 2
            
            # Sub Text (Product Launch)
            bbox_sub = d.textbbox((0,0), sub_text or 'New Product Launch!', font=main_font)
            sub_text_width = bbox_sub[2] - bbox_sub[0]
            d.text(((image_width - sub_text_width) / 2, content_center_y - main_font.size - 15), sub_text or 'New Product Launch!', font=main_font, fill=text_color)

            # Offer Details
            if offer_details:
                bbox_offer = d.textbbox((0,0), offer_details, font=sub_font)
                offer_width = bbox_offer[2] - bbox_offer[0]
                d.text(((image_width - offer_width) / 2, content_center_y + 15), offer_details, font=sub_font, fill='green')
                
            # Call to Action
            cta_text = f"Shop Now: {website.replace('https://', '').replace('http://', '').replace('www.', '')}" if website else 'Learn More'
            bbox_cta = d.textbbox((0,0), cta_text, font=cta_font)
            cta_width = bbox_cta[2] - bbox_cta[0] + 40
            cta_height = bbox_cta[3] - bbox_cta[1] + 20
            
            cta_x = (image_width - cta_width) / 2
            cta_y = image_height - 80
            d.rectangle([(cta_x, cta_y), (cta_x + cta_width, cta_y + cta_height)], fill=text_color, radius=5)
            d.text((cta_x + 20, cta_y + 10), cta_text, font=cta_font, fill=bg_color)

        elif template_type == 'eventTicket':
            main_font = get_robust_font(35, user_font_family)
            detail_font = get_robust_font(22, user_font_family)
            small_font = get_robust_font(18, user_font_family)

            # Left stripe
            d.rectangle([(0, 0), (10, image_height)], fill=text_color)

            current_y = 20

            # Header (Event Name)
            event_name = main_text or 'Event Name'
            bbox_event = d.textbbox((0,0), event_name, font=main_font)
            event_width = bbox_event[2] - bbox_event[0]
            d.text((20, current_y), event_name, font=main_font, fill=text_color)
            current_y += main_font.size + 15

            # Details
            d.text((20, current_y), f"Date: {sub_text or 'DD/MM/YYYY'}", font=detail_font, fill=text_color)
            current_y += detail_font.size + 5
            d.text((20, current_y), f"Time: {offer_details or 'HH:MM AM/PM'}", font=detail_font, fill=text_color)
            current_y += detail_font.size + 5
            d.text((20, current_y), f"Location: {website or 'Venue Address'}", font=detail_font, fill=text_color)
            current_y += detail_font.size + 5

            # Footer (Ticket ID)
            ticket_id = f"Ticket ID: #GRG{datetime.now().microsecond % 9000 + 1000}"
            bbox_id = d.textbbox((0,0), ticket_id, font=small_font)
            id_width = bbox_id[2] - bbox_id[0]
            d.text((image_width - 20 - id_width, image_height - 30), ticket_id, font=small_font, fill=text_color)

        elif template_type == 'traditionalIndianBusinessCard':
            top_bg_color = '#004d40'
            top_text_color = '#ffeb3b'
            bottom_bg_color = '#e0b973'
            bottom_text_color = '#004d40'

            d.rectangle([(0, 0), (image_width, image_height // 2)], fill=top_bg_color)
            d.rectangle([(0, image_height // 2), (image_width, image_height)], fill=bottom_bg_color)

            main_font = get_robust_font(28, user_font_family)
            sub_font = get_robust_font(18, user_font_family)
            small_font = get_robust_font(16, user_font_family)

            main_text_content = main_text or 'Your Business Name'
            bbox_main = d.textbbox((0,0), main_text_content, font=main_font)
            main_text_width = bbox_main[2] - bbox_main[0]
            main_text_x = image_width - main_text_width - 20
            main_text_y = (image_height // 2) / 2 - main_font.size / 2 - 10
            d.text((main_text_x, main_text_y), main_text_content, font=main_font, fill=top_text_color)

            sub_text_content = sub_text or 'Crafting Excellence'
            bbox_sub = d.textbbox((0,0), sub_text_content, font=sub_font)
            sub_text_width = bbox_sub[2] - bbox_sub[0]
            sub_text_x = image_width - sub_text_width - 20
            sub_text_y = main_text_y + main_font.size + 5
            d.text((sub_text_x, sub_text_y), sub_text_content, font=sub_font, fill=top_text_color)

            contact_lines = []
            if phone_number:
                contact_lines.append(phone_number)
            if email:
                contact_lines.append(email)
            if website:
                contact_lines.append(website)
            
            if not contact_lines:
                contact_lines.append('+91 98765 43210')
                contact_lines.append('contact@indianbiz.com')

            total_contact_height = sum([small_font.size * 1.3 for _ in contact_lines])
            current_contact_y = (image_height // 2) + (image_height // 2) / 2 - total_contact_height / 2

            for line in contact_lines:
                bbox_line = d.textbbox((0,0), line, font=small_font)
                line_width = bbox_line[2] - bbox_line[0]
                d.text(((image_width - line_width) / 2, current_contact_y), line, font=small_font, fill=bottom_text_color)
                current_contact_y += small_font.size * 1.3

        elif template_type == 'productDiscountBanner':
            main_font = get_robust_font(60, user_font_family)
            sub_font = get_robust_font(35, user_font_family)
            offer_font = get_robust_font(25, user_font_family)
            website_font = get_robust_font(22, user_font_family)

            content_width = image_width - 40
            content_x_start = 20

            current_y = image_height * 0.2

            # Main Text
            height_used = draw_text_wrapped(d, main_text or 'Flash Sale!', main_font, text_color, (content_x_start, current_y), content_width)
            current_y += height_used + 10

            # Sub Text
            height_used = draw_text_wrapped(d, sub_text or 'Up to 70% Off!', sub_font, text_color, (content_x_start, current_y), content_width)
            current_y += height_used + 10

            # Offer Details
            if offer_details:
                height_used = draw_text_wrapped(d, offer_details, offer_font, 'red', (content_x_start, current_y), content_width)
                current_y += height_used + 15

            # Website/Call to Action
            if website:
                website_text = f"Shop Now: {website.replace('https://', '').replace('http://', '').replace('www.', '')}"
                bbox_website = d.textbbox((0,0), website_text, font=website_font)
                website_width = bbox_website[2] - bbox_website[0]
                website_x = (image_width - website_width) / 2
                d.text((website_x, current_y), website_text, font=website_font, fill=text_color)

        elif template_type == 'inspirationalQuoteCard':
            quote_font = get_robust_font(40, user_font_family)
            author_font = get_robust_font(25, user_font_family)
            website_font = get_robust_font(18, user_font_family)

            # Quote
            quote_text = f"\u201c{main_text or 'The only way to do great work is to love what you do.'}\u201d"
            height_used = draw_text_wrapped(d, quote_text, quote_font, text_color, (50, image_height * 0.25), image_width - 100)
            current_y = image_height * 0.25 + height_used + 20 # Position author below quote

            # Author
            author_text = f"\u2014 {sub_text or 'Steve Jobs'}"
            bbox_author = d.textbbox((0,0), author_text, font=author_font)
            author_width = bbox_author[2] - bbox_author[0]
            author_x = (image_width - author_width) / 2
            d.text((author_x, current_y), author_text, font=author_font, fill=text_color)
            current_y += author_font.size + 15

            # Website (optional)
            if website:
                website_display = website.replace('https://', '').replace('http://', '').replace('www.', '')
                bbox_website = d.textbbox((0,0), website_display, font=website_font)
                website_width = bbox_website[2] - bbox_website[0]
                website_x = (image_width - website_width) / 2
                d.text((website_x, current_y), website_display, font=website_font, fill=text_color)

        elif template_type == 'eventInvitationCard':
            title_font = get_robust_font(45, user_font_family)
            event_name_font = get_robust_font(30, user_font_family)
            detail_font = get_robust_font(22, user_font_family)
            rsvp_font = get_robust_font(18, user_font_family)

            current_y = 25

            # Title
            bbox_title = d.textbbox((0,0), main_text or 'You\'re Invited!', font=title_font)
            d.text((25, current_y), main_text or 'You\'re Invited!', font=title_font, fill=text_color)
            current_y += title_font.size + 10

            # Event Name
            bbox_event_name = d.textbbox((0,0), sub_text or 'Special Event Name', font=event_name_font)
            d.text((25, current_y), sub_text or 'Special Event Name', font=event_name_font, fill=text_color)
            current_y += event_name_font.size + 20

            # Details
            d.text((25, current_y), f"Date: {offer_details or 'October 26, 2025'}", font=detail_font, fill=text_color)
            current_y += detail_font.size + 5
            d.text((25, current_y), f"Time: {phone_number or '7:00 PM EST'}", font=detail_font, fill=text_color)
            current_y += detail_font.size + 5
            d.text((25, current_y), f"Location: {website or 'Virtual / Your Venue'}", font=detail_font, fill=text_color)
            current_y += detail_font.size + 5

            # RSVP
            if email:
                d.text((25, current_y + 10), f"RSVP: {email}", font=rsvp_font, fill=text_color)

        elif template_type == 'productShowcasePost':
            product_name_font = get_robust_font(50, user_font_family)
            tagline_font = get_robust_font(28, user_font_family)
            offer_font = get_robust_font(22, user_font_family)
            cta_font = get_robust_font(24, user_font_family)

            current_y = image_height * 0.3 # Start from 30% down

            # Product Name
            height_used = draw_text_wrapped(d, main_text or 'Amazing Product Name', product_name_font, text_color, (30, current_y), image_width - 60)
            current_y += height_used + 10

            # Tagline
            height_used = draw_text_wrapped(d, sub_text or 'Discover unparalleled quality.', tagline_font, text_color, (30, current_y), image_width - 60)
            current_y += height_used + 20

            # Offer Details
            if offer_details:
                height_used = draw_text_wrapped(d, offer_details, offer_font, 'green', (30, current_y), image_width - 60)
                current_y += height_used + 25

            # Call to Action
            cta_text = f"Buy Now: {website.replace('https://', '').replace('http://', '').replace('www.', '')}" if website else 'Learn More'
            bbox_cta = d.textbbox((0,0), cta_text, font=cta_font)
            cta_width = bbox_cta[2] - bbox_cta[0] + 50
            cta_height = bbox_cta[3] - bbox_cta[1] + 30
            
            cta_x = (image_width - cta_width) / 2
            cta_y = current_y + 10 # Add some space before CTA
            d.rectangle([(cta_x, cta_y), (cta_x + cta_width, cta_y + cta_height)], fill=text_color, radius=5)
            d.text((cta_x + 25, cta_y + 15), cta_text, font=cta_font, fill=bg_color)

        elif template_type == 'limitedTimeOfferBanner':
            main_font = get_robust_font(70, user_font_family)
            sub_font = get_robust_font(35, user_font_family)
            offer_font = get_robust_font(25, user_font_family)
            cta_font = get_robust_font(22, user_font_family)

            content_width = image_width - 40
            content_x_start = 20

            current_y = image_height * 0.2

            # Main Text
            height_used = draw_text_wrapped(d, main_text or 'Limited Time Offer!', main_font, '#dc3545', (content_x_start, current_y), content_width)
            current_y += height_used + 5

            # Sub Text
            height_used = draw_text_wrapped(d, sub_text or 'Save Big Today!', sub_font, text_color, (content_x_start, current_y), content_width)
            current_y += height_used + 10

            # Offer Details
            if offer_details:
                height_used = draw_text_wrapped(d, offer_details, offer_font, '#dc3545', (content_x_start, current_y), content_width)
                current_y += height_used + 10

            # Call to Action
            if website:
                website_text = f"Claim Your Deal: {website.replace('https://', '').replace('http://', '').replace('www.', '')}"
                bbox_cta = d.textbbox((0,0), website_text, font=cta_font)
                cta_width = bbox_cta[2] - bbox_cta[0]
                cta_x = (image_width - cta_width) / 2
                d.text((cta_x, current_y + 10), website_text, font=cta_font, fill='#007bff') # Changed cta_text to website_text

        elif template_type == 'elegantContactCard':
            name_font = get_robust_font(35, user_font_family)
            title_font = get_robust_font(22, user_font_family)
            contact_font = get_robust_font(18, user_font_family)

            current_y = 25 + (60 if logo_base64 else 0)

            # Name
            bbox_name = d.textbbox((0,0), main_text or 'Your Name', font=name_font)
            name_width = bbox_name[2] - bbox_name[0]
            d.text(((image_width - name_width) / 2, current_y), main_text or 'Your Name', font=name_font, fill=text_color)
            current_y += name_font.size + 5

            # Title
            bbox_title = d.textbbox((0,0), sub_text or 'Your Professional Title', font=title_font)
            title_width = bbox_title[2] - bbox_title[0]
            d.text(((image_width - title_width) / 2, current_y), sub_text or 'Your Professional Title', font=title_font, fill=text_color)
            current_y += title_font.size + 20

            # Separator Line
            line_y = current_y
            d.line([(image_width * 0.2, line_y), (image_width * 0.8, line_y)], fill=text_color, width=1)
            current_y += 15

            # Contact Info
            contact_lines = []
            if phone_number: contact_lines.append(phone_number)
            if email: contact_lines.append(email)
            if website: contact_lines.append(website)

            for line in contact_lines:
                bbox_line = d.textbbox((0,0), line, font=contact_font)
                line_width = bbox_line[2] - bbox_line[0]
                d.text(((image_width - line_width) / 2, current_y), line, font=contact_font, fill=text_color)
                current_y += contact_font.size + 5

        elif template_type == 'modernTechBusinessCard':
            name_font = get_robust_font(35, user_font_family)
            title_font = get_robust_font(22, user_font_family)
            contact_font = get_robust_font(18, user_font_family)

            # Left bar background
            bar_width = image_width * 0.3
            d.rectangle([(0, 0), (bar_width, image_height)], fill=text_color)

            # Text content (right side)
            text_start_x = bar_width + 20
            current_y = (image_height - (name_font.size + title_font.size + contact_font.size * 3 + 30)) / 2

            # Name
            d.text((text_start_x, current_y), main_text or 'Tech Solutions Inc.', font=name_font, fill=text_color)
            current_y += name_font.size + 5

            # Title
            d.text((text_start_x, current_y), sub_text or 'Innovating the Future', font=title_font, fill=text_color)
            current_y += title_font.size + 20

            # Contact Info
            if phone_number:
                d.text((text_start_x, current_y), phone_number, font=contact_font, fill=text_color)
                current_y += contact_font.size + 5
            if email:
                d.text((text_start_x, current_y), email, font=contact_font, fill=text_color)
                current_y += contact_font.size + 5
            if website:
                d.text((text_start_x, current_y), website, font=contact_font, fill=text_color)

        elif template_type == 'minimalistQrCodeCard':
            name_font = get_robust_font(30, user_font_family)
            website_font = get_robust_font(18, user_font_family)
            qr_text_font = get_robust_font(12, user_font_family)

            # QR Code Placeholder
            qr_size = 100
            qr_x = (image_width - qr_size) / 2
            qr_y = (image_height - qr_size) / 2 - 20
            d.rectangle([(qr_x, qr_y), (qr_x + qr_size, qr_y + qr_size)], fill=text_color)
            
            # Text inside QR placeholder
            qr_placeholder_text = "QR Code Here"
            bbox_qr_text = d.textbbox((0,0), qr_placeholder_text, font=qr_text_font)
            qr_text_width = bbox_qr_text[2] - bbox_qr_text[0]
            qr_text_height = bbox_qr_text[3] - bbox_qr_text[1]
            d.text((qr_x + (qr_size - qr_text_width) / 2, qr_y + (qr_size - qr_text_height) / 2), qr_placeholder_text, font=qr_text_font, fill=bg_color)

            # Name below QR
            current_y = qr_y + qr_size + 15
            bbox_name = d.textbbox((0,0), main_text or 'Your Name', font=name_font)
            name_width = bbox_name[2] - bbox_name[0]
            d.text(((image_width - name_width) / 2, current_y), main_text or 'Your Name', font=name_font, fill=text_color)
            current_y += name_font.size + 5

            # Website below name
            if website:
                bbox_website = d.textbbox((0,0), website, font=website_font)
                website_width = bbox_website[2] - bbox_website[0]
                d.text(((image_width - website_width) / 2, current_y), website, font=website_font, fill=text_color)

        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode()
    except Exception as e:
        print(f"Error generating image: {e}")
        img = Image.new('RGB', (image_width, image_height), color='red')
        d = ImageDraw.Draw(img)
        error_msg = f"Error: {e}"
        error_font = ImageFont.load_default()
        error_font.size = 20
        bbox_error = d.textbbox((0,0), error_msg, font=error_font)
        error_width = bbox_error[2] - bbox_error[0]
        error_height = bbox_error[3] - bbox_error[1]
        d.text(((image_width - error_width) / 2, (image_height - error_height) / 2), error_msg, fill='white', font=error_font)
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode()

class BusinessAnalyzer:
    def __init__(self):
        """Initialize the Portia agent for business analysis"""
        try:
            # Check if Google API key is available
            if not GOOGLE_API_KEY:
                raise ValueError("GOOGLE_API_KEY is required. Please add it to your .env file")
            
            # Configure Portia with proper settings
            self.config = Config.from_default(
                llm_provider=LLMProvider.GOOGLE,
                storage_class=StorageClass.MEMORY,
                llm_config={
                    "temperature": 0.7,
                    "max_tokens": 2000,
                    "google_api_key": GOOGLE_API_KEY # Pass the key explicitly to Portia config
                }
            )
            
            # Initialize tools separately to avoid conflicts
            self.tools = PortiaToolRegistry(self.config)
            
            # Add browser tool only if not already present
            try:
                self.browser_tool = BrowserTool(
                    infrastructure_option=BrowserInfrastructureOption.LOCAL
                )
                # Only add if not duplicate
                if not any(tool.id == "browser_tool" for tool in self.tools.tools):
                    self.tools = self.tools + [self.browser_tool]
            except Exception as browser_error:
                logger.warning(f"Browser tool initialization failed, continuing without it: {browser_error}")
                self.browser_tool = None
            
            # Initialize Portia agent with error handling
            self.portia = Portia(
                config=self.config,
                tools=self.tools
            )
            
            logger.info("BusinessAnalyzer initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize BusinessAnalyzer: {e}")
            # Don't raise here, allow fallback to mock analysis
            self.portia = None
            self.browser_tool = None

    async def analyze_business_idea(self, request: BusinessIdeaRequest, analysis_id: str):
        """Perform comprehensive business idea analysis using Portia or fallback"""
        try:
            # Update status
            analysis_storage[analysis_id]["status"] = "in_progress"
            analysis_storage[analysis_id]["current_step"] = "Starting Analysis"
            analysis_storage[analysis_id]["progress"] = 10
            
            # Check if Portia is available
            if self.portia is None:
                logger.warning("Portia not available, using fallback analysis")
                return await self._fallback_analysis(request, analysis_id)
            
            # Step 1: Industry Research
            analysis_storage[analysis_id]["current_step"] = "Industry Research"
            analysis_storage[analysis_id]["progress"] = 25
            
            industry_task = self._create_industry_task(request)
            industry_analysis = await self._safe_portia_run(industry_task, "Industry research completed")
            
            # Step 2: Competitor Analysis
            analysis_storage[analysis_id]["current_step"] = "Competitor Analysis"
            analysis_storage[analysis_id]["progress"] = 50
            
            competitor_task = self._create_competitor_task(request)
            competitor_analysis = await self._safe_portia_run(competitor_task, "Competitor analysis completed")
            
            # Step 3: Platform Analysis
            analysis_storage[analysis_id]["current_step"] = "Social Media Platform Analysis"
            analysis_storage[analysis_id]["progress"] = 75
            
            platform_task = self._create_platform_task(request)
            platform_analysis = await self._safe_portia_run(platform_task, "Platform analysis completed")
            
            # Step 4: Insights Generation
            analysis_storage[analysis_id]["current_step"] = "Generating Insights"
            analysis_storage[analysis_id]["progress"] = 90
            
            insights_task = self._create_insights_task(request)
            insights_analysis = await self._safe_portia_run(insights_task, "Strategic insights generated")
            
            # Process results
            result = self._process_analysis_results(
                request, analysis_id, 
                industry_analysis, competitor_analysis, 
                platform_analysis, insights_analysis
            )
            
            # Update final status
            analysis_storage[analysis_id]["status"] = "completed"
            analysis_storage[analysis_id]["progress"] = 100
            analysis_storage[analysis_id]["current_step"] = "Analysis Complete"
            analysis_storage[analysis_id]["completed_at"] = datetime.now()
            
            # Store results
            analysis_results[analysis_id] = result
            
            logger.info(f"Analysis {analysis_id} completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Analysis {analysis_id} failed: {e}")
            analysis_storage[analysis_id]["status"] = "failed"
            analysis_storage[analysis_id]["current_step"] = f"Error: {str(e)}"
            
            # Try fallback analysis instead of complete failure
            try:
                logger.info("Attempting fallback analysis...")
                return await self._fallback_analysis(request, analysis_id)
            except Exception as fallback_error:
                logger.error(f"Fallback analysis also failed: {fallback_error}")
                raise e

    async def _safe_portia_run(self, task: str, fallback_message: str) -> str:
        """Safely run Portia task with error handling"""
        try:
            if self.portia:
                result = self.portia.run(task)
                if hasattr(result, 'outputs') and hasattr(result.outputs, 'final_output'):
                    return str(result.outputs.final_output) or fallback_message
                else:
                    return str(result) or fallback_message
            else:
                return fallback_message
        except Exception as e:
            logger.warning(f"Portia run failed: {e}, using fallback")
            return fallback_message

    async def _fallback_analysis(self, request: BusinessIdeaRequest, analysis_id: str):
        """Fallback analysis when Portia fails"""
        logger.info("Running fallback analysis with mock data")
        
        # Simulate analysis steps
        steps = [
            ("Industry Research", 25),
            ("Competitor Analysis", 50), 
            ("Platform Analysis", 75),
            ("Generating Insights", 90)
        ]
        
        for step_name, progress in steps:
            analysis_storage[analysis_id]["current_step"] = step_name
            analysis_storage[analysis_id]["progress"] = progress
            await asyncio.sleep(2)  # Simulate processing time
        
        # Generate fallback result
        result = self._generate_fallback_result(request, analysis_id)
        
        # Update final status
        analysis_storage[analysis_id]["status"] = "completed"
        analysis_storage[analysis_id]["progress"] = 100
        analysis_storage[analysis_id]["current_step"] = "Analysis Complete"
        analysis_storage[analysis_id]["completed_at"] = datetime.now()
        
        # Store results
        analysis_results[analysis_id] = result
        
        return result

    def _create_industry_task(self, request: BusinessIdeaRequest) -> str:
        return f"""
        Research the {request.industry} industry focusing on:
        1. Current market trends and size
        2. Key players and market leaders
        3. Growth opportunities and challenges
        4. Target demographic insights for {request.target_audience}
        
        Business idea context: {request.business_idea}
        Location focus: {request.location}
        
        Please provide a comprehensive overview of the industry landscape.
        """

    def _create_competitor_task(self, request: BusinessIdeaRequest) -> str:
        return f"""
        Find and analyze 3-5 main competitors for this business idea: {request.business_idea}
        
        For each competitor, research:
        1. Company name and website
        2. Social media presence (Instagram, TikTok, Facebook, LinkedIn, Twitter, YouTube)
        3. Follower counts and engagement rates where possible
        4. Content strategy and posting frequency
        5. Strengths and weaknesses
        6. Target audience overlap with: {request.target_audience}
        
        Focus on {request.industry} industry in {request.location}.
        """

    def _create_platform_task(self, request: BusinessIdeaRequest) -> str:
        return f"""
        Analyze the best social media platforms for this business: {request.business_idea}
        
        Target audience: {request.target_audience}
        Industry: {request.industry}
        Location: {request.location}
        Goals: {', '.join(request.goals)}
        Budget: {request.budget_range}
        
        For each major platform (Instagram, TikTok, Facebook, LinkedIn, Twitter, YouTube, Pinterest), analyze:
        1. Audience demographics and size
        2. Engagement potential for this business type
        3. Competition level in this niche
        4. Content types that perform well
        5. Advertising costs and organic reach
        6. Specific strategies for growth
        
        Rank platforms by priority (high/medium/low) and provide specific recommendations.
        """

    def _create_insights_task(self, request: BusinessIdeaRequest) -> str:
        return f"""
        Based on the previous research, provide strategic insights for: {request.business_idea}
        
        Generate:
        1. Key market opportunities and threats
        2. Competitive advantages to focus on
        3. Target audience insights and personas
        4. Content strategy recommendations
        5. 5-10 specific action items to get started
        6. Timeline and priority recommendations
        
        Consider the industry research, competitor analysis, and platform recommendations.
        """

    def _generate_fallback_result(self, request: BusinessIdeaRequest, analysis_id: str) -> AnalysisResult:
        """Generate a comprehensive fallback result based on business idea"""
        
        # Industry-specific insights
        industry_insights = self._get_industry_insights(request.industry)
        
        # Target audience insights
        audience_insights = [
            f"Primary demographic: {request.target_audience}",
            f"Industry focus: {request.industry} consumers",
            "Mobile-first engagement preferred",
            "Values authenticity and transparency",
            "Price-conscious but quality-focused"
        ]
        
        # Platform recommendations based on industry and audience
        platforms = self._get_platform_recommendations(request.industry, request.target_audience)
        
        # Competitors (mock but realistic)
        competitors = self._get_mock_competitors(request.industry)
        
        # Key insights
        key_insights = [
            f"The {request.industry} market shows strong growth potential",
            "Visual content performs 3x better than text-only posts",
            "User-generated content drives highest engagement",
            f"Target audience of {request.target_audience} is underserved",
            "Mobile optimization is crucial for success"
        ]
        
        # Action items
        action_items = [
            "Set up business profiles on recommended platforms",
            "Create 30-day content calendar",
            "Research trending hashtags in your niche",
            "Develop brand visual identity and style guide",
            "Plan user-generated content campaign",
            "Set up analytics and tracking systems",
            "Create competitor monitoring system",
            "Develop content creation workflow"
        ]
        
        return AnalysisResult(
            analysis_id=analysis_id,
            business_idea=request.business_idea,
            industry_overview=industry_insights["overview"],
            target_audience_insights=audience_insights,
            competitors=competitors,
            platform_recommendations=platforms,
            key_insights=key_insights,
            action_items=action_items,
            generated_at=datetime.now()
        )

    def _get_industry_insights(self, industry: str) -> Dict[str, str]:
        """Get industry-specific insights"""
        insights = {
            "Education": {
                "overview": "The education industry is experiencing rapid digital transformation, with online learning platforms growing 200% annually. Key trends include personalized learning, mobile accessibility, and interactive content. The market is valued at $350B+ globally with strong growth in edtech solutions."
            },
            "Technology": {
                "overview": "The technology sector continues robust growth with AI, cloud computing, and cybersecurity leading innovation. Market size exceeds $5 trillion globally with strong investor confidence and consumer adoption of digital solutions."
            },
            "Healthcare": {
                "overview": "Healthcare industry is undergoing digital disruption with telemedicine, wearable devices, and AI diagnostics. Market valued at $8+ trillion globally with increasing focus on preventive care and patient experience."
            }
        }
        
        return insights.get(industry, {
            "overview": f"The {industry} industry shows promising growth opportunities with increasing digitalization and changing consumer preferences. Market trends indicate strong potential for innovative solutions and customer-centric approaches."
        })

    def _get_platform_recommendations(self, industry: str, audience: str) -> List[PlatformRecommendation]:
        """Generate platform recommendations based on industry and audience"""
        
        base_platforms = [
            PlatformRecommendation(
                platform="Instagram",
                priority="high",
                reach_potential=9,
                engagement_potential=8,
                competition_level="medium",
                content_types=["Stories", "Reels", "IGTV", "Posts", "Shopping"],
                estimated_audience_size="50M+ relevant users",
                key_demographics=["25-45 age range", "Urban areas", "Visual content consumers"],
                pros=["High engagement rates", "Visual platform", "Shopping features", "Story format"],
                cons=["Algorithm changes", "Content creation intensive", "High competition"],
                recommended_strategy="Focus on high-quality visual content with consistent posting schedule and story engagement"
            ),
            PlatformRecommendation(
                platform="TikTok",
                priority="high" if "young" in audience.lower() or "gen z" in audience.lower() else "medium",
                reach_potential=10,
                engagement_potential=9,
                competition_level="low",
                content_types=["Short videos", "Trends", "Educational", "Entertainment", "Behind-the-scenes"],
                estimated_audience_size="30M+ relevant users",
                key_demographics=["16-35 age range", "Mobile-first", "Entertainment focused"],
                pros=["Viral potential", "Lower competition", "Organic reach", "Trend-driven"],
                cons=["Time-intensive", "Trend-dependent", "Younger audience", "Content lifespan"],
                recommended_strategy="Create trend-aware educational content with entertainment value and authentic personality"
            ),
            PlatformRecommendation(
                platform="LinkedIn",
                priority="high" if industry in ["Technology", "Finance", "Professional Services"] else "medium",
                reach_potential=7,
                engagement_potential=7,
                competition_level="medium",
                content_types=["Articles", "Posts", "Videos", "Professional updates", "Industry insights"],
                estimated_audience_size="20M+ professionals",
                key_demographics=["25-55 professionals", "Decision makers", "B2B focused"],
                pros=["Professional network", "B2B opportunities", "Thought leadership", "Quality audience"],
                cons=["Formal tone required", "Slower growth", "Limited viral potential"],
                recommended_strategy="Share industry insights and professional expertise to build thought leadership"
            )
        ]
        
        return base_platforms

    def _get_mock_competitors(self, industry: str) -> List[CompetitorAnalysis]:
        """Generate realistic mock competitors based on industry"""
        
        competitors = [
            CompetitorAnalysis(
                name=f"{industry} Leader Co",
                website=f"https://{industry.lower()}leader.com",
                social_media_presence={
                    "instagram": {"handle": f"@{industry.lower()}leader", "verified": True},
                    "tiktok": {"handle": f"@{industry.lower()}leader", "verified": False},
                    "facebook": {"page": f"{industry}LeaderPage", "verified": True},
                    "linkedin": {"company": f"{industry}-leader-co", "verified": True}
                },
                estimated_followers={
                    "instagram": 150000,
                    "tiktok": 89000,
                    "facebook": 45000,
                    "linkedin": 25000
                },
                content_strategy=[
                    "Educational content",
                    "Behind-the-scenes content",
                    "User-generated content",
                    "Industry news and updates",
                    "Product demonstrations"
                ],
                strengths=[
                    "Strong brand identity",
                    "Consistent posting schedule",
                    "High engagement rates",
                    "Diverse content types",
                    "Active community management"
                ],
                weaknesses=[
                    "Limited platform diversity",
                    "Higher price points",
                    "Slower response times",
                    "Less authentic feel"
                ]
            ),
            CompetitorAnalysis(
                name=f"Innovative {industry} Solutions",
                website=f"https://innovative{industry.lower()}.com",
                social_media_presence={
                    "instagram": {"handle": f"@innovative{industry.lower()}", "verified": False},
                    "tiktok": {"handle": f"@innovative{industry.lower()}", "verified": False},
                    "facebook": {"page": f"Innovative{industry}Solutions", "verified": False},
                    "youtube": {"channel": f"Innovative{industry}Solutions", "verified": True}
                },
                estimated_followers={
                    "instagram": 75000,
                    "tiktok": 125000,
                    "facebook": 30000,
                    "youtube": 95000
                },
                content_strategy=[
                    "Trend-based content",
                    "Educational tutorials",
                    "Community challenges",
                    "Live streaming",
                    "Collaborative content"
                ],
                strengths=[
                    "Strong TikTok presence",
                    "Viral content creation",
                    "Young audience appeal",
                    "Creative content approach",
                    "Fast trend adoption"
                ],
                weaknesses=[
                    "Inconsistent branding",
                    "Limited professional presence",
                    "Narrow demographic focus",
                    "Content quality varies"
                ]
            )
        ]
        
        return competitors

    def _process_analysis_results(self, request, analysis_id, industry_analysis, competitor_analysis, platform_analysis, insights_analysis):
        """Process and structure the analysis results from Portia or fallback"""
        
        # If we have real Portia analysis results, try to parse them
        if isinstance(industry_analysis, str) and len(industry_analysis) > 50:
            # Use Portia results
            return AnalysisResult(
                analysis_id=analysis_id,
                business_idea=request.business_idea,
                industry_overview=industry_analysis,
                target_audience_insights=[
                    f"Primary demographic: {request.target_audience}",
                    f"Industry focus: {request.industry} market",
                    "Analysis based on current market research",
                    "Competitive landscape analysis completed"
                ],
                competitors=self._get_mock_competitors(request.industry),
                platform_recommendations=self._get_platform_recommendations(request.industry, request.target_audience),
                key_insights=[
                    "Comprehensive market analysis completed",
                    "Platform recommendations based on industry best practices",
                    "Competitor analysis reveals market opportunities",
                    "Strategic recommendations aligned with business goals"
                ],
                action_items=[
                    "Implement recommended platform strategy",
                    "Monitor competitor activities",
                    "Create content calendar based on insights",
                    "Set up analytics tracking",
                    "Begin audience engagement campaigns"
                ],
                generated_at=datetime.now()
            )
        else:
            # Use fallback analysis
            return self._generate_fallback_result(request, analysis_id)

# Initialize analyzer
analyzer = BusinessAnalyzer()

# --- Pydantic models for Design and Scrape Endpoints ---
class DesignDataRequest(BaseModel):
    design_data: Dict[str, Any]
    template_type: str = 'poster'
    image_width: int = 800
    image_height: int = 1000

class ScrapeURLRequest(BaseModel):
    url: str

class GenerateTextRequest(BaseModel):
    prompt: str

# --- API Endpoints for Design Generation and Web Scraping ---

@app.post('/generate-design-image')
async def get_design_image_endpoint(design_request: DesignDataRequest):
    """Generates a design image based on provided data and template type."""
    try:
        image_base64 = generate_image_from_design(
            design_request.design_data,
            design_request.template_type,
            design_request.image_width,
            design_request.image_height
        )
        if image_base64:
            return {"image": image_base64}
        else:
            raise HTTPException(status_code=500, detail="Failed to generate image")
    except Exception as e:
        logger.error(f"Error in /generate-design-image: {e}")
        raise HTTPException(status_code=500, detail=f"Server error generating image: {e}")

@app.post('/scrape-content')
async def scrape_content_endpoint(scrape_request: ScrapeURLRequest):
    """Scrapes content (main text, sub text, URL) from a given URL."""
    url = scrape_request.url
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        main_text = ''
        title_tag = soup.find(['h1', 'h2'])
        if title_tag:
            main_text = title_tag.get_text(strip=True)
        elif soup.title:
            main_text = soup.title.get_text(strip=True)

        sub_text = ''
        first_p = soup.find('p')
        if first_p:
            sub_text = first_p.get_text(strip=True)
        else:
            meta_description = soup.find('meta', attrs={'name': 'description'})
            if meta_description and meta_description.get('content'):
                sub_text = meta_description['content'].strip()

        if main_text and len(main_text) > 100:
            main_text = main_text[:97] + '...'
        if sub_text and len(sub_text) > 200:
            sub_text = sub_text[:197] + '...'

        return {
            'main_text': main_text,
            'sub_text': sub_text,
            'url': url
        }

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f'Failed to fetch URL: {e}')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to parse content: {e}')

@app.post('/generate-text')
async def generate_text_endpoint(text_request: GenerateTextRequest):
    """Generates text using the Gemini AI model based on a given prompt."""
    prompt = text_request.prompt
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    try:
        response = gemini_model.generate_content(prompt)
        generated_text = ""
        for part in response.parts:
            if hasattr(part, 'text'):
                generated_text += part.text
        
        return {'text': generated_text}
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        raise HTTPException(status_code=500, detail=f'Failed to generate text: {e}')

# --- Existing FastAPI Endpoints for Business Analysis ---

@app.get("/")
async def root():
    return {"message": "Business Analysis & Design API with Portia AI", "version": "1.0.0", "status": "running"}

@app.post("/analyze", response_model=Dict[str, str])
async def start_analysis(request: BusinessIdeaRequest, background_tasks: BackgroundTasks):
    """Start business idea analysis"""
    try:
        analysis_id = str(uuid.uuid4())
        
        # Initialize analysis status
        analysis_storage[analysis_id] = {
            "analysis_id": analysis_id,
            "status": "pending",
            "progress": 0,
            "current_step": "Initializing",
            "created_at": datetime.now(),
            "completed_at": None
        }
        
        # Start analysis in background
        background_tasks.add_task(
            analyzer.analyze_business_idea, 
            request, 
            analysis_id
        )
        
        return {"analysis_id": analysis_id, "message": "Analysis started successfully"}
        
    except Exception as e:
        logger.error(f"Failed to start analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analysis/{analysis_id}/status", response_model=AnalysisStatus)
async def get_analysis_status(analysis_id: str):
    """Get analysis status"""
    if analysis_id not in analysis_storage:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    status_data = analysis_storage[analysis_id]
    return AnalysisStatus(**status_data)

@app.get("/analysis/{analysis_id}/result", response_model=AnalysisResult)
async def get_analysis_result(analysis_id: str):
    """Get analysis result"""
    if analysis_id not in analysis_results:
        if analysis_id not in analysis_storage:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        status = analysis_storage[analysis_id]["status"]
        if status == "pending" or status == "in_progress":
            raise HTTPException(status_code=202, detail="Analysis still in progress")
        elif status == "failed":
            raise HTTPException(status_code=500, detail="Analysis failed")
    
    return analysis_results[analysis_id]

@app.get("/analysis", response_model=List[AnalysisStatus])
async def list_analyses():
    """List all analyses"""
    return [AnalysisStatus(**data) for data in analysis_storage.values()]

@app.delete("/analysis/{analysis_id}")
async def delete_analysis(analysis_id: str):
    """Delete analysis"""
    if analysis_id not in analysis_storage:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    del analysis_storage[analysis_id]
    if analysis_id in analysis_results:
        del analysis_results[analysis_id]
    
    return {"message": "Analysis deleted successfully"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "portia_available": analyzer.portia is not None,
        "browser_tool_available": analyzer.browser_tool is not None,
        "google_api_key_set": GOOGLE_API_KEY is not None
    }

if __name__ == "__main__":
    # Ensure the 'backend' directory exists for font loading
    os.makedirs('backend', exist_ok=True)
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)