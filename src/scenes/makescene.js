import Phaser from "phaser";
import { totals } from './globals';

export default class MakeScene extends Phaser.Scene {
  constructor() {
    super("makeScene");
  }

  preload() {
    this.load.image('bg', './assets/images/makeBG.png');
    this.load.image('butImage', './assets/images/small_yellow_btn.png');
    this.load.image('coin', './assets/images/gochuCoin.png');
    this.load.image('gochujangTube', './assets/images/gochujangTube.png'); // 고추장 이미지
  }

  create() {
    this.add.image(0, 0, 'bg').setOrigin(0).setScale(0.47);

    this.add.text(80, 50, 'Gochujang Coin Maker', { font: '24px Poetsen One', fill: '#ffffff' });

    // 고추장 코인 개수 표시
    this.add.image(60, 200, 'coin').setScale(0.5);
    this.gochujangCoinText = this.add.text(100, 110, `${totals.gochujangCoin || 0}`, {
      font: '14px Orbitron',
      fill: '#ffffff'
    });

    // 고추장 튜브 이미지 및 고추장 개수
    const tubeImg = this.add.image(60, 120, 'gochujangTube').setScale(0.05);
    this.gochujangText = this.add.text(100, 185, `${totals.gochujang}`, {
      font: '14px Orbitron',
      fill: '#ffffff'
    });

    // Convert 버튼
    const makeButton = this.createButton(100, 280, "Convert");
    makeButton.setInteractive().on('pointerdown', () => this.convertToCoin());

    // 뒤로가기 버튼
    const backButton = this.add.text(10, 10, '< Back', {
      font: '18px Poetsen One',
      fill: '#ffffff'
    }).setInteractive();
    backButton.on('pointerdown', () => {
      this.scene.start('game');
    });
  }

  createButton(x, y, text) {
    const buttonImage = this.add.image(0, 0, 'butImage').setScale(1);
    const buttonText = this.add.text(0, 0, text, {
      font: '11px Poetsen One',
      fill: '#ffffff'
    }).setOrigin(0.5);
    const button = this.add.container(x, y, [buttonImage, buttonText]);
    button.setSize(buttonImage.width, buttonImage.height);
    return button;
  }

  convertToCoin() {
    const numConvert = Math.floor(totals.gochujang / 10);
    if (numConvert > 0) {
      totals.gochujang -= numConvert * 10;
      totals.gochujangCoin = (totals.gochujangCoin || 0) + numConvert;

      this.gochujangText.setText(`${totals.gochujang}`);
      this.gochujangCoinText.setText(`${totals.gochujangCoin}`);

      for (let i = 0; i < numConvert; i++) {
        const coin = this.add.image(150, 300, 'coin').setScale(0.3);
        this.tweens.add({
          targets: coin,
          y: 150,
          alpha: 0,
          duration: 300,
          delay: i * 100,
          onComplete: () => coin.destroy()
        });
      }
    } else {
      this.showPopup("Not enough Gochujang!");
    }
  }

  showPopup(message) {
    const popup = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, message, {
      font: '14px Poetsen One',
      fill: '#ffffff',
      backgroundColor: '#000000'
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => popup.destroy());
  }
}