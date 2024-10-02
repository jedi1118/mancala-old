var Mancala = {
  _GAME_SPEED: 500,
  _CUPS: 6,
  _CUP_MARBLES: 3,
  _gameData: {
      players: {},
      autoPlay: false
  },
  _turnData: null
};

var Cup = function(marbles, isPot, player, idx) {
  this.marbles = marbles;
  this.pot = isPot;// special pot cup, only add, not remove
  this.player = player;
  this.idx = idx;
  // this.render();
};
Cup.prototype.getData = function() {
  return {
      pot: this.pot,
      player: this.player,
      idx: this.idx
  };
};
Cup.prototype.getSelector = function() {
  return `.${this.player}.cup.c${this.idx}`;
};
// when adding, mancala only add 1 to the cup
Cup.prototype.add = function() {
  this.marbles++;
  console.log("#cup: add:", this.marbles);
  document.querySelector(this.getSelector()).innerHTML += Cup.getMarble();
  document.querySelector(this.getSelector()).nextElementSibling.innerHTML = this.marbles;// reset count

  // this.render();
};
// returns count of marbles in the cup
Cup.prototype.getCount = function(){
  return this.marbles;
};
// returns count of marbles in the cup
Cup.prototype.isPot = function(){
  return this.pot;
};
Cup.prototype.getPlayer = function(){
  return this.playert;
};
// when remove, mancala removes all marbles from a cup
Cup.prototype.removeAll = function() {
  var count = this.marbles;
  this.marbles = 0;
  console.log("#cup: removeAll:", count);
  this.render();
  return count;
};
Cup.prototype.render = function(){
  var html = '';
  for(var i = 0; i < this.marbles; i++){
      html += Cup.getMarble();
  }
  document.querySelector(this.getSelector()).dataset.cup = JSON.stringify(this.getData());
console.log("####", this.getSelector());
  document.querySelector(this.getSelector()).innerHTML = html;
  document.querySelector(this.getSelector()).nextElementSibling.innerHTML = this.marbles;// reset count
};
Cup.getMarble = function(){
  var style = Helper.getMarbleStyle();
  var pos = Helper.getMarblePosition();
  return `<div class="${style}" style="${pos}"></div>`;
};
var Helper = {};
Helper.getMarbleStyle = function(){
  var MAX = 10;
  var idx = Math.floor(Math.random() * 10);
  return `marble m${idx}`;
};
Helper.getMarblePosition = function(pot){
  var MAX = 10;
  var idx = Math.floor(Math.random() * 10);
  var t = 60;
  var l = !pot ? 60 : 160;
  var top = Math.random() * t;
  var left = Math.random() * l;

  return `top: ${top}px;left:${left}px`;
};
// all marbles in cups
Helper.getPlayerCupMarbleCount = function(playerId){
  var sum = 0;
  var cups =  Mancala._gameData.players[playerId].cups;
  for (var i = 0; cups && i < cups.length; i++) {
      if (!cups[i].isPot()) {
          sum += cups[i].getCount();
      }
  }
  return sum;
};

Helper.getFinalCount = function(){
  var p1 = window.Mancala._gameData.players['player1'].cups[6].getCount();
  var p2 = window.Mancala._gameData.players['player2'].cups[6].getCount();
  return {
      "player1": p1,
      "player2": p2
  }
};

