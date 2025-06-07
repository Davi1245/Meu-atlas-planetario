// js/ui.js
import { getAstroByName } from './dataManager.js';
import { initializeSystemView, destroySystemView } from './systemView.js';

const elements = {};

function initializeUI() {
    const ids = [
        'categoryContainer', 'astroFormModal', 'planetModal', 'genericMessageModal',
        'deleteConfirmModal', 'astroForm', 'astroFormModalTitle', 'editingAstroOriginalNameInput',
        'moonsContainer', 'addMoonButton', 'modalPlanetName', 'modalSystemName', 'currentYear',
        'infoGeralTabModal', 'historiaTabModal', 'civilizacaoTabModal', 'biologiaTabModal',
        'genericModalMessageText', 'astroNameToDeletePlaceholder', 'submitAstroFormButton',
        'mainMediaContainer'
    ];
    ids.forEach(id => {
        if (id) elements[id] = document.getElementById(id);
    });
    if (elements.currentYear) {
        elements.currentYear.textContent = new Date().getFullYear();
    }
}

function renderAllAstros(astrosData) {
    const categoryContents = {};
    astrosData.forEach(planet => {
        const category = planet.category || 'Astros Exóticos';
        if (!categoryContents[category]) categoryContents[category] = '';
        const escapeHTML = (str) => (str || '').replace(/"/g, '&quot;');
        categoryContents[category] += `
            <div class="planet-item-card p-4 rounded-md shadow hover:shadow-xl cursor-pointer" data-planet-name="${escapeHTML(planet.name)}">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-xl font-semibold text-sky-300">${escapeHTML(planet.name)}</h3>
                        <p class="text-sm text-purple-300">${escapeHTML(planet.system?.starName)}</p>
                    </div>
                    <div class="flex gap-2">
                        <button class="edit-astro-button text-xs p-1" title="Editar">✏️</button>
                        <button class="delete-astro-button text-xs p-1" title="Excluir">🗑️</button>
                    </div>
                </div>
                <p class="text-sm text-gray-400 mt-2">${escapeHTML(planet.shortDescription)}</p>
            </div>`;
    });
    document.querySelectorAll('.category-card').forEach(categorySection => {
        const categoryId = categorySection.dataset.categoryId;
        const contentDiv = categorySection.querySelector('.category-content');
        if (contentDiv) {
            contentDiv.innerHTML = categoryContents[categoryId] || '<p class="text-gray-500 italic">Nenhum astro nesta categoria.</p>';
        }
    });
}

function formatTextForModal(text) {
    if (!text) return "<p class='text-gray-400 italic'>Nenhuma informação disponível.</p>";
    return text.replace(/\\n/g, '\n').split('\n').map(line => {
        if (line.trim().startsWith('<')) return line;
        return `<p class="mb-2">${line}</p>`;
    }).join('');
}

function openPlanetModal(planetName) {
    const planet = getAstroByName(planetName);
    if (!planet) return;
    elements.modalPlanetName.textContent = planet.name;
    elements.modalSystemName.textContent = `Sistema ${planet.system.starName}`;
    
    elements.infoGeralTabModal.innerHTML = formatTextForModal(planet.infoGeral);
    elements.historiaTabModal.innerHTML = formatTextForModal(planet.historia);
    elements.civilizacaoTabModal.innerHTML = formatTextForModal(planet.civilizacao);
    elements.biologiaTabModal.innerHTML = formatTextForModal(planet.biologia);
    
    const mediaContainer = elements.mainMediaContainer;
    mediaContainer.innerHTML = '';
    if (planet.mainMediaPath) {
        if (planet.mainMediaType === 'image') {
            mediaContainer.innerHTML = `<img src="${planet.mainMediaPath}" alt="Mídia de ${planet.name}" class="w-full h-full object-cover rounded-lg">`;
        } else if (planet.mainMediaType === 'video') {
             mediaContainer.innerHTML = `<video src="${planet.mainMediaPath}" controls class="w-full h-full object-cover rounded-lg"></video>`;
        }
    } else {
        mediaContainer.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg"><p class="text-gray-500 italic">Sem mídia</p></div>`;
    }

    initializeSystemView(planet);
    elements.planetModal.classList.remove('hidden');
    elements.planetModal.classList.add('flex');
    showTab('infoGeralTabModal', document.querySelector('#planetModal .modal-tab-button'));
}

function addMoonRow(moonData = {}) {
    const moonRow = document.createElement('div');
    moonRow.className = 'grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-700 pt-3 mt-3 moon-row';
    moonRow.innerHTML = `
        <div><input type="text" class="form-modal-input text-sm moon-name" value="${moonData.name || ''}" placeholder="Nome da Lua"></div>
        <div><select class="form-modal-input text-sm moon-category">${['Astros Exóticos', 'Astros Caóticos', 'Astros Tóxicos', 'Astros Habitáveis', 'Astros Primordiais'].map(cat => `<option value="${cat}" ${moonData.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}</select></div>
        <div class="flex items-end"><button type="button" class="action-button bg-red-800/80 hover:bg-red-700 text-sm py-1 px-3 rounded-md" onclick="this.closest('.moon-row').remove()">Remover</button></div>`;
    elements.moonsContainer.appendChild(moonRow);
}

function openCreateAstroModal() {
    elements.astroFormModalTitle.textContent = "Criar Novo Astro";
    elements.astroForm.reset();
    elements.moonsContainer.innerHTML = '';
    elements.editingAstroOriginalNameInput.value = "";
    elements.submitAstroFormButton.textContent = "Salvar Astro e Sistema";
    elements.astroFormModal.classList.remove('hidden');
    elements.astroFormModal.classList.add('flex');
}

function openEditAstroModal(planetName) {
    const planetToEdit = getAstroByName(planetName);
    if (!planetToEdit) return;
    openCreateAstroModal();
    elements.astroFormModalTitle.textContent = "Editar Astro";
    elements.submitAstroFormButton.textContent = "Atualizar Astro";
    
    const form = elements.astroForm;
    const unescape = (str) => (str || '').replace(/\\n/g, '\n');

    form.astroName.value = planetToEdit.name || '';
    form.astroCategory.value = planetToEdit.category || '';
    form.astroShortDescription.value = planetToEdit.shortDescription || '';
    
    form.astroInfoGeral.value = unescape(planetToEdit.infoGeral);
    form.astroHistoria.value = unescape(planetToEdit.historia);
    form.astroCivilizacao.value = unescape(planetToEdit.civilizacao);
    form.astroBiologia.value = unescape(planetToEdit.biologia);

    if (planetToEdit.system) {
        form.systemStarName.value = planetToEdit.system.starName || '';
        form.systemStarType.value = planetToEdit.system.starType || '';
        form.orbitalPosition.value = planetToEdit.system.orbitalPosition || '';
        form.totalPlanetsInSystem.value = planetToEdit.system.totalPlanetsInSystem || '';
    }

    document.querySelector('[name="mainMediaPath"]').value = planetToEdit.mainMediaPath || '';
    document.querySelector('[name="mainMediaType"]').value = planetToEdit.mainMediaType || '';
    
    if (planetToEdit.moons) planetToEdit.moons.forEach(moon => addMoonRow(moon));
    elements.editingAstroOriginalNameInput.value = planetToEdit.name;
}

function showTab(tabId, btn) {
    const container = elements.planetModal;
    if (!container) return;
    container.querySelectorAll('.modal-tab-content').forEach(el => el.classList.remove('active'));
    container.querySelectorAll('.modal-tab-button').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId)?.classList.add('active');
    btn?.classList.add('active');
}

const closePlanetModal = () => { destroySystemView(); elements.planetModal.classList.add('hidden'); };
const closeAstroFormModal = () => elements.astroFormModal.classList.add('hidden');
const closeDeleteConfirmModal = () => elements.deleteConfirmModal.classList.add('hidden');

function showGenericMessageModal(message) {
    elements.genericModalMessageText.textContent = message;
    elements.genericModal.classList.remove('hidden');
    elements.genericModal.classList.add('flex');
}

function openDeleteConfirmModal(name) {
    elements.astroNameToDeletePlaceholder.textContent = name;
    elements.deleteConfirmModal.classList.remove('hidden');
    elements.deleteConfirmModal.classList.add('flex');
}

export { elements, initializeUI, renderAllAstros, addMoonRow, openCreateAstroModal, openEditAstroModal, openPlanetModal, closePlanetModal, closeAstroFormModal, showGenericMessageModal, openDeleteConfirmModal, closeDeleteConfirmModal, showTab };
