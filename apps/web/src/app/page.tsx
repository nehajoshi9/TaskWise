"use client";

import Header from "@/components/Header";
import Benefits from "@/components/home/Benefits";
import Footer from "@/components/home/Footer";
import FooterHero from "@/components/home/FooterHero";
import Hero from "@/components/home/Hero";
// import Testimonials from "@/components/home/Testimonials";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero containerClass="px-2 sm:px-4" />
      <Benefits containerClass="px-2 sm:px-4" />
      {/* <Testimonials /> */}
      <FooterHero containerClass="px-2 sm:px-4" />
      <Footer containerClass="px-2 sm:px-4" />
    </main>
  );
}
