import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <>
      <Navbar />
      <div className="content-wrapper">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
