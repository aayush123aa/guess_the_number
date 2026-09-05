

//this is all for the drawing bit, hai !!. //

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("drawingboard");
const ctx = canvas.getContext('2d');

const clear = document.getElementById("clearbutton");
const predict = document.getElementById("predictbutton");

let isDrawing = false;

ctx.strokeStyle = 'red';
ctx.lineWidth = 70;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';


function getmousepos(e)
{
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top
    };
}

let inp = null;

predict.addEventListener('click', () => {
    
    inp = getinput();
    callprediction();
});

clear.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const result = document.getElementById("result");
    result.textContent = "-";
})

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const pos = getmousepos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
});

canvas.addEventListener('mousemove', (e)=> {
    if(!isDrawing) return;
    const pos = getmousepos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
})



canvas.addEventListener('mouseup', () => {
    isDrawing = false;
   

});
canvas.addEventListener('mouseleave', () => isDrawing = false);





function getinput()
{
    const offscreen = document.createElement('canvas');
    offscreen.width = 28;
    offscreen.height = 28;

    const offctx = offscreen.getContext('2d');

    offctx.drawImage(canvas, 0, 0, 28, 28);

    const imgdata = offctx.getImageData(0, 0, 28, 28);
    const data = imgdata.data;

    const inputs = new Float32Array(28*28);

    for(let i = 0; i< inputs.length; i++)
    {
        const alpha = data[i*4];
        inputs[i] = alpha/255.0;
    }

    return inputs;

}

// this is the end of the part of drawing and converting the drawing into 28x28 ko matrix


//yeta bata chai i start the forwardfeed ko part


    //sigmoid funtion:
function sigmoid(y)
{
    return (1.0/(1+Math.exp(-y)));
}


let weightlayer1 = null;
let weightlayer2 = null;
let biases1 = null;
let biases2 = null;

//fetching data from the json file

fetch('./weights.json')
    .then(response => {
        if(!response.ok){
            throw new Error("HTTP error: " + response.status);
        }
        return response.json();
    })
    .then(rawdata => {
        weightlayer1 = rawdata.weights[0];
        weightlayer2 = rawdata.weights[1];

        biases1 = rawdata.biases[0];
        biases2 = rawdata.biases[1];
    })
    .catch(err => {
        console.error("Failed to load weights.json:", err);
        alert("Failed to load weights.json. Make sure you are serving your project via a local HTTP server (e.g. Live Server).");
    });


//computation part

function computehiddenlayer(input, weight, biasM)
{
    const hiddenlayer = [];

    for(let i = 0; i < weight.length; i++)
    {
        let dotpro = 0;

        for(let j = 0; j < input.length; j++)
        {
            dotpro += weight[i][j] * input[j];
        }

        const z = dotpro + biasM[i];
        hiddenlayer.push(sigmoid(z));
    }

    return hiddenlayer;
}


//now doing the heavy lifting / real numbers ko kaam aba:
function callprediction()
{
const middlelayer = computehiddenlayer(inp, weightlayer1, biases1);
const prediction = computehiddenlayer(middlelayer, weightlayer2, biases2);

let ind = 0;

for(let i = 0; i < prediction.length; i++)
{
    if(prediction[i]>prediction[ind])
    {
        ind = i;
    }
}

const result = document.getElementById("result");
result.textContent = ind;
}

