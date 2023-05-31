import { Route, Routes } from "react-router-dom";
import Authorized  from "./views/Authorized";
import AppViews from "./views/AppViews";
import SignIn from "./auth/SignIn";
import SignUp  from "./auth/SignUp";
import NavBar from "./common/NavBar";

 const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            <Route
                path="*"
                element={
                    <Authorized>
                        <>
                            <NavBar />
                            <AppViews />
                        </>
                    </Authorized>
                }
            />
        </Routes>
    );
};


export default AppRoutes;