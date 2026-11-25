// Token Radar v5 — the radar-6 value model.
//
// One sealed snapshot of the protocol universe in, one ranked board out. The
// board covers every slug on the snapshot's watchlist (the floor, never the
// ceiling) and adds the early rows the radar exists to find, in four explicit
// tiers:
//
//   watchlist   the 40 protocols the house's rule kept: at least $50M of TVL,
//               no token on record, not a wrapped, staked or bridged product
//               of a token that already trades.
//   early       pre-token protocols below the floor that pass the same visible
//               rule (clean category, clean name, no exchange prefix).
//   product     below-floor pre-token protocols whose category is a staked,
//               bridged or restaked product (Bridge, Canonical Bridge, Liquid
//               Staking, Liquid Restaking, Restaked BTC) with a clean name:
//               their product token already trades, so the launch value is
//               discounted to 60% and the row is badged as a product.
//   deployment  versioned deployments (a V2 or V3) of pre-token protocols,
//               discounted to 70% and badged as a deployment.
//
// Exchanges stay off the board entirely, and so do names carrying a whole
// word wrapped, staked or staking, names starting with an exchange's name,
// and the above-floor pre-token protocols the watchlist leaves out (the house
// excludes them for a parent protocol the snapshot does not carry; this radar
// does not second-guess that). Live-token protocols are set aside with their
// market caps shown, never mixed into the ranking.
//
// Implied value follows only from the snapshot's own figures — TVL, seven-day
// growth, how long the protocol has run with no token, its chains and its
// category — never from a hand-kept list of names. The category multiple is
// priced by the live market: the geometric median market-cap / TVL ratio of
// the snapshot's live-token protocols in the category, shrunk in log space
// toward the global geometric median by sample size. Fourteen factors:
//
//   multiple      the category's live-market price (geometric median, shrunk)
//   momentum      the week's move, asymmetric: up 0.40% per point, down 0.70%
//   relative      the week's percentile inside the protocol's own category
//   sector        the live tokens' median week in the category
//   stability     wild weekly swings discount up to 10%
//   age           hump-shaped: credibility peaks near 2.5 years, then decays
//   velocity      TVL per day listed, as a percentile inside the category
//   scale         log TVL, so size itself is worth a little more
//   breadth       one chain more is worth a little more, up to eight
//   chain quality the share of the protocol's chains that are major networks
//   leadership    the protocol's share of its category's TVL, up to a cap
//   dollar flow   the week's dollar TVL change, as a percentile of the board
//   completeness  missing change or listing date is worth a little less
//   tier          0.70 for a deployment, 0.60 for a product, else 1.00
//
// radar-6 differs from v4's radar-5 in six places: the multiple is a
// geometric median shrunk in log space instead of an arithmetic median;
// leadership replaces the concentration discount (a category leader is worth
// more, not less); velocity and momentum are percentiles inside the category
// instead of absolute numbers; dollar flow adds the week's real capital
// movement, not just its percentage; completeness prices missing data; and
// the board gains an explicit product tier so staked and bridged products are
// ranked, discounted and badged instead of mixed in silently.

/** The snapshot's protocol entry: exactly the ten fields the sealed input carries. */
export interface SnapshotProtocol {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  gecko_id: string | null;
  symbol: string | null;
}

/** The whole snapshot document. */
export interface Snapshot {
  as_of: string;
  source: string;
  floor_usd: number;
  protocols: SnapshotProtocol[];
  watchlist: string[];
}

/** One factor of the value breakdown the dashboard draws. */
export interface FactorEntry {
  key: string;
  label: string;
  factor: number;
  note: string;
  /** The base row's dollar value; only the base entry carries one. */
  value?: number;
}

/** The radar-6 constants, as the dashboard states them. */
export interface Radar6Constants {
  multiple_shrink_prior: number;
  multiple_floor: number;
  multiple_cap: number;
  multiple_winsor_low: number;
  multiple_winsor_high: number;
  min_live_for_category: number;
  momentum_up: number;
  momentum_down: number;
  momentum_floor: number;
  momentum_cap: number;
  relative_low: number;
  relative_span: number;
  sector_weight: number;
  sector_floor: number;
  sector_cap: number;
  stability_knee: number;
  stability_span: number;
  stability_weight: number;
  age_peak_days: number;
  age_young_width: number;
  age_old_width: number;
  age_floor: number;
  age_range: number;
  age_young_cap: number;
  age_young_days: number;
  age_unknown: number;
  velocity_low: number;
  velocity_span: number;
  scale_low: number;
  scale_span: number;
  scale_ref_usd: number;
  scale_decades: number;
  breadth_per_chain: number;
  breadth_max_extra: number;
  chain_quality_weight: number;
  leadership_low: number;
  leadership_span: number;
  leadership_share_ref: number;
  dollar_flow_low: number;
  dollar_flow_span: number;
  completeness_one_missing: number;
  completeness_both_missing: number;
  tier_deployment: number;
  tier_product: number;
}

