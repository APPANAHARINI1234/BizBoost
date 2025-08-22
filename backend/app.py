# backend/app.py - Complete Flask Application with Authentication
from flask import Flask, jsonify, request, session
from flask_cors import CORS
import sqlite3
import hashlib
import secrets
from datetime import datetime, timedelta
import threading
import time
import logging
import json
from scraper import ProductScraper
from ai_services import BusinessAnalyzer

# Setup
app = Flask(__name__)
app.secret_key = secrets.token_hex(16)
CORS(app, supports_credentials=True)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Database:
    def __init__(self, db_path='smallbiz.db'):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize database with all required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Businesses table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS businesses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                business_name TEXT NOT NULL,
                description TEXT,
                industry TEXT,
                target_audience TEXT,
                budget_range TEXT,
                current_platforms TEXT, -- JSON string
                goals TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Products table (for analysis)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                business_id INTEGER,
                title TEXT NOT NULL,
                price TEXT,
                platform TEXT,
                query TEXT,
                url TEXT,
                rating REAL,
                reviews_count INTEGER,
                engagement_score REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (business_id) REFERENCES businesses (id)
            )
        ''')
        
        # Platform analytics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS platform_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                business_id INTEGER,
                platform_name TEXT,
                total_products INTEGER,
                avg_rating REAL,
                avg_price REAL,
                competition_level TEXT,
                engagement_rate REAL,
                recommendation_score REAL,
                analysis_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (business_id) REFERENCES businesses (id)
            )
        ''')
        
        # Business insights table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS business_insights (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                business_id INTEGER,
                insight_type TEXT, -- 'platform_recommendation', 'pricing_strategy', etc.
                insight_data TEXT, -- JSON string
                confidence_score REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (business_id) REFERENCES businesses (id)
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully!")
    
    def get_connection(self):
        return sqlite3.connect(self.db_path)

# Initialize database
db = Database()

def hash_password(password):
    """Hash password with salt"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return salt + password_hash.hex()

def verify_password(password, stored_hash):
    """Verify password against stored hash"""
    salt = stored_hash[:32]
    stored_password_hash = stored_hash[32:]
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return password_hash.hex() == stored_password_hash

# Authentication Routes
@app.route('/api/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        full_name = data.get('full_name', '').strip()
        
        # Validation
        if not email or not password or not full_name:
            return jsonify({'error': 'All fields are required'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Check if user already exists
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create user
        password_hash = hash_password(password)
        cursor.execute('''
            INSERT INTO users (email, password_hash, full_name)
            VALUES (?, ?, ?)
        ''', (email, password_hash, full_name))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Set session
        session['user_id'] = user_id
        session['email'] = email
        session['full_name'] = full_name
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user': {
                'id': user_id,
                'email': email,
                'full_name': full_name
            }
        })
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Get user from database
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, email, password_hash, full_name 
            FROM users WHERE email = ?
        ''', (email,))
        
        user = cursor.fetchone()
        conn.close()
        
        if not user or not verify_password(password, user[2]):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Set session
        session['user_id'] = user[0]
        session['email'] = user[1]
        session['full_name'] = user[3]
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': user[0],
                'email': user[1],
                'full_name': user[3]
            }
        })
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    """User logout endpoint"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/user', methods=['GET'])
def get_user():
    """Get current user info"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    return jsonify({
        'user': {
            'id': session['user_id'],
            'email': session['email'],
            'full_name': session['full_name']
        }
    })

# Business Management Routes
@app.route('/api/business', methods=['POST'])
def create_business():
    """Create business profile"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        data = request.json
        user_id = session['user_id']
        
        # Required fields
        business_name = data.get('business_name', '').strip()
        description = data.get('description', '').strip()
        industry = data.get('industry', '').strip()
        
        # Optional fields
        target_audience = data.get('target_audience', '').strip()
        budget_range = data.get('budget_range', '')
        current_platforms = json.dumps(data.get('current_platforms', []))
        goals = data.get('goals', '').strip()
        
        if not business_name or not description or not industry:
            return jsonify({'error': 'Business name, description, and industry are required'}), 400
        
        # Create business
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Check if user already has a business (for MVP, limit to 1)
        cursor.execute('SELECT id FROM businesses WHERE user_id = ?', (user_id,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'You already have a business registered. Contact support for multiple businesses.'}), 400
        
        cursor.execute('''
            INSERT INTO businesses (
                user_id, business_name, description, industry, 
                target_audience, budget_range, current_platforms, goals
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, business_name, description, industry, 
              target_audience, budget_range, current_platforms, goals))
        
        business_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Start business analysis in background
        analysis_thread = threading.Thread(
            target=analyze_business_background,
            args=(business_id, business_name, description, industry)
        )
        analysis_thread.daemon = True
        analysis_thread.start()
        
        return jsonify({
            'success': True,
            'message': 'Business created successfully! Analysis started.',
            'business_id': business_id
        })
        
    except Exception as e:
        logger.error(f"Business creation error: {e}")
        return jsonify({'error': 'Business creation failed'}), 500

@app.route('/api/business', methods=['GET'])
def get_business():
    """Get user's business profile"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, business_name, description, industry, target_audience,
                   budget_range, current_platforms, goals, created_at
            FROM businesses WHERE user_id = ?
        ''', (session['user_id'],))
        
        business = cursor.fetchone()
        conn.close()
        
        if not business:
            return jsonify({'error': 'No business found'}), 404
        
        return jsonify({
            'business': {
                'id': business[0],
                'business_name': business[1],
                'description': business[2],
                'industry': business[3],
                'target_audience': business[4],
                'budget_range': business[5],
                'current_platforms': json.loads(business[6] or '[]'),
                'goals': business[7],
                'created_at': business[8]
            }
        })
        
    except Exception as e:
        logger.error(f"Get business error: {e}")
        return jsonify({'error': 'Failed to get business'}), 500

