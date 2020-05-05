import { makeStyles, createStyles } from "@material-ui/styles";

export default makeStyles((theme:any) => createStyles({
  textField: {
    color:"black",
    fontWeight:"bold",
    marginRight:theme.spacing(2),
    marginLeft:theme.spacing(2)
  },
  formHelperText: {
    color:"black"
  }
}));
