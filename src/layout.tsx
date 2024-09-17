import { useRef } from "react";
import App from "./App";


export default function Layout() {

    const canvasRef = useRef<HTMLCanvasElement>(null)

    return (
        <div className=" h-full w-full grid grid-cols-[400px_1fr] gap-2">
            <div className="bg-neutral-100 h-full w-full min-w-0 min-h-0">
                <App canvasRef={canvasRef} />
            </div>
            <div id="main-canvas" className="relative">
                <canvas ref={canvasRef} className="absolute top-0 w-full min-w-0 h-full min-h-0"></canvas>
                <div className="absolute flex flex-col p-1 m-1 bg-slate-600/50 rounded-lg text-sm" id="main-canvas-info"></div>
            </div>
        </div>
    )
}
