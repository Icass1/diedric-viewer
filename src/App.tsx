import { ChangeEvent, createContext, ReactNode, RefObject, useCallback, useContext, useEffect, useRef, useState } from "react"
import { Trash2, Plus, Save } from 'lucide-react';

import { Diedric } from "./utils/diedric"

import { DiedricPoint } from "./utils/diedricPoint";

import { DiedricLine } from "./utils/diedricLine";
import { DiedricLine2Point } from "./utils/diedricLine2Point";
import { DiedricLinePointParallelLine } from "./utils/diedricLinePointParallelLine";
import { DiedricLine2Plane } from "./utils/diedricLine2Plane";

import { DiedricPlane, } from "./utils/diedricPlane";
import { DiedricPlane3Point } from "./utils/diedricPlane3Point";
import { DiedricPlanePointLine } from "./utils/diedricPlanePointLine";
import { DiedricPlane2Line } from "./utils/diedricPlane2Line";

type PosibleExpressions = DiedricLine2Point | DiedricPlane3Point | DiedricPoint | DiedricPlanePointLine | DiedricLinePointParallelLine | DiedricPlane2Line | DiedricLine2Plane
interface Expression<DiedricObject> {
    id: string
    type: "point" | "line-2-pto" | "plane-3-pto" | "plane-pto-line" | "line-pto-parallel-line" | "plane-2-line" | "line-2-plane"
    value: DiedricObject
    params: any
    hidden: boolean
}

interface ExpressionsContextInterface {
    expressions: Expression<PosibleExpressions | null>[]
    setExpressions: React.Dispatch<React.SetStateAction<Expression<PosibleExpressions | null>[]>>
}

const ExpressionsContext = createContext<ExpressionsContextInterface>({ expressions: [], setExpressions: () => { } })

