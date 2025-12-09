"""
Example: Search and Update User Email
======================================

This example demonstrates how to:
1. Login to the Wildeer Admin API
2. Search for a user by email
3. Update their email address
"""

from wildeer_admin import WildeerAdmin

# Initialize client
admin = WildeerAdmin()

# Login (opens Chrome browser briefly)
admin.login_via_browser(
    username="richie.waugh@trajectdata.com",
    password="YOUR_PASSWORD_HERE",
    headless=True  # Set to False to see the browser
)

# Example 1: Search for a user
print("\n=== Search Example ===")
results = admin.search_users("doordash")
print(f"Found {results['info']['total_count']} users")

for user in results['data'][:3]:
    print(f"  - {user['userEmail']}")
    print(f"    ID: {user['userId']}")
    print(f"    App: {user['appName']}")

# Example 2: Update user email
print("\n=== Update Example ===")
# First, find the user
search = admin.search_users("old@email.com")
if search['info']['total_count'] > 0:
    user = search['data'][0]
    
    # Update their email
    result = admin.update_user(
        user_id=user['userId'],
        app_name=user['appName'],
        updates={"userEmail": "new@email.com"}
    )
    print(f"Update result: {result}")

# Example 3: Block a user
print("\n=== Block/Unblock Example ===")
# admin.block_user("USER_ID", "serpwow")
# admin.unblock_user("USER_ID", "serpwow")

# Example 4: Get plans
print("\n=== Plans Example ===")
plans = admin.get_plans()
for plan in plans['data'][:5]:
    print(f"  - {plan.get('planName')}")

# Example 5: Feature flags
print("\n=== Feature Flags ===")
flags = admin.get_feature_flags()
print(f"Flags available: {list(flags.get('payload', {}).keys())[:5]}")

print("\nDone!")
