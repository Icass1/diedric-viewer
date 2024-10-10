import { Vector2 } from "three"
import { Canvas } from "./canvas"

export class Line {
    color: string
    width: number
    start: Vector2
    end: Vector2
    dashed: boolean

    constructor({ color = "black", width = 1, dashed = false }: { color?: string, width?: number, dashed?: boolean }) {
        this.color = color
        this.width = width
        this.dashed = dashed

        this.start = new Vector2(0, 0)
        this.end = new Vector2(0, 0)
    }
    render(canvas: Canvas) {
        if (this.start?.x == undefined || this.start?.y == undefined || this.end?.x == undefined || this.end?.y == undefined) return
        
        canvas.ctx.save()
            
        canvas.ctx.lineWidth = this.width;

        canvas.ctx.strokeStyle = this.color
        if (this.dashed) canvas.ctx.setLineDash([15, 5]);

        canvas.ctx.beginPath();
        canvas.ctx.moveTo(
            this.start.x * canvas.zoom + canvas.center.x,
            this.start.y * canvas.zoom + canvas.center.y
        );
        canvas.ctx.lineTo(
            this.end.x * canvas.zoom + canvas.center.x,
            this.end.y * canvas.zoom + canvas.center.y
        );
        canvas.ctx.stroke();
        canvas.ctx.restore()

        // console.log(this.start, this.end)

        // canvas.context.fillStyle = "red"
        // canvas.context.lineJoin(100, 100, 30, 0, 5)
        // canvas.context.stroke()
    }
}