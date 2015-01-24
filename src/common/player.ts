enum PlayerState {
  None  = 0,
  Alive = 1,
  Dead  = 2
}

class Player {
  connection : Connection  // Server only

  id    : number
  name  : string
  speed : number
  sprite: Phaser.Sprite
  state : PlayerState
}
