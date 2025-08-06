import { Categories } from "@/components/Home/Categories";
import { FeaturedProduct } from "@/components/Home/FeaturedProduct";
import { Hero } from "@/components/Home/Hero";
import { NewsLetter } from "@/components/Home/NewsLetter";
import { WhyChooseUs } from "@/components/Home/WhyChooseUs";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProduct />
      <WhyChooseUs />
      <NewsLetter />
    </>
  );
}
