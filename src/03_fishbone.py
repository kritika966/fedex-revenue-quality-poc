"""Generate an Ishikawa (fishbone) diagram: root causes of revenue leakage /
yield erosion in FedEx's low-density e-commerce & Ground Economy segment."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import textwrap

PURPLE = "#4D148C"
ORANGE = "#FF6600"
INK = "#241830"
MUTED = "#6b6577"
BG = "#FFFFFF"

fig, ax = plt.subplots(figsize=(15.5, 8.6), dpi=200)
fig.patch.set_facecolor(BG)
ax.set_facecolor(BG)
ax.set_xlim(0, 112)
ax.set_ylim(0, 66)
ax.axis("off")

spine_y = 33
spine_x0, spine_x1 = 6, 92
ax.annotate("", xy=(spine_x1, spine_y), xytext=(spine_x0, spine_y),
            arrowprops=dict(arrowstyle="-|>", color=INK, lw=3, mutation_scale=26))

head = mpatches.FancyBboxPatch((92, spine_y-7.5), 15, 15, boxstyle="round,pad=0.3,rounding_size=1.4",
                                linewidth=0, facecolor=PURPLE)
ax.add_patch(head)
ax.text(99.5, spine_y+4.3, "EFFECT", color="white", fontsize=11, fontweight="bold", ha="center", family="sans-serif")
ax.text(99.5, spine_y-1.2, "Revenue leakage & yield\nerosion in low-density /\nGround Economy shipments",
        color="white", fontsize=9.3, ha="center", va="center", family="sans-serif", linespacing=1.4)

causes = {
    "People": [
        "Analytics is retrospective, not\ncontinuous account monitoring",
        "Pricing/Sales/Finance silos —\nno single revenue-quality owner",
        "Limited capacity to scale\nelasticity/statistical modeling",
    ],
    "Process": [
        "Rate reviews on a fixed cadence,\nnot triggered by mix drift",
        "Contract repricing SLAs lag fast-\nchanging e-commerce SKU mix",
        "No standard workflow to act on\nleakage once it's detected",
    ],
    "Technology & Data": [
        "Dimension/weight/contract data\nfragmented across systems",
        "Legacy dim-capture at origin scan\nmisreads bulky packages",
        "Analytics/AI tooling still maturing\ninto real-time leakage detection",
    ],
    "Policy & Pricing": [
        "Rate cards use average density —\ndon't flex to SKU-level variance",
        "Discounts locked at signing, never\nre-optimized as mix shifts",
        "GRIs applied broadly, not targeted\nto leakage-driving accounts",
    ],
    "Market & External": [
        "E-commerce mix shifts toward\nbulky, low-density goods",
        "UPS/USPS/regional competition\ncaps blanket price increases",
        "Fuel & labor inflation compresses\nmargin on underpriced packages",
    ],
}

top_keys = ["People", "Process", "Technology & Data"]
bot_keys = ["Policy & Pricing", "Market & External"]
top_anchors = [24, 48, 72]
bot_anchors = [30, 62]

def draw_branch(cat, items, anchor_x, side, bone_len=16, bone_dx=13):
    """side=+1 above spine, -1 below. Bone runs diagonally from the spine
    up/down-and-left to the category label."""
    tip_x, tip_y = anchor_x - bone_dx, spine_y + side*bone_len
    ax.plot([anchor_x, tip_x], [spine_y, tip_y], color=PURPLE, lw=2.3, solid_capstyle="round")

    label_y = tip_y + side*2.6
    ax.text(tip_x, label_y, cat, color=PURPLE, fontsize=13.5, fontweight="bold",
            ha="center", va="center", family="sans-serif")

    n_items = len(items)
    for i, item in enumerate(items):
        frac = (i+1) / (n_items+1)
        px = anchor_x + (tip_x - anchor_x) * frac
        py = spine_y + (tip_y - spine_y) * frac
        tick_dx, tick_dy = -9.5, side*3.6
        qx, qy = px + tick_dx, py + tick_dy
        ax.plot([px, qx], [py, qy], color=MUTED, lw=1.2)
        ax.text(qx - 0.9, qy, item, color=INK, fontsize=8.3, ha="right", va="center",
                family="sans-serif", linespacing=1.3)

for x, key in zip(top_anchors, top_keys):
    draw_branch(key, causes[key], x, 1)
for x, key in zip(bot_anchors, bot_keys):
    draw_branch(key, causes[key], x, -1)

ax.text(spine_x0, spine_y-2.6, "Root causes  →", color=MUTED, fontsize=10, style="italic", family="sans-serif")
ax.text(spine_x0, spine_y+2.6, "Ishikawa (fishbone) diagram", color=INK, fontsize=10, fontweight="bold", family="sans-serif")

plt.tight_layout()
plt.savefig("/home/claude/fedex_poc/output/fishbone.png", dpi=200, bbox_inches="tight", facecolor=BG)
print("saved fishbone.png")