export const MODEL: Radar6Constants = {
  multiple_shrink_prior: 6,
  multiple_floor: 0.08,
  multiple_cap: 0.6,
  multiple_winsor_low: 0.02,
  multiple_winsor_high: 3.0,
  min_live_for_category: 3,
  momentum_up: 0.004,
  momentum_down: 0.007,
  momentum_floor: -80,
  momentum_cap: 200,
  relative_low: 0.88,
  relative_span: 0.24,
  sector_weight: 0.0025,
  sector_floor: -40,
  sector_cap: 60,
  stability_knee: 25,
  stability_span: 75,
  stability_weight: 0.1,
  age_peak_days: 912,
  age_young_width: 1.2,
  age_old_width: 2.5,
  age_floor: 0.8,
  age_range: 0.2,
  age_young_cap: 0.85,
  age_young_days: 90,
  age_unknown: 0.95,
  velocity_low: 0.92,
  velocity_span: 0.16,
  scale_low: 0.9,
  scale_span: 0.1,
  scale_ref_usd: 5_000_000,
  scale_decades: 4.3,
  breadth_per_chain: 0.015,
  breadth_max_extra: 8,
  chain_quality_weight: 0.08,
  leadership_low: 0.94,
  leadership_span: 0.12,
  leadership_share_ref: 0.25,
  dollar_flow_low: 0.95,
  dollar_flow_span: 0.1,
  completeness_one_missing: 0.98,
  completeness_both_missing: 0.96,
  tier_deployment: 0.7,
  tier_product: 0.6,
};

/** The model's version label: the dashboard names it. */
export const MODEL_VERSION = 'radar-6';

/** How many live-token protocols the dashboard's set-aside view carries, by market cap. */
export const LIVE_ROWS = 24;

/** The four tiers of the board. */
export type Tier = 'watchlist' | 'early' | 'product' | 'deployment';

/** Categories the house's watchlist rule keeps out: a staked, bridged or exchange product. */
const EXCLUDED_CATEGORIES = new Set([
  'Bridge',
  'Canonical Bridge',
  'Liquid Staking',
  'Liquid Restaking',
  'Restaked BTC',
  'CEX',
]);

/** Categories that are a staked or bridged product: ranked, discounted, badged. */
const PRODUCT_CATEGORIES = new Set([
  'Bridge',
  'Canonical Bridge',
  'Liquid Staking',
  'Liquid Restaking',
  'Restaked BTC',
]);

/** Exchange names the watchlist rule keeps off the board. */
const EXCHANGE_PREFIXES = ['Binance', 'Coinbase', 'Bybit', 'Kraken', 'Bitget', 'OKX', 'Bitfinex', 'Gemini'];

/** Chains farmers already use: a launch stranded elsewhere is worth less. */
const MAJOR_CHAINS = new Set([
  'Ethereum', 'Solana', 'Base', 'Arbitrum', 'Optimism', 'Polygon', 'Avalanche',
  'BSC', 'BNB Chain', 'Sui', 'Aptos', 'Hyperliquid', 'Sei', 'TON', 'Near',
  'Tron', 'Berachain', 'Sonic', 'Unichain', 'World Chain', 'Gnosis', 'Linea',
  'Scroll', 'ZkSync Era', 'Mantle', 'Blast', 'Mode', 'Fantom', 'Cronos', 'Kava', 'Celo', 'Starknet',
]);

/** A name ending in a version marker is a deployment of another protocol. */
const VERSIONED = /\s(V\d+(\.\d+)?|v\d+(\.\d+)?|\d+\.\d+)$/;

/** A whole word wrapped, staked or staking marks a product of a traded token. */
const WRAPPED_WORD = /\b(wrapped|staked|staking)\b/i;

const DAY_MS = 86_400_000;

/** Round to four decimals for the breakdown the dashboard shows. */
export const round4 = (n: number): number => Math.round(n * 1e4) / 1e4;

