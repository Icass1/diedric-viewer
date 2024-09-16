import { Diedric } from "./diedric";
import * as THREE from 'three';
import { DiedricPlane } from "./diedricPlane";

const expressions = document.querySelector("#expressions") as HTMLDivElement;
const diedric = new Diedric(100);

diedric.createStaticLabel("x", new THREE.Vector3(100, 0, 0));
diedric.createStaticLabel("y", new THREE.Vector3(0, 100, 0));
diedric.createStaticLabel("z", new THREE.Vector3(0, 0, 100));

const planes: DiedricPlane[] = [];

planes.push(diedric.createDiedricPlane(10, 20, 30, "red"));
// planes.push(diedric.createDiedricPlane(-10, 25, -50, "green"));

expressions.innerHTML = "";

interface planeToSave {
    o: number | null
    a: number | null
    c: number | null
    color: string
}

// Function to create a slider with event binding
const createSlider = (plane: any, property: string, index: number, value: number, min = -100, max = 100) => {
    const sliderContainer = document.createElement("div");
    sliderContainer.className = "flex flex-row gap-1"

    const label = document.createElement("label");
    label.textContent = property.toUpperCase();
    label.className = "w-4"
    sliderContainer.appendChild(label);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = `plane-${index}-${property}-slider`;
    slider.min = String(min);
    slider.max = String(max);
    slider.value = String(value);

    // Event listener to update plane property when slider value changes
    slider.addEventListener("input", (event) => {
        const target = event.target as HTMLInputElement;
        plane[property] = Number(target.value);
        textInput.value = target.value
        savePlanes()
    });

    sliderContainer.appendChild(slider);

    const textInput = document.createElement("input")
    textInput.type = "number"
    textInput.value = String(value)
    textInput.className = "bg-transparent border-solid border border-neutral-800 w-10 rounded text-center"
    textInput.addEventListener("change", () => {
        plane[property] = Number(textInput.value);
        slider.value = textInput.value
        savePlanes()

    })
    sliderContainer.appendChild(textInput)

    return sliderContainer;
};
const savePlanes = () => {
    console.log("save planes")

    const planesToSave: planeToSave[] = []

    planes.forEach((plane) => {
        console.log(plane.color)
        planesToSave.push({ o: plane.o, a: plane.a, c: plane.c, color: plane.color.toString() })
    })

    localStorage.setItem("planes", JSON.stringify(planesToSave))
}

const getPlanes = () => {

    const newPlanes = JSON.parse(localStorage.getItem("planes"))

    if (!newPlanes) return

    planes.map((plane) => plane.remove())


    planes.length = 0
    newPlanes.map((plane: planeToSave) => {
        console.log(plane)

        planes.push(diedric.createDiedricPlane(plane.o, plane.a, plane.c, plane.color))

    })
}

getPlanes()

const updateExpressions = () => {

    expressions.innerHTML = ""

    // Render plane controls dynamically
    planes.forEach((plane, index) => {
        const planeContainer = document.createElement("div");
        planeContainer.className = "m-1 border-solid rounded border-neutral-400 border p-1 flex flex-col w-full";

        const planeTitle = document.createElement("div");
        planeTitle.textContent = `Plane ${index + 1}`;
        planeContainer.appendChild(planeTitle);

        const colorPicker = document.createElement("input")
        colorPicker.type = "color"
        colorPicker.style.display = ""
        colorPicker.style.width = "0px"
        colorPicker.style.height = "0px"

        colorPicker.addEventListener("change", () => {
            console.log(colorPicker.value)
            plane.color = colorPicker.value
            colorIndicator.style.backgroundColor = colorPicker.value
            savePlanes()
        })

        const colorIndicator = document.createElement("div");
        colorIndicator.style.backgroundColor = plane.color.toString();
        colorIndicator.className = "w-10 h-10 rounded-full";

        colorIndicator.addEventListener("click", () => {
            console.log("color indicator click")
            colorPicker.click()
        })

        const slidersContainer = document.createElement("div");
        slidersContainer.className = "flex flex-row items-center gap-1";

        const sliders = document.createElement("div");
        sliders.className = "flex flex-col";

        const deleteButton = document.createElement("button")
        deleteButton.textContent = "Delete"
        deleteButton.className = "text-red-800 bg-red-400 p-1 rounded"
        deleteButton.onclick = () => {
            const index = planes.indexOf(plane);
            console.log(planes, index)
            if (index > -1) { // only splice array when item is found
                plane.remove()
                planes.splice(index, 1); // 2nd parameter means remove one item only
                savePlanes()
            }
            updateExpressions()
        }

        // Add sliders for properties `o`, `a`, `c`
        sliders.appendChild(createSlider(plane, "o", index, plane.o));
        sliders.appendChild(createSlider(plane, "a", index, plane.a));
        sliders.appendChild(createSlider(plane, "c", index, plane.c));

        slidersContainer.appendChild(colorIndicator);
        slidersContainer.appendChild(colorPicker);
        slidersContainer.appendChild(sliders);
        slidersContainer.appendChild(deleteButton);

        planeContainer.appendChild(slidersContainer);
        expressions.appendChild(planeContainer);
    });

    const addNewExpression = document.createElement("div")
    addNewExpression.className = "w-20 h-20 rounded border border-neutral-600 hover:bg-neutral-900/10"

    expressions.appendChild(addNewExpression)
    addNewExpression.addEventListener("click", () => {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
        planes.push(diedric.createDiedricPlane(Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100), "#" + randomColor))
        updateExpressions()
        savePlanes()
    })
}

updateExpressions()
