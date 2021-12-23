


let game = {};



var manager = new StateMachine({
    init: 'startup',
    transitions: [

        // startup
        { name: "fire", from: "startup", to: "home" },

        // home screen
        { name: "newGame", from: "home", to: "characterChoice" },
        { name: "consultBookOfDeath", from: "home", to: "bookOfDeath" },

        // character choice
        { name: "startGame", from: "characterChoice", to: "game" },
        

    ],
    methods: {

        onAfterTransition: function() {

            if (this.state in ui.gameStateUI)
                ui.gameStateUI[this.state]();
        },

        onNewGame: function() {

            console.log("new game")
        },

        onStartGame: function() {

            console.log("start game")
        },
    }
});





window.onload = function () {

    ui.init();
    manager.fire();
}

