const THREE = require('three');

function createTesseract() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Generate vertices of a 4D hypercube (tesseract)
    const originalVertices = [
        [-0.5, -0.5, -0.5, -0.5], [0.5, -0.5, -0.5, -0.5], [0.5, 0.5, -0.5, -0.5], [-0.5, 0.5, -0.5, -0.5],
        [-0.5, -0.5, 0.5, -0.5], [0.5, -0.5, 0.5, -0.5], [0.5, 0.5, 0.5, -0.5], [-0.5, 0.5, 0.5, -0.5],
        [-0.5, -0.5, -0.5, 0.5], [0.5, -0.5, -0.5, 0.5], [0.5, 0.5, -0.5, 0.5], [-0.5, 0.5, -0.5, 0.5],
        [-0.5, -0.5, 0.5, 0.5], [0.5, -0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5], [-0.5, 0.5, 0.5, 0.5]
    ];

    // Generate edges of a 4D hypercube
    let edges = [];
    for (let i = 0; i < 16; i++) {
        for (let j = i + 1; j < 16; j++) {
            let diff = originalVertices[i].map((val, ind) => Math.abs(val - originalVertices[j][ind]));
            if (diff.reduce((a, b) => a + b, 0) === 1) {
                edges.push([i, j]);
            }
        }
    }

    let geometry = new THREE.BufferGeometry();
    let positions = new Float32Array(edges.length * 2 * 3); // each edge consists of 2 vertices, each vertex has 3 coordinates
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    let material = new THREE.LineBasicMaterial({ color: 0xffffff });
    let lines = new THREE.LineSegments(geometry, material);
    scene.add(lines);

    camera.position.z = 3; // Zoom out a bit more than before

    const animate = function () {
        requestAnimationFrame(animate);

        let angle = Date.now() * 0.001; // smooth, slow rotation speed

        // 4D rotation around XW plane
        let rotatedVertices = originalVertices.map(vertex => {
            let x = vertex[0], w = vertex[3];
            let newX = x * Math.cos(angle) - w * Math.sin(angle);
            let newW = x * Math.sin(angle) + w * Math.cos(angle);
            return [newX, vertex[1], vertex[2], newW];
        });

        // Replace vertices in edges with rotated and projected ones
        let positionAttribute = lines.geometry.getAttribute('position');
        edges.forEach((edge, i) => {
            // Project down to 3D
            let vertex1 = rotatedVertices[edge[0]];
            let vertex2 = rotatedVertices[edge[1]];
            positionAttribute.setXYZ(2 * i, vertex1[0] / (1 - vertex1[3]), vertex1[1] / (1 - vertex1[3]), vertex1[2] / (1 - vertex1[3]));
            positionAttribute.setXYZ(2 * i + 1, vertex2[0] / (1 - vertex2[3]), vertex2[1] / (1 - vertex2[3]), vertex2[2] / (1 - vertex2[3]));
        });
        positionAttribute.needsUpdate = true;

        renderer.render(scene, camera);
    };

    animate();
}

createTesseract();