function TextInput({
    defaultValue,
    className,
    onChange,
    value,
    type,
}: {
    defaultValue?: string | number | readonly string[] | undefined,
    className?: string | undefined,
    onChange?: React.ChangeEventHandler<HTMLInputElement> | undefined,
    value?: string | number | readonly string[] | undefined
    type?: React.HTMLInputTypeAttribute | undefined
}) {

    const inputRef = useRef<HTMLInputElement>(null)

    const adjustWidth = () => {

        if (!inputRef.current) return

        const span = document.createElement('span');
        span.style.visibility = 'hidden';
        span.style.whiteSpace = 'pre';
        span.style.font = window.getComputedStyle(inputRef.current).font;
        span.textContent = inputRef.current.value || inputRef.current.placeholder;

        document.body.appendChild(span);

        // Set the input width to match the span width
        if (span.offsetWidth == 0) {
            inputRef.current.style.border = "2px gray dashed"
            inputRef.current.style.borderRadius = "5px"
        } else {
            inputRef.current.style.border = ""
            inputRef.current.style.borderRadius = ""
        }
        if (type == "number") {

            inputRef.current.style.width = Math.max(span.offsetWidth + 20, 30) + "px";
        } else {
            inputRef.current.style.width = Math.max(span.offsetWidth, 10) + 'px';
        }

        // Remove the temporary span
        document.body.removeChild(span);
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange && onChange(event)

        adjustWidth()
    }

    useEffect(adjustWidth, [inputRef])

    return (
        <input ref={inputRef} type={type} className={className} value={value === undefined ? defaultValue : value} onChange={handleChange} />
    )
}

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
            <label className="font-semibold">Point OAC</label>
            <div className="flex flex-row border-b border-neutral-300 gap-1">
                <TextInput defaultValue={expression.id} className="bg-transparent focus:outline-none w-16" />
                <label className=" w-full min-w-0"> = (O, A, C)</label>
            </div>
            <div className="flex flex-row justify-between gap-4">
                <div className="flex flex-row min-w-0 gap-2">
                    <label className="">O:</label>
                    <TextInput type="number" className="bg-transparent border-b border-neutral-300 focus:outline-none min-w-0" value={o} onChange={handleOChange} />
                </div>
                <div className="flex flex-row min-w-0 gap-2">
                    <label>A:</label>
                    <TextInput type="number" className="bg-transparent border-b border-neutral-300 focus:outline-none min-w-0" value={a} onChange={handleAChange} />
                </div>
                <div className="flex flex-row min-w-0 gap-2">
                    <label>C:</label>
                    <TextInput type="number" className="bg-transparent border-b border-neutral-300 focus:outline-none min-w-0" value={c} onChange={handleCChange} />
                </div>
            </div>
        </>
    )
}
function Plane3PointsExpression({ expression }: { expression: Expression<DiedricPlane3Point> }) {

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
            <label className="font-semibold">Plane 3 points</label>
            <div className="flex flex-row gap-1 border-b border-neutral-300">
                <TextInput value={id} onChange={handleIdChange} className="bg-transparent  focus:outline-none w-10 text-center" />
                <label className=" w-fit"> = (</label>
                <TextInput value={point1Id} onChange={handlePoint1Change} className="bg-transparent  focus:outline-none w-10 text-center" />
                <label className=" w-fit">, </label>
                <TextInput value={point2Id} onChange={handlePoint2Change} className="bg-transparent  focus:outline-none w-10 text-center" />
                <label className=" w-fit ">, </label>
                <TextInput value={point3Id} onChange={handlePoint3Change} className="bg-transparent  focus:outline-none w-10 text-center" />
                <label className=" w-fit ">)</label>
            </div>
        </>
    )
}
function Line2PointsExpression({ expression }: { expression: Expression<DiedricLine2Point> }) {

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
            <label className="font-semibold">Line 2 points</label>
            <div className="flex flex-row gap-1 border-b border-neutral-300">
                <TextInput value={id} onChange={handleIdChange} className="bg-transparent  focus:outline-none w-10" />
                <label className=" w-fit"> = (</label>
                <TextInput value={point1Id} onChange={handlePoint1Change} className="bg-transparent focus:outline-none w-10" />
                <label className=" w-fit">, </label>
                <TextInput value={point2Id} onChange={handlePoint2Change} className="bg-transparent focus:outline-none w-10" />
                <label className=" w-fit ">)</label>
            </div>
        </>
    )
}
function LinePointParallelLineExpression({ expression }: { expression: Expression<DiedricLinePointParallelLine> }) {

    const [id, setId] = useState(expression.id)
    const [lineId, setLineId] = useState(expression.params.line)
    const [pointId, setPointId] = useState(expression.params.point)

    const { expressions } = useContext(ExpressionsContext)

    const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
        setId(e.target.value)
    }

    const handleLineChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLineId(e.target.value)

        let parsedPoint = expressions.find(exp => (exp.id == e.target.value))

        if (parsedPoint?.value instanceof DiedricLine) {
            expression.value.line = parsedPoint.value as DiedricLine | undefined
        } else {
            expression.value.line = undefined
        }
    }
    const handlePointChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPointId(e.target.value)

        let parsedPoint = expressions.find(exp => (exp.id == e.target.value))

        if (parsedPoint?.value instanceof DiedricPoint) {
            expression.value.point = parsedPoint.value as DiedricPoint | undefined
        } else {
            expression.value.point = undefined
        }

    }
    return (
        <>
            <label className="font-semibold truncate min-w-0 max-w-full block" title="Line parallel to another one passing through a point">Line parallel to another one passing through a point</label>
            <div className="flex flex-row gap-1 border-b border-neutral-300">
                <TextInput value={id} onChange={handleIdChange} className="bg-transparent  focus:outline-none w-10" />
                <label className=" w-fit"> = (</label>
                <TextInput value={lineId} onChange={handleLineChange} className="bg-transparent focus:outline-none w-10" />
                <label className=" w-fit">, </label>
                <TextInput value={pointId} onChange={handlePointChange} className="bg-transparent focus:outline-none w-10" />
                <label className=" w-fit ">)</label>
            </div>
        </>
    )

}

function Plane2LineExpression({ expression }: { expression: Expression<DiedricPlane2Line> }) {

    const [id, setId] = useState(expression.id)
    const [line1Id, setLine1Id] = useState(expression.params.line1)
    const [line2Id, setLine2Id] = useState(expression.params.line2)

    const { expressions } = useContext(ExpressionsContext)

    const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
        setId(e.target.value)
    }

    const handleLine1Change = (e: ChangeEvent<HTMLInputElement>) => {
        setLine1Id(e.target.value)

        let parsedPoint = expressions.find(exp => (exp.id == e.target.value))

        if (parsedPoint?.value instanceof DiedricLine) {
            expression.value.line1 = parsedPoint.value as DiedricLine | undefined
        } else {
            expression.value.line1 = undefined
        }
    }
    const handleLine2Change = (e: ChangeEvent<HTMLInputElement>) => {
        setLine2Id(e.target.value)

        let parsedPoint = expressions.find(exp => (exp.id == e.target.value))

        if (parsedPoint?.value instanceof DiedricLine) {
            expression.value.line2 = parsedPoint.value as DiedricLine | undefined
        } else {
            expression.value.line2 = undefined
        }
    }

    return (
        <>
            <label className="font-semibold truncate min-w-0 max-w-full block" title="Plane 2 lines">Plane 2 lines</label>
            <div className="flex flex-row gap-1 border-b border-neutral-300">
                <TextInput value={id} onChange={handleIdChange} className="bg-transparent  focus:outline-none w-10" />
                <label className=" w-fit"> = (</label>
                <TextInput value={line1Id} onChange={handleLine1Change} className="bg-transparent focus:outline-none w-10" />
                <label className=" w-fit">, </label>
                <TextInput value={line2Id} onChange={handleLine2Change} className="bg-transparent focus:outline-none w-10" />
                <label className=" w-fit ">)</label>
            </div>
        </>
    )

}

