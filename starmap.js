// js/starmap.js
import { getAllAstros } from './dataManager.js';
import { openPlanetModal } from './ui.js';

let canvas, p5Instance, hoveredAstro = null;
const categoryColors = {
    'Astros Exóticos': '#FF69B4', 'Astros Caóticos': '#FF4500',
    'Astros Tóxicos': '#32CD32', 'Astros Habitáveis': '#1E90FF',
    'Astros Primordiais': '#9370DB', 'default': '#FFFFFF'
};

const sketch = (p) => {
    p.setup = () => {
        const container = document.getElementById('starmapContainer');
        const containerSize = container.getBoundingClientRect();
        canvas = p.createCanvas(containerSize.width, containerSize.height);
        canvas.parent('starmapContainer');
        p.noLoop();
    };

    p.draw = () => {
        p.background(12, 10, 24);
        const astros = getAllAstros();
        astros.forEach(astro => {
            const color = p.color(categoryColors[astro.category] || categoryColors.default);
            p.fill(color);
            p.noStroke();
            p.ellipse(astro.coordX, astro.coordY, 8, 8);
        });

        if(hoveredAstro){
            p.fill(255);
            p.textAlign(p.CENTER);
            p.text(hoveredAstro.name, hoveredAstro.coordX, hoveredAstro.coordY - 15);
        }
    };

    p.mouseMoved = () => {
        const astros = getAllAstros();
        let isHovering = false;
        for (const astro of astros) {
            if (p.dist(p.mouseX, p.mouseY, astro.coordX, astro.coordY) < 10) {
                if (hoveredAstro?.name !== astro.name) {
                    hoveredAstro = astro;
                    p.redraw();
                }
                isHovering = true;
                break;
            }
        }
        if (!isHovering && hoveredAstro) {
            hoveredAstro = null;
            p.redraw();
        }
        canvas.elt.style.cursor = isHovering ? 'pointer' : 'crosshair';
    };

    p.mousePressed = () => { if (hoveredAstro) openPlanetModal(hoveredAstro.name); };
};

function initializeStarmap() { if (!p5Instance) p5Instance = new p5(sketch); }
function redrawStarmap() { if (p5Instance) p5Instance.redraw(); }
export { initializeStarmap, redrawStarmap };