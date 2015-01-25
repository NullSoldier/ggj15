interface Worldish {
  bullets : Array<Bullet>
  getPlayerByID(id : number) : Player
  getPlayerByIDOrNull(id : number) : Player
}
