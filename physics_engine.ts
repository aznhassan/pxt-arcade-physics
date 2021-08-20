/**
 * An upgraded Physics Engine that includes drag
*/
class ArcadePhysicsEnginePlus extends ArcadePhysicsEngine {
    protected _maxDrag: Fx8;
    protected readonly halfAirDensity = Fx8(0.1)
    // protected readonly airFlowVelocity = Fx8(10)
    
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
        const ovx = this.constrain(sprite._vx);
        const ovy = this.constrain(sprite._vy);
        sprite._lastX = sprite._x;
        sprite._lastY = sprite._y;

        // Calculate the drag
        function calculateDragX(sprite: Sprite): Fx8 {
            // Use the drag coefficient off a square if one is not set
            const dragCoefficient: Fx8 = Fx8(sprite.data['dragCoefficient'] || 1.05)
            const mass: Fx8 = Fx8(sprite.data['mass'] || 1);
            const area: Fx8 = Fx8(sprite.height *sprite.width)

            if (sprite.data['mass']) {
                // console.log(`dragCoefficient: ${Fx.toFloat(dragCoefficient)}`);
                // console.log(`mass: ${Fx.toFloat(mass)}`);
                // console.log(`area: ${Fx.toFloat(area)}`);
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
            // if (sprite.data['mass']) {
            //     console.log(`dtMs: ${dtMs}`)
            //     console.log(`totalDrag: ${Fx.toFloat(dragX)}`)
            // }
            
            return Fx.idiv(
                Fx.imul(
                    dragX,
                    dtMs
                ),
                1000
            );
        };

        if (sprite.data['mass']) {
            console.log(`_vx: ${Fx.toFloat(sprite._vx)}`)
            console.log(`dragx: ${Fx.toFloat(calculateDragX(sprite))}`)
        }
        // sprite._vx = Fx.add(
        //     sprite._vx,
        //     calculateDragX(sprite)
        // )
        if (sprite.data['mass']) {
            console.log(`new _vx: ${Fx.toFloat(sprite._vx)}`)
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

        sprite._vx = this.constrain(sprite._vx);
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
}

