"""
Wildeer LLP Admin API Client
=============================

Complete client for the Wildeer LLP User Management API.
Supports search, view, and edit operations.

Requirements:
    pip install requests selenium webdriver-manager

Usage:
    from wildeer_admin import WildeerAdmin
    
    admin = WildeerAdmin()
    admin.login_via_browser("email", "password")
    
    # Search users
    users = admin.search_users("term")
    
    # Update user
    admin.update_user("user_id", "app_name", {"isAdminBlocked": True})
"""

import json
import time
import requests
from typing import Optional, Dict, List, Any


class WildeerAdmin:
    """
    Wildeer LLP Admin API Client.
    
    Handles AWS Cognito authentication via browser automation
    and provides methods for all admin operations.
    """
    
    # AWS Cognito Configuration
    USER_POOL_ID = "eu-west-1_K7L2ACBXK"
    CLIENT_ID = "7lm1v7i3reufv5ovpkibfbra44"
    COGNITO_REGION = "eu-west-1"
    
    # API Configuration
    API_BASE_URL = "https://api.wildeerllp.com"
    APP_NAME = "wildeerllp"
    
    # Available apps for filtering
    AVAILABLE_APPS = [
        "asindataapi", "backyardapi", "bigboxapi", "bluecartapi",
        "countdownapi", "rainforestapi", "redcircleapi", "scaleserp",
        "serpwow", "valueserp"
    ]

    def __init__(self):
        self.session = requests.Session()
        self.id_token: Optional[str] = None

    def _setup_session(self):
        """Configure session headers after authentication."""
        self.session.headers.update({
            "app_name": self.APP_NAME,
            "authorization": self.id_token,
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "origin": "https://app.wildeerllp.com",
            "referer": "https://app.wildeerllp.com/"
        })

    # =========================================================================
    # AUTHENTICATION
    # =========================================================================

    def login_via_browser(self, username: str, password: str, headless: bool = False) -> bool:
        """
        Login via Chrome browser automation.
        
        Args:
            username: Email address
            password: Password
            headless: If True, runs browser invisibly
            
        Returns:
            True if login successful
        """
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        from selenium.webdriver.chrome.service import Service
        from selenium.webdriver.chrome.options import Options
        from webdriver_manager.chrome import ChromeDriverManager
        
        print("Opening Chrome browser...")
        options = Options()
        if headless:
            options.add_argument("--headless")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        
        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=options
        )
        
        try:
            driver.get("https://app.wildeerllp.com/login")
            wait = WebDriverWait(driver, 20)
            
            email_input = wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text'], input[type='email']"))
            )
            email_input.send_keys(username)
            driver.find_element(By.CSS_SELECTOR, "input[type='password']").send_keys(password)
            driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
            
            wait.until(lambda d: "/login" not in d.current_url)
            time.sleep(2)
            
            token = driver.execute_script("""
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.includes('idToken')) return localStorage.getItem(key);
                }
                return null;
            """)
            
            if token:
                self.id_token = token
                self._setup_session()
                print("[OK] Authenticated successfully!")
                return True
            raise Exception("Token not found in localStorage")
        finally:
            driver.quit()

    def login_with_token(self, id_token: str):
        """
        Use an existing JWT token (skip browser login).
        
        Args:
            id_token: Valid Cognito ID token
        """
        self.id_token = id_token
        self._setup_session()
        print("[OK] Token set.")

    # =========================================================================
    # HTTP HELPERS
    # =========================================================================

    def _get(self, endpoint: str, params: Dict = None) -> Dict:
        """Make authenticated GET request."""
        resp = self.session.get(f"{self.API_BASE_URL}{endpoint}", params=params)
        resp.raise_for_status()
        return resp.json()

    def _post(self, endpoint: str, data: Dict = None) -> Dict:
        """Make authenticated POST request."""
        resp = self.session.post(f"{self.API_BASE_URL}{endpoint}", json=data)
        resp.raise_for_status()
        return resp.json()

    def _put(self, endpoint: str, data: Dict = None) -> Dict:
        """Make authenticated PUT request."""
        resp = self.session.put(f"{self.API_BASE_URL}{endpoint}", json=data)
        resp.raise_for_status()
        return resp.json()

    # =========================================================================
    # USER MANAGEMENT - READ
    # =========================================================================

    def get_current_user(self) -> Dict:
        """
        Get current logged-in user info.
        
        Returns:
            User data with payload containing userId, userEmail, plan, usage, etc.
        """
        return self._get("/user")

    def list_users(
        self,
        page: int = 1,
        page_size: int = 25,
        search_term: str = None,
        app_names: List[str] = None,
        sort_by: str = "date",
        sort_direction: str = "descend",
        user_type: str = "all"
    ) -> Dict:
        """
        List or search users with pagination.
        
        Args:
            page: Page number (1-indexed)
            page_size: Results per page (max 25)
            search_term: Optional search query (email, userId, apiKey)
            app_names: Filter by app names (defaults to all)
            sort_by: Sort field ("date")
            sort_direction: "ascend" or "descend"
            user_type: Filter type ("all")
            
        Returns:
            {
                "success": True,
                "info": {"total_count": N, "total_pages": N, "current_page": N},
                "data": [list of user objects]
            }
        """
        if app_names is None:
            app_names = self.AVAILABLE_APPS
            
        params = {
            "page": page,
            "page_size": page_size,
            "app_names": ",".join(app_names),
            "sort_by": sort_by,
            "sort_direction": sort_direction,
            "type": user_type
        }
        if search_term:
            params["search_term"] = search_term
            
        return self._get("/admin/users", params=params)

    def search_users(self, term: str, page: int = 1, page_size: int = 25) -> Dict:
        """
        Search users by email, userId, or apiKey.
        
        Args:
            term: Search query
            page: Page number
            page_size: Results per page
        """
        return self.list_users(page=page, page_size=page_size, search_term=term)

    def get_user_usage(self, user_id: str) -> Dict:
        """
        Get usage statistics for a user.
        
        Args:
            user_id: The user's ID
        """
        return self._get("/admin/user/usage", params={"user_id": user_id})

    # =========================================================================
    # USER MANAGEMENT - WRITE
    # =========================================================================

    def update_user(
        self,
        user_id: str,
        app_name: str,
        updates: Dict[str, Any]
    ) -> Dict:
        """
        Update a user's profile.
        
        Args:
            user_id: The user's ID
            app_name: The app name (serpwow, rainforestapi, etc.)
            updates: Dictionary of fields to update
            
        Available update fields:
            - userEmail: str
            - isAdminBlocked: bool
            - isMultiFreeTrialBlocked: bool
            - isUserEmailVerified: bool
            - hasPaymentProblem: bool
            - userEmailPreferencesError: bool
            - userEmailPreferencesSystem: bool
            - userEmailPreferencesUpdate: bool
            - overageEnabled: bool
            - overageRateMultiplier: int
            - overageRateCentsPerThousand: int or None
            
        Example:
            admin.update_user("USER_ID", "serpwow", {
                "isAdminBlocked": True,
                "userEmail": "new@email.com"
            })
        """
        data = {
            "userId": user_id,
            "appName": app_name,
            **updates
        }
        return self._put("/admin/users", data=data)

    def block_user(self, user_id: str, app_name: str) -> Dict:
        """Block a user."""
        return self.update_user(user_id, app_name, {"isAdminBlocked": True})

    def unblock_user(self, user_id: str, app_name: str) -> Dict:
        """Unblock a user."""
        return self.update_user(user_id, app_name, {"isAdminBlocked": False})

    def set_payment_problem(self, user_id: str, app_name: str, has_problem: bool) -> Dict:
        """Set or clear payment problem flag."""
        return self.update_user(user_id, app_name, {"hasPaymentProblem": has_problem})

    def enable_overage(self, user_id: str, app_name: str, multiplier: int = 2) -> Dict:
        """Enable overage billing for a user."""
        return self.update_user(user_id, app_name, {
            "overageEnabled": True,
            "overageRateMultiplier": multiplier
        })

    def disable_overage(self, user_id: str, app_name: str) -> Dict:
        """Disable overage billing."""
        return self.update_user(user_id, app_name, {"overageEnabled": False})

    # =========================================================================
    # PLANS
    # =========================================================================

    def get_plans(self) -> Dict:
        """
        Get all available subscription plans.
        
        Returns:
            {"success": True, "data": [list of plan objects]}
        """
        return self._get("/admin/plans")

    # =========================================================================
    # FEATURE FLAGS
    # =========================================================================

    def get_feature_flags(self) -> Dict:
        """
        Get all feature flags.
        
        Returns:
            {"success": True, "payload": {flag_name: value, ...}}
        """
        return self._get("/admin/feature-flags")

    # =========================================================================
    # BAN CHECKING
    # =========================================================================

    def is_email_domain_banned(self, email: str) -> Dict:
        """Check if an email domain is banned."""
        return self._get("/isemaildomainbanned", params={"email": email})

    def is_email_blocked(self, email: str) -> Dict:
        """Check if a specific email is blocked."""
        return self._get("/isemailblocked", params={"email": email})

    def is_api_key_banned(self, api_key: str) -> Dict:
        """Check if an API key is banned."""
        return self._get("/isapikeybanned", params={"api_key": api_key})

    def is_ip_banned(self, ip: str) -> Dict:
        """Check if an IP address is banned."""
        return self._get("/isipbanned", params={"ip": ip})


