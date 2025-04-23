import Phaser from "phaser";
import { formatCount } from './utils';  // 유틸리티 함수를 별도의 파일로 분리
import { totals } from './globals';

const tileSize = 35;
const fieldWidth = 8;
const fieldHeight = 8;
const tileTypes = 3;
const scoreboardY = 480;
const tileOriginX = -1;
const tileOriginY = -4;
const mouseOffsetX = 75;
const mouseOffsetY = 195;
const barWidth = 67; 
const barHeight = 16; 
const maxCount = 10;
const maxProgress = 500;

class ProgressBar extends Phaser.GameObjects.Container {
  constructor(scene, x, y, maxBeanCount) {
      super(scene, x, y);
      this.scene = scene;
      this.maxBeanCount = maxBeanCount;
      this.background = this.scene.add.graphics();
      this.fill = this.scene.add.graphics();
      this.background.fillStyle(0x222222, 1);
      this.background.fillRect(0, 0, barWidth, barHeight);
      this.add(this.background);
      this.add(this.fill);
      this.scene.add.existing(this);
  }

  updateProgress(beanCount) {
      this.fill.clear();
      this.fill.fillStyle(0xffcc00, 1);
      this.fill.fillRect(0, 0, (barWidth * beanCount) / this.maxBeanCount, barHeight);
  }
}

export default class Game extends Phaser.Scene{
  constructor(){
    super("game");
    this.tileArray = [];
    this.tileCounts = { bean: 0, pepper: 0, rice: 0 };
  }

  preload(){
    this.load.atlas('match3', './assets/atlas/match3.png', './assets/atlas/match3.json');
    this.load.spritesheet("tiles", "./assets/images/tile-set.png", { frameWidth: tileSize, frameHeight: tileSize });
    this.load.image("background", "./assets/images/gameBG.png");
    this.load.image("btnMake", "./assets/images/makeIcon.png");
    this.load.image("pot", "./assets/images/pot.png");
    this.load.image("coinScore", "./assets/images/coinCounter.png");
  }

  create(){
    this.add.image(0, 0, "background").setOrigin(0,0).setScale(0.32);

    this.emitterPepper = this.add.particles(0, 0, 'match3', { frame: [ 'Match3_Icon_10', 'Match3_Icon_11' ], lifespan: 3000, speed: {min:300, max:450}, scale:  {start:0.2, end: 0}, rotate: {start: 0, end: 60}, gravityY: 800, emitting: false });
    this.emitterBean = this.add.particles(0, 0, 'match3', { frame: [ 'Match3_Icon_28', 'Match3_Icon_27' ], lifespan: 3000, speed: {min:300, max:450}, scale:  {start:0.2, end: 0}, rotate: {start: 0, end: 60}, gravityY: 800, emitting: false });
    this.emitterRice = this.add.particles(0, 0, 'match3', { frame: [ 'Match3_Icon_18', 'Match3_Icon_17' ], lifespan: 3000, speed: {min:300, max:450}, scale:  {start:0.2, end: 0}, rotate: {start: 0, end: 60}, gravityY: 800, emitting: false });

    this.createGochujangGauge();
    this.createBeanGauge();
    this.createPepperGauge();
    this.createRiceGauge();

    for (let i = 0; i < fieldHeight; i++) {
      this.tileArray[i] = [];
      for (let j = 0; j < fieldWidth; j++) {
        const randomTile = Math.floor(Math.random() * tileTypes);
        const theTile = this.add.sprite(j * tileSize + tileSize / 2, i * tileSize + tileSize / 2, "tiles", randomTile);
        theTile.setOrigin(tileOriginX, tileOriginY);
        this.tileArray[i][j] = theTile;
      }
    }

    const potButton = this.add.image(340, 40, 'pot').setInteractive().setScale(0.09);
    potButton.on('pointerdown', () => { this.scene.start('makeScene'); });

    this.input.on('pointermove', this.handlePointerMove, this);
    this.input.on('pointerdown', this.pickTile, this);
  }

  handlePointerMove(pointer) {
    const startX = pointer.worldX - mouseOffsetX;
    const startY = pointer.worldY - mouseOffsetY;
    const selectedRow = Math.floor(startY / tileSize);
    const selectedCol = Math.floor(startX / tileSize);
    const tile = this.tileArray[selectedRow]?.[selectedCol];
    this.input.manager.canvas.style.cursor = tile ? 'pointer' : 'default';
  }

  pickTile(pointer){
    const startX = pointer.worldX - mouseOffsetX;
    const startY = pointer.worldY - mouseOffsetY;
    const selectedRow = Math.floor(startY / tileSize);
    const selectedCol = Math.floor(startX / tileSize);
    const tile = this.tileArray[selectedRow]?.[selectedCol];
    if (!tile) return;
    const tileType = tile.frame.name;
    const clearedCount = this.floodFill(selectedRow, selectedCol, tileType);
    switch(tileType){
      case 0: this.emitterBean.emitParticleAt(pointer.worldX, pointer.worldY, clearedCount); break;
      case 1: this.emitterPepper.emitParticleAt(pointer.worldX, pointer.worldY, clearedCount); break;
      case 2: this.emitterRice.emitParticleAt(pointer.worldX, pointer.worldY, clearedCount); break;
    }
    this.fallDown();
    this.fallFromTop();
    this.updateTileCount(tileType, clearedCount);
    this.updateGauges();
  }

