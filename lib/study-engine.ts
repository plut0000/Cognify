export type SourceType = "pdf" | "notes" | "text";

export type NoteSection = {
  title: string;
  overview: string;
  bullets: string[];
};

export type KeyTerm = {
  term: string;
  context: string;
};

export type Flashcard = {
  id: string;
  question: string;
  answer: string;
  tag: string;
};

export type FlashcardDeck = {
  id: string;
  title: string;
  focus: string;
  createdAt: string;
  cards: Flashcard[];
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type QuizSet = {
  id: string;
  title: string;
  difficulty: "Quick" | "Standard" | "Challenge";
  createdAt: string;
  questions: QuizQuestion[];
  bestScore?: number;
};

export type SlideKind = "title" | "topic" | "recap";

export type Slide = {
  id: string;
  kind: SlideKind;
  title: string;
  subtitle: string;
  bullets: string[];
  notes: string;
};

export type SlideDeck = {
  id: string;
  title: string;
  focus: string;
  createdAt: string;
  slides: Slide[];
};

export type StudyNotebook = {
  id: string;
  title: string;
  sourceName: string;
  sourceType: SourceType;
  pageCount: number | null;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  rawText: string;
  summary: string;
  takeaways: string[];
  sections: NoteSection[];
  keyTerms: KeyTerm[];
  flashcardDecks: FlashcardDeck[];
  quizzes: QuizSet[];
  slideshows: SlideDeck[];
};

type DeckOptions = { title?: string; count?: number; focus?: string };
type QuizOptions = { title?: string; count?: number; difficulty?: QuizSet["difficulty"] };
type SlideOptions = { title?: string; count?: number; focus?: string };

const STOP_WORDS = new Set([
  "about", "after", "again", "against", "also", "among", "because", "been",
  "before", "being", "between", "both", "could", "does", "during", "each",
  "from", "further", "have", "having", "into", "itself", "more", "most",
  "other", "over", "same", "should", "some", "such", "than", "that", "their",
  "them", "then", "there", "these", "they", "this", "those", "through", "under",
  "very", "what", "when", "where", "which", "while", "with", "would", "your",
  "were", "will", "only", "used", "using", "onto", "upon", "within", "notes",
]);

const uid = (prefix: string) => {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
};

const clampText = (value: string, max = 260) => {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const shortened = clean.slice(0, max);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 80 ? lastSpace : max).trim()}…`;
};

const titleCase = (value: string) => value
  .split(/\s+/)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join(" ");

const cleanSourceText = (text: string) => text
  .replace(/\u0000/g, "")
  .replace(/([a-z])-\s+([a-z])/gi, "$1$2")
  .replace(/[ \t]+/g, " ")
  .replace(/\n{3,}/g, "\n\n")
  .trim()
  .slice(0, 160_000);

const splitLongLine = (line: string) => {
  if (line.length <= 520) return [line];
  const words = line.split(/\s+/);
  const chunks: string[] = [];
  for (let index = 0; index < words.length; index += 45) {
    chunks.push(words.slice(index, index + 45).join(" "));
  }
  return chunks;
};

export const splitStudyPoints = (text: string) => {
  const lines = text
    .replace(/\r/g, "")
    .split(/\n+/)
    .map((line) => line.replace(/^\s*(?:[-*•▪◦]+|\d+[.)])\s*/, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return lines.flatMap((line) => {
    const matches = line.match(/[^.!?;]+(?:[.!?;]+|$)/g) ?? [line];
    return matches.flatMap((piece) => splitLongLine(piece.replace(/\s+/g, " ").trim()));
  }).filter((sentence) => sentence.length >= 12 && sentence.length <= 520);
};

const meaningfulWords = (text: string) =>
  (text.toLowerCase().match(/[a-z][a-z'-]{3,}/g) ?? []).filter(
    (word) => !STOP_WORDS.has(word) && !/^\d+$/.test(word),
  );

const topKeywords = (text: string, limit: number) => {
  const counts = new Map<string, number>();
  meaningfulWords(text).forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word);
};

const scorePoints = (points: string[], keywords: string[]) => {
  const keywordSet = new Set(keywords);
  return points.map((sentence, index) => {
    const words = meaningfulWords(sentence);
    const keywordHits = words.filter((word) => keywordSet.has(word)).length;
    const positionBoost = index < 3 ? 2 : index < 8 ? 1 : 0;
    const lengthFit = sentence.length >= 55 && sentence.length <= 260 ? 1.5 : 0;
    return { sentence, index, score: keywordHits * 2 + positionBoost + lengthFit };
  }).sort((a, b) => b.score - a.score || a.index - b.index);
};

const unique = (values: string[]) => [...new Set(values.map((value) => value.trim()).filter(Boolean))];

const deriveTitle = (fileName: string, keywords: string[]) => {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  if (withoutExtension && !/^untitled|^notes?$/i.test(withoutExtension)) return titleCase(withoutExtension);
  return keywords.length ? `${titleCase(keywords.slice(0, 2).join(" "))} Notes` : "New Notebook";
};

const createSections = (text: string, points: string[], keywords: string[]) => {
  const paragraphs = text.split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter((paragraph) => paragraph.length > 90);
  const chunks = paragraphs.length >= 3
    ? paragraphs.slice(0, 7)
    : Array.from({ length: Math.min(6, Math.ceil(points.length / 4)) }, (_, index) =>
        points.slice(index * 4, index * 4 + 4).join(" "),
      ).filter(Boolean);

  return chunks.map((chunk, index): NoteSection => {
    const chunkPoints = splitStudyPoints(chunk);
    const localKeywords = topKeywords(chunk, 3);
    const label = localKeywords[0] ?? keywords[index] ?? `topic ${index + 1}`;
    const ranked = scorePoints(chunkPoints, localKeywords.length ? localKeywords : keywords);
    const bullets = unique(ranked.slice(0, 4).sort((a, b) => a.index - b.index).map((item) => clampText(item.sentence, 220)));
    return {
      title: titleCase(label),
      overview: clampText(ranked[0]?.sentence ?? chunk, 285),
      bullets: bullets.length ? bullets : [clampText(chunk, 220)],
    };
  });
};

const createKeyTerms = (keywords: string[], points: string[]) => keywords.slice(0, 10).map((keyword): KeyTerm => {
  const context = points.find((sentence) => sentence.toLowerCase().includes(keyword));
  return {
    term: titleCase(keyword),
    context: clampText(context ?? `A recurring concept in the source connected to ${keyword}.`, 190),
  };
});

const seededOrder = <T,>(items: T[], seed: number) => [...items].sort((_, __, index = 0) => {
  seed = (seed * 9301 + 49297 + index) % 233280;
  return seed / 233280 - 0.5;
});

const sourceCandidates = (notebook: Pick<StudyNotebook, "rawText" | "keyTerms">, focus = "") => {
  const points = splitStudyPoints(notebook.rawText);
  const focusWords = meaningfulWords(focus);
  const focused = focusWords.length
    ? points.filter((point) => focusWords.some((word) => point.toLowerCase().includes(word)))
    : [];
  return focused.length >= 2 ? unique([...focused, ...points]) : points;
};

export function generateDeck(notebook: StudyNotebook, options: DeckOptions = {}): FlashcardDeck {
  const count = Math.max(4, Math.min(options.count ?? 10, 24));
  const focus = options.focus?.trim() ?? "";
  const points = sourceCandidates(notebook, focus);
  const variant = notebook.flashcardDecks.length;
  const cards: Flashcard[] = [];

  points.forEach((point) => {
    if (cards.length >= count) return;
    const pair = point.match(/^([^:=–—]{2,56})\s*(?::|=|–|—)\s*(.{10,})$/);
    if (!pair) return;
    const term = pair[1].trim();
    cards.push({
      id: uid("card"),
      question: `What is ${term}?`,
      answer: clampText(pair[2], 240),
      tag: focus ? "Focused" : "Definition",
    });
  });

  const termPool = focus
    ? notebook.keyTerms.filter((item) => `${item.term} ${item.context}`.toLowerCase().includes(focus.toLowerCase()))
    : notebook.keyTerms;
  unique([...termPool.map((item) => item.term), ...notebook.keyTerms.map((item) => item.term)]).forEach((term, index) => {
    if (cards.length >= count || cards.some((card) => card.question.toLowerCase().includes(term.toLowerCase()))) return;
    const context = notebook.keyTerms.find((item) => item.term === term)?.context
      ?? points.find((point) => point.toLowerCase().includes(term.toLowerCase()))
      ?? notebook.summary;
    const prompts = [
      `What should you remember about ${term}?`,
      `Explain ${term} in your own words.`,
      `Why is ${term} important in these notes?`,
      `What does the source connect to ${term}?`,
    ];
    cards.push({ id: uid("card"), question: prompts[(index + variant) % prompts.length], answer: clampText(context, 240), tag: index < 3 ? "Key concept" : "Recall" });
  });

  seededOrder(points, 17 + variant * 11).forEach((point, index) => {
    if (cards.length >= count || point.length < 20) return;
    const keyword = topKeywords(point, 2)[index % 2] ?? topKeywords(point, 1)[0];
    if (!keyword || cards.some((card) => card.answer === point)) return;
    const term = titleCase(keyword);
    const prompts = [
      `What do the notes say about ${term}?`,
      `Complete the main idea involving ${term}.`,
      `How would you explain the role of ${term}?`,
      `Recall the key point connected to ${term}.`,
    ];
    cards.push({ id: uid("card"), question: prompts[(index + variant) % prompts.length], answer: clampText(point, 240), tag: focus ? "Focused" : "Source note" });
  });

  while (cards.length < count && cards.length < points.length) {
    const point = points[cards.length];
    cards.push({ id: uid("card"), question: `What is the main idea in note ${cards.length + 1}?`, answer: clampText(point, 240), tag: "Recall" });
  }

  return {
    id: uid("deck"),
    title: options.title?.trim() || (focus ? `${titleCase(focus)} Focus` : `Flashcards ${notebook.flashcardDecks.length + 1}`),
    focus: focus || "All notes",
    createdAt: new Date().toISOString(),
    cards: cards.slice(0, count),
  };
}

export function generateQuiz(notebook: StudyNotebook, options: QuizOptions = {}): QuizSet {
  const difficulty = options.difficulty ?? "Standard";
  const count = Math.max(4, Math.min(options.count ?? 8, 20));
  const variant = notebook.quizzes.length;
  const allCards = unique(notebook.flashcardDecks.flatMap((deck) => deck.cards).map((card) => `${card.question}\u0000${card.answer}`))
    .map((pair) => {
      const [question, answer] = pair.split("\u0000");
      return { question, answer };
    });
  const fallbackDeck = generateDeck(notebook, { count: Math.max(count, 12) });
  const cards = allCards.length >= 4 ? allCards : fallbackDeck.cards;
  const ordered = seededOrder(cards, 31 + variant * 19 + difficulty.length);
  const answerPool = unique(cards.map((card) => clampText(card.answer, 125)));

  const questions = ordered.slice(0, Math.min(count, ordered.length)).map((card, index): QuizQuestion => {
    const correct = clampText(card.answer, 125);
    const pool = seededOrder(answerPool.filter((answer) => answer !== correct), index * 13 + variant * 7 + 5);
    const wrong = unique(pool).slice(0, 3);
    while (wrong.length < 3) {
      wrong.push([
        "The source does not connect this idea to the topic.",
        "It describes the reverse relationship in every case.",
        "It applies only when none of the conditions change.",
      ][wrong.length]);
    }
    const insertAt = (index + variant) % 4;
    const optionsList = [...wrong];
    optionsList.splice(insertAt, 0, correct);
    const prefix = difficulty === "Challenge" ? "Based on the source, " : difficulty === "Quick" ? "Quick check: " : "";
    return {
      id: uid("question"),
      question: `${prefix}${card.question.charAt(0).toLowerCase()}${card.question.slice(1)}`.replace(/^Quick check: what/, "Quick check: What").replace(/^Based on the source, what/, "Based on the source, what"),
      options: optionsList,
      correctIndex: insertAt,
      explanation: card.answer,
    };
  });

  return {
    id: uid("quiz"),
    title: options.title?.trim() || `${difficulty} Quiz ${notebook.quizzes.length + 1}`,
    difficulty,
    createdAt: new Date().toISOString(),
    questions,
  };
}

const samePoint = (left: string, right: string) =>
  left.replace(/\s+/g, " ").trim().toLowerCase() === right.replace(/\s+/g, " ").trim().toLowerCase();

const focusedSections = (notebook: Pick<StudyNotebook, "sections">, focus = "") => {
  const focusWords = meaningfulWords(focus);
  if (!focusWords.length) return notebook.sections;
  const matched = notebook.sections.filter((section) => {
    const haystack = `${section.title} ${section.overview} ${section.bullets.join(" ")}`.toLowerCase();
    return focusWords.some((word) => haystack.includes(word));
  });
  return matched.length ? matched : notebook.sections;
};

export function generateSlideshow(notebook: StudyNotebook, options: SlideOptions = {}): SlideDeck {
  const count = Math.max(4, Math.min(options.count ?? 8, 16));
  const focus = options.focus?.trim() ?? "";
  const variant = notebook.slideshows?.length ?? 0;
  const sections = seededOrder(focusedSections(notebook, focus), 41 + variant * 13);
  const points = sourceCandidates(notebook, focus);
  const slides: Slide[] = [];
  const usedTitles = new Set<string>();
  const addSlide = (slide: Slide) => {
    const key = slide.title.replace(/\s+/g, " ").trim().toLowerCase();
    if (!key || usedTitles.has(key)) return false;
    usedTitles.add(key);
    slides.push(slide);
    return true;
  };

  addSlide({
    id: uid("slide"),
    kind: "title",
    title: notebook.title,
    subtitle: clampText(notebook.summary, 220),
    bullets: unique(notebook.takeaways.slice(0, 3).map((item) => clampText(item, 140))),
    notes: clampText(`Open with the big picture from ${notebook.sourceName}. ${notebook.summary}`, 320),
  });

  sections.forEach((section) => {
    if (slides.length >= count - 1) return;
    const subtitle = clampText(section.overview, 140);
    const bullets = unique(section.bullets.map((item) => clampText(item, 180)))
      .filter((item) => !samePoint(item, subtitle))
      .slice(0, 4);
    addSlide({
      id: uid("slide"),
      kind: "topic",
      title: section.title,
      subtitle,
      bullets,
      notes: clampText(section.overview, 280),
    });
  });

  if (slides.length < count - 1 && notebook.keyTerms.length) {
    const terms = (focus
      ? notebook.keyTerms.filter((item) => `${item.term} ${item.context}`.toLowerCase().includes(focus.toLowerCase()))
      : notebook.keyTerms);
    const bullets = unique((terms.length ? terms : notebook.keyTerms).slice(0, 5).map((item) =>
      clampText(`${item.term}: ${item.context}`, 180),
    ));
    if (bullets.length) {
      addSlide({
        id: uid("slide"),
        kind: "topic",
        title: "Key terms",
        subtitle: "Vocabulary grounded in these notes",
        bullets,
        notes: "Pause here and ask the class to define each term before revealing the next slide.",
      });
    }
  }

  seededOrder(points, 23 + variant * 7).forEach((point, index) => {
    if (slides.length >= count - 1) return;
    const keyword = topKeywords(point, 2)[index % 2] ?? topKeywords(point, 1)[0];
    if (!keyword) return;
    const related = points.filter((candidate) => candidate !== point && candidate.toLowerCase().includes(keyword)).slice(0, 3);
    const bullets = unique([clampText(point, 180), ...related.map((item) => clampText(item, 180))]).slice(0, 4);
    if (bullets.length < 2) return;
    addSlide({
      id: uid("slide"),
      kind: "topic",
      title: titleCase(keyword),
      subtitle: "",
      bullets,
      notes: clampText(`This slide is drawn from the source discussion of ${keyword}.`, 220),
    });
  });

  addSlide({
    id: uid("slide"),
    kind: "recap",
    title: "What to remember",
    subtitle: focus ? `Focus: ${titleCase(focus)}` : "Highest-value points from this notebook",
    bullets: unique((focus
      ? points.slice(0, 5)
      : notebook.takeaways).map((item) => clampText(item, 180))).slice(0, 5),
    notes: "Close by asking students to restate one takeaway in their own words.",
  });

  return {
    id: uid("slides"),
    title: options.title?.trim() || (focus ? `${titleCase(focus)} Slides` : `Slideshow ${(notebook.slideshows?.length ?? 0) + 1}`),
    focus: focus || "All notes",
    createdAt: new Date().toISOString(),
    slides: slides.slice(0, count),
  };
}

export function generateNotebook(
  rawText: string,
  sourceName: string,
  sourceType: SourceType,
  pageCount: number | null = null,
  preferredTitle = "",
): StudyNotebook {
  const text = cleanSourceText(rawText);
  const points = splitStudyPoints(text);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (text.length < 45 || wordCount < 8 || points.length < 2) {
    throw new Error("Add at least two note points (about 8 words total) so there is enough material to build a notebook.");
  }

  const keywords = topKeywords(text, 14);
  const ranked = scorePoints(points, keywords);
  const summaryPoints = ranked.slice(0, 5).sort((a, b) => a.index - b.index).map((item) => item.sentence);
  const now = new Date().toISOString();
  const notebook: StudyNotebook = {
    id: uid("notebook"),
    title: preferredTitle.trim() || deriveTitle(sourceName, keywords),
    sourceName,
    sourceType,
    pageCount,
    wordCount,
    createdAt: now,
    updatedAt: now,
    rawText: text,
    summary: clampText(summaryPoints.join(" "), 680),
    takeaways: unique(ranked.slice(0, 8).map((item) => clampText(item.sentence, 210))).slice(0, 6),
    sections: createSections(text, points, keywords),
    keyTerms: createKeyTerms(keywords, points),
    flashcardDecks: [],
    quizzes: [],
    slideshows: [],
  };
  const firstDeck = generateDeck(notebook, { title: "Core Concepts", count: Math.min(10, Math.max(6, points.length)) });
  notebook.flashcardDecks = [firstDeck];
  notebook.quizzes = [generateQuiz(notebook, { title: "First Practice Quiz", count: Math.min(8, firstDeck.cards.length), difficulty: "Standard" })];
  notebook.slideshows = [generateSlideshow(notebook, {
    title: "Class Slideshow",
    count: Math.min(10, Math.max(6, notebook.sections.length + 2)),
  })];
  return notebook;
}

export function buildLocalStudyAnswer(notebook: StudyNotebook, question: string) {
  const query = question.trim();
  const lower = query.toLowerCase();
  const conversational = lower.replace(/[^a-z0-9\s']/g, " ").replace(/\s+/g, " ").trim();

  if (/^(hi|hello|hey|yo|sup|good morning|good afternoon|good evening)( there)?$/.test(conversational)) {
    return {
      text: `Hey! I’m ready to help with ${notebook.title}. Ask me to explain a topic, summarize the notes, make a study plan, or test you.`,
      citations: [],
    };
  }
  if (/^(thanks|thank you|thx|ty)( so much)?$/.test(conversational)) {
    return { text: "You’re welcome! What should we study next?", citations: [] };
  }
  if (/^(bye|goodbye|see you|later)$/.test(conversational)) {
    return { text: "See you! Your notebook and study tools will be here when you come back.", citations: [] };
  }
  if (/\b(what can you do|how can you help|who are you)\b/.test(conversational) || conversational === "help") {
    return {
      text: `I’m your Study Coach for ${notebook.title}. I can summarize these notes, explain concepts simply, pull out key terms, quiz you, walk through a slideshow, and help you plan what to review.`,
      citations: [],
    };
  }

  const expression = lower
    .replace(/^(?:what(?:'s| is)|calculate|solve)\s+/, "")
    .replace(/[?=\s]/g, "")
    .replace(/[×x]/g, "*")
    .replace(/÷/g, "/");
  const arithmetic = expression.match(/^(-?\d+(?:\.\d+)?)([+\-*/])(-?\d+(?:\.\d+)?)$/);
  if (arithmetic) {
    const left = Number(arithmetic[1]);
    const operator = arithmetic[2];
    const right = Number(arithmetic[3]);
    if (operator === "/" && right === 0) return { text: "That divides by zero, so it doesn’t have a finite answer.", citations: [] };
    const result = operator === "+" ? left + right
      : operator === "-" ? left - right
        : operator === "*" ? left * right
          : left / right;
    const symbol = operator === "*" ? "×" : operator === "/" ? "÷" : operator;
    return { text: `${left} ${symbol} ${right} = ${Number(result.toFixed(8))}`, citations: [] };
  }

  if (/\b(summary|summarize|overview|main idea|big picture)\b/.test(lower)) {
    return { text: `${notebook.summary}\n\nKey points:\n${notebook.takeaways.slice(0, 4).map((item) => `• ${item}`).join("\n")}`, citations: [notebook.sourceName] };
  }
  if (/\b(key terms?|definitions?|vocabulary)\b/.test(lower)) {
    return { text: notebook.keyTerms.slice(0, 7).map((item) => `• ${item.term}: ${item.context}`).join("\n"), citations: [notebook.sourceName] };
  }
  if (/\b(quiz|test me|question me|practice question)\b/.test(lower)) {
    const cards = notebook.flashcardDecks[0]?.cards ?? [];
    const card = cards[query.length % Math.max(1, cards.length)];
    return { text: card ? `Try this without looking at the answer:\n\n${card.question}\n\nWhen you are ready, ask me to explain it.` : "Create a flashcard deck first, then I can quiz you from it.", citations: [notebook.flashcardDecks[0]?.title ?? notebook.sourceName] };
  }
  if (/\b(simple|simply|easy|five year old|eli5)\b/.test(lower)) {
    return { text: `In simple terms: ${clampText(notebook.summary, 360)}\n\nThe most important thing to remember is: ${notebook.takeaways[0] ?? notebook.summary}`, citations: [notebook.sourceName] };
  }

  const queryWords = new Set(meaningfulWords(query));
  const ranked = splitStudyPoints(notebook.rawText).map((point, index) => {
    const pointWords = meaningfulWords(point);
    return { point, index, score: pointWords.filter((word) => queryWords.has(word)).length };
  }).sort((a, b) => b.score - a.score || a.index - b.index);
  const matches = ranked.filter((item) => item.score > 0).slice(0, 3);
  if (!matches.length) {
    const suggestions = notebook.keyTerms.slice(0, 4).map((item) => item.term).join(", ");
    return { text: `I couldn’t connect that question to ${notebook.title}. I’m best at helping with this notebook—try asking about ${suggestions}, or ask me to summarize or quiz you.`, citations: [] };
  }
  return {
    text: `Here is what your notes say:\n\n${matches.map((item) => `• ${item.point}`).join("\n")}\n\nA good way to remember it is to connect the repeated terms in these points and explain the relationship in your own words.`,
    citations: [notebook.sourceName],
  };
}

const sampleText = `Cellular respiration is the process cells use to release usable energy from glucose. It occurs through glycolysis, the citric acid cycle, and oxidative phosphorylation.

Glycolysis takes place in the cytoplasm. One glucose molecule is split into two pyruvate molecules, producing a small amount of ATP and NADH.

The citric acid cycle happens in the mitochondrial matrix. It finishes breaking down carbon compounds and transfers high-energy electrons to NADH and FADH2.

The electron transport chain sits in the inner mitochondrial membrane. Electrons move through protein complexes, helping pump hydrogen ions and create a concentration gradient.

ATP synthase uses the hydrogen ion gradient to make ATP. Oxygen is the final electron acceptor and combines with electrons and hydrogen ions to form water.

Aerobic respiration produces much more ATP than fermentation. Fermentation lets glycolysis continue when oxygen is unavailable by regenerating NAD+.`;

export const createSampleNotebook = () =>
  generateNotebook(sampleText, "Cellular Respiration — Unit 3.pdf", "pdf", 7, "Cellular Respiration");
