"""
FedEx Revenue Science POC — Synthetic Data Generator
=====================================================
IMPORTANT: This script generates a SYNTHETIC, illustrative shipment-level
dataset. No FedEx proprietary or confidential data is used anywhere in this
POC. The generator is *calibrated* to publicly disclosed facts so the
resulting patterns are realistic:

  - DIM divisor of 139 (in^3/lb) for domestic Ground/Express — FedEx's
    published dimensional weight divisor.
  - The Aug 18, 2025 DIM-weight rounding rule change (round every fractional
    inch UP to the next whole inch on all three dimensions) — reported
    across shipping-industry trade press (ShipperHQ, PARCEL Industry, 3PL
    Center, etc.) as a targeted revenue-quality lever aimed at low-density
    ("light & bulky") e-commerce SKUs.
  - FedEx's Q4 FY26 earnings coverage (reported across multiple financial
    outlets): package yield reported up ~11% year over year with the large
    majority attributed to base price increases rather than fuel or volume,
    and Ground Economy volume reported down roughly 5% — read as a
    deliberate trade of low-margin volume for margin quality. (These are
    paraphrased from secondary reporting, not verbatim transcript quotes.)
  - Standard parcel-industry cost structure: cost-to-serve scales with
    zone (distance) and billable weight, with a fixed linehaul/handling
    component per package (space + touch cost independent of weight).

Every numeric assumption below (elasticity, discount %, density mix, cost
curve) is a modeling ASSUMPTION, clearly labeled, meant to demonstrate the
analytical approach — not a claim about FedEx's actual internal economics.
"""

import numpy as np
import pandas as pd
from pathlib import Path

RNG = np.random.default_rng(42)
OUT = Path(__file__).parent / "data"
OUT.mkdir(exist_ok=True)

N_ACCOUNTS = 900          # customer accounts
N_SHIPMENTS = 60_000      # shipment-level rows, ~13 months of activity
DIM_DIVISOR = 139         # FedEx published domestic dim-weight divisor

# ---------------------------------------------------------------------
# 1. Build the account universe
# ---------------------------------------------------------------------
segments = RNG.choice(
    ["SME", "Mid-Market", "Enterprise"], size=N_ACCOUNTS, p=[0.62, 0.28, 0.10]
)
categories = RNG.choice(
    ["Apparel/Soft Goods", "Home & Bulky", "Electronics", "Health/Beauty", "Industrial/B2B"],
    size=N_ACCOUNTS, p=[0.28, 0.20, 0.17, 0.15, 0.20],
)
service_mix = RNG.choice(
    ["Ground Economy", "Ground", "Express"], size=N_ACCOUNTS, p=[0.40, 0.45, 0.15]
)

# Negotiated discount off published rate card — set once at contract signing
# and NOT re-optimized as package density mix drifts (this lag is the core
# root cause explored in the fishbone/RCA).
base_discount = np.clip(RNG.normal(0.32, 0.10, N_ACCOUNTS), 0.05, 0.65)
contract_age_months = RNG.integers(1, 42, N_ACCOUNTS)

# Density profile: avg cubic inches per lb of ACTUAL weight. Lower =
# "light & bulky" (apparel, home goods) = more exposed to DIM mispricing.
density_base = {
    "Apparel/Soft Goods": 210, "Home & Bulky": 260, "Electronics": 120,
    "Health/Beauty": 140, "Industrial/B2B": 90,
}
density_in3_per_lb = np.array([density_base[c] for c in categories]) * RNG.normal(1.0, 0.18, N_ACCOUNTS)
density_in3_per_lb = np.clip(density_in3_per_lb, 40, 450)

accounts = pd.DataFrame({
    "account_id": [f"A{100000+i}" for i in range(N_ACCOUNTS)],
    "segment": segments,
    "category": categories,
    "primary_service": service_mix,
    "negotiated_discount": base_discount,
    "contract_age_months": contract_age_months,
    "density_in3_per_lb": density_in3_per_lb,
})
# Price elasticity assumption by segment (illustrative — grounded in the
# general parcel-industry range of -0.2 to -0.7 reported in freight/pricing
# literature). SME = more price-sensitive/switch-prone; Enterprise = higher
# switching cost (integrated systems, SLAs) = less elastic.
elasticity_map = {"SME": -0.55, "Mid-Market": -0.38, "Enterprise": -0.22}
accounts["price_elasticity"] = accounts["segment"].map(elasticity_map) * RNG.normal(1.0, 0.15, N_ACCOUNTS)

accounts.to_csv(OUT / "accounts.csv", index=False)

# ---------------------------------------------------------------------
# 2. Simulate shipments over a 13-month window (spans the Aug-18-2025
#    DIM rounding rule change so we can show before/after impact)
# ---------------------------------------------------------------------
start = pd.Timestamp("2025-05-01")
dates = start + pd.to_timedelta(RNG.integers(0, 13 * 30, N_SHIPMENTS), unit="D")
acct_idx = RNG.integers(0, N_ACCOUNTS, N_SHIPMENTS)
acct_rows = accounts.iloc[acct_idx].reset_index(drop=True)

# Actual weight (lb) — log-normal, category-dependent
weight_base = {
    "Apparel/Soft Goods": 1.6, "Home & Bulky": 4.5, "Electronics": 3.2,
    "Health/Beauty": 1.2, "Industrial/B2B": 8.0,
}
wb = np.array([weight_base[c] for c in acct_rows["category"]])
actual_weight = np.clip(RNG.lognormal(mean=np.log(wb), sigma=0.45), 0.3, 70)

