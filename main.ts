function transferPhysicsEngine() {
    let newPhysicsEngine = new ArcadePhysicsEnginePlus(500, 2, 4, 500)
    game.physicsEngine().transferSprites(newPhysicsEngine)
    game.setPhysicsEngine(newPhysicsEngine)
}

let sceneChangeHandler = (oldScene: scene.Scene) => {
    transferPhysicsEngine()
}

console.log("[HASUFI] HELLO THERE")

// Replace the old physics engine with the new one
transferPhysicsEngine()
console.log("[HASUFI] Replaced the old physics engine with a new one")

// Add the scene handler to replace the physics engine when the scene is re-created
game.addScenePushHandler(sceneChangeHandler)
