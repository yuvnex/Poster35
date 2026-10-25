import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';
import { db, initDatabase } from './db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..', '..');

interface CategoryMeta {
  slug: string;
  name: string;
  folder: string;
  description: string;
  titleTemplates: string[];
}

const CATEGORY_DEFINITIONS: CategoryMeta[] = [
  {
    slug: 'cr7',
    name: 'CR7',
    folder: 'CR7',
    description: 'Cristiano Ronaldo - Legendary Portuguese icon, Champions League master, and unmatched goalscorer.',
    titleTemplates: [
      'Cristiano Ronaldo - Legendary Siuu',
      'CR7 - Champions League Glory',
      'Cristiano Ronaldo - Al Nassr Power',
      'CR7 - Real Madrid Golden Era',
      'Cristiano Ronaldo - Portugal Pride',
      'CR7 - The Calma Stare',
      'Cristiano Ronaldo - Bicycle Kick Masterclass',
      'CR7 - Peak Athleticism Portrait',
      'Cristiano Ronaldo - No. 7 Dynasty'
    ]
  },
  {
    slug: 'dhoni',
    name: 'Dhoni',
    folder: 'Dhoni',
    description: 'MS Dhoni - Captain Cool, World Cup 2011 finisher, and the ultimate mastermind behind the stumps.',
    titleTemplates: [
      'MS Dhoni - The 2011 World Cup Finish',
      'Captain Cool - CSK Whistle Podu Yellow',
      'MS Dhoni - Helicopter Shot Precision',
      'MS Dhoni - Behind The Stumps Wizard',
      'Thala Dhoni - Lion of Chepauk',
      'MS Dhoni - T20 World Cup 2007 Triumph',
      'MS Dhoni - Calm in the Storm',
      'MS Dhoni - The Legacy of No. 7',
      'MS Dhoni - Unbeatable Runout Stride',
      'Captain Cool - ICC Trophy Collector'
    ]
  },
  {
    slug: 'english-movies',
    name: 'English Movies',
    folder: 'English Movies',
    description: 'Cinematic masterpieces from Hollywood & global cinema: sci-fi epics, dark thrillers, and iconic classics.',
    titleTemplates: [
      'Interstellar - Stay Dust Particle Cinematic',
      'Oppenheimer - Now I Am Become Death',
      'The Dark Knight - Why So Serious Joker',
      'Fight Club - The First Rule Art Print',
      'Pulp Fiction - Iconic Vincent & Jules',
      'Blade Runner 2049 - Cyberpunk Rain',
      'The Godfather - Vito Corleone Dynasty',
      'Inception - The Spinning Totem Dream',
      'Dune Part Two - Arrakis Sandworm Rider',
      'Spider-Man - Into The Spider-Verse Leap',
      'The Matrix - Red Pill or Blue Pill',
      'Gladiator - Strength and Honour Rome',
      'Avengers: Endgame - Whatever It Takes',
      'Whiplash - Not Quite My Tempo',
      'Drive - Neon Scorpion Jacket'
    ]
  },
  {
    slug: 'messi',
    name: 'Messi',
    folder: 'Messi',
    description: 'Lionel Messi - 8-time Ballon d’Or winner, World Cup champion, and football’s purest magician.',
    titleTemplates: [
      'Lionel Messi - FIFA World Cup 2022 Champion',
      'Messi - The 8th Ballon d’Or King',
      'Lionel Messi - Barcelona Golden Magic',
      'Lionel Messi - Inter Miami Pink Wave',
      'Messi - The Greatest Of All Time',
      'Lionel Messi - Free Kick Perfection',
      'Messi - Iconic Jersey Celebration Bernabeu',
      'Lionel Messi - Argentina Triunfo',
      'Messi - Pure Dribbling Sorcery'
    ]
  },
  {
    slug: 'music-poster',
    name: 'Music Poster',
    folder: 'Music Poster',
    description: 'Rock, hip-hop, indie, and electronic legends that defined generations of sound and culture.',
    titleTemplates: [
      'Pink Floyd - The Dark Side of the Moon Prism',
      'The Beatles - Abbey Road Crossing',
      'A.R. Rahman - The Mozart of Madras',
      'Eminem - The Marshall Mathers Tribute',
      'Daft Punk - Random Access Alive 2007',
      'Nirvana - Nevermind Grunge Heritage',
      'Queen - Freddie Mercury Live Aid Majesty',
      'Bob Marley - One Love Reggae Roots',
      'Travis Scott - Astroworld Rodeo Night',
      'Coldplay - A Sky Full of Stars Glow'
    ]
  },
  {
    slug: 'neymar',
    name: 'Neymar',
    folder: 'Neymar',
    description: 'Neymar Jr. - The Brazilian Samba artist, flair prince, and trick-and-flick entertainer.',
    titleTemplates: [
      'Neymar Jr - Samba Magic Seleção',
      'Neymar Jr - Paris Saint-Germain Flair',
      'Neymar Jr - Golden Boy Santos Origins'
    ]
  },
  {
    slug: 'tamil-movies',
    name: 'Tamil Movies',
    folder: 'Tamil Movies',
    description: 'The powerhouse of Indian cinema: high-voltage thrillers, mass elevations, and unforgettable classics.',
    titleTemplates: [
      'Leo - Bloody Sweet Badass Thalapathy',
      'Jailer - Tiger Muthuvel Pandian Superstar',
      'Vikram - Once Upon a Time LCU Kamal Haasan',
      'Master - JD Dean Swagger Art',
      'Baasha - Classic Superstar Rajinikanth',
      'Ponniyin Selvan - Chola Empire Grandeur',
      'Mankatha - Thala Ajith Kingmaker',
      'Kaithi - Dilli Biryani Night Action',
      'Super Deluxe - Shilpa Cinematic Vision',
      'Aayirathil Oruvan - The Lost Chola King',
      'Asuran - Sivasaami Rage Elevation',
      'Vada Chennai - Anbu North Madras Chronicle'
    ]
  },
  {
    slug: 'vijay',
    name: 'Vijay',
    folder: 'Vijay',
    description: 'Thalapathy Vijay - The undisputed box-office king of Kollywood and commander of millions.',
    titleTemplates: [
      'Thalapathy Vijay - The Greatest of All Time',
      'Vijay - Leo Bloody Sweet Portrait',
      'Thalapathy Vijay - Master JD Glasses Stare',
      'Vijay - Beast Mode RAW Unleashed',
      'Thalapathy Vijay - Mersal Triple Avatar',
      'Vijay - Bigil Michael Rayappan Pride',
      'Thalapathy Vijay - Sarkar Mass Corporate Monster',
      'Vijay - Thuppakki Captain Jagdish Sniper',
      'Thalapathy Vijay - Kaththi Kathiresan & Jeevanandham',
      'Vijay - Ghilli Velu Chennai Nostalgia'
    ]
  },
  {
    slug: 'virat-kohli',
    name: 'Virat Kohli',
    folder: 'Virat Kohli',
    description: 'Virat Kohli - King Kohli, chase master, modern batting deity, and the epitome of cricket passion.',
    titleTemplates: [
      'Virat Kohli - King Kohli 82* vs Pakistan MCG',
      'Virat Kohli - Century Roar Passion',
      'Virat Kohli - RCB Red & Gold Royal Challengers',
      'King Kohli - Test Captain Aggression',
      'Virat Kohli - Modern Master Cover Drive',
      'Virat Kohli - 50th ODI Century Bow Down',
      'King Kohli - The Unstoppable Run Machine',
      'Virat Kohli - World Cup 2023 Player of Tournament',
      'Virat Kohli - The Chase Master Silhouette'
    ]
  },
  {
    slug: 'ajith',
    name: 'Ajith',
    folder: 'Ajith',
    description: 'Ajith Kumar - Thala, ultimate bike racer, speed lover, and charismatic screen titan.',
    titleTemplates: [
      'Ajith Kumar - Mankatha Vinayak Mahadev Money Heist',
      'Thala Ajith - Vidaamuyarchi Grit & Steer',
      'Ajith Kumar - Billa White Tuxedo Style',
      'Thala Ajith - Vedalam Mass Transformation',
      'Ajith Kumar - Viswasam Thookudurai Pride',
      'Thala Ajith - Valimai Superbike Speed'
    ]
  },
  {
    slug: 'anime',
    name: 'Anime',
    folder: 'Anime',
    description: 'World-renowned Japanese anime art prints: shonen power, dark fantasy, and cyberpunk aesthetics.',
    titleTemplates: [
      'Attack on Titan - Eren Yeager Attack Titan',
      'Naruto - Sage of Six Paths Kurama Mode',
      'Demon Slayer - Tanjiro Sun Breathing Flame',
      'One Piece - Monkey D. Luffy Gear 5 Sun God Nika',
      'Jujutsu Kaisen - Gojo Satoru Infinite Void Domain',
      'Death Note - Ryuk Apple Silhouette',
      'Dragon Ball Z - Son Goku Ultra Instinct Aura'
    ]
  }
];

