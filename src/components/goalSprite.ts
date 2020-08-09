import Levels from './levels';
var createLabel = function (scene, text) {
  return scene.rexUI.add.label({
      background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x6a4f4b),

      text: scene.add.text(0, 0, text, {
          fontSize: '24px'
      }),

      space: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
      }
  });
}


export default class GoalSprite extends Phaser.Physics.Arcade.Sprite {
  private _loadNextLevel: boolean = false
  constructor(scene: Phaser.Scene, tilesConfig: TilesConfig) {
    super(scene, tilesConfig.x, tilesConfig.y + 14, 'goal')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setImmovable(true)
    // @ts-ignore
    this.body.setAllowGravity(false)
    this.setOrigin(0, 0.5)
  }

  get loadNextLevel() {
    return this._loadNextLevel
  }

  nextLevel(scene: Phaser.Scene&{ rexUI?: any; }, level: number) {
    if (this._loadNextLevel) return
    this._loadNextLevel = true

    if(level < (Levels.length-1)) {
      scene.cameras.main.fadeOut()
      scene.time.addEvent({
        delay: 2000,
        callback: () => {
            scene.scene.restart({ level: level += 1 })
        }
      })
    } else {
      console.log("INFO");
      (document.querySelector("#you-win") as HTMLElement).style.display = "";
    }
    
  }
}
