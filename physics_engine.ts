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

    constructor(x: Fx8, y: Fx8) {
        this._x = x
        this._y = y
    }

    static fromInteger(x: number, y: number): Vec2dFx8 {
        return new Vec2dFx8(Fx8(x), Fx8(y))
    }

    get X(): number {
        return Fx.toInt(this._x)
    }

    get Y(): number {
        return Fx.toInt(this._y)
    }

    plus(vector: Vec2dFx8 ): Vec2dFx8 {
        return new Vec2dFx8(Fx.add(this._x, vector._x), Fx.add(this._y, vector._y))
        // return new Vec2dFx8(this.X + vector.X, this.Y + vector.Y)
    }

    smult(scalar: number): Vec2dFx8;
    smult(scalar: Fx8): Vec2dFx8;
    smult(scalar: number | Fx8): Vec2dFx8 {
        if (typeof scalar == "number") {
            return new Vec2dFx8(Fx.imul(this._x, scalar), Fx.imul(this._y, scalar))
        } else {
            return new Vec2dFx8(Fx.mul(this._x, scalar), Fx.mul(this._y, scalar))
        }
    }
    sdiv(scalar: number): Vec2dFx8;
    sdiv(scalar: Fx8): Vec2dFx8;
    sdiv(scalar: number | Fx8): Vec2dFx8 {
        if (typeof scalar == "number") {
            return new Vec2dFx8(Fx.idiv(this._x, scalar), Fx.idiv(this._y, scalar))
        } else {
            return new Vec2dFx8(Fx.div(this._x, scalar), Fx.div(this._y, scalar))
        }
    }

    toString(): String {
        return `(${this.X}, ${this.Y})`
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
    // This will be used by default
    private _useOldPhysics: Boolean = true

    constructor() {
        this._mass = Fx8(1)
        this._force = Vec2dFx8.fromInteger(0, 0)
        this._impulse = Vec2dFx8.fromInteger(0, 0)
        this._velocity = Vec2dFx8.fromInteger(0, 0)
        this._maxSpeed = Fx8(1)
        this._coefficentOfRestitution = Fx8(0)
        this._dragCoefficent = Fx8(1.05)
    }

    get Mass(): number {
        return Fx.toInt(this._mass)
    }

    set Mass(mass: number) {
        this._useOldPhysics = false
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
        this._useGoalSpeed = true
        this._maxSpeed = Fx8(goalSpeed)
    }

    get DragCoefficent(): number {
        return Fx.toInt(this._dragCoefficent)
    }

    set DragCoefficent(dragCoefficent: number) {
        this._dragCoefficent = Fx8(dragCoefficent)
    }

    get Velocity(): Vec2dFx8 {
        return this._velocity
    }

    // The force will be applied on each tick, so add this force instead of replacing it
    applyForce(x: number, y: number) {
        debug(`Applying force: ${Vec2dFx8.fromInteger(x, y)}`)
        this._force = Vec2dFx8.fromInteger(x, y).plus(this._force)
    }

    applyImpulse(x: number, y: number) {
        debug(`Applying impulse: ${Vec2dFx8.fromInteger(x, y)}`)
        this._impulse = Vec2dFx8.fromInteger(x, y).plus(this._impulse)
    }

    onTick(dtMs: number) {
        //TODO: Add goal velocity
        // velocity += t*force/mass + impulse/mass
        let oldVelocity = this._velocity
        this._velocity = this._velocity.plus(
            this._force.smult(dtMs).sdiv(this._mass).plus(
                this._impulse.sdiv(this._mass)
            )
        )

        // Reset force and impulse since we've applied them
        this._force = Vec2dFx8.fromInteger(0, 0)
        this._impulse = Vec2dFx8.fromInteger(0, 0)
        debug(`Old Velocity: ${oldVelocity}, new velocity ${this._velocity}`)
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
        // Let the other sprites use the old physics
        if (!sprites.isPhysicsPlusAvailible(sprite)) {
            return super.createMovingSprite(sprite, dtMs, dt2)
        }

        // velocity += t*force/mass + impulse/mass
        let physics = sprites.getPhysics(sprite)
        physics.onTick(dtMs)
        const ovx = this.constrainMax(sprite._vx, physics.MaxSpeed);
        const ovy = this.constrain(sprite._vy);

        sprite._lastX = sprite._x;
        sprite._lastY = sprite._y;
        
        // this.applyDrag(sprite, physics, dtMs)

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
        //         if (sprite.ax == 0) {
        //             sprite._vx = Fx.zeroFx8
        //         }
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

    protected applyDrag(sprite: Sprite, physics: PhysicsProperties, dtMs: number) {
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
            let otherDragX = (Fx.toFloat(this.halfAirDensity) * (sprite.vx * sprite.vx) *
                (physics.DragCoefficent) * (sprite.height / this.pixelsToMeter))
                / physics.Mass

            return Fx.idiv(
                Fx.imul(
                    dragX,
                    dtMs
                ),
                1000
            );
        };

        // TODO: Figure out how to make this stronger when the velocity is low
        let dragX = calculateDragX(sprite)
        const ovx = this.constrainMax(sprite._vx, physics.MaxSpeed);
        if (Fx.compare(Fx.zeroFx8, ovx) < 0) {
            dragX = Fx.neg(dragX)
        }
        sprite._vx = Fx.add(
            sprite._vx,
            dragX
        )
    }
}
}