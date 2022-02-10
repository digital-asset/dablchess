import { makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(() => ({
  regularBoardDiv: {
    border: '1px',
    borderStyle: 'solid',
  },
  checkedBoardDiv: {
    border: '3px',
    borderStyle: 'solid',
    borderColor: 'red',
  },
}));