/** A finite number, else `fallback`. */
function finite(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Clamp `n` into [`lo`, `hi`]. */
function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** A whole day count from `from` to `to`, clamped at zero; null when either date is absent or bad. */
export function ageDays(asOf: string, listedAt: string | null): number | null {
  if (listedAt === null) return null;
  const a = Date.parse(`${asOf}T00:00:00Z`);
  const b = Date.parse(`${listedAt}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.max(0, Math.floor((a - b) / DAY_MS));
}

/** The median of a sorted ascending array, or null when it is empty. */
function medianOf(sorted: number[]): number | null {
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]!
    : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** The percentile rank of `x` in a sorted ascending array: 0 when smallest, 1 when largest. */
function percentileOf(sorted: number[], x: number): number {
  if (sorted.length === 0) return 0.5;
  let below = 0;
  let equal = 0;
  for (const v of sorted) {
    if (v < x) below++;
    else if (v === x) equal++;
  }
  return (below + 0.5 * equal) / sorted.length;
}

/** Why the snapshot is not one this model can score. */
export class SnapshotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SnapshotError';
  }
}

/** Whether a protocol records no token at all. */
export function isPreToken(p: SnapshotProtocol): boolean {
  return p.mcap_usd === null && p.gecko_id === null && p.symbol === null;
}

/** Whether the name is clean of version markers, wrapped/staked words and exchange prefixes. */
function nameIsClean(p: SnapshotProtocol): boolean {
  if (VERSIONED.test(p.name)) return false;
  if (WRAPPED_WORD.test(p.name)) return false;
  return !EXCHANGE_PREFIXES.some((prefix) => p.name.startsWith(prefix));
}

/** Which tier a pre-token protocol belongs to, or null when the board never ranks it. */
export function tierOf(p: SnapshotProtocol, watchlist: Set<string>, floorUsd: number): Tier | null {
  if (!isPreToken(p)) return null;
  if (VERSIONED.test(p.name)) return 'deployment';
  if (watchlist.has(p.slug)) return 'watchlist';
  if (p.tvl_usd >= floorUsd) return null;
  if (p.category === 'CEX') return null;
  if (!nameIsClean(p)) return null;
  if (p.category !== null && PRODUCT_CATEGORIES.has(p.category)) return 'product';
  if (p.category !== null && EXCLUDED_CATEGORIES.has(p.category)) return null;
  return 'early';
}

/** A category's live-market multiple, with its live count and the global fallback. */
export interface CategoryMultiple {
  category: string;
  multiple: number;
  live_count: number;
  confidence: 'priced' | 'thin' | 'global';
}

/** Everything the model precomputes from the snapshot before scoring a row. */
export interface ModelContext {
  asOf: string;
  multiples: Map<string, CategoryMultiple>;
  globalMultiple: number;
  categoryTvl: Map<string, number>;
  sectorMedian: Map<string, number>;
  changeByCategory: Map<string, number[]>;
  changeGlobal: number[];
  velocityByCategory: Map<string, number[]>;
  velocityGlobal: number[];
  dollarFlowSorted: number[];
  liveByCategory: Map<string, number>;
}

/** Build the model's context: multiples, category totals, sector medians, peer distributions. */
export function buildContext(snapshot: Snapshot): ModelContext {
  const live = snapshot.protocols.filter((p) => !isPreToken(p));
  const ratios: number[] = [];
  const byCategory = new Map<string, number[]>();
  for (const p of live) {
    if (p.mcap_usd === null || p.mcap_usd <= 0 || p.tvl_usd <= 0) continue;
    const r = clamp(p.mcap_usd / p.tvl_usd, MODEL.multiple_winsor_low, MODEL.multiple_winsor_high);
    ratios.push(Math.log(r));
    const list = byCategory.get(p.category ?? 'Uncategorised') ?? [];
    list.push(Math.log(r));
    byCategory.set(p.category ?? 'Uncategorised', list);
  }
  ratios.sort((a, b) => a - b);
  const globalLog = medianOf(ratios) ?? Math.log(0.2);
  const globalMultiple = clamp(Math.exp(globalLog), MODEL.multiple_floor, MODEL.multiple_cap);

  const multiples = new Map<string, CategoryMultiple>();
  for (const [category, logs] of byCategory) {
    const sorted = [...logs].sort((a, b) => a - b);
    const catLog = medianOf(sorted) ?? globalLog;
    const n = sorted.length;
    let multiple: number;
    let confidence: CategoryMultiple['confidence'];
    if (n < MODEL.min_live_for_category) {
      multiple = globalMultiple;
      confidence = 'global';
    } else {
      const shrunk = (n * catLog + MODEL.multiple_shrink_prior * globalLog) / (n + MODEL.multiple_shrink_prior);
      multiple = clamp(Math.exp(shrunk), MODEL.multiple_floor, MODEL.multiple_cap);
      confidence = n >= 8 ? 'priced' : 'thin';
    }
    multiples.set(category, { category, multiple: round4(multiple), live_count: n, confidence });
  }

  const categoryTvl = new Map<string, number>();
  for (const p of snapshot.protocols) {
    const key = p.category ?? 'Uncategorised';
    categoryTvl.set(key, (categoryTvl.get(key) ?? 0) + p.tvl_usd);
  }

  const sectorByCategory = new Map<string, number[]>();
  for (const p of live) {
    if (p.change_7d === null) continue;
    const list = sectorByCategory.get(p.category ?? 'Uncategorised') ?? [];
    list.push(p.change_7d);
    sectorByCategory.set(p.category ?? 'Uncategorised', list);
  }
  const sectorMedian = new Map<string, number>();
  for (const [category, values] of sectorByCategory) {
    const m = medianOf([...values].sort((a, b) => a - b));
    if (m !== null) sectorMedian.set(category, m);
  }

  const watchlist = new Set(snapshot.watchlist);
  const eligible = snapshot.protocols.filter((p) => tierOf(p, watchlist, snapshot.floor_usd) !== null);
  const changeByCategory = new Map<string, number[]>();
  const changeGlobal: number[] = [];
  const velocityByCategory = new Map<string, number[]>();
  const velocityGlobal: number[] = [];
  const dollarFlow: number[] = [];
  for (const p of eligible) {
    const key = p.category ?? 'Uncategorised';
    if (p.change_7d !== null) {
      changeGlobal.push(p.change_7d);
      const list = changeByCategory.get(key) ?? [];
      list.push(p.change_7d);
      changeByCategory.set(key, list);
      dollarFlow.push((p.tvl_usd * p.change_7d) / 100);
    } else {
      dollarFlow.push(0);
    }
    const age = ageDays(snapshot.as_of, p.listed_at);
    if (age !== null) {
      const velocity = p.tvl_usd / Math.max(age, 1);
      velocityGlobal.push(velocity);
      const list = velocityByCategory.get(key) ?? [];
      list.push(velocity);
      velocityByCategory.set(key, list);
    }
  }
  changeGlobal.sort((a, b) => a - b);
  velocityGlobal.sort((a, b) => a - b);
  dollarFlow.sort((a, b) => a - b);
  for (const list of changeByCategory.values()) list.sort((a, b) => a - b);
  for (const list of velocityByCategory.values()) list.sort((a, b) => a - b);

  const liveByCategory = new Map<string, number>();
  for (const p of live) {
    const key = p.category ?? 'Uncategorised';
    liveByCategory.set(key, (liveByCategory.get(key) ?? 0) + 1);
  }

  return {
    asOf: snapshot.as_of,
    multiples,
    globalMultiple,
    categoryTvl,
    sectorMedian,
    changeByCategory,
    changeGlobal,
    velocityByCategory,
    velocityGlobal,
    dollarFlowSorted: dollarFlow,
    liveByCategory,
  };
}

/** The multiple a protocol's category prices at, with its confidence. */
function multipleFor(ctx: ModelContext, p: SnapshotProtocol): CategoryMultiple {
  const key = p.category ?? 'Uncategorised';
  return ctx.multiples.get(key) ?? {
    category: key,
    multiple: ctx.globalMultiple,
    live_count: 0,
    confidence: 'global',
  };
}

/** A farm step: the action, what it costs, and how long it takes. */
export interface FarmStep {
  text: string;
  cost: string;
  time: string;
}

/** One row of board.json: the ranked board's row. */
export interface BoardRow {
  rank: number;
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  gecko_id: string | null;
  symbol: string | null;
  token_status: 'pre-token';
  tier: Tier;
  age_days: number | null;
  implied_value_usd: number;
  model: {
    category_multiple: number;
    multiple_confidence: string;
    live_in_category: number;
    growth_pct: number;
    momentum: number;
    relative_momentum: number;
    sector_heat: number;
    stability: number;
    age_multiplier: number;
    velocity: number;
    scale: number;
    breadth: number;
    chain_quality: number;
    leadership: number;
    dollar_flow: number;
    completeness: number;
    tier_factor: number;
  };
  value_breakdown: FactorEntry[];
  farm_steps: string[];
  effort: 'Low' | 'Medium' | 'High';
  est_cost_usd: number;
}

/** The dashboard's compact view of one row. */
export interface RadarRow extends BoardRow {}

/** A live-token protocol: it already trades, so the board shows the market's own value, not a model's. */
export interface LiveRow {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  mcap_usd: number | null;
  change_7d: number | null;
}

/** Everything the dashboard needs: the board, the live set, and the model it runs. */
export interface RadarData {
  as_of: string;
  source: string;
  floor_usd: number;
  model: Radar6Constants;
  model_version: string;
  watchlist_size: number;
  board_size: number;
  tier_sizes: Record<Tier, number>;
  live_size: number;
  global_multiple: number;
  multiples: CategoryMultiple[];
  rows: RadarRow[];
  live: LiveRow[];
}

/** The fourteen multipliers and the implied value one protocol gets under radar-6. */
export function scoreProtocol(
  p: SnapshotProtocol,
  tier: Tier,
  ctx: ModelContext,
): { implied: number; age: number | null; breakdown: FactorEntry[]; model: BoardRow['model'] } {
  const m = MODEL;
  const age = ageDays(ctx.asOf, p.listed_at);
  const mult = multipleFor(ctx, p);
  const base = p.tvl_usd * mult.multiple;
  const breakdown: FactorEntry[] = [];
  breakdown.push({
    key: 'base',
    label: 'Base value (TVL x category multiple)',
    factor: mult.multiple,
    note: `TVL $${p.tvl_usd.toLocaleString('en-US')} x ${mult.multiple} (${mult.category}, ${mult.live_count} live priced, ${mult.confidence})`,
    value: Math.round(base),
  });

  const rawChange = p.change_7d === null ? 0 : clamp(p.change_7d, m.momentum_floor, m.momentum_cap);
  const momentum = rawChange >= 0 ? 1 + rawChange * m.momentum_up : 1 + rawChange * m.momentum_down;
  breakdown.push({
    key: 'momentum',
    label: '7-day momentum',
    factor: round4(momentum),
    note: p.change_7d === null ? 'No 7-day change reported: no momentum signal' : `TVL ${rawChange >= 0 ? '+' : ''}${rawChange.toFixed(2)}% in 7 days (asymmetric: up ${m.momentum_up}, down ${m.momentum_down})`,
  });

  const catKey = p.category ?? 'Uncategorised';
  const peers = ctx.changeByCategory.get(catKey) ?? [];
  const peerList = peers.length >= 3 ? peers : ctx.changeGlobal;
  const relPct = p.change_7d === null ? 0.5 : percentileOf(peerList, p.change_7d);
  const relative = m.relative_low + m.relative_span * relPct;
  breakdown.push({
    key: 'relative',
    label: 'Momentum vs its category',
    factor: round4(relative),
    note: p.change_7d === null ? 'No change reported: ranked at the category median' : `Its week sits at the ${(relPct * 100).toFixed(0)}th percentile of ${peerList.length} peers in ${catKey}`,
  });

  const sector = ctx.sectorMedian.get(catKey);
  const sectorClamped = sector === undefined ? 0 : clamp(sector, m.sector_floor, m.sector_cap);
  const sectorFactor = 1 + sectorClamped * m.sector_weight;
  breakdown.push({
    key: 'sector',
    label: 'Sector heat (live tokens)',
    factor: round4(sectorFactor),
    note: sector === undefined ? `No live-token week to read in ${catKey}: sector neutral` : `Live tokens in ${catKey} moved ${sector >= 0 ? '+' : ''}${sector.toFixed(2)}% median in 7 days`,
  });

  const absChange = p.change_7d === null ? 0 : Math.abs(p.change_7d);
  const stability = 1 - m.stability_weight * clamp((absChange - m.stability_knee) / m.stability_span, 0, 1);
  breakdown.push({
    key: 'stability',
    label: 'Stability (wild weeks discount)',
    factor: round4(stability),
    note: p.change_7d === null ? 'No change reported: no stability discount' : `A ${absChange.toFixed(2)}% weekly swing discounts up to ${(m.stability_weight * 100).toFixed(0)}%`,
  });

  let ageFactor: number;
  let ageNote: string;
  if (age === null) {
    ageFactor = m.age_unknown;
    ageNote = 'No listing date reported: priced at the unknown-age factor';
  } else if (age <= m.age_young_days) {
    const x = Math.log(Math.max(age, 1) / m.age_peak_days);
    ageFactor = Math.min(m.age_floor + m.age_range * Math.exp(-(x * x) / m.age_young_width), m.age_young_cap);
    ageNote = `Listed ${age} days ago: unproven launches start lower until they have run a while`;
  } else {
    const x = Math.log(age / m.age_peak_days);
    const width = x < 0 ? m.age_young_width : m.age_old_width;
    ageFactor = m.age_floor + m.age_range * Math.exp(-(x * x) / width);
    ageNote = `Listed ${age} days ago: credibility peaks near ${m.age_peak_days / 365} years, then decays slowly`;
  }
  breakdown.push({ key: 'age', label: 'Age (credibility curve)', factor: round4(ageFactor), note: ageNote });

  const vPeers = ctx.velocityByCategory.get(catKey) ?? [];
  const vList = vPeers.length >= 3 ? vPeers : ctx.velocityGlobal;
  let velocity = 1;
  let velocityNote = 'No listing date reported: velocity neutral';
  if (age !== null) {
    const v = p.tvl_usd / Math.max(age, 1);
    const vpct = percentileOf(vList, v);
    velocity = m.velocity_low + m.velocity_span * vpct;
    velocityNote = `$${Math.round(v).toLocaleString('en-US')} of TVL per day listed, ${(vpct * 100).toFixed(0)}th percentile of ${vList.length} peers in ${catKey}`;
  }
  breakdown.push({ key: 'velocity', label: 'TVL velocity vs its category', factor: round4(velocity), note: velocityNote });

  const scale = m.scale_low + m.scale_span * clamp(Math.log10(p.tvl_usd / m.scale_ref_usd) / m.scale_decades, 0, 1);
  breakdown.push({
    key: 'scale',
    label: 'Scale (log TVL)',
    factor: round4(scale),
    note: `TVL $${p.tvl_usd.toLocaleString('en-US')} on a log scale against the $5M floor`,
  });

  const breadth = 1 + m.breadth_per_chain * Math.min(Math.max(p.chains.length - 1, 0), m.breadth_max_extra);
  breakdown.push({
    key: 'breadth',
    label: 'Chain breadth',
    factor: round4(breadth),
    note: `${p.chains.length} chain${p.chains.length === 1 ? '' : 's'}: ${p.chains.slice(0, 4).join(', ')}${p.chains.length > 4 ? ` and ${p.chains.length - 4} more` : ''}`,
  });

  const majorCount = p.chains.filter((c) => MAJOR_CHAINS.has(c)).length;
  const chainQuality = 1 + m.chain_quality_weight * (p.chains.length > 0 ? majorCount / p.chains.length : 0);
  breakdown.push({
    key: 'chain_quality',
    label: 'Chain quality',
    factor: round4(chainQuality),
    note: `${majorCount} of ${p.chains.length} chain${p.chains.length === 1 ? '' : 's'} are major networks farmers already use`,
  });

  const catTvl = ctx.categoryTvl.get(catKey) ?? p.tvl_usd;
  const share = catTvl > 0 ? p.tvl_usd / catTvl : 0;
  const leadership = m.leadership_low + m.leadership_span * Math.min(share / m.leadership_share_ref, 1);
  breakdown.push({
    key: 'leadership',
    label: 'Category leadership',
    factor: round4(leadership),
    note: `Holds ${(share * 100).toFixed(1)}% of ${catKey}'s $${Math.round(catTvl).toLocaleString('en-US')} TVL: a category leader commands more launch value`,
  });

  const flow = p.change_7d === null ? 0 : (p.tvl_usd * p.change_7d) / 100;
  const flowPct = percentileOf(ctx.dollarFlowSorted, flow);
  const dollarFlow = m.dollar_flow_low + m.dollar_flow_span * flowPct;
  breakdown.push({
    key: 'dollar_flow',
    label: 'Dollar flow (real capital moved)',
    factor: round4(dollarFlow),
    note: p.change_7d === null ? 'No change reported: dollar flow neutral' : `${flow >= 0 ? '+' : '−'}$${Math.abs(Math.round(flow)).toLocaleString('en-US')} of TVL moved in 7 days, ${(flowPct * 100).toFixed(0)}th percentile of the board`,
  });

  const missing = (p.change_7d === null ? 1 : 0) + (p.listed_at === null ? 1 : 0);
  const completeness = missing === 0 ? 1 : missing === 1 ? m.completeness_one_missing : m.completeness_both_missing;
  breakdown.push({
    key: 'completeness',
    label: 'Data completeness',
    factor: round4(completeness),
    note: missing === 0 ? 'Change and listing date both reported' : `${missing} of the two dated figures missing: a thesis on missing data is worth less`,
  });

  const tierFactor = tier === 'deployment' ? m.tier_deployment : tier === 'product' ? m.tier_product : 1;
  breakdown.push({
    key: 'tier',
    label: tier === 'deployment' ? 'Deployment discount' : tier === 'product' ? 'Product discount' : 'Tier (full weight)',
    factor: round4(tierFactor),
    note:
      tier === 'deployment'
        ? 'A versioned deployment of a pre-token protocol: farm the deployment itself, at 70%'
        : tier === 'product'
          ? 'A staked or bridged product whose underlying token already trades: the launch is the product, at 60%'
          : 'A standalone pre-token protocol at full weight',
  });

  const product = breakdown.slice(1).reduce((acc, f) => acc * f.factor, 1);
  const implied = Math.max(1, Math.round(base * product));

  return {
    implied,
    age,
    breakdown,
    model: {
      category_multiple: mult.multiple,
      multiple_confidence: mult.confidence,
      live_in_category: mult.live_count,
      growth_pct: p.change_7d === null ? 0 : round4(clamp(p.change_7d, MODEL.momentum_floor, MODEL.momentum_cap)),
      momentum: round4(momentum),
      relative_momentum: round4(relative),
      sector_heat: round4(sectorFactor),
      stability: round4(stability),
      age_multiplier: round4(ageFactor),
      velocity: round4(velocity),
      scale: round4(scale),
      breadth: round4(breadth),
      chain_quality: round4(chainQuality),
      leadership: round4(leadership),
      dollar_flow: round4(dollarFlow),
      completeness: round4(completeness),
      tier_factor: round4(tierFactor),
    },
  };
}

