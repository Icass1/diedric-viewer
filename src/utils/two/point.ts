import { Vector2 } from "three"
import { Canvas } from "./canvas"

export class Point {
    private _color: string
    private radius: number
    pos: Vector2


    constructor({ color = "red", radius = 2 }: { color?: string, radius?: number }) {
        this._color = color
        this.radius = radius

        this.pos = new Vector2(0, 0)
    }
    render(canvas: Canvas) {
        canvas.ctx.save();
        canvas.ctx.fillStyle = this._color;
        canvas.ctx.strokeStyle = this._color;

        canvas.ctx.beginPath();
        canvas.ctx.arc(
            this.pos.x * canvas.zoom + canvas.center.x,
            this.pos.y * canvas.zoom + canvas.center.y,
            this.radius, 0, 2 * Math.PI, false
        );
        canvas.ctx.fill();
        canvas.ctx.restore();
    }
    set color(color: string) {
        this._color = color

    }
}