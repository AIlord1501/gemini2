# Career Path Analyzer API

A FastAPI backend service that uses Google's Vertex AI (Gemini-1.0-pro model) to analyze skills and expertise, generating personalized career paths, roadmaps, and course recommendations.

## Features

- **POST /analyze** endpoint that accepts skills and expertise
- Generates top 3 career paths based on input
- Creates a detailed roadmap for the best matching career path
- Recommends 3-5 relevant courses
- CORS middleware configured for React frontend (localhost:3000)
- Comprehensive error handling and fallback responses
- JSON-only responses (no plain text)

## Requirements

- Python 3.10+
- Google Cloud Project with Vertex AI enabled
- Required environment variables

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gemini2
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up Google Cloud credentials:
```bash
# Set your Google Cloud project ID
export GOOGLE_CLOUD_PROJECT="your-project-id"

# Authenticate with Google Cloud
gcloud auth application-default login
```

## Environment Variables

Create a `.env` file or set the following environment variable:
```
GOOGLE_CLOUD_PROJECT=your-google-cloud-project-id
```

## Running the Application

1. Start the development server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. The API will be available at `http://localhost:8000`

3. View the interactive API documentation at `http://localhost:8000/docs`

## API Endpoints

### POST /analyze

Analyzes skills and expertise to generate career recommendations.

**Request Body:**
```json
{
  "skills": "Python, JavaScript, React, Node.js",
  "expertise": "Full-stack web development with 2 years experience"
}
```

**Response:**
```json
{
  "career_paths": [
    {
      "title": "Senior Full-Stack Developer",
      "description": "Lead development of complex web applications",
      "required_skills": ["Python", "JavaScript", "React", "Node.js"],
      "salary_range": "$80,000 - $150,000",
      "growth_prospect": "High - Strong demand for full-stack developers"
    }
  ],
  "selected_path": {
    "title": "Senior Full-Stack Developer",
    "description": "Lead development of complex web applications using modern technologies",
    "required_skills": ["Python", "JavaScript", "React", "Node.js", "System Design"],
    "salary_range": "$80,000 - $150,000",
    "growth_prospect": "High - Strong demand for full-stack developers"
  },
  "roadmap": [
    {
      "step": 1,
      "title": "Master Advanced Concepts",
      "description": "Deepen understanding of advanced programming concepts",
      "duration": "3-6 months",
      "resources": ["Advanced tutorials", "Code reviews", "Open source contributions"]
    }
  ],
  "courses": [
    {
      "title": "Advanced React Patterns",
      "provider": "Frontend Masters",
      "duration": "8 weeks",
      "difficulty": "Advanced",
      "url": "https://frontendmasters.com/courses/advanced-react-patterns/"
    }
  ]
}
```

### GET /

Health check endpoint.

**Response:**
```json
{
  "message": "Career Path Analyzer API is running"
}
```

### GET /health

