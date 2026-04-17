import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_flow():
    # 1. Login
    print("Testing Login...")
    login_data = {"email": "admin@phishguard.ai", "password": "demo1234"}
    resp = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        return
    
    token = resp.json()["token"]
    print("Login success!")

    # 2. Analyze
    print("Testing Analyze (Text only)...")
    headers = {"Authorization": f"Bearer {token}"}
    analyze_data = {"text": "Urgent: Your account is suspended. Click here: http://phish.com"}
    resp = requests.post(f"{BASE_URL}/analyze", data=analyze_data, headers=headers)
    
    if resp.status_code == 200:
        print("Analysis result:")
        print(json.dumps(resp.json(), indent=2))
    else:
        print(f"Analysis failed: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    test_flow()
