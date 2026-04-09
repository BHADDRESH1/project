/* 
  Prabha Agencies - Admin Script (V6 - Split Projects & Gallery)
*/

document.addEventListener('DOMContentLoaded', () => {
    // Elements - Sections
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Project Form Elements
    const projectForm = document.getElementById('project-form');
    const projectTitleInput = document.getElementById('proj-title');
    const projectDescInput = document.getElementById('proj-desc');
    const projectCategoryInput = document.getElementById('proj-category');
    const projectImageInput = document.getElementById('proj-image');
    const projectPreviewBox = document.getElementById('project-image-preview-box');
    const projectEditingIdInput = document.getElementById('project-editing-id');
    const projectFormTitle = document.getElementById('project-form-title');
    const projectSubmitBtn = document.getElementById('project-submit-btn');
    const projectCancelBtn = document.getElementById('project-cancel-btn');
    const adminProjectsList = document.getElementById('admin-projects-list');

    // Gallery Form Elements
    const galleryForm = document.getElementById('gallery-form');
    const galleryTitleInput = document.getElementById('gal-title');
    const galleryDescInput = document.getElementById('gal-desc');
    const galleryCategoryInput = document.getElementById('gal-category');
    const galleryImageInput = document.getElementById('gal-image');
    const galleryPreviewBox = document.getElementById('gallery-image-preview-box');
    const galleryEditingIdInput = document.getElementById('gallery-editing-id');
    const galleryFormTitle = document.getElementById('gallery-form-title');
    const gallerySubmitBtn = document.getElementById('gallery-submit-btn');
    const galleryCancelBtn = document.getElementById('gallery-cancel-btn');
    const adminGalleryList = document.getElementById('admin-gallery-list');

    // State
    let currentProjectFiles = [];
    let currentGalleryFiles = [];
    let isProjectEditMode = false;
    let isGalleryEditMode = false;

    // 1. Session Management
    if (sessionStorage.getItem('admin_logged_in') === 'true') {
        showDashboard();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (document.getElementById('username').value === 'admin' && 
            document.getElementById('password').value === '1234') {
            sessionStorage.setItem('admin_logged_in', 'true');
            showDashboard();
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('admin_logged_in');
        location.reload();
    });

    function showDashboard() {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        renderAdminProjects();
        renderAdminGallery();
    }

    // 2. Generic Helpers
    async function compressImage(base64Str) {
        if (base64Str.startsWith('assets/')) return base64Str;
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1000;
                let width = img.width;
                let height = img.height;
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        });
    }

    function renderPreviews(files, previewBox, type, isEditMode) {
        if (files.length === 0 && isEditMode) {
            previewBox.innerHTML = '<p style="color: #444; font-size: 0.9rem;">Keeping existing photos. Select new ones to replace.</p>';
            return;
        }
        previewBox.innerHTML = '';
        if (files.length === 0) {
            previewBox.innerHTML = '<p style="color: #999;">No images selected</p>';
            return;
        }

        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const div = document.createElement('div');
                div.className = 'preview-item';
                div.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button type="button" class="remove-img-btn" onclick="removeImg('${type}', ${index})">×</button>
                `;
                previewBox.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    }

    window.removeImg = function(type, index) {
        if (type === 'project') {
            currentProjectFiles.splice(index, 1);
            renderPreviews(currentProjectFiles, projectPreviewBox, 'project', isProjectEditMode);
        } else {
            currentGalleryFiles.splice(index, 1);
            renderPreviews(currentGalleryFiles, galleryPreviewBox, 'gallery', isGalleryEditMode);
        }
    };

    // 3. Project Form Logic
    projectImageInput.addEventListener('change', function() {
        Array.from(this.files).forEach(file => {
            if (!currentProjectFiles.some(f => f.name === file.name)) currentProjectFiles.push(file);
        });
        projectImageInput.value = '';
        renderPreviews(currentProjectFiles, projectPreviewBox, 'project', isProjectEditMode);
    });

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            title: projectTitleInput.value,
            desc: projectDescInput.value,
            category: projectCategoryInput.value,
            editingId: projectEditingIdInput.value
        };
        await handleSubmit('projects', data, currentProjectFiles, projectSubmitBtn, 'Project');
        resetProjectForm();
        renderAdminProjects();
    });

    window.editProject = async function(id) {
        const res = await fetch('/api/data');
        const dataFile = await res.json();
        const item = (dataFile.projects || []).find(p => p.id == id);
        if (item) {
            isProjectEditMode = true;
            projectEditingIdInput.value = item.id;
            projectTitleInput.value = item.title;
            projectDescInput.value = item.description;
            projectCategoryInput.value = item.category || 'construction';
            projectFormTitle.textContent = "Edit Project";
            projectSubmitBtn.textContent = "Update Project";
            projectCancelBtn.style.display = "block";
            currentProjectFiles = [];
            renderPreviews(currentProjectFiles, projectPreviewBox, 'project', true);
            projectForm.scrollIntoView({ behavior: 'smooth' });
        }
    };

    function resetProjectForm() {
        projectForm.reset();
        currentProjectFiles = [];
        isProjectEditMode = false;
        projectEditingIdInput.value = "";
        projectFormTitle.textContent = "Add New Project";
        projectSubmitBtn.textContent = "Add Project";
        projectCancelBtn.style.display = "none";
        renderPreviews(currentProjectFiles, projectPreviewBox, 'project', false);
    }
    projectCancelBtn.addEventListener('click', resetProjectForm);

    // 4. Gallery Form Logic
    galleryImageInput.addEventListener('change', function() {
        Array.from(this.files).forEach(file => {
            if (!currentGalleryFiles.some(f => f.name === file.name)) currentGalleryFiles.push(file);
        });
        galleryImageInput.value = '';
        renderPreviews(currentGalleryFiles, galleryPreviewBox, 'gallery', isGalleryEditMode);
    });

    galleryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            title: galleryTitleInput.value,
            desc: galleryDescInput.value,
            category: galleryCategoryInput.value,
            editingId: galleryEditingIdInput.value
        };
        await handleSubmit('gallery', data, currentGalleryFiles, gallerySubmitBtn, 'Gallery Item');
        resetGalleryForm();
        renderAdminGallery();
    });

    window.editGallery = async function(id) {
        const res = await fetch('/api/data');
        const dataFile = await res.json();
        const items = dataFile.gallery || [];
        const item = items.find(g => g.id == id);
        if (item) {
            isGalleryEditMode = true;
            galleryEditingIdInput.value = item.id;
            galleryTitleInput.value = item.title;
            galleryDescInput.value = item.description || "";
            galleryCategoryInput.value = item.category || 'construction';
            galleryFormTitle.textContent = "Edit Gallery Item";
            gallerySubmitBtn.textContent = "Update Gallery Item";
            galleryCancelBtn.style.display = "block";
            currentGalleryFiles = [];
            renderPreviews(currentGalleryFiles, galleryPreviewBox, 'gallery', true);
            galleryForm.scrollIntoView({ behavior: 'smooth' });
        }
    };

    function resetGalleryForm() {
        galleryForm.reset();
        currentGalleryFiles = [];
        isGalleryEditMode = false;
        galleryEditingIdInput.value = "";
        galleryFormTitle.textContent = "Add New Gallery Item";
        gallerySubmitBtn.textContent = "Add Gallery Item";
        galleryCancelBtn.style.display = "none";
        renderPreviews(currentGalleryFiles, galleryPreviewBox, 'gallery', false);
    }
    galleryCancelBtn.addEventListener('click', resetGalleryForm);

    // 5. Shared Submit Logic
    async function handleSubmit(storageKeyAlias, data, fileList, btn, label) {
        const type = storageKeyAlias === 'projects' ? 'projects' : 'gallery';
        const isEdit = !!data.editingId;
        
        btn.disabled = true;
        btn.textContent = 'Processing...';

        try {
            const res = await fetch('/api/data');
            const dataFile = await res.json();
            let allItems = (type === 'projects' ? dataFile.projects : dataFile.gallery) || [];
            let finalImages = [];

            if (fileList.length > 0) {
                const raws = await Promise.all(fileList.map(file => {
                    return new Promise(r => {
                        const reader = new FileReader();
                        reader.onload = ev => r(ev.target.result);
                        reader.readAsDataURL(file);
                    });
                }));
                finalImages = await Promise.all(raws.map(r => compressImage(r)));
            } else if (isEdit) {
                const existing = allItems.find(i => i.id == data.editingId);
                finalImages = existing ? (existing.images || []) : [];
            } else {
                alert(`Please select at least one image for a new ${label}!`);
                return;
            }

            if (isEdit) {
                const idx = allItems.findIndex(i => i.id == data.editingId);
                if (idx !== -1) {
                    allItems[idx] = { ...allItems[idx], title: data.title, description: data.desc, category: data.category, images: finalImages };
                }
            } else {
                allItems.unshift({
                    id: Date.now(),
                    title: data.title,
                    description: data.desc,
                    category: data.category,
                    images: finalImages,
                    status: storageKeyAlias === 'projects' ? "Recently Added" : undefined
                });
            }

            await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: type, items: allItems })
            });
            alert(`${label} saved successfully!`);
        } catch (err) {
            console.error(err);
            alert("Storage error! Try fewer or smaller images.");
        } finally {
            btn.disabled = false;
            btn.textContent = isEdit ? `Update ${label}` : `Add ${label}`;
        }
    }

    // 6. Admin Lists Rendering
    async function renderAdminProjects() {
        const res = await fetch('/api/data');
        const data = await res.json();
        const projects = data.projects || [];
        renderList(adminProjectsList, projects, 'editProject', 'projects', renderAdminProjects);
    }

    async function renderAdminGallery() {
        const res = await fetch('/api/data');
        const data = await res.json();
        const gallery = data.gallery || [];
        renderList(adminGalleryList, gallery, 'editGallery', 'gallery', renderAdminGallery);
    }

    function renderList(container, items, editFunc, storageKey, refreshCallback) {
        if (!container) return;
        container.innerHTML = items.length ? '' : '<p style="color: #999; padding: 20px;">No items found.</p>';
        
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'project-item-admin';
            const img = (item.images && item.images.length) ? item.images[0] : 'assets/hero.png';
            
            div.innerHTML = `
                <div class="project-item-info">
                    <img src="${img}" alt="img">
                    <div>
                        <strong>${item.title}</strong>
                        <p style="font-size: 0.8rem; color: #666;">${item.category} (${item.images ? item.images.length : 0} photos)</p>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="${editFunc}(${item.id})" class="btn" style="background: #eef2ff; color: #4338ca; border: 1px solid #4338ca; padding: 5px 15px;">Edit</button>
                    <button class="btn del-btn" style="background: #fee2e2; color: #b91c1c; border: 1px solid #b91c1c; padding: 5px 15px;">Delete</button>
                </div>
            `;
            
            div.querySelector('.del-btn').onclick = async () => {
                if (confirm('Delete this item?')) {
                    const res = await fetch('/api/data');
                    const dataFile = await res.json();
                    let allItems = (storageKey === 'projects' ? dataFile.projects : dataFile.gallery) || [];
                    const filtered = allItems.filter(i => i.id != item.id);
                    await fetch('/api/data', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: storageKey, items: filtered })
                    });
                    refreshCallback();
                }
            };
            container.appendChild(div);
        });
    }
});
