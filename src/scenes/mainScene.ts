import { Map } from '../components/map'
import TilesGroup from '../components/tiles/tilesGroup'
import Player from '../components/player/player'
import CoinGroup from '../components/coins/coinGroup'
import BeeSprite from '../components/enemies/bee'
import EnemiesGroup from '../components/enemies/enemiesGroup'
import GoalSprite from '../components/goalSprite'
import Controls from '../components/controls/controls'
import Background from '../components/background'
import MiniMap from '../components/miniMap'
import MathQuestionScene from './mathQuestionScene'

var createLabel = function (scene, text) {
  return scene.rexUI.add.label({
      // width: 40,
      // height: 40,

      background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x5e92f3),

      text: scene.add.text(0, 0, text, {
          fontSize: '40px'
      }),

      space: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
      }
  });
}


var askFullscreen = true;

let questionVisible = false;

let musicRunning = false;
var sceneCreationID = 0;
export default class MainScene extends Phaser.Scene {
  player: Player
  tilesGroup: TilesGroup
  cursors: Phaser.Types.Input.Keyboard.CursorKeys
  background: Background
  music: Phaser.Sound.BaseSound
  enemiesGroup: EnemiesGroup
  controls: Controls
  goal: GoalSprite
  level: number
  miniMap: MiniMap
  rexUI: any
  constructor() {
    super({
      key: 'MainScene'
    })
  }

  init(props: { level?: number }) {
    const { level = 0 } = props
    this.level = Map.calcCurrentLevel(level)
  }

