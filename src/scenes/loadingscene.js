import Phaser from "phaser";

const progressX = 30;
const progressY = 280;


function createButton(thisScene, x, y, text) {
    // 이미지 추가
    const buttonImage = thisScene.add.image(0, 0, 'buttonImage');

    // 텍스트 추가
    const buttonText = thisScene.add.text(0, 0, text, {
        font: '18px Poetsen One',
        fill: '#ffffff'
    }).setOrigin(0.5, 0.5);

    // 이미지와 텍스트를 포함하는 컨테이너 생성
    let button = thisScene.add.container(x, y, [buttonImage, buttonText]);

    // 이미지 중앙에 텍스트를 위치하도록 조정
    button.setSize(buttonImage.width, buttonImage.height);

    // 인터랙티브 활성화
    //button.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonImage.width, buttonImage.height), Phaser.Geom.Rectangle.Contains);


   return button;
}

export default class LoadingScene extends Phaser.Scene{
    constructor(){
        super("loadingScene");
    }
    preload() {
         
            
            this.load.image('logo', './assets/images/background-04.png');
            this.load.image('buttonImage', './assets/images/button_yellow.png');
            this.load.image('titleImage', './assets/images/emote3.png');
            //for (var i = 0; i < 5000; i++) {
              //  this.load.image('logo'+i, 'zenvalogo.png');
           // }
        }
    create() {

      
            var logo = this.add.image(0, 0, 'logo');
            logo.setOrigin(0,0);
            logo.setScale(0.3);
            var title = this.add.image(100, 200, 'titleImage');
            title.setOrigin(0,0);
            title.setScale(0.3);
    

         let btn= createButton(this, 190, 450,"START").setInteractive();  
         btn.on('pointerdown', () => {
            this.scene.start('game');
      
          });
        }
}
