import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="bg-[#f5faff]">
      <div className="container py-1 sm:py-36 px-0 sm:px-2">
        <div className="flex sm:flex-wrap flex-nowrap justify-between items-center max-h-[690px] h-full">
          <div className="">
            <h2 className="font-montserrat pb-7 sm:pb-[26px] text-[#0d1a26] text-[44px] sm:text-[75px] not-italic font-semibold leading-[111.3%] tracking-[-1.1px] sm:tracking-[-1.875px]">
              The Ultimate <br /> Task Management Experience
            </h2>
            <p className="font-inter sm:pb-16 max-w-[680px] text-[#2d2d2d] text-xl sm:text-3xl not-italic font-normal leading-[103.3%] tracking-[-0.5px] sm:tracking-[-0.75px] pb-11">
              TaskWise harnesses the power of artificial intelligence to
              revolutionize the way you organize, prioritize, and complete your
              tasks
            </p>
            <Link href={"/tasks"}>
              <button
                type="button"
                className="bg-blue-600 text-white rounded-lg font-semibold px-8 py-3 hover:bg-blue-700 transition text-lg"
              >
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
