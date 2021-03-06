import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { socket } from '../assets/socket';

import Header from '../assets/Header';
import Break from '../assets/Break';
import LobbyTables from './LobbyTables';

import '../assets/App.css';
import ClickSound from '../sounds/click';
import { auth } from "../assets/auth";
import { googleAuth } from "../Login/LoginScreen";
import {getCookiesInfo, removeCookies} from "../assets/utils";


class ViewLobbies extends Component {
    constructor(props) {
        super(props);

        const cookiesInfo = getCookiesInfo();
        // note: enter lobby is what the lobbytable child fills, when the user clicks a lobby to join. ROOMID
        this.state = {
            userName: cookiesInfo.name,
            email: cookiesInfo.email,
            previous: false,
            goToRoom: false,
            enter_lobby: '',

        };

        this.goPrevious = this.goPrevious.bind(this);
        this.goToJoinLobby = this.goToJoinLobby.bind(this);
    }

    componentDidMount() {
        socket.on("reconnect_error", () => {
            // console.log("Error! Disconnected from server", error);
            console.log("Error! Can't connect to server");
            auth.logout(() => {
                // reason history is avail on props is b/c we loaded it via a route, which passes
                // in a prop called history always
                removeCookies();
                googleAuth.signOut();
                console.log("going to logout!");
                this.props.history.push('/');
            });
        });
    }

    componentWillUnmount() {
        socket.off("reconnect_error");
        socket.off("joining certain lobby success");
    }

    goPrevious() {
        ClickSound();
        this.setState({
            previous: true,
        });
    }

    // callback function from the lobby table that will return the lobby_code that we can join.
    goToJoinLobby(join_code) {
        ClickSound();
        console.log('received join_code from table', join_code);
        // after i join, i send an event to update everyone in the viewlobbies screen. They will see the new amt of players
        // per room
        socket.emit('please give lobbies');

        socket.emit('join certain lobby', {
            room: join_code,
            email: this.state.email,
            username: this.state.userName,
        });
        // once i emit join certain lobby and everything went alright in server, i receive event to go to room
        socket.on("joining certain lobby success", () => {
            this.setState({
                goToRoom: true,
                enter_lobby: join_code,
            });
        });

    }

    render() {


        //the idea is, for each record in the lobby database, a new div or list will appear.
        let comp;
        if (this.state.previous) {
            comp = <Redirect to='/MainMenu' />
        } else {
            if (this.state.goToRoom === true) {
                comp = <Redirect to={{
                    pathname: '/Room',
                    state: {
                        join_code: this.state.enter_lobby
                    }
                }} />
            } else {
                comp = (
                    <div className="GameWindow">
                        <Header title="Lobby Selection" previous={this.goPrevious}/>
                        <Break/>

                        <div className="ContentScreen">
                            <LobbyTables lobbyCallback={this.goToJoinLobby} />

                            <div className="createLobby">
                                <Link to='/CreateLobby'>
                                    <span className='start-btn-red ff-20 width-250'>CREATE LOBBY</span>
                                </Link>
                                <Link to='/JoinByCode'>
                                    <span className='start-btn-blue ff-20 width-250'>JOIN BY CODE</span>
                                </Link>
                            </div>

                        </div>

                    </div>
                );
            }
        }
        return <>{comp}</>;
    }
}

export default ViewLobbies;
