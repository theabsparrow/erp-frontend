import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div style={{ display: "flex" }}>
      <aside>{/* Sidebar goes here */}</aside>
      <main style={{ flex: 1 }}>
        <Outlet/>
      </main>
    </div>
  );
};

export default Layout;