  async askQuestion(num: number): Promise<boolean> {
    this.scene.pause();
    this.physics.pause();
    var answerCorrect = await new Promise<boolean>(resolve => window.queueMicrotask(async() => {
      const key = "MathQuestionScene" + (sceneCreationID++);
      var questionScene: MathQuestionScene = this.scene.add(key, MathQuestionScene, true, { num }) as MathQuestionScene;
      var val = await questionScene.getQuestionAnswer();
      this.scene.remove(questionScene);
      resolve(val);
    }));

    this.physics.resume();
    this.scene.resume();
    this.input.keyboard.resetKeys();
    return answerCorrect;
  }
  create() {
    
    const map = new Map(this.level)

    this.cameras.main.setBackgroundColor('#ade6ff')
    this.cameras.main.fadeIn()

    this.cameras.main.setBounds(map.size.x, map.size.y, map.size.width, map.size.height)
    this.physics.world.setBounds(map.size.x, map.size.y, map.size.width, map.size.height)

    this.input.addPointer(1)
    this.cursors = this.input.keyboard.createCursorKeys()

    if(!musicRunning) {
      this.music = this.sound.add('music', {
        loop: true,
        volume: 0.15
      });
      this.music.play();
      musicRunning = true;
    }
    
    this.background = new Background(this)
    this.tilesGroup = new TilesGroup(this, map.info.filter((el: TilesConfig) => el.type === 'tile'))
    this.goal = new GoalSprite(this, map.info.filter((el: TilesConfig) => el.type === 'goal')[0])
    this.player = new Player(this, map.info.filter((el: TilesConfig) => el.type === 'player')[0], map.size, this.level)
    this.enemiesGroup = new EnemiesGroup(this, map.info)
    const coinGroup = new CoinGroup(this, map.info.filter((el: TilesConfig) => el.type === 'coin'))
    this.controls = new Controls(this)
    if(!askFullscreen) {
      askFullscreen = true;
      var dialog = this.rexUI.add.dialog({
        anchor: {
          centerX: 'center',
          centerY: 'center',
        },
  
        background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),
  
        title: this.rexUI.add.label({
            background: this.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x003c8f),
            text: this.add.text(0, 0, 'Question', {
                fontSize: '60px'
            }),
            space: {
                left: 15,
                right: 15,
                top: 10,
                bottom: 10
            }
        }),
  
        content: this.add.text(0, 0, 'Do you want to enter full screen mode?', {
            fontSize: '40px'
        }),
  
        actions: [
            createLabel(this, 'Yes'),
            createLabel(this, 'No')
        ],
  
        space: {
            title: 25,
            content: 25,
            action: 15,
  
            left: 20,
            right: 20,
            top: 20,
            bottom: 20,
        },
  
        align: {
            actions: 'right', // 'center'|'left'|'right'
        },
  
        expand: {
            content: false, // Content is a pure text object
        }
    })
        .layout()
        // .drawBounds(this.add.graphics(), 0xff0000)
        .popUp(1000).on('button.over', function (button, groupName, index) {
          button.getElement('background').setStrokeStyle(1, 0xffffff);
      })
      .on('button.out', function (button, groupName, index) {
          button.getElement('background').setStrokeStyle();
      }).on('button.click', (button, groupName, index) => {
        if(button.text == "Yes") {
          this.game.scale.fullscreenTarget = document.body;
          this.game.scale.startFullscreen();
          this.scale.updateBounds();
        }
        dialog.destroy();
      });
    }
    
    this.cameras.main.startFollow(this.player)

    this.physics.add.collider(this.tilesGroup, this.player);
    this.physics.add.collider(this.tilesGroup, this.enemiesGroup)
    // @ts-ignore
    this.physics.add.overlap(this.player, this.enemiesGroup, async(player: Player, enemy: BeeSprite) => {
      if (enemy.dead || player.isDead()) return

      
      var playerAttackedEnemy = (enemy.body.touching.up && player.body.touching.down);

      if(enemy.getData("questionAsked") != "true" && !questionVisible) {
        questionVisible = true;
        try { this.sound.play('player_attacks'); } catch(e) {}
        enemy.setData("questionAsked", "true");
        console.log("open question");
        const answerCorrect = await this.askQuestion(1);

        if (answerCorrect) {
          player.killEnemy()
          enemy.kill()
        } else {
          player.kill()
        }
        questionVisible = false;
      }
      
    });
    //@ts-ignore
    this.physics.add.overlap(this.player, coinGroup, (player, coin) => coin.collect())
    //@ts-ignore
    this.physics.add.overlap(this.player, this.goal, async(player: Player, goal: GoalSprite) => {
      if(player.isDead())
        return;
      if(!questionVisible) {
        questionVisible = true;
        const REQUIRED_QUESTIONS = 3;
        let i = 0;
        let successful = true;
        do {
          successful = await this.askQuestion(REQUIRED_QUESTIONS-i);
        } while((i++ < (REQUIRED_QUESTIONS-1)) && successful);
 
        if(successful) {
          player.halt()
          try { this.sound.play('level_completes'); } catch(e) {}
          goal.nextLevel(this, this.level)
        } else {
          player.kill()
        }
        questionVisible = false;
      }
      
    })

    this.miniMap = new MiniMap(
      this,
      10,
      10,
      Math.min(map.size.width / 8, (map.size.height / 8) * 2.5),
      map.size.height / 8,
      map
    )
    this.miniMap.setIgnore([
      this.background,
      this.controls.buttons.up,
      this.controls.buttons.left,
      this.controls.buttons.right,
    ])
    this.miniMap.update(this.player)
    // remove the loading screen
    let loadingScreen = document.getElementById('loading-screen')
    if (loadingScreen) {
      loadingScreen.classList.add('transparent')
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          // @ts-ignore
          loadingScreen.remove()
        }
      })
    }

    // the resize function
    const resize = () => {
      this.controls.adjustPositions()
      this.background.adjustPosition()
    }

    this.scale.on('resize', (gameSize: any) => {
      this.cameras.main.width = gameSize.width
      this.cameras.main.height = gameSize.height
      //this.cameras.resize(gameSize.width, gameSize.height)
      resize()
    })
    resize()
  }

  update() {
    this.background.parallax()
    this.controls.update()
    this.enemiesGroup.update()
    this.player.update(this.cursors, this.controls)
//    this.miniMap.update(this.player)
  }
}
