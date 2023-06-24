import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import Input from "@mui/material/Input";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import api from "../../config.json";

export default function EditWallet(props) {
  const appUser = JSON.parse(sessionStorage.getItem("app_user"));
  const [walletName, setWalletName] = useState(
    props.userWallet.walletNav.walletName
  );
  const [walletAddress, setWalletAddress] = useState(
    props.userWallet.walletNav.walletAddress
  );
  const [blockchainNetwork, setBlockchainNetwork] = useState(
    props.userWallet.walletNav.chainSource
  );
  const [isWalletLocked, setIsWalletLocked] = useState(
    props.userWallet.walletNav.isLocked
  );
  const [walletBalance, setWalletBalance] = useState(
    props.userWallet.walletNav.balance
  );

  return (
    <Box>
      <Typography sx={{ textAlign: "center" }} variant="h3" gutterBottom>
        Edit Wallet
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <Grid
          container
          rowSpacing={2}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          sx={{ textAlign: "center" }}
        >
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="outlined-walletName"
              label="Wallet Name"
              value={walletName ?? ""}
              onChange={(e) => {
                setWalletName(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="outlined-walletAddress"
              label="Wallet Address"
              value={walletAddress ?? ""}
              onChange={(e) => {
                setWalletAddress(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="outlined-blockchainNetwork"
              label="Blockchain Network"
              value={blockchainNetwork ?? ""}
              onChange={(e) => {
                setBlockchainNetwork(e.target.value);
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth sx={{ m: 1, width: "100%", height: "auto" }}>
              <InputLabel htmlFor="outlined-adornment-amount">
                Balance
              </InputLabel>
              <Input
                id="outlined-adornment-amount"
                value={walletBalance ?? 0.0}
                onChange={(e) => {
                  setWalletBalance(e.target.value);
                }}
                startAdornment={
                  <InputAdornment position="start">$</InputAdornment>
                }
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              value={isWalletLocked ?? ""}
              control={
                <Checkbox
                  onChange={(e) => {
                    setIsWalletLocked(e.target.checked);
                  }}
                />
              }
              label="Wallet Locked?"
              labelPlacement="start"
            />
          </Grid>
        </Grid>
        <Stack spacing={4} direction="row" sx={{ marginTop: "10%" }}>
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
              const updateWalletApiCall = async () => {
                const options = {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    id: props.userWallet.walletId,
                    walletAddress: walletAddress,
                    walletName: walletName,
                    chainSource: blockchainNetwork,
                    balance: walletBalance,
                    isLocked: isWalletLocked,
                    createdBy: appUser.id,
                    updatedBy: appUser.id,
                  }),
                };

                const response = await fetch(
                  `${api.WALLETS}${props.userWallet.walletId}`,
                  options
                );

                if (!response.ok) {
                  window.alert("Error adding wallet");
                } else {
                  props.refereshUserWallets();
                  props.toggleEditModal(false);
                }
              };

              updateWalletApiCall();
            }}
          >
            Save Changes
          </Button>
          <Button
            fullWidth
            sx={{
              color: "#03045e",
              fontSize: "large",
              fontWeight: "bold",
              borderRadius: "25px",
            }}
            variant="outlined"
            onClick={() => {
              props.refereshUserWallets();
              props.toggleEditModal(false);
            }}
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
