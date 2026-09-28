import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

// Uses Application Default Credentials (firebase-admin auto-discovers them
// from GOOGLE_APPLICATION_CREDENTIALS env var or gcloud auth).
// If that fails we initialise with just the projectId — works when the
// local Firebase emulator is running, but for the real project you need
// a service-account key or gcloud auth.
let app
try {
  app = initializeApp({ projectId: 'dhwani-toastmaster-onboarding' })
} catch (e) {
  app = initializeApp({ projectId: 'dhwani-toastmaster-onboarding' }, 'seed')
}

const db = getFirestore(app)

const now = Timestamp.now()
const daysAgo = (n) => Timestamp.fromMillis(now.toMillis() - n * 86_400_000)

// ── Blog Posts ────────────────────────────────────────────────────────────────
const blogPosts = [
  {
    type: 'blog',
    status: 'pinned',
    uid: 'seed-user-1',
    displayName: 'Priya Sharma',
    photoURL: null,
    title: 'How Table Topics Changed the Way I Think on My Feet',
    body: `When I first joined Dhwani Toastmasters, I dreaded Table Topics more than anything else. The idea of standing up with zero preparation and speaking for two minutes felt absolutely terrifying.\n\nBut after six months of showing up every week, something quietly shifted. I started noticing I was handling unexpected questions at work better. My manager would throw a curveball in a meeting, and instead of freezing, I'd take a breath and just... answer. Structured, clear, calm.\n\nThe secret? Table Topics teaches you to trust your own thinking. You learn that you always have something to say — you just need to trust yourself enough to say it.\n\nIf you're new and dreading the Table Topics session, here's my advice: volunteer early. The anxiety of waiting is always worse than the speaking itself. The moment you stand up, the fear drops by half.\n\nSee you at the next meeting — I'll be the one raising my hand first.`,
    tags: ['table-topics', 'public-speaking', 'tips', 'personal-growth'],
    likeCount: 14,
    commentCount: 3,
    reactionCounts: { '👏': 8, '💡': 4, '❤️': 2 },
    featuredOrder: 1,
    createdAt: daysAgo(5),
  },
  {
    type: 'blog',
    status: 'published',
    uid: 'seed-user-2',
    displayName: 'Arjun Mehta',
    photoURL: null,
    title: "The 3-Second Pause: A Speaker's Most Underrated Tool",
    body: `Most new speakers are terrified of silence. The moment they finish a sentence, they rush to fill the gap with "um", "uh", or "so basically". It's instinctive — silence feels like failure.\n\nBut here's what experienced speakers know: a deliberate pause is power.\n\nA 3-second pause after a key point does three things. First, it gives your audience time to absorb what you just said. Second, it signals confidence — only people who are in control of the room can afford to be quiet. Third, it resets your own breathing and lets you think clearly about what comes next.\n\nPractise this: record yourself giving a 2-minute speech. Count how many filler words you use. Then give the same speech again, replacing every filler with a pause. The difference is remarkable.\n\nSilence is not the absence of speaking. It is speaking — just without words.`,
    tags: ['technique', 'delivery', 'filler-words', 'public-speaking'],
    likeCount: 22,
    commentCount: 5,
    reactionCounts: { '🔥': 10, '👏': 6, '💡': 5 },
    createdAt: daysAgo(9),
  },
  {
    type: 'blog',
    status: 'published',
    uid: 'seed-user-3',
    displayName: 'Kavitha Nair',
    photoURL: null,
    title: 'Why I Almost Quit Toastmasters After My First Speech',
    body: `My Ice Breaker was a disaster. Or at least, that's how it felt at the time.\n\nI'd rehearsed it thirty times. I had notes. I had a structure. And then I stood up in front of twelve people and my mind went completely blank for what felt like five full minutes (it was probably four seconds).\n\nI got through it. The feedback was kind — my evaluator pointed out my eye contact was actually decent and my opening line was strong. But I drove home convinced I would never come back.\n\nI did come back. Mostly because a club member sent me a message that evening saying "Your courage to get up there mattered more than any technique. We'll see you next week."\n\nThat message changed everything. Toastmasters isn't about perfect speeches. It's about a room full of people who genuinely want you to succeed. That's rare. Don't quit after one bad day.\n\nTwo years later, I've completed the Presentation Mastery pathway and I mentor new members. The person who almost quit is now the one sending encouraging messages to others.`,
    tags: ['motivation', 'beginners', 'ice-breaker', 'community'],
    likeCount: 31,
    commentCount: 8,
    reactionCounts: { '❤️': 14, '👏': 9, '🎉': 5, '💪': 3 },
    createdAt: daysAgo(14),
  },
  {
    type: 'blog',
    status: 'published',
    uid: 'seed-user-4',
    displayName: 'Rahul Desai',
    photoURL: null,
    title: 'Meeting Roles Explained: What the Grammarian Actually Does',
    body: `New members often pick up the Grammarian role without quite understanding what it involves — and then spend the session frantically scribbling without a clear purpose.\n\nHere's a simple breakdown.\n\nThe Grammarian has three jobs. One: introduce the Word of the Day at the start of the meeting and encourage members to use it. Two: during the meeting, note interesting uses of language — both brilliant turns of phrase AND grammatical slips. Three: at the end, give a short report covering all of this.\n\nThe best Grammarians don't just catch mistakes — they celebrate good language. If someone uses a vivid metaphor or finds an elegant way to phrase something complex, call it out. It encourages the whole room to be more intentional with words.\n\nPro tip: bring a small notebook and divide the page into two columns — "Brilliant" and "Bloopers". Your end-of-meeting report practically writes itself.\n\nNext time you take on this role, own it. The Grammarian shapes the linguistic culture of the whole club.`,
    tags: ['meeting-roles', 'grammarian', 'tips', 'how-to'],
    likeCount: 18,
    commentCount: 4,
    reactionCounts: { '💡': 9, '👏': 5 },
    createdAt: daysAgo(21),
  },
]