/** The first chain a protocol names, or a neutral phrase. */
function chainOf(p: SnapshotProtocol): string {
  return p.chains.length > 0 ? p.chains[0]! : 'its main chain';
}

/** How much capital one farm position needs, from the protocol's own TVL. */
function capitalFor(p: SnapshotProtocol): number {
  if (p.tvl_usd >= 5_000_000_000) return 250;
  if (p.tvl_usd >= 1_000_000_000) return 150;
  if (p.tvl_usd >= 100_000_000) return 100;
  return 50;
}

/** How long to hold, from the protocol's age: younger protocols get a longer qualifying window. */
function holdDaysFor(age: number | null): number {
  if (age === null) return 30;
  if (age < 180) return 60;
  if (age < 365) return 45;
  return 30;
}

/** Gas for a season of farming, from the primary chain: Ethereum costs more than the L2s. */
function gasFor(chain: string): number {
  if (chain === 'Ethereum') return 60;
  if (['Solana', 'Base', 'Arbitrum', 'Optimism', 'Polygon', 'Sui', 'Aptos', 'BSC'].includes(chain)) return 15;
  return 25;
}

/** The category's first action, in words a farmer can follow. */
function actionFor(p: SnapshotProtocol, capital: number, chain: string, tier: Tier): string {
  const c = (p.category ?? '').toLowerCase();
  const name = p.name;
  const deploy = tier === 'deployment' ? ` Use the versioned deployment itself, not the protocol's main app.` : '';
  const prod = tier === 'product' ? ` This farms the product's own points, not a new token.` : '';
  if (c.includes('lend') || c.includes('cdp') || c.includes('collateral')) return `Supply $${capital} of USDC to ${name} on ${chain} and keep the position open.${deploy}${prod}`;
  if (c.includes('dex') || c.includes('leveraged farm')) return `Provide $${capital} of liquidity to ${name}'s main pool on ${chain} and keep the position open.${deploy}${prod}`;
  if (c.includes('yield') || c.includes('vault') || c.includes('curator') || c.includes('allocator')) return `Deposit $${capital} into a ${name} vault on ${chain} and hold the vault shares.${deploy}${prod}`;
  if (c.includes('bridge')) return `Bridge $${capital} of USDC to ${chain} through ${name} and put the bridged funds to work in its app.${deploy}${prod}`;
  if (c.includes('staking') || c.includes('restak')) return `Stake $${capital} of the chain's staking asset through ${name} and keep the receipt token.${deploy}${prod}`;
  if (c.includes('perpetual') || c.includes('derivative') || c.includes('options')) return `Deposit $${capital} of USDC as margin on ${name} and open one small hedged position.${deploy}${prod}`;
  if (c.includes('prediction')) return `Fund $${capital} on ${name} and take one small position in a live market.${deploy}${prod}`;
  if (c.includes('rwa')) return `Mint $${capital} of ${name}'s yield-bearing asset on ${chain} and hold it.${deploy}${prod}`;
  if (c.includes('stable')) return `Mint or deposit $${capital} of the stable asset through ${name} on ${chain}.${deploy}${prod}`;
  if (c.includes('insurance')) return `Buy $${capital} of cover from ${name} on ${chain} and keep the policy live.${deploy}${prod}`;
  if (c.includes('chain')) return `Bridge $${capital} of USDC to ${name}'s chain and use it in one of the chain's own apps.${deploy}${prod}`;
  return `Deposit $${capital} of USDC into ${name} on ${chain} and keep the position open.${deploy}${prod}`;
}

