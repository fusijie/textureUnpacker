class SpriteFrame {
    constructor() {
        this.rotated = false;

        this.rawWidth = 0;
        this.rawHeight = 0;

        this.offsetX = 0;
        this.offsetY = 0;

        this.trimX = 0;
        this.trimY = 0;
        this.width = -1;
        this.height = -1;
    }
}

module.exports = SpriteFrame;