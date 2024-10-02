import { DiedricLine } from "./diedricLine";
import { DiedricPlane } from "./diedricPlane";


export function intersectionLinePlane(line: DiedricLine, plane: DiedricPlane) {

    if (plane.d !== undefined && line.bVector?.x !== undefined && line.bPoint?.x !== undefined && plane.normal?.x) {
        const t = (plane.d - plane.normal.x * line.bPoint.x - plane.normal.y * line.bPoint.y - plane.normal.z * line.bPoint.z) / (line.bVector.x * plane.normal.x + line.bVector.y * plane.normal.y + line.bVector.z * plane.normal.z)

        const x = line.bVector.x * t + line.bPoint.x
        const y = line.bVector.z * t + line.bPoint.z
        const z = line.bVector.y * t + line.bPoint.y

        return { o: x, a: y, c: z }
    }
    return { o: undefined, a: undefined, c: undefined }
}