import React, { useEffect, useRef, useState } from 'react';
import { Drawer, Divider, Button, Avatar, IconButton } from "@material-ui/core";
import HomeIcon from '@material-ui/icons/Home';
import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined';
import { withRouter, Link } from 'react-router-dom';
import ToggleMode from './ToggleMode';
import { ExpandMore, ExpandLess} from '@material-ui/icons';
import firebase from 'firebase';
import './sidebar.css';
import logo from './Assets/fetch.png';

const getInitials = (string) => {
    var names = string.split(' '),
        initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
}

const subscribeToBoards = (updateBoards, context) => {

    // firebase query: get all personalboards sorted by timestamp
    const boardsRef = context.db.collection(`personalBoards/${context.userid}/pboards/`);
    const query = boardsRef.orderBy("timestamp");

    const unsubscribe = query.onSnapshot((querySnapshot) => {
        const boards = querySnapshot.docs.map(docSnapshot => ({
            ...docSnapshot.data(),
            ref: docSnapshot.ref
        }));
        updateBoards(boards);
    }, (err) =>  {
        console.error("could not read boards");
        console.error(err);
        alert("could not read boards");
    });

    return unsubscribe;
}

const handleToggleShowBoards = (updateShowBoards, isShowing) => {
    updateShowBoards(!isShowing);
}


function Sidebar(props) {
    const db = firebase.firestore();
    const [boards, updateBoards] = useState([]);
    const [showBoards, updateShowBoards] = useState(false); // don't show personal boards in sidebar intially
    const firebaseSubscriptions = useRef({
        personalBoards: false, 
    });

    var user = firebase.auth().currentUser;
    const userid = user.uid;

    const signOut = async (event) => {
        await firebase.auth().signOut();
        props.history.push("/login");
    }

    useEffect(() => {
        /* mark as subscribed */
        firebaseSubscriptions.current.personalBoards = true;

        /* subscribe to changes */
        const unsubscribeBoards = subscribeToBoards(updateBoards, {db, userid});

        return () => {
            /* unsubscribe and mark it as such */
            unsubscribeBoards && unsubscribeBoards();
            firebaseSubscriptions.current.recentBoards = false;
        }
    }, [firebaseSubscriptions.current.recentBoards]);

    return (
        <Drawer
            variant="permanent"
            anchor="left"
            open={true}
            className={props.classes.drawer}
            classes={{
                paper: props.classes.drawerPaper,
            }}
        >
            <img src={logo} className="sidebar-item img"/>
            <Divider/>
            <div className="sidebar-item">
                {user.photoURL === "" && user.displayName !== ""
                    ? <Avatar>{getInitials(user.displayName)}</Avatar>
                    : <Avatar src={user.photoURL} alt="" />}
                <p>{firebase.auth().currentUser.email}</p>
            </div>
            <Link to="/home" className="sidebar-item home link">
                <HomeIcon/>
                <span>Home</span>
            </Link>
            <Link to={`/profile/${user.uid}`} className="sidebar-item link">
                Profile
            </Link>
            <Link to="/users" className="sidebar-item link">
                Users
            </Link>
            <Divider/>
            <Link to="/starred" className="sidebar-item starred link">
                Starred articles
            </Link>
            <div className="sidebar-item personal-boards-div">
                <Link to="/boards" className="personal-boards-div link">
                    Personal Boards
                </Link>
                <IconButton className="personal-boards-div iconbutton" onClick={() => handleToggleShowBoards(updateShowBoards, showBoards)}>
                    {showBoards ? <ExpandLess/> : <ExpandMore/>}
                </IconButton>
            </div>
            { showBoards ? 
                boards.map((board) => (
                    <Link key={board.ref.id} to={`/boards/${board.ref.id}`} className="sidebar-item pboards link">
                        {board.boardName}
                    </Link>
                ))
                :
                null
            }
            <Link to="/community-boards" className="sidebar-item community-boards link">
                Community Boards
            </Link>
            <Link to="/articles-raised-eyebrow" className="sidebar-item raised-eyebrow link">
                Raised Eyebrow Articles
            </Link>
            <Divider/>
            <ToggleMode/>
            <Button id="add-article-sidebar" onClick={()=>props.openForm1(true)}>
                <AddCircleOutlinedIcon/>
                Personal Article
            </Button>
            <Button id="add-communityarticle-sidebar" onClick={()=>props.openForm2(true)}>
                <AddCircleOutlinedIcon/>
                Community Article
            </Button>
            <Divider/>
            <Button color="primary" variant="contained" onClick={signOut}>
                Sign Out
            </Button>
        </Drawer>
    )
}

export default withRouter(Sidebar);
