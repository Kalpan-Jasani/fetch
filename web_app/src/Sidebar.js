import React from 'react';
import { Drawer, Divider, Button, Avatar, Grid } from "@material-ui/core";
import HomeIcon from '@material-ui/icons/Home';
import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined';
import { Link } from 'react-router-dom';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ToggleMode from './ToggleMode';

import firebase from 'firebase';

import './sidebar.css';

const getInitials = (string) => {
    var names = string.split(' '),
        initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
}

function Sidebar(props) {
    var user = firebase.auth().currentUser;
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
            <Link to="/profile" className="sidebar-item link">
                Profile
            </Link>
            <Link to="/users" className="sidebar-item link">
                Users
            </Link>
            <Divider/>
            <Link to="/starred" className="sidebar-item starred link">
                Starred articles
            </Link>
            <Link to="/boards" className="sidebar-item personal-boards link">
                Boards
            </Link>
            <Link to="/community-boards" className="sidebar-item community-boards link">
                Community Boards
            </Link>
            <Divider/>
            <ToggleMode/>
            <Button id="add-article-sidebar" onClick={()=>props.openForm(true)}>
                <AddCircleOutlinedIcon/>
                New article
            </Button>
        </Drawer>
    )
}

export default Sidebar;
