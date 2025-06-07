// js/dataManager.js
let planetData = [];
const DATA_FILE_PATH = 'data.json';

async function loadPlanetDataFromFile() {
    try {
        const fileExists = await window.electronAPI.existsSync(DATA_FILE_PATH);
        if (fileExists) {
            const jsonData = await window.electronAPI.readFileSync(DATA_FILE_PATH);
            if (!jsonData || jsonData.trim() === "") {
                planetData = [];
                return;
            }
            const loadedData = JSON.parse(jsonData);
            planetData = loadedData.map(astro => ({
                coordX: Math.floor(Math.random() * 800),
                coordY: Math.floor(Math.random() * 600),
                ...astro,
                system: astro.system ?? { starName: 'Desconhecido', starType: 'N/A', orbitalPosition: 1, totalPlanetsInSystem: 1 },
                moons: astro.moons ?? [],
            }));
        } else {
            planetData = [];
            await savePlanetDataToFile();
        }
    } catch (error) {
        console.error("[DataManager] Erro ao carregar dados:", error);
        planetData = [];
        throw new Error("Erro crítico ao carregar o arquivo de dados.");
    }
}

async function savePlanetDataToFile() {
    try {
        const jsonData = JSON.stringify(planetData, null, 2);
        const success = await window.electronAPI.writeFileSync(DATA_FILE_PATH, jsonData);
        if (!success) throw new Error("Falha ao salvar o astro no sistema de arquivos.");
    } catch (error) {
        console.error("[DataManager] Erro ao salvar dados:", error);
        throw new Error("Erro ao salvar o astro.");
    }
}

async function saveAstro(astroData, originalName) {
    if (originalName) {
        const index = planetData.findIndex(p => p.name === originalName);
        if (index !== -1) {
            if (astroData.name !== originalName && planetData.some((p, i) => i !== index && p.name === astroData.name)) {
                throw new Error(`Um astro com o nome "${astroData.name}" já existe.`);
            }
            planetData[index] = { ...planetData[index], ...astroData };
        } else {
            planetData.push(astroData);
        }
    } else {
        if (planetData.some(p => p.name === astroData.name)) {
            throw new Error(`Um astro com o nome "${astroData.name}" já existe.`);
        }
        planetData.push(astroData);
    }
    await savePlanetDataToFile();
}

async function deleteAstro(nameToDelete) {
    planetData = planetData.filter(p => p.name !== nameToDelete);
    await savePlanetDataToFile();
}

const getAllAstros = () => [...planetData];
const getAstroByName = (name) => planetData.find(p => p.name === name);

export { loadPlanetDataFromFile, savePlanetDataToFile, saveAstro, deleteAstro, getAllAstros, getAstroByName };
