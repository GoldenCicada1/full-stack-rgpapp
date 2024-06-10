import { useContext, useState, useEffect } from "react";
import SearchBar from "../../components/searchBar/SearchBar";
import "./homePage.scss";
import { AuthContext } from "../../context/AuthContext";

function HomePage() {

  const {currentUser} = useContext(AuthContext)

 // Define the titles to cycle through
 const titles = [
  'Explore Your Future Home with Our 3D Virtual Tour',
  'REAL GENERIC PLATFORM',
  'Make Life Easy',
];

// Set up state to keep track of the current title index
const [currentTitleIndex, setCurrentTitleIndex] = useState(0);

const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);

// Set up an effect to change the title every 20 seconds
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTitleIndex((prevIndex) => (prevIndex + 1) % titles.length);
  }, 10000 *2 ); // Change the title every 20 seconds

  return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, [titles.length]);

   // Set up an effect to hide the welcome message after 5 seconds
   useEffect(() => {
    const timeout = setTimeout(() => {
      setShowWelcomeMessage(false);
    }, 5000); // Hide the welcome message after 5 seconds

    return () => clearTimeout(timeout); // Cleanup the timeout on component unmount
  }, []);


  return (
    <div className="homePage">
      <div className="textContainer">
        <div className="wrapper">
        <h1 className="title">{titles[currentTitleIndex]}</h1>
          <p>
          Experience the future of real estate with our immersive 3D virtual tours. <br/>
          Explore your potential new home from every angle, all from the comfort of your couch. <br/>
          No need to physically visit, see every detail with just a few clicks and <br/> Find your dream property with ease!
          </p>
          <SearchBar />
          <div className="boxes">
            <div className="box">
              <h1>10+</h1>
              <h2>Years of Experience</h2>
            </div>
            <div className="box">
              <h1>200</h1>
              <h2>Trusted Home Owners</h2>
            </div>
            <div className="box">
              <h1>1000+</h1>
              <h2>Property Ready</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
      {currentUser && showWelcomeMessage && (
        <div className="welcomeMessage">
          <h2>Welcome, {currentUser.username}!</h2>
        </div>
      )}
    </div>
  );
}

export default HomePage;
