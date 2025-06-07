// js/systemView.js
let p5SystemInstance;

const sketch = (p, astro) => {
    const starColor = '#FFD700', orbitColor = [255, 255, 255, 50];
    const planetColors = { default: '#808080' };
    Object.assign(planetColors, {
        'Astros Exóticos': '#FF69B4', 'Astros Caóticos': '#FF4500',
        'Astros Tóxicos': '#32CD32', 'Astros Habitáveis': '#1E90FF',
        'Astros Primordiais': '#9370DB'
    });
    const moonColor = '#A9A9A9';

    p.setup = () => {
        const container = document.getElementById('systemViewContainer');
        const containerSize = container.getBoundingClientRect();
        const canvas = p.createCanvas(containerSize.width, containerSize.height);
        canvas.parent('systemViewContainer');
    };

    p.draw = () => {
        p.background(0);
        p.translate(p.width / 2, p.height / 2);

        p.fill(starColor);
        p.noStroke();
        p.ellipse(0, 0, 30, 30);

        p.stroke(orbitColor);
        p.noFill();
        const maxRadius = p.min(p.width, p.height) / 2 - 30;
        const totalOrbits = astro.system.totalPlanetsInSystem || 1;
        for (let i = 1; i <= totalOrbits; i++) {
            const orbitRadius = (i / totalOrbits) * maxRadius;
            p.ellipse(0, 0, orbitRadius * 2, orbitRadius * 2);
        }
        
        const planetOrbitRadius = (astro.system.orbitalPosition / totalOrbits) * maxRadius;
        const angle = p.frameCount * 0.01;
        const planetX = planetOrbitRadius * p.cos(angle);
        const planetY = planetOrbitRadius * p.sin(angle);
        
        p.fill(p.color(planetColors[astro.category] || planetColors.default));
        p.noStroke();
        p.ellipse(planetX, planetY, 15, 15);

        if (astro.moons && astro.moons.length > 0) {
            astro.moons.forEach((moon, index) => {
                const moonOrbitRadius = 20 + index * 8;
                const moonAngle = p.frameCount * 0.05 * (index + 1);
                const moonX = planetX + moonOrbitRadius * p.cos(moonAngle);
                const moonY = planetY + moonOrbitRadius * p.sin(moonAngle);
                p.fill(p.color(planetColors[moon.category] || moonColor));
                p.ellipse(moonX, moonY, 5, 5);
            });
        }
    };
};

function initializeSystemView(astro) {
    if (p5SystemInstance) p5SystemInstance.remove();
    p5SystemInstance = new p5((p) => sketch(p, astro));
}

function destroySystemView() {
    if (p5SystemInstance) {
        p5SystemInstance.remove();
        p5SystemInstance = null;
    }
}
export { initializeSystemView, destroySystemView };

