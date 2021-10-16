//% color="#275DAA"
//% groups="['Properties', 'Movement']"
namespace spritePhysics {
    /**
     * The key used to access the sprite physics class object from the sprite data
     */
    const spritePhysicsClassKey = 'spritePhysics'

    /**
     * Sets the mass of a sprite
     */
    //% blockId=setMass block="set $sprite=variables_get(mySprite) mass to $value"
    //% group="Properties"
    //% weight=10
    //% blockGap=8
    export function setMass(sprite: Sprite, value: number) {
        getPhysics(sprite).Mass = value
    }

    /**
     * Gets the mass of a sprite
     */
    //% blockId=spriteDataGetNumber block="$sprite=variables_get(mySprite) mass"
    //% group="Properties"
    //% weight=10
    //% blockGap=8
    export function getMass(sprite: Sprite): number {
        const mass = getPhysics(sprite).Mass
        return mass
    }

    /**
     * Sets the max horizontal speed of a sprite
     */
    //% blockId=setMaxSpeed block="set $sprite=variables_get(mySprite) maxSpeed to $speed"
    //% group="Properties"
    //% weight=10
    //% blockGap=8
    //% speed.min=10 speed.max=500
    export function setMaxSpeed(sprite: Sprite, speed: number) {
        getPhysics(sprite).MaxSpeed = speed
    }

    /**
     * Sets the min horizontal speed of a sprite
     */
    //% blockId=setMinSpeedX block="set $sprite=variables_get(mySprite) minSpeedX to $value"
    //% group="Properties"
    //% weight=10
    //% blockGap=8
    export function setMinSpeedX(sprite: Sprite, value: number) {
    }

    /**
     * Sets the drag coefficient of a sprite
     */
    //% blockId=setDragCoefficent block="set $sprite=variables_get(mySprite) dragCoefficient to $drag"
    //% group="Properties"
    //% weight=10
    //% blockGap=8
    export function setDragCoefficent(sprite: Sprite, drag: number) {
        getPhysics(sprite).DragCoefficent = drag
    }

    /**
     * Apply a force to the sprite
     */
    //% blockId=applyForce block="apply $sprite=variables_get(mySprite) force of $x, $y"
    //% group="Movement"
    //% weight=10
    //% blockGap=8
    //% x.min=-1000 x.max=1000
    //% y.min=-1000 y.max=1000
    export function applyForce(sprite: Sprite, x: number, y: number) {
        console.log(`[sprites] Applying force (${x},${y})`)
        getPhysics(sprite).applyForce(x, y)
    }

    /**
     * Apply a impulse to the sprite
     */
    //% blockId=applyImpulse block="apply $sprite=variables_get(mySprite) impulse of $x, $y"
    //% group="Movement"
    //% weight=10
    //% blockGap=8
    //% x.min=-1000 x.max=1000
    //% y.min=-1000 y.max=1000
    export function applyImpulse(sprite: Sprite, x: number, y: number) {
        getPhysics(sprite).applyImpulse(x, y)
    }

    /**
     * Grab the physics object from the data map
     */
    export function getPhysics(sprite: Sprite): physicsengineplus.PhysicsProperties {
        // if (!sprite) return;
        if (!isPhysicsPlusAvailible(sprite)) {
            sprite.data[spritePhysicsClassKey] = new physicsengineplus.PhysicsProperties()
        }
        return sprite.data[spritePhysicsClassKey]
    }

    /**
     * Has the new physics plus class been added to this sprite?
     */
    export function isPhysicsPlusAvailible(sprite: Sprite): Boolean {
        return !!sprite.data[spritePhysicsClassKey]
    }
}
