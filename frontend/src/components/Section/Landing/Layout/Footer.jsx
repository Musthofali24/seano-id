const Footer = () => {
  return (
    <footer className="w-full bg-black py-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4">
        <p className="text-gray-500 text-sm">
          Copyright © 2026. Seano. All Rights Reserved.
        </p>
        <div className="flex gap-8">
          <a
            href="#"
            className="text-gray-500 hover:text-white text-sm transition-colors duration-300"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-gray-500 hover:text-white text-sm transition-colors duration-300"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
