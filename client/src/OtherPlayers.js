import React, {Component} from 'react';
import player_img from "./assets/player.png";


class OtherPlayers extends Component {

    constructor(props) {
        super(props);

        this.state = {
            playerX: this.props.xPos,
            playerY: this.props.yPos,
            playerSpeed: 50,

        };
    }


    render() {
        const player_attr = {
            width: 50,
            height: 50,
            top: this.state.playerY,
            left: this.state.playerX,
            position: 'absolute'
        };

        return (
            <img src={player_img}
                 style={player_attr}
                 alt="Player sprite for the game"
            />
        );
    }
}

export default OtherPlayers;