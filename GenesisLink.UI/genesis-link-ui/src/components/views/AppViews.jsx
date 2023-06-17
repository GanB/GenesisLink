import { Outlet, Route, Routes } from "react-router-dom";
import Footer from "../common/Footer";
import Profile from "../profiles/Profile";
import Drawer from "@mui/material/Drawer";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import Home from "../home/Home";
import Wallets from "../wallets/Wallets";
import Markets from "../markets/Markets";
import Transactions from "../transactions/Transactions";

const AppViews = (props) => {
  const appUser = JSON.parse(sessionStorage.getItem("app_user"));

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Box sx={{ width: "100%", height: "100vh" }}>
              <Outlet />
              <Footer />
            </Box>
          </>
        }
      >
        <Route path="home" element={<Home />} />
        <Route path="wallets" element={<Wallets />} />
        <Route path="markets" element={<Markets />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="profile" element={<Profile />} />
        {/*<Route path="search-result" element={<SearchResults />} />*/}
      </Route>
    </Routes>
  );
};

export default AppViews;
