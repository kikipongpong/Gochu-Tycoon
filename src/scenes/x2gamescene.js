import Phaser from "phaser";
import { totals } from './globals';

const globalConfig = {
  ninjaStartX: 80,
  ninjaStartY: 0,
  textBackX: 10,
  textBackY: 10,
  scoreTextX: 10,
  scoreTextY: 35,
  poleMinY: 250,
  poleMaxY: 380,
  backgroundColor: "#87CEEB",
  poleGroupVelocityX:200 // 앞으로 점프할 때 사용할 속도
};

const numberD = 10;
let multiplyFactor = 1;


export default class X2GameScene extends Phaser.Scene {
    constructor() {
      super('x2GameScene');
      this.ninjaGravity = 800;
      this.ninjaJumpPower = 0;
      this.placedPoles = 0;
      this.minPoleGap = 120;
      this.maxPoleGap = 150;
      this.ninjaJumping = false;
      this.ninjaFallingDown = false;
    }

  preload() {
    this.load.image("ninja", "./assets/images/jar.png");
    this.load.image("pole", "./assets/images/pole.png");
    this.load.image("powerbar", "./assets/images/powerbar.png");
    //this.load.image("bgx2", "./assets/images/gbg3.png");
    this.load.image('bgx2', './assets/images/background-04.png');
  }


  create() {
    this.score = totals.gochujang;
    //this.topScore = localStorage.getItem('topFlappyScore') || 0;
    this.add.image(0, 0, "bgx2"); // 배경 이미지 추가

    
    // 뒤로 가기 버튼
    this.add.text(globalConfig.textBackX, globalConfig.textBackY, '< back', { font: '18px Arial', fill: '#ffffff' }).setInteractive().on('pointerdown', () => {
      let r = confirm("Gochujang coin will be deducted");
      if(r == true){
        totals.gochuang = totals.gochujang - numberD;
        this.scene.start('makeScene');
      }
      
    });

    //display on the top right corner
    this.add.text(this.cameras.main.width - 80, 10, `Multiplier: ${multiplyFactor}x`, { font: "bold 16px Arial"});

    // 점수 텍스트
    this.scoreText = this.add.text(globalConfig.scoreTextX, globalConfig.scoreTextY, `Score: ${this.score}\nBest: ${this.topScore}`, { font: "bold 16px Arial" });
  

    // 배경 색상
   // this.cameras.main.setBackgroundColor(globalConfig.backgroundColor);
     
    // 닌자 설정
    
    this.ninja = this.physics.add.sprite(globalConfig.ninjaStartX, globalConfig.ninjaStartY, "ninja");
    this.ninja.setGravityY(this.ninjaGravity);
    this.ninja.setCollideWorldBounds(true);
    
    // 기둥 그룹 설정
    this.poleGroup = this.physics.add.group({ immovable: true, allowGravity: false });

    // 이벤트 핸들러 설정
    this.input.on('pointerdown', this.prepareToJump, this);
    this.addPole(80);
    // 폴의 하니 여도 상관 없을까? 
  }



  update() {
    //this.multiplicationText.setText(`Multiplier: ${multiplyFactor}x`);

    if (this.physics.world) {
      this.physics.collide(this.ninja, this.poleGroup, this.checkLanding, null, this);
    }

    if (this.ninja.y > this.cameras.main.height) {
      this.die();
    }
  }
  

  prepareToJump() {
    if (this.ninja.body.touching.down && !this.ninjaJumping) {
      this.powerBar = this.add.sprite(this.ninja.x, this.ninja.y - 50, "powerbar");
      this.powerBar.setOrigin(0.5, 0.5);
      this.powerBar.displayWidth = 0;

      this.powerTween = this.tweens.add({
        targets: this.powerBar,
        displayWidth: 100,
        duration: 1000,
        ease: "Linear"
      });

      this.input.off("pointerdown", this.prepareToJump, this);
      this.input.on("pointerup", this.jump, this);
    }
  }



