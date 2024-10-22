import { ChangeEvent, createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { Trash2, Plus, Save, TriangleAlert, RotateCw, ChevronRight, EyeOff, Eye } from 'lucide-react';

import * as THREE from 'three';

import { Diedric } from "./utils/diedric"

import { DiedricLine2Point } from "./utils/diedricLine2Point";
import { DiedricLinePointParallelLine } from "./utils/diedricLinePointParallelLine";
import { DiedricLine2Plane } from "./utils/diedricLine2Plane";
import { DiedricLinePointPerpendicularPlane } from "./utils/diedricLinePointPerpendicularPlane";

import { DiedricPlane3Point } from "./utils/diedricPlane3Point";
import { DiedricPlanePointLine } from "./utils/diedricPlanePointLine";
import { DiedricPlane2Line } from "./utils/diedricPlane2Line";
import { DiedricPlaneOAC } from "./utils/diedricPlaneOAC";
import { DiedricPlanePointPerpendicularLine } from "./utils/diedricPlanePointPerpendicularLine";

import { DiedricPoint } from "./utils/diedricPoint";
import { DiedricPointMidLinePoint } from "./utils/diedricPointMidLinePoint";
import { DiedricPointIntersectLinePlane } from "./utils/diedricPointIntersectLinePlane";
import { DiedricPointMid2Point } from "./utils/diedricPointMid2Point";

import { DiedricCircle3Point } from "./utils/diedricCircle3Point";

import { Unfold } from "./utils/unfold";
import { DiedricLinePointPlaneLineAngle } from "./utils/diedricLinePointPlaneLineAngle";
import { DiedricPoint2Line } from "./utils/diedricPoint2Line";



// let path = "./utils/unfold"
// const a = await import(path)
// console.log(a)


type PosibleExpressions = DiedricLine2Point | DiedricPlane3Point | DiedricPoint | DiedricPlanePointLine | DiedricLinePointParallelLine | DiedricPlane2Line | DiedricLine2Plane

const DiedricObjects = [
    DiedricPoint,
    DiedricPointMidLinePoint,
    DiedricPointIntersectLinePlane,
    DiedricPointMid2Point,
    DiedricPoint2Line,

    DiedricLine2Point,
    DiedricLine2Plane,
    DiedricLinePointParallelLine,
    DiedricLinePointPerpendicularPlane,
    DiedricLinePointPlaneLineAngle,

    DiedricPlanePointLine,
    DiedricPlane3Point,
    DiedricPlane2Line,
    DiedricPlaneOAC,
    DiedricPlanePointPerpendicularLine,

    DiedricCircle3Point,

    Unfold
]

interface Expression {
    id: string
    expressionText: string
    expressionName: string | null
    value: PosibleExpressions | null
    option: string | null
    dependencies: string[]
    params: {
        hidden: boolean
        color: string
    }
}

interface ExpressionsContextInterface {
    expressions: Expression[]
    setExpressions: React.Dispatch<React.SetStateAction<Expression[]>>
    diedric: Diedric | undefined
    setDiedric: React.Dispatch<React.SetStateAction<Diedric | undefined>>
}

const ExpressionsContext = createContext<ExpressionsContextInterface>({ expressions: [], setExpressions: () => { }, diedric: undefined, setDiedric: () => { } })

const colors = [
    '#c74440',
    '#2d70b3',
    '#388c46',
    '#6042a6',
    '#fa7e19',
    '#000000',
]

function createId(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function Expression({ expression }: { expression: Expression }) {
    const { expressions, setExpressions, diedric } = useContext(ExpressionsContext)
    const [value, setValue] = useState(expression.expressionText)
    const [warn, setWarn] = useState(false)

    const expressionObjects = useRef<any>({})
    const [options, setOptions] = useState<string[]>([])

    const [hidden, setHidden] = useState<boolean>(false)
    const [numericValue, setNumericValue] = useState<number | undefined>(undefined)

    const removeExpression = () => {
        expression.value?.remove()
        const expressionsCopy = [...expressions]
        delete expressionsCopy[expressions.indexOf(expression)]
        setExpressions(expressionsCopy.filter(expressionsCopy => expressionsCopy))
    }

    const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        parseText(e.target.value)
    }
    const toggleHidden = () => {
        if (hidden) {
            Object.values(expressionObjects.current).map(expression => { (expression as PosibleExpressions).hidden = false })
            setHidden(false)
            expression.params.hidden = false
        } else {
            Object.values(expressionObjects.current).map(expression => { (expression as PosibleExpressions).hidden = true })
            expression.params.hidden = true
            setHidden(true)
        }
        setExpressions([...expressions])

    }

    const parseText = (inputText: string) => {
        expression.expressionText = inputText

        let parsingError = false

        const text = inputText.replace(/ /g, '')
        setValue(inputText)

        if (text.startsWith("distance")) {
            const args = text.replace("distance(", "").replace(")", "").split(",")

            const object1 = expressions.find(expression => expression.expressionName == args[0])?.value
            const object2 = expressions.find(expression => expression.expressionName == args[1])?.value

            if (object1 && object2) {
                setWarn(false)
                if (object1 instanceof DiedricPoint && object2 instanceof DiedricPoint) {
                    if (object1.o !== undefined && object1.a !== undefined && object1.c !== undefined && object2.o !== undefined && object2.a !== undefined && object2.c !== undefined) {
                        setNumericValue(Math.sqrt((object1.o - object2.o) ** 2 + (object1.a - object2.a) ** 2 + (object1.c - object2.c) ** 2))
                    }
                }
            } else {
                setWarn(true)
                setNumericValue(undefined)
            }
            return
        }

        if (!text.includes("=")) {
            console.log("error 1")

            Object.entries(expressionObjects.current).map((entry) => {
                let value = entry[1] as PosibleExpressions
                delete expressionObjects.current[entry[0]]
                value.remove()
            })

            setWarn(true)
            return
        }

        let expressionName = text.split("=")[0]
        let expressionText = text.split("=")[1]
        expression.expressionName = expressionName

        if (!expressionName || !expressionText || !expressionText.startsWith("(") || !expressionText.endsWith(")")) {
            console.log("error 2")

            Object.entries(expressionObjects.current).map(entry => {
                let value = entry[1] as PosibleExpressions
                delete expressionObjects.current[entry[0]]
                value.remove()
            })

            setWarn(true)
            return
        }

        const parseParams = (paramsText: string, index: number = 0, n: number = 0) => {

            let output: any[] = []
            let lastOpenBracketIndex: number | undefined
            let bracketCount = 0
            let outputIndex = 0

            let expressionObjectsIndex = 0
            let expressionObjectsId = `${n}-${index}`

            let posibleOptions: string[] = []

            paramsText.split("").map((char, index) => {
                if (lastOpenBracketIndex === undefined && char == "(") {
                    lastOpenBracketIndex = index
                }
                if (char == "(") {
                    bracketCount++
                    return
                } else if (char == ")") {
                    bracketCount--
                }

                if (char == ")" && bracketCount == 0 && lastOpenBracketIndex !== undefined) {
                    output.push(parseParams(paramsText.slice(lastOpenBracketIndex + 1, index), expressionObjectsIndex, n + 1))
                    expressionObjectsIndex++
                    lastOpenBracketIndex = undefined
                } else if (lastOpenBracketIndex === undefined && bracketCount == 0) {
                    if (char == ",") {
                        outputIndex++
                    } else if (output[outputIndex] == undefined) {
                        output.push(char)
                        if (!Number.isNaN(Number(output[outputIndex]))) {
                            output[outputIndex] = Number(output[outputIndex])
                        }
                    } else {
                        output[outputIndex] += char

                        if (!Number.isNaN(Number(output[outputIndex]))) {
                            output[outputIndex] = Number(output[outputIndex])
                        }
                    }
                }
            })
            if (bracketCount !== 0 || lastOpenBracketIndex !== undefined) {
                parsingError = true
            }

            const diedricObjectParams: any = {}

            DiedricObjects.map(DiedricObject => {
                diedricObjectParams[DiedricObject.type] = { ...DiedricObject.params }
            })

            let finalParams: any = {}

            if (output.indexOf(undefined) !== -1) {
                expressionObjects.current[expressionObjectsId]?.remove()
                delete expressionObjects.current[expressionObjectsId]
                parsingError = true
                return
            }

            let dependencies: string[] = []

            output.map((paramValue, index) => {
                if (typeof paramValue == "string") {
                    if (paramValue == "1PB") {
                        output[index] = diedric?.pb1
                    } else if (paramValue == "2PB") {
                        output[index] = diedric?.pb2
                    } else {
                        dependencies.push(paramValue)
                        const exp = expressions.find(expression => expression.expressionName == paramValue)
                        output[index] = exp?.value
                    }
                }
            })

            // console.log(dependencies)

            for (let i = 0; i < dependencies.length; i++) {
                // console.log(dependencies[i])
                expression.dependencies[i] = dependencies[i];
            }
            // expression.dependencies[0] = "ASDF"
            expression.dependencies = [...dependencies]
            // console.log(expression.dependencies)
            // expression.dependencies = ["asdf"]


            output.map(paramValue => {
                if (typeof paramValue == "number") {
                    Object.keys(diedricObjectParams).map(diedricObjectType => {

                        let paramKey;
                        Object.entries(diedricObjectParams[diedricObjectType]).find((entry, _index) => {
                            if (entry[1] == "number") {
                                paramKey = entry[0]
                                return true
                            }
                            return false
                        })

                        if (paramKey == undefined) {
                            delete diedricObjectParams[diedricObjectType]
                        } else {
                            delete diedricObjectParams[diedricObjectType][paramKey]
                            if (!finalParams[diedricObjectType]) {
                                finalParams[diedricObjectType] = {}
                            }

                            finalParams[diedricObjectType][paramKey] = paramValue
                        }
                    })
                } else if (typeof paramValue == "string") {
                    console.warn("ASDF", paramValue)
                } else {
                    Object.keys(diedricObjectParams).map(diedricObjectType => {
                        let paramKey;
                        Object.entries(diedricObjectParams[diedricObjectType]).find((entry, _index) => {
                            if (entry[1] == "number") { return false }
                            // @ts-ignore
                            if (paramValue instanceof entry[1]) {
                                paramKey = entry[0]
                                return true
                            }
                            return false
                        })
                        if (paramKey == undefined) {
                            delete diedricObjectParams[diedricObjectType]
                        } else {
                            delete diedricObjectParams[diedricObjectType][paramKey]
                            if (!finalParams[diedricObjectType]) {
                                finalParams[diedricObjectType] = {}
                            }
                            finalParams[diedricObjectType][paramKey] = paramValue
                        }
                    })
                }
            })


            let matches = 0
            Object.entries(diedricObjectParams).map(diedricObjectParamsEntry => {
                let type = diedricObjectParamsEntry[0]
                let params: any = diedricObjectParamsEntry[1]

                if (Object.keys(params).length == 0) {
                    matches++
                    let diedricObject = DiedricObjects.find(DiedricObject => DiedricObject.type == type)
                    posibleOptions.push(diedricObject?.type || "error")
                    if (diedricObject == undefined) {
                        console.warn("This should never happen.")
                    } else if (expressionObjects.current[expressionObjectsId] instanceof diedricObject) {
                        if (
                            expressionObjects.current[expressionObjectsId] instanceof DiedricPoint
                        ) {
                            expressionObjects.current[expressionObjectsId].setAttributes(Object.assign(finalParams[type], { "color": expression.params.color }))
                        }
                    } else if (expressionObjects.current[expressionObjectsId] instanceof DiedricPlaneOAC) {
                        expressionObjects.current[expressionObjectsId].setAttributes(Object.assign(finalParams[type], { "color": expression.params.color }))

                    } else {
                        if (expressionObjects.current[expressionObjectsId]?.type !== expression.option) {
                            expressionObjects.current[expressionObjectsId]?.remove()
                        }

                        if (expression.option) {
                            if (expression.option == diedricObject.type) {
                                expressionObjects.current[expressionObjectsId] = new diedricObject(Object.assign(finalParams[type], { "diedric": diedric, "color": expression.params.color }))
                                expressionObjects.current[expressionObjectsId].update()
                                expression.option = diedricObject.type
                            }
                        } else {
                            expressionObjects.current[expressionObjectsId] = new diedricObject(Object.assign(finalParams[type], { "diedric": diedric, "color": expression.params.color }))
                            expressionObjects.current[expressionObjectsId].update()
                            expression.option = diedricObject.type
                        }
                    }
                }
            })

            if (expression.option && !posibleOptions.includes(expression.option)) {
                expression.option = null
            }
            setOptions(posibleOptions)

            if (!matches) {
                console.log("No matches")
                expressionObjects.current[expressionObjectsId]?.remove()
                delete expressionObjects.current[expressionObjectsId]
                parsingError = true
            }
            return expressionObjects.current[expressionObjectsId]
        }

        expression.value = parseParams(expressionText.slice(1, expressionText.length - 1))
        if (expression.value) {
            // @ts-ignore
            expression.value.name = expression.expressionName
        }

        setExpressions([...expressions])

        if (parsingError) {
            console.log("parsingError")
            setWarn(true)
            return
        }
        setWarn(false)
    }
    useEffect(() => {

        setHidden(expression.params.hidden)
        Object.values(expressionObjects.current).map(exp => { (exp as PosibleExpressions).hidden = expression.params.hidden })

        parseText(value)
    }, [])

    useEffect(() => {
        if (warn) {
            expression.value = null
            setExpressions([...expressions])
        } else {
        }
    }, [warn])

    return (
        <div className="w-full border border-neutral-300 text-black rounded grid grid-cols-[40px_1fr_20px] items-center min-h-12 pr-2">
            <div className=" bg-zinc-800/20 rounded-tl rounded-bl h-full">
                <div className="justify-center w-full h-full flex flex-col gap-2">
                    {warn ?
                        <TriangleAlert className="h-6 w-6 relative mx-auto text-neutral-900/40"></TriangleAlert>
                        :
                        <div
                            onClick={(e) => { (e.target as HTMLDivElement).querySelector("input")?.click() }}
                            className={"h-6 w-6 rounded-full relative mx-auto cursor-pointer " + (hidden && ' border-2 border-neutral-600')}
                            style={{ backgroundColor: hidden ? '' : expression?.params.color?.toString() }}>
                            <input className="w-0 h-0" type="color" value={expression?.params.color?.toString()} onChange={(e) => { expression.value ? expression.value.color = e.target.value : ''; expression.params.color = e.target.value }}></input>
                        </div>
                    }
                    {hidden ?
                        <Eye className="w-6 h-6 mx-auto text-neutral-500 cursor-pointer" onClick={toggleHidden} />
                        :
                        <EyeOff className="w-6 h-6 mx-auto text-neutral-500 cursor-pointer" onClick={toggleHidden} />
                    }
                    <RotateCw className="w-6 h-6 mx-auto text-neutral-500 cursor-pointer" onClick={() => { parseText(expression.expressionText); expression.value?.update() }}></RotateCw>
                </div>
            </div>
            <div className="relative w-full p-2 min-w-0 flex flex-col gap-1">
                {/* <TextInput value={value} onChange={handleValueChange} className="bg-transparent focus:outline-none border-b-2 w-full"></TextInput> */}
                <input value={value} onChange={handleValueChange} className="bg-transparent focus:outline-none border-b-2 w-full"></input>
                <label>{numericValue}</label>
                {options.map(option =>
                    <label
                        key={option}
                        className={" rounded px-2 py-1 shadow cursor-pointer hover:scale-[1.01] transition-all duration-100 font-semibold " + (option == expression.option ? ' bg-cyan-200 ' : "")}
                        onClick={() => { expression.option = option; parseText(value) }}
                    >
                        {option}
                    </label>
                )}
            </div>
            <Trash2 className="h-5 w-5 text-red-500 cursor-pointer hover:scale-105" onClick={removeExpression} />
        </div >
    )
}

export default function App() {

    const [diedric, setDiedric] = useState<Diedric>()
    const [expressions, setExpressions] = useState<Expression[]>([])

    const savedExpressionsIndex = 3;
    const savedExpressions = JSON.parse(localStorage.getItem("expressions") || "[]")[savedExpressionsIndex] as Expression[]

    const canvas3dRef = useRef<HTMLCanvasElement>(null)
    const canvas2dRef = useRef<HTMLCanvasElement>(null)

    // const [point, setPoint] = useState<DiedricPoint>()
    // const [plane, setPlane] = useState<DiedricPlane>()


    const [angle, setAngle] = useState<number>(0)



    useEffect(() => {
        if (!canvas3dRef.current || !canvas2dRef.current) return
        const newDiedric = new Diedric(100, canvas3dRef.current, canvas2dRef.current)

        newDiedric.createStaticLabel("x", new THREE.Vector3(newDiedric.size, 0, 0))
        newDiedric.createStaticLabel("y", new THREE.Vector3(0, newDiedric.size, 0))
        newDiedric.createStaticLabel("z", new THREE.Vector3(0, 0, newDiedric.size))



        // let point = new DiedricPoint({ diedric: newDiedric, o: 40, a: 60, c: 10, color: "red" })
        // point.calc()

        // let plane = new DiedricPlane(newDiedric, new THREE.Vector3(-20, 30, 60), 0, "red")
        // plane.calc()

        // setPoint(point)
        // setPlane(plane)





        setDiedric(newDiedric)

    }, [canvas3dRef, canvas2dRef])



    // useEffect(() => {
    //     if (
    //         point?.o != undefined &&
    //         point?.a != undefined &&
    //         point?.c != undefined &&
    //         plane?.normal?.x != undefined &&
    //         plane?.normal?.y != undefined &&
    //         plane?.normal?.z != undefined &&
    //         plane?.d != undefined
    //     ) {

    //         // Define the point you want to rotate.
    //         const _point = new THREE.Vector3(40, 60, 10); // Replace x, y, z with your point coordinates

    //         // Define a point on the line (A) and the line's direction (L).
    //         const linePoint = new THREE.Vector3(0, 0, 0); // Replace ax, ay, az with line point coordinates
    //         // const lineDirection = new THREE.Vector3().copy(plane.normal).normalize(); // Replace lx, ly, lz with line direction

    //         const lineDirection = new THREE.Vector3(0, 1, 0).cross(plane.normal).normalize()

    //         // Translate the point relative to the line point.
    //         const translatedPoint = _point.clone().sub(linePoint);

    //         // Define a target position with y = 0 in the same x-z plane as the translated point.
    //         const targetPoint = translatedPoint.clone();
    //         targetPoint.y = 0; // We want the rotated point to end up with y = 0.

    //         // Step 1: Translate point to the origin relative to the line.
    //         _point.sub(linePoint);

    //         // Step 2: Create a quaternion for rotation around the line direction.
    //         const quaternion = new THREE.Quaternion();
    //         quaternion.setFromAxisAngle(lineDirection, angle);
    //         console.log(quaternion, lineDirection, angle)
    //         let qw = Math.cos(angle / 2)
    //         let qx = lineDirection.x * Math.sin(angle / 2)
    //         let qy = lineDirection.y * Math.sin(angle / 2)
    //         let qz = lineDirection.z * Math.sin(angle / 2)
    //         console.log(qw, qx, qy, qz)

    //         // Step 3: Apply the rotation to the point.
    //         _point.applyQuaternion(quaternion);

    //         // Step 4: Translate the point back to the original position.
    //         _point.add(linePoint);
    //         point.o = _point.x
    //         point.c = _point.y
    //         point.a = _point.z
    //         point.calc()
    //     }
    // }, [point, plane, angle])





    useEffect(() => {
        if (!diedric || savedExpressions == undefined) { return }

        let newExpressions: Expression[] = []
        savedExpressions.map((savedExpression) => {
            if (savedExpression) {
                newExpressions.push({ ...savedExpression, dependencies: [] })
            } else {
                console.warn("null expression in savedExpressions")
            }
        })
        setExpressions(newExpressions)

    }, [diedric])

    const saveExpressions = useCallback(() => {

        let expressionsStored = JSON.parse(localStorage.getItem("expressions") || "[]")
        expressionsStored[savedExpressionsIndex] = expressions.map(expression => ({
            id: expression.id,
            expressionText: expression.expressionText,
            params: expression.params,
            option: expression.option,
        }))

        localStorage.setItem("expressions", JSON.stringify(expressionsStored))
    }, [expressions])

    const newExpression = () => {
        setExpressions([...expressions, {
            id: createId(8),
            expressionText: "",
            expressionName: null,
            value: null,
            option: null,
            dependencies: [],
            params: {
                hidden: false,
                color: colors[Math.round(Math.random() * (colors.length - 1))]
            }
        }])
    }

    return (
        <div className=" h-full w-full grid grid-cols-[400px_1fr_1fr] gap-2">
            <div className="bg-neutral-100 h-full w-full min-w-0 min-h-0">
                <div className="h-full overflow-y-auto p-1 relative">
                    <div className="flex flex-col items-center gap-2">
                        <ExpressionsContext.Provider value={{ expressions, setExpressions, diedric, setDiedric }}>
                            {expressions.map(((expression) => (
                                <Expression key={expression.id} expression={expression as Expression} />
                            )))}
                        </ExpressionsContext.Provider>
                    </div>
                    <div className="h-10" />
                    <div className="sticky backdrop-blur-sm bottom-2 mx-2 flex flex-row p-2 gap-2">
                        <Save className="text-zinc-800 w-8 h-8 hover:scale-110" onClick={saveExpressions} />
                        <Plus className="text-zinc-800 w-8 h-8 hover:scale-110" onClick={newExpression} />
                    </div>
                </div>
            </div>
            <div className="relative">
                <canvas ref={canvas3dRef} className="absolute top-0 w-full min-w-0 h-full min-h-0"></canvas>
            </div>
            <div className="relative">
                <canvas ref={canvas2dRef} className="absolute top-0 w-full min-w-0 h-full min-h-0"></canvas>
            </div>

            <div className="fixed left-[600px] top-10">
                <input type="range" min={0} max={2 * Math.PI} step={0.1} value={angle} onInput={(e) => { setAngle(e.target?.value || 0) }}></input>
                <label className="p-2 bg-black">{angle}</label>
            </div>

            <div style={{ background: "transparent", minWidth: '0px', width: '0px' }} id="object-info-panel" className="fixed bg-white shadow-lg p-1 transition-all max-h-[calc(100%_-_2.5rem)] min-w-52 text-black text-sm font-base rounded-lg top-5 right-5 flex flex-col gap-2">
                <ChevronRight
                    className="absolute -left-8 text-black w-8 h-8 transition-transform duration-500"
                    style={{ transform: "rotate(180deg)" }}
                    onClick={() => {
                        if ((document.querySelector("#object-info-panel") as HTMLDivElement).style.backgroundColor == "transparent") {
                            (document.querySelector("#object-info-panel") as HTMLDivElement).style.backgroundColor = "";
                            ((document.querySelector("#object-info-panel") as HTMLDivElement).querySelector("div") as HTMLDivElement).hidden = false;
                            (document.querySelector("#object-info-panel") as HTMLDivElement).style.width = "";
                            (document.querySelector("#object-info-panel") as HTMLDivElement).style.minWidth = "";
                            ((document.querySelector("#object-info-panel") as HTMLDivElement).querySelector("svg") as SVGSVGElement).style.transform = "";
                        } else {
                            (document.querySelector("#object-info-panel") as HTMLDivElement).style.backgroundColor = "transparent";
                            ((document.querySelector("#object-info-panel") as HTMLDivElement).querySelector("div") as HTMLDivElement).hidden = true;
                            (document.querySelector("#object-info-panel") as HTMLDivElement).style.width = "0px";
                            (document.querySelector("#object-info-panel") as HTMLDivElement).style.minWidth = "0px";
                            ((document.querySelector("#object-info-panel") as HTMLDivElement).querySelector("svg") as SVGSVGElement).style.transform = "rotate(180deg)";
                        }
                    }}
                />
                <div className="overflow-y-auto">

                    {expressions.map(expression =>
                        <div key={expression.id} className="flex flex-col border border-neutral-400 rounded p-1">

                            <label className="font-semibold">{expression.expressionName} </label>
                            <label className="text-sm font-base pl-3">Type: {expression.value?.type || "---"}</label>
                            <div className="pl-3 flex flex-row gap-2 items-center">
                                <label className="text-sm font-base ">Color: </label>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: expression.params.color }}></div>
                                <label className="text-sm font-base ">{expression.params.color}</label>
                            </div>
                            <label className="text-sm font-base pl-3">Hidden: {JSON.stringify(expression.params.hidden)}</label>
                            <label className="text-sm font-base pl-3">Depenedencies: {JSON.stringify(expression.dependencies)}</label>
                            <label className="font-semibold">Args</label>
                            {/* @ts-ignore */}
                            {expression?.value?.o !== undefined && <label className="pl-3">o {expression.value.o}</label>}
                            {/* @ts-ignore */}
                            {expression?.value?.a !== undefined && <label className="pl-3">a {expression.value.a}</label>}
                            {/* @ts-ignore */}
                            {expression?.value?.c !== undefined && <label className="pl-3">c {expression.value.c}</label>}
                            {/* @ts-ignore */}
                            {expression?.value?.point?.type && <label className="pl-3">point {expression.value.point?.type}</label>}
                            {/* @ts-ignore */}
                            {expression?.value?.point1?.type && <label className="pl-3">point1 {expression.value.point1?.type}</label>}
                            {/* @ts-ignore */}
                            {expression?.value?.point2?.type && <label className="pl-3">point2 {expression.value.point2?.type}</label>}
                            {/* @ts-ignore */}
                            {expression?.value?.point3?.type && <label className="pl-3">point3 {expression.value.point3?.type}</label>}
                            {/* @ts-ignore */}
                            {expression?.value?.line?.type && <label className="pl-3">line {expression.value.line?.type}</label>}
                            {/* @ts-ignore */}
                            {expression?.value?.line1?.type && <label className="pl-3">line1 {expression.value.line1?.type}</label>}
                            {/* @ts-ignore */}
                            {expression?.value?.line2?.type && <label className="pl-3">line2 {expression.value.line2?.type}</label>}

                            <div className="bg-white flex flex-col">
                                <label className="font-semibold">Children</label>
                                {expression.value?.children.map((child, index) => {
                                    const a = expressions.find(exp => exp.value == child)
                                    return (
                                        <div className="pl-3 flex flex-col" key={expression.id + index}>
                                            <label>{a?.expressionName} {child.type}</label>
                                        </div>)
                                })}
                            </div>
                        </div>
                    )}
                </div >
            </div>
        </div >


    )
}