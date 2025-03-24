import Phaser, { Scale } from "phaser";
import Game from "./scenes/game";
import MakeScene from "./scenes/makescene";
import X2GameScene from "./scenes/x2gamescene";
import LoadingScene from "./scenes/loadingscene";


const config={
  type: Phaser.AUTO,
  width: 380,
  height: 558,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game-container',
    },

  //parent: "game-container",
  scene: [LoadingScene, Game, MakeScene, X2GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },

  resolution: window.devicePixelRatio,

}

WebFont.load({
  google: {
      families: ['Poetsen One:400']
  },
  active: function() {
      // 폰트 로드가 완료되면 게임 시작
      const game = new Phaser.Game(config);
  }
});