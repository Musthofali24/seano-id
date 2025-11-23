import Banner from "../components/Section/Landing/Banner";
import Navbar from "../components/Section/Landing/Layout/Navbar";
import Partner from "../components/Section/Landing/Partner";
import Footer from "../components/Section/Landing/Layout/Footer";

const Landing = () => {
  return (
    <div className="font-openSans bg-black">
      <Navbar />
      <Banner />
      <Partner />
      <Footer />
    </div>
  );
};

export default Landing;
