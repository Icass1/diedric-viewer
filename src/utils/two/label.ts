import { Vector2 } from "three"
import { Canvas } from "./canvas"
import { Point } from "./point"

export class Label {
    color: string
    width: number
    pos: Vector2


    constructor({ text, color = "black", width = 1 }: { text: string, color?: string, width?: number }) {
        this.color = color
        this.width = width

        this.pos = new Vector2(0, 0)



    }
    render(canvas: Canvas) {
        if (this.pos?.x == undefined || this.pos?.y == undefined) return

        canvas.ctx.save();
        canvas.ctx.translate(100, 100);
        canvas.ctx.beginPath();
        canvas.ctx.arc(
            0,
            0,
            2, 0, 2 * Math.PI, false
        );
        canvas.ctx.fillStyle = this.color;
        canvas.ctx.fill();
        canvas.ctx.rotate(-Math.PI / 10 * 21);
        canvas.ctx.fillStyle = "black"
        canvas.ctx.font = "30px Arial";
        canvas.ctx.textAlign = "center"
        canvas.ctx.textBaseline = "bottom";

        canvas.ctx.fillText("A''", 0, 0);

        canvas.ctx.restore();
    }
}