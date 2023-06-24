import { useContext } from "react";
import { Box } from "@mui/material";
import { SmartContractContext } from "../../context/SmartContractContext";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";

const TransactionsContainer = () => {
  const { transactions, currentAccount } = useContext(SmartContractContext);

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#edf2fb",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.primary,
    fontWeight: "900",
  }));

  const columns = [
    {
      field: "addressFrom",
      headerName: "From Address",
      headerAlign: "center",
      width: 370,
      renderCell: (params) => {
        return (
          <a
            href={`https://sepolia.etherscan.io/address/${params.row.addressFrom}`}
            target="_blank"
            rel="noreferrer"
          >
            {params.row.addressFrom}
          </a>
        );
      },
    },
    {
      field: "addressTo",
      headerName: "To Address",
      headerAlign: "center",
      width: 370,
      renderCell: (params) => {
        return (
          <a
            href={`https://sepolia.etherscan.io/address/${params.row.addressTo}`}
            target="_blank"
            rel="noreferrer"
          >
            {params.row.addressTo}
          </a>
        );
      },
    },
    {
      field: "amount",
      headerName: "Amount (Wei)",
      headerAlign: "center",
      align: "center",
      type: "number",
      width: 150,
    },
    {
      field: "message",
      headerName: "Message",
      headerAlign: "center",
      width: 200,
    },
    {
      field: "timestamp",
      headerName: "Timestamp",
      headerAlign: "center",
      width: 200,
    },
  ];

  return (
    <>
      <Box sx={{ minWidth: "100vw", minHeight: "100vh" }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{ textAlign: "center", marginTop: "5%" }}
        >
          Transactions History
        </Typography>
        <Box sx={{ width: "70vw", marginLeft: "15vw" }}>
          <Grid
            container
            rowSpacing={1}
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            sx={{ textAlign: "center" }}
          >
            <Grid item xs={4}>
              <Item sx={{ fontWeight: "900" }}>
                Account Currently Connected To:
              </Item>
            </Grid>
            <Grid item xs={8}>
              <Item>{currentAccount}</Item>
            </Grid>
          </Grid>
        </Box>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ marginLeft: "5vw", marginTop: "3%" }}
        >
          Below transactions are retrieved from Ethereum Blockchain network for
          the account currently connected.
        </Typography>
        <Box
          sx={{
            height: 400,
            width: "90vw",
            marginLeft: "5vw",
            marginTop: "3%",
          }}
        >
          <DataGrid
            rows={transactions}
            columns={columns}
            pageSize={5}
            getRowId={(row) => {
              return `${row.addressFrom}-${row.addressTo}-${row.timestamp}`;
            }}
            rowsPerPageOptions={[5]}
            initialState={{
              columns: { columnVisibilityModel: { id: false } },
            }}
            sx={{
              borderColor: "#06101f",
              border: 2,
              boxShadow: 2,
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#03045e",
                color: "#fff",
                fontSize: "1rem",
              },
              bgcolor: "background.paper",
              overflow: "auto",
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#ade8f4",
                cursor: "pointer",
              },
              // disable cell selection style
              ".MuiDataGrid-cell:focus": {
                outline: "none",
              },
            }}
          />
        </Box>
      </Box>
    </>
  );
};

export default TransactionsContainer;
