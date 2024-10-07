import { Vector2 } from "three"
import { Canvas } from "./canvas"

export class Ellispe {
    color: string
    pos: Vector2

    semiMajor: number
    semiMinor: number

    angle: number

    constructor({ color = "black" }: { color?: string }) {
        this.color = color

        this.pos = new Vector2(0, 0)

        this.semiMajor = 10
        this.semiMinor = 20
        this.angle = 10
    }
    render(canvas: Canvas) {
        // 4. Draw the ellipse using the calculated center, radii, and rotation
        canvas.ctx.beginPath();
        canvas.ctx.ellipse(
            this.pos.x * canvas.zoom + canvas.center.x,
            this.pos.y * canvas.zoom + canvas.center.y,
            this.semiMajor, this.semiMinor, this.angle, 0, 2 * Math.PI);
        canvas.ctx.strokeStyle = 'blue';
        canvas.ctx.lineWidth = 2;
        canvas.ctx.stroke();
    }
}