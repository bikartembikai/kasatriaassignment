<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visualization</title>
    @vite(['resources/css/app.css', 'resources/js/visualization.js'])
    <style>
        body { margin: 0; background-color: #000; color: #fff; font-family: sans-serif; overflow: hidden; }
        #menu { position: absolute; bottom: 20px; width: 100%; text-align: center; }
        button { border: 0; background-color: rgba(255,255,255,0.1); color: #fff; padding: 10px 20px; margin: 0 5px; cursor: pointer; text-transform: uppercase; font-weight: bold; }
        button:hover { background-color: rgba(255,255,255,0.3); }
        button.active { background-color: rgba(0,255,255,0.5); }
        .element { width: 120px; height: 160px; box-shadow: 0px 0px 12px rgba(0,255,255,0.5); border: 1px solid rgba(127,255,255,0.25); text-align: center; cursor: default; transition: background-color 0.5s; display: flex; flex-direction: column; justify-content: space-between; padding: 10px; box-sizing: border-box; }
        .element:hover { box-shadow: 0px 0px 12px rgba(0,255,255,0.75); border: 1px solid rgba(127,255,255,0.75); }
        .element .photo { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin: 0 auto; }
        .element .name { font-size: 12px; font-weight: bold; color: rgba(255,255,255,0.75); text-shadow: 0 0 10px rgba(0,255,255,0.95); margin-top: 5px; }
        .element .details { font-size: 10px; color: rgba(127,255,255,0.75); }
        .element .networth { font-size: 14px; font-weight: bold; color: #fff; margin-top: 5px; }
        /* Color coding */
        .bg-red { background-color: rgba(255, 0, 0, 0.4); }
        .bg-orange { background-color: rgba(255, 165, 0, 0.4); }
        .bg-green { background-color: rgba(0, 128, 0, 0.4); }
    </style>
</head>
<body>
    <div id="container"></div>
    <div style="position: absolute; top: 10px; right: 10px; z-index: 100;">
        <a href="{{ route('logout') }}" style="color: white; font-family: sans-serif; text-decoration: none; border: 1px solid white; padding: 5px 10px;">Logout</a>
    </div>
    <div id="menu">
        <button id="table">TABLE</button>
        <button id="sphere">SPHERE</button>
        <button id="helix">HELIX</button>
        <button id="grid">GRID</button>
    </div>
</body>
</html>
