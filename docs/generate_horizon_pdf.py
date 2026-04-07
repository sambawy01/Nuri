#!/usr/bin/env python3
"""
Generate Horizon AI School professional PDF document.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable, ListFlowable, ListItem,
    Frame, PageTemplate, BaseDocTemplate
)
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# ── Colors ──────────────────────────────────────────────────────────────────
DEEP_BLUE = HexColor("#1E3A5F")
TEAL = HexColor("#14B8A6")
ORANGE = HexColor("#F97316")
LIGHT_BG = HexColor("#F0F7FA")
LIGHT_TEAL = HexColor("#E0F5F1")
LIGHT_ORANGE = HexColor("#FFF3E6")
TABLE_HEADER_BG = HexColor("#1E3A5F")
TABLE_ALT_ROW = HexColor("#F0F7FA")
TABLE_BORDER = HexColor("#CBD5E1")
DARK_TEXT = HexColor("#1E293B")
MEDIUM_TEXT = HexColor("#334155")
LIGHT_TEXT = HexColor("#64748B")
WHITE = white

OUTPUT_PATH = "/Users/bistrocloud/Documents/nuri/docs/Horizon-AI-School-Features.pdf"

PAGE_W, PAGE_H = A4
MARGIN_LEFT = 25 * mm
MARGIN_RIGHT = 25 * mm
MARGIN_TOP = 25 * mm
MARGIN_BOTTOM = 25 * mm
CONTENT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT


# ── Styles ──────────────────────────────────────────────────────────────────
def make_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name="CoverTitle",
        fontName="Helvetica-Bold",
        fontSize=52,
        leading=58,
        textColor=WHITE,
        alignment=TA_CENTER,
        spaceAfter=6 * mm,
    ))
    styles.add(ParagraphStyle(
        name="CoverSubtitle",
        fontName="Helvetica",
        fontSize=20,
        leading=26,
        textColor=HexColor("#B0D4E8"),
        alignment=TA_CENTER,
        spaceAfter=10 * mm,
    ))
    styles.add(ParagraphStyle(
        name="CoverTagline",
        fontName="Helvetica-Oblique",
        fontSize=14,
        leading=20,
        textColor=HexColor("#7DD3C8"),
        alignment=TA_CENTER,
        spaceAfter=8 * mm,
    ))
    styles.add(ParagraphStyle(
        name="CoverDate",
        fontName="Helvetica",
        fontSize=12,
        leading=16,
        textColor=HexColor("#94A3B8"),
        alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        name="SectionTitle",
        fontName="Helvetica-Bold",
        fontSize=26,
        leading=32,
        textColor=DEEP_BLUE,
        spaceBefore=0,
        spaceAfter=8 * mm,
    ))
    styles.add(ParagraphStyle(
        name="SubsectionTitle",
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=22,
        textColor=TEAL,
        spaceBefore=6 * mm,
        spaceAfter=3 * mm,
    ))
    styles.add(ParagraphStyle(
        name="SubSubTitle",
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=18,
        textColor=DEEP_BLUE,
        spaceBefore=4 * mm,
        spaceAfter=2 * mm,
    ))
    styles.add(ParagraphStyle(
        name="BodyText2",
        fontName="Helvetica",
        fontSize=10.5,
        leading=16,
        textColor=MEDIUM_TEXT,
        alignment=TA_JUSTIFY,
        spaceAfter=3 * mm,
    ))
    styles.add(ParagraphStyle(
        name="BulletText",
        fontName="Helvetica",
        fontSize=10.5,
        leading=16,
        textColor=MEDIUM_TEXT,
        leftIndent=10 * mm,
        bulletIndent=4 * mm,
        spaceAfter=1.5 * mm,
    ))
    styles.add(ParagraphStyle(
        name="QuoteText",
        fontName="Helvetica-Oblique",
        fontSize=11,
        leading=17,
        textColor=DEEP_BLUE,
        alignment=TA_CENTER,
        leftIndent=15 * mm,
        rightIndent=15 * mm,
        spaceBefore=5 * mm,
        spaceAfter=5 * mm,
        borderColor=TEAL,
        borderWidth=0,
        borderPadding=0,
    ))
    styles.add(ParagraphStyle(
        name="TableCell",
        fontName="Helvetica",
        fontSize=9.5,
        leading=13,
        textColor=MEDIUM_TEXT,
    ))
    styles.add(ParagraphStyle(
        name="TableHeader",
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=13,
        textColor=WHITE,
    ))
    styles.add(ParagraphStyle(
        name="TimelineTime",
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=14,
        textColor=TEAL,
    ))
    styles.add(ParagraphStyle(
        name="TimelineDesc",
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=MEDIUM_TEXT,
    ))
    styles.add(ParagraphStyle(
        name="FeatureTitle",
        fontName="Helvetica-Bold",
        fontSize=11.5,
        leading=16,
        textColor=DEEP_BLUE,
        spaceBefore=3 * mm,
        spaceAfter=1.5 * mm,
    ))
    styles.add(ParagraphStyle(
        name="PageNumber",
        fontName="Helvetica",
        fontSize=9,
        textColor=LIGHT_TEXT,
        alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        name="FooterText",
        fontName="Helvetica",
        fontSize=8,
        textColor=LIGHT_TEXT,
        alignment=TA_CENTER,
    ))
    return styles


# ── Page Templates ──────────────────────────────────────────────────────────
class HorizonDocTemplate(BaseDocTemplate):
    def __init__(self, filename, **kwargs):
        super().__init__(filename, **kwargs)
        self.page_count = 0

        content_frame = Frame(
            MARGIN_LEFT, MARGIN_BOTTOM,
            CONTENT_W, PAGE_H - MARGIN_TOP - MARGIN_BOTTOM,
            id="content"
        )
        cover_frame = Frame(
            0, 0, PAGE_W, PAGE_H,
            id="cover"
        )
        self.addPageTemplates([
            PageTemplate(id="cover", frames=[cover_frame], onPage=self._draw_cover_bg),
            PageTemplate(id="content", frames=[content_frame], onPage=self._draw_content_page),
        ])

    def _draw_cover_bg(self, canvas_obj, doc):
        canvas_obj.saveState()
        # Gradient-like background: deep blue
        canvas_obj.setFillColor(DEEP_BLUE)
        canvas_obj.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

        # Decorative teal strip at bottom
        canvas_obj.setFillColor(TEAL)
        canvas_obj.rect(0, 0, PAGE_W, 8 * mm, fill=1, stroke=0)

        # Decorative circles (abstract)
        canvas_obj.setFillColor(HexColor("#264A6F"))
        canvas_obj.circle(PAGE_W * 0.85, PAGE_H * 0.75, 80, fill=1, stroke=0)
        canvas_obj.setFillColor(HexColor("#1A3352"))
        canvas_obj.circle(PAGE_W * 0.1, PAGE_H * 0.2, 60, fill=1, stroke=0)
        canvas_obj.setFillColor(HexColor("#0D5B52"))
        canvas_obj.circle(PAGE_W * 0.7, PAGE_H * 0.15, 40, fill=1, stroke=0)

        # Orange accent dot
        canvas_obj.setFillColor(ORANGE)
        canvas_obj.circle(PAGE_W * 0.92, PAGE_H * 0.88, 12, fill=1, stroke=0)

        canvas_obj.restoreState()

    def _draw_content_page(self, canvas_obj, doc):
        canvas_obj.saveState()

        # Top accent bar
        canvas_obj.setFillColor(DEEP_BLUE)
        canvas_obj.rect(0, PAGE_H - 6 * mm, PAGE_W, 6 * mm, fill=1, stroke=0)

        # Teal accent line under header bar
        canvas_obj.setFillColor(TEAL)
        canvas_obj.rect(0, PAGE_H - 7 * mm, PAGE_W, 1 * mm, fill=1, stroke=0)

        # Bottom bar
        canvas_obj.setFillColor(LIGHT_BG)
        canvas_obj.rect(0, 0, PAGE_W, 12 * mm, fill=1, stroke=0)

        # Page number
        page_num = canvas_obj.getPageNumber()
        canvas_obj.setFont("Helvetica", 9)
        canvas_obj.setFillColor(LIGHT_TEXT)
        canvas_obj.drawCentredString(PAGE_W / 2, 4 * mm, str(page_num))

        # Header text
        canvas_obj.setFont("Helvetica-Bold", 7.5)
        canvas_obj.setFillColor(WHITE)
        canvas_obj.drawString(MARGIN_LEFT, PAGE_H - 4.5 * mm, "HORIZON  |  THE AI SCHOOL")

        canvas_obj.restoreState()


# ── Helper functions ────────────────────────────────────────────────────────
def hr():
    return HRFlowable(
        width="100%", thickness=0.5, color=TABLE_BORDER,
        spaceBefore=4 * mm, spaceAfter=4 * mm
    )

def teal_hr():
    return HRFlowable(
        width="60%", thickness=1.5, color=TEAL,
        spaceBefore=2 * mm, spaceAfter=4 * mm, hAlign="LEFT"
    )

def orange_hr():
    return HRFlowable(
        width="40%", thickness=1.5, color=ORANGE,
        spaceBefore=2 * mm, spaceAfter=4 * mm, hAlign="LEFT"
    )

def bullet(text, styles):
    return Paragraph(f"<bullet>&bull;</bullet> {text}", styles["BulletText"])

def make_table(headers, rows, col_widths=None):
    """Create a styled table with header row and alternating colors."""
    styles = make_styles()
    header_cells = [Paragraph(h, styles["TableHeader"]) for h in headers]
    data = [header_cells]
    for row in rows:
        data.append([Paragraph(str(c), styles["TableCell"]) for c in row])

    if col_widths is None:
        col_widths = [CONTENT_W / len(headers)] * len(headers)

    t = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9.5),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
        ("TOPPADDING", (0, 0), (-1, 0), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.5, TABLE_BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, TABLE_ALT_ROW]),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 5),
        ("TOPPADDING", (0, 1), (-1, -1), 5),
    ]
    t.setStyle(TableStyle(style_cmds))
    return t


# ── Build Document ──────────────────────────────────────────────────────────
def build_pdf():
    styles = make_styles()
    doc = HorizonDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        title="HORIZON - The AI School",
        author="Horizon Education",
        subject="AI School for the Red Sea Coast",
    )

    story = []

    # ════════════════════════════════════════════════════════════════════════
    # COVER PAGE
    # ════════════════════════════════════════════════════════════════════════
    story.append(Spacer(1, 75 * mm))
    story.append(Paragraph("HORIZON", styles["CoverTitle"]))
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph("The AI School for the Red Sea Coast", styles["CoverSubtitle"]))
    story.append(Spacer(1, 8 * mm))

    # Decorative line
    story.append(HRFlowable(width="30%", thickness=2, color=TEAL, spaceBefore=0, spaceAfter=8*mm, hAlign="CENTER"))

    story.append(Paragraph(
        '<i>"Look further. Learn more. Build the future."</i>',
        styles["CoverTagline"]
    ))
    story.append(Spacer(1, 20 * mm))
    story.append(Paragraph("April 2026", styles["CoverDate"]))

    story.append(PageBreak())

    # Switch to content template
    from reportlab.platypus import NextPageTemplate
    story.insert(len(story) - 1, NextPageTemplate("content"))

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 2: What Is Horizon?
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("What Is Horizon?", styles["SectionTitle"]))
    story.append(teal_hr())
    story.append(Paragraph(
        "Horizon is an AI-powered school platform designed for a small community of 6-10 children "
        "(ages 5-11) on the South Coast of the Red Sea in Egypt. These children -- sons and daughters "
        "of hotel owners and senior tourism employees -- live near the protected areas of Wadi Gimel, "
        "Honkorab, and Kolan, where no traditional schools exist.",
        styles["BodyText2"]
    ))
    story.append(Paragraph(
        "Horizon fills this gap with an AI teacher named <b>Mr. Helmy</b>, a character inspired by a real "
        "pioneer developer and environmentalist who built the coast. Mr. Helmy teaches, adapts, remembers, "
        "and grows -- delivering personalized education to every child, every day.",
        styles["BodyText2"]
    ))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 3: Mr. Helmy
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("Mr. Helmy -- The AI Teacher", styles["SectionTitle"]))
    story.append(teal_hr())
    story.append(Paragraph(
        "Mr. Helmy is more than a teaching tool. He is a character -- inspired by a real pioneer "
        "developer and environmentalist from the South Red Sea coast who turned empty desert into "
        "a thriving community.",
        styles["BodyText2"]
    ))
    story.append(Spacer(1, 3 * mm))

    helmy_bullets = [
        "Inspiring mentor who is fun and energetic -- high expectations delivered with humor",
        'Pushes kids to dream big: <i>"When I started here there was nothing but sand and sea -- look what we built. Now it\'s your turn."</i>',
        "Tells stories from his experience building the coast to bring lessons to life",
        "Teaches using evidence-based methods: productive failure, Socratic questioning, elaborative interrogation, metacognition",
        "Speaks English for all subjects, switches to Arabic when a child needs help understanding",
        "For Arabic class: mixes Egyptian colloquial for framing with Modern Standard Arabic for content -- just like a real Egyptian teacher",
        "Greets every child by name when they walk in (face recognition camera)",
        "Remembers everything about every child -- learning style, strengths, struggles, what motivates them",
    ]
    for b in helmy_bullets:
        story.append(bullet(b, styles))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 4: The Students
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("The Students", styles["SectionTitle"]))
    story.append(teal_hr())

    student_bullets = [
        "6-10 children, ages 5-11 (Grades K-5)",
        "Children of hotel owners and senior tourism employees",
        "Located on the South Red Sea coast near Wadi Gimel, Honkorab, and Kolan",
        "Mixed ages learn together in one classroom",
        "No traditional schools available in the area",
    ]
    for b in student_bullets:
        story.append(bullet(b, styles))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 5: Curriculum Overview
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("Curriculum Overview", styles["SectionTitle"]))
    story.append(teal_hr())

    curr_headers = ["Subject", "Source", "Description"]
    curr_rows = [
        ["Mathematics", "Macmillan Max Maths\n(Singapore Approach)", "Concrete-Pictorial-Abstract methodology, Grades 1-6"],
        ["Science", "Macmillan Science", "5 spiraling strands: Living Things, Matter, Earth, Forces, Astronomy"],
        ["English", "Macmillan English", "18 themed units per level, integrated grammar/phonics/reading/writing"],
        ["Social Studies", "C3 Framework", "Inquiry-based: economics, civics, geography, history"],
        ["Marine Conservation", "Horizon Original", "Y2-Y6, Red Sea specific: reef biology, species ID, water quality, conservation action"],
        ["Tourism &amp; Hospitality", "Horizon Original", "English for tourism, hotel operations, customer service, tour guiding"],
        ["Arabic", "Horizon Original", "K-Y6, reading, writing, grammar in MSA, conversation in Egyptian dialect"],
    ]
    story.append(make_table(curr_headers, curr_rows, col_widths=[32*mm, 35*mm, CONTENT_W - 67*mm]))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 6: How a School Day Works
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("How a School Day Works", styles["SectionTitle"]))
    story.append(teal_hr())

    schedule = [
        ("7:30", "Morning Circle (15 min)", "Mr. Helmy greets kids by name, weather briefing, yesterday review, today's plan"),
        ("7:45", "Core Academic Block 1 (45 min)", "20 min group lesson on projector, then 20 min individual practice on tablets"),
        ("8:30", "Movement Break (15 min)", "Outside play, facilitator-led, no screens"),
        ("8:45", "Field Learning / Core Block 2 (45-60 min)", "MWF: Reef, beach, hotel visits with tablets. TuTh: second academic subject"),
        ("9:45", "Snack Break (20 min)", "Social time, facilitator-led"),
        ("10:05", "Local Subjects (40 min)", "Conservation or Tourism/Hospitality, project work"),
        ("10:45", "Creative Break (15 min)", "Art, drawing, building, music"),
        ("11:00", "Review Block (30 min)", "Spaced repetition, quiz games, reading time"),
        ("11:30", "Expedition Log + Closing (15 min)", "Daily journal, Mr. Helmy celebrates achievements"),
        ("11:45", "Day Ends", ""),
    ]

    sched_data = [[Paragraph("<b>Time</b>", styles["TableHeader"]),
                    Paragraph("<b>Activity</b>", styles["TableHeader"]),
                    Paragraph("<b>Details</b>", styles["TableHeader"])]]
    for time, activity, details in schedule:
        sched_data.append([
            Paragraph(f"<b>{time}</b>", ParagraphStyle("t", parent=styles["TableCell"], textColor=TEAL, fontName="Helvetica-Bold")),
            Paragraph(activity, styles["TableCell"]),
            Paragraph(details, styles["TableCell"]),
        ])

    sched_table = Table(sched_data, colWidths=[18*mm, 48*mm, CONTENT_W - 66*mm], repeatRows=1)
    sched_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.5, TABLE_BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, TABLE_ALT_ROW]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(sched_table)

    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph(
        "<b>Weekly rotation:</b> Mon (Math + Conservation field trip), Tue (English + Science), "
        "Wed (Math + Tourism field trip), Thu (English + Social Studies), Fri (English + Free exploration + Peer teaching)",
        styles["BodyText2"]
    ))
    story.append(Paragraph(
        "<b>Hot season adjustment:</b> Field trips move to 7:00 AM, indoor academics during midday heat.",
        styles["BodyText2"]
    ))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 7: The Three Learning Modes
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("The Three Learning Modes", styles["SectionTitle"]))
    story.append(teal_hr())

    story.append(Paragraph("1. Group Lessons (Projector)", styles["SubsectionTitle"]))
    story.append(Paragraph(
        "Mr. Helmy leads the class from the screen. Interactive -- asks questions, tells stories, poses challenges. "
        "Mixed ages handled through layered teaching: a hook everyone can access, a basic concept, extensions for "
        "older kids, challenges for the most advanced. The camera watches engagement and triggers adjustments in real-time.",
        styles["BodyText2"]
    ))

    story.append(Paragraph("2. Individual Practice (Tablets)", styles["SubsectionTitle"]))
    story.append(Paragraph(
        "Each child works at their own mastery level. A 5-year-old counts fish in pictures while an 11-year-old "
        "analyzes reef survey data -- same topic, completely different depth. Voice-first for young children (ages 5-7): "
        "Mr. Helmy reads everything aloud, kids answer by speaking or tapping.",
        styles["BodyText2"]
    ))

    story.append(Paragraph("3. Field Learning (Tablet Cameras)", styles["SubsectionTitle"]))
    story.append(Paragraph(
        "The reef, the desert, the hotels -- all are classrooms. Kids point tablet cameras at fish, coral, plants, "
        "and hotel rooms. Mr. Helmy identifies what they see and teaches in real-time. Every field trip produces data "
        "for the Digital Reef Twin -- a living map of their local ecosystem built from their own observations.",
        styles["BodyText2"]
    ))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 8: Mixed-Age Teaching
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("Mixed-Age Teaching", styles["SectionTitle"]))
    story.append(teal_hr())

    mixed_bullets = [
        "<b>Same topic, different depth</b> -- the topic is the shared experience, the depth is personalized",
        "<b>Group lessons use 4 layers:</b> hook (everyone), basic concept (young absorb, older review), extension (older engage, young draw/listen), challenge (oldest, optional)",
        "<b>Individual practice:</b> every child at their own mastery level on their tablet -- no child knows they are at a \"different level\"",
        "<b>Peer teaching:</b> older kids teach younger kids, coached by Mr. Helmy -- builds leadership in older kids, accelerates learning in younger ones",
        "<b>Real-time tracking:</b> Mr. Helmy tracks every child's exact position on every skill continuum in real-time",
    ]
    for b in mixed_bullets:
        story.append(bullet(b, styles))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 9: The Camera System
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("The Camera System", styles["SectionTitle"]))
    story.append(teal_hr())

    story.append(Paragraph("Classroom Camera", styles["SubsectionTitle"]))
    cam_bullets = [
        "Automatic attendance -- kids walk in, Mr. Helmy greets them by name",
        "Knows who is in the room and adjusts lessons to the group present",
        "Detects confusion, distraction, fatigue -- Mr. Helmy adapts in real-time",
        "Tracks who has participated and who needs encouragement",
        "Hand-raise detection -- Mr. Helmy calls on kids fairly",
        "No login needed -- face recognition means zero friction, kids just sit down and learning starts",
    ]
    for b in cam_bullets:
        story.append(bullet(b, styles))

    story.append(Paragraph("Tablet Cameras (Field Learning)", styles["SubsectionTitle"]))
    tab_bullets = [
        "Species identification -- point at fish, coral, or plant and Mr. Helmy teaches about it",
        "Living species journal -- track what each kid has found and identified",
        "Environment assessment -- photograph trash, damaged coral for conservation lessons",
        "Tourism training -- scan a hotel room, menu, or sign for hospitality lessons",
        "Handwriting recognition -- Arabic and English practice",
    ]
    for b in tab_bullets:
        story.append(bullet(b, styles))

    story.append(Paragraph("Privacy", styles["SubsectionTitle"]))
    priv_bullets = [
        "All processing happens locally in the classroom -- no data uploaded to the cloud",
        "No raw video stored -- only engagement signals",
        "Parent consent required before any child is enrolled",
        "Parents can view their child's data and request deletion at any time",
    ]
    for b in priv_bullets:
        story.append(bullet(b, styles))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 10: Mr. Helmy Gets Smarter Over Time
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("Mr. Helmy Gets Smarter Over Time", styles["SectionTitle"]))
    story.append(teal_hr())

    story.append(Paragraph("What He Learns About Each Child", styles["SubsectionTitle"]))
    child_bullets = [
        "Academic level per subject (may differ -- a child can be advanced in reading but behind in math)",
        "Learning style: visual, auditory, hands-on, story-based, try-first",
        "Behavioral patterns: attention span, best time of day, motivation triggers",
        "Emotional patterns: how they respond to difficulty, what encouragement works",
        "What teaching approaches produce breakthroughs for this specific child",
    ]
    for b in child_bullets:
        story.append(bullet(b, styles))

    story.append(Paragraph("What He Learns About the Group", styles["SubsectionTitle"]))
    group_bullets = [
        "Group energy patterns -- which days are strong, which are slow",
        "Optimal lesson length before attention drops",
        "Best subject sequencing",
        "Which kids work well paired together",
    ]
    for b in group_bullets:
        story.append(bullet(b, styles))

    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph("Growth Timeline", styles["SubsectionTitle"]))

    growth_headers = ["Period", "Mr. Helmy's Capability"]
    growth_rows = [
        ["Week 1", "Follows curriculum plan. Standard pacing. Learning names."],
        ["Month 1", "Knows each kid's level. Starts differentiating within group lessons."],
        ["Month 3", 'Tailored lessons. Knows "If I tell a reef story first, this group pays attention 40% longer."'],
        ["Month 6", "Predicts where kids will struggle before they get there. Library of tested explanations."],
        ["Year 1", "Deep profile on every child. Data-backed progress reports."],
    ]
    story.append(make_table(growth_headers, growth_rows, col_widths=[28*mm, CONTENT_W - 28*mm]))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 11: Early Detection
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("Early Detection", styles["SectionTitle"]))
    story.append(Paragraph("Learning Difficulties and Mental Health", styles["SubsectionTitle"]))
    story.append(teal_hr())

    story.append(Paragraph("What Mr. Helmy Can Detect", styles["SubSubTitle"]))
    story.append(Paragraph(
        "<b>Learning difficulties:</b> dyslexia (letter reversals in handwriting), dyscalculia (persistent number sense gaps), "
        "ADHD patterns (fidgeting, short focus bursts), processing delays (consistently needs more time), speech/language issues.",
        styles["BodyText2"]
    ))
    story.append(Paragraph(
        '<b>Mental health signals:</b> anxiety (avoidance, performance drops under pressure), withdrawal (declining participation), '
        'low self-esteem ("I can\'t do this"), social difficulties, fatigue/hunger patterns.',
        styles["BodyText2"]
    ))

    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph("Three-Level Response", styles["SubSubTitle"]))

    story.append(Paragraph(
        "<b>1. Adapt (Automatic, Invisible):</b> Mr. Helmy quietly adjusts. Anxious child? Stop putting them on the spot. "
        "Short attention? Build in more breaks.",
        styles["BodyText2"]
    ))
    story.append(Paragraph(
        "<b>2. Flag (School Owner Dashboard):</b> When patterns persist 2+ weeks, Mr. Helmy generates a data-backed "
        "observation report with a gentle recommendation.",
        styles["BodyText2"]
    ))
    story.append(Paragraph(
        "<b>3. Specialist Report (Exportable):</b> Comprehensive report with months of data that a remote professional "
        "can act on -- giving these kids access to early detection they would otherwise never receive.",
        styles["BodyText2"]
    ))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 12: The 12 Enhanced Features
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("The 12 Enhanced Features", styles["SectionTitle"]))
    story.append(teal_hr())

    features = [
        ("1. Virtual Guest Speakers",
         'Mr. Helmy "invites" experts into the classroom -- a marine biologist, a hotel manager, a historian. '
         "Kids ask questions. Eventually: live video calls with real professionals."),
        ("2. Digital Twin of Their Reef",
         "A living digital map built from photos kids take on field trips. Species spotted, coral health tracked, "
         "changes over seasons. The kids become citizen scientists."),
        ("3. Tourism Simulation Mode",
         "Mr. Helmy role-plays as different tourists -- German, Japanese, American. Kids practice greeting, "
         "explaining reef rules, handling complaints, recommending activities. Real-world job training as a game."),
        ("4. Peer Teaching",
         "Older kids teach younger kids, coached by Mr. Helmy. Builds leadership, communication, and deepens "
         "the older child's own understanding."),
        ("5. Story Mode -- Red Sea Adventures",
         '"A baby turtle hatched last night..." Interactive narratives set on the coast. Kids make choices that '
         "teach science, conservation, and problem-solving."),
        ("6. Daily Expedition Log",
         "Morning briefing + end-of-day journal. Kids build a personal portfolio -- part diary, part science "
         "notebook. Parents can see it."),
    ]
    for title, desc in features:
        story.append(Paragraph(title, styles["FeatureTitle"]))
        story.append(Paragraph(desc, styles["BodyText2"]))

    story.append(PageBreak())

    # Features continued
    story.append(Paragraph("The 12 Enhanced Features (continued)", styles["SectionTitle"]))
    story.append(teal_hr())

    features2 = [
        ("7. Weather and Environment Integration",
         'Mr. Helmy uses real local weather, tides, and water temperature to drive lessons. '
         '"Water is 28 degrees C -- close to bleaching territory. Let us talk about why..."'),
        ("8. Language Buddy",
         "Immersive English practice tied to their world -- reef vocabulary, hotel dialogues, pronunciation scoring. "
         "Progress from basic words to full professional conversations."),
        ("9. Parent/Community Dashboard",
         "Hotel owner parents see what their kid learned, conservation knowledge relevant to their business, "
         'and tourism skills developing. "Ahmed learned about reef-safe sunscreen -- your hotel could stock it."'),
        ("10. Seasonal Curriculum",
         "Turtle nesting season leads to biology. Coral spawning leads to life cycles. Tourist high season means "
         "English intensifies. Ramadan means an adjusted schedule. The curriculum breathes with the coast."),
        ("11. Achievement Expeditions",
         "Milestones unlock real-world experiences -- master 20 fish species and earn a guided snorkeling trip. "
         "Complete hospitality English level 3 and shadow a real hotel receptionist. Learning leads to real experiences."),
        ("12. Inter-School Connections",
         "Video-call students in Cairo, London, Tokyo. Compare environments. Collaborative projects. "
         "Kids go from isolated to globally connected."),
    ]
    for title, desc in features2:
        story.append(Paragraph(title, styles["FeatureTitle"]))
        story.append(Paragraph(desc, styles["BodyText2"]))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 13: Conservation Curriculum
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("The Conservation Curriculum", styles["SectionTitle"]))
    story.append(Paragraph("Years 2-6", styles["SubsectionTitle"]))
    story.append(teal_hr())

    cons_headers = ["Year", "Theme", "Topics", "Highlights"]
    cons_rows = [
        ["Y2", '"Our Red Sea Home"', "10 topics, 38 objectives", "Fish ID, corals, turtles, invertebrates, beach zones, mangroves, reef rules"],
        ["Y3", '"How Our Red Sea Works"', "14 topics, 60 objectives", "Food webs, reef zones, megafauna, bleaching, plastic pollution, citizen science"],
        ["Y4", '"Systems &amp; Connections"', "13 topics, 52+ objectives", "Hamata mangroves, wadi systems, overfishing, sustainable tourism audits"],
        ["Y5", '"Analysis &amp; Action"', "12 topics, 48+ objectives", "Indicator species, MPA design, restoration ecology, real conservation campaigns"],
        ["Y6", '"Red Sea Guardians"', "24 topics, 80+ objectives", "Year-long capstone project, Ambassador Program, Egyptian law, careers, graduation"],
    ]
    story.append(make_table(cons_headers, cons_rows, col_widths=[14*mm, 32*mm, 30*mm, CONTENT_W - 76*mm]))

    story.append(Spacer(1, 5 * mm))
    story.append(Paragraph(
        '<b>Y6 graduates as "Red Sea Guardians"</b> -- trained conservation ambassadors for their coast.',
        styles["BodyText2"]
    ))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 14: Language Model
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("Language Model", styles["SectionTitle"]))
    story.append(teal_hr())

    lang_bullets = [
        "<b>English</b> is the language of instruction for all subjects except Arabic",
        "When a child cannot follow in English, Mr. Helmy switches fully to Arabic until understanding clicks, then transitions back",
        "The Arabic-to-English ratio is per-child and adaptive -- a new 5-year-old might hear 80% Arabic; the same child by mid-year might be 50/50",
        "<b>Arabic class:</b> Mr. Helmy uses Egyptian colloquial for framing and conversation, Modern Standard Arabic for formal content -- exactly like a real Egyptian teacher",
        '<b>Tourism language tasters:</b> Fun weekly exposure to Italian, German, French -- "Buongiorno!"',
    ]
    for b in lang_bullets:
        story.append(bullet(b, styles))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 15: The Facilitator
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("The Facilitator -- The Human Heart", styles["SectionTitle"]))
    story.append(teal_hr())

    story.append(Paragraph(
        "The facilitator is NOT a teacher. They are a caring adult from the community -- a hotel employee, a parent, "
        "a retiree. Mr. Helmy handles the teaching. The facilitator handles the humanity.",
        styles["BodyText2"]
    ))

    story.append(Paragraph("What They Do", styles["SubsectionTitle"]))
    fac_do = [
        "Open the classroom, welcome kids, be present and warm",
        "Lead movement breaks and outdoor play -- Mr. Helmy is OFF during these",
        "Lead field trips: safety gear, water safety, head counts, weather decisions",
        "Sit with kids during lessons: manage physical disruptions, encourage shy kids, notice who is upset",
        "Eat snacks WITH the kids. Play WITH them. Build trust.",
        "Check the Facilitator Dashboard (Arabic-first): today's plan, kid alerts, parent messages",
    ]
    for b in fac_do:
        story.append(bullet(b, styles))

    story.append(Paragraph("What They Do Not Do", styles["SubsectionTitle"]))
    fac_dont = [
        "Teach content (Mr. Helmy does that)",
        "Override Mr. Helmy's difficulty settings",
        "Punish children for disengagement",
    ]
    for b in fac_dont:
        story.append(bullet(b, styles))

    story.append(Paragraph("Training", styles["SubsectionTitle"]))
    story.append(Paragraph(
        "<b>2 weeks.</b> Week 1: orientation (what Horizon is, dashboard, tablets, first aid, water safety). "
        "Week 2: practice with real kids (shadow, co-lead, solo with supervision).",
        styles["BodyText2"]
    ))

    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph(
        '"Mr. Helmy can teach a child to multiply fractions. He cannot teach a child that they matter. '
        'That is the facilitator\'s job."',
        styles["QuoteText"]
    ))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 16: Certification & Recognition
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("Certification and Recognition", styles["SectionTitle"]))
    story.append(teal_hr())

    story.append(Paragraph("Accredited Transcripts: Clonlara School", styles["SubsectionTitle"]))
    clon_bullets = [
        "MSA accredited (Middle States Association) -- recognized worldwide",
        "Students in 80+ countries",
        "Use your own curriculum -- Clonlara reviews and issues official transcripts",
        "Mr. Helmy auto-generates progress reports from learning data",
        "Transcripts can be Apostilled for legal recognition in Egypt",
    ]
    for b in clon_bullets:
        story.append(bullet(b, styles))

    story.append(Paragraph("Standardized Testing: Iowa Assessments", styles["SubsectionTitle"]))
    iowa_bullets = [
        "Nationally-normed percentile scores showing grade-level performance",
        "Kids take the test online on their tablets",
        "Mr. Helmy prepares them with a dedicated prep module",
    ]
    for b in iowa_bullets:
        story.append(bullet(b, styles))

    story.append(Paragraph("The Path Forward", styles["SubsectionTitle"]))
    story.append(Paragraph(
        "<b>Ages 5-11:</b> Horizon School with Clonlara transcript + Iowa scores each year",
        styles["BodyText2"]
    ))
    story.append(Paragraph(
        "<b>Ages 11+:</b> International school in Egypt or abroad (transcripts accepted), online secondary school, or Horizon expands",
        styles["BodyText2"]
    ))

    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph(
        "<b>Cost: approximately $13,400/year for 8 kids (full international certification)</b>",
        styles["BodyText2"]
    ))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 17: Research Foundation
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("Research Foundation", styles["SectionTitle"]))
    story.append(teal_hr())

    story.append(Paragraph(
        "Horizon is built on evidence, not assumptions. Key findings from comprehensive research across "
        "homeschooling, online education, and AI-powered learning:",
        styles["BodyText2"]
    ))
    story.append(Spacer(1, 3 * mm))

    research_headers = ["Finding", "Source"]
    research_rows = [
        ["1-on-1 tutoring produces 2 standard deviation improvement", "Bloom, 1984"],
        ["Homeschoolers score 15-25 percentile points above average", "Ray, 2010, 2017"],
        ["Mastery-based students: 14% better college performance", "RAND, 2023"],
        ["AI tutoring effect sizes: 0.3-0.5 standard deviations", "Multiple studies, 2023-2025"],
        ["Gamification effect size on learning: 0.822", "Meta-analysis, 2023"],
        ["Voice interaction: 0.51 SD comprehension increase for children", "ACM CHI, 2024"],
        ["Micro-schools: 95,000 in the US serving 1.5 million students", "The 74 Million, 2025"],
        ["Post-COVID: students still 4.8 months behind in reading", "NWEA, 2024"],
    ]
    story.append(make_table(research_headers, research_rows, col_widths=[CONTENT_W * 0.65, CONTENT_W * 0.35]))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 18: Implementation Phases
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("Implementation Phases", styles["SectionTitle"]))
    story.append(teal_hr())

    impl_headers = ["Phase", "Timeline", "What Gets Built"]
    impl_rows = [
        ["Phase 1: Core Platform", "Months 1-3", "Mr. Helmy teaching engine, Macmillan curriculum, basic classroom mode, voice interaction"],
        ["Phase 2: Camera Integration", "Months 4-5", "Face recognition, attendance, engagement tracking, hand-raise detection"],
        ["Phase 3: Field Learning", "Months 6-7", "Tablet camera species ID, expedition logs, Digital Reef Twin, tourism simulations"],
        ["Phase 4: Advanced Features", "Months 8-10", "Peer teaching, story mode, virtual guest speakers, weather integration"],
        ["Phase 5: Intelligence Layer", "Month 11+", "Adaptive learning profiles, early detection system, cross-kid learning"],
        ["Phase 6: Scale", "Month 18+", "Second school, curriculum adaptation, platform packaging"],
    ]
    story.append(make_table(impl_headers, impl_rows, col_widths=[32*mm, 24*mm, CONTENT_W - 56*mm]))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # PAGE 19: The Vision
    # ════════════════════════════════════════════════════════════════════════
    story.append(Paragraph("The Vision", styles["SectionTitle"]))
    story.append(teal_hr())

    story.append(Spacer(1, 10 * mm))
    story.append(Paragraph(
        "There are millions of children worldwide in communities like the South Red Sea coast -- "
        "too remote for conventional schools, too small for economic viability, too important to ignore.",
        styles["BodyText2"]
    ))
    story.append(Spacer(1, 5 * mm))
    story.append(Paragraph(
        "Horizon proves that an AI teacher, grounded in evidence-based pedagogy, embedded in the local environment, "
        "and supported by a caring human facilitator, can deliver an education that changes lives.",
        styles["BodyText2"]
    ))
    story.append(Spacer(1, 10 * mm))
    story.append(Paragraph(
        "The reef is waiting. The children are ready.",
        ParagraphStyle("vision_line", parent=styles["BodyText2"],
                       fontSize=13, leading=18, textColor=DEEP_BLUE,
                       fontName="Helvetica-Bold", alignment=TA_CENTER)
    ))
    story.append(Spacer(1, 15 * mm))

    # Decorative closing line
    story.append(HRFlowable(width="30%", thickness=2, color=TEAL, spaceBefore=0, spaceAfter=8*mm, hAlign="CENTER"))

    story.append(Paragraph(
        '<i>"Look further. Learn more. Build the future."</i>',
        ParagraphStyle("closing_tagline", parent=styles["BodyText2"],
                       fontSize=16, leading=22, textColor=TEAL,
                       fontName="Helvetica-Oblique", alignment=TA_CENTER)
    ))

    # Build
    doc.build(story)
    print(f"PDF generated: {OUTPUT_PATH}")
    print(f"File size: {os.path.getsize(OUTPUT_PATH):,} bytes")


if __name__ == "__main__":
    build_pdf()
