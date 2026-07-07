import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BookingWizard } from "@/components/booking/BookingWizard";

export default async function BookingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Book a server</h1>
        <p className="text-sm text-muted-foreground">
          Three quick steps — name, plan, then a bundle or a custom config.
        </p>
      </div>
      <BookingWizard />
    </div>
  );
}
