import { Hero } from "@/components/hero";
import { Services } from "@/components/services";
import { Pricing } from "@/components/pricing";
import { WhyChooseUs } from "@/components/why-choose-us";
import { HomeCollection } from "@/components/home-collection";
import { Contact } from "@/components/contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Pricing />
      <WhyChooseUs />
      <Services />
      <HomeCollection />
      <Contact />
    </>
  );
}
