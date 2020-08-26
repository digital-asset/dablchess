import { makeStyles } from "@material-ui/styles";

export const useStyles = makeStyles(() => ({
  tab: {
    fontWeight: "bold",
    opacity: "1",
  },
  tabList: {
    overflow: "visible",
    overflowX: "visible",
    borderBottom: "2px solid"
  },
  tabPanel: {
    padding: "0"
  }
}));
