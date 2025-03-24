import Phaser from "phaser";
import Game from "./scenes/edgame";
import MakeScene from "./scenes/makescene";
import X2GameScene from "./scenes/x2gamescene";


const tileSize = 35; // tile size, in pixels
const fieldSize = 9; // number of tiles per row/column
const gameOffset = 20;

const config = {
  type: Phaser.AUTO,
  //width: fieldSize * tileSize,
  //height: fieldSize * tileSize + gameOffset + 100, // 타일이 잘리지 않도록 높이를 추가
  width: 540, // 캔버스 너비를 540으로 설정
  height: 960, // 캔버스 높이를 960으로 설정
/*
  scale: {
    //mode: Phaser.Scale.FIT,
    mode: Phaser.Scale.NONE,
   // autoCenter: Phaser.Scale.CENTER_BOTH,
  },*/
  parent: "game-container",
  scene: [Game, MakeScene, X2GameScene],
  physics: {
    default: 'arcade', // Ensure arcade physics is set
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  callbacks:{
    preBoot:(game) => {
        window.addEventListener('click', ()=>{
            if(game.sound.context.state === 'suspended'){
                game.sound.context.resume();
            }
        });
    }
  },
  resolution: window.devicePixelRatio, // 새로 추가된 부분
};



const game = new Phaser.Game(config);