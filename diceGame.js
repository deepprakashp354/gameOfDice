// Implementation Details
// - Implement a standalone program in your favorite programming language which takes the
// values N (number of players) and M (points of accumulate) as command line arguments.
// - Name the players as Player-1 to Player-N and randomly assign the order in which they
// will roll the dice.
// - When it's the turn for Player-X to roll the dice prompt a message like “Player-3 its your
// turn (press ‘r’ to roll the dice)
// - Randomly simulate a dice roll, display the points achieved and add the points to the
// user’s score.
// - Print the current rank table which displays the points of all users and their rank after
// each roll.
// - If the user gets another chance because they rolled a ‘6’ or they are penalised because
// they rolled ‘1’ twice consecutively then print appropriate message on standard output to
// inform the user.
// - If a user completes the game, print an appropriate message on the output displaying
// their rank.

// God, Game of Dice
class God {
    numOfPlayers = 0 ;
    maxRun = 0;
    constructor(n, m) {
        this.numOfPlayers = n;
        this.maxRun = m;

        // adding players details to store
        const playerScores = {}
        for (let i = 0; i < this.numOfPlayers; i++) {
            playerScores["Player "+(i+1)] = 0
        }

        // initializing store's initial value
        this.store.set({
            playerScores,
            nextPlayer: 0,       // who will play next,
            currentDiceRollValue: 0,
            winnerList: [],      // list of winners,
            skipNextChance: {},
            playersToSkipRound: []   // list of players to skip round
        })
    }

    // plot the buttons on the ui
    plotButtons(emptyNode) {
        const container = document.getElementById("players");
        // if set to true
        // empty the node first
        if (emptyNode) {
            container.innerHTML = "";
        }

        const players = Object.keys(this.store.state.playerScores);
        const nextPlayer = this.store.state.nextPlayer;
        // plot players button
        players.forEach((player, i) => {
            const playerButton = document.createElement("input");
            const playerTotalScore = document.createElement("span");
            const playerCurrentDiceRoll = document.createElement("span");
            const lineBreak = document.createElement("br");

            playerCurrentDiceRoll.id = "playerCurrentDiceValue";
            playerButton.type = "button";
            playerButton.value = player;
            playerButton.style.width = "300px";
            playerButton.style.height = "60px";
            playerButton.style.backgroundColor = "#3498db";
            playerButton.style.border = "solid";
            playerButton.style.borderWidth = "0px";
            playerButton.style.marginTop = "20px";

            // buttons will be disabled
            // if its not user's turn
            if (nextPlayer !== i) {
                playerButton.disabled = true;
                playerButton.style.backgroundColor = "#bdc3c7";
            }
            playerButton.onclick = () => this.playerRound(player);
            playerTotalScore.innerHTML = " = "+this.store.state.playerScores[player];
            playerCurrentDiceRoll.innerHTML= ", DiceValue = "+this.store.state.currentDiceRollValue;
            
            container.appendChild(playerButton);
            container.appendChild(playerTotalScore);

            // adding dice value
            if (nextPlayer - 1 === i) {
                container.appendChild(playerCurrentDiceRoll);
            }
            container.appendChild(lineBreak);
        });
    }

    // play the round
    playerRound(playerId) {
        let playerScore = this.store.state.playerScores[playerId];

        // get dice value
        let diceValue = this.rollDice();

        // check skip round
        this.checkSkipRound(playerId, diceValue);

        // add current dicevalue to previous score
        playerScore += diceValue;

        this.store.set({
            playerScores: {
                ...this.store.state.playerScores,
                [playerId]: playerScore,
            }
        }, () => {
            // choose winner
            if (playerScore >= this.maxRun) {
                this.chooseWinner(playerId, playerScore);
            }

            // select next player
            this.selectNextPlayer(diceValue);

            // rerender buttons
            this.plotButtons(true);
        });
    }

    // check if skip round
    checkSkipRound(playerId, diceValue) {
        const playersToSkipRound = [...this.store.state.playersToSkipRound];
        const { skipNextChance } = this.store.state;
        if (diceValue === 1 && skipNextChance[playerId] === 1) {
            playersToSkipRound.push(playerId);
            delete skipNextChance[playerId];

            this.store.set({
                playersToSkipRound,
                skipNextChance
            })
        } else if(diceValue === 1 && !skipNextChance[playerId]) {
            skipNextChance[playerId] = 1;

            this.store.set({
                skipNextChance
            })
        }
    }

    // choose a winner
    chooseWinner(playerId, playerScore) {
        const playerScores = {...this.store.state.playerScores};
        delete playerScores[playerId];

        // updating number of players, winner is excluded now
        this.numOfPlayers = Object.keys(playerScores).length;

        const winnerList = [...this.store.state.winnerList];
        winnerList.push({
            playerId,
            playerScore,
            rank: Object.keys(this.store.state.winnerList).length
        })

        // setting winner list to the store
        this.store.set({
            winnerList,
            playerScores
        })

        // show leaderboard
        if (this.numOfPlayers === 0) {
            this.plotLeaderBoard();
        }
    }

    // plot final leaderboard
    plotLeaderBoard() {
        const winnerList = [ ...this.store.state.winnerList ];
        const leaderBoardTable = document.getElementById("leaderboard")
        
        winnerList.forEach((player) => {
            const row = document.createElement("tr");
            Object.values(player).forEach((cell) => {
                const c = document.createElement("td");
                c.innerHTML = cell;
                row.appendChild(c);
            })

            leaderBoardTable.appendChild(row);
        });
    }

    // select next player
    selectNextPlayer(playerScore) {
        const { playersToSkipRound } = this.store.state;

        let nextPlayer = this.store.state.nextPlayer;
        if (playerScore != 6) {
            nextPlayer += 1;
        }

        if (nextPlayer >= this.numOfPlayers) {
            nextPlayer = 0;
        }

        // if playersToSkipRound includes the player, then
        // skip and pull the index value out from the array
        const nextPlayerId = "Player "+nextPlayer;
        if (playersToSkipRound.includes(nextPlayerId)) {
            nextPlayer += 1;
            
            playersToSkipRound.splice(playersToSkipRound.indexOf(nextPlayerId), 1);
            this.store.set({
                playersToSkipRound
            });
        }

        this.store.set({
            nextPlayer
        })

        return nextPlayer;
    }

    // roll the dice
    rollDice() {
        const currentDiceRollValue = Math.floor(Math.random() * 6) + 1;
        this.store.set({
            currentDiceRollValue
        });

        return currentDiceRollValue;
    }
}

// linking store to God
var store = new Store();
God.prototype.store = store;