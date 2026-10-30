import type { Metadata } from "next";
import GivingForm from "@components/giving-form";

export const metadata: Metadata = {
  title: "Give Online | SDAC Karen Community ",
  description: "Secure online giving to Seventh-day Adventist Church Karen Community.",
};

export default function HomePage() {
  return <GivingForm />;
}
