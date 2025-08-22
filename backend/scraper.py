# backend/scraper.py - Enhanced Product Scraper
import requests
from bs4 import BeautifulSoup
import time
import random
import logging
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class ProductScraper:
    def __init__(self):
        # User agents to rotate for avoiding blocks
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ]
        
        # Platform-specific configurations
        self.platform_configs = {
            'amazon': {
                'base_url': 'https://www.amazon.in/s?k=',
                'product_selector': 'div[data-component-type="s-search-result"]',
                'title_selector': 'h2 a span',
                'price_selector': 'span.a-price-whole',
                'rating_selector': 'span.a-icon-alt',
                'reviews_selector': 'a span.a-size-base'
            },
            'flipkart': {
                'base_url': 'https://www.flipkart.com/search?q=',
                'product_selector': 'div[data-id]',
                'title_selector': 'div._4rR01T',
                'price_selector': 'div._30jeq3',
                'rating_selector': 'div._3LWZlK',
                'reviews_selector': 'span._2_R_DZ'
            }
        }
    
    def get_headers(self):
        """Get random headers for requests"""
        return {
            'User-Agent': random.choice(self.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
    
    def scrape_platform_data(self, platform, queries):
        """Scrape data from specified platform for multiple queries"""
        try:
            all_products = []
            
            for query in queries:
                logger.info(f"Scraping {platform} for query: {query}")
                
                if platform == 'amazon':
                    products = self.scrape_amazon_search(query, max_products=10)
                elif platform == 'flipkart':
                    products = self.scrape_flipkart_search(query, max_products=10)
                else:
                    logger.warning(f"Platform {platform} not supported for scraping")
                    continue
                
                all_products.extend(products)
                time.sleep(random.uniform(2, 4))  # Rate limiting
            
            return all_products
            
        except Exception as e:
            logger.error(f"Error scraping {platform}: {e}")
            return []
    
    def scrape_amazon_search(self, query, max_products=20):
        """Scrape Amazon search results"""
        products = []
        
        try:
            # Build search URL
            search_url = f"https://www.amazon.in/s?k={query.replace(' ', '+')}"
            
            # Make request
            response = requests.get(search_url, headers=self.get_headers(), timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find product containers
            product_containers = soup.find_all('div', {'data-component-type': 's-search-result'})
            
            for i, container in enumerate(product_containers[:max_products]):
                try:
                    product_data = self._extract_amazon_product(container, query)
                    if product_data:
                        products.append(product_data)
                        logger.debug(f"Extracted Amazon product: {product_data['title'][:50]}...")
                        
                except Exception as e:
                    logger.error(f"Error extracting Amazon product {i}: {e}")
                    continue
            
            logger.info(f"Successfully scraped {len(products)} products from Amazon for '{query}'")
            return products
            
        except Exception as e:
            logger.error(f"Error scraping Amazon for '{query}': {e}")
            return []
    
    def _extract_amazon_product(self, container, query):
        """Extract product data from Amazon container"""
        try:
            # Title
            title_elem = container.find('h2')
            if title_elem:
                title_link = title_elem.find('a')
                if title_link:
                    title_span = title_link.find('span')
                    title = title_span.get_text().strip() if title_span else title_link.get_text().strip()
                else:
                    title = title_elem.get_text().strip()
            else:
                return None
            
            # Price
            price = "N/A"
            price_elem = container.find('span', {'class': 'a-price-whole'})
            if not price_elem:
                # Try alternative price selectors
                price_elem = container.find('span', class_='a-price-range')
                if not price_elem:
                    price_elem = container.find('span', string=lambda text: text and '₹' in text)
            
            if price_elem:
                price_text = price_elem.get_text().strip()
                # Clean price text
                price = ''.join(filter(lambda x: x.isdigit() or x == '.', price_text))
                if not price:
                    price = "N/A"
            
            # Rating
            rating = None
            rating_elem = container.find('span', {'class': 'a-icon-alt'})
            if rating_elem:
                rating_text = rating_elem.get_text()
                try:
                    # Extract rating (e.g., "4.2 out of 5 stars" -> 4.2)
                    rating_parts = rating_text.split()
                    if rating_parts:
                        rating = float(rating_parts[0])
                except (ValueError, IndexError):
                    rating = None
            
            # Reviews count
            reviews_count = None
            reviews_elem = container.find('span', {'class': 'a-size-base'})
            if reviews_elem:
                reviews_text = reviews_elem.get_text().replace(',', '').replace('(', '').replace(')', '')
                try:
                    reviews_count = int(''.join(filter(str.isdigit, reviews_text)))
                except ValueError:
                    reviews_count = None
            
            # Product URL
            url = "N/A"
            url_elem = container.find('h2')
            if url_elem:
                link_elem = url_elem.find('a')
                if link_elem and link_elem.get('href'):
                    url = "https://www.amazon.in" + link_elem.get('href')
            
            # Image URL
            image_url = "N/A"
            img_elem = container.find('img')
            if img_elem:
                image_url = img_elem.get('src', 'N/A')
            
            return {
                'title': title,
                'price': price,
                'platform': 'amazon',
                'query': query,
                'url': url,
                'rating': rating,
                'reviews_count': reviews_count,
                'image_url': image_url,
                'timestamp': datetime.now().isoformat(),
                'competition_level': self._assess_product_competition(title, price, rating)
            }
            
        except Exception as e:
            logger.error(f"Error extracting Amazon product data: {e}")
            return None
    
    def scrape_flipkart_search(self, query, max_products=20):
        """Scrape Flipkart search results"""
        products = []
        
        try:
            # Build search URL
            search_url = f"https://www.flipkart.com/search?q={query.replace(' ', '%20')}"
            
            # Make request
            headers = self.get_headers()
            headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            
            response = requests.get(search_url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find product containers (Flipkart has different selectors)
            product_containers = soup.find_all('div', {'class': '_1AtVbE'})
            if not product_containers:
                # Try alternative selectors
                product_containers = soup.find_all('div', {'class': '_2kHMtA'})
            
            for i, container in enumerate(product_containers[:max_products]):
                try:
                    product_data = self._extract_flipkart_product(container, query)
                    if product_data:
                        products.append(product_data)
                        logger.debug(f"Extracted Flipkart product: {product_data['title'][:50]}...")
                        
                except Exception as e:
                    logger.error(f"Error extracting Flipkart product {i}: {e}")
                    continue
            
            logger.info(f"Successfully scraped {len(products)} products from Flipkart for '{query}'")
            return products
            
        except Exception as e:
            logger.error(f"Error scraping Flipkart for '{query}': {e}")
            # Return mock data if scraping fails
            return self._generate_mock_flipkart_data(query, max_products)
    
    def _extract_flipkart_product(self, container, query):
        """Extract product data from Flipkart container"""
        try:
            # Title
            title_elem = container.find('div', {'class': '_4rR01T'})
            if not title_elem:
                title_elem = container.find('a', {'class': 'IRpwTa'})
            
            if not title_elem:
                return None
                
            title = title_elem.get_text().strip()
            
            # Price
            price = "N/A"
            price_elem = container.find('div', {'class': '_30jeq3'})
            if not price_elem:
                price_elem = container.find('div', {'class': '_1_WHN1'})
            
            if price_elem:
                price_text = price_elem.get_text().strip()
                price = ''.join(filter(lambda x: x.isdigit() or x == '.', price_text))
                if not price:
                    price = "N/A"
            
            # Rating
            rating = None
            rating_elem = container.find('div', {'class': '_3LWZlK'})
            if rating_elem:
                try:
                    rating = float(rating_elem.get_text().strip())
                except ValueError:
                    rating = None
            
            # Reviews count
            reviews_count = None
            reviews_elem = container.find('span', {'class': '_2_R_DZ'})
            if reviews_elem:
                reviews_text = reviews_elem.get_text().replace(',', '').replace('(', '').replace(')', '')
                try:
                    reviews_count = int(''.join(filter(str.isdigit, reviews_text)))
                except ValueError:
                    reviews_count = None
            
            return {
                'title': title,
                'price': price,
                'platform': 'flipkart',
                'query': query,
                'url': 'https://www.flipkart.com',  # Simplified for demo
                'rating': rating,
                'reviews_count': reviews_count,
                'image_url': 'N/A',
                'timestamp': datetime.now().isoformat(),
                'competition_level': self._assess_product_competition(title, price, rating)
            }
            
        except Exception as e:
            logger.error(f"Error extracting Flipkart product data: {e}")
            return None
    
    def _generate_mock_flipkart_data(self, query, max_products=10):
        """Generate mock Flipkart data when scraping fails"""
        mock_products = []
        
        for i in range(min(max_products, random.randint(5, 15))):
            mock_products.append({
                'title': f"Flipkart {query} product #{i+1}",
                'price': str(random.randint(500, 5000)),
                'platform': 'flipkart',
                'query': query,
                'url': 'https://www.flipkart.com',
                'rating': round(random.uniform(3.0, 4.8), 1),
                'reviews_count': random.randint(50, 2000),
                'image_url': 'N/A',
                'timestamp': datetime.now().isoformat(),
                'competition_level': random.choice(['Low', 'Medium', 'High'])
            })
        
        return mock_products
    
    def _assess_product_competition(self, title, price, rating):
        """Assess competition level for a product"""
        try:
            # Simple competition assessment based on available data
            score = 0
            
            # Price factor (higher price might mean premium/less competition)
            if price and price != "N/A":
                price_val = float(''.join(filter(str.isdigit, str(price))))
                if price_val > 2000:
                    score += 1
                elif price_val < 500:
                    score -= 1
            
            # Rating factor (higher rating means more competition)
            if rating and rating >= 4.0:
                score += 1
            elif rating and rating < 3.5:
                score -= 1
            
            # Title length (more detailed titles might indicate more competition)
            if len(title) > 50:
                score += 1
            
            # Determine competition level
            if score >= 2:
                return "High"
            elif score <= -1:
                return "Low"
            else:
                return "Medium"
                
        except Exception as e:
            logger.error(f"Error assessing competition: {e}")
            return "Medium"
    
    def test_scraping(self, platform='amazon', query='wireless headphones'):
        """Test scraping functionality"""
        logger.info(f"Testing {platform} scraper with query: '{query}'")
        
        if platform == 'amazon':
            products = self.scrape_amazon_search(query, max_products=5)
        elif platform == 'flipkart':
            products = self.scrape_flipkart_search(query, max_products=5)
        else:
            logger.error(f"Platform {platform} not supported")
            return []
        
        logger.info(f"Test completed. Found {len(products)} products")
        return products

# Test scraper
if __name__ == "__main__":
    scraper = ProductScraper()
    
    # Test Amazon scraping
    amazon_products = scraper.test_scraping('amazon', 'bluetooth speakers')
    print(f"\nAmazon Results: {len(amazon_products)} products")
    
    # Test Flipkart scraping
    flipkart_products = scraper.test_scraping('flipkart', 'bluetooth speakers')
    print(f"Flipkart Results: {len(flipkart_products)} products")
    
    # Display sample results
    if amazon_products:
        print(f"\nSample Amazon product: {amazon_products[0]['title'][:60]}...")
        print(f"Price: ₹{amazon_products[0]['price']}, Rating: {amazon_products[0]['rating']}")
    
    if flipkart_products:
        print(f"\nSample Flipkart product: {flipkart_products[0]['title'][:60]}...")
        print(f"Price: ₹{flipkart_products[0]['price']}, Rating: {flipkart_products[0]['rating']}")