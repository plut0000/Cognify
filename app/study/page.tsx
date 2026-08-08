import { redirect } from "next/navigation";
import { auth } from "@/auth";
import StudyWorkspace from "@/components/study-workspace";

export const metadata = {
  title: "Workspace",
};

export default async function StudyPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  return (
    <StudyWorkspace
      user={{
        name: session.user.name ?? "Student",
        email: session.user.email,
        image: session.user.image ?? null,
      }}
    />
  );
}
