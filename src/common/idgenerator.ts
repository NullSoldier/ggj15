function createIDGenerator() {
  var nextID = 1
  return () => {
    console.log('Generated ID', nextID)
    return nextID++;
  }
}
