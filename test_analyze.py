#!/usr/bin/env python3
"""
Test the analyze endpoint directly
"""
import requests
import json

def test_analyze_endpoint():
    """Test the /analyze endpoint"""
    
    print("🔍 Testing Career Analysis Endpoint")
    print("=" * 40)
    
    # Test data
    url = "http://127.0.0.1:8001/analyze"
    headers = {"Content-Type": "application/json"}
    data = {
        "skills": "Python, JavaScript, React, Machine Learning, Data Analysis", 
        "expertise": "Intermediate"
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
            print("✅ SUCCESS - Career Analysis Generated!")
            print(f"🎯 Career Paths: {len(result.get('career_paths', []))}")
            print(f"🗺️ Roadmap Steps: {len(result.get('roadmap', []))}")
            print(f"📚 Courses: {len(result.get('courses', []))}")
            
            # Show selected path
            selected = result.get('selected_path', {})
            if selected:
                print(f"\n⭐ Recommended Career: {selected.get('title', 'N/A')}")
                print(f"💰 Salary Range: {selected.get('salary_range', 'N/A')}")
                print(f"📈 Growth Prospect: {selected.get('growth_prospect', 'N/A')}")
            
            # Show first few career paths
            paths = result.get('career_paths', [])
            if paths:
                print(f"\n📋 Available Career Paths:")
                for i, path in enumerate(paths[:3], 1):
                    print(f"   {i}. {path.get('title', 'N/A')} - {path.get('salary_range', 'N/A')}")
            
            return True
        else:
            print("❌ ERROR - Response:")
            try:
                error_detail = response.json()
                print(json.dumps(error_detail, indent=2))
            except:
                print(response.text)
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to server. Make sure it's running on http://127.0.0.1:8001")
        return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_simple_skills():
    """Test with simple skills"""
    
    print("\n🔍 Testing with Simple Skills")
    print("=" * 40)
    
    url = "http://127.0.0.1:8001/analyze"
    headers = {"Content-Type": "application/json"}
    data = {
        "skills": "HTML, CSS, JavaScript", 
        "expertise": "Beginner"
    }
    
    print(f"📤 Request: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Simple skills analysis successful!")
            return True
        else:
            print("❌ Simple skills analysis failed:")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    success1 = test_analyze_endpoint()
    success2 = test_simple_skills()
    
    print(f"\n🏁 Test Summary:")
    print(f"   Complex skills test: {'✅ PASS' if success1 else '❌ FAIL'}")
    print(f"   Simple skills test: {'✅ PASS' if success2 else '❌ FAIL'}")
    
    if not (success1 or success2):
        print("\n🔧 Troubleshooting Tips:")
        print("   1. Check if backend server is running on port 8001")
        print("   2. Check server logs for errors")
        print("   3. Verify AI service is working (may need Google Cloud credentials)")
        print("   4. Try restarting the backend server")