# Analytics Routes
@app.route('/api/analytics/platforms/<int:business_id>', methods=['GET'])
def get_platform_analytics(business_id):
    """Get platform analytics for a business"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Verify business belongs to user
        cursor.execute('SELECT id FROM businesses WHERE id = ? AND user_id = ?', 
                      (business_id, session['user_id']))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Business not found'}), 404
        
        # Get platform analytics
        cursor.execute('''
            SELECT platform_name, total_products, avg_rating, avg_price,
                   competition_level, engagement_rate, recommendation_score
            FROM platform_analytics 
            WHERE business_id = ?
            ORDER BY recommendation_score DESC
        ''', (business_id,))
        
        analytics = cursor.fetchall()
        conn.close()
        
        platforms_data = []
        for row in analytics:
            platforms_data.append({
                'platform': row[0],
                'total_products': row[1],
                'avg_rating': row[2],
                'avg_price': row[3],
                'competition_level': row[4],
                'engagement_rate': row[5],
                'recommendation_score': row[6]
            })
        
        return jsonify({'platforms': platforms_data})
        
    except Exception as e:
        logger.error(f"Platform analytics error: {e}")
        return jsonify({'error': 'Failed to get analytics'}), 500

@app.route('/api/insights/<int:business_id>', methods=['GET'])
def get_business_insights(business_id):
    """Get business insights and recommendations"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Verify business belongs to user
        cursor.execute('SELECT business_name FROM businesses WHERE id = ? AND user_id = ?', 
                      (business_id, session['user_id']))
        business = cursor.fetchone()
        if not business:
            conn.close()
            return jsonify({'error': 'Business not found'}), 404
        
        # Get insights
        cursor.execute('''
            SELECT insight_type, insight_data, confidence_score, created_at
            FROM business_insights 
            WHERE business_id = ?
            ORDER BY created_at DESC
            LIMIT 10
        ''', (business_id,))
        
        insights_data = cursor.fetchall()
        conn.close()
        
        insights = []
        for row in insights_data:
            insights.append({
                'type': row[0],
                'data': json.loads(row[1]),
                'confidence': row[2],
                'created_at': row[3]
            })
        
        return jsonify({
            'business_name': business[0],
            'insights': insights
        })
        
    except Exception as e:
        logger.error(f"Business insights error: {e}")
        return jsonify({'error': 'Failed to get insights'}), 500

