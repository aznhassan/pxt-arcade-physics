class ArcadePhysicsEnginePlus extends ArcadePhysicsEngine {
    protected _maxMomentum: Fx8;
    
    constructor(maxVelocity: number, minSingleStep: number, maxSingleStep: number, maxMomentum: 500) {
        super(maxVelocity, minSingleStep, maxSingleStep);
        this.maxMomentum = maxMomentum;
    }

    get maxMomentum(): number {
        return Fx.toInt(this._maxMomentum);
    }

    set maxMomentum(maxMomentum: number) {
        this._maxMomentum = Fx8(maxMomentum)
    }
}

