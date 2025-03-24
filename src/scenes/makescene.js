import Phaser from "phaser";
import { formatCount } from './utils';  // 유틸리티 함수를 별도의 파일로 분리
import { totals } from './globals';

const makeNumber = 10;
const jX = 50; // jBoard x
const jY = 80; // Jboard Y

export default class MakeScene extends Phaser.Scene {
  constructor() {
    super("makeScene");
          // Update the texts
          this.beanText = null;
          this.pepperText = null;
          this.riceText = null;
          this.gochujangText = null;
  }
  preload() {

    this.load.image('bg', './assets/images/makeBG.png');
    this.load.image('butImage', './assets/images/small_yellow_btn.png');
    this.load.image('coin', './assets/images/gochuCoin.png');
    this.load.image('jboard', './assets/images/jboard.png');
    this.load.image('iconBean', './assets/images/beanIcon.png');
    this.load.image('iconPepper', './assets/images/gochuIcon.png');
    this.load.image('iconRice', './assets/images/riceIcon.png');
    

  }



  create() {
    var bgImg = this.add.image(0, 0, 'bg');
    bgImg.setOrigin(0,0);
    bgImg.setScale(0.47);
    var jBoard = this.add.image(jX, jY, 'jboard').setOrigin(0,0);
    jBoard.setScale(0.5);
    this.add.text(80, 50, 'Gochujang maker', { font: '24px Poetsen One', fill: '#ffffff' });

    this.add.text(120, 90, 'Ingridents stat', { font: '15px Poetsen One', fill: '#ffffff' });
    this.add.image(jX+30, jY+32, 'iconRice').setOrigin(0,0).setScale(0.7);
    this.add.image(jX+30, jY+57, 'iconPepper').setOrigin(0,0).setScale(0.7);
    this.add.image(jX+30, jY+82, 'iconBean').setOrigin(0,0).setScale(0.7);
   // bgmake.displayWidth = this.sys.canvas.width;  // 캔버스 너비에 맞춤
    //bgmake.displayHeight = this.sys.canvas.height;  // 캔버스 높이에 맞춤
   
    this.riceText = this.add.text(jX+60, jY+35, `${totals.rice}`, { font: '11px Orbitron', fill: '#000000' });
    this.pepperext = this.add.text(jX+60, jY+59, `${totals.pepper}`, { font: '11px Orbitron', fill: '#000000' });
    this.beanText = this.add.text(jX+60, jY+84, `${totals.bean}`, { font: '11px Orbitron', fill: '#000000' });
    
    
    // Gochujang Coin status
    this.add.image(80, 350, 'Total Gochujang');
    this.gochujangText = this.add.text(130, 320,  `${totals.gochujang}`, { font: '15px Poetsen One', fill: '#ffffff' })



    let backButton = this.add.text(10, 10, '< back', { font: '18px Poetsen One', fill: '#ffffff' }).setInteractive();
    backButton.on('pointerdown', () => {
      this.scene.start('game');

    });
 


    // Make it 버튼 추가
    var makeButton = this.createButton(100, 250, "Make it!");
    makeButton.setInteractive().on('pointerdown', () => this.handleMakeGochujang());

  
    // Claim 버튼 추가
    var claimButton = this.createButton(100, 450, "Claim").setInteractive();  
    //let claimButton = this.add.text(220, 350, 'Claim', { font: '20px Poetsen One', fill: '#ffffff' }).setInteractive();
    claimButton.on('pointerdown', () => {
      // claimButton 클릭 시 이벤트 로직 추가 필요
      console.log('Claim clicked');
    });



    // x2 버튼 추가
    var x2Button = this.createButton(240, 450, "X2").setInteractive();  
    //let x2Button = this.add.text(120, 300, 'x2', { font: '20px Poetsen One', fill: '#ffffff' }).setInteractive();
    x2Button.on('pointerdown', () => {
      // x2 버튼 클릭 시 X2GameScene으로 전환
      this.scene.start('x2GameScene');
    });

  } // end of create



  showPopup(message) {
    let popup = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, message, { font: '9px Poetsen One', fill: '#ffffff' }).setOrigin(0.5);
    setTimeout(() => popup.destroy(), 2000);  // popup disappears after 2 seconds
  }
  
  handleMakeGochujang(){
    // check if each ingredient count is sufficient
    if(totals.bean >= makeNumber && totals.pepper >= makeNumber && totals.rice >= makeNumber){
      // now deduct makeNumber from each ingredient
      totals.bean -= makeNumber;
      totals.pepper -= makeNumber;
      totals.rice -= makeNumber;
      
      // let's mix and make gochujang
      totals.gochujang += 1;
            // Update the texts
            this.beanText.setText(`${totals.bean}`);
            this.pepperext.setText(`${totals.pepper}`);
            this.riceText.setText(`${totals.rice}`);
            this.gochujangText.setText(`${totals.gochujang}`);
  
    } else {
      this.showPopup("You do not have enough ingredients to make 1 gochuang");
    }
  }

  createButton(x, y, text) {
    // 이미지 추가
    const buttonImage = this.add.image(0, 0, 'butImage');
  
    // 텍스트 추가
    const buttonText = this.add.text(0, 0, text, {
        font: '11px Poetsen One',
        fill: '#ffffff'
    }).setOrigin(0.5, 0.5);
  
    // 이미지와 텍스트를 포함하는 컨테이너 생성
    let button = this.add.container(x, y, [buttonImage, buttonText]);
  
    // 이미지 중앙에 텍스트를 위치하도록 조정
    button.setSize(buttonImage.width, buttonImage.height);
  
    // 인터랙티브 활성화
    //button.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonImage.width, buttonImage.height), Phaser.Geom.Rectangle.Contains);
  
  
   return button;
  }
  


}

