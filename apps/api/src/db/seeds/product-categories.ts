import type db from ".."

import * as schema from "../schema"

// Placeholder 1x1 PNG image
// eslint-disable-next-line node/prefer-global/buffer
const PLACEHOLDER_IMAGE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
)

const FABRIC_CATEGORIES = [
  { name: "Cotton Fabrics", description: "Premium cotton materials for various applications" },
  { name: "Silk Collection", description: "Luxurious silk fabrics for high-end garments" },
  { name: "Denim Materials", description: "Durable denim for casual and workwear" },
  { name: "Linen Fabrics", description: "Breathable linen for summer clothing" },
  { name: "Synthetic Blends", description: "Performance fabrics with synthetic materials" },
  { name: "Wool Textiles", description: "Premium wool for winter garments" },
  { name: "Velvet & Velour", description: "Luxurious velvet and velour fabrics" },
  { name: "Chiffon & Georgette", description: "Lightweight flowing fabrics" },
  { name: "Tweed & Herringbone", description: "Classic textured fabrics" },
  { name: "Jersey Knits", description: "Comfortable stretch knit fabrics" },
  { name: "Satin & Sateen", description: "Smooth lustrous fabrics" },
  { name: "Corduroy", description: "Ribbed cotton fabrics" },
]

export async function seedProductCategories(database: typeof db, count: number) {
  const categories = FABRIC_CATEGORIES.slice(0, count)
  const data = categories.map(cat => ({
    name: cat.name,
    description: cat.description,
    image: PLACEHOLDER_IMAGE,
  }))

  const inserted = await database
    .insert(schema.productCategories)
    .values(data)
    .onConflictDoNothing()
    .returning()
  return inserted
}
