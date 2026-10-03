const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Follower = require('./models/Follower');

const sampleUsersData = [
  { name: 'Aditya Kulkarni', username: 'adityak', email: 'aditya@connecthub.com', bio: 'Full-stack enthusiast & coffee addict ☕', profilePic: '/images/avatars/avatar1.png' },
  { name: 'Sarah Miller', username: 'sarahm', email: 'sarah@connecthub.com', bio: 'UI/UX Designer crafting beautiful digital experiences 🎨', profilePic: '/images/avatars/avatar2.png' },
  { name: 'Rohan Malhotra', username: 'rohanm', email: 'rohan@connecthub.com', bio: 'Building scalable Node.js backend systems 🚀', profilePic: '/images/avatars/avatar3.png' },
  { name: 'Meera Krishnan', username: 'meerak', email: 'meera@connecthub.com', bio: 'Tech blogger, reader, & open source contributor 📚', profilePic: '/images/avatars/avatar4.png' },
  { name: 'Michael Brown', username: 'michaelb', email: 'michael@connecthub.com', bio: 'DevOps engineer & cloud architecture fan ☁️', profilePic: '/images/avatars/avatar5.png' },
  { name: 'Olivia Davis', username: 'oliviad', email: 'olivia@connecthub.com', bio: 'Frontend wizard creating CSS magic ✨', profilePic: '/images/avatars/avatar6.png' },
  { name: 'Kavya Iyer', username: 'kavyai', email: 'kavya@connecthub.com', bio: 'Cybersecurity explorer & Python coder 🔐', profilePic: '/images/avatars/avatar7.png' },
  { name: 'Nikhil Bansal', username: 'nikhilb', email: 'nikhil@connecthub.com', bio: 'Mobile developer & gadget enthusiast 📱', profilePic: '/images/avatars/avatar8.png' },
  { name: 'Daniel Martinez', username: 'danielm', email: 'daniel@connecthub.com', bio: 'Data scientist finding patterns in noise 📊', profilePic: '/images/avatars/avatar9.png' },
  { name: 'Emily White', username: 'emilyw', email: 'emily@connecthub.com', bio: 'Computer Science student & ConnectHub creator 💻', profilePic: '/images/avatars/avatar10.png' }
];

// 20 Natural Social Media Captions Perfectly Matched to 20 Diverse Lifestyle Photos
const postSeedList = [
  { caption: 'Slow mornings, good coffee, and nowhere to rush. ☕✨', image: '/images/posts/post1.png' }, // 1. Coffee
  { caption: 'A much-needed break from screens and city noise. Fresh mountain air hits different. 🌲⛰️', image: '/images/posts/post2.png' }, // 2. Mountains
  { caption: 'Found a little piece of paradise this weekend. 🌿🌊', image: '/images/posts/post3.png' }, // 3. Beach
  { caption: 'Some sunsets really don\'t need a filter. 🌅', image: '/images/posts/post4.png' }, // 4. Sunset
  { caption: 'Weekend plans: eat first, decide everything else later. 🍜😋', image: '/images/posts/post5.png' }, // 5. Food / Ramen
  { caption: 'One more chapter turned into three. 📖☕', image: '/images/posts/post6.png' }, // 6. Books
  { caption: 'Someone is refusing to leave the park today. 🐶🍂', image: '/images/posts/post7.png' }, // 7. Pet / Dog
  { caption: 'Spring blooms everywhere around the neighborhood. 🌸🌿', image: '/images/posts/post8.png' }, // 8. Flowers
  { caption: 'Good music makes even an ordinary evening better. 🎶', image: '/images/posts/post9.png' }, // 9. Music
  { caption: 'City lights after dark. Evening stroll through downtown. 🏙️✨', image: '/images/posts/post10.png' }, // 10. City Lights
  { caption: 'Morning 5K done. Nothing beats starting the day with fresh energy. 🏃‍♂️💨', image: '/images/posts/post11.png' }, // 11. Running
  { caption: 'Window seat views above the clouds. Next stop! ✈️☁️', image: '/images/posts/post12.png' }, // 12. Travel / Flight
  { caption: 'Sunny afternoon at the campus library lawn. Perfect spot to study between classes. 🏫☀️', image: '/images/posts/post13.png' }, // 13. College Campus
  { caption: 'Finally fixed that bug after way too many cups of coffee. 💻☕😅', image: '/images/posts/post14.png' }, // 14. Coding 1
  { caption: 'Weekend creative experiment with watercolors. 🎨🖌️', image: '/images/posts/post15.png' }, // 15. Art
  { caption: 'Rainy afternoon vibes. Warm tea and raindrops on the window pane. 🌧️🍵', image: '/images/posts/post16.png' }, // 16. Rainy Day
  { caption: 'Good food and even better company. Loved catching up with everyone tonight! 🥂✨', image: '/images/posts/post17.png' }, // 17. Friends
  { caption: 'Working on a new side project setup tonight. Minimalist & quiet workspace. 🖥️⚡', image: '/images/posts/post18.png' }, // 18. Coding 2
  { caption: 'Reached the peak just in time. The view was worth every step. 🏕️🥾', image: '/images/posts/post19.png' }, // 19. Hiking
  { caption: 'Stumbled upon this hidden bakery around the corner. The croissants are insane 🥐😋', image: '/images/posts/post20.png' }  // 20. Bakery
];

