import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const documents = [
  {
    docType: "brand_style",
    title: "Brand Style Lock - Miss & Mister Dour 2026",
    slug: "brand-style-lock-2026",
    content: `# Brand Style Lock - Miss & Mister Dour 2026

## Identity Core
- **Brand Name**: Miss & Mister Dour
- **Tagline**: "Élégance, Authenticité, Excellence"
- **Visual Identity**: Liligaga Mirror (ornement royal doré)

## Color Palette
- **Primary Gold**: #C8A45C (warm gold)
- **Secondary Gold**: #D4AF37 (bright gold)
- **Background**: Black (#000000) with subtle gradients
- **Text**: White (#FFFFFF) for primary, #B0B0B0 for secondary

## Typography
- **Headlines**: Playfair Display (serif, elegant)
- **Body**: Inter (sans-serif, modern)
- **Accent**: Cinzel (decorative, royal)

## Visual Style
- **Aesthetic**: Premium, luxurious, sophisticated
- **Animations**: Smooth, elegant (spring physics)
- **Effects**: Glassmorphism, subtle glow, drop shadows
- **Imagery**: High-quality, professional, aspirational

## Tone of Voice
- **Personality**: Elegant, inspiring, authentic
- **Language**: French (primary), formal but warm
- **Messaging**: Empowerment, excellence, community

## Video Guidelines
- **Opening**: Logo reveal with royal ornament animation
- **Transitions**: Smooth fades, elegant wipes
- **Music**: Orchestral, uplifting, cinematic
- **Pacing**: Moderate (not rushed), allow moments to breathe
- **Closing**: Call-to-action with logo lockup`,
    version: "1.0.0",
    visibility: "internal",
  },
  {
    docType: "video_template",
    title: "Video Structure Template - Candidate Profile",
    slug: "video-template-candidate-profile",
    content: `# Video Structure Template - Candidate Profile

## Format Specifications
- **Duration**: 30-60 seconds
- **Aspect Ratios**: 
  - Vertical: 9:16 (Instagram Stories, TikTok)
  - Square: 1:1 (Instagram Feed)
  - Horizontal: 16:9 (YouTube, Website)

## Structure (30s version)
1. **Opening (0-3s)**: Logo reveal + candidate name overlay
2. **Introduction (3-8s)**: Candidate portrait + key info (age, city, profession)
3. **Story Arc (8-20s)**: B-roll footage + voiceover or text overlays
4. **Highlight Moment (20-25s)**: Best photo/video moment + music peak
5. **Call-to-Action (25-30s)**: "Vote for [Name]" + QR code + logo

## Visual Elements
- **Lower Third**: Name, age, city (gold gradient)
- **Text Overlays**: Key phrases, quotes (white, Playfair Display)
- **Transitions**: Cross-dissolve (0.5s), zoom-in on key moments
- **Background**: Subtle bokeh or gradient overlay

## Audio Mix
- **Music**: 70% volume (orchestral, uplifting)
- **Voiceover**: 100% volume (if present)
- **Sound Effects**: Minimal (whoosh transitions, subtle chimes)

## Brand Integration
- **Logo**: Top-left corner (small, subtle) throughout
- **Watermark**: Bottom-right corner (semi-transparent)
- **Color Grading**: Warm tones, slightly desaturated for elegance

## Accessibility
- **Captions**: French subtitles for all spoken content
- **Contrast**: Ensure text readability (WCAG AA minimum)
- **Motion**: Avoid rapid flashing or strobing effects`,
    version: "1.0.0",
    visibility: "internal",
  },
  {
    docType: "execution_protocol",
    title: "Execution Protocol - FlowithOS Agentic Workflow",
    slug: "execution-protocol-flowithos",
    content: `# Execution Protocol - FlowithOS Agentic Workflow

## Mission Pack Structure
\`\`\`json
{
  "mission_id": "unique_identifier",
  "candidate": {
    "id": 123,
    "name": "Sophie Laurent",
    "category": "Miss",
    "profile_data": {...}
  },
  "video_config": {
    "format": "vertical_9_16",
    "duration_seconds": 30,
    "video_type": "profile"
  },
  "knowledge_refs": [
    "brand-style-lock-2026",
    "video-template-candidate-profile"
  ],
  "steps": [...]
}
\`\`\`

## Execution Steps
1. **Gather Assets**: Collect candidate photos, bio, achievements
2. **Generate Script**: Create 30s narrative following brand voice
3. **Select Music**: Choose orchestral track from licensed library
4. **Assemble Timeline**: Arrange clips following template structure
5. **Add Graphics**: Apply lower thirds, text overlays, logo
6. **Color Grade**: Apply warm, elegant color correction
7. **Audio Mix**: Balance music, voiceover, sound effects
8. **Export**: Render in specified format (H.264, 1080p minimum)
9. **Upload**: Send to secure storage, return URL via webhook

## Quality Checklist
- [ ] Logo visible and correctly positioned
- [ ] Brand colors used consistently
- [ ] Typography matches guidelines (Playfair Display)
- [ ] Music volume balanced (not overpowering)
- [ ] Transitions smooth and elegant
- [ ] Text readable on all backgrounds
- [ ] Duration within ±2 seconds of target
- [ ] No visual artifacts or glitches
- [ ] Audio levels normalized (-14 LUFS)
- [ ] Captions accurate and synced

## Error Handling
- **Missing Assets**: Use placeholder graphics, flag in logs
- **Music License**: Fall back to royalty-free alternative
- **Rendering Failure**: Retry with lower quality settings
- **Upload Timeout**: Retry up to 3 times with exponential backoff

## Success Criteria
- Video meets all brand guidelines
- Duration matches specification
- Output URL accessible and valid
- Logs include detailed execution trace
- Webhook callback received within 10 minutes`,
    version: "1.0.0",
    visibility: "internal",
  },
];

for (const doc of documents) {
  await db.execute(`
    INSERT INTO knowledge_garden (docType, title, slug, content, version, visibility, isActive)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    ON DUPLICATE KEY UPDATE
      content = VALUES(content),
      version = VALUES(version),
      updatedAt = NOW()
  `, [doc.docType, doc.title, doc.slug, doc.content, doc.version, doc.visibility]);
  console.log(`✅ Inserted: ${doc.title}`);
}

console.log("✅ Knowledge Garden seeded successfully!");
await connection.end();
