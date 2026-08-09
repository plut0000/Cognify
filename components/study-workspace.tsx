"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  FileText,
  FileUp,
  FolderOpen,
  Gauge,
  Layers3,
  ListChecks,
  LogOut,
  Menu,
  MessageCircle,
  MoreHorizontal,
  PanelRightClose,
  Plus,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Target,
  TextCursorInput,
  Trash2,
  UploadCloud,
  WandSparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, KeyboardEvent, MouseEvent } from "react";
import { logout } from "@/app/auth-actions";
import {
  buildLocalStudyAnswer,
  createSampleNotebook,
  generateNotebook,
} from "@/lib/study-engine";
import type { FlashcardDeck, QuizSet, StudyNotebook } from "@/lib/study-engine";

type WorkspaceTab = "overview" | "notes" | "flashcards" | "quizzes";
type UploadMode = "file" | "paste";
type GeneratorMode = "flashcards" | "quiz" | null;
type ChatMode = "checking" | "ai" | "local";
type ChatMessage = { id: string; role: "user" | "assistant"; content: string; citations?: string[] };

const WORKSPACE_KEY = "study-focus-workspace-v4";
const CHAT_KEY = "study-focus-chats-v2";
const numberFormat = new Intl.NumberFormat("en-US");

const makeId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const fileSize = (bytes: number) => bytes < 1024 * 1024
  ? `${Math.max(1, Math.round(bytes / 1024))} KB`
  : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

async function extractPdfText(file: File, onProgress: (value: number) => void) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => {
      if (!("str" in item) || typeof item.str !== "string") return "";
      return `${item.str}${"hasEOL" in item && item.hasEOL ? "\n" : " "}`;
    }).join("").replace(/[ \t]+/g, " ").trim();
    if (pageText) pages.push(pageText);
    onProgress(16 + Math.round((pageNumber / pdf.numPages) * 55));
  }
  const text = pages.join("\n\n");
  if (text.replace(/\s+/g, " ").trim().length < 45) {
    throw new Error("I could not find readable text in this PDF. It may be scanned or image-only. Paste the notes instead, or export a PDF with selectable text.");
  }
  return { text, pageCount: pdf.numPages };
}

type StudyWorkspaceProps = {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
};

