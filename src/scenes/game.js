import Phaser from "phaser";
import { formatCount } from './utils';  // 유틸리티 함수를 별도의 파일로 분리
import { totals } from './globals';

const tileSize = 35;                 // tile size, in pixels
const fieldSize = 9;                 // number of tiles per row/column
const fieldWidth = 8;                 // 필드의 가로 타일 수
const fieldHeight = 8;               // 필드의 세로 타일 수
const tileTypes = 3;                 // different kind of tiles allowed
const buttonY = 400;
const scoreboardY=480;
const tileOriginX=-1;
const tileOriginY=-4;
const mouseOffsetX=15+15+15;
const mouseOffsetY=70+15+15+15+15+15;
const barWidth = 67; 
const barHeight = 16; 
const maxCount = 100;
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
    this.tileArray = [];           // array with all game tiles
    this.tileCounts = { bean: 0, pepper: 0, rice: 0 }; // tile 삭제 카운트를 초기화합니다.
   // this.emitter = null;
  }

 

  preload(){
    this.load.atlas('match3', './assets/atlas/match3.png', './assets/atlas/match3.json');
    this.load.atlas('edtest', './assets/atlas/spritesheet.png', './assets/atlas/spritesheet.json');
    this.load.spritesheet("tiles", "./assets/images/tile-set.png", 
    { frameWidth: tileSize, frameHeight: tileSize });
    this.load.image("background", "./assets/images/gameBG.png");  // background image for main game
    this.load.image("btnMake", "./assets/images/makeIcon.png");  
    this.load.image("btnShop", "./assets/images/shopIcon.png"); 
    //this.load.image("board", "./assets/images/gameBoard.png"); 
    this.load.image("coinScore", "./assets/images/coinCounter.png"); 
    this.load.image("pot", "./assets/images/pot.png"); 
    //this.load.image("gochujangcoin", "./assets/images/gochuCoin.png"); 
   // this.load.atlas('jellies', '../public/assets/images/gochuCoin.png');
    
  }



  create(){
    var bubbleBack = this.add.image(0, 0, "background").setOrigin(0,0);
    bubbleBack.setScale(0.32);

     // 각 타일 타입의 삭제 카운트를 표시할 텍스트를 추가합니다.
    // this.beanText = this.add.text(30, scoreboardY, `Bean: ${formatCount(this.tileCounts.bean)}`, { font: '16px Arial', fill: '#ffffff' });
    // this.pepperText = this.add.text(140, scoreboardY, `Pepper: ${formatCount(this.tileCounts.pepper)}`, { font: '16px Arial', fill: '#ffffff' });
     //this.riceText = this.add.text(250, scoreboardY, `Rice: ${formatCount(this.tileCounts.rice)}`, { font: '16px Arial', fill: '#ffffff' });
      // Assuming this method will be part of your Phaser scene setup
      this.emitterPepper = this.add.particles(0, 0, 'match3', {
        frame: [ 'Match3_Icon_10', 'Match3_Icon_11' ],
        lifespan: 3000,
        speed: {min:300, max:450},
        scale:  {start:0.2, end: 0},
        rotate: {start: 0, end: 60},
        gravityY: 800,
        emitting: false

     });

     this.emitterBean = this.add.particles(0, 0, 'match3', {
      frame: [ 'Match3_Icon_28', 'Match3_Icon_27' ],
      lifespan: 3000,
      speed: {min:300, max:450},
      scale:  {start:0.2, end: 0},
      rotate: {start: 0, end: 60},
      gravityY: 800,
      emitting: false

   });

   this.emitterRice = this.add.particles(0, 0, 'match3', {
    frame: [ 'Match3_Icon_18', 'Match3_Icon_17' ],
    lifespan: 3000,
    speed: {min:300, max:450},
    scale:  {start:0.2, end: 0},
    rotate: {start: 0, end: 60},
    gravityY: 800,
    emitting: false

 });
  
     this.createGochujangGauge();
     this.createBeanGauge();
     this.createPepperGauge();
     this.createRiceGauge();
     
// 타일 디스플레이
    for (let i = 0; i < fieldHeight; i++) {
      this.tileArray[i] = [];
      for (let j = 0; j < fieldWidth; j++) {
        const randomTile = Math.floor(Math.random() * tileTypes);
        const theTile = this.add.sprite(j * tileSize + tileSize / 2, i * tileSize + tileSize / 2, "tiles", randomTile);
        //theTile.frame = randomTile;
        theTile.setOrigin(tileOriginX, tileOriginY);
        this.tileArray[i][j] = theTile;
      }

    }


    var makeButton = this.add.image(340, 40, 'btnMake').setInteractive();
    makeButton.setScale(0.1);
    // 하단에 "Shop", "Make" 버튼 추가
    //const shopButton = this.add.text(100, buttonY, 'Shop', { font: '20px Arial', fill: '#ffffff' }).setInteractive();
    //const makeButton = this.add.text(200, buttonY, 'Make', { font: '20px Arial', fill: '#ffffff' }).setInteractive();


    // 마우스 오버 시 커서 모양을 변경




    makeButton.on('pointerover', () => {
      this.input.manager.canvas.style.cursor = 'pointer';
    });

    makeButton.on('pointerout', () => {
      this.input.manager.canvas.style.cursor = 'default';
    });






    makeButton.on('pointerdown', () => {
      console.log('mouse click');
      // Make 버튼 클릭 시 고추장을 make 한다.
      
     // this.emitter.emitParticleAt(pointer.worldX, pointer.worldY, 4);
    
    });


  // 타일 영역에 마우스 오버 시 커서 모양을 변경
  this.input.on('pointermove', this.handlePointerMove, this);
  // 타일 영역 클릭 시 타일을 픽
    this.input.on('pointerdown', this.pickTile, this);

  }


  handlePointerMove(pointer) {

    const startX = pointer.worldX-mouseOffsetX; // 여기에 문제가 있음... oringin과 뭔가 안 맞는듯.
    const startY = pointer.worldY-mouseOffsetY;

    const selectedRow = Math.floor(startY / tileSize);
    const selectedCol = Math.floor(startX / tileSize);
    console.log("MOUSE XY : "+ pointer.worldX + " , "+pointer.worldY);
    console.log("calculated ("+selectedCol+", "+ selectedRow+")");
    if (selectedRow >= 0 && selectedRow < fieldHeight && selectedCol >= 0 && selectedCol < fieldWidth) {
      const tile = this.tileArray[selectedRow][selectedCol];

      if (tile) {
        // 타일 위에 있을 때 커서 모양을 변경
        this.input.manager.canvas.style.cursor = 'pointer';
      } else {
        this.input.manager.canvas.style.cursor = 'default';
      }
    } else {
      this.input.manager.canvas.style.cursor = 'default';
    }
  }



  pickTile(pointer){

    const startX = pointer.worldX-mouseOffsetX; // world의 origin과 같이 offset을 주어야 맞아 진다...
    const startY = pointer.worldY-mouseOffsetY;

    const selectedRow = Math.floor(startY / tileSize);
    const selectedCol = Math.floor(startX / tileSize);

    console.log("calculated ("+selectedCol+", "+ selectedRow+")");
    // 필드의 범위 내에 있는지 확인
    if (selectedRow >= 0 && selectedRow < fieldHeight && selectedCol >= 0 && selectedCol < fieldWidth) {
      const tile = this.tileArray[selectedRow][selectedCol];
      
      // 타일이 존재하면 처리

      if (tile) {
        const tileType = tile.frame.name;
        const clearedCount = this.floodFill(selectedRow, selectedCol, tileType);

        switch(tileType){

          case 0: // bean
            this.emitterBean.emitParticleAt(pointer.worldX, pointer.worldY, clearedCount);
          break;

          case 1: // pepper
          this.emitterPepper.emitParticleAt(pointer.worldX, pointer.worldY, clearedCount);
          break;
          
          case 2: // rice
          this.emitterRice.emitParticleAt(pointer.worldX, pointer.worldY, clearedCount);
          break;
        }

       
        this.fallDown();
        this.fallFromTop();
        this.updateTileCount(tileType, clearedCount);
        this.updateGauges();  // Bean gauge 업데이트
      } else {
        console.log('Tile does not exist at the clicked location.');
      }
    } else {
      console.log('Clicked outside the game field.');
    }

  }