Helper.exportGameData = function(){
  return JSON.parse(JSON.stringify(Mancala));
};
Helper.importGameData = function(input){
  let data = input
  if(typeof input === 'string') {
      data = JSON.parse(input);
  }
  Mancala = data;
  for(var p in data._gameData.players){// loop through players
      var player = data._gameData.players[p];
      for(var i = 0; i < player.cups.length; i++) {// loop through cups
          var cup = player.cups[i];
          var newCup = new Cup(cup.marbles, cup.pot, cup.player, cup.idx);
          newCup.render();
          Mancala._gameData.players[p].cups[cup.idx] = newCup;
      }
  }
  var player = Mancala._gameData.players[Mancala._turnData.playerId].name;
  if (Mancala._turnData.autoPlay) {
      Game.showMsg(`Auto play.`);
      Helper.startAutoPlay();
      return;
  }
  Game.showMsg(`${player}'s turn. Please select a cup.`);
};
Helper.getOtherPlayerId = function(player) {
  return player === "player1" ? "player2" : "player1";
};
Helper.isEndOfGame = function() {
  var pots = Helper.getFinalCount();
  // just check combinded pots is equal to inital marble count:
  return (Mancala._CUPS * Mancala._CUP_MARBLES * 2) === (pots.player1 + pots.player2);
  // return Helper.getPlayerCupMarbleCount('player1') === 0 && Helper.getPlayerCupMarbleCount('player2') === 0;
};
Helper.getPlayerName = function(playerId) {
  return Mancala._gameData.players[playerId].name;
};
Helper.getWinner = function() {
  var outcome = Helper.getFinalCount();
  if (outcome.player1 == outcome.player2) {// draw
      return null;
  }
  return outcome.player1 > outcome.player2 ? 'player1' : 'player2';
};
Helper.showWinner = function() {
  var winner = Helper.getWinner()
  if (winner === null) {
      Game.showMsg("It's a Draw!  Play again?");
  } else {
      var player = Helper.getPlayerName(winner)
      Game.showMsg(`The winner is ${player}!`);
  }
};
Helper.startAutoPlay = function() {
  setTimeout( function(){
      document.querySelector(`.${Mancala._turnData.cupSide}.cup.c${Mancala._turnData.cupIdx}`).click();
  }, Mancala._GAME_SPEED);
};
Helper.endOfGameRoutine = function(){
  if (window.intervalKey) {
      window.clearInterval(window.intervalKey);
      window.intervalKey = null;
  }
  Game.showMsg(`End of game.`);

  Helper.showWinner();
  return;
};
var Game = function(){
  this.CUPS = 6;
  this.MARBLES = 3;
  var player1 = {
      id: "player1",
      name: "kristen",
      cups: this.setupPlayer("player1")
  }
  var player2 = {
      id: "player2",
      name: "Leia",
      cups: this.setupPlayer("player2")
  }
  window.Mancala._gameData = {
      players: {
          player1: player1,
          player2: player2
      }
  };

  var that = this;
  document.querySelector(".wrapper").addEventListener("click", function(evt){
      // TODO: move into validation function
      if (window.intervalKey) {// play in progress
          Game.showMsg(`Turn in progress, please wait`);
          return;
      }
      var elem = evt.srcElement;
      // clicked on a marble
      if (elem.classList.contains("marble")){
          elem = elem.parentElement;
      }
      // something else: a pot or not a cup
      if (elem.classList.contains("pot") || !elem.classList.contains("cup")){
          evt.stopPropagation();
          evt.cancelBubble = true;
          Game.showMsg(`Please select a cup`);
          return;
      }
      console.log('###click', elem);
      if (!elem) {// clicked on something other than the cups
          Game.showMsg(`${window.Mancala._gameData.players[window.Mancala._turnData.playerId].name} turn, please make your move`);
          return;
      }
      that.playTurn(elem);
  });

};
Game.prototype.setupPlayer = function(playerId){
  var playerPits = [];
  // setup cups
  for (var i = 0; i < this.CUPS; i++){
      var cup = new Cup(this.MARBLES, false, playerId, i);
      cup.render();
      playerPits.push(cup);
  }
  // setup pot
  var pot = new Cup(0, true, playerId, i);
  pot.render();
  playerPits.push(pot);
  return playerPits;
};
Game.prototype.playTurn = function(cup){
  console.log('###playTurn', cup);

  // if (!cup) {// clicked on something other than the cups
  //     Game.showMsg(`${window.Mancala._gameData.players[window.Mancala._turnData.playerId].name} turn, please make your move`);
  //     return;
  // }

  var data = JSON.parse(cup.dataset.cup);//cup.classList; i.e.: {"pot":false,"player":"player2","idx":5}
  
  var cupSide =  data.player;//data.contains("player1") ? "player1" : "player2";
  if (!window.Mancala._turnData.playerId) {
      window.Mancala._turnData.playerId = cupSide;
      window.Mancala._turnData.cupSide = cupSide;
  }

  if (window.Mancala._turnData.playerId && data.player !== window.Mancala._turnData.playerId) {// check if correct player clicked
      var playerMarbles = Helper.getPlayerCupMarbleCount(Mancala._turnData.playerId);// check if player has marbles in cups
      // check if player's own side run out of marble
      if (playerMarbles !== 0) {
          console.log("##wrong player");
          Game.showMsg(`${window.Mancala._gameData.players[window.Mancala._turnData.playerId].name} turn, please make your move`);
          return;
      } else {
          Mancala._turnData.cupSide = data.player;
          Mancala._turnData.cupIdx = data.idx;
          // window.Mancala._turnData.otherSide = true;// move other player's marble
      }
  }

  if (window.Mancala._turnData && !window.Mancala._turnData.playerId) {// the very first move
      // window.Mancala._turnData.playerId = data.contains("player1") ? "player1" : "player2";
      window.Mancala._turnData.playerId = data.player;
  }

  // var cupSide =  data.player;//data.contains("player1") ? "player1" : "player2";
  // var cupData = JSON.parse(cup.dataset.cup);
  var idx = data.idx;//cupData.idx;
  // TODO: fix player run out of marbles on own side and click otherside cups
  // TODO: move into click validation: chech if cups is mepty
  if (window.Mancala._gameData.players[cupSide].cups[idx].getCount() === 0) {
      Game.showMsg(`${window.Mancala._gameData.players[window.Mancala._turnData.playerId].name} turn, please select a non-empty cup`);
      return;
  }
  // Mancala._turnData.cupSide = cupSide;// which side to pick
  Mancala._turnData.cupIdx = idx;
  Game.playTurn(cupSide, window.Mancala._turnData.playerId, idx/*, this.players*/);
  return;
};

