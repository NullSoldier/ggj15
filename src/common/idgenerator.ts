function createIDGenerator() {
  var nextID = 1
  return () => { return nextID++; }
}
