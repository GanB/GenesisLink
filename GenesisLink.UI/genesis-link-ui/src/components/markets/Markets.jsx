import React, { useState, useEffect } from "react";
import api from "../../config.json";
import Box from "@mui/material/Box";
import MediaCard from "./MediaCard";

const Markets = ({ ticker }) => {
  const [tickerNews, setTickerNews] = useState([]);

  const NEWS_API = `${api.NEWS_API}?ticker=ETH&apiKey=${process.env.REACT_APP_PG_API_KEY}`;

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(NEWS_API);
      const newsResultFromApi = await response.json();
      setTickerNews(newsResultFromApi?.results);
    };
    fetchData();
  }, []);

  return (
    <div>
      <Box
        sx={{
          flexGrow: 2,
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-evenly",
          minHeight: "100vh",
          minWidth: "100vw",
          m: 3,
          gap: 5,
        }}
      >
        {tickerNews.map((item, index) => {
          return <MediaCard key={index} data={item} />;
        })}
      </Box>
    </div>
  );
};

export default Markets;
