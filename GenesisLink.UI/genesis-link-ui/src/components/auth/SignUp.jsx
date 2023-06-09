import React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import states from "../data/us_states.json";
import api from "../../config.json";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"© Genesis Link "}
      {/* <Link color="inherit" href="https://mui.com/">
        Genesis Link
      </Link>{" "} */}
      {new Date().getFullYear()}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function SignUp() {
  const navigate = useNavigate();
  const [state, setState] = React.useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const signUpUserData = {
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      addressLine1: data.get("addressLine1"),
      addressLine2: data.get("addressLine2"),
      city: data.get("city"),
      state: state,
      zip: data.get("zip"),
      emailId: data.get("email"),
      password: data.get("password"),
      profilePictureUrl: "",
    };

    const signUpUserApi = async () => {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpUserData),
      };

      const response = await fetch(`${api.ACCOUNTS}signup`, options);

      if (!response.ok) {
        window.alert("Error creating user account. Please contact support.");
      } else {
        window.alert(
          "Account created succesfully. Please sign in with your email and password."
        );
        const signUpResponseFromApi = await response.json();
        navigate("/login");
      }
    };
    signUpUserApi();
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ minWidth: "100vw", minHeight: "100vh" }}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar
              sx={{
                objectFit: "contain",
                height: "300px",
                width: "200px",
                padding: "5%",
              }}
              src="images/eth-diamond-purple.png"
            ></Avatar>
            <Typography component="h1" variant="h2">
              Genesis Link
            </Typography>
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign up
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 3 }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="addressLine1"
                    label="Address Line 1"
                    name="addressLine1"
                    autoComplete="street-address"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="addressLine2"
                    label="Address Line 2"
                    name="addressLine2"
                    autoComplete="street-address"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="city"
                    label="City"
                    name="city"
                    autoComplete="address-level2"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="state-label">State</InputLabel>
                    <Select
                      labelId="state"
                      id="state"
                      value={state}
                      label="State"
                      onChange={(e) => {
                        setState(e.target.value);
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="zip"
                    label="Zip"
                    name="zip"
                    autoComplete="postal-code"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox value="allowExtraEmails" color="primary" />
                    }
                    label="I want to receive inspiration, marketing promotions and updates via email."
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign Up
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link variant="body2" onClick={() => navigate("/signin")}>
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Copyright sx={{ mt: 5 }} />
        </Container>
      </Box>
    </ThemeProvider>
  );
}
