import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import StudyWorkspace from "@/components/study-workspace";
import { createSampleNotebook } from "@/lib/study-engine";

export const metadata: Metadata = {
  title: "Workspace",
  description: "Your private Cognify workspace for summaries, flashcards, quizzes, and source-grounded study help.",
  alternates: { canonical: "/study" },
  robots: { index: false, follow: false, noarchive: true },
  openGraph: {
    url: "/study",
    title: "Study workspace | Cognify",
    description: "A private workspace for studying from your own notes.",
  },
};

export default async function StudyPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const initialNotebook = createSampleNotebook();

  return (
    <StudyWorkspace
      initialNotebook={initialNotebook}
      user={{
        name: session.user.name ?? "Student",
        email: session.user.email,
        image: session.user.image ?? null,
      }}
    />
  );
}