/** The category's second action: depth, not a repeat of the first. */
function secondActionFor(p: SnapshotProtocol, capital: number, chain: string): string {
  const c = (p.category ?? '').toLowerCase();
  const name = p.name;
  if (c.includes('lend') || c.includes('cdp')) return `Borrow $${Math.round(capital / 2)} against the deposit on ${name} and repay half of it within a week, so the position shows both sides of the market.`;
  if (c.includes('dex') || c.includes('leveraged farm')) return `Swap $${Math.round(capital / 2)} through ${name}'s router on ${chain} and add the proceeds to a second pool, so the wallet shows swaps as well as liquidity.`;
  if (c.includes('yield') || c.includes('vault') || c.includes('curator') || c.includes('allocator')) return `Move $${Math.round(capital / 2)} into a second ${name} vault with a different strategy, so the wallet holds two vault positions.`;
  if (c.includes('bridge')) return `Bridge $${Math.round(capital / 2)} back to the chain you started from through ${name}, so the wallet shows a round trip.`;
  if (c.includes('staking') || c.includes('restak')) return `Restake or delegate a second $${Math.round(capital / 2)} through ${name} to a different validator or operator.`;
  if (c.includes('perpetual') || c.includes('derivative') || c.includes('options')) return `Close the first position on ${name} and open a second one in the opposite direction with $${Math.round(capital / 2)} of margin.`;
  if (c.includes('rwa') || c.includes('stable')) return `Redeem $${Math.round(capital / 2)} of the asset and mint it again a week later, so the wallet shows a full mint-and-redeem cycle.`;
  return `Make a second, different interaction with ${name} on ${chain} worth about $${Math.round(capital / 2)}, such as a swap, a vote or a second deposit.`;
}

