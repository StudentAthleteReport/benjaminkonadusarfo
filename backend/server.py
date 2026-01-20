from fastapi import FastAPI, APIRouter, Response, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class AthleteProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    graduation_year: int
    positions: List[str]
    height: str
    weight: int
    wingspan: Optional[str] = None
    high_school: str
    city: str
    state: str
    jersey_number: int
    gpa: float
    sat_score: Optional[int] = None
    act_score: Optional[int] = None
    ncaa_id: Optional[str] = None
    hudl_url: Optional[str] = None
    youtube_url: Optional[str] = None
    twitter_handle: Optional[str] = None
    instagram_handle: Optional[str] = None
    profile_image: Optional[str] = None
    highlight_image: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AthleteMeasurables(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    athlete_id: str
    forty_yard: Optional[float] = None
    shuttle: Optional[float] = None
    vertical_jump: Optional[float] = None
    broad_jump: Optional[str] = None
    bench_press: Optional[int] = None
    squat: Optional[int] = None
    deadlift: Optional[int] = None
    wingspan: Optional[str] = None
    hand_size: Optional[str] = None
    arm_length: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GameFilm(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    athlete_id: str
    title: str
    category: str  # "highlights", "full_game", "position_cuts"
    video_url: str
    thumbnail_url: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    tags: List[str] = []
    timestamps: List[Dict[str, Any]] = []  # [{"time": "0:45", "description": "Cover 2 read"}]
    season: str
    game_date: Optional[str] = None
    opponent: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SeasonStats(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    athlete_id: str
    season: str
    games_played: int
    # Defensive stats
    tackles: Optional[int] = None
    solo_tackles: Optional[int] = None
    assisted_tackles: Optional[int] = None
    sacks: Optional[float] = None
    interceptions: Optional[int] = None
    passes_defended: Optional[int] = None
    forced_fumbles: Optional[int] = None
    fumble_recoveries: Optional[int] = None
    # Offensive stats (if applicable)
    receptions: Optional[int] = None
    receiving_yards: Optional[int] = None
    rushing_yards: Optional[int] = None
    touchdowns: Optional[int] = None
    # Honors
    honors: List[str] = []
    captain: bool = False

class CoachContact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    athlete_id: str
    name: str
    title: str
    email: str
    phone: str
    school: Optional[str] = None
    photo_url: Optional[str] = None

class Testimonial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    athlete_id: str
    quote: str
    author_name: str
    author_title: str

class PageView(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page: str
    referrer: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VideoClick(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    video_id: str
    video_title: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Elite Recruit API"}

# --- Athlete Profile ---
@api_router.get("/athlete")
async def get_athlete():
    athlete = await db.athletes.find_one({}, {"_id": 0})
    if not athlete:
        # Return default sample athlete
        return get_sample_athlete()
    if isinstance(athlete.get('created_at'), str):
        athlete['created_at'] = datetime.fromisoformat(athlete['created_at'])
    return athlete

@api_router.post("/athlete")
async def create_or_update_athlete(athlete: AthleteProfile):
    doc = athlete.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.athletes.delete_many({})  # Only one athlete per site
    await db.athletes.insert_one(doc)
    return {"status": "success", "athlete_id": athlete.id}

# --- Measurables ---
@api_router.get("/measurables")
async def get_measurables():
    measurables = await db.measurables.find_one({}, {"_id": 0})
    if not measurables:
        return get_sample_measurables()
    return measurables

@api_router.post("/measurables")
async def create_or_update_measurables(measurables: AthleteMeasurables):
    doc = measurables.model_dump()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.measurables.delete_many({})
    await db.measurables.insert_one(doc)
    return {"status": "success"}

# --- Game Film ---
@api_router.get("/films")
async def get_films():
    films = await db.films.find({}, {"_id": 0}).to_list(100)
    if not films:
        return get_sample_films()
    return films

@api_router.post("/films")
async def add_film(film: GameFilm):
    doc = film.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.films.insert_one(doc)
    return {"status": "success", "film_id": film.id}

# --- Season Stats ---
@api_router.get("/stats")
async def get_stats():
    stats = await db.stats.find({}, {"_id": 0}).to_list(10)
    if not stats:
        return get_sample_stats()
    return stats

@api_router.post("/stats")
async def add_stats(stats: SeasonStats):
    doc = stats.model_dump()
    await db.stats.insert_one(doc)
    return {"status": "success"}

# --- Coach Contacts ---
@api_router.get("/contacts")
async def get_contacts():
    contacts = await db.contacts.find({}, {"_id": 0}).to_list(10)
    if not contacts:
        return get_sample_contacts()
    return contacts

@api_router.post("/contacts")
async def add_contact(contact: CoachContact):
    doc = contact.model_dump()
    await db.contacts.insert_one(doc)
    return {"status": "success"}

# --- Testimonials ---
@api_router.get("/testimonials")
async def get_testimonials():
    testimonials = await db.testimonials.find({}, {"_id": 0}).to_list(10)
    if not testimonials:
        return get_sample_testimonials()
    return testimonials

@api_router.post("/testimonials")
async def add_testimonial(testimonial: Testimonial):
    doc = testimonial.model_dump()
    await db.testimonials.insert_one(doc)
    return {"status": "success"}

# --- Analytics ---
@api_router.post("/analytics/pageview")
async def track_pageview(page: str, referrer: Optional[str] = None, user_agent: Optional[str] = None):
    pageview = PageView(page=page, referrer=referrer, user_agent=user_agent)
    doc = pageview.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.pageviews.insert_one(doc)
    return {"status": "tracked"}

@api_router.post("/analytics/video-click")
async def track_video_click(video_id: str, video_title: str):
    click = VideoClick(video_id=video_id, video_title=video_title)
    doc = click.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.video_clicks.insert_one(doc)
    return {"status": "tracked"}

@api_router.get("/analytics/summary")
async def get_analytics_summary():
    total_views = await db.pageviews.count_documents({})
    total_video_clicks = await db.video_clicks.count_documents({})
    
    page_breakdown = await db.pageviews.aggregate([
        {"$group": {"_id": "$page", "count": {"$sum": 1}}}
    ]).to_list(20)
    
    video_breakdown = await db.video_clicks.aggregate([
        {"$group": {"_id": "$video_title", "count": {"$sum": 1}}}
    ]).to_list(20)
    
    return {
        "total_page_views": total_views,
        "total_video_clicks": total_video_clicks,
        "page_breakdown": {item["_id"]: item["count"] for item in page_breakdown},
        "video_breakdown": {item["_id"]: item["count"] for item in video_breakdown}
    }

# --- PDF Export ---
@api_router.get("/export/pdf")
async def export_player_profile_pdf():
    athlete = await db.athletes.find_one({}, {"_id": 0})
    if not athlete:
        athlete = get_sample_athlete()
    
    measurables = await db.measurables.find_one({}, {"_id": 0})
    if not measurables:
        measurables = get_sample_measurables()
    
    stats_list = await db.stats.find({}, {"_id": 0}).to_list(10)
    if not stats_list:
        stats_list = get_sample_stats()
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=24, textColor=HexColor('#007AFF'))
    heading_style = ParagraphStyle('Heading', parent=styles['Heading2'], fontSize=14, textColor=HexColor('#333333'))
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=11)
    
    story = []
    
    # Header
    story.append(Paragraph(f"{athlete['full_name']}", title_style))
    story.append(Paragraph(f"Class of {athlete['graduation_year']} | {', '.join(athlete['positions'])}", body_style))
    story.append(Paragraph(f"{athlete['high_school']} - {athlete['city']}, {athlete['state']}", body_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Quick Stats
    story.append(Paragraph("PLAYER INFORMATION", heading_style))
    info_data = [
        ["Height", athlete['height'], "Weight", f"{athlete['weight']} lbs"],
        ["Jersey #", str(athlete['jersey_number']), "GPA", str(athlete['gpa'])],
    ]
    info_table = Table(info_data, colWidths=[1.5*inch, 2*inch, 1.5*inch, 2*inch])
    info_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Athletic Measurables
    story.append(Paragraph("ATHLETIC MEASURABLES", heading_style))
    measurable_data = [
        ["40-Yard Dash", f"{measurables.get('forty_yard', 'N/A')}s"],
        ["Shuttle", f"{measurables.get('shuttle', 'N/A')}s"],
        ["Vertical Jump", f"{measurables.get('vertical_jump', 'N/A')}\""],
        ["Bench Press", f"{measurables.get('bench_press', 'N/A')} lbs"],
        ["Squat", f"{measurables.get('squat', 'N/A')} lbs"],
    ]
    measurable_table = Table(measurable_data, colWidths=[2.5*inch, 2.5*inch])
    measurable_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(measurable_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Season Stats
    if stats_list:
        story.append(Paragraph("CAREER STATISTICS", heading_style))
        for s in stats_list:
            story.append(Paragraph(f"{s['season']} Season ({s['games_played']} games)", body_style))
            stat_text = []
            if s.get('tackles'): stat_text.append(f"Tackles: {s['tackles']}")
            if s.get('interceptions'): stat_text.append(f"INTs: {s['interceptions']}")
            if s.get('passes_defended'): stat_text.append(f"PDs: {s['passes_defended']}")
            if s.get('sacks'): stat_text.append(f"Sacks: {s['sacks']}")
            story.append(Paragraph(" | ".join(stat_text), body_style))
            if s.get('honors'):
                story.append(Paragraph(f"Honors: {', '.join(s['honors'])}", body_style))
            story.append(Spacer(1, 0.15*inch))
    
    # Contact Info
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("CONTACT", heading_style))
    if athlete.get('hudl_url'):
        story.append(Paragraph(f"Hudl: {athlete['hudl_url']}", body_style))
    if athlete.get('twitter_handle'):
        story.append(Paragraph(f"Twitter: @{athlete['twitter_handle']}", body_style))
    
    doc.build(story)
    buffer.seek(0)
    
    filename = f"{athlete['full_name'].replace(' ', '_')}_Profile.pdf"
    return StreamingResponse(
        buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# ==================== SAMPLE DATA ====================

def get_sample_athlete():
    return {
        "id": "sample-001",
        "full_name": "Benjamin Konadu-Sarfo",
        "graduation_year": 2028,
        "positions": ["Safety", "Cornerback"],
        "height": "6'1\"",
        "weight": 175,
        "wingspan": "6'4\"",
        "high_school": "St. James Performance Academy",
        "city": "Springfield",
        "state": "VA",
        "jersey_number": 27,
        "gpa": 3.5,
        "sat_score": 1280,
        "act_score": 28,
        "ncaa_id": "2609284751",
        "hudl_url": "https://www.hudl.com/profile/18291837",
        "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "twitter_handle": "BenjiK_DB27",
        "instagram_handle": "Benji_K",
        "profile_image": "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400",
        "highlight_image": "https://images.unsplash.com/photo-1763494392794-a07d77898569?w=800"
    }

def get_sample_measurables():
    return {
        "id": "meas-001",
        "athlete_id": "sample-001",
        "forty_yard": 4.7,
        "shuttle": 4.18,
        "vertical_jump": 36.5,
        "broad_jump": "10'2\"",
        "bench_press": 225,
        "squat": 405,
        "deadlift": 455,
        "wingspan": "6'4\"",
        "hand_size": "9.5\"",
        "arm_length": "32\""
    }

def get_sample_films():
    return [
        {
            "id": "film-001",
            "athlete_id": "sample-001",
            "title": "2024 Junior Season Highlights",
            "category": "highlights",
            "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "thumbnail_url": "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400",
            "duration": "4:32",
            "description": "Complete highlight reel from junior season showcasing coverage skills, ball-hawking ability, and physical tackling.",
            "tags": ["Coverage", "Interceptions", "Tackling", "Ball Skills"],
            "timestamps": [
                {"time": "0:15", "description": "Cover 2 read - INT vs Madison High"},
                {"time": "1:02", "description": "Open field tackle - forced fumble"},
                {"time": "2:18", "description": "Press coverage - PBU on fade route"},
                {"time": "3:45", "description": "Zone coverage - Pick-6 vs Central Catholic"}
            ],
            "season": "2024"
        },
        {
            "id": "film-002",
            "athlete_id": "sample-001",
            "title": "Full Game vs Central Catholic",
            "category": "full_game",
            "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "thumbnail_url": "https://images.unsplash.com/photo-1663563624897-de8972d7ce93?w=400",
            "duration": "1:45:00",
            "description": "Full game film from state semifinal matchup. 2 INTs, 8 tackles, 1 forced fumble.",
            "tags": ["Full Game", "State Playoffs", "Interceptions"],
            "timestamps": [
                {"time": "12:30", "description": "First INT - Cover 3 read"},
                {"time": "28:15", "description": "Forced fumble on screen play"},
                {"time": "45:00", "description": "Pick-6 in red zone"}
            ],
            "season": "2024",
            "game_date": "Nov 15, 2024",
            "opponent": "Central Catholic"
        },
        {
            "id": "film-003",
            "athlete_id": "sample-001",
            "title": "DB Position Cuts - Coverage Skills",
            "category": "position_cuts",
            "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "thumbnail_url": "https://images.unsplash.com/photo-1689876593463-6678f2e8d4f2?w=400",
            "duration": "6:15",
            "description": "Isolated plays showcasing man and zone coverage techniques, ball skills, and route recognition.",
            "tags": ["Man Coverage", "Zone Coverage", "Ball Skills", "Technique"],
            "timestamps": [
                {"time": "0:30", "description": "Press technique vs slant"},
                {"time": "1:45", "description": "Trail technique - PBU on comeback"},
                {"time": "3:00", "description": "Pattern match vs mesh concept"}
            ],
            "season": "2024"
        }
    ]

def get_sample_stats():
    return [
        {
            "id": "stats-2024",
            "athlete_id": "sample-001",
            "season": "2024",
            "games_played": 12,
            "tackles": 68,
            "solo_tackles": 52,
            "assisted_tackles": 16,
            "sacks": 1.5,
            "interceptions": 7,
            "passes_defended": 14,
            "forced_fumbles": 3,
            "fumble_recoveries": 2,
            "honors": ["All-State First Team", "All-District MVP", "Team Captain"],
            "captain": True
        },
        {
            "id": "stats-2023",
            "athlete_id": "sample-001",
            "season": "2023",
            "games_played": 11,
            "tackles": 54,
            "solo_tackles": 41,
            "assisted_tackles": 13,
            "sacks": 1.0,
            "interceptions": 4,
            "passes_defended": 11,
            "forced_fumbles": 2,
            "fumble_recoveries": 1,
            "honors": ["All-District Second Team", "Defensive Player of the Week x3"],
            "captain": False
        },
        {
            "id": "stats-2022",
            "athlete_id": "sample-001",
            "season": "2022",
            "games_played": 8,
            "tackles": 32,
            "solo_tackles": 24,
            "assisted_tackles": 8,
            "sacks": 0.5,
            "interceptions": 2,
            "passes_defended": 6,
            "forced_fumbles": 1,
            "fumble_recoveries": 0,
            "honors": ["JV All-Conference"],
            "captain": False
        }
    ]

def get_sample_contacts():
    return [
        {
            "id": "contact-001",
            "athlete_id": "sample-001",
            "name": "Coach Robert Williams",
            "title": "Head Football Coach",
            "email": "rwilliams@staugprep.edu",
            "phone": "(804) 555-0147",
            "school": "St. James Performance Academy",
            "photo_url": "https://images.unsplash.com/photo-1649029476766-3dce4bf23b3f?w=200"
        },
        {
            "id": "contact-002",
            "athlete_id": "sample-001",
            "name": "Coach Marcus Thompson",
            "title": "Defensive Backs Coach",
            "email": "mthompson@staugprep.edu",
            "phone": "(804) 555-0152",
            "school": "St. James Performance Academy"
        },
        {
            "id": "contact-003",
            "athlete_id": "sample-001",
            "name": "James Johnson Sr.",
            "title": "Parent/Guardian",
            "email": "jjohnson.parent@email.com",
            "phone": "(804) 555-0189"
        }
    ]

def get_sample_testimonials():
    return [
        {
            "id": "test-001",
            "athlete_id": "sample-001",
            "quote": "Benjamin is among the most football-intelligent defensive back I've coached in 20 years. His film study habits and ability to diagnose plays pre-snap sets him apart. He's a coach on the field.",
            "author_name": "Coach Robert Williams",
            "author_title": "Head Football Coach, St. James Performance Academy"
        },
        {
            "id": "test-002",
            "athlete_id": "sample-001",
            "quote": "Benjamin's work ethic in the weight room and on the practice field is elite. He arrived as a freshman wanting to start and put in the work to make it happen by sophomore year. Natural leader.",
            "author_name": "Coach Marcus Thompson",
            "author_title": "Defensive Backs Coach"
        },
        {
            "id": "test-003",
            "athlete_id": "sample-001",
            "quote": "Outstanding young man with impeccable character. Maintains a 3.8 GPA while leading our community service initiatives. Any program would be lucky to have him.",
            "author_name": "Dr. Patricia Coleman",
            "author_title": "Academic Dean, St. James Performance Academy"
        }
    ]

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
