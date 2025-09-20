#!/usr/bin/env python3
"""
Test both API endpoints that the frontend uses
"""
import requests
import json

def test_analyze_endpoint():
    """Test the /analyze endpoint"""
    print("🔍 Testing /analyze endpoint (Landing page)")
    print("=" * 50)
    
    url = "http://127.0.0.1:8001/analyze"
    headers = {"Content-Type": "application/json"}
    data = {
        "skills": "React, JavaScript, CSS", 
        "expertise": "Beginner"
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ /analyze endpoint working!")
            print(f"Career paths: {len(result.get('career_paths', []))}")
            return True
        else:
            print(f"❌ /analyze failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_update_skills_endpoint():
    """Test the /update-skills endpoint"""
    print("\n🔍 Testing /update-skills endpoint (ChatBot)")
    print("=" * 50)
    
    # First create a user
    register_url = "http://127.0.0.1:8001/auth/register"
    headers = {"Content-Type": "application/json"}
    user_data = {
        "email": "testuser@example.com",
        "password": "testpass123",
        "full_name": "Test User",
        "skills": "HTML, CSS",
        "expertise": "Beginner"
    }
    
    try:
        # Try to register (might fail if user exists)
        requests.post(register_url, headers=headers, json=user_data)
    except:
        pass
    
    # Now test update skills
    update_url = "http://127.0.0.1:8001/update-skills"
    # Use a test user ID (in real app, this would come from auth)
    update_data = {
        "user_id": "test-user-123",
        "message": "I learned React and TypeScript"
    }
    
    try:
        response = requests.post(update_url, headers=headers, json=update_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ /update-skills endpoint working!")
            return True
        else:
            print(f"❌ /update-skills failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_health_endpoint():
    """Test the health endpoint"""
    print("\n🔍 Testing /health endpoint")
    print("=" * 30)
    
    try:
        response = requests.get("http://127.0.0.1:8001/health")
        if response.status_code == 200:
            print("✅ Backend server is healthy!")
            return True
        else:
            print("❌ Health check failed")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to backend: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Frontend Endpoints")
    print("=" * 60)
    
    health_ok = test_health_endpoint()
    analyze_ok = test_analyze_endpoint()
    update_ok = test_update_skills_endpoint()
    
    print("\n📊 Summary:")
    print(f"   Health check: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"   Landing page (/analyze): {'✅ PASS' if analyze_ok else '❌ FAIL'}")
    print(f"   ChatBot (/update-skills): {'✅ PASS' if update_ok else '❌ FAIL'}")
    
    if all([health_ok, analyze_ok]):
        print("\n🎉 Main functionality is working!")
        print("   - Landing page analysis should work")
        print("   - ChatBot might need user creation first")
        print("\n🌐 Frontend URL: http://localhost:3001")
    else:
        print("\n⚠️ Some issues detected - check server logs")