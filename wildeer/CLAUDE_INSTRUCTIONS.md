# Instructions for Claude

You have access to a Python client for the Wildeer LLP User Management API. This client handles authentication and provides methods for searching, viewing, and editing users.

## Setup

1. Ensure dependencies are installed:
```bash
pip install requests selenium webdriver-manager
```

2. Import and initialize the client:
```python
from wildeer_admin import WildeerAdmin

admin = WildeerAdmin()
admin.login_via_browser("richie.waugh@trajectdata.com", "PASSWORD", headless=True)
```

## Available Methods

### Search/List Users
```python
# Search by email, user ID, or API key
results = admin.search_users("search_term")

# List with pagination
users = admin.list_users(page=1, page_size=25)

# Filter by app
users = admin.list_users(app_names=["serpwow", "rainforestapi"])
```

### Update User
```python
# Update any field
admin.update_user("USER_ID", "APP_NAME", {
    "userEmail": "new@email.com",
    "isAdminBlocked": True,
    "hasPaymentProblem": False,
    "overageEnabled": True
})

# Convenience methods
admin.block_user("USER_ID", "APP_NAME")
admin.unblock_user("USER_ID", "APP_NAME")
admin.enable_overage("USER_ID", "APP_NAME", multiplier=2)
```

### Other Operations
```python
# Get user usage stats
usage = admin.get_user_usage("USER_ID")

# Get available plans
plans = admin.get_plans()

# Get feature flags
flags = admin.get_feature_flags()

# Check ban status
admin.is_email_blocked("email@example.com")
admin.is_email_domain_banned("email@example.com")
admin.is_api_key_banned("API_KEY")
admin.is_ip_banned("1.2.3.4")
```

## Response Format

All methods return dictionaries with this structure:
```python
{
    "success": True,
    "info": {"total_count": N, ...},  # For list endpoints
    "data": [...],                     # For list endpoints
    "payload": {...}                   # For single item endpoints
}
```

## Available Apps

Users can belong to these apps:
- serpwow, rainforestapi, scaleserp, valueserp
- asindataapi, backyardapi, bigboxapi, bluecartapi
- countdownapi, redcircleapi

## Notes

- Tokens expire after ~1 hour. Use `login_via_browser()` to get a fresh one.
- Use `headless=True` for automated scripts (no browser window).
- The `update_user()` method requires both `user_id` AND `app_name`.