Game.playTurn = function(side, playerId, cupIdx/*, players*/){
  var cupSide = window.Mancala._turnData.cupSide;
  var cupIdx = window.Mancala._turnData.cupIdx;
  var cups = window.Mancala._gameData.players[cupSide].cups;
  var currentCup = cups[cupIdx];
  if (currentCup.isPot()) {// don't pickup from the pot
      cupSide = cupSide === "player1" ? "player2" : "player1";
      cupIdx = 0;// if we chaneg side, then we change cupIdx to 0
  }
  var marbles = cups[cupIdx].removeAll();

  Mancala._turnData.marbles = marbles;
  Mancala._turnData.cupIdx++;// next cup idx
  if (Mancala._turnData.cupIdx >= 7) {// next move is beyaon the pot, we need to change side
      Mancala._turnData.cupSide = cupSide === "player1" ? "player2" : "player1";
      Mancala._turnData.cupIdx = 0;// start from cup 0
  }

  window.intervalKey = window.setInterval(Game.playAMove, Mancala._GAME_SPEED);
  return;
};

Game.playAMove = function(){
  var player = Mancala._turnData.playerId;
  var otherPlayer = Helper.getOtherPlayerId(player);

  if (Helper.getPlayerCupMarbleCount(player) === 0) {// payer has no more marbles, now player can play other player's marble
      console.log(`###############, ${player} has no more marbles`);
      if(Helper.getPlayerCupMarbleCount(otherPlayer) === 0) {
          console.log(`###############, ${otherPlayer} has no more marbles`);
          // auto play: me, you, me, you....
          Game.showMsg("Last marble, start Auto Play.");
          window.Mancala._turnData.autoPlay = true;
      }
  }
  var cupIdx = Mancala._turnData.cupIdx;
  var cupSide = Mancala._turnData.cupSide;
  
  var isPot = Mancala._gameData.players[cupSide].cups[cupIdx].isPot();

  // playering on other of game board:
  // dont drop into other player's pot, switch side, and start at cup 0
  if (cupSide !== player && isPot) {// setup turn data and continue interval
      Mancala._turnData.cupSide = Helper.getOtherPlayerId(cupSide);//cupSide = player;
      // cupIdx = 0;
      Mancala._turnData.cupIdx = 0;//idx = 0;
      Mancala._turnData.cupSide = Helper.getOtherPlayerId(cupSide);
      console.log("######################## reached other player's pot, switch side");
      return;
  }

  Mancala._gameData.players[cupSide].cups[/*Mancala._turnData.*/cupIdx].add();
  Mancala._turnData.marbles--;
  Game.showMarbles(player, Mancala._turnData.marbles);
  if (Mancala._turnData.marbles === 0) {// pick all if last marble is used
      // dropped into pot
      if(Mancala._gameData.players[cupSide].cups[cupIdx].isPot() ) {// last marble placed in en mepty cup, end of turn
          console.log('###got to pick again');
          // TODO: check if no more masrbles in cups
          if(Helper.isEndOfGame()) {
              Helper.endOfGameRoutine();
              return;
          }
          var playerMarblesInCup = Helper.getPlayerCupMarbleCount(player);
          var otherPlayerMarblesInCup = Helper.getPlayerCupMarbleCount(otherPlayer);
          if((playerMarblesInCup + otherPlayerMarblesInCup) === 1){// last marble on game board, start auto play
              Mancala._turnData.autoPlay = true;
              return;
          }
          Game.showMsg(`${Mancala._gameData.players[player].name} got to pick again`);
          // window.Mancala._turnData = {
          //     player: player
          // };// unset turn data
          window.clearInterval(window.intervalKey);
          window.intervalKey = null;
          return;
      } else {// not pot
          if (Mancala._gameData.players[cupSide].cups[cupIdx].getCount() === 1) {
              // window.Mancala._turnData = null;// unset turn data
              window.clearInterval(window.intervalKey);
              window.intervalKey = null;
              Game.showMsg(`end of turn. ${Mancala._gameData.players[otherPlayer].name} turn`);
              Mancala._turnData.playerId =  Helper.getOtherPlayerId(player);
              if (!Mancala._turnData.autoPlay){
                  Mancala._turnData.cupSide =  Helper.getOtherPlayerId(player);
                  Mancala._turnData.cupIdx = null;
              }
              
          } else {// dropped into non-empty cup - pickup all marbles
              Mancala._turnData.marbles = Mancala._gameData.players[cupSide].cups[Mancala._turnData.cupIdx].removeAll();
              Game.showMarbles(player, Mancala._turnData.marbles);
              Mancala._turnData.cupIdx++;
              if (Mancala._turnData.cupIdx >= Mancala._gameData.players[cupSide].cups.length) {// reached end of cups, switch side
                  Mancala._turnData.cupIdx = 0;//null;// indicatre need to change side
                  // Mancala._turnData.otherSide = true;
                  Mancala._turnData.cupSide = Helper.getOtherPlayerId(player);
              }
          }
      }
  } else {
      // has more marbles, continue play - continue with interval
      // otherwise, continue interval
      Mancala._turnData.cupIdx++;
      if (Mancala._turnData.cupIdx >= Mancala._gameData.players[player].cups.length) {
          Mancala._turnData.cupIdx = 0;//null;// indicatre need to change side
          // Mancala._turnData.otherSide = true;
          Mancala._turnData.cupSide = Helper.getOtherPlayerId(player);
      }
  }

  // TODO: count marbles, if no more on both side, end of game
  if (Helper.isEndOfGame()) {
      Helper.endOfGameRoutine();

      // debug!!!
      if (Mancala._turnData.marbles > 0) {
          alert('more marbles, not end of game');
      }
      console.log('#####################d ebug', JSON.stringify(Helper.exportGameData()));
      return;
  }
  if (Mancala._turnData.autoPlay){
      // cancel interval
      if (window.intervalKey) {
          window.clearInterval(window.intervalKey);
          window.intervalKey = null;
      }
      Helper.startAutoPlay();
      // setTimeout( function(){
      //     document.querySelector(`.${Mancala._turnData.cupSide}.cup.c${Mancala._turnData.cupIdx}`).click();
      // }, Mancala._GAME_SPEED);
  }
};
Game.showMsg = function(msg){
  document.querySelector("#msg").innerHTML = msg;
};