/**
 * A protocol's farm plan: eight steps, each an action with a cost and a time.
 * Every step is derived from the protocol's own record (category, tier, chains,
 * TVL, age), never from a hand-written list of names.
 */
export function farmSteps(p: SnapshotProtocol, age: number | null, tier: Tier): FarmStep[] {
  const chain = chainOf(p);
  const capital = capitalFor(p);
  const hold = holdDaysFor(age);
  const gas = gasFor(chain);
  const secondChain = p.chains.length > 1 ? p.chains[1]! : null;
  const steps: FarmStep[] = [
    {
      text: `Use a fresh wallet that holds only the funds you plan to farm with, write its seed phrase on paper, and never paste the phrase into any site or chat.`,
      cost: 'nothing but the wallet',
      time: '5 minutes',
    },
    {
      text: actionFor(p, capital, chain, tier),
      cost: `$${capital} of capital and about $${Math.max(2, Math.round(gas / 4))} of gas`,
      time: '15 minutes to set up',
    },
    {
      text: secondActionFor(p, capital, chain),
      cost: `about $${Math.max(2, Math.round(gas / 4))} of gas`,
      time: '15 minutes',
    },
    {
      text: `Do one qualifying action each week on ${p.name}, such as a deposit, a borrow, a swap or a vote, and keep the position open for at least ${hold} days so the activity is counted in more than one snapshot.`,
      cost: `about $${Math.max(2, Math.round(gas / 6))} of gas a week`,
      time: '10 minutes a week',
    },
    secondChain === null
      ? {
          text: `${p.name} runs on ${chain} only, so check its docs and audit reports before you add size, and verify every contract address against the docs, never against a link in a chat.`,
          cost: 'nothing to read',
          time: '20 minutes',
        }
      : {
          text: `Repeat the first deposit on ${secondChain} with $${Math.round(capital / 2)} so the wallet is active on a second chain, and keep both positions open.`,
          cost: `$${Math.round(capital / 2)} of capital and about $${Math.max(2, Math.round(gas / 4))} of gas`,
          time: '20 minutes',
        },
    {
      text: `Open ${p.name}'s own points or rewards page every two weeks, screenshot the balance, and claim only from the link the protocol itself publishes.`,
      cost: 'no fee to check, and never pay to claim',
      time: '10 minutes every two weeks',
    },
    {
      text: `Read ${p.name}'s docs and announcements from its own site, join its official community, and vote if a governance proposal opens.`,
      cost: 'nothing',
      time: '15 minutes a week',
    },
    {
      text: `When you unwind, withdraw in two steps a week apart and keep the farm log, and never send funds to an address from a direct message: the protocol never asks for your seed phrase.`,
      cost: `about $${Math.max(2, Math.round(gas / 4))} of gas to exit`,
      time: '10 minutes to unwind',
    },
  ];
  return steps;
}

