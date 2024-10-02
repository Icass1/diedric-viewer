import { useRef } from "react";
import App from "./App";


export default function Layout() {

    const canvas3dRef = useRef<HTMLCanvasElement>(null)
    const canvas2dRef = useRef<HTMLCanvasElement>(null)

    return (
        <div className=" h-full w-full grid grid-cols-[400px_1fr_1fr] gap-2"> 
            <div className="bg-neutral-100 h-full w-full min-w-0 min-h-0">
                <App canvas3dRef={canvas3dRef} canvas2dRef={canvas2dRef} />
            </div>
            <div className="relative">
                <canvas ref={canvas3dRef} className="absolute top-0 w-full min-w-0 h-full min-h-0"></canvas>
            </div>
            <div className="relative">
                <canvas ref={canvas2dRef} className="absolute top-0 w-full min-w-0 h-full min-h-0"></canvas>
            </div>
        </div>
    )
}
