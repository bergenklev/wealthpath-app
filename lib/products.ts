// ---------------------------------------------------------------------------
// Product catalog for the Goals page "browse and pick a purchase" feature.
//
// Prices are approximate, illustrative retail prices in USD (rounded) meant
// for planning purposes, not live quotes. In a production version, swap
// these for a real pricing/catalog API (or let users submit their own
// pricing data) — see README.
// ---------------------------------------------------------------------------

export type ProductCategory =
  | "watches"
  | "cars"
  | "houses"
  | "trips"
  | "electronics";

export interface Product {
  id: string;
  category: ProductCategory;
  brand: string;
  model: string;
  priceUSD: number;
  note?: string;
}

export const PRODUCT_CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: "watches", label: "Watches" },
  { id: "cars", label: "Cars" },
  { id: "houses", label: "Houses" },
  { id: "trips", label: "Trips" },
  { id: "electronics", label: "Electronics" },
];

// A sensible default savings horizon per category, used to pre-fill the
// goal calculator when someone picks a product (they can always change it).
export const CATEGORY_DEFAULT_YEARS: Record<ProductCategory, number> = {
  watches: 1.5,
  cars: 3,
  houses: 5,
  trips: 1,
  electronics: 0.5,
};

export const PRODUCTS: Product[] = [
  // --- Watches ---
  { id: "w1", category: "watches", brand: "Casio", model: "G-Shock DW5600", priceUSD: 110 },
  { id: "w2", category: "watches", brand: "Seiko", model: "5 Sports SNK", priceUSD: 250 },
  { id: "w3", category: "watches", brand: "Tissot", model: "PRX Powermatic 80", priceUSD: 650 },
  { id: "w4", category: "watches", brand: "Longines", model: "Spirit Zulu Time", priceUSD: 3200 },
  { id: "w5", category: "watches", brand: "Tag Heuer", model: "Carrera Calibre 5", priceUSD: 3950 },
  { id: "w6", category: "watches", brand: "Omega", model: "Seamaster Diver 300M", priceUSD: 6400 },
  { id: "w7", category: "watches", brand: "Rolex", model: "Submariner Date", priceUSD: 10250 },
  { id: "w8", category: "watches", brand: "Audemars Piguet", model: "Royal Oak", priceUSD: 34000 },
  { id: "w9", category: "watches", brand: "Patek Philippe", model: "Calatrava", priceUSD: 32000 },

  // --- Cars ---
  { id: "c1", category: "cars", brand: "Toyota", model: "Corolla", priceUSD: 23000 },
  { id: "c2", category: "cars", brand: "Honda", model: "Civic", priceUSD: 24500 },
  { id: "c3", category: "cars", brand: "Volkswagen", model: "Golf", priceUSD: 27000 },
  { id: "c4", category: "cars", brand: "Mazda", model: "CX-5", priceUSD: 29500 },
  { id: "c5", category: "cars", brand: "Tesla", model: "Model 3", priceUSD: 42000 },
  { id: "c6", category: "cars", brand: "BMW", model: "3 Series", priceUSD: 45000 },
  { id: "c7", category: "cars", brand: "Volvo", model: "XC60", priceUSD: 48000 },
  { id: "c8", category: "cars", brand: "Audi", model: "Q5", priceUSD: 52000 },
  { id: "c9", category: "cars", brand: "Mercedes-Benz", model: "E-Class", priceUSD: 62000 },
  { id: "c10", category: "cars", brand: "Porsche", model: "911 Carrera", priceUSD: 106000 },

  // --- Houses (typical purchase price — consider a ~15-20% down payment as your actual goal) ---
  { id: "h1", category: "houses", brand: "Starter home", model: "1-bed apartment", priceUSD: 180000, note: "~20% down ≈ $36,000" },
  { id: "h2", category: "houses", brand: "City apartment", model: "2-bed downtown condo", priceUSD: 350000, note: "~20% down ≈ $70,000" },
  { id: "h3", category: "houses", brand: "Family home", model: "3-bed suburban house", priceUSD: 420000, note: "~20% down ≈ $84,000" },
  { id: "h4", category: "houses", brand: "Countryside home", model: "4-bed house with land", priceUSD: 550000, note: "~20% down ≈ $110,000" },
  { id: "h5", category: "houses", brand: "Luxury home", model: "5-bed detached house", priceUSD: 900000, note: "~20% down ≈ $180,000" },

  // --- Trips ---
  { id: "t1", category: "trips", brand: "Weekend getaway", model: "Copenhagen, 3 days", priceUSD: 800 },
  { id: "t2", category: "trips", brand: "City break", model: "New York, 5 days", priceUSD: 1900 },
  { id: "t3", category: "trips", brand: "Beach holiday", model: "Thailand, 2 weeks", priceUSD: 2500 },
  { id: "t4", category: "trips", brand: "Adventure trip", model: "Japan, 10 days", priceUSD: 4200 },
  { id: "t5", category: "trips", brand: "Safari", model: "Tanzania, 7 days", priceUSD: 7500 },
  { id: "t6", category: "trips", brand: "Round-the-world", model: "3 months, 5 countries", priceUSD: 15000 },

  // --- Electronics ---
  { id: "e1", category: "electronics", brand: "Sony", model: "PlayStation 5", priceUSD: 500 },
  { id: "e2", category: "electronics", brand: "Apple", model: "iPhone 16 Pro", priceUSD: 1000 },
  { id: "e3", category: "electronics", brand: "Samsung", model: "Galaxy S25 Ultra", priceUSD: 1300 },
  { id: "e4", category: "electronics", brand: "Apple", model: "MacBook Pro 14\"", priceUSD: 2000 },
  { id: "e5", category: "electronics", brand: "DJI", model: "Mavic 4 Pro Drone", priceUSD: 2700 },
];

export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

// Rough, fixed illustrative USD conversion for the prototype's supported
// currencies. Replace with a live FX rate API for production use.
const FX_RATES: Record<string, number> = {
  USD: 1,
  SEK: 10.5,
};

export function convertFromUSD(amountUSD: number, currency: string): number {
  const rate = FX_RATES[currency] ?? 1;
  return Math.round(amountUSD * rate);
}
