import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Modal from "@mui/material/Modal";
import Stack from "@mui/material/Stack";
import EditWallet from "./EditWallet";
import { shortenAddress } from "../../utils/shortenAddress";
import Divider from "@mui/material/Divider";
import api from "../../config.json";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function WalletCard(props) {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditModal, setOpenEditModal] = React.useState(false);

  return (
    <Box sx={{ width: "30%" }}>
      <Card
        variant="outlined"
        sx={{
          maxWidth: 500,
          padding: "1rem",
          borderStyle: "solid",
          borderSpacing: "1rem",
          borderColor: "#03045e",
          borderRadius: "15px",
          marginTop: "0.5rem",
          borderWidth: "0.10rem",
          background: "#dbe9ee",
        }}
      >
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            {props.userWallet.walletNav.walletName}
          </Typography>
          <Typography variant="h5" component="div">
            {shortenAddress(props.userWallet.walletNav.walletAddress)}
          </Typography>
          <Divider></Divider>
          <Typography variant="h5" component="div">
            {props.userWallet.walletNav.chainSource}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {currencyFormatter.format(
              isNaN(props.userWallet.walletNav.balance)
                ? 0.0
                : props.userWallet.walletNav.balance
            )}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            onClick={() => {
              setOpenEditModal(true);
            }}
          >
            <EditOutlinedIcon />
          </Button>
          <Button
            size="small"
            onClick={() => {
              setOpenDeleteModal(true);
            }}
          >
            <DeleteOutlineOutlinedIcon sx={{ color: "red" }} />
          </Button>
        </CardActions>
      </Card>
      <Modal
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50%",
            height: "50%",
            bgcolor: "background.paper",
            border: "2px solid #000",
            backgroundColor: "#f2f8fa",
            boxShadow: 24,
            p: 4,
          }}
        >
          <EditWallet
            userWallet={props.userWallet}
            toggleEditModal={setOpenEditModal}
            refereshUserWallets={props.refereshUserWallets}
          />
        </Box>
      </Modal>
      <Modal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50%",
            height: "30%",
            bgcolor: "background.paper",
            border: "2px solid #000",
            backgroundColor: "#f2f8fa",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography sx={{ textAlign: "center" }} variant="h3" gutterBottom>
            Are you sure, you want to delete this wallet?
          </Typography>
          <Stack spacing={4} direction="row" sx={{ marginTop: "10%" }}>
            <Button
              fullWidth
              sx={{
                backgroundColor: "#ef476f",
                fontSize: "large",
                fontWeight: "bold",
                color: "#ffffff",
                borderRadius: "25px",
                "&:hover": {
                  background: "#ef476f",
                },
              }}
              variant="contained"
              onClick={() => {
                const deleteUserWalletApiCall = async () => {
                  const options = {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  };

                  const response = await fetch(
                    `${api.USER_WALLETS}/${props.userWallet.id}`,
                    options
                  );
                  if (!response.ok) {
                    window.alert("Error DELETEING wallet");
                  }
                };
                deleteUserWalletApiCall();
                setOpenDeleteModal(false);
                props.refereshUserWallets();
              }}
            >
              Yes, Delete
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
                setOpenDeleteModal(false);
                props.refereshUserWallets();
              }}
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
