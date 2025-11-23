import Banner from "../components/Section/Landing/Banner";
import Navbar from "../components/Section/Landing/Layout/Navbar";
import Partner from "../components/Section/Landing/Partner";

const Landing = () => {
  return (
    <div className="font-openSans bg-black">
      <Navbar />
      <Banner />
      <Partner />
    </div>
  );
};

export default Landing;