# Cubic size implied by density profile, with shipment-level noise
cubic_in3 = actual_weight * acct_rows["density_in3_per_lb"].values * RNG.normal(1.0, 0.2, N_SHIPMENTS)
cubic_in3 = np.clip(cubic_in3, 20, 6000)

# Back out approximate box dims (assume roughly cubic-ish box: L=1.3W, W=1.1H)
# so we can apply the *rounding* rule realistically per-dimension.
H = (cubic_in3 / (1.3 * 1.1)) ** (1 / 3)
W = 1.1 * H
L = 1.3 * H

def dim_weight(l, w, h, rounding="legacy"):
    if rounding == "legacy":
        # pre-Aug-2025: standard rounding to nearest whole inch
        l_, w_, h_ = np.round(l), np.round(w), np.round(h)
    else:
        # post-Aug-2025: ANY fraction rounds UP on each dimension
        l_, w_, h_ = np.ceil(l), np.ceil(w), np.ceil(h)
    return (l_ * w_ * h_) / DIM_DIVISOR

dimwt_legacy = dim_weight(L, W, H, "legacy")
dimwt_new = dim_weight(L, W, H, "new")

zone = RNG.integers(2, 9, N_SHIPMENTS)  # FedEx zones 2-8

rule_change_date = pd.Timestamp("2025-08-18")
rounding_regime = np.where(dates >= rule_change_date, "new", "legacy")
dim_weight_billed_correctly = np.where(rounding_regime == "new", dimwt_new, dimwt_legacy)

# billable weight = max(actual, dim weight) — standard parcel industry practice
billable_weight_correct = np.maximum(actual_weight, dim_weight_billed_correctly)

# ---------------------------------------------------------------------
# 3. Simulate the REVENUE LEAKAGE: a subset of shipments are billed on
#    ACTUAL weight instead of the (higher) correct billable weight due to
#    operational gaps — stale package-level dim capture, legacy account
#    overrides frozen at contract signing, manual-measurement error at
#    origin scan, etc. This is the "root cause" surfaced in the fishbone.
# ---------------------------------------------------------------------
# Probability of a measurement/billing gap depends on: how "light & bulky"
# the shipment is (bigger dim-vs-actual gap = more valuable to catch) and
# how old/stale the contract's dim-capture setup is.
dim_actual_gap = np.clip(billable_weight_correct - actual_weight, 0, None)
staleness = np.clip(acct_rows["contract_age_months"].values / 42, 0, 1)
leak_prob = np.clip(0.12 + 0.55 * (dim_actual_gap / (dim_actual_gap.max() + 1e-6)) * (0.4 + 0.6 * staleness), 0, 0.85)
is_leaked = RNG.random(N_SHIPMENTS) < leak_prob
billable_weight_billed = np.where(is_leaked, actual_weight, billable_weight_correct)

# ---------------------------------------------------------------------
# 4. Rate card: published $/lb by zone, with fuel surcharge, minus the
#    account's negotiated discount. Cost-to-serve modeled as a fixed
#    handling/space cost + a per-lb linehaul cost that scales with zone.
# ---------------------------------------------------------------------
published_rate_per_lb = 3.10 + 0.42 * zone            # illustrative rate card
fuel_surcharge_pct = 0.145                              # illustrative avg FSC

revenue_billed = billable_weight_billed * published_rate_per_lb * (1 + fuel_surcharge_pct)
revenue_billed *= (1 - acct_rows["negotiated_discount"].values)

revenue_correct = billable_weight_correct * published_rate_per_lb * (1 + fuel_surcharge_pct)
revenue_correct *= (1 - acct_rows["negotiated_discount"].values)

fixed_handling_cost = 2.35
linehaul_cost_per_lb_zone = 0.31 + 0.07 * zone
cost_to_serve = fixed_handling_cost + linehaul_cost_per_lb_zone * billable_weight_correct
cost_to_serve *= RNG.normal(1.0, 0.06, N_SHIPMENTS)  # noise

shipments = pd.DataFrame({
    "shipment_id": np.arange(N_SHIPMENTS),
    "account_id": acct_rows["account_id"].values,
    "segment": acct_rows["segment"].values,
    "category": acct_rows["category"].values,
    "service": acct_rows["primary_service"].values,
    "ship_date": dates,
    "rounding_regime": rounding_regime,
    "zone": zone,
    "actual_weight_lb": actual_weight.round(2),
    "length_in": np.round(L, 2), "width_in": np.round(W, 2), "height_in": np.round(H, 2),
    "dim_weight_correct_lb": billable_weight_correct.round(2),
    "billable_weight_billed_lb": billable_weight_billed.round(2),
    "is_leaked_shipment": is_leaked,
    "revenue_billed": revenue_billed.round(2),
    "revenue_if_correctly_billed": revenue_correct.round(2),
    "cost_to_serve": cost_to_serve.round(2),
})
shipments["leakage_dollars"] = (shipments["revenue_if_correctly_billed"] - shipments["revenue_billed"]).round(2)
shipments["margin_billed"] = (shipments["revenue_billed"] - shipments["cost_to_serve"]).round(2)
shipments["margin_pct_billed"] = (shipments["margin_billed"] / shipments["revenue_billed"]).round(4)

shipments.to_csv(OUT / "shipments.csv", index=False)

print(f"Generated {len(accounts):,} accounts and {len(shipments):,} shipments.")
print(f"Date range: {shipments.ship_date.min().date()} -> {shipments.ship_date.max().date()}")
print(f"Total leakage in sample: ${shipments.leakage_dollars.sum():,.0f}")
print(f"Leakage rate (post-rule shipments): "
      f"{shipments.loc[shipments.rounding_regime=='new','is_leaked_shipment'].mean():.1%}")