  jump() {
    // 속도 설정
    this.ninjaJumpPower = -this.powerBar.displayWidth * 3 - 100;
    this.powerBar.destroy();
    this.tweens.killAll();

    // 위로 점프와 앞쪽으로 점프하는 속도를 설정
    this.ninja.setVelocityY(this.ninjaJumpPower * 2);
    this.ninja.setVelocityX(globalConfig.poleGroupVelocityX);
    this.ninjaJumping = true;

    this.input.off('pointerup', this.jump, this);
    this.input.on('pointerdown', this.prepareToJump, this);
  }


/*
  addPole(poleX) {
    //if (poleX < this.cameras.main.width * 2) {
      if (poleX < this.cameras.main.width ) {
      this.placedPoles++;
      const pole = this.physics.add.sprite(poleX, Phaser.Math.Between(globalConfig.poleMinY, 
        globalConfig.poleMaxY), "pole").setOrigin(0.5, 0);
      pole.poleNumber = this.placedPoles;
      
      this.poleGroup.add(pole);

      const nextPolePosition = poleX + Phaser.Math.Between(this.minPoleGap, this.maxPoleGap);
      this.addPole(nextPolePosition);
    }
  }


*/
addPole(poleX) {
// 첫 번째 폴 생성

const pole1 = this.physics.add.sprite(poleX, Phaser.Math.Between(globalConfig.poleMinY, globalConfig.poleMaxY), "pole").setOrigin(0.5, 0);
pole1.poleNumber = this.placedPoles + 1;  // 폴 넘버 갱신
this.poleGroup.add(pole1);

// 두 번째 폴 위치 계산
const nextPolePosition = poleX + Phaser.Math.Between(this.minPoleGap, this.maxPoleGap);

// 두 번째 폴 생성
const pole2 = this.physics.add.sprite(nextPolePosition, Phaser.Math.Between(globalConfig.poleMinY, globalConfig.poleMaxY), "pole").setOrigin(0.5, 0);
pole2.poleNumber = this.placedPoles + 2;  // 폴 넘버 갱신
this.poleGroup.add(pole2);

// 생성된 폴 개수 증가
this.placedPoles += 2;

}

checkLanding(ninja, pole) {

    if (pole.y >= ninja.y + ninja.height / 2) {

      let border = ninja.x - pole.x;

      if (Math.abs(border) > 20) {

        ninja.body.velocity.x = border * 2;

        ninja.body.velocity.y = -200;

      } else {

        // 안정적으로 안착시키기 위해 속도 초기화

        ninja.body.velocity.x = 0; // 0
        ninja.body.velocity.y = 10;

        ninja.setGravityY(this.ninjaGravity);

      }


      const poleDiff = pole.poleNumber - ninja.lastPole;
      if (poleDiff > 0) {
        this.score += Math.pow(2, poleDiff);
        this.updateScore();
        ninja.lastPole = pole.poleNumber;
        // 여기서 게임의 점수가 계속 2, 3, 4, 5배로 늘어난다
        totals.gochuang *=multiplyFactor++; // update the total score
      }



      if (this.ninjaJumping) {
        this.ninjaJumping = false;
        this.input.on("pointerdown", this.prepareToJump, this);
      }
    } else {
      this.ninjaFallingDown = true;
      this.poleGroup.getChildren().forEach(function (child) {
        child.setVelocityX(0);
      });
    }
  }



  die() {

    //localStorage.setItem('topFlappyScore', Math.max(this.score, this.topScore));
    //this.scene.restart();
    totals.gochujang = 0;
    this.add.text(this.cameras.main.width / 2 - 50, this.cameras.main.height / 2, 'Game Over', { font: '48px Arial', fill: '#ff0000' });
    this.time.delayedCall(5000, function() {
      this.scene.start('makeScene');
    }, [], this);
  }



  
}