// ── Word Posts ────────────────────────────────────────────────────────────────
const wordPosts = [
  {
    type: 'word',
    status: 'pinned',
    uid: 'seed-user-2',
    displayName: 'Arjun Mehta',
    photoURL: null,
    title: 'Word of the Week: Ephemeral',
    word: 'Ephemeral',
    wordMeaning: 'Lasting for a very short time; transitory. Used to describe things that exist only briefly and are gone before you can fully appreciate them.',
    wordExample: 'The standing ovation was ephemeral — lasting only thirty seconds — but the speaker carried the feeling with him for years.',
    wordPartOfSpeech: 'adjective',
    body: `"Ephemeral" comes from the Greek "ephemeros" — epi (on) + hemera (day). Literally, it means "lasting only a day".\n\nIn modern usage, ephemeral describes anything fleeting: a rainbow, a child's laughter, the attention of a distracted audience. Good speakers use it to create contrast — pairing the brief moment with its lasting impact.\n\nChallenge: use "ephemeral" in your next Table Topics answer. Notice how it elevates the register of your speech instantly.`,
    tags: ['vocabulary', 'word-of-the-week', 'adjective', 'greek-origin'],
    likeCount: 19,
    commentCount: 6,
    reactionCounts: { '💡': 11, '👏': 5, '🤔': 3 },
    featuredOrder: 2,
    createdAt: daysAgo(3),
  },
  {
    type: 'word',
    status: 'published',
    uid: 'seed-user-3',
    displayName: 'Kavitha Nair',
    photoURL: null,
    title: "Let's Talk About: Loquacious",
    word: 'Loquacious',
    wordMeaning: 'Tending to talk a great deal; talkative. Often used with a slightly humorous or affectionate tone to describe someone who loves the sound of their own voice.',
    wordExample: 'Our Table Topics Master was so loquacious during the introduction that the first speaker barely had time to breathe before their two minutes began.',
    wordPartOfSpeech: 'adjective',
    body: `There is a wonderful irony in introducing the word "loquacious" at a Toastmasters meeting — a room full of people who chose to join a speaking club.\n\nThe word comes from the Latin "loqui" (to speak). Its cousins include "elocution", "eloquent", and "colloquial" — all sharing that same root.\n\nAs speakers, there is a fine line between loquacious (verbose, meandering) and eloquent (expressive, purposeful). The difference is almost always clarity of intent. A loquacious speaker fills time. An eloquent speaker fills meaning.\n\nWhich side of the line do you fall on? Worth asking yourself before your next speech.`,
    tags: ['vocabulary', 'adjective', 'latin-origin', 'humour'],
    likeCount: 25,
    commentCount: 7,
    reactionCounts: { '😂': 12, '👏': 7, '💡': 4 },
    createdAt: daysAgo(7),
  },
  {
    type: 'word',
    status: 'published',
    uid: 'seed-user-1',
    displayName: 'Priya Sharma',
    photoURL: null,
    title: 'Exploring: Perspicacious',
    word: 'Perspicacious',
    wordMeaning: 'Having a ready insight into things; shrewd. Describes someone who quickly notices, understands, or judges things accurately.',
    wordExample: 'The perspicacious evaluator noticed not just the filler words, but the exact moments of nervousness that triggered them.',
    wordPartOfSpeech: 'adjective',
    body: `"Perspicacious" is one of those words that sounds exactly like what it means — sharp, precise, a little bit intimidating.\n\nFrom the Latin "perspicax" (sharp-sighted), it describes a quality every good evaluator and every great leader needs: the ability to see through surface-level performance to what is actually happening underneath.\n\nA perspicacious evaluator doesn't just say "you used too many filler words." They say "I noticed the fillers clustered around transitions — it suggests you've memorised the content of each section but not rehearsed how to connect them."\n\nThat is insight. That is perspicacity.\n\nNext time you evaluate a speech, try to be perspicacious — look for the why behind the what.`,
    tags: ['vocabulary', 'adjective', 'evaluation', 'latin-origin'],
    likeCount: 16,
    commentCount: 4,
    reactionCounts: { '💡': 8, '👏': 5, '🤔': 3 },
    createdAt: daysAgo(12),
  },
  {
    type: 'word',
    status: 'published',
    uid: 'seed-user-4',
    displayName: 'Rahul Desai',
    photoURL: null,
    title: 'Word Spotlight: Mellifluous',
    word: 'Mellifluous',
    wordMeaning: 'Sweet or musical; pleasant to hear. Used to describe a voice, sound, or piece of writing that flows smoothly and is beautiful to listen to.',
    wordExample: 'Her mellifluous voice held the audience rapt even when the content was dense and technical.',
    wordPartOfSpeech: 'adjective',
    body: `From the Latin "mel" (honey) and "fluere" (to flow) — mellifluous literally means "flowing with honey". It is one of the most fitting words in the English language for what we aspire to at Toastmasters.\n\nVocal variety, pacing, tone — all of these contribute to a mellifluous delivery. It is not about having a deep or dramatic voice. It is about a voice that doesn't fight the listener. One that invites rather than demands attention.\n\nInterestingly, mellifluous can also describe writing. A mellifluous sentence has rhythm — the words fall in an order that feels inevitable, like they could not have been arranged any other way.\n\nListen to your favourite speaker this week. Notice the moments when their delivery feels mellifluous — and ask yourself what exactly they are doing to achieve it.`,
    tags: ['vocabulary', 'adjective', 'vocal-variety', 'latin-origin'],
    likeCount: 21,
    commentCount: 5,
    reactionCounts: { '❤️': 9, '👏': 7, '💡': 5 },
    createdAt: daysAgo(18),
  },
]

async function seed() {
  const allPosts = [...blogPosts, ...wordPosts]
  console.log(`Seeding ${allPosts.length} posts to Firestore (admin SDK — bypasses rules)…\n`)

  for (const post of allPosts) {
    try {
      const ref = await db.collection('posts').add(post)
      console.log(`✓  [${post.type.toUpperCase()}${post.status === 'pinned' ? ' 📌' : ''}] "${post.title}"  →  ${ref.id}`)
    } catch (err) {
      console.error(`✗  Failed: "${post.title}"  →  ${err.message}`)
    }
  }

  console.log('\n✅ Done.')
  process.exit(0)
}

seed()
