import { useState, useEffect, useContext } from "react";
import { Box } from "@mui/material";
import { FaEthereum, FaInfoCircle, FaWallet } from "react-icons/fa";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import SendIcon from "@mui/icons-material/Send";
import { SmartContractContext } from "../../context/SmartContractContext";
import { shortenAddress } from "../../utils/shortenAddress";
import AddCardIcon from "@mui/icons-material/AddCard";
import Modal from "@mui/material/Modal";
import AddWallet from "./AddWallet";
import WalletCard from "./WalletCard";
import Loader from "../common/Loader";
import api from "../../config.json";

const WalletsContainer = () => {
  const appUser = JSON.parse(sessionStorage.getItem("app_user"));
  const {
    currentAccount,
    connectWallet,
    handleChange,
    sendTransaction,
    formData,
    isLoading,
  } = useContext(SmartContractContext);

  const [openAddWalletModal, setOpenAddWalletModal] = useState(false);
  const [sendToAddress, setSendToAddress] = useState("");
  const [amountInEth, setAmountInEth] = useState("");
  const [transactionMessage, setTransactionMessage] = useState("");
  const [userWallets, setUserWallets] = useState([]);
  const [refereshUserWallets, setRefereshUserWallets] = useState(false);

  const triggerUserWalletRefresh = () => {
    setRefereshUserWallets(!refereshUserWallets);
  };
  useEffect(() => {
    const getUserWallets = async () => {
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const response = await fetch(
        `${api.USER_WALLETS}?userId=${appUser.id}`,
        options
      );
      if (!response.ok) {
        window.alert("Error getting user wallets types");
      } else {
        const responseDataFromApi = await response.json();
        setUserWallets(responseDataFromApi);
      }
    };
    getUserWallets();
  }, [refereshUserWallets]);

  return (
    <>
      <Box sx={{ minHeight: "100vh", minWidth: "100vw" }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{ textAlign: "center", marginTop: "5%" }}
        >
          Wallets
        </Typography>
        <Box sx={{ marginLeft: "43vw", marginTop: "2%" }}>
          <Button
            sx={{ marginLeft: "7%" }}
            onClick={() => {
              setOpenAddWalletModal(true);
            }}
          >
            <AddCardIcon
              sx={{
                fontSize: "60px",
                color: "#03045e",
              }}
            />
          </Button>
          <Modal
            open={openAddWalletModal}
            onClose={() => {
              setOpenAddWalletModal(false);
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
                height: "50%",
                backgroundColor: "#f2f8fa",
                border: "2px solid #000",
                boxShadow: 24,
                p: 4,
              }}
            >
              <AddWallet
                toggleModal={setOpenAddWalletModal}
                refereshUserWallets={triggerUserWalletRefresh}
              />
            </Box>
          </Modal>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            p: 1,
            m: 1,
            bgcolor: "background.paper",
            borderRadius: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              flexDirection: "row",
              justifyContent: "space-between",
              p: 1,
              m: 5,
              width: "500px",
              height: "300px",
            }}
          >
            <Box
              sx={{
                bgcolor: "#c1d3fe",
                width: "100%",
                height: "100%",
                borderRadius: 5,
                p: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  marginLeft: "5px",
                }}
              >
                <Box
                  sx={{
                    width: "50%",
                    marginTop: "10px",
                    alignContent: "center",
                  }}
                >
                  <FaEthereum
                    style={{
                      fontSize: 50,
                      color: "#00296b",
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    width: "40%",
                    marginTop: "10px",
                    display: "flex",
                    flexWrap: "wrap",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <FaInfoCircle
                    style={{
                      fontSize: 30,
                      color: "#00296b",
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ width: "100%", marginLeft: "5px", marginTop: "20px" }}>
                <p style={{ fontSize: 30 }}>
                  {currentAccount
                    ? shortenAddress(currentAccount)
                    : `Connected Wallet Address....`}
                </p>
              </Box>
              <Box sx={{ width: "100%", marginLeft: "5px" }}>
                <p style={{ fontSize: 30, fontWeight: "bold" }}>Ethereum</p>
              </Box>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={connectWallet}
              disabled={currentAccount ? true : false}
              sx={{ mt: 3, mb: 2, borderRadius: 10, bgcolor: "#03045e" }}
            >
              <FaWallet style={{ fontSize: 40, paddingRight: "10%" }} />
              <p style={{ fontSize: 15, paddingRight: "10%" }}>
                {currentAccount
                  ? `Use MetaMask to Disconnect Wallet`
                  : `Connect Now`}
              </p>
            </Button>
          </Box>
          <Box noValidate autoComplete="off" component="form">
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                flexDirection: "row",
                justifyContent: "space-between",
                p: 1,
                m: 5,
                bgcolor: "#edf2fb",
                // color: "#fff",
                width: "500px",
                height: "300px",
                borderRadius: 3,
                "& .MuiTextField-root": {
                  m: 1,
                  width: "90%",
                  // backgroundColor: "#fff",
                  height: "auto",
                  ml: "5%",
                },
              }}
            >
              <TextField
                required
                id="outlined-sendToAddress"
                label="Receiver Wallet Address"
                value={sendToAddress ?? ""}
                onChange={(e) => {
                  setSendToAddress(e.target.value);
                  handleChange(e, "addressTo");
                }}
              />
              <TextField
                required
                id="outlined-amountInEth"
                label="Amount in wei"
                value={amountInEth ?? ""}
                onChange={(e) => {
                  setAmountInEth(e.target.value);
                  handleChange(e, "amount");
                }}
              />
              <TextField
                required
                id="outlined-transactionMessage"
                label="Message"
                value={transactionMessage ?? ""}
                onChange={(e) => {
                  setTransactionMessage(e.target.value);
                  handleChange(e, "message");
                }}
              />
            </Box>
            {isLoading ? (
              <Loader />
            ) : (
              <Button
                disabled={
                  currentAccount &&
                  sendToAddress &&
                  amountInEth &&
                  transactionMessage
                    ? false
                    : true
                }
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  borderRadius: 10,
                  bgcolor: "#03045e",
                }}
                onClick={(e) => {
                  const { addressTo, amount, message } = formData;
                  e.preventDefault();
                  if (!addressTo || !amount || !message) return;
                  sendTransaction();
                  setSendToAddress("");
                  setAmountInEth("");
                  setTransactionMessage("");
                }}
              >
                <SendIcon style={{ fontSize: 40, paddingRight: "10%" }} />
                <p style={{ fontSize: 15, paddingRight: "10%" }}>Send Now</p>
              </Button>
            )}
          </Box>
          <Box sx={{ p: 1, m: 5 }}>
            <Typography
              variant="h3"
              gutterBottom
              sx={{ textAlign: "center", marginTop: "5%", minWidth: "100vw" }}
            >
              Previously Added Wallets
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "flex-start",
                alignContent: "center",
                gap: "10px 30px",
              }}
            >
              {userWallets.map((item, index) => {
                return (
                  <WalletCard
                    key={index}
                    userWallet={item}
                    refereshUserWallets={triggerUserWalletRefresh}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default WalletsContainer;
