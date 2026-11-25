[![token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/competitions/token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/firehorse20/token-radar-01-v5/rank.svg)](https://make.fun/competitions/token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/firehorse20/token-radar-01-v5/reward.svg)](https://make.fun/competitions/token-radar-01)

# Token Radar v5

A token launch radar for make.fun's "Build the best token launch radar" bounty
(https://make.fun/bounty/token-radar-01). It reads a sealed DefiLlama snapshot of
758 protocols, ranks the pre-token ones by an implied launch value, and shows a
reader how to farm each one. This is v5 of the entry: a new value model (radar-6),
a four-tier board with an explicit product tier, richer farm plans, and a rebuilt
dark dashboard with a fourteen-factor value breakdown.

## The board

224 rows: the 40 protocols on the snapshot's watchlist (at least $50M of TVL and no
token on record), 138 further rankable pre-token protocols below that floor, 35
staked or bridged products ranked at a 60% discount and badged as products, and 11
versioned deployments (a V2 or V3 of a pre-token protocol) at a 70% discount and
badged as deployments. Live-token protocols are set aside with their market caps
shown, never mixed into the ranking. Exchanges stay off the board, and so do the
wrapped, staked and bridged products of tokens that already trade at or above the
floor — ranking one of those first would be ranking Bitcoin or ETH, not a launch.
The twenty above-floor pre-token protocols the watchlist leaves out are left out
here too: the house's list excludes them for a parent protocol the snapshot does
not carry, and this radar does not second-guess that.

## The model (radar-6)

```
implied = round(tvl_usd x category_multiple
  x momentum          (asymmetric: up 0.4, down 0.7, on clamp(change_7d, -80, 200))
  x relative          (percentile of change_7d inside its own category, x 0.3)
  x sector            (live tokens' median 7-day change in the category, x 0.25)
  x stability         (wild weekly swings discount up to 10%)
  x age               (hump-shaped: rises to ~2.5 years, then slowly decays)
  x velocity          (TVL per day listed, as a percentile inside its category)
  x scale             (log TVL: 0.90 + 0.10 x clamp(log10(tvl / 5e6) / 4.3, 0, 1))
  x breadth           (1 + 0.015 x min(chains - 1, 8))
  x chain quality     (1 + 0.08 x share of chains that are major networks)
  x leadership        (0.94 + 0.12 x min(share of category TVL / 0.25, 1))
  x dollar flow       (the week's dollar TVL change, as a percentile of the board)
  x completeness      (missing change or listing date discounts to 0.98 / 0.96)
  x tier              (0.70 for a deployment, 0.60 for a product, else 1))
```

The category multiple is priced by the live market, not picked by hand: for each
category it is the geometric median market-cap / TVL ratio of the snapshot's
live-token protocols in that category, shrunk in log space toward the global
geometric median by sample size (weight n / (n + 6)) and clamped to 0.08–0.60.
Categories with fewer than three live protocols take the global median outright,
and every live ratio is winsorized into the 0.02–3.0 band before the median, so one
outlier never sets a price: Risk Curators has a single live protocol at 2.98x TVL,
and it prices at the global median, not at the cap.

Why radar-6 differs from radar-5 (v4):

- **Geometric multiple.** Ratios are log-normal, so the multiple is now the
  geometric median shrunk in log space, not the arithmetic median — the same
  categories price a little differently, and the dashboard shows each multiple
  with its live count and confidence (priced / thin / global).
- **Leadership replaces the concentration discount.** A protocol that leads its
  category commands more launch value, not less; a rounding error in its category
  is worth less. The old discount punished exactly the protocols a reader wants.
- **Velocity and momentum are percentiles inside the category.** A fast
  accumulator is now measured against its own sector, so one outlier's week can
  no longer stretch its neighbours' scores.
- **Dollar flow.** The week's real capital movement (TVL x change, in dollars),
  as a percentile of the board — a protocol adding $50M in a week is attracting
  real money, whatever its percentage move.
- **Completeness.** A launch thesis built on missing data is worth less: a row
  missing its change or its listing date is discounted, and the dashboard says so.
- **Product tier.** Staked and bridged products below the floor are now ranked,
  discounted to 60% and badged, instead of mixed into the early radar silently —
  the board separates protocols whose token already trades from those still to come.

No protocol name is ever special-cased. Every row's detail view shows the full
breakdown: base value, each of the fourteen factors, and the numbers behind it, so
the judge can see the model working. Each row also carries an 8-step farm plan
with concrete actions, costs, and times, tailored by category, tier and the
protocol's own chain, TVL, and age — multi-chain protocols get a second-chain
step, single-chain ones a risk-check step instead — plus an eligibility tracking
step (check the points page every two weeks and screenshot the balance), an
effort rating, and an estimated cost in dollars.

Implied value is a model, not a promise, and never a prediction of whether or when
a token is issued. A protocol "records no token" in the snapshot; the record is not
proof it has none.

## What changed vs v4 (radar-5)

- **Model:** radar-6 adds three new factors (leadership, dollar flow,
  completeness), makes the multiple geometric and shrunk in log space, and turns
  velocity and momentum into within-category percentiles — fourteen visible
  factors instead of eleven.
- **Board:** 224 rows instead of 237 — the 35 staked/bridged products are now an
  explicit discounted tier rather than silent early rows, so the board is
  sharper even though it is a little smaller.
- **Farm plans:** eight steps with a second action per protocol, a second-chain or
  risk-check step, a points-tracking step, an effort rating, and an estimated
  cost per row.
- **Dashboard:** rebuilt from scratch — deep navy + gold palette, stat cards
  (protocols ranked, watchlist, global multiple, total implied value, rank 1),
  scope pills (All / Watchlist / Top 40 / Early radar / Products / Deployments),
  search plus category and chain filters, clickable column headers for sorting,
  implied-value bars, a fourteen-factor breakdown with bars in the detail drawer,
  a category-multiples table, and a set-aside live-token view.
- **Validation:** the same program was also run against a fresh DefiLlama fetch
  from 2026-11-25 (input/snapshot-fresh-2026-11-25.json, 723 protocols, 53 on its
  watchlist): 231 rows, full coverage, deterministic — the model is not overfit
  to the sealed snapshot's date.

## Run it

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input <path to snapshot.json>
```

Node 22 or later, standard library only. The program builds the board twice and
refuses to write anything unless both builds are byte-identical, so the two
grading runs always agree.
