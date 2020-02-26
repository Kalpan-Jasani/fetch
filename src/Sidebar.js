import React from 'react';
import { Drawer, Divider, Button, Avatar } from "@material-ui/core";
import HomeIcon from '@material-ui/icons/Home';
import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined';
import { Link } from 'react-router-dom';

import firebase from 'firebase';

import './sidebar.css';

function Sidebar(props) {
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
                <Avatar className={props.classes.avatar}>
                    {firebase.auth().currentUser.displayName.split(" ").reduce((prev, curr) => prev + curr.charAt(0), "")}
                </Avatar>
            </div>
            <Link to="/home" className="sidebar-item home link">
                <HomeIcon/>
                <span>Home</span>
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
            <Button id="add-article-sidebar">
                <AddCircleOutlinedIcon/>
                New article
            </Button>
            
        </Drawer>
    )
}

export default Sidebar;