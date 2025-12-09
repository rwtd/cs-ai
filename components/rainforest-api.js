/**
 * Rainforest API Integration Module for CS-AI
 * Adapted from BBDominator/20bucks
 * https://www.rainforestapi.com/docs
 */

class RainforestAPI {
    constructor(apiKey = null) {
        this.apiKey = apiKey || localStorage.getItem('rainforest_api_key');
        this.baseUrl = 'https://api.rainforestapi.com/request';
        this.connected = !!this.apiKey;
    }

    setApiKey(key) {
        this.apiKey = key;
        this.connected = !!key;
        if (key) localStorage.setItem('rainforest_api_key', key);
    }

    isConfigured() {
        return this.connected;
    }

    /**
     * Make API request to Rainforest
     */
    async request(params) {
        if (!this.apiKey) {
            throw new Error('Rainforest API key not configured. Go to API Keys → Set your key.');
        }

        const queryParams = new URLSearchParams({
            api_key: this.apiKey,
            ...params
        });

        try {
            const response = await fetch(`${this.baseUrl}?${queryParams}`);
            const data = await response.json();

            if (data.request_info?.success === false) {
                throw new Error(data.request_info?.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('Rainforest API Error:', error);
            throw error;
        }
    }

    /**
     * Get product details by ASIN
     */
    async getProduct(asin, amazonDomain = 'amazon.com') {
        return this.request({
            type: 'product',
            asin: asin,
            amazon_domain: amazonDomain,
            include_a_plus_content: true
        });
    }

    /**
     * Get Buy Box and offers for a product
     */
    async getOffers(asin, amazonDomain = 'amazon.com') {
        return this.request({
            type: 'offers',
            asin: asin,
            amazon_domain: amazonDomain,
            offers_condition_new: true
        });
    }

    /**
     * Search Amazon products
     */
    async search(query, amazonDomain = 'amazon.com', page = 1) {
        return this.request({
            type: 'search',
            search_term: query,
            amazon_domain: amazonDomain,
            page: page
        });
    }

    /**
     * Get seller profile
     */
    async getSellerProfile(sellerId, amazonDomain = 'amazon.com') {
        return this.request({
            type: 'seller_profile',
            seller_id: sellerId,
            amazon_domain: amazonDomain
        });
    }

    /**
     * Get product reviews
     */
    async getReviews(asin, amazonDomain = 'amazon.com', page = 1) {
        return this.request({
            type: 'reviews',
            asin: asin,
            amazon_domain: amazonDomain,
            page: page
        });
    }

    /**
     * Extract Buy Box information from product/offers data
     */
    extractBuyBox(data) {
        const product = data.product || data;
        const buybox = product.buybox_winner || null;

        if (!buybox) {
            return {
                available: false,
                suppressed: true,
                message: 'Buy Box is suppressed or unavailable'
            };
        }

        return {
            available: true,
            suppressed: false,
            price: buybox.price?.value || buybox.price,
            currency: buybox.price?.currency || 'USD',
            sellerId: buybox.seller?.id,
            sellerName: buybox.seller?.name || 'Unknown Seller',
            sellerRating: buybox.seller?.rating,
            sellerReviews: buybox.seller?.num_ratings,
            fulfillment: buybox.fulfillment?.type || (buybox.is_prime ? 'FBA' : 'FBM'),
            isPrime: buybox.is_prime || false,
            isAmazon: buybox.seller?.name?.toLowerCase().includes('amazon') || false,
            availability: buybox.availability?.raw,
            shipsFrom: buybox.ships_from,
            soldBy: buybox.sold_by
        };
    }

    /**
     * Extract all competing offers
     */
    extractOffers(data) {
        const offers = data.offers || data.product?.offers || [];

        return offers.map((offer, index) => ({
            position: index + 1,
            price: offer.price?.value || offer.price,
            currency: offer.price?.currency || 'USD',
            sellerId: offer.seller?.id,
            sellerName: offer.seller?.name || 'Unknown',
            sellerRating: offer.seller?.rating,
            fulfillment: offer.fulfillment?.type || (offer.is_prime ? 'FBA' : 'FBM'),
            isPrime: offer.is_prime || false,
            condition: offer.condition || 'New',
            isBuyBox: offer.is_buybox_winner || false
        }));
    }

    /**
     * Analyze competitive landscape
     */
    analyzeCompetition(offers) {
        if (!offers || offers.length === 0) {
            return { competitors: 0, priceRange: null, analysis: 'No offers found' };
        }

        const prices = offers.map(o => o.price).filter(p => p);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const buyboxOffer = offers.find(o => o.isBuyBox);

        return {
            competitors: offers.length,
            priceRange: { min: minPrice, max: maxPrice, avg: avgPrice.toFixed(2) },
            buyboxPrice: buyboxOffer?.price,
            buyboxSeller: buyboxOffer?.sellerName,
            primeOffers: offers.filter(o => o.isPrime).length,
            fbaOffers: offers.filter(o => o.fulfillment === 'FBA').length,
            fbmOffers: offers.filter(o => o.fulfillment === 'FBM').length,
            priceToBeat: buyboxOffer ? (buyboxOffer.price - 0.01).toFixed(2) : minPrice
        };
    }

    /**
     * Demo mode - returns mock data when no API key
     */
    async getMockProduct(asin) {
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            product: {
                asin: asin,
                title: "Premium Wireless Bluetooth Headphones - Active Noise Cancelling, 40H Playtime",
                main_image: { link: "https://via.placeholder.com/300x300/1a1a24/8b5cf6?text=Product" },
                rating: 4.5,
                ratings_total: 12847,
                price: { value: 79.99, currency: "USD" },
                categories: [{ name: "Electronics" }, { name: "Headphones" }],
                buybox_winner: {
                    price: { value: 79.99, currency: "USD" },
                    seller: { id: "A2R2RITDJNW1Q6", name: "TechStore Pro", rating: 4.8, num_ratings: 15420 },
                    fulfillment: { type: "FBA" },
                    is_prime: true,
                    availability: { raw: "In Stock" }
                }
            },
            offers: [
                { price: { value: 79.99 }, seller: { name: "TechStore Pro", rating: 4.8 }, is_prime: true, is_buybox_winner: true, fulfillment: { type: "FBA" } },
                { price: { value: 81.49 }, seller: { name: "ElectroDeals", rating: 4.6 }, is_prime: true, fulfillment: { type: "FBA" } },
                { price: { value: 82.99 }, seller: { name: "QuickShip Audio", rating: 4.5 }, is_prime: false, fulfillment: { type: "FBM" } },
                { price: { value: 78.50 }, seller: { name: "BargainTech", rating: 4.2 }, is_prime: false, fulfillment: { type: "FBM" } },
                { price: { value: 84.99 }, seller: { name: "Premium Sellers Inc", rating: 4.9 }, is_prime: true, fulfillment: { type: "FBA" } }
            ]
        };
    }
}

// Global instance
window.RainforestAPI = RainforestAPI;
window.rainforestApi = new RainforestAPI();