function Line2PlaneExpression({ expression }: { expression: Expression<DiedricLine2Plane> }) {
    const [id, setId] = useState(expression.id)

    const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
        setId(e.target.value)
    }

    const [params, setParams] = useState(expression.params)
    const { expressions } = useContext(ExpressionsContext)

    const onParamChange = (paramKey: string, e: ChangeEvent<HTMLInputElement>) => {
        let newParams = { ...params }
        newParams[paramKey] = e.target.value

        setParams(newParams)

        let parsedObject = expressions.find(exp => (exp.id == e.target.value))

        if (parsedObject?.value instanceof DiedricPlane) {
            expression.value[paramKey] = parsedObject.value as DiedricPlane | undefined
        } else {
            expression.value[paramKey] = undefined
        }
    }

    return (
        <>
            <label className="font-semibold">Line 2 planes</label>
            <div className="flex flex-row gap-1 border-b border-neutral-300">
                <TextInput value={id} onChange={handleIdChange} className="bg-transparent  focus:outline-none w-10" />
                <label className=" w-fit"> = (</label>
                <TextInput value={params.plane1} onChange={(e) => { onParamChange("plane1", e) }} className="bg-transparent focus:outline-none w-10" />
                <label className=" w-fit">, </label>
                <TextInput value={params.plane2} onChange={(e) => { onParamChange("plane2", e) }} className="bg-transparent focus:outline-none w-10" />
                <label className=" w-fit ">)</label>
            </div>
        </>
    )
}

function Expression({ children, expression }: { children: ReactNode, expression: Expression<PosibleExpressions> }) {
    const { expressions, setExpressions } = useContext(ExpressionsContext)

    const removeExpression = () => {

        expression.value.remove()
        let index = expressions.indexOf(expression)
        let newExpressions = [...expressions]
        newExpressions.splice(index, 1)
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
            <Trash2 className="h-5 w-5 text-red-500 cursor-pointer hover:scale-105" onClick={removeExpression} />
            {/* <div className="h-5 w-5 bg-red-500" onClick={removeExpression}> */}

            {/* </div> */}
        </div>
    )
}

