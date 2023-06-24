import { Outlet, Route, Routes } from "react-router-dom";
import Footer from "../common/Footer";
import Profile from "../profiles/Profile";
import Box from "@mui/material/Box";
import Home from "../home/Home";
import WalletsContainer from "../wallets/WalletsContainer";
import Markets from "../markets/Markets";
import TransactionsContainer from "../transactions/TransactionsContainer";

const AppViews = (props) => {
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
        <Route path="wallets" element={<WalletsContainer />} />
        <Route path="markets" element={<Markets />} />
        <Route path="transactions" element={<TransactionsContainer />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default AppViews;
