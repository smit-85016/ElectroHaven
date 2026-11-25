/**
 * Shared Hot Deals filtering, offer resolution, and coupon/offer expiration utilities.
 * Keeps base product catalog pricing untouched while applying active, non-expired offers.
 */

export const DEAL_OFFER_TYPES = {
  flash_sale: {
    id: 'flash_sale',
    label: 'Flash Sale',
    badgePrefix: 'FLASH SALE',
  },
  price_crash: {
    id: 'price_crash',
    label: 'Price Crash',
    badgePrefix: 'PRICE CRASH',
  },
  deal_discount: {
    id: 'deal_discount',
    label: 'Special Discount',
    badgePrefix: 'HOT DEAL',
  },
};

export function parseDiscountPercent(discountText) {
  if (!discountText || typeof discountText !== 'string') return 0;
  const match = discountText.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? Math.round(Number(match[1])) : 0;
}

export function getComputedDiscountPercent(product) {
  if (!product) return 0;
  const price = Number(product.price) || 0;
  const oldPrice = Number(product.oldPrice) || 0;
  if (oldPrice > price && oldPrice > 0) {
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  }
  return parseDiscountPercent(product.discount);
}

/**
 * Checks whether an offer or coupon is currently active and not expired.
 */
export function isOfferCurrentlyActive(offer, now = new Date()) {
  if (!offer) return false;
  if (offer.status === 'inactive' || offer.status === 'disabled') return false;

  if (offer.validUntil) {
    const raw = String(offer.validUntil).trim();
    if (raw) {
      let expiryTime = NaN;
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const [y, m, d] = raw.split('-').map(Number);
        expiryTime = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
      } else {
        expiryTime = new Date(raw).getTime();
      }
      if (!Number.isNaN(expiryTime) && expiryTime < now.getTime()) {
        return false;
      }
    }
  }

  return true;
}

export function isOfferExpired(offer, now = new Date()) {
  if (!offer || !offer.validUntil) return false;
  const raw = String(offer.validUntil).trim();
  if (!raw) return false;

  let expiryTime = NaN;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split('-').map(Number);
    expiryTime = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
  } else {
    expiryTime = new Date(raw).getTime();
  }
  return !Number.isNaN(expiryTime) && expiryTime < now.getTime();
}

export function doesOfferApplyToProduct(offer, product) {
  if (!offer || !product) return false;
  const scope = offer.scope || 'products';
  if (scope === 'all') return true;
  if (scope === 'category') {
    return (offer.category || '').toLowerCase() === (product.category || '').toLowerCase();
  }
  const ids = Array.isArray(offer.productIds) ? offer.productIds.map(Number) : [];
  return ids.includes(Number(product.id));
}

/**
 * Applies currently active, non-expired deal offers onto a single product
 * without mutating the underlying catalog product record.
 */
export function resolveProductWithOffers(product, dealOffers = [], now = new Date()) {
  if (!product) return product;

  const basePrice = Number(product.price) || 0;
  const baseOldPrice = Math.max(Number(product.oldPrice) || 0, basePrice);
  const naturalPct =
    baseOldPrice > basePrice
      ? Math.round(((baseOldPrice - basePrice) / baseOldPrice) * 100)
      : parseDiscountPercent(product.discount);

  const matchingActiveOffers = (Array.isArray(dealOffers) ? dealOffers : []).filter(
    (offer) => isOfferCurrentlyActive(offer, now) && doesOfferApplyToProduct(offer, product)
  );

  if (matchingActiveOffers.length === 0) {
    const normalizedBadge =
      baseOldPrice > basePrice && naturalPct > 0
        ? `${naturalPct}% OFF`
        : product.discount || '';

    return {
      ...product,
      price: basePrice,
      oldPrice: baseOldPrice,
      discount: normalizedBadge,
      discountPercent: naturalPct,
      activeOffer: null,
      activeOfferType: null,
      basePrice,
      baseOldPrice,
    };
  }

  let bestOffer = null;
  let bestPrice = basePrice;

  for (const offer of matchingActiveOffers) {
    const val = Number(offer.discountValue) || 0;
    const candidatePrice =
      offer.discountType === 'fixed'
        ? Math.max(1, Math.round(basePrice - val))
        : Math.max(1, Math.round(basePrice * (1 - Math.min(95, Math.max(0, val)) / 100)));

    if (!bestOffer || candidatePrice < bestPrice) {
      bestOffer = offer;
      bestPrice = candidatePrice;
    }
  }

  const effectiveOldPrice = baseOldPrice > bestPrice ? baseOldPrice : basePrice;
  const effectivePct =
    effectiveOldPrice > bestPrice
      ? Math.round(((effectiveOldPrice - bestPrice) / effectiveOldPrice) * 100)
      : 0;

  const meta = DEAL_OFFER_TYPES[bestOffer.offerType] || DEAL_OFFER_TYPES.deal_discount;
  let badgeText = '';
  if (bestOffer.offerType === 'flash_sale' || bestOffer.offerType === 'price_crash') {
    badgeText = effectivePct > 0 ? `${meta.badgePrefix} · ${effectivePct}% OFF` : meta.badgePrefix;
  } else {
    badgeText = effectivePct > 0 ? `${effectivePct}% OFF` : product.discount || '';
  }

  return {
    ...product,
    price: bestPrice,
    oldPrice: effectiveOldPrice,
    discount: badgeText,
    discountPercent: effectivePct,
    activeOffer: bestOffer,
    activeOfferType: bestOffer.offerType,
    basePrice,
    baseOldPrice,
  };
}

export function applyOffersToProducts(products = [], dealOffers = [], now = new Date()) {
  return (Array.isArray(products) ? products : []).map((p) =>
    resolveProductWithOffers(p, dealOffers, now)
  );
}

/**
 * Determines whether a (resolved) product qualifies for Hot Deals.
 * Rule:
 * - Active high discount (>= 20%), OR
 * - Valid active Flash Sale offer, OR
 * - Valid active Price Crash offer.
 * Regular products with small discounts (< 20%) without Flash Sale / Price Crash are excluded.
 */
export function isProductEligibleForHotDeals(product) {
  if (!product) return false;

  const pct =
    typeof product.discountPercent === 'number'
      ? product.discountPercent
      : getComputedDiscountPercent(product);

  const hasHighDiscount = pct >= 20;
  const hasPromotionalEventOffer =
    Boolean(product.activeOffer) &&
    (product.activeOffer.offerType === 'flash_sale' ||
      product.activeOffer.offerType === 'price_crash');

  return hasHighDiscount || hasPromotionalEventOffer;
}

/**
 * Determines whether a (resolved) product should actually be displayed in Storefront Hot Deals
 * and counted as Featured in Admin Hot Deals Showcase.
 */
export function isProductFeaturedInHotDeals(product) {
  if (!product) return false;
  if (product.isHotDeal === false) return false;
  return isProductEligibleForHotDeals(product);
}

export function getHotDealProducts(resolvedProducts = []) {
  return (Array.isArray(resolvedProducts) ? resolvedProducts : []).filter(
    isProductFeaturedInHotDeals
  );
}
