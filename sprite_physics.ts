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
        // setDataNumber(sprite, 'mass', value);
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
        return getPhysics(sprite).Mass
        // return readDataNumber(sprite, 'mass');
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
        // setDataNumber(sprite, 'maxSpeed', value);
    }

    /**
     * Sets the min horizontal speed of a sprite
     */
    //% blockId=setMinSpeedX block="set $sprite=variables_get minSpeedX to $value"
    //% group="Physics"
    //% weight=10
    //% blockGap=8
    export function setMinSpeedX(sprite: Sprite, value: number) {
        // setDataNumber(sprite, 'minSpeedX', value);
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
        // setDataNumber(sprite, 'dragCoefficient', drag);
    }

    /**
     * Grab the physics object from the data map
     */
    export function getPhysics(sprite: Sprite) {
        if (!sprite) return;

        let spritePhysics = sprite.data[spritePhysicsClassKey]
        if (!spritePhysics) {
            spritePhysics = new physicsengineplus.PhysicsProperties()
        }
        return spritePhysics
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
        const data = sprite.data;
        data[name] = value;
    }
}
