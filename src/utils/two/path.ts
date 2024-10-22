import { Vector2 } from "three"
import { Canvas } from "./canvas"

export class Path {
    color: string
    width: number
    points: Vector2[] = []
    dashed: boolean

    constructor({ color = "black", width = 1, dashed = false }: { color?: string, width?: number, dashed?: boolean }) {
        this.color = color
        this.width = width
        this.dashed = dashed

    }
    render(canvas: Canvas) {

        if (this.points.length < 3) { return }
        canvas.ctx.save();

        canvas.ctx.lineWidth = this.width;
        canvas.ctx.strokeStyle = this.color
        if (this.dashed) canvas.ctx.setLineDash([15, 5]);

        canvas.ctx.beginPath();

        canvas.ctx.moveTo(
            this.points[0].x * canvas.zoom + canvas.center.x,
            this.points[0].y * canvas.zoom + canvas.center.y
        );

        for (let i = 1; i < this.points.length; i++) {
            canvas.ctx.lineTo(
                this.points[i].x * canvas.zoom + canvas.center.x,
                this.points[i].y * canvas.zoom + canvas.center.y
            );
        }

        // canvas.ctx.lineTo(
        //     this.points[0].x * canvas.zoom + canvas.center.x,
        //     this.points[0].y * canvas.zoom + canvas.center.y
        // );

        canvas.ctx.stroke();
        canvas.ctx.restore();
    }
}