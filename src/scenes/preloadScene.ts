export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'PreloadScene'
    })
  }

  preload() {
    const images = ['tile-left', 'tile-middle', 'tile-right', 'tile-single', 'controls', 'background', 'goal']
    images.forEach(img => {
      this.load.image(img, `assets/img/${img}.png`)
    })
    const sounds = [ 'player_jumps', 'player_attacks', 'player_answers_correctly', 'player_answers_incorrectly', 'player_dies', 'player_lands', 'level_completes', 'player_collects' ];
    sounds.forEach(sound => this.load.audio(sound, `assets/sounds/${sound}.wav`));
    this.load.audio('music', 'assets/sounds/music.mp3');
    this.load.spritesheet('player', 'assets/img/player.png', { frameHeight: 165, frameWidth: 120 })
    this.load.spritesheet('coin', 'assets/img/coin.png', { frameHeight: 42, frameWidth: 42 })
    this.load.spritesheet('bee', 'assets/img/bee.png', { frameHeight: 100, frameWidth: 128 })
    this.load.spritesheet('slime', 'assets/img/slime.png', { frameHeight: 68, frameWidth: 112 })
    this.load.setPath('assets/spine')
    // @ts-ignore
    this.load.spine('boy', 'boy.json', 'boy.atlas')
    
  }

  create() {
    this.scene.start('MainScene')
  }
}
