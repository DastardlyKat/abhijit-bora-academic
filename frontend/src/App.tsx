import "./index.css"

import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import PageTransition from "./components/PageTransition"
import useBlockActions from "./pages/Block_Actions"
import { useFontsReady } from "./hooks/useFontsReady"

import { Routes, Route, Navigate} from "react-router-dom"
import Home from "./pages/Home"
import About from "./pages/About"
import Research from "./pages/Research"
// import Blog from "./pages/Blog"
import Contact from "./pages/Contact"

export default function App(){
  useBlockActions();
  useFontsReady();

  return(
    <>
      <a className="skip-link" href="#main">Skip to content</a>

      {/* Masthead: sticky, compresses on scroll (see components/Navbar) */}
      <Navbar />

      {/* PageTransition owns <main>; it lets the outgoing page leave before the
          next route is rendered, so Routes is given the location it should show. */}
      <PageTransition>
        {location => (
          <Routes location={location}>
            {/* No route previously matched "/" itself, so on first load - before
                clicking any nav link - nothing below the Navbar ever rendered.
                Redirect root to /Home so it always resolves to a real page. */}
            <Route path="/" element={<Navigate to="/Home" replace />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/About" element={<About />} />
            <Route path="/Research" element={<Research />} />
            {/* <Route path = "/Blog" element = {<Blog />} /> */}
            <Route path="/Contact" element={<Contact />} />
          </Routes>
        )}
      </PageTransition>

      <Footer />
    </>
  );
}
