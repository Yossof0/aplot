import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BookingForm } from "@/components/booking/BookingForm";

export default async function BookingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Book a server</h1>
        <p className="text-sm text-muted-foreground">
          Choose a lease duration and storage cap. You&apos;ll get an admin
          dashboard immediately after booking.
        </p>
      </div>
      <BookingForm />
    </div>
  );
}
