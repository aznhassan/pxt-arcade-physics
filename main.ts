console.log("HELLO THERE")
let newPhysicsEngine = new ArcadePhysicsEnginePlus(500, 2, 4, 500);
let oldPhysicsEngine = game.physicsEngine()
oldPhysicsEngine.transferSprites(newPhysicsEngine);
oldPhysicsEngine = newPhysicsEngine
