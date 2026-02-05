import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

let camera, scene, renderer;
let controls;

const objects = [];
const targets = { table: [], sphere: [], helix: [], grid: [] };

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 3000;

    scene = new THREE.Scene();

    // Fetch data from API
    fetch('/api/sheet-data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error(data.error);
                const errDiv = document.createElement('div');
                errDiv.style.position = 'absolute';
                errDiv.style.top = '50%';
                errDiv.style.width = '100%';
                errDiv.style.textAlign = 'center';
                errDiv.style.color = 'red';
                errDiv.style.fontSize = '24px';
                errDiv.textContent = 'Error: ' + data.error;
                document.body.appendChild(errDiv);
                return;
            }
            if (data.length === 0) {
                const warnDiv = document.createElement('div');
                warnDiv.style.position = 'absolute';
                warnDiv.style.top = '50%';
                warnDiv.style.width = '100%';
                warnDiv.style.textAlign = 'center';
                warnDiv.style.color = 'yellow';
                warnDiv.style.fontSize = '24px';
                warnDiv.textContent = 'No data found in Sheet1. Check your Google Sheet.';
                document.body.appendChild(warnDiv);
            }
            initObjects(data);
            initMenu();
        })
        .catch(err => {
            console.error(err);
            const errDiv = document.createElement('div');
            errDiv.style.position = 'absolute';
            errDiv.style.top = '50%';
            errDiv.style.width = '100%';
            errDiv.style.textAlign = 'center';
            errDiv.style.color = 'red';
            errDiv.style.fontSize = '24px';
            errDiv.textContent = 'Fetch Error: ' + err.message;
            document.body.appendChild(errDiv);
        });

    renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    controls = new TrackballControls(camera, renderer.domElement);
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener('change', render);

    window.addEventListener('resize', onWindowResize);
}

function initObjects(data) {
    // Table Layout (20 columns)
    // We will arrange them simply in a grid of 20 columns.
    // i is index. row = floor(i / 20), col = i % 20.

    for (let i = 0; i < data.length; i++) {
        const item = data[i];

        const element = document.createElement('div');
        element.className = 'element';

        // Color coding based on Net Worth
        // Parse net worth string "$251,260.80" -> 251260.80
        const netWorthString = item.net_worth.replace(/[^0-9.-]+/g, "");
        const netWorth = parseFloat(netWorthString);

        if (netWorth > 200000) {
            element.classList.add('bg-green');
        } else if (netWorth > 100000) {
            element.classList.add('bg-orange');
        } else {
            element.classList.add('bg-red');
        }

        const photo = document.createElement('img');
        photo.className = 'photo';
        photo.src = item.photo;
        element.appendChild(photo);

        const name = document.createElement('div');
        name.className = 'name';
        name.textContent = item.name;
        element.appendChild(name);

        const details = document.createElement('div');
        details.className = 'details';
        details.innerHTML = item.country + '<br>' + item.interest;
        element.appendChild(details);

        const networthDiv = document.createElement('div');
        networthDiv.className = 'networth';
        networthDiv.textContent = item.net_worth;
        element.appendChild(networthDiv);

        // CSS3D Object
        const objectQS = new CSS3DObject(element);
        objectQS.position.x = Math.random() * 4000 - 2000;
        objectQS.position.y = Math.random() * 4000 - 2000;
        objectQS.position.z = Math.random() * 4000 - 2000;
        scene.add(objectQS);
        objects.push(objectQS);

        // --- Table Target ---
        // 20 columns.
        // x spacing: 140, y spacing: 180
        // Center offsets
        const col = i % 20;
        const row = Math.floor(i / 20);

        const objectTable = new THREE.Object3D();
        objectTable.position.x = (col * 140) - (20 * 140 / 2) + 70; // Center it
        objectTable.position.y = -(row * 180) + (10 * 180 / 2); // Center it (top is positive y)
        targets.table.push(objectTable);
    }

    // --- Sphere Target ---
    const vector = new THREE.Vector3();
    for (let i = 0, l = objects.length; i < l; i++) {
        const phi = Math.acos(-1 + (2 * i) / l);
        const theta = Math.sqrt(l * Math.PI) * phi;

        const object = new THREE.Object3D();

        object.position.setFromSphericalCoords(800, phi, theta);

        vector.copy(object.position).multiplyScalar(2);

        object.lookAt(vector);

        targets.sphere.push(object);
    }

    // --- Helix Target ---
    // Double helix. 
    for (let i = 0, l = objects.length; i < l; i++) {
        const theta = i * 0.175 + Math.PI;
        const y = -(i * 8) + 450;

        const object = new THREE.Object3D();

        object.position.setFromCylindricalCoords(900, theta, y);

        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;

        object.lookAt(vector);

        targets.helix.push(object);
    }

    // --- Grid Target ---
    // 5x4x10
    // x: 5, y: 4, z: 10
    for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();

        object.position.x = ((i % 5) * 400) - 800;
        object.position.y = (-(Math.floor(i / 5) % 4) * 400) + 800;
        object.position.z = (Math.floor(i / 20) * 1000) - 2000;

        targets.grid.push(object);
    }

    // Start with Table view
    transform(targets.table, 2000);
}

function initMenu() {
    const buttonTable = document.getElementById('table');
    const buttonSphere = document.getElementById('sphere');
    const buttonHelix = document.getElementById('helix');
    const buttonGrid = document.getElementById('grid');

    const buttons = [buttonTable, buttonSphere, buttonHelix, buttonGrid];

    function setActive(activeButton) {
        buttons.forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
    }

    buttonTable.addEventListener('click', function () {
        transform(targets.table, 2000);
        setActive(buttonTable);
    });

    buttonSphere.addEventListener('click', function () {
        transform(targets.sphere, 2000);
        setActive(buttonSphere);
    });

    buttonHelix.addEventListener('click', function () {
        transform(targets.helix, 2000);
        setActive(buttonHelix);
    });

    buttonGrid.addEventListener('click', function () {
        transform(targets.grid, 2000);
        setActive(buttonGrid);
    });
}

function transform(targets, duration) {
    TWEEN.removeAll();

    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        const target = targets[i];

        if (!target) continue; // Safety check if data < targets slots

        new TWEEN.Tween(object.position)
            .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(object.rotation)
            .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
    }

    new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate(render)
        .start();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
}

function render() {
    renderer.render(scene, camera);
}
