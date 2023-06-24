import * as React from "react";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import Typography from "@mui/material/Typography";

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

const Footer = () => {
  const [value, setValue] = React.useState(0);

  return (
    <Box sx={{ width: "100%" }}>
      <BottomNavigation
        value={value}
        sx={{
          backgroundColor: "#edf2f4",
          // height: "50vh",
        }}
        // onChange={(event, newValue) => {
        //   setValue(newValue);
        // }}
      >
        <List
          sx={{
            marginLeft: "80%",
            height: "2vh",
            width: "2vw",
          }}
        >
          <ListItem>
            <FacebookOutlinedIcon />
          </ListItem>
          <ListItem>
            <TwitterIcon />
          </ListItem>
          <ListItem>
            <LinkedInIcon />
          </ListItem>
        </List>

        {/* <BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
        <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
        <BottomNavigationAction label="Nearby" icon={<LocationOnIcon />} /> */}
      </BottomNavigation>
      <BottomNavigation
        value={value}
        sx={{
          backgroundColor: "#edf2f4",
          height: "50vh",
        }}
        // onChange={(event, newValue) => {
        //   setValue(newValue);
        // }}
      >
        <Copyright sx={{ mt: 8, mb: 4 }} />
        {/* <Typography
          variant="body2"
          sx={{ textAlign: "center", padding: "1rem", fontWeight: "bold" }}
          gutterBottom
        >
          <Copyright sx={{ mt: 8, mb: 4 }} />
        </Typography> */}

        {/* <BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
        <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
        <BottomNavigationAction label="Nearby" icon={<LocationOnIcon />} /> */}
      </BottomNavigation>
      {/* <BottomNavigation
        value={value}
        sx={{
          backgroundColor: "#edf2f4",
          height: "50vh",
        }}
        // onChange={(event, newValue) => {
        //   setValue(newValue);
        // }}
      ></BottomNavigation> */}
    </Box>
  );
};

export default Footer;
