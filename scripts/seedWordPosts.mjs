/**
 * Seed script — pushes Word of the Day posts into Firestore `posts` collection.
 *
 * Setup (one time):
 *   npm install --save-dev dotenv
 *
 * Run:
 *   node scripts/seedWordPosts.mjs
 *
 * It reads Firebase config from your .env file (VITE_FIREBASE_* keys).
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Load .env manually (no dotenv dependency needed) ─────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dir, '../.env')
const envLines = readFileSync(envPath, 'utf8').split('\n')
for (const line of envLines) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const [key, ...rest] = trimmed.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

// ── Firebase init ─────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db  = getFirestore(app)

// ── Word data ─────────────────────────────────────────────────────────────────

const words = [
  {
    word: 'Taciturn',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Habitually silent, reserved, or uncommunicative.',
    wordExample: 'He was taciturn by nature — you could never tell what he was thinking.',
    tags: ['personality', 'communication'],
  },
  {
    word: 'Razzmatazz',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'Extravagant, noisy, or showy activity intended to attract attention or impress.',
    wordExample: 'The launch event was all razzmatazz — dazzling lights, celebrity appearances, and flashy graphics.',
    tags: ['spectacle', 'energy'],
  },
  {
    word: 'Pompous',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Excessively self-important or self-congratulatory in speech or manner.',
    wordExample: 'His pompous tone in meetings made it hard for others to offer suggestions.',
    tags: ['personality', 'attitude'],
  },
  {
    word: 'Flummery',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'Empty compliments or meaningless flattery; nonsense.',
    wordExample: 'The speech was pure flummery — not a single concrete proposal.',
    tags: ['language', 'rhetoric'],
  },
  {
    word: 'Bombast',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'High-sounding language with little meaning; inflated speech.',
    wordExample: 'His presentation was full of bombast but short on actual data.',
    tags: ['language', 'rhetoric'],
  },
  {
    word: 'Vertiginous',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Causing dizziness or a sensation of whirling; relating to vertigo.',
    wordExample: 'The vertiginous drop from the cliff made even the experienced climbers step back.',
    tags: ['sensation', 'intensity'],
  },
  {
    word: 'Rapprochement',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'The re-establishment of harmonious relations after a period of hostility. Pronounced "rah-PROSH-mohn" (French origin).',
    wordExample: 'After years of rivalry, a rapprochement between the two tech giants surprised the industry.',
    tags: ['diplomacy', 'relations', 'french-origin'],
  },
  {
    word: 'Bellicose',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Demonstrating aggression and willingness to fight.',
    wordExample: 'His bellicose response to the negotiations derailed any chance of a peaceful settlement.',
    tags: ['conflict', 'attitude'],
  },
  {
    word: 'Shibboleth',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A custom, word, or practice that distinguishes one group from another; a long-standing belief held by a group.',
    wordExample: 'Using corporate jargon became a shibboleth for new hires trying to fit into the culture.',
    tags: ['culture', 'identity'],
  },
  {
    word: 'Détente',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'The easing of hostility or strained relations between countries or groups. Pronounced "day-TAHNT" (French origin).',
    wordExample: 'The summit marked a turning point — a genuine détente after decades of cold tension.',
    tags: ['diplomacy', 'politics', 'french-origin'],
  },
  {
    word: 'Trifecta',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A set of three wins, achievements, or things accomplished at once.',
    wordExample: 'They achieved a trifecta — record revenue, best employee scores, and lowest attrition, all in one quarter.',
    tags: ['achievement', 'business'],
  },
  {
    word: 'Malleable',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Easily shaped or bent; adaptable; easily influenced.',
    wordExample: 'Young minds are malleable — which is why early education matters so much.',
    tags: ['flexibility', 'character'],
  },
  {
    word: 'Scientism',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'The belief that science is the only source of true knowledge, dismissing all other ways of knowing.',
    wordExample: 'His arguments bordered on scientism — he refused to acknowledge any evidence that couldn\'t be measured.',
    tags: ['philosophy', 'belief'],
  },
  {
    word: 'Unmoored',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Lacking stability or emotional grounding; completely adrift.',
    wordExample: 'After losing her job and moving cities in the same month, she felt utterly unmoored.',
    tags: ['emotion', 'instability'],
  },
  {
    word: 'Heist',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A planned, coordinated theft — typically of high-value items. Unlike a simple theft, a heist implies careful planning and teamwork.',
    wordExample: 'The art heist was executed so flawlessly it was weeks before the museum noticed.',
    tags: ['crime', 'nuance'],
  },
  {
    word: 'Musings',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'Quiet, thoughtful reflections or wandering thoughts.',
    wordExample: 'Her late-night musings often turned into the best ideas by morning.',
    tags: ['thought', 'reflection'],
  },
  {
    word: 'Purport',
    wordPartOfSpeech: 'Verb / Noun',
    wordMeaning: 'To claim or appear to be something (verb); the central meaning or gist (noun).',
    wordExample: 'The document purports to be an official government memo, but its origin is unclear.',
    tags: ['language', 'deception'],
  },
  {
    word: 'Slapdash',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Done hurriedly and carelessly without attention to detail.',
    wordExample: 'The slapdash report was sent to the client before it was proofread — a costly mistake.',
    tags: ['quality', 'work'],
  },
  {
    word: 'Unhinged',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Mentally unstable, wildly erratic, or chaotically unfiltered in behaviour.',
    wordExample: 'His unhinged reaction to the minor delay shocked everyone in the room.',
    tags: ['behaviour', 'emotion'],
  },
  {
    word: 'Unequivocally',
    wordPartOfSpeech: 'Adverb',
    wordMeaning: 'In an absolute, crystal-clear manner, leaving zero room for doubt.',
    wordExample: 'She unequivocally denied any involvement in the decision.',
    tags: ['certainty', 'communication'],
  },
  {
    word: 'Broadside',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A fierce, aggressive verbal or written attack.',
    wordExample: 'The columnist launched a broadside against the government\'s new housing policy.',
    tags: ['conflict', 'communication'],
  },
  {
    word: 'Metaphysical',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Beyond the physical world; relating to the fundamental nature of reality and existence.',
    wordExample: 'He sought metaphysical explanations for events that science couldn\'t explain.',
    tags: ['philosophy', 'abstract'],
  },
  {
    word: 'Prescient',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Having foresight; accurately predicting future events before they happen.',
    wordExample: 'Her prescient warning about data privacy went unheeded — until the breach happened.',
    tags: ['foresight', 'intelligence'],
  },
  {
    word: 'Coterie',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'An exclusive, tight-knit group of people with shared interests.',
    wordExample: 'A small coterie of investors controlled most of the early funding in the sector.',
    tags: ['group', 'exclusivity'],
  },
  {
    word: 'Vigilante',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A person who takes the law into their own hands without legal authority.',
    wordExample: 'The vigilante group patrolled the streets after the police failed to respond.',
    tags: ['justice', 'law'],
  },
  {
    word: 'Consternation',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A feeling of sudden anxiety, dismay, or distress caused by something unexpected.',
    wordExample: 'News of the merger caused consternation among the rank and file employees.',
    tags: ['emotion', 'shock'],
  },
  {
    word: 'Scupper',
    wordPartOfSpeech: 'Verb',
    wordMeaning: 'To deliberately ruin, block, or prevent a plan from succeeding.',
    wordExample: 'A last-minute objection from the board scuppered the entire acquisition deal.',
    tags: ['sabotage', 'plans'],
  },
  {
    word: 'Cede',
    wordPartOfSpeech: 'Verb',
    wordMeaning: 'To formally surrender or give up territory, rights, or authority.',
    wordExample: 'The company had to cede control of three markets to settle the antitrust case.',
    tags: ['power', 'surrender'],
  },
  {
    word: 'Tryst',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A secret or romantic meeting, especially between lovers.',
    wordExample: 'The novel opens with a forbidden tryst at a moonlit garden.',
    tags: ['romance', 'secrecy'],
  },
  {
    word: 'Meteoric',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Brilliantly fast; relating to a sudden and impressive rise.',
    wordExample: 'Her meteoric rise from intern to partner in four years was the talk of the firm.',
    tags: ['success', 'speed'],
  },
  {
    word: 'Totemic',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Sacredly symbolic of a group\'s identity or values.',
    wordExample: 'The old factory building became totemic of the city\'s industrial heritage.',
    tags: ['symbolism', 'culture'],
  },
  {
    word: 'Unfettered',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Unrestricted; free from external restraints or control.',
    wordExample: 'The researcher was given unfettered access to the archives.',
    tags: ['freedom', 'independence'],
  },
  {
    word: 'Tantalising',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Irresistibly tempting or alluring, yet just out of reach.',
    wordExample: 'The tantalising aroma from the kitchen made waiting for dinner unbearable.',
    tags: ['desire', 'sensation'],
  },
  {
    word: 'Archetype',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A quintessential original model or classic example of something.',
    wordExample: 'The wise mentor is a classic archetype in storytelling across cultures.',
    tags: ['pattern', 'literature'],
  },
  {
    word: 'Pivotal',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Crucial and decisive; central to the success of something.',
    wordExample: 'The pivotal moment came when the founder decided to pivot the business model entirely.',
    tags: ['importance', 'decision'],
  },
  {
    word: 'Acquiesce',
    wordPartOfSpeech: 'Verb',
    wordMeaning: 'To accept something reluctantly but without protest. Not enthusiastic agreement — there\'s a quiet, reluctant quality to it.',
    wordExample: 'Faced with no viable alternative, she acquiesced to the new terms.',
    tags: ['agreement', 'compliance'],
  },
  {
    word: 'Parlay',
    wordPartOfSpeech: 'Verb / Noun',
    wordMeaning: 'To turn a small initial advantage or asset into a much larger gain.',
    wordExample: 'She parlayed her viral post into a full media consultancy contract.',
    tags: ['strategy', 'growth'],
  },
  {
    word: 'Pliant',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Easily bent or shaped; adaptable; easily influenced.',
    wordExample: 'The new employee was pliant at first, but grew more assertive after six months.',
    tags: ['flexibility', 'character'],
  },
  {
    word: 'Clique',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A small, exclusive group that deliberately excludes outsiders.',
    wordExample: 'The creative department had become a clique — new ideas from outside were rarely welcome.',
    tags: ['group', 'exclusivity'],
  },
  {
    word: 'Labyrinth',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A complicated network of winding passages designed to confuse; any highly complex situation. Memory trick: think of the Chakravyuha from the Mahabharata.',
    wordExample: 'Navigating the tax compliance process felt like wandering through a bureaucratic labyrinth.',
    tags: ['complexity', 'confusion'],
  },
  {
    word: 'Enthralling',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Captivating; holding someone\'s complete attention.',
    wordExample: 'The documentary was so enthralling that no one moved for two hours.',
    tags: ['fascination', 'attention'],
  },
  {
    word: 'Moniker',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A stylized nickname, alias, or informal name.',
    wordExample: 'He earned the moniker "The Fixer" for resolving every crisis without drama.',
    tags: ['naming', 'identity'],
  },
  {
    word: 'Subterfuge',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'Deceit or trickery used to conceal a goal or evade rules.',
    wordExample: 'The audit revealed he had used subterfuge to hide expenses for years.',
    tags: ['deception', 'strategy'],
  },
  {
    word: 'Purveyor',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A supplier or vendor of goods, services, or ideas.',
    wordExample: 'The newsletter has become a trusted purveyor of quality business insights.',
    tags: ['business', 'supply'],
  },
  {
    word: 'Impasse',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A deadlock; a situation where no progress can be made due to disagreement.',
    wordExample: 'After three rounds of talks, the two sides reached an impasse.',
    tags: ['conflict', 'negotiation'],
  },
  {
    word: 'Recondite',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Little-known, obscure, or highly complex — known only to specialists.',
    wordExample: 'His lectures were too recondite for undergraduates — dense with specialist jargon.',
    tags: ['knowledge', 'obscure'],
  },
  {
    word: 'Vexatious',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Causing annoyance or frustration; in legal contexts, a lawsuit filed purely to harass.',
    wordExample: 'The company dismissed the lawsuit as a vexatious tactic by a rival.',
    tags: ['frustration', 'legal'],
  },
  {
    word: 'Malaise',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A general feeling of discomfort, uneasiness, or illness without a clear cause. Pronounced "mah-LAYZ" (French origin).',
    wordExample: 'An economic malaise gripped the region, stifling new business investment.',
    tags: ['feeling', 'unease', 'french-origin'],
  },
  {
    word: 'Vexillology',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'The scientific study of the history, symbolism, and design of flags.',
    wordExample: 'His passion for vexillology led him to redesign his city\'s flag.',
    tags: ['trivia', 'obscure', 'study'],
  },
  {
    word: 'Emancipation',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'The act of freeing someone from legal, political, or social control.',
    wordExample: 'The emancipation of the workforce from rigid nine-to-five schedules was accelerated by remote work.',
    tags: ['freedom', 'rights'],
  },
  {
    word: 'Luddite',
    wordPartOfSpeech: 'Noun / Adjective',
    wordMeaning: 'A person opposed to new technology or automation. Named after Ned Ludd, who led workers against textile machines during the Industrial Revolution.',
    wordExample: 'Refusing to use the new project management tool, he was jokingly called the team\'s Luddite.',
    tags: ['technology', 'resistance', 'history'],
  },
  {
    word: 'Claque',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A group hired to applaud a performer, or any group offering orchestrated, insincere support.',
    wordExample: 'The rally was padded out with a loud claque of paid supporters.',
    tags: ['group', 'performance', 'deception'],
  },
  {
    word: 'Floccinaucinihilipilification',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'The act of estimating something as completely worthless or unimportant. One of the longest words in the English language.',
    wordExample: 'Her quick dismissal of the business plan was a classic case of floccinaucinihilipilification.',
    tags: ['obscure', 'dismissal', 'long-word'],
  },
  {
    word: 'Salvo',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A simultaneous discharge of artillery; or a sudden burst of criticism or applause.',
    wordExample: 'The opposition launched an opening salvo of accusations before the minister could speak.',
    tags: ['conflict', 'attack', 'rhetoric'],
  },
  {
    word: 'Comeuppance',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A punishment or fate that someone deserves.',
    wordExample: 'After years of cutting corners on safety, the company finally got its comeuppance when the regulator stepped in.',
    tags: ['justice', 'karma'],
  },
  {
    word: 'Mealy-mouthed',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Hesitant to speak clearly or directly; evasive in language.',
    wordExample: 'The mealy-mouthed response from the CEO satisfied no one.',
    tags: ['communication', 'evasion'],
  },
  {
    word: 'Apocryphal',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Of doubtful authenticity, though widely believed to be true.',
    wordExample: 'The story of Newton\'s apple may be apocryphal, but it endures because it illustrates the idea so well.',
    tags: ['authenticity', 'stories'],
  },
  {
    word: 'Cromulent',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Acceptable, legitimate, or perfectly fine. Originally coined humorously in The Simpsons, now recognised in some dictionaries.',
    wordExample: 'While the word sounds made-up, using it in this context is perfectly cromulent.',
    tags: ['humour', 'language', 'pop-culture'],
  },
  {
    word: 'Spoonerism',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A verbal slip where the initial sounds of two words are accidentally swapped.',
    wordExample: 'He announced "a blushing crow" instead of "a crushing blow" — a classic spoonerism.',
    tags: ['language', 'wordplay'],
  },
  {
    word: 'Aptagram',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'An anagram that cleverly describes or relates to the original word.',
    wordExample: '"Astronomer" rearranged into "moon starer" is a perfect aptagram.',
    tags: ['wordplay', 'language'],
  },
  {
    word: 'Blunderbuss',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'An old, short firearm with a flared muzzle; metaphorically, a clumsy or imprecise approach.',
    wordExample: 'His approach to negotiations was a blunderbuss — loud, messy, and damaging to everyone nearby.',
    tags: ['history', 'metaphor', 'clumsiness'],
  },
  {
    word: 'Gumption',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'Practical courage, initiative, and resourcefulness.',
    wordExample: 'It took real gumption to walk into the boardroom and challenge the entire strategy.',
    tags: ['courage', 'character'],
  },
  {
    word: 'Lethologica',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'The temporary inability to recall a word — the "tip-of-the-tongue" phenomenon.',
    wordExample: 'A frustrating case of lethologica struck her mid-sentence, and she couldn\'t retrieve the word "ambivalent."',
    tags: ['memory', 'language', 'psychology'],
  },
  {
    word: 'Fulmination',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A severe verbal outburst or tirade of protest; also literally, an explosion.',
    wordExample: 'His fulmination against the new policy echoed through the office for days.',
    tags: ['anger', 'speech'],
  },
  {
    word: 'Unconscionable',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Unreasonably excessive or lacking moral conscience.',
    wordExample: 'Charging such high fees to vulnerable families is unconscionable.',
    tags: ['ethics', 'morality'],
  },
  {
    word: 'Petrichor',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'The pleasant, earthy scent produced when rain falls on dry soil.',
    wordExample: 'After months of dry heat, the first monsoon downpour filled the air with rich petrichor.',
    tags: ['nature', 'sensation', 'sensory'],
  },
  {
    word: 'Allay',
    wordPartOfSpeech: 'Verb',
    wordMeaning: 'To diminish, soothe, or alleviate fear, doubt, or pain.',
    wordExample: 'The manager\'s transparent briefing did much to allay the team\'s concerns.',
    tags: ['comfort', 'relief'],
  },
  {
    word: 'Rankle',
    wordPartOfSpeech: 'Verb',
    wordMeaning: 'To cause persistent irritation, resentment, or bitterness over time.',
    wordExample: 'His dismissive comment continued to rankle her long after the meeting had ended.',
    tags: ['emotion', 'resentment'],
  },
  {
    word: 'Bête noire',
    wordPartOfSpeech: 'Noun phrase',
    wordMeaning: 'A person or thing that is particularly disliked or feared. French origin — pronounced "bet NWAR".',
    wordExample: 'Public speaking has always been his bête noire.',
    tags: ['fear', 'dislike', 'french-origin'],
  },
  {
    word: 'Precocious',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Showing advanced abilities or maturity at an unusually young age.',
    wordExample: 'The precocious child was solving algebra problems before she\'d started secondary school.',
    tags: ['talent', 'youth'],
  },
  {
    word: 'Riposte',
    wordPartOfSpeech: 'Noun / Verb',
    wordMeaning: 'A quick, clever reply to a criticism or insult.',
    wordExample: 'Her calm but devastating riposte silenced the heckler.',
    tags: ['wit', 'debate', 'communication'],
  },
  {
    word: 'Fathom',
    wordPartOfSpeech: 'Verb / Noun',
    wordMeaning: 'To understand something deeply or after much thought (verb); also a unit of water depth equal to 6 feet (noun).',
    wordExample: 'I cannot fathom why he resigned at the peak of his career.',
    tags: ['understanding', 'depth'],
  },
  {
    word: 'Resfeber',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'The restless, nervous heartbeat of a traveller before a journey — a blend of excitement and anxiety. Swedish origin.',
    wordExample: 'She lay awake the night before her first solo trip, gripped by resfeber.',
    tags: ['travel', 'emotion', 'swedish-origin'],
  },
  {
    word: 'Ubiquitous',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Present, appearing, or found everywhere.',
    wordExample: 'Smartphones have become so ubiquitous that a day without one feels disorienting.',
    tags: ['prevalence', 'commonality'],
  },
  {
    word: 'Eponymous',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Giving one\'s name to something; or named after a particular person or thing.',
    wordExample: 'The singer\'s eponymous debut album remains her best-selling work.',
    tags: ['naming', 'identity'],
  },
  {
    word: 'Reprieve',
    wordPartOfSpeech: 'Noun / Verb',
    wordMeaning: 'A temporary relief or delay from something unpleasant.',
    wordExample: 'The unexpected public holiday was a welcome reprieve from the project crunch.',
    tags: ['relief', 'pause'],
  },
  {
    word: 'Delulu',
    wordPartOfSpeech: 'Adjective / Noun (Slang)',
    wordMeaning: 'Short for "delusional" — holding wildly unrealistic or overly optimistic beliefs.',
    wordExample: 'Expecting a promotion after one month on the job? That\'s pure delulu.',
    tags: ['slang', 'gen-z', 'modern'],
  },
  {
    word: 'Furore',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'An outbreak of public anger, excitement, or intense commotion.',
    wordExample: 'The celebrity\'s offhand remark caused a furore on social media overnight.',
    tags: ['reaction', 'public', 'controversy'],
  },
  {
    word: 'Bellwether',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'An indicator or predictor of future trends. Named after the leading sheep of a flock.',
    wordExample: 'Early-stage startup funding is often a bellwether for the broader tech economy.',
    tags: ['prediction', 'trends', 'business'],
  },
  {
    word: 'Churlish',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Rude, surly, or lacking basic civility.',
    wordExample: 'It would be churlish to refuse their invitation after they went so far out of their way.',
    tags: ['manners', 'rudeness'],
  },
  {
    word: 'Parody',
    wordPartOfSpeech: 'Noun / Verb',
    wordMeaning: 'A humorous or exaggerated imitation of a work, person, or style.',
    wordExample: 'The comedian\'s parody of the press conference was sharper than any editorial.',
    tags: ['humour', 'imitation', 'art'],
  },
  {
    word: 'Aphorism',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A short, pithy statement expressing a general truth or observation.',
    wordExample: '"Actions speak louder than words" is an aphorism that remains true in any era.',
    tags: ['wisdom', 'language', 'philosophy'],
  },
  {
    word: 'Beholden',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Owing gratitude or having an obligation to someone who has helped you. Often carries a slightly negative tone — a constraint on your freedom.',
    wordExample: 'Once he repaid the loan, he was no longer beholden to anyone.',
    tags: ['obligation', 'gratitude'],
  },
  {
    word: 'Wince',
    wordPartOfSpeech: 'Verb / Noun',
    wordMeaning: 'A quick, involuntary grimace or flinch caused by pain or embarrassment.',
    wordExample: 'She winced as the dentist mentioned the word "extraction."',
    tags: ['reaction', 'pain', 'expression'],
  },
  {
    word: 'Echelon',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A level, rank, or grade within an organisation or hierarchy. French origin — pronounced "ESH-uh-lon", not "ECH-uh-lon".',
    wordExample: 'Only those in the upper echelons of the company were invited to the strategy offsite.',
    tags: ['hierarchy', 'organisation', 'french-origin'],
  },
  {
    word: 'Prosaic',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Lacking imagination or flair; dull and ordinary.',
    wordExample: 'The prosaic writing in the report failed to do justice to the bold ideas within it.',
    tags: ['dullness', 'writing'],
  },
  {
    word: 'Badinage',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'Light, playful banter or good-natured teasing. French origin — pronounced "BAD-in-ahzh".',
    wordExample: 'The easy badinage between the two hosts made the podcast a joy to listen to.',
    tags: ['humour', 'conversation', 'french-origin'],
  },
  {
    word: 'Indefatigable',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Untiring; persisting without giving up regardless of effort required.',
    wordExample: 'Her indefatigable campaigning over five years finally changed the policy.',
    tags: ['persistence', 'determination'],
  },
  {
    word: 'Finesse',
    wordPartOfSpeech: 'Noun / Verb',
    wordMeaning: 'Impressive skill, tact, or delicate handling of a difficult situation.',
    wordExample: 'She handled the angry client with such finesse that he ended up extending his contract.',
    tags: ['skill', 'diplomacy'],
  },
  {
    word: 'Laconic',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Using very few words; brief and concise, sometimes to the point of seeming blunt.',
    wordExample: 'His laconic reply — a single raised eyebrow — told me everything I needed to know.',
    tags: ['communication', 'brevity'],
  },
  {
    word: 'Burnish',
    wordPartOfSpeech: 'Verb',
    wordMeaning: 'To polish metal until shiny; figuratively, to enhance or improve one\'s reputation or skills.',
    wordExample: 'He volunteered for every high-profile project to burnish his credentials before applying for the senior role.',
    tags: ['reputation', 'improvement'],
  },
  {
    word: 'Approbation',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'Formal approval, praise, or official sanction.',
    wordExample: 'The design received the enthusiastic approbation of the review committee.',
    tags: ['approval', 'praise'],
  },
  {
    word: 'Purge',
    wordPartOfSpeech: 'Verb / Noun',
    wordMeaning: 'To cleanse or remove abruptly; to rid of something undesirable.',
    wordExample: 'The company purged thousands of inactive accounts from its database.',
    tags: ['removal', 'cleansing'],
  },
  {
    word: 'Fraught',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Filled with or characterised by problems, stress, or tension.',
    wordExample: 'The merger talks were fraught with suspicion from the very first meeting.',
    tags: ['tension', 'stress'],
  },
  {
    word: 'Inane',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Silly, empty, or lacking any intelligence or purpose.',
    wordExample: 'The inane small talk at networking events exhausted him more than the actual work.',
    tags: ['stupidity', 'emptiness'],
  },
  {
    word: 'Pique',
    wordPartOfSpeech: 'Verb / Noun',
    wordMeaning: 'To arouse interest or curiosity (verb); also a feeling of irritation from wounded pride (noun). Two very different meanings — context is key!',
    wordExample: 'The unusual title of the article piqued her curiosity. / She left the room in a fit of pique after her suggestion was ignored.',
    tags: ['curiosity', 'emotion', 'dual-meaning'],
  },
  {
    word: 'Kerfuffle',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'A minor commotion, fuss, or disturbance — usually over something not very important.',
    wordExample: 'There was a brief kerfuffle at the gate when two passengers both claimed the same seat.',
    tags: ['commotion', 'drama'],
  },
  {
    word: 'Tenuous',
    wordPartOfSpeech: 'Adjective',
    wordMeaning: 'Weak, uncertain, or not strongly supported.',
    wordExample: 'The connection between the two events was tenuous at best.',
    tags: ['weakness', 'uncertainty'],
  },
  {
    word: 'Anachronism',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'Something placed in a time period where it does not belong; a person or thing that seems outdated.',
    wordExample: 'A fax machine in a modern tech office is a glaring anachronism.',
    tags: ['time', 'history', 'outdated'],
  },
  {
    word: 'Acquiescence',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'Reluctant or passive acceptance of something without protest.',
    wordExample: 'Her silence was mistaken for acquiescence, though she disagreed entirely.',
    tags: ['agreement', 'compliance'],
  },
  {
    word: 'Meld',
    wordPartOfSpeech: 'Verb',
    wordMeaning: 'To combine, merge, or blend distinct elements into a harmonious whole.',
    wordExample: 'The chef\'s signature dish melds Indian spices with French technique.',
    tags: ['combination', 'fusion'],
  },
  {
    word: 'Cambrian explosion',
    wordPartOfSpeech: 'Noun phrase',
    wordMeaning: 'Literally, an evolutionary event ~541 million years ago when complex life rapidly diversified. Metaphorically, any sudden burst of innovation or proliferation.',
    wordExample: 'The release of open-source AI models triggered a Cambrian explosion of new applications.',
    tags: ['science', 'innovation', 'metaphor'],
  },
  {
    word: 'Ebbs and flows',
    wordPartOfSpeech: 'Idiom',
    wordMeaning: 'Natural cycles of rise and fall; recurring fluctuations.',
    wordExample: 'Every long-term relationship has its ebbs and flows — the key is staying committed through both.',
    tags: ['cycles', 'change'],
  },
  {
    word: 'Salami slicing',
    wordPartOfSpeech: 'Idiom',
    wordMeaning: 'Achieving a big objective through tiny, barely noticeable incremental steps.',
    wordExample: 'The policy changes were introduced through salami slicing — each step small enough to avoid resistance.',
    tags: ['strategy', 'tactics', 'politics'],
  },
  {
    word: 'Canary in the coal mine',
    wordPartOfSpeech: 'Idiom',
    wordMeaning: 'An early warning sign of impending danger or broader trouble.',
    wordExample: 'Falling customer satisfaction scores were the canary in the coal mine for what became a major churn crisis.',
    tags: ['warning', 'signal', 'idiom'],
  },
  {
    word: 'Punch above one\'s weight',
    wordPartOfSpeech: 'Idiom',
    wordMeaning: 'To achieve at a level far beyond what your size or resources would suggest.',
    wordExample: 'The small regional firm was punching above its weight by winning contracts away from national players.',
    tags: ['achievement', 'underdog', 'idiom'],
  },
  {
    word: 'Draw a line in the sand',
    wordPartOfSpeech: 'Idiom',
    wordMeaning: 'To establish a firm boundary that must not be crossed.',
    wordExample: 'Management finally drew a line in the sand on remote work — five days in office, no exceptions.',
    tags: ['boundary', 'limits', 'idiom'],
  },
  {
    word: 'Zig while others zag',
    wordPartOfSpeech: 'Idiom',
    wordMeaning: 'To deliberately move in the opposite direction to the crowd or popular trend.',
    wordExample: 'When everyone was cutting prices, they zigged while others zagged and doubled down on quality.',
    tags: ['strategy', 'contrarian', 'idiom'],
  },
  {
    word: 'Read the tea leaves',
    wordPartOfSpeech: 'Idiom',
    wordMeaning: 'To predict the future by interpreting small, subtle signals or clues.',
    wordExample: 'Investors are reading the tea leaves of the central bank\'s tone to anticipate rate changes.',
    tags: ['prediction', 'analysis', 'idiom'],
  },
  {
    word: 'Baptism by fire',
    wordPartOfSpeech: 'Idiom',
    wordMeaning: 'A difficult first experience that forces rapid learning.',
    wordExample: 'Taking over the project the day before launch was a true baptism by fire.',
    tags: ['experience', 'challenge', 'idiom'],
  },
  {
    word: 'Petrichor',
    wordPartOfSpeech: 'Noun',
    wordMeaning: 'The pleasant, earthy scent produced when rain falls on dry soil.',
    wordExample: 'After months of dry heat, the first monsoon downpour filled the air with rich petrichor.',
    tags: ['nature', 'sensation', 'sensory'],
  },
]

// ── Seed ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`\nSeeding ${words.length} word posts into Firestore...\n`)
  const postsRef = collection(db, 'posts')

  for (const w of words) {
    const doc = {
      type: 'word',
      status: 'published',

      uid: 'system',
      displayName: 'Word of the Day Club',
      photoURL: '',

      title: w.word,
      body: `**${w.word}** *(${w.wordPartOfSpeech})*\n\n${w.wordMeaning}\n\n> ${w.wordExample}`,
      tags: w.tags,

      word: w.word,
      wordMeaning: w.wordMeaning,
      wordExample: w.wordExample,
      wordPartOfSpeech: w.wordPartOfSpeech,

      likeCount: 0,
      commentCount: 0,
      reactionCounts: {},

      createdAt: Timestamp.now(),
    }

    const ref = await addDoc(postsRef, doc)
    console.log(`  ✓  ${w.word.padEnd(35)} → ${ref.id}`)
  }

  console.log(`\nDone — ${words.length} documents written.\n`)
  process.exit(0)
}

seed().catch(err => {
  console.error('\nSeed failed:', err.message)
  process.exit(1)
})
