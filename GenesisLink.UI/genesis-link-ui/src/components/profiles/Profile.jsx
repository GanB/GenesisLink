import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AlertDialog from "../common/AlertDialog";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import api from "../../config.json";
import states from "../data/us_states.json";

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
  const appUserObj = JSON.parse(sessionStorage.getItem("app_user"));
  const [showModal, setShowModal] = React.useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userData, setUserData] = useState({});
  const [editUserData, setEditUserData] = useState({
    id: appUserObj.id,
    emailid: appUserObj.email,
    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",
    profilePictureUrl: "",
    createdBy: appUserObj.id,
    updatedBy: appUserObj.id,
  });

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const agree = () => {
    signOutUser();
    deleteAccount();
    toggleModal();
    sessionStorage.clear();
    navigate(`/`);
  };

  const disAgree = () => {
    toggleModal();
  };

  const deleteAccount = async () => {
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(`${api.ACCOUNTS}${appUserObj.id}`, options);
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
      window.alert("Unable to Signout. Please try again later.");
    } else {
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      const response = await fetch(`${api.APP_USER_DATA}${appUserObj.id}`);
      const apiResponse = await response.json();
      setUserData(apiResponse);
      setEditUserData({
        ...editUserData,
        firstName: apiResponse.firstName,
        lastName: apiResponse.lastName,
        addressLine1: apiResponse.addressLine1,
        addressLine2: apiResponse.addressLine2,
        city: apiResponse.city,
        state: apiResponse.state,
        zip: apiResponse.zip,
        emailId: apiResponse.email,
        id: apiResponse.id,
        updatedBy: apiResponse.id,
        createTS: apiResponse.createTS,
        createdBy: apiResponse.createdBy,
      });
    };
    getUserData();
  }, []);

  return (
    <Box
      sx={{
        minWidth: "100vw",
        minHeight: "100vh",
        background: "#f9f9f9",
        mt: 3,
      }}
    >
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
            <TextField
              fullWidth
              id="standard-firstName"
              label="First Name"
              InputProps={{
                readOnly: !isEditMode,
              }}
              sx={{
                "& .MuiInputBase-input": {
                  backgroundColor: isEditMode ? "#f7f4ea" : "",
                },

                "& .MuiTextField-root": {
                  backgroundColor: isEditMode ? "#f7f4ea" : "",
                },
              }}
              value={editUserData.firstName}
              // defaultValue={
              //   isEditMode ? editUserData.firstName : userData.firstName
              // }
              onChange={(e) => {
                setEditUserData({
                  ...editUserData,
                  firstName: e.target.value,
                });
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              id="standard-lastName"
              label="Last Name"
              InputProps={{
                readOnly: !isEditMode,
              }}
              sx={{
                "& .MuiInputBase-input": {
                  backgroundColor: isEditMode ? "#f7f4ea" : "",
                },

                "& .MuiTextField-root": {
                  backgroundColor: isEditMode ? "#f7f4ea" : "",
                },
              }}
              value={editUserData.lastName}
              // defaultValue={userData.lastName}
              onChange={(e) => {
                setEditUserData({
                  ...editUserData,
                  lastName: e.target.value,
                });
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              id="standard-addressLine1"
              label="Address Line 1"
              InputProps={{
                readOnly: !isEditMode,
              }}
              sx={{
                "& .MuiInputBase-input": {
                  backgroundColor: isEditMode ? "#f7f4ea" : "",
                },

                "& .MuiTextField-root": {
                  backgroundColor: isEditMode ? "#f7f4ea" : "",
                },
              }}
              value={editUserData.addressLine1}
              // defaultValue={userData.addressLine1}
              onChange={(e) => {
                setEditUserData({
                  ...editUserData,
                  addressLine1: e.target.value,
                });
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              id="standard-addressLine2"
              label="Address Line 2"
              InputProps={{
                readOnly: !isEditMode,
              }}
              sx={{
                "& .MuiInputBase-input": {
                  backgroundColor: isEditMode ? "#f7f4ea" : "",
                },

                "& .MuiTextField-root": {
                  backgroundColor: isEditMode ? "#f7f4ea" : "",
                },
              }}
              value={editUserData.addressLine2}
              // defaultValue={userData.addressLine2}
              onChange={(e) => {
                setEditUserData({
                  ...editUserData,
                  addressLine2: e.target.value,
                });
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              id="standard-city"
              label="City"
              InputProps={{
                readOnly: !isEditMode,
              }}
              sx={{
                "& .MuiInputBase-input": {
                  backgroundColor: isEditMode ? "#f7f4ea" : "",
                },

                "& .MuiTextField-root": {
                  backgroundColor: isEditMode ? "#f7f4ea" : "",
                },
              }}
              value={editUserData.city}
              // defaultValue={userData.city}
              onChange={(e) => {
                setEditUserData({
                  ...editUserData,
                  city: e.target.value,
                });
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="state-label">State</InputLabel>
              <Select
                labelId="state"
                sx={{
                  "& .MuiInputBase-input": {
                    backgroundColor: isEditMode ? "#f7f4ea" : "",
                  },

                  "& .MuiTextField-root": {
                    backgroundColor: isEditMode ? "#f7f4ea" : "",
                  },
                }}
                id="state"
                value={editUserData.state ?? ""}
                label="State"
                onChange={(e) => {
                  setEditUserData({
                    ...editUserData,
                    state: e.target.value,
                  });
                }}
              >
                {Object.keys(states).map((x, index) => {
                  return (
                    <MenuItem key={index} value={states[x]}>
                      {states[x]}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              id="standard-zip"
              label="Zip"
              InputProps={{
                readOnly: !isEditMode,
              }}
              sx={{
                "& .MuiInputBase-input": {
                  backgroundColor: isEditMode ? "#f7f4ea" : "",
                },

                "& .MuiTextField-root": {
                  backgroundColor: isEditMode ? "#f7f4ea" : "",
                },
              }}
              value={editUserData.zip}
              // defaultValue={userData.zip}
              onChange={(e) => {
                setEditUserData({
                  ...editUserData,
                  zip: e.target.value,
                });
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              disabled
              id="standard-email"
              label="Email"
              InputProps={{
                readOnly: true,
              }}
              value={editUserData.emailId ?? ""}
              // defaultValue={userData.emailId}
            />
          </Grid>
        </Grid>
        <Stack spacing={4} direction="row" sx={{ marginTop: "10%" }}>
          {!isEditMode && (
            <Button
              fullWidth
              sx={{
                backgroundColor: "#03045e",
                fontSize: "large",
                fontWeight: "bold",
                borderRadius: "25px",
                "&:hover": {
                  background: "#03045e",
                },
              }}
              variant="contained"
              onClick={() => {
                setIsEditMode(true);
              }}
            >
              Edit
            </Button>
          )}
          {!isEditMode && (
            <Button
              fullWidth
              color="error"
              sx={{
                color: "#d90429",
                fontSize: "large",
                fontWeight: "bold",
                borderRadius: "25px",
              }}
              variant="outlined"
              onClick={toggleModal}
            >
              Delete
            </Button>
          )}
          {isEditMode && (
            <Button
              fullWidth
              sx={{
                backgroundColor: "#03045e",
                fontSize: "large",
                fontWeight: "bold",
                borderRadius: "25px",
                "&:hover": {
                  background: "#03045e",
                },
              }}
              variant="contained"
              onClick={() => {
                const updateUserData = async () => {
                  const options = {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(editUserData),
                  };

                  const response = await fetch(
                    `${api.APP_USER_DATA}${appUserObj.id}`,
                    options
                  );

                  if (!response.ok) {
                    window.alert("Error updating user info");
                  } else {
                    window.alert("User data updated successfully");
                  }
                };

                updateUserData();
                setIsEditMode(false);
              }}
            >
              Save Changes
            </Button>
          )}
          {isEditMode && (
            <Button
              fullWidth
              sx={{
                // backgroundColor: "#03045e",
                fontSize: "large",
                fontWeight: "bold",
                borderRadius: "25px",
                color: "#03045e",
                // "&:hover": {
                //   background: "#03045e",
                // },
              }}
              variant="outlined"
              onClick={() => {
                setIsEditMode(false);
              }}
            >
              Cancel
            </Button>
          )}
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
