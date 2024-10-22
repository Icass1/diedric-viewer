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

    lastMouseDownPos: number[] | undefined


    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas


        let cameraConfig = JSON.parse(localStorage.getItem("camera2d") || "")
        console.log(cameraConfig?.center?.x, this.canvas.width / 2, cameraConfig?.center?.x || this.canvas.width / 2)
        this.zoom = cameraConfig?.zoom || 2.1
        this.center = new Vector2(cameraConfig?.center?.x || this.canvas.width / 2, cameraConfig?.center?.y || this.canvas.height / 2)
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D
        this.color = "rgb(200, 200, 200)"

        this.canvas.addEventListener("mousedown", (e) => {
            this.lastMouseDownPos = [this.center.x - e.offsetX, this.center.y - e.offsetY]
        })
        this.canvas.addEventListener("mousemove", (e) => {
            if (this.lastMouseDownPos == undefined) return
            this.center = new Vector2(e.offsetX + this.lastMouseDownPos[0], e.offsetY + this.lastMouseDownPos[1])
            localStorage.setItem("camera2d", JSON.stringify({ zoom: this.zoom, center: { x: this.center.x, y: this.center.y } }))

        })
        document.addEventListener("mouseup", () => {
            this.lastMouseDownPos = undefined
        })
        this.canvas.addEventListener("wheel", (e) => {
            let a = [(e.offsetX - this.center.x) / this.zoom, (e.offsetY - this.center.y) / this.zoom]
            this.zoom *= (-e.deltaY / 1000 + 1)

            a[0] *= this.zoom
            a[1] *= this.zoom

            this.center = new Vector2(e.offsetX - a[0], e.offsetY - a[1])
            localStorage.setItem("camera2d", JSON.stringify({ zoom: this.zoom, center: { x: this.center.x, y: this.center.y } }))
        }, { passive: true })
    }

    setSize(width: number, height: number) {
        this.canvas.width = width
        this.canvas.height = height
        // this.center = new Vector2(this.canvas.width / 2, this.canvas.height / 2)
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