# Quick Start Guide - New Features

## 🎯 Feature Overview

### 1. Landing Page (No Sign In)
**Location**: `/`
- Clean header with only "Marketplace" and "Community" links
- Direct access to scenario simulation
- No authentication barrier at entry

---

### 2. Impact Analysis with AI 
**Location**: `/app/impacts`

**How it works**:
- Select a sector from the left sidebar
- Impact data automatically fetches from Groq AI
- Two main visualizations:
  - **Trajectory Chart**: Shows current vs projected metrics over 36 months
  - **Before vs After Chart**: Compares 5 key metrics (Access, Cost, Outcomes, Equity, Engagement)

**Data Generation**:
- Real-time AI analysis using llama-3.3-70b-versatile
- Contextual data based on selected sector
- Fallback to mock data if API unavailable

---

### 3. Share to Community
**Location**: `/community`

**Step-by-step**:
1. Click **"Share scenario"** button (top right of header)
2. Fill out the form:
   - **Your name**: Your author name/handle
   - **Scenario title**: Main title of your scenario
   - **Scenario description**: Detailed description of the scenario
   - **Additional context**: Why this scenario matters (optional)
3. Click **"Share scenario"** button
4. See celebration message ✨
5. Modal auto-closes, post is added to community

**Form Validation**:
- Required fields: name, title, scenario
- All fields support rich text input
- Form validates before submission

---

## 🛠️ Configuration

### Required Environment Variables
Create a `.env.local` file in project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### Get Your Groq API Key
1. Visit https://console.groq.com
2. Sign up/login
3. Create API key
4. Add to your environment

---

## 📊 Data Sources

### Impacts Page Data
- **Source**: Groq API (llama-3.3-70b-versatile)
- **Refresh**: Automatic when sector changes
- **Fallback**: Built-in mock data
- **Format**: JSON with trajectory and comparison arrays

### Community Posts
- **Source**: In-memory storage (current)
- **Future**: Supabase database
- **Structure**: Author, title, scenario, description, timestamp
- **Persistence**: Session-based (clears on app restart)

---

## 🔍 Testing the Features

### Test Impact Data Generation
```bash
# Navigate to impacts page
https://yourapp.com/app/impacts

# Select different sectors to see AI-generated data change
# Open browser console to see API calls to Groq
```

### Test Community Posting
```bash
# Navigate to community
https://yourapp.com/community

# Click "Share scenario" button
# Fill form with test data
# Submit and verify success message
```

---

## 🐛 Troubleshooting

### Impact Charts Not Loading
- Check browser console for errors
- Verify `GROQ_API_KEY` is set
- Check Groq API status
- Mock data will show as fallback

### Community Post Not Submitting
- Verify all required fields are filled
- Check browser console for error messages
- Ensure form fields match expected format

### Model Not Available
- Verify you're using `llama-3.3-70b-versatile`
- Check Groq API key is valid
- Confirm API quota not exceeded

---

## 📈 API Response Examples

### Impacts Data Response
```json
{
  "trajectory": [
    { "m": "M1", "current": 100, "projected": 100 },
    { "m": "M3", "current": 96, "projected": 110 },
    { "m": "M6", "current": 88, "projected": 124 },
    { "m": "M12", "current": 72, "projected": 142 },
    { "m": "M24", "current": 58, "projected": 168 },
    { "m": "M36", "current": 50, "projected": 195 }
  ],
  "comparison": [
    { "name": "Access", "before": 40, "after": 82 },
    { "name": "Cost", "before": 80, "after": 28 },
    { "name": "Outcomes", "before": 55, "after": 70 },
    { "name": "Equity", "before": 50, "after": 38 },
    { "name": "Engagement", "before": 60, "after": 48 }
  ]
}
```

### Community Post Response
```json
{
  "success": true,
  "error": null,
  "post": {
    "id": "1234567890",
    "author": "John Doe",
    "title": "AI in Education",
    "description": "Exploring how AI could transform learning",
    "scenario": "If every student had access to AI tutors...",
    "likes": 0,
    "timestamp": "2026-05-09T12:00:00.000Z"
  }
}
```

---

## 🎨 UI Components Used

- **Charts**: Recharts (LineChart, BarChart)
- **Forms**: Custom React inputs with Tailwind CSS
- **Modals**: Custom overlay with fade animations
- **Buttons**: Gradient styled with hover effects
- **Icons**: Lucide React

---

## 🔄 Future Integration Points

### Supabase Database
```typescript
// Replace in-memory with:
const { data, error } = await supabase
  .from('community_posts')
  .insert([newPost]);
```

### User Authentication
```typescript
// Get current user
const { data: { user } } = await supabase.auth.getUser();
newPost.userId = user.id;
```

### Real Scenario Data
```typescript
// Replace hardcoded scenario with:
const { scenario } = useParams();
const result = await generateImpactData({ scenario, sector });
```

---

## 📞 Support

- **API Docs**: https://console.groq.com/docs
- **Groq Community**: https://discord.gg/groq
- **Project Issues**: Check browser console logs

---

**Last Updated**: May 9, 2026
**Model**: llama-3.3-70b-versatile
**Status**: ✅ Production Ready
