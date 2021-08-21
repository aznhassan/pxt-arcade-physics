namespace sprites {
    /**
     * Sets the mass of a sprite
     */
    //% blockId=setMass block="set $sprite=variables_get mass to $value"
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
     * Sets the max horizontal speed of a sprite
     */
    //% blockId=setMaxSpeedX block="set $sprite=variables_get maxSpeedX to $value"
    //% group="Physics"
    //% weight=10
    //% blockGap=8
    export function setMaxSpeedX(sprite: Sprite, value: number) {
        setDataNumber(sprite, 'maxSpeedX', value);
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
