import requests
import json

def test_health():
    url = "http://localhost:5001/api/health"
    
    try:
        response = requests.get(url)
        print(f"Health Check Status Code: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Health Check Error: {e}")

def test_api():
    url = "http://localhost:5001/api/recommend"
    payload = {
        "merchant": "amazon",
        "amount": 100
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        print("Sending request to:", url)
        print("With payload:", json.dumps(payload, indent=2))
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(json.dumps(response.json(), indent=2))
        else:
            print("Error response:", response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Testing API Health...")
    test_health()
    
    print("\nTesting API Recommendation...")
    test_api() 