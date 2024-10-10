import { Vector2 } from "three";
import { Line } from "./line";
import { Point } from "./point";
import { Label } from "./label";
import { Ellispe } from "./ellipse";
import { Path } from "./path";

type Objects = Line | Point | Label | Ellispe | Path

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
        this.center = new Vector2(this.canvas.width / 2, this.canvas.height / 2)
    }

    setBackground(color: string) {
        this.color = color
    }

    add(element: Objects) {
        if (this.elements.includes(element)) {
            // console.warn("Repeated", element)
            return
        }
        this.elements.push(element)
    }

    remove(element: Objects) {
        delete this.elements[this.elements.indexOf(element)]
        this.elements = this.elements.filter(element => element)
    }

    render() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.elements.map(element => element.render(this))
    }
}