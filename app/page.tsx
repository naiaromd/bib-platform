import Hero from "./_components/landing/Hero";
import Technology from "./_components/landing/Technology";
import Handpieces from "./_components/landing/Handpieces";
import Programs from "./_components/landing/Programs";
import Evidence from "./_components/landing/Evidence";
import Trust from "./_components/landing/Trust";
import Clinics from "./_components/landing/Clinics";
import Contact from "./_components/landing/Contact";
import Header from "./_components/landing/Header";

export default function LandingPage() {
  return (
    <>
      <Header />
      <Hero />
      <Technology />
      <Handpieces />
      <Programs />
      <Evidence />
      <Trust />
      <Clinics />
      <Contact />
    </>
  );
}