/** A step as one string: its action, then its cost and time, within the gate's 20..600 characters. */
export function stepText(step: FarmStep): string {
  let s = `${step.text} Cost: ${step.cost}. Time: ${step.time}.`;
  if (s.length > 600) s = `${s.slice(0, 596)}...`;
  if (s.length < 20) s = `${s} Hold the position and check the protocol's own page.`;
  return s;
}

/** The effort a farm plan takes, from its capital and its chains. */
function effortFor(p: SnapshotProtocol, capital: number): 'Low' | 'Medium' | 'High' {
  if (capital >= 250) return 'High';
  if (capital >= 150 || p.chains.length >= 3) return 'Medium';
  return 'Low';
}

/** The protocols the board ranks, strongest first, with ranks 1..n. */
export function buildBoard(snapshot: Snapshot): BoardRow[] {
  const ctx = buildContext(snapshot);
  const watchlist = new Set(snapshot.watchlist);
  const chosen = new Map<string, { p: SnapshotProtocol; tier: Tier }>();
  for (const slug of snapshot.watchlist) {
    const p = snapshot.protocols.find((q) => q.slug === slug);
    if (p !== undefined && isPreToken(p)) chosen.set(slug, { p, tier: 'watchlist' });
  }
  for (const p of snapshot.protocols) {
    if (chosen.has(p.slug)) continue;
    const tier = tierOf(p, watchlist, snapshot.floor_usd);
    if (tier !== null) chosen.set(p.slug, { p, tier });
  }
  const scored = [...chosen.values()].map(({ p, tier }) => {
    const { implied, age, breakdown, model } = scoreProtocol(p, tier, ctx);
    const capital = capitalFor(p);
    const gas = gasFor(chainOf(p));
    return { p, tier, implied, age, breakdown, model, capital, gas };
  });
  scored.sort(
    (a, b) =>
      b.implied - a.implied ||
      b.p.tvl_usd - a.p.tvl_usd ||
      (a.p.slug < b.p.slug ? -1 : a.p.slug > b.p.slug ? 1 : 0),
  );
  return scored.map((s, i) => ({
    rank: i + 1,
    slug: s.p.slug,
    name: s.p.name,
    category: s.p.category,
    chains: s.p.chains,
    tvl_usd: s.p.tvl_usd,
    change_7d: s.p.change_7d,
    mcap_usd: s.p.mcap_usd,
    listed_at: s.p.listed_at,
    gecko_id: s.p.gecko_id,
    symbol: s.p.symbol,
    token_status: 'pre-token',
    tier: s.tier,
    age_days: s.age,
    implied_value_usd: s.implied,
    model: s.model,
    value_breakdown: s.breakdown,
    farm_steps: farmSteps(s.p, s.age, s.tier).map(stepText),
    effort: effortFor(s.p, s.capital),
    est_cost_usd: s.capital + s.gas,
  }));
}

