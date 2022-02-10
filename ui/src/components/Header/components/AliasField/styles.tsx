import { makeStyles, createStyles } from '@material-ui/styles';

export default makeStyles((theme: any) =>
  createStyles({
    textField: {
      color: 'black',
      fontWeight: 'bold',
      marginRight: theme.spacing(2),
      marginLeft: theme.spacing(2),
    },
    lightTextField: {
      color: 'white',
      marginRight: theme.spacing(2),
      marginLeft: theme.spacing(2),
      border: 'none',
    },
    formHelperText: {
      color: 'white',
    },
    root: {
      color: 'red',
    },
  })
);
