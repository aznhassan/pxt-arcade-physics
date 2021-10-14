namespace sprites {
    /**
     * The key used to access the sprite physics class object from the sprite data
     */
    const spritePhysicsClassKey = 'spritePhysics'
    
    /**
     * Sets the mass of a sprite
     */
    //% blockId=setMass block="set $sprite=variables_get mass to $value"
    //% group="Physics"
    //% weight=10
    //% blockGap=8
    export function setMass(sprite: Sprite, value: number) {
        getPhysics(sprite).Mass = value
    }

    /**
     * Gets the mass of a sprite
     */
    //% blockId=spriteDataGetNumber block="$sprite=variables_get mass"
    //% group="Physics"
    //% weight=10
    //% blockGap=8
    export function getMass(sprite: Sprite): number {
        const mass = getPhysics(sprite).Mass
        return mass
    }

    /**
     * Sets the max horizontal speed of a sprite
     */
    //% blockId=setMaxSpeed block="set $sprite=variables_get maxSpeed to $value"
    //% group="Physics"
    //% weight=10
    //% blockGap=8
    export function setMaxSpeed(sprite: Sprite, value: number) {
        getPhysics(sprite).MaxSpeed = value
    }

    /**
     * Sets the min horizontal speed of a sprite
     */
    //% blockId=setMinSpeedX block="set $sprite=variables_get minSpeedX to $value"
    //% group="Physics"
    //% weight=10
    //% blockGap=8
    export function setMinSpeedX(sprite: Sprite, value: number) {
    }

    /**
     * Sets the drag coefficient of a sprite
     */
    //% blockId=setDragCoefficent block="set $sprite=variables_get dragCoefficient to $drag"
    //% group="Physics"
    //% weight=10
    //% blockGap=8
    export function setDragCoefficent(sprite: Sprite, drag: number) {
        getPhysics(sprite).DragCoefficent = drag
    }

    /**
     * Grab the physics object from the data map
     */
    export function getPhysics(sprite: Sprite) {
        if (!sprite) return;

        if (!sprite.data[spritePhysicsClassKey]) {
            sprite.data[spritePhysicsClassKey] = new physicsengineplus.PhysicsProperties()
        }
        return sprite.data[spritePhysicsClassKey]
    }
}
