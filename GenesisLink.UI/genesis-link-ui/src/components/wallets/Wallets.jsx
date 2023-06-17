import { useState, useEffect, useContext } from "react";
import { Box } from "@mui/material";
import { FaEthereum, FaInfoCircle, FaWallet } from "react-icons/fa";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { SmartContractContext } from "../../context/SmartContractContext";
import { shortenAddress } from "../../utils/shortenAddress";

const Wallets = () => {
  const {
    currentAccount,
    connectWallet,
    handleChange,
    sendTransaction,
    formData,
    isLoading,
  } = useContext(SmartContractContext);

  const [sendToAddress, setSendToAddress] = useState("");
  const [amountInEth, setAmountInEth] = useState("");
  const [transactionMessage, setTransactionMessage] = useState("");

  useEffect(() => {
    console.log("currentAccount", currentAccount);
    console.log("connectWallet", connectWallet);
    console.log("handleChange", handleChange);
    console.log("sendTransaction", sendTransaction);
    console.log("formData", formData);
    console.log("isLoading", isLoading);
  }, []);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          p: 1,
          m: 1,
          bgcolor: "background.paper",
          width: "100%",
          height: "100%",
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
              bgcolor: "#ade8f4",
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
              bgcolor: "#caf0f8",
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
                console.log(e.target.value);
                setSendToAddress(e.target.value);
              }}
            />
            <TextField
              required
              id="outlined-amountInEth"
              label="Amount in ETH"
              value={amountInEth ?? ""}
              onChange={(e) => {
                console.log(e.target.value);
                setAmountInEth(e.target.value);
              }}
            />
            <TextField
              required
              id="outlined-transactionMessage"
              label="Message"
              value={transactionMessage ?? ""}
              onChange={(e) => {
                console.log(e.target.value);
                setTransactionMessage(e.target.value);
              }}
            />
          </Box>

          <Button
            disabled={currentAccount ? true : false}
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, borderRadius: 10, bgcolor: "#03045e" }}
            onClick={() => {
              console.log("tranasction submitted");
            }}
          >
            Send Now
          </Button>
        </Box>
        <Box>Item 2</Box>
        <Box>Item 3</Box>
        <Box>Item 4</Box>
        <Box>Item 5</Box>
        <Box>Item 6</Box>
      </Box>
    </>
  );
};

export default Wallets;
