import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create seasonal trends
  const trends = await Promise.all([
    prisma.seasonalTrend.create({
      data: {
        title: 'Winter Cozy Layers',
        description: 'Embrace the art of layering with cozy knits, oversized blazers, and warm textures. Perfect for staying stylish during the colder months.',
        season: 'Winter 2024',
        popularity: 95,
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        colors: ['#8B4513', '#F5DEB3', '#2F4F4F', '#FFFFFF'],
        keyPieces: ['Oversized Blazer', 'Chunky Knit Sweater', 'Wide-leg Trousers', 'Ankle Boots'],
        tags: ['Cozy', 'Layering', 'Neutral Tones'],
        priority: 10,
        products: {
          create: [
            {
              productId: 'winter-blazer-1',
              name: 'Oversized Wool Blazer',
              brand: 'Zara',
              price: 7999,
              originalPrice: 9999,
              imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
              productUrl: 'https://zara.com/wool-blazer',
              category: 'CLOTHING',
              rating: 4.6,
              inStock: true,
              featured: true
            },
            {
              productId: 'winter-sweater-1',
              name: 'Chunky Knit Sweater',
              brand: 'H&M',
              price: 2999,
              imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&h=200&fit=crop',
              productUrl: 'https://hm.com/knit-sweater',
              category: 'CLOTHING',
              rating: 4.4,
              inStock: true,
              featured: true
            }
          ]
        }
      }
    }),
    
    prisma.seasonalTrend.create({
      data: {
        title: 'Minimalist Chic',
        description: 'Clean lines, neutral colors, and timeless pieces define this trend. Less is more with carefully curated wardrobe essentials.',
        season: 'All Season',
        popularity: 88,
        imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop',
        colors: ['#FFFFFF', '#000000', '#F5F5F5', '#C0C0C0'],
        keyPieces: ['White Button Shirt', 'Black Trousers', 'Minimalist Bag', 'Classic Sneakers'],
        tags: ['Minimalist', 'Timeless', 'Neutral'],
        priority: 8,
        products: {
          create: [
            {
              productId: 'minimal-shirt-1',
              name: 'Classic White Shirt',
              brand: 'COS',
              price: 3999,
              imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
              productUrl: 'https://cos.com/white-shirt',
              category: 'CLOTHING',
              rating: 4.7,
              inStock: true,
              featured: true
            }
          ]
        }
      }
    }),
    
    prisma.seasonalTrend.create({
      data: {
        title: 'Bold Color Blocking',
        description: 'Make a statement with vibrant colors and bold combinations. This trend is all about confidence and creative expression.',
        season: 'Spring 2024',
        popularity: 76,
        imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=300&fit=crop',
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
        keyPieces: ['Bright Blazer', 'Colorful Dress', 'Statement Accessories', 'Bold Shoes'],
        tags: ['Bold', 'Colorful', 'Statement'],
        priority: 6,
        products: {
          create: [
            {
              productId: 'bold-blazer-1',
              name: 'Bright Coral Blazer',
              brand: 'Mango',
              price: 5999,
              originalPrice: 7999,
              imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200&h=200&fit=crop',
              productUrl: 'https://mango.com/coral-blazer',
              category: 'CLOTHING',
              rating: 4.3,
              inStock: true,
              featured: true
            }
          ]
        }
      }
    })
  ]);

  console.log(`✅ Created ${trends.length} seasonal trends`);
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });