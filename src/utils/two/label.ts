import { Vector2 } from "three"
import { Canvas } from "./canvas"

export class Label {
    color: string
    pos: Vector2
    text: string

    constructor({ text, color = "black" }: { text: string, color?: string }) {
        this.color = color

        this.pos = new Vector2(0, 0)
        this.text = text


    }
    render(canvas: Canvas) {
        if (this.pos?.x == undefined || this.pos?.y == undefined) return

        canvas.ctx.save();
        canvas.ctx.translate(
            this.pos.x * canvas.zoom + canvas.center.x,
            this.pos.y * canvas.zoom + canvas.center.y - 3,
        );
        canvas.ctx.fillStyle = this.color
        canvas.ctx.font = "16px Arial";
        canvas.ctx.textAlign = "center"
        canvas.ctx.textBaseline = "bottom";

        canvas.ctx.fillText(this.text, 0, 0);
        canvas.ctx.restore();
    }
    

}