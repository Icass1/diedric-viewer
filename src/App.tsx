import { BaseSyntheticEvent, ChangeEvent, ReactNode, RefObject, useCallback, useEffect, useState } from "react"
import { Diedric } from "./utils/diedric"
import * as THREE from 'three';
import { DiedricPlane, DiedricPlane3Points } from "./utils/diedricPlane";
import { DiedricPoint } from "./utils/diedricPoint";
import { DiedricLine, DiedricLine2Points } from "./utils/diedricLine";

interface Expression<T> {
    id: string
    type: "point" | "line-2-pto" | "plane-3-pto"
    value: T
    parameters: any
}

function PointExpresssion({ expression, updateValue }: { expression: Expression<DiedricPoint>, updateValue: (id: string, key: string, value: string | number) => void }) {

    const [o, setO] = useState(expression.parameters.o)
    const [a, setA] = useState(expression.parameters.a)
    const [c, setC] = useState(expression.parameters.c)

    const handleOChange = (e: ChangeEvent<HTMLInputElement>) => {
        setO(e.target.value)
        expression.value.o = Number(e.target.value)
        updateValue(expression.id, "o", Number(e.target.value))
    }

    const handleAChange = (e: ChangeEvent<HTMLInputElement>) => {
        setA(e.target.value)
        expression.value.a = Number(e.target.value)
        updateValue(expression.id, "a", Number(e.target.value))
    }
    const handleCChange = (e: ChangeEvent<HTMLInputElement>) => {
        setC(e.target.value)
        expression.value.c = Number(e.target.value)
        updateValue(expression.id, "c", Number(e.target.value))
    }

    return (
        <>
            <div className="flex flex-row">
                <input defaultValue={expression.id} className="bg-transparent border-b border-neutral-300 focus:outline-none w-10" />
                <label className="border-b border-neutral-300 w-full min-w-0"> = (O, A, C)</label>
            </div>
            <div className="flex flex-row justify-between gap-4">
                <div className="flex flex-row min-w-0 gap-2">
                    <label className="">O:</label>
                    <input type="number" className="bg-transparent border-b border-neutral-300 focus:outline-none min-w-0" value={o} onChange={handleOChange}></input>
                </div>
                <div className="flex flex-row min-w-0 gap-2">
                    <label>A:</label>
                    <input type="number" className="bg-transparent border-b border-neutral-300 focus:outline-none min-w-0" value={a} onChange={handleAChange}></input>
                </div>
                <div className="flex flex-row min-w-0 gap-2">
                    <label>C:</label>
                    <input type="number" className="bg-transparent border-b border-neutral-300 focus:outline-none min-w-0" value={c} onChange={handleCChange}></input>
                </div>
            </div>
        </>
    )
}
function Plane3PointsExpression({ expression, updateValue }: { expression: Expression<DiedricLine>, updateValue: (id: string, key: string, value: string | number) => void }) {

    const [id, setId] = useState(expression.id)
    const [point1Id, setPoint1Id] = useState(expression.parameters.point1)
    const [point2Id, setPoint2Id] = useState(expression.parameters.point2)
    const [point3Id, setPoint3Id] = useState(expression.parameters.point3)

    const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
        setId(e.target.value)
        updateValue(expression.id, "id", e.target.value)
    }

    const handlePoint1Change = (e: ChangeEvent<HTMLInputElement>) => {
        setPoint1Id(e.target.value)
        updateValue(expression.id, "point1", e.target.value)
    }
    const handlePoint2Change = (e: ChangeEvent<HTMLInputElement>) => {
        setPoint2Id(e.target.value)
        updateValue(expression.id, "point2", e.target.value)
    }
    const handlePoint3Change = (e: ChangeEvent<HTMLInputElement>) => {
        setPoint3Id(e.target.value)
        updateValue(expression.id, "point2", e.target.value)
    }

    return (
        <>
            <div className="flex flex-row">
                <input value={id} onChange={handleIdChange} className="bg-transparent border-b border-neutral-300 focus:outline-none w-10 text-center" />
                <label className="border-b border-neutral-300 w-fit"> = (</label>
                <input value={point1Id} onChange={handlePoint1Change} className="bg-transparent border-b border-neutral-300 focus:outline-none w-10 text-center" />
                <label className="border-b border-neutral-300 w-fit">, </label>
                <input value={point2Id} onChange={handlePoint2Change} className="bg-transparent border-b border-neutral-300 focus:outline-none w-10 text-center" />
                <label className="border-b border-neutral-300 w-fit ">, </label>
                <input value={point3Id} onChange={handlePoint3Change} className="bg-transparent border-b border-neutral-300 focus:outline-none w-10 text-center" />
                <label className="border-b border-neutral-300 w-fit ">)</label>
            </div>
        </>
    )
}
function Line2PointsExpression({ expression, updateValue }: { expression: Expression<DiedricLine>, updateValue: (id: string, key: string, value: string | number) => void }) {

    const [id, setId] = useState(expression.id)
    const [point1Id, setPoin1Id] = useState(expression.parameters.point1)
    const [point2Id, setPoin2Id] = useState(expression.parameters.point2)

    const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
        setId(e.target.value)
        updateValue(expression.id, "id", e.target.value)
    }

    const handlePoint1Change = (e: ChangeEvent<HTMLInputElement>) => {
        setPoin1Id(e.target.value)
        updateValue(expression.id, "point1", e.target.value)
    }
    const handlePoint2Change = (e: ChangeEvent<HTMLInputElement>) => {
        setPoin2Id(e.target.value)
        updateValue(expression.id, "point2", e.target.value)
    }

    return (
        <>
            <div className="flex flex-row">
                <input value={id} onChange={handleIdChange} size={3} className="bg-transparent border-b border-neutral-300 focus:outline-none w-10 text-center" />
                <label className="border-b border-neutral-300 w-fit"> = (</label>
                <input value={point1Id} onChange={handlePoint1Change} className="bg-transparent border-b border-neutral-300 focus:outline-none w-10 text-center" />
                <label className="border-b border-neutral-300 w-fit">, </label>
                <input value={point2Id} onChange={handlePoint2Change} className="bg-transparent border-b border-neutral-300 focus:outline-none w-10 text-center" />
                <label className="border-b border-neutral-300 w-fit ">)</label>
            </div>
        </>
    )
}

