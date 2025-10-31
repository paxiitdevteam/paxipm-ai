# 🧪 End-to-End Test Guide

## Complete User Flow Testing

This guide helps you test the complete application flow from landing page to using all features.

---

## ✅ Test Flow 1: New User Registration & Onboarding

### Step 1: Landing Page
1. **Open:** `http://localhost:3000/`
2. **Verify:**
   - ✅ Professional landing page displays
   - ✅ Hero section with "Start Free Trial" button
   - ✅ Features section visible
   - ✅ "How It Works" section visible
   - ✅ Navigation shows "Login" and "Get Started"
3. **Action:** Click "Get Started" or "Register" button

### Step 2: Registration
1. **Open:** `http://localhost:3000/register`
2. **Fill Form:**
   - Name: `Test User`
   - Email: `test2@paxipm.ai`
   - Password: `Test123!`
   - Role: `Project Manager` (optional)
3. **Action:** Click "Register"
4. **Verify:**
   - ✅ Success message appears
   - ✅ Redirected to Dashboard
   - ✅ Token stored in localStorage
   - ✅ User info stored in localStorage

### Step 3: Dashboard
1. **Verify:**
   - ✅ Dashboard loads successfully
   - ✅ Shows welcome message with user name
   - ✅ Shows "0 Active Projects" (if new user)
   - ✅ Shows "0 Reports" (if new user)
   - ✅ Navigation visible (Projects, Reports, AI Tools, Logout)
   - ✅ No errors in console

---

## ✅ Test Flow 2: Create Project

### Step 1: Create New Project
1. **Navigate:** Click "Projects" in dashboard or go to `/projects`
2. **Action:** Click "Create New Project" button
3. **Fill Form:**
   - Title: `Website Redesign Project`
   - Description: `Complete redesign of company website with new features`
   - Client: `Acme Corp`
   - Start Date: Today's date
   - End Date: 3 months from now
   - Status: `Active`
4. **Action:** Click "Create Project"
5. **Verify:**
   - ✅ Project created successfully
   - ✅ Project appears in list
   - ✅ Redirected to project detail or list

### Step 2: View Project Details
1. **Action:** Click on project name
2. **Verify:**
   - ✅ Project details page loads
   - ✅ All project information displayed correctly
   - ✅ Project status visible
   - ✅ Dates formatted correctly

---

## ✅ Test Flow 3: AI Features

### Test 3.1: Generate Project Charter
1. **Navigate:** Click "AI Tools" in navigation
2. **Verify:**
   - ✅ AI Tools page loads
   - ✅ Tab "Generate Charter" is active
3. **Fill Form:**
   - Project Name: `Infrastructure Upgrade`
   - Description: `Upgrade all servers and migrate to cloud infrastructure`
4. **Action:** Click "Generate Charter"
5. **Verify:**
   - ✅ Loading indicator appears
   - ✅ Charter generated successfully
   - ✅ Charter text displayed
   - ✅ Can copy or save charter

### Test 3.2: Risk Analysis
1. **Navigate:** Click "Risk Analysis" tab in AI Tools
2. **Fill Form:**
   - Select a project or enter project data
3. **Action:** Click "Analyze Risks"
4. **Verify:**
   - ✅ Risk analysis completed
   - ✅ Risk score displayed (0-100)
   - ✅ Risk summary shown
   - ✅ Recommendations provided

### Test 3.3: Project Setup (Full AI Generation)
1. **Navigate:** Click "Project Setup" tab
2. **Fill Form:**
   - Project Name: `Mobile App Development`
   - Description: `Build iOS and Android mobile app`
   - Duration: `6 months`
   - Team Size: `5`
3. **Action:** Click "Generate Project Setup"
4. **Verify:**
   - ✅ Project Charter generated
   - ✅ Work Breakdown Structure (WBS) generated
   - ✅ Key Risks identified
   - ✅ All in JSON format

### Test 3.4: Reporting
1. **Navigate:** Click "Reporting" tab
2. **Fill Form:**
   - Select project
   - Enter progress data
3. **Action:** Click "Generate Report"
4. **Verify:**
   - ✅ Report generated
   - ✅ Summary displayed
   - ✅ Insights provided

