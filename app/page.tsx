import type { Metadata } from "next";
import GivingForm from "@components/giving-form";

export const metadata: Metadata = {
  title: "Give Online | Karen Community SDA",
  description: "Secure online giving to Karen Community Seventh-day Adventist Church.",
};

export default function HomePage() {
  return <GivingForm />;
}
