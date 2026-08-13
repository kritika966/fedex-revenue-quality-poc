"""
FedEx Revenue Science POC — Analysis Engine
=============================================
Three analytical layers:

  1. DETECT   -> computer-aided quantitative & statistical analysis
                  applied to shipment-level billing data to find and
                  size revenue leakage.
  2. TARGET   -> customer/segment analytics + price-elasticity modeling
                  to decide WHICH accounts to act on and HOW.
  3. FORECAST -> time-series projection of revenue-quality impact to
                  support planning / leadership reporting.
"""

import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.linear_model import LinearRegression

DATA = Path(__file__).parent / "data"
OUT = Path(__file__).parent / "output"
OUT.mkdir(exist_ok=True)

shipments = pd.read_csv(DATA / "shipments.csv", parse_dates=["ship_date"])
accounts = pd.read_csv(DATA / "accounts.csv")

# =======================================================================
# LAYER 1 — DETECT: size and characterize the leakage
# =======================================================================
total_rev = shipments["revenue_billed"].sum()
total_leak = shipments["leakage_dollars"].sum()
leak_rate_of_rev = total_leak / total_rev

by_category = (shipments.groupby("category")
               .agg(shipments=("shipment_id", "count"),
                    revenue=("revenue_billed", "sum"),
                    leakage=("leakage_dollars", "sum"),
                    avg_margin_pct=("margin_pct_billed", "mean"))
               .assign(leak_pct_of_rev=lambda d: d.leakage / d.revenue)
               .sort_values("leakage", ascending=False))

by_segment = (shipments.groupby("segment")
              .agg(shipments=("shipment_id", "count"),
                   revenue=("revenue_billed", "sum"),
                   leakage=("leakage_dollars", "sum"),
                   avg_margin_pct=("margin_pct_billed", "mean"))
              .assign(leak_pct_of_rev=lambda d: d.leakage / d.revenue)
              .sort_values("leakage", ascending=False))

regime = (shipments.groupby("rounding_regime")
          .agg(shipments=("shipment_id", "count"),
               leakage=("leakage_dollars", "sum"))
          .assign(leak_per_shipment=lambda d: d.leakage / d.shipments))

monthly = (shipments.assign(month=shipments.ship_date.dt.to_period("M").dt.to_timestamp())
           .groupby("month")
           .agg(shipments=("shipment_id", "count"),
                revenue=("revenue_billed", "sum"),
                leakage=("leakage_dollars", "sum"),
                avg_margin_pct=("margin_pct_billed", "mean"))
           .reset_index())

by_category.to_csv(OUT / "leakage_by_category.csv")
by_segment.to_csv(OUT / "leakage_by_segment.csv")
monthly.to_csv(OUT / "monthly_trend.csv", index=False)

# =======================================================================
# LAYER 2 — TARGET: account-level rollup + price-elasticity-informed
# repricing recommendation engine
# =======================================================================
acct_roll = (shipments.groupby("account_id")
             .agg(shipments=("shipment_id", "count"),
                  revenue=("revenue_billed", "sum"),
                  leakage=("leakage_dollars", "sum"),
                  cost=("cost_to_serve", "sum"),
                  margin=("margin_billed", "sum"))
             .reset_index())
acct_roll["margin_pct"] = acct_roll["margin"] / acct_roll["revenue"]
acct_roll["leak_pct_of_rev"] = acct_roll["leakage"] / acct_roll["revenue"]
acct = acct_roll.merge(accounts, on="account_id", how="left")

# --- Composite risk score: rather than a single hard cutoff, blend two
# normalized signals a real revenue-quality scorecard would track —
# (1) how far below the network's target margin an account sits, and
# (2) how much of its revenue is leaking to measurement/billing gaps.
# Ranking on the composite (vs. either signal alone) concentrates the
# top tier on accounts that are BOTH structurally low-margin AND have a
# fixable capture gap — the accounts worth an analyst's limited time.
TARGET_MARGIN = 0.70  # illustrative network target margin threshold

def _norm(s):
    rng = s.max() - s.min()
    return (s - s.min()) / rng if rng > 0 else s * 0

margin_gap = (TARGET_MARGIN - acct["margin_pct"]).clip(lower=0)
acct["risk_score"] = (0.5 * _norm(margin_gap) + 0.5 * _norm(acct["leak_pct_of_rev"])).round(4)

p85, p60 = acct["risk_score"].quantile([0.85, 0.60])
acct["priority_tier"] = np.select(
    [acct.risk_score >= p85, acct.risk_score >= p60],
    ["Tier 1 - Act Now", "Tier 2 - Monitor"],
    default="Tier 3 - Healthy",
)

# --- Two levers, sized separately per account ---
# Lever A: DIM-billing correction (operational fix, ~zero volume/churn
#          risk — it's fixing a measurement error, not raising price).
acct["lever_a_dim_correction_recovery"] = acct["leakage"]

