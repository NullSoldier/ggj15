/// <reference path="Entity.ts" />

class Bullet extends Entity {

  owner_id: number // The id of the personal who fired the bullet
  dirX    : number = 0
  dirY    : number = 0
  speed   : number = 1

  update() {
    this.x += this.dirX
    this.y += this.dirY
  }
}
