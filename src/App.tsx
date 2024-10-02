import { ChangeEvent, createContext, RefObject, useCallback, useContext, useEffect, useRef, useState } from "react"
import { Trash2, Plus, Save, TriangleAlert } from 'lucide-react';

import { Diedric } from "./utils/diedric"

import { DiedricPoint } from "./utils/diedricPoint";

import { DiedricLine2Point } from "./utils/diedricLine2Point";
import { DiedricLinePointParallelLine } from "./utils/diedricLinePointParallelLine";
import { DiedricLine2Plane } from "./utils/diedricLine2Plane";

import { DiedricPlane3Point } from "./utils/diedricPlane3Point";
import { DiedricPlanePointLine } from "./utils/diedricPlanePointLine";
import { DiedricPlane2Line } from "./utils/diedricPlane2Line";
import { Vector3 } from "three";
import { DiedricPlaneOAC } from "./utils/diedricPlaneOAC";
import { DiedricPointMidLinePoint } from "./utils/diedricPointMidLinePoint";
import { DiedricLinePointPerpendicularPlane } from "./utils/diedricLinePointPerpendicularPlane";

type PosibleExpressions = DiedricLine2Point | DiedricPlane3Point | DiedricPoint | DiedricPlanePointLine | DiedricLinePointParallelLine | DiedricPlane2Line | DiedricLine2Plane

const DiedricObjects = [
    DiedricPoint,
    DiedricPointMidLinePoint,
    
    DiedricLine2Point,
    DiedricLine2Plane,
    DiedricLinePointParallelLine,
    DiedricLinePointPerpendicularPlane,

    DiedricPlanePointLine,
    DiedricPlane3Point,
    DiedricPlane2Line,
    DiedricPlaneOAC,
]

interface Expression {
    id: string
    expressionText: string
    expressionName: string | null
    value: PosibleExpressions | null
    option: string | null
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

    useEffect(adjustWidth, [inputRef, value])

    return (
        <input ref={inputRef} type={type} className={className} value={value === undefined ? defaultValue : value} onChange={handleChange} />
    )
}

function Expression({ expression }: { expression: Expression }) {
    const { expressions, setExpressions, diedric } = useContext(ExpressionsContext)
    const [value, setValue] = useState(expression.expressionText)
    const [warn, setWarn] = useState(false)

    const expressionObjects = useRef<any>({})

    const [options, setOptions] = useState<string[]>([])

    const removeExpression = () => {
        const expressionsCopy = [...expressions]
        delete expressionsCopy[expressions.indexOf(expression)]
        setExpressions(expressionsCopy.filter(expressionsCopy => expressionsCopy))
    }

    const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        parseText(e.target.value)
    }
    const parseText = (inputText: string) => {
        expression.expressionText = inputText

        let parsingError = false

        const text = inputText.replace(/ /g, '')
        setValue(inputText)
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

            output.map((paramValue, index) => {
                if (typeof paramValue == "string") {
                    if (paramValue == "1PB") {
                        output[index] = diedric?.pb1
                    } else if (paramValue == "2PB") {
                        output[index] = diedric?.pb2
                    } else {
                        const expression = expressions.find(expression => expression.expressionName == paramValue)
                        output[index] = expression?.value
                    }
                }
            })

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
                            expressionObjects.current[expressionObjectsId] instanceof DiedricPoint ||
                            expressionObjects.current[expressionObjectsId] instanceof DiedricPlaneOAC
                        ) {
                            expressionObjects.current[expressionObjectsId].setAttributes(Object.assign(finalParams[type], { "color": expression.params.color }))
                        }
                    } else {
                        if (expressionObjects.current[expressionObjectsId]?.type !== expression.option) {
                            expressionObjects.current[expressionObjectsId]?.remove()
                        }

                        if (expression.option) {
                            if (expression.option == diedricObject.type) {
                                expressionObjects.current[expressionObjectsId] = new diedricObject(Object.assign(finalParams[type], { "diedric": diedric, "color": expression.params.color }))
                                expression.option = diedricObject.type
                            }
                        } else {
                            expressionObjects.current[expressionObjectsId] = new diedricObject(Object.assign(finalParams[type], { "diedric": diedric, "color": expression.params.color }))
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
                expressionObjects.current[expressionObjectsId]?.remove()
                delete expressionObjects.current[expressionObjectsId]
                parsingError = true
            }
            return expressionObjects.current[expressionObjectsId]
        }

        expression.value = parseParams(expressionText.slice(1, expressionText.length - 1))

        if (parsingError) {
            setWarn(true)
            return
        }
        setWarn(false)
    }
    useEffect(() => {
        parseText(value)
    }, [])

    return (
        <div className="w-full border border-neutral-300 text-black rounded grid grid-cols-[40px_1fr_20px] items-center min-h-12 pr-2">
            <div className=" bg-zinc-800/20 rounded-tl rounded-bl h-full">
                {warn ?
                    <TriangleAlert className="h-6 w-6 relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-900/40"></TriangleAlert>
                    :
                    <div className="bg-red-300 h-8 w-8 rounded-full relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: expression?.params.color?.toString() }}></div>
                }
            </div>
            <div className="relative w-full p-2 min-w-0 flex flex-col gap-1">
                {/* <TextInput value={value} onChange={handleValueChange} className="bg-transparent focus:outline-none border-b-2 w-full"></TextInput> */}
                <input value={value} onChange={handleValueChange} className="bg-transparent focus:outline-none border-b-2 w-full"></input>
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
        </div>
    )
}

export default function App({ canvas3dRef, canvas2dRef }: { canvas3dRef: RefObject<HTMLCanvasElement>, canvas2dRef: RefObject<HTMLCanvasElement> }) {

    const [diedric, setDiedric] = useState<Diedric>()
    const [expressions, setExpressions] = useState<Expression[]>([])

    const savedExpressions = JSON.parse(localStorage.getItem("expressions") || "[]") as Expression[]


    useEffect(() => {
        if (!canvas3dRef.current || !canvas2dRef.current) return
        const newDiedric = new Diedric(100, canvas3dRef.current, canvas2dRef.current)

        newDiedric.createStaticLabel("x", new Vector3(newDiedric.size, 0, 0))
        newDiedric.createStaticLabel("y", new Vector3(0, newDiedric.size, 0))
        newDiedric.createStaticLabel("z", new Vector3(0, 0, newDiedric.size))

        setDiedric(newDiedric)

    }, [canvas3dRef, canvas2dRef])

    useEffect(() => {
        if (!diedric) { return }

        console.log("getting saved expressions")

        let newExpressions: Expression[] = []
        savedExpressions.map((savedExpression) => {
            if (savedExpression) {
                newExpressions.push(savedExpression)
            } else {
                console.warn("null expression in savedExpressions")
            }
        })
        setExpressions(newExpressions)

    }, [diedric])

    const saveExpressions = useCallback(() => {

        localStorage.setItem("expressions", JSON.stringify(expressions.map(expression => ({ id: expression.id, expressionText: expression.expressionText, params: expression.params, option: expression.option }))))

    }, [expressions])

    const newExpression = () => {
        setExpressions([...expressions, {
            id: createId(8),
            expressionText: "",
            expressionName: null,
            value: null,
            option: null,
            params: {
                hidden: false,
                color: colors[Math.round(Math.random() * (colors.length - 1))]
            }
        }])
    }

    return (
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
    )
}