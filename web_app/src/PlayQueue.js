import React from 'react';
import firebase from "firebase";
import { withStyles } from '@material-ui/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import Button from '@material-ui/core/Button';
import { CSSTransition } from 'react-transition-group';
import CloseIcon from '@material-ui/icons/Close';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { green } from '@material-ui/core/colors';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';

const styles = (theme) => ({
  root: {
    display: 'block',
    height: '100%'
  },
  row: {
    display: 'table',
    width: "100%", /*Optional*/
    tableLayout: 'fixed', /*Optional*/
    borderSpacing: '10px', /*Optional*/
  },
  column: {
    display: 'table-cell',
    width: '10px',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
    height: '20px',
  },
  playIcon: {
    height: 30,
    width: 30,
  },
  });

class PlayQueue extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
           queueItem: [],
           current: {},
           open: false,
           showbutton: true,
        }
    }

    componentDidMount() {
          var queue = [];
          var position = 0;
          this.props.queue.map(queueRef => {
            queueRef.onSnapshot((doc) => {
              let queueItem = {...doc.data(), id: doc.id, position: position} 
              if(position === 0) {
                this.setState({
                  current: queueItem,
                });
              }
              position++
              queue.push(queueItem)
          })
          
        });
        this.setState({
          queueItem: queue,
        })
   }

   navigateBackward = () => {
        var position = this.state.current.position
        if(position === 0){

        } else {
          position = position-1;
          this.state.queueItem.map(article => {
            if(article.position === position) {
                this.setState({
                  current: article,
                })
            } 
          })
        }
    }
  
   navigateForward = () => {
        var position = this.state.current.position
        position = position+1;
        this.state.queueItem.map(article => {
          if(article.position === position) {
              this.setState({
                current: article,
              })
          } 
        })
   } 

   play = () => {
    this.setState({
      open: true,
    })
  }

  handleClose = () => {
    this.setState({
      open: false,
    })
  }

  handleOpenNewTab = (event) => {
    window.open(this.state.current.url);
}

    render() {
        const { classes } = this.props;
        
        return (
          <div>
                  <Button 
                    variant="contained"
                    style={{ backgroundColor: green[500] , color: 'black' , marginTop: '10px'}} 
                    onClick={this.play}
                    startIcon={<PlayArrowIcon />}
                  >
                    Play
                  </Button>
                      <Dialog 
                        className={classes.root}
                        onClose={this.handleClose}
                        open={this.state.open}
                        >
                            <DialogTitle className={classes.content}>
                                {this.state.queueItem.length} items in the queue
                                <IconButton color="secondary" style={{float: 'right' }} onClick={() => this.setState({open: false})}>
                                    <CloseIcon />
                                  </IconButton>
                            </DialogTitle>
                            <Typography component="h6" variant="h6" style={{paddingLeft: '50px'}} >
                                  {this.state.current.name}
                            </Typography>
                            <div className={classes.row}>
                                <IconButton color="secondary" onClick={this.navigateBackward} className={classes.column} component="span">
                                    <SkipPreviousIcon />
                                </IconButton>
                                <div  style={{display: 'block', size:'100px',height:'300px', margin: '0 20px 0 20px'}}>
                                    <iframe src={this.state.current.url}  width="100%" height="500px"></iframe>
                                </div>
                                <IconButton color="secondary" onClick={this.navigateForward} className={classes.column} component="span">
                                    <SkipNextIcon />
                                </IconButton>
                            </div>
                            <DialogActions>
                                <Button variant="contained" color="primary" style={{margin: '10px'}} onClick={this.handleOpenNewTab}>
                                   Go to Website
                                </Button>
                            </DialogActions>
                      </Dialog>
                  </div>
        )}
}

export default withStyles(styles) (PlayQueue);