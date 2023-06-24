import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { shortenAddress } from "../../utils/shortenAddress";
import Divider from "@mui/material/Divider";

export default function TransactionCard(props) {
  return (
    <Box sx={{ width: "30vw" }}>
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
            From Address
          </Typography>
          <Typography variant="h5" component="div">
            <a
              href={`https://sepolia.etherscan.io/address/${props.transactionDetail.addressFrom}`}
              target="_blank"
              rel="noreferrer"
            >
              {shortenAddress(props.transactionDetail.addressFrom)}
            </a>
          </Typography>
          <Divider></Divider>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            To Address
          </Typography>
          <Typography variant="h5" component="div">
            <a
              href={`https://sepolia.etherscan.io/address/${props.transactionDetail.addressTo}`}
              target="_blank"
              rel="noreferrer"
            >
              {shortenAddress(props.transactionDetail.addressTo)}
            </a>
          </Typography>
          <Divider></Divider>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Message
          </Typography>
          <Typography variant="h5" component="div">
            {props.transactionDetail.message}
          </Typography>
          <Divider></Divider>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {`${props.transactionDetail.amount} wei`}
          </Typography>
          <Divider></Divider>
        </CardContent>
        <CardActions></CardActions>
      </Card>
    </Box>
  );
}