  floodFill(row, col, val) {
    if (row >= 0 && row < fieldHeight && col >= 0 && col < fieldWidth) {
      if (this.tileArray[row][col] !== null && this.tileArray[row][col].frame.name === val) {
        this.tileArray[row][col].destroy();
        this.tileArray[row][col] = null;
        return 1 + this.floodFill(row + 1, col, val) + this.floodFill(row - 1, col, val) + this.floodFill(row, col + 1, val) + this.floodFill(row, col - 1, val);
      }
    }
    return 0;
  }

  fallDown() {
    for (let i = fieldHeight - 1; i >= 0; i--) {
      for (let j = 0; j < fieldWidth; j++) {
        if (this.tileArray[i][j] !== null) {
          const delta = this.holesBelow(i, j);
          if (delta > 0) {
            this.tweens.add({ targets: this.tileArray[i][j], y: (i + delta) * tileSize + tileSize / 2, duration: 800, ease: 'Cubic.Out' });
            this.tileArray[i + delta][j] = this.tileArray[i][j];
            this.tileArray[i][j] = null;
          }
        }
      }
    }
  }

  fallFromTop() {
    for (let i = 0; i < fieldWidth; i++) {
      const holes = this.holesBelow(-1, i);
      for (let j = 0; j < holes; j++) {
        const randomTile = Math.floor(Math.random() * tileTypes);
        const tile = this.add.sprite(i * tileSize + tileSize / 2, -(holes - j) * tileSize - tileSize / 2, "tiles", randomTile);
        tile.setOrigin(tileOriginX, tileOriginY);
        this.tileArray[j][i] = tile;
        this.tweens.add({ targets: tile, y: j * tileSize + tileSize / 2, duration: 800, ease: 'Cubic.Out' });
      }
    }
  }

  holesBelow(row, col) {
    let holes = 0;
    for (let i = row + 1; i < fieldHeight; i++) {
      if (this.tileArray[i][col] === null) holes++;
    }
    return holes;
  }

  updateTileCount(tileType, count) {
    if (tileType === 0) {
      totals.bean += count;
      this.beanText.setText(`Bean:${formatCount(totals.bean)}`);
    } else if (tileType === 1) {
      totals.pepper += count;
      this.pepperText.setText(`Pepper: ${formatCount(totals.pepper)}`);
    } else if (tileType === 2) {
      totals.rice += count;
      this.riceText.setText(`Rice: ${formatCount(totals.rice)}`);
    }
  }

  createRiceGauge() {
    this.riceText = this.add.text(50, scoreboardY, `${this.formatCount(totals.rice)}`, { font: '12px MyCustomFont', fill: '#ffffff' });
    this.riceProgress = new ProgressBar(this, 260, scoreboardY + 30, maxProgress);
  }

  createPepperGauge() {
    this.pepperText = this.add.text(165, scoreboardY, `${this.formatCount(totals.pepper)}`, { font: '12px MyCustomFont', fill: '#ffffff' });
    this.pepperProgress = new ProgressBar(this, 150, scoreboardY + 30, maxProgress);
  }

  createBeanGauge() {
    this.beanText = this.add.text(285, scoreboardY, `${this.formatCount(totals.bean)}`, { font: '12px MyCustomFont', fill: '#ffffff' });
    this.beanProgress = new ProgressBar(this, 30, scoreboardY + 30, maxProgress);
  }

  createGochujangGauge(){
    this.gochujangText = this.add.text(80, 90, `${totals.gochujang}`, { font: '12px Orbitron', fill: '#ffffff' });
  }

  updateGauges() {
    if(totals.bean >= maxCount && totals.pepper >= maxCount && totals.rice >= maxCount){
      totals.gochujang++;
      totals.bean -= 10;
      totals.pepper -= 10;
      totals.rice -= 10;
      this.gochujangText.setText(`${totals.gochujang}`);
    }
    this.updateResourceGauge('bean', this.beanProgress, this.beanText);
    this.updateResourceGauge('pepper', this.pepperProgress, this.pepperText);
    this.updateResourceGauge('rice', this.riceProgress, this.riceText);
  }

  updateResourceGauge(type, progressObj, textObj) {
    const progress = totals[type] % maxProgress;
    progressObj.updateProgress(progress);
    textObj.setText(`${this.formatCount(totals[type])}`);
  }

  formatCount(count) {
    return count >= 1000 ? `${Math.floor(count / 1000)}K` : count.toString();
  }
}
