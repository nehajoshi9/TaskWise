import { Monitor } from "lucide-react";
import Link from "next/link";

const FooterHero = () => {
  return (
    <div className="bg-[#f5faff]">
      <div className="flex flex-wrap md:flex-nowrap justify-between container py-20 px-0 sm:px-2">
        <div className="max-w-[802px]">
          <h2 className="font-montserrat text-wrap text-[#0d1a26] not-italic text-3xl md:text-[57px] font-semibold sm:leading-[109.3%] sm:tracking-[-1.425px] leading-[97.3%] tracking-[-0.75px] pb-[31px] sm:pb-[38px]">
            Start Your Intelligent Task Management Journey
          </h2>
          <p className="font-inter max-w-[681px] text-[#2d2d2d] text-xl sm:text-3xl not-italic font-normal leading-[103.3%] tracking-[-0.75px] pb-[66px] sm:pb-[53px]">
            Sign up now and experience the power of AI-enhanced task management with
            TaskWise
          </p>
          <Link href={"/tasks"}>
            <button
              type="button"
              className="bg-blue-600 text-white rounded-lg font-semibold px-8 py-3 hover:bg-blue-700 transition text-lg"
            >
              Get Started For Free
            </button>
          </Link>
        </div>
        <div className="mt-20 md:mt-0 flex items-center justify-center h-full">
          <Monitor size={280} className="text-blue-600" />
        </div>
      </div>
    </div>
  );
};

export default FooterHero;