Game.showMarbles = function(player, num){
  document.querySelector(`#${player} div.hand`).innerHTML = num;
};
var foo = new Game();
// set initial turn data
// TODO: let player pick: 
// 1. player vs computer
// 2. player1 vs player2
window.Mancala._turnData = {
  playerId: null
};


// exported data

// one side empty
// {"_GAME_SPEED":1000,"_gameData":{"players":{"player1":{"id":"player1","name":"kristen","cups":[{"marbles":0,"pot":false,"player":"player1","idx":0},{"marbles":0,"pot":false,"player":"player1","idx":1},{"marbles":2,"pot":false,"player":"player1","idx":2},{"marbles":0,"pot":false,"player":"player1","idx":3},{"marbles":1,"pot":false,"player":"player1","idx":4},{"marbles":1,"pot":false,"player":"player1","idx":5},{"marbles":18,"pot":true,"player":"player1","idx":6}]},"player2":{"id":"player2","name":"Leia","cups":[{"marbles":0,"pot":false,"player":"player2","idx":0},{"marbles":0,"pot":false,"player":"player2","idx":1},{"marbles":0,"pot":false,"player":"player2","idx":2},{"marbles":0,"pot":false,"player":"player2","idx":3},{"marbles":0,"pot":false,"player":"player2","idx":4},{"marbles":0,"pot":false,"player":"player2","idx":5},{"marbles":14,"pot":true,"player":"player2","idx":6}]}}},"_turnData":{"playerId":"player2","cupSide":"player2","cupIdx":null}}

// last marble
// {"_GAME_SPEED":1000,"_gameData":{"players":{"player1":{"id":"player1","name":"kristen","cups":[{"marbles":0,"pot":false,"player":"player1","idx":0},{"marbles":0,"pot":false,"player":"player1","idx":1},{"marbles":0,"pot":false,"player":"player1","idx":2},{"marbles":0,"pot":false,"player":"player1","idx":3},{"marbles":0,"pot":false,"player":"player1","idx":4},{"marbles":0,"pot":false,"player":"player1","idx":5},{"marbles":21,"pot":true,"player":"player1","idx":6}]},"player2":{"id":"player2","name":"Leia","cups":[{"marbles":0,"pot":false,"player":"player2","idx":0},{"marbles":0,"pot":false,"player":"player2","idx":1},{"marbles":1,"pot":false,"player":"player2","idx":2},{"marbles":0,"pot":false,"player":"player2","idx":3},{"marbles":0,"pot":false,"player":"player2","idx":4},{"marbles":0,"pot":false,"player":"player2","idx":5},{"marbles":14,"pot":true,"player":"player2","idx":6}]}}},"_turnData":{"playerId":"player1","cupSide":"player1","cupIdx":6,"marbles":0}}