export default function StudyWorkspace({ user }: StudyWorkspaceProps) {
  const [initialNotebook] = useState<StudyNotebook>(createSampleNotebook);
  const [notebooks, setNotebooks] = useState<StudyNotebook[]>(() => [initialNotebook]);
  const [activeNotebookId, setActiveNotebookId] = useState(initialNotebook.id);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
  const [selectedDeckId, setSelectedDeckId] = useState(initialNotebook.flashcardDecks[0]?.id ?? "");
  const [selectedQuizId, setSelectedQuizId] = useState(initialNotebook.quizzes[0]?.id ?? "");
  const [hydrated, setHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<UploadMode>("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notebookTitle, setNotebookTitle] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingLabel, setProcessingLabel] = useState("Reading your source");
  const [uploadError, setUploadError] = useState("");
  const [generatorMode, setGeneratorMode] = useState<GeneratorMode>(null);
  const [generatorTitle, setGeneratorTitle] = useState("");
  const [generatorCount, setGeneratorCount] = useState(10);
  const [generatorFocus, setGeneratorFocus] = useState("");
  const [generatorDifficulty, setGeneratorDifficulty] = useState<QuizSet["difficulty"]>("Standard");
  const [generatingMaterial, setGeneratingMaterial] = useState(false);
  const [toast, setToast] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<string[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [chatByNotebook, setChatByNotebook] = useState<Record<string, ChatMessage[]>>({});
  const [chatInput, setChatInput] = useState("");
  const [chatThinking, setChatThinking] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("checking");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const accountKey = useMemo(() => user.email.trim().toLowerCase(), [user.email]);
  const workspaceStorageKey = `${WORKSPACE_KEY}:${accountKey}`;
  const chatStorageKey = `${CHAT_KEY}:${accountKey}`;
  const initials = user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "SF";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(workspaceStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as { notebooks?: StudyNotebook[]; activeNotebookId?: string };
          if (Array.isArray(parsed.notebooks) && parsed.notebooks.length) {
            setNotebooks(parsed.notebooks);
            const selected = parsed.notebooks.find((item) => item.id === parsed.activeNotebookId) ?? parsed.notebooks[0];
            setActiveNotebookId(selected.id);
            setSelectedDeckId(selected.flashcardDecks[0]?.id ?? "");
            setSelectedQuizId(selected.quizzes[0]?.id ?? "");
          }
        }
        const savedChats = window.localStorage.getItem(chatStorageKey);
        if (savedChats) setChatByNotebook(JSON.parse(savedChats));
      } catch {
        // A damaged browser cache should never block the study workspace.
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [chatStorageKey, workspaceStorageKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(workspaceStorageKey, JSON.stringify({ notebooks, activeNotebookId }));
  }, [notebooks, activeNotebookId, hydrated, workspaceStorageKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(chatStorageKey, JSON.stringify(chatByNotebook));
  }, [chatByNotebook, hydrated, chatStorageKey]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatByNotebook, chatThinking]);

  const activeNotebook = notebooks.find((item) => item.id === activeNotebookId) ?? notebooks[0];
  const activeDeck = activeNotebook.flashcardDecks.find((item) => item.id === selectedDeckId) ?? activeNotebook.flashcardDecks[0];
  const activeQuiz = activeNotebook.quizzes.find((item) => item.id === selectedQuizId) ?? activeNotebook.quizzes[0];
  const activeCard = activeDeck?.cards[Math.min(cardIndex, Math.max(0, activeDeck.cards.length - 1))];
  const activeQuestion = activeQuiz?.questions[Math.min(quizIndex, Math.max(0, activeQuiz.questions.length - 1))];
  const selectedQuizAnswer = activeQuestion ? quizAnswers[activeQuestion.id] : undefined;
  const pastedWordCount = pasteText.trim().split(/\s+/).filter(Boolean).length;
  const chats = chatByNotebook[activeNotebook.id] ?? [];
  const filteredNotebooks = notebooks.filter((item) => `${item.title} ${item.sourceName}`.toLowerCase().includes(searchQuery.toLowerCase()));
  const quizScore = useMemo(() => activeQuiz?.questions.reduce(
    (score, question) => score + (quizAnswers[question.id] === question.correctIndex ? 1 : 0), 0,
  ) ?? 0, [activeQuiz, quizAnswers]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const resetPractice = () => {
    setCardIndex(0);
    setCardFlipped(false);
    setReviewedCards([]);
    setQuizIndex(0);
    setQuizAnswers({});
    setQuizComplete(false);
  };

  const selectNotebook = (notebook: StudyNotebook) => {
    setActiveNotebookId(notebook.id);
    setSelectedDeckId(notebook.flashcardDecks[0]?.id ?? "");
    setSelectedQuizId(notebook.quizzes[0]?.id ?? "");
    setActiveTab("overview");
    setNavOpen(false);
    resetPractice();
  };

  const updateActiveNotebook = (updater: (notebook: StudyNotebook) => StudyNotebook) => {
    setNotebooks((current) => current.map((item) => item.id === activeNotebook.id
      ? { ...updater(item), updatedAt: new Date().toISOString() }
      : item));
  };

  const chooseFile = (file: File | null) => {
    setUploadError("");
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["pdf", "txt", "md"].includes(extension)) {
      setUploadError("Choose a PDF, TXT, or Markdown file.");
      return;
    }
    if (file.size > 18 * 1024 * 1024) {
      setUploadError("That file is larger than 18 MB. Try a smaller source.");
      return;
    }
    setSelectedFile(file);
    if (!notebookTitle) setNotebookTitle(file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    chooseFile(event.dataTransfer.files?.[0] ?? null);
  };

  const closeUpload = () => {
    if (processing) return;
    setUploadOpen(false);
    setSelectedFile(null);
    setNotebookTitle("");
    setPasteText("");
    setUploadError("");
  };

  const createNotebook = async () => {
    setUploadError("");
    setProcessing(true);
    setProcessingProgress(8);
    try {
      let text = "";
      let sourceName = notebookTitle.trim() || "My class notes";
      let sourceType: StudyNotebook["sourceType"] = "notes";
      let pageCount: number | null = null;
      if (uploadMode === "paste") {
        text = pasteText;
        setProcessingLabel("Organizing your notes");
        setProcessingProgress(60);
      } else {
        if (!selectedFile) throw new Error("Choose a source first.");
        sourceName = selectedFile.name;
        const extension = selectedFile.name.split(".").pop()?.toLowerCase();
        if (extension === "pdf") {
          sourceType = "pdf";
          setProcessingLabel("Reading pages from your PDF");
          const extracted = await extractPdfText(selectedFile, setProcessingProgress);
          text = extracted.text;
          pageCount = extracted.pageCount;
        } else {
          sourceType = extension === "md" ? "notes" : "text";
          setProcessingLabel("Reading your notes");
          text = await selectedFile.text();
          setProcessingProgress(70);
        }
      }
      setProcessingLabel("Building your study workspace");
      setProcessingProgress(86);
      await new Promise((resolve) => window.setTimeout(resolve, 220));
      const notebook = generateNotebook(text, sourceName, sourceType, pageCount, notebookTitle);
      setProcessingProgress(100);
      setNotebooks((current) => [notebook, ...current]);
      setActiveNotebookId(notebook.id);
      setSelectedDeckId(notebook.flashcardDecks[0]?.id ?? "");
      setSelectedQuizId(notebook.quizzes[0]?.id ?? "");
      setActiveTab("overview");
      await new Promise((resolve) => window.setTimeout(resolve, 220));
      closeUpload();
      showToast(`Notebook ready with ${notebook.flashcardDecks[0]?.cards.length ?? 0} cards and a quiz`);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "We could not read that source. Try another file.");
    } finally {
      setProcessing(false);
      setProcessingProgress(0);
      setProcessingLabel("Reading your source");
    }
  };

  const openGenerator = (mode: Exclude<GeneratorMode, null>) => {
    setGeneratorMode(mode);
    setGeneratorTitle("");
    setGeneratorCount(mode === "flashcards" ? 10 : 8);
    setGeneratorFocus("");
    setGeneratorDifficulty("Standard");
  };

  const createMaterial = async () => {
    if (!generatorMode || generatingMaterial) return;
    setGeneratingMaterial(true);

    const previousStudyItems = [
      ...activeNotebook.flashcardDecks.flatMap((deck) => deck.cards.map((card) => ({
        prompt: card.question,
        answer: card.answer,
        explanation: "",
      }))),
      ...activeNotebook.quizzes.flatMap((set) => set.questions.map((question) => ({
        prompt: question.question,
        answer: question.options[question.correctIndex] ?? "",
        explanation: question.explanation,
      }))),
    ].slice(-160);

    if (generatorMode === "flashcards") {
      let deck: FlashcardDeck;
      try {
        const response = await fetch("/api/generate-flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(35_000),
          body: JSON.stringify({
            title: generatorTitle,
            count: generatorCount,
            focus: generatorFocus,
            notebook: {
              title: activeNotebook.title,
              sourceName: activeNotebook.sourceName,
              summary: activeNotebook.summary,
              takeaways: activeNotebook.takeaways,
              keyTerms: activeNotebook.keyTerms,
              sections: activeNotebook.sections,
              rawText: activeNotebook.rawText,
              previousStudyItems,
            },
          }),
        });
        const payload = await response.json() as { deck?: FlashcardDeck };
        if (!response.ok || payload.deck?.cards?.length !== generatorCount) throw new Error("No fresh deck returned");
        deck = payload.deck;
      } catch (error) {
        showToast(error instanceof Error && error.name === "TimeoutError"
          ? "Gemini took too long. Try 5 cards or a shorter note source."
          : "Gemini could not find enough unused facts. Try fewer cards, a new focus, or add more notes.");
        setGeneratingMaterial(false);
        return;
      }

      updateActiveNotebook((notebook) => ({ ...notebook, flashcardDecks: [deck, ...notebook.flashcardDecks] }));
      setSelectedDeckId(deck.id);
      setActiveTab("flashcards");
      setCardIndex(0);
      setCardFlipped(false);
      setReviewedCards([]);
      showToast(`Gemini created “${deck.title}” with ${deck.cards.length} fresh facts and answers`);
      setGeneratingMaterial(false);
      setGeneratorMode(null);
      return;
    }

    let quiz: QuizSet;
    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(35_000),
        body: JSON.stringify({
          title: generatorTitle,
          count: generatorCount,
          difficulty: generatorDifficulty,
          notebook: {
            title: activeNotebook.title,
            sourceName: activeNotebook.sourceName,
            summary: activeNotebook.summary,
            takeaways: activeNotebook.takeaways,
            keyTerms: activeNotebook.keyTerms,
            sections: activeNotebook.sections,
            rawText: activeNotebook.rawText,
            previousQuizItems: previousStudyItems.slice(-120).map((item) => ({
              question: item.prompt,
              correctAnswer: item.answer,
              explanation: item.explanation,
            })),
          },
        }),
      });
      const payload = await response.json() as { quiz?: QuizSet };
      if (!response.ok || payload.quiz?.questions?.length !== generatorCount) throw new Error("No fresh quiz returned");
      quiz = payload.quiz;
    } catch (error) {
      showToast(error instanceof Error && error.name === "TimeoutError"
        ? "Gemini took too long. Try a 5-question quiz or a shorter note source."
        : "Gemini could not find enough fresh questions. Try a smaller quiz or add more notes.");
      setGeneratingMaterial(false);
      return;
    }

    updateActiveNotebook((notebook) => ({ ...notebook, quizzes: [quiz, ...notebook.quizzes] }));
    setSelectedQuizId(quiz.id);
    setActiveTab("quizzes");
    setQuizIndex(0);
    setQuizAnswers({});
    setQuizComplete(false);
    showToast(`Gemini created “${quiz.title}” with ${quiz.questions.length} fresh questions and answers`);
    setGeneratingMaterial(false);
    setGeneratorMode(null);
  };

  const selectDeck = (deck: FlashcardDeck) => {
    setSelectedDeckId(deck.id);
    setCardIndex(0);
    setCardFlipped(false);
    setReviewedCards([]);
  };

  const selectQuiz = (quiz: QuizSet) => {
    setSelectedQuizId(quiz.id);
    setQuizIndex(0);
    setQuizAnswers({});
    setQuizComplete(false);
  };

  const removeDeck = (deckId: string) => {
    if (activeNotebook.flashcardDecks.length <= 1) return showToast("Keep at least one deck in the notebook");
    const remaining = activeNotebook.flashcardDecks.filter((deck) => deck.id !== deckId);
    updateActiveNotebook((notebook) => ({ ...notebook, flashcardDecks: remaining }));
    if (selectedDeckId === deckId) selectDeck(remaining[0]);
    showToast("Flashcard deck removed");
  };

  const removeQuiz = (quizId: string) => {
    if (activeNotebook.quizzes.length <= 1) return showToast("Keep at least one quiz in the notebook");
    const remaining = activeNotebook.quizzes.filter((quiz) => quiz.id !== quizId);
    updateActiveNotebook((notebook) => ({ ...notebook, quizzes: remaining }));
    if (selectedQuizId === quizId) selectQuiz(remaining[0]);
    showToast("Quiz removed");
  };

  const moveCard = (direction: -1 | 1) => {
    if (!activeDeck) return;
    setCardFlipped(false);
    setCardIndex((current) => (current + direction + activeDeck.cards.length) % activeDeck.cards.length);
  };

  const rateCard = (needsReview: boolean) => {
    if (!activeCard) return;
    if (!reviewedCards.includes(activeCard.id)) setReviewedCards((current) => [...current, activeCard.id]);
    if (needsReview) showToast("Marked to review again");
    moveCard(1);
  };

  const chooseQuizAnswer = (answerIndex: number) => {
    if (!activeQuestion || selectedQuizAnswer !== undefined || quizComplete) return;
    setQuizAnswers((current) => ({ ...current, [activeQuestion.id]: answerIndex }));
  };

  const nextQuizQuestion = () => {
    if (!activeQuiz) return;
    if (quizIndex >= activeQuiz.questions.length - 1) {
      setQuizComplete(true);
      updateActiveNotebook((notebook) => ({
        ...notebook,
        quizzes: notebook.quizzes.map((quiz) => quiz.id === activeQuiz.id
          ? { ...quiz, bestScore: Math.max(quiz.bestScore ?? 0, quizScore) }
          : quiz),
      }));
    } else setQuizIndex((current) => current + 1);
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setQuizAnswers({});
    setQuizComplete(false);
  };

  const copySummary = async () => {
    await navigator.clipboard.writeText(activeNotebook.summary);
    showToast("Summary copied");
  };

  const sendChat = async (suggestion?: string) => {
    const question = (suggestion ?? chatInput).trim();
    if (!question || chatThinking) return;
    const userMessage: ChatMessage = { id: makeId("message"), role: "user", content: question };
    setChatByNotebook((current) => ({ ...current, [activeNotebook.id]: [...(current[activeNotebook.id] ?? []), userMessage] }));
    setChatInput("");
    setChatThinking(true);
    let answer: { text: string; citations?: string[] };
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          notebook: {
            title: activeNotebook.title,
            sourceName: activeNotebook.sourceName,
            summary: activeNotebook.summary,
            takeaways: activeNotebook.takeaways,
            keyTerms: activeNotebook.keyTerms,
            sections: activeNotebook.sections,
            rawText: activeNotebook.rawText.slice(0, 24_000),
          },
          history: chats.slice(-6),
        }),
      });
      const result = await response.json() as { answer?: string; citations?: string[]; mode?: "local" };
      if (!response.ok) {
        if (result.mode === "local") setChatMode("local");
        throw new Error("Study engine fallback");
      }
      if (!result.answer) throw new Error("Empty response");
      setChatMode("ai");
      answer = { text: result.answer, citations: result.citations };
    } catch {
      setChatMode((current) => current === "ai" ? current : "local");
      const local = buildLocalStudyAnswer(activeNotebook, question);
      answer = { text: local.text, citations: local.citations };
    }
    const assistantMessage: ChatMessage = { id: makeId("message"), role: "assistant", content: answer.text, citations: answer.citations };
    setChatByNotebook((current) => ({ ...current, [activeNotebook.id]: [...(current[activeNotebook.id] ?? []), assistantMessage] }));
    setChatThinking(false);
  };

  const onChatKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendChat();
    }
  };

  const totalMaterials = activeNotebook.flashcardDecks.length + activeNotebook.quizzes.length;

  return (
    <div className="study-shell">
      <aside className={`library-sidebar ${navOpen ? "open" : ""}`}>
        <div className="brand-row">
          <Image className="brand-logo-image sidebar-brand-logo" src="/cognify-logo.png" alt="" width={32} height={32} priority />
          <div><strong>Cognify</strong><small>LEARN FROM YOUR NOTES</small></div>
          <button className="drawer-close" onClick={() => setNavOpen(false)} aria-label="Close library"><X size={18} /></button>
        </div>

        <button className="new-notebook" onClick={() => setUploadOpen(true)}><Plus size={17} /> New notebook</button>
        <div className="sidebar-label"><span>LIBRARY</span><small>{notebooks.length}</small></div>
        <label className="library-search"><Search size={15} /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search notebooks" aria-label="Search notebooks" /></label>

        <div className="notebook-list">
          {filteredNotebooks.map((notebook) => (
            <button className={`notebook-row ${notebook.id === activeNotebook.id ? "active" : ""}`} key={notebook.id} onClick={() => selectNotebook(notebook)}>
              <span className={`source-glyph ${notebook.sourceType}`}><FileText size={17} /></span>
              <span><strong>{notebook.title}</strong><small>{notebook.flashcardDecks.length} decks · {notebook.quizzes.length} quizzes</small></span>
              <MoreHorizontal size={15} />
            </button>
          ))}
          {!filteredNotebooks.length && <div className="empty-library"><FolderOpen size={23} /><span>No notebooks found</span></div>}
        </div>

        <div className="local-storage-note"><span><Check size={14} /></span><div><strong>Saved on this device</strong><p>Your notebooks return when you reopen the site.</p></div></div>
      </aside>

      <main className="main-workspace">
        <header className="topbar">
          <button className="mobile-control" onClick={() => setNavOpen(true)} aria-label="Open library"><Menu size={19} /></button>
          <div className="breadcrumbs"><span>My library</span><i>/</i><strong>{activeNotebook.title}</strong></div>
          <div className="topbar-actions">
            <button className="topbar-help"><CircleHelp size={16} /> <span>How it works</span></button>
            <button className="mobile-control" onClick={() => setChatOpen(true)} aria-label="Open study coach"><MessageCircle size={18} /></button>
            <form action={logout} className="account-form">
              <button className="account-button" type="submit" title={`Sign out ${user.email}`}>
                {user.image ? <img className="profile-avatar" src={user.image} alt="" referrerPolicy="no-referrer" /> : <span className="profile-avatar">{initials}</span>}
                <span className="account-name">{user.name.split(" ")[0]}</span>
                <LogOut size={14} />
              </button>
            </form>
          </div>
        </header>

        <section className="notebook-header">
          <div className="notebook-identity">
            <span className="big-source-icon"><FileText size={22} /></span>
            <div><div className="eyebrow">ACTIVE NOTEBOOK</div><h1>{activeNotebook.title}</h1><p>{activeNotebook.sourceName} · {numberFormat.format(activeNotebook.wordCount)} words · Updated {shortDate(activeNotebook.updatedAt)}</p></div>
          </div>
          <div className="header-buttons">
            <button onClick={() => setUploadOpen(true)}><Plus size={16} /> Add source</button>
            <button className="primary" onClick={() => openGenerator("flashcards")}><WandSparkles size={16} /> Create study tool</button>
          </div>
        </section>

        <nav className="workspace-tabs" aria-label="Notebook views">
          {([
            ["overview", Gauge, "Overview"],
            ["notes", BookOpen, "Notes"],
            ["flashcards", Layers3, "Flashcards"],
            ["quizzes", ListChecks, "Quizzes"],
          ] as const).map(([value, Icon, label]) => (
            <button className={activeTab === value ? "active" : ""} key={value} onClick={() => setActiveTab(value)}>
              <Icon size={15} /> {label}
              {value === "flashcards" && <span>{activeNotebook.flashcardDecks.length}</span>}
              {value === "quizzes" && <span>{activeNotebook.quizzes.length}</span>}
            </button>
          ))}
        </nav>

        <div className="workspace-scroll">
          {activeTab === "overview" && (
            <div className="overview-page">
              <section className="summary-hero">
                <div className="summary-kicker"><span><Sparkles size={15} /> NOTEBOOK SUMMARY</span><button onClick={copySummary}><Copy size={14} /> Copy</button></div>
                <h2>Start with the big picture.</h2>
                <p>{activeNotebook.summary}</p>
                <div className="summary-stats">
                  <div><strong>{activeNotebook.sections.length}</strong><span>topics organized</span></div>
                  <div><strong>{activeNotebook.keyTerms.length}</strong><span>key terms found</span></div>
                  <div><strong>{totalMaterials}</strong><span>study tools ready</span></div>
                </div>
              </section>

              <div className="overview-grid">
                <section className="quick-create panel-card">
                  <div className="panel-title"><div><WandSparkles size={17} /><span><strong>Make something new</strong><small>Generate as many versions as you need</small></span></div></div>
                  <div className="create-choices">
                    <button onClick={() => openGenerator("flashcards")}><span className="choice-icon purple"><Layers3 size={21} /></span><span><strong>Flashcard deck</strong><small>Choose a focus and card count</small></span><Plus size={17} /></button>
                    <button onClick={() => openGenerator("quiz")}><span className="choice-icon green"><ListChecks size={21} /></span><span><strong>Practice quiz</strong><small>Pick length and difficulty</small></span><Plus size={17} /></button>
                  </div>
                </section>

                <section className="takeaways-card panel-card">
                  <div className="panel-title"><div><Target size={17} /><span><strong>What to remember</strong><small>Highest-value points from this source</small></span></div></div>
                  <ol>{activeNotebook.takeaways.slice(0, 4).map((takeaway, index) => <li key={takeaway}><span>{index + 1}</span><p>{takeaway}</p></li>)}</ol>
                </section>
              </div>

              <section className="materials-section">
                <div className="section-title-row"><div><p>YOUR STUDY TOOLS</p><h2>Ready to practice</h2></div><span>{activeNotebook.flashcardDecks.length} decks · {activeNotebook.quizzes.length} quizzes</span></div>
                <div className="material-cards">
                  {activeNotebook.flashcardDecks.slice(0, 3).map((deck) => (
                    <button key={deck.id} className="material-card" onClick={() => { selectDeck(deck); setActiveTab("flashcards"); }}>
                      <span className="material-icon cards"><Layers3 size={20} /></span>
                      <span className="material-type">FLASHCARDS</span><strong>{deck.title}</strong><small>{deck.cards.length} cards · {deck.focus}</small>
                      <span className="open-material">Study now <ArrowRight size={14} /></span>
                    </button>
                  ))}
                  {activeNotebook.quizzes.slice(0, 3).map((quiz) => (
                    <button key={quiz.id} className="material-card" onClick={() => { selectQuiz(quiz); setActiveTab("quizzes"); }}>
                      <span className="material-icon quiz"><ListChecks size={20} /></span>
                      <span className="material-type">{quiz.difficulty.toUpperCase()} QUIZ</span><strong>{quiz.title}</strong><small>{quiz.questions.length} questions{quiz.bestScore !== undefined ? ` · Best ${quiz.bestScore}/${quiz.questions.length}` : ""}</small>
                      <span className="open-material">Start quiz <ArrowRight size={14} /></span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="notes-page">
              <div className="page-heading"><div><p>GENERATED STUDY GUIDE</p><h2>Structured notes</h2><span>Organized only from the selected source.</span></div><button onClick={copySummary}><Copy size={15} /> Copy summary</button></div>
              <div className="notes-grid">
                <div className="note-sections">
                  {activeNotebook.sections.map((section, index) => (
                    <details className="note-topic" key={`${section.title}-${index}`} open={index < 2}>
                      <summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{section.title}</strong><ChevronDown size={17} /></summary>
                      <div><p>{section.overview}</p><ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></div>
                    </details>
                  ))}
                </div>
                <aside className="terms-panel">
                  <div className="terms-heading"><span><BrainCircuit size={17} /> Key terms</span><small>{activeNotebook.keyTerms.length}</small></div>
                  {activeNotebook.keyTerms.map((item) => <div className="term-item" key={item.term}><strong>{item.term}</strong><p>{item.context}</p></div>)}
                </aside>
              </div>
            </div>
          )}

          {activeTab === "flashcards" && activeDeck && activeCard && (
            <div className="practice-page">
              <div className="page-heading"><div><p>FLASHCARD LIBRARY</p><h2>{activeDeck.title}</h2><span>{activeDeck.cards.length} cards · Focus: {activeDeck.focus}</span></div><button className="accent" onClick={() => openGenerator("flashcards")}><Plus size={16} /> New deck</button></div>
              <div className="practice-layout">
                <aside className="set-list-panel">
                  <div className="set-list-title"><strong>Your decks</strong><span>{activeNotebook.flashcardDecks.length}</span></div>
                  {activeNotebook.flashcardDecks.map((deck) => (
                    <div className={`set-list-row ${deck.id === activeDeck.id ? "active" : ""}`} key={deck.id} role="button" tabIndex={0} onClick={() => selectDeck(deck)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") selectDeck(deck); }}>
                      <span><Layers3 size={16} /></span><div><strong>{deck.title}</strong><small>{deck.cards.length} cards · {shortDate(deck.createdAt)}</small></div>
                      <button className="delete-set" onClick={(event) => { event.stopPropagation(); removeDeck(deck.id); }} aria-label={`Delete ${deck.title}`}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </aside>
                <section className="card-practice">
                  <div className="practice-topline"><span>CARD {cardIndex + 1} OF {activeDeck.cards.length}</span><span>{reviewedCards.length} reviewed</span></div>
                  <button className={`flip-card ${cardFlipped ? "flipped" : ""}`} onClick={() => setCardFlipped((value) => !value)} aria-label={cardFlipped ? "Show question" : "Reveal answer"}>
                    <span className="flip-card-label">{cardFlipped ? "ANSWER" : activeCard.tag.toUpperCase()}</span>
                    <strong>{cardFlipped ? activeCard.answer : activeCard.question}</strong>
                    <span className="flip-card-hint"><RotateCcw size={14} /> {cardFlipped ? "Show question" : "Reveal answer"}</span>
                  </button>
                  <div className="card-controls"><button onClick={() => moveCard(-1)} aria-label="Previous card"><ArrowLeft size={18} /></button><div className="card-progress"><i style={{ width: `${((cardIndex + 1) / activeDeck.cards.length) * 100}%` }} /></div><button onClick={() => moveCard(1)} aria-label="Next card"><ArrowRight size={18} /></button></div>
                  <div className="card-rating"><button onClick={() => rateCard(true)}>Review again</button><button onClick={() => rateCard(false)}><Check size={16} /> I knew this</button></div>
                </section>
              </div>
            </div>
          )}

          {activeTab === "quizzes" && activeQuiz && activeQuestion && (
            <div className="practice-page">
              <div className="page-heading"><div><p>QUIZ LIBRARY</p><h2>{activeQuiz.title}</h2><span>{activeQuiz.questions.length} questions · {activeQuiz.difficulty} difficulty</span></div><button className="accent green" onClick={() => openGenerator("quiz")}><Plus size={16} /> New quiz</button></div>
              <div className="practice-layout">
                <aside className="set-list-panel">
                  <div className="set-list-title"><strong>Your quizzes</strong><span>{activeNotebook.quizzes.length}</span></div>
                  {activeNotebook.quizzes.map((quiz) => (
                    <div className={`set-list-row quiz-row ${quiz.id === activeQuiz.id ? "active" : ""}`} key={quiz.id} role="button" tabIndex={0} onClick={() => selectQuiz(quiz)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") selectQuiz(quiz); }}>
                      <span><ListChecks size={16} /></span><div><strong>{quiz.title}</strong><small>{quiz.questions.length} questions{quiz.bestScore !== undefined ? ` · Best ${quiz.bestScore}/${quiz.questions.length}` : ""}</small></div>
                      <button className="delete-set" onClick={(event) => { event.stopPropagation(); removeQuiz(quiz.id); }} aria-label={`Delete ${quiz.title}`}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </aside>
                <section className="quiz-practice">
                  {!quizComplete ? (
                    <>
                      <div className="quiz-status"><span>Question {quizIndex + 1} of {activeQuiz.questions.length}</span><strong>{activeQuiz.difficulty}</strong></div>
                      <div className="quiz-bar"><i style={{ width: `${((quizIndex + (selectedQuizAnswer !== undefined ? 1 : 0)) / activeQuiz.questions.length) * 100}%` }} /></div>
                      <div className="question-panel">
                        <span className="question-count">{String(quizIndex + 1).padStart(2, "0")}</span>
                        <h3>{activeQuestion.question}</h3>
                        <div className="answers-list">
                          {activeQuestion.options.map((option, index) => {
                            const answered = selectedQuizAnswer !== undefined;
                            const correct = index === activeQuestion.correctIndex;
                            const selected = index === selectedQuizAnswer;
                            return <button className={`${selected ? "selected" : ""} ${answered && correct ? "correct" : ""} ${answered && selected && !correct ? "incorrect" : ""}`} key={`${option}-${index}`} onClick={() => chooseQuizAnswer(index)}><span>{String.fromCharCode(65 + index)}</span><p>{option}</p>{answered && correct && <Check size={17} />}{answered && selected && !correct && <X size={17} />}</button>;
                          })}
                        </div>
                        {selectedQuizAnswer !== undefined && <div className={`answer-explanation ${selectedQuizAnswer === activeQuestion.correctIndex ? "right" : "wrong"}`}><strong>{selectedQuizAnswer === activeQuestion.correctIndex ? "Correct" : "Not quite"}</strong><p>{activeQuestion.explanation}</p></div>}
                      </div>
                      <button className="next-question" disabled={selectedQuizAnswer === undefined} onClick={nextQuizQuestion}>{quizIndex === activeQuiz.questions.length - 1 ? "See results" : "Next question"}<ArrowRight size={16} /></button>
                    </>
                  ) : (
                    <div className="quiz-results">
                      <div className="score-circle"><strong>{quizScore}</strong><span>OF {activeQuiz.questions.length}</span></div>
                      <p>QUIZ COMPLETE</p><h2>{quizScore === activeQuiz.questions.length ? "Perfect recall." : quizScore >= activeQuiz.questions.length * 0.7 ? "Strong work." : "Good first pass."}</h2>
                      <span>{quizScore === activeQuiz.questions.length ? "You remembered every key idea." : "Review the related deck, then try again."}</span>
                      <div><button onClick={() => setActiveTab("flashcards")}><Layers3 size={16} /> Review cards</button><button className="primary" onClick={restartQuiz}><RotateCcw size={16} /> Try again</button></div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      <aside className={`coach-panel ${chatOpen ? "open" : ""}`}>
        <div className="coach-header"><div><span className="coach-orb"><Sparkles size={17} /></span><div><strong>Study Coach</strong><small><i /> {chatMode === "ai" ? "Gemini grounded in this notebook" : chatMode === "local" ? "Built-in mode · AI not connected" : "Grounded in this notebook"}</small></div></div><button onClick={() => setChatOpen(false)} aria-label="Close study coach"><PanelRightClose size={18} /></button></div>
        <div className="coach-context"><span><FileText size={15} /></span><div><small>USING SOURCE</small><strong>{activeNotebook.title}</strong></div><Check size={15} /></div>
        <div className="chat-messages">
          {!chats.length && (
            <div className="coach-welcome"><span><BrainCircuit size={27} /></span><p>ASK YOUR NOTES</p><h2>What do you want to understand?</h2><div className="prompt-chips"><button onClick={() => void sendChat("Summarize the main ideas")}>Summarize the main ideas</button><button onClick={() => void sendChat("Explain this in simple terms")}>Explain it simply</button><button onClick={() => void sendChat("Test me with a practice question")}>Test me</button><button onClick={() => void sendChat("What are the key terms?")}>Key terms</button></div></div>
          )}
          {chats.map((message) => <div className={`chat-bubble ${message.role}`} key={message.id}><span>{message.role === "assistant" ? <Sparkles size={14} /> : "CR"}</span><div><p>{message.content}</p>{message.citations?.length ? <small><FileText size={11} /> {message.citations.join(" · ")}</small> : null}</div></div>)}
          {chatThinking && <div className="chat-bubble assistant"><span><Sparkles size={14} /></span><div className="thinking-dots"><i /><i /><i /></div></div>}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-composer"><div><textarea value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={onChatKeyDown} placeholder="Ask anything about these notes…" rows={2} /><button onClick={() => void sendChat()} disabled={!chatInput.trim() || chatThinking} aria-label="Send message"><Send size={16} /></button></div><small>{chatMode === "local" ? "Built-in mode handles notes, study help, and basic questions." : "Answers use this notebook. Press Enter to send."}</small></div>
      </aside>

      {(navOpen || chatOpen) && <button className="drawer-backdrop" onClick={() => { setNavOpen(false); setChatOpen(false); }} aria-label="Close open panel" />}

      {uploadOpen && (
        <div className="modal-layer" role="presentation" onMouseDown={(event: MouseEvent<HTMLDivElement>) => { if (event.target === event.currentTarget) closeUpload(); }}>
          <section className="app-modal upload-modal" role="dialog" aria-modal="true" aria-labelledby="upload-title">
            <div className="modal-header"><div><span><FileUp size={19} /></span><div><p>NEW NOTEBOOK</p><h2 id="upload-title">Add your learning material</h2></div></div><button onClick={closeUpload} aria-label="Close upload"><X size={20} /></button></div>
            {!processing ? <>
              <div className="upload-tabs"><button className={uploadMode === "file" ? "active" : ""} onClick={() => { setUploadMode("file"); setUploadError(""); }}><UploadCloud size={16} /> Upload a file</button><button className={uploadMode === "paste" ? "active" : ""} onClick={() => { setUploadMode("paste"); setUploadError(""); }}><TextCursorInput size={16} /> Paste notes</button></div>
              <label className="modal-field"><span>Notebook name <small>optional</small></span><input value={notebookTitle} onChange={(event) => setNotebookTitle(event.target.value)} placeholder="e.g. Chemistry — Unit 4" maxLength={80} /></label>
              {uploadMode === "file" ? (
                <label className={`dropzone ${dragActive ? "dragging" : ""} ${selectedFile ? "has-file" : ""}`} onDragEnter={() => setDragActive(true)} onDragLeave={() => setDragActive(false)} onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
                  <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown" onChange={(event: ChangeEvent<HTMLInputElement>) => chooseFile(event.target.files?.[0] ?? null)} />
                  {selectedFile ? <><span className="selected-file-icon"><FileText size={25} /></span><strong>{selectedFile.name}</strong><p>{fileSize(selectedFile.size)} · Ready to read</p><button type="button" onClick={(event) => { event.preventDefault(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>Choose another file</button></> : <><span className="upload-cloud"><UploadCloud size={27} /></span><strong>Drop your PDF or notes here</strong><p>or click to choose a file</p><small>PDF, TXT, or Markdown · up to 18 MB</small></>}
                </label>
              ) : (
                <div className="paste-area"><label><span>Your notes</span><textarea value={pasteText} onChange={(event) => setPasteText(event.target.value)} placeholder={'Paste class notes here…\n\nBullets, numbered lists, headings, and definitions all work.'} /></label><small className={pastedWordCount > 0 && pastedWordCount < 8 ? "needs-more" : ""}>{numberFormat.format(pastedWordCount)} words · 8 words minimum</small></div>
              )}
              {uploadError && <div className="upload-error"><X size={15} />{uploadError}</div>}
              <div className="privacy-note"><Check size={15} /><span><strong>Private by default.</strong> Files are read in your browser. The selected notebook is only sent to the AI endpoint when you ask the coach a question.</span></div>
              <div className="modal-actions"><button onClick={closeUpload}>Cancel</button><button className="generate-button" onClick={() => void createNotebook()} disabled={uploadMode === "file" ? !selectedFile : pastedWordCount < 8}><Sparkles size={16} /> Build notebook</button></div>
            </> : (
              <div className="processing-state"><div className="processing-orbit"><span><BrainCircuit size={28} /></span><i /><i /><i /></div><p>BUILDING YOUR NOTEBOOK</p><h3>{processingLabel}</h3><div className="processing-bar"><i style={{ width: `${processingProgress}%` }} /></div><span>{processingProgress}%</span><div className="processing-steps"><span className={processingProgress >= 25 ? "done" : "active"}><Check size={12} /> Read source</span><span className={processingProgress >= 82 ? "done" : processingProgress >= 45 ? "active" : ""}><Check size={12} /> Summarize</span><span className={processingProgress >= 100 ? "done" : processingProgress >= 82 ? "active" : ""}><Check size={12} /> Build tools</span></div></div>
            )}
          </section>
        </div>
      )}

      {generatorMode && (
        <div className="modal-layer" role="presentation" onMouseDown={(event: MouseEvent<HTMLDivElement>) => { if (!generatingMaterial && event.target === event.currentTarget) setGeneratorMode(null); }}>
          <section className="app-modal generator-modal" role="dialog" aria-modal="true" aria-labelledby="generator-title">
            <div className="modal-header"><div><span className={generatorMode === "quiz" ? "green" : ""}>{generatorMode === "flashcards" ? <Layers3 size={19} /> : <ListChecks size={19} />}</span><div><p>CREATE FROM {activeNotebook.title.toUpperCase()}</p><h2 id="generator-title">New {generatorMode === "flashcards" ? "flashcard deck" : "practice quiz"}</h2></div></div><button onClick={() => setGeneratorMode(null)} aria-label="Close generator"><X size={20} /></button></div>
            <div className="generator-form">
              <label className="modal-field"><span>Name <small>optional</small></span><input value={generatorTitle} onChange={(event) => setGeneratorTitle(event.target.value)} placeholder={generatorMode === "flashcards" ? `Flashcards ${activeNotebook.flashcardDecks.length + 1}` : `Practice Quiz ${activeNotebook.quizzes.length + 1}`} maxLength={70} /></label>
              <div className="generator-grid">
                <label className="modal-field"><span>{generatorMode === "flashcards" ? "Number of cards" : "Number of questions"}</span><select value={generatorCount} onChange={(event) => setGeneratorCount(Number(event.target.value))}>{[5, 8, 10, 12, 15, 20].map((count) => <option key={count} value={count}>{count}</option>)}</select></label>
                {generatorMode === "quiz" ? <label className="modal-field"><span>Difficulty</span><select value={generatorDifficulty} onChange={(event) => setGeneratorDifficulty(event.target.value as QuizSet["difficulty"])}><option>Quick</option><option>Standard</option><option>Challenge</option></select></label> : <label className="modal-field"><span>Focus <small>optional</small></span><input value={generatorFocus} onChange={(event) => setGeneratorFocus(event.target.value)} placeholder="e.g. key terms" /></label>}
              </div>
              <div className="generator-preview"><span><Sparkles size={17} /></span><div><strong>A fresh version every time</strong><p>This creates a separate {generatorMode === "flashcards" ? "deck" : "quiz"}; your existing study tools stay in the notebook.</p></div></div>
            </div>
            <div className="modal-actions"><button onClick={() => setGeneratorMode(null)} disabled={generatingMaterial}>Cancel</button><button className={`generate-button ${generatorMode === "quiz" ? "green" : ""}`} onClick={() => void createMaterial()} disabled={generatingMaterial}><WandSparkles size={16} /> {generatingMaterial ? "Gemini is writing…" : `Generate ${generatorMode === "flashcards" ? "deck" : "quiz"}`}</button></div>
          </section>
        </div>
      )}

      {toast && <div className="toast-message"><Check size={15} />{toast}</div>}
    </div>
  );
}