const sampleCommentsText = [
  'Such a peaceful vibe! Love this photo! ✨',
  'Totally agree! Where is this spot located?',
  'Count me in next time! Looks incredible. 💯',
  'That looks so cozy! Enjoy your weekend!',
  'Best feeling ever! 🎉',
  'Coffee + good weather = perfection ☕',
  'Super inspiring post, thanks for sharing!',
  'Looks delicious! Now I am hungry 😂',
  'The colors in this shot are stunning!',
  'Keep up the great work! 🚀',
  'Added this book to my reading list!',
  'Loving the fresh aesthetic on mobile!',
  'Such a great capture!',
  'Need a break like this soon!',
  'Incredible photography lighting.',
  'Have fun! Safe travels! ✈️',
  'Super snappy composition ⚡',
  'Saved this post for inspiration.',
  'Always awesome seeing your updates!',
  'ConnectHub feed is looking super clean!'
];

const seedDatabase = async (shouldExit = true) => {
  try {
    if (shouldExit) {
     await connectDB();
    }

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Follower.deleteMany({});

    console.log('[Seed] Creating 10 users with hashed passwords...');
    const salt = await bcrypt.genSalt(10);
    const commonPassword = await bcrypt.hash('password123', salt);

    const usersToCreate = sampleUsersData.map((u) => ({
      ...u,
      password: commonPassword
    }));

    const createdUsers = await User.insertMany(usersToCreate);
    console.log(`[Seed] Successfully created ${createdUsers.length} users.`);

    console.log('[Seed] Creating 20 unique realistic lifestyle posts...');
    const postsToCreate = [];
    for (let i = 0; i < postSeedList.length; i++) {
      const author = createdUsers[i % createdUsers.length];
      const item = postSeedList[i];
      
      // Select random likes from other users
      const randomLikesCount = (i * 3) % createdUsers.length;
      const likesSet = new Set();
      while (likesSet.size < randomLikesCount) {
        const randomUserIndex = Math.floor(Math.random() * createdUsers.length);
        likesSet.add(createdUsers[randomUserIndex]._id);
      }

      postsToCreate.push({
        author: author._id,
        caption: item.caption,
        image: item.image,
        likes: Array.from(likesSet)
      });
    }

    const createdPosts = await Post.insertMany(postsToCreate);
    console.log(`[Seed] Successfully created ${createdPosts.length} posts.`);

    console.log('[Seed] Creating 40 comments...');
    const commentsToCreate = [];
    for (let i = 0; i < 40; i++) {
      const post = createdPosts[i % createdPosts.length];
      const author = createdUsers[(i * 3 + 1) % createdUsers.length];
      const commentText = sampleCommentsText[i % sampleCommentsText.length];

      commentsToCreate.push({
        post: post._id,
        author: author._id,
        text: commentText
      });
    }

    const createdComments = await Comment.insertMany(commentsToCreate);
    console.log(`[Seed] Successfully created ${createdComments.length} comments.`);

    console.log('[Seed] Creating Follower relationships...');
    const followersToCreate = [];
    for (let i = 0; i < createdUsers.length; i++) {
      const followerUser = createdUsers[i];
      // Each user follows 3 to 5 other users
      for (let j = 1; j <= 4; j++) {
        const followingIndex = (i + j) % createdUsers.length;
        if (followingIndex !== i) {
          followersToCreate.push({
            follower: followerUser._id,
            following: createdUsers[followingIndex]._id
          });
        }
      }
    }

    const createdFollowers = await Follower.insertMany(followersToCreate);
    console.log(`[Seed] Successfully created ${createdFollowers.length} follower connections.`);

    console.log('\n==================================================');
    console.log('✅ DATABASE RE-SEEDED WITH 20 DIVERSE REALISTIC LIFESTYLE POSTS!');
    console.log(`👤 Users: ${createdUsers.length}`);
    console.log(`📝 Posts: ${createdPosts.length} (20 Matched Photos)`);
    console.log(`💬 Comments: ${createdComments.length}`);
    console.log(`🤝 Follow Connections: ${createdFollowers.length}`);
    console.log('🔑 All seed users have password: "password123"');
    console.log('==================================================\n');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Seeding error:', error);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

module.exports = seedDatabase;

if (require.main === module) {
  seedDatabase();
}
