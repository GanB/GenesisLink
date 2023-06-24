import { useState, useEffect, useContext } from "react";
import api from "../../config.json";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { columns } from "../data/DailyMovers";
import Typography from "@mui/material/Typography";
import { SmartContractContext } from "../../context/SmartContractContext";
import TransactionCard from "../transactions/TransactionCard";

const Home = () => {
  const { transactions, currentAccount } = useContext(SmartContractContext);
  const [cryptoDailyList, setCryptoDailyList] = useState([]);
  const [dataGridFormattted, setDataGridFormattted] = useState([]);

  const previousDay = () => {
    const previousDate = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24);
    const previousDay = previousDate.getDay();

    if (previousDay === 0 || previousDay === 6) {
      return new Date(
        previousDate.valueOf() - 1000 * 60 * 60 * 24 * 2
      ).toLocaleDateString("en-CA");
    }
    return previousDate.toLocaleDateString("en-CA");
  };

  const CRYPTO_GROUPED_DAILY_API = `${
    api.CRYPTO_GROUPED_DAILY
  }${previousDay()}?adjusted=true&apiKey=${process.env.REACT_APP_PG_API_KEY}`;

  useEffect(() => {
    const getCryptoDailyList = async () => {
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await fetch(CRYPTO_GROUPED_DAILY_API, options);
      const apiResponse = await response.json();
      setCryptoDailyList(apiResponse?.results?.slice(0, 500));
      const dataGridRows = apiResponse?.results
        ?.slice(0, 500)
        ?.map((crypto) => {
          return {
            id: crypto.T,
            closePrice: crypto.c,
            openPrice: crypto.o,
            high: crypto.h,
            low: crypto.l,
            numberOfTransactions: crypto.n,
            volume: crypto.v.toLocaleString(),
            volumeWeightedAveragePrice: crypto.vw,
          };
        });

      setDataGridFormattted(dataGridRows);
    };
    getCryptoDailyList();
  }, []);

  return (
    <Box sx={{ padding: "1rem", minHeight: "100vh", minWidth: "100vw" }}>
      <Box sx={{ height: 400, width: "100%", marginTop: "2rem" }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{ textAlign: "center", marginTop: "5%" }}
        >
          Market Daily Data (Grouped Aggregate)
        </Typography>
        <DataGrid
          rows={dataGridFormattted}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          sx={{
            borderColor: "#06101f",
            border: 2,
            boxShadow: 2,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f7f7ff",
              fontSize: "1rem",
            },
            bgcolor: "background.paper",
            overflow: "auto",
          }}
        />
      </Box>
      <Box sx={{ marginTop: "8rem" }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{ textAlign: "center", marginTop: "5%" }}
        >
          Your Latest Transactions
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
          {transactions.map((item, index) => {
            return <TransactionCard key={index} transactionDetail={item} />;
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