/** The live-token protocols, by market cap, for the dashboard's set-aside view. */
export function liveRows(snapshot: Snapshot): LiveRow[] {
  return snapshot.protocols
    .filter((p) => !isPreToken(p) && p.category !== 'CEX')
    .sort((a, b) => (b.mcap_usd ?? 0) - (a.mcap_usd ?? 0) || b.tvl_usd - a.tvl_usd)
    .slice(0, LIVE_ROWS)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.category,
      chains: p.chains,
      tvl_usd: p.tvl_usd,
      mcap_usd: p.mcap_usd,
      change_7d: p.change_7d,
    }));
}

/** Everything the dashboard renders, from the snapshot. */
export function buildRadar(snapshot: Snapshot): { board: BoardRow[]; radar: RadarData } {
  const board = buildBoard(snapshot);
  const ctx = buildContext(snapshot);
  const live = liveRows(snapshot);
  const tierSizes: Record<Tier, number> = { watchlist: 0, early: 0, product: 0, deployment: 0 };
  for (const r of board) tierSizes[r.tier]++;
  const multiples = [...ctx.multiples.values()].sort((a, b) => b.multiple - a.multiple || (a.category < b.category ? -1 : 1));
  const radar: RadarData = {
    as_of: snapshot.as_of,
    source: snapshot.source,
    floor_usd: snapshot.floor_usd,
    model: MODEL,
    model_version: MODEL_VERSION,
    watchlist_size: snapshot.watchlist.length,
    board_size: board.length,
    tier_sizes: tierSizes,
    live_size: live.length,
    global_multiple: round4(ctx.globalMultiple),
    multiples,
    rows: board,
    live,
  };
  return { board, radar };
}

/** The snapshot out of a file's text, refused unless it is the shape the model scores. */
export function parseSnapshot(text: string): Snapshot {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new SnapshotError('snapshot.json is not JSON');
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new SnapshotError('snapshot.json is not a JSON object');
  const o = raw as Record<string, unknown>;
  if (typeof o.as_of !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(o.as_of)) throw new SnapshotError('snapshot.json has no as_of date');
  if (typeof o.source !== 'string') throw new SnapshotError('snapshot.json has no source');
  if (typeof o.floor_usd !== 'number' || !Number.isSafeInteger(o.floor_usd) || o.floor_usd <= 0) throw new SnapshotError('snapshot.json has no floor_usd');
  if (!Array.isArray(o.protocols)) throw new SnapshotError('snapshot.json has no protocols array');
  if (!Array.isArray(o.watchlist) || o.watchlist.some((s) => typeof s !== 'string')) throw new SnapshotError('snapshot.json has no watchlist of slugs');
  const protocols = o.protocols.map((v, i) => {
    if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new SnapshotError(`snapshot.json's protocol ${i} is not an object`);
    const p = v as Record<string, unknown>;
    if (typeof p.slug !== 'string' || typeof p.name !== 'string' || typeof p.tvl_usd !== 'number' || !Number.isFinite(p.tvl_usd)) {
      throw new SnapshotError(`snapshot.json's protocol ${i} lacks a slug, a name or a TVL`);
    }
    return {
      slug: p.slug,
      name: p.name,
      category: typeof p.category === 'string' ? p.category : null,
      chains: Array.isArray(p.chains) ? p.chains.filter((c): c is string => typeof c === 'string') : [],
      tvl_usd: p.tvl_usd,
      change_7d: typeof p.change_7d === 'number' && Number.isFinite(p.change_7d) ? p.change_7d : null,
      mcap_usd: typeof p.mcap_usd === 'number' && Number.isFinite(p.mcap_usd) ? p.mcap_usd : null,
      listed_at: typeof p.listed_at === 'string' ? p.listed_at : null,
      gecko_id: typeof p.gecko_id === 'string' ? p.gecko_id : null,
      symbol: typeof p.symbol === 'string' ? p.symbol : null,
    };
  });
  return {
    as_of: o.as_of,
    source: o.source,
    floor_usd: o.floor_usd,
    protocols,
    watchlist: o.watchlist as string[],
  };
}

/** Why a board is not one the gate will take, or null: coverage, ranks, order, one shared implied value, and farm steps. */
export function boardIssue(board: BoardRow[], snapshot: Snapshot): string | null {
  const slugs = new Set(board.map((r) => r.slug));
  const missing = snapshot.watchlist.filter((s) => !slugs.has(s));
  if (missing.length > 0) return `the board misses ${missing.length} watchlist slug${missing.length === 1 ? '' : 's'}: ${missing.slice(0, 5).join(', ')}`;
  const ranks = board.map((r) => r.rank).sort((a, b) => a - b);
  for (let i = 0; i < ranks.length; i++) if (ranks[i] !== i + 1) return `rank ${i + 1} is ${ranks[i]}`;
  for (let i = 1; i < board.length; i++) if (board[i]!.implied_value_usd > board[i - 1]!.implied_value_usd) return `row ${i + 1} outranks row ${i} on implied value`;
  if (board.length >= 2 && board[0]!.implied_value_usd === board[board.length - 1]!.implied_value_usd) {
    return `all ${board.length} rows share the same implied value $${board[0]!.implied_value_usd}: a board that ranks nothing by value is not a ranking`;
  }
  for (const r of board) {
    const steps = r.farm_steps;
    if (steps.length < 3 || steps.length > 12) return `${r.slug} has ${steps.length} farm steps`;
    for (const s of steps) {
      const t = s.trim();
      if (t.length < 20 || t.length > 600) return `${r.slug} has a farm step of ${t.length} characters`;
    }
    if (!Number.isSafeInteger(r.implied_value_usd) || r.implied_value_usd <= 0) return `${r.slug} has implied value ${r.implied_value_usd}`;
  }
  return null;
}

/** A compact data.js: the dashboard's whole dataset as one script, no fetch and no network. */
export function dataScript(radar: RadarData): string {
  return `window.RADAR=${JSON.stringify(radar)};\n`;
}
