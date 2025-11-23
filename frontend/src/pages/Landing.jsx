import Banner from "../components/Section/Landing/Banner";
import Navbar from "../components/Section/Landing/Layout/Navbar";
import Partner from "../components/Section/Landing/Partner";
import Feature from "../components/Section/Landing/Feature";
import Timeline from "../components/Section/Landing/Timeline";
// import Footer from "../components/Section/Landing/Layout/Footer";

const Landing = () => {
  return (
    <div className="font-openSans bg-black">
      <Navbar />
      <Banner />
      <Partner />
      <Feature />
      <Timeline />
      {/* <Footer /> */}
    </div>
  );
};

export default Landing;
