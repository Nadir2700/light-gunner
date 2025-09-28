"use strict";
const canvas = document.getElementById('cnvs');
const ctx = canvas.getContext('2d');
// Keep track of the last coordinates so resize redraws correctly
let lastX = 0;
let lastY = 0;
let lastRawX = 0;
let lastRawY = 0;
let sensX = 27.5;
let sensY = 22.5;
// Resize the canvas internal dimensions to match its CSS display size
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
// Draw the crosshair at (x, y)
function moveCrosshair(x, y) {
    lastX = x;
    lastY = y;
    const gap = 6; 
    const length = 12;
    const thickness = 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'lime'; 
    ctx.lineWidth = thickness;
    ctx.beginPath();
    // Top line
    ctx.moveTo(x, y - gap - length);
    ctx.lineTo(x, y - gap);
    // Bottom line
    ctx.moveTo(x, y + gap);
    ctx.lineTo(x, y + gap + length);
    // Left line
    ctx.moveTo(x - gap - length, y);
    ctx.lineTo(x - gap, y);
    // Right line
    ctx.moveTo(x + gap, y);
    ctx.lineTo(x + gap + length, y);
    ctx.stroke();
}
function dist360(x1, x2) {
    const min = 0;
    const max = 360;
    const range = max - min + 1; // = 361
    const diff = Math.abs(x1 - x2);
    if (x1 - x2 < 0)
        return Math.min(diff, range - diff) * -1;
    return Math.min(diff, range - diff);
}
function calculateDelta(rawX, rawY) {
    const rawXParsed = parseFloat(rawX);
    const rawYParsed = parseFloat(rawY);
    if (isNaN(rawXParsed) || isNaN(rawYParsed)) {
        throw new Error('Invalid number input');
    }
    const deltas = [
        dist360(lastRawX, rawXParsed) * sensX,
        (lastRawY - rawYParsed) * sensY,
    ];
    lastRawX = rawXParsed;
    lastRawY = rawYParsed;
    return deltas;
}
function setCrosshairByDelta(deltaX, deltaY) {
    moveCrosshair(lastX + deltaX, lastY + deltaY);
}
function extractPositionValues(input) {
    const regex = /x:\s*(-?\d+(\.\d+)?)\s+y:\s*(-?\d+(\.\d+)?)\s+roll:\s*(-?\d+(\.\d+)?)/;
    const match = input.match(regex);
    if (!match) {
        throw new Error('Input string format is invalid.');
    }
    const [, x, , y, , roll] = match;
    return [x, y, roll];
}
window.addEventListener('movement', (event) => {
    const customEvent = event;
    const data = customEvent.detail;
    console.log(data);
    const newPos = extractPositionValues(data);
    const deltaXY = calculateDelta(newPos[0], newPos[1]);
    setCrosshairByDelta(deltaXY[0], deltaXY[1]);
});
// On window resize, adjust canvas size and redraw
window.addEventListener('resize', () => {
    resizeCanvas();
    moveCrosshair(lastX, lastY);
});
// Initial setup: size canvas and draw initial crosshair in center
resizeCanvas();
moveCrosshair(canvas.width / 2, canvas.height / 2);
// example usage — click to move the crosshair
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    moveCrosshair(x, y);
});
// Initial setup: size canvas and initialize crosshair at center
resizeCanvas();
lastX = canvas.width / 2;
lastY = canvas.height / 2;
moveCrosshair(lastX, lastY);