# =============================================================================
# CLI INTERFACE
# =============================================================================

def main():
    """Interactive CLI for the admin client."""
    import getpass
    
    print("=" * 60)
    print("Wildeer LLP Admin Client")
    print("=" * 60)
    
    admin = WildeerAdmin()
    
    email = input("\nEmail: ").strip()
    password = getpass.getpass("Password: ")
    admin.login_via_browser(email, password)
    
    while True:
        print("\n" + "-" * 40)
        print("Commands:")
        print("  1. Search users")
        print("  2. Get user usage")
        print("  3. Block/Unblock user")
        print("  4. Update user")
        print("  5. Get plans")
        print("  6. Get feature flags")
        print("  7. Check ban status")
        print("  8. My info")
        print("  0. Exit")
        print("-" * 40)
        
        choice = input("Choice: ").strip()
        
        try:
            if choice == "0":
                break
            elif choice == "1":
                term = input("Search term: ")
                result = admin.search_users(term)
                print(f"\nFound {result['info']['total_count']} users:")
                for u in result.get('data', [])[:10]:
                    print(f"  {u.get('userEmail')}")
                    print(f"    ID: {u.get('userId')}, App: {u.get('appName')}")
            elif choice == "2":
                user_id = input("User ID: ")
                result = admin.get_user_usage(user_id)
                print(json.dumps(result, indent=2))
            elif choice == "3":
                user_id = input("User ID: ")
                app_name = input("App name: ")
                action = input("Block or Unblock? (b/u): ").lower()
                if action == 'b':
                    result = admin.block_user(user_id, app_name)
                else:
                    result = admin.unblock_user(user_id, app_name)
                print(f"Result: {result}")
            elif choice == "4":
                user_id = input("User ID: ")
                app_name = input("App name: ")
                print("Enter updates as JSON (e.g. {\"userEmail\": \"new@email.com\"}):")
                updates_str = input()
                updates = json.loads(updates_str)
                result = admin.update_user(user_id, app_name, updates)
                print(f"Result: {result}")
            elif choice == "5":
                result = admin.get_plans()
                print("\nAvailable Plans:")
                for plan in result.get('data', []):
                    print(f"  - {plan.get('planName')}: ${plan.get('planMonthlyCost', 0)}/mo")
            elif choice == "6":
                result = admin.get_feature_flags()
                print(json.dumps(result, indent=2)[:1000])
            elif choice == "7":
                email_check = input("Email: ")
                r1 = admin.is_email_blocked(email_check)
                r2 = admin.is_email_domain_banned(email_check)
                print(f"Blocked: {r1}")
                print(f"Domain banned: {r2}")
            elif choice == "8":
                result = admin.get_current_user()
                p = result.get('payload', {})
                print(f"Name: {p.get('userUserName')}")
                print(f"Email: {p.get('userEmail')}")
                print(f"Plan: {p.get('plan', {}).get('planName')}")
                print(f"Credits: {p.get('usage', {}).get('availableCredits')}")
        except Exception as e:
            print(f"Error: {e}")
    
    print("Goodbye!")


if __name__ == "__main__":
    main()
