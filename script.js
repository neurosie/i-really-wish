let visibleCanvas, visibleCtx, canvas, ctx, input;
const documentPromise = new Promise((resolve) =>
    document.addEventListener('DOMContentLoaded', resolve)
).then(() => {
    visibleCanvas = document.querySelector('canvas');
    visibleCtx = visibleCanvas.getContext('2d');
    input = document.querySelector('.user-text');
    document.querySelector('.save-button').addEventListener('click', save);
});

const baseImage = new Image();
baseImage.src = "base.png";
// baseImage.crossOrigin = "anonymous";
const imagePromise = new Promise((resolve) =>
    baseImage.addEventListener('load', resolve));

const fontPromise = new FontFace('Spongeboy', 'url("SpongeboyRegular.otf") format("opentype")').load();

Promise.all([imagePromise, fontPromise, documentPromise]).then(() => {
    canvas = document.createElement('canvas');
    canvas.width = baseImage.naturalWidth;
    canvas.height = baseImage.naturalHeight;
    ctx = canvas.getContext('2d');
    drawCanvas();
    input.addEventListener('keyup', drawCanvas);
});

const drawableArea = { x: 155 / 600 * 959, y: 375 / 600 * 960, width: 310 / 600 * 959, height: 70 / 600 * 960 };
const oneLinePadding = 10 / 600 * 960;
const twoLineGutter = 5 / 600 * 960;
const minFontHeight = 18 / 600 * 960;

function setFontSize(size) {
    ctx.font = `${size}px Spongeboy`;
}

function centeredBaseline(size, height) {
    return height - (height - size) / 2;
}

function drawTextAtBaseline(text, y) {
    ctx.fillText(text, drawableArea.x + drawableArea.width / 2, drawableArea.y + y);
}

function heightToFit(height, measuredWidth) {
    if (measuredWidth < drawableArea.width) {
        return height;
    } else {
        return height / measuredWidth * drawableArea.width;
    }
}

function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    // ctx.fillStyle = 'green';
    // ctx.fillRect(drawableArea.x, drawableArea.y, drawableArea.width, drawableArea.height);

    const userText = input.value.trim().toUpperCase();
    ctx.fillStyle = 'rgb(120, 18, 110)';
    ctx.textAlign = 'center';
    let fontHeight = drawableArea.height - oneLinePadding;
    setFontSize(fontHeight);
    const metrics = ctx.measureText(userText);
    fontHeight = heightToFit(fontHeight, metrics.width);
    if (fontHeight > drawableArea.height / 2) {
        setFontSize(fontHeight);
        drawTextAtBaseline(userText,
            centeredBaseline(fontHeight, drawableArea.height));
        // ctx.fillRect(drawableArea.x + drawableArea.width / 2 - 1, drawableArea.y, 2, drawableArea.height);
    } else {
        const splitIndex = userText.split("").reduce((best, c, i) =>
            (c === ' ' && Math.abs(i - userText.length / 2) < Math.abs(best - userText.length / 2)) ? i : best
            , -1);

        let lineOne, lineTwo;
        if (splitIndex > 0) {
            lineOne = userText.slice(0, splitIndex);
            lineTwo = userText.slice(splitIndex + 1);
        } else {
            // no spaces - just split it in half
            lineOne = userText.slice(0, Math.floor(userText.length / 2)) + '-';
            lineTwo = userText.slice(Math.floor(userText.length / 2));
        }
        fontHeight = (drawableArea.height - twoLineGutter) / 2;
        setFontSize(fontHeight);
        const oneMetrics = ctx.measureText(lineOne);
        const twoMetrics = ctx.measureText(lineTwo);
        let oneHeight = heightToFit(fontHeight, oneMetrics.width);
        let twoHeight = heightToFit(fontHeight, twoMetrics.width);
        setFontSize(oneHeight);
        drawTextAtBaseline(lineOne, centeredBaseline(oneHeight, drawableArea.height - twoHeight - twoLineGutter));
        setFontSize(twoHeight);
        ctx.fillStyle = 'rgb(110, 12, 100)';
        drawTextAtBaseline(lineTwo, drawableArea.height);
    }
    visibleCtx.drawImage(canvas, 0, 0, visibleCanvas.width, visibleCanvas.height);
}

function save() {
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL();
    a.download = `I really wish I weren't ${input.value.trim()} right now`;
    a.click();
};