### Test 3.5: PMO Report
1. **Navigate:** Click "PMO Report" tab
2. **Action:** Click "Generate PMO Report"
3. **Verify:**
   - ✅ PMO report generated
   - ✅ Professional format
   - ✅ Achievements, blockers, next actions included

---

## ✅ Test Flow 4: Reports Management

### Step 1: View Reports
1. **Navigate:** Click "Reports" in navigation
2. **Verify:**
   - ✅ Reports page loads
   - ✅ Shows all reports for user's projects
   - ✅ Reports sorted by date (newest first)

### Step 2: View Project-Specific Reports
1. **Action:** Click on a project in Projects page
2. **Navigate:** Go to Reports tab in project detail
3. **Verify:**
   - ✅ Only reports for that project shown
   - ✅ Report summaries visible

---

## ✅ Test Flow 5: Authentication & Security

### Test 5.1: Logout
1. **Action:** Click "Logout" button
2. **Verify:**
   - ✅ Redirected to Login page
   - ✅ Token removed from localStorage
   - ✅ User info removed from localStorage
   - ✅ Cannot access protected routes

### Test 5.2: Login Again
1. **Navigate:** Go to `/login`
2. **Fill Form:**
   - Email: `test2@paxipm.ai`
   - Password: `Test123!`
3. **Action:** Click "Login"
4. **Verify:**
   - ✅ Login successful
   - ✅ Redirected to Dashboard
   - ✅ All user data accessible

### Test 5.3: Protected Routes
1. **Action:** Try to access `/dashboard` without login
2. **Verify:**
   - ✅ Redirected to `/login`
   - ✅ Cannot access without token

---

## ✅ Test Flow 6: Data Isolation (Multi-User)

### Step 1: Create Second User
1. **Action:** Register new user: `user2@paxipm.ai`
2. **Action:** Create a project for user2
3. **Verify:**
   - ✅ Project created successfully

### Step 2: Switch Users
1. **Action:** Logout from user2
2. **Action:** Login as `test2@paxipm.ai` (first user)
3. **Verify:**
   - ✅ Only sees projects created by test2@paxipm.ai
   - ✅ Cannot see user2's projects
   - ✅ Data isolation working correctly

---

## ✅ Test Flow 7: Error Handling

### Test 7.1: Invalid Credentials
1. **Action:** Try to login with wrong password
2. **Verify:**
   - ✅ Error message displayed: "Invalid credentials"
   - ✅ Not redirected to dashboard

### Test 7.2: Network Errors
1. **Action:** Stop backend server
2. **Action:** Try to create project
3. **Verify:**
   - ✅ Error message displayed
   - ✅ Application doesn't crash
   - ✅ User-friendly error handling

### Test 7.3: Missing Data
1. **Action:** Try to generate charter without required fields
2. **Verify:**
   - ✅ Validation errors shown
   - ✅ Form doesn't submit

---

## ✅ Verification Checklist

### Landing Page ✅
- [ ] Professional design
- [ ] All sections visible
- [ ] Navigation works
- [ ] CTAs work

### Authentication ✅
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Protected routes secured

### Projects ✅
- [ ] Create project works
- [ ] List projects works
- [ ] View project details works
- [ ] User isolation works

### Dashboard ✅
- [ ] Loads correctly
- [ ] Shows user data
- [ ] Navigation works
- [ ] Stats accurate

### AI Features ✅
- [ ] Charter generation works
- [ ] Risk analysis works
- [ ] Project setup works
- [ ] Reporting works
- [ ] PMO report works

### Reports ✅
- [ ] List reports works
- [ ] Project reports work
- [ ] User isolation works

---

## 🚀 Quick Test Commands

### Start All Services:
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start

# Terminal 3: AI Engine
cd ai_engine
python -m uvicorn main:app --port 8000
```

### Test AI Engine:
```bash
cd backend
npm run test-ai
```

### Test Database:
```bash
cd backend
npm run check
```

---

## 📝 Test Results Template

After testing, document results:

```
Test Date: [Date]
Tester: [Name]

Landing Page: ✅/❌
Registration: ✅/❌
Login: ✅/❌
Dashboard: ✅/❌
Projects: ✅/❌
AI Features: ✅/❌
Reports: ✅/❌
Data Isolation: ✅/❌

Issues Found: [List any issues]

Overall Status: ✅ Ready / ⚠️ Issues / ❌ Not Ready
```

