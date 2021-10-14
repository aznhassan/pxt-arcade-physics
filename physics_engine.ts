namespace physicsengineplus {
    let _debug: boolean = true
    function debug(message: string | object) {
        if (_debug) {
            console.log("[physics] " + message)
        }
    }
/**
 * A 2d Fx8 vector
 */
class Vec2dFx8 {
    private readonly _x: Fx8
    private readonly _y: Fx8

    constructor(x: number, y: number) {
        this._x = Fx8(x)
        this._y = Fx8(y)
    }

    get X(): number {
        return Fx.toInt(this._x)
    }

    get Y(): number {
        return Fx.toInt(this._y)
    }

    plus(vector: Vec2dFx8 ): Vec2dFx8 {
        return new Vec2dFx8(this.X + vector.X, this.Y + vector.Y)
    }
}

export class PhysicsProperties {
    private _mass: Fx8
    private _force: Vec2dFx8
    private _impulse: Vec2dFx8
    private _velocity: Vec2dFx8
    private _maxSpeed: Fx8
    private _useGoalSpeed: Boolean = false
    private _coefficentOfRestitution: Fx8
    private _dragCoefficent: Fx8

    constructor() {
        this._mass = Fx8(1)
        this._force = new Vec2dFx8(0, 0)
        this._impulse = new Vec2dFx8(0, 0)
        this._velocity = new Vec2dFx8(0, 0)
        this._maxSpeed = Fx8(1)
        this._coefficentOfRestitution = Fx8(0)
        this._dragCoefficent = Fx8(1.05)
    }

    get Mass(): number {
        return Fx.toInt(this._mass)
    }

    set Mass(mass: number) {
        // debug(`Setting mass speed to: ${mass}`)
        this._mass = Fx8(mass)
    }

    get CoefficentOfRestitution(): number {
        return Fx.toInt(this._coefficentOfRestitution)
    }

    set CoefficentOfRestitution(coefficentOfRestitution: number) {
        this._coefficentOfRestitution = Fx8(coefficentOfRestitution)
    }

    get MaxSpeed(): number {
        return Fx.toInt(this._maxSpeed)
    }

    set MaxSpeed(goalSpeed: number) {
        // debug(`Setting max speed to: ${goalSpeed}`)
        this._useGoalSpeed = true
        this._maxSpeed = Fx8(goalSpeed)
    }

    get DragCoefficent(): number {
        return Fx.toInt(this._dragCoefficent)
    }

    set DragCoefficent(dragCoefficent: number) {
        // debug(`Setting drag coefficent to: ${dragCoefficent}`)
        this._dragCoefficent = Fx8(dragCoefficent)
    }

    // The force will be applied on each tick, so add this force instead of replacing it
    applyForce(x: number, y: number) {
        this._force = new Vec2dFx8(x, y).plus(this._force)
    }

    applyImpulse(x: number, y: number) {
        this._impulse = new Vec2dFx8(x, y).plus(this._impulse)
    }

    toString(): String {
        return `Mass: ${this.Mass}, DragCoefficent: ${this.DragCoefficent}, ` +
                `MaxSpeed: ${this.MaxSpeed}`
    }
}

/**
 * An upgraded Physics Engine that includes drag
 */
export class ArcadePhysicsEnginePlus extends ArcadePhysicsEngine {
    protected _maxDrag: Fx8
    protected readonly halfAirDensity = Fx8(0.61) // in kg/m3 at sea level
    protected readonly pixelsToMeter = 30;
    constructor(maxVelocity: number, minSingleStep: number, maxSingleStep: number, maxDrag: 500) {
        super(maxVelocity, minSingleStep, maxSingleStep);
        this.maxDrag = maxDrag;
    }

    get maxDrag(): number {
        return Fx.toInt(this._maxDrag);
    }

    set maxDrag(maxDrag: number) {
        this._maxDrag = Fx8(maxDrag)
    }

    protected createMovingSprite(sprite: Sprite, dtMs: number, dt2: number): MovingSprite {
        // debug(`Creating moving sprite... ${sprite}`)
        let physics = sprites.getPhysics(sprite)
        const ovx = this.constrainMax(sprite._vx, physics.MaxSpeed);
        const ovy = this.constrain(sprite._vy);

        sprite._lastX = sprite._x;
        sprite._lastY = sprite._y;

        // Calculate the drag
        function calculateDragX(sprite: Sprite): Fx8 {
            // Use the drag coefficient off a square if one is not set
            const dragCoefficient: Fx8 = Fx8(physics.DragCoefficent)
            const mass: Fx8 = Fx8(physics.Mass);
            const area: Fx8 = Fx8(sprite.height / this.pixelsToMeter)

            // Drag = (halfAirDensity * (vx^2) * dragCoefficient) / mass
            let dragX = Fx.div(
                Fx.mul(
                    Fx.mul( 
                        Fx.mul(
                            this.halfAirDensity,
                            Fx.mul(
                                sprite._vx,
                                sprite._vx
                            )
                        ),
                        dragCoefficient
                    ),
                    area
                ),
                mass
            )
            if (physics.Mass != 1) {       
                // debug(`dragCoefficient: ${Fx.toInt(dragCoefficient)}`)
                // debug(`mass: ${Fx.toInt(mass)}`)
                // debug(`mass: ${Fx.toInt(mass)}`)
                let otherDragX = (Fx.toFloat(this.halfAirDensity) * (sprite.vx * sprite.vx) *
                    (physics.DragCoefficent) * (sprite.height / this.pixelsToMeter))
                    / physics.Mass
                // debug(`NonFxCalculatedDrag: ${otherDragX}`)
                // debug(`totalDrag: ${Fx.toFloat(dragX)}`)
            }
            
            return Fx.idiv(
                Fx.imul(
                    dragX,
                    dtMs
                ),
                1000
            );
        };

        if (physics.Mass) {
            // TODO: Figure out how to make this stronger when the velocity is low
            let dragX = calculateDragX(sprite)
            if (Fx.compare(Fx.zeroFx8, ovx) < 0) {
                dragX = Fx.neg(dragX)
            }
            // debug(`_vx: ${Fx.toFloat(sprite._vx)}`)
            // debug(`dragx: ${Fx.toFloat(dragX)}`)
            sprite._vx = Fx.add(
                sprite._vx,
                dragX
            )
            // debug(`new _vx: ${Fx.toFloat(sprite._vx)}`)
        }


        if (sprite._ax) {
            sprite._vx = Fx.add(
                sprite._vx,
                Fx.idiv(
                    Fx.imul(
                        sprite._ax,
                        dtMs
                    ),
                    1000
                )
            );
        } else if (sprite._fx) {
            const fx = Fx.idiv(
                Fx.imul(
                    sprite._fx,
                    dtMs
                ),
                1000
            );
            debug(`Friction X: ${Fx.toFloat(fx)} Vel X: ${sprite._vx}`)
            const c = Fx.compare(sprite._vx, fx);
            if (c < 0) // v < f, v += f
                sprite._vx = Fx.min(Fx.zeroFx8, Fx.add(sprite._vx, fx));
            else if (c > 0) // v > f, v -= f
                sprite._vx = Fx.max(Fx.zeroFx8, Fx.sub(sprite._vx, fx));
            else
                sprite._vx = Fx.zeroFx8
        }

        if (sprite._ay) { // TODO(aznhassan): Consider getting rid of the only ax or fx req
            sprite._vy = Fx.add(
                sprite._vy,
                Fx.idiv(
                    Fx.imul(
                        sprite._ay,
                        dtMs
                    ),
                    1000
                )
            );
        } else if (sprite._fy) {
            const fy = Fx.idiv(
                Fx.imul(
                    sprite._fy,
                    dtMs
                ),
                1000
            );
            const c = Fx.compare(sprite._vy, fy);
            if (c < 0) // v < f, v += f
                sprite._vy = Fx.min(Fx.zeroFx8, Fx.add(sprite._vy, fy));
            else if (c > 0) // v > f, v -= f
                sprite._vy = Fx.max(Fx.zeroFx8, Fx.sub(sprite._vy, fy));
            else
                sprite._vy = Fx.zeroFx8;
        }

        sprite._vx = this.constrainMax(sprite._vx, physics.MaxSpeed);
        sprite._vy = this.constrain(sprite._vy);

        // // Set the speed to zero if we're below the min speed
        // const minSpeedX = sprite.data['minSpeedX']
        // if (minSpeedX) {
        //     if (Fx.compare(Fx.abs(sprite._vx), Fx8(minSpeedX)) < 0) {
        //         // Only stop moving if no acceleration is being applied
        //         debug(`accelerationx: ${sprite.ax}`)
        //         if (sprite.ax == 0) {
        //             debug(`Below the min speed of ${minSpeedX}`)
        //             sprite._vx = Fx.zeroFx8
        //         }
        //     } else {
        //         debug(`${Fx.toFloat(sprite._vx)} > ${minSpeedX}`)
        //     }
        // }

        const dx = Fx8(Fx.toFloat(Fx.add(sprite._vx, ovx)) * dt2 / 1000);
        const dy = Fx8(Fx.toFloat(Fx.add(sprite._vy, ovy)) * dt2 / 1000);

        let xStep = dx;
        let yStep = dy;

        // make step increments smaller until under max step size
        while (Fx.abs(xStep) > this.maxSingleStep || Fx.abs(yStep) > this.maxSingleStep) {
            if (Fx.abs(xStep) > this.minSingleStep) {
                xStep = Fx.idiv(xStep, 2);
            }
            if (Fx.abs(yStep) > this.minSingleStep) {
                yStep = Fx.idiv(yStep, 2);
            }
        }

        return new MovingSprite(
            sprite,
            sprite._vx,
            sprite._vy,
            dx,
            dy,
            xStep,
            yStep
        );
    }

    protected constrainMax(v: Fx8, max?: number) {
        const maxVel = max ? Fx8(max) : this.maxVelocity
        const negMaxVel = Fx.neg(maxVel)
        return Fx.max(
            Fx.min(
                maxVel,
                v
            ),
            negMaxVel
        );
    }
}
}