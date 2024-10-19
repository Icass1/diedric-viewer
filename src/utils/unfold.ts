import * as THREE from 'three';
import { Diedric } from "./diedric"
import { DiedricPlane } from "./diedricPlane"
import { DiedricPoint } from "./diedricPoint"
import { Circle, Label, Line } from "./two"


export class Unfold {

    static params: any = { 'plane': DiedricPlane, 'point': DiedricPoint }
    static type = "unfold-point"
    public type = "unfold-point"

    private plane: DiedricPlane | undefined
    private point: DiedricPoint | undefined

    children: any[]

    private line1: Line
    private line2: Line
    private circle3: Circle
    private point4: Circle
    private circle5: Circle
    private point6: Circle
    private unfoldedPoint: Circle

    private details: boolean

    private diedric: Diedric
    private label: Label

    constructor({ diedric, plane, point, color, details = false }: { diedric: Diedric, plane: DiedricPlane | undefined, point: DiedricPoint | undefined, color: THREE.ColorRepresentation, details: boolean }) {

        this.diedric = diedric

        this.plane = plane
        this.point = point

        this.details = details

        this.children = []

        this.point?.children.push(this)
        this.plane?.children.push(this)

        this.line1 = new Line({ color: this.point?.color.toString() || "", dashed: true, width: 1 })
        this.line2 = new Line({ color: this.point?.color.toString() || "", dashed: true, width: 1 })
        this.circle3 = new Circle({ color: this.point?.color.toString() || "", width: 1, dashed: true })
        this.point4 = new Circle({ color: this.point?.color.toString() || "", fill: true, radius: 2 })
        this.circle5 = new Circle({ color: this.point?.color.toString() || "", dashed: true })
        this.point6 = new Circle({ color: this.point?.color.toString() || "", fill: true, radius: 2 })
        this.unfoldedPoint = new Circle({ color: this.point?.color.toString() || "", fill: true, radius: 2 })

        if (this.details) {
            diedric.canvas2d.add(this.line1)
            diedric.canvas2d.add(this.line2)
            diedric.canvas2d.add(this.circle3)
            diedric.canvas2d.add(this.point4)
            diedric.canvas2d.add(this.circle5)
            diedric.canvas2d.add(this.point6)
        }

        this.label = new Label({ text: this.point?.name || "", color: this.point?.color.toString() || "" })

        diedric.canvas2d.add(this.unfoldedPoint)
        diedric.canvas2d.add(this.label)
    }

    update() {
        console.log("Unfold update")

        if (
            this.point?.o != undefined &&
            this.point?.a != undefined &&
            this.point.c != undefined &&
            this.plane?.normal?.x != undefined &&
            this.plane?.normal?.y != undefined &&
            this.plane?.normal?.z != undefined &&
            this.plane.d != undefined
        ) {
            this.label.text = "(" + this.point.name + ")"
            this.unfoldedPoint.color = this.point.color.toString()
            this.label.color = this.point.color.toString()

            this.line1.start = new THREE.Vector2(-200, -(this.plane.normal.x / this.plane.normal.z) * -200 + this.point.a + this.plane.normal.x / this.plane.normal.z * this.point.o)
            this.line1.end = new THREE.Vector2(200, -(this.plane.normal.x / this.plane.normal.z) * 200 + this.point.a + this.plane.normal.x / this.plane.normal.z * this.point.o)

            this.line2.start = new THREE.Vector2(-200, this.plane.normal.z / this.plane.normal.x * -200 + this.point.a - this.plane.normal.z / this.plane.normal.x * this.point.o)
            this.line2.end = new THREE.Vector2(200, this.plane.normal.z / this.plane.normal.x * 200 + this.point.a - this.plane.normal.z / this.plane.normal.x * this.point.o)

            this.circle3.pos = new THREE.Vector2(this.point.o, this.point.a)
            this.circle3.radius = Math.abs(this.point.c)

            let m = -this.plane.normal.x / this.plane.normal.z
            let n = this.point.a + this.plane.normal.x / this.plane.normal.z * this.point.o

            let k = this.point.o
            let h = this.point.a
            let radius = this.point.c

            let a = Math.round((1 + m ** 2) * 1000) / 1000
            let b = Math.round((-2 * k + 2 * m * n - 2 * m * h) * 1000) / 1000
            let c = Math.round((k ** 2 + n ** 2 - 2 * n * h + h ** 2 - radius ** 2) * 1000) / 1000

            console.log({ m: m, n: n, k: k, h: h, radius: radius, a: a, b: b, c: c })
            console.log(b ** 2 - 4 * a * c)

            let point4x = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a)
            let point4y = m * point4x + n
            this.point4.pos = new THREE.Vector2(point4x, point4y)

            let point6x = (this.point.a - this.plane.normal.z / this.plane.normal.x * this.point.o - this.plane.d / this.plane.normal.z) / (-this.plane.normal.x / this.plane.normal.z - this.plane.normal.z / this.plane.normal.x)
            let point6y = this.plane.normal.z / this.plane.normal.x * point6x + this.point.a - this.plane.normal.z / this.plane.normal.x * this.point.o
            this.point6.pos = new THREE.Vector2(point6x, point6y)

            this.circle5.pos = new THREE.Vector2(point6x, point6y)
            let circle5radius = new THREE.Vector2(point6x, point6y).distanceTo(new THREE.Vector2(point4x, point4y))
            this.circle5.radius = this.circle5.pos.distanceTo(new THREE.Vector2(point4x, point4y))

            m = this.plane.normal.z / this.plane.normal.x
            n = this.point.a - this.plane.normal.z / this.plane.normal.x * this.point.o

            k = point6x
            h = point6y
            radius = circle5radius

            a = Math.round((1 + m ** 2) * 1000) / 1000
            b = Math.round((-2 * k + 2 * m * n - 2 * m * h) * 1000) / 1000
            c = Math.round((k ** 2 + n ** 2 - 2 * n * h + h ** 2 - radius ** 2) * 1000) / 1000

            let point7x = (-b + Math.sqrt(b ** 2 - 4 * a * c) * (this.point.c < 0 ? 1 : - 1)) / (2 * a)
            let point7y = m * point7x + n
            console.log(point7x, point7y)
            this.unfoldedPoint.pos = new THREE.Vector2(point7x, point7y)

            this.label.pos = new THREE.Vector2().copy(this.unfoldedPoint.pos).add(new THREE.Vector2(0, -3))

        }
    }

    removeParent(parent: DiedricPoint | DiedricPlane) {
        if (this.point === parent) {
            this.point = undefined
        } else if (this.plane == parent) {
            this.plane = undefined
        }
    }
    remove() {

        this.diedric.canvas2d.remove(this.line1)
        this.diedric.canvas2d.remove(this.line2)
        this.diedric.canvas2d.remove(this.circle3)
        this.diedric.canvas2d.remove(this.point4)
        this.diedric.canvas2d.remove(this.circle5)
        this.diedric.canvas2d.remove(this.point6)
        this.diedric.canvas2d.remove(this.unfoldedPoint)
        this.diedric.canvas2d.remove(this.label)

        console.log("Unfold remove")
    }
}