# Lever B: targeted rate action on chronically low-margin accounts that
#          the DIM fix alone won't cure. Uses each account's own
#          elasticity to find the profit-maximizing price bump:
#          Optimal %price change (Cournot-style, single-lever heuristic)
#          balances marginal revenue gain per unit vs. elasticity-implied
#          volume loss.  For a linear-elasticity demand approximation,
#          expected revenue-optimal markup ≈ -1 / (elasticity + small
#          margin buffer) is textbook monopoly pricing; here we cap the
#          recommended increase to a pragmatic 2-9% band (real pricing
#          teams always cap increases for relationship/contract reasons)
#          and compute the NET revenue effect after modeled volume loss.
def recommend_price_action(row):
    if row["priority_tier"] != "Tier 1 - Act Now":
        return pd.Series({"recommended_price_increase_pct": 0.0,
                           "expected_volume_change_pct": 0.0,
                           "lever_b_net_revenue_gain": 0.0})
    e = row["price_elasticity"]  # negative number
    # cap: never propose more than 9%, never less than 2%, scale inversely
    # with elasticity magnitude (more elastic accounts get smaller asks)
    raw = np.clip(1.5 / abs(e), 2, 9) / 100
    vol_change = e * raw  # % volume change implied by elasticity
    new_revenue = row["revenue"] * (1 + raw) * (1 + vol_change)
    net_gain = new_revenue - row["revenue"]
    return pd.Series({
        "recommended_price_increase_pct": round(raw * 100, 2),
        "expected_volume_change_pct": round(vol_change * 100, 2),
        "lever_b_net_revenue_gain": round(net_gain, 2),
    })

lever_b = acct.apply(recommend_price_action, axis=1)
acct = pd.concat([acct, lever_b], axis=1)
acct["total_recommended_recovery"] = (
    acct["lever_a_dim_correction_recovery"].clip(lower=0) + acct["lever_b_net_revenue_gain"].clip(lower=0)
)

acct_sorted = acct.sort_values("total_recommended_recovery", ascending=False)
acct_sorted.to_csv(OUT / "account_recommendations.csv", index=False)

tier_summary = acct.groupby("priority_tier").agg(
    accounts=("account_id", "count"),
    revenue=("revenue", "sum"),
    leakage=("leakage", "sum"),
    recommended_recovery=("total_recommended_recovery", "sum"),
).reset_index()
tier_summary.to_csv(OUT / "tier_summary.csv", index=False)

# =======================================================================
# LAYER 3 — FORECAST: project revenue-quality trend & intervention impact
# =======================================================================
m = monthly.copy()
m["t"] = np.arange(len(m))
X = m[["t"]].values
y = m["leakage"].values
model = LinearRegression().fit(X, y)

future_t = np.arange(len(m), len(m) + 6).reshape(-1, 1)
future_dates = pd.date_range(m["month"].max() + pd.offsets.MonthBegin(1), periods=6, freq="MS")
baseline_forecast = model.predict(future_t)

# Intervention scenario: Lever A closes ~80% of measurement leakage within
# 3 months of rollout (ramp curve); Lever B recovery phases in over the
# same window for Tier-1 accounts only.
ramp = np.array([0.15, 0.35, 0.55, 0.70, 0.78, 0.80])
lever_a_monthly_total = acct["lever_a_dim_correction_recovery"].clip(lower=0).sum() / 13  # avg monthly run-rate in sample
lever_b_monthly_total = acct["lever_b_net_revenue_gain"].clip(lower=0).sum() / 13
intervention_recovery = ramp * (lever_a_monthly_total + lever_b_monthly_total) * 13 / len(m)  # scale to monthly leak magnitude
projected_leak_with_action = np.clip(baseline_forecast - (ramp * baseline_forecast * 0.55), 0, None)

forecast_df = pd.DataFrame({
    "month": future_dates,
    "baseline_leakage_forecast": baseline_forecast.round(2),
    "leakage_with_intervention": projected_leak_with_action.round(2),
})
forecast_df["monthly_recovery"] = (forecast_df.baseline_leakage_forecast - forecast_df.leakage_with_intervention).round(2)
forecast_df.to_csv(OUT / "forecast.csv", index=False)

# =======================================================================
# Executive summary numbers (used in deck / dashboard)
# =======================================================================
summary = {
    "sample_shipments": int(len(shipments)),
    "sample_accounts": int(len(accounts)),
    "sample_period": f"{shipments.ship_date.min().date()} to {shipments.ship_date.max().date()}",
    "total_revenue_sample": round(total_rev, 2),
    "total_leakage_sample": round(total_leak, 2),
    "leakage_pct_of_revenue": round(leak_rate_of_rev * 100, 2),
    "leak_per_shipment_legacy_regime": round(regime.loc["legacy", "leak_per_shipment"], 3),
    "leak_per_shipment_new_regime": round(regime.loc["new", "leak_per_shipment"], 3),
    "leak_per_shipment_growth_pct": round(
        (regime.loc["new", "leak_per_shipment"] / regime.loc["legacy", "leak_per_shipment"] - 1) * 100, 1),
    "tier1_accounts": int((acct.priority_tier == "Tier 1 - Act Now").sum()),
    "tier1_share_of_leakage_pct": round(
        acct.loc[acct.priority_tier == "Tier 1 - Act Now", "leakage"].sum() / total_leak * 100, 1),
    "annualized_recovery_sample_scale": round(
        (lever_a_monthly_total + lever_b_monthly_total) * 12, 2),
    "six_month_forecast_recovery": round(forecast_df["monthly_recovery"].sum(), 2),
}
pd.Series(summary).to_csv(OUT / "executive_summary.csv")

print("=== EXECUTIVE SUMMARY ===")
for k, v in summary.items():
    print(f"{k}: {v}")
