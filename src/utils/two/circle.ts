
import { Vector2 } from "three"
import { Canvas } from "./canvas"

export class Circle {
    color: string
    pos: Vector2

    radius: number

    fill: boolean
    dashed: boolean
    width: number

    constructor({ color = "black", fill = false, dashed = false, width = 1, radius = 4 }: { color?: string, fill?: boolean, dashed?: boolean, width?: number, radius?: number }) {
        this.color = color

        this.pos = new Vector2(0, 0)

        this.fill = fill
        this.dashed = dashed
        this.width = width

        this.radius = radius
    }
    render(canvas: Canvas) {
        // 4. Draw the ellipse using the calculated center, radii, and rotation

        canvas.ctx.save()

        canvas.ctx.beginPath();
        canvas.ctx.arc(
            this.pos.x * canvas.zoom + canvas.center.x,
            this.pos.y * canvas.zoom + canvas.center.y,
            this.radius * canvas.zoom,
            0,
            2 * Math.PI
        )
        canvas.ctx.strokeStyle = this.color;
        canvas.ctx.lineWidth = this.width;
        canvas.ctx.fillStyle = this.color;
        if (this.dashed) canvas.ctx.setLineDash([15, 5]);

        if (this.fill) canvas.ctx.fill()
        canvas.ctx.stroke();
        canvas.ctx.restore()

    }
}