function Expression({ children, expression, removeExpression }: { children: ReactNode, expression: Expression<DiedricLine | DiedricPlane3Points | DiedricPoint>, removeExpression: (expression: Expression<DiedricLine | DiedricPlane3Points | DiedricPoint>) => {} }) {

    return (
        <div className="w-full border border-neutral-400 text-black rounded grid grid-cols-[40px_1fr_20px] items-center min-h-12 pr-2">
            <div className=" bg-zinc-800/50 rounded-tl rounded-bl h-full">
                <div className="bg-red-300 h-8 w-8 rounded-full relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: expression.value.color.toString() }}></div>
            </div>
            <div className="relative w-full p-2 min-w-0">
                {children}
            </div>
            <div className="h-5 w-5 bg-red-500" onClick={() => { removeExpression(expression) }}>

            </div>
        </div>
    )
}

export default function App({ canvasRef }: { canvasRef: RefObject<HTMLCanvasElement> }) {

    const [diedric, setDiedric] = useState<Diedric>()
    const [expressions, setExpressions] = useState<Expression<DiedricLine | DiedricPoint | DiedricPlane | null>[]>([])

    const savedExpressions: Expression<DiedricLine | DiedricPoint | DiedricPlane | null>[] = [
        {
            id: "P_1",
            type: "point",
            value: null,
            parameters: {
                o: 60,
                a: 30,
                c: -45,
                color: "red",
            }
        },
        {
            id: "P_2",
            type: "point",
            value: null,
            parameters: {
                o: -60,
                a: -45,
                c: 30,
                color: "blue",
            }
        },
        {
            id: "P_3",
            type: "point",
            value: null,
            parameters: {
                o: -80,
                a: -60,
                c: -30,
                color: "yellow",
            }
        },
        {
            id: "P_4",
            type: "point",
            value: null,
            parameters: {
                o: -34,
                a: 45,
                c: 30,
                color: "black",
            }
        },
        {
            id: "r",
            type: "line-2-pto",
            value: null,
            parameters: {
                point1: "P_1",
                point2: "P_2",
                color: "green",
            }
        },
        {
            id: "alpha",
            type: "plane-3-pto",
            value: null,
            parameters: {
                point1: "P_1",
                point2: "P_2",
                point3: "P_3",
                color: "gray",
            }
        }
    ]

    useEffect(() => {
        if (!canvasRef.current) return
        const newDiedric = new Diedric(100, canvasRef.current)

        setDiedric(newDiedric)
    }, [canvasRef])

    useEffect(() => {
        if (!diedric) { return }

        diedric.createStaticLabel("x", new THREE.Vector3(100, 0, 0));
        diedric.createStaticLabel("y", new THREE.Vector3(0, 100, 0));
        diedric.createStaticLabel("z", new THREE.Vector3(0, 0, 100));
    }, [diedric])

    useEffect(() => {
        if (!diedric) { return }

        let newExpressions: Expression<DiedricLine | DiedricPoint | DiedricPlane | null>[] = []
        savedExpressions.map((savedExpression) => {
            let value
            if (savedExpression.type == "point") {
                value = diedric.createPoint(savedExpression.parameters)
            } else if (savedExpression.type == "line-2-pto") {
                let point1 = newExpressions.find((expression) => expression.id == savedExpression.parameters.point1) as Expression<DiedricPoint>
                let point2 = newExpressions.find((expression) => expression.id == savedExpression.parameters.point2) as Expression<DiedricPoint>
                if (point1?.value && point2?.value) {
                    value = diedric.createLine2Points({ point1: point1.value, point2: point2.value, color: savedExpression.parameters.color })
                }
            } else if (savedExpression.type == "plane-3-pto") {
                let point1 = newExpressions.find((expression) => expression.id == savedExpression.parameters.point1) as Expression<DiedricPoint>
                let point2 = newExpressions.find((expression) => expression.id == savedExpression.parameters.point2) as Expression<DiedricPoint>
                let point3 = newExpressions.find((expression) => expression.id == savedExpression.parameters.point3) as Expression<DiedricPoint>
                if (point1?.value && point2?.value && point3?.value) {
                    value = diedric.createPlane3Points({ point1: point1.value, point2: point2.value, point3: point3.value, color: savedExpression.parameters.color })
                }
            } else {
                console.warn(savedExpression.type, "Not implemented")
            }
            if (!value) return

            newExpressions.push({
                id: savedExpression.id,
                type: savedExpression.type,
                value: value,
                parameters: savedExpression.parameters,
            })
        })
        setExpressions(newExpressions)

    }, [diedric])

    const renderExpression = (expression: Expression<DiedricPoint | DiedricLine | DiedricPlane>, index: number) => {
        if (expression.type == "point") {
            return <PointExpresssion key={index} expression={expression as Expression<DiedricPoint>} updateValue={updateValue} />
        } else if (expression.type == "plane-3-pto") {
            return <Plane3PointsExpression key={index} expression={expression as Expression<DiedricLine>} updateValue={updateValue} />
        } else if (expression.type == "line-2-pto") {
            return <Line2PointsExpression key={index} expression={expression as Expression<DiedricLine>} updateValue={updateValue} />
        }
    }

    const updateValue = useCallback((id: string, key: string | undefined, value: string | number | undefined) => {
        const expression = expressions.find(expression => expression.id == id)
        if (!expression) {
            console.warn(`Expression with id ${id} not found`)
            return
        }

        expressions.map(expression => {
            Object.keys(expression.parameters).map(param => {
                if (expression.parameters[param] == id) {
                    expression.value.update()
                    console.log(expression.id)
                    updateValue(expression.id, undefined, undefined)
                }
            })
        })

        if (expression.value instanceof DiedricLine2Points) {
            const newPoint = expressions.find(expression => expression.id == value)
            if (!newPoint || !(newPoint.value instanceof DiedricPoint)) {
                expression.value.hidden = true
                return
            }
            expression.value.hidden = false

            if (key == "point1") {
                expression.value.point1 = newPoint.value
                expression.parameters.point1 = newPoint.id

            } else if (key == "point2") {
                expression.value.point2 = newPoint.value
                expression.parameters.point2 = newPoint.id
            }
        } else if (expression.value instanceof DiedricPlane3Points) {
            const newPoint = expressions.find(expression => expression.id == value)
            if (!newPoint || !(newPoint.value instanceof DiedricPoint)) {
                expression.value.hidden = true
                return
            }
            expression.value.hidden = false

            if (key == "point1") {
                expression.value.point1 = newPoint.value
                expression.parameters.point1 = newPoint.id

            } else if (key == "point2") {
                expression.value.point3 = newPoint.value
                expression.parameters.point3 = newPoint.id
            } else if (key == "point3") {
                expression.value.point2 = newPoint.value
                expression.parameters.point2 = newPoint.id
            }


        }
    }, [diedric, expressions])

    const removeExpression = useCallback((expression: Expression<DiedricPoint>) => {
        expression.value.remove()
        updateValue(expression.id, undefined, undefined)
    }, [diedric, expressions])

    return (
        <div className="h-full overflow-y-auto p-3">
            <div className="flex flex-col items-center gap-2">
                {expressions.map(((expression, index) => (
                    <Expression key={index} expression={expression as Expression<DiedricPoint | DiedricLine | DiedricPlane>} removeExpression={removeExpression}>
                        {renderExpression(expression as Expression<DiedricPoint | DiedricLine | DiedricPlane>, index)}
                    </Expression>
                )))}
                <div className="h-16 w-16 border rounded border-neutral-400 hover:bg-green-400">

                </div>
            </div>
        </div>
    )
}