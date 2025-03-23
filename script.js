const paletteGrid = document.getElementById('paletteGrid');
const generateBtn = document.getElementById('generateBtn');
const refreshBtn = document.getElementById('refreshBtn');
const modeSelector = document.getElementById('modeSelector');
const modeButtons = modeSelector.querySelectorAll('.mode-btn');
const styleSelector = document.getElementById('styleSelector');
const styleButtons = styleSelector.querySelectorAll('.style-btn');
const gradientOptions = document.getElementById('gradientOptions');
const gradientCount = document.getElementById('gradientCount');
const manualGradient = document.getElementById('manualGradient');
const manualInput = document.getElementById('manualInput');
const colorInputs = document.getElementById('colorInputs');
const applyManual = document.getElementById('applyManual');
const aiOptions = document.getElementById('aiOptions');
const harmonyType = document.getElementById('harmonyType');
const moodOptions = document.getElementById('moodOptions');
const moodType = document.getElementById('moodType');
const imageOptions = document.getElementById('imageOptions');
const imageUpload = document.getElementById('imageUpload');
const previewBtn = document.querySelector('.preview-btn');
const previewText = document.querySelector('.preview-text');
const previewBg = document.querySelector('.preview-bg');
const exportCSS = document.getElementById('exportCSS');
const exportJSON = document.getElementById('exportJSON');
const exportSVG = document.getElementById('exportSVG');
const exportPNG = document.getElementById('exportPNG');
let currentMode = 'random';
let currentStyle = 'flat';
let currentColors = [];
let currentGradient = null;

function generateRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function hexToHSL(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
}

function HSLToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function generateHarmony(baseColor, type) {
    const [h, s, l] = hexToHSL(baseColor);
    let colors = [baseColor];
    switch (type) {
        case 'complementary':
            colors.push(HSLToHex((h + 180) % 360, s, l));
            break;
        case 'triadic':
            colors.push(HSLToHex((h + 120) % 360, s, l));
            colors.push(HSLToHex((h + 240) % 360, s, l));
            break;
        case 'analogous':
            colors.push(HSLToHex((h + 30) % 360, s, l));
            colors.push(HSLToHex((h - 30 + 360) % 360, s, l));
            break;
    }
    while (colors.length < 5) colors.push(generateRandomColor());
    return colors.slice(0, 5);
}

function generateMood(mood) {
    const base = generateRandomColor();
    const [h, s, l] = hexToHSL(base);
    switch (mood) {
        case 'happy':
            return [base, HSLToHex(h, Math.min(s + 20, 100), l + 20), HSLToHex(h + 60, s, l), HSLToHex(h - 60, s, l), HSLToHex(h, s, l - 20)];
        case 'calm':
            return [base, HSLToHex(h, s - 20, l + 10), HSLToHex(h + 30, s - 10, l), HSLToHex(h - 30, s - 10, l), HSLToHex(h, s, l + 20)];
        case 'energetic':
            return [base, HSLToHex(h + 90, s + 20, l), HSLToHex(h - 90, s + 20, l), HSLToHex(h, s, l - 10), HSLToHex(h + 45, s, l)];
        default:
            return Array(5).fill().map(generateRandomColor);
    }
}

function generateMonochrome(baseColor) {
    const color = baseColor.slice(1);
    const num = parseInt(color, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return [
        baseColor,
        `rgb(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)})`,
        `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`,
        `rgb(${Math.min(255, r + 100)}, ${Math.min(255, g + 100)}, ${Math.min(255, b + 100)})`,
        `rgb(${Math.max(0, r - 100)}, ${Math.max(0, g - 100)}, ${Math.max(0, b - 100)})`
    ];
}

function generateUniqueGradient(count) {
    const colors = Array.from({ length: count }, generateRandomColor);
    const uniqueStyles = [
        `linear-gradient(45deg, ${colors.join(', ')})`,
        `linear-gradient(to right, ${colors.join(', ')})`,
        `linear-gradient(135deg, ${colors.join(', ')}, transparent)`,
        `radial-gradient(circle, ${colors.join(', ')})`,
        `conic-gradient(from 45deg, ${colors.join(', ')})`,
        `linear-gradient(90deg, ${colors.join(', ')} 50%, transparent 50%)`
    ];
    const gradient = uniqueStyles[Math.floor(Math.random() * uniqueStyles.length)];
    return { colors, gradient };
}

function extractColorsFromImage(imageFile) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 50; // Reduce size for speed
            canvas.height = 50;
            ctx.drawImage(img, 0, 0, 50, 50);
            const imageData = ctx.getImageData(0, 0, 50, 50).data;
            const colors = [];
            for (let i = 0; i < imageData.length && colors.length < 5; i += 80) {
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                colors.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
            }
            resolve(colors);
        };
        img.src = URL.createObjectURL(imageFile);
    });
}