export function seedDatabase() {
  initDatabase();

  console.log('--- Initializing Seed Data ---');

  // 1. Seed Admin & Demo Users
  const userCheck = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (userCheck.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('Admin@12345', salt);
    const demoPasswordHash = bcrypt.hashSync('User@12345', salt);

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, phone, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'user_admin_001',
      'admin@poster35.com',
      adminPasswordHash,
      'Store Administrator',
      '+91 98765 00000',
      'ADMIN'
    );

    insertUser.run(
      'user_demo_002',
      'customer@poster35.com',
      demoPasswordHash,
      'Vikram Karthik',
      '+91 98401 23456',
      'USER'
    );

    console.log('✓ Created default admin (admin@poster35.com / Admin@12345)');
    console.log('✓ Created default customer (customer@poster35.com / User@12345)');
  }

  // 2. Scan folders and seed categories & posters
  const insertCategory = db.prepare(`
    INSERT OR REPLACE INTO categories (id, slug, name, description, image_url, display_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertPoster = db.prepare(`
    INSERT OR REPLACE INTO posters (id, title, slug, description, category_id, price, image_url, is_featured, is_trending, in_stock, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let totalPostersSeeded = 0;

  CATEGORY_DEFINITIONS.forEach((cat, catIdx) => {
    const categoryFolder = path.join(workspaceRoot, cat.folder);
    const categoryId = `cat_${cat.slug}`;

    let posterFiles: string[] = [];
    if (fs.existsSync(categoryFolder)) {
      posterFiles = fs
        .readdirSync(categoryFolder)
        .filter((file) => /\.(jpe?g|png|webp)$/i.test(file));
    }

    // Category hero thumbnail
    const firstImage = posterFiles.length > 0 ? `/api/posters/image/${cat.slug}/${encodeURIComponent(posterFiles[0])}` : '';

    insertCategory.run(
      categoryId,
      cat.slug,
      cat.name,
      cat.description,
      firstImage,
      catIdx + 1
    );

    posterFiles.forEach((file, fileIdx) => {
      const templateIdx = fileIdx % cat.titleTemplates.length;
      const baseTitle = cat.titleTemplates[templateIdx];
      const title = fileIdx < cat.titleTemplates.length ? baseTitle : `${baseTitle} (Vol. ${Math.floor(fileIdx / cat.titleTemplates.length) + 1} - #${fileIdx + 1})`;
      const posterId = `pst_${cat.slug}_${fileIdx + 1}`;
      const posterSlug = `${cat.slug}-${fileIdx + 1}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
      const imageUrl = `/api/posters/image/${cat.slug}/${encodeURIComponent(file)}`;

      const isFeatured = fileIdx === 0 || fileIdx === 1 ? 1 : 0;
      const isTrending = (fileIdx % 3 === 0) ? 1 : 0;
      const tags = `${cat.name}, poster, 300gsm, art, ${cat.slug}`;

      insertPoster.run(
        posterId,
        title,
        posterSlug,
        `Premium 300 GSM Matte finish poster of ${title}. Perfect for bedrooms, offices, living spaces, and studios. High definition printing with anti-glare finish. Fixed price of ₹35.`,
        categoryId,
        35, // ₹35 per poster
        imageUrl,
        isFeatured,
        isTrending,
        1,
        tags
      );

      totalPostersSeeded++;
    });
  });

  console.log(`✓ Seeded ${CATEGORY_DEFINITIONS.length} categories`);
  console.log(`✓ Seeded ${totalPostersSeeded} real posters from local workspace folders!`);
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase();
}
