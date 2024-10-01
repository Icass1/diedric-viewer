import { Vector2 } from "three"
import { Canvas } from "./canvas"

export class Point {
    color: string
    radius: number
    pos: Vector2

    constructor({ color = "black", radius = 2 }: { color?: string, radius?: number }) {
        this.color = color
        this.radius = radius

        this.pos = new Vector2(0, 0)
    }
    render(canvas: Canvas) {

        canvas.ctx.beginPath();
        canvas.ctx.arc(
            this.pos.x * canvas.zoom + canvas.center.x,
            this.pos.y * canvas.zoom + canvas.center.y,
            this.radius, 0, 2 * Math.PI, false
        );
        canvas.ctx.fillStyle = this.color;
        canvas.ctx.fill();
    }
}