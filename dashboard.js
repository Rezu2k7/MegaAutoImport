window.onload = function() {
    // 1. SESSION GUARD
    const userData = JSON.parse(sessionStorage.getItem('mai_user'));
    if (!userData) { window.location.replace('login.html'); return; }

    const role = userData.role;
    const currentUsername = userData.username;

    // 2. DOM ELEMENTS
    const userDisplay = document.getElementById('user-display');
    const carGrid = document.getElementById('carGrid');
    const addCarForm = document.getElementById('addCarForm');
    
    const tabs = { garage: document.getElementById('tabGarage'), addCar: document.getElementById('tabAddCar'), users: document.getElementById('tabUsers') };
    const views = { garage: document.getElementById('viewGarage'), addCar: document.getElementById('viewAddCar'), users: document.getElementById('viewUsers') };

    // 3. UI SETUP
    if (userDisplay) userDisplay.innerText = `${role.toUpperCase()} (${currentUsername})`;
    if (role !== 'admin') document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');

    // 4. NAVIGATION (Your exact logic)
    function showSection(name) {
        Object.values(views).forEach(v => v?.classList.add('hidden'));
        Object.values(tabs).forEach(t => t?.classList.remove('active'));
        if (views[name]) views[name].classList.remove('hidden');
        if (tabs[name]) tabs[name].classList.add('active');
        if (name === 'garage') loadCars();
    }

    if (tabs.garage) tabs.garage.onclick = (e) => { e.preventDefault(); showSection('garage'); };
    if (tabs.addCar) tabs.addCar.onclick = (e) => { e.preventDefault(); showSection('addCar'); };
    if (tabs.users) tabs.users.onclick = (e) => { e.preventDefault(); showSection('users'); };

    // 5. LOAD CARS (Fixed Image Path)
    async function loadCars() {
        try {
            const res = await fetch('/api/cars');
            const cars = await res.json();
            carGrid.innerHTML = '';
            
            const myCars = role === 'admin' ? cars : cars.filter(c => c.dealerId === currentUsername);

            myCars.forEach(car => {
                const card = document.createElement('div');
                card.classList.add('car-card');
                
                // FIXED: Ensures path works on live server
                const previewImg = car.images?.[0] ? `/uploads/${car.images[0]}` : '';
                
                card.innerHTML = `
                    <div class="car-image">
                        ${previewImg ? `<img src="${previewImg}">` : 'No Photo'}
                    </div>
                    <div class="car-details">
                        <h4>${car.makeModel}</h4>
                        <span class="car-status-badge">${car.status || 'Purchased'}</span>
                    </div>`;
                carGrid.appendChild(card);
            });
        } catch (err) { console.error("Load failed"); }
    }

    loadCars();
};
