import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function AlertDialog(props) {
  return (
    <>
      <Dialog
        open={props.showModal}
        onClose={props.toggleModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{props.dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {props.dialogContentText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.disAgree}>Disagree</Button>
          <Button onClick={props.agree} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