function generateColorName(color) {
    const names = {
        '#FF5733': 'Sunset Glow',
        '#4682B4': 'Ocean Breeze',
        '#FFD700': 'Golden Hour',
        '#FF69B4': 'Pink Passion',
        '#00FF7F': 'Emerald Rush'
    };
    return names[color] || `Color ${color}`;
}

function applyStyle(color, mode) {
    if (mode === 'textured') return `${color}`;
    if (mode === 'neon') return color;
    return color;
}

function displayPalette(colors, gradient = null) {
    paletteGrid.innerHTML = '';
    refreshBtn.style.display = 'inline-block';

    if (currentMode === 'gradient' && gradient) {
        const card = document.createElement('div');
        card.className = `color-card ${currentStyle}`;
        card.style.background = applyStyle(gradient, currentStyle);
        card.style.gridColumn = '1 / -1';
        
        const info = document.createElement('div');
        info.className = 'color-info';
        info.textContent = 'Click to copy CSS';

        card.appendChild(info);
        paletteGrid.appendChild(card);

        card.addEventListener('click', () => {
            navigator.clipboard.writeText(`background: ${gradient};`);
            info.textContent = 'CSS Copied!';
            setTimeout(() => info.textContent = 'Click to copy CSS', 1000);
            updatePreview(colors[0]);
        });
    }

    colors.forEach(color => {
        const card = document.createElement('div');
        card.className = `color-card ${currentStyle}`;
        card.style.background = applyStyle(color, currentStyle);

        const info = document.createElement('div');
        info.className = 'color-info';
        info.textContent = `${generateColorName(color)} (${color.toUpperCase()})`;

        card.appendChild(info);
        paletteGrid.appendChild(card);

        card.addEventListener('click', () => {
            navigator.clipboard.writeText(color);
            info.textContent = 'Copied!';
            setTimeout(() => info.textContent = `${generateColorName(color)} (${color.toUpperCase()})`, 1000);
            updatePreview(color);
        });
    });

    currentColors = colors;
    currentGradient = gradient;
    if (!gradient) updatePreview(colors[0]); // Default to first color
}

function updatePreview(selectedColor) {
    const luminance = hexToHSL(selectedColor)[2];
    const textColor = luminance > 50 ? '#000' : '#fff';
    previewBtn.style.backgroundColor = selectedColor;
    previewBtn.style.color = textColor;
    previewText.style.color = selectedColor;
    previewBg.style.backgroundColor = selectedColor;
}

function generatePalette() {
    let colors = [];
    refreshBtn.style.display = 'inline-block';

    switch (currentMode) {
        case 'random':
            colors = Array(5).fill().map(generateRandomColor);
            displayPalette(colors);
            break;
        case 'monochrome':
            const baseColor = generateRandomColor();
            colors = generateMonochrome(baseColor);
            displayPalette(colors);
            break;
        case 'gradient':
            const count = parseInt(gradientCount.value);
            const { colors: gradColors, gradient } = generateUniqueGradient(count);
            displayPalette(gradColors, gradient);
            break;
        case 'ai':
            const aiBase = generateRandomColor();
            colors = generateHarmony(aiBase, harmonyType.value);
            displayPalette(colors);
            break;
        case 'mood':
            colors = generateMood(moodType.value);
            displayPalette(colors);
            break;
        case 'image':
            if (imageUpload.files[0]) {
                extractColorsFromImage(imageUpload.files[0]).then(extractedColors => {
                    displayPalette(extractedColors);
                });
            } else {
                alert('Please upload an image first!');
            }
            break;
    }
}