@app.route('/api/dashboard/<int:business_id>', methods=['GET'])
def get_dashboard_data(business_id):
    """Get complete dashboard data for a business"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Verify business belongs to user
        cursor.execute('''
            SELECT business_name, industry, description 
            FROM businesses WHERE id = ? AND user_id = ?
        ''', (business_id, session['user_id']))
        business = cursor.fetchone()
        if not business:
            conn.close()
            return jsonify({'error': 'Business not found'}), 404
        
        # Get platform analytics
        cursor.execute('''
            SELECT platform_name, total_products, avg_rating, avg_price,
                   competition_level, engagement_rate, recommendation_score
            FROM platform_analytics 
            WHERE business_id = ?
            ORDER BY recommendation_score DESC
        ''', (business_id,))
        platforms = cursor.fetchall()
        
        # Get recent insights
        cursor.execute('''
            SELECT insight_type, insight_data, confidence_score
            FROM business_insights 
            WHERE business_id = ?
            ORDER BY created_at DESC
            LIMIT 5
        ''', (business_id,))
        insights_raw = cursor.fetchall()
        
        conn.close()
        
        # Format data
        platforms_data = []
        for row in platforms:
            platforms_data.append({
                'name': row[0],
                'products': row[1],
                'rating': row[2],
                'price': row[3],
                'competition': row[4],
                'engagement': row[5],
                'score': row[6]
            })
        
        insights = []
        for row in insights_raw:
            insights.append({
                'type': row[0],
                'data': json.loads(row[1]),
                'confidence': row[2]
            })
        
        return jsonify({
            'business': {
                'name': business[0],
                'industry': business[1],
                'description': business[2]
            },
            'platforms': platforms_data,
            'insights': insights,
            'summary': {
                'total_platforms': len(platforms_data),
                'best_platform': platforms_data[0]['name'] if platforms_data else 'No data',
                'avg_score': sum(p['score'] for p in platforms_data) / len(platforms_data) if platforms_data else 0
            }
        })
        
    except Exception as e:
        logger.error(f"Dashboard data error: {e}")
        return jsonify({'error': 'Failed to get dashboard data'}), 500

# Background Analysis Function
def analyze_business_background(business_id, business_name, description, industry):
    """Analyze business and generate insights (runs in background)"""
    try:
        logger.info(f"Starting analysis for business: {business_name}")
        
        # Initialize analyzer and scraper
        analyzer = BusinessAnalyzer()
        scraper = ProductScraper()
        
        # Generate search queries based on business
        search_queries = analyzer.generate_search_queries(business_name, description, industry)
        
        # Analyze each platform
        platforms_to_analyze = ['amazon', 'flipkart', 'instagram', 'youtube']
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        for platform in platforms_to_analyze:
            try:
                # Scrape data for analysis
                if platform in ['amazon', 'flipkart']:
                    platform_data = scraper.scrape_platform_data(platform, search_queries[:2])  # Limit queries
                else:
                    platform_data = analyzer.analyze_social_platform(platform, search_queries[0])
                
                # Calculate metrics
                avg_rating = sum(p.get('rating', 0) for p in platform_data if p.get('rating')) / len(platform_data) if platform_data else 0
                avg_price = analyzer.calculate_average_price(platform_data)
                competition_level = analyzer.assess_competition_level(platform_data)
                engagement_rate = analyzer.calculate_engagement_rate(platform_data)
                recommendation_score = analyzer.calculate_recommendation_score(platform_data, industry)
                
                # Store analytics
                cursor.execute('''
                    INSERT INTO platform_analytics (
                        business_id, platform_name, total_products, avg_rating, avg_price,
                        competition_level, engagement_rate, recommendation_score
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (business_id, platform, len(platform_data), avg_rating, avg_price,
                      competition_level, engagement_rate, recommendation_score))
                
                # Store individual products
                for product in platform_data[:10]:  # Limit stored products
                    cursor.execute('''
                        INSERT INTO products (
                            business_id, title, price, platform, rating, reviews_count
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    ''', (business_id, product.get('title', ''), product.get('price', ''),
                          platform, product.get('rating'), product.get('reviews_count')))
                
                time.sleep(2)  # Rate limiting
                
            except Exception as e:
                logger.error(f"Error analyzing {platform}: {e}")
                continue
        
        # Generate insights
        insights = analyzer.generate_business_insights(business_id, business_name, industry)
        
        for insight in insights:
            cursor.execute('''
                INSERT INTO business_insights (
                    business_id, insight_type, insight_data, confidence_score
                ) VALUES (?, ?, ?, ?)
            ''', (business_id, insight['type'], json.dumps(insight['data']), insight['confidence']))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Analysis completed for business: {business_name}")
        
    except Exception as e:
        logger.error(f"Background analysis error: {e}")

if __name__ == '__main__':
    logger.info("Starting SmallBiz Growth Hub API...")
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)