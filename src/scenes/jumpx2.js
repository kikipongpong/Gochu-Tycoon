export default class X2GameScene extends Phaser.Scene {
    constructor() {
      super('x2GameScene');
    }
  
    preload() {
        this.load.image("ninja", "./assets/images/ninja.png");
        this.load.image("pole", "./assets/images/pole.png");
        this.load.image("powerbar", "./assets/images/powerbar.png");
    }
  
    create() {
      this.score = 0;
      this.placedPoles = 0;
      this.topScore = localStorage.getItem('topFlappyScore') || 0;
  
      this.scoreText = this.add.text(10, 10, '-', {
        font: 'bold 16px Arial'
      });
      this.updateScore();
  
      this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, 'background'); // Assuming a background image
  
      this.ninja = this.physics.add.sprite(80, 0, 'ninja');
      this.ninja.setOrigin(0.5);
      this.ninja.lastPole = 1;
  
      this.poleGroup = this.physics.add.group({ immovable: true });
  
      this.input.on('pointerdown', this.prepareToJump, this);
  
      this.addPole(80);
    }
  
    update() {
      this.physics.arcade.collide(this.ninja, this.poleGroup, this.checkLanding, null, this);
  
      if (this.ninja.y > this.game.config.height) {
        this.die();
      }
    }
  
    updateScore() {
      this.scoreText.setText(`Score: ${this.score}\nBest: ${this.topScore}`);
    }
  
    prepareToJump() {
      if (this.ninja.body.velocity.y === 0) {
        this.powerBar = this.add.image(this.ninja.x, this.ninja.y - 50, 'powerbar');
        this.powerBar.setScale(0, 1);
  
        this.powerTween = this.tweens.add({
          targets: this.powerBar,
          props: { scaleX: 1 },
          ease: 'Linear',
          duration: 1000,
          onComplete: this.jump,
          onCompleteScope: this
        });
  
        this.input.off('pointerdown', this.prepareToJump, this);
      }
    }
  
    jump() {
      this.ninja.setVelocityY(-this.powerBar.scaleX * 300 - 100);
      this.powerBar.destroy();
      this.tweens.removeAll();
  
      this.input.off('pointerup', this.jump, this);
    }
  
    addNewPoles() {
      let maxPoleX = 0;
  
      this.poleGroup.children.iterate(function (child) {
        maxPoleX = Math.max(child.x, maxPoleX);
      });
  
      const nextPolePosition = maxPoleX + this.game.rnd.between(this.minPoleGap, this.maxPoleGap);
      this.addPole(nextPolePosition);
    }
  
    addPole(poleX) {
      if (poleX < this.game.config.width * 2) {
        this.placedPoles++;
        const pole = new Pole(this.physics, poleX, this.game.rnd.between(250, 380));
        this.add.existing(pole);
        pole.setOrigin(0.5, 0);
        this.poleGroup.add(pole);
  
        this.addPole(poleX + this.game.rnd.between(this.minPoleGap, this.maxPoleGap));
      }
    }
  
    die() {
      localStorage.setItem('topFlappyScore', Math.max(this.score, this.topScore));
      this.scene.restart();
    }
    checkLanding(ninja, pole) {
        if (pole.y >= ninja.y + ninja.height / 2) {
          const border = ninja.x - pole.x;
          if (Math.abs(border) > 20) {
            ninja.setVelocityX(border * 2);
            ninja.setVelocityY(-200);
          }
    
          const poleDiff = pole.poleNumber - ninja.lastPole;
          if (poleDiff > 0) {
            this.score += Math.pow(2, poleDiff);
            this.updateScore();
            ninja.lastPole = pole.poleNumber;
          }
    
          if (this.ninjaJumping) {
            this.ninjaJumping = false;
            this.input.on('pointerdown', this.prepareToJump, this);
          }
        } else {
          this.ninjaFallingDown = true;
          this.poleGroup.children.iterate(function (child) {
            child.setVelocityX(0);
          });
        }
      }
    }
    
    class Pole extends Phaser.Physics.Arcade.Sprite {
      constructor(physics, x, y) {
        super(physics.scene, x, y, 'pole');
        this.body.setImmovable(true);
        this.poleNumber = this.scene.placedPoles;
      }
    
      update() {
        if (this.scene.ninjaJumping && !this.scene.ninjaFallingDown) {
          this.setVelocityX(-this.scene.powerBar.scaleX * 300); // Assuming powerBar is accessible here (Consider refactoring)
        } else {
          this.setVelocityX(0);
        }
    
        if (this.x < -this.width) {
          this.destroy();
          this.scene.addNewPoles();
        }
      }
    }
    