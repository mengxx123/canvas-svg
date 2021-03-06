/*
 * Fucksvg (17.6.1) fucksvg.element.js
 * Licensed under MIT
 */

import Node from './fucksvg.node'

class Circle extends Node {
    constructor(name) {
        super(name);

        this.r = 30;
        this.beginDegree = 0;
        this.endDegree = 2 * Math.PI;
    }

    draw(ctx) {
        if(this.visible == false) return;
        var w = this.r * 2 * this.scala;
        var h = this.r * 2 * this.scala;
        this.setWidth(w);
        this.setHeight(h);
        this.width
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + this.style.fillStyle + ',' + this.alpha + ')';
        ctx.arc(this.x+ w/2, this.y+ h/2, w/2, this.beginDegree, this.endDegree, true);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}

class Rect extends Node {
    constructor() {
        super();
    }

    draw(ctx) {
        if (this.visible == false) {
            return;
        }

        ctx.fillStyle = 'rgba(' + this.style.fillStyle + ',' + this.alpha + ')';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

export {Circle, Rect}
