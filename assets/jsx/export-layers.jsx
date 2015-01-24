#target photoshop
#include "json.js"

function iterateLayers(layer, callback) {
    if (layer.typename === 'LayerSet') {
        iterateLayers(layer.layers, callback)
    } else if (layer.typename === 'ArtLayer') {
        if (!layer.visible) {
            return
        }
        callback(layer)
    } else if (layer.typename === 'Layers') {
        if (!layer.visible) {
            return
        }
        for (var i = 0; i < layer.length; ++i) {
            iterateLayers(layer[i], callback)
        }
    } else {
        throw new Error('Bad layer ' + layer)
    }
}

function run() {
    var layers = app.activeDocument.layers
    var layerDatas = []
    iterateLayers(layers, function (artLayer) {
        layerDatas.push({
            name: artLayer.name,
            bounds: {
                left: artLayer.bounds[0].as('px'),
                top: artLayer.bounds[1].as('px'),
                right: artLayer.bounds[2].as('px'),
                bottom: artLayer.bounds[3].as('px'),
            },
        })
    })
    var obj = {
        layers: layerDatas,
    }
    saveFile(JSON.stringify(obj))
}

function saveFile(str) {
    var baseName = app.activeDocument.name.replace(/\.psd$/i, '')
    var path = app.activeDocument.path.fsName
    var file = new File(path + '/' + baseName + '.json')
    file.open('w')
    file.write(str)
    file.close()
    alert('Saved!')
}

try {
    run()
} catch (e) {
    alert('Error: ' + e)
}