function refreshPalette() {
    generatePalette();
}

function createManualInputs() {
    colorInputs.innerHTML = '';
    const count = parseInt(gradientCount.value);
    for (let i = 0; i < count; i++) {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = generateRandomColor();
        colorInputs.appendChild(input);
    }
}

function applyManualGradient() {
    const colorInputsArray = Array.from(colorInputs.querySelectorAll('input'));
    const colors = colorInputsArray.map(input => input.value);
    const gradient = `linear-gradient(45deg, ${colors.join(', ')})`;
    displayPalette(colors, gradient);
    manualInput.style.display = 'none';
}

function createFloatingOrbs() {
    const orbCount = window.innerWidth < 600 ? 2 : 3;
    for (let i = 0; i < orbCount; i++) {
        const orb = document.createElement('div');
        orb.className = 'floating-orb';
        const size = `${30 + i * 20}px`;
        orb.style.width = size;
        orb.style.height = size;
        orb.style.background = `radial-gradient(circle, ${generateRandomColor()}, transparent)`;
        orb.style.left = `${Math.random() * 100}%`;
        orb.style.top = `${Math.random() * 100}%`;
        orb.style.animationDelay = `${i}s`;
        document.body.appendChild(orb);
    }
}

function exportPalette(format) {
    if (!currentColors.length) return;

    switch (format) {
        case 'css':
            const css = currentColors.map((color, i) => `--color${i + 1}: ${color};`).join('\n');
            navigator.clipboard.writeText(`:root {\n${css}\n}`);
            alert('CSS copied to clipboard!');
            break;
        case 'json':
            const json = JSON.stringify(Object.fromEntries(currentColors.map((color, i) => [`color${i + 1}`, color])), null, 2);
            navigator.clipboard.writeText(json);
            alert('JSON copied to clipboard!');
            break;
        case 'svg':
            const svg = `<svg width="500" height="100" xmlns="http://www.w3.org/2000/svg">${
                currentColors.map((color, i) => `<rect x="${i * 100}" y="0" width="100" height="100" fill="${color}"/>`).join('')
            }</svg>`;
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'palette.svg';
            a.click();
            URL.revokeObjectURL(url);
            break;
        case 'png':
            const canvas = document.createElement('canvas');
            canvas.width = 500;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            currentColors.forEach((color, i) => {
                ctx.fillStyle = color;
                ctx.fillRect(i * 100, 0, 100, 100);
            });
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'palette.png';
                a.click();
                URL.revokeObjectURL(url);
            });
            break;
    }
}

modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        gradientOptions.style.display = currentMode === 'gradient' ? 'flex' : 'none';
        aiOptions.style.display = currentMode === 'ai' ? 'flex' : 'none';
        moodOptions.style.display = currentMode === 'mood' ? 'flex' : 'none';
        imageOptions.style.display = currentMode === 'image' ? 'flex' : 'none';
        manualInput.style.display = 'none';
        paletteGrid.innerHTML = '';
        refreshBtn.style.display = 'none';
    });
});

styleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        styleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentStyle = btn.dataset.style;
        if (currentColors.length) displayPalette(currentColors, currentGradient);
    });
});

gradientCount.addEventListener('change', () => {
    if (gradientCount.value < 2) gradientCount.value = 2;
    if (gradientCount.value > 5) gradientCount.value = 5;
});

manualGradient.addEventListener('click', () => {
    manualInput.style.display = 'block';
    createManualInputs();
});

applyManual.addEventListener('click', applyManualGradient);

generateBtn.addEventListener('click', generatePalette);

refreshBtn.addEventListener('click', refreshPalette);

imageUpload.addEventListener('change', () => {
    if (currentMode === 'image' && imageUpload.files[0]) generatePalette();
});

exportCSS.addEventListener('click', () => exportPalette('css'));
exportJSON.addEventListener('click', () => exportPalette('json'));
exportSVG.addEventListener('click', () => exportPalette('svg'));
exportPNG.addEventListener('click', () => exportPalette('png'));

// Initial setup
createFloatingOrbs();

window.addEventListener('resize', () => {
    document.querySelectorAll('.floating-orb').forEach(orb => orb.remove());
    createFloatingOrbs();
});