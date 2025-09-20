#!/usr/bin/env python3
"""
Test script for the /update-skills endpoint
"""
import requests
import json
import random
import string

def generate_random_email():
    """Generate a random email for testing"""
    random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test{random_string}@example.com"

def create_test_user():
    """Create a test user for testing"""
    url = "http://127.0.0.1:8001/auth/register"
    headers = {"Content-Type": "application/json"}
    data = {
        "email": generate_random_email(),
        "password": "testpassword123",
        "full_name": "Test User",
        "skills": "Python, JavaScript",
        "expertise": "Intermediate"
    }
    
    print("Creating test user...")
    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ Test user created with ID: {user_data['user']['id']}")
            return user_data['user']['id']
        else:
            print(f"❌ Failed to create test user: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error creating test user: {str(e)}")
        return None

def test_update_skills(user_id):
    """Test the update-skills endpoint"""
    
    # Test data
    url = "http://127.0.0.1:8001/update-skills"
    headers = {"Content-Type": "application/json"}
    data = {
        "user_id": user_id, 
        "message": "I learned React and SQL database management"
    }
    
    print("\nTesting /update-skills endpoint...")
    print(f"URL: {url}")
    print(f"Data: {json.dumps(data, indent=2)}")
    print("-" * 50)
    
    try:
        response = requests.post(url, headers=headers, json=data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print("-" * 50)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS - Response:")
            print(json.dumps(result, indent=2, default=str))
            
            # Display extracted skills
            print("\n📚 Extracted Skills:")
            for skill in result.get('extracted_skills', []):
                print(f"  - {skill['skill']} ({skill['expertise_level']})")
                
            print("\n🎯 Updated Skills List:")
            for skill in result.get('updated_skills_list', []):
                print(f"  - {skill}")
                
        else:
            print("❌ ERROR - Response:")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to server. Make sure it's running on http://127.0.0.1:8001")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}") 
        
def test_another_message(user_id):
    """Test another message to see skill merging"""
    
    # Test data
    url = "http://127.0.0.1:8001/update-skills"
    headers = {"Content-Type": "application/json"}
    data = {
        "user_id": user_id, 
        "message": "I became an expert in Docker and started learning advanced Machine Learning"
    }
    
    print("\n\nTesting another message for skill merging...")
    print(f"Data: {json.dumps(data, indent=2)}")
    print("-" * 50)
    
    try:
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS - Second message processed:")
            
            # Display extracted skills
            print("\n📚 New Extracted Skills:")
            for skill in result.get('extracted_skills', []):
                print(f"  - {skill['skill']} ({skill['expertise_level']})")
                
            print("\n🎯 Complete Updated Skills List:")
            for skill in result.get('updated_skills_list', []):
                print(f"  - {skill}")
                
        else:
            print("❌ ERROR - Response:")
            print(response.text)
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

if __name__ == "__main__":
    # Create a test user first
    user_id = create_test_user()
    
    if user_id:
        # Test the update-skills endpoint
        test_update_skills(user_id)
        
        # Test another message to see skill merging
        test_another_message(user_id)
    else:
        print("❌ Cannot test update-skills without a valid user.")