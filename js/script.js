// js/script.js
import { loadPlanetDataFromFile, getAllAstros } from './dataManager.js';
import { initializeUI, renderAllAstros, closePlanetModal, closeAstroFormModal, showTab } from './ui.js';
import { addEventListeners } from './eventHandlers.js';
import { initializeStarmap } from './starmap.js';

async function main() {
    try {
        initializeUI();
        await loadPlanetDataFromFile();
        initializeStarmap();
        renderAllAstros(getAllAstros());
        addEventListeners();
    } catch (error) {
        console.error("Erro fatal na inicialização:", error);
        alert(`Erro na inicialização: ${error.message}`);
    }
}

window.closePlanetModal = closePlanetModal;
window.closeAstroFormModal = closeAstroFormModal;
window.showTab = showTab;

document.addEventListener('DOMContentLoaded', main);


