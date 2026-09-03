/**
 * Papa's Shop listings.
 *
 * Empty by design right now — nothing fake gets shown to a visitor.
 * When Papa has a real piece ready to sell, add it here: a real slug,
 * name, price, condition, dimensions, an honest description, and real
 * photos in /public/shop/. The page (app/papas-shop/page.tsx) shows an
 * "ask about a custom piece" message instead of a grid whenever this
 * array is empty, so there's nothing to toggle or clean up first.
 *
 * Never generate a fake product photo for a real listing — if there's
 * no photo yet, leave `photos: []` and the card shows "photo coming
 * soon" rather than something invented.
 */

export const PLACEHOLDER = false;

export type FurnitureStatus = 'available' | 'sold';

export interface FurniturePhoto {
  src: string;
  alt: string;
}

export interface FurnitureItem {
  slug: string;
  name: string;
  /** CAD. */
  price: number;
  status: FurnitureStatus;
  category: string;
  condition: string;
  /** e.g. `48" W x 30" D x 30" H`. */
  dimensions: string;
  description: string;
  photos: FurniturePhoto[];
}

export const categories = ['Tables', 'Chairs & Seating', 'Storage', 'Outdoor'] as const;

export const furniture: FurnitureItem[] = [];

export function getFurnitureItem(slug: string) {
  return furniture.find((f) => f.slug === slug);
}
