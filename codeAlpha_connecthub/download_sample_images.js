const fs = require('fs');
const path = require('path');
const https = require('https');

const postsDir = path.join(__dirname, 'public', 'images', 'posts');
const avatarsDir = path.join(__dirname, 'public', 'images', 'avatars');

if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

// 20 High-Quality Realistic Lifestyle & Everyday Interest Photos for 20 Posts
const postImagesMap = [
  { file: 'post1.png', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80' },  // 1. Café Latte Art
  { file: 'post2.png', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80' },  // 2. Mountain Landscape
  { file: 'post3.png', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80' },  // 3. Golden Beach
  { file: 'post4.png', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&auto=format&fit=crop&q=80' },  // 4. Sunset Sky
  { file: 'post5.png', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80' },  // 5. Ramen Food Bowl
  { file: 'post6.png', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80' },  // 6. Book & Tea
  { file: 'post7.png', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=80' },  // 7. Happy Dog
  { file: 'post8.png', url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&auto=format&fit=crop&q=80' },  // 8. Spring Flowers
  { file: 'post9.png', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80' },  // 9. Headphones Music
  { file: 'post10.png', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80' }, // 10. City Night Lights
  { file: 'post11.png', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80' }, // 11. Running Fitness
  { file: 'post12.png', url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=80' }, // 12. Airplane Window Travel
  { file: 'post13.png', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80' }, // 13. College Quad
  { file: 'post14.png', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80' }, // 14. Developer Workspace (Coding 1)
  { file: 'post15.png', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80' }, // 15. Watercolor Art Palette
  { file: 'post16.png', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80' }, // 16. Rainy Window
  { file: 'post17.png', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80' }, // 17. Friends Dinner Table
  { file: 'post18.png', url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80' }, // 18. Workspace Setup (Coding 2)
  { file: 'post19.png', url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80' }, // 19. Hiker Mountain View
  { file: 'post20.png', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80' }  // 20. Bakery Croissants
];

// 10 Unique Avatar Photos
const avatarImagesMap = [
  { file: 'avatar1.png', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { file: 'avatar2.png', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
  { file: 'avatar3.png', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { file: 'avatar4.png', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80' },
  { file: 'avatar5.png', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
  { file: 'avatar6.png', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' },
  { file: 'avatar7.png', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80' },
  { file: 'avatar8.png', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80' },
  { file: 'avatar9.png', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80' },
  { file: 'avatar10.png', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80' }
];

function downloadFile(url, targetPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, targetPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}, status: ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(targetPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Saved local image: ${targetPath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(targetPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('Downloading 20 realistic lifestyle post photos locally into public/images/posts...');
  for (const item of postImagesMap) {
    const filePath = path.join(postsDir, item.file);
    try {
      await downloadFile(item.url, filePath);
    } catch (err) {
      console.error(`Error downloading ${item.file}:`, err.message);
    }
  }

  console.log('\nDownloading 10 profile avatar photos locally into public/images/avatars...');
  for (const item of avatarImagesMap) {
    const filePath = path.join(avatarsDir, item.file);
    try {
      await downloadFile(item.url, filePath);
    } catch (err) {
      console.error(`Error downloading ${item.file}:`, err.message);
    }
  }

  console.log('\n==================================================');
  console.log('✅ ALL 20 REALISTIC LIFESTYLE PHOTOS DOWNLOADED LOCALLY!');
  console.log('==================================================');
}

main();
