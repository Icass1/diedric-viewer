import { ChangeEvent, createContext, ReactNode, RefObject, useContext, useEffect, useState } from "react"
import { Diedric } from "./utils/diedric"
import * as THREE from 'three';
import { DiedricPlane3Points, DiedricPlanePointLine } from "./utils/diedricPlane";
import { DiedricPoint } from "./utils/diedricPoint";
import { DiedricLine2Points, } from "./utils/diedricLine";

type PosibleExpressions = DiedricLine2Points | DiedricPlane3Points | DiedricPoint | DiedricPlanePointLine
interface Expression<T> {
    id: string
    type: "point" | "line-2-pto" | "plane-3-pto" | "plane-pto-line"
    value: T
    params: any
    hidden: boolean
}

interface a {
    expressions: Expression<PosibleExpressions | null>[]
    setExpressions: React.Dispatch<React.SetStateAction<Expression<PosibleExpressions | null>[]>>
}

const ExpressionsContext = createContext<a>({ expressions: [], setExpressions: () => { } })

function PointExpresssion({ expression }: { expression: Expression<DiedricPoint> }) {

    const [o, setO] = useState(expression.params.o)
    const [a, setA] = useState(expression.params.a)
    const [c, setC] = useState(expression.params.c)

    const handleOChange = (e: ChangeEvent<HTMLInputElement>) => {
        setO(e.target.value)
        expression.value.o = Number(e.target.value)
    }

    const handleAChange = (e: ChangeEvent<HTMLInputElement>) => {
        setA(e.target.value)
        expression.value.a = Number(e.target.value)
    }
    const handleCChange = (e: ChangeEvent<HTMLInputElement>) => {
        setC(e.target.value)
        expression.value.c = Number(e.target.value)
    }

    return (
        <>
            <div className="flex flex-row">
                <input defaultValue={expression.id} className="bg-transparent border-b border-neutral-300 focus:outline-none w-16 text-center" />
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
function Plane3PointsExpression({ expression }: { expression: Expression<DiedricPlane3Points> }) {

    const { expressions } = useContext(ExpressionsContext)


    const [id, setId] = useState(expression.id)
    const [point1Id, setPoint1Id] = useState(expression.params.point1)
    const [point2Id, setPoint2Id] = useState(expression.params.point2)
    const [point3Id, setPoint3Id] = useState(expression.params.point3)

    const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
        setId(e.target.value)

    }

    const handlePoint1Change = (e: ChangeEvent<HTMLInputElement>) => {
        setPoint1Id(e.target.value)
        let parsedPoint = expressions.find(exp => (exp.id == e.target.value))

        if (parsedPoint?.value instanceof DiedricPoint) {
            expression.value.point1 = parsedPoint.value as DiedricPoint | undefined
        } else {
            expression.value.point1 = undefined
        }
    }
    const handlePoint2Change = (e: ChangeEvent<HTMLInputElement>) => {
        setPoint2Id(e.target.value)
        let parsedPoint = expressions.find(exp => (exp.id == e.target.value))

        if (parsedPoint?.value instanceof DiedricPoint) {
            expression.value.point2 = parsedPoint.value as DiedricPoint | undefined
        } else {
            expression.value.point2 = undefined
        }
    }
    const handlePoint3Change = (e: ChangeEvent<HTMLInputElement>) => {
        setPoint3Id(e.target.value)
        let parsedPoint = expressions.find(exp => (exp.id == e.target.value))

        if (parsedPoint?.value instanceof DiedricPoint) {
            expression.value.point3 = parsedPoint.value as DiedricPoint | undefined
        } else {
            expression.value.point3 = undefined
        }
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
function Line2PointsExpression({ expression }: { expression: Expression<DiedricLine2Points> }) {

    const [id, setId] = useState(expression.id)
    const [point1Id, setPoin1Id] = useState(expression.params.point1)
    const [point2Id, setPoin2Id] = useState(expression.params.point2)

    const { expressions } = useContext(ExpressionsContext)

    const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
        setId(e.target.value)
    }

    const handlePoint1Change = (e: ChangeEvent<HTMLInputElement>) => {
        setPoin1Id(e.target.value)
        let parsedPoint = expressions.find(exp => (exp.id == e.target.value))

        if (parsedPoint?.value instanceof DiedricPoint) {
            expression.value.point1 = parsedPoint.value as DiedricPoint | undefined
        } else {
            expression.value.point1 = undefined
        }
    }
    const handlePoint2Change = (e: ChangeEvent<HTMLInputElement>) => {
        setPoin2Id(e.target.value)

        let parsedPoint = expressions.find(exp => (exp.id == e.target.value))

        if (parsedPoint?.value instanceof DiedricPoint) {
            expression.value.point2 = parsedPoint.value as DiedricPoint | undefined
        } else {
            expression.value.point2 = undefined
        }
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

function Expression({ children, expression }: { children: ReactNode, expression: Expression<PosibleExpressions> }) {
    const { expressions, setExpressions } = useContext(ExpressionsContext)


    const removeExpression = () => {

        expression.value.remove()
        let index = expressions.indexOf(expression)
        console.log(index)
        let newExpressions = [...expressions]
        newExpressions.splice(index, 1)
        console.log(newExpressions)
        setExpressions(newExpressions)
    }

    return (
        <div className="w-full border border-neutral-400 text-black rounded grid grid-cols-[40px_1fr_20px] items-center min-h-12 pr-2">
            <div className=" bg-zinc-800/50 rounded-tl rounded-bl h-full">
                <div className="bg-red-300 h-8 w-8 rounded-full relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: expression.value.color.toString() }}></div>
            </div>
            <div className="relative w-full p-2 min-w-0">
                {children}
            </div>
            <div className="h-5 w-5 bg-red-500" onClick={removeExpression}>

            </div>
        </div>
    )
}

export default function App({ canvasRef }: { canvasRef: RefObject<HTMLCanvasElement> }) {

    const [diedric, setDiedric] = useState<Diedric>()
    const [expressions, setExpressions] = useState<Expression<PosibleExpressions | null>[]>([])

    const savedExpressions: Expression<PosibleExpressions | null>[] = [
        {
            id: "r_1",
            type: "point",
            value: null,
            hidden: false,
            params: {
                o: 60,
                a: 30,
                c: 45,
                color: "red",
            },
        },
        {
            id: "r_2",
            type: "point",
            value: null,
            hidden: false,
            params: {
                o: -60,
                a: -12,
                c: 50,
                color: "blue",
            }
        },
        {
            id: "beta_p",
            type: "point",
            value: null,
            hidden: false,
            params: {
                o: 50,
                a: -60,
                c: 87,
                color: "yellow",
            }
        },
        {
            id: "alpha_1",
            type: "point",
            value: null,
            hidden: false,
            params: {
                o: -43,
                a: 0,
                c: 0,
                color: "black",
            }
        },
        {
            id: "alpha_2",
            type: "point",
            value: null,
            hidden: false,
            params: {
                o: 0,
                a: 0,
                c: 50,
                color: "black",
            }
        },
        {
            id: "alpha_3",
            type: "point",
            value: null,
            hidden: false,
            params: {
                o: 0,
                a: 0,
                c: 0,
                color: "black",
            }
        },
        {
            id: "beta_r",
            type: "line-2-pto",
            value: null,
            hidden: false,
            params: {
                point1: "r_1",
                point2: "r_2",
                color: "green",
            }
        },
        {
            id: "alpha",
            type: "plane-3-pto",
            value: null,
            hidden: false,
            params: {
                point1: "alpha_1",
                point2: "alpha_2",
                point3: "alpha_3",
                color: "gray",
            },
        },
        // {
        //     id: "beta",
        //     type: "plane-pto-line",
        //     value: null,
        //     hidden: false,
        //     params: {
        //         point: "beta_p",
        //         line: "beta_r",
        //         color: "tomato",
        //     }
        // }
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

        console.log("getting saved expressions")

        let newExpressions: Expression<PosibleExpressions | null>[] = []
        savedExpressions.map((savedExpression) => {
            let value

            const parsedParams: any = {}

            Object.keys(savedExpression.params).map(param => {
                const value = savedExpression.params[param]
                if (param == "color") {
                    parsedParams.color = value
                } else if (typeof value == "number") {
                    parsedParams[param] = value
                } else if (typeof value == "string") {
                    let parsed = newExpressions.find((expression) => expression.id == value)
                    parsedParams[param] = parsed?.value
                }
            })


            if (savedExpression.type == "point") {
                value = diedric.createPoint(parsedParams)
            } else if (savedExpression.type == "line-2-pto") {
                value = diedric.createLine2Points(parsedParams)
            } else if (savedExpression.type == "plane-3-pto") {
                value = diedric.createPlane3Points(parsedParams)
            } else {
                // console.warn(savedExpression.type, "Not implemented")
                value = diedric.createPlanePointLine(parsedParams)
            }

            if (!value) return

            value.hidden = savedExpression.hidden

            newExpressions.push({
                id: savedExpression.id,
                type: savedExpression.type,
                value: value,
                params: savedExpression.params,
                hidden: savedExpression.hidden
            })
        })
        setExpressions(newExpressions)

    }, [diedric])

    const renderExpression = (expression: Expression<PosibleExpressions>, index: number) => {
        if (expression.type == "point") {
            return <PointExpresssion key={index} expression={expression as Expression<DiedricPoint>} />
        } else if (expression.type == "plane-3-pto") {
            return <Plane3PointsExpression key={index} expression={expression as Expression<DiedricPlane3Points>} />
        } else if (expression.type == "line-2-pto") {
            return <Line2PointsExpression key={index} expression={expression as Expression<DiedricLine2Points>} />
        }
    }

    return (
        <div className="h-full overflow-y-auto p-1">
            <div className="flex flex-col items-center gap-2">
                <ExpressionsContext.Provider value={{ expressions, setExpressions }}>
                    {expressions.map(((expression, index) => (
                        <Expression key={expression.id} expression={expression as Expression<PosibleExpressions>}>
                            {renderExpression(expression as Expression<PosibleExpressions>, index)}
                        </Expression>
                    )))}
                </ExpressionsContext.Provider>
                <div className="h-16 w-16 border rounded border-neutral-400 hover:bg-green-400">

                </div>
            </div>
        </div>
    )
}