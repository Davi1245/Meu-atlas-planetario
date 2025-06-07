// js/eventHandlers.js
import { getAllAstros, saveAstro, deleteAstro } from './dataManager.js';
import { elements, renderAllAstros, addMoonRow, openCreateAstroModal, openEditAstroModal, openPlanetModal, showGenericMessageModal, openDeleteConfirmModal, closeDeleteConfirmModal, closeAstroFormModal } from './ui.js';
import { redrawStarmap } from './starmap.js';

async function handleAstroFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(elements.astroForm);
    const originalName = elements.editingAstroOriginalNameInput.value;
    const moons = Array.from(document.querySelectorAll('.moon-row')).map(row => ({
        name: row.querySelector('.moon-name').value,
        category: row.querySelector('.moon-category').value,
    })).filter(moon => moon.name);

    const astroData = {
        name: formData.get('astroName').trim(),
        category: formData.get('astroCategory'),
        shortDescription: formData.get('astroShortDescription').trim(),
        infoGeral: formData.get('astroInfoGeral').trim().replace(/\n/g, '\\n'),
        historia: formData.get('astroHistoria').trim().replace(/\n/g, '\\n'),
        civilizacao: formData.get('astroCivilizacao').trim().replace(/\n/g, '\\n'),
        biologia: formData.get('astroBiologia').trim().replace(/\n/g, '\\n'),
        mainMediaPath: formData.get('mainMediaPath'),
        mainMediaType: formData.get('mainMediaType'),
        system: {
            starName: formData.get('systemStarName').trim(),
            starType: formData.get('systemStarType').trim(),
            orbitalPosition: parseInt(formData.get('orbitalPosition'), 10) || 1,
            totalPlanetsInSystem: parseInt(formData.get('totalPlanetsInSystem'), 10) || 1,
        },
        moons: moons
    };

    if (!astroData.name || !astroData.system.starName) {
        showGenericMessageModal("O nome do astro e do sistema são obrigatórios.");
        return;
    }
    
    try {
        await saveAstro(astroData, originalName);
        renderAllAstros(getAllAstros());
        redrawStarmap();
        closeAstroFormModal();
        showGenericMessageModal(originalName ? 'Astro atualizado com sucesso!' : 'Astro criado com sucesso!');
    } catch (error) {
        showGenericMessageModal(error.message);
    }
}

function handleCardClick(event) {
    const card = event.target.closest('.planet-item-card');
    if (!card) return;
    const planetName = card.dataset.planetName;
    if (event.target.closest('.edit-astro-button')) {
        event.stopPropagation(); openEditAstroModal(planetName);
    } else if (event.target.closest('.delete-astro-button')) {
        event.stopPropagation(); openDeleteConfirmModal(planetName);
    } else {
        openPlanetModal(planetName);
    }
}

async function confirmDeletion() {
    const nameToDelete = elements.astroNameToDeletePlaceholder.textContent;
    try {
        await deleteAstro(nameToDelete);
        renderAllAstros(getAllAstros());
        redrawStarmap();
        showGenericMessageModal(`"${nameToDelete}" foi excluído.`);
    } catch (error) {
        showGenericMessageModal(error.message);
    } finally {
        closeDeleteConfirmModal();
    }
}

async function handleMainMediaUpload() {
    const result = await window.electronAPI.selectAndUploadMainMedia();
    if (result && result.relativePath) {
        document.querySelector('[name="mainMediaPath"]').value = result.relativePath;
        document.querySelector('[name="mainMediaType"]').value = result.mediaType;
        document.getElementById('mainMediaUploadButton').textContent = result.originalName;
    } else if (result && result.error) {
        showGenericMessageModal(`Erro no upload: ${result.error}`);
    }
}

function addEventListeners() {
    document.getElementById('openCreateAstroModalButton')?.addEventListener('click', openCreateAstroModal);
    document.getElementById('mainMediaUploadButton')?.addEventListener('click', handleMainMediaUpload);
    document.getElementById('confirmDeleteButton')?.addEventListener('click', confirmDeletion);
    document.getElementById('cancelDeleteButton')?.addEventListener('click', closeDeleteConfirmModal);
    document.getElementById('genericModalCloseButton')?.addEventListener('click', () => document.getElementById('genericMessageModal').classList.add('hidden'));
    
    // Botão de Astro Aleatório (CORRIGIDO)
    document.getElementById('randomAstroButton')?.addEventListener('click', () => {
        const astros = getAllAstros();
        if (astros.length > 0) {
            const randomAstro = astros[Math.floor(Math.random() * astros.length)];
            openPlanetModal(randomAstro.name);
        } else {
            showGenericMessageModal("Nenhum astro cadastrado para descoberta aleatória.");
        }
    });

    elements.astroForm.addEventListener('submit', handleAstroFormSubmit);
    elements.addMoonButton.addEventListener('click', () => addMoonRow());
    elements.categoryContainer.addEventListener('click', handleCardClick);
}

export { addEventListeners };