export default function App({ canvasRef }: { canvasRef: RefObject<HTMLCanvasElement> }) {

    const [diedric, setDiedric] = useState<Diedric>()
    const [expressions, setExpressions] = useState<Expression<PosibleExpressions | null>[]>([])

    const savedExpressions: Expression<PosibleExpressions | null>[] = [
        {
            id: "A",
            type: "point",
            value: null,
            hidden: false,
            params: {
                o: 0,
                a: 55,
                c: 55,
                color: "aquamarine",
            },
        },
        {
            id: "B",
            type: "point",
            value: null,
            hidden: false,
            params: {
                o: 55,
                a: 0,
                c: 0,
                color: "aquamarine",
            }
        },
        {
            id: "r",
            type: "line-2-pto",
            value: null,
            hidden: false,
            params: {
                point1: "A",
                point2: "B",
                color: "aquamarine",
            }
        },
        {
            id: "C",
            type: "point",
            value: null,
            hidden: false,
            params: {
                o: 25,
                a: 50,
                c: 0,
                color: "brown",
            },
        },
        {
            id: "D",
            type: "point",
            value: null,
            hidden: false,
            params: {
                o: -25,
                a: 0,
                c: 50,
                color: "brown",
            }
        },
        {
            id: "s",
            type: "line-2-pto",
            value: null,
            hidden: false,
            params: {
                point1: "C",
                point2: "D",
                color: "brown",
            }
        },
        {
            id: "E",
            type: "point",
            value: null,
            hidden: false,
            params: {
                o: 0,
                a: 90,
                c: 90,
                color: "darkseagreen",
            },
        },
        {
            id: "F",
            type: "point",
            value: null,
            hidden: false,
            params: {
                o: -50,
                a: 90,
                c: 40,
                color: "darkseagreen",
            }
        },
        {
            id: "t",
            type: "line-2-pto",
            value: null,
            hidden: false,
            params: {
                point1: "E",
                point2: "F",
                color: "darkseagreen",
            }
        },
        {
            id: "u",
            type: "line-pto-parallel-line",
            value: null,
            hidden: false,
            params: {
                point: "A",
                line: "t",
                color: "salmon",
            }
        },
        {
            id: "j",
            type: "line-pto-parallel-line",
            value: null,
            hidden: false,
            params: {
                point: "D",
                line: "t",
                color: "salmon",
            }
        },
        {
            id: "alpha",
            type: "plane-2-line",
            value: null,
            hidden: false,
            params: {
                line1: "j",
                line2: "s",
                color: "salmon",
            }
        },
        {
            id: "beta",
            type: "plane-2-line",
            value: null,
            hidden: false,
            params: {
                line1: "u",
                line2: "r",
                color: "tomato",
            }
        },
        {
            id: "sol",
            type: "line-2-plane",
            value: null,
            hidden: false,
            params: {
                plane1: "alpha",
                plane2: "beta",
                color: "orange",
            }
        },
    ]
    useEffect(() => {
        if (!canvasRef.current) return
        const newDiedric = new Diedric(200, canvasRef.current)

        setDiedric(newDiedric)
    }, [canvasRef])

    // useEffect(() => {
    //     if (!diedric) { return }

    //     diedric.createStaticLabel("x", new THREE.Vector3(100, 0, 0));
    //     diedric.createStaticLabel("y", new THREE.Vector3(0, 100, 0));
    //     diedric.createStaticLabel("z", new THREE.Vector3(0, 0, 100));
    // }, [diedric])

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
                value = diedric.createLine2Point(parsedParams)
            } else if (savedExpression.type == "plane-3-pto") {
                value = diedric.createPlane3Point(parsedParams)
            } else if (savedExpression.type == "plane-pto-line") {
                value = diedric.createPlanePointLine(parsedParams)
            } else if (savedExpression.type == "line-pto-parallel-line") {
                value = diedric.createLinePointParallelLine(parsedParams)
            } else if (savedExpression.type == "plane-2-line") {
                value = diedric.createPlane2Line(parsedParams)
            } else if (savedExpression.type == "line-2-plane") {
                value = diedric.createLine2Plane(parsedParams)
            } else {
                console.warn("Type not known", savedExpression.type)
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
            return <Plane3PointsExpression key={index} expression={expression as Expression<DiedricPlane3Point>} />
        } else if (expression.type == "line-2-pto") {
            return <Line2PointsExpression key={index} expression={expression as Expression<DiedricLine2Point>} />
        } else if (expression.type == "line-2-plane") {
            return <Line2PlaneExpression key={index} expression={expression as Expression<DiedricLine2Plane>} />
        } else if (expression.type == "line-pto-parallel-line") {
            return <LinePointParallelLineExpression key={index} expression={expression as Expression<DiedricLinePointParallelLine>} />
        } else if (expression.type == "plane-2-line") {
            return <Plane2LineExpression key={index} expression={expression as Expression<DiedricPlane2Line>} />
        } else {
            console.warn("Type not known", expression.type)
        }
    }

    const saveExpressions = useCallback(() => {



    }, [expressions])


    return (

        <div className="h-full overflow-y-auto p-1 relative">
            <div className="flex flex-col items-center gap-2">
                <ExpressionsContext.Provider value={{ expressions, setExpressions }}>
                    {expressions.map(((expression, index) => (
                        <Expression key={expression.id} expression={expression as Expression<PosibleExpressions>}>
                            {renderExpression(expression as Expression<PosibleExpressions>, index)}
                        </Expression>
                    )))}
                </ExpressionsContext.Provider>
            </div>
            <div className="h-10" />
            <div className="sticky backdrop-blur-sm bottom-2 mx-2 flex flex-row p-2 gap-2">
                <Save className="text-zinc-800 w-8 h-8 hover:scale-110" onClick={saveExpressions} />
                <Plus className="text-zinc-800 w-8 h-8 hover:scale-110"></Plus>
            </div>
        </div>
    )
}