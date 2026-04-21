import { PrismaClient, Role, ProductStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seeding with Nigerian building materials...')

  // Create admin user
  const adminEmail = 'oyibodaniel247@gmail.com'
  const adminPassword = 'Admin123!'
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  })
  
  console.log('✅ Admin user created:', admin.email)

  // Create categories
  console.log('Creating categories...')
  
  const categories = await Promise.all([
    // Structural Materials
    prisma.category.upsert({
      where: { slug: 'cement-and-block' },
      update: {},
      create: {
        name: 'Cement & Blocks',
        slug: 'cement-and-block',
        description: 'High-quality cement, blocks, and binding materials',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'reinforcement-steel' },
      update: {},
      create: {
        name: 'Reinforcement Steel',
        slug: 'reinforcement-steel',
        description: 'Iron rods, mesh, and structural steel',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'roofing-materials' },
      update: {},
      create: {
        name: 'Roofing Materials',
        slug: 'roofing-materials',
        description: 'Roofing sheets, tiles, and accessories',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'wood-and-timber' },
      update: {},
      create: {
        name: 'Wood & Timber',
        slug: 'wood-and-timber',
        description: 'Quality timber for framing and finishing',
      },
    }),
    
    // Finishes
    prisma.category.upsert({
      where: { slug: 'paints-and-coatings' },
      update: {},
      create: {
        name: 'Paints & Coatings',
        slug: 'paints-and-coatings',
        description: 'Interior and exterior paints, primers, and sealers',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'tiles-and-flooring' },
      update: {},
      create: {
        name: 'Tiles & Flooring',
        slug: 'tiles-and-flooring',
        description: 'Ceramic, porcelain, and vinyl flooring solutions',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'plaster-and-ceiling' },
      update: {},
      create: {
        name: 'Plaster & Ceiling',
        slug: 'plaster-and-ceiling',
        description: 'Plaster of Paris, ceiling boards, and accessories',
      },
    }),
    
    // Fixtures & Fittings
    prisma.category.upsert({
      where: { slug: 'doors-and-windows' },
      update: {},
      create: {
        name: 'Doors & Windows',
        slug: 'doors-and-windows',
        description: 'Interior and exterior doors, windows, and frames',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'plumbing-fixtures' },
      update: {},
      create: {
        name: 'Plumbing Fixtures',
        slug: 'plumbing-fixtures',
        description: 'Pipes, fittings, sinks, and bathroom fixtures',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'electrical-fittings' },
      update: {},
      create: {
        name: 'Electrical Fittings',
        slug: 'electrical-fittings',
        description: 'Wiring, switches, conduits, and lighting',
      },
    }),
    
    // Aesthetics
    prisma.category.upsert({
      where: { slug: 'lighting-design' },
      update: {},
      create: {
        name: 'Lighting Design',
        slug: 'lighting-design',
        description: 'Decorative and functional lighting solutions',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'wall-decor' },
      update: {},
      create: {
        name: 'Wall Decor',
        slug: 'wall-decor',
        description: 'Wallpapers, paneling, and decorative elements',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'kitchen-fittings' },
      update: {},
      create: {
        name: 'Kitchen Fittings',
        slug: 'kitchen-fittings',
        description: 'Cabinets, countertops, and kitchen accessories',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'bathroom-fittings' },
      update: {},
      create: {
        name: 'Bathroom Fittings',
        slug: 'bathroom-fittings',
        description: 'WC, sinks, showers, and bathroom accessories',
      },
    }),
  ])

  console.log('✅ Categories created:', categories.length)

  // Find categories by slug for product assignment
  const cat = {
    cement: categories.find(c => c.slug === 'cement-and-block')!,
    steel: categories.find(c => c.slug === 'reinforcement-steel')!,
    roofing: categories.find(c => c.slug === 'roofing-materials')!,
    wood: categories.find(c => c.slug === 'wood-and-timber')!,
    paint: categories.find(c => c.slug === 'paints-and-coatings')!,
    tiles: categories.find(c => c.slug === 'tiles-and-flooring')!,
    plaster: categories.find(c => c.slug === 'plaster-and-ceiling')!,
    doors: categories.find(c => c.slug === 'doors-and-windows')!,
    plumbing: categories.find(c => c.slug === 'plumbing-fixtures')!,
    electrical: categories.find(c => c.slug === 'electrical-fittings')!,
    lighting: categories.find(c => c.slug === 'lighting-design')!,
    walldecor: categories.find(c => c.slug === 'wall-decor')!,
    kitchen: categories.find(c => c.slug === 'kitchen-fittings')!,
    bathroom: categories.find(c => c.slug === 'bathroom-fittings')!,
  }

  console.log('Creating products...')

  // Create 50 products with Nigerian market prices
  const products = await Promise.all([
    // CEMENT & BLOCKS (5 products)
    prisma.product.upsert({
      where: { sku: 'CEM-DG-001' },
      update: {},
      create: {
        name: 'Dangote Cement 42.5R (50kg)',
        slug: 'dangote-cement-42-5r-50kg',
        description: 'Premium quality Portland limestone cement, ideal for all construction purposes. 42.5R grade for rapid strength development.',
        shortDescription: 'Dangote Cement 50kg bag',
        price: 5500,
        compareAtPrice: 5800,
        sku: 'CEM-DG-001',
        quantity: 500,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/dangote-cement-1.jpg', position: 0, isMain: true },
            { url: '/images/products/dangote-cement-2.jpg', position: 1 },
          ]
        },
        categoryId: cat.cement.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'CEM-BUA-002' },
      update: {},
      create: {
        name: 'BUA Cement 42.5 (50kg)',
        slug: 'bua-cement-42-5-50kg',
        description: 'High-strength Portland cement suitable for all building applications. Consistent quality and excellent workability.',
        price: 5400,
        compareAtPrice: 5700,
        sku: 'CEM-BUA-002',
        quantity: 450,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/bua-cement-1.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.cement.id,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'CEM-LAF-003' },
      update: {},
      create: {
        name: 'Lafarge Supaset 42.5R (50kg)',
        slug: 'lafarge-supaset-42-5r-50kg',
        description: 'Rapid hardening cement for faster construction. Ideal for projects requiring quick formwork removal.',
        price: 5600,
        compareAtPrice: 5900,
        sku: 'CEM-LAF-003',
        quantity: 300,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/lafarge-cement-1.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.cement.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'BLK-6IN-004' },
      update: {},
      create: {
        name: '6-Inch Hollow Blocks (Pieces)',
        slug: '6-inch-hollow-blocks',
        description: 'Standard 6-inch hollow sandcrete blocks, cured for 28 days for maximum strength. Perfect for load-bearing walls.',
        price: 400,
        compareAtPrice: 450,
        sku: 'BLK-6IN-004',
        quantity: 2000,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/hollow-block-1.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.cement.id,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'BLK-9IN-005' },
      update: {},
      create: {
        name: '9-Inch Hollow Blocks (Pieces)',
        slug: '9-inch-hollow-blocks',
        description: 'Heavy-duty 9-inch hollow blocks for foundation and structural walls. High compressive strength.',
        price: 550,
        compareAtPrice: 600,
        sku: 'BLK-9IN-005',
        quantity: 1500,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/hollow-block-2.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.cement.id,
        featured: true,
      },
    }),

    // REINFORCEMENT STEEL (5 products)
    prisma.product.upsert({
      where: { sku: 'ROD-12MM-006' },
      update: {},
      create: {
        name: '12mm Reinforcement Iron Rod (Length)',
        slug: '12mm-reinforcement-iron-rod',
        description: 'High-tensile 12mm reinforcement bar, 12m length. Grade 460B, meets Nigerian standard specifications.',
        price: 7500,
        compareAtPrice: 8000,
        sku: 'ROD-12MM-006',
        quantity: 800,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/iron-rod-12mm.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.steel.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ROD-16MM-007' },
      update: {},
      create: {
        name: '16mm Reinforcement Iron Rod (Length)',
        slug: '16mm-reinforcement-iron-rod',
        description: 'Heavy-duty 16mm reinforcement bar, 12m length. Ideal for columns and beams in multi-story structures.',
        price: 13500,
        compareAtPrice: 14200,
        sku: 'ROD-16MM-007',
        quantity: 600,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/iron-rod-16mm.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.steel.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ROD-10MM-008' },
      update: {},
      create: {
        name: '10mm Reinforcement Iron Rod (Length)',
        slug: '10mm-reinforcement-iron-rod',
        description: 'Versatile 10mm reinforcement bar, 12m length. Perfect for lintels, beams and general reinforcement.',
        price: 5200,
        compareAtPrice: 5500,
        sku: 'ROD-10MM-008',
        quantity: 1000,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/iron-rod-10mm.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.steel.id,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ROD-20MM-009' },
      update: {},
      create: {
        name: '20mm Heavy Reinforcement Rod (Length)',
        slug: '20mm-heavy-reinforcement-rod',
        description: 'Extra-heavy 20mm reinforcement bar for major structural elements. 12m length, high-grade steel.',
        price: 21000,
        compareAtPrice: 22000,
        sku: 'ROD-20MM-009',
        quantity: 400,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/iron-rod-20mm.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.steel.id,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'MSH-6IN-010' },
      update: {},
      create: {
        name: '6-inch x 6-inch Reinforcing Mesh (2.4m x 1.2m)',
        slug: '6x6-reinforcing-mesh',
        description: 'Welded wire mesh for concrete reinforcement. Perfect for slabs, pathways, and foundations.',
        price: 18500,
        compareAtPrice: 19500,
        sku: 'MSH-6IN-010',
        quantity: 300,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/reinforcing-mesh.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.steel.id,
        featured: false,
      },
    }),

    // ROOFING MATERIALS (5 products)
    prisma.product.upsert({
      where: { sku: 'ROF-LS-011' },
      update: {},
      create: {
        name: 'Longspan Aluminum Roofing Sheet (Natural)',
        slug: 'longspan-aluminum-roofing-sheet',
        description: '0.55mm gauge longspan aluminum roofing sheet, natural finish. Length 3.6m, excellent durability.',
        price: 12500,
        compareAtPrice: 13500,
        sku: 'ROF-LS-011',
        quantity: 350,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/longspan-roofing.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.roofing.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ROF-ST-012' },
      update: {},
      create: {
        name: 'Stone-Coated Steel Roofing Tiles (Terracotta)',
        slug: 'stone-coated-steel-roofing-tiles',
        description: 'Premium stone-coated steel roofing tiles in terracotta color. 20-year warranty, excellent insulation.',
        price: 18500,
        compareAtPrice: 20000,
        sku: 'ROF-ST-012',
        quantity: 200,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/stone-coated-tiles.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.roofing.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ROF-PC-013' },
      update: {},
      create: {
        name: 'Polycarbonate Roofing Sheet (Clear)',
        slug: 'polycarbonate-roofing-sheet',
        description: '2.1m x 6m clear polycarbonate roofing sheet. UV-protected, ideal for carports and patios.',
        price: 22000,
        compareAtPrice: 24000,
        sku: 'ROF-PC-013',
        quantity: 150,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/polycarbonate-roofing.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.roofing.id,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ROF-RID-014' },
      update: {},
      create: {
        name: 'Aluminum Ridge Cap (3.6m)',
        slug: 'aluminum-ridge-cap',
        description: 'Matching ridge cap for aluminum roofing sheets. 3.6m length, natural finish with sealing strips.',
        price: 5500,
        compareAtPrice: 6000,
        sku: 'ROF-RID-014',
        quantity: 400,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/ridge-cap.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.roofing.id,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ROF-FIX-015' },
      update: {},
      create: {
        name: 'Roofing Nail/Screw Pack (100pcs)',
        slug: 'roofing-nail-screw-pack',
        description: 'Stainless steel roofing nails with rubber washers. 100 pieces per pack, weather-resistant.',
        price: 3500,
        compareAtPrice: 3800,
        sku: 'ROF-FIX-015',
        quantity: 1000,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/roofing-nails.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.roofing.id,
        featured: false,
      },
    }),

    // WOOD & TIMBER (5 products)
    prisma.product.upsert({
      where: { sku: 'TIM-BRG-016' },
      update: {},
      create: {
        name: '2" x 3" Nigerian Bargin (5ft)',
        slug: '2x3-nigerian-bargin',
        description: 'Kiln-dried Nigerian bargin wood, 2x3 inches x 5ft. Ideal for framing and general construction.',
        price: 1800,
        compareAtPrice: 2000,
        sku: 'TIM-BRG-016',
        quantity: 800,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/bargin-wood.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.wood.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'TIM-OFE-017' },
      update: {},
      create: {
        name: '2" x 2" Nigerian Obeche (12ft)',
        slug: '2x2-nigerian-obeche',
        description: 'Lightweight Obeche wood, 2x2 inches x 12ft. Perfect for interior work and joinery.',
        price: 2500,
        compareAtPrice: 2700,
        sku: 'TIM-OFE-017',
        quantity: 600,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/obeche-wood.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.wood.id,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'TIM-IRO-018' },
      update: {},
      create: {
        name: '1" x 12" Iroko Plank (8ft)',
        slug: '1x12-iroko-plank',
        description: 'Premium Iroko hardwood plank, 1x12 inches x 8ft. Durable, weather-resistant, ideal for furniture.',
        price: 12500,
        compareAtPrice: 13500,
        sku: 'TIM-IRO-018',
        quantity: 200,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/iroko-plank.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.wood.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'TIM-PLY-019' },
      update: {},
      create: {
        name: '12mm Plywood (8ft x 4ft)',
        slug: '12mm-plywood',
        description: 'Marine-grade 12mm plywood sheet. Water-resistant, perfect for cabinetry and construction.',
        price: 15500,
        compareAtPrice: 16500,
        sku: 'TIM-PLY-019',
        quantity: 300,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/plywood-sheet.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.wood.id,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'TIM-DOOR-020' },
      update: {},
      create: {
        name: 'Solid Wood Door Frame (Set)',
        slug: 'solid-wood-door-frame',
        description: 'Complete door frame set with architrave. Pre-assembled, ready to install.',
        price: 28500,
        compareAtPrice: 30000,
        sku: 'TIM-DOOR-020',
        quantity: 150,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/door-frame.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.wood.id,
        featured: true,
      },
    }),

    // PAINTS & COATINGS (5 products)
    prisma.product.upsert({
      where: { sku: 'PNT-EXT-021' },
      update: {},
      create: {
        name: 'Dulux Exterior Weathershield Paint (20L)',
        slug: 'dulux-exterior-weathershield-paint',
        description: 'Premium exterior paint with weather protection. 20-liter bucket, brilliant white.',
        price: 65000,
        compareAtPrice: 68000,
        sku: 'PNT-EXT-021',
        quantity: 200,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/dulux-exterior.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.paint.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'PNT-INT-022' },
      update: {},
      create: {
        name: 'Nigerian Paint Interior Silk (20L)',
        slug: 'nigerian-paint-interior-silk',
        description: 'High-quality interior silk paint. Washable, durable finish. 20-liter bucket, white base.',
        price: 45000,
        compareAtPrice: 47000,
        sku: 'PNT-INT-022',
        quantity: 250,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/nigerian-paint.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.paint.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'PNT-PRM-023' },
      update: {},
      create: {
        name: 'Metal Primer Paint (4L)',
        slug: 'metal-primer-paint',
        description: 'Anti-corrosive metal primer for steel and iron surfaces. 4-liter can, red oxide.',
        price: 12500,
        compareAtPrice: 13500,
        sku: 'PNT-PRM-023',
        quantity: 300,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/metal-primer.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.paint.id,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'PNT-WDP-024' },
      update: {},
      create: {
        name: 'Wood Stain & Preservative (5L)',
        slug: 'wood-stain-preservative',
        description: 'Protective wood stain with insecticide. 5-liter container, teak finish.',
        price: 18500,
        compareAtPrice: 19500,
        sku: 'PNT-WDP-024',
        quantity: 180,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/wood-stain.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.paint.id,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'PNT-TEX-025' },
      update: {},
      create: {
        name: 'Textured Paint - Sand Finish (25kg)',
        slug: 'textured-paint-sand-finish',
        description: 'Ready-mixed textured paint for decorative wall finishes. 25kg bucket, off-white.',
        price: 32000,
        compareAtPrice: 34000,
        sku: 'PNT-TEX-025',
        quantity: 120,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/textured-paint.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.paint.id,
        featured: true,
      },
    }),

    // TILES & FLOORING (5 products)
    prisma.product.upsert({
      where: { sku: 'TIL-CER-026' },
      update: {},
      create: {
        name: 'Ceramic Floor Tiles - Beige (40x40cm)',
        slug: 'ceramic-floor-tiles-beige',
        description: 'High-quality ceramic floor tiles, beige color. 40x40cm, box of 12 pieces (1.92sqm).',
        price: 8500,
        compareAtPrice: 9000,
        sku: 'TIL-CER-026',
        quantity: 500,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/ceramic-tiles.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.tiles.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'TIL-POR-027' },
      update: {},
      create: {
        name: 'Porcelain Wall Tiles - White (30x60cm)',
        slug: 'porcelain-wall-tiles-white',
        description: 'Premium porcelain wall tiles, glossy white finish. 30x60cm, box of 8 pieces (1.44sqm).',
        price: 12500,
        compareAtPrice: 13500,
        sku: 'TIL-POR-027',
        quantity: 400,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/porcelain-tiles.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.tiles.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'TIL-MAR-028' },
      update: {},
      create: {
        name: 'Marble Effect Floor Tiles (60x60cm)',
        slug: 'marble-effect-floor-tiles',
        description: 'Luxury marble-look porcelain floor tiles. 60x60cm, box of 4 pieces (1.44sqm).',
        price: 18500,
        compareAtPrice: 20000,
        sku: 'TIL-MAR-028',
        quantity: 300,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/marble-tiles.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.tiles.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'TIL-VNL-029' },
      update: {},
      create: {
        name: 'Vinyl Plank Flooring (Pack - 2.2sqm)',
        slug: 'vinyl-plank-flooring',
        description: 'Waterproof vinyl plank flooring, oak finish. Easy click installation. Pack covers 2.2sqm.',
        price: 32000,
        compareAtPrice: 34000,
        sku: 'TIL-VNL-029',
        quantity: 200,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/vinyl-flooring.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.tiles.id,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'TIL-ADH-030' },
      update: {},
      create: {
        name: 'Tile Adhesive - 20kg Bag',
        slug: 'tile-adhesive-20kg',
        description: 'Premium tile adhesive for floor and wall tiles. 20kg bag, cement-based.',
        price: 5500,
        compareAtPrice: 5800,
        sku: 'TIL-ADH-030',
        quantity: 600,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/tile-adhesive.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.tiles.id,
        featured: false,
      },
    }),

    // DOORS & WINDOWS (4 products)
    prisma.product.upsert({
      where: { sku: 'DR-INT-031' },
      update: {},
      create: {
        name: 'Interior Panel Door - White (30" x 80")',
        slug: 'interior-panel-door-white',
        description: 'Hollow core interior panel door, primed white. 30" x 80" standard size with pre-drilled holes.',
        price: 45000,
        compareAtPrice: 48000,
        sku: 'DR-INT-031',
        quantity: 150,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/interior-door.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.doors.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'DR-EXT-032' },
      update: {},
      create: {
        name: 'Exterior Steel Door - Brown (36" x 84")',
        slug: 'exterior-steel-door-brown',
        description: 'Security steel door with wood grain finish. Pre-hung, includes frame and hardware.',
        price: 125000,
        compareAtPrice: 135000,
        sku: 'DR-EXT-032',
        quantity: 80,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/steel-door.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.doors.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'WIN-AL-033' },
      update: {},
      create: {
        name: 'Aluminum Sliding Window (1200mm x 1200mm)',
        slug: 'aluminum-sliding-window',
        description: 'Aluminum sliding window with mosquito net. Clear 4mm glass, powder-coated frame.',
        price: 65000,
        compareAtPrice: 68000,
        sku: 'WIN-AL-033',
        quantity: 120,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/aluminum-window.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.doors.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'WIN-CAS-034' },
      update: {},
      create: {
        name: 'Casement Window - Louvre Type (4ft x 4ft)',
        slug: 'casement-window-louvre',
        description: 'Louvre casement window with aluminum frame and glass blades. Complete with accessories.',
        price: 45000,
        compareAtPrice: 47000,
        sku: 'WIN-CAS-034',
        quantity: 100,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/louvre-window.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.doors.id,
        featured: false,
      },
    }),

    // PLUMBING FIXTURES (4 products)
    prisma.product.upsert({
      where: { sku: 'PLM-WC-035' },
      update: {},
      create: {
        name: 'Close-Coupled WC Suite - White',
        slug: 'close-coupled-wc-suite',
        description: 'Complete toilet suite with cistern, seat, and flush mechanism. White vitreous china.',
        price: 55000,
        compareAtPrice: 58000,
        sku: 'PLM-WC-035',
        quantity: 100,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/toilet-suite.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.plumbing.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'PLM-SNK-036' },
      update: {},
      create: {
        name: 'Stainless Steel Kitchen Sink (Single Bowl)',
        slug: 'stainless-steel-kitchen-sink',
        description: '18-gauge stainless steel kitchen sink with drainboard. 1000mm x 500mm, includes waste kit.',
        price: 45000,
        compareAtPrice: 48000,
        sku: 'PLM-SNK-036',
        quantity: 120,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/kitchen-sink.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.plumbing.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'PLM-MXR-037' },
      update: {},
      create: {
        name: 'Single Lever Basin Mixer - Chrome',
        slug: 'single-lever-basin-mixer-chrome',
        description: 'Modern single lever basin mixer tap. Chrome finish, ceramic cartridge, flexible hoses.',
        price: 18500,
        compareAtPrice: 20000,
        sku: 'PLM-MXR-037',
        quantity: 200,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/basin-mixer.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.plumbing.id,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'PLM-PVC-038' },
      update: {},
      create: {
        name: 'PVC Pipe 4" x 3m (Pressure Grade)',
        slug: 'pvc-pipe-4inch',
        description: 'High-pressure PVC pipe for plumbing and drainage. 4-inch diameter, 3-meter length.',
        price: 7500,
        compareAtPrice: 8000,
        sku: 'PLM-PVC-038',
        quantity: 500,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/pvc-pipe.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.plumbing.id,
        featured: true,
      },
    }),

    // ELECTRICAL FITTINGS (4 products)
    prisma.product.upsert({
      where: { sku: 'ELC-WIR-039' },
      update: {},
      create: {
        name: '2.5mm Electrical Wire (Roll - 100m)',
        slug: '2-5mm-electrical-wire',
        description: 'High-quality copper electrical wire. 2.5mm², PVC insulated. 100-meter roll.',
        price: 45000,
        compareAtPrice: 47000,
        sku: 'ELC-WIR-039',
        quantity: 300,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/electrical-wire.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.electrical.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ELC-SWT-040' },
      update: {},
      create: {
        name: '1-Gang Light Switch - White',
        slug: '1-gang-light-switch',
        description: 'Modern 1-gang light switch with LED indicator. Flush mount, white finish.',
        price: 1800,
        compareAtPrice: 2000,
        sku: 'ELC-SWT-040',
        quantity: 800,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/light-switch.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.electrical.id,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ELC-SKT-041' },
      update: {},
      create: {
        name: '13A Double Socket Outlet - White',
        slug: '13a-double-socket-outlet',
        description: 'Double gang switched socket outlet with shutters. 13A rating, white finish.',
        price: 3500,
        compareAtPrice: 3800,
        sku: 'ELC-SKT-041',
        quantity: 600,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/socket-outlet.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.electrical.id,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ELC-DB-042' },
      update: {},
      create: {
        name: '8-Way Consumer Unit (Distribution Board)',
        slug: '8-way-consumer-unit',
        description: '8-way metal consumer unit with main switch. IP40 rated, includes mounting rail.',
        price: 18500,
        compareAtPrice: 19500,
        sku: 'ELC-DB-042',
        quantity: 150,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/consumer-unit.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.electrical.id,
        featured: true,
      },
    }),

    // LIGHTING (4 products)
    prisma.product.upsert({
      where: { sku: 'LIT-LED-043' },
      update: {},
      create: {
        name: 'LED Ceiling Downlight (4-pack)',
        slug: 'led-ceiling-downlight-4pack',
        description: '4-pack LED downlights with driver. 7W each, cool white (6000K), cut-out 70mm.',
        price: 12500,
        compareAtPrice: 13500,
        sku: 'LIT-LED-043',
        quantity: 400,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/led-downlight.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.lighting.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'LIT-PND-044' },
      update: {},
      create: {
        name: 'Modern Pendant Light - Gold',
        slug: 'modern-pendant-light-gold',
        description: 'Decorative pendant light with gold finish. Adjustable drop, suitable for dining areas.',
        price: 28500,
        compareAtPrice: 30000,
        sku: 'LIT-PND-044',
        quantity: 120,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/pendant-light.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.lighting.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'LIT-STR-045' },
      update: {},
      create: {
        name: 'LED Strip Light - 5m (Warm White)',
        slug: 'led-strip-light-5m',
        description: '5-meter LED strip light with remote. Warm white (3000K), adhesive backing, includes power supply.',
        price: 15500,
        compareAtPrice: 16500,
        sku: 'LIT-STR-045',
        quantity: 250,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/led-strip.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.lighting.id,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'LIT-WAL-046' },
      update: {},
      create: {
        name: 'Outdoor Wall Light - Black',
        slug: 'outdoor-wall-light-black',
        description: 'Weatherproof outdoor wall light with motion sensor. Black finish, IP44 rated.',
        price: 18500,
        compareAtPrice: 19500,
        sku: 'LIT-WAL-046',
        quantity: 180,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/outdoor-light.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.lighting.id,
        featured: true,
      },
    }),

    // WALL DECOR & AESTHETICS (4 products)
    prisma.product.upsert({
      where: { sku: 'DEC-WAL-047' },
      update: {},
      create: {
        name: '3D Wall Panel - White (Pack of 10)',
        slug: '3d-wall-panel-white',
        description: 'Decorative 3D wall panels for feature walls. White, 500mm x 500mm, pack of 10 panels.',
        price: 32000,
        compareAtPrice: 34000,
        sku: 'DEC-WAL-047',
        quantity: 150,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/3d-wall-panel.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.walldecor.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'DEC-WPR-048' },
      update: {},
      create: {
        name: 'Wallpaper Roll - Geometric Pattern (10m)',
        slug: 'wallpaper-roll-geometric',
        description: 'Premium wallpaper roll, geometric pattern in grey and white. 10m length, 53cm width.',
        price: 18500,
        compareAtPrice: 19500,
        sku: 'DEC-WPR-048',
        quantity: 200,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/wallpaper.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.walldecor.id,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'DEC-MIR-049' },
      update: {},
      create: {
        name: 'Decorative Wall Mirror (60cm x 80cm)',
        slug: 'decorative-wall-mirror',
        description: 'Elegant wall mirror with aluminum frame. Beveled edges, ready to hang.',
        price: 25000,
        compareAtPrice: 26500,
        sku: 'DEC-MIR-049',
        quantity: 80,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/wall-mirror.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.walldecor.id,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'DEC-CRN-050' },
      update: {},
      create: {
        name: 'Decorative Cornice/PVC (2.4m Length)',
        slug: 'decorative-cornice-pvc',
        description: 'Lightweight PVC cornice for ceiling and wall transitions. 2.4m length, white, easy to install.',
        price: 4500,
        compareAtPrice: 4800,
        sku: 'DEC-CRN-050',
        quantity: 500,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        images: {
          create: [
            { url: '/images/products/cornice.jpg', position: 0, isMain: true },
          ]
        },
        categoryId: cat.walldecor.id,
        featured: false,
      },
    }),
  ])

  console.log(`✅ Created ${products.length} products`)

  // Add some sample reviews for products
  console.log('Adding sample reviews...')
  
  const sampleProducts = products.slice(0, 10) // Add reviews to first 10 products
  for (const product of sampleProducts) {
    await prisma.review.createMany({
      data: [
        {
          productId: product.id,
          userId: admin.id,
          rating: 5,
          title: 'Excellent quality',
          content: 'This product exceeded my expectations. The quality is top-notch and delivery was prompt.',
          isVerified: true,
          isApproved: true,
        },
        {
          productId: product.id,
          userId: admin.id,
          rating: 4,
          title: 'Good value for money',
          content: 'Solid product at a fair price. Would recommend to others.',
          isVerified: true,
          isApproved: true,
        },
      ],
    })
  }

  console.log('✅ Sample reviews added')

  console.log('🌱 Seeding completed successfully!')
  console.log('📊 Database now contains:')
  console.log(`   - ${categories.length} categories`)
  console.log(`   - ${products.length} products`)
  console.log(`   - Admin user: ${admin.email}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })