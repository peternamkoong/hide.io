
function caughtSound() {
    let soundButton = new Audio("https://www.myinstants.com/media/sounds/tindeck_1.mp3")
    soundButton.volume = 0.2;
    return (
        soundButton.play()
    )
}

export default caughtSound