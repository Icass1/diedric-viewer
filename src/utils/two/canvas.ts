import { Vector2 } from "three";
import { Line } from "./line";
import { Point } from "./point";

type Objects = Line | Point

export class Canvas {
    canvas: HTMLCanvasElement
    elements: Objects[] = []
    ctx: CanvasRenderingContext2D
    color: string
    zoom: number

    center: Vector2

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas

        this.zoom = 2.3
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D
        this.color = "rgb(200, 200, 200)"

        this.center = new Vector2(this.canvas.width / 2, this.canvas.height / 2)
    }
    setSize(width: number, height: number) {
        this.canvas.width = width
        this.canvas.height = height
    }

    setBackground(color: string) {
        this.color = color
    }

    add(element: Objects) {
        this.elements.push(element)
    }

    render() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.elements.map(element => element.render(this))
    }
}