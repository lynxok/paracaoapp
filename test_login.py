from playwright.sync_api import sync_playwright

def test_login():
    print("Starting Web Testing for Óptica Paracáo...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        print("Navigating to http://localhost:3000...")
        page.goto('http://localhost:3000')
        page.wait_for_load_state('networkidle')
        
        # Check if we are at the login page
        if page.locator('text=Iniciar Sesión').count() > 0:
            print("Login page detected. Attempting to log in...")
            # Fill the username and password (using default mock credentials)
            page.fill('input[placeholder="Tu nombre de usuario"]', 'admin')
            page.fill('input[placeholder="••••••••"]', 'admin')
            
            # Take screenshot before login
            page.screenshot(path='test_before_login.png')
            print("Screenshot taken: test_before_login.png")
            
            # Click the login button
            page.click('button[type="submit"]')
            page.wait_for_load_state('networkidle')
            
            print("Login submitted. Verifying Dashboard...")
            
            # Take screenshot after login
            page.screenshot(path='test_after_login.png')
            print("Screenshot taken: test_after_login.png")
            
            # Verify if we reached the dashboard
            if page.locator('text=Actividad Reciente').count() > 0 or page.locator('text=Acciones Rápidas').count() > 0:
                print("PASS: Successfully logged in and reached the Dashboard!")
            else:
                print("FAIL: Did not reach the Dashboard after login.")
        else:
            print("Not on the login page. Current URL:", page.url)
            page.screenshot(path='test_current_page.png')
            print("Screenshot taken: test_current_page.png")
            
        browser.close()

if __name__ == "__main__":
    test_login()
