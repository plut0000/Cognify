import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import StudyWorkspace from "@/components/study-workspace";
import { pageMetadata } from "@/lib/site-config";
import { createSampleNotebook } from "@/lib/study-engine";

export const metadata: Metadata = pageMetadata({
  title: "Study workspace",
  description: "Your private Cognify workspace for summaries, flashcards, quizzes, slideshows, and source-grounded study help.",
  path: "/study",
  index: false,
});

export default async function StudyPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  return (
    <StudyWorkspace
      initialNotebook={createSampleNotebook()}
      user={{
        name: session.user.name ?? "Student",
        email: session.user.email,
        image: session.user.image ?? null,
      }}
    />
  );
}
