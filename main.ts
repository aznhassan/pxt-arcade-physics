namespace sprites {
    /**
     * Sets the mass of a sprite
     */
    //% blockId=setMass block="set $sprite=variables_get mass to number $value"
    //% group="Physics"
    //% weight=10
    //% blockGap=8
    export function setMass(sprite: Sprite, value: number) {
        setDataNumber(sprite, 'mass', value);
    }

    /**
     * Gets the mass of a sprite
     */
    //% blockId=spriteDataGetNumber block="$sprite=variables_get mass"
    //% group="Physics"
    //% weight=10
    //% blockGap=8
    export function getMass(sprite: Sprite): number {
        return readDataNumber(sprite, 'mass');
    }

    /**
     * Gets a number in the data of a sprite
     */
    function readDataNumber(sprite: Sprite, name: string): number {
        if (!sprite || !name) return 0;
        const d = sprite.data;
        return d[name] as number;
    }

    /**
     * Sets a number in the data of a sprite
     */
    function setDataNumber(sprite: Sprite, name: string, value: number) {
        if (!sprite || !name) return;
        const d = sprite.data;
        d['mass'] = value;
    }
}

function transferPhysicsEngine() {
    let newPhysicsEngine = new ArcadePhysicsEnginePlus(500, 2, 4, 500)
    game.setPhysicsEngine(newPhysicsEngine)
}

let sceneChangeHandler = (oldScene: scene.Scene) => {
    transferPhysicsEngine()
    // Don't zero out the velocity when there is no more input from the controller,
    // instead let gravity && drag handle slowing down moving objects
    controller.setRetainVelocityOnNoInput(true);
    controller.useAccelerationInstead(true);
}

console.log("[HASUFI] HELLO THERE")

transferPhysicsEngine()
controller.setRetainVelocityOnNoInput(true);

console.log("[HASUFI] Replaced the old physics engine with a new one")

// Add the scene handler to replace the physics engine when the scene is re-created
game.addScenePushHandler(sceneChangeHandler)
