import Phaser from "phaser";
import { formatCount } from './utils';  // 유틸리티 함수를 별도의 파일로 분리

const tileSize = 35;                 // tile size, in pixels
const fieldSize = 9;                 // number of tiles per row/column
const tileTypes = 3;                 // different kind of tiles allowed
const gameOffset = 45;
const buttonY = 400;


export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
    this.tileArray = [];           // array with all game tiles
    this.tileCounts = { bean: 0, pepper: 0, rice: 0 }; // tile 삭제 카운트를 초기화합니다.
  }

  preload() {
    this.load.spritesheet("tiles", "./assets/images/tile3.png", 
    { frameWidth: tileSize, frameHeight: tileSize });
    this.load.image("background", "./assets/images/gbg1.png");  // 배경 이미지 로드
    //this.scale.scaleMode = Phaser.Scale.SHOW_ALL;
    //this.scale.setScreenSize(true);
  }


  create() {
        // 리소스가 제대로 로드되었는지 확인

        if (!this.textures.exists('tiles')) {
            console.error('Failed to load texture: "tiles"');
            return;
          }
  // 배경 이미지 추가 및 크기 조정

    // 배경 이미지를 원래 크기로 추가하고 화면 중앙에 배치

    this.add.image(0, 0, "background");



    // 각 타일 타입의 삭제 카운트를 표시할 텍스트를 추가합니다.
    this.beanText = this.add.text(10, 10, `Bean: ${formatCount(this.tileCounts.bean)}`, { font: '16px Arial', fill: '#ffffff' });
    this.pepperText = this.add.text(100, 10, `Pepper: ${formatCount(this.tileCounts.pepper)}`, { font: '16px Arial', fill: '#ffffff' });
    this.riceText = this.add.text(220, 10, `Rice: ${formatCount(this.tileCounts.rice)}`, { font: '16px Arial', fill: '#ffffff' });

    for (let i = 0; i < fieldSize; i++) {
      this.tileArray[i] = [];
      for (let j = 0; j < fieldSize; j++) {
        const randomTile = Math.floor(Math.random() * tileTypes);
        const theTile = this.add.sprite(j * tileSize + tileSize / 2, i * tileSize + tileSize / 2+gameOffset, "tiles", randomTile);
        //theTile.frame = randomTile;
        theTile.setOrigin(0.5, 0.5);
        this.tileArray[i][j] = theTile;
      }

    }
    


    // 하단에 "Shop", "Make" 버튼 추가
    const shopButton = this.add.text(100, buttonY, 'Shop', { font: '20px Arial', fill: '#ffffff' }).setInteractive();
    const makeButton = this.add.text(200, buttonY, 'Make', { font: '20px Arial', fill: '#ffffff' }).setInteractive();


    shopButton.on('pointerdown', () => {
      // Shop 버튼 클릭 시 (현재 아무런 동작을 하지 않음)
      console.log('Shop clicked');
    });



    makeButton.on('pointerdown', () => {
      // Make 버튼 클릭 시 makeScene으로 전환
     this.scene.start('makeScene', { tileCounts: this.tileCounts });
    });


  
    this.input.on('pointerdown', this.pickTile, this);
  }



  pickTile(pointer) {
    const startX = pointer.worldX;
    const startY = pointer.worldY - gameOffset;
    const selectedRow = Math.floor(startY / tileSize);
    const selectedCol = Math.floor(startX / tileSize);
    const tileType = this.tileArray[selectedRow][selectedCol].frame.name;
        // 제거된 타일 개수를 카운트하여 tileType과 함께 updateTileCount에 전달합니다.
    const clearedCount = this.floodFill(selectedRow, selectedCol, tileType);
   // this.floodFill(selectedRow, selectedCol, this.tileArray[selectedRow][selectedCol].frame.name);
    this.fallDown();
    this.fallFromTop();
    this.updateTileCount(tileType, clearedCount);

  }



  floodFill(row, col, val) {
    if (row >= 0 && row < fieldSize && col >= 0 && col < fieldSize) {
      if (this.tileArray[row][col] !== null && this.tileArray[row][col].frame.name === val) {
        this.tileArray[row][col].destroy();
        this.tileArray[row][col] = null;
        // 재귀 호출을 통해 제거된 타일 개수를 축적합니다.
        return 1 + this.floodFill(row + 1, col, val)
        + this.floodFill(row - 1, col, val)
        + this.floodFill(row, col + 1, val)
        + this.floodFill(row, col - 1, val);
      }
    }
    return 0; // 기본적으로 타일이 제거되지 않으면 0을 반환합니다.
  }

  updateTileCount(tileType, count) {
    if (tileType === 0) {
      this.tileCounts.bean += count;
      this.beanText.setText(`Bean:${formatCount(this.tileCounts.bean)}`);
    } else if (tileType === 1) {
      this.tileCounts.pepper += count;
      this.pepperText.setText(`Pepper: ${formatCount(this.tileCounts.pepper)}`);
    } else if (tileType === 2) {
      this.tileCounts.rice += count;
      this.riceText.setText(`Rice: ${formatCount(this.tileCounts.rice)}`);
    }
  }



  fallDown() {
    for (let i = fieldSize - 1; i >= 0; i--) {
      for (let j = 0; j < fieldSize; j++) {
        if (this.tileArray[i][j] !== null) {
          const delta = this.holesBelow(i, j);
          if (delta > 0) {
            this.tweens.add({
                targets: this.tileArray[i][j],
                y: (i + delta) * tileSize + tileSize / 2+gameOffset,
                duration: 800,
                ease: 'Cubic.Out'
              });

            this.tileArray[i + delta][j] = this.tileArray[i][j];
            this.tileArray[i][j] = null;
          }
        }
      }
    }
  }


  fallFromTop() {
    for (let i = 0; i < fieldSize; i++) {
      const holes = this.holesBelow(-1, i);
      for (let j = 0; j < holes; j++) {
        const randomTile = Math.floor(Math.random() * tileTypes);
        const tileXPos = i * tileSize + tileSize / 2;
        const tileYPos = -(holes - j) * tileSize - tileSize / 2+gameOffset;
        const theTile = this.add.sprite(tileXPos, tileYPos, "tiles", randomTile);
        theTile.setOrigin(0.5, 0.5);
        this.tileArray[j][i] = theTile;
        this.tweens.add({
          targets: this.tileArray[j][i],
          y: j * tileSize + tileSize / 2+gameOffset,
          duration: 800,
          ease: 'Cubic.Out'
        });
      }
    }
  }



  holesBelow(row, col) {
    let holes = 0;
    for (let i = row + 1; i < fieldSize; i++) {
      if (this.tileArray[i][col] === null) {
        holes++;
      }
    }
    return holes;
  }
}