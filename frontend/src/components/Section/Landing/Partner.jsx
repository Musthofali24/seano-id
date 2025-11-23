import React from "react";
import KemendikbudLogo from "../../../assets/Partner/KemendikbudLogo.webp";
import BrinLogo from "../../../assets/Partner/BrinLogo.webp";
import BimaLogo from "../../../assets/Partner/BimaLogo.webp";
import PolmanLogo from "../../../assets/Partner/PolmanLogo.webp";
import DiktiLogo from "../../../assets/Partner/DiktiLogo.webp";
import GeotronixLogo from "../../../assets/Partner/GeotronixLogo.webp";

const Partner = () => {
  const partners = [
    { name: "Kemendikbud", logo: KemendikbudLogo },
    { name: "Brin", logo: BrinLogo },
    { name: "Bima", logo: BimaLogo },
    { name: "Polman", logo: PolmanLogo },
    { name: "Dikti", logo: DiktiLogo },
    { name: "Geotronix", logo: GeotronixLogo },
  ];

  return (
    <div className="w-full py-10 bg-black overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="relative w-full overflow-hidden group">
          {/* Gradient Masks for smooth fade effect at edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10"></div>

          <div className="flex w-max animate-marquee group-hover:pause">
            {/* First set of logos */}
            <div className="flex items-center gap-16 px-8">
              {partners.map((partner, index) => (
                <div
                  key={`partner-1-${index}`}
                  className="relative w-32 h-20 flex items-center justify-center transition-all duration-300"
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-50 hover:opacity-100 hover:scale-110 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {/* Second set of logos for seamless loop */}
            <div className="flex items-center gap-16 px-8">
              {partners.map((partner, index) => (
                <div
                  key={`partner-2-${index}`}
                  className="relative w-32 h-20 flex items-center justify-center transition-all duration-300"
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-50 hover:opacity-100 hover:scale-110 cursor-pointer"
                  />
                </div>
              ))}
            </div>
            {/* Third set of logos for extra safety on wide screens */}
            <div className="flex items-center gap-16 px-8">
              {partners.map((partner, index) => (
                <div
                  key={`partner-3-${index}`}
                  className="relative w-32 h-20 flex items-center justify-center transition-all duration-300"
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-50 hover:opacity-100 hover:scale-110 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partner;
