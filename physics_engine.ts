 /**
 * An upgraded Physics Engine that includes drag
*/
class ArcadePhysicsEnginePlus extends ArcadePhysicsEngine {
    protected _maxDrag: Fx8
    protected readonly halfAirDensity = Fx8(0.01)
    protected _debug: boolean
    // protected readonly airFlowVelocity = Fx8(10)
    
    constructor(maxVelocity: number, minSingleStep: number, maxSingleStep: number, maxDrag: 500) {
        super(maxVelocity, minSingleStep, maxSingleStep);
        this.maxDrag = maxDrag;
        this._debug = true
    }

    protected debug(message: string | object) {
        if (this._debug) {
            console.log(message)
        }
    }

    get maxDrag(): number {
        return Fx.toInt(this._maxDrag);
    }

    set maxDrag(maxDrag: number) {
        this._maxDrag = Fx8(maxDrag)
    }

    protected createMovingSprite(sprite: Sprite, dtMs: number, dt2: number): MovingSprite {
        const ovx = this.constrainMax(sprite._vx, sprite.data['maxSpeedX']);
        const ovy = this.constrain(sprite._vy);
        sprite._lastX = sprite._x;
        sprite._lastY = sprite._y;

        // Calculate the drag
        function calculateDragX(sprite: Sprite): Fx8 {
            // Use the drag coefficient off a square if one is not set
            const dragCoefficient: Fx8 = Fx8(sprite.data['dragCoefficient'] || 1.05)
            const mass: Fx8 = Fx8(sprite.data['mass'] || 1);
            const area: Fx8 = Fx8(sprite.height)

            if (sprite.data['mass']) {
                // this.debug(`dragCoefficient: ${Fx.toFloat(dragCoefficient)}`);
                // this.debug(`mass: ${Fx.toFloat(mass)}`);
                // this.debug(`area: ${Fx.toFloat(area)}`);
            }            
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
            if (sprite.data['mass']) {                
                let otherDragX = (Fx.toFloat(this.halfAirDensity) * (sprite.vx * sprite.vx) *
                    (sprite.data['dragCoefficient'] || 1.05) * (sprite.height))
                    / sprite.data['mass'] || 1
                this.debug(`NonFxCalculatedDrag: ${otherDragX}`)
                this.debug(`totalDrag: ${Fx.toFloat(dragX)}`)
            }
            
            return Fx.idiv(
                Fx.imul(
                    dragX,
                    dtMs
                ),
                1000
            );
        };

        const dragX = calculateDragX(sprite)
        if (Fx.compare(Fx.zeroFx8, dragX) > 0) {
            Fx.neg(dragX)
        }
        if (sprite.data['mass']) {
            this.debug(`_vx: ${Fx.toFloat(sprite._vx)}`)
            this.debug(`dragx: ${Fx.toFloat(dragX)}`)
        }

        // sprite._vx = Fx.sub(
        //     sprite._vx,
        //     dragX
        // )
        if (sprite.data['mass']) {
            this.debug(`new _vx: ${Fx.toFloat(sprite._vx)}`)
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

        sprite._vx = this.constrainMax(sprite._vx, sprite.data['maxSpeedX']);
        sprite._vy = this.constrain(sprite._vy);

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

