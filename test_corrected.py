#!/usr/bin/env python3
"""
Test the corrected analyze endpoint
"""
import requests
import json

def test_corrected_endpoint():
    """Test the corrected /analyze endpoint"""
    
    print("🔍 Testing Corrected Analyze Endpoint")
    print("=" * 40)
    
    # Test data
    url = "http://127.0.0.1:8000/analyze"
    headers = {"Content-Type": "application/json"}
    data = {
        "skills": "React, JavaScript, CSS, HTML", 
        "expertise": "Beginner"
    }
    
    print(f"📤 Request: {json.dumps(data, indent=2)}")
    print(f"🌐 URL: {url}")
    print("-" * 40)
    
    try:
        response = requests.post(url, headers=headers, json=data)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"⏱️ Response Time: {response.elapsed.total_seconds():.2f}s")
        print("-" * 40)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS - Frontend should now work!")
            print(f"🎯 Career Paths: {len(result.get('career_paths', []))}")
            
            # Show selected path
            selected = result.get('selected_path', {})
            if selected:
                print(f"⭐ Recommended: {selected.get('title', 'N/A')}")
            
            print("\n🚀 Try the frontend now:")
            print("   1. Go to http://localhost:3001")
            print("   2. Enter skills: 'React, JavaScript, CSS'")
            print("   3. Select expertise: 'Beginner'")
            print("   4. Click 'Find My Career Path'")
            
            return True
        else:
            print("❌ ERROR - Response:")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    test_corrected_endpoint()