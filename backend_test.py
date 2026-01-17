#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class FootballRecruitingAPITester:
    def __init__(self, base_url="https://recruit-ready-5.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status=200, data=None, timeout=10):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(response_data) > 0:
                        print(f"   Response keys: {list(response_data.keys())}")
                    elif isinstance(response_data, list) and len(response_data) > 0:
                        print(f"   Response: List with {len(response_data)} items")
                except:
                    print(f"   Response: Non-JSON or empty")
            else:
                self.tests_passed += 1 if response.status_code in [200, 201] else 0
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text[:200]}")
                self.failed_tests.append({
                    'name': name,
                    'endpoint': endpoint,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'error': response.text[:200]
                })

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text

        except requests.exceptions.Timeout:
            print(f"❌ FAILED - Request timeout after {timeout}s")
            self.failed_tests.append({
                'name': name,
                'endpoint': endpoint,
                'error': 'Request timeout'
            })
            return False, {}
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'endpoint': endpoint,
                'error': str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "")

    def test_athlete_data(self):
        """Test athlete profile endpoint"""
        return self.run_test("Get Athlete Profile", "GET", "athlete")

    def test_measurables_data(self):
        """Test athlete measurables endpoint"""
        return self.run_test("Get Athlete Measurables", "GET", "measurables")

    def test_films_data(self):
        """Test game films endpoint"""
        return self.run_test("Get Game Films", "GET", "films")

    def test_stats_data(self):
        """Test season stats endpoint"""
        return self.run_test("Get Season Stats", "GET", "stats")

    def test_contacts_data(self):
        """Test coach contacts endpoint"""
        return self.run_test("Get Coach Contacts", "GET", "contacts")

    def test_testimonials_data(self):
        """Test testimonials endpoint"""
        return self.run_test("Get Testimonials", "GET", "testimonials")

    def test_analytics_pageview(self):
        """Test analytics pageview tracking"""
        return self.run_test(
            "Track Page View", 
            "POST", 
            "analytics/pageview?page=test&referrer=backend_test"
        )

    def test_analytics_video_click(self):
        """Test analytics video click tracking"""
        return self.run_test(
            "Track Video Click", 
            "POST", 
            "analytics/video-click?video_id=test-123&video_title=Test%20Video"
        )

    def test_analytics_summary(self):
        """Test analytics summary endpoint"""
        return self.run_test("Get Analytics Summary", "GET", "analytics/summary")

    def test_pdf_export(self):
        """Test PDF export endpoint"""
        print(f"\n🔍 Testing PDF Export...")
        url = f"{self.api_url}/export/pdf"
        
        try:
            response = requests.get(url, timeout=15)
            self.tests_run += 1
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                if 'application/pdf' in content_type:
                    self.tests_passed += 1
                    print(f"✅ PASSED - PDF generated successfully")
                    print(f"   Content-Type: {content_type}")
                    print(f"   Content-Length: {len(response.content)} bytes")
                    return True, "PDF generated successfully"
                else:
                    print(f"❌ FAILED - Wrong content type: {content_type}")
                    self.failed_tests.append({
                        'name': 'PDF Export',
                        'endpoint': 'export/pdf',
                        'error': f'Wrong content type: {content_type}'
                    })
                    return False, {}
            else:
                print(f"❌ FAILED - Status: {response.status_code}")
                self.failed_tests.append({
                    'name': 'PDF Export',
                    'endpoint': 'export/pdf',
                    'expected': 200,
                    'actual': response.status_code,
                    'error': response.text[:200]
                })
                return False, {}
                
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.failed_tests.append({
                'name': 'PDF Export',
                'endpoint': 'export/pdf',
                'error': str(e)
            })
            return False, {}

    def run_all_tests(self):
        """Run all API tests"""
        print("=" * 60)
        print("🏈 FOOTBALL RECRUITING WEBSITE - BACKEND API TESTS")
        print("=" * 60)
        
        # Test all endpoints
        test_methods = [
            self.test_root_endpoint,
            self.test_athlete_data,
            self.test_measurables_data,
            self.test_films_data,
            self.test_stats_data,
            self.test_contacts_data,
            self.test_testimonials_data,
            self.test_analytics_pageview,
            self.test_analytics_video_click,
            self.test_analytics_summary,
            self.test_pdf_export,
        ]
        
        for test_method in test_methods:
            try:
                test_method()
            except Exception as e:
                print(f"❌ FAILED - Test method error: {str(e)}")
                self.failed_tests.append({
                    'name': test_method.__name__,
                    'error': f'Test method error: {str(e)}'
                })

        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"{i}. {test['name']}")
                if 'endpoint' in test:
                    print(f"   Endpoint: {test['endpoint']}")
                if 'expected' in test and 'actual' in test:
                    print(f"   Expected: {test['expected']}, Got: {test['actual']}")
                if 'error' in test:
                    print(f"   Error: {test['error']}")
                print()
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = FootballRecruitingAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())