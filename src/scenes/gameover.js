export default class GameOver extends Phaser.Scene {
  constructor() {
    super({ key: "gameover" });
  }

  create() {
    this.width = this.sys.game.config.width;
    this.height = this.sys.game.config.height;
    this.center_width = this.width / 2;
    this.center_height = this.height / 2;


    this.cameras.main.setBackgroundColor(0x87ceeb);   
    
    // Game Over 텍스트와 점수를 표시합니다.     
    const score = this.registry.get("score");     
    this.add.bitmapText(this.center_width, 50, "arcade", this.registry.get("score"), 25).setOrigin(0.5);     
    this.add.bitmapText(this.center_width, this.center_height, "arcade", "GAME OVER", 45).setOrigin(0.5);     
    this.add.bitmapText(this.center_width, 250, "arcade", "Press SPACE or Click to restart!", 15).setOrigin(0.5);    
    this.sound.stopAll(); // 이전 상태를 초기화하도록 사운드를 멈춤      
    this.input.keyboard.on("keydown-SPACE", this.startGame, this);     
    this.input.on("pointerdown", (pointer) => this.startGame(), this); 
  }    
  startGame() {     
    this.scene.start("game");   

  } 

}
