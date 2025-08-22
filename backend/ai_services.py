# backend/ai_services.py - Business Analysis and AI Services
import random
import json
from textblob import TextBlob
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class BusinessAnalyzer:
    def __init__(self):
        # Platform scoring weights
        self.platform_weights = {
            'amazon': {'trust': 0.9, 'reach': 0.95, 'competition': 0.8},
            'flipkart': {'trust': 0.85, 'reach': 0.8, 'competition': 0.75},
            'instagram': {'trust': 0.7, 'reach': 0.9, 'competition': 0.9},
            'youtube': {'trust': 0.8, 'reach': 0.85, 'competition': 0.85},
            'facebook': {'trust': 0.75, 'reach': 0.8, 'competition': 0.8}
        }
        
        # Industry-specific platform preferences
        self.industry_platform_map = {
            'fashion': ['instagram', 'amazon', 'flipkart'],
            'technology': ['amazon', 'flipkart', 'youtube'],
            'food': ['instagram', 'youtube', 'amazon'],
            'beauty': ['instagram', 'amazon', 'youtube'],
            'electronics': ['amazon', 'flipkart', 'youtube'],
            'home': ['amazon', 'flipkart', 'instagram'],
            'fitness': ['instagram', 'youtube', 'amazon'],
            'education': ['youtube', 'instagram', 'amazon'],
            'automotive': ['youtube', 'amazon', 'flipkart'],
            'jewelry': ['instagram', 'amazon', 'flipkart']
        }
    
    def generate_search_queries(self, business_name, description, industry):
        """Generate relevant search queries for market analysis"""
        try:
            # Extract key terms from business description
            blob = TextBlob(description.lower())
            key_terms = [word for word in blob.words if len(word) > 3]
            
            # Industry-specific keywords
            industry_keywords = {
                'fashion': ['clothing', 'apparel', 'style', 'wear', 'fashion'],
                'technology': ['tech', 'gadget', 'device', 'software', 'digital'],
                'food': ['food', 'snack', 'organic', 'healthy', 'gourmet'],
                'beauty': ['beauty', 'cosmetic', 'skincare', 'makeup', 'natural'],
                'electronics': ['electronic', 'device', 'gadget', 'smart', 'wireless'],
                'home': ['home', 'decor', 'furniture', 'kitchen', 'living'],
                'fitness': ['fitness', 'health', 'workout', 'sports', 'wellness'],
                'education': ['education', 'learning', 'course', 'training', 'skill'],
                'automotive': ['car', 'auto', 'vehicle', 'automotive', 'parts'],
                'jewelry': ['jewelry', 'gold', 'silver', 'diamond', 'accessories']
            }
            
            # Build search queries
            queries = []
            
            # Primary business name query
            queries.append(business_name.lower())
            
            # Industry + key terms
            industry_terms = industry_keywords.get(industry.lower(), [industry])
            for term in industry_terms[:3]:
                if key_terms:
                    queries.append(f"{term} {key_terms[0]}")
                else:
                    queries.append(term)
            
            # Combine key terms from description
            if len(key_terms) >= 2:
                queries.append(f"{key_terms[0]} {key_terms[1]}")
            
            return queries[:5]  # Limit to 5 queries
            
        except Exception as e:
            logger.error(f"Error generating search queries: {e}")
            return [business_name.lower(), industry.lower()]
    
    def analyze_social_platform(self, platform, query):
        """Simulate social media platform analysis"""
        try:
            # Simulate social media data (in real implementation, use APIs)
            if platform == 'instagram':
                return self._simulate_instagram_data(query)
            elif platform == 'youtube':
                return self._simulate_youtube_data(query)
            elif platform == 'facebook':
                return self._simulate_facebook_data(query)
            else:
                return []
        except Exception as e:
            logger.error(f"Error analyzing {platform}: {e}")
            return []
    
    def _simulate_instagram_data(self, query):
        """Simulate Instagram engagement data"""
        posts = []
        for i in range(random.randint(10, 25)):
            posts.append({
                'title': f"Instagram post about {query} #{i+1}",
                'platform': 'instagram',
                'engagement_rate': random.uniform(2.0, 8.0),  # 2-8% engagement
                'followers': random.randint(1000, 50000),
                'likes': random.randint(100, 5000),
                'comments': random.randint(10, 500),
                'hashtags': random.randint(15, 30),
                'competition_level': random.choice(['Low', 'Medium', 'High'])
            })
        return posts
    
    def _simulate_youtube_data(self, query):
        """Simulate YouTube analytics data"""
        videos = []
        for i in range(random.randint(8, 20)):
            views = random.randint(1000, 100000)
            likes = int(views * random.uniform(0.02, 0.05))  # 2-5% like rate
            videos.append({
                'title': f"YouTube video about {query} #{i+1}",
                'platform': 'youtube',
                'views': views,
                'likes': likes,
                'subscribers': random.randint(500, 20000),
                'engagement_rate': (likes / views) * 100 if views > 0 else 0,
                'competition_level': random.choice(['Low', 'Medium', 'High'])
            })
        return videos
    
    def _simulate_facebook_data(self, query):
        """Simulate Facebook page data"""
        pages = []
        for i in range(random.randint(5, 15)):
            pages.append({
                'title': f"Facebook page about {query} #{i+1}",
                'platform': 'facebook',
                'page_likes': random.randint(500, 25000),
                'post_engagement': random.uniform(1.0, 6.0),
                'reach': random.randint(1000, 15000),
                'competition_level': random.choice(['Low', 'Medium', 'High'])
            })
        return pages
    
    def calculate_average_price(self, platform_data):
        """Calculate average price from platform data"""
        try:
            prices = []
            for item in platform_data:
                price_str = str(item.get('price', '0'))
                # Extract numeric value from price string
                numeric_price = ''.join(filter(str.isdigit, price_str))
                if numeric_price:
                    prices.append(float(numeric_price))
            
            return sum(prices) / len(prices) if prices else 0
        except Exception as e:
            logger.error(f"Error calculating average price: {e}")
            return 0
    
    def assess_competition_level(self, platform_data):
        """Assess competition level based on platform data"""
        try:
            if not platform_data:
                return "Unknown"
            
            total_items = len(platform_data)
            high_competition = sum(1 for item in platform_data 
                                 if item.get('competition_level') == 'High')
            
            competition_ratio = high_competition / total_items if total_items > 0 else 0
            
            if competition_ratio > 0.6:
                return "High"
            elif competition_ratio > 0.3:
                return "Medium"
            else:
                return "Low"
        except Exception as e:
            logger.error(f"Error assessing competition: {e}")
            return "Unknown"
    
    def calculate_engagement_rate(self, platform_data):
        """Calculate average engagement rate"""
        try:
            engagement_rates = []
            for item in platform_data:
                rate = item.get('engagement_rate', 0)
                if rate and rate > 0:
                    engagement_rates.append(rate)
            
            return sum(engagement_rates) / len(engagement_rates) if engagement_rates else 0
        except Exception as e:
            logger.error(f"Error calculating engagement rate: {e}")
            return 0
    
    def calculate_recommendation_score(self, platform_data, industry):
        """Calculate platform recommendation score (0-100)"""
        try:
            if not platform_data:
                return 0
            
            platform = platform_data[0].get('platform', 'unknown')
            
            # Base score from platform weights
            weights = self.platform_weights.get(platform, {'trust': 0.5, 'reach': 0.5, 'competition': 0.5})
            base_score = (weights['trust'] + weights['reach']) * 50
            
            # Industry alignment bonus
            preferred_platforms = self.industry_platform_map.get(industry.lower(), [])
            if platform in preferred_platforms:
                industry_bonus = 20 - (preferred_platforms.index(platform) * 5)  # 20, 15, 10 bonus
            else:
                industry_bonus = 0
            
            # Competition adjustment
            competition_level = self.assess_competition_level(platform_data)
            competition_adjustment = {'Low': 15, 'Medium': 5, 'High': -10}.get(competition_level, 0)
            
            # Engagement rate bonus
            avg_engagement = self.calculate_engagement_rate(platform_data)
            engagement_bonus = min(avg_engagement * 2, 15)  # Max 15 points
            
            # Calculate final score
            final_score = base_score + industry_bonus + competition_adjustment + engagement_bonus
            return min(max(final_score, 0), 100)  # Clamp between 0-100
            
        except Exception as e:
            logger.error(f"Error calculating recommendation score: {e}")
            return 50  # Default neutral score
    
    def generate_business_insights(self, business_id, business_name, industry):
        """Generate actionable business insights"""
        try:
            insights = []
            
            # Platform recommendation insight
            platform_insight = {
                'type': 'platform_recommendation',
                'data': {
                    'title': 'Best Platforms for Your Business',
                    'recommended_platforms': self.industry_platform_map.get(industry.lower(), ['instagram', 'amazon']),
                    'reasoning': f'Based on {industry} industry analysis, these platforms show highest potential for customer engagement and sales.',
                    'action_items': [
                        'Create business profiles on recommended platforms',
                        'Post consistently with industry-relevant content',
                        'Engage with your target audience regularly'
                    ]
                },
                'confidence': 85
            }
            insights.append(platform_insight)
            
            # Pricing strategy insight
            pricing_insight = {
                'type': 'pricing_strategy',
                'data': {
                    'title': 'Competitive Pricing Strategy',
                    'strategy': 'Value-based pricing with competitive monitoring',
                    'recommendations': [
                        'Research competitor pricing weekly',
                        'Position 10-15% below premium competitors',
                        'Offer bundle deals to increase average order value'
                    ],
                    'expected_impact': 'Could increase sales by 20-30%'
                },
                'confidence': 75
            }
            insights.append(pricing_insight)
            
            # Content strategy insight
            content_insight = {
                'type': 'content_strategy',
                'data': {
                    'title': 'Content Marketing Strategy',
                    'focus_areas': self._get_content_focus_areas(industry),
                    'posting_schedule': {
                        'instagram': '1-2 posts daily, stories 3-4 times',
                        'youtube': '1-2 videos weekly',
                        'amazon': 'Update product listings monthly'
                    },
                    'content_types': ['Product showcases', 'Behind-the-scenes', 'Customer testimonials', 'Educational content']
                },
                'confidence': 80
            }
            insights.append(content_insight)
            
            # Market timing insight
            timing_insight = {
                'type': 'market_timing',
                'data': {
                    'title': 'Optimal Posting Times',
                    'best_times': self._get_optimal_posting_times(industry),
                    'seasonal_trends': self._get_seasonal_trends(industry),
                    'peak_seasons': self._get_peak_seasons(industry)
                },
                'confidence': 70
            }
            insights.append(timing_insight)
            
            # Growth tactics insight
            growth_insight = {
                'type': 'growth_tactics',
                'data': {
                    'title': 'Quick Growth Tactics',
                    'immediate_actions': [
                        'Optimize product titles with relevant keywords',
                        'Use high-quality product images',
                        'Encourage customer reviews and testimonials',
                        'Cross-promote on multiple platforms'
                    ],
                    'long_term_strategies': [
                        'Build email list for repeat customers',
                        'Create loyalty program',
                        'Partner with micro-influencers',
                        'Develop signature product line'
                    ]
                },
                'confidence': 90
            }
            insights.append(growth_insight)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating business insights: {e}")
            return []
    
    def _get_content_focus_areas(self, industry):
        """Get content focus areas by industry"""
        focus_map = {
            'fashion': ['Style tips', 'Outfit ideas', 'Fashion trends', 'Seasonal collections'],
            'technology': ['Product demos', 'Tech tutorials', 'Innovation updates', 'User guides'],
            'food': ['Recipe sharing', 'Ingredient sourcing', 'Cooking tips', 'Health benefits'],
            'beauty': ['Tutorials', 'Before/after', 'Ingredient benefits', 'Skin care tips'],
            'electronics': ['Product reviews', 'Comparisons', 'Tech tips', 'Troubleshooting'],
            'home': ['Interior design', 'DIY projects', 'Organization tips', 'Seasonal decor'],
            'fitness': ['Workout routines', 'Health tips', 'Progress tracking', 'Motivation'],
            'education': ['Learning tips', 'Success stories', 'Course previews', 'Industry insights']
        }
        return focus_map.get(industry.lower(), ['Product showcases', 'Customer stories', 'Industry tips'])
    
    def _get_optimal_posting_times(self, industry):
        """Get optimal posting times by industry"""
        # Simplified posting time recommendations
        times = {
            'instagram': '6-9 PM weekdays, 11 AM-1 PM weekends',
            'youtube': '2-4 PM weekdays, 9-11 AM weekends',
            'facebook': '1-3 PM weekdays, 12-2 PM weekends',
            'amazon': 'Update during weekday mornings (9-11 AM)'
        }
        return times
    
    def _get_seasonal_trends(self, industry):
        """Get seasonal trends by industry"""
        trends_map = {
            'fashion': 'Spring: Light colors, Summer: Bright patterns, Fall: Earth tones, Winter: Warm fabrics',
            'food': 'Spring: Fresh ingredients, Summer: Cold dishes, Fall: Comfort food, Winter: Warm beverages',
            'beauty': 'Spring: Fresh looks, Summer: Sun protection, Fall: Rich colors, Winter: Hydrating products',
            'electronics': 'Back-to-school (Aug-Sep), Holiday season (Nov-Dec), New Year resolutions (Jan)',
            'home': 'Spring cleaning (Mar-Apr), Summer outdoor (May-Jul), Fall cozy (Sep-Oct), Holiday decor (Nov-Dec)'
        }
        return trends_map.get(industry.lower(), 'Monitor industry-specific seasonal patterns')
    
    def _get_peak_seasons(self, industry):
        """Get peak selling seasons by industry"""
        peak_map = {
            'fashion': ['Back-to-school', 'Holiday season', 'Spring fashion week'],
            'technology': ['Back-to-school', 'Black Friday', 'New Year'],
            'food': ['Holiday season', 'Summer BBQ', 'New Year health trends'],
            'beauty': ['Wedding season', 'Holiday gifting', 'New Year resolutions'],
            'electronics': ['Black Friday', 'Holiday season', 'Back-to-school'],
            'home': ['Spring cleaning', 'Holiday decorating', 'Back-to-school'],
            'fitness': ['New Year', 'Summer prep', 'Back-to-school'],
            'education': ['New Year', 'Back-to-school', 'Professional development seasons']
        }
        return peak_map.get(industry.lower(), ['Holiday season', 'New Year', 'Back-to-school'])
    
    def analyze_sentiment(self, text):
        """Analyze sentiment of text"""
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            
            if polarity > 0.1:
                return {'sentiment': 'positive', 'score': polarity, 'confidence': abs(polarity)}
            elif polarity < -0.1:
                return {'sentiment': 'negative', 'score': polarity, 'confidence': abs(polarity)}
            else:
                return {'sentiment': 'neutral', 'score': polarity, 'confidence': 0.5}
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return {'sentiment': 'neutral', 'score': 0, 'confidence': 0}
    
    def generate_business_card_content(self, business_name, industry, description):
        """Generate business card content"""
        try:
            # Industry-specific templates
            templates = {
                'fashion': [
                    f"✨ {business_name} ✨\n👗 {description[:50]}...\n📞 +91-XXXXXXXXXX\n🌟 Style That Speaks",
                    f"🌟 {business_name} 🌟\n Fashion • Style • Elegance\n📱 WhatsApp: +91-XXXXXXXXXX\n✨ Your Style, Our Passion"
                ],
                'food': [
                    f"🍽️ {business_name} 🍽️\n{description[:50]}...\n📞 Contact: +91-XXXXXXXXXX\n🌟 Taste The Difference",
                    f"👨‍🍳 {business_name} 👨‍🍳\n Fresh • Healthy • Delicious\n📱 Order: +91-XXXXXXXXXX\n🌟 Made with Love"
                ],
                'technology': [
                    f"⚡ {business_name} ⚡\n{description[:50]}...\n📞 Support: +91-XXXXXXXXXX\n🚀 Innovation Delivered",
                    f"🔧 {business_name} 🔧\n Tech • Innovation • Solutions\n📧 hello@{business_name.lower().replace(' ', '')}.com\n⚡ Future Ready"
                ]
            }
            
            # Get templates for industry or use default
            industry_templates = templates.get(industry.lower(), [
                f"🌟 {business_name} 🌟\n{description[:50]}...\n📞 Contact: +91-XXXXXXXXXX\n🚀 Quality & Trust",
                f"✨ {business_name} ✨\n Your Trusted Partner\n📱 WhatsApp: +91-XXXXXXXXXX\n💼 Professional Service"
            ])
            
            return random.choice(industry_templates)
            
        except Exception as e:
            logger.error(f"Error generating business card: {e}")
            return f"{business_name}\n{description[:100]}...\nContact: +91-XXXXXXXXXX"
    
    def get_growth_recommendations(self, business_data):
        """Get personalized growth recommendations"""
        try:
            recommendations = []
            
            # Based on industry
            industry = business_data.get('industry', '').lower()
            
            if 'fashion' in industry:
                recommendations.extend([
                    "Post outfit inspiration daily on Instagram",
                    "Use fashion hashtags: #OOTD #Fashion #Style",
                    "Collaborate with fashion micro-influencers",
                    "Create seasonal lookbooks"
                ])
            elif 'food' in industry:
                recommendations.extend([
                    "Share behind-the-scenes cooking videos",
                    "Post mouth-watering food photos",
                    "Engage with food bloggers and reviewers",
                    "Offer limited-time seasonal menus"
                ])
            elif 'technology' in industry:
                recommendations.extend([
                    "Create product demo videos",
                    "Write technical blog posts",
                    "Participate in tech forums and discussions",
                    "Offer free trials or demos"
                ])
            else:
                recommendations.extend([
                    "Post consistently on your best platforms",
                    "Engage with your audience daily",
                    "Share customer success stories",
                    "Offer excellent customer service"
                ])
            
            # Universal recommendations
            recommendations.extend([
                "Respond to comments within 2 hours",
                "Use high-quality visuals in all posts",
                "Ask customers for reviews and testimonials",
                "Cross-promote content across platforms",
                "Monitor competitor activities weekly"
            ])
            
            return random.sample(recommendations, min(5, len(recommendations)))
            
        except Exception as e:
            logger.error(f"Error getting growth recommendations: {e}")
            return [
                "Focus on customer satisfaction",
                "Post regularly on social media",
                "Monitor your competition",
                "Ask for customer feedback"
            ]