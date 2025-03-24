export default class Generator {
    constructor(scene) {
      this.scene = scene;
      this.coinSpeed = 200;
      this.isGenerating = false; // 코인 생성 여부 확인
      this.timer = null; // TimerEvent 객체를 저장하기 위한 변수
      this.init();
    }
    init() {
      this.isGenerating = true;
      this.startGeneratingCoins();
    }
    startGeneratingCoins() {
        if (this.timer) {
          this.timer.remove(false); // 기존 타이머 제거
        }
        this.timer = this.scene.time.addEvent({
          delay: this.coinSpeed,
          callback: this.generateCoin,
          callbackScope: this,
          loop: true
        });
      }

    generateCoin() {  
      if (this.isGenerating) {
        this.scene.coins.add(
          new Coin(
            this.scene,
            800,
            this.scene.height - 32
          )
        );
      }
    }
    setCoinSpeed(speed) {
      this.coinSpeed = speed;
      this.startGeneratingCoins(); // 코인 속도를 변경하고 다시 타이머 시작
    }
  }
  
  
  
  /*
  
    This is a game object that represents a coin. It's an animated sprite that is part of the coins group that we created in the `game` scene. It moves like the previous cloud and the obstacle objects.
    It can increase the player's score if it touches it.
  
  */
  
  class Coin extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
      super(scene, x, y, "coin");
      scene.add.existing(this);
      scene.physics.add.existing(this);
      this.body.setAllowGravity(false);
      this.init();
    }
  

    init() {
      this.scene.tweens.add({
        targets: this,
        x: { from: 820, to: -100 },
        duration: 3000,
        onComplete: () => {
          this.destroy();
        },
      });
  
  
  
      const coinAnimation = this.scene.anims.create({
        key: "coin",
        frames: this.scene.anims.generateFrameNumbers("coin", {
          start: 0,
         end: 7,
        }),
        frameRate: 8,
      });
      this.play({ key: "coin", repeat: -1 });
    }
  }