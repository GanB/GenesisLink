import React from "react";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AlertDialog from "../common/AlertDialog";
import { useNavigate } from "react-router-dom";
import api from "../../config.json";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#edf2fb",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.primary,
  fontWeight: "900",
}));

const Profile = () => {
  const navigate = useNavigate();
  const appuserObj = JSON.parse(sessionStorage.getItem("app_user"));
  const [showModal, setShowModal] = React.useState(false);

  const toggleModal = () => {
    console.log("modal clicked");
    setShowModal(!showModal);
    console.log("returned to profile");
  };

  const agree = () => {
    console.log("delete agreed");
    signOutUser();
    deleteAccount();
    toggleModal();
    sessionStorage.clear();
    navigate(`/`);
  };

  const disAgree = () => {
    console.log("delete disagreed");
    toggleModal();
  };

  const deleteAccount = async () => {
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(`${api.ACCOUNTS}${appuserObj.id}`, options);

    if (!response.ok) {
      console.log(response.status, response.statusText);
    } else {
      console.log(`Account deleted successfully`);
    }
  };

  const signOutUser = async () => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(`${api.ACCOUNTS}signout`, options);

    if (!response.ok) {
      console.log(response.status, response.statusText);
      window.alert("Unable to Signout. Please try again later.");
    } else {
      console.log(`User signed out succesfully`);
    }
  };

  return (
    <Box sx={{ width: "100%", height: "90vh", background: "#f9f9f9" }}>
      <Typography sx={{ textAlign: "center" }} variant="h3" gutterBottom>
        Profile
      </Typography>
      <Box sx={{ width: "50%", marginLeft: "25%" }}>
        <Grid
          container
          rowSpacing={1}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          sx={{ textAlign: "center" }}
        >
          <Grid item xs={6}>
            <Item sx={{ fontWeight: "900" }}>First Name</Item>
          </Grid>
          <Grid item xs={6}>
            <Item>{appuserObj.firstName}</Item>
          </Grid>
          <Grid item xs={6}>
            <Item sx={{ fontWeight: "900" }}>Last Name</Item>
          </Grid>
          <Grid item xs={6}>
            <Item>{appuserObj.lastName}</Item>
          </Grid>
          <Grid item xs={6}>
            <Item sx={{ fontWeight: "900" }}>Address Line 1</Item>
          </Grid>
          <Grid item xs={6}>
            <Item>{appuserObj.addressLine1}</Item>
          </Grid>
          <Grid item xs={6}>
            <Item sx={{ fontWeight: "900" }}>Address Line 2</Item>
          </Grid>
          <Grid item xs={6}>
            <Item>{appuserObj.addressLine2}</Item>
          </Grid>
          <Grid item xs={6}>
            <Item sx={{ fontWeight: "900" }}>City</Item>
          </Grid>
          <Grid item xs={6}>
            <Item>{appuserObj.city}</Item>
          </Grid>
          <Grid item xs={6}>
            <Item sx={{ fontWeight: "900" }}>State</Item>
          </Grid>
          <Grid item xs={6}>
            <Item>{appuserObj.state}</Item>
          </Grid>
          <Grid item xs={6}>
            <Item sx={{ fontWeight: "900" }}>Zip</Item>
          </Grid>
          <Grid item xs={6}>
            <Item>{appuserObj.zip}</Item>
          </Grid>
          <Grid item xs={6}>
            <Item sx={{ fontWeight: "900" }}>Email</Item>
          </Grid>
          <Grid item xs={6}>
            <Item>{appuserObj.email}</Item>
          </Grid>
        </Grid>
        <Stack direction="row" spacing={4} sx={{ mt: 3, mb: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              console.log(`edit profile clicked`);
            }}
          >
            Edit
          </Button>
          <Button
            fullWidth
            variant="outlined"
            href="#outlined-buttons"
            color="error"
            onClick={toggleModal}
          >
            Delete Account
          </Button>
        </Stack>
        {showModal && (
          <AlertDialog
            showModal={showModal}
            agree={agree}
            disAgree={disAgree}
            toggleModal={toggleModal}
            dialogTitle="Are you sure you want to delete the account?"
            dialogContentText="All your wallets and transaction history will be deleted after 30 days. This action is final."
          />
        )}
      </Box>
    </Box>
  );
};

export default Profile;
