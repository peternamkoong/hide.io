import React, { Component } from "react";
import Cookies from 'universal-cookie';

import "./App.css";

const cookies = new Cookies();

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showBack: this.props.showBack,
            showProfile: this.props.showProfile,
            image: cookies.get("image"),
            email: cookies.get("email"),
            title: this.props.title,
            goBack: false,
            goProfile: false
        };
        this.goBack = this.goBack.bind(this);
        this.goProfile = this.goProfile.bind(this);
    }
    goBack() {
        this.setState({
            goBack: true
        });
    }

    goProfile() {
        this.setState({
            goProfile: true
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.title !== prevProps.title) {
            this.setState({
                title: this.props.title
            })
        }
    }

    render() {
        let comp;
        let back;
        let profile;
        if (this.state.showBack !== false) {
            back = (
                <span className='start-btn-grey ff-15 width-100 height-75' onClick={this.props.previous}>GO BACK</span>
            );
        }
        if (this.state.showProfile !== false) {
            profile = (
                // <button className="btn btn-dark" onClick={this.goProfile}>
                //     Profile
                // </button>
                <img className="start-btn-profile" src={this.state.image} alt="Google or facebook's profile" />
            );
        }
        comp = (
            <>
                <div className="backButton">{back}</div>
                <div className="logo">
                    <span className="ff-header">Hide.IO</span>
                    <span className="ff-title">{this.state.title}</span>
                </div>
                <div className="profile">{profile}</div>
            </>
        );
        return <div className="header">{comp}</div>;
    }
}
export default Header;
