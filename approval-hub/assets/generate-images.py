#!/usr/bin/env python3
"""Generate the Approval Hub marketing images (dashboard mock + OG image).

Run:  python3 assets/generate-images.py
Outputs:
    assets/screenshot-dashboard.png  (1400x900 dashboard mock-up)
    assets/og-image.png              (1200x630 social image)
"""

import os

from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Palette
BG = "#F4F4F1"
CARD = "#FFFFFF"
BORDER = "#E4E4E7"
TEXT = "#0C0C09"
TEXT2 = "#52525B"
SUCCESS = "#16A34A"
WARNING = "#D97706"
DANGER = "#DC2626"
GRID = "#E4E4E7"

# Status tints (10% over white)
TINT_SUCCESS = (22, 163, 74, 26)
TINT_WARNING = (217, 119, 6, 26)
TINT_DANGER = (220, 38, 38, 26)
TINT_NEUTRAL = (82, 82, 91, 26)


def _rgb(hexstr):
    hexstr = hexstr.lstrip("#")
    return tuple(int(hexstr[i:i + 2], 16) for i in (0, 2, 4))


def load_fonts():
    """Load a system truetype font (regular + bold) or fall back to default."""
    candidates = [
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return {
                    size: ImageFont.truetype(path, size)
                    for size in (11, 12, 13, 14, 16, 18, 22, 28, 34, 44, 64)
                }
            except Exception:
                continue
    fallback = ImageFont.load_default()
    return {size: fallback for size in (11, 12, 13, 14, 16, 18, 22, 28, 34, 44, 64)}


FONTS = load_fonts()


def font(size):
    return FONTS.get(size) or FONTS[14]


def tinted(base_rgb, tint_rgba):
    """Composite a 10%-alpha tint colour over a solid base colour."""
    t = tint_rgba[3] / 255.0
    return tuple(
        round(tint_rgba[i] * t + base_rgb[i] * (1 - t)) for i in range(3)
    )


def chip(draw, x, y, text, fg_hex, tint_rgba, f):
    """Draw a small status chip; returns (width, height)."""
    w = draw.textlength(text, font=f) + 20
    h = 22
    draw.rounded_rectangle([x, y, x + w, y + h], radius=5, fill=tinted(CARD_RGB, tint_rgba))
    draw.text((x + 10, y + 4), text, font=f, fill=fg_hex)
    return int(w), h


CARD_RGB = (255, 255, 255)


def panel(draw, x, y, w, h, title=None):
    draw.rounded_rectangle([x, y, x + w, y + h], radius=10, fill=CARD, outline=BORDER, width=1)
    if title:
        draw.text((x + 20, y + 16), title, font=font(14), fill=TEXT)
        return y + 52  # content top
    return y + 20


def draw_dashboard():
    W, H = 1400, 900
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # ---- App bar -------------------------------------------------------
    bar_h = 64
    d.rectangle([0, 0, W, bar_h], fill=CARD)
    d.line([0, bar_h, W, bar_h], fill=BORDER, width=1)
    d.text((40, 18), "Approval Hub", font=font(22), fill=TEXT)
    # connected badge
    bx = 40 + d.textlength("Approval Hub", font=font(22)) + 16
    bw = d.textlength("connected", font=font(12)) + 32
    d.rounded_rectangle([bx, 21, bx + bw, 43], radius=11, fill=tinted(CARD_RGB, TINT_SUCCESS))
    d.ellipse([bx + 10, 29, bx + 18, 37], fill=SUCCESS)
    d.text((bx + 24, 24), "connected", font=font(12), fill=SUCCESS)
    # Sync button (solid dark, right aligned)
    sync_w, sync_h = 78, 34
    sx, sy = W - 40 - sync_w, (bar_h - sync_h) // 2
    d.rounded_rectangle([sx, sy, sx + sync_w, sy + sync_h], radius=10, fill=TEXT)
    tw = d.textlength("Sync", font=font(13))
    d.text((sx + (sync_w - tw) / 2, sy + 8), "Sync", font=font(13), fill=CARD)

    content_w = W - 80
    x0 = 40

    # ---- Stat cards row ------------------------------------------------
    stats = [
        ("Total requests", "30", TEXT),
        ("Pending", "28", WARNING),
        ("Approved", "1", SUCCESS),
        ("Rejected", "1", DANGER),
        ("Approval rate", "50%", TEXT),
    ]
    card_y, card_h = 88, 96
    gap = 16
    sc_w = (content_w - gap * 4) // 5
    for i, (label, value, colour) in enumerate(stats):
        cx = x0 + i * (sc_w + gap)
        d.rounded_rectangle([cx, card_y, cx + sc_w, card_y + card_h], radius=10,
                            fill=CARD, outline=BORDER, width=1)
        d.text((cx + 20, card_y + 16), label, font=font(12), fill=TEXT2)
        d.text((cx + 20, card_y + 40), value, font=font(34), fill=colour)

    # ---- Analytics panel (stacked 14-day bar chart) --------------------
    an_y = card_y + card_h + 24
    an_h = 260
    an_w = int(content_w * 0.58)
    cy = panel(d, x0, an_y, an_w, an_h, "Analytics")
    # plot area
    px, py = x0 + 40, cy + 8
    pw, ph = an_w - 70, an_h - 130
    # gridlines + y labels
    for i in range(5):
        gy = py + ph * i // 4
        d.line([px, gy, px + pw, gy], fill=GRID, width=1)
        d.text((x0 + 12, gy - 7), str(4 - i), font=font(11), fill=TEXT2)
    # baseline
    d.line([px, py + ph, px + pw, py + ph], fill=TEXT2, width=1)
    # 14 days of stacked bars (approved green bottom, rejected red top)
    data = [
        (1, 0), (2, 1), (0, 0), (1, 0), (3, 1), (2, 0), (1, 1),
        (2, 0), (0, 0), (3, 2), (1, 0), (2, 1), (4, 1), (1, 0),
    ]
    slot = pw / 14
    bar_w = int(slot * 0.5)
    max_units = 5
    unit = ph / max_units
    for i, (appr, rej) in enumerate(data):
        cx = px + slot * i + (slot - bar_w) / 2
        total = appr + rej
        if total:
            # approved segment (bottom)
            ah = appr * unit
            d.rectangle([cx, py + ph - ah, cx + bar_w, py + ph], fill=SUCCESS)
            if rej:
                rh = rej * unit
                d.rectangle([cx, py + ph - ah - rh, cx + bar_w, py + ph - ah], fill=DANGER)
    # x labels (every other day)
    days = ["Nov 5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"]
    for i, day in enumerate(days):
        if i % 2 == 0:
            lx = px + slot * i + slot / 2
            d.text((lx - d.textlength(day, font=font(11)) / 2, py + ph + 8), day,
                   font=font(11), fill=TEXT2)
    # legend
    ly = an_y + an_h - 34
    d.rectangle([px, ly, px + 12, ly + 12], fill=SUCCESS)
    d.text((px + 18, ly), "Approved", font=font(11), fill=TEXT2)
    lx2 = px + 18 + d.textlength("Approved", font=font(11)) + 24
    d.rectangle([lx2, ly, lx2 + 12, ly + 12], fill=DANGER)
    d.text((lx2 + 18, ly), "Rejected", font=font(11), fill=TEXT2)

    # ---- Requests by repository (horizontal amber bars) ---------------
    rp_x = x0 + an_w + gap
    rp_w = content_w - an_w - gap
    ry = panel(d, rp_x, an_y, rp_w, an_h, "Requests by repository")
    repos = [("nestjs/nest", 30, 1.0), ("expressjs/express", 12, 0.4), ("vercel/next.js", 7, 0.23)]
    by = ry + 14
    for name, count, frac in repos:
        d.text((rp_x + 20, by), name, font=font(12), fill=TEXT)
        d.text((rp_x + rp_w - 20 - d.textlength(str(count), font=font(12)), by),
               str(count), font=font(12), fill=TEXT2)
        track_y = by + 22
        d.rounded_rectangle([rp_x + 20, track_y, rp_x + rp_w - 20, track_y + 10],
                            radius=5, fill=BG, outline=BORDER, width=1)
        bw_full = rp_w - 40
        d.rounded_rectangle([rp_x + 20, track_y, rp_x + 20 + int(bw_full * frac), track_y + 10],
                            radius=5, fill=WARNING)
        by += 58

    # ---- Requests board -------------------------------------------------
    b_y = an_y + an_h + 24
    b_h = 216
    b_w = content_w
    byy = panel(d, x0, b_y, b_w, b_h, "Requests Board")
    rows = [
        ("Merge feature/agent-refactor into main", "nestjs/nest  ·  agent action  ·  2 minutes ago",
         "Pending", WARNING, TINT_WARNING),
        ("Update dependency lockfile", "expressjs/express  ·  pull request  ·  18 minutes ago",
         "Pending", WARNING, TINT_WARNING),
        ("Add retry policy to approval worker", "vercel/next.js  ·  agent action  ·  1 hour ago",
         "Approved", SUCCESS, TINT_SUCCESS),
        ("Docs: expand audit trail section", "nestjs/nest  ·  pull request  ·  3 hours ago",
         "Approved", SUCCESS, TINT_SUCCESS),
    ]
    row_y = byy + 4
    for title, meta, status, colour, tint in rows:
        # status chip on the right
        cw = d.textlength(status, font=font(12)) + 20
        chx = x0 + b_w - 20 - cw
        d.rounded_rectangle([chx, row_y + 10, chx + cw, row_y + 32], radius=5,
                            fill=tinted(CARD_RGB, tint))
        d.text((chx + 10, row_y + 14), status, font=font(12), fill=colour)
        d.text((x0 + 20, row_y + 8), title, font=font(14), fill=TEXT)
        d.text((x0 + 20, row_y + 34), meta, font=font(12), fill=TEXT2)
        if row_y < byy + b_h - 60:
            d.line([x0 + 20, row_y + 62, x0 + b_w - 20, row_y + 62], fill=BORDER, width=1)
        row_y += 50

    # ---- Milestones panel ----------------------------------------------
    m_y = b_y + b_h + 24
    m_h = 176
    m_w = int(content_w * 0.48)
    myy = panel(d, x0, m_y, m_w, m_h, "Milestones")
    miles = [("v1.0 Local merge pipeline", 0.85, "17 / 20 tasks"), ("v1.1 Analytics & reporting", 0.35, "7 / 20 tasks")]
    ty = myy + 8
    for name, frac, cnt in miles:
        d.text((x0 + 20, ty), name, font=font(13), fill=TEXT)
        d.text((x0 + m_w - 20 - d.textlength(cnt, font=font(12)), ty), cnt, font=font(12), fill=TEXT2)
        track_y = ty + 26
        d.rounded_rectangle([x0 + 20, track_y, x0 + m_w - 20, track_y + 12],
                            radius=6, fill=BG, outline=BORDER, width=1)
        d.rounded_rectangle([x0 + 20, track_y, x0 + 20 + int((m_w - 40) * frac), track_y + 12],
                            radius=6, fill=SUCCESS)
        ty += 66

    # ---- Audit trail panel ----------------------------------------------
    a_x = x0 + m_w + gap
    a_w = content_w - m_w - gap
    ayy = panel(d, a_x, m_y, a_w, m_h, "Audit Trail")
    events = [
        ("approved", SUCCESS, TINT_SUCCESS, "Merge feature/agent-refactor into main  ·  2 min ago"),
        ("rejected", DANGER, TINT_DANGER, "Drop table migration draft  ·  26 min ago"),
    ]
    ey = ayy + 10
    dot_x = a_x + 30
    for i, (label, colour, tint, text) in enumerate(events):
        # timeline line + dot
        if i == 0:
            d.line([dot_x, ey + 12, dot_x, ey + 62], fill=BORDER, width=2)
        d.ellipse([dot_x - 6, ey + 6, dot_x + 6, ey + 18], fill=CARD, outline=colour, width=2)
        cw = d.textlength(label, font=font(11)) + 16
        chx = dot_x + 16
        d.rounded_rectangle([chx, ey + 2, chx + cw, ey + 20], radius=5, fill=tinted(CARD_RGB, tint))
        d.text((chx + 8, ey + 4), label, font=font(11), fill=colour)
        d.text((chx + cw + 10, ey + 4), text[:44], font=font(12), fill=TEXT2)
        ey += 56

    out = os.path.join(BASE_DIR, "screenshot-dashboard.png")
    img.save(out)
    print("wrote", out)


def draw_og():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    d.text((100, 200), "Approval Hub", font=font(64), fill=TEXT)
    d.text((104, 300), "Review AI & agent actions. Merge locally. Audit everything.",
           font=font(22), fill=TEXT2)

    # three stat chips
    chips = [("Pending", "28", WARNING, TINT_WARNING),
             ("Approved", "1", SUCCESS, TINT_SUCCESS),
             ("Audit events", "412", TEXT, TINT_NEUTRAL)]
    cx = 100
    for label, value, colour, tint in chips:
        w = max(d.textlength(label, font=font(12)),
                d.textlength(value, font=font(28))) + 48
        d.rounded_rectangle([cx, 420, cx + w, 500], radius=10, fill=CARD, outline=BORDER, width=1)
        d.text((cx + 24, 432), label, font=font(12), fill=TEXT2)
        d.text((cx + 24, 450), value, font=font(28), fill=colour)
        cx += w + 16

    # abstract stacked bar motif, bottom right
    bars = [(140, 26, SUCCESS), (90, 18, DANGER), (110, 30, SUCCESS),
            (60, 10, DANGER), (170, 40, SUCCESS), (80, 14, DANGER), (120, 24, SUCCESS)]
    bx = 700
    baseline = 540
    for h_total, h_red, colour in bars:
        h_green = h_total - h_red
        if h_green:
            d.rectangle([bx, baseline - h_green, bx + 44, baseline], fill=SUCCESS)
        if h_red:
            d.rectangle([bx, baseline - h_total, bx + 44, baseline - h_green], fill=DANGER)
        bx += 64
    d.line([690, baseline, 1090, baseline], fill=TEXT2, width=2)

    out = os.path.join(BASE_DIR, "og-image.png")
    img.save(out)
    print("wrote", out)


if __name__ == "__main__":
    draw_dashboard()
    draw_og()
