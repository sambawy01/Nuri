"""
Nuri Features PDF Generator
Produces a polished product brochure at /Users/bistrocloud/Documents/nuri/Nuri-Features.pdf
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.graphics.shapes import Drawing, Rect, String, Circle
from reportlab.graphics import renderPDF
from reportlab.pdfgen import canvas
from reportlab.platypus.flowables import Flowable
import os

# ---------------------------------------------------------------------------
# Brand colours
# ---------------------------------------------------------------------------
ORANGE      = colors.HexColor("#F97316")
PURPLE      = colors.HexColor("#A855F7")
ORANGE_LIGHT = colors.HexColor("#FED7AA")   # orange-200
PURPLE_LIGHT = colors.HexColor("#E9D5FF")   # purple-200
BLUE        = colors.HexColor("#3B82F6")
GREEN       = colors.HexColor("#10B981")
PURPLE_SUBJ = colors.HexColor("#8B5CF6")
AMBER       = colors.HexColor("#F59E0B")
ROSE        = colors.HexColor("#F43F5E")
TEAL        = colors.HexColor("#14B8A6")
DARK        = colors.HexColor("#1E1B4B")
GRAY_BG     = colors.HexColor("#F8F7FF")
GRAY_CARD   = colors.HexColor("#FFFFFF")
GRAY_TEXT   = colors.HexColor("#4B5563")
GRAY_LIGHT  = colors.HexColor("#E5E7EB")

PAGE_W, PAGE_H = A4
MARGIN = 18 * mm
CONTENT_W = PAGE_W - 2 * MARGIN

OUTPUT_PATH = "/Users/bistrocloud/Documents/nuri/Nuri-Features.pdf"

# ---------------------------------------------------------------------------
# Custom flowables
# ---------------------------------------------------------------------------

class GradientRect(Flowable):
    """Horizontal orange→purple gradient rectangle (simulated with bands)."""
    def __init__(self, width, height, radius=6):
        super().__init__()
        self.width = width
        self.height = height
        self.radius = radius

    def draw(self):
        c = self.canv
        steps = 60
        r1, g1, b1 = 0xF9/255, 0x73/255, 0x16/255   # orange
        r2, g2, b2 = 0xA8/255, 0x55/255, 0xF7/255   # purple
        band_w = self.width / steps
        c.saveState()
        # clip to rounded rect
        p = c.beginPath()
        p.roundRect(0, 0, self.width, self.height, self.radius)
        c.clipPath(p, stroke=0, fill=0)
        for i in range(steps):
            t = i / (steps - 1)
            r = r1 + t * (r2 - r1)
            g = g1 + t * (g2 - g1)
            b = b1 + t * (b2 - b1)
            c.setFillColorRGB(r, g, b)
            c.rect(i * band_w, 0, band_w + 1, self.height, stroke=0, fill=1)
        c.restoreState()

    def wrap(self, *args):
        return self.width, self.height


class SectionHeader(Flowable):
    """Coloured pill-shaped section header with owl accent."""
    def __init__(self, number, title, accent_color, width):
        super().__init__()
        self.number = number
        self.title = title
        self.color = accent_color
        self.width = width
        self.height = 11 * mm

    def draw(self):
        c = self.canv
        h = self.height
        r = h / 2
        # background pill
        c.setFillColor(self.color)
        p = c.beginPath()
        p.roundRect(0, 0, self.width, h, r)
        c.clipPath(p, stroke=0, fill=0)
        c.rect(0, 0, self.width, h, stroke=0, fill=1)
        # number circle (white)
        cx, cy = r, h / 2
        c.setFillColor(colors.white)
        c.circle(cx, cy, r * 0.62, stroke=0, fill=1)
        c.setFillColor(self.color)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(cx, cy - 3, str(self.number))
        # title text
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(r * 2 + 6, h / 2 - 4, self.title)
        # owl on the right
        c.setFont("Helvetica", 10)
        c.drawRightString(self.width - 8, h / 2 - 4, "\U0001F989")

    def wrap(self, *args):
        return self.width, self.height


class FeatureCard(Flowable):
    """White rounded card with left accent bar for a feature item."""
    def __init__(self, name, description, accent_color, width):
        super().__init__()
        self.name = name
        self.description = description
        self.color = accent_color
        self.width = width
        # Estimate height based on text
        self._inner_w = width - 32   # padding
        self._calc_height()

    def _calc_height(self):
        # rough: 14pt name + wrapped description at ~65 chars/line * 11pt
        desc_lines = max(1, len(self.description) // 72 + 1)
        self.height = 14 + desc_lines * 13 + 18   # top/bottom padding

    def draw(self):
        c = self.canv
        h = self.height
        r = 5
        # shadow
        c.saveState()
        c.setFillColor(colors.HexColor("#00000015"))
        p = c.beginPath()
        p.roundRect(2, -2, self.width, h, r)
        c.clipPath(p, stroke=0, fill=0)
        c.rect(2, -2, self.width, h, stroke=0, fill=1)
        c.restoreState()
        # card background
        c.setFillColor(colors.white)
        c.setStrokeColor(GRAY_LIGHT)
        c.setLineWidth(0.5)
        p2 = c.beginPath()
        p2.roundRect(0, 0, self.width, h, r)
        c.drawPath(p2, stroke=1, fill=1)
        # left accent bar
        c.setFillColor(self.color)
        bar_w = 4
        p3 = c.beginPath()
        p3.roundRect(0, 0, bar_w, h, r)
        c.drawPath(p3, stroke=0, fill=1)
        # Feature name
        c.setFillColor(DARK)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(14, h - 14, self.name)
        # Description
        c.setFillColor(GRAY_TEXT)
        c.setFont("Helvetica", 9)
        # word-wrap manually
        words = self.description.split()
        line = ""
        y = h - 27
        for word in words:
            test = (line + " " + word).strip()
            if c.stringWidth(test, "Helvetica", 9) < self._inner_w - 14:
                line = test
            else:
                c.drawString(14, y, line)
                y -= 13
                line = word
        if line:
            c.drawString(14, y, line)

    def wrap(self, *args):
        return self.width, self.height


class SubjectPill(Flowable):
    """Coloured pill for a subject name."""
    def __init__(self, name, color):
        super().__init__()
        self.name = name
        self.color = color
        self.height = 8 * mm
        self.width = 36 * mm

    def draw(self):
        c = self.canv
        h = self.height
        r = h / 2
        c.setFillColor(self.color)
        p = c.beginPath()
        p.roundRect(0, 0, self.width, h, r)
        c.clipPath(p, stroke=0, fill=0)
        c.rect(0, 0, self.width, h, stroke=0, fill=1)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(self.width / 2, h / 2 - 3, self.name)

    def wrap(self, *args):
        return self.width, self.height

# ---------------------------------------------------------------------------
# Page template (numbers + subtle background)
# ---------------------------------------------------------------------------

def on_page(canv, doc):
    canv.saveState()
    # Very subtle page background tint
    canv.setFillColor(colors.HexColor("#FDFCFF"))
    canv.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    # Bottom bar
    canv.setFillColor(DARK)
    canv.rect(0, 0, PAGE_W, 8 * mm, stroke=0, fill=1)
    # Page number
    canv.setFillColor(colors.white)
    canv.setFont("Helvetica", 8)
    canv.drawCentredString(PAGE_W / 2, 3 * mm, f"Page {doc.page}")
    # Footer brand line
    canv.setFillColor(ORANGE)
    canv.setFont("Helvetica-Bold", 7)
    canv.drawString(MARGIN, 3 * mm, "\U0001F989  Nuri — AI Study Buddy")
    canv.setFillColor(PURPLE)
    canv.drawRightString(PAGE_W - MARGIN, 3 * mm, "nuri.app")
    canv.restoreState()


# ---------------------------------------------------------------------------
# Style helpers
# ---------------------------------------------------------------------------

def styles():
    s = getSampleStyleSheet()

    def add(name, **kw):
        s.add(ParagraphStyle(name=name, **kw))

    add("NuriTitle",
        fontName="Helvetica-Bold", fontSize=36, leading=44,
        textColor=colors.white, alignment=TA_CENTER)
    add("NuriSubtitle",
        fontName="Helvetica-Bold", fontSize=18, leading=24,
        textColor=colors.white, alignment=TA_CENTER)
    add("NuriTagline",
        fontName="Helvetica", fontSize=13, leading=18,
        textColor=colors.HexColor("#FED7AA"), alignment=TA_CENTER)
    add("NuriBody",
        fontName="Helvetica", fontSize=10, leading=15,
        textColor=GRAY_TEXT, spaceAfter=4)
    add("NuriBullet",
        fontName="Helvetica", fontSize=9.5, leading=14,
        textColor=GRAY_TEXT, leftIndent=12, spaceAfter=3,
        bulletIndent=0, bulletFontName="Helvetica", bulletFontSize=9.5)
    add("NuriSmall",
        fontName="Helvetica", fontSize=8.5, leading=12,
        textColor=GRAY_TEXT)
    add("NuriStat",
        fontName="Helvetica-Bold", fontSize=22, leading=28,
        textColor=ORANGE, alignment=TA_CENTER)
    add("NuriStatLabel",
        fontName="Helvetica", fontSize=9, leading=12,
        textColor=GRAY_TEXT, alignment=TA_CENTER)

    return s

# ---------------------------------------------------------------------------
# Build helpers
# ---------------------------------------------------------------------------

def spacer(h_mm=3):
    return Spacer(1, h_mm * mm)


def hr(color=GRAY_LIGHT, thickness=0.5):
    return HRFlowable(width="100%", thickness=thickness, color=color,
                      spaceAfter=2 * mm, spaceBefore=2 * mm)


def two_col_cards(pairs, accent, s):
    """Render feature cards in a 2-column table."""
    col_w = (CONTENT_W - 6 * mm) / 2
    rows = []
    row = []
    for name, desc in pairs:
        card = FeatureCard(name, desc, accent, col_w)
        row.append(card)
        if len(row) == 2:
            rows.append(row)
            row = []
    if row:
        row.append(Spacer(col_w, 1))
        rows.append(row)

    if not rows:
        return []

    tbl = Table(rows, colWidths=[col_w, col_w], hAlign="LEFT")
    tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("COLPADDING", (1, 0), (1, -1), (6, 3, 0, 3)),
    ]))
    return [tbl, spacer(2)]


def single_cards(items, accent):
    """Render full-width feature cards."""
    out = []
    for name, desc in items:
        out.append(FeatureCard(name, desc, accent, CONTENT_W))
        out.append(spacer(2))
    return out


def bullet_list(items, s):
    out = []
    for item in items:
        out.append(Paragraph(f"\u2022  {item}", s["NuriBullet"]))
    return out


def section(number, title, color, content_items):
    """Wrap a section with header + content, kept together where possible."""
    header = SectionHeader(number, title, color, CONTENT_W)
    return [spacer(4), header, spacer(3)] + content_items + [spacer(2)]

# ---------------------------------------------------------------------------
# Build document
# ---------------------------------------------------------------------------

def build():
    st = styles()
    story = []

    # ===== TITLE PAGE =====
    story.append(spacer(20))

    # Gradient banner
    story.append(GradientRect(CONTENT_W, 62 * mm, radius=12))
    # Overlay text (drawn after; we use absolute positioned Paragraphs on top)
    # Because we can't overlay in platypus easily, we draw the gradient then
    # add white text below (the gradient flowable already drew).
    # Instead, use a single Table so text sits ON the gradient.
    title_data = [
        [Paragraph("\U0001F989", ParagraphStyle("owl", fontName="Helvetica",
                   fontSize=52, leading=60, alignment=TA_CENTER,
                   textColor=colors.white))],
        [Paragraph("Nuri — Your AI Study Buddy", st["NuriTitle"])],
        [Paragraph("Feature Overview", st["NuriSubtitle"])],
        [Paragraph("AI-powered tutor for kids ages 5-11", st["NuriTagline"])],
    ]

    # We'll draw gradient inside a canvas callback instead — simpler to just
    # put the text on a coloured table cell.
    story.pop()  # remove the gradient rect we just added

    title_tbl = Table(
        title_data,
        colWidths=[CONTENT_W],
    )
    title_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#7C3AED")),
        ("ROWBACKGROUNDS", (0, 0), (0, 0), [colors.HexColor("#7C3AED")]),
        ("TOPPADDING", (0, 0), (0, 0), 16),
        ("BOTTOMPADDING", (0, -1), (0, -1), 20),
        ("TOPPADDING", (0, 1), (0, -1), 6),
        ("BOTTOMPADDING", (0, 0), (0, -2), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("ROUNDEDCORNERS", [12]),
    ]))
    story.append(spacer(18))
    story.append(title_tbl)
    story.append(spacer(10))

    # Quick stats strip
    stats = [
        ("10", "Subjects\n& Features"),
        ("227", "Topics"),
        ("6", "Year\nLevels"),
        ("40", "Badges"),
        ("5-11", "Target\nAge"),
    ]
    stat_cells = []
    for val, label in stats:
        stat_cells.append([
            Paragraph(val, st["NuriStat"]),
            Paragraph(label.replace("\n", "<br/>"), st["NuriStatLabel"]),
        ])

    stats_tbl = Table(
        [stat_cells],
        colWidths=[CONTENT_W / 5] * 5,
    )
    stats_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), GRAY_BG),
        ("ROUNDEDCORNERS", [8]),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEAFTER", (0, 0), (-2, -1), 0.5, GRAY_LIGHT),
    ]))
    story.append(stats_tbl)
    story.append(spacer(8))

    intro_text = (
        "Nuri is a conversational AI tutor designed for children aged 5–11. "
        "It combines adaptive learning, rich gamification, and a warm owl persona "
        "to make studying feel like an adventure. This document outlines the complete "
        "feature set available to students and parents."
    )
    story.append(Paragraph(intro_text, st["NuriBody"]))
    story.append(PageBreak())

    # ===== SECTION 1: CORE LEARNING =====
    core_features = [
        ("Learn Mode",
         "Streaming AI chat with Nuri — conversational teaching, not lectures. "
         "Auto-suggests the next unmastered topic. Voice reads aloud sentence-by-sentence."),
        ("Quiz Mode",
         "4 difficulty levels (Easy / Medium / Hard / Challenge Me). XP scales 5–20 per correct answer. "
         "Varied formats: word problems, patterns, comparisons, scenarios. Confidence meter after each answer."),
        ("Explain It Back",
         "Child teaches Nuri. AI plays confused and probes understanding. "
         "Performance scored 1–5 stars for a genuine mastery check."),
        ("Homework Helper",
         "Snap a photo, upload an image or PDF, or type the question. AI extracts tasks and guides "
         "Socratic solving. Child writes the answer on paper, then snaps it for AI verification."),
    ]
    story += section(1, "Core Learning", ORANGE, two_col_cards(core_features, ORANGE, st))

    # ===== SECTION 2: CURRICULUM =====
    subjects = [
        ("Maths", BLUE), ("Science", GREEN), ("English", PURPLE_SUBJ),
        ("History", AMBER), ("Arabic", TEAL), ("Religion", ROSE), ("Social Studies", ORANGE),
    ]
    subj_row = []
    for name, col in subjects:
        subj_row.append(SubjectPill(name, col))

    subj_tbl = Table([subj_row], colWidths=[36 * mm] * 7)
    subj_tbl.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 1),
        ("RIGHTPADDING", (0, 0), (-1, -1), 1),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))

    curric_bullets = bullet_list([
        "Years 1–6: Cambridge Primary + Egyptian National curriculum",
        "227 topics with thousands of granular learning objectives",
        "Objective-level mastery tracking per child",
        "Cross-subject connections: Nuri links topics across subjects intelligently",
    ], st)

    story += section(2, "Curriculum", BLUE,
                     [subj_tbl, spacer(3)] + curric_bullets)

    # ===== SECTION 3: AI INTELLIGENCE =====
    ai_features = [
        ("Child Intelligence Profile",
         "AI learns each child's struggles, strengths, learning style, confidence patterns, "
         "and mistake history across all modes."),
        ("Session Memory",
         "Nuri remembers previous sessions: 'Last time we were working on fractions — shall we continue?'"),
        ("Emotional Detection",
         "Detects frustration, boredom, and confusion in real time. Adapts tone, pace, and challenge level accordingly."),
        ("Learning Style Detection",
         "Tracks visual, analogy, example-based, auditory, and try-first preferences. Teaches to the child's style."),
        ("Prerequisite Awareness",
         "If a child struggles with fractions, Nuri checks if multiplication is solid first before advancing."),
        ("Parent Notes",
         "Parents can direct Nuri's focus — their instructions override the AI's own curriculum assessment."),
    ]
    story += section(3, "AI Intelligence", PURPLE,
                     two_col_cards(ai_features, PURPLE, st))

    # ===== SECTION 4: GAMIFICATION =====
    gamif_features = [
        ("XP & Levels",
         "Growth-only scoring — XP never decreases. Every session builds momentum. "
         "Anti-IXL philosophy: effort and courage are always rewarded."),
        ("40 Badges",
         "Across 8 categories and 5 rarity tiers. Sticker Book visual collection "
         "with rarity borders (Common → Legendary)."),
        ("Daily Mystery Challenge",
         "Envelope animation reveals a surprise challenge each day. Completing it earns +50 XP."),
        ("Streaks & Milestones",
         "Streak counter with special celebrations at 7, 14, 30, and 100 consecutive study days."),
        ("Nuri Evolution",
         "6 visual evolution stages for the Nuri owl character, unlocked by reaching level thresholds."),
        ("Level-Up Celebrations",
         "Confetti animations and personalised congratulations when a child reaches a new level."),
    ]
    story += section(4, "Gamification", AMBER,
                     two_col_cards(gamif_features, AMBER, st))

    # ===== SECTION 5: SOCIAL & COMPETITION =====
    social_features = [
        ("Study Duels",
         "Create or join 5-question head-to-head battles with a shareable code. "
         "Live timer, real-time scoring, side-by-side results screen. Everyone earns XP regardless of outcome."),
        ("Profile Switcher",
         "Multiple children can use the same device. Each sibling maintains a separate profile, "
         "XP history, badges, and learning data."),
    ]
    story += section(5, "Social & Competition", ROSE,
                     two_col_cards(social_features, ROSE, st))

    # ===== SECTION 6: ADVENTURE =====
    adv_features = [
        ("Story Mode — The 7 Lost Books of Knowledge",
         "7 narrative chapters, one per subject, each with 5 stages: story intro, learn, challenge, "
         "boss puzzle, and subject reward. Learning embedded in epic storytelling."),
        ("Nuri's World",
         "A virtual treehouse with 21 unlockable items earned through study milestones. "
         "Children personalise their space as they learn."),
    ]
    story += section(6, "Adventure Mode", TEAL,
                     single_cards(adv_features, TEAL))

    # ===== SECTION 7: PARENT DASHBOARD =====
    parent_features = [
        ("Secure PIN Access",
         "Parent dashboard is PIN-protected, keeping the child-facing UI clean and distraction-free."),
        ("Weekly Stats",
         "Total XP earned, active study days, session count, and time-on-task at a glance."),
        ("Subject Accuracy Bars",
         "Visual per-subject accuracy bars reveal strengths and gaps across the full curriculum."),
        ("AI Session Reports",
         "Automatically generated after each session: highlights, struggles, and personalised recommendations."),
        ("Test Predictions",
         "Homework topic tracking identifies upcoming tests and surfaces them on the dashboard."),
        ("Mistake Patterns",
         "Recurring wrong answers are surfaced so parents (and Nuri) can address root misconceptions."),
    ]
    story += section(7, "Parent Dashboard", GREEN,
                     two_col_cards(parent_features, GREEN, st))

    # ===== SECTION 8: TEST PREPARATION =====
    test_features = [
        ("Pre-Test Predictor",
         "Tap 'I have a test!' and set the date. Nuri builds a personalised countdown study plan "
         "covering the most important topics in the right order."),
        ("Daily Plan Cards",
         "Homepage shows today's recommended tasks based on spaced repetition and upcoming test dates."),
        ("Homework Topic Tracking",
         "Nuri notes every homework topic to predict which subjects are likely to appear in the next test."),
    ]
    story += section(8, "Test Preparation", ROSE,
                     single_cards(test_features, ROSE))

    # ===== SECTION 9: SMART LEARNING =====
    smart_features = [
        ("Spaced Repetition",
         "Review queue with memory scores. Topics resurface at scientifically optimal intervals."),
        ("Mistake Journal",
         "Every wrong answer is auto-logged. Filter by subject, review explanations, practice again."),
        ("Difficulty Scaling",
         "Questions shift difficulty based on real-time mastery data, including year-shifted challenge questions."),
        ("Confidence Meter",
         "Tracks blind spots (lucky guesses) and genuine mastery. Ensures solid understanding, not pattern matching."),
        ("Adaptive Topic Selection",
         "Nuri continuously selects the next topic based on mastery data, gaps, and curriculum sequence."),
    ]
    story += section(9, "Smart Learning Engine", PURPLE,
                     two_col_cards(smart_features, PURPLE, st))

    # ===== SECTION 10: VOICE & ACCESSIBILITY =====
    voice_features = [
        ("Text-to-Speech",
         "Nuri reads all content aloud at a child-friendly pace. Essential for Years 1–2 readers."),
        ("Speech Recognition",
         "Microphone button lets children answer questions by speaking. Particularly useful for maths and Arabic."),
        ("Cross-Device Support",
         "Fully responsive — works on any phone, tablet, or laptop without installing an app."),
        ("Add to Home Screen (PWA)",
         "Progressive Web App support gives a native app feel with one-tap access from the home screen."),
        ("Offline-Friendly",
         "Graceful fallback for low-connectivity environments. Core learning content remains accessible."),
        ("Session Persistence",
         "Sessions survive accidental back navigation. No progress is lost mid-lesson."),
    ]
    story += section(10, "Voice & Accessibility", TEAL,
                     two_col_cards(voice_features, TEAL, st))

    # ===== FINAL PAGE: CLOSING =====
    story.append(PageBreak())
    story.append(spacer(16))

    closing_tbl = Table(
        [[Paragraph("\U0001F989", ParagraphStyle("bigowl", fontName="Helvetica",
                    fontSize=64, leading=72, alignment=TA_CENTER,
                    textColor=PURPLE))],
         [Paragraph("Ready to learn?", ParagraphStyle("cta_h", fontName="Helvetica-Bold",
                    fontSize=26, leading=32, alignment=TA_CENTER, textColor=DARK))],
         [Paragraph(
             "Nuri is available on the web, as a home screen app, and on any device.<br/>"
             "Sign up at <b>nuri.app</b> and start your first session today.",
             ParagraphStyle("cta_body", fontName="Helvetica", fontSize=12, leading=18,
                            alignment=TA_CENTER, textColor=GRAY_TEXT)
         )],
        ],
        colWidths=[CONTENT_W],
    )
    closing_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), GRAY_BG),
        ("ROUNDEDCORNERS", [12]),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, -1), (0, -1), 20),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ]))
    story.append(closing_tbl)
    story.append(spacer(6))

    story.append(Paragraph(
        "Document generated March 2026  \u2014  Nuri Learning Ltd  \u2014  All rights reserved",
        ParagraphStyle("footer_note", fontName="Helvetica", fontSize=8,
                       textColor=GRAY_TEXT, alignment=TA_CENTER)
    ))

    # ===== BUILD =====
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
        title="Nuri — Feature Overview",
        author="Nuri Learning",
        subject="AI-Powered Curriculum Tutor",
        creator="Nuri PDF Generator (ReportLab)",
    )
    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f"PDF written to {OUTPUT_PATH}")


if __name__ == "__main__":
    build()
