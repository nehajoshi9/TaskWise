import { ListChecks, Cloud, Calendar, Bot } from "lucide-react";
import Image from "next/image";

const benefits = [
  {
    title: "Effortless Task Creation",
    description: "Say goodbye to complicated task creation processes with our intuitive interface",
    image: "/images/goodNews.png",
  },
  {
    title: "Seamless Sync",
    description:
              "Access your tasks anytime, anywhere, with seamless cloud synchronization.",
    image: "/images/cloudSync.png",
  },
  {
    title: "Enhanced Productivity",
    description:
      "Let AI handle organization, so you can focus on what matters most.",
    image: "/images/googleCalander.png",
  },
  {
    title: "AI-Powered Insights",
    description:
      "Gain valuable insights with smart analytics based on your note patterns.",
    image: "/images/bot.png",
  },
];

const Benefits = () => {
  return (
    <section id="Benefits" className="relative pointer-events-none bg-[#f5faff]">
      <Image
        src={"/images/blue-circle.svg"}
        width={503}
        height={531}
        alt=""
        className="absolute hidden sm:block -left-40 -top-48 h-[531px]"
      />
      <div className="container py-0 px-0 sm:px-2">
        <p className="text-black text-[17px] sm:text-3xl not-italic font-medium leading-[90.3%] tracking-[-0.75px] text-center font-montserrat pb-2 sm:pb-[18px]">
          Benefits
        </p>
        <h3 className=" text-black text-3xl sm:text-[57px] not-italic font-medium leading-[90.3%] tracking-[-1.425px] font-montserrat text-center pb-[46px] sm:pb-[87px]">
          Why Choose TaskWise
        </h3>

        <div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 z-10 ">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-2 sm:gap-7 bg-white items-center border rounded-[17px] py-4 px-2 sm:py-12 sm:px-6 border-solid border-[#e3f0fa] shadow-sm"
              >
                <div className="min-w-16 sm:min-w-28 flex items-center justify-center">
                  {benefit.title === "Effortless Task Creation" && <ListChecks size={64} className="text-blue-600" />}
                  {benefit.title === "Seamless Sync" && <Cloud size={64} className="text-blue-600" />}
                  {benefit.title === "Enhanced Productivity" && <Calendar size={64} className="text-blue-600" />}
                  {benefit.title === "AI-Powered Insights" && <Bot size={64} className="text-blue-600" />}
                </div>
                <div className="">
                  <h4 className="text-black text-[24px] sm:text-[42px] not-italic font-medium leading-[90.3%] tracking-[-1.05px] pb-2 sm:pb-6 font-montserrat">
                    {benefit.title}
                  </h4>
                  <p className="font-montserrat pb-2 text-black text-[17px] sm:text-3xl not-italic font-normal leading-[90.3%] tracking-[-0.75px]">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
