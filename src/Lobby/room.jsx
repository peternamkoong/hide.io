import React, { Component } from "react";
import Header from "../assets/header";
import Break from "../assets/break";
import { socket } from "../assets/socket";

import "bootstrap/dist/js/bootstrap.bundle";
import "../assets/App.css";
import { returnGameMode, returnGameMap, returnGameTime } from "../assets/utils";
import ViewLobbies from "./viewLobbies";
import Game from "../Game/Game";
import ClickSound from "../sounds/click";
import TimerSound from "../sounds/timer";

class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: this.props.name,
            email: this.props.email,
            image: this.props.image,
            roomID: this.props.join_code,
            title: "",
            header: "Join Code: " + this.props.join_code,
            game_mode: "",
            game_map: {},
            game_time: "",
            start: false,
            players: {},
            playersList: [],
            onKeyboard: "",
            message: "",
            messages: [],
            time: ""
        };
        this.goPrevious = this.goPrevious.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.start = this.start.bind(this);

        // this lets the socket join the specific room
        socket.emit("ask for lobby info", this.state.roomID);
    }

    goPrevious() {
        socket.emit("leave lobby", { room: this.state.roomID, email: this.state.email });
        // i ensure everything is first handled properly in the server, and is up to date
        // before i leave
        socket.on("may successfully leave lobby", ()=>{
            ClickSound();
            this.setState({
                previous: true
            });
        })
    }

    sendMessage() {
        console.log("send this message: " + this.state.onKeyboard);
        socket.emit("send message", {
            room: this.state.roomID,
            username: this.state.userName,
            message: this.state.onKeyboard,
        });

        let obj = { username: this.state.username, message: this.state.onKeyboard };
        this.setState({
            message: this.state.onKeyboard,
            onKeyboard: "",
        });
    }

    handleKeyboard(e) {
        this.setState({
            onKeyboard: e.currentTarget.value,
        });
    }

    startTimer() {
        // 3 second timer currently
        // TimerSound();
        socket.emit("game starting");
        this.setState({
            header: "Game is starting in ..."
        })
    }

    start() {
        this.setState({
            start: true,
        });
    }

    componentDidMount() {
        // socket.emit("player joined");
        socket.on("giving lobby info", (lobby) => {
            if (!lobby) {
                console.log("Received not a lobby! Check room.js line 54, and server.js line 119");
            }else{
                console.log("Received lobby info", lobby);
                this.setState({
                    title: lobby.lobby_name,
                    game_mode: returnGameMode(lobby.game_mode),
                    game_time: returnGameTime(lobby.game_time),
                    game_map: returnGameMap(lobby.game_map),
                });
                console.log(this.state.game_map);
            }
        });
        // everytime this event is called, its passed a set of the users in the lobby
        // parameter: lobby_users - a SET containing all the users username
        socket.on("update lobby list", (lobby_users) => {
            console.log("Received current lobby users ", lobby_users);
            // lobby_users.map((value, key) => {
            //     console.log("Received: " + value.username)
            //     const obj = {'username': value.username, 'email': value.email}
            //     this.setState ({
            //         playersList: [...this.state.player
            //     })
            // })
            this.setState({
                playersList: lobby_users,
            });

            // for (let i =0; i<this.state.playersList.length; i++) {
            //     console.log("Player: " + this.state.playersList[i].username)
            // }
        });

        // this event occurs on function startTimer()
        socket.on("game starting ack", () => {
            socket.emit("lobby start timer", {timer: 4100, room: this.state.roomID});
        });

        socket.on("lobby current timer", (countdown) => {
            console.log(countdown);
            this.setState({
                time: countdown.toString()
            });
            // TimerSound();
            // after i reach 0, call startGame
            if (countdown <= 0) {
                console.log("starting game");
                this.start();
            }
        });

        socket.on("message from server", (info) => {
            let obj = { username: info.username, message: info.message };

            this.setState({
                messages: [...this.state.messages, obj],
            });
        });
    }

    componentWillUnmount() {
        console.log("Component unmounting!!!===================");
        socket.off("giving lobby info");
        socket.off("update lobby list");
        socket.off("game starting ack");
        socket.off("lobby current timer");
    }

    render() {
        console.log("rendering in ROOM");
        let comp;
        let countdownTimer;
        if (this.state.startTimer) {
            countdownTimer = (
                <React.Fragment>
                    <h4>Game Starting in </h4>
                    <h2>{this.state.time}</h2>
                </React.Fragment>
            );
        } else {
            countdownTimer = (
                <React.Fragment>
                    <h4></h4>
                    <h2></h2>
                </React.Fragment>
            );
        }
        if (this.state.previous) {
            comp = (
                <ViewLobbies
                    email={this.state.email}
                    name={this.state.userName}
                    image={this.state.image}
                />
            );
        } else if (this.state.start) {
            comp = (
                <Game
                    gameID={this.state.roomID}
                    players={this.state.players}
                    map={this.state.game_map}
                    timeLimit={this.state.game_time}
                    mode={this.state.game_mode}
                />
            );
        } else {
            comp = (
                <div className="GameWindow">
                    <Header
                        previous={this.goPrevious}
                        image={this.state.image}
                        title={this.state.title}
                    />
                    <Break />
                    <div className="ContentScreen">
                        <div className="chatRoom">
                            <div className="chat">
                                <ul id="messages" style={{ color: "white" }}>
                                    {this.state.messages.map(function (d, idx) {
                                        return (
                                            <li style={{ listStyleType: "none" }} key={idx}>
                                                {d.username}: {d.message}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            <div className="input-group mb-3">
                                {/* <form onSubmit={this.sendMessage}> */}
                                <input
                                    type="text"
                                    className="form-control"
                                    aria-describedby="basic-addon2"
                                    onChange={this.handleKeyboard}
                                    value={this.state.onKeyboard}
                                />
                                <div className="input-group-append">
                                    <button
                                        onClick={this.sendMessage}
                                        className="btn btn-outline-secondary"
                                        type="button">
                                        Submit
                                    </button>
                                </div>
                                {/* </form> */}
                            </div>
                        </div>

                        <div className="roomActions">
                            <h5>{this.state.header}</h5>
                            <h1>{this.state.time}</h1>
                            <button
                                className="btn btn-success"
                                onClick={this.startTimer}>
                                Start Game
                            </button>
                            <div className="roomSettings">
                                <h4>Game Mode:</h4>
                                <h6>{this.state.game_mode}</h6>
                                <h4>Time Limit:</h4>
                                <h6>{this.state.game_time}</h6>
                                <h4>Map:</h4>
                                <h6>{this.state.game_map["name"]}</h6>
                            </div>
                        </div>
                        <div className="online">
                            <ul>
                                {this.state.playersList.map((player, index) => {
                                    return <li style={{ listStyleType: "none" }} key={index}>{player.name}</li>;
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }
        return <React.Fragment>{comp}</React.Fragment>;
    }
}

export default Room;
