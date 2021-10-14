// let physicsEnginePlus = new physicsengineplus.ArcadePhysicsEnginePlus(500, 2, 4, 500)

function transferPhysicsEngine() {
    let physicsEnginePlus = new physicsengineplus.ArcadePhysicsEnginePlus(500, 2, 4, 500)
    game.setPhysicsEngine(physicsEnginePlus)
}

let sceneChangeHandler = (oldScene: scene.Scene) => {
    transferPhysicsEngine()
    // Don't zero out the velocity when there is no more input from the controller,
    // instead let gravity && drag handle slowing down moving objects
    controller.setRetainVelocityOnNoInput(true);
    controller.useAccelerationInstead(true);
}
console.log("[main] HELLO THERE")
transferPhysicsEngine()
controller.setRetainVelocityOnNoInput(true);
console.log("[main] Replaced the old physics engine with a new one")
game.addScenePushHandler(sceneChangeHandler)

