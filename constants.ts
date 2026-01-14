import { WordPair } from './types';

export const DEFAULT_WORDS: WordPair[] = [
  // === QUALITIES & PERSONALITY ===
  { id: '1', ru: 'талантливый', en: 'talented', category: 'Qualities', difficulty: 'easy' },
  { id: '2', ru: 'умный, высокоинтеллектуальный', en: 'intelligent', category: 'Qualities', difficulty: 'medium' },
  { id: '3', ru: 'любознательный', en: 'curious', category: 'Qualities', difficulty: 'medium' },
  { id: '26', ru: 'честный', en: 'honest', category: 'Qualities', difficulty: 'easy' },
  { id: '27', ru: 'надёжный', en: 'reliable', category: 'Qualities', difficulty: 'medium' },
  { id: '28', ru: 'терпеливый', en: 'patient', category: 'Qualities', difficulty: 'easy' },
  { id: '29', ru: 'скромный', en: 'modest', category: 'Qualities', difficulty: 'medium' },
  { id: '30', ru: 'упрямый', en: 'stubborn', category: 'Qualities', difficulty: 'medium' },
  { id: '31', ru: 'смелый', en: 'brave', category: 'Qualities', difficulty: 'easy' },
  { id: '32', ru: 'щедрый', en: 'generous', category: 'Qualities', difficulty: 'medium' },

  // === LIFE & TIME ===
  { id: '4', ru: 'вся жизнь, целая жизнь', en: 'lifetime', category: 'Life', difficulty: 'easy' },
  { id: '33', ru: 'детство', en: 'childhood', category: 'Life', difficulty: 'easy' },
  { id: '34', ru: 'юность', en: 'youth', category: 'Life', difficulty: 'medium' },
  { id: '35', ru: 'зрелость', en: 'maturity', category: 'Life', difficulty: 'medium' },
  { id: '36', ru: 'старость', en: 'old age', category: 'Life', difficulty: 'easy' },
  { id: '37', ru: 'судьба', en: 'destiny', category: 'Life', difficulty: 'medium' },
  { id: '38', ru: 'наследие', en: 'legacy', category: 'Life', difficulty: 'hard' },

  // === ACTIONS & VERBS ===
  { id: '5', ru: 'достигать, добиваться', en: 'achieve', category: 'Action', difficulty: 'medium' },
  { id: '7', ru: 'выживать, сохраняться', en: 'survive', category: 'Action', difficulty: 'medium' },
  { id: '8', ru: 'рассматривать, считать', en: 'consider', category: 'Action', difficulty: 'medium' },
  { id: '13', ru: 'сооружать, строить', en: 'construct', category: 'Action', difficulty: 'medium' },
  { id: '39', ru: 'исследовать', en: 'explore', category: 'Action', difficulty: 'medium' },
  { id: '40', ru: 'создавать', en: 'create', category: 'Action', difficulty: 'easy' },
  { id: '41', ru: 'развивать', en: 'develop', category: 'Action', difficulty: 'medium' },
  { id: '42', ru: 'улучшать', en: 'improve', category: 'Action', difficulty: 'medium' },
  { id: '43', ru: 'решать (проблему)', en: 'solve', category: 'Action', difficulty: 'easy' },
  { id: '44', ru: 'обнаруживать', en: 'discover', category: 'Action', difficulty: 'medium' },
  { id: '45', ru: 'изобретать', en: 'invent', category: 'Action', difficulty: 'medium' },
  { id: '46', ru: 'преобразовывать', en: 'transform', category: 'Action', difficulty: 'hard' },
  { id: '47', ru: 'анализировать', en: 'analyze', category: 'Action', difficulty: 'medium' },
  { id: '48', ru: 'предсказывать', en: 'predict', category: 'Action', difficulty: 'medium' },

  // === ADJECTIVES ===
  { id: '6', ru: 'невероятный', en: 'incredible', category: 'Adjectives', difficulty: 'medium' },
  { id: '11', ru: 'точный', en: 'accurate', category: 'Adjectives', difficulty: 'medium' },
  { id: '15', ru: 'подробный, детальный', en: 'detailed', category: 'Adjectives', difficulty: 'medium' },
  { id: '49', ru: 'значительный', en: 'significant', category: 'Adjectives', difficulty: 'hard' },
  { id: '50', ru: 'существенный', en: 'essential', category: 'Adjectives', difficulty: 'hard' },
  { id: '51', ru: 'сложный', en: 'complex', category: 'Adjectives', difficulty: 'medium' },
  { id: '52', ru: 'простой', en: 'simple', category: 'Adjectives', difficulty: 'easy' },
  { id: '53', ru: 'эффективный', en: 'effective', category: 'Adjectives', difficulty: 'medium' },
  { id: '54', ru: 'уникальный', en: 'unique', category: 'Adjectives', difficulty: 'medium' },
  { id: '55', ru: 'современный', en: 'modern', category: 'Adjectives', difficulty: 'easy' },
  { id: '56', ru: 'древний', en: 'ancient', category: 'Adjectives', difficulty: 'medium' },
  { id: '57', ru: 'огромный', en: 'enormous', category: 'Adjectives', difficulty: 'medium' },
  { id: '58', ru: 'крошечный', en: 'tiny', category: 'Adjectives', difficulty: 'easy' },

  // === PROFESSIONS ===
  { id: '9', ru: 'инженер', en: 'engineer', category: 'Professions', difficulty: 'easy' },
  { id: '23', ru: 'скульптор', en: 'sculptor', category: 'Professions', difficulty: 'medium' },
  { id: '24', ru: 'философ', en: 'philosopher', category: 'Professions', difficulty: 'medium' },
  { id: '25', ru: 'геолог', en: 'geologist', category: 'Professions', difficulty: 'medium' },
  { id: '59', ru: 'архитектор', en: 'architect', category: 'Professions', difficulty: 'medium' },
  { id: '60', ru: 'программист', en: 'programmer', category: 'Professions', difficulty: 'easy' },
  { id: '61', ru: 'учёный', en: 'scientist', category: 'Professions', difficulty: 'easy' },
  { id: '62', ru: 'исследователь', en: 'researcher', category: 'Professions', difficulty: 'medium' },
  { id: '63', ru: 'астроном', en: 'astronomer', category: 'Professions', difficulty: 'medium' },
  { id: '64', ru: 'биолог', en: 'biologist', category: 'Professions', difficulty: 'medium' },
  { id: '65', ru: 'математик', en: 'mathematician', category: 'Professions', difficulty: 'hard' },
  { id: '66', ru: 'дизайнер', en: 'designer', category: 'Professions', difficulty: 'easy' },

  // === SCIENCE & TECHNOLOGY ===
  { id: '10', ru: 'промышленность, индустрия', en: 'industry', category: 'Science', difficulty: 'medium' },
  { id: '20', ru: 'материал', en: 'material', category: 'Science', difficulty: 'easy' },
  { id: '67', ru: 'эксперимент', en: 'experiment', category: 'Science', difficulty: 'medium' },
  { id: '68', ru: 'гипотеза', en: 'hypothesis', category: 'Science', difficulty: 'hard' },
  { id: '69', ru: 'теория', en: 'theory', category: 'Science', difficulty: 'medium' },
  { id: '70', ru: 'формула', en: 'formula', category: 'Science', difficulty: 'medium' },
  { id: '71', ru: 'молекула', en: 'molecule', category: 'Science', difficulty: 'medium' },
  { id: '72', ru: 'атом', en: 'atom', category: 'Science', difficulty: 'easy' },
  { id: '73', ru: 'энергия', en: 'energy', category: 'Science', difficulty: 'easy' },
  { id: '74', ru: 'гравитация', en: 'gravity', category: 'Science', difficulty: 'medium' },
  { id: '75', ru: 'вселенная', en: 'universe', category: 'Science', difficulty: 'medium' },
  { id: '76', ru: 'галактика', en: 'galaxy', category: 'Science', difficulty: 'easy' },

  // === ENGINEERING & INVENTIONS ===
  { id: '12', ru: 'система каналов', en: 'canal system', category: 'Engineering', difficulty: 'hard' },
  { id: '18', ru: 'калькулятор', en: 'calculator', category: 'Inventions', difficulty: 'easy' },
  { id: '19', ru: 'парашют', en: 'parachute', category: 'Inventions', difficulty: 'medium' },
  { id: '77', ru: 'механизм', en: 'mechanism', category: 'Engineering', difficulty: 'hard' },
  { id: '78', ru: 'устройство', en: 'device', category: 'Engineering', difficulty: 'medium' },
  { id: '79', ru: 'робот', en: 'robot', category: 'Engineering', difficulty: 'easy' },
  { id: '80', ru: 'алгоритм', en: 'algorithm', category: 'Engineering', difficulty: 'hard' },
  { id: '81', ru: 'двигатель', en: 'engine', category: 'Engineering', difficulty: 'medium' },
  { id: '82', ru: 'спутник', en: 'satellite', category: 'Engineering', difficulty: 'medium' },

  // === ART & CULTURE ===
  { id: '22', ru: 'идеальные пропорции', en: 'perfect proportions', category: 'Art', difficulty: 'hard' },
  { id: '83', ru: 'шедевр', en: 'masterpiece', category: 'Art', difficulty: 'medium' },
  { id: '84', ru: 'творчество', en: 'creativity', category: 'Art', difficulty: 'medium' },
  { id: '85', ru: 'вдохновение', en: 'inspiration', category: 'Art', difficulty: 'medium' },
  { id: '86', ru: 'воображение', en: 'imagination', category: 'Art', difficulty: 'medium' },
  { id: '87', ru: 'красота', en: 'beauty', category: 'Art', difficulty: 'easy' },
  { id: '88', ru: 'гармония', en: 'harmony', category: 'Art', difficulty: 'medium' },

  // === OBJECTS ===
  { id: '21', ru: 'зеркало', en: 'mirror', category: 'Objects', difficulty: 'easy' },
  { id: '89', ru: 'телескоп', en: 'telescope', category: 'Objects', difficulty: 'medium' },
  { id: '90', ru: 'микроскоп', en: 'microscope', category: 'Objects', difficulty: 'medium' },
  { id: '91', ru: 'компас', en: 'compass', category: 'Objects', difficulty: 'easy' },
  { id: '92', ru: 'карта', en: 'map', category: 'Objects', difficulty: 'easy' },

  // === PHRASES & EXPRESSIONS ===
  { id: '14', ru: 'основанный на', en: 'based on', category: 'Phrases', difficulty: 'medium' },
  { id: '16', ru: 'целый ряд, целый спектр', en: 'a whole range', category: 'Phrases', difficulty: 'hard' },
  { id: '17', ru: 'опередившие свое время', en: 'ahead of their time', category: 'Phrases', difficulty: 'hard' },
  { id: '93', ru: 'с другой стороны', en: 'on the other hand', category: 'Phrases', difficulty: 'medium' },
  { id: '94', ru: 'в результате', en: 'as a result', category: 'Phrases', difficulty: 'medium' },
  { id: '95', ru: 'например', en: 'for example', category: 'Phrases', difficulty: 'easy' },
  { id: '96', ru: 'тем не менее', en: 'nevertheless', category: 'Phrases', difficulty: 'hard' },
  { id: '97', ru: 'более того', en: 'moreover', category: 'Phrases', difficulty: 'hard' },
  { id: '98', ru: 'другими словами', en: 'in other words', category: 'Phrases', difficulty: 'medium' },

  // === SPACE ===
  { id: '99', ru: 'космос', en: 'space', category: 'Space', difficulty: 'easy' },
  { id: '100', ru: 'планета', en: 'planet', category: 'Space', difficulty: 'easy' },
  { id: '101', ru: 'звезда', en: 'star', category: 'Space', difficulty: 'easy' },
  { id: '102', ru: 'орбита', en: 'orbit', category: 'Space', difficulty: 'medium' },
  { id: '103', ru: 'астероид', en: 'asteroid', category: 'Space', difficulty: 'medium' },
  { id: '104', ru: 'комета', en: 'comet', category: 'Space', difficulty: 'medium' },
  { id: '105', ru: 'чёрная дыра', en: 'black hole', category: 'Space', difficulty: 'medium' },
  { id: '106', ru: 'туманность', en: 'nebula', category: 'Space', difficulty: 'hard' },
  { id: '107', ru: 'космонавт', en: 'astronaut', category: 'Space', difficulty: 'easy' },
  { id: '108', ru: 'ракета', en: 'rocket', category: 'Space', difficulty: 'easy' },

  // === EMOTIONS ===
  { id: '109', ru: 'радость', en: 'joy', category: 'Emotions', difficulty: 'easy' },
  { id: '110', ru: 'грусть', en: 'sadness', category: 'Emotions', difficulty: 'easy' },
  { id: '111', ru: 'страх', en: 'fear', category: 'Emotions', difficulty: 'easy' },
  { id: '112', ru: 'гнев', en: 'anger', category: 'Emotions', difficulty: 'easy' },
  { id: '113', ru: 'удивление', en: 'surprise', category: 'Emotions', difficulty: 'easy' },
  { id: '114', ru: 'восторг', en: 'excitement', category: 'Emotions', difficulty: 'medium' },
  { id: '115', ru: 'тревога', en: 'anxiety', category: 'Emotions', difficulty: 'medium' },
  { id: '116', ru: 'гордость', en: 'pride', category: 'Emotions', difficulty: 'medium' },
  { id: '117', ru: 'благодарность', en: 'gratitude', category: 'Emotions', difficulty: 'hard' },

  // === NATURE ===
  { id: '118', ru: 'природа', en: 'nature', category: 'Nature', difficulty: 'easy' },
  { id: '119', ru: 'океан', en: 'ocean', category: 'Nature', difficulty: 'easy' },
  { id: '120', ru: 'гора', en: 'mountain', category: 'Nature', difficulty: 'easy' },
  { id: '121', ru: 'река', en: 'river', category: 'Nature', difficulty: 'easy' },
  { id: '122', ru: 'лес', en: 'forest', category: 'Nature', difficulty: 'easy' },
  { id: '123', ru: 'пустыня', en: 'desert', category: 'Nature', difficulty: 'medium' },
  { id: '124', ru: 'водопад', en: 'waterfall', category: 'Nature', difficulty: 'medium' },
  { id: '125', ru: 'вулкан', en: 'volcano', category: 'Nature', difficulty: 'medium' },

  // === LEARNING & EDUCATION ===
  { id: '126', ru: 'знание', en: 'knowledge', category: 'Education', difficulty: 'medium' },
  { id: '127', ru: 'мудрость', en: 'wisdom', category: 'Education', difficulty: 'medium' },
  { id: '128', ru: 'образование', en: 'education', category: 'Education', difficulty: 'medium' },
  { id: '129', ru: 'навык', en: 'skill', category: 'Education', difficulty: 'easy' },
  { id: '130', ru: 'способность', en: 'ability', category: 'Education', difficulty: 'medium' },
  { id: '131', ru: 'опыт', en: 'experience', category: 'Education', difficulty: 'medium' },
  { id: '132', ru: 'практика', en: 'practice', category: 'Education', difficulty: 'easy' },
  { id: '133', ru: 'успех', en: 'success', category: 'Education', difficulty: 'easy' },
  { id: '134', ru: 'неудача', en: 'failure', category: 'Education', difficulty: 'medium' },
  { id: '135', ru: 'прогресс', en: 'progress', category: 'Education', difficulty: 'easy' },
];

export const COLORS = {
  primary: '#8b5cf6',
  secondary: '#ec4899',
  accent: '#34d399',
  background: '#0f172a',
  surface: '#1e293b'
};

export const ACHIEVEMENTS = {
  FIRST_WORD: '🌟 First Word',
  STREAK_5: '🔥 On Fire (5 streak)',
  STREAK_10: '💫 Unstoppable (10 streak)',
  WORDS_25: '📚 Vocabulary Builder (25 words)',
  WORDS_50: '🎓 Word Master (50 words)',
  WORDS_100: '👑 Lexicon Lord (100 words)',
  BOSS_SLAYER: '⚔️ Boss Slayer',
  SPEED_DEMON: '⚡ Speed Demon',
  SURVIVOR: '❤️ Survivor',
  PERFECT_GAME: '💎 Perfect Game',
};
