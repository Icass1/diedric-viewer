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

type PosibleExpressions = DiedricLine2Point | DiedricPlane3Point | DiedricPoint | DiedricPlanePointLine | DiedricLinePointParallelLine | DiedricPlane2Line | DiedricLine2Plane

const DiedricObjects = [
    DiedricPoint,

    DiedricLine2Point,
    DiedricLine2Plane,
    DiedricLinePointParallelLine,

    DiedricPlanePointLine,
    DiedricPlane3Point,
    DiedricPlane2Line,
]

interface Expression {
    id: string
    expressionText: string
    expressionName: string | null
    value: PosibleExpressions | null
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
    const { expressions, diedric } = useContext(ExpressionsContext)
    const [value, setValue] = useState(expression.expressionText)
    const [warn, setWarn] = useState(false)

    const expressionObjects = useRef<any>({})


    const removeExpression = () => {
        console.log("removeExpression")
    }

    const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        expression.expressionText = e.target.value

        let parsingError = false

        const text = e.target.value.replace(/ /g, '')
        setValue(e.target.value)
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
                    const expression = expressions.find(expression => expression.expressionName == paramValue)
                    output[index] = expression?.value
                }
            })

            output.map(paramValue => {
                if (typeof paramValue == "number") {
                    Object.keys(diedricObjectParams).map(diedricObjectType => {

                        let paramKey;
                        Object.entries(diedricObjectParams[diedricObjectType]).find((entry, _index) => {
                            if (entry[1] == "number") {
                                paramKey = entry[0]
                                // value = entry[1]
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

            let match = false

            Object.entries(diedricObjectParams).map(diedricObjectParamsEntry => {
                let type = diedricObjectParamsEntry[0]
                let params: any = diedricObjectParamsEntry[1]

                if (Object.keys(params).length == 0) {
                    match = true
                    let diedricObject = DiedricObjects.find(DiedricObject => DiedricObject.type == type)
                    if (diedricObject == undefined) {
                        console.warn("This should never happen.")
                    } else if (expressionObjects.current[expressionObjectsId] instanceof diedricObject) {
                        if (expressionObjects.current[expressionObjectsId] instanceof DiedricPoint) {
                            expressionObjects.current[expressionObjectsId].setAttributes(Object.assign(finalParams[type], { "color": expression.params.color }))
                        }
                    } else {
                        console.log("new", diedricObject)
                        expressionObjects.current[expressionObjectsId] = new diedricObject(Object.assign(finalParams[type], { "diedric": diedric, "color": expression.params.color }))
                    }
                }
            })
            if (!match) {
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
        handleValueChange({ target: { value: value } })
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
            <div className="relative w-full p-2 min-w-0 flex flex-col">
                <TextInput value={value} onChange={handleValueChange} className="bg-transparent focus:outline-none"></TextInput>
            </div>
            <Trash2 className="h-5 w-5 text-red-500 cursor-pointer hover:scale-105" onClick={removeExpression} />
        </div>
    )
}

export default function App({ canvas3dRef, canvas2dRef }: { canvas3dRef: RefObject<HTMLCanvasElement>, canvas2dRef: RefObject<HTMLCanvasElement> }) {

    const [diedric, setDiedric] = useState<Diedric>()
    const [expressions, setExpressions] = useState<Expression[]>([])

    const savedExpressions: Expression[] = [
        {
            id: createId(8),
            expressionText: "A = (10,20,30)",
            expressionName: null,
            value: null,
            params: {
                hidden: false,
                color: "#000000"
            }
        },
        {
            id: createId(8),
            expressionText: "B = (-10, -20, -55)",
            expressionName: null,
            value: null,
            params: {
                hidden: false,
                color: "#fa7e19"
            }
        },
        {
            id: createId(8),
            expressionText: "C = (90, -50, 55)",
            expressionName: null,
            value: null,
            params: {
                hidden: false,
                color: "#6042a6"
            }
        },
        {
            id: createId(8),
            expressionText: "r = (A, B)",
            expressionName: null,
            value: null,
            params: {
                hidden: false,
                color: "#388c46"
            }
        },
        {
            id: createId(8),
            expressionText: "t = (A, C)",
            expressionName: null,
            value: null,
            params: {
                hidden: false,
                color: "#2d70b3"
            }
        },
        {
            id: createId(8),
            expressionText: "alpha = (r, t)",
            expressionName: null,
            value: null,
            params: {
                hidden: false,
                color: "#c74440"
            }
        },
    ]
    useEffect(() => {
        if (!canvas3dRef.current) return
        const newDiedric = new Diedric(200, canvas3dRef.current, canvas2dRef.current)

        setDiedric(newDiedric)
    }, [canvas3dRef])

    useEffect(() => {
        if (!diedric) { return }

        console.log("getting saved expressions")

        let newExpressions: Expression[] = []
        savedExpressions.map((savedExpression) => {
            console.log(savedExpression)
            newExpressions.push(savedExpression)

        })
        setExpressions(newExpressions)

    }, [diedric])

    const saveExpressions = useCallback(() => {

        console.log(expressions)
        console.log("saveExpressions")

    }, [expressions])

    const newExpression = () => {
        console.log("newExpression")

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