floodFill(row, col, val) {
  if (row >= 0 && row < fieldHeight && col >= 0 && col < fieldWidth) {
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



fallDown() {
  for (let i = fieldHeight - 1; i >= 0; i--) {
    for (let j = 0; j < fieldWidth; j++) {
      if (this.tileArray[i][j] !== null) {
        const delta = this.holesBelow(i, j);
        if (delta > 0) {
          this.tweens.add({
              targets: this.tileArray[i][j],
              y: (i + delta) * tileSize + tileSize / 2,
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
  for (let i = 0; i < fieldWidth; i++) {
    const holes = this.holesBelow(-1, i);
    for (let j = 0; j < holes; j++) {
      const randomTile = Math.floor(Math.random() * tileTypes);
      const tileXPos = i * tileSize + tileSize / 2;
      const tileYPos = -(holes - j) * tileSize - tileSize / 2;
      const theTile = this.add.sprite(tileXPos, tileYPos, "tiles", randomTile);
      theTile.setOrigin(tileOriginX, tileOriginY);
      
      this.tileArray[j][i] = theTile;
      this.tweens.add({
        targets: this.tileArray[j][i],
        y: j * tileSize + tileSize / 2,
        duration: 800,
        ease: 'Cubic.Out'
      });
    }
  }
}



holesBelow(row, col) {
  let holes = 0;
  for (let i = row + 1; i < fieldHeight; i++) {
    if (this.tileArray[i][col] === null) {
      holes++;
    }
  }
  return holes;
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
  console.log('all over 100');
  totals.gochujang += 1;
  totals.bean -=100;
  totals.pepper -=100;
  totals.rice -=100;
  this.gochujangText.setText(`${totals.gochujang}`);
 
}

  this.updateResourceGauge('bean', this.beanProgress, this.beanText);
  this.updateResourceGauge('pepper', this.pepperProgress, this.pepperText);
  this.updateResourceGauge('rice', this.riceProgress, this.riceText);
  console.log('update B', totals.bean);
}


updateResourceGauge(type, progressObj, textObj) {
  const progress = totals[type] % maxProgress;
  progressObj.updateProgress(progress);
  textObj.setText(`${this.formatCount(totals[type])}`);

}

formatCount(count) {
if (count >= 1000) {
    return `${Math.floor(count / 1000)}K`;
}
return count.toString();
}
}