Detailed health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "career-analyzer"
}
```

## Project Structure

```
gemini2/
├── main.py                    # FastAPI application entry point
├── requirements.txt           # Python dependencies
├── models/                    # Pydantic models
│   ├── __init__.py
│   └── schemas.py            # Request/Response schemas
├── services/                  # Business logic services
│   ├── __init__.py
│   └── ai_service.py         # Vertex AI integration
├── routes/                    # API route handlers
│   ├── __init__.py
│   ├── analyze.py            # Career analysis endpoints
│   └── health.py             # Health check endpoints
├── config/                    # Configuration settings
│   ├── __init__.py
│   └── settings.py        # Application settings
├── frontend/                   # React frontend application
│   ├── package.json          # Frontend dependencies
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── postcss.config.js     # PostCSS configuration
│   ├── public/               # Static assets
│   │   └── index.html        # HTML template
│   └── src/                  # React source code
│       ├── App.js            # Main App component
│       ├── App.css           # Custom styles
│       ├── index.js          # React entry point
│       ├── index.css         # Global styles
│       ├── components/       # Reusable components
│       │   └── Navbar.js     # Navigation component
│       ├── pages/            # Page components
│       │   ├── Landing.js    # Landing page
│       │   ├── Dashboard.js  # Dashboard page
│       │   ├── CareerPath.js # Career paths page
│       │   ├── Roadmap.js    # Roadmap page
│       │   ├── Courses.js    # Courses page
│       │   └── Settings.js   # Settings page
│       ├── context/          # React Context
│       │   └── AppContext.js # Global state management
│       └── services/         # API services
│           └── api.js        # Backend API integration
└── README.md                 # This file
```

## Dependencies

### Backend Dependencies
- **fastapi**: Web framework for building APIs
- **uvicorn**: ASGI server for running FastAPI
- **google-cloud-aiplatform**: Google Cloud AI Platform client
- **pydantic**: Data validation using Python type annotations
- **python-multipart**: Support for multipart form data

### Frontend Dependencies
- **react**: JavaScript library for building user interfaces
- **react-router-dom**: Declarative routing for React
- **axios**: Promise-based HTTP client
- **tailwindcss**: Utility-first CSS framework
- **autoprefixer**: PostCSS plugin to parse CSS and add vendor prefixes
- **postcss**: Tool for transforming CSS with JavaScript

## Error Handling

The API includes comprehensive error handling:

- **500 Internal Server Error**: When Vertex AI generation fails, a fallback response is provided
- **422 Validation Error**: When request data doesn't match the expected schema
- **Fallback Response**: If AI generation fails, the API returns a generic but useful response

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (React development server)

To modify CORS settings, update the `allow_origins` list in `main.py`.

## Development

### Backend Development

To run the backend in development mode with auto-reload:

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GOOGLE_CLOUD_PROJECT="your-project-id"

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

To run the frontend in development mode:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000` and will automatically connect to the backend API.

## Frontend Features

The React frontend includes:

### Pages
- **Landing**: Input form for skills and expertise analysis
- **Dashboard**: Overview of career analysis results
- **Career Path**: Detailed view of all recommended career paths
- **Roadmap**: Step-by-step career development guide
- **Courses**: Curated learning resources and courses
- **Settings**: User profile and application preferences

### Key Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Global State Management**: React Context for data sharing across components
- **API Integration**: Axios-based service for backend communication
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Visual feedback during API calls
- **Navigation**: React Router for seamless page transitions

## Modular Architecture

The project follows a clean, modular architecture:

### Backend
- **`models/`**: Contains all Pydantic models for request/response validation
- **`services/`**: Contains business logic and external service integrations
- **`routes/`**: Contains API route handlers organized by functionality
- **`config/`**: Contains application settings and configuration
- **`main.py`**: Application entry point that ties everything together

### Frontend
- **`components/`**: Reusable UI components
- **`pages/`**: Page-level components for different routes
- **`context/`**: React Context for global state management
- **`services/`**: API service layer for backend communication

This structure makes the codebase:
- **Maintainable**: Easy to find and modify specific functionality
- **Testable**: Each module can be tested independently
- **Scalable**: Easy to add new features without affecting existing code
- **Readable**: Clear separation of concerns

## Production Deployment

For production deployment, consider:

1. Using a production ASGI server like Gunicorn with Uvicorn workers
2. Setting up proper logging
3. Configuring environment variables securely
4. Setting up monitoring and health checks
5. Using a reverse proxy like Nginx

## Troubleshooting

### Common Issues

1. **Google Cloud Authentication**: Ensure you're authenticated with `gcloud auth application-default login`
2. **Project ID**: Make sure `GOOGLE_CLOUD_PROJECT` is set correctly
3. **Vertex AI Access**: Ensure Vertex AI is enabled in your Google Cloud project
4. **CORS Issues**: Check that your frontend URL matches the allowed origins

### Logs

The application logs errors to the console. Check the terminal output for detailed error messages.

## License

This project is open source and available under the MIT License.
