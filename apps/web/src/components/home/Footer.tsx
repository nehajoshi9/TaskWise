import Logo from "../common/Logo";
import Menu from "../common/Menu";

const menuItems = [
  {
    title: "Home",
    url: "/",
  },
  {
    title: "Benefits",
    url: "#Benefits",
  },
  {
    title: "Get Started",
            url: "/tasks",
  },
  {
    title: "Reviews",
    url: "#reviews",
  },
];

const Footer = () => {
  return (
    <footer className="w-full bg-[#f5faff] border-t border-[#e3f0fa] pt-8 pb-4">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-6 px-0 sm:px-2">
        <Logo />
        <div className="flex flex-wrap gap-2">
          {menuItems.map((item) => (
            // Comment out the Reviews link
            item.title === "Reviews" ? null : (
              <a
                key={item.title}
                href={item.url}
                className="inline-block px-4 py-1 rounded-full border border-blue-600 bg-white text-blue-600 font-medium font-inter text-sm hover:bg-blue-50 transition"
              >
                {item.title}
              </a>
            )
          ))}
        </div>
      </div>
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-2 mt-6 px-0 sm:px-2">
        <h3 className="text-[#0d1a26] text-base font-semibold font-montserrat mb-1 sm:mb-0">
          Take more efficient tasks with TaskWise
        </h3>
        <p className="text-[#2d2d2d] font-inter text-sm font-normal">
          Save countless hours of task management and organize your tasks easier.
        </p>
        <p className="text-[#667085] font-inter text-xs font-light text-right">
          © 2025 TaskWise. All rights reserved. <span className="hidden sm:inline">| Icons by Lucide</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
