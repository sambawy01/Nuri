#!/usr/bin/env python3
"""
Nuri Features Manual PDF Generator
Uses ReportLab to create a professional product brochure + user guide.
All emojis replaced with drawn icon badges since ReportLab cannot render color emoji fonts.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm, inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, ListFlowable, ListItem, Flowable,
    Frame, PageTemplate, BaseDocTemplate, NextPageTemplate
)
from reportlab.graphics.shapes import Drawing, Rect, Circle, String, Line
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import math
import os

# ─── Brand Colors ───────────────────────────────────────────────────────────
ORANGE = HexColor("#F97316")
PURPLE = HexColor("#A855F7")
LIGHT_ORANGE = HexColor("#FFF7ED")
LIGHT_PURPLE = HexColor("#FAF5FF")
DARK_TEXT = HexColor("#1F2937")
MEDIUM_TEXT = HexColor("#4B5563")
LIGHT_TEXT = HexColor("#6B7280")
CARD_BG = HexColor("#F9FAFB")
CARD_BORDER = HexColor("#E5E7EB")
WHITE = HexColor("#FFFFFF")
MATHS_BLUE = HexColor("#3B82F6")
SCIENCE_GREEN = HexColor("#10B981")
ENGLISH_PURPLE = HexColor("#8B5CF6")
HISTORY_AMBER = HexColor("#F59E0B")
RELIGION_ROSE = HexColor("#F43F5E")
ARABIC_TEAL = HexColor("#14B8A6")
SOCIAL_INDIGO = HexColor("#6366F1")

PAGE_W, PAGE_H = A4
MARGIN = 20 * mm

# Unicode symbols that Helvetica CAN render:
SYM_BULLET = '\u2022'   # bullet
SYM_STAR = '\u2605'      # star
SYM_ARROW = '\u2794'     # arrow
SYM_CHECK = '\u2713'     # checkmark
SYM_DIAMOND = '\u25C6'   # diamond
SYM_CIRCLE = '\u25CF'    # filled circle
SYM_SQUARE = '\u25A0'    # filled square
SYM_TRIANGLE = '\u25B2'  # triangle
SYM_HEART = '\u2665'     # heart
SYM_CROSS = '\u271E'     # cross
SYM_RAQUO = '\u00BB'     # right double angle


# ─── Icon Badge Flowable ────────────────────────────────────────────────────

class IconBadge(Flowable):
    """A colored circle with a white letter inside — replaces emoji icons."""
    def __init__(self, letter, color, size=7*mm):
        Flowable.__init__(self)
        self.letter = letter
        self.color = color
        self.size = size

    def wrap(self, availWidth, availHeight):
        return self.size, self.size

    def draw(self):
        c = self.canv
        r = self.size / 2
        c.setFillColor(self.color)
        c.circle(r, r, r, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", self.size * 0.5)
        c.drawCentredString(r, r - self.size * 0.15, self.letter)


class OwlGraphic(Flowable):
    """A stylized owl graphic for the title page."""
    def __init__(self, size=60*mm):
        Flowable.__init__(self)
        self.size = size

    def wrap(self, availWidth, availHeight):
        return self.size, self.size

    def draw(self):
        c = self.canv
        cx = self.size / 2
        cy = self.size / 2
        s = self.size

        # Body (large circle)
        c.setFillColor(Color(1, 1, 1, 0.15))
        c.circle(cx, cy, s * 0.38, fill=1, stroke=0)

        # Inner body
        c.setFillColor(Color(1, 1, 1, 0.2))
        c.circle(cx, cy, s * 0.30, fill=1, stroke=0)

        # Eyes - two large white circles
        eye_r = s * 0.12
        eye_y = cy + s * 0.06
        c.setFillColor(Color(1, 1, 1, 0.9))
        c.circle(cx - s * 0.13, eye_y, eye_r, fill=1, stroke=0)
        c.circle(cx + s * 0.13, eye_y, eye_r, fill=1, stroke=0)

        # Pupils
        pupil_r = s * 0.055
        c.setFillColor(Color(0.2, 0.1, 0.3, 0.9))
        c.circle(cx - s * 0.11, eye_y, pupil_r, fill=1, stroke=0)
        c.circle(cx + s * 0.11, eye_y, pupil_r, fill=1, stroke=0)

        # Eye shine
        shine_r = s * 0.02
        c.setFillColor(Color(1, 1, 1, 0.95))
        c.circle(cx - s * 0.09, eye_y + s * 0.02, shine_r, fill=1, stroke=0)
        c.circle(cx + s * 0.09, eye_y + s * 0.02, shine_r, fill=1, stroke=0)

        # Beak
        c.setFillColor(Color(1, 0.85, 0.3, 0.9))
        beak_path = c.beginPath()
        beak_path.moveTo(cx - s * 0.04, cy - s * 0.02)
        beak_path.lineTo(cx, cy - s * 0.1)
        beak_path.lineTo(cx + s * 0.04, cy - s * 0.02)
        beak_path.close()
        c.drawPath(beak_path, fill=1, stroke=0)

        # Ear tufts
        c.setFillColor(Color(1, 1, 1, 0.2))
        # Left tuft
        tuft_path = c.beginPath()
        tuft_path.moveTo(cx - s * 0.22, cy + s * 0.22)
        tuft_path.lineTo(cx - s * 0.14, cy + s * 0.38)
        tuft_path.lineTo(cx - s * 0.06, cy + s * 0.28)
        tuft_path.close()
        c.drawPath(tuft_path, fill=1, stroke=0)
        # Right tuft
        tuft_path = c.beginPath()
        tuft_path.moveTo(cx + s * 0.22, cy + s * 0.22)
        tuft_path.lineTo(cx + s * 0.14, cy + s * 0.38)
        tuft_path.lineTo(cx + s * 0.06, cy + s * 0.28)
        tuft_path.close()
        c.drawPath(tuft_path, fill=1, stroke=0)

        # Feet
        c.setFillColor(Color(1, 0.85, 0.3, 0.7))
        c.circle(cx - s * 0.08, cy - s * 0.32, s * 0.03, fill=1, stroke=0)
        c.circle(cx - s * 0.14, cy - s * 0.33, s * 0.025, fill=1, stroke=0)
        c.circle(cx + s * 0.08, cy - s * 0.32, s * 0.03, fill=1, stroke=0)
        c.circle(cx + s * 0.14, cy - s * 0.33, s * 0.025, fill=1, stroke=0)

        # Wing hints
        c.setFillColor(Color(1, 1, 1, 0.1))
        c.ellipse(cx - s * 0.35, cy - s * 0.15, cx - s * 0.15, cy + s * 0.12)
        c.ellipse(cx + s * 0.15, cy - s * 0.15, cx + s * 0.35, cy + s * 0.12)


class GradientHeader(Flowable):
    """Full-width gradient header with white text."""
    def __init__(self, text, width, height=14*mm, font_size=16):
        Flowable.__init__(self)
        self.text = text
        self.bar_width = width
        self.bar_height = height
        self.font_size = font_size

    def wrap(self, availWidth, availHeight):
        return self.bar_width, self.bar_height

    def draw(self):
        c = self.canv
        steps = 80
        strip_w = self.bar_width / steps
        for i in range(steps):
            t = i / (steps - 1)
            r = ORANGE.red + t * (PURPLE.red - ORANGE.red)
            g = ORANGE.green + t * (PURPLE.green - ORANGE.green)
            b = ORANGE.blue + t * (PURPLE.blue - ORANGE.blue)
            c.setFillColor(Color(r, g, b))
            c.setStrokeColor(Color(r, g, b))
            x = i * strip_w
            c.rect(x, 0, strip_w + 1, self.bar_height, fill=1, stroke=0)
        # Rounded corners overlay (white corners)
        # Just round the whole thing
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", self.font_size)
        c.setFillColor(white)
        c.drawString(5*mm, (self.bar_height - self.font_size) / 2 + 1*mm, self.text)


class HRule(Flowable):
    """Horizontal rule."""
    def __init__(self, width, color=CARD_BORDER, thickness=0.5):
        Flowable.__init__(self)
        self.rule_width = width
        self.color = color
        self.thickness = thickness

    def wrap(self, availWidth, availHeight):
        return self.rule_width, 2*mm

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 1*mm, self.rule_width, 1*mm)


# ─── Styles ─────────────────────────────────────────────────────────────────

def get_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        'Title_Main', parent=styles['Title'],
        fontSize=36, leading=44, textColor=white,
        fontName='Helvetica-Bold', alignment=TA_CENTER, spaceAfter=6*mm,
    ))
    styles.add(ParagraphStyle(
        'Subtitle_Main', parent=styles['Normal'],
        fontSize=16, leading=22, textColor=HexColor("#FFE4CC"),
        fontName='Helvetica', alignment=TA_CENTER, spaceAfter=4*mm,
    ))
    styles.add(ParagraphStyle(
        'Hero_Detail', parent=styles['Normal'],
        fontSize=12, leading=18, textColor=HexColor("#E0D4FF"),
        fontName='Helvetica', alignment=TA_CENTER, spaceAfter=3*mm,
    ))
    styles.add(ParagraphStyle(
        'Section_Title', parent=styles['Heading1'],
        fontSize=22, leading=28, textColor=DARK_TEXT,
        fontName='Helvetica-Bold', spaceBefore=4*mm, spaceAfter=4*mm,
    ))
    styles.add(ParagraphStyle(
        'Section_Subtitle', parent=styles['Heading2'],
        fontSize=14, leading=20, textColor=ORANGE,
        fontName='Helvetica-Bold', spaceBefore=4*mm, spaceAfter=2*mm,
    ))
    styles.add(ParagraphStyle(
        'Feature_Title', parent=styles['Heading3'],
        fontSize=12, leading=16, textColor=PURPLE,
        fontName='Helvetica-Bold', spaceBefore=2*mm, spaceAfter=1*mm,
    ))
    styles.add(ParagraphStyle(
        'Body', parent=styles['Normal'],
        fontSize=10, leading=15, textColor=DARK_TEXT,
        fontName='Helvetica', alignment=TA_JUSTIFY, spaceAfter=2*mm,
    ))
    styles.add(ParagraphStyle(
        'Body_Small', parent=styles['Normal'],
        fontSize=9, leading=13, textColor=MEDIUM_TEXT,
        fontName='Helvetica', spaceAfter=1*mm,
    ))
    styles.add(ParagraphStyle(
        'NuriBullet', parent=styles['Normal'],
        fontSize=10, leading=14, textColor=DARK_TEXT,
        fontName='Helvetica', leftIndent=8*mm, bulletIndent=2*mm,
        spaceAfter=1*mm,
    ))
    styles.add(ParagraphStyle(
        'TOC_Entry', parent=styles['Normal'],
        fontSize=11, leading=20, textColor=DARK_TEXT, fontName='Helvetica',
        leftIndent=5*mm,
    ))
    styles.add(ParagraphStyle(
        'Card_Title', parent=styles['Heading3'],
        fontSize=12, leading=16, textColor=DARK_TEXT,
        fontName='Helvetica-Bold', spaceBefore=0, spaceAfter=2*mm,
    ))
    styles.add(ParagraphStyle(
        'Card_Body', parent=styles['Normal'],
        fontSize=9.5, leading=14, textColor=MEDIUM_TEXT,
        fontName='Helvetica', spaceAfter=1*mm,
    ))
    styles.add(ParagraphStyle(
        'Footer', parent=styles['Normal'],
        fontSize=8, leading=10, textColor=LIGHT_TEXT,
        fontName='Helvetica', alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        'Stat_Number', parent=styles['Normal'],
        fontSize=24, leading=28, textColor=ORANGE,
        fontName='Helvetica-Bold', alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        'Stat_Label', parent=styles['Normal'],
        fontSize=9, leading=12, textColor=MEDIUM_TEXT,
        fontName='Helvetica', alignment=TA_CENTER,
    ))
    return styles


# ─── Page Template ──────────────────────────────────────────────────────────

class NuriDocTemplate(BaseDocTemplate):
    def __init__(self, filename, **kwargs):
        BaseDocTemplate.__init__(self, filename, **kwargs)
        self.page_count = 0
        self._is_title_page = True

        frame_normal = Frame(
            MARGIN, MARGIN + 8*mm, PAGE_W - 2*MARGIN, PAGE_H - 2*MARGIN - 8*mm,
            id='normal'
        )
        frame_title = Frame(0, 0, PAGE_W, PAGE_H, id='title')

        self.addPageTemplates([
            PageTemplate(id='title', frames=frame_title, onPage=self._title_page_bg),
            PageTemplate(id='normal', frames=frame_normal, onPage=self._normal_page_bg),
        ])

    def _title_page_bg(self, canvas, doc):
        canvas.saveState()
        steps = 100
        strip_h = PAGE_H / steps
        for i in range(steps):
            t = i / (steps - 1)
            r = ORANGE.red + t * (PURPLE.red - ORANGE.red)
            g = ORANGE.green + t * (PURPLE.green - ORANGE.green)
            b = ORANGE.blue + t * (PURPLE.blue - ORANGE.blue)
            canvas.setFillColor(Color(r, g, b))
            canvas.rect(0, PAGE_H - (i + 1) * strip_h, PAGE_W, strip_h + 1, fill=1, stroke=0)
        # Decorative circles
        canvas.setFillColor(Color(1, 1, 1, 0.06))
        canvas.circle(PAGE_W * 0.85, PAGE_H * 0.75, 80*mm, fill=1, stroke=0)
        canvas.circle(PAGE_W * 0.1, PAGE_H * 0.2, 60*mm, fill=1, stroke=0)
        canvas.circle(PAGE_W * 0.5, PAGE_H * 0.05, 40*mm, fill=1, stroke=0)
        canvas.restoreState()

    def _normal_page_bg(self, canvas, doc):
        canvas.saveState()
        stripe_h = 3*mm
        steps = 60
        strip_w = PAGE_W / steps
        for i in range(steps):
            t = i / (steps - 1)
            r = ORANGE.red + t * (PURPLE.red - ORANGE.red)
            g = ORANGE.green + t * (PURPLE.green - ORANGE.green)
            b = ORANGE.blue + t * (PURPLE.blue - ORANGE.blue)
            canvas.setFillColor(Color(r, g, b))
            canvas.rect(i * strip_w, PAGE_H - stripe_h, strip_w + 1, stripe_h, fill=1, stroke=0)
        # Footer
        canvas.setFillColor(LIGHT_TEXT)
        canvas.setFont("Helvetica", 8)
        canvas.drawCentredString(PAGE_W / 2, 8*mm, "nuri-beryl.vercel.app")
        canvas.drawString(MARGIN, 8*mm, "Nuri Features Manual v1.0")
        canvas.drawRightString(PAGE_W - MARGIN, 8*mm, f"Page {doc.page}")
        canvas.setStrokeColor(CARD_BORDER)
        canvas.setLineWidth(0.5)
        canvas.line(MARGIN, 12*mm, PAGE_W - MARGIN, 12*mm)
        canvas.restoreState()


# ─── Helpers ────────────────────────────────────────────────────────────────

CONTENT_W = PAGE_W - 2 * MARGIN

def icon(letter, color_hex):
    """Inline colored icon text using filled circle + letter."""
    return f'<font color="{color_hex}"><b>{SYM_CIRCLE}</b></font>'

def section_header(text, styles):
    return GradientHeader(text, CONTENT_W, height=12*mm, font_size=15)


# ─── Document Content ───────────────────────────────────────────────────────

def build_document():
    output_path = "/Users/bistrocloud/Documents/nuri/Nuri-Features-Manual.pdf"
    styles = get_styles()

    doc = NuriDocTemplate(
        output_path, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN,
    )

    story = []

    # ═══════════════════════════════════════════════════════════════════════
    # PAGE 1: TITLE PAGE
    # ═══════════════════════════════════════════════════════════════════════
    story.append(Spacer(1, 40*mm))
    # Center the owl using a table wrapper
    owl = OwlGraphic(65*mm)
    owl_table = Table([[owl]], colWidths=[PAGE_W])
    owl_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(owl_table)
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph("Nuri", styles['Title_Main']))
    story.append(Paragraph("Your AI Study Buddy", ParagraphStyle(
        'tagline', parent=styles['Subtitle_Main'], fontSize=20, leading=26
    )))
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph("Features &amp; User Manual", styles['Subtitle_Main']))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("AI-powered tutor for kids ages 5\u201311", styles['Hero_Detail']))
    story.append(Paragraph("Version 1.0  \u2014  April 2026", styles['Hero_Detail']))
    story.append(Spacer(1, 15*mm))

    # Stat pills
    stat_data = [("7", "Subjects"), ("Years 1\u20136", "Ages 5\u201311"), ("227", "Topics"), ("40", "Badges")]
    stat_cells = []
    for num, lbl in stat_data:
        stat_cells.append([
            Paragraph(f'<font color="#FFFFFF" size="18"><b>{num}</b></font>',
                       ParagraphStyle('sp', alignment=TA_CENTER, fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=white)),
            Paragraph(f'<font color="#FFE4CC" size="9">{lbl}</font>',
                       ParagraphStyle('sl', alignment=TA_CENTER, fontName='Helvetica', fontSize=9, leading=12, textColor=HexColor("#FFE4CC"))),
        ])
    stat_table = Table([stat_cells], colWidths=[35*mm] * 4, rowHeights=[18*mm])
    stat_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(stat_table)

    story.append(NextPageTemplate('normal'))
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # PAGE 2: TABLE OF CONTENTS + WHAT IS NURI
    # ═══════════════════════════════════════════════════════════════════════
    story.append(section_header("Table of Contents", styles))
    story.append(Spacer(1, 4*mm))

    toc_items = [
        ("1", "What is Nuri?", "2"),
        ("2", "Core Learning Features", "3\u20134"),
        ("3", "Curriculum Coverage", "5"),
        ("4", "AI Intelligence \u2014 How Nuri Gets Smarter", "6"),
        ("5", "Learning Support (Neurodivergent Adaptations)", "7"),
        ("6", "Gamification", "8"),
        ("7", "Social Features", "9"),
        ("8", "Adventure Mode", "10"),
        ("9", "Parent Dashboard &amp; Test Preparation", "11\u201312"),
        ("10", "Smart Learning Engine &amp; Voice", "12\u201313"),
        ("11", "Getting Started", "13\u201314"),
    ]

    toc_data = []
    for num, title, pg in toc_items:
        toc_data.append([
            Paragraph(f'<font color="#F97316"><b>{num}</b></font>', styles['TOC_Entry']),
            Paragraph(title, styles['TOC_Entry']),
            Paragraph(f'<font color="#A855F7">{pg}</font>',
                       ParagraphStyle('toc_pg', parent=styles['TOC_Entry'], alignment=TA_RIGHT)),
        ])

    toc_table = Table(toc_data, colWidths=[15*mm, CONTENT_W - 38*mm, 23*mm])
    toc_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW', (0, 0), (-1, -2), 0.3, CARD_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 2*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2*mm),
    ]))
    story.append(toc_table)

    story.append(Spacer(1, 6*mm))
    story.append(HRule(CONTENT_W, ORANGE, 1))
    story.append(Spacer(1, 5*mm))

    # What is Nuri intro
    story.append(section_header("What is Nuri?", styles))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph(
        "Nuri is an AI-powered tutor that makes learning feel like an adventure. Powered by advanced AI, "
        "Nuri adapts to each child\u2019s learning style, pace, and emotional state \u2014 becoming smarter and more "
        "personalized with every session. Nuri covers the Cambridge Primary and Egyptian National curriculum "
        "for Years 1\u20136 across 7 subjects.",
        styles['Body']
    ))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # PAGE 3: WHAT IS NURI (stats) + CORE LEARNING FEATURES START
    # ═══════════════════════════════════════════════════════════════════════

    # Key stats in a grid
    key_stats = [
        (MATHS_BLUE, "7", "7 Subjects", "Maths, Science, English, History, Arabic, Religion, Social Studies"),
        (SCIENCE_GREEN, "Y", "Years 1\u20136", "Cambridge Primary &amp; Egyptian National curriculum"),
        (PURPLE, "T", "227 Topics", "Detailed learning objectives tracked at individual level"),
        (ORANGE, "B", "40 Badges", "5 rarity tiers from Common to Legendary"),
        (ENGLISH_PURPLE, "AI", "AI-Powered", "Adapts to learning style, pace &amp; emotional state"),
        (ARABIC_TEAL, "D", "Any Device", "Phone, tablet, laptop \u2014 PWA feels like a native app"),
    ]

    stat_rows = []
    row = []
    for i, (color, letter, title, desc) in enumerate(key_stats):
        cell_content = [
            Paragraph(f'<font color="{color.hexval()}" size="18"><b>{SYM_CIRCLE}</b></font>',
                       ParagraphStyle(f'se_{i}', alignment=TA_CENTER, fontSize=18, leading=24)),
            Paragraph(f'<font color="{color.hexval()}"><b>{title}</b></font>',
                       ParagraphStyle(f'st_{i}', alignment=TA_CENTER, fontSize=10, leading=14, fontName='Helvetica-Bold')),
            Paragraph(f'<font color="#6B7280" size="8">{desc}</font>',
                       ParagraphStyle(f'sd_{i}', alignment=TA_CENTER, fontSize=8, leading=11, textColor=LIGHT_TEXT)),
        ]
        row.append(cell_content)
        if len(row) == 3:
            stat_rows.append(row)
            row = []

    stat_grid = Table(stat_rows, colWidths=[CONTENT_W/3] * 3, rowHeights=[28*mm, 28*mm])
    stat_grid.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOX', (0, 0), (0, 0), 0.5, CARD_BORDER),
        ('BOX', (1, 0), (1, 0), 0.5, CARD_BORDER),
        ('BOX', (2, 0), (2, 0), 0.5, CARD_BORDER),
        ('BOX', (0, 1), (0, 1), 0.5, CARD_BORDER),
        ('BOX', (1, 1), (1, 1), 0.5, CARD_BORDER),
        ('BOX', (2, 1), (2, 1), 0.5, CARD_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 3*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3*mm),
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
    ]))
    story.append(stat_grid)

    story.append(Spacer(1, 6*mm))

    # Start Core Learning Features on same page
    story.append(section_header("Core Learning Features", styles))
    story.append(Spacer(1, 3*mm))

    # Learn Mode
    story.append(Paragraph(f'<font color="#F97316">{SYM_STAR}</font>  <b>Learn Mode</b>', styles['Section_Subtitle']))
    for item in [
        "Conversational AI teaching \u2014 Nuri chats, not lectures",
        "Auto-suggests next unmastered topic or objective",
        "Voice reads aloud at kid-friendly speed (sentence by sentence)",
        "Quick action buttons: <b>Explain Simpler</b>, <b>Give Example</b>, <b>Quiz Me</b>, <b>I Can Teach This</b>",
    ]:
        story.append(Paragraph(f'<font color="#F97316">{SYM_BULLET}</font>  {item}', styles['NuriBullet']))
    story.append(Spacer(1, 3*mm))

    # Quiz Mode
    story.append(Paragraph(f'<font color="#A855F7">{SYM_DIAMOND}</font>  <b>Quiz Mode</b>', styles['Section_Subtitle']))
    for item in [
        "4 difficulty levels: <b>Easy</b>, <b>Medium</b>, <b>Hard</b>, <b>Challenge Me</b>",
        "XP scales with difficulty: 5 (Easy) to 20 (Challenge Me) per correct answer",
        "Varied question formats: word problems, patterns, comparisons, scenarios, fill-in-blank",
        "Confidence Meter: \u201cHow sure were you?\u201d \u2014 tracks blind spots over time",
        "Never repeats questions within a session",
    ]:
        story.append(Paragraph(f'<font color="#A855F7">{SYM_BULLET}</font>  {item}', styles['NuriBullet']))

    story.append(Spacer(1, 3*mm))

    # Explain It Back
    story.append(Paragraph(f'<font color="#10B981">{SYM_TRIANGLE}</font>  <b>Explain It Back</b>', styles['Section_Subtitle']))
    for item in [
        "Child becomes the teacher \u2014 explains a topic to Nuri",
        "Nuri plays confused, asks probing questions to deepen understanding",
        "AI scores understanding 1\u20135 with detailed feedback",
    ]:
        story.append(Paragraph(f'<font color="#10B981">{SYM_BULLET}</font>  {item}', styles['NuriBullet']))
    story.append(Spacer(1, 3*mm))

    # Homework Helper
    story.append(Paragraph(f'<font color="#3B82F6">{SYM_SQUARE}</font>  <b>Homework Helper</b>', styles['Section_Subtitle']))
    for item in [
        "4 input methods: <b>camera snap</b>, <b>upload photo</b>, <b>upload PDF</b>, <b>type question</b>",
        "AI Vision extracts individual questions from homework images",
        "Socratic guided solving \u2014 Nuri never gives the answer, guides discovery",
        "\u201cWrite your answer on paper and show me!\u201d verification every 4 questions",
        "Curriculum-aware: uses only methods the child has been taught at their year level",
    ]:
        story.append(Paragraph(f'<font color="#3B82F6">{SYM_BULLET}</font>  {item}', styles['NuriBullet']))

    story.append(Spacer(1, 6*mm))

    # Learning Flow
    story.append(Paragraph(
        '<b>How Learning Modes Work Together</b>',
        ParagraphStyle('modes_title', parent=styles['Section_Title'], fontSize=14, textColor=PURPLE)
    ))
    story.append(Spacer(1, 3*mm))

    flow_data = [
        [
            Paragraph('<font color="#F97316"><b>LEARN</b></font>', ParagraphStyle('fc1', alignment=TA_CENTER, fontSize=11, leading=14)),
            Paragraph(f'{SYM_ARROW}', ParagraphStyle('fa1', alignment=TA_CENTER, fontSize=14, leading=16)),
            Paragraph('<font color="#A855F7"><b>QUIZ</b></font>', ParagraphStyle('fc2', alignment=TA_CENTER, fontSize=11, leading=14)),
            Paragraph(f'{SYM_ARROW}', ParagraphStyle('fa2', alignment=TA_CENTER, fontSize=14, leading=16)),
            Paragraph('<font color="#10B981"><b>EXPLAIN</b></font>', ParagraphStyle('fc3', alignment=TA_CENTER, fontSize=11, leading=14)),
            Paragraph(f'{SYM_ARROW}', ParagraphStyle('fa3', alignment=TA_CENTER, fontSize=14, leading=16)),
            Paragraph('<font color="#3B82F6"><b>MASTER</b></font>', ParagraphStyle('fc4', alignment=TA_CENTER, fontSize=11, leading=14)),
        ],
        [
            Paragraph('<font size="8" color="#6B7280">Nuri teaches<br/>the concept</font>', ParagraphStyle('fd1', alignment=TA_CENTER, fontSize=8, leading=10)),
            Paragraph('', styles['Body']),
            Paragraph('<font size="8" color="#6B7280">Test your<br/>understanding</font>', ParagraphStyle('fd2', alignment=TA_CENTER, fontSize=8, leading=10)),
            Paragraph('', styles['Body']),
            Paragraph('<font size="8" color="#6B7280">Teach it back<br/>to Nuri</font>', ParagraphStyle('fd3', alignment=TA_CENTER, fontSize=8, leading=10)),
            Paragraph('', styles['Body']),
            Paragraph('<font size="8" color="#6B7280">Topic marked<br/>as mastered</font>', ParagraphStyle('fd4', alignment=TA_CENTER, fontSize=8, leading=10)),
        ]
    ]

    flow_table = Table(flow_data, colWidths=[22*mm, 8*mm, 22*mm, 8*mm, 22*mm, 8*mm, 22*mm])
    flow_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_ORANGE),
        ('BACKGROUND', (2, 0), (2, -1), LIGHT_PURPLE),
        ('BACKGROUND', (4, 0), (4, -1), HexColor("#ECFDF5")),
        ('BACKGROUND', (6, 0), (6, -1), HexColor("#EFF6FF")),
        ('BOX', (0, 0), (0, -1), 0.5, ORANGE),
        ('BOX', (2, 0), (2, -1), 0.5, PURPLE),
        ('BOX', (4, 0), (4, -1), 0.5, SCIENCE_GREEN),
        ('BOX', (6, 0), (6, -1), 0.5, MATHS_BLUE),
        ('TOPPADDING', (0, 0), (-1, -1), 2*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2*mm),
    ]))
    story.append(flow_table)

    story.append(Spacer(1, 6*mm))

    # Homework Helper detail
    story.append(Paragraph(f'<b>Homework Helper \u2014 Input Methods</b>',
                           ParagraphStyle('hw_detail', parent=styles['Section_Subtitle'], textColor=MATHS_BLUE)))
    story.append(Spacer(1, 3*mm))

    hw_methods = [
        (ORANGE, "C", "Camera Snap", "Take a photo of the worksheet page. AI Vision detects and extracts each question automatically."),
        (PURPLE, "U", "Upload Photo", "Upload an existing photo from your device. Same AI extraction as camera snap."),
        (MATHS_BLUE, "P", "Upload PDF", "Upload a PDF worksheet. Each page is processed for question extraction."),
        (SCIENCE_GREEN, "T", "Type Question", "Type or paste the question directly. Great for quick single questions."),
    ]

    hw_data = []
    for color, letter, name, desc in hw_methods:
        hw_data.append([
            Paragraph(f'<font color="{color.hexval()}" size="14"><b>{SYM_CIRCLE}</b></font>',
                       ParagraphStyle(f'hmi_{letter}', alignment=TA_CENTER, fontSize=14, leading=18)),
            Paragraph(f'<b>{name}</b>', ParagraphStyle(f'hmn_{letter}', fontSize=10, leading=13, fontName='Helvetica-Bold')),
            Paragraph(f'<font color="#6B7280" size="9">{desc}</font>',
                       ParagraphStyle(f'hmd_{letter}', fontSize=9, leading=12, textColor=LIGHT_TEXT)),
        ])

    hw_table = Table(hw_data, colWidths=[12*mm, 28*mm, CONTENT_W - 40*mm])
    hw_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('LINEBELOW', (0, 0), (-1, -2), 0.3, CARD_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 3*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 2*mm),
    ]))
    story.append(hw_table)

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # PAGE 5: CURRICULUM COVERAGE
    # ═══════════════════════════════════════════════════════════════════════
    story.append(section_header("Curriculum Coverage", styles))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph('<b>Cambridge Primary (4 subjects)</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    cambridge_subjects = [
        (MATHS_BLUE, f"{SYM_SQUARE}  Maths", "Number, Geometry, Measurement, Data Handling (Years 1\u20136)"),
        (SCIENCE_GREEN, f"{SYM_TRIANGLE}  Science", "Biology, Chemistry, Physics (Years 1\u20136)"),
        (ENGLISH_PURPLE, f"{SYM_DIAMOND}  English", "Reading, Writing, Grammar, Spelling (Years 1\u20136)"),
        (HISTORY_AMBER, f"{SYM_STAR}  History", "Chronology, Events, Sources (Years 1\u20136)"),
    ]

    for color, name, desc in cambridge_subjects:
        subj_data = [[
            Paragraph(f'<font color="{color.hexval()}" size="11"><b>{name}</b></font>',
                       ParagraphStyle(f's_{name[:4]}', fontSize=11, leading=14, fontName='Helvetica-Bold')),
            Paragraph(f'<font color="#4B5563" size="9">{desc}</font>',
                       ParagraphStyle(f'sd_{name[:4]}', fontSize=9, leading=13, textColor=MEDIUM_TEXT)),
        ]]
        subj_table = Table(subj_data, colWidths=[45*mm, CONTENT_W - 45*mm])
        subj_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, -1), WHITE),
            ('LINEBELOW', (0, 0), (-1, -1), 0.3, CARD_BORDER),
            ('TOPPADDING', (0, 0), (-1, -1), 2.5*mm),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5*mm),
            ('LEFTPADDING', (0, 0), (0, -1), 3*mm),
            ('LINEBEFORE', (0, 0), (0, -1), 2, color),
        ]))
        story.append(subj_table)
        story.append(Spacer(1, 1*mm))

    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('<b>Egyptian National (2 subjects)</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    egyptian_subjects = [
        (ARABIC_TEAL, f"{SYM_CIRCLE}  Arabic Language", "Reading, Writing, Grammar, Vocabulary (Years 1\u20136)"),
        (RELIGION_ROSE, f"{SYM_CROSS}  Christian Religious Education", "Coptic Orthodox tradition (Years 1\u20136)"),
    ]

    for color, name, desc in egyptian_subjects:
        subj_data = [[
            Paragraph(f'<font color="{color.hexval()}" size="11"><b>{name}</b></font>',
                       ParagraphStyle(f'se_{name[:4]}', fontSize=11, leading=14, fontName='Helvetica-Bold')),
            Paragraph(f'<font color="#4B5563" size="9">{desc}</font>',
                       ParagraphStyle(f'sde_{name[:4]}', fontSize=9, leading=13, textColor=MEDIUM_TEXT)),
        ]]
        subj_table = Table(subj_data, colWidths=[58*mm, CONTENT_W - 58*mm])
        subj_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, -1), WHITE),
            ('LINEBELOW', (0, 0), (-1, -1), 0.3, CARD_BORDER),
            ('TOPPADDING', (0, 0), (-1, -1), 2.5*mm),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5*mm),
            ('LEFTPADDING', (0, 0), (0, -1), 3*mm),
            ('LINEBEFORE', (0, 0), (0, -1), 2, color),
        ]))
        story.append(subj_table)
        story.append(Spacer(1, 1*mm))

    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('<b>Additional Subject</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    subj_data = [[
        Paragraph(f'<font color="{SOCIAL_INDIGO.hexval()}" size="11"><b>{SYM_HEART}  Social Studies</b></font>',
                   ParagraphStyle('ss_soc', fontSize=11, leading=14, fontName='Helvetica-Bold')),
        Paragraph('<font color="#4B5563" size="9">Geography, Civics, Community (Years 1\u20136)</font>',
                   ParagraphStyle('sd_soc', fontSize=9, leading=13, textColor=MEDIUM_TEXT)),
    ]]
    subj_table = Table(subj_data, colWidths=[55*mm, CONTENT_W - 55*mm])
    subj_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (-1, -1), WHITE),
        ('LINEBELOW', (0, 0), (-1, -1), 0.3, CARD_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('LEFTPADDING', (0, 0), (0, -1), 3*mm),
        ('LINEBEFORE', (0, 0), (0, -1), 2, SOCIAL_INDIGO),
    ]))
    story.append(subj_table)

    story.append(Spacer(1, 5*mm))
    story.append(Paragraph(
        "Each subject has detailed topics with specific learning objectives tracked at the individual objective level. "
        "Nuri does not just track \u201cFractions\u201d \u2014 it tracks \u201ccan add fractions with the same denominator\u201d "
        "vs \u201ccan compare fractions with different denominators.\u201d",
        styles['Body']
    ))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # PAGE 6: AI INTELLIGENCE
    # ═══════════════════════════════════════════════════════════════════════
    story.append(section_header("AI Intelligence \u2014 How Nuri Gets Smarter", styles))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph(f'<font color="#F97316">{SYM_STAR}</font>  <b>Child Intelligence Profile</b>', styles['Section_Subtitle']))
    story.append(Paragraph(
        "Every AI interaction is informed by everything Nuri knows about the child:",
        styles['Body']
    ))

    profile_items = [
        (f'<font color="#F97316">{SYM_BULLET}</font>  <b>Strengths:</b> \u201cGreat at multiplication \u2014 can move faster\u201d',
         f'<font color="#A855F7">{SYM_BULLET}</font>  <b>Struggles:</b> \u201cFractions at 35% accuracy \u2014 extra patience needed\u201d'),
        (f'<font color="#F97316">{SYM_BULLET}</font>  <b>Learning style:</b> visual, analogies, examples, auditory, try-first',
         f'<font color="#A855F7">{SYM_BULLET}</font>  <b>Confidence calibration:</b> blind spots (confident but wrong)'),
        (f'<font color="#F97316">{SYM_BULLET}</font>  <b>Mistake patterns:</b> calculation errors, conceptual gaps',
         f'<font color="#A855F7">{SYM_BULLET}</font>  <b>Session memory:</b> \u201cLast time we worked on the water cycle\u201d'),
        (f'<font color="#F97316">{SYM_BULLET}</font>  <b>Neglected subjects:</b> \u201cHistory not practiced in 10 days\u201d',
         f'<font color="#A855F7">{SYM_BULLET}</font>  <b>Prerequisite awareness:</b> \u201cChecking if multiplication is solid\u201d'),
    ]

    profile_data = []
    for left, right in profile_items:
        profile_data.append([
            Paragraph(left, styles['Body_Small']),
            Paragraph(right, styles['Body_Small']),
        ])

    profile_table = Table(profile_data, colWidths=[CONTENT_W/2, CONTENT_W/2])
    profile_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 1.5*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1.5*mm),
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
    ]))
    story.append(profile_table)

    story.append(Spacer(1, 4*mm))

    # Emotional Detection
    story.append(Paragraph(f'<font color="#A855F7">{SYM_HEART}</font>  <b>Emotional Detection</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    emotions = [
        (RELIGION_ROSE, "F", "Frustration", "3+ wrong answers", "\"Let's try a different approach\""),
        (HISTORY_AMBER, "B", "Boredom", "Instant answers", "Asks for reasoning explanation"),
        (MATHS_BLUE, "C", "Confusion", "\"idk\" responses", "Simplifies with bigger hints"),
        (SCIENCE_GREEN, "E", "Excitement", "High energy", "Matches the child's energy"),
    ]

    emo_data = []
    for color, letter, state, trigger, response in emotions:
        emo_data.append([
            Paragraph(f'<font color="{color.hexval()}" size="14"><b>{SYM_CIRCLE}</b></font>',
                       ParagraphStyle(f'emo_{letter}', alignment=TA_CENTER, fontSize=14, leading=18)),
            Paragraph(f'<b>{state}</b>', ParagraphStyle(f'emos_{letter}', fontSize=10, leading=13, fontName='Helvetica-Bold')),
            Paragraph(f'<font color="#6B7280" size="9">{trigger}</font>',
                       ParagraphStyle(f'emot_{letter}', fontSize=9, leading=12)),
            Paragraph(f'<font color="#4B5563" size="9"><i>{response}</i></font>',
                       ParagraphStyle(f'emor_{letter}', fontSize=9, leading=12)),
        ])

    emo_table = Table(emo_data, colWidths=[12*mm, 25*mm, 35*mm, CONTENT_W - 72*mm])
    emo_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (-1, -1), WHITE),
        ('LINEBELOW', (0, 0), (-1, -2), 0.3, CARD_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 2*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2*mm),
        ('BOX', (0, 0), (-1, -1), 0.5, CARD_BORDER),
    ]))
    story.append(emo_table)

    story.append(Spacer(1, 4*mm))

    # Cross-Subject
    story.append(Paragraph(f'<font color="#14B8A6">{SYM_DIAMOND}</font>  <b>Cross-Subject Connections</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    for item in [
        '\u201cIn Arabic, the word for fraction is kasr!\u201d',
        '\u201cThe water cycle is why the Nile floods \u2014 that\u2019s History!\u201d',
    ]:
        story.append(Paragraph(
            f'<font color="#14B8A6">{SYM_ARROW}</font>  <i>{item}</i>',
            ParagraphStyle(f'cross_{item[:5]}', parent=styles['Body'], leftIndent=5*mm, textColor=MEDIUM_TEXT)
        ))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # PAGE 7: LEARNING SUPPORT
    # ═══════════════════════════════════════════════════════════════════════
    story.append(section_header("Learning Support \u2014 Neurodivergent Adaptations", styles))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph(
        "Nuri recognizes and adapts to different learning needs. Parents can enable modes from the Parent Dashboard, "
        "and Nuri also detects patterns over time, gently suggesting adaptations to parents.",
        styles['Body']
    ))
    story.append(Spacer(1, 2*mm))

    nd_modes = [
        (MATHS_BLUE, f"{SYM_SQUARE} Dyslexia Mode", [
            "All text read aloud automatically",
            "Shorter messages, simpler words",
            "Never penalizes spelling mistakes",
            "Voice answers encouraged over typing",
            "Letter-swapped answers marked correct if concept is right",
        ]),
        (ORANGE, f"{SYM_STAR} ADHD Mode", [
            "Micro-sessions (5 min max before suggesting a switch)",
            "Rewards every 2 questions",
            "High energy, constant variety",
            "Re-engages after 20 seconds of silence",
            "Speed rounds to channel energy",
        ]),
        (PURPLE, f"{SYM_DIAMOND} Autism Mode", [
            "Predictable session structure (always same flow)",
            "Literal, clear language \u2014 no sarcasm or idioms",
            "Previews transitions: \u201cIn 2 more questions, we\u2019ll switch\u201d",
            "Celebrates pattern recognition and factual strengths",
            "Consistent Nuri personality (no sudden changes)",
        ]),
        (SCIENCE_GREEN, f"{SYM_TRIANGLE} Dyscalculia Mode", [
            "No timed maths questions ever",
            "Visual representations for every number concept",
            "Separates understanding from calculation",
            "Allows finger counting \u2014 never shames it",
            "Extra hints before showing answers",
        ]),
    ]

    for color, title, items in nd_modes:
        story.append(Paragraph(
            f'<font color="{color.hexval()}"><b>{title}</b></font>',
            ParagraphStyle(f'nd_{title[:5]}', parent=styles['Feature_Title'], textColor=color, spaceBefore=3*mm)
        ))
        for item in items:
            story.append(Paragraph(
                f'<font color="{color.hexval()}">{SYM_BULLET}</font>  {item}',
                ParagraphStyle(f'ndb_{item[:5]}', parent=styles['NuriBullet'], fontSize=9, leading=13)
            ))
        story.append(Spacer(1, 1*mm))

    story.append(Spacer(1, 3*mm))
    story.append(HRule(CONTENT_W, PURPLE, 0.5))
    story.append(Spacer(1, 2*mm))

    for item in [
        "<b>1.</b> Parents can enable modes from the Parent Dashboard",
        "<b>2.</b> Nuri also detects patterns over time and gently suggests to parents",
        "<b>3.</b> Specialist export: real behavioral data for professional assessment",
    ]:
        story.append(Paragraph(item, ParagraphStyle('how_it', parent=styles['Body_Small'], leftIndent=5*mm)))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # PAGE 8: GAMIFICATION
    # ═══════════════════════════════════════════════════════════════════════
    story.append(section_header("Gamification", styles))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph(f'<font color="#F97316">{SYM_STAR}</font>  <b>XP &amp; Levels</b>', styles['Section_Subtitle']))
    story.append(Paragraph(
        "Growth-only scoring \u2014 XP <b>never decreases</b>. This is the core anti-IXL philosophy. "
        "Children always feel forward progress, never punishment for mistakes.",
        styles['Body']
    ))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph(f'<font color="#A855F7">{SYM_DIAMOND}</font>  <b>40 Badges Across 8 Categories</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    badge_cats = [
        ("Milestones", "Quiz count, levels"),
        ("Quizzes", "Perfect scores, streaks"),
        ("Streaks", "3, 7, 14, 30, 100 days"),
        ("Learning", "Sessions, Explain It Back"),
        ("Mastery", "5-star topics per subject"),
        ("Subjects", "Diversity, all-subjects"),
        ("Fun", "Night owl, early bird"),
        ("Daily", "Challenge completions"),
    ]

    badge_rows = []
    row = []
    for i, (cat, desc) in enumerate(badge_cats):
        row.append([
            Paragraph(f'<font color="#F97316"><b>{cat}</b></font>',
                       ParagraphStyle(f'bc_{i}', fontSize=9, leading=12, fontName='Helvetica-Bold')),
            Paragraph(f'<font color="#6B7280" size="8">{desc}</font>',
                       ParagraphStyle(f'bd_{i}', fontSize=8, leading=11, textColor=LIGHT_TEXT)),
        ])
        if len(row) == 4:
            badge_rows.append(row)
            row = []

    badge_table = Table(badge_rows, colWidths=[CONTENT_W/4] * 4)
    badge_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, CARD_BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.3, CARD_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 2*mm),
    ]))
    story.append(badge_table)

    story.append(Spacer(1, 4*mm))

    # Rarity Tiers
    story.append(Paragraph('<b>5 Rarity Tiers</b>', styles['Feature_Title']))
    story.append(Spacer(1, 2*mm))

    rarities = [
        (HexColor("#9CA3AF"), "Common"),
        (HexColor("#22C55E"), "Uncommon"),
        (HexColor("#3B82F6"), "Rare"),
        (HexColor("#A855F7"), "Epic"),
        (HexColor("#F59E0B"), "Legendary"),
    ]

    rarity_cells = []
    for color, name in rarities:
        rarity_cells.append(
            Paragraph(f'<font color="{color.hexval()}"><b>{SYM_CIRCLE} {name}</b></font>',
                       ParagraphStyle(f'r_{name}', fontSize=10, leading=14, fontName='Helvetica-Bold', alignment=TA_CENTER))
        )

    rarity_table = Table([rarity_cells], colWidths=[CONTENT_W/5] * 5)
    rarity_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 2*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2*mm),
        ('BACKGROUND', (0, 0), (-1, -1), WHITE),
        ('BOX', (0, 0), (-1, -1), 0.5, CARD_BORDER),
    ]))
    story.append(rarity_table)

    story.append(Spacer(1, 4*mm))

    # Other gamification
    other_game = [
        (ORANGE, SYM_SQUARE, "Daily Mystery Challenge", "Sealed envelope appears daily. Complete for +50 XP. Adds daily motivation."),
        (PURPLE, SYM_STAR, "Nuri Evolution", "6 visual stages as the child levels up. Nuri grows and changes appearance."),
        (MATHS_BLUE, SYM_DIAMOND, "Sticker Book", "Visual collection of earned badges. Rarity borders match the tier. Encourages collecting."),
    ]

    for color, sym, title, desc in other_game:
        story.append(Paragraph(
            f'<font color="{color.hexval()}">{sym}</font>  <b>{title}</b> \u2014 <font color="#4B5563">{desc}</font>',
            ParagraphStyle(f'og_{title[:5]}', parent=styles['Body'], spaceBefore=1.5*mm)
        ))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # PAGE 9: SOCIAL FEATURES
    # ═══════════════════════════════════════════════════════════════════════
    story.append(section_header("Social Features", styles))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(f'<font color="#F97316">{SYM_STAR}</font>  <b>Study Duels</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph(
        "Challenge a friend or sibling to a knowledge duel! Study Duels make revision social and competitive "
        "while ensuring everyone earns XP \u2014 winning is a bonus, not a requirement.",
        styles['Body']
    ))
    story.append(Spacer(1, 2*mm))

    duel_steps = [
        ("1", "Create", "Pick a subject and create a 5-question challenge"),
        ("2", "Share", "Get a 6-character code to share with a friend"),
        ("3", "Compete", "Both answer the same questions with a timer"),
        ("4", "Compare", "Side-by-side results \u2014 Winner +50 XP, everyone +20 XP"),
    ]

    duel_data = []
    for num, label, desc in duel_steps:
        duel_data.append([
            Paragraph(f'<font color="#FFFFFF" size="14"><b>{num}</b></font>',
                       ParagraphStyle(f'ds_{num}', alignment=TA_CENTER, fontSize=14, leading=18)),
            Paragraph(f'<font color="#F97316"><b>{label}</b></font>',
                       ParagraphStyle(f'dl_{num}', fontSize=11, leading=14, fontName='Helvetica-Bold')),
            Paragraph(f'<font color="#4B5563" size="9">{desc}</font>',
                       ParagraphStyle(f'dd_{num}', fontSize=9, leading=13)),
        ])

    duel_table = Table(duel_data, colWidths=[12*mm, 22*mm, CONTENT_W - 34*mm])
    duel_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), ORANGE),
        ('BACKGROUND', (1, 0), (-1, -1), LIGHT_ORANGE),
        ('LINEBELOW', (0, 0), (-1, -2), 0.3, CARD_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 3*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 2*mm),
        ('BOX', (0, 0), (-1, -1), 0.5, ORANGE),
    ]))
    story.append(duel_table)

    story.append(Spacer(1, 8*mm))

    # Profile Switcher
    story.append(Paragraph(f'<font color="#A855F7">{SYM_DIAMOND}</font>  <b>Profile Switcher</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph(
        "Multiple children can use the same device, each with their own profile:",
        styles['Body']
    ))

    for item in [
        "Each child has their own profile, data, and Nuri relationship",
        "Device-scoped: visitors can\u2019t see other people\u2019s profiles",
        "Switch profiles easily from the home screen",
        "Separate XP, badges, progress, and learning history per child",
    ]:
        story.append(Paragraph(f'<font color="#A855F7">{SYM_BULLET}</font>  {item}', styles['NuriBullet']))

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # PAGE 10: ADVENTURE MODE
    # ═══════════════════════════════════════════════════════════════════════
    story.append(section_header("Adventure Mode", styles))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph(f'<b>Story Mode \u2014 "The 7 Lost Books of Knowledge"</b>', styles['Section_Subtitle']))
    story.append(Paragraph(
        "An epic adventure where each chapter is linked to a subject. Children recover ancient books "
        "of knowledge, solving academic challenges along the way.",
        styles['Body']
    ))
    story.append(Spacer(1, 2*mm))

    books = [
        (MATHS_BLUE, SYM_SQUARE, "The Book of Numbers", "Maths", "Hidden in a pyramid"),
        (SCIENCE_GREEN, SYM_TRIANGLE, "The Book of Nature", "Science", "Lost in a magical jungle"),
        (ENGLISH_PURPLE, SYM_DIAMOND, "The Book of Words", "English", "Trapped in an infinite library"),
        (HISTORY_AMBER, SYM_STAR, "The Book of Time", "History", "Stuck in the past"),
        (ARABIC_TEAL, SYM_CIRCLE, "The Book of Letters", "Arabic", "Guarded by a sphinx"),
        (RELIGION_ROSE, SYM_CROSS, "The Book of Light", "Religion", "In an ancient monastery"),
        (SOCIAL_INDIGO, SYM_HEART, "The Book of People", "Social Studies", "In a world city"),
    ]

    book_data = []
    for color, sym, book_name, subject, location in books:
        book_data.append([
            Paragraph(f'<font color="{color.hexval()}" size="12"><b>{sym}</b></font>',
                       ParagraphStyle(f'be_{book_name[:4]}', alignment=TA_CENTER, fontSize=12, leading=16)),
            Paragraph(f'<font color="{color.hexval()}"><b>{book_name}</b></font>',
                       ParagraphStyle(f'bn_{book_name[:4]}', fontSize=10, leading=13, fontName='Helvetica-Bold')),
            Paragraph(f'<font color="#6B7280" size="9">{subject}</font>',
                       ParagraphStyle(f'bs_{book_name[:4]}', fontSize=9, leading=12)),
            Paragraph(f'<font color="#4B5563" size="9"><i>{location}</i></font>',
                       ParagraphStyle(f'bl_{book_name[:4]}', fontSize=9, leading=12)),
        ])

    book_table = Table(book_data, colWidths=[10*mm, 45*mm, 30*mm, CONTENT_W - 85*mm])
    book_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('LINEBELOW', (0, 0), (-1, -2), 0.3, CARD_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 2*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2*mm),
        ('BOX', (0, 0), (-1, -1), 0.5, CARD_BORDER),
    ]))
    story.append(book_table)

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        f"<b>Each chapter flow:</b> Story Intro {SYM_ARROW} Learn {SYM_ARROW} Challenge (3 questions) {SYM_ARROW} Boss Puzzle {SYM_ARROW} Reward",
        ParagraphStyle('flow_desc', parent=styles['Body'], textColor=PURPLE)
    ))

    story.append(Spacer(1, 6*mm))

    # Nuri's World
    story.append(Paragraph(f'<font color="#F97316">{SYM_STAR}</font>  <b>Nuri\u2019s World (Virtual Treehouse)</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph(
        "A virtual treehouse that the child decorates with unlockable items. "
        "21 items across 4 categories, earned through different achievements:",
        styles['Body']
    ))

    th_data = [
        [
            Paragraph(f'<font color="#F97316">{SYM_BULLET}</font>  <b>Furniture</b> \u2014 Unlocked by reaching levels', styles['Body_Small']),
            Paragraph(f'<font color="#A855F7">{SYM_BULLET}</font>  <b>Decorations</b> \u2014 Unlocked by earning badges', styles['Body_Small']),
        ],
        [
            Paragraph(f'<font color="#F97316">{SYM_BULLET}</font>  <b>Accessories</b> \u2014 Unlocked by maintaining streaks', styles['Body_Small']),
            Paragraph(f'<font color="#A855F7">{SYM_BULLET}</font>  <b>Special</b> \u2014 Unlocked by completing homework', styles['Body_Small']),
        ],
    ]

    th_table = Table(th_data, colWidths=[CONTENT_W/2, CONTENT_W/2])
    th_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_ORANGE),
        ('TOPPADDING', (0, 0), (-1, -1), 2*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2*mm),
        ('BOX', (0, 0), (-1, -1), 0.5, ORANGE),
    ]))
    story.append(th_table)

    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # PAGE 11: PARENT DASHBOARD
    # ═══════════════════════════════════════════════════════════════════════
    story.append(section_header("Parent Dashboard", styles))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph(
        f'<b>Access:</b> Profile {SYM_ARROW} Parent Dashboard {SYM_ARROW} 4-digit PIN',
        ParagraphStyle('access', parent=styles['Body'], textColor=PURPLE)
    ))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(f'<font color="#F97316">{SYM_TRIANGLE}</font>  <b>What Parents See</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    for item in [
        "Weekly XP chart and active days",
        "Per-subject accuracy progress bars",
        "AI-generated session reports (strengths, struggles, recommendations)",
        "Test predictions from homework patterns",
        "Common mistake patterns",
        "Recent badges earned",
    ]:
        story.append(Paragraph(f'<font color="#F97316">{SYM_BULLET}</font>  {item}', styles['NuriBullet']))

    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(f'<font color="#A855F7">{SYM_DIAMOND}</font>  <b>Parent Controls</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    parent_ctrl = [
        ("<b>Notes for Nuri:</b>", "\"Focus on fractions this week\" (normal / high / urgent priority)"),
        ("<b>Learning needs toggles:</b>", "Dyslexia, ADHD, Autism, Dyscalculia modes"),
        ("<b>AI behavioral observations:</b>", "Evidence-based insights with supporting data"),
        ("<b>Specialist report export:</b>", "Professional-grade data for assessment specialists"),
    ]

    ctrl_data = []
    for label, desc in parent_ctrl:
        ctrl_data.append([
            Paragraph(label, ParagraphStyle('ctrl_l', fontSize=10, leading=13, fontName='Helvetica-Bold')),
            Paragraph(f'<font color="#4B5563" size="9">{desc}</font>',
                       ParagraphStyle('ctrl_d', fontSize=9, leading=13, textColor=MEDIUM_TEXT)),
        ])

    ctrl_table = Table(ctrl_data, colWidths=[45*mm, CONTENT_W - 45*mm])
    ctrl_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_PURPLE),
        ('LINEBELOW', (0, 0), (-1, -2), 0.3, PURPLE),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 3*mm),
        ('BOX', (0, 0), (-1, -1), 0.5, PURPLE),
    ]))
    story.append(ctrl_table)

    story.append(Spacer(1, 6*mm))

    # ═══════════════════════════════════════════════════════════════════════
    # TEST PREPARATION (continues on same page as Parent Dashboard)
    # ═══════════════════════════════════════════════════════════════════════
    story.append(section_header("Test Preparation", styles))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(f'<font color="#F97316">{SYM_CHECK}</font>  <b>Pre-Test Predictor</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph(
        "When a child knows a test is coming, Nuri creates a personalized study plan:",
        styles['Body']
    ))
    story.append(Spacer(1, 2*mm))

    test_steps = [
        ("1", "Child taps \u201cI have a test!\u201d on any subject page"),
        ("2", "Picks topics and test date"),
        ("3", "AI generates a countdown study plan"),
        ("4", "Daily tasks appear on homepage: \u201cDay 2 of 4: Practice fractions\u201d"),
        ("5", "Auto-includes mistake journal items for that topic"),
    ]

    test_data = []
    for num, desc in test_steps:
        test_data.append([
            Paragraph(f'<font color="#FFFFFF" size="13"><b>{num}</b></font>',
                       ParagraphStyle(f'ts_{num}', alignment=TA_CENTER, fontSize=13, leading=16)),
            Paragraph(desc, styles['Body']),
        ])

    test_table = Table(test_data, colWidths=[10*mm, CONTENT_W - 10*mm])
    test_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), ORANGE),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('LEFTPADDING', (1, 0), (1, -1), 3*mm),
        ('LINEBELOW', (0, 0), (-1, -2), 0.3, CARD_BORDER),
    ]))
    story.append(test_table)

    story.append(Spacer(1, 6*mm))

    story.append(Paragraph(f'<font color="#A855F7">{SYM_STAR}</font>  <b>Automatic Test Detection</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    story.append(Paragraph(
        "When the same topic appears <b>3+ times in homework within 2 weeks</b>, Nuri proactively alerts:",
        styles['Body']
    ))
    story.append(Spacer(1, 2*mm))

    alert_text = Paragraph(
        '<font color="#A855F7"><i>\u201cYour teacher seems to be focusing on [topic]. A test might be coming!\u201d</i></font>',
        ParagraphStyle('alert', parent=styles['Body'], alignment=TA_CENTER, fontSize=11, leading=16, textColor=PURPLE)
    )
    alert_table = Table([[alert_text]], colWidths=[CONTENT_W - 10*mm])
    alert_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_PURPLE),
        ('TOPPADDING', (0, 0), (-1, -1), 4*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4*mm),
        ('BOX', (0, 0), (-1, -1), 0.5, PURPLE),
    ]))
    story.append(alert_table)

    story.append(Spacer(1, 6*mm))

    # ═══════════════════════════════════════════════════════════════════════
    # SMART LEARNING ENGINE (continues from Test Preparation)
    # ═══════════════════════════════════════════════════════════════════════
    story.append(section_header("Smart Learning Engine", styles))
    story.append(Spacer(1, 4*mm))

    engine_features = [
        (ORANGE, SYM_CIRCLE, "Spaced Repetition",
         "Review queue with memory scores. Items resurface at optimal intervals based on forgetting curves. "
         "Each concept has a memory strength score that decays over time, ensuring children review material "
         "just before they would forget it."),
        (PURPLE, SYM_SQUARE, "Mistake Journal",
         "Auto-logs every wrong answer. Children can filter by subject, mark items as resolved, and practice "
         "specific mistakes again. The journal is automatically included in test preparation plans."),
        (MATHS_BLUE, SYM_DIAMOND, "Adaptive Topic Selection",
         "Quiz mode automatically picks the weakest topics. Learn mode suggests the next unmastered objective. "
         "The system never lets a child get stuck on content that is too hard or too easy."),
        (SCIENCE_GREEN, SYM_TRIANGLE, "Objective-Level Tracking",
         "Not just \u201cFractions\u201d but \u201ccan add fractions with same denominator\u201d vs \u201ccan\u2019t compare "
         "fractions with different denominators.\u201d Granular tracking enables precise remediation."),
        (HISTORY_AMBER, SYM_STAR, "Prerequisite Chains",
         "If fractions are weak, Nuri checks if multiplication is solid first. The system understands "
         "which concepts depend on which, ensuring foundations are strong before advancing."),
    ]

    for color, sym, title, desc in engine_features:
        story.append(Paragraph(
            f'<font color="{color.hexval()}">{sym}</font>  <font color="{color.hexval()}"><b>{title}</b></font>',
            ParagraphStyle(f'ef_{title[:5]}', parent=styles['Section_Subtitle'], textColor=color)
        ))
        story.append(Paragraph(desc, styles['Body']))
        story.append(Spacer(1, 2*mm))

    story.append(Spacer(1, 4*mm))

    # ═══════════════════════════════════════════════════════════════════════
    # VOICE & ACCESSIBILITY (continues from Smart Learning Engine)
    # ═══════════════════════════════════════════════════════════════════════
    story.append(section_header("Voice & Accessibility", styles))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(f'<font color="#F97316">{SYM_STAR}</font>  <b>Voice Features</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    for item in [
        "Text-to-speech at kid-friendly speed (0.82x English, 0.75x Arabic)",
        "Sentence-by-sentence streaming (speaks as text appears)",
        "Arabic voice for Arabic-majority text, English for mixed content",
        "Fill-in-blank gaps spoken as \u201cblank\u201d",
        "Speech recognition for voice answers",
    ]:
        story.append(Paragraph(f'<font color="#F97316">{SYM_BULLET}</font>  {item}', styles['NuriBullet']))

    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(f'<font color="#A855F7">{SYM_DIAMOND}</font>  <b>Device Compatibility</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    for item in [
        "Works on any device \u2014 phone, tablet, laptop",
        "PWA: \u201cAdd to Home Screen\u201d feels like a native app",
        "Responsive design adapts to any screen size",
    ]:
        story.append(Paragraph(f'<font color="#A855F7">{SYM_BULLET}</font>  {item}', styles['NuriBullet']))

    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(f'<font color="#10B981">{SYM_CHECK}</font>  <b>Reliability &amp; Error Handling</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    for item in [
        "Offline fallback: friendly \u201cNuri is sleeping\u201d page with cute animation",
        "Error recovery: \u201cOops! Nuri tripped!\u201d \u2014 never a white screen",
        "Session persistence: survives accidental back button presses",
        "Auto-save: no work is ever lost mid-session",
    ]:
        story.append(Paragraph(f'<font color="#10B981">{SYM_BULLET}</font>  {item}', styles['NuriBullet']))

    story.append(Spacer(1, 6*mm))

    # ═══════════════════════════════════════════════════════════════════════
    # GETTING STARTED (continues from Voice & Accessibility)
    # ═══════════════════════════════════════════════════════════════════════
    story.append(section_header("Getting Started", styles))
    story.append(Spacer(1, 4*mm))

    # For Kids
    story.append(Paragraph(f'<font color="#F97316">{SYM_STAR}</font>  <b>For Kids</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    kid_steps = [
        ("1", "Open <b>nuri-beryl.vercel.app</b> on any device"),
        ("2", "Tap \u201cCreate New Profile\u201d"),
        ("3", "Enter your name, pick your year group (1\u20136), choose a color"),
        ("4", "Start exploring! Try <b>Learn mode</b> first to meet Nuri"),
    ]

    kid_data = []
    for num, desc in kid_steps:
        kid_data.append([
            Paragraph(f'<font color="#FFFFFF" size="14"><b>{num}</b></font>',
                       ParagraphStyle(f'ks_{num}', alignment=TA_CENTER, fontSize=14, leading=18)),
            Paragraph(desc, styles['Body']),
        ])

    kid_table = Table(kid_data, colWidths=[10*mm, CONTENT_W - 10*mm])
    kid_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), ORANGE),
        ('BACKGROUND', (1, 0), (1, -1), LIGHT_ORANGE),
        ('TOPPADDING', (0, 0), (-1, -1), 3*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3*mm),
        ('LEFTPADDING', (1, 0), (1, -1), 3*mm),
        ('LINEBELOW', (0, 0), (-1, -2), 0.3, CARD_BORDER),
        ('BOX', (0, 0), (-1, -1), 0.5, ORANGE),
    ]))
    story.append(kid_table)

    story.append(Spacer(1, 4*mm))

    # For Parents
    story.append(Paragraph(f'<font color="#A855F7">{SYM_DIAMOND}</font>  <b>For Parents</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    parent_steps = [
        ("1", "Create your child\u2019s profile"),
        ("2", "Go to <b>Profile {0} Parent Dashboard</b>".format(SYM_ARROW)),
        ("3", "Set a <b>4-digit PIN</b> (so kids can\u2019t access parent area)"),
        ("4", "Add notes for Nuri: what to focus on, any learning needs"),
        ("5", "Check back weekly for progress reports and AI insights"),
    ]

    parent_data = []
    for num, desc in parent_steps:
        parent_data.append([
            Paragraph(f'<font color="#FFFFFF" size="14"><b>{num}</b></font>',
                       ParagraphStyle(f'ps_{num}', alignment=TA_CENTER, fontSize=14, leading=18)),
            Paragraph(desc, styles['Body']),
        ])

    parent_table = Table(parent_data, colWidths=[10*mm, CONTENT_W - 10*mm])
    parent_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), PURPLE),
        ('BACKGROUND', (1, 0), (1, -1), LIGHT_PURPLE),
        ('TOPPADDING', (0, 0), (-1, -1), 3*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3*mm),
        ('LEFTPADDING', (1, 0), (1, -1), 3*mm),
        ('LINEBELOW', (0, 0), (-1, -2), 0.3, CARD_BORDER),
        ('BOX', (0, 0), (-1, -1), 0.5, PURPLE),
    ]))
    story.append(parent_table)

    story.append(Spacer(1, 4*mm))

    # Tips
    story.append(Paragraph(f'<font color="#10B981">{SYM_CHECK}</font>  <b>Tips for Best Results</b>', styles['Section_Subtitle']))
    story.append(Spacer(1, 2*mm))

    for item in [
        "Let children explore freely at first \u2014 Nuri adapts to them",
        "Check the Parent Dashboard weekly for AI insights",
        "Use \u201cI have a test!\u201d before school tests for personalized study plans",
        "Homework Helper works best with clear, well-lit photos of worksheet pages",
        "Short daily sessions (10\u201315 minutes) are more effective than long weekly ones",
    ]:
        story.append(Paragraph(f'<font color="#10B981">{SYM_CHECK}</font>  {item}', styles['NuriBullet']))

    story.append(Spacer(1, 4*mm))

    # Final CTA -- keep together so it doesn't split across pages
    cta_block = KeepTogether([
        HRule(CONTENT_W, ORANGE, 1),
        Spacer(1, 4*mm),
        Paragraph(
            '<b>Ready to start learning?</b>',
            ParagraphStyle('cta_title', parent=styles['Section_Title'], alignment=TA_CENTER, fontSize=18, textColor=ORANGE)
        ),
        Paragraph(
            'Visit <font color="#A855F7"><b>nuri-beryl.vercel.app</b></font> on any device',
            ParagraphStyle('cta_url', parent=styles['Body'], alignment=TA_CENTER, fontSize=13, leading=18)
        ),
        Spacer(1, 3*mm),
        Paragraph(
            '<font color="#6B7280">Nuri Features Manual v1.0  |  April 2026  |  Made with care for curious minds</font>',
            ParagraphStyle('cta_footer', parent=styles['Footer'], alignment=TA_CENTER)
        ),
    ])
    story.append(cta_block)

    # ═══════════════════════════════════════════════════════════════════════
    # BUILD
    # ═══════════════════════════════════════════════════════════════════════
    doc.multiBuild(story)
    print(f"PDF generated: {output_path}")
    print(f"File size: {os.path.getsize(output_path) / 1024:.1f} KB")


if __name__ == "__main__":
    build_document()
